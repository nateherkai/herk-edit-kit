#!/usr/bin/env node
// Agent 2 — Cut Mistakes & Repeats : apply approved cuts
// Takes an APPROVED cut list (produced after the review-gate) + the input
// transcript + video, removes those ranges, re-times the transcript, and
// optionally renders the cut video (ffmpeg trim+concat, A/V kept in sync).
//
// Approved-cuts file shape: { "cuts": [ { "start": <s>, "end": <s>, "reason": "..." }, ... ] }
//   (start/end in seconds on the INPUT transcript/video timeline)
//
// Outputs (next to the transcript, or --out-dir):
//   <stem>.mistakes-edl.json          keep/delete ranges + summary
//   <stem>.mistakes-transcript.json   words re-timed onto the new timeline
//   <stem>.mistakes-decisions.md      what was removed + why
//   <stem>.mistakes-filter.txt        ffmpeg filtergraph (with --video)
//   <video-stem>.mistakes-cut.mp4     the cut video (with --apply)
//
// Usage:
//   node apply-cuts.mjs <transcript.json> --cuts <approved.json> \
//     [--video in.mp4] [--output out.mp4] [--out-dir dir] [--apply]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { spawnSync } from "node:child_process";
import { argv, exit } from "node:process";

function die(m, c = 1) { console.error(m); exit(c); }

const args = argv.slice(2);
if (args.length === 0 || args.includes("--help")) {
  console.log("Usage: node apply-cuts.mjs <transcript.json> --cuts <approved.json> [--video in.mp4] [--output out.mp4] [--out-dir dir] [--apply] [--no-snap-audio]");
  exit(args.length === 0 ? 1 : 0);
}
const opts = { transcript: null, cuts: null, video: null, output: null, outDir: null, apply: false, snapAudio: true };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--cuts") opts.cuts = args[++i];
  else if (a === "--video") opts.video = args[++i];
  else if (a === "--output" || a === "-o") opts.output = args[++i];
  else if (a === "--out-dir") opts.outDir = args[++i];
  else if (a === "--apply") opts.apply = true;
  else if (a === "--no-snap-audio") opts.snapAudio = false;
  else if (a.startsWith("--")) die(`unknown option: ${a}`);
  else if (!opts.transcript) opts.transcript = a;
}
if (!opts.transcript) die("no transcript given");
if (!opts.cuts) die("no --cuts file given");

const transcriptPath = resolve(opts.transcript);
const transcript = JSON.parse(readFileSync(transcriptPath, "utf8"));
const cutsDoc = JSON.parse(readFileSync(resolve(opts.cuts), "utf8"));
const approved = cutsDoc.cuts ?? cutsDoc;
if (!Array.isArray(approved)) die('cuts must be an array (an empty array is valid)');
if (approved.some(c => !c || typeof c.start !== 'number' || typeof c.end !== 'number' || !Number.isFinite(c.start) || !Number.isFinite(c.end) || c.end <= c.start)) die('Every cut range needs finite numeric start < end');
if (!Array.isArray(transcript.words)) die('transcript has no words array');

const words = transcript.words
  .filter((w) => (w.type ? w.type === "word" : true))
  .filter((w) => Number.isFinite(Number(w.start)) && Number.isFinite(Number(w.end)))
  .map((w) => ({ text: w.text, start: Number(w.start), end: Number(w.end) }));
if (!words.length) die('transcript has no timed words');

let duration = Number(transcript.audio_duration_secs);
if (!Number.isFinite(duration)) {
  if (opts.video && existsSync(resolve(opts.video))) {
    const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", resolve(opts.video)]);
    duration = Number(p.stdout?.toString().trim());
  }
  if (!Number.isFinite(duration)) duration = words.at(-1).end + 0.2;
}
if (!Number.isFinite(duration) || duration <= 0) die('Invalid source duration');
if (approved.some(c => c.start < 0 || c.end > duration)) die('Cut range is outside source duration bounds');

