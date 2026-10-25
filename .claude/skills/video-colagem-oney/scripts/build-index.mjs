// Build <project>/index.html from src/index.template.html (video-colagem-oney look).
// Run in the project root:  node <skill>/scripts/build-index.mjs
// - __CAPTIONS__ : Saab-style captions from assets/transcript.json — SHORT chunks (≤ 3 words / 18 chars),
//     hard swap, under the chin. Breaks on punctuation and pauses > 0.25 s.
//     assets/emphasis.json  [{"words": "piores erros", "color": "red"}]  → that exact word run becomes its own BIG chunk
//       (colors: red | blue | yel | white). Match is case/accents-insensitive on the spoken words.
//     assets/caption-fixes.json  {"Bande": "Band"} or [{"at": 36.0, "text": ""}] (time-pinned, "" drops the word)
// - __SFX__ : <audio> clips from assets/sfx.json  [{"t": 2.43, "f": "whoosh", "v": 0.5}]  (files in assets/sfx/<f>.wav);
//     tracks are assigned so clips on one track never overlap.
// - every emoji in the template → <img class="emo"> with Apple's artwork (shared cache in reel-oney/emoji-cache).
// - __DUR__ : clean.mp4 duration (transcript audio_duration_secs).
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skill = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8").replace(/^﻿/, "")) : d);
const t = read("assets/transcript.json");
const dur = t.audio_duration_secs;

// Guard: every derived media must come from THIS clean.mp4 (a stale fg.webm after a re-cut = a ghost layer on top).
const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
for (const f of ["assets/fg.webm"]) if (existsSync(f) && existsSync("assets/clean.mp4")) {
  const a = probe(f), b = probe("assets/clean.mp4");
  if (Math.abs(a - b) > 0.1) { console.error(`STOP: ${f} (${a.toFixed(2)}s) does not match clean.mp4 (${b.toFixed(2)}s). Re-run matte-person.py after a re-cut.`); process.exit(1); }
}
const fixes = read("assets/caption-fixes.json", {});
const emph = read("assets/emphasis.json", []);
const sfx = read("assets/sfx.json", []);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

// ---- words + fixes
let words = t.words.map((w) => ({ ...w }));
if (Array.isArray(fixes)) for (const f of fixes) { const w = words.find((x) => Math.abs(x.start - f.at) < 0.08); if (w) w.text = f.text; }
else words.forEach((w) => { if (w.text in fixes) w.text = fixes[w.text]; });
words = words.filter((w) => w.text);

// ---- mark emphasis runs
const marks = new Array(words.length).fill(null);
for (const e of emph) {
  const seq = e.words.split(/\s+/).map(norm);
  for (let i = 0; i + seq.length <= words.length; i++) {
    if (seq.every((s, k) => norm(words[i + k].text) === s) && (e.at == null || Math.abs(words[i].start - e.at) < 1)) {
      for (let k = 0; k < seq.length; k++) marks[i + k] = { id: e.words + i, color: e.color || "white" };
      if (e.at != null) break;
    }
  }
}

// ---- chunk
const chunks = [];
let cur = null;
const flush = () => { if (cur) chunks.push(cur); cur = null; };
for (let i = 0; i < words.length; i++) {
  const w = words[i], m = marks[i];
  if (m) {
    if (!cur || cur.mark?.id !== m.id) { flush(); cur = { text: w.text, start: w.start, end: w.end, mark: m }; }
    else { cur.text += " " + w.text; cur.end = w.end; }
    if (!marks[i + 1] || marks[i + 1].id !== m.id) flush();
    continue;
  }
  if (cur && (cur.mark || w.start - cur.end > 0.25 || cur.n >= 3 || (cur.text + " " + w.text).length > 18)) flush();
  if (!cur) cur = { text: w.text, start: w.start, end: w.end, n: 1 };
  else { cur.text += " " + w.text; cur.end = w.end; cur.n++; }
  if (/[.!?,;:]$/.test(w.text)) flush();
}
flush();
const caps = chunks.map((c, i) => {
  const next = chunks[i + 1] ? chunks[i + 1].start : dur;
  const d = Math.min(next, c.end + 0.45) - c.start;
  if (d <= 0.04) return "";
  const cls = ["c", "clip"]; if (c.mark) cls.push("big", c.mark.color);
  const txt = c.text.replace(/[,;:]$/, "").replace(/\.$/, "");
  return `<div class="${cls.join(" ")}" id="c${i}" data-start="${c.start.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="60">${esc(c.mark ? txt.toUpperCase() : txt)}</div>`;
}).join("\n");

// ---- SFX tracks
const ends = [];
const sfxHtml = sfx.map((s, i) => {
  const f = `assets/sfx/${s.f}.wav`;
  const len = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
  let tr = ends.findIndex((e) => e <= s.t); if (tr < 0) { tr = ends.length; ends.push(0); } ends[tr] = s.t + len + 0.02;
  return `  <audio id="sfx${i}" src="${f}" data-start="${s.t.toFixed(3)}" data-duration="${len.toFixed(3)}" data-track-index="${70 + tr}" data-volume="${s.v ?? 0.5}"></audio>`;
}).join("\n");

// ---- build + Apple emoji
let html = readFileSync("src/index.template.html", "utf8")
  .replaceAll("__DUR__", dur.toFixed(3)).replace("__CAPTIONS__", caps).replace("__SFX__", sfxHtml);
const cache = join(skill, "..", "reel-oney", "emoji-cache");
mkdirSync("assets/emoji", { recursive: true });
const re = /(\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*️?|[\u{1F1E6}-\u{1F1FF}]{2})/gu;
const [head, body] = [html.slice(0, html.indexOf("<body>")), html.slice(html.indexOf("<body>"))];
const scriptAt = body.indexOf("<script>");
const swap = (s) => s.replace(re, (m) => {
  const code = [...m].map((c) => c.codePointAt(0).toString(16)).filter((c) => c !== "fe0f").join("-");
  const file = join(cache, `${code}.png`);
  if (!existsSync(file)) execFileSync("curl", ["-sfL", "-o", file, `https://emojicdn.elk.sh/${encodeURIComponent(m)}?style=apple`]);
  copyFileSync(file, `assets/emoji/${code}.png`);
  return `<img class="emo" src="assets/emoji/${code}.png" alt="">`;
});
html = head + swap(body.slice(0, scriptAt)) + body.slice(scriptAt);
writeFileSync("index.html", html);
const meta = read("meta.json", {});
Object.assign(meta, { id: "reel", width: 1080, height: 1920, fps: 30 });
writeFileSync("meta.json", JSON.stringify(meta, null, 2));
console.log(`index.html built — ${dur.toFixed(2)}s, ${chunks.length} caption chunks (${chunks.filter((c) => c.mark).length} big), ${sfx.length} sfx on ${ends.length} tracks`);
