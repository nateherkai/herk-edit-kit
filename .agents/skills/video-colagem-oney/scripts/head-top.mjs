// Measure where the presenter's head is across the edit, from the matte made by matte-person.py.
// Run inside <project>/assets:  node <skill>/scripts/head-top.mjs [fg-matte.mp4]
// Prints head top (first row of the person in the centre band) per second, plus min/median/max,
// and the resulting layout: text zone y 270 → captionTop − 10, caption band top.
import { spawnSync } from "node:child_process";

const src = process.argv[2] || "fg-matte.mp4";
const W = 270, H = 480, S = 1920 / H; // sample at quarter size, 2 fps
const r = spawnSync("ffmpeg", ["-v", "error", "-i", src, "-vf", `fps=2,scale=${W}:${H}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"],
  { maxBuffer: 1 << 30 });
const buf = r.stdout, n = Math.floor(buf.length / (W * H));
const tops = [];
const CHIN = 870; // chin ≈ head top + 870 px when the face fills a selfie frame (check on frames per video)
for (let f = 0; f < n; f++) {
  const o = f * W * H;
  let top = H;
  // centre band x 25%–75%: the head; ignore hands at the frame edges
  for (let y = 0; y < H && top === H; y++) {
    let c = 0;
    for (let x = W * 0.25; x < W * 0.75; x++) if (buf[o + y * W + (x | 0)] > 128) c++;
    if (c >= 6) top = y; // ≥ 6 px wide = hair, not a stray finger tip
  }
  tops.push(Math.round(top * S));
}
const sorted = [...tops].sort((a, b) => a - b);
const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
let line = "";
tops.forEach((t, i) => { if (i % 2 === 0) line += `${(i / 2).toString().padStart(3)}s:${t} `; });
console.log("head top / neck (y px, per second):\n" + line.trim());
const low = q(0.05); // head this high (or higher) only 5% of the time
console.log(`head top  min ${sorted[0]}  p5 ${low}  median ${q(0.5)}  max ${sorted.at(-1)}  (${n} samples)`);
const capTop = Math.max(270, low - 95);
console.log(`suggested: #cap top ${capTop}px (80px band)  ·  beat zone y 270 → ${capTop - 10}  (${capTop - 280}px tall)`);
if (low - 95 < 380) console.log("head sits HIGH: little room above it — use shorter beats or put captions on the chest if the chin is above y 1170");
console.log(`caption UNDER THE CHIN: #cap top ≈ stretch median head top + ${CHIN} (chin) — check one frame per stretch; keep ≤ 1640 (Instagram UI below)`);