// ---- frame rate (for boundary snapping, video renders only) ----
// ffmpeg's trim/atrim filters cut on real source frame boundaries, not exact
// float seconds. If the retimed transcript is computed from un-snapped
// floats, each cut's actual rendered position silently differs from the math
// by a fraction of a frame, and that error compounds linearly with cut count.
// Snapping every delete-range edge to the nearest real frame time BEFORE
// computing anything downstream keeps the retimed transcript closer to what
// ffmpeg actually renders. Only meaningful (and only applied) when --video is
// given -- with no video there is no rendered file to drift from, and
// snapping would just add pointless rounding to an otherwise-exact edit.
let fps = null;
if (opts.video && existsSync(resolve(opts.video))) {
  fps = 30;
  const probe = spawnSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
    "-of", "default=noprint_wrappers=1:nokey=1", resolve(opts.video),
  ]);
  const raw = probe.stdout?.toString().trim();
  if (raw && raw.includes("/")) {
    const [n, d] = raw.split("/").map(Number);
    if (Number.isFinite(n) && Number.isFinite(d) && d > 0) fps = n / d;
  } else if (Number.isFinite(Number(raw))) fps = Number(raw);
}
const snap = (t) => (fps ? Math.round(t * fps) / fps : t);

function mergeRanges(ranges) {
  const sorted = ranges.map((r) => ({ start: Number(r.start), end: Number(r.end), reasons: r.reason ? [r.reason] : [] }))
    .sort((a, b) => a.start - b.start);
  const merged = [];
  for (const r of sorted) {
    const last = merged.at(-1);
    if (!last || r.start > last.end) merged.push({ ...r });
    else { last.end = Math.max(last.end, r.end); last.reasons.push(...r.reasons); }
  }
  return merged;
}
// ---- audio-guided edges (video renders only, default on) ----
// A cut placed exactly at an ASR word edge usually clips the onset of the
// next word or leaves the tail of the last one, because word timestamps are
// 50-150ms coarse. Before frame snapping, move each delete edge to the
// quietest 30ms nearby, never past the neighbouring kept words.
let audioSnapped = false;
let rangesForRender = mergeRanges(approved);
if (fps && opts.snapAudio) {
  const { extractWav, loadWav, snapRange } = await import(new URL("../../../../scripts/lib/audio-edges.mjs", import.meta.url));
  const outDirEarly = opts.outDir ? resolve(opts.outDir) : dirname(transcriptPath);
  mkdirSync(outDirEarly, { recursive: true });
  const wav = loadWav(extractWav(resolve(opts.video), join(outDirEarly, `${basename(resolve(opts.video), extname(opts.video))}.16k.wav`)));
  rangesForRender = rangesForRender.map((r) => {
    const prevKept = words.filter((w) => w.end <= r.start).at(-1);
    const nextKept = words.find((w) => w.start >= r.end);
    return snapRange(wav, r, { prevEnd: prevKept ? prevKept.end : 0, nextStart: nextKept ? nextKept.start : duration });
  });
  audioSnapped = true;
}
const mergedDeletes = rangesForRender.map((r) => ({ ...r, start: snap(r.start), end: snap(r.end) })).filter((r) => r.end > r.start);

const keepRanges = [];
let cursor = 0;
for (const d of mergedDeletes) {
  if (d.start > cursor) keepRanges.push({ start: cursor, end: d.start });
  cursor = Math.max(cursor, d.end);
}
if (cursor < duration) keepRanges.push({ start: cursor, end: duration });
const usableKeepRanges = keepRanges.filter((r) => r.end > r.start);
if (!usableKeepRanges.length) die('Cut ranges remove the entire source duration');

const removedTotal = mergedDeletes.reduce((s, r) => s + (r.end - r.start), 0);
const editedDuration = Number((duration - removedTotal).toFixed(3));

function removedBefore(t) {
  let removed = 0;
  for (const d of mergedDeletes) {
    if (d.end <= t) removed += d.end - d.start;
    else if (d.start < t) removed += t - d.start;
    else break;
  }
  return removed;
}
const inDeleted = (w) => mergedDeletes.some((d) => w.start < d.end && d.start < w.end);

