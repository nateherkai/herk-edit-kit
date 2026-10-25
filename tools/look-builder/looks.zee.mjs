// "Zee" effects — from the reel zeemagede_DerT49NAQC7 (18 s), analysed frame by frame:
// yellow caps section labels (CAROUSEL · ORBIT · SOON. · WAITLIST) · quote cards burst · AI prompt card typing ·
// shrink-frame takeover (yellow, video to a tall card, thumb column) · phone mockup rising with ✓ · sticker and glow
// outline on the person (matte) · phone frame behind the person · handwritten script captions with a yellow keyword ·
// small handwritten note with a red scribble circle · comment pop-up.
// Imported for its side effects: it pushes into the arrays of looks.mjs.
import { SKILLS, HOOKS, CAPTIONS, ELEMENTS, MOTIONS, PRESETS } from "./looks.mjs";

SKILLS["zee-effects"] = { name: "Efeitos Zee (reel)", cmd: "/short-form-edit", note: "Rótulos amarelos, cards de citação, prompt da IA, shrink frame, mockups e legendas manuscritas." };

const TONES = ["#d97757", "#b57c62", "#4e6a8a", "#748a52", "#8c6e5a", "#3d3f44", "#c9b27a", "#2f7d78"];
const toneBg = (i, deg = 160) => `linear-gradient(${deg}deg,${TONES[i % TONES.length]},#1b1a18)`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const byId = (arr, id) => arr.find((x) => x.id === id);
const disp = (S, size, extra = "") => `font-family:${S.font.display};font-weight:${S.font.dw};font-size:${size}px;${S.font.stretch ? `font-stretch:${S.font.stretch};` : ""}${extra}`;
const body = (S, size, extra = "") => `font-family:${S.font.body};font-weight:${S.font.bw};font-size:${size}px;${extra}`;
const hand = (S) => S.font.hand || "'Caveat',cursive";
const caseOf = (S, t) => (S.font.caps ? String(t).toUpperCase() : S.font.lower ? String(t).toLowerCase() : t);
const onAcc = (S) => (/ffd21f|f4e27c|F5D82A|ffffff|efe9dc/i.test(S.v.acc) ? "#111" : "#fff");
const firstWord = (t) => String(t || "").split(" ")[0].replace(/[?!,.]/g, "");
function chunk(ws, n) { const out = []; let cur = []; for (const w of ws) { cur.push(w); if (cur.length >= n) { out.push(cur.join(" ")); cur = []; } } if (cur.length) out.push(cur.join(" ")); return out; }
const thumbs = (n) => Array.from({ length: n }).map((_, i) => `<div class="th" style="border-radius:12px;background:${toneBg(i, 160 + i * 20)}"></div>`).join("");

// ------------------------------------------------------------ hooks
HOOKS.push(
  { id: "label-top", name: "Rótulo no topo", desc: "Uma palavra em caixa alta, amarela, centrada no topo (CAROUSEL · SOON. · WAITLIST)", skills: ["zee-effects"],
    render: (S) => `<div class="ov hook" style="left:0;top:${Math.max(S.landscape ? 60 : 200, S.headTop - 330)}px;width:${S.W}px;text-align:center;${disp(S, 64, "letter-spacing:.04em;line-height:1")};color:${S.v.acc};text-shadow:0 2px 12px rgba(0,0,0,.45)"><span class="l1">${esc(firstWord(S.text.hook1).toUpperCase())}.</span></div>`,
    anim: (tl, el) => tl.from(el, { y: -18, opacity: 0, duration: 0.35, ease: "power3.out" }) },
  { id: "ai-prompt", name: "Prompt da IA", desc: "Card creme com logo e um pedido sendo digitado, descendo do topo com véu", skills: ["zee-effects", "anuncios-oney", "vsl"],
    render: (S) => aiPrompt(S, "hook"),
    anim: (tl, el) => aiPromptAnim(tl, el) },
);
function aiPrompt(S, cls) {
  return `<div class="ov ${cls}" style="left:0;top:0;width:${S.W}px;height:${Math.min(S.H, S.headTop + 140)}px;background:linear-gradient(180deg,#f3f1ea 0 62%,rgba(243,241,234,0) 100%)">
    <div style="position:absolute;left:0;width:${S.W}px;top:${S.landscape ? 60 : 170}px;text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:72px;color:#1b1b1b"><span style="color:#d97757;font-size:60px;vertical-align:middle">✱</span> Claude</div>
    <div style="position:absolute;left:60px;right:60px;top:${S.landscape ? 150 : 300}px;background:#fff;border-radius:34px;box-shadow:0 20px 60px rgba(0,0,0,.12);padding:40px 48px 36px;color:#222">
      <div class="typed" data-text="${esc(S.text.prompt || "Edit my talking head video")}" style="${body(S, 44, "font-weight:700")};min-height:56px">|</div>
      <div style="display:flex;justify-content:space-between;margin-top:26px"><span style="display:flex;gap:14px"><i style="width:68px;height:68px;border:1.5px solid #ddd;border-radius:18px;display:grid;place-items:center;font-style:normal;font-size:34px">+</i><i style="width:68px;height:68px;border:1.5px solid #ddd;border-radius:18px;display:grid;place-items:center;font-style:normal;font-size:30px">⚌</i></span><i style="width:72px;height:72px;background:#1b1b1b;border-radius:20px;color:#fff;display:grid;place-items:center;font-style:normal;font-size:34px">↑</i></div>
    </div></div>`;
}
function aiPromptAnim(tl, el) {
  tl.from(el, { y: -120, opacity: 0, duration: 0.5, ease: "power3.out" });
  const t = el.querySelector(".typed");
  if (t) { const full = t.dataset.text; const o = { n: 0 }; tl.to(o, { n: full.length, duration: Math.min(1.8, full.length * 0.06), ease: "none", onUpdate: () => (t.textContent = full.slice(0, Math.round(o.n)) + "|") }, "-=0.1"); }
}

