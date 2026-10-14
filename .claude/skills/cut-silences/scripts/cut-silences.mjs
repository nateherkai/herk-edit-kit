#!/usr/bin/env node
// Agent 1 — Cut Silences
// Pure pause/silence trimmer. Takes any word-level transcript (ElevenLabs Scribe
// shape, or { words: [{ text, start, end }] }) and removes silences only:
//   - dead air before the first word and after the last word (head/tail trim)
//   - inter-word pauses longer than --gap, trimmed down to a natural breath
//
// It does NOT cut repeats, false starts, or mistakes — that is Agent 2's job.
//
// Outputs (next to the transcript, or --out-dir):
//   <stem>.silence-edl.json          keep/delete ranges + summary + params
//   <stem>.silence-transcript.json   re-timed words on the edited timeline
//   <stem>.silence-decisions.md       human-readable summary
// And, with --video, the ffmpeg command to make the cut (run it with --apply).
//
// Usage:
//   node cut-silences.mjs <transcript.json> [options]
//
// Options:
//   --video <path>        source video; enables real cutting / ffmpeg command
//   --out-dir <dir>       output directory (default: alongside the transcript)
//   --output <path>       cut-video path (default: <video-stem>.silenced.mp4)
//   --gap <seconds>       min pause treated as trimmable silence (default 0.55)
//   --head-pad <seconds>  silence kept before the first word (default 0.22)
//   --tail-pad <seconds>  silence kept after the last word (default 0.34)
//   --apply               actually run ffmpeg to render the cut video
//   --help

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { spawnSync } from "node:child_process";
import { argv, exit } from "node:process";

function die(msg, code = 1) {
  console.error(msg);
  exit(code);
}

// ---- parse args ----
const args = argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(
    "Usage: node cut-silences.mjs <transcript.json> [--video path] [--out-dir dir]\n" +
      "       [--output path] [--gap 0.55] [--head-pad 0.22] [--tail-pad 0.34] [--apply]",
  );
  exit(args.length === 0 ? 1 : 0);
}

const opts = {
  transcript: null,
  video: null,
  outDir: null,
  output: null,
  gap: 0.55,
  headPad: 0.22,
  tailPad: 0.34,
  apply: false,
};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--video") opts.video = args[++i];
  else if (a === "--out-dir") opts.outDir = args[++i];
  else if (a === "--output" || a === "-o") opts.output = args[++i];
  else if (a === "--gap") opts.gap = Number(args[++i]);
  else if (a === "--head-pad") opts.headPad = Number(args[++i]);
  else if (a === "--tail-pad") opts.tailPad = Number(args[++i]);
  else if (a === "--apply") opts.apply = true;
  else if (a.startsWith("--")) die(`unknown option: ${a}`);
  else if (!opts.transcript) opts.transcript = a;
  else die(`unexpected argument: ${a}`);
}
if (!opts.transcript) die("no transcript file given");
if (!Number.isFinite(opts.gap) || opts.gap <= 0) die("--gap must be a positive number");

const transcriptPath = resolve(opts.transcript);
if (!existsSync(transcriptPath)) die(`transcript not found: ${transcriptPath}`);

// ---- load + normalize transcript ----
const transcript = JSON.parse(readFileSync(transcriptPath, "utf8"));
if (!Array.isArray(transcript.words)) die("transcript has no `words` array");

// Keep only real spoken words with numeric timing. ElevenLabs tags spacing/audio
// events with type !== "word"; generic transcripts may omit `type` entirely.
const words = transcript.words
  .filter((w) => (w.type ? w.type === "word" : true))
  .filter((w) => Number.isFinite(Number(w.start)) && Number.isFinite(Number(w.end)))
  .map((w, index) => ({ index, text: w.text, start: Number(w.start), end: Number(w.end) }));

if (words.length === 0) die("no timed words found in transcript");

// Source duration: prefer the transcript's own value, else probe the video, else
// fall back to just past the last word.
let duration = Number(transcript.audio_duration_secs);
if (!Number.isFinite(duration)) {
  if (opts.video && existsSync(resolve(opts.video))) {
    const probe = spawnSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", resolve(opts.video),
    ]);
    const d = Number(probe.stdout?.toString().trim());
    if (Number.isFinite(d)) duration = d;
  }
}
if (!Number.isFinite(duration)) duration = words.at(-1).end + opts.tailPad;

