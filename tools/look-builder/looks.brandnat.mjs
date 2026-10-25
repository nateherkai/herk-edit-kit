// Brand Nat Style Pack → Look builder options. The pack's styles.js is read by the server as data (105 codes in
// ten groups: H hook, C captions, L layout, P proof, V visual beats, B animated b-roll, X signature effects,
// M motion, S sound, G colour/finish). Here each code becomes an option:
//   • hooks (H) and captions (C) get their own renderers (they are typographic, cheap to approximate);
//   • L/P/V/B/X become elements: mapped to an existing kit renderer when one matches, otherwise a "placement card"
//     that shows where the thing goes, with the code and the pack's one-line description;
//   • M become motions mapped to ours; S and G are "finish" picks chosen in the review step.
// Picking codes writes `brandNat.codes` into look.json and a "Edit … with H10 C9 …" line into the prompt, so the
// user's brand-nat-styles skill can run exactly those codes.
import { SKILLS, HOOKS, CAPTIONS, ELEMENTS, MOTIONS } from "./looks.mjs";

SKILLS["brand-nat"] = { name: "Brand Nat Style Pack", cmd: "/brand-nat-styles", note: "Códigos H/C/L/P/V/B/X/M/S/G do pacote. O prompt sai como \"Edit … with H10 C9 L4 …\"." };

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const byId = (arr, id) => arr.find((x) => x.id === id);
const disp = (S, size, extra = "") => `font-family:${S.font.display};font-weight:${S.font.dw};font-size:${size}px;${S.font.stretch ? `font-stretch:${S.font.stretch};` : ""}${extra}`;
const body = (S, size, extra = "") => `font-family:${S.font.body};font-weight:${S.font.bw};font-size:${size}px;${extra}`;
const serif = (S) => S.font.serif || "'EdSerif','Instrument Serif',Georgia,serif";
const hand = (S) => S.font.hand || "'Caveat',cursive";
const ab = (S, n) => Math.max(S.landscape ? 70 : 220, S.headTop - n);
const kw = (S) => String(S.text.keyword || "agora");
const words = (S) => S.text.words || [];
function chunk(ws, n) { const out = []; let cur = []; for (const w of ws) { cur.push(w); if (cur.length >= n) { out.push(cur.join(" ")); cur = []; } } if (cur.length) out.push(cur.join(" ")); return out; }
const capWord = (S, html, i, style) => `<span class="w" data-i="${i}" style="position:absolute;left:0;top:0;width:${S.W}px;text-align:center;opacity:0;${style}">${html}</span>`;

