// Inlines captions (one clip per word) and duration into index.html from assets/transcript.json.
// Run in the project root: node <skill>/scripts/build-index.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const t = JSON.parse(readFileSync("assets/transcript.json", "utf8"));
const dur = t.audio_duration_secs;
// Whisper mishearings, fixed for captions only: assets/caption-fixes.json {"wrong": "right", "drop": ""}
const fix = existsSync("assets/caption-fixes.json") ? JSON.parse(readFileSync("assets/caption-fixes.json", "utf8")) : {};
const words = [];
for (let i = 0; i < t.words.length; i++) {
  const w = t.words[i], n = t.words[i + 1];
  if (w.text === "e" && n && n.text === "-mail") { words.push({ text: "e-mail", start: w.start }); i++; continue; }
  // Glue a lone "%" onto its number ("100" + "%" -> "100%").
  if (n && n.text === "%") { words.push({ text: w.text + "%", start: w.start }); i++; continue; }
  const txt = w.text.replace(/^-/, "");
  const f = txt in fix ? fix[txt] : txt;
  if (f) words.push({ text: f, start: w.start });
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const caps = words.map((w, i) => {
  const next = words[i + 1] ? words[i + 1].start : dur;
  const d = Math.min(next - w.start, 1.2);
  if (d <= 0.01) return "";
  return `<div class="w clip" id="w${i}" data-start="${w.start.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="5">${esc(w.text)}</div>`;
}).join("\n");
writeFileSync("index.html", readFileSync("src/index.template.html", "utf8").replaceAll("__DUR__", dur.toFixed(3)).replace("__CAPTIONS__", caps));
const meta = JSON.parse(readFileSync("meta.json", "utf8"));
Object.assign(meta, { id: "reel", width: 1080, height: 1920, fps: 30 });
writeFileSync("meta.json", JSON.stringify(meta, null, 2));
console.log("index.html built, duration", dur, "captions", words.length);
