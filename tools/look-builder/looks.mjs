// Look builder — the catalogue. Every option here is derived from a skill or style in this kit:
//   reel-oney (celular) · reel-editorial-oney (editorial) · anuncios-oney (anúncio) · video-colagem-oney (colagem)
//   reel-explicativo-oney (explicativo) · vsl (roxo / laranja / clean) · style-library 02-kallaway (aurora glass) · 01-vox-explainer (vox)
// Each option carries `skills` (where it is native) so the review step can warn about mixes a skill's DESIGN.md forbids.
// Render functions write 1080-wide (or 1920-wide) HTML that the app scales into a card; `S` is the current state.

import { ldsCaptionFor } from "./lds.mjs";
export const SKILLS = {
  "reel-oney": { name: "Reel celular", cmd: "/reel-oney", note: "Cru, editado no celular. Nada de motion." },
  "reel-editorial-oney": { name: "Reel editorial", cmd: "/reel-editorial-oney", note: "Polido, serifada amarelo-manteiga, cortes secos." },
  "anuncios-oney": { name: "Anúncio", cmd: "/anuncios-oney", note: "Headline nos 5 s, depois esquemas acima da cabeça." },
  "video-colagem-oney": { name: "Colagem", cmd: "/video-colagem-oney", note: "Cada frase vira um objeto. Stickers, cards, flashes." },
  "reel-explicativo-oney": { name: "Explicativo", cmd: "/reel-explicativo-oney", note: "Faixa 16:9 com prova real, diagrama num plano branco." },
  "vsl": { name: "VSL", cmd: "/vsl", note: "Motion UI roxo/laranja ou look clean com skins." },
  "kallaway": { name: "Aurora glass (style-library)", cmd: "/style-library kallaway", note: "Cards de vidro e glow azul sobre canvas escuro." },
  "vox-explainer": { name: "Vox explainer (style-library)", cmd: "/style-library vox-explainer", note: "Papel, recorte, serifada, setas à mão." },
  "legenda-dinamica-studio": { name: "Legenda Dinâmica (EffectCraft)", cmd: "/legenda", note: "Palavra-chave gigante, conectivos pequenos, entrada palavra por palavra. Roda no EffectCraft.", external: true },
};

// ---------------------------------------------------------------- 1. COLOURS
export const COLOURS = [
  { id: "sunlit", name: "Sunlit", sub: "Amarelo sobre carvão", skills: ["reel-oney", "anuncios-oney"],
    vars: { bg: "#0d0d0d", acc: "#ffd21f", txt: "#ffffff", sec: "#30d158", bad: "#ff453a", paper: "#111113", ink: "#ffffff" } },
  { id: "butter", name: "Butter editorial", sub: "Manteiga pálida, preto, papel", skills: ["reel-editorial-oney"],
    vars: { bg: "#0d0d0d", acc: "#f4e27c", txt: "#ffffff", sec: "#f2ede6", bad: "#ff453a", paper: "#f2ede6", ink: "#0d0d0d" } },
  { id: "roxo", name: "Roxo VSL", sub: "Violeta, lavanda, glow", skills: ["vsl"],
    vars: { bg: "#1f123d", acc: "#8b5cf6", txt: "#ffffff", sec: "#b9a3ff", bad: "#ff3b3b", paper: "rgba(255,255,255,.06)", ink: "#ffffff" } },
  { id: "laranja", name: "Laranja VSL", sub: "Âmbar quente, glow", skills: ["vsl"],
    vars: { bg: "#2a160a", acc: "#ff8a2a", txt: "#ffffff", sec: "#ffc58a", bad: "#ff3b3b", paper: "rgba(255,255,255,.06)", ink: "#ffffff" } },
  { id: "clean", name: "Clean azul", sub: "Branco, azul claro, tinta marinho", skills: ["vsl"],
    vars: { bg: "#ffffff", acc: "#4A90E2", txt: "#102A43", sec: "#EAF3FF", bad: "#e5484d", paper: "rgba(255,255,255,.92)", ink: "#102A43" } },
  { id: "verde", name: "Verde explicativo", sub: "Caixa marinho, plano branco, um verde", skills: ["reel-explicativo-oney"],
    vars: { bg: "#0f1a24", acc: "#1f7a63", txt: "#ffffff", sec: "#5d6670", bad: "#b23a48", paper: "#fbfbfa", ink: "#1c2733" } },
  { id: "crimson", name: "Crimson colagem", sub: "Papel off-white, carmim, azul elétrico", skills: ["video-colagem-oney"],
    vars: { bg: "#1a1a1a", acc: "#9e1b2c", txt: "#ffffff", sec: "#5b7cff", bad: "#ff2a2a", paper: "#e9e7e3", ink: "#1a1a1a" } },
  { id: "aurora", name: "Aurora glass", sub: "Quase-preto frio, azul AIS", skills: ["kallaway"],
    vars: { bg: "#0A0E14", acc: "#37BDF8", txt: "#F0EEE9", sec: "#F5D82A", bad: "#FF3B30", paper: "rgba(255,255,255,.06)", ink: "#F0EEE9" } },
  { id: "vox", name: "Vox papel", sub: "Papel quente, tinta, azul, vermelho editorial", skills: ["vox-explainer"],
    vars: { bg: "#efe9dc", acc: "#37BDF8", txt: "#17130e", sec: "#f26a1b", bad: "#e23b2e", paper: "#efe9dc", ink: "#17130e" } },
];

// ---------------------------------------------------------------- 2. FONTS
// `display` / `body` / `hand` are CSS font stacks declared in styles.css (local files via /fonts/, Google for the rest).
const FONTS_RAW = [
  { id: "advercase", name: "Advercase", sub: "Título, rótulo e legenda na mesma voz", skills: ["reel-oney", "anuncios-oney", "video-colagem-oney"],
    display: '"Advercase",Georgia,serif', body: '"Advercase",Georgia,serif', hand: "'Caveat',cursive", dw: 700, bw: 700, caps: true },
  { id: "inter-serif", name: "Inter + Instrument Serif", sub: "Minúsculas neo-grotescas, voz serifada itálica", skills: ["reel-editorial-oney"],
    display: '"EdSans","Inter",Helvetica,Arial,sans-serif', body: '"EdSans","Inter",sans-serif', serif: '"EdSerif","Instrument Serif",Georgia,serif', hand: "'Caveat',cursive", dw: 600, bw: 600, lower: true },
  { id: "anybody-jakarta", name: "Anybody + Plus Jakarta", sub: "Display largo (≈ Monument) + grotesca", skills: ["vsl"],
    display: '"Anybody","Plus Jakarta Sans",sans-serif', body: '"Plus Jakarta Sans",Inter,sans-serif', mono: "'JetBrains Mono',monospace", dw: 900, bw: 700, stretch: "150%", caps: true },
  { id: "jakarta-inter", name: "Plus Jakarta + Inter", sub: "Geométrica premium + corpo neutro", skills: ["kallaway", "vsl"],
    display: '"Plus Jakarta Sans",Inter,sans-serif', body: '"Inter",sans-serif', mono: '"JetBrains Mono","Space Mono",monospace', dw: 800, bw: 500 },
  { id: "inter", name: "Inter só", sub: "Sóbrio, credível, sem destaque", skills: ["reel-explicativo-oney"],
    display: '"EdSans","Inter",sans-serif', body: '"Inter",sans-serif', dw: 600, bw: 500 },
  { id: "anton-inter", name: "Anton + Inter", sub: "Condensada pesada para carimbos", skills: ["video-colagem-oney"],
    display: '"Anton","Bebas Neue",Impact,sans-serif', body: '"Inter",sans-serif', hand: "'Caveat',cursive", dw: 400, bw: 500, caps: true, google: true },
  { id: "fraunces-archivo", name: "Fraunces + Archivo", sub: "Serifada de declaração + metadados", skills: ["vox-explainer"],
    display: '"Fraunces",Georgia,serif', body: '"Archivo","Inter",sans-serif', hand: "'Caveat',cursive", dw: 900, bw: 500, italic: true, google: true },
  { id: "playfair-inter", name: "Playfair + Inter", sub: "Editorial clássica, calma", skills: [],
    display: '"Playfair Display",Georgia,serif', body: '"Inter",sans-serif', hand: "'Caveat',cursive", dw: 700, bw: 500, google: true },
];

