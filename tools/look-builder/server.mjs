#!/usr/bin/env node
// Look builder — local server. No dependencies.
// Run from the kit root:  npm run look-builder   (or: node tools/look-builder/server.mjs [--port 8765] [--clip <path>])
// Serves the wizard, lists local clips, streams video with Range support, serves the skill fonts,
// reads transcripts for sample text and saves look.json into video-projects/<slug>/.
import { createServer } from "node:http";
import { createReadStream, existsSync, readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join, extname, basename, dirname, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, platform } from "node:os";
import { execFile } from "node:child_process";
import { buildTestProject, runSnapshot, listSnapshots, ensureMatte } from "./testbuild.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const PORT = Number(argOf("--port", process.env.PORT || 8765));
const startClip = argOf("--clip", "");

const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf",
  ".gif": "image/gif", ".mp4": "video/mp4", ".mov": "video/quicktime", ".m4v": "video/mp4", ".webm": "video/webm", ".md": "text/markdown; charset=utf-8",
};

// Fonts live inside the skills. First match wins.
const FONT_DIRS = [
  ".claude/skills/reel-oney/template/fonts",
  ".claude/skills/reel-editorial-oney/template/fonts",
  ".claude/skills/reel-explicativo-oney/template/fonts",
  ".claude/skills/vsl/template/fonts",
  ".claude/skills/anuncios-oney/template/fonts",
].map((d) => join(root, d));

// Legenda Dinâmica Studio (EffectCraft) catalogue: GIF previews of ready-made caption styles and entrances.
// Lives outside the kit (the user's own tool). Override with LDS_CATALOG=<folder containing data.json + gifs/>.
const LDS_DIR = [process.env.LDS_CATALOG, join(homedir(), "Desktop", "EFEECTCRAFT EDITOR CLAUDE", "catalogo")].filter(Boolean).find((d) => existsSync(join(d, "data.json"))) || null;
function ldsCatalog() {
  if (!LDS_DIR) return { available: false };
  try {
    const d = JSON.parse(readFileSync(join(LDS_DIR, "data.json"), "utf8"));
    const url = (f) => "/lds/" + String(f).replace(/\\/g, "/").replace(/^\/+/, "");
    return {
      available: true, dir: LDS_DIR,
      prontos: (d.prontos || []).map((p, i) => ({ id: p.id || /pronto-(p\d+)/.exec(p.f)?.[1] || `p${i + 1}`, name: p.n, modelo: p.m, entrada: p.e, saida: p.s, gif: url(p.f) })),
      entradas: (d.entradas || []).map((e) => ({ id: e.id, name: e.n, gif: url(e.f) })),
    };
  } catch (e) { return { available: false, error: String(e.message || e) }; }
}

// The user's own font library (any folder tree of .ttf/.otf/.woff/.woff2). Indexed lazily on first request.
// Override with USER_FONTS=<folder>. Default: the Documents "Fontes  em geral" library (note the double space).
const USER_FONTS_DIR = [process.env.USER_FONTS, "D:\\Users\\carlo\\Documents\\Fontes  em geral", join(homedir(), "Documents", "Fontes  em geral"), join(homedir(), "FontBase")].filter(Boolean).find((d) => { try { return existsSync(d) && statSync(d).isDirectory(); } catch { return false; } }) || null;
let FONT_INDEX = null;
function fontIndex() {
  if (FONT_INDEX) return FONT_INDEX;
  const items = [];
  if (USER_FONTS_DIR) {
    let files = [];
    try { files = readdirSync(USER_FONTS_DIR, { recursive: true, withFileTypes: true }); } catch {}
    for (const e of files) {
      if (!e.isFile() || !/\.(ttf|otf|woff2?)$/i.test(e.name)) continue;
      const dir = e.parentPath || e.path || USER_FONTS_DIR;
      const file = join(dir, e.name);
      const base = e.name.replace(/\.[^.]+$/, "");
      const m = /^(.*?)[-_ ]?(thin|extralight|ultralight|light|regular|book|medium|semibold|demibold|bold|extrabold|ultrabold|black|heavy|italic|oblique|condensed|expanded|wide|outline|shadow|rough|inline|demo|free)([-_ ]?(italic|oblique))?$/i.exec(base);
      const family = (m ? m[1] : base).replace(/[-_]+/g, " ").trim() || base;
      const style = m ? base.slice(m[1].length).replace(/^[-_ ]+/, "") : "Regular";
      items.push({ id: items.length, name: base, family, style, folder: relative(USER_FONTS_DIR, dir).split(sep).join("/"), file, ext: extname(e.name).toLowerCase() });
    }
  }
  FONT_INDEX = items;
  return items;
}
const FONT_MIME = { ".ttf": "font/ttf", ".otf": "font/otf", ".woff": "font/woff", ".woff2": "font/woff2" };

