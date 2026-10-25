// Legenda Dinâmica Studio for the Look builder: a browser port of the EffectCraft engine (plugin/scripts/motor/lds_core.jsx).
// Same models (TEMPLATES), presets (PRONTOS), entrances (ENTRADAS) and exits (SAIDAS), with the same sizes, colours,
// tracking, glows, shadows, decorations and keyframes, so a caption looks and moves like the catalogue GIF.
// Fonts are the Windows / Google families the engine names (Arial Black, Impact, Bahnschrift, Figtree, Bodoni, Garamond...).
// ldsAnim is self-contained (no closures) because testbuild.mjs serialises it into the real HyperFrames test page.

const W1 = [1, 1, 1], INK = [0.07, 0.07, 0.07], RED = [0.902, 0.098, 0.133];
const GLOW = { red: [0.95, 0.15, 0.18], yellow: [1, 0.78, 0.15], blue: [0.25, 0.55, 1], green: [0.3, 0.95, 0.55], purple: [0.62, 0.35, 1], pink: [1, 0.35, 0.55], orange: [1, 0.55, 0.12], white: [1, 1, 1] };
function T(o) { const d = { font: "Arial-BoldMT", fontBig: "Arial-BoldMT", italic: "Arial-BoldItalicMT", accent: "BodoniMT-Italic", accentCol: [0.86, 0.1, 0.13], big: 170, mid: 86, tiny: 60, col: W1, colBig: W1, trackBig: -35, track: -15, glow: null, caps: false, outline: false, hardShadow: false, deco: null, decoCol: [1, 0.85, 0.1], entrada: "foco", saida: "corte" }; return Object.assign(d, o); }
export const TEMPLATES = [
  T({ id: "minimal", name: "Minimal Branco", entrada: "foco" }),
  T({ id: "minimal-claro", name: "Minimal Escuro (fundo claro)", col: INK, colBig: INK, entrada: "foco" }),
  T({ id: "editorial", name: "Editorial Vermelho", font: "Figtree-SemiBold", fontBig: "Figtree-Black", italic: "Figtree-BlackItalic", big: 195, mid: 90, tiny: 62, colBig: RED, trackBig: -25, track: -5, glow: "red", accentCol: [0.95, 0.15, 0.18], entrada: "pop" }),
  T({ id: "impacto", name: "Impacto Laranja", font: "Inter-SemiBold", fontBig: "Impact", big: 220, mid: 86, tiny: 60, colBig: [0.961, 0.639, 0.102], trackBig: 0, track: 0, caps: true, entrada: "pop" }),
  T({ id: "neon-azul", name: "Neon Azul", fontBig: "Arial-Black", glow: "blue", entrada: "foco" }),
  T({ id: "neon-roxo", name: "Neon Roxo", fontBig: "Arial-Black", glow: "purple", entrada: "foco" }),
  T({ id: "neon-verde", name: "Neon Verde", fontBig: "Arial-Black", glow: "green", entrada: "foco" }),
  T({ id: "neon-rosa", name: "Neon Rosa", fontBig: "Arial-Black", glow: "pink", entrada: "foco" }),
  T({ id: "revista", name: "Revista Serifada", fontBig: "BodoniMT-Italic", colBig: [0.86, 0.1, 0.13], big: 185, trackBig: 0, entrada: "espacado" }),
  T({ id: "elegante", name: "Elegante Itálico", fontBig: "Garamond-Italic", big: 190, trackBig: 0, entrada: "fade", saida: "desfoque" }),
  T({ id: "amarelo", name: "Bold Amarelo", fontBig: "Arial-Black", colBig: [1, 0.85, 0.1], caps: true, big: 150, entrada: "quique" }),
  T({ id: "tech", name: "Tech Condensado", font: "Bahnschrift-BoldCondensed", fontBig: "Bahnschrift-BoldCondensed", caps: true, big: 200, mid: 86, tiny: 60, trackBig: 30, track: 20, entrada: "maquina" }),
  T({ id: "contorno", name: "Contorno", fontBig: "Figtree-Black", outline: true, big: 190, trackBig: -20, entrada: "zoomin" }),
  T({ id: "marca-texto", name: "Marca-texto", fontBig: "Arial-Black", colBig: INK, deco: "marca", decoCol: [1, 0.85, 0.1], big: 150, entrada: "pop" }),
  T({ id: "marca-redonda", name: "Marca-texto Arredondado", fontBig: "Arial-Black", colBig: INK, deco: "pilula", decoCol: [1, 0.85, 0.1], big: 150, entrada: "zoomout", saida: "zoomin" }),
  T({ id: "marca-redonda-roxa", name: "Marca Arredondada Roxa", fontBig: "Arial-Black", colBig: W1, deco: "pilula", decoCol: [0.55, 0.3, 0.95], big: 150, entrada: "pop", saida: "encolhe" }),
  T({ id: "cursiva-topo", name: "Cursiva em Cima", font: "BrushScriptMT", fontBig: "Arial-Black", mid: 128, tiny: 118, big: 165, track: 0, trackBig: -30, entrada: "foco" }),
  T({ id: "cursiva-topo-vermelha", name: "Cursiva em Cima Vermelha", font: "BrushScriptMT", fontBig: "Arial-Black", mid: 128, tiny: 118, big: 165, track: 0, trackBig: -30, colBig: [0.92, 0.1, 0.14], entrada: "pop" }),
  T({ id: "cursiva-segoe", name: "Cursiva Segoe + Bold", font: "SegoeScript-Bold", fontBig: "Figtree-Black", mid: 80, tiny: 70, big: 175, track: 0, trackBig: -25, glow: "white", entrada: "sobe", saida: "fade" }),
  T({ id: "cinema", name: "Cinema", font: "Bahnschrift-LightCondensed", fontBig: "Bahnschrift-LightCondensed", caps: true, big: 130, mid: 62, tiny: 52, track: 220, trackBig: 260, entrada: "cinematico", saida: "fade" }),
  T({ id: "cinema-serif", name: "Cinema Clássico", font: "Garamond", fontBig: "Garamond", caps: true, big: 120, mid: 60, tiny: 50, track: 200, trackBig: 240, entrada: "cinematico", saida: "desfoque" }),
  T({ id: "sublinhado", name: "Sublinhado Vermelho", deco: "sublinhado", decoCol: RED, entrada: "sobe" }),
  T({ id: "circulado", name: "Circulado Vermelho", fontBig: "Arial-Black", deco: "circulo", decoCol: RED, big: 165, entrada: "pop" }),
  T({ id: "circulado-amarelo", name: "Circulado Amarelo", fontBig: "Arial-Black", deco: "circulo", decoCol: [1, 0.85, 0.1], big: 165, entrada: "foco", saida: "fade" }),
  T({ id: "cursiva-meio", name: "Cursiva no Meio", font: "Figtree-SemiBold", fontMid: "SegoeScript-Bold", fontBig: "Figtree-Black", big: 195, mid: 96, tiny: 64, colBig: RED, trackBig: -25, track: -5, glow: "red", entrada: "pop" }),
  T({ id: "cursiva-meio-branca", name: "Cursiva no Meio Branca", font: "Figtree-SemiBold", fontMid: "SegoeScript-Bold", fontBig: "Figtree-Black", big: 195, mid: 96, tiny: 64, trackBig: -25, track: -5, glow: "white", entrada: "foco" }),
  T({ id: "cursiva-meio-brush", name: "Cursiva Pincel no Meio", font: "Figtree-SemiBold", fontMid: "BrushScriptMT", fontBig: "Figtree-Black", big: 195, mid: 130, tiny: 64, colBig: [1, 0.85, 0.1], trackBig: -25, track: 0, entrada: "impacto-cresce" }),
  T({ id: "retro-70", name: "Retrô Anos 70", layout: "espalhado", font: "Figtree-Black", fontBig: "BookmanOldStyle-BoldItalic", caps: true, big: 300, mid: 76, tiny: 76, track: -10, trackBig: -15, shade: true, entrada: "impacto" }),
  T({ id: "retro-70-laranja", name: "Retrô Anos 70 Laranja", layout: "espalhado", font: "Figtree-Black", fontBig: "BookmanOldStyle-BoldItalic", caps: true, big: 300, mid: 76, tiny: 76, track: -10, trackBig: -15, colBig: [1, 0.6, 0.16], shade: true, entrada: "impacto-cresce" }),
  T({ id: "retro-70-cooper", name: "Retrô Cooper", layout: "espalhado", font: "Figtree-Black", fontBig: "CooperBlack", caps: true, big: 300, mid: 76, tiny: 76, track: -10, trackBig: -20, shade: true, entrada: "pop" }),
  T({ id: "sombra-dura", name: "Sombra Dura", fontBig: "Arial-Black", hardShadow: true, big: 160, entrada: "elastico" }),
  T({ id: "palavra", name: "Palavra Única (grande)", font: "Arial-Black", fontBig: "Arial-Black", big: 150, mid: 150, tiny: 150, colBig: W1, trackBig: -30, glow: "white", shade: true, entrada: "foco" }),
  T({ id: "palavra-vermelha", name: "Palavra Única Vermelha", font: "Arial-Black", fontBig: "Arial-Black", big: 150, mid: 150, tiny: 150, colBig: [0.92, 0.1, 0.14], trackBig: -30, entrada: "foco" }),
  T({ id: "escada", name: "Escada (palavras em degraus)", layout: "escada", font: "Arial-BoldMT", fontBig: "Arial-BoldMT", fontTiny: "ArialMT", big: 205, mid: 190, tiny: 60, track: -20, trackBig: -55, entrada: "foco" }),
  T({ id: "escada-papel", name: "Escada no Papel (fundo branco)", layout: "escada", bgPaper: true, font: "Arial-BoldMT", fontBig: "Arial-BoldMT", fontTiny: "ArialMT", big: 205, mid: 190, tiny: 60, track: -20, trackBig: -55, col: INK, colBig: INK, entrada: "corte" }),
  T({ id: "misto-serifa", name: "Misto Serifa (sans + itálico)", layout: "linhas", font: "Inter-SemiBold", fontBig: "Garamond-Italic", big: 235, mid: 170, tiny: 160, track: -45, trackBig: -10, entrada: "foco" }),
  T({ id: "misto-serifa-amarelo", name: "Misto Serifa Amarelo", layout: "linhas", font: "Inter-SemiBold", fontBig: "Garamond-Italic", colBig: [1, 0.85, 0.1], big: 235, mid: 170, tiny: 160, track: -45, trackBig: -10, entrada: "sobe" }),
  T({ id: "cinza", name: "Cinza Suave", col: [0.62, 0.62, 0.62], entrada: "fade" }),
];
export const ENTRADAS = [
  ["sobe", "Simples Cima"], ["desce", "Simples Baixo"], ["esquerda", "Simples Esquerda"], ["direita", "Simples Direita"], ["bcima", "Bounce Cima"], ["bbaixo", "Bounce Baixo"], ["besq", "Bounce Esquerda"], ["bdir", "Bounce Direita"],
  ["zoomin", "Zoom In"], ["zoomout", "Zoom Out"], ["maquina", "Typewrite"], ["cinematico", "Cinematic"], ["flicker", "Flicker"], ["glitch", "Glitch"], ["foco", "Foco (desfoque)"], ["fade", "Fade"],
  ["pop", "Pop"], ["quique", "Quique"], ["elastico", "Elástico"], ["espacado", "Letras se juntam"], ["letra", "Letra por letra"], ["rastro", "Rastro"], ["rotacao", "Gira e entra"], ["corte", "Corte seco"],
  ["contador", "Contador (números sobem)"], ["impacto", "Impacto (lento + batida)"], ["impacto-cresce", "Impacto Cresce"],
].map(([id, name]) => ({ id, name }));
export const SAIDAS = [
  ["corte", "Corte seco (brusco)"], ["fade", "Fade"], ["desfoque", "Desfoca e some"], ["rastro", "Rastro (motion blur)"], ["sobe", "Sai por cima"], ["desce", "Sai por baixo"], ["esquerda", "Sai pela esquerda"], ["direita", "Sai pela direita"],
  ["zoomin", "Zoom para frente"], ["encolhe", "Encolhe"], ["quique", "Quique para fora"], ["glitch", "Glitch"], ["flicker", "Flicker"], ["letra", "Some letra por letra"], ["espacado", "Letras se espalham"],
].map(([id, name]) => ({ id, name }));
export const PRONTOS = [
  ["p1", "Clean Foco", "minimal", "foco", "corte"], ["p2", "Editorial Pop", "editorial", "pop", "desfoque"], ["p3", "Neon Glitch", "neon-azul", "glitch", "glitch"], ["p4", "Revista Cinematic", "revista", "cinematico", "fade"],
  ["p5", "Impacto Bounce", "impacto", "bcima", "encolhe"], ["p6", "Tech Typewrite", "tech", "maquina", "letra"], ["p7", "Marca-texto Zoom", "marca-texto", "zoomout", "zoomin"], ["p15", "Marca Arredondada Zoom", "marca-redonda", "zoomout", "zoomin"],
  ["p16", "Marca Roxa Pop", "marca-redonda-roxa", "pop", "encolhe"], ["p17", "Cursiva em Cima", "cursiva-topo", "foco", "corte"], ["p18", "Cinema", "cinema", "cinematico", "fade"], ["p19", "Cinema Clássico", "cinema-serif", "cinematico", "desfoque"],
  ["p20", "Escada Foco", "escada", "foco", "corte"], ["p21", "Escada no Papel", "escada-papel", "corte", "corte"], ["p26", "Impacto Batida", "impacto", "impacto", "corte"], ["p27", "Editorial Impacto", "editorial", "impacto-cresce", "corte"],
  ["p28", "Cursiva no Meio", "cursiva-meio", "pop", "corte"], ["p29", "Cursiva Meio Branca", "cursiva-meio-branca", "foco", "corte"], ["p30", "Cursiva Pincel Impacto", "cursiva-meio-brush", "impacto-cresce", "corte"], ["p31", "Retrô Anos 70", "retro-70", "impacto", "corte"],
  ["p32", "Retrô Laranja Cresce", "retro-70-laranja", "impacto-cresce", "corte"], ["p33", "Retrô Cooper Pop", "retro-70-cooper", "pop", "corte"], ["p24", "Circulado Pop", "circulado", "pop", "corte"], ["p25", "Circulado Amarelo", "circulado-amarelo", "foco", "fade"],
  ["p22", "Misto Serifa", "misto-serifa", "foco", "corte"], ["p23", "Misto Serifa Amarelo", "misto-serifa-amarelo", "sobe", "corte"], ["p8", "Neon Flicker", "neon-roxo", "flicker", "flicker"], ["p9", "Elegante Fade", "elegante", "fade", "desfoque"],
  ["p10", "Amarelo Quique", "amarelo", "quique", "quique"], ["p11", "Sublinhado Lateral", "sublinhado", "esquerda", "direita"], ["p12", "Sombra Elástica", "sombra-dura", "elastico", "sobe"], ["p13", "Contorno Zoom In", "contorno", "zoomin", "rastro"],
  ["p14", "Neon Verde Rastro", "neon-verde", "rastro", "rastro"],
].map(([id, name, template, entrada, saida]) => ({ id, name, template, entrada, saida }));
const byId = (arr, id) => arr.find((x) => x.id === id) || null;
const byName = (arr, n) => arr.find((x) => x.name.toLowerCase() === String(n || "").toLowerCase()) || null;

