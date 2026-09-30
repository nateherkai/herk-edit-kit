#!/usr/bin/env node
// Transcribe a video/audio file locally with whisper.cpp -> word-level JSON.
// Offline alternative to transcribe-elevenlabs.mjs; writes the same shape the
// cutting tools expect ({ text, audio_duration_secs, words[] }).
//
// Usage:
//   node scripts/transcribe-local.mjs <input> [options]
//
// Defaults:
//   --output   <input-without-ext>.json next to the source
//   --model    small.en (tiny.en, base.en, small.en, medium.en, large-v3)
//   --language en
//
// Requires whisper.cpp (`brew install whisper-cpp`). Runs `hyperframes transcribe`,
// which downloads the model on first use.

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { argv, exit } from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(SCRIPT_DIR, "..");
const HYPERFRAMES_BIN = join(WORKSPACE_ROOT, "node_modules", ".bin", "hyperframes");

function die(msg, code = 1) {
  console.error(msg);
  exit(code);
}

// --- parse args ---
const args = argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(
    `Usage: node scripts/transcribe-local.mjs <input> [--output path] ` +
      `[--model tiny.en|base.en|small.en|medium.en|large-v3] [--language en]`,
  );
  exit(args.length === 0 ? 1 : 0);
}

const opts = { input: null, output: null, model: "small.en", language: "en" };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--output" || a === "-o") opts.output = args[++i];
  else if (a === "--model" || a === "-m") opts.model = args[++i];
  else if (a === "--language" || a === "--lang") opts.language = args[++i];
  else if (a.startsWith("--")) die(`unknown option: ${a}`);
  else if (!opts.input) opts.input = a;
  else die(`unexpected argument: ${a}`);
}
if (!opts.input) die("no input file given");

const inputPath = resolve(opts.input);
if (!existsSync(inputPath)) die(`input not found: ${inputPath}`);
if (!existsSync(HYPERFRAMES_BIN)) die("hyperframes not installed; run `npm ci` first");

const inputDir = dirname(inputPath);
const inputStem = basename(inputPath, extname(inputPath));
const outputPath = resolve(opts.output ?? join(inputDir, `${inputStem}.json`));

// --- full source duration from ffprobe ---
const probe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", inputPath],
  { encoding: "utf8" },
);
if (probe.status !== 0) die(`ffprobe failed:\n${probe.stderr ?? ""}`, probe.status ?? 1);
const duration = Number.parseFloat(probe.stdout.trim());

// --- run whisper.cpp via hyperframes transcribe in a scratch dir ---
const workDir = mkdtempSync(join(tmpdir(), "hf-transcribe-"));
const t0 = Date.now();
const hf = spawnSync(
  HYPERFRAMES_BIN,
  ["transcribe", inputPath, "--dir", workDir, "--engine", "whisper", "--model", opts.model,
    ...(opts.language ? ["--language", opts.language] : [])],
  { stdio: ["ignore", "inherit", "inherit"] },
);
const dt = ((Date.now() - t0) / 1000).toFixed(1);
const rawPath = join(workDir, "transcript.json");
if (hf.status !== 0 || !existsSync(rawPath)) {
  rmSync(workDir, { recursive: true, force: true });
  die(`hyperframes transcribe failed (exit ${hf.status})`, hf.status || 1);
}

const raw = JSON.parse(readFileSync(rawPath, "utf8"));
rmSync(workDir, { recursive: true, force: true });

const words = (Array.isArray(raw) ? raw : raw.words ?? []).map((w) => ({
  text: w.text ?? w.word,
  start: w.start,
  end: w.end,
  type: "word",
}));

const json = {
  language_code: opts.language,
  audio_duration_secs: duration,
  text: words.map((w) => w.text).join(" "),
  words,
};
writeFileSync(outputPath, JSON.stringify(json, null, 2));

console.log(`ok ${dt}s | ${words.length} words | ${duration.toFixed(1)}s audio | ${outputPath}`);