// Brand Nat Style Pack (the user's downloaded guide). We read its styles.js as DATA (never executed): the
// `window.STYLES = {...}` payload is stripped to JSON. Override the location with BRANDNAT_GUIDE=<guide folder>.
const BRANDNAT_DIR = [process.env.BRANDNAT_GUIDE, join(homedir(), "Desktop", "Videos Gringo com painel", "Brand Nat Style Pack", "brand-nat-styles", "guide"), join(homedir(), ".claude", "skills", "brand-nat-styles", "guide")].filter(Boolean).find((d) => existsSync(join(d, "styles.js"))) || null;
function brandNat() {
  if (!BRANDNAT_DIR) return { available: false };
  try {
    const raw = readFileSync(join(BRANDNAT_DIR, "styles.js"), "utf8").replace(/^\s*window\.STYLES\s*=\s*/, "").replace(/;\s*$/, "");
    const d = JSON.parse(raw);
    return { available: true, dir: BRANDNAT_DIR, updated: d.updated || null, cats: (d.cats || []).map((c) => ({ id: c.id, name: c.name, blurb: c.blurb, items: (c.items || []).map((i) => ({ code: i.code, name: i.name, what: i.what })) })) };
  } catch (e) { return { available: false, error: String(e.message || e) }; }
}

const json = (res, code, obj) => { res.writeHead(code, { "content-type": MIME[".json"], "cache-control": "no-store" }); res.end(JSON.stringify(obj)); };
const notFound = (res, msg = "not found") => json(res, 404, { error: msg });
const isUnder = (p, dir) => { const r = relative(dir, p); return r && !r.startsWith("..") && !isAbsolute(r); };
const slugOk = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s || "");

