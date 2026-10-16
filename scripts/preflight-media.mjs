#!/usr/bin/env node
/**
 * preflight-media.mjs — catch the two failures that waste the most time,
 * before a run starts instead of minutes into one.
 *
 * 1. FFMPEG VERSION. The cut-silences and cut-mistakes scripts pass their
 *    filtergraph with ffmpeg's `-/option file` syntax. That syntax does not
 *    exist before FFmpeg 7. On FFmpeg 6 the render dies with
 *    "Unrecognized option '/filter_complex'" only after the work is done.
 *    The kit documents "FFmpeg with ffprobe" and no minimum version, and
 *    scripts/preflight.mjs does not mention ffmpeg at all.
 *
 * 2. TRANSCRIPT SHAPE. From docs/TOOLS-AND-API-KEYS.md: "Paragraphs, SRT
 *    subtitles, and segment-only transcripts do not supply the required word
 *    timing." Feed an SRT and the agent can run for many minutes before the
 *    mismatch surfaces. This rejects it in about a second.
 *
 *   node scripts/preflight-media.mjs                    check ffmpeg only
 *   node scripts/preflight-media.mjs transcript.json    also check a transcript
 *
 * Exit 0 = good to run. Exit 1 = something will fail. Exit 2 = bad usage.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { extname } from "node:path";

const MIN_FFMPEG = 7;
let problems = 0;

function fail(msg, fix) {
  problems++;
  console.log(`FAIL  ${msg}`);
  if (fix) console.log(`      fix: ${fix}`);
}
function ok(msg) { console.log(`ok    ${msg}`); }

/* ---- 1. ffmpeg ---------------------------------------------------------- */
for (const bin of ["ffmpeg", "ffprobe"]) {
  const r = spawnSync(bin, ["-version"], { encoding: "utf8" });
  if (r.error) {
    fail(`${bin} not found on PATH`, "install FFmpeg 7 or newer, including ffprobe");
    continue;
  }
  const line = (r.stdout || "").split("\n")[0];
  const m = line.match(/version\s+n?(\d+)\.(\d+)/i);
  if (!m) { console.log(`warn  ${bin}: could not parse a version from "${line.slice(0, 60)}"`); continue; }
  const major = Number(m[1]);
  if (major < MIN_FFMPEG) {
    fail(`${bin} is ${m[1]}.${m[2]} — the cut scripts need ${MIN_FFMPEG}.0 or newer`,
         "the `-/option file` syntax they use did not exist before FFmpeg 7. Upgrade FFmpeg.");
  } else {
    ok(`${bin} ${m[1]}.${m[2]}`);
  }
}

/* ---- 2. transcript ------------------------------------------------------ */
const path = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (path) {
  if (!existsSync(path)) {
    fail(`transcript not found: ${path}`);
  } else {
    const ext = extname(path).toLowerCase();
    const raw = readFileSync(path, "utf8");

    if (ext === ".srt" || ext === ".vtt" || /^\s*\d+\s*\n\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/m.test(raw)) {
      fail(`${path} is a subtitle file (${ext || "SRT-shaped"}), not a word-level transcript`,
           "the cutting tools need word timings in seconds. Re-transcribe with word granularity " +
           "(ElevenLabs Scribe, or Whisper with timestamp_granularities=[\"word\"]). Do not invent timing.");
    } else if (ext !== ".json") {
      fail(`${path} is not JSON`, "supply the word-level JSON the cutting tools expect");
    } else {
      let data;
      try { data = JSON.parse(raw); }
      catch (e) { fail(`${path} is not valid JSON: ${e.message}`); }

      if (data) {
        const words = data.words;
        if (!Array.isArray(words) || !words.length) {
          fail(`${path} has no "words" array — this is a segment-only or paragraph transcript`,
               "re-transcribe with word-level timestamps");
        } else {
          const bad = words.findIndex(
            (w) => typeof w?.start !== "number" || typeof w?.end !== "number" || typeof w?.text !== "string"
          );
          if (bad !== -1) {
            fail(`word ${bad} is missing a numeric start/end or a text field`,
                 "map your provider's field names to {text, start, end}, keeping the numbers numeric");
          } else if (typeof data.audio_duration_secs !== "number") {
            fail(`${path} has no numeric "audio_duration_secs"`,
                 "read the true source duration from ffprobe and add it");
          } else {
            const last = words[words.length - 1].end;
            if (last > data.audio_duration_secs + 0.5) {
              fail(`last word ends at ${last}s but audio_duration_secs is ${data.audio_duration_secs}s`,
                   "the transcript is not on this recording's timeline — this is the mismatch that " +
                   "costs a full render pass. Check you are pairing the right files.");
            } else {
              ok(`${path}: ${words.length} words, ${data.audio_duration_secs}s, word-level timings present`);
            }
          }
        }
      }
    }
  }
} else {
  console.log("note  no transcript given — pass one to check it before a cut run");
}

console.log("");
if (problems) { console.log(`${problems} problem(s). Fix these before running an edit.`); process.exit(1); }
console.log("Ready to run.");
