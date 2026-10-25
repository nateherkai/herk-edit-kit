// The three looks of the Ten Fold /video-edit skill (guides.tenfoldmarketing.com/video-edit), rebuilt from the
// public description as presets of kit options plus two caption variants and two palettes:
//   Bold      — kinetic lowercase words around you, the big ones tucked behind the head, punch word in yellow.
//   Cool girl — warm grade, calm lowercase text, one punch line in yellow serif italic with sparkles; your reels orbit you.
//   Cool dude — dark editorial studio: room falls back, you stay lit; tiny spaced caps + big serif; wide/tight alternate.
import { SKILLS, CAPTIONS, ELEMENTS, PRESETS, COLOURS } from "./looks.mjs";

SKILLS["tenfold"] = { name: "Ten Fold /video-edit (nossa versão)", cmd: "/look-builder", note: "Bold, Cool girl e Cool dude: três looks que trocam por seção quando você diz o nome no roteiro." };

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const body = (S, size, extra = "") => `font-family:${S.font.body};font-weight:${S.font.bw};font-size:${size}px;${extra}`;
const serif = (S) => S.font.serif || "'EdSerif','Instrument Serif',Georgia,serif";
const kw = (S) => String(S.text.keyword || "agora");
const words = (S) => S.text.words || [];
function chunk(ws, n) { const out = []; let cur = []; for (const w of ws) { cur.push(w); if (cur.length >= n) { out.push(cur.join(" ")); cur = []; } } if (cur.length) out.push(cur.join(" ")); return out; }

COLOURS.push(
  { id: "cool-girl", name: "Cool girl (quente)", sub: "Sépia quente, creme, manteiga serifada", skills: ["tenfold"], vars: { bg: "#2a1f17", acc: "#F7DD62", txt: "#F4E9D2", sec: "#C98B4E", bad: "#ff453a", paper: "#F4E9D2", ink: "#2a1f17" } },
  { id: "cool-dude", name: "Cool dude (teal editorial)", sub: "Estúdio escuro, teal, vinheta", skills: ["tenfold"], vars: { bg: "#0b1a1c", acc: "#CFE8F5", txt: "#ffffff", sec: "#5fb3b3", bad: "#ff453a", paper: "#0e2224", ink: "#ffffff" } },
);