// AE PostScript names -> CSS (family, weight, style, stretch)
const FONT = {
  "Arial-BoldMT": ["Arial,Helvetica,sans-serif", 700], ArialMT: ["Arial,Helvetica,sans-serif", 400], "Arial-BoldItalicMT": ["Arial,Helvetica,sans-serif", 700, "italic"], "Arial-Black": ["'Arial Black','Arial',sans-serif", 900],
  "Figtree-SemiBold": ["'Figtree',sans-serif", 600], "Figtree-Black": ["'Figtree',sans-serif", 900], "Figtree-BlackItalic": ["'Figtree',sans-serif", 900, "italic"],
  "Inter-SemiBold": ["'Inter',sans-serif", 600], Impact: ["Impact,'Haettenschweiler','Anton',sans-serif", 400],
  "BodoniMT-Italic": ["'Bodoni MT','Bodoni Moda',Didot,serif", 400, "italic"], "Garamond-Italic": ["Garamond,'EB Garamond',serif", 400, "italic"], Garamond: ["Garamond,'EB Garamond',serif", 400],
  "Bahnschrift-BoldCondensed": ["'Bahnschrift',sans-serif", 700, "normal", "condensed"], "Bahnschrift-LightCondensed": ["'Bahnschrift',sans-serif", 300, "normal", "condensed"],
  BrushScriptMT: ["'Brush Script MT','Brush Script Std',cursive", 400, "italic"], "SegoeScript-Bold": ["'Segoe Script',cursive", 700],
  "BookmanOldStyle-BoldItalic": ["'Bookman Old Style','Bookman',serif", 700, "italic"], CooperBlack: ["'Cooper Black','Cooper Std',serif", 900],
};
const fontCss = (ps) => { const [f, w, st = "normal", sc = "normal"] = FONT[ps] || FONT["Arial-BoldMT"]; return `font-family:${f.replace(/"/g, "'")};font-weight:${w};font-style:${st};font-stretch:${sc}`; };
const rgb = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// planner.py rules: connectives are tiny, the strongest word of a screen is big
const TINY = new Set("o a os as um uma uns umas de do da dos das no na nos nas num numa em é e que se por pelo pela para pra pro com sem ao aos à às eu te me você vc ela ele elas eles isso isto essa esse esta este só já mais mas ou nem lhe seu sua seus suas meu minha nos nós vai foi era ser ter tem há aqui lá então quando como onde qual também bem".split(/\s+/));
const clean = (w) => String(w).toLowerCase().replace(/[^\wÀ-ÿ%]/g, "");
const score = (w, force) => { const c = clean(w); if (force && c === force) return 1000; if (TINY.has(c)) return -1; let s = c.length; if (/\d/.test(c)) s += 8; if (/[.!?]$/.test(w)) s += 3; return s; };
export function planScreens(words, keyword, maxw = 4) {
  const force = clean(keyword || ""); const out = []; let cur = [];
  words.forEach((w, i) => { cur.push(w); const strong = cur.filter((x) => score(x, force) >= 6).length; const last = i === words.length - 1;
    if (/[.!?,;:]$/.test(w) || last || cur.length >= maxw || strong >= 2) { const carry = []; if (!last && !/[.!?,;:]$/.test(w)) while (cur.length > 1 && score(cur[cur.length - 1], force) < 0) carry.unshift(cur.pop()); out.push(cur); cur = carry; } });
  if (cur.length) out.push(cur);
  return out.map((ws) => { const sc = ws.map((w) => score(w, force)); let k = 0; sc.forEach((v, j) => { if (v >= sc[k]) k = j; }); return { k, words: ws.map((w, j) => ({ w, tier: j === k && sc[j] >= 0 ? "big" : sc[j] < 0 ? "tiny" : "mid" })) }; });
}

