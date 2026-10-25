// "Testar de verdade": turn a look (the same JSON the wizard saves) into a real HyperFrames composition
// and capture PNG snapshots of it with `npx hyperframes snapshot`. The composition reuses the exact render
// functions of looks.mjs (server-side, they only build HTML strings) and serialises their GSAP `anim` closures
// into the page, so what HyperFrames renders is the same markup the wizard previews — now with real fonts,
// real pixels and the real clip.
import { mkdirSync, copyFileSync, existsSync, writeFileSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execFileSync } from "node:child_process";
import { COLOURS, FONTS, HOOKS, CAPTIONS, ELEMENTS, MOTIONS, ldsCaption } from "./looks.mjs";
import "./looks.zee.mjs";
import "./looks.castilho.mjs";
import { AJ_RUNTIME } from "./looks.ajene.mjs";
import { AL_RUNTIME } from "./looks.altra.mjs";
import { LAYER_CSS, hasBack } from "./layers.mjs";
import { createHash } from "node:crypto";
import "./looks.tenfold.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const FONT_FILES = ["Advercase-Regular.woff2", "Advercase-Bold.woff2", "Inter-SemiBold.ttf", "Inter-Medium.ttf", "Inter-Regular.ttf", "InstrumentSerif-Italic.woff2", "Caveat-Bold.woff2", "Anybody.ttf", "PlusJakartaSans.ttf", "JetBrainsMono.ttf"];
const FONT_DIRS = ["reel-oney", "reel-editorial-oney", "reel-explicativo-oney", "vsl", "anuncios-oney"].map((s) => join(root, ".claude/skills", s, "template/fonts"));
const byId = (arr, id) => arr.find((x) => x.id === id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const FONT_FACES = `
@font-face{font-family:"Advercase";src:url("assets/fonts/Advercase-Regular.woff2") format("woff2");font-weight:400}
@font-face{font-family:"Advercase";src:url("assets/fonts/Advercase-Bold.woff2") format("woff2");font-weight:700}
@font-face{font-family:"EdSans";src:url("assets/fonts/Inter-SemiBold.ttf") format("truetype");font-weight:600}
@font-face{font-family:"EdSans";src:url("assets/fonts/Inter-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Inter";src:url("assets/fonts/Inter-Regular.ttf") format("truetype");font-weight:400}
@font-face{font-family:"Inter";src:url("assets/fonts/Inter-Medium.ttf") format("truetype");font-weight:500}
@font-face{font-family:"Inter";src:url("assets/fonts/Inter-SemiBold.ttf") format("truetype");font-weight:600 800}
@font-face{font-family:"EdSerif";src:url("assets/fonts/InstrumentSerif-Italic.woff2") format("woff2");font-style:italic;font-weight:400}
@font-face{font-family:"Caveat";src:url("assets/fonts/Caveat-Bold.woff2") format("woff2");font-weight:700}
@font-face{font-family:"Anybody";src:url("assets/fonts/Anybody.ttf") format("truetype");font-weight:100 900;font-stretch:50% 150%}
@font-face{font-family:"Plus Jakarta Sans";src:url("assets/fonts/PlusJakartaSans.ttf") format("truetype");font-weight:200 800}
@font-face{font-family:"JetBrains Mono";src:url("assets/fonts/JetBrainsMono.ttf") format("truetype");font-weight:100 800}`;

// Rebuild the renderer state (what the wizard calls S()) from a saved look.
export function stateFromLook(look) {
  const c = byId(COLOURS, look.colours?.id) || COLOURS[0];
  const f = byId(FONTS, look.fonts?.id) || FONTS[0];
  const W = look.canvas?.width || 1080, H = look.canvas?.height || 1920;
  const text = { hook1: "Larguei meu emprego?", hook2: "a parte que ninguém conta", words: ["isso", "era", "o", "sonho"], keyword: "sonho", note: "eu quase desisti aqui", comment: "quero esse estilo!", user: "seu_usuario", ...(look.sampleText || {}) };
  // fonts from the user's folder override roles (copied into the test project by buildTestProject)
  const font = { ...f };
  for (const [role, uf] of Object.entries(look.userFonts || look.fonts?.custom || {})) { if (!uf || !uf.file) continue; font[role] = `'uf-${uf.id}',${f[role] || f.display}`; if (role === "display") font.dw = 400; if (role === "body") font.bw = 400; }
  return { v: { ...c.vars, ...(look.colours || {}) }, font, text, W, H, landscape: W > H, headTop: look.framing?.headTop ?? 620, capTop: look.framing?.capTop ?? 1150, ldsIn: look.captions?.lds?.entradaId || look.ldsEntrada || null };
}
function userFontFaces(look, dir) {
  const out = [];
  for (const [, uf] of Object.entries(look.userFonts || look.fonts?.custom || {})) {
    if (!uf || !uf.file || !existsSync(uf.file)) continue;
    const name = "uf-" + uf.id + extname(uf.file).toLowerCase();
    try { copyFileSync(uf.file, join(dir, "assets", "fonts", name)); out.push(`@font-face{font-family:"uf-${uf.id}";src:url("assets/fonts/${name}")}`); } catch {}
  }
  return out.join("\n");
}

function captionOf(look) {
  const id = look.captions?.id; if (!id) return null;
  if (id.startsWith("lds:") && look.captions.lds) return ldsCaption({ id: look.captions.lds.pronto, name: look.captions.lds.prontoName, modelo: look.captions.lds.modelo, entrada: look.captions.lds.entradaPadrao, saida: look.captions.lds.saida });
  return byId(CAPTIONS, id) || null;
}

// Timeline plan: same timing as the wizard's main stage.
export function planFromLook(look, dur) {
  const hook = byId(HOOKS, look.hook?.id), caps = captionOf(look);
  const els = (look.elements || []).map((e) => byId(ELEMENTS, e.id)).filter(Boolean);
  const motions = (look.motion || []).map((m) => byId(MOTIONS, m.id)).filter(Boolean);
  const objM = motions.filter((m) => !m.camera), camM = motions.filter((m) => m.camera);
  // a template scene (looks.ajene.mjs, scene: true) owns the whole clip from 0; other elements queue from 2.9 s as on the stage
  let t = 2.9; const elBeats = els.map((e, i) => { if (e.scene) return { el: e, t0: 0, show: Math.min(e.dur || 15, dur), scene: true, motion: null }; const b = { el: e, t0: +t.toFixed(2), show: e.anim ? 3.3 : 2.9, motion: objM[i % Math.max(1, objM.length)] || byId(MOTIONS, "blur-rise") }; t += e.anim ? 3.2 : 1.5; return b; });
  const sceneDur = Math.max(0, ...elBeats.map((b) => (b.scene ? b.show : 0)));
  const capDt = caps ? (sceneDur ? "spread" : caps.mode === "lds" ? 1.3 : caps.mode === "phrase" ? 1.2 : 0.34) : 0;
  return { hook, caps, capDt, elBeats, camM, dur, sceneDur };
}

export function compositionHtml(look, S, plan, clipRel, clipDur, extraCss = "", matteRel = null) {
  const D = plan.dur;
  const id = "look-test";
  // Layers (see layers.mjs): with a matte the look is written twice. Behind copy (z 1) → cut-out person video (z 2) →
  // front copy (z 3). Each timed wrapper carries its layer class; both copies run the same animation code.
  const layers = matteRel ? [["lb-back", 1, null], ["lb-front", 3, "camT"]] : [["lb-front", 3, "camT"]];
  let track = 1, body = "";
  const wrap = (inner, start, d, layer, z, extra = "") => inner ? `<div class="clip ${layer}" data-start="${start}" data-duration="${d.toFixed(2)}" data-track-index="${track++}" style="position:absolute;inset:0;pointer-events:none;z-index:${z};${extra}">${inner}</div>` : "";
  for (const [layer, z] of layers) {
    body += wrap(plan.hook && plan.hook.id !== "none" ? plan.hook.render(S) : "", 0, Math.min(D, 3.5), layer, z);
    body += wrap(plan.caps ? plan.caps.render(S) : "", 0, D, layer, z + 0.5 > 3 ? 5 : z);
    for (const b of plan.elBeats) body += wrap(b.el.render(S), b.t0 > 0 ? b.t0.toFixed(2) : 0, Math.max(0.5, Math.min(b.show, D - b.t0)), layer, z, `--t0:${b.t0}`);
    if (layer === "lb-back" && matteRel) body += `\n  <div id="camFg"><video data-start="0" data-duration="${Math.min(D, clipDur).toFixed(2)}" data-track-index="${track++}" src="${matteRel}" muted playsinline></video></div>\n`;
  }
  // animation code: closures from looks.mjs serialised verbatim, run once per layer (R = layer selector, C = camera)
  const anims = [];
  if (plan.hook && plan.hook.id !== "none") anims.push(`{ const h = document.querySelector(R + " .hook"); if (h) { (${plan.hook.anim.toString()})(tl, h); tl.to(h, { opacity: 0, duration: 0.25 }, 3.2); } }`);
  if (plan.caps) anims.push(`{ const c = document.querySelector(R + " .caps"); if (c) { const ws = [...c.querySelectorAll(".w")]; const start = 0.3, dt = ${plan.capDt === "spread" ? `Math.max(0.34, (${plan.sceneDur} - start - 0.4) / (ws.length || 1))` : plan.capDt};
    ws.forEach((w, i) => { tl.set(w, { opacity: 1 }, start + i * dt); tl.set(w, { opacity: 0 }, start + (i + 1) * dt); });
    ${plan.caps.mode === "phrase" && !plan.caps.capAnim ? `ws.forEach((x, i) => tl.fromTo(x, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, start + i * dt));` : ""}
    ${plan.caps.capAnim ? `(${plan.caps.capAnim.toString()})(tl, c, start, dt);` : plan.caps.mode === "lds" ? `ws.forEach((x, i) => tl.from([...x.querySelectorAll(".ldw")], { y: 14, opacity: 0, scale: 0.92, duration: 0.22, stagger: 0.18, ease: "back.out(1.6)" }, start + i * dt));` : ""} } }`);
  plan.elBeats.forEach((b, i) => { if (b.scene) { anims.push(`{ const e = document.querySelectorAll(R + " .el")[${i}]; if (e) { const sub = gsap.timeline(); (${b.el.anim.toString()})(sub, e, C); tl.add(sub, 0); } }`); return; } anims.push(`{ const e = document.querySelectorAll(R + " .el")[${i}]; if (e) { const t0 = ${b.t0};
    const sub = gsap.timeline(); (${(b.el.anim || b.motion.anim).toString()})(sub, e, C); tl.add(sub, t0);
    if (e.querySelector(".num,.bar")) { const t = gsap.timeline(); (${byId(MOTIONS, "count-tick").anim.toString()})(t, e); tl.add(t, t0 + 0.2); }
    e.querySelectorAll("path").forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.45 }, t0 + 0.2); });
    const li = e.querySelectorAll(".li,.row,.ch"); if (li.length) tl.from(li, { opacity: 0, y: 10, duration: 0.3, stagger: 0.18 }, t0 + 0.1);
    const strip = e.querySelector(".strip"); if (strip) tl.to(strip, { x: -900, duration: 4, ease: "none" }, t0);
    tl.to(e, { opacity: 0, duration: 0.25 }, t0 + ${b.el.anim ? 3.0 : 2.6}); } }`); });
  const camAnims = plan.camM.map((m, i) => `{ const t = gsap.timeline(); (${m.anim.toString()})(t, null, camT); tl.add(t, ${3 + i * 3}); }`);
  const google = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Figtree:ital,wght@0,600;0,900;1,900&family=Bodoni+Moda:ital,wght@1,400&family=EB+Garamond:ital@0;1&family=Bebas+Neue&family=Fraunces:ital,wght@0,300;0,900;1,900&family=Archivo:wght@400;500;700&family=Playfair+Display:wght@700&family=Space+Mono&display=block">`;
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Look test — ${esc(look.project || "look")}</title>
<script src="assets/gsap.min.js"></script>
${google}
<style>
${FONT_FACES}
${extraCss}
*{box-sizing:border-box}html,body{margin:0;width:${S.W}px;height:${S.H}px;overflow:hidden;background:#000}
#${id}{position:relative;width:${S.W}px;height:${S.H}px;overflow:hidden;background:#000}
#cam,#camFg{position:absolute;inset:0;overflow:hidden;transform-origin:50% 50%}
#cam{z-index:0}#camFg{z-index:2;pointer-events:none}
#cam video,#camFg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ov{position:absolute}
${LAYER_CSS}
</style></head><body>
<div id="${id}" class="${matteRel ? "matte-on" : ""}" data-composition-id="${id}" data-start="0" data-duration="${D}" data-width="${S.W}" data-height="${S.H}">
  <div id="cam"><video data-start="0" data-duration="${Math.min(D, clipDur).toFixed(2)}" data-track-index="0" src="${clipRel}" muted playsinline></video></div>
  ${body}
</div>
<script>
// Generated by tools/look-builder/testbuild.mjs — one paused timeline, registered synchronously.
const tl = gsap.timeline({ paused: true });
const cam = document.getElementById("cam"), camFg = document.getElementById("camFg");
const camT = camFg ? [cam, camFg] : cam;
${plan.elBeats.some((b) => b.scene && !b.el.runtime) ? AJ_RUNTIME : ""}
${plan.elBeats.some((b) => b.el.runtime === "altra") ? AL_RUNTIME : ""}
const runLayer = (R, C) => {
${anims.join("\n")}
};
${layers.map(([layer, , c]) => `runLayer("#${id} .${layer}", ${c || "null"});`).join("\n")}
${camAnims.join("\n")}
tl.to({}, { duration: 0.01 }, ${D});
window.__timelines = window.__timelines || {}; window.__timelines["${id}"] = tl;
</script></body></html>
`;
}

function clipDuration(file) {
  try { return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim()) || 10; } catch { return 10; }
}

// Build the test project. Returns { dir, html, times }.
export function buildTestProject(look, { projectDir, clip, from = 0, dur = 8 }) {
  const dir = join(projectDir, "look-test");
  mkdirSync(join(dir, "assets", "fonts"), { recursive: true });
  const gsap = join(root, "node_modules/gsap/dist/gsap.min.js");
  if (!existsSync(gsap)) throw new Error("gsap não encontrado: rode npm ci na raiz do kit");
  copyFileSync(gsap, join(dir, "assets", "gsap.min.js"));
  for (const f of FONT_FILES) for (const d of FONT_DIRS) { const p = join(d, f); if (existsSync(p)) { copyFileSync(p, join(dir, "assets", "fonts", f)); break; } }
  // Excerpt of the clip (stream copy, fast) so the test project is self-contained and small.
  const total = clipDuration(clip);
  const start = Math.max(0, Math.min(from, Math.max(0, total - dur)));
  const out = join(dir, "assets", "clip" + (extname(clip).toLowerCase() === ".webm" ? ".webm" : ".mp4"));
  try { execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", String(start), "-i", clip, "-t", String(dur + 0.5), "-c", "copy", "-movflags", "+faststart", out], { stdio: "ignore" }); }
  catch { execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", String(start), "-i", clip, "-t", String(dur + 0.5), "-an", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23", "-pix_fmt", "yuv420p", out], { stdio: "ignore" }); }
  const clipDur = Math.min(dur, clipDuration(out));
  const S = stateFromLook(look);
  const plan = planFromLook(look, dur);
  const clipRel = "assets/" + out.split(/[\\/]/).pop(), fonts = userFontFaces(look, dir);
  const writeHtml = (matteRel = null) => writeFileSync(join(dir, "index.html"), compositionHtml(look, S, plan, clipRel, clipDur, fonts, matteRel));
  writeHtml();
  // does any part of the look pass behind the person? then the server cuts the person out of this excerpt
  const needsMatte = hasBack((plan.hook ? plan.hook.render(S) : "") + plan.elBeats.map((b) => b.el.render(S)).join(""));
  const matteKey = createHash("sha1").update([clip, statSync(clip).mtimeMs, start, dur].join("|")).digest("hex").slice(0, 12);
  writeFileSync(join(dir, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" } }, null, 2) + "\n");
  // Frames worth looking at: hook, first captions, each element entrance (+0.5 s), a late frame.
  const times = plan.sceneDur ? [1.5, 4.5, 8.5, 12.5, 14.5] : [0.9, 1.9, ...plan.elBeats.map((b) => +(b.t0 + 0.6).toFixed(2))];
  if (!plan.elBeats.length) times.push(4.5, 6.5);
  return { dir, times: [...new Set(times.filter((t) => t < dur))].sort((a, b) => a - b), start, needsMatte, matteKey, clipFile: out, writeHtml };
}

// Run `npx hyperframes snapshot` on the test project. Resolves with the PNG file names.
// Cut the person out of the test excerpt with `hyperframes remove-background` (local model, transparent WebM).
// Cached per clip + excerpt in assets/matte-<key>.webm, so the next test of the same moment is instant.
export function ensureMatte(dir, clipFile, key, { timeoutMs = 15 * 60 * 1000, onData = null } = {}) {
  const name = `matte-${key}.webm`, outFile = join(dir, "assets", name);
  if (existsSync(outFile) && statSync(outFile).size > 1000) return Promise.resolve({ rel: "assets/" + name, cached: true });
  for (const f of readdirSync(join(dir, "assets"))) if (/^matte-.*\.webm$/i.test(f)) rmSync(join(dir, "assets", f), { force: true });
  const cli = hyperframesCli();
  const args = ["remove-background", clipFile, "-o", outFile, "--quality", "balanced"];
  return new Promise((ok, fail) => {
    const child = cli ? spawn(process.execPath, [cli, ...args], { cwd: root, windowsHide: true })
      : spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["hyperframes", ...args], { cwd: root, shell: process.platform === "win32", windowsHide: true });
    let log = "";
    child.stdout.on("data", (d) => { log += d; if (onData) onData(String(d)); }); child.stderr.on("data", (d) => { log += d; if (onData) onData(String(d)); });
    const timer = setTimeout(() => { child.kill(); fail(new Error("o recorte demorou demais\n" + log.slice(-600))); }, timeoutMs);
    child.on("error", (e) => { clearTimeout(timer); fail(e); });
    child.on("close", (code) => { clearTimeout(timer); existsSync(outFile) && statSync(outFile).size > 1000 ? ok({ rel: "assets/" + name, cached: false, log: log.slice(-800) }) : fail(new Error(`remove-background saiu com código ${code}\n` + log.slice(-1200))); });
  });
}
function hyperframesCli() {
  const bin = join(root, "node_modules", "hyperframes", "package.json");
  if (!existsSync(bin)) return null;
  const cli = join(root, "node_modules", "hyperframes", JSON.parse(readFileSync(bin, "utf8")).bin?.hyperframes || "dist/cli.js");
  return existsSync(cli) ? cli : null;
}
export function runSnapshot(dir, times, { timeoutMs = 180000, onData = null } = {}) {
  const outDir = join(dir, "snapshots");
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  // Call the local CLI entry directly with node: no npx, no shell, no quoting problems with spaces in paths.
  const bin = join(root, "node_modules", "hyperframes", "package.json");
  const cli = existsSync(bin) ? join(root, "node_modules", "hyperframes", JSON.parse(readFileSync(bin, "utf8")).bin?.hyperframes || "dist/cli.js") : null;
  const args = ["snapshot", dir, "--at", times.join(","), "--no-end", "--describe", "false", "-o", outDir, "--timeout", "12000"];
  return new Promise((ok, fail) => {
    const child = cli && existsSync(cli)
      ? spawn(process.execPath, [cli, ...args], { cwd: root, windowsHide: true })
      : spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["hyperframes", ...args], { cwd: root, shell: process.platform === "win32", windowsHide: true });
    let log = "";
    child.stdout.on("data", (d) => { log += d; if (onData) onData(String(d)); }); child.stderr.on("data", (d) => { log += d; if (onData) onData(String(d)); });
    const timer = setTimeout(() => { child.kill(); fail(new Error("snapshot demorou demais (>" + timeoutMs / 1000 + " s)\n" + log.slice(-800))); }, timeoutMs);
    child.on("error", (e) => { clearTimeout(timer); fail(e); });
    child.on("close", (code) => {
      clearTimeout(timer);
      const files = existsSync(outDir) ? readdirSync(outDir).filter((f) => /^frame-.*\.png$/i.test(f)).sort() : [];
      if (!files.length) return fail(new Error(`snapshot saiu com código ${code} e sem imagens\n` + log.slice(-1200)));
      ok({ files, log: log.slice(-2000), code });
    });
  });
}

export function listSnapshots(projectDir) {
  const d = join(projectDir, "look-test", "snapshots");
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => /^frame-.*\.png$/i.test(f)).sort().map((f) => ({ file: f, mtime: statSync(join(d, f)).mtimeMs }));
}