CAPTIONS.push(
  { id: "kinetic-lower", name: "Palavras cinéticas minúsculas", desc: "Palavras minúsculas espalhadas em volta de você, a palavra-chave grande em amarelo (as maiores ficam atrás da cabeça com matte)", skills: ["tenfold"], mode: "phrase",
    render: (S) => { const k = kw(S).toLowerCase(); const ch = chunk(words(S), 4); const spots = [[80, -520], [S.W - 460, -470], [120, -300], [S.W - 420, -250]]; return `<div class="ov caps" style="left:0;top:${S.headTop}px;width:${S.W}px">${ch.map((c, i) => `<span class="w" data-i="${i}" style="position:absolute;left:0;top:0;width:${S.W}px;opacity:0">${c.split(" ").map((w, j) => { const em = w.toLowerCase() === k; const [x, y] = spots[j % spots.length]; return `<span class="kw${em ? " back" : ""}" style="position:absolute;left:${em ? S.W / 2 - 300 : x}px;top:${em ? -120 : y}px;${em ? `width:600px;text-align:center;${body(S, 150, "font-weight:900;letter-spacing:-.04em;line-height:1")};color:${S.v.acc}` : `${body(S, 54, "font-weight:600;letter-spacing:-.02em")};color:#fff`};text-shadow:0 2px 14px rgba(0,0,0,.6)">${esc(w.toLowerCase())}</span>`; }).join("")}</span>`).join("")}</div>`; },
    capAnim: (tl, root, start, dt) => [...root.querySelectorAll(".w")].forEach((x, i) => tl.from(x.querySelectorAll(".kw"), { scale: 0.7, opacity: 0, duration: 0.3, stagger: 0.14, ease: "back.out(1.6)" }, start + i * dt)) },
  { id: "sparkle-punch", name: "Linha calma + punch serifado com brilhos", desc: "Texto minúsculo calmo e uma linha de impacto em serif itálico amarelo-manteiga com ✦ brilhando em volta", skills: ["tenfold", "reel-editorial-oney"], mode: "phrase",
    render: (S) => { const ch = chunk(words(S), 5); return `<div class="ov caps" style="left:0;top:${S.capTop - 60}px;width:${S.W}px;text-align:center">${ch.map((c, i) => { const ws = c.split(" "); const n = Math.max(1, ws.length - 2); return `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;top:0;opacity:0;color:${S.v.txt}"><span style="display:block;${body(S, 44, "font-weight:500")}">${esc(ws.slice(0, n).join(" ").toLowerCase())}</span><span class="punch" style="display:inline-block;position:relative;font-family:${serif(S)};font-style:italic;font-size:118px;line-height:1;color:${S.v.acc};text-shadow:0 4px 20px rgba(0,0,0,.45)">${esc(ws.slice(n).join(" ").toLowerCase())}<i class="sp" style="position:absolute;left:-60px;top:-10px;font-style:normal;font-size:44px">✦</i><i class="sp" style="position:absolute;right:-70px;bottom:0;font-style:normal;font-size:34px">✦</i><i class="sp" style="position:absolute;right:-40px;top:-40px;font-style:normal;font-size:24px">✦</i></span></span>`; }).join("")}</div>`; },
    capAnim: (tl, root, start, dt) => [...root.querySelectorAll(".w")].forEach((x, i) => { tl.from(x.querySelector(".punch"), { opacity: 0, y: 14, filter: "blur(10px)", duration: 0.4 }, start + i * dt + 0.2); tl.fromTo(x.querySelectorAll(".sp"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.1, ease: "back.out(2)" }, start + i * dt + 0.45).to(x.querySelectorAll(".sp"), { opacity: 0.3, duration: 0.3, yoyo: true, repeat: 1, stagger: 0.05 }, start + i * dt + 0.8); }) },
);

ELEMENTS.push(
  { id: "studio-darken", name: "Estúdio escuro, você iluminado", desc: "A sala cai no escuro com vinheta teal e você fica aceso (matte para separar bem; o preview usa vinheta)", skills: ["tenfold"],
    render: (S) => `<div class="ov el" style="left:0;top:0;width:${S.W}px;height:${S.H}px;background:radial-gradient(${S.landscape ? "32% 60%" : "55% 42%"} at 50% ${S.landscape ? 50 : 44}%,rgba(0,0,0,0) 40%,rgba(8,24,28,.78) 100%);mix-blend-mode:multiply"></div>`,
    anim: (tl, el) => tl.from(el, { opacity: 0, duration: 0.8 }) },
);

const T = (id, name, desc, picks) => PRESETS.push({ id, name, desc, skill: "tenfold", picks });
T("tf-bold", "Ten Fold · Bold", "Palavras minúsculas cinéticas em volta, as grandes atrás da cabeça, punch em amarelo. Se não sabe por onde começar, comece aqui.", { colours: "sunlit", fonts: "jakarta-inter", hook: "behind-head", captions: "kinetic-lower", elements: ["ai-prompt-card", "comment-bubble"], motion: ["punch-in", "pop"] });
T("tf-cool-girl", "Ten Fold · Cool girl", "Grade quente, texto minúsculo calmo, uma linha de impacto em serif itálico amarelo com brilhos; seus reels orbitam você.", { colours: "cool-girl", fonts: "inter-serif", hook: "serif-stack", captions: "sparkle-punch", elements: ["satelites", "print-card"], motion: ["blur-rise", "orbit"] });
T("tf-cool-dude", "Ten Fold · Cool dude", "Estúdio escuro editorial: a sala recua, você fica aceso; caps minúsculas espaçadas + serif grande; aberto e fechado alternando.", { colours: "cool-dude", fonts: "inter-serif", hook: "none", captions: "bn:C7", elements: ["studio-darken", "quote-cards"], motion: ["punch-in", "dry-cut"] });
