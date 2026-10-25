// Look builder — app. Seven steps; every card renders the chosen look over a frame of the user's own clip.
import { hasBack } from "./layers.mjs";
import { SKILLS, COLOURS, FONTS, HOOKS, CAPTIONS, ELEMENTS, MOTIONS, PRESETS, CONFLICTS, ldsCaption } from "./looks.mjs";
import "./looks.zee.mjs";      // effects from the zeemagede reel (frame-by-frame analysis)
import "./looks.castilho.mjs"; // the 35 effects from castilhoia.com
import "./looks.ajene.mjs";    // our versions of the editing.ajenepinnock.com templates
import "./looks.tenfold.mjs";
import "./looks.altra.mjs";    // our versions of the altralabs.com.br motion samples  // the three Ten Fold looks
import { installBrandNat } from "./looks.brandnat.mjs";
import { sketchFor } from "./sketch.mjs";
import { avatarDataUrl } from "./avatar.mjs";
import { mockupHtml, MOCKUP_CSS, PERSON_DEFS } from "./mockups.mjs"; // mini phones from the kit landing page // neutral presenter used as background without a clip (or by choice) // face-free layout sketches for the template cards // Brand Nat Style Pack codes, data read by the server

// Brand Nat pack (105 codes) — options are added at runtime when the server finds the pack.
const BN = { available: false, finishes: [], dir: null };
async function loadBrandNat() {
  try {
    const r = await fetch("/api/brandnat").then((x) => x.json());
    if (!r.available) return;
    BN.available = true; BN.dir = r.dir; BN.finishes = installBrandNat(r);
    renderStep(); rebuildMain();
  } catch {}
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const byId = (arr, id) => arr.find((x) => x.id === id);

// Legenda Dinâmica Studio (EffectCraft) catalogue, loaded from /api/lds when the user has it installed.
const LDS = { available: false, prontos: [], entradas: [] };
const allCaptions = () => CAPTIONS.concat(LDS.prontos.map(ldsCaption));
const capById = (id) => byId(allCaptions(), id);
const isLds = () => typeof L.captions === "string" && L.captions.startsWith("lds:");
async function loadLds() {
  try { Object.assign(LDS, await fetch("/api/lds").then((x) => x.json())); } catch { LDS.available = false; }
  if (LDS.available) { FREE_STEPS[3].help += " As \"Legenda Dinâmica\" rodam no EffectCraft (plugin do Carlos): palavra-chave gigante, conectivos pequenos, entrada palavra por palavra."; if (UI.mode) renderStep(); }
}

// ------------------------------------------------------------------ state
const L = { preset: null, skill: null, colours: null, fonts: null, userFonts: {}, hook: null, captions: null, ldsEntrada: null, elements: [], motion: [], finishes: [], extras: [], notes: "" };
const UI = {
  step: 0, clip: null, clipProject: null, W: 1080, H: 1920, landscape: false, headTop: 620, capTop: 1150, poster: "",
  text: { hook1: "Larguei meu emprego?", hook2: "a parte que ninguém conta", words: "isso era o sonho de verdade e ninguém fala".split(" "), keyword: "sonho", note: "eu quase desisti aqui", comment: "quero esse estilo! como faz?", user: "seu_usuario" },
};
const FREE_STEPS = [
  { id: "colours", title: "Cores", help: "Escolha a paleta. Cada passo depois desse usa essas cores." },
  { id: "fonts", title: "Fontes", help: "Escolha as fontes. Elas vão para o gancho, as legendas, os cards e o motion. Quer outra combinação? Pegue a mais próxima e peça em \"Mais como essa\"." },
  { id: "hook", title: "Gancho", help: "O gancho é o título grande sobre os primeiros 3 segundos. Ele segura o scroll." },
  { id: "captions", title: "Legendas", help: "Como a fala aparece na tela, o vídeo inteiro." },
  { id: "elements", title: "Elementos", help: "Marque todo elemento que você quer nos seus vídeos. Mostrados nas suas cores e fontes." },
  { id: "motion", title: "Motion", help: "Marque o motion que você quer. Desenhado ao vivo nas suas cores e fontes. O primeiro marcado é a entrada padrão dos elementos." },
  { id: "review", title: "Testar e salvar", help: "Veja o render de verdade, confira o look e salve. Depois é só colar o pedido no Claude." },
];
const TPL_STEPS = [
  { id: "template", title: "Template", help: "Escolha um formato pronto. Passe o mouse para ver a animação no seu clipe; clique para usar." },
  { id: "adjust", title: "Ajustar", help: "Opcional. Troque os textos de exemplo, as cores, as fontes ou a legenda. O resto do template continua igual." },
  { id: "review", title: "Testar e salvar", help: "Veja o render de verdade e salve. Depois é só colar o pedido no Claude." },
];
let STEPS = FREE_STEPS;

let mainTl = null, cardTls = [];
// Two ways in: a ready template (3 steps) or building piece by piece (7 steps). The choice is remembered.
function setMode(m, { quiet = false } = {}) {
  UI.mode = m; STEPS = m === "free" ? FREE_STEPS : TPL_STEPS; UI.step = 0;
  document.body.classList.toggle("entry", !m);
  try { m ? localStorage.setItem("look-builder:mode", m) : localStorage.removeItem("look-builder:mode"); } catch {}
  if (!quiet) { renderStep(); autosave(); }
}
// what each template is FOR (the source only shows as a small tag on the card)
const GOALS = [
  ["talk", "Reel falado", "Você na tela, com legenda, cards e cortes por cima."],
  ["explain", "Explicativo e aula", "Painéis, diagramas, listas e documento: para ensinar algo."],
  ["sell", "Anúncio e venda", "Produto, oferta e chamada para ação."],
  ["motion", "Motion sem rosto", "Só animação e tipografia, sem precisar aparecer."],
];
const GOAL_OF = {
  anuncio: "sell", "vsl-roxo": "sell", "vsl-clean": "sell", "alt-produto-lavanda": "sell", "alt-streaming": "sell", "tpl-business-reels": "sell", "alt-balao-retencao": "sell",
  explicativo: "explain", vox: "explain", aurora: "explain", "tpl-explainer-panel": "explain", "tpl-glass-explainer": "explain", "tpl-split-reel": "explain", "tpl-educational-youtube": "explain", "tpl-split-screen-document": "explain", "tpl-coaching-call-clips": "explain", "tpl-lesson-doc": "explain", "tpl-tips-breakdown": "explain", "tpl-ear-to-ear": "explain", "tpl-ranking-format": "explain", "tpl-top5": "explain", "tpl-if-then": "explain", "tpl-this-vs-that": "explain", "tpl-rapid-list": "explain", "tpl-depth-ui": "explain", "tpl-youtube-clips": "explain",
  "alt-bokeh-quente": "motion", "alt-manifesto-ia": "motion", "alt-gravura-editorial": "motion", "alt-faixas-cineticas": "motion", "tpl-cinematic-type": "motion",
};
const goalOf = (p) => GOAL_OF[p.id] || "talk";
const SOURCE = { "ajene-templates": "Ajene", "altra-labs": "Altra", tenfold: "Ten Fold", "zee-effects": "Zee", "castilho-35": "Castilho", "brand-nat": "Brand Nat" };
const sourceOf = (p) => SOURCE[p.skill] || "Kit";
function renderEntry() {
  killCards();
  document.body.classList.add("entry");
  $("#stepKicker").textContent = "Comece aqui"; $("#stepNum").textContent = "→"; $("#stepTitle").textContent = "Como você quer começar?";
  $("#stepHelp").textContent = "Dá para trocar de caminho depois, no botão \"Trocar caminho\" lá em cima.";
  $("#picks").innerHTML = ""; $("#quick").innerHTML = ""; $("#steps").innerHTML = ""; $("#progressBar").style.width = "0";
  $("#grid").innerHTML = `<div class="entry-choices">
    <button class="choice rec" data-mode="tpl"><span class="badge">recomendado</span><b>Usar um template</b><span>Escolha um formato pronto, veja ele no seu clipe, ajuste os textos e teste. Três passos.</span><em>Template → Ajustar → Testar e salvar</em></button>
    <button class="choice" data-mode="free"><b>Montar do zero</b><span>Escolha cada peça: cores, fontes, gancho, legenda, elementos e motion. Para quem quer controlar tudo.</span><em>7 passos</em></button>
  </div>`;
  $$("#grid [data-mode]").forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
  renderPicks();
}
// template step: one row per goal; hover plays, click applies
function templateSections() {
  UI.open = UI.open || {};
  const visible = PRESETS.filter((p) => p.skill && (UI.adv || p.skill !== "brand-nat"));
  return GOALS.map(([k, title, sub]) => {
    const list = visible.filter((p) => goalOf(p) === k); if (!list.length) return "";
    return `<div class="sec-head"><b>${title} <small>${list.length}</small></b><span>${sub}</span><button class="mini" data-open="${k}">${UI.open[k] ? "Ver menos ▴" : "Ver todos ▾"}</button></div><div class="presets tpl ${UI.open[k] ? "" : "row"}">${list.map((p) => presetCard(p, true)).join("")}</div>`;
  }).join("");
}
// "Ajustar" tab with the sample texts (the same values as the side panel inputs)
function textsForm() {
  const f = [["hook1", "Gancho, linha 1"], ["hook2", "Gancho, linha 2"], ["words", "Frase das legendas"], ["keyword", "Palavra-chave (destaque)"], ["user", "Seu @ ou marca"]];
  return `<div class="texts-form" style="grid-column:1/-1">${f.map(([k, t]) => `<label><span>${t}</span><input data-k="${k}" value="${esc(k === "words" ? UI.text.words.join(" ") : UI.text[k] ?? "")}"></label>`).join("")}<p class="hint">Esses textos só servem para você ver o look. No vídeo de verdade entram a sua fala e os seus textos.</p></div>`;
}
function wireTextsForm() {
  $$(".texts-form input").forEach((i) => (i.oninput = () => { const k = i.dataset.k; if (k === "words") UI.text.words = i.value.trim().split(/\s+/).filter(Boolean).slice(0, 14); else UI.text[k] = i.value; syncTextInputs(); debounce(() => { rebuildMain(); autosave(); }); }));
}
// live progress of "Ver render de verdade" (the server reports the stage it is in)
function progressHtml(p, hasBack) {
  const stages = [["build", "Montando o projeto de teste"], ...(hasBack ? [["matte", "Recortando a pessoa (só na primeira vez de cada trecho)"]] : []), ["snap", "Capturando os quadros com o HyperFrames"]];
  const cur = p && p.stage ? stages.findIndex(([k]) => k === p.stage) : 0;
  const sec = p && p.elapsed ? Math.round(p.elapsed / 1000) : 0;
  return `<div class="test-progress"><ol>${stages.map(([k, t], i) => `<li class="${i < cur ? "done" : i === cur ? "now" : ""}"><i></i>${t}${i === cur && p && p.pct != null ? ` <b>${p.pct}%</b>` : ""}</li>`).join("")}</ol><p class="hint">${sec ? `${sec} s` : "começando…"}${hasBack ? " · o recorte da pessoa pode levar alguns minutos na primeira vez" : " · costuma levar uns 30 segundos"}</p></div>`;
}

const video = $("#video"), stage = $("#stage"), world = $("#world"), worldBack = $("#worldBack"), cam = $("#cam"), camFg = $("#camFg"), guides = $("#guides");

// ------------------------------------------------------------------ derived style state for renderers
function S() {
  const c = byId(COLOURS, L.colours) || COLOURS[0];
  return { v: c.vars, font: fontWithUser(byId(FONTS, L.fonts) || FONTS[0]), text: UI.text, W: UI.W, H: UI.H, landscape: UI.landscape, headTop: UI.headTop, capTop: UI.capTop, images: UI.images || [], ldsIn: L.ldsEntrada || null };
}
function withPick(over) { const s = S(); if (over.colours) s.v = byId(COLOURS, over.colours).vars; if (over.fonts) s.font = fontWithUser(byId(FONTS, over.fonts)); return s; }
// Fonts from the user's own folder override roles of the chosen pair (display / body / serif / hand / mono).
function fontWithUser(f) {
  const out = { ...f };
  for (const [role, uf] of Object.entries(L.userFonts || {})) { if (!uf) continue; ensureUserFontFace(uf); out[role] = `'uf-${uf.id}',${f[role] || f.display}`; if (role === "display") { out.dw = 400; } if (role === "body") out.bw = 400; }
  return out;
}
const USER_FACES = new Set();
function ensureUserFontFace(uf) {
  if (USER_FACES.has(uf.id)) return;
  USER_FACES.add(uf.id);
  try { const face = new FontFace(`uf-${uf.id}`, `url(/userfont/${uf.id})`); document.fonts.add(face); face.load().then(() => { renderStep(); rebuildMain(); }).catch(() => {}); } catch {}
}

// ------------------------------------------------------------------ clip
async function loadClips() {
  const r = await fetch("/api/clips").then((x) => x.json());
  const sel = $("#clipSelect");
  sel.innerHTML = `<option value="">— escolha um clipe —</option>` + r.clips.map((c) => `<option value="${esc(c.path)}" data-project="${esc(c.project || "")}">${esc(c.project ? c.project + " / " : "")}${esc(c.name)} · ${(c.size / 1e6).toFixed(0)} MB</option>`).join("");
  // Only open a clip the user asked for: ?clip=, --clip on the server, or the last one they used here. Never the first of the list.
  let last = null; try { last = localStorage.getItem(LS + "lastClip"); } catch {}
  const q = new URLSearchParams(location.search).get("clip") || r.startClip || (last && r.clips.some((c) => c.path === last) ? last : null);
  if (q) { sel.value = q; openClip(q, (r.clips.find((c) => c.path === q) || {}).project || null); }
  else toast("Escolha um clipe na lista para começar.");
}
async function openClip(path, project) {
  if (!path) return;
  UI.clip = path; UI.clipProject = project || guessProject(path);
  try { localStorage.setItem(LS + "lastClip", path); } catch {}
  restoreForClip(path);
  $("#clipName").textContent = path.split(/[\\/]/).slice(-3).join("/");
  if (!UI.slugTouched) $("#slug").value = UI.clipProject || slugify(path.split(/[\\/]/).pop().replace(/\.[^.]+$/, ""));
  video.src = `/api/clip?path=${encodeURIComponent(path)}`;
  video.load();
  loadProjectImages();
  const rv = $("#toReview"); if (rv) rv.href = `/review?project=${encodeURIComponent(UI.clipProject || "")}&clip=${encodeURIComponent(path)}`;
}
// prints / photos in video-projects/<slug>/assets/{prints,photos,thumbs,img,images} feed the image-based elements (S.images)
async function loadProjectImages() {
  UI.images = [];
  if (!UI.clipProject) return;
  try { const r = await fetch(`/api/images?project=${encodeURIComponent(UI.clipProject)}`).then((x) => x.json()); UI.images = (r.images || []).map((im) => im.url).slice(0, 24); } catch {}
  if (UI.images.length) { renderStep(); rebuildMain(); toast(`${UI.images.length} imagens do projeto nas vitrines (carrossel, mosaico, thumbs).`); }
}
// ---- persistence: localStorage per clip (autosave) + look.json already saved in the project
const LS = "look-builder:v1:";
function snapshot() { return { L, framing: { headTop: UI.headTop, capTop: UI.capTop }, text: UI.text, step: UI.step }; }
function autosave() { if (!UI.clip) return; try { localStorage.setItem(LS + UI.clip, JSON.stringify(snapshot())); } catch {} }
function applyLook(j) {
  if (!j) return false;
  const id = (x) => (x && typeof x === "object" ? x.id : x) || null;
  L.preset = j.preset || null; L.skill = j.skill || null;
  L.colours = id(j.colours); L.fonts = id(j.fonts); L.hook = id(j.hook); L.captions = id(j.captions);
  L.ldsEntrada = j.ldsEntrada || (j.captions && j.captions.lds && j.captions.lds.entradaId) || null;
  L.userFonts = j.userFonts || (j.fonts && j.fonts.custom) || {};
  L.finishes = (j.brandNat && j.brandNat.finishes) || j.finishes || [];
  L.elements = (j.elements || []).map(id).filter(Boolean); L.motion = (j.motion || []).map(id).filter(Boolean);
  L.extras = j.extras || []; L.notes = j.notes || "";
  if (j.framing) { UI.pendingFraming = j.framing; }
  if (j.sampleText) Object.assign(UI.text, j.sampleText);
  if (j.text) Object.assign(UI.text, j.text);
  syncTextInputs(); ensureSavedUserFonts();
  return true;
}
async function restoreForClip(path) {
  let local = null; try { local = JSON.parse(localStorage.getItem(LS + path) || "null"); } catch {}
  const hasPicks = (x) => x && (x.colours || x.fonts || x.hook || x.captions || (x.elements || []).length || (x.motion || []).length);
  if (local && hasPicks(local.L) && applyLook({ ...local.L, framing: local.framing, text: local.text })) { UI.step = local.step || 0; toast("Rascunho deste clipe restaurado."); return; }
  if (UI.clipProject) {
    const r = await fetch(`/api/look?project=${encodeURIComponent(UI.clipProject)}`).then((x) => x.json()).catch(() => ({}));
    if (r.look && applyLook(r.look)) { toast(`look.json de ${UI.clipProject} carregado.`); renderStep(); rebuildMain(); }
  }
}
function syncTextInputs() {
  ["hook1", "hook2", "keyword", "note", "comment", "user"].forEach((k) => { const el = $("#" + k); if (el) el.value = UI.text[k] ?? ""; });
  const w = $("#wordsIn"); if (w) w.value = (UI.text.words || []).join(" ");
}
function resetAll() {
  Object.assign(L, { preset: null, skill: null, colours: null, fonts: null, userFonts: {}, hook: null, captions: null, ldsEntrada: null, elements: [], motion: [], finishes: [], extras: [], notes: "" });
  try { if (UI.clip) localStorage.removeItem(LS + UI.clip); } catch {}
  UI.step = 0; setMode(null, { quiet: true }); renderStep(); rebuildMain(); toast("Look limpo. Escolha como começar.");
}
// A coherent random look: one skill, only options native to it.
function surprise() {
  const pool = PRESETS.filter((p) => p.skill);
  const p = pool[Math.floor(Math.random() * pool.length)];
  applyPreset(p.id);
  const nat = (arr) => arr.filter((o) => (o.skills || []).includes(p.skill));
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const h = nat(HOOKS); if (h.length) L.hook = rnd(h).id;
  const c = nat(CAPTIONS); if (c.length) L.captions = rnd(c).id;
  const e = nat(ELEMENTS); L.elements = [...new Set([rnd(e), rnd(e), rnd(e)].filter(Boolean).map((x) => x.id))];
  const m = nat(MOTIONS); L.motion = [...new Set([rnd(m), rnd(m)].filter(Boolean).map((x) => x.id))];
  L.preset = null; renderStep(); rebuildMain(); toast(`Surpresa: um look ${SKILLS[p.skill].name}. Troque o que não gostar.`);
}
// ---- head detection (MediaPipe Face Detector in the browser, no Python). Samples frames across the clip,
// keeps the biggest face per frame, estimates head top (hair above the face box) and chin, fills the sliders.
let faceDet = null;
async function loadFaceDetector() {
  if (faceDet) return faceDet;
  const base = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10";
  const mp = await import(`${base}/vision_bundle.mjs`);
  const vision = await mp.FilesetResolver.forVisionTasks(`${base}/wasm`);
  faceDet = await mp.FaceDetector.createFromOptions(vision, {
    baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite" },
    runningMode: "IMAGE", minDetectionConfidence: 0.5,
  });
  return faceDet;
}
async function detectHead({ silent = false } = {}) {
  if (!UI.clip || !video.videoWidth) return toast("Escolha um clipe antes.");
  const btn = $("#detectHead"); btn.classList.add("busy"); btn.textContent = "Detectando…";
  if (!silent) toast("Detectando a cabeça em alguns frames do clipe…");
  try {
    const det = await loadFaceDetector();
    const v = document.createElement("video"); v.muted = true; v.preload = "auto"; v.src = video.src;
    await new Promise((ok, fail) => { v.onloadedmetadata = ok; v.onerror = () => fail(new Error("não consegui abrir o clipe para análise")); });
    const dur = v.duration || 10, n = Math.min(9, Math.max(4, Math.round(dur / 6)));
    const times = Array.from({ length: n }, (_, i) => Math.min(dur - 0.2, 0.8 + (dur - 1.6) * (i / Math.max(1, n - 1))));
    const cw = UI.landscape ? 640 : 360, ch = UI.landscape ? 360 : 640;
    const c = document.createElement("canvas"); c.width = cw; c.height = ch; const ctx = c.getContext("2d");
    const hits = [];
    for (const t of times) {
      v.currentTime = t; await new Promise((ok) => { v.onseeked = ok; });
      ctx.drawImage(v, 0, 0, cw, ch);
      const r = det.detect(c);
      const d = r.detections.map((x) => x.boundingBox).sort((a, b) => b.width * b.height - a.width * a.height)[0];
      if (d) hits.push({ t, x: d.originX / cw, y: d.originY / ch, w: d.width / cw, h: d.height / ch });
    }
    if (!hits.length) { toast("Nenhum rosto encontrado nesses frames. Ajuste os sliders à mão."); return null; }
    // The BlazeFace box runs roughly eyebrows→chin. Hair adds ~55 % of the box above; chin sits a hair below.
    const q = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]; };
    const tops = hits.map((h) => (h.y - 0.55 * h.h) * UI.H), chins = hits.map((h) => (h.y + 1.08 * h.h) * UI.H);
    const headTop = Math.round(Math.max(60, q(tops, 0.15)) / 10) * 10;
    const chin = Math.round(q(chins, 0.85) / 10) * 10;
    UI.headTop = Math.min(Number($("#headTop").max), headTop);
    UI.capTop = Math.min(Number($("#capTop").max), chin + (UI.landscape ? 20 : 40));
    UI.face = { x: q(hits.map((h) => h.x), 0.5) * UI.W, y: q(hits.map((h) => h.y), 0.5) * UI.H, w: q(hits.map((h) => h.w), 0.5) * UI.W, h: q(hits.map((h) => h.h), 0.5) * UI.H, frames: hits.length, of: times.length };
    syncSliders(); drawGuides(); renderStep(); rebuildMain(); autosave();
    toast(`Cabeça detectada em ${hits.length} de ${times.length} frames: topo ≈ ${UI.headTop}px, queixo ≈ ${chin}px.`);
    return UI.face;
  } catch (e) {
    toast("Detecção indisponível (precisa de internet na primeira vez): " + (e.message || e));
    return null;
  } finally { btn.classList.remove("busy"); btn.textContent = "Detectar cabeça"; }
}
// background for cards and stage: the student clip frame, or the neutral avatar when there is no clip / the toggle is on
function posterUrl() { return (UI.useAvatar || !UI.poster) ? avatarDataUrl(UI.landscape) : UI.poster; }
function applyBackgrounds() { const u = posterUrl(); $$(".card .cam, .preset .cam").forEach((el) => (el.style.backgroundImage = `url(${u})`)); const c = $("#cam"); if (c) c.style.backgroundImage = UI.clip && !UI.useAvatar ? "none" : `url(${u})`; }
const guessProject = (p) => { const m = /video-projects[\\/]([a-z0-9-]+)[\\/]/.exec(p); return m ? m[1] : null; };
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "meu-look";

