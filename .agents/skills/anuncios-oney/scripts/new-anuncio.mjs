// Scaffold an ad project from a phone recording and transcribe it.
// Run from the kit root:  node .claude/skills/anuncios-oney/scripts/new-anuncio.mjs "<video path>" <slug>
// Creates video-projects/<slug>/ with assets/raw.mp4 (1080x1920 30fps), assets/raw.json (word timings),
// assets/words.txt (readable word/time dump with pauses), fonts, src/index.template.html.
import { execFileSync } from "node:child_process";
import { videoEncoder, HWDEC } from "./encoder.mjs";
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
const PY = process.env.WHISPER_PYTHON || join(homedir(), ".venvs", "whisper", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");

const [src, slug] = process.argv.slice(2);
if (!src || !slug) { console.error('usage: new-reel.mjs "<video>" <slug>'); process.exit(1); }
const skill = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const proj = resolve("video-projects", slug);
if (!existsSync(proj)) execFileSync(process.execPath, ["scripts/new-video.mjs", slug], { stdio: "inherit" });
mkdirSync(join(proj, "src"), { recursive: true });
cpSync(join(skill, "template", "fonts"), join(proj, "assets", "fonts"), { recursive: true });
// default structure: headline in the first 5 s, then schematics (esquemas). The older text-beat ad stays as classico.template.html.
if (!existsSync(join(proj, "src", "index.template.html"))) cpSync(join(skill, "template", "esquemas.template.html"), join(proj, "src", "index.template.html"));
cpSync(join(skill, "template", "index.template.html"), join(proj, "src", "classico.template.html"));
cpSync(join(skill, "template", "DESIGN.md"), join(proj, "DESIGN.md"));
// placeholder imagery used by the templates — replace with the student's own per ad
cpSync(join(skill, "template", "example-img"), join(proj, "assets", "img"), { recursive: true });

const a = join(proj, "assets");
if (!existsSync(join(a, "raw.mp4"))) {
  console.log("transcoding…");
  // ffmpeg applies the phone's rotation flag, so the output is upright 1080x1920
  execFileSync("ffmpeg", ["-y", "-v", "error", ...HWDEC, "-i", src, "-map", "0:v:0", "-map", "0:a:0", "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
    ...videoEncoder(), "-r", "30", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", join(a, "raw.mp4")], { stdio: "inherit" });
}
// a frame of the raw recording for the "bruto" phone cards in the schematics
if (!existsSync(join(a, "img", "bruto.jpg"))) execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", "3", "-i", join(a, "raw.mp4"), "-frames:v", "1", "-vf", "scale=360:640", "-q:v", "3", join(a, "img", "bruto.jpg")]);
console.log("transcribing (Whisper local — na primeira vez baixa o modelo, demora)…");
execFileSync(PY, [join(skill, "scripts", "transcribe-local-whisper.py"), join(a, "raw.mp4"), join(a, "raw.json"), "--fast"],
  { stdio: ["ignore", "inherit", "ignore"], env: { ...process.env, PYTHONIOENCODING: "utf-8" } });

const t = JSON.parse(readFileSync(join(a, "raw.json"), "utf8"));
let out = "", line = "", ls = 0, prev = 0;
for (const w of t.words) {
  if (w.start - prev > 0.5 || line.length > 90) { if (line) out += `${ls.toFixed(2).padStart(7)} ${line}\n`; if (w.start - prev > 0.5) out += `        --- pause ${(w.start - prev).toFixed(1)}s\n`; line = ""; ls = w.start; }
  line += `${w.text}@${w.start.toFixed(2)} `; prev = w.end;
}
out += `${ls.toFixed(2).padStart(7)} ${line}\n`;
writeFileSync(join(a, "words.txt"), out);
console.log(`ready: ${proj}  (duration ${t.audio_duration_secs}s, ${t.words.length} words; see assets/words.txt)`);