// one word as HTML (size in comp px, styled like styleLayer + effects + decorate)
function wordHtml(M, wd, inId, outId) {
  const big = wd.tier === "big", tier = wd.tier;
  const ps = big ? M.fontBig : tier === "tiny" && M.fontTiny ? M.fontTiny : tier === "mid" && M.fontMid ? M.fontMid : M.font;
  let size = big ? M.big : tier === "mid" ? M.mid : M.tiny; size = big ? Math.max(size, 110) : Math.max(size, tier === "mid" ? 62 : 50);
  const col = big ? M.colBig : M.col, track = (big ? M.trackBig : M.track) / 1000;
  const txt = big && M.caps ? String(wd.w).toUpperCase() : wd.w;
  const sh = [];
  if (M.shade) sh.push("0 0 30px rgba(0,0,0,.85)");
  if (big && M.hardShadow) sh.push(`${Math.round(9 * 0.71)}px ${Math.round(9 * 0.71)}px 0 #000`);
  if (big && M.glow) { const g = GLOW[M.glow]; sh.push(`0 0 12px ${rgb(g, 1)}`, `0 0 34px ${rgb(g, 0.5)}`); }
  const fill = big && M.outline ? `color:transparent;-webkit-text-stroke:5px ${rgb(col)}` : `color:${rgb(col)}`;
  // deco under the keyword (marca / pilula: block behind; sublinhado: line; circulo: hand-drawn loop)
  let deco = "";
  if (big && M.deco === "marca") deco = `<i class="dc marca" style="position:absolute;left:-18px;right:-18px;top:14%;bottom:4%;background:${rgb(M.decoCol)};transform:rotate(-1.5deg);transform-origin:0 50%;z-index:-1"></i>`;
  else if (big && M.deco === "pilula") deco = `<i class="dc pilula" style="position:absolute;left:-26px;right:-26px;top:8%;bottom:0;border-radius:${Math.round(size * 0.24)}px;background:${rgb(M.decoCol)};transform-origin:50% 50%;z-index:-1"></i>`;
  else if (big && M.deco === "sublinhado") deco = `<i class="dc sub" style="position:absolute;left:-18px;right:-18px;bottom:-${Math.round(size * 0.1)}px;height:${Math.max(8, Math.round(size * 0.08))}px;border-radius:9px;background:${rgb(M.decoCol)};transform-origin:0 50%"></i>`;
  else if (big && M.deco === "circulo") deco = `<svg class="dc circ" viewBox="-60 -40 220 180" preserveAspectRatio="none" style="position:absolute;left:-36%;top:-40%;width:172%;height:180%;overflow:visible;transform:rotate(-4deg)"><path d="M100 18 C 150 10, 160 70, 120 98 C 80 120, 10 110, 0 70 C -10 30, 40 0, 95 6 C 140 12, 150 40, 140 60" fill="none" stroke="${rgb(M.decoCol)}" stroke-width="${Math.max(7, Math.round(size * 0.065)) / 3}" stroke-linecap="round" vector-effect="non-scaling-stroke" style="stroke-width:${Math.max(7, Math.round(size * 0.065))}px"/></svg>`;
  const chars = ["letra", "maquina"].includes(inId) || outId === "letra" ? [...txt].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("") : esc(txt);
  return `<span class="lw" data-in="${inId}" data-out="${outId}" data-big="${big ? 1 : 0}" data-track="${track}" style="position:relative;display:inline-block;white-space:nowrap;${fontCss(ps)};font-size:${size}px;line-height:1;letter-spacing:${track}em;${fill};${sh.length ? `text-shadow:${sh.join(",")};` : ""}isolation:isolate">${deco}${chars}</span>`;
}