video.addEventListener("loadedmetadata", () => {
  stage.classList.add("has-clip"); stage.classList.toggle("avatar", !!UI.useAvatar); applyBackgrounds();
  UI.landscape = video.videoWidth > video.videoHeight;
  UI.W = UI.landscape ? 1920 : 1080; UI.H = UI.landscape ? 1080 : 1920;
  if (UI.landscape) { UI.headTop = 300; UI.capTop = 880; } else { UI.headTop = 620; UI.capTop = 1150; }
  UI.face = null;
  const restored = !!UI.pendingFraming;
  if (UI.pendingFraming) { UI.headTop = UI.pendingFraming.headTop || UI.headTop; UI.capTop = UI.pendingFraming.capTop || UI.capTop; UI.pendingFraming = null; }
  $("#headTop").max = UI.H - 400; $("#capTop").max = UI.H - 200;
  syncSliders(); layoutStage();
  video.currentTime = Math.min(2, (video.duration || 4) / 3);
  renderStep(); rebuildMain();
  if (!restored && $("#autoDetect").checked) detectHead({ silent: true });
});
video.addEventListener("seeked", () => { if (video.paused) capturePoster(); });
video.addEventListener("pause", capturePoster);
video.addEventListener("timeupdate", () => ($("#time").textContent = `${fmt(video.currentTime)} / ${fmt(video.duration || 0)}`));
video.addEventListener("ended", () => { video.currentTime = 0; video.play(); });
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

