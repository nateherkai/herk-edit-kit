// Build <project>/index.html from src/index.template.html (explainer look).
// Run in the project root:  node <skill>/scripts/build-index.mjs
// - __CAPTIONS__ : PHRASE captions (not word-by-word) from assets/transcript.json, each one a clip inside an
//     opaque dark box (1–2 lines). Breaks on punctuation, on a pause > 0.28 s, or before it passes MAX chars.
//     assets/caption-fixes.json  {"wrong": "right", "drop-me": ""}
//     assets/captions.json       {"hide": [[a,b]], "max": 44}   hide → ranges with no captions (rare)
//   reel.json {"captions": "words"} → the reel look instead: ONE word at a time, Advercase Bold, white, black outline,
//     centred at capTop (class .w). Default "phrases" = the reference's dark-box phrases (class .ph).
// - __DUR__ : clean.mp4 duration;  __CAP_TOP__ / __CFG__ : reel.json
//     {"capTop": 1545, "punch": 1.18, "split": {"y": 668, "scale": 1, "origin": "50% 0%"}}
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const read = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const t = JSON.parse(readFileSync("assets/transcript.json", "utf8"));
const dur = t.audio_duration_secs;
const fix = read("assets/caption-fixes.json", {});
const cc = { hide: [], max: 44, ...read("assets/captions.json", {}) };
const cfg = { capTop: 1545, punch: 1.18, ...read("reel.json", {}) };
cfg.split = { y: 668, scale: 1, origin: "50% 0%", ...(cfg.split || {}) };
const inRange = (x, rs) => rs.some(([a, b]) => x >= a && x < b);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---- words (merge Whisper splits like "e" + "-mail" and "100" + "%")
const words = [];
for (let i = 0; i < t.words.length; i++) {
  const w = t.words[i], n = t.words[i + 1];
  if (n && (n.text.startsWith("-") || n.text === "%")) { words.push({ text: w.text + n.text, start: w.start, end: n.end }); i++; continue; }
  const txt = w.text in fix ? fix[w.text] : w.text;
  if (txt) words.push({ text: txt, start: w.start, end: w.end });
}

// ---- group into phrases
const phrases = [];
let cur = null;
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  if (inRange(w.start, cc.hide)) { if (cur) phrases.push(cur); cur = null; continue; }
  const gap = cur ? w.start - cur.end : 0;
  if (cur && (gap > 0.28 || (cur.text + " " + w.text).length > cc.max)) { phrases.push(cur); cur = null; }
  if (!cur) cur = { text: w.text, start: w.start, end: w.end };
  else { cur.text += " " + w.text; cur.end = w.end; }
  if (/[.!?;:]$/.test(w.text) || (/,$/.test(w.text) && cur.text.length > cc.max * 0.55)) { phrases.push(cur); cur = null; }
}
if (cur) phrases.push(cur);

// ---- word mode: one clip per word, from its onset until the next word (max 1.0 s)
const wordCaps = () => words.map((w, i) => {
  if (inRange(w.start, cc.hide)) return "";
  const next = words[i + 1] ? words[i + 1].start : dur;
  const d = Math.min(next - w.start, 1.0);
  if (d <= 0.01) return "";
  return `<div class="w clip" id="w${i}" data-start="${w.start.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="5">${esc(w.text.replace(/[.,;:]$/, ""))}</div>`;
}).join("\n");

// ---- one clip per phrase; holds until the next phrase (max +0.6 s after the last word)
const caps = phrases.map((p, i) => {
  const next = phrases[i + 1] ? phrases[i + 1].start : dur;
  const d = Math.min(next, p.end + 0.6) - p.start;
  if (d <= 0.05) return "";
  const cls = ["ph", "clip"];
  const txt = p.text.replace(/,$/, ""); // keep . ? ! like the reference
  return `<div class="${cls.join(" ")}" id="p${i}" data-start="${p.start.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="5"><span>${esc(txt)}</span></div>`;
}).join("\n");

const html = readFileSync("src/index.template.html", "utf8")
  .replaceAll("__DUR__", dur.toFixed(3)).replace("__CAPTIONS__", cfg.captions === "words" ? wordCaps() : caps)
  .replace("__CAP_TOP__", String(cfg.capTop)).replace("__CFG__", JSON.stringify(cfg));
writeFileSync("index.html", html);
const meta = read("meta.json", {});
Object.assign(meta, { id: "reel", width: 1080, height: 1920, fps: 30 });
writeFileSync("meta.json", JSON.stringify(meta, null, 2));
console.log(`index.html built — ${dur.toFixed(2)}s, ${phrases.length} caption phrases`);