// a caption object for the Look builder (render(S) + capAnim). S.ldsIn overrides the entrance (the user's pick).
export function ldsCaptionFor(pronto) {
  const P = byId(PRONTOS, pronto.id) || byName(PRONTOS, pronto.name) || { id: pronto.id, name: pronto.name, template: (byName(TEMPLATES, pronto.modelo) || TEMPLATES[0]).id, entrada: (byName(ENTRADAS, pronto.entrada) || { id: "foco" }).id, saida: (byName(SAIDAS, pronto.saida) || { id: "corte" }).id };
  const M = byId(TEMPLATES, P.template) || TEMPLATES[0];
  return {
    id: `lds:${pronto.id}`, name: pronto.name || P.name, desc: `${M.name} · entrada ${(byId(ENTRADAS, P.entrada) || {}).name || P.entrada} · saída ${(byId(SAIDAS, P.saida) || {}).name || P.saida}`,
    skills: ["legenda-dinamica-studio"], mode: "lds", lds: { ...pronto, template: M.id, entradaId: P.entrada, saidaId: P.saida },
    render: (S) => {
      const ein = S.ldsIn || P.entrada, eout = P.saida;
      const screens = planScreens(S.text.words || [], S.text.keyword);
      const cy = S.capTop + 70, MAXW = S.W - 160;
      const paper = M.bgPaper ? `<i style="position:absolute;left:0;top:${-cy - 200}px;width:${S.W}px;height:${S.H + 400}px;background:#f9f9f7;z-index:-2"></i>` : "";
      return `<div class="ov caps lds" data-lds="${P.id}" style="left:0;top:${cy}px;width:${S.W}px;height:0">${screens.map((sc, i) => {
        const ws = sc.words.map((wd) => { const big = wd.tier === "big"; const myIn = big ? ein : ["letra", "maquina", "espacado", "glitch", "quique", "elastico"].includes(ein) ? "foco" : ein; return wordHtml(M, wd, myIn, eout); });
        const pre = ws.slice(0, sc.k), kwd = ws[sc.k], post = ws.slice(sc.k + 1), gap = Math.round((M.big || 170) * 0.3 * 0.36);
        let body;
        if (M.layout === "escada") { const lines = []; let cur = []; sc.words.forEach((wd, j) => { cur.push(ws[j]); if (cur.length >= 2) { lines.push(cur); cur = []; } }); if (cur.length) lines.push(cur); const OFF = [0.075, -0.075, 0.055, -0.055];
          body = `<div style="display:flex;flex-direction:column;align-items:center;gap:6px">${lines.map((l, li) => `<div style="display:flex;gap:${gap}px;align-items:baseline;transform:translateX(${lines.length > 1 ? OFF[li % 4] * S.W : 0}px)">${l.join("")}</div>`).join("")}</div>`; }
        else if (M.layout === "linhas") body = `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;column-gap:${gap}px;row-gap:4px;max-width:${S.W - 100}px">${ws.join("")}</div>`;
        else if (M.layout === "espalhado") body = `<div style="display:inline-flex;flex-direction:column;align-items:stretch">${pre.length ? `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:${Math.round(M.big * 0.1)}px">${pre.join("")}</div>` : ""}<div style="text-align:center">${kwd}</div>${post.length ? `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:${Math.round(M.big * 0.08)}px">${post.join("")}</div>` : ""}</div>`;
        else body = `<div style="display:inline-flex;flex-direction:column;align-items:center;max-width:${MAXW}px">${pre.length ? `<div style="display:flex;gap:${gap}px;align-items:baseline;align-self:flex-start;margin-left:4%;margin-bottom:${Math.round(M.big * 0.04)}px">${pre.join("")}</div>` : ""}<div>${kwd}</div>${post.length ? `<div style="display:flex;gap:${gap}px;align-items:baseline;align-self:flex-end;margin-top:${Math.round(M.big * 0.06)}px">${post.join("")}</div>` : ""}</div>`;
        return `<div class="w" data-i="${i}" style="position:absolute;left:0;top:0;width:${S.W}px;display:flex;justify-content:center;transform:translateY(-50%);opacity:0">${body}</div>`;
      }).join("")}${paper}</div>`;
    },
    capAnim: ldsAnim,
  };
}

// Entrances / exits with the engine's keyframes (applyIn / applyOut, d = 0.22 / 0.16), word by word inside each screen.
export function ldsAnim(tl, root, start, dt) {
  const FR = 1 / 30, D = 0.22, DO = 0.16;
  const blurTo = (n, from, to, t, dur) => tl.fromTo(n, { filter: `blur(${from}px)` }, { filter: `blur(${to}px)`, duration: dur, ease: "power2.out", immediateRender: false }, t);
  const enter = (n, id, t, big) => {
    const opa = (dur) => tl.fromTo(n, { opacity: 0 }, { opacity: 1, duration: dur, ease: "none", immediateRender: false }, t);
    tl.set(n, { opacity: 0 }, Math.max(0, t - 0.001));
    if (id === "corte") tl.set(n, { opacity: 1 }, t);
    else if (id === "fade") opa(D);
    else if (id === "foco") { blurTo(n, big ? 20 : 11, 0, t, D); tl.fromTo(n, { scale: big ? 1.16 : 1.1 }, { scale: 1, duration: D, ease: "power3.out", immediateRender: false }, t); opa(D * 0.55); }
    else if (id === "pop" || id === "contador") { tl.fromTo(n, { scale: 0.7 }, { keyframes: [{ scale: 1.06, duration: D * 0.6 }, { scale: 1, duration: D * 0.5 }], ease: "power2.out", immediateRender: false }, t); opa(0.06); }
    else if (id === "quique") { tl.set(n, { opacity: 1 }, t); tl.fromTo(n, { scale: 0 }, { keyframes: [{ scale: 1.18, duration: D * 0.7 }, { scale: 0.92, duration: D * 0.45 }, { scale: 1.04, duration: D * 0.35 }, { scale: 1, duration: D * 0.3 }], immediateRender: false }, t); }
    else if (id === "elastico") { tl.fromTo(n, { scaleX: 1.35, scaleY: 0.6 }, { keyframes: [{ scaleX: 0.9, scaleY: 1.12, duration: D * 0.6 }, { scaleX: 1.03, scaleY: 0.97, duration: D * 0.5 }, { scaleX: 1, scaleY: 1, duration: D * 0.4 }], immediateRender: false }, t); opa(0.05); }
    else if (["sobe", "desce", "esquerda", "direita"].includes(id)) { const dx = id === "esquerda" ? -140 : id === "direita" ? 140 : 0, dy = id === "sobe" ? 60 : id === "desce" ? -60 : 0; tl.fromTo(n, { x: dx, y: dy }, { x: 0, y: 0, duration: D, ease: "power3.out", immediateRender: false }, t); opa(D * 0.5); blurTo(n, 5, 0, t, D * 0.8); }
    else if (id === "zoomin") { tl.fromTo(n, { scale: 1.7 }, { scale: 1, duration: D, ease: "power3.out", immediateRender: false }, t); opa(D * 0.5); blurTo(n, 12, 0, t, D); }
    else if (id === "zoomout") { tl.fromTo(n, { scale: 0.3 }, { scale: 1, duration: D, ease: "power3.out", immediateRender: false }, t); opa(D * 0.4); }
    else if (id === "espacado") { const tr = +n.dataset.track || 0; tl.fromTo(n, { letterSpacing: `${tr + (big ? 0.11 : 0.14)}em` }, { letterSpacing: `${tr}em`, duration: D * 1.6, ease: "power3.out", immediateRender: false }, t); blurTo(n, 9, 0, t, D); opa(D * 0.5); }
    else if (id === "letra" || id === "maquina") { const cs = [...n.querySelectorAll(".ch")]; tl.set(n, { opacity: 1 }, t); const dur = id === "maquina" ? Math.min(0.9, 0.045 * cs.length) : D * 1.4; cs.forEach((c, k) => { tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: id === "letra" ? 0.06 : 0.001, immediateRender: false }, t + (k / Math.max(1, cs.length)) * dur); }); if (id === "letra") blurTo(n, 5, 0, t, dur); tl.set(cs, { opacity: 0 }, Math.max(0, t - 0.001)); }
    else if (id === "rotacao") { tl.fromTo(n, { rotation: -14, scale: 0.8 }, { rotation: 0, scale: 1, duration: D, ease: "power3.out", immediateRender: false }, t); opa(D * 0.5); }
    else if (id === "glitch") { const w = Math.max(0.2, D * 1.4), steps = Math.round(w * 24); tl.set(n, { opacity: 1 }, t + 0.03); for (let k = 0; k < steps; k++) { const r1 = Math.sin((k + 1) * 12.9898) * 43758.5453, r2 = Math.sin((k + 1) * 78.233) * 12345.678; const fx = (r1 - Math.floor(r1)) * 68 - 34, fy = (r2 - Math.floor(r2)) * 14 - 7; tl.set(n, { x: fx, y: fy, textShadow: `${-6 - (k % 3) * 3}px 0 0 rgba(255,26,64,.9),${6 + (k % 2) * 4}px 0 0 rgba(26,230,255,.9)` }, t + k / 24); } tl.set(n, { x: 0, y: 0, textShadow: n.style.textShadow || "none" }, t + w); }
    else if (id === "bcima" || id === "bbaixo" || id === "besq" || id === "bdir") { const vx = id === "besq" ? -1 : id === "bdir" ? 1 : 0, vy = id === "bcima" ? 1 : id === "bbaixo" ? -1 : 0, A = vx ? 150 : 90; tl.fromTo(n, { x: vx * A, y: vy * A }, { keyframes: [{ x: -vx * A * 0.16, y: -vy * A * 0.16, duration: D * 0.75 }, { x: vx * A * 0.06, y: vy * A * 0.06, duration: D * 0.4 }, { x: 0, y: 0, duration: D * 0.35 }], ease: "power2.out", immediateRender: false }, t); opa(D * 0.4); }
    else if (id === "cinematico") { const tr = +n.dataset.track || 0; tl.fromTo(n, { letterSpacing: `${tr + 0.07}em`, scale: 1.06 }, { letterSpacing: `${tr}em`, scale: 1, duration: D * 3, ease: "power2.out", immediateRender: false }, t); opa(D * 2.2); blurTo(n, 7, 0, t, D * 2); }
    else if (id === "flicker") { [0, 1, 0, 0, 1, 0.25, 1, 0, 1].forEach((v, q) => tl.set(n, { opacity: v }, t + q * FR * 1.5)); }
    else if (id === "impacto" || id === "impacto-cresce") { const b0 = id === "impacto", T1 = Math.max(0.3, D * 1.8); tl.fromTo(n, { scale: b0 ? 1.35 : 0.72 }, { scale: b0 ? 1.12 : 0.9, duration: T1, ease: "power1.out", immediateRender: false }, t); tl.set(n, { scale: b0 ? 0.97 : 1.03, y: b0 ? 6 : -6 }, t + T1 + FR); tl.set(n, { x: -3, y: -2 }, t + T1 + FR * 2); tl.set(n, { scale: 1, x: 0, y: 0 }, t + T1 + FR * 3); opa(0.08); blurTo(n, b0 ? 5 : 3, 0.75, t, T1); tl.set(n, { filter: "blur(0px)" }, t + T1 + FR); }
    else if (id === "rastro") { tl.fromTo(n, { x: -100 }, { x: 0, duration: D, ease: "power3.out", immediateRender: false }, t); opa(D * 0.5); blurTo(n, 10, 0, t, D); }
    else opa(D);
    // keyword decorations draw in with the word
    const dc = n.querySelector(".dc"); if (dc) { if (dc.classList.contains("marca")) tl.fromTo(dc, { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out", immediateRender: false }, t); else if (dc.classList.contains("pilula")) tl.fromTo(dc, { scaleX: 0 }, { keyframes: [{ scaleX: 1.04, duration: 0.22 }, { scaleX: 1, duration: 0.1 }], immediateRender: false }, t); else if (dc.classList.contains("sub")) tl.fromTo(dc, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, t + 0.1); else { const p = dc.querySelector("path"); if (p && p.getTotalLength) { const L = p.getTotalLength(); p.style.strokeDasharray = L; tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.62, ease: "power2.inOut", immediateRender: false }, t + 0.08); } } }
  };
  const leave = (n, id, t1) => {
    const t0 = t1 - DO; if (!id || id === "corte") return;
    if (id === "fade") tl.to(n, { opacity: 0, duration: DO }, t0);
    else if (id === "desfoque") { tl.to(n, { opacity: 0, filter: "blur(15px)", duration: DO }, t0); }
    else if (id === "rastro") tl.to(n, { x: 100, opacity: 0, filter: "blur(10px)", duration: DO }, t0);
    else if (["sobe", "desce", "esquerda", "direita"].includes(id)) tl.to(n, { x: id === "esquerda" ? -140 : id === "direita" ? 140 : 0, y: id === "sobe" ? -60 : id === "desce" ? 60 : 0, opacity: 0, duration: DO }, t0);
    else if (id === "zoomin") tl.to(n, { scale: 1.5, opacity: 0, duration: DO }, t0);
    else if (id === "encolhe") tl.to(n, { scale: 0, duration: DO }, t0);
    else if (id === "quique") tl.to(n, { keyframes: [{ scale: 1.12, duration: DO * 0.4 }, { scale: 0, duration: DO * 0.6 }] }, t0);
    else if (id === "flicker") [1, 0, 1, 0.3, 1, 0, 0].forEach((v, q) => tl.set(n, { opacity: v }, t1 - (7 - q) * FR * 1.5));
    else if (id === "glitch") { for (let k = 0; k < 5; k++) tl.set(n, { x: (k % 2 ? -1 : 1) * (10 + k * 5), textShadow: "-8px 0 0 rgba(255,26,64,.9),8px 0 0 rgba(26,230,255,.9)" }, t1 - 0.2 + k * 0.04); tl.set(n, { opacity: 0 }, t1); }
    else if (id === "letra") { const cs = [...n.querySelectorAll(".ch")]; cs.forEach((c, k) => tl.to(c, { opacity: 0, duration: 0.02 }, t0 + (k / Math.max(1, cs.length)) * DO)); }
    else if (id === "espacado") tl.to(n, { letterSpacing: "0.12em", opacity: 0, duration: DO }, t0);
    else tl.to(n, { opacity: 0, duration: DO }, t0);
  };
  [...root.querySelectorAll(".w")].forEach((scr, i) => {
    const t0 = start + i * dt, t1 = start + (i + 1) * dt, lw = [...scr.querySelectorAll(".lw")];
    tl.set(lw, { opacity: 0 }, Math.max(0, t0 - 0.002));
    const step = Math.min(0.28, (dt - 0.35) / Math.max(1, lw.length));
    lw.forEach((n, j) => { enter(n, n.dataset.in, t0 + 0.02 + j * step, n.dataset.big === "1"); if (dt - j * step > 0.4) leave(n, n.dataset.out, t1); });
  });
}