let posterTimer;
function capturePoster() {
  if (!video.videoWidth) return;
  clearTimeout(posterTimer);
  posterTimer = setTimeout(() => {
    const c = document.createElement("canvas"); c.width = UI.landscape ? 640 : 360; c.height = UI.landscape ? 360 : 640;
    try { c.getContext("2d").drawImage(video, 0, 0, c.width, c.height); UI.poster = c.toDataURL("image/jpeg", 0.8); } catch { UI.poster = ""; }
    applyBackgrounds();
    if (!$$(".card .cam").length) renderStep();
  }, 150);
}

function layoutStage() {
  const wrap = $(".stage-wrap");
  const narrow = window.innerWidth < 900;
  const maxW = wrap.clientWidth - 20, maxH = Math.max(240, window.innerHeight * (narrow ? 0.34 : 0.52));
  let w = UI.landscape ? maxW : Math.min(maxW, maxH * UI.W / UI.H);
  let h = w * UI.H / UI.W; if (h > maxH) { h = maxH; w = h * UI.W / UI.H; }
  stage.style.width = w + "px"; stage.style.height = h + "px";
  const s = w / UI.W;
  for (const el of [world, worldBack, guides]) { el.style.width = UI.W + "px"; el.style.height = UI.H + "px"; el.style.transform = `scale(${s})`; }
  drawGuides();
}
function drawGuides() {
  guides.style.setProperty("--gs", (stage.clientWidth / UI.W) || 0.3);
  guides.classList.toggle("compact", stage.clientWidth < 220);
  $(".g.head", guides).style.top = UI.headTop + "px"; $(".g.head em", guides).textContent = Math.round(UI.headTop);
  $(".g.cap", guides).style.top = UI.capTop + "px"; $(".g.cap em", guides).textContent = Math.round(UI.capTop);
  const sf = $(".g.safe", guides);
  if (UI.landscape) { Object.assign(sf.style, { left: "96px", right: "96px", top: "96px", height: UI.H - 192 + "px" }); }
  else { Object.assign(sf.style, { left: "65px", right: "65px", top: "270px", height: 1248 - 270 + "px" }); }
  const fb = $(".g.face", guides);
  if (UI.face) { Object.assign(fb.style, { display: "block", left: UI.face.x + "px", top: UI.face.y + "px", width: UI.face.w + "px", height: UI.face.h + "px", right: "auto" }); }
  else fb.style.display = "none";
  guides.style.display = $("#showGuides").checked ? "" : "none";
}
function syncSliders() {
  $("#headTop").value = UI.headTop; $("#headTopV").value = UI.headTop;
  $("#capTop").value = UI.capTop; $("#capTopV").value = UI.capTop;
}

// ------------------------------------------------------------------ steps nav
function renderNav() {
  const counts = { colours: L.colours ? 1 : 0, fonts: L.fonts ? 1 : 0, hook: L.hook ? 1 : 0, captions: L.captions ? 1 : 0, elements: L.elements.length, motion: L.motion.length, review: 0, template: L.preset ? 1 : 0, adjust: 0 };
  $("#steps").innerHTML = STEPS.map((s, i) => `<button class="${i === UI.step ? "on" : ""} ${counts[s.id] ? "done" : ""}" data-i="${i}"><span class="n">${i + 1}</span><span class="tt">${s.title}</span>${counts[s.id] > 1 ? `<span class="cnt">${counts[s.id]}</span>` : ""}</button>`).join("");
  $$("#steps button").forEach((b) => (b.onclick = () => go(Number(b.dataset.i))));
  $("#prev").disabled = UI.step === 0;
  const nx = $("#next .tx"); if (nx) nx.textContent = UI.step === STEPS.length - 1 ? "Salvar e usar no Claude" : `Próximo: ${STEPS[UI.step + 1].title}`;
  $("#extras").textContent = `${L.extras.length} extra${L.extras.length === 1 ? "" : "s"} pedido${L.extras.length === 1 ? "" : "s"}`;
}
function renderPicks() {
  const n = (arr, id) => (byId(arr, id) || {}).name;
  const items = [
    L.colours && ["Cores", n(COLOURS, L.colours), 0], (L.fonts || Object.keys(L.userFonts || {}).length) && ["Fontes", [n(FONTS, L.fonts), ...Object.values(L.userFonts || {}).filter(Boolean).map((u) => u.name)].filter(Boolean).join(" + "), 1], L.hook && ["Gancho", n(HOOKS, L.hook), 2],
    L.captions && ["Legendas", (capById(L.captions) || {}).name, 3], L.elements.length && ["Elementos", `${L.elements.length}`, 4], L.motion.length && ["Motion", `${L.motion.length}`, 5],
  ].filter(Boolean);
  $("#picks").innerHTML = items.map(([k, v, i]) => `<button data-i="${i}" title="Ir para ${k}"><i></i>${k}: <b>${esc(v)}</b></button>`).join("");
  const tray = $("#trayPicks"); if (tray) tray.innerHTML = items.length ? items.map(([k, v]) => `<span class="code">${esc(k)} · ${esc(v)}</span>`).join("") : `<span class="code" style="opacity:.6">nada escolhido ainda</span>`;
  $$("#picks button").forEach((b) => (b.onclick = () => { if (UI.mode === "tpl") { const k = ["colours", "fonts", null, "captions"][Number(b.dataset.i)]; if (k) UI.adj = k; go(k ? 1 : 0); } else go(Number(b.dataset.i)); }));
}
function go(i) { if (!UI.mode) return; UI.step = Math.max(0, Math.min(STEPS.length - 1, i)); renderStep(); autosave(); }
$("#prev").onclick = () => go(UI.step - 1);
$("#next").onclick = () => (UI.step === STEPS.length - 1 ? save() : go(UI.step + 1));

