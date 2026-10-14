#!/usr/bin/env node
// cut-phrases: cut a short-form edit out of a long recording by naming the
// phrases you want, not by trusting timestamps.
//
// Why this exists: retimed transcripts from the cut tools are a *projected*
// timeline (they can drift from the rendered file), and ASR word timestamps
// are 50-150ms coarse (a cut at `word.end` + a pad usually lands on the first
// syllable of the next word). This script instead:
//   1. resolves each segment's first/last phrase against a ground-truth
//      transcript of the SOURCE FILE ITSELF (short windows, transcribed with
//      scripts/transcribe-elevenlabs.mjs),
//   2. places each cut at the quietest 30ms between the phrase's edge word and
//      its neighbour (scripts/lib/audio-edges.mjs),
//   3. cuts the pieces (dense keyframes, short fades), concats them with any
//      pre-rendered card images, renders a low-res rough,
//   4. re-transcribes the assembly and diffs it against the intended text.
//
// Usage:
//   node scripts/cut-phrases.mjs <project-dir> [--no-verify]
//
// <project-dir>/spec.json:
// {
//   "source": "../assets/edited-clean.mp4",
//   "windows": { "W1": { "transcript": "ground-truth/W1.json", "offset": 940 } },
//   "segments": [ { "id": "seg0", "window": "W1", "from": "first words of", "to": "last words of the phrase" } ],
//   "cards":    [ { "id": "card1", "image": "card1.png", "duration": 2.5 } ],
//   "order":    [ "seg0", "card1", "seg1" ]
// }
// A window transcript is the output of transcribe-elevenlabs.mjs run on an
// audio excerpt of the source starting at `offset` seconds, e.g.
//   ffmpeg -ss 940 -t 60 -i source.mp4 -vn -ac 1 -ar 16000 W1.mp3
//   node scripts/transcribe-elevenlabs.mjs W1.mp3 --output ground-truth/W1.json --no-diarize
// Outputs (in <project-dir>): pieces/seg*.mp4, pieces/full-assembly.mp4,
// animatic-rough.mp4, animatic-edl.json (resolved times + verification).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join, dirname, basename, extname } from "node:path";
import { spawnSync } from "node:child_process";
import { extractWav, loadWav, quietest } from "./lib/audio-edges.mjs";

const args = process.argv.slice(2);
const dir = resolve(args.find((a) => !a.startsWith("--")) ?? ".");
const verify = !args.includes("--no-verify");
const kit = resolve(dirname(new URL(import.meta.url).pathname), "..");
const spec = JSON.parse(readFileSync(join(dir, "spec.json"), "utf8"));
const src = resolve(dir, spec.source);
const pieces = join(dir, "pieces");
mkdirSync(pieces, { recursive: true });

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9$%' ]+/g, " ").replace(/\s+/g, " ").trim();
const run = (cmd, a) => {
  const r = spawnSync(cmd, a, { stdio: ["ignore", "pipe", "pipe"] });
  if (r.status !== 0) throw new Error(`${cmd} ${a.join(" ")}\n${r.stderr}`);
  return r.stdout.toString();
};

function loadWindow(name) {
  const w = spec.windows[name];
  if (!w) throw new Error(`unknown window "${name}"`);
  const t = JSON.parse(readFileSync(resolve(dir, w.transcript), "utf8"));
  return t.words.filter((x) => !x.type || x.type === "word").map((x) => ({ text: norm(x.text), start: x.start + w.offset, end: x.end + w.offset }));
}
function findSeq(words, phrase, from = 0) {
  const p = norm(phrase).split(" ");
  outer: for (let i = from; i <= words.length - p.length; i++) {
    for (let j = 0; j < p.length; j++) if (words[i + j].text !== p[j]) continue outer;
    return i;
  }
  throw new Error(`phrase not found: "${phrase}"`);
}

