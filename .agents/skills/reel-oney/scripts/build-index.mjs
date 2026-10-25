// Build <project>/index.html from src/index.template.html.
// Run in the project root:  node <skill>/scripts/build-index.mjs
// - __CAPTIONS__ : word-by-word caption clips from assets/transcript.json
//                  (fixes in assets/caption-fixes.json: {"wrong": "right", "drop-me": ""})
// - __DUR__      : clean.mp4 duration;  __CAP_TOP__ : from reel.json {"capTop": 1380}
// - every emoji anywhere in the template → <img class="emo"> with Apple's artwork (cached in the skill)
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const t = JSON.parse(readFileSync("assets/transcript.json", "utf8"));
const dur = t.audio_duration_secs;
const fix = existsSync("assets/caption-fixes.json") ? JSON.parse(readFileSync("assets/caption-fixes.json", "utf8")) : {};

// ---- words (merge Whisper splits like "e" + "-mail" and "100" + "%")
const words = [];
for (let i = 0; i < t.words.length; i++) {
  const w = t.words[i], n = t.words[i + 1];
  if (n && (n.text.startsWith("-") || n.text === "%")) { words.push({ text: w.text + n.text, start: w.start, end: n.end }); i++; continue; }
  const txt = w.text in fix ? fix[w.text] : w.text;
  if (txt) words.push({ text: txt, start: w.start, end: w.end });
}

// ---- one caption clip per word (shown from its onset until the next word, max 1.2 s)
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const caps = words.map((w, i) => {
  const next = words[i + 1] ? words[i + 1].start : dur;
  const d = Math.min(next - w.start, 1.2);
  if (d <= 0.01) return "";
  return `<div class="w clip" id="w${i}" data-start="${w.start.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="5">${esc(w.text)}</div>`;
}).join("\n");

// Per-video layout knobs (reel.json): capTop = caption block top in px — sit it on the chest, just under the chin.
const cfg = { capTop: 1380, ...(existsSync("reel.json") ? JSON.parse(readFileSync("reel.json", "utf8")) : {}) };
let html = readFileSync("src/index.template.html", "utf8").replaceAll("__DUR__", dur.toFixed(3)).replace("__CAPTIONS__", caps).replace("__CAP_TOP__", String(cfg.capTop));

// ---- Apple emoji: replace every emoji sequence with a local PNG (iPhone keyboard artwork)
const cache = join(skill, "emoji-cache");
mkdirSync(cache, { recursive: true });
mkdirSync("assets/emoji", { recursive: true });
const re = /(\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*|[\u{1F1E6}-\u{1F1FF}]{2})/gu;
const inTags = (s, idx) => s.lastIndexOf("<", idx) > s.lastIndexOf(">", idx); // inside an attribute/tag → leave it
html = html.replace(re, (m, _a, _b, idx, s) => {
  if (inTags(s, idx) || s.lastIndexOf("<script", idx) > s.lastIndexOf("</script>", idx)) return m;
  const code = [...m].map((c) => c.codePointAt(0).toString(16)).filter((c) => c !== "fe0f").join("-");
  const file = join(cache, `${code}.png`);
  if (!existsSync(file)) execFileSync("curl", ["-sfL", "-o", file, `https://emojicdn.elk.sh/${encodeURIComponent(m)}?style=apple`]);
  copyFileSync(file, `assets/emoji/${code}.png`);
  return `<img class="emo" src="assets/emoji/${code}.png" alt="">`;
});

writeFileSync("index.html", html);
const meta = JSON.parse(readFileSync("meta.json", "utf8"));
Object.assign(meta, { id: "reel", width: 1080, height: 1920, fps: 30 });
writeFileSync("meta.json", JSON.stringify(meta, null, 2));
console.log(`index.html built — ${dur.toFixed(2)}s, ${words.length} caption words`);