// A clip may live anywhere under the kit or under the user's home folder (it is their own footage).
function allowedClip(p) {
  if (!p) return null;
  // Explorer's "Copiar como caminho" wraps the path in quotes; file:/// URLs come from drag and drop
  p = String(p).trim().replace(/^["']+|["']+$/g, "");
  if (/^file:\/\//i.test(p)) { try { p = fileURLToPath(p); } catch { return null; } }
  const abs = resolve(p);
  if (!VIDEO_EXT.has(extname(abs).toLowerCase())) return null;
  if (!existsSync(abs) || !statSync(abs).isFile()) return null;
  // video files only; the server listens on 127.0.0.1, so any local drive (D:\ etc.) is fine
  if (!isAbsolute(abs)) return null;
  return abs;
}

function listClips() {
  const out = [];
  const push = (abs, project) => {
    try { const st = statSync(abs); out.push({ path: abs, rel: relative(root, abs).split(sep).join("/"), name: basename(abs), project, size: st.size, mtime: st.mtimeMs }); } catch {}
  };
  const vp = join(root, "video-projects");
  if (existsSync(vp)) {
    for (const slug of readdirSync(vp)) {
      const a = join(vp, slug, "assets");
      if (!existsSync(a) || !statSync(a).isDirectory()) continue;
      for (const f of readdirSync(a)) if (VIDEO_EXT.has(extname(f).toLowerCase())) push(join(a, f), slug);
    }
  }
  for (const d of ["meus-videos", "raw-media"]) {
    const p = join(root, d);
    if (!existsSync(p)) continue;
    for (const f of readdirSync(p)) if (VIDEO_EXT.has(extname(f).toLowerCase())) push(join(p, f), null);
  }
  // Prefer the raw / clean / source files first, then newest.
  const rank = (n) => (/^(raw|clean|source)\b/i.test(n) ? 0 : 1);
  out.sort((x, y) => rank(x.name) - rank(y.name) || y.mtime - x.mtime);
  return out;
}

// Full word list for the Edit Review page: transcript.json / raw.json / whisper / silence-transcript / caption-groups.
// Native "open file" dialog on the user's own machine (the server runs locally). Windows: WinForms OpenFileDialog
// through an encoded PowerShell command (no script file, so the execution policy does not apply); macOS: osascript;
// Linux: zenity. Resolves to the chosen absolute path, or null when cancelled.
function pickVideoFile(startDir) {
  return new Promise((done) => {
    const finish = (err, out) => { const p = String(out || "").trim().split(/\r?\n/).pop(); done(!err && p && existsSync(p) ? p : null); };
    const os = platform();
    if (os === "win32") {
      const dir = (startDir && existsSync(startDir) ? startDir : join(homedir(), "Videos")).replace(/'/g, "''");
      const ps = [
        "Add-Type -AssemblyName System.Windows.Forms",
        "[System.Windows.Forms.Application]::EnableVisualStyles()",
        "$owner = New-Object System.Windows.Forms.Form -Property @{TopMost=$true; ShowInTaskbar=$false; WindowState='Minimized'}",
        "$owner.Show(); $owner.Hide()",
        "$d = New-Object System.Windows.Forms.OpenFileDialog",
        "$d.Title = 'Escolha o video para o Look builder'",
        "$d.Filter = 'Videos (*.mp4;*.mov;*.m4v;*.webm)|*.mp4;*.mov;*.m4v;*.webm|Todos os arquivos (*.*)|*.*'",
        `$d.InitialDirectory = '${dir}'`,
        "if ($d.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::OutputEncoding = [Text.Encoding]::UTF8; Write-Output $d.FileName }",
      ].join("; ");
      const enc = Buffer.from(ps, "utf16le").toString("base64");
      return execFile("powershell.exe", ["-NoProfile", "-STA", "-NonInteractive", "-EncodedCommand", enc], { windowsHide: false, timeout: 10 * 60 * 1000, encoding: "utf8" }, finish);
    }
    if (os === "darwin") return execFile("osascript", ["-e", 'POSIX path of (choose file with prompt "Escolha o video" of type {"public.movie"})'], { timeout: 10 * 60 * 1000 }, finish);
    return execFile("zenity", ["--file-selection", "--title=Escolha o video", "--file-filter=*.mp4 *.mov *.m4v *.webm"], { timeout: 10 * 60 * 1000 }, finish);
  });
}
let picking = false;
let testProg = null; // stage of the running "Ver render de verdade" for /api/test-progress

function readTranscript(slug) {
  if (!slugOk(slug)) return null;
  const a = join(root, "video-projects", slug, "assets");
  for (const f of ["transcript.json", "transcript.raw.json", "raw.json", "transcript.whisper.json", "source.silence-transcript.json", "caption-groups.json"]) {
    const p = join(a, f);
    if (!existsSync(p)) continue;
    try {
      const t = JSON.parse(readFileSync(p, "utf8"));
      let words = [];
      if (f === "caption-groups.json" && Array.isArray(t)) words = t.flatMap((g) => (g.words || []).map((w) => ({ text: w.t, start: w.s, end: w.e, who: g.who })));
      else words = (Array.isArray(t) ? t : t.words || []).map((w) => ({ text: w.text ?? w.word ?? w.t, start: w.start ?? w.s, end: w.end ?? w.e }));
      words = words.filter((w) => w && w.text != null && Number.isFinite(+w.start)).map((w) => ({ ...w, text: String(w.text).trim(), start: +w.start, end: Number.isFinite(+w.end) ? +w.end : +w.start + 0.3 }));
      if (words.length) return { file: f, words };
    } catch {}
  }
  return null;
}
// Cut lists the pipeline already produced (cut-silences / cut-mistakes EDLs) for the Edits tab.
function readEdls(slug) {
  if (!slugOk(slug)) return [];
  const a = join(root, "video-projects", slug, "assets");
  if (!existsSync(a)) return [];
  const out = [];
  for (const f of readdirSync(a)) {
    if (!/edl.*\.json$/i.test(f) && !/\.edl\.json$/i.test(f)) continue;
    try {
      const t = JSON.parse(readFileSync(a + "/" + f, "utf8"));
      const ranges = t.delete_ranges || t.cuts || t.ranges || (Array.isArray(t) ? t : []);
      for (const r of ranges) if (Number.isFinite(+r.start) && Number.isFinite(+r.end)) out.push({ file: f, agent: t.agent || null, start: +r.start, end: +r.end, reason: (r.reasons || [r.reason]).filter(Boolean).join("; ") });
    } catch {}
  }
  return out.sort((x, y) => x.start - y.start);
}
function reviewMarkdown(slug, rv) {
  const ts = (t) => { t = Math.max(0, +t || 0); const m = Math.floor(t / 60), sec = (t % 60).toFixed(1).padStart(4, "0"); return `${m}:${sec}`; };
  const L = [`# Edit Review: ${slug}`, "", `Gerado pelo Look builder (tools/look-builder/review.html) em ${new Date().toISOString().slice(0, 16).replace("T", " ")}.`, ""];
  if (rv.clip) L.push(`Clipe: \`${rv.clip}\``, "");
  L.push("## Notas por tempo", "");
  for (const n of (rv.notes || []).slice().sort((x, y) => x.t - y.t)) L.push(`- [${ts(n.t)}] ${n.done ? "✅ " : ""}${n.text}`);
  if (!(rv.notes || []).length) L.push("- (nenhuma)");
  L.push("", "## Edits", "", "| # | tipo | in | out | descrição | status |", "|---|---|---|---|---|---|");
  (rv.edits || []).slice().sort((x, y) => x.in - y.in).forEach((e, i) => L.push(`| ${i + 1} | ${e.type || "edit"} | ${ts(e.in)} | ${e.out != null ? ts(e.out) : ""} | ${e.text || ""} | ${e.done ? "feito" : "a fazer"} |`));
  L.push("");
  return L.join("\n");
}

function sampleWords(slug) {
  if (!slugOk(slug)) return null;
  const a = join(root, "video-projects", slug, "assets");
  for (const f of ["transcript.json", "raw.json", "transcript.whisper.json"]) {
    const p = join(a, f);
    if (!existsSync(p)) continue;
    try {
      const t = JSON.parse(readFileSync(p, "utf8"));
      const words = (Array.isArray(t) ? t : t.words || []).filter((w) => w && w.text).map((w) => ({ text: String(w.text).trim(), start: w.start, end: w.end }));
      if (words.length) return { file: f, words: words.slice(0, 60) };
    } catch {}
  }
  return null;
}

function streamFile(req, res, abs, extraHeaders = {}) {
  const st = statSync(abs);
  const type = MIME[extname(abs).toLowerCase()] || "application/octet-stream";
  const range = req.headers.range;
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? Number(m[1]) : 0;
    let end = m && m[2] ? Number(m[2]) : st.size - 1;
    if (Number.isNaN(start) || start >= st.size) { res.writeHead(416, { "content-range": `bytes */${st.size}` }); return res.end(); }
    end = Math.min(end, st.size - 1);
    res.writeHead(206, { "content-type": type, "content-length": end - start + 1, "content-range": `bytes ${start}-${end}/${st.size}`, "accept-ranges": "bytes", ...extraHeaders });
    return createReadStream(abs, { start, end }).pipe(res);
  }
  res.writeHead(200, { "content-type": type, "content-length": st.size, "accept-ranges": "bytes", ...extraHeaders });
  createReadStream(abs).pipe(res);
}

// Human-readable twin of look.json, for the student and for skills that prefer prose.
function lookMarkdown(L) {
  const li = (arr) => (arr && arr.length ? arr.map((x) => `- ${x.name || x.id}`).join("\n") : "- (nenhum)");
  const one = (x) => (x ? `${x.name || x.id}` : "(não escolhido)");
  const st = L.sampleText || {};
  return `# LOOK — ${L.project}

Gerado pelo Look builder em ${L.savedAt}. Fonte da verdade: \`look.json\` ao lado.

- Clipe: ${L.clip || "?"} (${L.orientation || "?"}, ${L.canvas ? L.canvas.width + "×" + L.canvas.height : "?"})
- Skill esperada: ${L.skill ? `${L.skill} (${L.skillCommand})` : "a decidir"}
- Preset de partida: ${L.preset || "do zero"}
- Enquadramento: topo da cabeça ≈ ${L.framing ? L.framing.headTop : "?"} px · legenda em ${L.framing ? L.framing.capTop : "?"} px

## Escolhas
- Cores: ${one(L.colours)}${L.colours ? ` — acento ${L.colours.acc}, texto ${L.colours.txt}, fundo ${L.colours.bg}` : ""}
- Fontes: ${one(L.fonts)}${L.fonts ? ` — display ${L.fonts.display}; corpo ${L.fonts.body}${L.fonts.serif ? "; serif " + L.fonts.serif : ""}${L.fonts.hand ? "; mão " + L.fonts.hand : ""}` : ""}
- Gancho: ${one(L.hook)}
- Legendas: ${one(L.captions)}

### Elementos
${li(L.elements)}

### Motion
${li(L.motion)}

## Variações pedidas ("Mais como essa")
${L.extras && L.extras.length ? L.extras.map((e) => `- ${e.step}: a partir de ${e.base} → ${e.ask}`).join("\n") : "- (nenhuma)"}

## Notas do aluno
${L.notes || "(sem notas)"}

## Camadas (pessoa na frente)
${L.matte && L.matte.needed ? "- Este look tem partes que passam **atrás da pessoa** (classe `back`). Recorte a pessoa do vídeo inteiro: `npx hyperframes remove-background assets/<video>.mp4 -o assets/matte.webm`. Empilhe: vídeo, partes `.back`, matte, o resto na frente." : "- Nada passa atrás da pessoa: uma camada só."}

## Conflitos com o DESIGN.md da skill
${L.conflicts && L.conflicts.length ? L.conflicts.map((c) => `- ⚠ ${c}`).join("\n") : "- nenhum"}

## Texto de exemplo usado no preview
- Gancho: "${st.hook1 || ""}" / "${st.hook2 || ""}"
- Legenda: "${(st.words || []).join(" ")}" (palavra-chave: ${st.keyword || ""})
`;
}

function readBody(req) {
  return new Promise((ok, fail) => { let b = ""; req.on("data", (c) => { b += c; if (b.length > 2e6) fail(new Error("body too large")); }); req.on("end", () => ok(b)); req.on("error", fail); });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const p = decodeURIComponent(url.pathname);
  try {
    if (p === "/api/clips") return json(res, 200, { root, startClip: allowedClip(startClip) || null, clips: listClips() });
    if (p === "/api/clip") {
      const abs = allowedClip(url.searchParams.get("path"));
      if (!abs) return notFound(res, "clip not found or not allowed");
      if (url.searchParams.get("check")) return json(res, 200, { ok: true, path: abs });
      return streamFile(req, res, abs, { "cache-control": "no-store" });
    }
    if (p === "/api/transcript") return json(res, 200, { sample: sampleWords(url.searchParams.get("project")) });
    if (p === "/api/pick" && req.method === "POST") {
      if (picking) return json(res, 409, { error: "O seletor de arquivo já está aberto (veja a barra de tarefas)." });
      picking = true;
      try {
        const body = JSON.parse(await readBody(req) || "{}");
        const start = body.start ? dirname(String(body.start).replace(/^["']+|["']+$/g, "")) : null;
        const path = await pickVideoFile(start);
        if (!path) return json(res, 200, { path: null });
        const abs = allowedClip(path);
        return abs ? json(res, 200, { path: abs }) : json(res, 200, { path: null, error: "Escolha um vídeo .mp4, .mov, .m4v ou .webm." });
      } finally { picking = false; }
    }
    // Edit Review page: notes per timestamp + edits list, saved in video-projects/<slug>/review.json (+ REVIEW.md)
    if (p === "/api/review" && req.method === "GET") {
      const slug = url.searchParams.get("project");
      if (!slugOk(slug)) return json(res, 200, { review: null, transcript: null, edl: [], clips: [] });
      const f = join(root, "video-projects", slug, "review.json");
      let review = null; try { if (existsSync(f)) review = JSON.parse(readFileSync(f, "utf8")); } catch {}
      return json(res, 200, { review, transcript: readTranscript(slug), edl: readEdls(slug), clips: listClips().filter((c) => c.project === slug) });
    }
    if (p === "/api/review" && req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");
      const slug = body.project;
      if (!slugOk(slug)) return json(res, 400, { error: "Slug inválido: use letras minúsculas, números e hífens." });
      const rv = { clip: body.clip || null, notes: Array.isArray(body.notes) ? body.notes : [], edits: Array.isArray(body.edits) ? body.edits : [], updatedAt: new Date().toISOString() };
      const dir = join(root, "video-projects", slug);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "review.json"), JSON.stringify(rv, null, 2));
      writeFileSync(join(dir, "REVIEW.md"), reviewMarkdown(slug, rv));
      return json(res, 200, { ok: true, files: [`video-projects/${slug}/review.json`, `video-projects/${slug}/REVIEW.md`] });
    }
    if (p === "/api/look" && req.method === "GET") {
      const slug = url.searchParams.get("project");
      if (!slugOk(slug)) return json(res, 400, { error: "bad slug" });
      const f = join(root, "video-projects", slug, "look.json");
      return existsSync(f) ? json(res, 200, { look: JSON.parse(readFileSync(f, "utf8")) }) : json(res, 200, { look: null });
    }
    if (p === "/api/look" && req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");
      const slug = body.project;
      if (!slugOk(slug)) return json(res, 400, { error: "Slug inválido: use letras minúsculas, números e hífens." });
      if (!body.look || typeof body.look !== "object") return json(res, 400, { error: "look ausente" });
      const dir = join(root, "video-projects", slug);
      mkdirSync(dir, { recursive: true });
      const f = join(dir, "look.json");
      const look = { ...body.look, savedAt: new Date().toISOString(), project: slug };
      writeFileSync(f, JSON.stringify(look, null, 2) + "\n");
      writeFileSync(join(dir, "LOOK.md"), lookMarkdown(look));
      return json(res, 200, { ok: true, file: relative(root, f).split(sep).join("/"), md: relative(root, join(dir, "LOOK.md")).split(sep).join("/") });
    }
    // "Testar de verdade": build a HyperFrames composition from the look and snapshot it.
    if (p === "/api/test-progress") return json(res, 200, testProg ? { ...testProg, elapsed: Date.now() - testProg.t0 } : { stage: null });
    if (p === "/api/test" && req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");
      const slug = body.project;
      if (!slugOk(slug)) return json(res, 400, { error: "Slug inválido." });
      const clip = allowedClip(body.look && body.look.clip);
      if (!clip) return json(res, 400, { error: "Clipe não encontrado. Escolha um clipe antes de testar." });
      const projectDir = join(root, "video-projects", slug);
      mkdirSync(projectDir, { recursive: true });
      const t0 = Date.now();
      testProg = { stage: "build", t0, pct: null };
      let built;
      try { built = buildTestProject({ ...body.look, project: slug }, { projectDir, clip, from: Number(body.from) || 0, dur: Math.min(15, Math.max(5, Number(body.dur) || 8)) }); }
      catch (e) { return json(res, 500, { error: "Falha ao montar o projeto de teste: " + (e.message || e) }); }
      // effects that pass behind the person: cut the person out of the excerpt (cached) and stack the layers
      let matte = null;
      if (built.needsMatte && body.matte !== false) {
        testProg = { stage: "matte", t0, pct: null };
        const pctOf = (txt) => { const m = String(txt).match(/(\d{1,3})(?:\.\d+)?\s*%/g); if (m) testProg.pct = Math.min(100, parseInt(m[m.length - 1], 10)); };
        try { const m = await ensureMatte(built.dir, built.clipFile, built.matteKey, { onData: pctOf }); built.writeHtml(m.rel); matte = { file: m.rel, cached: m.cached }; }
        catch (e) { matte = { error: String(e.message || e).slice(0, 600) }; }
      }
      try {
        testProg = { stage: "snap", t0, pct: null };
        const r = await runSnapshot(built.dir, built.times);
        testProg = { stage: "done", t0, pct: 100 };
        return json(res, 200, { ok: true, matte, dir: relative(root, built.dir).split(sep).join("/"), times: built.times, start: built.start, ms: Date.now() - t0,
          images: r.files.map((f) => ({ file: f, url: `/api/testimg?project=${encodeURIComponent(slug)}&f=${encodeURIComponent(f)}&v=${Date.now()}` })), log: r.log });
      } catch (e) { return json(res, 500, { error: String(e.message || e), dir: relative(root, built.dir).split(sep).join("/") }); }
    }
    if (p === "/api/testimg") {
      const slug = url.searchParams.get("project"), f = basename(url.searchParams.get("f") || "");
      if (!slugOk(slug) || !/\.(png|jpe?g)$/i.test(f)) return notFound(res);
      const file = join(root, "video-projects", slug, "look-test", "snapshots", f);
      return existsSync(file) ? streamFile(req, res, file, { "cache-control": "no-store" }) : notFound(res);
    }
    if (p === "/api/testlist") { const slug = url.searchParams.get("project"); return json(res, 200, { images: slugOk(slug) ? listSnapshots(join(root, "video-projects", slug)).map((x) => ({ ...x, url: `/api/testimg?project=${encodeURIComponent(slug)}&f=${encodeURIComponent(x.file)}&v=${Math.round(x.mtime)}` })) : [] }); }
    if (p === "/api/userfonts") {
      const idx = fontIndex();
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const limit = Math.min(300, Number(url.searchParams.get("limit")) || 60), offset = Number(url.searchParams.get("offset")) || 0;
      const hit = q ? idx.filter((f) => f.name.toLowerCase().includes(q) || f.folder.toLowerCase().includes(q)) : idx;
      // one entry per family (its first style) unless the search is specific
      const seen = new Set(); const fams = [];
      for (const f of hit) { const k = f.family.toLowerCase() + "|" + f.folder; if (seen.has(k) && !q) continue; seen.add(k); fams.push(f); }
      return json(res, 200, { dir: USER_FONTS_DIR, total: idx.length, families: fams.length, items: fams.slice(offset, offset + limit).map(({ file, ...r }) => r) });
    }
    if (p.startsWith("/userfont/")) {
      const f = fontIndex()[Number(p.slice(10))];
      if (!f || !existsSync(f.file)) return notFound(res, "font");
      const st = statSync(f.file);
      res.writeHead(200, { "content-type": FONT_MIME[f.ext] || "application/octet-stream", "content-length": st.size, "cache-control": "public, max-age=604800", "access-control-allow-origin": "*" });
      return createReadStream(f.file).pipe(res);
    }
    if (p === "/api/userfont-file") { const f = fontIndex()[Number(url.searchParams.get("id"))]; return f ? json(res, 200, { file: f.file, name: f.name }) : notFound(res, "font"); }
    // images of a project (prints, photos, thumbs, img) for elements that show the student's own pictures
    if (p === "/api/images") {
      const slug = url.searchParams.get("project");
      if (!slugOk(slug)) return json(res, 200, { images: [] });
      const base = join(root, "video-projects", slug, "assets");
      const out = [];
      for (const d of ["prints", "photos", "thumbs", "img", "images", ""]) {
        const dir = join(base, d);
        if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
        for (const f of readdirSync(dir)) if (/\.(png|jpe?g|webp)$/i.test(f)) out.push({ name: f, folder: d, url: `/api/img?project=${encodeURIComponent(slug)}&f=${encodeURIComponent((d ? d + "/" : "") + f)}` });
        if (out.length > 40) break;
      }
      return json(res, 200, { images: out.slice(0, 40) });
    }
    if (p === "/api/img") {
      const slug = url.searchParams.get("project"), f = url.searchParams.get("f") || "";
      if (!slugOk(slug) || !/^[\w .()\-]+(\/[\w .()\-]+)?\.(png|jpe?g|webp)$/i.test(f)) return notFound(res);
      const file = join(root, "video-projects", slug, "assets", f);
      return existsSync(file) ? streamFile(req, res, file, { "cache-control": "no-store" }) : notFound(res);
    }
    if (p === "/api/preset-images") {
      const d = join(here, "assets", "presets");
      const files = existsSync(d) ? readdirSync(d).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)) : [];
      return json(res, 200, { images: Object.fromEntries(files.map((f) => [f.replace(/\.[^.]+$/, ""), `/assets/presets/${f}`])) });
    }
    if (p === "/api/brandnat") return json(res, 200, brandNat());
    if (p === "/api/lds") return json(res, 200, ldsCatalog());
    if (p.startsWith("/lds/") && LDS_DIR) {
      const f = resolve(LDS_DIR, p.slice(5));
      if (!isUnder(f, LDS_DIR) || !existsSync(f) || !statSync(f).isFile()) return notFound(res, "lds file");
      return streamFile(req, res, f, { "cache-control": "public, max-age=86400" });
    }
    if (p === "/vendor/gsap.min.js") {
      const g = join(root, "node_modules/gsap/dist/gsap.min.js");
      return existsSync(g) ? streamFile(req, res, g) : notFound(res, "run npm ci first");
    }
    if (p.startsWith("/fonts/")) {
      const name = basename(p);
      for (const d of FONT_DIRS) { const f = join(d, name); if (existsSync(f)) return streamFile(req, res, f, { "cache-control": "public, max-age=86400" }); }
      return notFound(res, "font");
    }
    // Static app files.
    const file = p === "/" ? join(here, "index.html") : p === "/review" ? join(here, "review.html") : join(here, p);
    if (!isUnder(file, here) && file !== join(here, "index.html")) return notFound(res);
    if (!existsSync(file) || !statSync(file).isFile()) return notFound(res);
    return streamFile(req, res, file, { "cache-control": "no-store" });
  } catch (e) {
    return json(res, 500, { error: String(e && e.message || e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Look builder: http://localhost:${PORT}/${startClip ? `?clip=${encodeURIComponent(resolve(startClip))}` : ""}`);
  console.log("Clipes listados de video-projects/*/assets, meus-videos/ e raw-media/. Ctrl+C para parar.");
});