// ------------------------------------------------------------------ cards
function killCards() { cardTls.forEach((t) => t.kill()); cardTls = []; }
function frameHtml(S) {
  const ratio = (S.H / S.W) * 100;
  return `<div class="frame" style="padding-bottom:${ratio}%"><div class="cam" style="background:#000 center/cover no-repeat;background-image:url(${posterUrl()})"></div><div class="world" style="width:${S.W}px;height:${S.H}px"></div></div>`;
}
function scaleWorlds() {
  $$(".card .frame").forEach((f) => { const w = $(".world", f); if (w) w.style.transform = `scale(${f.clientWidth / UI.W})`; });
}
function card({ idx, id, name, desc, skills = [], on, body = "", swatches, multi, step }) {
  const nat = (L.skill && skills.includes(L.skill));
  return `<article class="card ${on ? "on" : ""}" data-id="${id}">
    <span class="check">✓</span>${body}${swatches ? `<div class="sw">${swatches.map((c) => `<i style="background:${c}"></i>`).join("")}</div>` : ""}
    <div class="meta"><span class="num">${idx}</span><b>${esc(name)}</b><span>${esc(desc)}</span><div class="sk">${skills.map((s) => `<i class="${s === L.skill ? "native" : ""}">${esc((SKILLS[s] || { name: s }).name)}</i>`).join("")}${nat ? "" : ""}</div></div>
    <div class="acts"><button class="btn take">${on ? (multi ? "Marcado ✓" : "Escolhido ✓") : multi ? "Marcar" : "Escolher"}</button><button class="btn more">Mais como essa</button></div>
    <div class="more-box"><input placeholder="o que mudar? ex.: mais fina, sem sombra…"><button class="btn sm">Pedir</button></div>
  </article>`;
}
function wireCards(step, multi) {
  $$(".card:not(.uf)").forEach((el) => {
    const id = el.dataset.id;
    $(".take", el).onclick = () => { pick(step, id, multi); renderStep(); rebuildMain(); autosave(); };
    $(".more", el).onclick = () => el.classList.toggle("more");
    $(".more-box .btn", el).onclick = () => { const v = $(".more-box input", el).value.trim(); L.extras.push({ step, base: id, ask: v || "variação parecida" }); el.classList.remove("more"); autosave(); toast(`Pedido anotado: ${v || "variação parecida"} (base: ${id})`); renderNav(); };
  });
}
function pick(step, id, multi) {
  if (id.startsWith("lds-in:")) { const v = id.slice(7); L.ldsEntrada = L.ldsEntrada === v ? null : v; L.preset = null; rebuildMain(); return; }
  if (multi) { const a = L[step]; const i = a.indexOf(id); i >= 0 ? a.splice(i, 1) : a.push(id); }
  else L[step] = L[step] === id ? null : id;
  if (step === "captions" && !isLds()) L.ldsEntrada = null;
  if (step !== "review") L.preset = null;
}
// GIF card body (LDS catalogue previews are 1080×420 strips)
const gifFrame = (src) => `<div class="frame gif" style="padding-bottom:62%"><img src="${esc(src)}" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain"></div>`;
const divider = (title, sub) => `<div class="divider" style="grid-column:1/-1"><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;

// ---- preset cards: a mini frame of the clip with the preset's hook and first caption word in its colours/fonts.
// A generated tile at assets/presets/<id>.png|jpg (see assets/presets/PROMPT-CHATGPT.md) replaces the drawn one.
const PRESET_IMG = {};
async function loadPresetImages() {
  try { const r = await fetch("/api/preset-images").then((x) => x.json()); Object.assign(PRESET_IMG, r.images || {}); } catch {}
  if (Object.keys(PRESET_IMG).length && UI.step === 0) renderStep();
}
// landing-page mockup kind per preset (templates and kit looks alike)
const MOCK_KIND = { "tpl-business-reels": "negocios", "tpl-personal-reels": "pessoal", "tpl-explainer-panel": "painel", "tpl-glass-explainer": "vidro", "tpl-visual-essay": "ensaio", "tpl-split-reel": "split", "tpl-broll-stacked": "broll", "tpl-fitted-captions": "encaixe", "tpl-image-cluster": "cluster", "tpl-cutout-backdrop": "recorte", "tpl-cutout-grid": "grade", "tpl-depth-ui": "profundo", "tpl-ranking-format": "ranking", "tpl-tiktok-style": "negocios", "tpl-yap-and-show": "cluster", "tpl-clone-versus": "grade", "tpl-cinematic-type": "ensaio", "tpl-top5": "ranking", "tpl-if-then": "painel", "tpl-this-vs-that": "vidro", "tpl-rapid-list": "clipes", "tpl-natural-story": "recorte", "tpl-ear-to-ear": "youtube", "tpl-tips-breakdown": "chamada", "tpl-youtube-clips": "clipes", "tpl-dual-role": "grade", "tpl-vlog": "broll", "tpl-educational-youtube": "youtube", "tpl-split-screen-document": "chamada", "tpl-coaching-call-clips": "clipes", "tpl-lesson-doc": "chamada",
  "tf-bold": "encaixe", "tf-cool-girl": "cluster", "tf-cool-dude": "ensaio", celular: "pessoal", editorial: "cluster", anuncio: "painel", colagem: "recorte", explicativo: "split", "vsl-roxo": "vidro", "vsl-clean": "encaixe", aurora: "vidro", vox: "ensaio", zee: "profundo", castilho: "negocios" };
const WIDE = new Set(["tpl-ear-to-ear", "tpl-tips-breakdown", "tpl-educational-youtube", "tpl-split-screen-document", "tpl-coaching-call-clips", "tpl-lesson-doc"]);
function presetCard(p, big = false) {
  const ratio = (UI.H / UI.W) * 100;
  const img = PRESET_IMG[p.id];
  const frame = !p.skill ? `<div class="pframe blank">∅</div>`
    : img ? `<div class="pframe" style="padding-bottom:${Math.min(ratio, 100)}%"><img src="${img}" alt="" loading="lazy"></div>`
    : p.live ? `<div class="pframe live" style="padding-bottom:177.8%"><div class="cam" style="background-image:url(${posterUrl()})"></div><div class="world" style="width:${UI.W}px;height:${UI.H}px"></div><i class="play">▶</i></div>`
    : `<div class="pframe has-sketch ${WIDE.has(p.id) ? "wide" : ""}" style="padding-bottom:${WIDE.has(p.id) ? 56.25 : 177.8}%"><div class="sk">${MOCK_KIND[p.id] ? mockupHtml(MOCK_KIND[p.id], WIDE.has(p.id)) : sketchFor(p, (byId(COLOURS, p.picks.colours) || COLOURS[0]).vars.acc, isLds() ? L.captions : null)}</div><div class="cam" style="background-image:url(${posterUrl()})"></div><div class="world" style="width:${UI.W}px;height:${UI.H}px"></div><i class="play">▶</i></div>`;
  const acc = p.picks.colours ? (byId(COLOURS, p.picks.colours) || {}).vars?.acc || "#333" : "#333";
  return `<button class="preset ${big ? "big" : ""} ${L.preset === p.id ? "on" : ""}" data-p="${p.id}" title="${esc(p.desc)}" style="--pacc:${acc}">${frame}<b>${esc(p.name)}<small>${p.skill ? (WIDE.has(p.id) || p.landscape ? "16:9" : "9:16") : ""}</small></b><span>${esc(big ? p.desc : p.skill ? (SKILLS[p.skill] || {}).name || p.skill : "nada marcado")}</span>${p.skill ? `<em class="src">${esc(sourceOf(p))}</em>` : ""}</button>`;
}
// Static mini preview (hook + first caption word + first element); on hover the card plays a short loop.
function presetScene(p) {
  const s = withPick({ colours: p.picks.colours, fonts: p.picks.fonts });
  const el = (p.picks.elements || []).map((id) => byId(ELEMENTS, id)).find(Boolean);
  // a 15 s template scene is the whole look: no stand-in hook or captions on top of it
  const isScene = !!(el && el.scene);
  const hook = byId(HOOKS, p.picks.hook && p.picks.hook !== "none" ? p.picks.hook : isScene ? "none" : "big-caps");
  const caps = (isLds() && capById(L.captions)) || capById(p.picks.captions && p.picks.captions !== "none" ? p.picks.captions : isScene ? "none" : "one-word-outline") || byId(CAPTIONS, "one-word-outline");
  return { s, hook, caps, el, html: hook.render(s) + caps.render(s) + (el ? el.render(s) : "") };
}
const presetTls = new Map();
function fillPresetCards() {
  $$(".preset[data-p]").forEach((el) => {
    const p = byId(PRESETS, el.dataset.p); const w = $(".world", el), f = $(".pframe", el), camEl = $(".cam", el);
    if (!p || !p.skill || !w || !f) return;
    const scene = presetScene(p);
    const isScene = scene.el && scene.el.scene;
    let posterTl = null;
    // static frame: a 15 s scene is shown frozen a few seconds in (its layers all start hidden)
    const paint = () => {
      if (posterTl) { posterTl.kill(); posterTl = null; }
      w.innerHTML = scene.html; const first = $(".w", w); if (first) first.style.opacity = 1; const e = $(".el", w);
      if (e && isScene) { posterTl = gsap.timeline({ paused: true }); scene.el.anim(posterTl, e, camEl); posterTl.seek(scene.el.poster || 4.5); }
      else if (e && scene.el && scene.el.camera) e.style.opacity = 0.9;
    };
    paint();
    w.style.transform = `scale(${f.clientWidth / UI.W})`;
    el.onmouseenter = () => {
      if (presetTls.get(el)) return;
      if (posterTl) { posterTl.kill(); posterTl = null; } if (camEl) gsap.set(camEl, { clearProps: "all" });
      w.innerHTML = scene.html;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      const h = $(".hook", w); if (h) scene.hook.anim(tl, h);
      playCaptions(tl, w, scene.caps, 0.3, isScene ? scene.el.dur || 15 : 0);
      const e = $(".el", w); if (e) { const m = byId(MOTIONS, (p.picks.motion || [])[0]) || byId(MOTIONS, "blur-rise"); const sub = gsap.timeline(); if (scene.el.anim) scene.el.anim(sub, e, camEl); else if (!m.camera) m.anim(sub, e, camEl); else byId(MOTIONS, "blur-rise").anim(sub, e); tl.add(sub, isScene ? 0 : 1.0); }
      tl.to({}, { duration: 1.2 });
      presetTls.set(el, tl); el.classList.add("playing");
    };
    el.onmouseleave = () => { const tl = presetTls.get(el); if (tl) { tl.kill(); presetTls.delete(el); } if (camEl) gsap.set(camEl, { clearProps: "all" }); paint(); el.classList.remove("playing"); };
  });
}

// ---- the user's font folder (server indexes it; /api/userfonts searches; /userfont/<id> serves the file)
const UF = { dir: null, total: 0, families: 0, items: [], q: "", role: "display", loaded: false, offset: 0 };
const UF_ROLES = [["display", "Display (títulos)"], ["body", "Corpo (legendas)"], ["serif", "Voz serifada"], ["hand", "Manuscrita"], ["mono", "Mono / UI"]];
async function loadUserFonts(q = UF.q, offset = 0) {
  try { const r = await fetch(`/api/userfonts?q=${encodeURIComponent(q)}&limit=48&offset=${offset}`).then((x) => x.json()); Object.assign(UF, { dir: r.dir, total: r.total, families: r.families, items: offset ? UF.items.concat(r.items) : r.items, loaded: true, offset }); } catch { UF.loaded = true; }
  if (UI.step === 1) renderStep();
}
function userFontsSection() {
  const used = Object.entries(L.userFonts || {}).filter(([, u]) => u);
  const head = divider(`Minha pasta de fontes${UF.total ? ` (${UF.total.toLocaleString("pt-BR")} arquivos · ${UF.families.toLocaleString("pt-BR")} famílias)` : ""}`, UF.dir ? `${UF.dir}. Escolha o papel e clique numa fonte; ela substitui esse papel no par escolhido acima.` : "Pasta não encontrada: defina USER_FONTS=<pasta> ao iniciar o servidor.");
  const roles = `<div class="uf-bar" style="grid-column:1/-1"><div class="uf-roles">${UF_ROLES.map(([k, t]) => `<button class="${UF.role === k ? "on" : ""}" data-role="${k}">${t}${L.userFonts?.[k] ? ` <b>· ${esc(L.userFonts[k].name)}</b>` : ""}</button>`).join("")}</div><input id="ufSearch" placeholder="buscar fonte ou pasta… (ex.: script, bold, Rock)" value="${esc(UF.q)}" spellcheck="false">${used.length ? `<button class="btn sm" id="ufClear">Limpar fontes da pasta</button>` : ""}</div>`;
  if (!UF.loaded) { loadUserFonts(); return head + roles + `<p class="hint" style="grid-column:1/-1">Indexando a pasta… (a primeira vez pode levar alguns segundos)</p>`; }
  const sample = UF.role === "hand" ? UI.text.note : UF.role === "body" ? UI.text.words.slice(0, 3).join(" ") : UI.text.hook1;
  const cards = UF.items.map((f) => `<article class="card uf ${used.some(([, u]) => u.id === f.id) ? "on" : ""}" data-uf="${f.id}" data-name="${esc(f.name)}" data-file="${esc(f.folder)}"><div class="uf-sample" style="font-family:'uf-${f.id}',sans-serif" data-id="${f.id}">${esc(sample)}</div><div class="meta"><b>${esc(f.family)}</b><span>${esc(f.style)} · ${esc(f.folder || "raiz")}</span></div><div class="acts"><button class="btn take">Usar como ${esc(UF_ROLES.find(([k]) => k === UF.role)[1].split(" ")[0].toLowerCase())}</button></div></article>`).join("");
  const more = UF.items.length < UF.families ? `<button class="btn" id="ufMore" style="grid-column:1/-1;justify-self:center">Mostrar mais (${UF.items.length} de ${UF.families})</button>` : "";
  return head + roles + cards + more;
}
function wireUserFonts() {
  $$(".uf-roles button").forEach((b) => (b.onclick = () => { UF.role = b.dataset.role; renderStep(); }));
  const s = $("#ufSearch"); if (s) { s.oninput = () => { clearTimeout(s._t); s._t = setTimeout(() => { UF.q = s.value.trim(); loadUserFonts(UF.q, 0); }, 250); }; s.onkeydown = (e) => { if (e.key === "Enter") { UF.q = s.value.trim(); loadUserFonts(UF.q, 0); } }; }
  const m = $("#ufMore"); if (m) m.onclick = () => loadUserFonts(UF.q, UF.items.length);
  const c = $("#ufClear"); if (c) c.onclick = () => { L.userFonts = {}; renderStep(); rebuildMain(); autosave(); };
  // lazy @font-face per visible sample
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { ensureUserFontFace({ id: Number(en.target.dataset.id) }); io.unobserve(en.target); } }), { rootMargin: "200px" });
  $$(".uf-sample").forEach((el) => io.observe(el));
  $$(".card.uf .take").forEach((b) => (b.onclick = async (e) => {
    const card = e.target.closest(".card"); const id = Number(card.dataset.uf);
    let file = card.dataset.file; try { const r = await fetch(`/api/userfont-file?id=${id}`).then((x) => x.json()); if (r.file) file = r.file; } catch {}
    L.userFonts = { ...(L.userFonts || {}), [UF.role]: { id, name: card.dataset.name, file } };
    L.preset = null; renderStep(); rebuildMain(); autosave(); toast(`${card.dataset.name} agora é a fonte ${UF.role}.`);
  }));
}
// restore @font-face for fonts saved in a draft / look.json
function ensureSavedUserFonts() { Object.values(L.userFonts || {}).forEach((u) => u && ensureUserFontFace(u)); }

// cycle one-word captions inside an element
function cycleWords(tl, el, start = 0, dt = 0.34, hold = 0) {
  const ws = $$(".w", el); if (!ws.length) return;
  ws.forEach((w, i) => { tl.set(w, { opacity: 1 }, start + i * dt); tl.set(w, { opacity: 0 }, start + (i + 1) * dt + (i === ws.length - 1 ? hold : 0)); });
}
const entrance = (id) => byId(MOTIONS, id) || byId(MOTIONS, "blur-rise");

// ------------------------------------------------------------------ step renderers
function renderStep() {
  if (!UI.mode) return renderEntry();
  document.body.classList.remove("entry");
  UI.step = Math.max(0, Math.min(UI.step || 0, STEPS.length - 1));
  killCards();
  const st0 = STEPS[UI.step];
  // "Ajustar" (template path) reuses the colours / fonts / captions steps as tabs, plus a texts form
  const st = st0.id === "adjust" ? { ...st0, id: UI.adj || "texts" } : st0;
  renderNav();
  $("#stepKicker").textContent = `${UI.mode === "tpl" ? "Template" : "Do zero"} · passo ${UI.step + 1} de ${STEPS.length}`;
  $("#stepNum").textContent = String(UI.step + 1).padStart(2, "0");
  $("#stepTitle").textContent = st0.title;
  $("#progressBar").style.width = `${((UI.step + 1) / STEPS.length) * 100}%`;
  renderPicks();
  $("#stepHelp").textContent = st0.help;
  const grid = $("#grid"); grid.classList.toggle("wide", UI.landscape || st.id === "review");
  if (st.id === "template") {
    $("#quick").innerHTML = templateSections();
    $$("#quick button[data-open]").forEach((b) => (b.onclick = () => { UI.open[b.dataset.open] = !UI.open[b.dataset.open]; renderStep(); }));
  } else if (UI.mode === "free" && UI.step === 0) {
    $("#quick").innerHTML = `<button class="preset surprise mini-surprise" id="surprise" title="Um look coerente de uma skill, ao acaso">🎲 Surpreenda-me</button><span class="lbl">ou escolha peça por peça abaixo</span>`;
  } else $("#quick").innerHTML = "";
  if (st.id === "template") setTimeout(fillPresetCards, 0);
  // Legenda Dinâmica (EffectCraft) is part of the captions step on both paths, never behind "Avançado"
  if (st.id === "captions") {
    UI.capFilter = UI.capFilter || "all";
    const lds = LDS.available ? `${LDS.prontos.length} prontos · ${LDS.entradas.length} entradas` : "catálogo não encontrado";
    $("#quick").innerHTML = `<span class="lbl">Mostrar:</span>` +
      [["all", "Todas"], ["kit", "Kit HyperFrames"], ["lds", `Legenda Dinâmica · EffectCraft`]].map(([k, t]) => `<button class="${UI.capFilter === k ? "on" : ""}" data-f="${k}" ${k === "lds" && !LDS.available ? "disabled" : ""}>${t}</button>`).join("") +
      `<span class="lbl status ${LDS.available ? "ok" : ""}">${LDS.available ? "✓ Catálogo LDS carregado: " + lds : "LDS: " + lds + " (Desktop\\EFEECTCRAFT EDITOR CLAUDE\\catalogo ou LDS_CATALOG)"}</span>`;
    $$("#quick button[data-f]").forEach((b) => (b.onclick = () => { UI.capFilter = b.dataset.f; renderStep(); }));
  }
  if (st.id === "elements" || st.id === "motion") {
    UI.flt = UI.flt || { q: "", fam: "all" };
    const fams = [["all", "Todos"], ["oney", "Oney"], ["zee-effects", "Zee"], ["castilho-35", "35 efeitos"], ["lib", "style-library"], ["ajene-templates", "Templates"], ["altra-labs", "Altra"], ["tenfold", "Ten Fold"], ...(BN.available && UI.adv ? [["brand-nat", "Brand Nat"]] : [])];
    const all = { elements: ELEMENTS, motion: MOTIONS }[st.id];
    const cnt = (k) => all.filter((o) => (UI.adv || !o.code) && (k === "all" || (k === "oney" ? (o.skills || []).some((s) => /oney|vsl/.test(s)) : k === "lib" ? (o.skills || []).some((s) => /kallaway|vox/.test(s)) : (o.skills || []).includes(k)))).length;
    $("#quick").innerHTML = `<span class="lbl">Mostrar:</span>` + fams.map(([k, t]) => `<button class="${UI.flt.fam === k ? "on" : ""}" data-fam="${k}">${t} <small>${cnt(k)}</small></button>`).join("") + `<input id="fltSearch" placeholder="buscar… (ex.: celular, carimbo, zoom)" value="${esc(UI.flt.q)}" spellcheck="false">`;
    $$("#quick button[data-fam]").forEach((b) => (b.onclick = () => { UI.flt.fam = b.dataset.fam; renderStep(); }));
    const si = $("#fltSearch"); si.oninput = () => { clearTimeout(si._t); si._t = setTimeout(() => { UI.flt.q = si.value.trim(); const pos = si.selectionStart; renderStep(); const n = $("#fltSearch"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 220); };
  }
  if (st0.id === "adjust") {
    const tabs = [["texts", "Textos"], ["colours", "Cores"], ["fonts", "Fontes"], ["captions", "Legenda"]];
    $("#quick").innerHTML = `<div class="adj-tabs">${tabs.map(([k, t]) => `<button class="${st.id === k ? "on" : ""}" data-adj="${k}">${t}</button>`).join("")}</div>` + $("#quick").innerHTML;
    $$("#quick [data-adj]").forEach((b) => (b.onclick = () => { UI.adj = b.dataset.adj; renderStep(); }));
    // the tabs redraw the quick row: re-wire the buttons the reused step drew
    $$("#quick button[data-f]").forEach((b) => (b.onclick = () => { UI.capFilter = b.dataset.f; renderStep(); }));
  }
  if (st.id === "texts") { $("#grid").innerHTML = textsForm(); wireTextsForm(); return; }
  if (st.id === "template") { $("#grid").innerHTML = ""; $$("#quick button[data-p]").forEach((b) => (b.onclick = () => applyPreset(b.dataset.p))); return; }
  $$("#quick button[data-p]").forEach((b) => (b.onclick = () => applyPreset(b.dataset.p)));
  const sp = $("#surprise"); if (sp) sp.onclick = surprise;
  const s = S();
  if (st.id === "review") return renderReview(grid);
  const multi = st.id === "elements" || st.id === "motion";
  let list = st.id === "captions" && UI.capFilter === "lds" ? [] : { colours: COLOURS, fonts: FONTS, hook: HOOKS, captions: CAPTIONS, elements: ELEMENTS, motion: MOTIONS }[st.id];
  if ((st.id === "elements" || st.id === "motion") && UI.flt) {
    const famOf = (o) => (o.skills || []);
    const inFam = (o) => UI.flt.fam === "all" || (UI.flt.fam === "oney" ? famOf(o).some((k) => /oney|vsl/.test(k)) : UI.flt.fam === "lib" ? famOf(o).some((k) => /kallaway|vox/.test(k)) : famOf(o).includes(UI.flt.fam));
    const q = UI.flt.q.toLowerCase();
    list = list.filter((o) => (inFam(o) || L[st.id].includes(o.id)) && (!q || `${o.name} ${o.desc || ""}`.toLowerCase().includes(q)));
  }
  if (!UI.adv && list) list = list.filter((o) => !o.code || (Array.isArray(L[st.id]) ? L[st.id].includes(o.id) : L[st.id] === o.id));
  let ldsItems = [];
  let html = list.map((o, i) => card({
    idx: i + 1, id: o.id, name: o.name, desc: o.sub || o.desc, skills: o.skills, multi, step: st.id,
    on: multi ? L[st.id].includes(o.id) : L[st.id] === o.id,
    swatches: st.id === "colours" ? [o.vars.bg, o.vars.acc, o.vars.txt, o.vars.sec] : null,
    body: frameHtml(st.id === "colours" ? withPick({ colours: o.id }) : st.id === "fonts" ? withPick({ fonts: o.id }) : s),
  })).join("");
  if (st.id === "fonts") html += userFontsSection();
  // Legenda Dinâmica (EffectCraft): real GIF previews from the user's catalogue
  if (st.id === "captions" && LDS.available && UI.capFilter !== "kit") {
    html += divider(`Legenda Dinâmica · EffectCraft (${LDS.prontos.length})`, "Prontos do Legenda Dinâmica Studio: palavra-chave gigante, conectivos pequenos, entrada palavra por palavra. Prévia real do catálogo; no palco à esquerda, uma aproximação nas suas cores. A entrada se escolhe no passo Motion.");
    // same 9:16 card as the kit captions, rendered over the clip in the look's colours and fonts; the catalogue GIF stays as an inset
    html += LDS.prontos.map((p, i) => card({ idx: list.length + i + 1, id: `lds:${p.id}`, name: p.name, desc: `${p.modelo} · entrada ${p.entrada} · saída ${p.saida}`, skills: ["legenda-dinamica-studio"], multi: false, step: "captions", on: L.captions === `lds:${p.id}`, body: frameHtml(s).replace("</div></div>", `</div><img class="gif-inset" src="${esc(p.gif)}" alt="" loading="lazy" title="Prévia original do catálogo"></div>`) })).join("");
    ldsItems = LDS.prontos.map(ldsCaption);
  }
  if (st.id === "motion" && LDS.available && isLds()) {
    html += divider("Entrada da Legenda Dinâmica", "Troca a entrada do pronto escolhido. Uma só; sem escolher, vale a entrada do pronto.");
    html += LDS.entradas.map((e, i) => card({ idx: list.length + i + 1, id: `lds-in:${e.id}`, name: e.name, desc: `entrada "${e.id}"`, skills: ["legenda-dinamica-studio"], multi: false, step: "motion", on: L.ldsEntrada === e.id, body: gifFrame(e.gif) })).join("");
  }
  grid.innerHTML = html;
  wireCards(st.id, multi);
  if (st.id === "fonts") wireUserFonts();
  setTimeout(() => { scaleWorlds(); const cards = $$(".card"); [...list, ...ldsItems].forEach((o, i) => fillCard(st.id, o, cards[i])); }, 0);
}

// one-word captions cycle; LDS screens also reveal word by word
function playCaptions(tl, root, caps, start, span = 0) {
  if (!caps) return;
  const c = $(".caps", root); if (!c) return;
  // span > 0 (a 15 s template scene): spread the words over the whole scene instead of the quick cycle
  const n = $$(".w", c).length || 1;
  const dt = span ? Math.max(0.34, (span - start - 0.4) / n) : caps.mode === "phrase" ? 1.2 : caps.mode === "lds" ? 1.3 : 0.34;
  cycleWords(tl, c, start, dt);
  if (caps.capAnim) caps.capAnim(tl, c, start, dt);
  else if (caps.mode === "phrase") $$(".w", c).forEach((x, i) => tl.fromTo(x, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, start + i * dt));
  if (caps.mode === "lds") $$(".w", c).forEach((x, i) => tl.from($$(".ldw", x), { y: 14, opacity: 0, scale: 0.92, duration: 0.22, stagger: 0.18, ease: "back.out(1.6)" }, start + i * dt));
}
function fillCard(step, o, el) {
  if (!el) return;
  const w = $(".world", el), camEl = $(".cam", el);
  if (!w) return;
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: false });
  cardTls.push(tl);
  if (step === "colours" || step === "fonts") {
    const s = step === "colours" ? withPick({ colours: o.id }) : withPick({ fonts: o.id });
    const hook = byId(HOOKS, L.hook) || byId(HOOKS, step === "fonts" ? "serif-stack" : "big-caps");
    const caps = capById(L.captions) || byId(CAPTIONS, "one-word-outline");
    w.innerHTML = (hook.id === "none" ? byId(HOOKS, "big-caps") : hook).render(s) + caps.render(s);
    const h = $(".hook", w); if (h) hook.anim(tl, h);
    playCaptions(tl, w, caps, 0.4);
    return;
  }
  if (step === "hook") { w.innerHTML = o.render(S()); const h = $(".hook", w); if (h) o.anim(tl, h); tl.to({}, { duration: 1.2 }); return; }
  if (step === "captions") { w.innerHTML = o.render(o.mode === "lds" ? { ...S(), ldsIn: null } : S()); playCaptions(tl, w, o, 0.1); tl.to({}, { duration: 0.8 }); return; }
  if (step === "elements") {
    w.innerHTML = o.render(S());
    const e = $(".el", w); if (!e) return;
    if (o.scene) { o.anim(tl, e, camEl); tl.to({}, { duration: 0.6 }); tl.seek(o.poster || 4.5); return; }
    if (o.anim) { o.anim(tl, e, camEl); tl.to({}, { duration: 1.2 }); return; }
    const m = entrance(L.motion[0]);
    if (m.camera) byId(MOTIONS, "blur-rise").anim(tl, e); else m.anim(tl, e, camEl);
    const tick = byId(MOTIONS, "count-tick"); if ($(".num,.bar", e)) tick.anim(tl, e);
    $$("path", e).forEach((p) => { const Lz = p.getTotalLength(); p.style.strokeDasharray = Lz; tl.fromTo(p, { strokeDashoffset: Lz }, { strokeDashoffset: 0, duration: 0.45 }, 0.3); });
    const li = $$(".li,.row,.th,.ch", e); if (li.length) tl.from(li, { opacity: 0, y: 10, duration: 0.3, stagger: 0.15 }, 0.2);
    const strip = $(".strip", e); if (strip) tl.to(strip, { x: -700, duration: 3, ease: "none" }, 0);
    tl.to({}, { duration: 1.6 });
    return;
  }
  if (step === "motion") {
    w.innerHTML = motionDemo(o, S());
    const demo = $(".demo", w);
    o.anim(tl, demo, camEl);
    if (o.camera) { tl.to({}, { duration: 0.6 }); }
    tl.to({}, { duration: 1 });
  }
}
function motionDemo(o, s) {
  const base = `position:absolute;`;
  const txtOnAcc = /ffd21f|f4e27c|F5D82A|ffffff/.test(s.v.acc) ? "#111" : "#fff";
  if (o.demo === "cards") return `<div class="ov demo" style="${base}left:${s.W / 2 - 120}px;top:${s.headTop - 420}px;display:flex;gap:24px">${[0, 1, 2, 3].map((i) => `<div class="dc" style="width:160px;height:240px;border-radius:20px;background:${i === 1 ? s.v.acc : "#fff"};box-shadow:0 20px 50px rgba(0,0,0,.4);flex:none"></div>`).join("")}</div>`;
  if (o.demo === "orbit") return `<div class="ov demo" style="${base}left:${s.W / 2 - 330}px;top:${s.headTop - 60}px;width:660px;height:660px"><div class="ring" style="position:absolute;inset:0">${[0, 1, 2, 3, 4].map((i) => { const a = i * 72 * Math.PI / 180; return `<div class="ph" style="position:absolute;left:${330 + Math.cos(a) * 300 - 60}px;top:${330 + Math.sin(a) * 300 - 80}px;width:120px;height:160px;border-radius:16px;background:${i ? "#fff" : s.v.acc};box-shadow:0 10px 30px rgba(0,0,0,.4)"></div>`; }).join("")}</div></div>`;
  if (o.demo === "burst") return `<div class="ov demo" style="${base}left:${s.W / 2}px;top:${s.headTop + 300}px">${Array.from({ length: 12 }).map((_, i) => { const a = i * 30 * Math.PI / 180, r = 380 + (i % 3) * 90; return `<div class="th" style="position:absolute;left:${Math.cos(a) * r - 70}px;top:${Math.sin(a) * r * .8 - 100}px;width:140px;height:200px;border-radius:18px;background:linear-gradient(${i * 30}deg,#333,#111);box-shadow:0 14px 40px rgba(0,0,0,.4)"></div>`; }).join("")}</div>`;
  if (o.demo === "flash") return `<div class="ov demo" style="${base}left:0;top:0;width:${s.W}px;height:${s.H}px"><div class="fl" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,#fff,${s.v.acc} 60%,transparent 100%)"></div></div>`;
  // default: a colour card with the keyword
  return `<div class="ov demo" style="${base}left:${s.W / 2 - 280}px;top:${s.headTop - 460}px;width:560px;height:330px;border-radius:28px;background:${s.v.acc};color:${txtOnAcc};display:flex;align-items:center;justify-content:center;font-family:${s.font.display};font-weight:${s.font.dw};font-size:92px;box-shadow:0 30px 80px rgba(0,0,0,.4)"><svg viewBox="0 0 200 60" style="position:absolute;left:-200px;top:40%;width:180px;height:60px;overflow:visible"><path d="M4 30 H160 M130 8 L170 30 L130 52" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>${esc(s.text.keyword)}</div>`;
}

