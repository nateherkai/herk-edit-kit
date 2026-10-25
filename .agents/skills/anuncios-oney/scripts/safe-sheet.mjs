// Contact sheet of rendered frames with the Meta Reels safe box drawn on top (x 65–1015, y 270–1248).
// Run from the project root:  node <skill>/scripts/safe-sheet.mjs renders/<file>.mp4 out.jpg 1.2 5.0 9.8 …
// Look at every tile: no text, number, badge, CTA or caption may cross the red lines.
// The shaded areas show what the Reels UI covers (profile/"Patrocinado" on top; caption + CTA below).
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [video, out, ...times] = process.argv.slice(2);
if (!video || !out || !times.length) { console.error("usage: safe-sheet.mjs <video> <out.jpg> t1 t2 …"); process.exit(1); }
const dir = mkdtempSync(join(tmpdir(), "safe-"));
const box = [
  "drawbox=x=0:y=0:w=1080:h=269:color=red@0.22:t=fill",
  "drawbox=x=0:y=1249:w=1080:h=671:color=red@0.22:t=fill",
  "drawbox=x=0:y=269:w=65:h=980:color=red@0.22:t=fill",
  "drawbox=x=1015:y=269:w=65:h=980:color=red@0.22:t=fill",
  "drawbox=x=65:y=270:w=950:h=979:color=red:t=4",
].join(",");
times.forEach((t, i) => execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", t, "-i", video, "-frames:v", "1",
  "-vf", `${box},scale=360:640`, "-update", "1", join(dir, `f${String(i).padStart(3, "0")}.png`)]));
const cols = Math.min(6, times.length), rows = Math.ceil(times.length / cols);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", join(dir, "f%03d.png"), "-vf", `tile=${cols}x${rows}:padding=6`, "-frames:v", "1", "-update", "1", out]);
rmSync(dir, { recursive: true, force: true });
console.log(`safe sheet: ${out} — tiles left→right, top→bottom: ${times.join(", ")} s`); // (ffmpeg drawtext crashes on this Windows build: no labels)
