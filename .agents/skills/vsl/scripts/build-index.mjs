// Monta <projeto>/index.html a partir de src/index.template.html + src/beats.js + assets/transcript.json + vsl.json.
// Rode na raiz do projeto:  node ../../.claude/skills/vsl/scripts/build-index.mjs
// - Recopia kit.js / kit.css / fonts / sfx da skill para assets/ (o kit evolui na skill, o projeto acompanha).
// - Se existir assets/matte.webm (scripts/matte.py), liga o "texto atrás da cabeça".
// - vsl.json: {"theme":"roxo"|"laranja", "font":"padrao"|"advercase", "punch":1.22,"face":{x,y,w,h},"head":{x,y},"capY":1500,"music":{"file":"music.mp3","start":19,"volume":0.18}, ...}
import { readFileSync, writeFileSync, existsSync, cpSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skill = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const T = join(skill, "template");
const read = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);

mkdirSync("assets", { recursive: true });
for (const f of ["kit.js", "kit.css", "gsap.min.js"]) cpSync(join(T, f), join("assets", f));
cpSync(join(T, "fonts"), join("assets", "fonts"), { recursive: true });
if (existsSync(join(T, "sfx"))) cpSync(join(T, "sfx"), join("assets", "sfx"), { recursive: true });
if (!existsSync("src/index.template.html")) { mkdirSync("src", { recursive: true }); cpSync(join(T, "index.template.html"), "src/index.template.html"); }
if (!existsSync("src/beats.js")) cpSync(join(T, "beats.example.js"), "src/beats.js");

const t = JSON.parse(readFileSync("assets/transcript.json", "utf8"));
const cfg = read("vsl.json", {});
const dur = +(cfg.dur || t.audio_duration_secs).toFixed(3);
cfg.dur = dur;
// correções de transcrição (nomes/termos que o Whisper erra): assets/caption-fixes.json {"errado": "certo"}
const fix = read("assets/caption-fixes.json", {});
const fixW = (s) => { if (s in fix) return fix[s]; const m = s.match(/^(.*?)([.,!?;:]*)$/); return m && m[1] in fix ? fix[m[1]] + m[2] : s; };
const words = t.words.map((w) => ({ text: fixW(w.text), start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));
const face = existsSync("assets/face-track.json") ? JSON.parse(readFileSync("assets/face-track.json", "utf8")) : null;

const matte = existsSync("assets/matte.webm")
  ? `<div class="lens" id="lensMatte"><video id="matte" src="assets/matte.webm" data-start="0" data-duration="${dur}" data-track-index="2" muted playsinline></video></div>`
  : "<!-- sem assets/matte.webm: texto 'atrás da cabeça' fica na frente (rode scripts/matte.py) -->";
let music = "";
if (cfg.music && existsSync(join("assets", cfg.music.file))) {
  const s = cfg.music.start || 0;
  music = `<audio id="music" src="assets/${cfg.music.file}" data-start="${s}" data-duration="${(dur - s).toFixed(3)}" data-track-index="3" data-volume="${cfg.music.volume ?? 0.18}"></audio>`;
}
const beats = readFileSync("src/beats.js", "utf8");
const html = readFileSync("src/index.template.html", "utf8")
  .replaceAll("__DUR__", String(dur)).replace("__CFG__", JSON.stringify(cfg)).replace("__WORDS__", JSON.stringify(words)).replace("__FACE__", JSON.stringify(face))
  .replace("__CLASS__", `t-${cfg.theme || "roxo"} f-${cfg.font || "padrao"}`)
  .replace("__MATTE__", matte).replace("__MUSIC__", music).replace("__BEATS__", beats);
writeFileSync("index.html", html);
const meta = read("meta.json", {});
Object.assign(meta, { id: "vsl", width: 1080, height: 1920, fps: 30 });
writeFileSync("meta.json", JSON.stringify(meta, null, 2));
console.log(`index.html ok — ${dur}s, ${words.length} palavras, matte: ${existsSync("assets/matte.webm") ? "sim" : "NÃO"}, música: ${music ? "sim" : "não"}`);