// ------------------------------------------------------------------ main preview composition
function rebuildMain() {
  if (mainTl) mainTl.kill();
  const s = S();
  gsap.set([cam, camFg], { clearProps: "all" });
  const hook = byId(HOOKS, L.hook), caps = capById(L.captions);
  const els = L.elements.map((id) => byId(ELEMENTS, id)).filter(Boolean);
  const html = (hook ? hook.render(s) : "") + (caps ? caps.render(s) : "") + els.map((e) => e.render(s)).join("");
  // Parts marked .back pass behind the person: with the live cut-out on, the look is rendered twice
  // (behind copy under the person canvas, front copy over it) and both copies share this timeline.
  UI.hasBack = hasBack(html);
  const matte = UI.hasBack && matteWanted();
  stage.classList.toggle("matte-on", matte);
  world.innerHTML = html;
  worldBack.innerHTML = matte ? html : "";
  mainTl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
  const sceneDur = Math.max(0, ...els.map((d) => (d.scene ? d.dur || 15 : 0)));
  const camT = matte ? [cam, camFg] : cam;
  buildLayer(world, camT, { hook, caps, els, sceneDur });
  if (matte) buildLayer(worldBack, null, { hook, caps, els, sceneDur });
  const motions = L.motion.map((m) => byId(MOTIONS, m)).filter(Boolean);
  motions.filter((m) => m.camera).forEach((m, i) => { const t = gsap.timeline(); m.anim(t, null, camT); mainTl.add(t, 3 + i * 3); });
  const total = Math.max(5, sceneDur, 3.2 + els.reduce((a, d) => a + (d.scene ? 0 : d.anim ? 3.2 : 1.5), 0) + 1.5, caps && !sceneDur ? 0.3 + $$(".w", world).length * (caps.mode === "lds" ? 1.3 : caps.mode === "phrase" ? 1.2 : 0.34) + 0.5 : 0);
  mainTl.to({}, { duration: 0.1 }, total);
  updateMatteUi();
  if (matte) startLiveMatte(); else stopLiveMatte();
  $("#jsonPre").textContent = JSON.stringify(lookJson(), null, 2);
  autosave();
}
// one copy of the look (hook, captions, elements) animated on mainTl; camT is the camera target (null = don't move it)
function buildLayer(root, camT, { hook, caps, els, sceneDur }) {
  const h = $(".hook", root);
  if (h && hook) { hook.anim(mainTl, h); mainTl.to(h, { opacity: 0, duration: 0.25 }, 3.2); }
  playCaptions(mainTl, root, caps, 0.3, sceneDur);
  const objM = L.motion.map((m) => byId(MOTIONS, m)).filter((m) => m && !m.camera);
  let tNext = 2.9;
  $$(".el", root).forEach((e, i) => {
    const def = els[i];
    if (def && def.scene) { const sub = gsap.timeline(); def.anim(sub, e, camT); mainTl.add(sub, 0); return; }
    const t0 = tNext; tNext += def && def.anim ? 3.2 : 1.5;
    gsap.set(e, { opacity: 0 }); mainTl.set(e, { opacity: 1 }, t0);
    if (def && def.anim) { const sub = gsap.timeline(); def.anim(sub, e, camT); mainTl.add(sub, t0); mainTl.to(e, { opacity: 0, duration: 0.25 }, t0 + 3.0); return; }
    const m = objM[i % Math.max(1, objM.length)] || byId(MOTIONS, "blur-rise");
    const sub = gsap.timeline(); m.anim(sub, e, camT); mainTl.add(sub, t0);
    if ($(".num,.bar", e)) { const t = gsap.timeline(); byId(MOTIONS, "count-tick").anim(t, e); mainTl.add(t, t0 + 0.2); }
    $$("path", e).forEach((p) => { const Lz = p.getTotalLength(); p.style.strokeDasharray = Lz; mainTl.fromTo(p, { strokeDashoffset: Lz }, { strokeDashoffset: 0, duration: 0.45 }, t0 + 0.2); });
    const li = $$(".li,.row,.ch", e); if (li.length) mainTl.from(li, { opacity: 0, y: 10, duration: 0.3, stagger: 0.18 }, t0 + 0.1);
    const strip = $(".strip", e); if (strip) mainTl.to(strip, { x: -900, duration: 4, ease: "none" }, t0);
    mainTl.to(e, { opacity: 0, duration: 0.25 }, t0 + 2.6);
  });
}