// ---- frame rate (for boundary snapping, video renders only) ----
// ffmpeg's trim/atrim filters cut on real source frame boundaries, not exact
// float seconds. If the retimed transcript is computed from un-snapped floats,
// each cut's actual rendered position silently differs from the math by a
// fraction of a frame, and that error compounds linearly with cut count (a
// typical silence pass makes 100-300+ cuts). Snapping every delete-range edge
// to the nearest real frame time BEFORE computing anything downstream keeps
// the retimed transcript closer to what ffmpeg actually renders. Only
// meaningful (and only applied) when --video is given -- with no video there
// is no rendered file to drift from, and snapping would just add pointless
// rounding to an otherwise-exact edit.
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

// ---- build the delete ranges (silence only) ----
function mergeRanges(ranges) {
  const sorted = ranges
    .filter((r) => Number.isFinite(r.start) && Number.isFinite(r.end) && r.end > r.start)
    .sort((a, b) => a.start - b.start);
  const merged = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (!last || range.start > last.end) {
      merged.push({ start: range.start, end: range.end, reasons: [range.reason] });
    } else {
      last.end = Math.max(last.end, range.end);
      last.reasons.push(range.reason);
    }
  }
  return merged;
}

const deleteRanges = [];

// head + tail dead air
const headEnd = words[0].start - opts.headPad;
if (headEnd > 0) deleteRanges.push({ start: 0, end: headEnd, reason: "head trim before first word" });
const tailStart = words.at(-1).end + opts.tailPad;
if (duration > tailStart) deleteRanges.push({ start: tailStart, end: duration, reason: "tail trim after final word" });

// inter-word pauses
for (let i = 1; i < words.length; i++) {
  const prev = words[i - 1];
  const next = words[i];
  const gap = next.start - prev.end;
  if (gap < opts.gap) continue;

  // Keep a natural breath: longer for big pauses and sentence boundaries.
  const sentenceBreak = /[.!?]$/.test(prev.text ?? "");
  const keep = gap >= 2 ? 0.24 : sentenceBreak ? 0.2 : 0.14;
  // Bias the kept breath slightly toward the end of the previous phrase.
  const delStart = prev.end + keep * 0.55;
  const delEnd = next.start - keep * 0.45;
  if (delEnd > delStart) {
    deleteRanges.push({ start: delStart, end: delEnd, reason: `pause ${gap.toFixed(2)}s -> ${keep.toFixed(2)}s` });
  }
}

const mergedDeletes = mergeRanges(deleteRanges).map((r) => ({ ...r, start: snap(r.start), end: snap(r.end) })).filter((r) => r.end > r.start);

// ---- keep ranges = the complement of the deletes ----
const keepRanges = [];
let cursor = 0;
for (const del of mergedDeletes) {
  if (del.start > cursor) keepRanges.push({ start: cursor, end: del.start });
  cursor = Math.max(cursor, del.end);
}
if (cursor < duration) keepRanges.push({ start: cursor, end: duration });
const usableKeepRanges = keepRanges.filter((r) => r.end - r.start >= 0.04);

const removedTotal = mergedDeletes.reduce((sum, r) => sum + (r.end - r.start), 0);
const editedDuration = Number((duration - removedTotal).toFixed(3));

// ---- re-time the transcript onto the edited timeline ----
function removedBefore(time) {
  let removed = 0;
  for (const del of mergedDeletes) {
    if (del.end <= time) removed += del.end - del.start;
    else if (del.start < time) removed += time - del.start;
    else break;
  }
  return removed;
}
function inDeleted(word) {
  return mergedDeletes.some((del) => word.start < del.end && del.start < word.end);
}

const editedWords = [];
for (const word of words) {
  if (inDeleted(word)) continue; // a word fully swallowed by a trim (rare for pure silence)
  editedWords.push({
    text: word.text,
    source_start: word.start,
    source_end: word.end,
    start: Number((word.start - removedBefore(word.start)).toFixed(3)),
    end: Number((word.end - removedBefore(word.end)).toFixed(3)),
  });
}

// ---- ffmpeg trim+concat filtergraph (reliable A/V-synced cut) ----
function buildFilterScript(ranges) {
  const lines = [];
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    lines.push(`[0:v]trim=start=${r.start.toFixed(6)}:end=${r.end.toFixed(6)},setpts=PTS-STARTPTS[v${i}];`);
    lines.push(`[0:a]atrim=start=${r.start.toFixed(6)}:end=${r.end.toFixed(6)},asetpts=PTS-STARTPTS[a${i}];`);
  }
  const inputs = ranges.map((_, i) => `[v${i}][a${i}]`).join("");
  lines.push(`${inputs}concat=n=${ranges.length}:v=1:a=1[v][a]`);
  return lines.join("\n");
}

