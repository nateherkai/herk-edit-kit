import test from 'node:test';
import assert from 'node:assert/strict';
import { SR, energy, quietest, snapRange } from '../scripts/lib/audio-edges.mjs';

// Synthetic 3s clip: a "word" (loud) 0.50-1.00s, silence, a second word 1.30-1.80s.
// Int16 array-like, no WAV header.
function clip() {
  const a = new Int16Array(3 * SR);
  const loud = (t0, t1) => { for (let i = Math.floor(t0 * SR); i < Math.floor(t1 * SR); i++) a[i] = 12000 * Math.sin(i * 0.3); };
  loud(0.50, 1.00); loud(1.30, 1.80);
  return a;
}

test('energy separates speech from silence', () => {
  const a = clip();
  assert.ok(energy(a, 0.6, 0.9) > 0.01);
  assert.ok(energy(a, 1.05, 1.25) < 1e-6);
});

test('quietest window lands in the gap between two words', () => {
  const t = quietest(clip(), 0.95, 1.35);
  assert.ok(t > 1.0 && t < 1.3, `expected a point inside the 1.00-1.30 gap, got ${t}`);
});

test('snapRange moves an ASR-edge cut off the next word onset and never past a kept word', () => {
  // A delete range that starts 40ms late (inside the first word's tail is
  // fine) and ends exactly at ASR word.end of the second word, 30ms late.
  const r = snapRange(clip(), { start: 1.02, end: 1.83 }, { prevEnd: 1.00, nextStart: 2.50 });
  assert.ok(r.start >= 1.00 && r.start <= 1.05);
  assert.ok(r.end >= 1.80 && r.end <= 1.98, `end ${r.end} should sit in the silence after the word`);
  assert.equal(r.requested_end, 1.83);
  // Bounds are hard: a kept word starting right after the range pins the end.
  const pinned = snapRange(clip(), { start: 1.02, end: 1.83 }, { prevEnd: 1.00, nextStart: 1.84 });
  assert.ok(pinned.end <= 1.84);
});