// ---- live cut-out of the person (MediaPipe Image Segmenter in the browser, selfie model). Draws the presenter with an
// alpha mask into #fgCanvas, which sits between the behind copy and the front copy of the look and follows the camera.
let segmenter = null, segLoading = null, matteLoop = 0, segCanvas = null, segCtx = null;
const matteWanted = () => !!(UI.clip && video.videoWidth && $("#liveMatte") && $("#liveMatte").checked);
async function loadSegmenter() {
  if (segmenter) return segmenter;
  if (segLoading) return segLoading;
  segLoading = (async () => {
    const base = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10";
    const mp = await import(`${base}/vision_bundle.mjs`);
    const vision = await mp.FilesetResolver.forVisionTasks(`${base}/wasm`);
    segmenter = await mp.ImageSegmenter.createFromOptions(vision, {
      baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite", delegate: "GPU" },
      runningMode: "VIDEO", outputConfidenceMask: true, outputCategoryMask: false,
    });
    return segmenter;
  })();
  try { return await segLoading; } catch (e) { segLoading = null; throw e; }
}
function startLiveMatte() {
  if (matteLoop) return;
  matteLoop = 1;
  $("#matteState").textContent = "recortando…";
  loadSegmenter().then(() => { if (matteLoop) { matteLoop = 2; updateMatteUi(); drawMatte(); } }).catch(() => {
    matteLoop = 0; $("#liveMatte").checked = false; toast("Não consegui carregar o recorte ao vivo (precisa de internet para baixar o modelo)."); rebuildMain();
  });
}
function stopLiveMatte() { matteLoop = 0; const c = $("#fgCanvas"); if (c && c.width) c.getContext("2d").clearRect(0, 0, c.width, c.height); }
let lastSegT = -1, segStamp = 0;
function drawMatte() {
  if (matteLoop !== 2) return;
  const next = () => (video.requestVideoFrameCallback ? video.requestVideoFrameCallback(drawMatte) : requestAnimationFrame(drawMatte));
  if (!video.videoWidth || video.readyState < 2 || (video.paused && video.currentTime === lastSegT)) { requestAnimationFrame(drawMatte); return; }
  lastSegT = video.currentTime;
  const out = $("#fgCanvas");
  const w = Math.min(540, video.videoWidth), h = Math.round(w * video.videoHeight / video.videoWidth);
  if (out.width !== w || out.height !== h) { out.width = w; out.height = h; }
  if (!segCanvas) { segCanvas = document.createElement("canvas"); segCtx = segCanvas.getContext("2d", { willReadFrequently: true }); }
  if (segCanvas.width !== w || segCanvas.height !== h) { segCanvas.width = w; segCanvas.height = h; }
  segCtx.drawImage(video, 0, 0, w, h);
  segStamp = Math.max(segStamp + 1, performance.now());
  let res;
  try { res = segmenter.segmentForVideo(segCanvas, segStamp); } catch { next(); return; }
  const mask = res && res.confidenceMasks && res.confidenceMasks[0];
  if (mask) {
    const mw = mask.width, mh = mask.height, m = mask.getAsFloat32Array();
    const img = segCtx.getImageData(0, 0, w, h), d = img.data;
    for (let y = 0; y < h; y++) {
      const my = Math.min(mh - 1, (y * mh / h) | 0) * mw;
      for (let x = 0; x < w; x++) {
        const v = m[my + Math.min(mw - 1, (x * mw / w) | 0)];
        d[(y * w + x) * 4 + 3] = v <= 0.35 ? 0 : v >= 0.65 ? 255 : ((v - 0.35) / 0.3) * 255;
      }
    }
    out.getContext("2d").putImageData(img, 0, 0);
  }
  if (res && res.close) res.close();
  next();
}
function updateMatteUi() {
  const box = $("#matteBox"); if (!box) return;
  box.hidden = !UI.hasBack;
  const st = $("#matteState");
  if (!UI.clip) st.textContent = "abra um clipe";
  else if (!$("#liveMatte").checked) st.textContent = "desligado: o fundo abre um buraco em volta da pessoa";
  else if (matteLoop === 2) st.textContent = "pessoa na frente, efeitos atrás";
}

// ------------------------------------------------------------------ review
function guessSkill() {
  if (L.skill) return L.skill;
  const votes = {};
  const add = (o) => o && (o.skills || []).forEach((k) => (votes[k] = (votes[k] || 0) + 1));
  add(byId(COLOURS, L.colours)); add(byId(FONTS, L.fonts)); add(byId(HOOKS, L.hook)); if (!isLds()) add(capById(L.captions));
  L.elements.forEach((id) => add(byId(ELEMENTS, id))); L.motion.forEach((id) => add(byId(MOTIONS, id)));
  return Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}