// 1) resolve segments with audio-guided edges
const FADE = 0.06;
const wav = loadWav(extractWav(src, src.replace(/\.[^.]+$/, "") + ".16k.wav"));
const segments = spec.segments.map((s) => {
  const words = loadWindow(s.window);
  const i0 = findSeq(words, s.from);
  const i1 = findSeq(words, s.to, i0);
  const n = norm(s.to).split(" ").length;
  const first = words[i0], last = words[i1 + n - 1], prev = words[i0 - 1], next = words[i1 + n];
  const start = quietest(wav, Math.max(prev ? prev.end : 0, first.start - 0.25), first.start + 0.02);
  const endHi = Math.min(next ? next.start : Infinity, last.end + 0.25);
  const end = endHi - (last.end - 0.06) < 0.04 ? last.end - 0.01 : quietest(wav, last.end - 0.06, endHi);
  return { ...s, start: +start.toFixed(3), end: +end.toFixed(3), text: words.slice(i0, i1 + n).map((w) => w.text).join(" ") };
});

// 2) cut pieces (30fps, keyframe every frame-second, short fades)
for (const s of segments) {
  const d = s.end - s.start;
  run("ffmpeg", ["-y", "-v", "error", "-ss", s.start.toFixed(3), "-t", d.toFixed(3), "-i", src,
    "-af", `afade=t=in:d=${FADE},afade=t=out:st=${(d - FADE).toFixed(3)}:d=${FADE}`,
    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", "30", "-g", "30", "-keyint_min", "30", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", join(pieces, `${s.id}.mp4`)]);
}

// 3) cards from pre-rendered images (silent, same stream params as pieces)
for (const c of spec.cards ?? []) {
  run("ffmpeg", ["-y", "-v", "error", "-loop", "1", "-framerate", "30", "-i", resolve(dir, c.image),
    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", String(c.duration ?? 2.5),
    "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", "30", "-g", "30", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-shortest", join(pieces, `${c.id}.mp4`)]);
}

// 4) concat + rough preview
writeFileSync(join(pieces, "concat-list.txt"), spec.order.map((id) => `file '${id}.mp4'`).join("\n") + "\n");
run("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", join(pieces, "concat-list.txt"), "-c", "copy", join(pieces, "full-assembly.mp4")]);
run("ffmpeg", ["-y", "-v", "error", "-i", join(pieces, "full-assembly.mp4"), "-vf", "scale=480:-2", "-c:v", "libx264", "-preset", "fast", "-crf", "24", "-c:a", "aac", "-b:a", "128k", join(dir, "animatic-rough.mp4")]);
const runtime = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(pieces, "full-assembly.mp4")]));

// 5) verify: re-transcribe the assembly and diff against the intended text
let verified = "skipped (--no-verify)";
if (verify) {
  run("node", [join(kit, "scripts/transcribe-elevenlabs.mjs"), join(pieces, "full-assembly.mp4"), "--output", join(pieces, "full-assembly.json"), "--no-diarize"]);
  const got = JSON.parse(readFileSync(join(pieces, "full-assembly.json"), "utf8")).words.filter((w) => !w.type || w.type === "word").map((w) => norm(w.text)).join(" ");
  const want = spec.order.filter((id) => segments.some((s) => s.id === id)).map((id) => segments.find((s) => s.id === id).text).join(" ");
  const missing = want.split(" ").filter((w) => !got.includes(w));
  verified = got === want ? "exact" : missing.length === 0 ? "all intended words present (ASR wording differs slightly)" : `MISSING words: ${missing.join(", ")}`;
}

writeFileSync(join(dir, "animatic-edl.json"), JSON.stringify({
  source: spec.source, note: "timestamps resolved from ground-truth window transcripts of the source file itself; edges snapped to the local audio minimum",
  order: spec.order, segments, cards: spec.cards ?? [], runtime: +runtime.toFixed(2), verified: { date: new Date().toISOString().slice(0, 10), result: verified },
}, null, 2));
console.log(JSON.stringify({ runtime: +runtime.toFixed(2), verified, segments: segments.map((s) => `${s.id} ${s.start}-${s.end}`) }, null, 2));