// ---------------------------------------------------------------- the ten hooks
const HOOK_RENDER = {
  H1: (S) => `<div class="ov hook" style="left:0;top:${ab(S, 330)}px;width:${S.W}px;text-align:center"><span class="l1" style="display:block;font-family:${serif(S)};font-style:italic;font-size:48px;color:#fff">${esc(S.text.hook2)}</span><span class="l2" style="display:block;${disp(S, 150, "line-height:.95")};color:#FAE67A;-webkit-text-stroke:10px #3b2416;paint-order:stroke fill">${esc(String(S.text.hook1).toUpperCase())}</span><small style="display:block;${body(S, 22)};color:#fff;opacity:.6;margin-top:10px">atrás da cabeça · matte</small></div>`,
  H2: (S) => `<div class="ov hook" style="left:0;top:${ab(S, 330)}px;width:${S.W}px;text-align:center">${[S.text.hook1, S.text.hook2].map((t, i) => `<span class="l${i + 1}" style="display:inline-block;background:#fff;border:6px solid #111;border-radius:999px;padding:14px 34px;margin:6px;${disp(S, 56, "line-height:1")};color:${i ? "#d62976" : "#1f6feb"}"><i style="display:inline-block;width:46px;height:46px;border-radius:12px;background:${i ? "#d62976" : "#1f6feb"};vertical-align:middle;margin-right:14px"></i>${esc(t)}</span>`).join("<br>")}</div>`,
  H3: (S) => `<div class="ov hook" style="left:0;top:${ab(S, 360)}px;width:${S.W}px;text-align:center"><span class="l1" style="display:block;${disp(S, 118, "line-height:1")};color:#F4E9D2;-webkit-text-stroke:8px #3b2416;paint-order:stroke fill">${esc(String(S.text.hook1).toUpperCase())}</span><span class="l2" style="display:block;${body(S, 44, "font-weight:700")};color:#C98B4E;margin-top:8px">${esc(S.text.hook2)} ✨ ☕</span></div>`,
  H4: (S) => `<div class="ov hook" style="left:0;top:${ab(S, 320)}px;width:${S.W}px;text-align:center"><span class="l1" style="display:block;font-family:${serif(S)};font-style:italic;font-size:64px;color:#fff">${esc(String(S.text.hook2).toLowerCase())}</span><span class="l2" style="display:block;${body(S, 132, "font-weight:800;letter-spacing:-.03em;line-height:1")};color:#fff">${esc(String(S.text.hook1).toLowerCase().replace(/[?!]/g, ""))}</span></div>`,
  H5: (S) => `<div class="ov hook" style="left:0;top:${ab(S, 300)}px;width:${S.W}px;text-align:center"><span class="l1" style="display:inline-block;background:${S.v.acc};color:#111;padding:26px 44px;${disp(S, 84, "line-height:1.05")};max-width:${S.W - 160}px">${esc(S.text.hook1)}</span></div>`,
  H6: (S) => `<div class="ov hook" style="left:60px;top:${ab(S, 260)}px;${body(S, 30, "font-weight:600")};color:#fff;background:rgba(0,0,0,.55);padding:10px 18px;border-radius:999px;display:inline-block">📍 ${esc(S.text.hook2)} · gancho filmado no lugar do resultado</div>`,
  H7: (S) => `<div class="ov hook" style="left:0;top:${Math.max(S.landscape ? 60 : 230, ab(S, 420))}px;width:${S.W}px;text-align:center"><span class="l1" style="display:block;${body(S, 60, "font-weight:800;line-height:1.05")};color:#fff;text-shadow:0 2px 14px #000;padding:0 80px">${esc(S.text.hook1)}</span><div class="l2" style="display:flex;justify-content:center;gap:22px;margin-top:22px">${["#1f6feb", "#d97757", "#30d158", "#8b5cf6"].map((c) => `<i style="width:110px;height:110px;border-radius:28px;background:${c};box-shadow:0 10px 30px rgba(0,0,0,.4)"></i>`).join("")}</div></div>`,
  H8: (S) => `<div class="ov hook" style="left:0;top:0;width:${S.W}px;height:${Math.min(S.H, S.headTop + 60)}px;background:#F7DD62"><div style="position:absolute;left:0;width:${S.W}px;top:${S.landscape ? 40 : 160}px;text-align:center;color:#111"><span class="l1" style="display:block;font-family:${hand(S)};font-size:40px;letter-spacing:.12em;text-transform:uppercase">${esc(S.text.hook2)}</span><span class="l2" style="display:block;${body(S, 112, "font-weight:800;letter-spacing:-.03em;line-height:1")}">${esc(String(S.text.hook1).toLowerCase().replace(/[?!]/g, ""))}.</span></div><small style="position:absolute;right:30px;bottom:14px;${body(S, 22)};color:#6b5a10">seu clipe vira um card abaixo</small></div>`,
  H9: (S) => `<div class="ov hook" style="left:0;top:${ab(S, 380)}px;width:${S.W}px;display:flex;justify-content:center;gap:60px;align-items:center"><span class="l1" style="position:relative;display:inline-block;width:200px;height:200px;border-radius:48px;background:#6c6c70;box-shadow:0 14px 40px rgba(0,0,0,.4)"><svg viewBox="0 0 100 100" style="position:absolute;inset:-12px;width:224px;height:224px;overflow:visible" fill="none" stroke="#E5484D" stroke-width="10" stroke-linecap="round"><path d="M12 12 L88 88"/><path d="M88 12 L12 88"/></svg></span><span style="${disp(S, 60)};color:#fff">→</span><span class="l2" style="display:inline-block;width:200px;height:200px;border-radius:48px;background:#d97757;box-shadow:0 14px 40px rgba(0,0,0,.4)"></span></div>`,
  H10: (S) => `<div class="ov hook" style="left:0;top:${Math.max(S.landscape ? 60 : 230, ab(S, 420))}px;width:${S.W}px;text-align:center;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.5)"><span class="l1" style="display:block;${body(S, 96, "font-weight:900;letter-spacing:-.02em;line-height:1")}">${esc(String(S.text.hook1).toUpperCase())}</span><span class="l2" style="display:block;font-family:${serif(S)};font-weight:300;font-size:92px;letter-spacing:.06em;line-height:1.05;font-stretch:condensed">${esc(String(S.text.hook2).toUpperCase())}</span></div>`,
};
const hookAnim = (code) => (tl, el) => {
  const parts = el.querySelectorAll(".l1,.l2"); const target = parts.length ? parts : el;
  if (code === "H9") { tl.from(parts, { scale: 0.6, opacity: 0, duration: 0.4, stagger: 0.15, ease: "back.out(1.6)" }); const ps = el.querySelectorAll("path"); ps.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.25 }, ">-0.1"); }); return; }
  if (code === "H7") { tl.from(el.querySelector(".l1"), { y: 20, opacity: 0, duration: 0.4 }).from(el.querySelectorAll(".l2 i"), { scale: 0, duration: 0.4, stagger: 0.06, ease: "back.out(2)" }, 0.5); return; }
  if (code === "H8") { tl.from(el, { yPercent: -100, duration: 0.5, ease: "power3.out" }).from(parts, { y: 16, opacity: 0, duration: 0.4, stagger: 0.15 }, "-=0.2"); return; }
  tl.from(target, { y: 24, opacity: 0, duration: 0.45, stagger: 0.12, ease: "power3.out" });
  if (code === "H10") tl.to(el, { y: -60, opacity: 0, duration: 0.5, ease: "power3.in" }, 3.0);
  if (code === "H5") tl.to(el, { opacity: 0, duration: 0.3 }, 3.0);
};