// ---- write outputs ----
const stem = basename(transcriptPath, extname(transcriptPath)).replace(/[-.]?transcript.*$/i, "") || "source";
const outDir = opts.outDir ? resolve(opts.outDir) : dirname(transcriptPath);
mkdirSync(outDir, { recursive: true });

const params = { gap: opts.gap, headPad: opts.headPad, tailPad: opts.tailPad };
const edl = {
  agent: "cut-silences",
  params,
  source_duration: duration,
  edited_duration: editedDuration,
  removed: Number(removedTotal.toFixed(3)),
  delete_ranges: mergedDeletes,
  keep_ranges: usableKeepRanges,
};
const transcriptOut = {
  language_code: transcript.language_code,
  source_audio_duration_secs: duration,
  audio_duration_secs: editedDuration,
  produced_by: "cut-silences",
  words: editedWords,
};

function fmt(s) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${(s - m * 60).toFixed(2).padStart(5, "0")}`;
}
const pauseDeletes = mergedDeletes.filter((d) => d.reasons.some((r) => r?.startsWith("pause")));
const decisions = [
  "# Cut-Silences Decisions",
  "",
  `Source duration: ${fmt(duration)} (${duration.toFixed(2)}s)`,
  `Edited duration: ${fmt(editedDuration)} (${editedDuration.toFixed(2)}s)`,
  `Removed: ${removedTotal.toFixed(2)}s of silence across ${mergedDeletes.length} ranges`,
  `Params: gap>=${params.gap}s, head-pad ${params.headPad}s, tail-pad ${params.tailPad}s`,
  "",
  `## Largest pauses trimmed (top 15)`,
  "",
  ...pauseDeletes
    .map((d) => ({ ...d, len: d.end - d.start }))
    .sort((a, b) => b.len - a.len)
    .slice(0, 15)
    .map((d) => `- ${fmt(d.start)}-${fmt(d.end)} removed ${d.len.toFixed(2)}s`),
].join("\n");

const edlPath = join(outDir, `${stem}.silence-edl.json`);
const tPath = join(outDir, `${stem}.silence-transcript.json`);
const decPath = join(outDir, `${stem}.silence-decisions.md`);
writeFileSync(edlPath, JSON.stringify(edl, null, 2));
writeFileSync(tPath, JSON.stringify(transcriptOut, null, 2));
writeFileSync(decPath, decisions);

const summary = {
  sourceDuration: Number(duration.toFixed(3)),
  fps,
  editedDuration,
  removed: Number(removedTotal.toFixed(3)),
  removedPct: Number(((removedTotal / duration) * 100).toFixed(1)),
  deleteRanges: mergedDeletes.length,
  keepRanges: usableKeepRanges.length,
  editedWords: editedWords.length,
  outputs: { edl: edlPath, transcript: tPath, decisions: decPath },
};

// ---- optional: produce the cut video ----
if (opts.video) {
  const videoPath = resolve(opts.video);
  if (!existsSync(videoPath)) die(`--video not found: ${videoPath}`);
  const outputPath = resolve(
    opts.output ?? join(outDir, `${basename(videoPath, extname(videoPath))}.silenced.mp4`),
  );
  const scriptPath = join(outDir, `${stem}.silence-filter.txt`);
  writeFileSync(scriptPath, buildFilterScript(usableKeepRanges));
  summary.video = { input: videoPath, output: outputPath, filterScript: scriptPath };

  const ffArgs = [
    "-y", "-i", videoPath,
    "-/filter_complex", scriptPath,
    "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    outputPath,
  ];
  summary.ffmpegCommand = `ffmpeg ${ffArgs.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}`;

  if (opts.apply) {
    console.error(`rendering cut video -> ${outputPath}`);
    const ff = spawnSync("ffmpeg", ffArgs, { stdio: ["ignore", "ignore", "inherit"] });
    if (ff.status !== 0) die(`ffmpeg failed (status ${ff.status})`, ff.status ?? 1);
    summary.video.rendered = true;
  } else {
    summary.video.rendered = false;
    summary.hint = "re-run with --apply to render the cut video";
  }
}

console.log(JSON.stringify(summary, null, 2));