const sq = (s) => (typeof s === "string" ? s.replace(/"/g, "'") : s);
export const FONTS = FONTS_RAW.map((f) => ({ ...f, display: sq(f.display), body: sq(f.body), serif: sq(f.serif), hand: sq(f.hand), mono: sq(f.mono) }));

// helpers shared by renderers --------------------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const cx = (S) => S.W / 2;
const caseOf = (S, t) => (S.font.caps ? String(t).toUpperCase() : S.font.lower ? String(t).toLowerCase() : t);
const disp = (S, size, extra = "") => `font-family:${S.font.display};font-weight:${S.font.dw};font-size:${size}px;${S.font.stretch ? `font-stretch:${S.font.stretch};` : ""}${S.font.italic ? "font-style:italic;" : ""}${extra}`;
const body = (S, size, extra = "") => `font-family:${S.font.body};font-weight:${S.font.bw};font-size:${size}px;${extra}`;
const serifV = (S) => S.font.serif || S.font.display;
const words = (S) => S.text.words;
const kw = (S) => S.text.keyword;
const safeTop = (S) => (S.landscape ? 120 : 280);
const ab = (S, n) => Math.max(S.landscape ? 70 : 220, S.headTop - n); // above the head, never past the safe top

// ---------------------------------------------------------------- 3. HOOK (the big title over the first ~3 s)
export const HOOKS = [
  { id: "big-caps", name: "Big caps", desc: "Advercase branco + linha amarela, acima da cabeça, à esquerda", skills: ["reel-oney", "anuncios-oney"],
    render: (S) => `<div class="ov hook" style="left:${S.landscape ? 96 : 110}px;top:${ab(S, 260)}px;width:${S.W - 220}px;${disp(S, S.landscape ? 86 : 96, "line-height:1.02;text-align:left")};color:${S.v.txt};text-shadow:0 2px 14px rgba(0,0,0,.5)">
      <span class="l1" style="display:block">${esc(caseOf(S, S.text.hook1))}</span><span class="l2" style="display:block;color:${S.v.acc}">${esc(caseOf(S, S.text.hook2))}</span></div>`,
    anim: (tl, el) => tl.from(el.querySelectorAll(".l1,.l2"), { y: 26, opacity: 0, duration: 0.45, stagger: 0.12, ease: "power3.out" }) },
  { id: "serif-stack", name: "Phrase stack", desc: "Frase montada linha a linha: sans + serifada itálica manteiga", skills: ["reel-editorial-oney"],
    render: (S) => `<div class="ov hook" style="left:0;top:${ab(S, 330)}px;width:${S.W}px;text-align:center;color:${S.v.txt};text-shadow:0 3px 22px rgba(0,0,0,.3)">
      <span class="ln" style="display:block;${body(S, 96, "letter-spacing:-.035em;line-height:.98")}">${esc(caseOf(S, S.text.hook1))}</span>
      <span class="ln" style="display:block;font-family:${serifV(S)};font-weight:400;font-style:italic;font-size:124px;line-height:.92;color:${S.v.acc}">${esc(S.text.hook2.toLowerCase())}</span></div>`,
    anim: (tl, el) => tl.from(el.querySelectorAll(".ln"), { y: 18, opacity: 0, filter: "blur(14px)", duration: 0.55, stagger: 0.35, ease: "power3.out" }) },
  { id: "headline-ad", name: "Headline anúncio", desc: "Título branco + amarelo com varredura sublinhada, zona segura Meta", skills: ["anuncios-oney"],
    render: (S) => `<div class="ov hook" style="left:0;top:${safeTop(S) + 20}px;width:${S.W}px;text-align:center;${disp(S, S.landscape ? 96 : 112, "line-height:1")};color:${S.v.txt}">
      <div class="scrim" style="position:absolute;left:0;top:-${safeTop(S) + 20}px;width:${S.W}px;height:${S.headTop + 40}px;background:linear-gradient(180deg,rgba(0,0,0,.66),transparent);z-index:-1"></div>
      <span class="l1" style="display:block">${esc(caseOf(S, S.text.hook1))}</span>
      <span class="l2" style="display:inline-block;position:relative;color:${S.v.acc}">${esc(caseOf(S, S.text.hook2))}<i class="ul" style="position:absolute;left:0;right:0;bottom:-10px;height:10px;background:${S.v.acc};transform-origin:left;display:block"></i></span></div>`,
    anim: (tl, el) => tl.from(el.querySelectorAll(".l1,.l2"), { y: 30, opacity: 0, duration: 0.5, stagger: 0.15, ease: "expo.out" }).from(el.querySelector(".ul"), { scaleX: 0, duration: 0.5, ease: "power3.inOut" }, "-=0.1") },
  { id: "behind-head", name: "Título atrás da cabeça", desc: "Display enorme no topo; a cabeça cobre as letras de baixo (precisa matte)", skills: ["vsl", "video-colagem-oney"],
    render: (S) => `<div class="ov hook back" style="left:0;top:${ab(S, 330)}px;width:${S.W}px;text-align:center;${disp(S, S.landscape ? 170 : 200, "line-height:.9;letter-spacing:-.02em")};color:${S.v.txt};text-shadow:0 0 40px ${S.v.acc}66">
      <span class="l1" style="display:block">${esc(caseOf(S, S.text.hook1.split(" ").slice(0, 2).join(" ")))}</span><span class="l2" style="display:block;color:${S.v.sec}">${esc(caseOf(S, S.text.hook2.split(" ").slice(-1)[0]))}</span>
      <small class="mnote" style="display:block;${body(S, 26)};opacity:.7;margin-top:14px;letter-spacing:.2em">ATRÁS DA CABEÇA · MATTE</small></div>`,
    anim: (tl, el) => tl.from(el.querySelectorAll(".l1,.l2"), { scale: 0.92, opacity: 0, filter: "blur(16px)", duration: 0.5, stagger: 0.1, ease: "power3.out" }) },
  { id: "colour-block", name: "Colour block", desc: "Palavras pesadas batem num bloco de cor (carimbo da colagem)", skills: ["video-colagem-oney", "vox-explainer"],
    render: (S) => `<div class="ov hook" style="left:${cx(S) - 400}px;top:${ab(S, 270)}px;width:800px;text-align:center">
      <div class="blk" style="display:inline-block;background:${S.v.acc};color:${S.v.txt};padding:14px 34px;${disp(S, 92, "line-height:1")};transform:rotate(-2deg);box-shadow:8px 8px 0 ${S.v.ink}">${esc(caseOf(S, S.text.hook1))}</div>
      <div class="blk2" style="display:inline-block;margin-top:10px;background:${S.v.paper};color:${S.v.ink};padding:10px 28px;${body(S, 44)};transform:rotate(1.5deg)">${esc(S.text.hook2)}</div></div>`,
    anim: (tl, el) => tl.from(el.querySelector(".blk"), { scale: 1.6, opacity: 0, duration: 0.35, ease: "power4.out" }).from(el.querySelector(".blk2"), { y: 20, opacity: 0, duration: 0.3 }, "-=0.05") },
  { id: "marker-title", name: "Marker title", desc: "Palavras à mão (Caveat) com rabisco e seta para o apresentador", skills: ["reel-editorial-oney", "vox-explainer"],
    render: (S) => `<div class="ov hook" style="left:${S.landscape ? 110 : 90}px;top:${ab(S, 300)}px;width:${S.W - 180}px;text-align:left;color:${S.v.txt};font-family:${S.font.hand || "'Caveat',cursive"};font-weight:700;font-size:104px;line-height:.95;text-shadow:0 3px 18px rgba(0,0,0,.35)">
      <span class="l1" style="display:block">${esc(S.text.hook1.toLowerCase())}</span><span class="l2" style="display:inline-block;position:relative;color:${S.v.acc}">${esc(S.text.hook2.toLowerCase())}<svg class="sq" viewBox="0 0 400 24" style="position:absolute;left:0;bottom:-14px;width:100%;height:24px;overflow:visible"><path d="M4 14 C 60 2, 120 24, 180 12 S 300 2, 396 14" fill="none" stroke="${S.v.acc}" stroke-width="6" stroke-linecap="round"/></svg></span>
      <svg class="arrow" viewBox="0 0 160 160" style="position:absolute;right:40px;top:120%;width:150px;height:150px;overflow:visible"><path d="M20 10 C 40 70, 90 110, 140 140 M 110 140 L 142 142 L 134 110" fill="none" stroke="${S.v.txt}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`,
    anim: (tl, el) => { tl.from(el.querySelectorAll(".l1,.l2"), { opacity: 0, x: -12, duration: 0.35, stagger: 0.2 }); el.querySelectorAll("path").forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, "-=0.1"); }); } },
  { id: "camcorder", name: "Camcorder BRUTO", desc: "HUD de filmadora (REC, timecode, cantoneiras) no gancho antes do glitch", skills: ["vsl"],
    render: (S) => `<div class="ov hook" style="left:0;top:0;width:${S.W}px;height:${S.H}px;font-family:${S.font.mono || "'JetBrains Mono',monospace"};color:#fff;font-size:34px">
      <div style="position:absolute;left:70px;top:${safeTop(S) - 60}px;display:flex;align-items:center;gap:16px"><i class="rec" style="width:26px;height:26px;border-radius:50%;background:#ff3b3b;display:inline-block"></i>REC</div>
      <div style="position:absolute;right:70px;top:${safeTop(S) - 60}px">00:00:04:12</div>
      <div style="position:absolute;left:70px;bottom:${S.landscape ? 90 : 560}px;${disp(S, 60, "letter-spacing:.08em")}">BRUTO</div>
      ${[["left", "top"], ["right", "top"], ["left", "bottom"], ["right", "bottom"]].map(([x, y]) => `<i style="position:absolute;${x}:60px;${y}:${y === "top" ? safeTop(S) - 150 : (S.landscape ? 60 : 480)}px;width:90px;height:90px;border-${y}:5px solid #fff;border-${x}:5px solid #fff"></i>`).join("")}</div>`,
    anim: (tl, el) => tl.to(el.querySelector(".rec"), { opacity: 0.1, duration: 0.5, repeat: 5, yoyo: true, ease: "steps(1)" }) },
  { id: "none", name: "Sem gancho visual", desc: "Só a fala e as legendas nos primeiros segundos", skills: ["reel-explicativo-oney", "reel-oney"],
    render: () => "", anim: () => {} },
];