// ------------------------------------------------------------ captions
CAPTIONS.push(
  { id: "script-lines", name: "Manuscrita em linhas", desc: "Frases de 4–6 palavras em fonte manuscrita, brancas, centradas no peito; a palavra-chave em amarelo", skills: ["zee-effects"], mode: "phrase",
    render: (S) => { const ch = chunk(S.text.words, 5); const k = String(S.text.keyword).toLowerCase(); return `<div class="ov caps" style="left:${S.W * 0.08}px;top:${S.capTop - 40}px;width:${S.W * 0.84}px;text-align:center">${ch.map((c, i) => `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;top:0;opacity:0;font-family:${hand(S)};font-weight:700;font-size:64px;line-height:1.15;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.55)">${c.split(" ").map((w) => (w.toLowerCase() === k ? `<b style="color:${S.v.acc};font-weight:700">${esc(w)}</b>` : esc(w))).join(" ")}</span>`).join("")}</div>`; } },
);

// ------------------------------------------------------------ elements (some carry their own anim; shrink-frame also moves the camera)
ELEMENTS.push(
  { id: "quote-cards", name: "Cards de citação", desc: "Cards brancos inclinados em volta da cabeça, frases curtas em negrito com marca-texto e ✦", skills: ["zee-effects"],
    render: (S) => {
      const q = S.text.quotes || ["Ação cria clareza.", "Feito vence perfeito.", "Ninguém sabe o que faz.", "Começar do zero, sempre.", "Constância vence talento."];
      const pos = S.landscape ? [[60, 60, -5], [520, 40, 3], [1320, 70, -3], [60, 560, 4], [1380, 520, -4]] : [[40, S.headTop - 560, -5], [520, S.headTop - 470, 3], [20, S.headTop - 300, 2], [500, S.headTop - 240, -3], [60, S.headTop + 60, 4]];
      return `<div class="ov el" style="left:0;top:0;width:${S.W}px;height:${S.H}px">${q.slice(0, 5).map((t, i) => { const [x, y, r] = pos[i]; const ws = t.split(" "); const hi = Math.floor(ws.length / 2); return `<div class="qc" style="position:absolute;left:${x}px;top:${y}px;width:${S.landscape ? 480 : 520}px;background:#fff;border-radius:18px;padding:30px 34px;transform:rotate(${r}deg);box-shadow:0 20px 50px rgba(0,0,0,.35);color:#111;${body(S, 44, "font-weight:800;line-height:1.1;letter-spacing:-.02em")}">${ws.map((w, j) => (j === hi ? `<span style="background:${S.v.acc}55;box-shadow:inset 0 -14px 0 ${S.v.acc}99;padding:0 6px">${esc(w)}</span>` : esc(w))).join(" ")}<span style="color:${S.v.acc};font-size:34px;margin-left:8px">✦</span></div>`; }).join("")}</div>`;
    },
    anim: (tl, el) => tl.from(el.querySelectorAll(".qc"), { scale: 0.6, opacity: 0, y: 40, duration: 0.5, stagger: 0.12, ease: "back.out(1.5)" }) },
  { id: "note-circle", name: "Nota com círculo rabiscado", desc: "Nota manuscrita pequena no canto com um círculo vermelho desenhado à mão (duas voltas)", skills: ["zee-effects", "reel-editorial-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 110 : 70}px;top:${S.headTop - 300}px;width:380px;text-align:center;font-family:${hand(S)};font-weight:700;font-size:46px;line-height:1.1;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.5);padding:18px 10px">${esc(S.text.note)}<svg viewBox="0 0 400 180" style="position:absolute;left:-20px;top:-16px;width:420px;height:200px;overflow:visible" fill="none" stroke="${S.v.bad}" stroke-width="5" stroke-linecap="round"><path d="M200 18 C 330 10, 395 60, 388 92 C 380 135, 300 170, 190 166 C 80 162, 8 128, 12 90 C 16 48, 110 14, 210 22 C 330 30, 392 70, 384 100 C 374 142, 280 176, 180 170 C 90 164, 20 128, 24 92"/></svg></div>`,
    anim: (tl, el) => { tl.from(el, { opacity: 0, duration: 0.25 }); el.querySelectorAll("path").forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, "-=0.1"); }); } },
  { id: "thumb-column", name: "Coluna de thumbnails", desc: "Card branco com grade de 3 colunas de frames dos seus vídeos, deslizando ao lado do apresentador", skills: ["zee-effects", "reel-editorial-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1300 : 580}px;top:${S.landscape ? 120 : 640}px;width:${S.landscape ? 520 : 420}px;height:${S.landscape ? 840 : 760}px;background:#fff;border-radius:26px;padding:16px;box-sizing:border-box;box-shadow:0 30px 70px rgba(0,0,0,.35);display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:12px">${thumbs(12)}</div>`,
    anim: (tl, el) => tl.from(el, { x: 260, opacity: 0, duration: 0.6, ease: "power3.out" }).from(el.querySelectorAll(".th"), { opacity: 0, duration: 0.2, stagger: 0.03 }, "-=0.4") },
  { id: "shrink-frame", name: "Shrink frame", desc: "Takeover na cor de acento: o vídeo encolhe para um card alto à esquerda, rótulo bold + serif itálico no topo, coluna de thumbs à direita", skills: ["zee-effects", "kallaway"], camera: true,
    render: (S) => {
      const hx1 = S.landscape ? 160 : 105, hx2 = S.landscape ? 900 : 660, hy1 = S.landscape ? 250 : 525, hy2 = S.landscape ? 1000 : 1530;
      return `<div class="ov el" style="left:0;top:0;width:${S.W}px;height:${S.H}px"><div class="bgp" style="position:absolute;inset:0;background:${S.v.acc};clip-path:polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,${hx1}px ${hy1}px,${hx1}px ${hy2}px,${hx2}px ${hy2}px,${hx2}px ${hy1}px,${hx1}px ${hy1}px)"></div>
        <div class="lbl" style="position:absolute;left:0;width:${S.W}px;top:${S.landscape ? 40 : 150}px;text-align:center;color:${onAcc(S)}"><span style="display:block;${body(S, 60, "font-weight:800;letter-spacing:-.02em")}">${esc(firstWord(S.text.hook1).toLowerCase())}</span><span style="display:block;font-family:${S.font.serif || "Georgia,serif"};font-style:italic;font-size:150px;line-height:1;margin-top:-10px">${esc((String(S.text.hook2).split(" ").pop() || "frame").toLowerCase())}.</span></div>
        <div class="col" style="position:absolute;left:${S.landscape ? 1000 : 580}px;top:${S.landscape ? 300 : 640}px;width:${S.landscape ? 460 : 420}px;height:${S.landscape ? 620 : 760}px;background:#fff;border-radius:26px;padding:16px;box-sizing:border-box;box-shadow:0 30px 70px rgba(0,0,0,.3);display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${thumbs(12)}</div></div>`;
    },
    anim: (tl, el, cam) => {
      tl.from(el.querySelector(".bgp"), { opacity: 0, duration: 0.3 });
      if (cam) tl.to(cam, { scale: 0.514, x: "-14.6%", y: "3.5%", duration: 0.6, ease: "power3.inOut" }, 0);
      tl.from(el.querySelector(".lbl"), { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" }, 0.3).from(el.querySelector(".col"), { x: 300, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.5);
      if (cam) tl.to(cam, { scale: 1, x: 0, y: 0, duration: 0.5, ease: "power3.inOut" }, 2.3);
    } },
  { id: "phone-rise", name: "Celular subindo + ✓", desc: "Mockup de celular sobe inclinado ao lado da cabeça e recebe um ✓ amarelo; rótulo caps ao lado", skills: ["zee-effects", "anuncios-oney"],
    render: (S) => `<div class="ov el" style="left:${S.landscape ? 1250 : 560}px;top:${S.headTop - 560}px;width:480px;height:560px"><div class="ph" style="position:absolute;left:0;top:60px;width:150px;height:300px;border-radius:30px;background:#111;border:6px solid #2b2b2f;transform:rotate(-12deg);box-shadow:0 24px 60px rgba(0,0,0,.45)"><i class="ck" style="position:absolute;left:38px;top:110px;width:62px;height:62px;border-radius:50%;background:${S.v.acc};color:#111;display:grid;place-items:center;font-style:normal;font-weight:900;font-size:40px">✓</i></div><div class="lb" style="position:absolute;left:190px;top:70px;${disp(S, 52, "line-height:1;letter-spacing:.02em")};color:${S.v.acc};text-shadow:0 2px 10px rgba(0,0,0,.5)">${esc(caseOf(S, String(S.text.hook1).split(" ").slice(0, 2).join(" ")))}</div></div>`,
    anim: (tl, el) => tl.from(el.querySelector(".ph"), { y: 260, opacity: 0, rotation: 20, duration: 0.6, ease: "power3.out" }).from(el.querySelector(".ck"), { scale: 0, duration: 0.35, ease: "back.out(2)" }, "-=0.1").from(el.querySelector(".lb"), { x: -20, opacity: 0, duration: 0.3 }, "-=0.3") },
  { id: "phone-frame", name: "Celular atrás da pessoa", desc: "Painel creme com um iPhone grande e a tela de um app atrás do apresentador (precisa matte para a pessoa ficar na frente)", skills: ["zee-effects", "vsl"],
    render: (S) => `<div class="ov el back" style="left:${S.landscape ? 480 : 40}px;top:40px;width:${S.landscape ? 960 : S.W - 80}px;height:${Math.min(S.H - 80, S.headTop + 420)}px;background:#f3f1ea;border-radius:40px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4)"><div style="position:absolute;left:50%;top:60px;transform:translateX(-50%);width:${S.landscape ? 330 : 560}px;height:${S.landscape ? 640 : 1120}px;border-radius:70px;background:#f6f5ef;border:14px solid #1b1b1f;box-shadow:inset 0 0 0 3px #333"><div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:36%;height:34px;background:#1b1b1f;border-radius:0 0 22px 22px"></div><div style="position:absolute;left:0;width:100%;top:${S.landscape ? 110 : 190}px;text-align:center;font-family:Georgia,serif;font-size:${S.landscape ? 38 : 60}px;color:#1b1b1b"><span style="color:#d97757">✱</span> Claude</div><div style="position:absolute;left:14%;width:72%;top:${S.landscape ? 200 : 340}px;height:${S.landscape ? 200 : 300}px;background:#d97757;transform:rotate(-2deg);border-radius:6px"></div></div><small style="position:absolute;right:28px;bottom:18px;${body(S, 22)};color:#888">atrás da pessoa · matte</small></div>`,
    anim: (tl, el) => tl.from(el, { y: 60, opacity: 0, duration: 0.55, ease: "power3.out" }) },
  { id: "person-glow", name: "Contorno brilhante na pessoa", desc: "Brilho amarelo seguindo a silhueta do apresentador (precisa matte; o preview mostra um brilho aproximado)", skills: ["zee-effects", "video-colagem-oney"],
    render: (S) => `<div class="ov el" style="left:0;top:0;width:${S.W}px;height:${S.H}px;pointer-events:none"><div class="gl back" style="position:absolute;left:${S.W / 2 - (S.landscape ? 260 : 330)}px;top:${S.headTop - 60}px;width:${S.landscape ? 520 : 660}px;height:${S.landscape ? 700 : 1100}px;border-radius:50% 50% 30% 30% / 30% 30% 20% 20%;box-shadow:0 0 0 10px ${S.v.acc},0 0 60px 30px ${S.v.acc}aa;opacity:.75;mix-blend-mode:screen;filter:blur(6px)"></div><small class="mnote" style="position:absolute;left:0;width:${S.W}px;top:${S.H - (S.landscape ? 100 : 420)}px;text-align:center;${body(S, 24)};color:#fff;opacity:.6">contorno na silhueta · matte</small></div>`,
    anim: (tl, el) => tl.from(el.querySelector(".gl"), { opacity: 0, scale: 1.1, duration: 0.4 }).to(el.querySelector(".gl"), { opacity: 0.5, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" }) },
  { id: "person-sticker", name: "Sticker da pessoa", desc: "Flash branco e o apresentador vira recorte com contorno branco sobre fundo escuro (precisa matte)", skills: ["zee-effects", "video-colagem-oney"],
    render: (S) => `<div class="ov el" style="left:0;top:0;width:${S.W}px;height:${S.H}px"><div class="fl" style="position:absolute;inset:0;background:#fff"></div><div class="dk" style="position:absolute;inset:0;background:radial-gradient(60% 50% at 50% 45%,rgba(0,0,0,0) 40%,rgba(0,0,0,.85) 100%)"></div><div class="ol" style="position:absolute;left:${S.W / 2 - (S.landscape ? 250 : 320)}px;top:${S.headTop - 40}px;width:${S.landscape ? 500 : 640}px;height:${S.landscape ? 680 : 1080}px;border-radius:50% 50% 24% 24% / 28% 28% 16% 16%;box-shadow:0 0 0 12px #fff;opacity:.9"></div><small class="mnote" style="position:absolute;left:0;width:${S.W}px;top:${S.H - (S.landscape ? 100 : 420)}px;text-align:center;${body(S, 24)};color:#fff;opacity:.6">recorte com contorno · matte</small></div>`,
    anim: (tl, el) => tl.fromTo(el.querySelector(".fl"), { opacity: 1 }, { opacity: 0, duration: 0.35, ease: "power2.out" }).from(el.querySelector(".dk"), { opacity: 0, duration: 0.3 }, 0.1).from(el.querySelector(".ol"), { opacity: 0, scale: 1.05, duration: 0.3 }, 0.2) },
  { id: "ai-prompt-card", name: "Card do prompt da IA", desc: "O mesmo card do gancho \"Prompt da IA\", como elemento no meio do vídeo", skills: ["zee-effects", "anuncios-oney", "vsl"],
    render: (S) => aiPrompt(S, "el"), anim: (tl, el) => aiPromptAnim(tl, el) },
);

// ------------------------------------------------------------ motions
MOTIONS.push(
  { id: "label-swap", name: "Troca de rótulo", desc: "Palavras em caixa alta no topo trocam a cada efeito (CAROUSEL → ORBIT → …)", skills: ["zee-effects"],
    anim: (tl, el) => tl.from(el, { y: -16, opacity: 0, duration: 0.3, ease: "power3.out" }).to(el, { opacity: 0, y: 10, duration: 0.2 }, "+=1.2").to(el, { opacity: 1, y: 0, duration: 0.25 }, "+=0.1") },
  { id: "scribble", name: "Rabisco à mão", desc: "Círculo ou sublinhado desenhado em duas voltas, 0,8 s", skills: ["zee-effects", "vox-explainer"],
    anim: (tl, el) => { const ps = el.querySelectorAll("path"); if (!ps.length) return tl.from(el, { opacity: 0, duration: 0.3 }); ps.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, "<0.05"); }); } },
);

// ------------------------------------------------------------ preset
PRESETS.push({ id: "zee", name: "Efeitos Zee", desc: "O reel analisado: rótulos amarelos, cards de citação, prompt da IA, shrink frame, celular, legendas manuscritas.", skill: "zee-effects",
  picks: { colours: "sunlit", fonts: "playfair-inter", hook: "label-top", captions: "script-lines", elements: ["quote-cards", "ai-prompt-card", "shrink-frame", "phone-rise", "note-circle", "comment-bubble"], motion: ["carousel", "orbit", "pop", "label-swap", "scribble"] } });
