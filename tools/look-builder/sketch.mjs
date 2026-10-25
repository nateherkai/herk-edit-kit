// Face-free layout sketches for preset/template cards, in the spirit of the Brand Nat style guide: a 9:16 frame
// (90×160 units), a plain grey figure, and blocks showing where captions, panels and cards sit. Built from a
// preset's picks (hook, captions, first two elements) so every template gets a sketch without hand-drawing.
// Colours come from the preset's palette (accent) so the family is recognisable at a glance.

const R = (x, y, w, h, fill, rx = 1.5, ex = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${ex}/>`;
const O = (cx, cy, r, fill, ex = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${ex}/>`;
const P = (d, stroke, w = 1, ex = "") => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${ex}/>`;
const T = (x, y, s, size, fill, weight = 800, anchor = "middle", extra = "") => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-family="Inter Tight,Inter,sans-serif" font-weight="${weight}" ${extra}>${s}</text>`;
const rot = (deg, cx, cy, inner) => `<g transform="rotate(${deg} ${cx} ${cy})">${inner}</g>`;
const lines = (x, y, w, n, gap = 4, fill = "#C9C2B6") => Array.from({ length: n }, (_, k) => R(x, y + k * gap, w * (k === n - 1 ? 0.6 : 1 - (k % 2) * 0.12), 1.6, fill, 0.8)).join("");
// grey figure: head centre (x, y), scale s, shoulders down to bottom
const FIG = (x = 45, y = 96, s = 1, fill = "#A8A29A", bottom) => { const b = bottom ?? y + 64 * s; return `<path d="M${x - 28 * s} ${b} Q${x - 28 * s} ${y + 22 * s} ${x} ${y + 20 * s} Q${x + 28 * s} ${y + 22 * s} ${x + 28 * s} ${b} Z" fill="${fill}"/>` + O(x, y, 12 * s, fill); };
const photo = (x, y, w, h, i = 0) => R(x, y, w, h, ["#BFD9EE", "#D9CDB8", "#C9D8C0", "#E3C9C9", "#CFCFE6"][i % 5], 1) + `<path d="M${x} ${y + h} L${x + w * 0.35} ${y + h * 0.45} L${x + w * 0.6} ${y + h * 0.75} L${x + w * 0.75} ${y + h * 0.6} L${x + w} ${y + h} Z" fill="#7FAF8A" opacity=".7"/>`;
const card = (x, y, w, h, deg = 0, fill = "#fff") => rot(deg, x + w / 2, y + h / 2, R(x, y, w, h, fill, 1.6, 'stroke="#D9D2C6" stroke-width=".6"'));

// Element sketches: what each element adds around the figure. acc = accent colour.
const EL = {
  "explainer-panel": (acc) => R(0, 0, 90, 108, "#26231F", 0) + lines(14, 14, 62, 3, 5, "#6E665C") + [0, 1, 2].map((i) => R(13 + i * 24, 34, 16, 16, i === 1 ? acc : "#3A352F", 4)).join("") + T(45, 80, "90", 26, acc) + FIG(45, 128, 0.7, "#A8A29A", 160),
  "glass-explainer": (acc) => R(0, 0, 90, 108, "#1A2230", 0) + R(10, 14, 70, 30, "rgba(255,255,255,.14)", 3) + T(45, 36, "4.820", 16, acc) + P("M12 95 C 30 92, 45 80, 60 70 S 78 55, 82 50", acc, 1.6) + FIG(45, 128, 0.7, "#A8A29A", 160),
  "split-top-diagram": (acc) => R(0, 80, 90, 80, "#F6F1E9", 0) + [0, 1, 2].map((i) => O(45, 96 + i * 20, 5, acc) + T(45, 98 + i * 20, String(i + 1), 6, "#fff")).join("") + FIG(45, 42, 0.8, "#A8A29A", 80),
  "tier-list": (acc) => R(6, 84, 78, 70, "#111", 2) + ["#ff6b6b", "#ffa94d", "#ffd43b", "#8ce99a", "#74c0fc", "#b197fc", "#e599f7"].map((c, i) => R(6, 84 + i * 10, 10, 10, c, 0) + T(11, 92 + i * 10, "SABCDEF"[i], 6, "#111")).join("") + R(24, 115, 26, 7, "#1877f2", 1.5),
  "image-cluster": (acc) => card(10, 24, 30, 22, -6) + card(42, 18, 34, 24, 3) + card(26, 44, 36, 20, -2) + photo(12, 26, 26, 18, 0) + photo(44, 20, 30, 20, 1) + photo(28, 46, 32, 16, 2),
  "price-tag-card": (acc) => R(14, 22, 62, 42, "#D9CDB8", 2) + R(52, 30, 22, 9, "#fff", 1.5) + T(63, 37, "R$ 398", 5, "#111") + T(45, 76, "R$ 500", 9, acc),
  "depth-ui-youtube": (acc) => R(8, 10, 74, 80, "#0f0f0f", 4) + lines(14, 16, 50, 1, 4, "#777") + [0, 1, 2, 3, 4, 5].map((i) => R(14 + (i % 3) * 22, 26 + Math.floor(i / 3) * 20, 18, 14, "#333", 1.5)).join("") + R(22, 118, 46, 12, "#1b1b1f", 3) + O(29, 124, 4, acc) + R(36, 121, 18, 2, "#fff", 1) + R(36, 125, 12, 2, "#3ea6ff", 1),
  "cutout-grid": (acc) => photo(2, 2, 42, 76, 0) + photo(46, 2, 42, 76, 1) + photo(2, 82, 42, 76, 2) + photo(46, 82, 42, 76, 3),
  "cutout-backdrop": (acc) => photo(0, 0, 90, 160, 0),
  "visual-essay": (acc) => R(0, 0, 90, 160, "#000", 0) + R(10, 22, 70, 40, "none", 1, `stroke="${acc}" stroke-width="1.2"`) + lines(16, 30, 58, 3, 6, "#fff") + T(45, 56, "0", 14, acc),
  "if-then-grid": (acc) => [0, 1, 2, 3, 4, 5].map((i) => R(12 + (i % 2) * 34, 16 + Math.floor(i / 2) * 14, 32, 12, i < 2 ? acc : i % 2 ? "#fff" : "#F3ECDF", 1.5, 'stroke="#D9D2C6" stroke-width=".4"')).join(""),
  "this-vs-that": (acc) => R(10, 14, 70, 50, "#1b1b1f", 3) + R(10, 14, 35, 10, "#E5484D", 0) + R(45, 14, 35, 10, acc, 0) + lines(16, 30, 24, 3, 9, "#ddd") + lines(50, 30, 24, 3, 9, acc),
  "rapid-list": (acc) => [0, 1, 2, 3].map((i) => R(12, 18 + i * 12, 9, 9, acc, 2) + T(16.5, 25 + i * 12, String(i + 1), 5, "#111") + R(24, 21 + i * 12, 40, 3, "#fff", 1.5)).join(""),
  "top5-board": (acc) => R(10, 14, 70, 56, "#1b1b1f", 3) + [0, 1, 2, 3, 4].map((i) => T(16, 26 + i * 10, String(i + 1), 7, acc) + R(22, 20 + i * 10, 52, 6, i === 2 ? "#fff" : "#2a2a2e", 1.5)).join(""),
  "clone-versus": (acc) => R(45, 0, 45, 160, "#2a2a30", 0) + FIG(22, 96, 0.8) + FIG(68, 96, 0.8, "#8E8880") + R(44, 0, 2, 160, acc, 0),
  "dotted-canvas-phones": (acc) => R(0, 0, 90, 160, "#141210", 0) + Array.from({ length: 48 }, (_, i) => O(5 + (i % 8) * 11.5, 5 + Math.floor(i / 8) * 11.5, 0.6, "#555")).join("") + [-2, -1, 0, 1, 2].map((i) => rot(i * 14, 45, 60, R(37, 20, 16, 30, "#3A4A5A", 3, 'stroke="#fff" stroke-width=".8"'))).join("") + T(45, 72, "video", 8, "#fff"),
  "quote-cards": (acc) => card(6, 18, 36, 16, -5) + card(46, 14, 38, 16, 3) + card(10, 40, 34, 14, 2) + lines(10, 23, 28, 2, 4, "#111") + lines(50, 19, 30, 2, 4, "#111") + lines(14, 45, 26, 2, 4, "#111"),
  "mural-polaroides": (acc) => card(8, 16, 26, 30, -8) + card(38, 10, 26, 30, 4) + card(60, 30, 24, 28, 8) + photo(10, 18, 22, 20, 0) + photo(40, 12, 22, 20, 1) + photo(62, 32, 20, 18, 2),
  "satelites": (acc) => `<ellipse cx="45" cy="100" rx="38" ry="12" fill="none" stroke="${acc}" stroke-width=".8" stroke-dasharray="2 2"/>` + [0, 1, 2, 3].map((i) => R(8 + i * 22, 92 + (i % 2) * 8, 10, 14, i % 2 ? "#fff" : acc, 2)).join(""),
  "print-card": (acc) => card(44, 24, 40, 30, -4) + lines(48, 30, 30, 4, 5, "#999"),
  "thumb-column": (acc) => R(50, 70, 34, 60, "#fff", 3) + [0, 1, 2, 3, 4, 5].map((i) => R(53 + (i % 3) * 10, 73 + Math.floor(i / 3) * 28, 8, 26, "#444", 1.5)).join(""),
  "thumb-wall": (acc) => R(0, 0, 90, 48, "#F2EDE6", 0) + [0, 1, 2, 3].map((i) => R(4 + i * 21.5, 6, 18, 36, "#2a2a33", 2)).join(""),
  "ai-prompt-card": (acc) => R(0, 0, 90, 60, "#F3F1EA", 0) + T(45, 16, "✱ Claude", 7, "#1b1b1b", 500) + R(8, 24, 74, 22, "#fff", 4, 'stroke="#ddd" stroke-width=".5"') + lines(13, 30, 40, 1, 4, "#333") + R(70, 36, 8, 8, "#1b1b1b", 2),
  "comment-bubble": (acc) => R(14, 64, 62, 14, "#fff", 4) + O(21, 71, 4, acc) + lines(28, 68, 40, 2, 4, "#555"),
  "modo-cinema": (acc) => R(0, 0, 90, 18, "#000", 0) + R(0, 142, 90, 18, "#000", 0),
  "abertura-filme": (acc) => R(0, 0, 90, 160, "#000", 0) + T(45, 78, "TÍTULO", 8, "#fff", 400, "middle", 'letter-spacing="2" font-family="Georgia,serif"') + R(32, 84, 26, 0.8, "#fff", 0),
  "palavra-voa": (acc) => T(45, 50, "AGORA", 14, acc),
  "studio-darken": (acc) => `<rect x="0" y="0" width="90" height="160" fill="url(#vig)"/>`,
  "lista-marca": (acc) => R(10, 14, 70, 44, "rgba(20,20,24,.8)", 4) + [0, 1, 2].map((i) => O(18, 24 + i * 12, 3.5, i < 2 ? acc : "none", `stroke="${acc}" stroke-width="1"`) + R(26, 22.5 + i * 12, 40, 3, "#fff", 1.5)).join(""),
  "counter": (acc) => T(45, 50, "6.093", 18, "#fff"),
  "diagram-plane": (acc) => R(0, 0, 90, 110, "#FBFBFA", 0) + T(45, 40, "A", 12, "#1c2733") + P("M45 46 V60 M40 55 L45 61 L50 55", "#1c2733", 1) + T(45, 76, "B", 12, acc),
  "shrink-frame": (acc) => R(0, 0, 90, 160, acc, 0) + R(10, 44, 42, 76, "#5a5a66", 1) + FIG(31, 78, 0.55, "#A8A29A", 120) + R(50, 60, 32, 56, "#fff", 3) + T(45, 24, "frame.", 12, "#111", 400, "middle", 'font-style="italic" font-family="Georgia,serif"'),
  "pill-glow": (acc) => R(20, 40, 50, 10, acc, 5),
  "mosaico-vivo": (acc) => [0, 1, 2, 3].map((i) => R(3, 4 + i * 40, 17, 34, ["#BFD9EE", "#D9CDB8", "#C9D8C0", "#E3C9C9"][i], 2) + R(70, 24 + i * 40, 17, 34, ["#CFCFE6", "#BFD9EE", "#D9CDB8", "#C9D8C0"][i], 2)).join(""),
  "glass-card": (acc) => R(8, 20, 74, 30, "rgba(255,255,255,.18)", 4, 'stroke="rgba(255,255,255,.4)" stroke-width=".6"') + lines(14, 27, 50, 3, 6, "#fff"),
  "player-capitulos": (acc) => R(8, 136, 74, 2, "#ccc", 1) + R(8, 136, 30, 2, acc, 1) + [8, 33, 58].map((x) => O(x, 137, 2.5, "#fff")).join(""),
  "film-strip": (acc) => [0, 1, 2, 3].map((i) => R(2 + i * 22, 20, 20, 14, "#2b2b33", 1.5, 'stroke="#fff" stroke-width=".5"')).join(""),
};
// Caption sketches by caption id (zone at the chest)
const CAP = {
  "white-box-lines": (acc) => R(20, 118, 50, 7, "#fff", 1) + R(26, 127, 38, 7, "#fff", 1),
  "fitted-captions": (acc) => T(45, 118, "SE VOCÊ", 5, "#fff") + T(45, 132, "QUER", 14, acc) + T(45, 140, "MAIS CLIENTES", 5, "#fff"),
  "quiet-small": (acc) => R(28, 130, 34, 3, "#fff", 1.5),
  "ear-to-ear": (acc) => R(4, 92, 24, 4, "#fff", 2) + R(62, 92, 24, 4, "#fff", 2),
  "glass-caption": (acc) => R(18, 118, 54, 10, "rgba(255,255,255,.25)", 5, 'stroke="rgba(255,255,255,.5)" stroke-width=".6"'),
  "one-word-stroke": (acc) => T(45, 126, "PALAVRA", 8, "#fff", 800, "middle", 'stroke="#000" stroke-width=".8" paint-order="stroke"'),
  "one-word-outline": (acc) => T(45, 126, "PALAVRA", 8, "#fff", 800, "middle", 'stroke="#000" stroke-width="1.2" paint-order="stroke"'),
  "one-word-lower": (acc) => T(45, 126, "palavra", 11, acc, 400, "middle", 'font-style="italic" font-family="Georgia,serif"'),
  "script-lines": (acc) => T(45, 124, "if you want all", 6, "#fff", 400, "middle", 'font-family="Caveat,cursive"') + T(45, 132, "these effects", 6, acc, 400, "middle", 'font-family="Caveat,cursive"'),
  "kinetic-lower": (acc) => T(14, 60, "palavra", 5, "#fff", 600, "start") + T(60, 52, "outra", 5, "#fff", 600, "start") + T(45, 80, "sonho", 12, acc),
  "sparkle-punch": (acc) => R(30, 116, 30, 3, "#fff", 1.5) + T(45, 134, "sonho", 11, acc, 400, "middle", 'font-style="italic" font-family="Georgia,serif"') + T(26, 128, "✦", 5, acc) + T(66, 136, "✦", 4, acc),
  "chunks-punch": (acc) => R(24, 118, 42, 5, "#fff", 1.5) + T(45, 136, "PUNCH", 10, acc),
  "phrase-box": (acc) => R(14, 136, 62, 10, "#0f1a24", 1) + R(20, 140, 50, 2, "#fff", 1),
  "none": () => "",
};
// Hook sketches by hook id (top zone)
const HOOK = {
  "label-top": (acc) => T(45, 20, "CAROUSEL", 6, acc, 800, "middle", 'letter-spacing=".5"'),
  "big-caps": (acc) => T(45, 22, "LARGUEI MEU", 7, "#fff") + T(45, 31, "EMPREGO?", 7, acc),
  "serif-stack": (acc) => T(45, 20, "larguei meu emprego?", 5, "#fff", 600) + T(45, 30, "a parte que ninguém conta", 7, acc, 400, "middle", 'font-style="italic" font-family="Georgia,serif"'),
  "headline-ad": (acc) => R(0, 0, 90, 44, "rgba(0,0,0,.35)", 0) + T(45, 22, "LARGUEI MEU", 7, "#fff") + T(45, 32, "EMPREGO?", 7, acc) + R(30, 34, 30, 1, acc, 0),
  "behind-head": (acc) => T(45, 86, "NOVA ERA", 14, "#fff", 900),
  "colour-block": (acc) => rot(-2, 45, 22, R(16, 15, 58, 14, acc, 1)) + T(45, 25, "LARGUEI", 7, "#111"),
  "marker-title": (acc) => T(20, 24, "larguei", 8, "#fff", 700, "start", 'font-family="Caveat,cursive"') + P("M20 28 C 30 26, 40 30, 50 27", acc, 1),
  "camcorder": (acc) => O(10, 10, 2, "#ff3b3b") + T(16, 12, "REC", 4, "#fff", 600, "start") + P("M4 20 V4 H20 M70 4 H86 V20 M4 140 V156 H20 M70 156 H86 V140", "#fff", 1),
  "ai-prompt": (acc) => EL["ai-prompt-card"](acc),
  "none": () => "",
};

export function sketchFor(preset, acc = "#FAE67A", caption = null) {
  const picks = preset.picks || {};
  const els = (picks.elements || []).filter((id) => EL[id]).slice(0, 2);
  const hook = HOOK[picks.hook] || (picks.hook && picks.hook.startsWith("bn:") ? HOOK["label-top"] : null);
  const capId = caption || picks.captions;
  const cap = CAP[capId] || (capId && capId.startsWith("lds:") ? CAP["chunks-punch"] : capId && capId.startsWith("bn:") ? CAP["one-word-stroke"] : null);
  const full = els.some((id) => /cutout|visual-essay|dotted|shrink|abertura|explainer|glass-explainer|clone|split-top/.test(id));
  const parts = [`<defs><radialGradient id="vig" cx="50%" cy="45%" r="60%"><stop offset="55%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,.6)"/></radialGradient></defs>`, R(0, 0, 90, 160, "#E7E2DA", 0)];
  // background-type elements go under the figure; floating ones above
  const under = els.filter((id) => /cutout|visual-essay|dotted|shrink|abertura|explainer|glass-explainer|clone|split-top|depth-ui|studio-darken|modo-cinema|diagram|thumb-wall/.test(id));
  const over = els.filter((id) => !under.includes(id));
  under.forEach((id) => parts.push(EL[id](acc)));
  if (!/explainer|split-top|clone|shrink/.test(els.join(" "))) parts.push(FIG(45, 96, 1, full ? "#B8B2A9" : "#A8A29A"));
  over.forEach((id) => parts.push(EL[id](acc)));
  if (hook) parts.push(hook(acc));
  if (cap) parts.push(cap(acc));
  parts.push(`<rect x=".4" y=".4" width="89.2" height="159.2" rx="3" fill="none" stroke="rgba(0,0,0,.18)" stroke-width=".8"/>`);
  return `<svg viewBox="0 0 90 160" xmlns="http://www.w3.org/2000/svg" class="skv" aria-hidden="true">${parts.join("")}</svg>`;
}