// ---------------------------------------------------------------- 4. CAPTIONS
const capWord = (S, w, i, style, emphasis) => `<span class="w${emphasis ? " em" : ""}" data-i="${i}" style="position:absolute;left:0;top:0;width:${S.W}px;text-align:center;opacity:0;${style}">${esc(w)}</span>`;
export const CAPTIONS = [
  { id: "one-word-outline", name: "Uma palavra, contorno", desc: "Advercase Bold 54 px, branco com contorno preto grosso, no peito", skills: ["reel-oney"],
    render: (S) => `<div class="ov caps" style="left:0;top:${S.capTop}px;width:${S.W}px;height:80px">${words(S).map((w, i) => capWord(S, caseOf(S, w), i, `${disp(S, 54, "line-height:80px")};color:#fff;-webkit-text-stroke:8px #000;paint-order:stroke fill`)).join("")}</div>`, mode: "word" },
  { id: "one-word-lower", name: "Uma palavra, minúscula", desc: "Inter 92 px minúscula, sem contorno; a palavra-chave vira serifada manteiga 124 px", skills: ["reel-editorial-oney"],
    render: (S) => `<div class="ov caps" style="left:0;top:${S.capTop - 40}px;width:${S.W}px;height:140px">${words(S).map((w, i) => { const em = w.toLowerCase() === kw(S).toLowerCase(); return capWord(S, w.toLowerCase(), i, em ? `font-family:${serifV(S)};font-style:italic;font-weight:400;font-size:124px;line-height:140px;color:${S.v.acc};text-shadow:0 3px 22px rgba(0,0,0,.3)` : `${body(S, 92, "letter-spacing:-.035em;line-height:140px")};color:#fff;text-shadow:0 3px 22px rgba(0,0,0,.3)`, em); }).join("")}</div>`, mode: "word" },
  { id: "one-word-stroke", name: "Uma palavra, traço fino", desc: "Advercase 46 px com traço escuro, logo abaixo do queixo (anúncio)", skills: ["anuncios-oney"],
    render: (S) => `<div class="ov caps" style="left:0;top:${S.capTop}px;width:${S.W}px;height:70px">${words(S).map((w, i) => capWord(S, caseOf(S, w), i, `${disp(S, 46, "line-height:70px")};color:#fff;-webkit-text-stroke:5px rgba(0,0,0,.9);paint-order:stroke fill`)).join("")}</div>`, mode: "word" },
  { id: "chunks-punch", name: "Blocos de 2–3 palavras + punch", desc: "Advercase 58 px com contorno fino; a palavra-chave vira bloco grande com glow", skills: ["video-colagem-oney"],
    render: (S) => { const ch = chunk(words(S), 3, kw(S)); return `<div class="ov caps" style="left:0;top:${S.capTop - 20}px;width:${S.W}px;height:120px">${ch.map((c, i) => capWord(S, caseOf(S, c.text), i, c.em ? `${disp(S, 96, "line-height:120px")};color:${S.v.acc === "#9e1b2c" ? "#fff" : S.v.acc};text-shadow:0 0 24px ${S.v.sec},0 0 60px ${S.v.sec}` : `${disp(S, 58, "line-height:120px")};color:#fff;-webkit-text-stroke:3px rgba(0,0,0,.55);paint-order:stroke fill;text-shadow:0 4px 18px rgba(0,0,0,.5)`, c.em)).join("")}</div>`; }, mode: "word" },
  { id: "phrase-box", name: "Frase em caixa opaca", desc: "Inter SemiBold 46 px, 1–2 linhas, caixa marinho 100 % opaca no terço inferior", skills: ["reel-explicativo-oney"],
    render: (S) => { const ch = chunk(words(S), 5); return `<div class="ov caps" style="left:${cx(S) - 450}px;top:${S.landscape ? S.H - 190 : 1545}px;width:900px;height:120px;text-align:center">${ch.map((c, i) => `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;top:0;opacity:0;margin:auto;display:table;background:${S.v.bg};color:${S.v.txt};padding:16px 28px;${body(S, 46, "line-height:1.2")}">${esc(c.text)}</span>`).join("")}</div>`; }, mode: "word" },
  { id: "key-phrase-box", name: "Frase-chave em caixa roxa", desc: "Só frases-chave: linha grande lavanda ou caixa com glow (VSL)", skills: ["vsl"],
    render: (S) => `<div class="ov caps" style="left:0;top:${S.capTop - 10}px;width:${S.W}px;text-align:center">
      <span class="w" data-i="0" style="display:inline-block;opacity:0;background:${S.v.acc};color:#fff;padding:10px 26px;border-radius:14px;${body(S, 50, "font-weight:800")};box-shadow:0 0 30px ${S.v.acc}99">${esc(words(S).slice(0, 3).join(" "))}</span>
      <span class="w" data-i="1" style="display:block;opacity:0;margin-top:12px;color:${S.v.sec};${body(S, 70, "font-weight:800;letter-spacing:-.02em")}">${esc(kw(S))}</span></div>`, mode: "phrase" },
  { id: "mouth-blocks", name: "Blocos que seguem a boca", desc: "1–3 palavras logo abaixo do queixo, acompanhando a cabeça", skills: ["vsl"],
    render: (S) => { const ch = chunk(words(S), 2, kw(S)); return `<div class="ov caps" style="left:0;top:${S.headTop + 420}px;width:${S.W}px;height:70px">${ch.map((c, i) => capWord(S, c.text, i, `${body(S, 44, "font-weight:800;line-height:70px")};color:${c.em ? S.v.sec : "#fff"};text-shadow:0 2px 12px rgba(0,0,0,.6)`, c.em)).join("")}<small style="position:absolute;left:0;width:${S.W}px;top:76px;text-align:center;${body(S, 24)};opacity:.6;color:#fff">segue a cabeça (face-track.json)</small></div>`; }, mode: "word" },
  { id: "glass-caption", name: "Legenda em vidro", desc: "Pílula de vidro fosco com borda-fio, texto Inter", skills: ["kallaway"],
    render: (S) => { const ch = chunk(words(S), 4); return `<div class="ov caps" style="left:0;top:${S.capTop}px;width:${S.W}px;text-align:center">${ch.map((c, i) => `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;margin:auto;display:table;opacity:0;background:rgba(255,255,255,.08);backdrop-filter:blur(18px);border:1.5px solid rgba(255,255,255,.16);border-radius:28px;padding:14px 32px;color:${S.v.txt};${body(S, 44, "font-weight:600")};box-shadow:0 24px 70px rgba(0,0,0,.4)">${esc(c.text)}</span>`).join("")}</div>`; }, mode: "word" },
  { id: "none", name: "Sem legenda", desc: "Horizontal colagem / vídeo longo sem karaokê", skills: ["video-colagem-oney"], render: () => "", mode: "none" },
];

// Legenda Dinâmica Studio (EffectCraft): HTML approximation of the LDS logic — 2–4 words per screen, the keyword at
// ≥110 px, connectives ≥50 px hugging it (before: above-left; after: below-right), each word entering on its beat.
// The real styles come from the catalogue GIFs; this renderer only shows the look's colours/fonts on the clip.
// The pronto's "modelo" name sets the typographic character of the keyword; the colour comes from the look's palette
// (so steps 1 and 2 still change it): serif/revista/elegante → serif italic; cursiva/script/brush → hand font;
// neon → glow; contorno → stroke; marca-texto → highlight; impacto/tech/condensado → heavy display caps; minimal → body.
function ldsStyle(S, modelo = "") {
  const m = modelo.toLowerCase();
  const serif = S.font.serif || "'EdSerif','Instrument Serif',Georgia,serif", hand = S.font.hand || "'Caveat',cursive";
  if (/cursiv|script|brush|pincel/.test(m)) return { big: `font-family:${hand};font-weight:700;font-size:128px;line-height:1;color:${S.v.acc}`, caps: false };
  if (/serif|revista|elegante|cinema/.test(m)) return { big: `font-family:${serif};font-style:italic;font-weight:400;font-size:132px;line-height:1;color:${S.v.acc}`, caps: false };
  if (/neon/.test(m)) return { big: `${disp(S, 118, "line-height:1")};color:#fff;text-shadow:0 0 14px ${S.v.acc},0 0 40px ${S.v.acc},0 0 80px ${S.v.acc}`, caps: true };
  if (/contorno|outline/.test(m)) return { big: `${disp(S, 118, "line-height:1")};color:transparent;-webkit-text-stroke:4px ${S.v.acc}`, caps: true };
  if (/marca/.test(m)) return { big: `${disp(S, 110, "line-height:1.15")};color:#111;background:${S.v.acc};padding:0 18px;display:inline-block`, caps: true };
  if (/minimal|clean|cinza|branc/.test(m)) return { big: `${body(S, 104, "font-weight:600;line-height:1")};color:${/branc|minimal/.test(m) ? "#fff" : S.v.acc}`, caps: false };
  return { big: `${disp(S, 118, "line-height:1")};color:${S.v.acc}`, caps: true };
}
// Legenda Dinâmica captions come from the EffectCraft engine port (lds.mjs): same models, entrances and exits as the catalogue
export function ldsCaption(pronto) { return ldsCaptionFor(pronto); }
function chunk(ws, n, keyword) {
  const out = []; let cur = [];
  for (const w of ws) {
    if (keyword && w.toLowerCase() === keyword.toLowerCase()) { if (cur.length) out.push({ text: cur.join(" ") }); cur = []; out.push({ text: w, em: true }); continue; }
    cur.push(w); if (cur.join(" ").length > 18 || cur.length >= n) { out.push({ text: cur.join(" ") }); cur = []; }
  }
  if (cur.length) out.push({ text: cur.join(" ") });
  return out;
}

// ---------------------------------------------------------------- 5. ELEMENTS (multi-select)
const printBox = (S, extra = "") => `background:linear-gradient(160deg,#1c1c22,#2b2b33);border:1px solid rgba(255,255,255,.08);${extra}`;
const fakePrint = (S, w, h, radius = 0) => `<div class="pr" style="width:${w}px;height:${h}px;border-radius:${radius}px;overflow:hidden;${printBox(S)};position:relative">
  <div style="position:absolute;left:16px;top:16px;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#feda75,#d62976,#4f5bd5)"></div>
  <div style="position:absolute;left:72px;top:22px;width:${w * .45}px;height:12px;background:#fff;opacity:.9;border-radius:6px"></div>
  <div style="position:absolute;left:72px;top:42px;width:${w * .3}px;height:10px;background:#fff;opacity:.4;border-radius:5px"></div>
  ${[0, 1, 2].map((i) => `<div style="position:absolute;left:16px;top:${80 + i * 34}px;width:${w - 32}px;height:12px;background:#fff;opacity:${.18 + i * .1};border-radius:6px"></div>`).join("")}
  <div style="position:absolute;left:16px;bottom:18px;${body(S, 30, "font-weight:700")};color:#fff">12,4 mil <span style="opacity:.6;font-size:22px">visualizações</span></div></div>`;

export const ELEMENTS = [
  { id: "print-raw", name: "Print bruto", desc: "Screenshot real, cantos retos, sem borda nem sombra, acima da cabeça", skills: ["reel-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 110 : 210}px;top:${ab(S, 420)}px">${fakePrint(S, 620, 360, 0)}</div>` },
  { id: "print-card", name: "Print em card arredondado", desc: "Raio 34 px, sombra suave, leve inclinação, ao lado da cabeça", skills: ["reel-editorial-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1180 : 420}px;top:${ab(S, 460)}px;transform:rotate(-4deg);filter:drop-shadow(0 24px 60px rgba(0,0,0,.38))">${fakePrint(S, 560, 380, 34)}</div>` },
  { id: "handwritten-note", name: "Nota à mão + seta", desc: "Confissão pessoal em Caveat com seta desenhada", skills: ["reel-editorial-oney", "vox-explainer"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1250 : 560}px;top:${ab(S, 300)}px;width:460px;font-family:${S.font.hand || "'Caveat',cursive"};font-weight:700;font-size:72px;line-height:.95;color:${S.v.txt};text-shadow:0 3px 18px rgba(0,0,0,.35)">${esc(S.text.note)}<svg viewBox="0 0 160 160" style="position:absolute;left:-150px;top:60px;width:150px;height:150px;overflow:visible"><path d="M150 20 C 110 60, 70 100, 20 140 M 50 136 L 18 142 L 26 110" fill="none" stroke="${S.v.txt}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` },
  { id: "colour-card", name: "Colour card", desc: "Card de cor cheia com poucas palavras (shrink card / takeover)", skills: ["video-colagem-oney", "kallaway"],
    render: (S) => `<div class="ov el" style="left:${cx(S) - 300}px;top:${ab(S, 560)}px;width:600px;height:420px;background:${S.v.acc};color:${S.v.acc === "#ffd21f" || S.v.acc === "#f4e27c" ? "#111" : "#fff"};border-radius:30px;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px;font-family:${S.font.hand || S.font.display};font-size:84px;line-height:1;box-shadow:0 30px 80px rgba(0,0,0,.4)">${esc(kw(S))}</div>` },
  { id: "stamp", name: "Carimbo ✓ / ✕", desc: "Carimbo redondo verde ✓ ou vermelho ✕ que estoura na palavra", skills: ["anuncios-oney", "video-colagem-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1400 : 700}px;top:${ab(S, 380)}px;display:flex;gap:40px"><i style="width:150px;height:150px;border-radius:50%;background:${S.v.sec};color:#fff;display:flex;align-items:center;justify-content:center;font-size:96px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.4)">✓</i><i style="width:150px;height:150px;border-radius:50%;background:${S.v.bad};color:#fff;display:flex;align-items:center;justify-content:center;font-size:96px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.4)">✕</i></div>` },
  { id: "emoji-list", name: "Checklist com emoji", desc: "✅ / ❌ + palavra, revelado item a item na fala (emoji Apple)", skills: ["reel-oney", "vsl"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 110 : 210}px;top:${ab(S, 380)}px;${disp(S, 48, "line-height:1.5;text-align:left")};color:${S.v.txt};text-shadow:0 2px 10px rgba(0,0,0,.5)">${["✅ Legenda", "✅ Gancho", "❌ Título longo"].map((t) => `<div class="li">${esc(caseOf(S, t))}</div>`).join("")}</div>` },
  { id: "phone-mock", name: "Mockup de celular", desc: "Tela 9:16 cujo conteúdo troca por frase (feed, DM, comentário)", skills: ["anuncios-oney", "video-colagem-oney", "vsl"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1300 : 640}px;top:${ab(S, 560)}px;width:240px;height:480px;border-radius:36px;background:#000;border:6px solid #2a2a2e;box-shadow:0 24px 60px rgba(0,0,0,.5);overflow:hidden"><div style="position:absolute;inset:0;background:linear-gradient(180deg,#15151a,#0b0b0e)"></div><div style="position:absolute;left:50%;top:14px;width:90px;height:22px;margin-left:-45px;border-radius:12px;background:#000"></div>${[0, 1, 2, 3].map((i) => `<div class="row" style="position:absolute;left:18px;top:${70 + i * 90}px;width:192px;height:70px;border-radius:14px;background:rgba(255,255,255,.08)"><i style="position:absolute;left:12px;top:14px;width:42px;height:42px;border-radius:50%;background:${i === 1 ? S.v.acc : "#444"}"></i><b style="position:absolute;left:66px;top:18px;width:100px;height:10px;background:#fff;opacity:.8;border-radius:5px"></b><b style="position:absolute;left:66px;top:38px;width:70px;height:8px;background:#fff;opacity:.35;border-radius:4px"></b></div>`).join("")}</div>` },
  { id: "glass-card", name: "Card de vidro", desc: "Painel fosco com borda-fio, kicker e título com acento", skills: ["vsl", "kallaway"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1180 : 120}px;top:${ab(S, 440)}px;width:${S.landscape ? 620 : 840}px;padding:36px 40px;border-radius:28px;background:rgba(255,255,255,.07);backdrop-filter:blur(22px) saturate(135%);border:1.5px solid rgba(255,255,255,.16);box-shadow:0 24px 70px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.22);color:${S.v.txt}"><div style="${body(S, 22, "font-weight:700;letter-spacing:.24em;text-transform:uppercase")};opacity:.7">O que você recebe</div><div style="${body(S, 56, "font-weight:800;letter-spacing:-.02em;line-height:1.05")};margin-top:10px">Vídeo <span style="color:${S.v.sec}">editado</span> em minutos</div></div>` },
  { id: "pill-glow", name: "Pílula com glow", desc: "Pílula gradiente que entra em back.out, 1–3 palavras", skills: ["vsl"],
    render: (S) => `<div class="ov el" style="left:0;top:${ab(S, 220)}px;width:${S.W}px;text-align:center"><span style="display:inline-block;padding:18px 38px;border-radius:999px;background:linear-gradient(90deg,${S.v.acc},${S.v.sec});color:#fff;${body(S, 34, "font-weight:800;letter-spacing:.02em")};box-shadow:0 0 34px ${S.v.acc}aa">✦ ${esc(caseOf(S, kw(S)))}</span></div>` },
  { id: "chip", name: "Chips", desc: "Etiquetas pequenas (azul / vermelho / amarelo / branco) perto da cabeça", skills: ["video-colagem-oney", "anuncios-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 110 : 120}px;top:${ab(S, 240)}px;display:flex;gap:18px;flex-wrap:wrap;width:${S.W - 240}px">${[["bruto · 4:05", S.v.sec], ["gaguejo", S.v.bad], ["com IA", S.v.acc], ["seu vídeo", "#fff"]].map(([t, c]) => `<span class="ch" style="padding:12px 24px;border-radius:14px;background:${c};color:${c === "#fff" || c === S.v.acc && /ffd21f|f4e27c|F5D82A/.test(c) ? "#111" : "#fff"};${body(S, 32, "font-weight:700")}">${esc(t)}</span>`).join("")}</div>` },
  { id: "schematic-flow", name: "Esquema: fluxo", desc: "Card → seta tracejada com ponto viajante → nó laranja (IA) → resultado", skills: ["anuncios-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 110 : 90}px;top:${ab(S, 520)}px;width:${S.W - 180}px;height:420px;border-radius:22px;background:rgba(16,16,19,.92);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:space-around;padding:0 30px"><div style="width:160px;height:284px;border-radius:18px;${printBox(S)}"></div><svg class="ar" viewBox="0 0 160 40" style="width:160px;height:40px;overflow:visible"><path d="M0 20 H150" stroke="#fff" stroke-width="3" stroke-dasharray="10 10" fill="none"/><circle class="dot" cx="0" cy="20" r="9" fill="${S.v.acc}"/><path d="M135 6 L158 20 L135 34" fill="none" stroke="#fff" stroke-width="3"/></svg><div style="width:130px;height:130px;border-radius:50%;background:#d97757;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Arial;font-weight:700;font-size:28px">IA</div><svg viewBox="0 0 160 40" style="width:160px;height:40px"><path d="M0 20 H150 M135 6 L158 20 L135 34" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="10 10"/></svg><div style="width:160px;height:284px;border-radius:18px;${printBox(S)};outline:3px solid ${S.v.sec}"></div></div>` },
  { id: "thumb-wall", name: "Parede de thumbnails", desc: "Grade de reels passados fecha por cima e por baixo, apresentador na faixa", skills: ["reel-editorial-oney", "video-colagem-oney", "vsl"],
    render: (S) => `<div class="ov el" style="left:0;top:0;width:${S.W}px;height:${Math.round(S.H * .3)}px;background:${S.v.paper};display:grid;grid-template-columns:repeat(${S.landscape ? 8 : 4},1fr);gap:14px;padding:24px;box-sizing:border-box">${Array.from({ length: S.landscape ? 8 : 8 }).map((_, i) => `<div class="th" style="border-radius:16px;background:linear-gradient(${120 + i * 40}deg,#2a2a33,#101014);box-shadow:0 10px 30px rgba(0,0,0,.25);min-height:0"></div>`).join("")}</div>` },
  { id: "film-strip", name: "Film strip", desc: "Fileira de frames deslizando no topo (\"em lote\", \"B-roll\")", skills: ["reel-editorial-oney"],
    render: (S) => `<div class="ov el" style="left:0;top:${safeTop(S) + 20}px;width:${S.W}px;height:200px;overflow:hidden"><div class="strip" style="display:flex;gap:16px;position:absolute;left:0;top:0">${Array.from({ length: 10 }).map((_, i) => `<div style="width:300px;height:200px;border-radius:14px;background:linear-gradient(${90 + i * 36}deg,#2b2b33,#151519);border:2px solid rgba(255,255,255,.12);flex:none"></div>`).join("")}</div></div>` },
  { id: "comment-bubble", name: "Comentário / DM", desc: "Bolha de comentário ou card de direct com o @ do perfil", skills: ["vsl", "anuncios-oney", "video-colagem-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1180 : 140}px;top:${ab(S, 300)}px;width:${S.landscape ? 620 : 800}px;background:#fff;color:#111;border-radius:26px;padding:26px 30px;${body(S, 36)};box-shadow:0 20px 60px rgba(0,0,0,.35);display:flex;gap:20px;align-items:center"><i style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,${S.v.acc},${S.v.sec});flex:none"></i><div><b style="display:block;font-weight:700">@${esc(S.text.user)}</b><span>${esc(S.text.comment)}</span></div></div>` },
  { id: "counter", name: "Número grande", desc: "Contador que sobe (views, posts, R$) com rótulo pequeno", skills: ["anuncios-oney", "video-colagem-oney", "vsl"],
    render: (S) => `<div class="ov el" style="left:0;top:${ab(S, 380)}px;width:${S.W}px;text-align:center;color:${S.v.txt}"><div class="num" data-to="6093" style="${disp(S, 200, "line-height:1;letter-spacing:-.03em")};text-shadow:0 0 30px ${S.v.acc}66">0</div><div style="${body(S, 34)};color:${S.v.acc};margin-top:6px">visualizações esta semana</div></div>` },
  { id: "progress", name: "Barra de progresso", desc: "Render / upload até 100 % + \"✓ publicado\"", skills: ["anuncios-oney", "vsl"],
    render: (S) => `<div class="ov el" style="left:${cx(S) - 380}px;top:${ab(S, 240)}px;width:760px;color:${S.v.txt};${body(S, 30, "font-weight:700")}"><div style="display:flex;justify-content:space-between"><span>Renderizando…</span><span class="pct">0 %</span></div><div style="height:18px;border-radius:9px;background:rgba(255,255,255,.15);margin-top:12px;overflow:hidden"><div class="bar" style="height:100%;width:100%;background:${S.v.acc};transform-origin:left;transform:scaleX(0)"></div></div></div>` },
  { id: "cta-pill", name: "CTA \"Comente PALAVRA\"", desc: "Caixa branca com a palavra-chave numa tag, fica até o fim", skills: ["video-colagem-oney", "vsl", "anuncios-oney"],
    render: (S) => `<div class="ov el" style="left:0;top:${S.landscape ? S.H - 170 : 1330}px;width:${S.W}px;text-align:center"><span style="display:inline-block;background:#fff;color:#111;border-radius:999px;padding:18px 34px;${body(S, 36, "font-weight:700")};box-shadow:0 16px 40px rgba(0,0,0,.35)">Comente <b style="background:${S.v.bad};color:#fff;border-radius:10px;padding:4px 14px;margin:0 6px">${esc(kw(S).toUpperCase())}</b> pra receber o link</span></div>` },
  { id: "support-band", name: "Faixa 16:9 de prova", desc: "Vídeo de arquivo no topo com tag ARQUIVO / ILUSTRAÇÃO / ano", skills: ["reel-explicativo-oney"],
    render: (S) => S.landscape ? `<div class="ov el" style="left:${S.W - 760}px;top:100px;width:640px;height:360px;background:#222;border:2px solid rgba(255,255,255,.1)"><span style="position:absolute;left:16px;top:16px;background:#111;color:#fff;padding:6px 14px;${body(S, 24, "font-weight:600;letter-spacing:.1em")}">ARQUIVO · 2019</span></div>` : `<div class="ov el" style="left:0;top:0;width:1080px;height:668px;background:linear-gradient(180deg,#1b2430,#0f1a24)"><div style="position:absolute;left:0;top:30px;width:1080px;height:608px;background:#22303d"></div><span style="position:absolute;left:56px;top:52px;background:#111;color:#fff;padding:8px 16px;${body(S, 26, "font-weight:600;letter-spacing:.1em")}">ARQUIVO · 2019</span><span style="position:absolute;right:40px;bottom:40px;color:#fff;opacity:.6;${body(S, 22)}">Crédito: fonte real</span></div>` },
  { id: "diagram-plane", name: "Plano de diagrama", desc: "Um plano branco; nós em texto, setas finas, um acento; muda no lugar", skills: ["reel-explicativo-oney"],
    render: (S) => `<div class="ov el" style="left:0;top:${S.landscape ? 0 : 0}px;width:${S.W}px;height:${S.landscape ? S.H : 1400}px;background:${S.v.paper};color:${S.v.ink}"><div style="position:absolute;left:0;width:${S.W}px;top:118px;text-align:center;${body(S, 38, "letter-spacing:.2em;text-transform:uppercase;font-weight:500")}">Passo 2 · quem paga</div><div style="position:absolute;left:0;width:${S.W}px;top:${S.landscape ? 300 : 560}px;text-align:center;${body(S, 88, "font-weight:600;letter-spacing:-.03em")}">Patrocinador</div><svg viewBox="0 0 100 160" style="position:absolute;left:${cx(S) - 50}px;top:${S.landscape ? 400 : 680}px;width:100px;height:160px"><path d="M50 0 V140 M20 110 L50 150 L80 110" fill="none" stroke="${S.v.ink}" stroke-width="4"/></svg><div style="position:absolute;left:0;width:${S.W}px;top:${S.landscape ? 580 : 860}px;text-align:center;color:${S.v.acc};${body(S, 88, "font-weight:600;letter-spacing:-.03em")}">${esc(kw(S))}</div></div>` },
  { id: "sticker", name: "Sticker recortado", desc: "Pessoa / objeto recortado com contorno branco, entra inclinado", skills: ["video-colagem-oney", "vox-explainer"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1350 : 660}px;top:${ab(S, 520)}px;width:320px;height:400px;border-radius:160px 160px 40px 40px;background:linear-gradient(180deg,#5a5a66,#2b2b33);outline:14px solid #fff;filter:drop-shadow(16px 16px 0 ${S.v.ink});transform:rotate(6deg)"><span style="position:absolute;left:50%;bottom:-70px;transform:translateX(-50%) rotate(-3deg);background:${S.v.acc};color:#fff;padding:8px 20px;font-family:${S.font.hand || "cursive"};font-size:40px;white-space:nowrap">${esc(S.text.user)}</span></div>` },
  { id: "live-bar", name: "Barra \"● IA EDITANDO\"", desc: "Timecode, contador de edições e 4 trilhas que crescem enquanto você fala", skills: ["vsl"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 110 : 60}px;top:${safeTop(S) - 30}px;width:${S.W - (S.landscape ? 220 : 120)}px;background:rgba(0,0,0,.72);border:1px solid ${S.v.acc}66;border-radius:18px;padding:18px 24px;font-family:${S.font.mono || "'JetBrains Mono',monospace"};font-size:24px;color:#fff"><div style="display:flex;justify-content:space-between"><span><i class="rec" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#ff3b3b;margin-right:10px"></i>IA EDITANDO</span><span>00:14:02 · 37 edições</span></div>${["VÍDEO", "TEXTO", "MOTION", "ÁUDIO"].map((t, i) => `<div style="display:flex;align-items:center;gap:14px;margin-top:10px;font-size:18px;opacity:.9"><span style="width:90px">${t}</span><span class="trk" style="height:12px;flex:1;border-radius:6px;background:${S.v.acc};opacity:${.5 + i * .12};transform-origin:left;transform:scaleX(${.3 + i * .18})"></span></div>`).join("")}</div>` },
];

// ---------------------------------------------------------------- 6. MOTION (multi-select; the first chosen drives the main preview entrance)
export const MOTIONS = [
  { id: "dry-cut", name: "Corte seco", desc: "Aparece e some sem transição (show/hide)", skills: ["reel-oney", "reel-editorial-oney"],
    anim: (tl, el) => tl.set(el, { opacity: 1 }).to(el, { opacity: 0, duration: 0.01 }, "+=1.2").to(el, { opacity: 1, duration: 0.01 }, "+=0.5") },
  { id: "blur-rise", name: "Blur rise", desc: "opacity 0 + blur 14px + y 20 → nítido, 0,45 s power3.out", skills: ["reel-editorial-oney", "vsl", "kallaway"],
    anim: (tl, el) => tl.from(el, { y: 22, opacity: 0, filter: "blur(14px)", duration: 0.5, ease: "power3.out" }) },
  { id: "pop", name: "Pop back.out", desc: "scale .6 → 1 com overshoot, 0,4 s", skills: ["video-colagem-oney", "vsl", "anuncios-oney"],
    anim: (tl, el) => tl.from(el, { scale: 0.6, opacity: 0, duration: 0.45, ease: "back.out(1.6)" }) },
  { id: "slide-tilt", name: "Slide + tilt", desc: "Entra de lado com leve inclinação e balanço 3D lento", skills: ["reel-editorial-oney", "video-colagem-oney"],
    anim: (tl, el) => tl.from(el, { x: 120, rotation: 8, opacity: 0, duration: 0.6, ease: "power3.out" }).to(el, { rotationY: 10, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 1 }) },
  { id: "punch-in", name: "Punch-in", desc: "Corte seco entre enquadramentos 1.0 ↔ 1.25 (nunca zoom animado)", skills: ["reel-editorial-oney", "reel-oney"], camera: true,
    anim: (tl, el, cam) => cam && tl.set(cam, { scale: 1 }).set(cam, { scale: 1.25 }, "+=1").set(cam, { scale: 1 }, "+=1.2") },
  { id: "camera-fly", name: "Câmera voa FULL → SPLIT", desc: "O vídeo vira um card arredondado em 0,45 s power3.inOut", skills: ["vsl"], camera: true,
    anim: (tl, el, cam) => cam && tl.to(cam, { scale: 0.62, y: "22%", borderRadius: 22, duration: 0.45, ease: "power3.inOut" }, 0.4).to(cam, { scale: 1, y: 0, borderRadius: 0, duration: 0.45, ease: "power3.inOut" }, "+=1.6") },
  { id: "carousel", name: "Carousel", desc: "Cards deslizam em fileira passando pelo centro", skills: ["kallaway", "vsl", "video-colagem-oney"], demo: "cards",
    anim: (tl, el) => { const cs = el.querySelectorAll(".dc"); tl.from(cs, { x: 400, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }).to(cs, { x: -420, duration: 1.6, ease: "none" }); } },
  { id: "orbit", name: "Orbit", desc: "Fotos circulam o apresentador na altura do peito", skills: ["vsl"], demo: "orbit",
    anim: (tl, el) => tl.to(el.querySelector(".ring"), { rotation: 360, duration: 3, ease: "none" }).to(el.querySelectorAll(".ph"), { rotation: -360, duration: 3, ease: "none" }, 0) },
  { id: "shrink-card", name: "Shrink card", desc: "O vídeo encolhe para dentro de um card de cor com palavras em volta", skills: ["video-colagem-oney", "kallaway"], camera: true,
    anim: (tl, el, cam) => cam && tl.to(cam, { scale: 0.56, borderRadius: 40, duration: 0.6, ease: "power3.inOut" }, 0.3).to(cam, { scale: 1, borderRadius: 0, duration: 0.5, ease: "power3.inOut" }, "+=1.6") },
  { id: "burst", name: "Thumbnail burst", desc: "10–14 thumbs explodem do apresentador (scatter)", skills: ["reel-editorial-oney"], demo: "burst",
    anim: (tl, el) => tl.from(el.querySelectorAll(".th"), { x: 0, y: 0, scale: 0, opacity: 0, duration: 0.9, stagger: 0.03, ease: "back.out(1.4)" }) },
  { id: "flash", name: "Flash / light leak", desc: "Branco → cor, 2–3 frames, na troca de cena", skills: ["video-colagem-oney", "vsl"], demo: "flash",
    anim: (tl, el) => tl.fromTo(el.querySelector(".fl"), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.6).to(el.querySelector(".fl"), { opacity: 0, duration: 0.45, ease: "power2.out" }) },
  { id: "glow-pulse", name: "Glow pulse", desc: "Halo respira (finito, yoyo), nunca estrobo", skills: ["kallaway", "vsl"],
    anim: (tl, el) => tl.to(el, { filter: "drop-shadow(0 0 30px currentColor)", duration: 0.9, yoyo: true, repeat: 3, ease: "sine.inOut" }) },
  { id: "count-tick", name: "Contador sobe", desc: "Número e barras preenchem até o valor", skills: ["anuncios-oney", "vsl", "video-colagem-oney"],
    anim: (tl, el) => { const n = el.querySelector(".num"), b = el.querySelector(".bar"), p = el.querySelector(".pct"); if (n) { const o = { v: 0 }; tl.to(o, { v: Number(n.dataset.to || 1000), duration: 1.4, ease: "power2.out", onUpdate: () => (n.textContent = Math.round(o.v).toLocaleString("pt-BR")) }); } if (b) { const o = { v: 0 }; tl.to(b, { scaleX: 1, duration: 1.4, ease: "power2.out" }, 0).to(o, { v: 100, duration: 1.4, ease: "power2.out", onUpdate: () => p && (p.textContent = Math.round(o.v) + " %") }, 0); } if (!n && !b) tl.from(el, { opacity: 0, duration: 0.3 }); } },
  { id: "draw", name: "Seta desenhada", desc: "Stroke SVG se desenha em 0,3–0,45 s", skills: ["video-colagem-oney", "vox-explainer", "reel-editorial-oney"],
    anim: (tl, el) => { const ps = el.querySelectorAll("path"); if (!ps.length) return tl.from(el, { opacity: 0, duration: 0.3 }); ps.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, "<0.1"); }); } },
  { id: "typewriter", name: "Typewriter", desc: "Texto digitado letra a letra (prompt, comentário)", skills: ["anuncios-oney", "vsl"],
    anim: (tl, el) => { const t = el.querySelector("span,div,b") || el; const full = t.textContent; const o = { n: 0 }; tl.to(o, { n: full.length, duration: Math.min(2, full.length * 0.045), ease: "none", onUpdate: () => (t.textContent = full.slice(0, Math.round(o.n))) }); } },
];

// ---------------------------------------------------------------- PRESETS (quick start)
export const PRESETS = [
  { id: "blank", name: "Começar do zero", desc: "Nada marcado.", skill: null, picks: {} },
  { id: "celular", name: "Celular", desc: "reel-oney: cru, prints brutos, Advercase, corte seco.", skill: "reel-oney",
    picks: { colours: "sunlit", fonts: "advercase", hook: "big-caps", captions: "one-word-outline", elements: ["print-raw", "emoji-list"], motion: ["dry-cut", "punch-in"] } },
  { id: "editorial", name: "Editorial", desc: "reel-editorial-oney: serifada manteiga, cards arredondados, blur rise.", skill: "reel-editorial-oney",
    picks: { colours: "butter", fonts: "inter-serif", hook: "serif-stack", captions: "one-word-lower", elements: ["print-card", "handwritten-note", "thumb-wall"], motion: ["blur-rise", "punch-in", "burst"] } },
  { id: "anuncio", name: "Anúncio", desc: "anuncios-oney: headline 5 s, esquemas acima da cabeça, zona segura.", skill: "anuncios-oney",
    picks: { colours: "sunlit", fonts: "advercase", hook: "headline-ad", captions: "one-word-stroke", elements: ["schematic-flow", "stamp", "counter", "cta-pill"], motion: ["pop", "count-tick"] } },
  { id: "colagem", name: "Colagem", desc: "video-colagem-oney: stickers, cards, flashes, blocos grandes.", skill: "video-colagem-oney",
    picks: { colours: "crimson", fonts: "anton-inter", hook: "colour-block", captions: "chunks-punch", elements: ["sticker", "chip", "phone-mock", "cta-pill"], motion: ["pop", "slide-tilt", "flash", "draw"] } },
  { id: "explicativo", name: "Explicativo", desc: "reel-explicativo-oney: faixa de prova, caixa opaca, um acento.", skill: "reel-explicativo-oney",
    picks: { colours: "verde", fonts: "inter", hook: "none", captions: "phrase-box", elements: ["support-band", "diagram-plane"], motion: ["dry-cut"] } },
  { id: "vsl-roxo", name: "VSL roxo", desc: "vsl: câmeras voando, pílulas com glow, título atrás da cabeça.", skill: "vsl",
    picks: { colours: "roxo", fonts: "anybody-jakarta", hook: "camcorder", captions: "key-phrase-box", elements: ["glass-card", "pill-glow", "live-bar"], motion: ["blur-rise", "camera-fly", "glow-pulse"] } },
  { id: "vsl-clean", name: "VSL clean", desc: "vsl (look clean): branco, azul claro, painel acima da cabeça, skins.", skill: "vsl",
    picks: { colours: "clean", fonts: "jakarta-inter", hook: "none", captions: "mouth-blocks", elements: ["emoji-list", "glass-card"], motion: ["blur-rise", "pop"] } },
  { id: "aurora", name: "Aurora glass", desc: "style-library kallaway: vidro, glow azul, glide.", skill: "kallaway",
    picks: { colours: "aurora", fonts: "jakarta-inter", hook: "behind-head", captions: "glass-caption", elements: ["glass-card", "colour-card"], motion: ["blur-rise", "carousel", "glow-pulse"] } },
  { id: "vox", name: "Vox papel", desc: "style-library vox-explainer: papel, recortes, setas à mão.", skill: "vox-explainer",
    picks: { colours: "vox", fonts: "fraunces-archivo", hook: "colour-block", captions: "none", elements: ["sticker", "handwritten-note"], motion: ["draw", "dry-cut"] } },
];

// Things a skill's DESIGN.md forbids. Checked in the review step.
export const CONFLICTS = [
  { skill: "reel-editorial-oney", test: (L) => L.fonts === "advercase", msg: "reel-editorial proíbe Advercase (é a voz do celular/anúncio)." },
  { skill: "reel-editorial-oney", test: (L) => L.colours === "sunlit", msg: "reel-editorial usa manteiga #f4e27c, nunca #ffd21f saturado." },
  { skill: "reel-editorial-oney", test: (L) => L.captions === "one-word-outline" || L.captions === "one-word-stroke", msg: "reel-editorial não usa contorno preto nas legendas." },
  { skill: "reel-oney", test: (L) => L.motion.some((m) => !["dry-cut", "punch-in"].includes(m)), msg: "reel-oney não tem motion: só show/hide. Qualquer animação quebra o look 'celular'." },
  { skill: "reel-oney", test: (L) => L.elements.includes("print-card") || L.elements.includes("glass-card"), msg: "reel-oney usa prints brutos (canto reto, sem sombra), nunca cards." },
  { skill: "reel-explicativo-oney", test: (L) => ["one-word-outline", "one-word-lower", "one-word-stroke", "chunks-punch"].includes(L.captions), msg: "reel-explicativo não usa karaokê palavra a palavra: frases curtas em caixa opaca." },
  { skill: "reel-explicativo-oney", test: (L) => L.fonts !== "inter", msg: "reel-explicativo é só Inter." },
  { skill: "reel-explicativo-oney", test: (L) => L.elements.includes("emoji-list"), msg: "reel-explicativo não usa emojis." },
  { skill: "video-colagem-oney", test: (L) => L.elements.includes("emoji-list"), msg: "colagem não usa emojis nem ícones vetoriais: fotos recortadas." },
  { skill: "anuncios-oney", test: (L) => L.hook === "none", msg: "anúncio precisa de headline nos primeiros 5 s." },
  { skill: "vsl", test: (L) => ["inter-serif", "fraunces-archivo", "playfair-inter"].includes(L.fonts), msg: "VSL roxo não usa serifadas." },
  { skill: "kallaway", test: (L) => L.motion.includes("dry-cut") || L.motion.includes("punch-in"), msg: "Aurora glass nunca corta seco: tudo desliza e respira." },
  { skill: "kallaway", test: (L) => ["inter-serif", "fraunces-archivo", "playfair-inter"].includes(L.fonts), msg: "Aurora glass não tem serifada (isso é Vox)." },
  { skill: "vox-explainer", test: (L) => L.elements.includes("glass-card") || L.motion.includes("glow-pulse"), msg: "Vox é papel e tinta: sem vidro nem glow." },
];