function captionsJson() {
  const c = capById(L.captions); if (!c) return null;
  if (c.mode !== "lds") return { id: L.captions, name: c.name };
  const ent = byId(LDS.entradas, L.ldsEntrada);
  return { id: L.captions, name: c.name, engine: "legenda-dinamica-studio", skillCommand: "/legenda",
    lds: { pronto: c.lds.id, prontoName: c.lds.name, modelo: c.lds.modelo, entradaPadrao: c.lds.entrada, saida: c.lds.saida, entradaId: L.ldsEntrada, entradaName: ent ? ent.name : null } };
}
function conflicts(skill) { return skill ? CONFLICTS.filter((c) => c.skill === skill && c.test(L)).map((c) => c.msg) : []; }
function lookJson() {
  const skill = guessSkill();
  const name = (arr, id) => (byId(arr, id) || {}).name || null;
  return {
    version: 1, tool: "tools/look-builder", clip: UI.clip, orientation: UI.landscape ? "16:9" : "9:16", canvas: { width: UI.W, height: UI.H },
    framing: { headTop: UI.headTop, capTop: UI.capTop },
    preset: L.preset, skill, skillCommand: skill ? SKILLS[skill].cmd : null,
    colours: L.colours ? { id: L.colours, name: name(COLOURS, L.colours), ...byId(COLOURS, L.colours).vars } : null,
    fonts: L.fonts || Object.keys(L.userFonts || {}).length ? { id: L.fonts, name: L.fonts ? name(FONTS, L.fonts) : "só fontes da pasta", display: L.fonts ? byId(FONTS, L.fonts).display : null, body: L.fonts ? byId(FONTS, L.fonts).body : null, serif: (L.fonts && byId(FONTS, L.fonts).serif) || null, hand: (L.fonts && byId(FONTS, L.fonts).hand) || null, custom: Object.keys(L.userFonts || {}).length ? L.userFonts : undefined } : null,
    userFonts: Object.keys(L.userFonts || {}).length ? L.userFonts : undefined,
    hook: L.hook ? { id: L.hook, name: name(HOOKS, L.hook) } : null,
    captions: captionsJson(), ldsEntrada: L.ldsEntrada,
    elements: L.elements.map((id) => ({ id, name: name(ELEMENTS, id) })),
    motion: L.motion.map((id) => ({ id, name: name(MOTIONS, id) })),
    // parts marked .back pass behind the presenter: the edit needs the person cut out (layers.mjs)
    matte: { needed: !!UI.hasBack, how: UI.hasBack ? "npx hyperframes remove-background <clip> -o assets/matte.webm; stack: video, .back parts, matte, the rest" : null },
    sampleText: UI.text, extras: L.extras, notes: L.notes, conflicts: conflicts(skill),
    brandNat: brandNatJson(),
  };
}
// Brand Nat codes picked anywhere (hook, captions, elements, motion) plus the finish picks (S/G)
function brandNatCodes() {
  const codes = [];
  const h = byId(HOOKS, L.hook); if (h && h.code) codes.push(h.code);
  const c = capById(L.captions); if (c && c.code) codes.push(c.code);
  L.elements.forEach((id) => { const e = byId(ELEMENTS, id); if (e && e.code) codes.push(e.code); });
  L.motion.forEach((id) => { const m = byId(MOTIONS, id); if (m && m.code) codes.push(m.code); });
  (L.finishes || []).forEach((code) => codes.push(code));
  return [...new Set(codes)];
}
function brandNatJson() { const codes = brandNatCodes(); return codes.length ? { codes, finishes: L.finishes || [], guide: BN.dir, command: `Edit <video> with ${codes.join(" ")}` } : undefined; }
function promptText() {
  const j = lookJson(); const slug = $("#slug").value.trim() || "meu-video";
  const cmd = j.skillCommand || "/edit-video";
  const list = (a) => a.map((x) => x.name).join(", ") || "—";
  return `${cmd} edita "${UI.clip || "<caminho do vídeo>"}" no projeto video-projects/${slug}.
Siga video-projects/${slug}/look.json (gerado pelo Look builder) em todas as decisões visuais:
- Cores: ${j.colours?.name || "—"} · Fontes: ${j.fonts?.name || "—"}${j.userFonts ? ` · da pasta do aluno: ${Object.entries(j.userFonts).filter(([, u]) => u).map(([r, u]) => `${r} = ${u.name} (${u.file})`).join("; ")} (copie os arquivos para assets/fonts e declare @font-face)` : ""}
- Gancho: ${j.hook?.name || "—"} · Legendas: ${j.captions?.name || "—"}
- Elementos: ${list(j.elements)}
- Motion: ${list(j.motion)}
- Topo da cabeça ≈ ${UI.headTop}px, legenda em ${UI.capTop}px (${j.orientation}).${j.captions && j.captions.lds ? `\n- LEGENDAS no EffectCraft (skill legenda-dinamica-studio, /legenda): pronto "${j.captions.lds.prontoName}" (${j.captions.lds.modelo}), entrada ${j.captions.lds.entradaName || j.captions.lds.entradaPadrao}, saída ${j.captions.lds.saida}. Deixe a faixa da legenda livre na composição HyperFrames e entregue words.json para o LDS.` : ""}${j.brandNat ? `\n- Códigos Brand Nat escolhidos (skill brand-nat-styles): ${j.brandNat.codes.join(" ")}. Se for usar essa skill: "Edit <vídeo> with ${j.brandNat.codes.join(" ")}".` : ""}${j.extras.length ? `\n- Variações pedidas: ${j.extras.map((e) => `${e.base} → ${e.ask}`).join("; ")}` : ""}${j.notes ? `\n- Notas: ${j.notes}` : ""}${j.conflicts.length ? `\n- Atenção, o look conflita com a skill: ${j.conflicts.join(" ")} Resolva com o aluno antes de montar.` : ""}
Mostre o mapa de beats antes de montar e não publique nada.`;
}
function renderReview(grid) {
  const skill = guessSkill(); const cf = conflicts(skill); const j = lookJson();
  const row = (k, v) => `<li><b>${k}:</b> ${v || "<em style='color:var(--faint)'>não escolhido</em>"}</li>`;
  grid.innerHTML = `<div class="review" style="grid-column:1/-1">
    <div class="box actions"><h3>Agora</h3><ol class="next-steps">
      <li><button class="btn test" data-act="test"><span class="ic">▶</span>Ver render de verdade</button><span>Renderiza um trecho do seu clipe com o HyperFrames, igual vai ficar. ${UI.hasBack ? "Na primeira vez, o recorte da pessoa leva alguns minutos." : "Uns 30 segundos."}</span></li>
      <li><button class="btn primary" data-act="save"><span class="ic">✓</span>Salvar e usar no Claude</button><span>Grava o look no projeto <code>video-projects/${esc($("#slug").value || "meu-reel")}</code> e copia o pedido. Cole no Claude junto com o seu vídeo.</span></li>
    </ol></div>
    <div class="box"><h3>Seu look</h3><ul>
      ${row("Cores", j.colours?.name)}${row("Fontes", j.fonts?.name)}${row("Gancho", j.hook?.name)}${row("Legendas", j.captions ? j.captions.name + (j.captions.lds ? ` <em style="color:var(--dim)">(EffectCraft · entrada ${esc(j.captions.lds.entradaName || j.captions.lds.entradaPadrao)})</em>` : "") : null)}
      ${row("Elementos", j.elements.map((x) => x.name).join(", "))}${row("Motion", j.motion.map((x) => x.name).join(", "))}
      ${row("Enquadramento", `cabeça ${UI.headTop}px · legenda ${UI.capTop}px · ${j.orientation}`)}</ul>
      ${L.extras.length ? `<h3 style="margin-top:14px">Variações pedidas</h3><ul>${L.extras.map((e, i) => `<li>${esc(e.base)} → ${esc(e.ask)} <a href="#" data-x="${i}">remover</a></li>`).join("")}</ul>` : ""}
    </div>
    <div class="box ${UI.adv ? "" : "adv-only"}"><h3>Skill que vai executar</h3>
      <div class="skillpick">${Object.entries(SKILLS).map(([k, v]) => `<button class="${k === skill ? "on" : ""}" data-s="${k}">${esc(v.name)}</button>`).join("")}</div>
      <p style="color:var(--dim);margin:10px 0 0">${skill ? esc(SKILLS[skill].note) : "Escolha uma skill ou deixe o palpite (a mais votada pelas suas escolhas)."}</p>
      <h3 style="margin-top:14px">Conflitos com o DESIGN.md da skill</h3>
      ${cf.length ? `<ul>${cf.map((m) => `<li class="warn">⚠ ${esc(m)}</li>`).join("")}</ul>` : `<p class="ok">✓ Nenhum conflito. O look cabe nessa skill.</p>`}
    </div>
    ${BN.available ? `<div class="box"><h3>Brand Nat · som e acabamento</h3><p style="color:var(--dim);margin:0 0 10px">Códigos S (som) e G (cor/acabamento) do pacote. Entram só na linha de códigos.</p><div class="skillpick finishes">${BN.finishes.map((f) => `<button class="${(L.finishes || []).includes(f.code) ? "on" : ""}" data-fin="${f.code}" title="${esc(f.what)}">${esc(f.code)} · ${esc(f.name)}</button>`).join("")}</div>${j.brandNat ? `<p style="margin:12px 0 0;color:var(--fg)"><b>Códigos:</b> <code>${esc(j.brandNat.codes.join(" "))}</code></p>` : ""}</div>` : ""}
    <div class="box"><h3>Notas para o Claude</h3><textarea id="notes" placeholder="Ex.: a cor do canal é #ff6600, use no acento; não cubra o quadro atrás de mim; prints estão em Pictures/Screenshots.">${esc(L.notes)}</textarea></div>
    <details class="box adv-box"><summary>O pedido que vai para o Claude</summary><pre id="promptPre">${esc(promptText())}</pre></details>
  </div>`;
  $$("[data-act]", grid).forEach((b) => (b.onclick = () => (b.dataset.act === "test" ? testReal() : save())));
  $$(".skillpick button[data-s]", grid).forEach((b) => (b.onclick = () => { L.skill = b.dataset.s === L.skill ? null : b.dataset.s; renderStep(); }));
  $$(".finishes button", grid).forEach((b) => (b.onclick = () => { const c = b.dataset.fin; const a = L.finishes || (L.finishes = []); const i = a.indexOf(c); i >= 0 ? a.splice(i, 1) : a.push(c); autosave(); renderStep(); }));
  $$("[data-x]", grid).forEach((a) => (a.onclick = (e) => { e.preventDefault(); L.extras.splice(Number(a.dataset.x), 1); renderStep(); }));
  $("#notes").oninput = (e) => { L.notes = e.target.value; autosave(); $("#promptPre").textContent = promptText(); };
}

