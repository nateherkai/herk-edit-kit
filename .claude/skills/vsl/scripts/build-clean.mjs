// Vídeo completo "clean + skin por profissão": gera final/index.html a partir de src/index.template.html.
// - WORDS/FACE injetados (transcript/face-track já re-timados para final-base.mp4), correções de legenda
// - emojis → artwork da Apple (cache da skill reel-oney); tempos das 4 transições calculados das palavras
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillCache = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "reel-oney", "emoji-cache");
mkdirSync(skillCache, { recursive: true });
mkdirSync("assets/emoji", { recursive: true });
const re = /(\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*|[\u{1F1E6}-\u{1F1FF}]{2})/gu;
const emo = (m) => {
  const code = [...m].map((c) => c.codePointAt(0).toString(16)).filter((h) => h !== "fe0f").join("-");
  const file = join(skillCache, code + ".png");
  if (!existsSync(file)) execFileSync("curl", ["-sfL", "-o", file, `https://emojicdn.elk.sh/${encodeURIComponent(m)}?style=apple`]);
  copyFileSync(file, `assets/emoji/${code}.png`);
  return `<img class="emo" src="assets/emoji/${code}.png" alt="">`;
};

const FIX = { Cloud: "Claude" };
const t = JSON.parse(readFileSync("assets/transcript.json", "utf8"));
t.words = t.words.map((w) => { const m = w.text.match(/^(.*?)([.,!?;:…]*)$/); const b = m ? m[1] : w.text; return { ...w, text: (FIX[b] || b) + (m ? m[2] : "") }; });
const dur = +t.audio_duration_secs.toFixed(3);
const face = JSON.parse(readFileSync("assets/face-track.json", "utf8"));
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9%]+/g, " ").trim();
const WN = t.words.map((w) => ({ n: norm(w.text), s: w.start })).filter((w) => w.n);
const at = (phrase) => { const p = norm(phrase).split(" "); for (let i = 0; i <= WN.length - p.length; i++) { let ok = true; for (let j = 0; j < p.length; j++) if (WN[i + j].n !== p[j]) { ok = false; break; } if (ok) return WN[i].s; } throw new Error("frase: " + phrase); };
// transições centradas no corte do vídeo (início de cada clipe da Higgsfield e volta ao original)
const TR = { "alpha-1": [0.466, 0.458], "alpha-2": [0.300, 0.292], "alpha-00": [0.433, 0.416] }; // [vídeo, áudio]
const cuts = [
  ["med", at("explicar") - 0.04, "alpha-1"],
  ["adv", at("ou pode ser") - 0.04, "alpha-2"],
  ["nut", at("ou eu posso") - 0.04, "alpha-1"],
  ["back", at("enfim") - 0.14, "alpha-00"],
];
let transHtml = "";
for (const [k, tc, f] of cuts) {
  const [dv, da] = TR[f], s = (tc - dv * 0.45).toFixed(3);
  transHtml += `<video id="trans-${k}" class="trans" src="assets/trans/${f}.webm" data-start="${s}" data-duration="${dv}" data-track-index="2" muted playsinline></video>\n`;
  transHtml += `<audio id="sfx-trans-${k}" src="assets/trans/${f}.wav" data-start="${s}" data-duration="${da}" data-track-index="3" data-volume="0.45"></audio>\n`;
}
let html = readFileSync("src/index.template.html", "utf8")
  .replaceAll("__DUR__", String(dur))
  .replace("__TRANS__", transHtml)
  .replace("__WORDS__", JSON.stringify(t.words))
  .replace("__FACE__", JSON.stringify(face));
html = html.replace(re, emo);
writeFileSync("index.html", html);
const tops = face.rows.map((r) => r[face.cols.indexOf("top")]);
console.log(`index.html ok — ${dur}s, ${t.words.length} palavras, cabeça min/máx ${Math.min(...tops).toFixed(0)}/${Math.max(...tops).toFixed(0)}, cortes: ${cuts.map(([k, tc]) => `${k}@${tc.toFixed(2)}`).join(" ")}`);