const editedWords = [];
for (const w of words) {
  if (inDeleted(w)) continue;
  editedWords.push({
    text: w.text,
    source_start: w.start, source_end: w.end,
    start: Number((w.start - removedBefore(w.start)).toFixed(3)),
    end: Number((w.end - removedBefore(w.end)).toFixed(3)),
  });
}

function buildFilterScript(ranges) {
  const lines = [];
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    lines.push(`[0:v]trim=start=${r.start.toFixed(6)}:end=${r.end.toFixed(6)},setpts=PTS-STARTPTS[v${i}];`);
    lines.push(`[0:a]atrim=start=${r.start.toFixed(6)}:end=${r.end.toFixed(6)},asetpts=PTS-STARTPTS[a${i}];`);
  }
  lines.push(`${ranges.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${ranges.length}:v=1:a=1[v][a]`);
  return lines.join("\n");
}
function fmt(s) { const m = Math.floor(s / 60); return `${String(m).padStart(2, "0")}:${(s - m * 60).toFixed(2).padStart(5, "0")}`; }

const stem = basename(transcriptPath, extname(transcriptPath)).replace(/[-.]?(silence-|mistakes-)?transcript.*$/i, "") || "source";
const outDir = opts.outDir ? resolve(opts.outDir) : dirname(transcriptPath);
mkdirSync(outDir, { recursive: true });

const edl = { agent: "cut-mistakes", source_duration: duration, edited_duration: editedDuration, removed: Number(removedTotal.toFixed(3)), delete_ranges: mergedDeletes, keep_ranges: usableKeepRanges };
const transcriptOut = { language_code: transcript.language_code, source_audio_duration_secs: duration, audio_duration_secs: editedDuration, produced_by: "cut-mistakes", words: editedWords };

writeFileSync(join(outDir, `${stem}.mistakes-edl.json`), JSON.stringify(edl, null, 2));
writeFileSync(join(outDir, `${stem}.mistakes-transcript.json`), JSON.stringify(transcriptOut, null, 2));
writeFileSync(join(outDir, `${stem}.mistakes-decisions.md`), [
  "# Cut-Mistakes Decisions (applied)",
  "",
  `Input duration: ${fmt(duration)} (${duration.toFixed(2)}s)`,
  `Output duration: ${fmt(editedDuration)} (${editedDuration.toFixed(2)}s)`,
  `Removed: ${removedTotal.toFixed(2)}s across ${mergedDeletes.length} cuts`,
  "",
  ...mergedDeletes.map((d) => `- ${fmt(d.start)}–${fmt(d.end)} (${(d.end - d.start).toFixed(2)}s): ${d.reasons.join("; ") || "approved cut"}`),
].join("\n"));

const summary = {
  inputDuration: Number(duration.toFixed(3)), fps, audioSnapped, editedDuration,
  removed: Number(removedTotal.toFixed(3)), removedPct: Number(((removedTotal / duration) * 100).toFixed(1)),
  cuts: mergedDeletes.length, editedWords: editedWords.length, outDir,
};

if (opts.video) {
  const videoPath = resolve(opts.video);
  if (!existsSync(videoPath)) die(`--video not found: ${videoPath}`);
  const outputPath = resolve(opts.output ?? join(outDir, `${basename(videoPath, extname(videoPath))}.mistakes-cut.mp4`));
  if (outputPath === videoPath) die('Output must be a different path from the source video');
  const scriptPath = join(outDir, `${stem}.mistakes-filter.txt`);
  writeFileSync(scriptPath, buildFilterScript(usableKeepRanges));
  summary.video = { input: videoPath, output: outputPath, rendered: false };
  if (opts.apply) {
    console.error(`rendering cut video -> ${outputPath}`);
    const ff = spawnSync("ffmpeg", ["-y", "-i", videoPath, "-/filter_complex", scriptPath, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", outputPath], { stdio: ["ignore", "ignore", "inherit"] });
    if (ff.status !== 0) die(`ffmpeg failed (status ${ff.status})`, ff.status ?? 1);
    summary.video.rendered = true;
  } else summary.hint = "re-run with --apply to render";
}

console.log(JSON.stringify(summary, null, 2));