// ---------------------------------------------------------------- the nine caption styles
const CAP = {
  C1: { mode: "phrase", render: (S) => { const k = kw(S).toLowerCase(); return `<div class="ov caps" style="left:${S.W * 0.08}px;top:${S.capTop - 40}px;width:${S.W * 0.84}px;text-align:center">${chunk(words(S), 5).map((c, i) => `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;top:0;opacity:0;font-family:${hand(S)};font-weight:700;font-size:62px;line-height:1.15;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.55)">${c.split(" ").map((w) => (w.toLowerCase() === k ? `<b style="color:#FAE67A;text-shadow:0 0 18px #FAE67A99">${esc(w)}</b>` : esc(w))).join(" ")}</span>`).join("")}</div>`; } },
  C2: { mode: "word", render: (S) => `<div class="ov caps" style="left:0;top:${S.capTop - 20}px;width:${S.W}px;height:120px">${words(S).map((w, i) => capWord(S, esc(w.toUpperCase()), i, `${body(S, 96, "font-weight:900;line-height:120px")};color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.55)`)).join("")}</div>` },
  C3: { mode: "none", render: () => "" },
  C4: { mode: "word", render: (S) => { const k = kw(S).toLowerCase(); return `<div class="ov caps" style="left:0;top:${S.capTop - 30}px;width:${S.W}px;height:130px">${words(S).map((w, i) => { const em = w.toLowerCase() === k; return capWord(S, esc(em ? w.toUpperCase() : w.toLowerCase()), i, em ? `${body(S, 120, "font-weight:900;line-height:130px")};color:${S.v.acc};text-shadow:0 4px 20px rgba(0,0,0,.5)` : `${body(S, 54, "font-weight:600;line-height:130px")};color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6)`); }).join("")}</div>`; } },
  C5: { mode: "phrase", render: (S) => { const k = kw(S).toLowerCase(); return `<div class="ov caps" style="left:${S.W * 0.08}px;top:${S.capTop - 30}px;width:${S.W * 0.84}px;text-align:center">${chunk(words(S), 4).map((c, i) => `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;top:0;opacity:0;${body(S, 58, "font-weight:700;line-height:1.3")};color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6)">${c.split(" ").map((w) => (w.toLowerCase() === k ? `<b style="background:#fff;color:#111;border-radius:999px;padding:2px 22px;text-shadow:none">${esc(w)}</b>` : esc(w))).join(" ")}</span>`).join("")}</div>`; } },
  C6: { mode: "phrase", render: (S) => { const ch = chunk(words(S), 4); return `<div class="ov caps" style="left:0;top:${S.capTop - 60}px;width:${S.W}px;text-align:center">${ch.map((c, i) => { const ws = c.split(" "); const cut = Math.max(1, ws.length - 2); return `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;top:0;opacity:0;color:#fff"><span style="display:block;${body(S, 44, "font-weight:500")}">${esc(ws.slice(0, cut).join(" ").toLowerCase())}</span><span class="punch" style="display:block;${body(S, 92, "font-weight:800;line-height:1")};color:#F7DD62;text-shadow:0 4px 20px rgba(0,0,0,.5)">${esc(ws.slice(cut).join(" ").toLowerCase())}</span></span>`; }).join("")}</div>`; } },
  C7: { mode: "phrase", render: (S) => { const ch = chunk(words(S), 4); return `<div class="ov caps" style="left:0;top:${S.capTop - 70}px;width:${S.W}px;text-align:center">${ch.map((c, i) => { const ws = c.split(" "); const last = ws.pop(); return `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;top:0;opacity:0;color:#fff"><span style="display:block;${body(S, 26, "font-weight:600;letter-spacing:.42em;text-transform:uppercase")}">${esc(ws.join(" "))}</span><span style="display:block;overflow:hidden;line-height:1.05"><span class="rise" style="display:inline-block;font-family:${serif(S)};font-size:132px;font-style:italic">${esc(last)}</span></span></span>`; }).join("")}</div>`; } },
  C8: { mode: "phrase", render: (S) => `<div class="ov caps" style="left:0;top:${S.headTop + 430}px;width:${S.W}px;text-align:center">${chunk(words(S), 4).map((c, i) => `<span class="w" data-i="${i}" style="position:absolute;left:0;right:0;top:0;opacity:0;${body(S, 30, "font-weight:600;letter-spacing:.2em;text-transform:uppercase")};color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.7)">${esc(c)}</span>`).join("")}</div>` },
  C9: { mode: "phrase", render: (S) => { const k = kw(S).toLowerCase(); const ch = chunk(words(S), 5); return `<div class="ov caps" style="left:${S.landscape ? 1150 : 90}px;top:${ab(S, 420)}px;width:${S.landscape ? 700 : 900}px">${ch.map((c, i) => `<span class="w" data-i="${i}" style="position:absolute;left:0;top:0;opacity:0;width:100%">${c.split(" ").map((w, j) => { const em = w.toLowerCase() === k; return `<span class="st" style="display:block;margin-left:${j * 70}px;${em ? `font-family:${serif(S)};font-style:italic;font-size:124px;color:#CFE8F5;line-height:1;position:relative` : `${body(S, 56, "font-weight:800;letter-spacing:-.02em;line-height:1.15")};color:#fff`};text-shadow:0 2px 12px rgba(0,0,0,.6)">${esc(w)}${em ? `<i class="ul" style="display:block;height:6px;background:#CFE8F5;transform-origin:left;transform:scaleX(0)"></i>` : ""}</span>`; }).join("")}</span>`).join("")}</div>`; } },
};
function capAnim(code, tl, root, start, dt) {
  const ws = [...root.querySelectorAll(".w")];
  if (code === "C9") ws.forEach((x, i) => { tl.from(x.querySelectorAll(".st"), { y: -20, opacity: 0, duration: 0.25, stagger: 0.12, ease: "power3.out" }, start + i * dt); tl.to(x.querySelectorAll(".ul"), { scaleX: 1, duration: 0.3 }, start + i * dt + 0.5); });
  if (code === "C7") ws.forEach((x, i) => tl.from(x.querySelector(".rise"), { yPercent: 110, duration: 0.5, ease: "power4.out" }, start + i * dt + 0.1));
  if (code === "C6") ws.forEach((x, i) => { tl.from(x.querySelector(".punch"), { opacity: 0, filter: "blur(14px)", y: 14, duration: 0.4 }, start + i * dt + 0.25); tl.to(x, { filter: "blur(10px)", duration: 0.25 }, start + (i + 1) * dt - 0.25); });
}

// ---------------------------------------------------------------- code → existing kit option (elements / motions)
const EL_MAP = { L2: "meia-tela-chat", L4: null, L5: "support-band", L7: "meia-tela-chat", L8: "phone-frame", L9: "cortina-cor", P1: "print-card", P3: "counter", P4: "print-card", P6: "mural-polaroides", P7: "phone-mock", V3: "palavra-caixa", V5: "chip", V6: "palavra-voa", V7: "palavra-voa", V8: "quote-cards", V10: "comment-bubble", V11: "player-capitulos", V12: "pill-glow", V13: "progress", V17: "cta-pill", V19: "comment-bubble", V20: "label-top", V21: "handwritten-note", V22: "note-circle", V23: "thumb-wall", B1: "prompt-digitando", B5: "phone-mock", B7: "comment-bubble", B8: "pill-glow", B10: "diagram-plane", X1: "satelites", X2: "thumb-wall", X3: "ai-prompt-card", X4: "fuga-quadro", X6: "phone-rise", X7: "lista-marca", X8: "quote-cards", X9: "mergulho", X10: "grafico-costas", X11: "bastidor-editor", X13: "colagem-kraft", X14: "person-sticker", X15: "fundo-foge", X16: "capa-banca", X17: "behind-head", X19: "abertura-filme" };
const MO_MAP = { M1: "punch-in", M2: "blur-rise", M3: "pop", M4: "dry-cut", M5: "punch-in", M6: "punch-in", M7: "flash" };

// generic placement card for codes without a matching renderer
function placementCard(S, cat, item) {
  const zoneTop = cat === "L" ? Math.max(60, ab(S, 520)) : ab(S, 440);
  const w = S.landscape ? 640 : S.W - 160;
  return `<div class="ov el" style="left:${S.landscape ? 1180 : 80}px;top:${zoneTop}px;width:${w}px;background:rgba(16,16,19,.9);border:1.5px solid rgba(255,255,255,.14);border-radius:26px;padding:26px 30px;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.45)"><div style="display:flex;align-items:center;gap:14px"><span style="background:${S.v.acc};color:#111;border-radius:999px;padding:6px 16px;${body(S, 26, "font-weight:800")}">${esc(item.code)}</span><b style="${body(S, 38, "font-weight:800")}">${esc(item.name)}</b></div><div style="${body(S, 28)};opacity:.8;margin-top:12px;line-height:1.3">${esc(item.what.length > 150 ? item.what.slice(0, 147) + "…" : item.what)}</div></div>`;
}

// Builds the options from the pack data and pushes them into the kit arrays. Returns the finish picks (S, G).
export function installBrandNat(data) {
  const finishes = [];
  for (const cat of data.cats || []) {
    for (const it of cat.items || []) {
      const id = `bn:${it.code}`, name = `${it.code} · ${it.name}`, desc = it.what, skills = ["brand-nat"];
      if (cat.id === "H") {
        const r = HOOK_RENDER[it.code];
        HOOKS.push({ id, name, desc, skills, code: it.code, render: r || ((S) => placementCard(S, "H", it).replace('class="ov el"', 'class="ov hook"')), anim: r ? hookAnim(it.code) : (tl, el) => tl.from(el, { y: 20, opacity: 0, duration: 0.4 }) });
      } else if (cat.id === "C") {
        const c = CAP[it.code];
        CAPTIONS.push({ id, name, desc, skills, code: it.code, mode: c ? c.mode : "word", render: c ? c.render : (S) => byId(CAPTIONS, "one-word-stroke").render(S), capAnim: c ? (tl, root, start, dt) => capAnim(it.code, tl, root, start, dt) : null });
      } else if (cat.id === "M") {
        const base = byId(MOTIONS, MO_MAP[it.code]) || byId(MOTIONS, "pop");
        MOTIONS.push({ id, name, desc, skills, code: it.code, camera: base.camera, demo: base.demo, anim: base.anim });
      } else if (cat.id === "S" || cat.id === "G") {
        finishes.push({ id, code: it.code, name: it.name, what: it.what, group: cat.id === "S" ? "Som" : "Cor e acabamento" });
      } else {
        const base = EL_MAP[it.code] ? byId(ELEMENTS, EL_MAP[it.code]) : null;
        ELEMENTS.push({ id, name, desc: base ? `${desc} (preview: ${base.name})` : desc, skills, code: it.code, camera: base ? base.camera : false, render: base ? base.render : (S) => placementCard(S, cat.id, it), anim: base ? base.anim : undefined });
      }
    }
  }
  return finishes;
}
