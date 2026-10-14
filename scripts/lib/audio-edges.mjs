// Audio-guided cut edges.
//
// ASR word timestamps are 50-150ms coarse and speakers usually start the next
// word inside that window, so a cut placed at `word.end` (+ any fixed pad)
// tends to land on the first syllable of the following word. These helpers
// move a proposed edge to the quietest short window nearby, bounded so it can
// never enter a neighbouring kept word.
//
// Works on a 16 kHz mono 16-bit PCM WAV (see `extractWav`).

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

export const SR = 16000;
const HEADER = 44;

export function extractWav(videoPath, wavPath) {
  if (existsSync(wavPath)) return wavPath;
  const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", videoPath, "-vn", "-ac", "1", "-ar", String(SR), "-c:a", "pcm_s16le", wavPath]);
  if (r.status !== 0) throw new Error(`ffmpeg wav extract failed: ${r.stderr}`);
  return wavPath;
}

export function loadWav(wavPath) {
  return readFileSync(wavPath);
}

// Mean-square energy of [a, b) seconds. Buffers may be a raw Int16 array-like
// (tests) or a WAV file buffer (skips the 44-byte header).
export function energy(buf, a, b) {
  const isWav = Buffer.isBuffer(buf);
  const off = isWav ? HEADER : 0;
  const n = isWav ? (buf.length - HEADER) / 2 : buf.length;
  const i0 = Math.max(0, Math.floor(a * SR)), i1 = Math.min(n, Math.floor(b * SR));
  let s = 0, c = 0;
  for (let t = i0; t < i1; t++) { const v = (isWav ? buf.readInt16LE(off + t * 2) : buf[t]) / 32768; s += v * v; c++; }
  return c ? s / c : 0;
}

// Centre of the quietest `win`-second window inside [a, b]. Falls back to the
// midpoint when the range is narrower than one window.
export function quietest(buf, a, b, win = 0.03, step = 0.005) {
  if (b - a <= win) return (a + b) / 2;
  let best = a, bv = Infinity;
  for (let t = a; t <= b - win + 1e-9; t += step) { const e = energy(buf, t, t + win); if (e < bv) { bv = e; best = t; } }
  return best + win / 2;
}

// Snap one delete range to audio. `prevEnd` / `nextStart` are the hard bounds
// (end of the last kept word before the range, start of the first kept word
// after it); `reach` is how far past the proposed edge the search may look.
export function snapRange(buf, range, { prevEnd = 0, nextStart = Infinity, reach = 0.15, inward = 0.03 } = {}) {
  const startLo = Math.max(prevEnd, range.start - reach);
  const startHi = Math.min(range.start + inward, range.end);
  const endLo = Math.max(range.end - inward, range.start);
  const endHi = Math.min(nextStart, range.end + reach);
  const start = startHi > startLo ? quietest(buf, startLo, startHi) : range.start;
  const end = endHi > endLo ? quietest(buf, endLo, endHi) : range.end;
  return { ...range, start: +start.toFixed(3), end: +end.toFixed(3), requested_start: range.start, requested_end: range.end };
}
