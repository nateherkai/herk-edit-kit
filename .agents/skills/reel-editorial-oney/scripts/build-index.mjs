// Build <project>/index.html from src/index.template.html.
// Run in the project root:  node <skill>/scripts/build-index.mjs
// - __CAPTIONS__ : one caption clip per word from assets/transcript.json, lowercased.
//     assets/caption-fixes.json  {"wrong": "right", "drop-me": ""}
//     assets/emphasis.json       {"words": ["claude", "edit"], "at": [12.4, 30.1], "small": [[3.6, 6.2]], "hide": [[0.0, 3.6]]}
//        words → every occurrence becomes yellow serif italic;  at → the word spoken at that time (±0.15 s)
//        small → ranges where captions drop to the small "aside" size;  hide → ranges with no captions
//        (use hide while a phrase stack or takeover carries the words itself)
// - __DUR__ : clean.mp4 duration;  __CAP_TOP__ : reel.json {"capTop": 1040}
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const t = JSON.parse(readFileSync("assets/transcript.json", "utf8"));
const dur = t.audio_duration_secs;
const fix = existsSync("assets/caption-fixes.json") ? JSON.parse(readFileSync("assets/caption-fixes.json", "utf8")) : {};
const em = { words: [], at: [], small: [], hide: [], ...(existsSync("assets/emphasis.json") ? JSON.parse(readFileSync("assets/emphasis.json", "utf8")) : {}) };
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9%]/g, "");
const emWords = new Set(em.words.map(norm));
const inRange = (x, rs) => rs.some(([a, b]) => x >= a && x < b);

// ---- words (merge Whisper splits like "e" + "-mail" and "100" + "%")
const words = [];
for (let i = 0; i < t.words.length; i++) {
  const w = t.words[i], n = t.words[i + 1];
  if (n && (n.text.startsWith("-") || n.text === "%")) { words.push({ text: w.text + n.text, start: w.start, end: n.end }); i++; continue; }
  const txt = w.text in fix ? fix[w.text] : w.text;
  if (txt) words.push({ text: txt, start: w.start, end: w.end });
}

// ---- one caption clip per word (from its onset until the next word, max 1.0 s)
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const caps = words.map((w, i) => {
  if (inRange(w.start, em.hide)) return "";
  const next = words[i + 1] ? words[i + 1].start : dur;
  const d = Math.min(next - w.start, 1.0);
  if (d <= 0.01) return "";
  const cls = ["w", "clip"];
  if (emWords.has(norm(w.text)) || em.at.some((x) => Math.abs(x - w.start) <= 0.15)) cls.push("em");
  if (inRange(w.start, em.small)) cls.push("sm");
  return `<div class="${cls.join(" ")}" id="w${i}" data-start="${w.start.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="5">${esc(w.text.toLowerCase())}</div>`;
}).join("\n");

const cfg = { capTop: 1040, ...(existsSync("reel.json") ? JSON.parse(readFileSync("reel.json", "utf8")) : {}) };
const html = readFileSync("src/index.template.html", "utf8").replaceAll("__DUR__", dur.toFixed(3)).replace("__CAPTIONS__", caps).replace("__CAP_TOP__", String(cfg.capTop));
writeFileSync("index.html", html);
const meta = JSON.parse(readFileSync("meta.json", "utf8"));
Object.assign(meta, { id: "reel", width: 1080, height: 1920, fps: 30 });
writeFileSync("meta.json", JSON.stringify(meta, null, 2));
console.log(`index.html built — ${dur.toFixed(2)}s, ${words.length} caption words`);
