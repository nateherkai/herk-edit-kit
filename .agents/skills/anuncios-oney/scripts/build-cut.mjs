// Cut raw.mp4 into clean.mp4 from keeps.json, removing every measured pause, with J/L cuts at edit points.
// Run inside <project>/assets:  node <skill>/scripts/build-cut.mjs [--jl 4] [--no-jl]
// Inputs: raw.mp4, keeps.json ({fps, keeps:[{from,to,why}]}), silences.txt (made here if missing).
// Outputs: clean.mp4, edit-decisions.json (audio timeline = caption timeline).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { videoEncoder, HWDEC } from "./encoder.mjs";

const args = process.argv.slice(2);
const JL = args.includes("--no-jl") ? 0 : Number(args[args.indexOf("--jl") + 1] || 4); // frames
const { keeps, fps = 30 } = JSON.parse(readFileSync("keeps.json", "utf8"));
const frame = (t) => Math.round(t * fps) / fps;

// 1. measured silences (ffmpeg silencedetect, -30 dB, 0.15 s)
if (!existsSync("silences.txt")) {
  const r = spawnSync("ffmpeg", ["-v", "info", "-i", "raw.mp4", "-vn", "-af", "silencedetect=noise=-30dB:d=0.15", "-f", "null", "-"], { encoding: "utf8" });
  const s = [...r.stderr.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => `${m[1]} ${m[2]}`);
  writeFileSync("silences.txt", s.join("\n"));
}
// Keep a short tail after speech and a slightly longer lead-in before the next onset.
const TAIL = 0.05, LEAD = 0.08;
const silences = readFileSync("silences.txt", "utf8").trim().split(/\s*\n/).filter(Boolean).map((l) => l.trim().split(" ").map(Number))
  .map(([a, b]) => [a + TAIL, b - LEAD]).filter(([a, b]) => b - a > 0.06);

// 2. audio pieces = keep ranges minus silences
const pieces = [];
for (const k of keeps) {
  let cur = k.from;
  for (const [a, b] of silences) {
    if (b <= cur || a >= k.to) continue;
    if (a > cur) pieces.push({ s: frame(cur), e: frame(a), why: k.why });
    cur = b;
  }
  if (k.to > cur) pieces.push({ s: frame(cur), e: frame(k.to), why: k.why });
}
const segs = pieces.filter((p) => p.e - p.s >= 2 / fps);

// 3. video pieces: same durations, but at real edit points the picture cut is offset from the sound cut.
//    Alternate J (sound of the next shot leads) and L (picture of the next shot leads).
const d = JL / fps;
const vsegs = segs.map((g) => ({ s: g.s, e: g.e }));
let flip = 0;
for (let i = 0; i < segs.length - 1 && d > 0; i++) {
  const gap = segs[i + 1].s - segs[i].e;
  if (gap < 0.25) continue; // not a visible edit point
  if (flip++ % 2 === 0) { vsegs[i].e += d; vsegs[i + 1].s += d; }      // J: old picture holds while new sound starts
  else { vsegs[i].e -= d; vsegs[i + 1].s -= d; }                        // L: new picture arrives before its sound
}

let out = 0;
const decisions = segs.map((g, i) => {
  const r = { source_start: g.s, source_end: g.e, video_start: +vsegs[i].s.toFixed(3), video_end: +vsegs[i].e.toFixed(3), output_start: +out.toFixed(3), output_end: +(out + g.e - g.s).toFixed(3), reason: g.why };
  out += g.e - g.s;
  return r;
});

const f = segs.map((g, i) => {
  const v = vsegs[i], dur = g.e - g.s;
  return `[0:v]trim=${v.s.toFixed(4)}:${v.e.toFixed(4)},setpts=PTS-STARTPTS[v${i}];` +
    `[0:a]atrim=${g.s}:${g.e},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st=${(dur - 0.012).toFixed(3)}:d=0.012[a${i}];`;
}).join("") + segs.map((_, i) => `[v${i}]`).join("") + `concat=n=${segs.length}:v=1:a=0[v];` + segs.map((_, i) => `[a${i}]`).join("") + `concat=n=${segs.length}:v=0:a=1[a]`;
writeFileSync("cut-filter.txt", f);
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", "raw.mp4", "-filter_complex_script", "cut-filter.txt",
  "-map", "[v]", "-map", "[a]", ...videoEncoder(), "-r", String(fps),
  "-c:a", "aac", "-b:a", "192k", "-shortest", "clean.mp4"], { stdio: "inherit" });
writeFileSync("edit-decisions.json", JSON.stringify({ source: "assets/raw.mp4", fps, jl_frames: JL, duration: +out.toFixed(3), segments: decisions }, null, 1));
console.log(`segments=${segs.length} jl_edits=${flip} duration=${out.toFixed(2)}s`);
