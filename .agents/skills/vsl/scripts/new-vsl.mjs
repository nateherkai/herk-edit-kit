// Cria um projeto VSL roxo a partir de uma gravação e transcreve.
// Rode na raiz do kit:  node .claude/skills/vsl/scripts/new-vsl.mjs "<video>" <slug>
// Cria video-projects/<slug>/ com assets/raw.mp4 (1080x1920 30fps), assets/raw.json, assets/words.txt,
// src/index.template.html, src/beats.js (exemplo), vsl.json e DESIGN.md.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const [src, slug] = process.argv.slice(2);
if (!src || !slug) { console.error('uso: new-vsl.mjs "<video>" <slug>'); process.exit(1); }
const skill = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const T = join(skill, "template");
const proj = resolve("video-projects", slug);
if (!existsSync(proj)) execFileSync(process.execPath, ["scripts/new-video.mjs", slug], { stdio: "inherit" });
mkdirSync(join(proj, "src"), { recursive: true });
if (!existsSync(join(proj, "src", "index.template.html"))) cpSync(join(T, "index.template.html"), join(proj, "src", "index.template.html"));
if (!existsSync(join(proj, "src", "beats.js"))) cpSync(join(T, "beats.example.js"), join(proj, "src", "beats.js"));
if (!existsSync(join(proj, "vsl.json"))) writeFileSync(join(proj, "vsl.json"), JSON.stringify({ punch: 1.22, capY: 1500 }, null, 2));
cpSync(join(T, "DESIGN.md"), join(proj, "DESIGN.md"));

const a = join(proj, "assets");
if (!existsSync(join(a, "raw.mp4"))) {
  console.log("transcodificando para 1080x1920 30fps…");
  const enc = (v) => ["-y", "-v", "error", "-i", src, "-map", "0:v:0", "-map", "0:a:0?",
    "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", ...v,
    "-r", "30", "-g", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", join(a, "raw.mp4")];
  try { execFileSync("ffmpeg", enc(["-c:v", "h264_nvenc", "-preset", "p5", "-cq", "18"]), { stdio: "inherit" }); } // placa NVIDIA
  catch { execFileSync("ffmpeg", enc(["-c:v", "libx264", "-preset", "veryfast", "-crf", "18"]), { stdio: "inherit" }); } // sem NVIDIA
}
console.log("transcrevendo (Whisper local)…");
const PY = join(homedir(), ".venvs", "whisper", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
execFileSync(PY, [join(skill, "..", "reel-editorial-oney", "scripts", "transcribe-local-whisper.py"), join(a, "raw.mp4"), join(a, "raw.json")],
  { stdio: ["ignore", "inherit", "ignore"], env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
const t = JSON.parse(readFileSync(join(a, "raw.json"), "utf8"));
let out = "", line = "", ls = 0, prev = 0;
for (const w of t.words) {
  if (w.start - prev > 0.5 || line.length > 90) { if (line) out += `${ls.toFixed(2).padStart(7)} ${line}\n`; if (w.start - prev > 0.5) out += `        --- pausa ${(w.start - prev).toFixed(1)}s\n`; line = ""; ls = w.start; }
  line += `${w.text}@${w.start.toFixed(2)} `; prev = w.end;
}
out += `${ls.toFixed(2).padStart(7)} ${line}\n`;
writeFileSync(join(a, "words.txt"), out);
console.log(`pronto: ${proj}  (${t.audio_duration_secs}s, ${t.words.length} palavras — veja assets/words.txt)`);