// ------------------------------------------------------------------ presets, save, prompt
function applyPreset(id) {
  const p = byId(PRESETS, id); if (!p) return;
  L.preset = id; L.skill = p.skill;
  const keepLds = isLds() ? L.captions : null;
  L.colours = p.picks.colours || null; L.fonts = p.picks.fonts || null; L.hook = p.picks.hook || null; L.captions = keepLds || p.picks.captions || null;
  L.elements = [...(p.picks.elements || [])]; L.motion = [...(p.picks.motion || [])];
  // picks that depend on an optional catalogue (Brand Nat codes) fall back to the nearest kit option
  if (L.captions && !capById(L.captions)) L.captions = "one-word-lower";
  if (L.hook && !byId(HOOKS, L.hook)) L.hook = "big-caps";
  L.elements = L.elements.filter((id) => byId(ELEMENTS, id)); L.motion = L.motion.filter((id) => byId(MOTIONS, id));
  toast(UI.mode === "tpl" ? `Template ${p.name} no seu clipe. Próximo: Ajustar (opcional) ou Testar e salvar.` : p.skill ? `Preset ${p.name}: ${SKILLS[p.skill].name}. Você ainda pode mudar tudo.` : "Começando do zero.");
  renderStep(); rebuildMain();
}
async function save() {
  const slug = $("#slug").value.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return toast("Slug inválido: minúsculas, números e hífens (ex.: meu-reel-01).");
  const r = await fetch("/api/look", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ project: slug, look: lookJson() }) }).then((x) => x.json());
  if (r.error) return toast("Erro: " + r.error);
  toast(`Salvo em ${r.file}. O pedido foi copiado: cole no Claude junto com o seu vídeo.`);
  try { await navigator.clipboard.writeText(promptText()); } catch {}
}
$("#save").onclick = save;
$("#switchPath").onclick = () => { if (!UI.mode || confirm(UI.mode === "tpl" ? "Trocar para Montar do zero? Suas escolhas continuam." : "Trocar para Usar um template? Suas escolhas continuam.")) setMode(UI.mode ? (UI.mode === "tpl" ? "free" : "tpl") : "tpl"); };
$("#advToggle").onchange = (e) => { UI.adv = e.target.checked; document.body.classList.toggle("adv", UI.adv); try { localStorage.setItem("look-builder:adv", UI.adv ? "1" : "0"); } catch {} renderStep(); };
try { UI.adv = localStorage.getItem("look-builder:adv") === "1"; $("#advToggle").checked = UI.adv; document.body.classList.toggle("adv", UI.adv); } catch {}
try { const m = localStorage.getItem("look-builder:mode"); setMode(m === "tpl" || m === "free" ? m : null, { quiet: true }); } catch { setMode(null, { quiet: true }); }
// ---- "Testar de verdade": real HyperFrames snapshot of the current look
async function testReal() {
  const slug = $("#slug").value.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return toast("Slug inválido: minúsculas, números e hífens.");
  if (!UI.clip) return toast("Escolha um clipe antes de testar.");
  const dlg = $("#testDlg"), body = $("#testBody"), btn = $("#testReal");
  body.innerHTML = `<p class="test-wait">Montando o projeto de teste e capturando frames com o HyperFrames… no seu PC pode levar um minuto.${UI.hasBack ? " Este look passa efeitos atrás da pessoa: na primeira vez de cada trecho o HyperFrames recorta a pessoa (remove-background), alguns minutos a mais." : ""}</p>`;
  $("#testPath").textContent = ""; btn.classList.add("busy"); if (!dlg.open) dlg.showModal();
  body.innerHTML = progressHtml(null, UI.hasBack);
  const poll = setInterval(async () => { try { const p = await fetch("/api/test-progress").then((x) => x.json()); if (p && p.stage && p.stage !== "done") body.innerHTML = progressHtml(p, UI.hasBack); } catch {} }, 1000);
  try {
    const r = await fetch("/api/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ project: slug, look: lookJson(), from: video.currentTime || 0, dur: L.elements.some((id) => (byId(ELEMENTS, id) || {}).scene) ? 15 : 8 }) }).then((x) => x.json());
    clearInterval(poll);
    if (r.error) { body.innerHTML = `<div class="test-err">${esc(r.error)}</div>`; return; }
    const label = (f) => { const m = /at-(\d+(?:\.\d+)?)s/.exec(f); return m ? `${Number(m[1]).toFixed(1)} s` : f; };
    body.innerHTML = `<div class="shots ${UI.landscape ? "wide" : ""}">${r.images.map((im, i) => `<figure class="shot"><a href="${im.url}" target="_blank" rel="noopener"><img src="${im.url}" alt="${esc(im.file)}" loading="lazy"></a><figcaption><span>${label(im.file)}</span><span>${esc(im.file)}</span></figcaption></figure>`).join("")}</div>`;
    $("#testPath").textContent = `${r.dir} · ${r.images.length} frames · ${(r.ms / 1000).toFixed(0)} s · trecho a partir de ${r.start.toFixed(1)} s${r.matte ? (r.matte.error ? " · recorte falhou, efeitos de trás ficaram na frente" : r.matte.cached ? " · recorte reaproveitado" : " · pessoa recortada (remove-background)") : ""}`;
    if (r.matte && r.matte.error) toast("O recorte da pessoa falhou: " + r.matte.error.split("\n")[0]);
    toast("Frames reais prontos.");
  } catch (e) { body.innerHTML = `<div class="test-err">${esc(e.message || e)}</div>`; }
  finally { clearInterval(poll); btn.classList.remove("busy"); }
}
$("#testReal").onclick = testReal;
$("#testClose").onclick = () => $("#testDlg").close();
$("#slug").oninput = () => { UI.slugTouched = true; };
$("#copyPrompt").onclick = async () => { $("#advMenu").open = false; try { await navigator.clipboard.writeText(promptText()); toast("Prompt copiado."); } catch { toast("Não deu para copiar; veja a Revisão."); } };

// ------------------------------------------------------------------ misc wiring
$("#clipSelect").onchange = (e) => openClip(e.target.value, e.target.selectedOptions[0]?.dataset.project || null);
// pasted path: strip the quotes Explorer adds, check it on the server, say why when it fails
async function openPasted() {
  const raw = $("#clipPath").value.trim().replace(/^["']+|["']+$/g, "");
  if (!raw) return pickFile();
  if (!/\.(mp4|mov|m4v|webm)$/i.test(raw)) { toast("O caminho precisa terminar em .mp4, .mov, .m4v ou .webm."); return; }
  const r = await fetch(`/api/clip?check=1&path=${encodeURIComponent(raw)}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
  if (!r) { toast("Não achei esse arquivo. Confira o caminho (pasta e nome) e tente de novo."); return; }
  $("#clipPath").value = r.path;
  const sel = $("#clipSelect"); if ([...sel.options].some((o) => o.value === r.path)) sel.value = r.path; else sel.value = "";
  openClip(r.path, null);
  toast("Clipe aberto.");
}
// empty path box: the server opens the system's file dialog (it runs on this PC) and hands back the real path
async function pickFile() {
  const btn = $("#clipLoad"); btn.disabled = true; btn.textContent = "Escolhendo…";
  toast("Abrindo o seletor de arquivo… se não aparecer na frente, veja a barra de tarefas.");
  try {
    const r = await fetch("/api/pick", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ start: UI.clip || "" }) }).then((x) => x.json());
    if (r.error) return toast(r.error);
    if (!r.path) return toast("Nenhum arquivo escolhido.");
    $("#clipPath").value = r.path;
    const sel = $("#clipSelect"); sel.value = [...sel.options].some((o) => o.value === r.path) ? r.path : "";
    openClip(r.path, null); toast("Clipe aberto.");
  } catch { toast("Não consegui abrir o seletor. Cole o caminho do vídeo na caixa ao lado."); }
  finally { btn.disabled = false; btn.textContent = "Abrir…"; }
}
$("#clipLoad").onclick = openPasted;
$("#clipPath").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); openPasted(); } });
$("#play").onclick = () => { if (video.paused) { video.play(); if (mainTl) mainTl.restart(); $("#play").textContent = "Pause"; } else { video.pause(); $("#play").textContent = "Play"; } };
(function theme() { const root = document.documentElement; let t = null; try { t = localStorage.getItem(LS + "theme"); } catch {} if (t === "light") root.dataset.theme = "light"; $("#theme").onclick = () => { const n = root.dataset.theme === "light" ? "dark" : "light"; if (n === "light") root.dataset.theme = "light"; else delete root.dataset.theme; try { localStorage.setItem(LS + "theme", n); } catch {} }; })();
$("#previewToggle").onclick = () => { const p = $("#preview"); p.classList.toggle("collapsed"); $("#previewToggle").textContent = p.classList.contains("collapsed") ? "Prévia ▸" : "Prévia ▾"; setTimeout(() => { layoutStage(); scaleWorlds(); }, 50); };
$("#reset").onclick = () => { if (confirm("Limpar todas as escolhas deste clipe?")) resetAll(); };
$("#copyJson").onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(lookJson(), null, 2)); toast("JSON copiado."); } catch { toast("Não deu para copiar."); } };
// keyboard: ← → steps · 1–9 pick the Nth card · Esc closes "mais como essa" boxes
window.addEventListener("keydown", (e) => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if (e.key === "ArrowRight") go(UI.step + 1);
  else if (e.key === "ArrowLeft") go(UI.step - 1);
  else if (/^[1-9]$/.test(e.key)) { const c = $$(".card")[Number(e.key) - 1]; if (c) $(".take", c).click(); }
  else if (e.key === "Escape") $$(".card.more").forEach((c) => c.classList.remove("more"));
  else if (e.key === " ") { e.preventDefault(); $("#play").click(); }
});
$("#back5").onclick = () => (video.currentTime = Math.max(0, video.currentTime - 5));
$("#fwd5").onclick = () => (video.currentTime = Math.min(video.duration || 0, video.currentTime + 5));
$("#mute").onchange = (e) => (video.muted = e.target.checked);
$("#showGuides").onchange = drawGuides;
$("#liveMatte").onchange = () => { try { localStorage.setItem("look-builder:liveMatte", $("#liveMatte").checked ? "1" : "0"); } catch {} rebuildMain(); };
try { if (localStorage.getItem("look-builder:liveMatte") === "0") $("#liveMatte").checked = false; } catch {}
$("#useAvatar").onchange = (e) => { UI.useAvatar = e.target.checked; applyBackgrounds(); stage.classList.toggle("avatar", UI.useAvatar || !UI.clip); try { localStorage.setItem(LS + "avatar", UI.useAvatar ? "1" : "0"); } catch {} };
try { UI.useAvatar = localStorage.getItem(LS + "avatar") === "1"; $("#useAvatar").checked = UI.useAvatar; } catch {}
stage.classList.add("avatar"); applyBackgrounds();
$("#detectHead").onclick = () => detectHead();
$("#autoDetect").onchange = (e) => { try { localStorage.setItem(LS + "autoDetect", e.target.checked ? "1" : "0"); } catch {} };
try { $("#autoDetect").checked = localStorage.getItem(LS + "autoDetect") !== "0"; } catch {}
// drag a guide's tag on the stage to move it (same as the sliders)
$$(".guides .g[data-k] .tag").forEach((tag) => tag.addEventListener("pointerdown", (e) => {
  e.preventDefault(); e.stopPropagation();
  const g = tag.parentElement, k = g.dataset.k, slider = $("#" + k), s = stage.clientWidth / UI.W, y0 = e.clientY, v0 = UI[k];
  g.classList.add("dragging"); tag.setPointerCapture(e.pointerId);
  const move = (ev) => { UI[k] = Math.round(Math.max(Number(slider.min) || 0, Math.min(Number(slider.max), v0 + (ev.clientY - y0) / s))); syncSliders(); drawGuides(); };
  const up = () => { g.classList.remove("dragging"); tag.removeEventListener("pointermove", move); tag.removeEventListener("pointerup", up); renderStep(); rebuildMain(); autosave(); };
  tag.addEventListener("pointermove", move); tag.addEventListener("pointerup", up);
}));
$("#headTop").oninput = (e) => { UI.headTop = Number(e.target.value); syncSliders(); drawGuides(); debounce(() => { renderStep(); rebuildMain(); autosave(); }); };
$("#capTop").oninput = (e) => { UI.capTop = Number(e.target.value); syncSliders(); drawGuides(); debounce(() => { renderStep(); rebuildMain(); autosave(); }); };
["hook1", "hook2", "keyword", "note", "comment", "user"].forEach((k) => { $("#" + k).value = UI.text[k]; $("#" + k).oninput = (e) => { UI.text[k] = e.target.value; debounce(() => { renderStep(); rebuildMain(); }); }; });
$("#wordsIn").value = UI.text.words.join(" ");
$("#wordsIn").oninput = (e) => { UI.text.words = e.target.value.trim().split(/\s+/).filter(Boolean).slice(0, 14); debounce(() => { renderStep(); rebuildMain(); }); };
$("#fromTranscript").onclick = async () => {
  const slug = UI.clipProject || $("#slug").value.trim();
  const r = await fetch(`/api/transcript?project=${encodeURIComponent(slug)}`).then((x) => x.json());
  if (!r.sample) return toast("Sem transcrição em video-projects/" + slug + "/assets (transcript.json ou raw.json).");
  const ws = r.sample.words.map((w) => w.text.replace(/[.,!?;:]+$/, "")).filter(Boolean);
  UI.text.words = ws.slice(0, 12); UI.text.hook1 = ws.slice(0, 3).join(" "); UI.text.hook2 = ws.slice(3, 7).join(" ");
  UI.text.keyword = [...ws.slice(0, 12)].sort((a, b) => b.length - a.length)[0] || UI.text.keyword;
  ["hook1", "hook2", "keyword"].forEach((k) => ($("#" + k).value = UI.text[k])); $("#wordsIn").value = UI.text.words.join(" ");
  toast(`Texto de exemplo vindo de ${r.sample.file}.`); renderStep(); rebuildMain();
};
$$(".tab[data-view]").forEach((t) => (t.onclick = () => { $$(".tab[data-view]").forEach((x) => x.classList.toggle("on", x === t)); $("#advMenu").open = false; const j = t.dataset.view === "json"; $("#jsonView").hidden = !j; $("#grid").hidden = j; $(".step-head").hidden = j; if (j) $("#jsonPre").textContent = JSON.stringify(lookJson(), null, 2); }));
window.addEventListener("resize", () => { layoutStage(); scaleWorlds(); });

let deb; function debounce(fn) { clearTimeout(deb); deb = setTimeout(fn, 160); }
let toastT; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 3200); }
function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

// boot: mockup styles and presenter gradients from the landing page
if (!document.getElementById("mockup-css")) { const st = document.createElement("style"); st.id = "mockup-css"; st.textContent = MOCKUP_CSS; document.head.appendChild(st); document.body.insertAdjacentHTML("afterbegin", PERSON_DEFS); }
syncSliders(); layoutStage(); renderStep(); rebuildMain(); loadLds(); loadBrandNat(); loadPresetImages(); loadClips();

window.__lb = { L, UI, rebuildMain, renderStep, lookJson, fillPresetCards };
