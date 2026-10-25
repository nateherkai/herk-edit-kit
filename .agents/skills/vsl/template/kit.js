/* =====================================================================================================
   VSL ROXO — biblioteca de motion (HyperFrames + GSAP). Todas as funções só AGENDAM tweens num timeline
   pausado (seek-safe, determinístico). Uso no index:
       const K = VSL.init({ tl, cfg: CFG, words: WORDS });
       K.camcorder(0, 1.6); K.glitch(1.6); K.behindTitle(["NOVA","ERA"], K.at("nova era"));
   Leia ../SKILL.md (gramática) e DESIGN.md (números) antes de inventar coisa nova.
   ===================================================================================================== */
(function () {
  const W = 1080, H = 1920;
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const mk = (parent, cls, html, style) => {
    const e = document.createElement("div");
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (style) Object.assign(e.style, style);
    $(parent).appendChild(e);
    return e;
  };
  const px = (v) => (typeof v === "number" ? v + "px" : v);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9%$ ]+/g, " ").trim();
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  // ---------------------------------------------------------------- ícones (traço 2px, 24×24)
  const ICONS = {
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    scissors: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.5 8.5L20 19M8.5 15.5L20 5"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
    folder: '<path d="M3 6h7l2 2h9v11H3z"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    wand: '<path d="M4 20L16 8M14 4v3M18 6h3M19 10l-2-2M10 3l1 2"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    caption: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 11h4M13 11h4M7 15h10"/>',
    money: '<circle cx="12" cy="12" r="9"/><path d="M15 9c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3.2-1.6M12 6v12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    megaphone: '<path d="M3 10v4h4l7 5V5L7 10z"/><path d="M18 9a4 4 0 010 6"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    send: '<path d="M4 12l16-8-6 16-3-7z"/>',
  };
  const icon = (name) => (name ? `<svg viewBox="0 0 24 24">${ICONS[name] || ICONS.spark}</svg>` : "");

  // ---------------------------------------------------------------- SFX gerados por scripts/make-sfx.mjs
  const SFX_DUR = { whoosh: 0.6, swoosh: 0.4, glitch: 0.35, boom: 1.2, pop: 0.12, click: 0.06, tick: 0.04,
    type: 1.0, riser: 1.4, shimmer: 0.9, stamp: 0.35, ding: 0.8 };

  function init({ tl, cfg = {}, words = [], face = null }) {
    const C = Object.assign({
      punch: 1.22, focus: "50% 32%", fullPos: "50% 28%", splitPos: "50% 30%", pipPos: "50% 24%", pipZoom: 1.55,
      face: { x: 250, y: 330, w: 580, h: 700 }, head: { x: 540, y: 560 },
      fullY: 0, capY: 1500, gradeFilter: "saturate(1.08) contrast(1.2) brightness(0.8)",
      rawFilter: "saturate(0.2) contrast(0.8) brightness(1.12)", tint: 0.85, tint2: 0.55, sfx: true, sfxVol: 0.55, topY: 54,
      dur: 60,
      // zona segura do Reels: nada de texto/UI fora disto; coluna de ações do Instagram à direita embaixo
      safe: { top: 220, bottom: 1520, left: 90, right: 990, colX: 940, colY: 1150 }, // = docs/SAFE-ZONES.md (reels)
    }, cfg);
    const K = { tl, cfg: C, mk, icon };
    const set = (sel, vars, t) => tl.set(sel, vars, t);
    const fromTo = (sel, a, b, t) => tl.fromTo(sel, a, Object.assign({ immediateRender: false }, b), t);
    const show = (sel, t, d = 0.25, extra = {}) => fromTo(sel, { opacity: 0 }, Object.assign({ opacity: 1, duration: d, ease: "power2.out" }, extra), t);
    K.show = show;
    document.querySelectorAll(".lens").forEach((l) => (l.style.transformOrigin = C.focus));
    K.set = set;
    K.fromTo = fromTo;

    // ------------------------------------------------------------ tempo das palavras (transcript)
    const WN = words.map((w) => ({ n: norm(w.text), s: w.start, e: w.end })).filter((w) => w.n);
    const find = (phrase, nth = 1, after = 0) => {
      const p = norm(phrase).split(/\s+/);
      let hit = 0;
      for (let i = 0; i <= WN.length - p.length; i++) {
        if (WN[i].s < after) continue;
        let ok = true;
        for (let j = 0; j < p.length; j++) if (WN[i + j].n.replace(/ /g, "") !== p[j]) { ok = false; break; }
        if (ok && ++hit === nth) return WN.slice(i, i + p.length);
      }
      return null;
    };
    /** início (s) da frase falada. Lança erro se não achar — nunca chute tempo. */
    K.at = (phrase, nth = 1, after = 0) => {
      const r = find(phrase, nth, after);
      if (!r) throw new Error(`VSL.at: frase não encontrada no transcript: "${phrase}" (#${nth})`);
      return r[0].s;
    };
    K.end = (phrase, nth = 1, after = 0) => { const r = find(phrase, nth, after); if (!r) throw new Error(`VSL.end: "${phrase}"`); return r[r.length - 1].e; };
    /** tempos de cada palavra da frase (para revelar palavra a palavra na fala). */
    K.wt = (phrase, nth = 1, after = 0) => { const r = find(phrase, nth, after); return r ? r.map((w) => w.s) : null; };
    K.has = (phrase) => !!find(phrase);

    // ------------------------------------------------------------ SFX (áudio criado em runtime funciona no render)
    let sfxN = 0;
    const trackEnd = {};
    K.sfx = (name, t, vol = 0.5) => {
      if (!C.sfx || t == null || t < 0) return;
      const d = SFX_DUR[name] || 0.5;
      let tr = 40;
      while ((trackEnd[tr] || -1) > t) tr++;
      trackEnd[tr] = t + d + 0.01;
      const a = document.createElement("audio");
      a.id = "sfx" + ++sfxN;
      a.src = `assets/sfx/${name}.wav`;
      a.setAttribute("data-start", t.toFixed(3));
      a.setAttribute("data-duration", d.toFixed(3));
      a.setAttribute("data-track-index", String(tr));
      a.setAttribute("data-volume", String(+(vol * C.sfxVol).toFixed(3)));
      $("#vsl").appendChild(a);
    };

    // ------------------------------------------------------------ saída genérica
    K.out = (sel, t, d = 0.25) => tl.to(sel, { opacity: 0, filter: "blur(10px)", duration: d, ease: "power2.in" }, t);
    K.hide = (sel, t) => set(sel, { opacity: 0 }, t);

    // ============================================================ LAYOUTS (câmeras)
    const LAY = {
      full:    { left: 0, top: 0, width: W, height: H, borderRadius: 0, lens: () => C.punch, ly: () => C.fullY, pos: () => C.fullPos, border: 0, corners: 0 },
      wide:    { left: 0, top: 0, width: W, height: H, borderRadius: 0, lens: () => 1, pos: () => C.fullPos, border: 0, corners: 0 },
      split:   { left: 52, top: 990, width: 976, height: 880, borderRadius: 22, lens: () => 1, pos: () => C.splitPos, border: 1, corners: 1 },
      splitS:  { left: 210, top: 1160, width: 660, height: 600, borderRadius: 22, lens: () => 1, pos: () => C.splitPos, border: 1, corners: 1 },
      // PIP dentro da zona segura (nunca no canto inferior direito: ali ficam os botões do Reels)
      pip:     { left: 90, top: 1240, width: 270, height: 270, borderRadius: 135, lens: () => C.pipZoom, pos: () => C.pipPos, border: 1, corners: 0 },
      pipTop:  { left: 720, top: 400, width: 270, height: 270, borderRadius: 135, lens: () => C.pipZoom, pos: () => C.pipPos, border: 1, corners: 0 },
      card916: { left: 262, top: 300, width: 556, height: 988, borderRadius: 22, lens: () => 1, pos: () => C.fullPos, border: 1, corners: 1 },
      card11:  { left: 190, top: 470, width: 700, height: 700, borderRadius: 22, lens: () => 1, pos: () => C.splitPos, border: 1, corners: 1 },
      card169: { left: 52, top: 560, width: 976, height: 549, borderRadius: 22, lens: () => 1, pos: () => C.splitPos, border: 1, corners: 1 },
      hidden:  { left: 540, top: 960, width: 0, height: 0, borderRadius: 22, lens: () => 1, pos: () => C.splitPos, border: 0, corners: 0 },
    };
    K.LAY = LAY;
    const oy = (parseFloat(String(C.focus).split(" ")[1]) || 32) / 100;
    /** deslocamento vertical seguro: nunca deixa aparecer borda preta embaixo/em cima com essa escala */
    const safeY = (s, y = C.fullY) => Math.max(-(s - 1) * H * (1 - oy), Math.min((s - 1) * H * oy, y));
    K.safeY = safeY;
    K.current = "full";
    /** troca de câmera animada. name: full|wide|split|splitS|pip|pipL|card916|card11|card169|hidden ou objeto geometria. */
    K.layout = (name, t, d = 0.45, opt = {}) => {
      const g = typeof name === "string" ? LAY[name] : name;
      const ease = opt.ease || "power3.inOut";
      const lens = opt.lens != null ? opt.lens : g.lens();
      const ly = g.ly ? safeY(lens, g.ly()) : 0;
      const geo = { left: g.left, top: g.top, width: g.width, height: g.height, borderRadius: g.borderRadius };
      if (d <= 0) {
        set("#frame", geo, t); set(".lens", { scale: lens, y: ly }, t); set(".lens video", { objectPosition: g.pos() }, t);
        set("#frame .fborder", { opacity: g.border }, t); set("#frame .fcorner", { opacity: g.corners }, t);
      } else {
        tl.to("#frame", Object.assign({ duration: d, ease }, geo), t);
        tl.to(".lens", { scale: lens, y: ly, duration: d, ease }, t);
        tl.to(".lens video", { objectPosition: g.pos(), duration: d, ease }, t);
        tl.to("#frame .fborder", { opacity: g.border, duration: d * 0.5 }, g.border ? t : t + d * 0.5);
        tl.to("#frame .fcorner", { opacity: g.corners, duration: d * 0.5 }, g.corners ? t + d * 0.5 : t);
        if (opt.sfx !== false) K.sfx("swoosh", t, 0.22);
      }
      tl.to("#behind", { opacity: name === "full" || name === "wide" || opt.behind ? 1 : 0, duration: 0.2 }, t);
      K.current = typeof name === "string" ? name : "custom";
      return t + d;
    };
    /** punch-in/out do enquadramento. d=0 → corte seco (entre frases). */
    K.punch = (t, scale = C.punch, d = 0, ease = "power2.inOut") =>
      d ? tl.to(".lens", { scale, y: safeY(scale), duration: d, ease }, t) : set(".lens", { scale, y: safeY(scale) }, t);
    /** zoom lento contínuo (respiração) — usar em trechos FULL longos. */
    K.drift = (t, d, to = 0.04) => tl.to(".lens", { scale: "+=" + to, duration: d, ease: "none" }, t);
    /** moldura fina lavanda em tela cheia */
    K.inset = (t0, t1) => { show("#inset", t0, 0.3); if (t1) tl.to("#inset", { opacity: 0, duration: 0.25 }, t1); };

    // ============================================================ GRADE
    K.grade = (kind, t, d = 0) => {
      const raw = kind === "raw";
      const v = { filter: raw ? C.rawFilter : C.gradeFilter };
      const a = { opacity: raw ? 0 : C.tint }, b = { opacity: raw ? 0 : C.tint2 };
      if (d) { tl.to(".lens video", Object.assign({ duration: d }, v), t); tl.to("#tint", Object.assign({ duration: d }, a), t); tl.to("#tint2", Object.assign({ duration: d }, b), t); }
      else { set(".lens video", v, t); set("#tint", a, t); set("#tint2", b, t); }
    };

    // ============================================================ TRANSIÇÕES / EFEITOS
    /** gancho "bruto": HUD de filmadora + grade dessaturada até t1 */
    K.camcorder = (t0, t1, opt = {}) => {
      const label = opt.label || "BRUTO · SEM EDIÇÃO";
      const c = mk("#fx", "cam k", null, null); c.style.inset = "0"; c.innerHTML = ( `<div class="rec"><i></i>REC</div><div class="tc">00:00:00:00</div><div class="lb">${esc(label)}</div>`);
      [["tl", { left: "70px", top: C.safe.top + "px", borderLeftWidth: "3px", borderTopWidth: "3px" }], ["tr", { right: "70px", top: C.safe.top + "px", borderRightWidth: "3px", borderTopWidth: "3px" }],
       ["bl", { left: "70px", top: C.safe.bottom - 64 + "px", borderLeftWidth: "3px", borderBottomWidth: "3px" }], ["br", { right: "130px", top: C.safe.bottom - 64 + "px", borderRightWidth: "3px", borderBottomWidth: "3px" }]]
        .forEach(([k, s]) => mk(c, "cb " + k, "", s));
      K.grade("raw", t0);
      set(c, { opacity: 1 }, t0);
      tl.to(c, { opacity: 0, duration: 0.08 }, t1);
      const tc = c.querySelector(".tc"), dot = c.querySelector(".rec i");
      Object.assign(c.querySelector(".rec").style, { left: "100px", top: C.safe.top + 26 + "px" });
      Object.assign(tc.style, { right: "100px", top: C.safe.top + 26 + "px" });
      Object.assign(c.querySelector(".lb").style, { left: "100px", bottom: "auto", top: C.safe.bottom - 90 + "px" });
      const p = { f: 0 };
      tl.fromTo(p, { f: 0 }, { f: (t1 - t0) * 30, duration: t1 - t0, ease: "none", immediateRender: false,
        onUpdate() { const f = Math.floor(p.f), s = Math.floor(f / 30), ff = f % 30; tc.textContent = `00:00:${String(s).padStart(2, "0")}:${String(ff).padStart(2, "0")}`; } }, t0);
      const n = Math.max(1, Math.floor((t1 - t0) / 0.5));
      for (let i = 0; i < n; i++) set(dot, { opacity: i % 2 ? 1 : 0.15 }, t0 + i * 0.5 + 0.5);
      return c;
    };
    /** glitch de barras (ciano/roxo) + troca de grade bruto→final + boom */
    K.glitch = (t, opt = {}) => {
      const ys = opt.ys || [367, 735, 1029, 1397, 1686];
      const g = mk("#fx", "k", "", { inset: "0" });
      const bars = ys.map((y, i) => mk(g, "gbar", "", { top: y + "px", width: (900 + ((i * 97) % 180)) + "px",
        background: i % 2 ? "rgba(var(--accRGB),.85)" : "rgba(var(--cyanRGB),.8)" }));
      set(g, { opacity: 1 }, t);
      const xs = [[-80, 60, -30], [40, -70, 20], [-20, 30, -60], [70, -40, 50], [-50, 80, -10]];
      bars.forEach((b, i) => { xs[i % 5].forEach((x, k) => set(b, { x, scaleY: k === 1 ? 0.6 : 1 }, t + k * 0.034)); });
      set("#frame", { x: 14 }, t + 0.034); set("#frame", { x: -10 }, t + 0.067); set("#frame", { x: 0 }, t + 0.1);
      set(g, { opacity: 0 }, t + (opt.d || 0.2));
      if (opt.grade !== false) K.grade("final", t + 0.1);
      K.sfx("glitch", t, 0.5); K.sfx("boom", t + 0.12, 0.7);
    };
    /** flash (cinza claro por padrão, como 2:31 / 2:48) */
    K.flash = (t, opt = {}) => {
      const f = mk("#fx", "flash k", "", { background: opt.color || "#e9e4f5" });
      tl.fromTo(f, { opacity: 0 }, { opacity: opt.peak || 0.8, duration: 0.06, immediateRender: false }, t);
      tl.to(f, { opacity: 0, duration: opt.d || 0.3, ease: "power2.out" }, t + 0.06);
      if (opt.sfx !== false) K.sfx("whoosh", t - 0.15, 0.35);
    };
    /** light leak roxo atravessando da esquerda */
    K.leak = (t, d = 0.6) => {
      const l = mk("#fx", "leak", "", { mixBlendMode: "screen", opacity: 0 });
      tl.fromTo(l, { x: 0, opacity: 0 }, { x: 2100, opacity: 1, duration: d, ease: "power2.inOut", immediateRender: false }, t);
      tl.to(l, { opacity: 0, duration: 0.15 }, t + d - 0.15);
      K.sfx("whoosh", t, 0.3);
    };

    // ============================================================ TEXTO ATRÁS DA CABEÇA (precisa do matte)
    const splitChars = (el, text) => { el.innerHTML = [...text].map((c) => `<span class="ch">${c === " " ? " " : esc(c)}</span>`).join(""); return el.querySelectorAll(".ch"); };
    /** título display largo atrás da cabeça. lines: ["NOVA","ERA"] */
    K.behindTitle = (lines, t, opt = {}) => {
      const size = opt.size || 200, top = opt.top != null ? opt.top : 96;
      const g = mk("#behind", "k center-x", "", { top: top + "px" });
      const chars = [];
      lines.forEach((ln, i) => {
        const d = mk(g, "disp" + (opt.glow === false ? "" : " glow") + (opt.outline && opt.outline.includes(i) ? " outline" : ""), "", { fontSize: (opt.sizes ? opt.sizes[i] : size) + "px" });
        chars.push(...splitChars(d, ln));
      });
      set(g, { opacity: 1 }, t);
      fromTo(chars, { opacity: 0, filter: "blur(18px)", x: -36 }, { opacity: 1, filter: "blur(0px)", x: 0, duration: 0.5, ease: "power3.out", stagger: opt.stagger || 0.045 }, t);
      if (opt.sfx !== false) K.sfx("whoosh", t - 0.1, 0.3);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** marquee cinético atrás da cabeça. rows: [{text, kind:'solid'|'outline'|'accent'|'outline2', size, y, dir}] */
    K.marquee = (rows, t, dur, opt = {}) => {
      const def = [{ kind: "solid", size: 92, y: 140 }, { kind: "outline", size: 186, y: 330 }, { kind: "accent", size: 150, y: 590 }, { kind: "outline2", size: 112, y: 860 }];
      const g = mk("#behind", "k", "", { inset: "0" });
      g.dataset.safe = "ignore"; // letreiro corre para fora do quadro de propósito
      set(g, { opacity: 1 }, t);
      rows.forEach((r, i) => {
        const d0 = def[i % 4], kind = r.kind || d0.kind, size = r.size || d0.size, y = r.y != null ? r.y : d0.y;
        const txt = (r.text + "   ").repeat(6);
        const cls = kind === "accent" ? "" : "disp" + (kind.startsWith("outline") ? " outline" : "");
        const st = { top: y + "px", left: "0px", whiteSpace: "nowrap", fontSize: size + "px" };
        if (kind === "accent") Object.assign(st, { font: `800 ${size}px/1 var(--fS)`, color: "var(--acc2)", textShadow: "0 0 30px rgba(var(--accRGB),.6)", textTransform: "lowercase" });
        if (kind === "outline2") st.webkitTextStroke = "2.5px rgba(255,255,255,.85)";
        const row = mk(g, cls, esc(txt), st);
        const dir = r.dir || (i % 2 ? 1 : -1), speed = r.speed || 150 + i * 25;
        const x0 = dir < 0 ? -40 : -1400;
        tl.fromTo(row, { x: x0 }, { x: x0 + dir * speed * dur, duration: dur, ease: "none", immediateRender: false }, t);
        fromTo(row, { opacity: 0, filter: "blur(16px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power2.out" }, t + i * 0.12);
      });
      K.out(g, t + dur - 0.25);
      K.sfx("whoosh", t - 0.1, 0.3);
      return g;
    };
    /** cards 3D orbitando atrás da cabeça (2:22 da referência). imgs: urls */
    K.orbit = (imgs, t0, t1, opt = {}) => {
      const cx = opt.cx || C.head.x, cy = opt.cy || C.head.y - 40, rx = opt.rx || 470, ry = opt.ry || 40;
      const g = mk("#behind", "k", "", { inset: "0", perspective: "1600px" });
      const cards = imgs.map((src) => mk(g, "card3d", src ? `<img src="${src}">` : "", { width: "170px", height: "300px", left: "0", top: "0" }));
      const n = cards.length, p = { a: 0 };
      const place = () => cards.forEach((c, i) => {
        const a = p.a + (i / n) * Math.PI * 2, z = Math.cos(a), x = cx + rx * Math.sin(a) - 85, y = cy + ry * z - 150;
        c.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotateY(${(-Math.sin(a) * 38).toFixed(1)}deg) scale(${(0.78 + 0.22 * z).toFixed(3)})`;
        c.style.opacity = (z > -0.55 ? 1 : Math.max(0, (z + 0.85) / 0.3)).toFixed(3);
        c.style.zIndex = String(Math.round(z * 100) + 100);
      });
      tl.fromTo(p, { a: opt.a0 || 0.3 }, { a: (opt.a0 || 0.3) + (opt.turns || 0.35) * Math.PI * 2, duration: t1 - t0, ease: "none", immediateRender: false, onUpdate: place }, t0);
      show(g, t0, 0.35); K.out(g, t1 - 0.25);
      K.sfx("whoosh", t0 - 0.1, 0.3);
      return g;
    };

    // ============================================================ LETTERING EMPILHADO (0:10 da referência)
    /** lines: [{text, t, style:'blur'|'letters'|'image'|'glow', img}] — uma linha por palavra falada */
    K.stack = (lines, opt = {}) => {
      const size = opt.size || 92, gap = opt.gap || 112, top = opt.top || 1170;
      const g = mk("#ui", "k center-x", "", { top: top + "px" });
      set(g, { opacity: 1 }, lines[0].t);
      lines.forEach((L, i) => {
        const d = mk(g, "", "", { position: "absolute", left: "0", width: W + "px", top: i * gap + "px", font: `800 ${size}px/1 var(--fS)`, textTransform: "uppercase", letterSpacing: "-.01em", color: "#fff", textShadow: "0 3px 24px rgba(0,0,0,.45)" });
        const st = L.style || (i === 0 ? "blur" : "letters");
        if (st === "image") {
          d.textContent = L.text;
          Object.assign(d.style, { color: "transparent", textShadow: "none", WebkitBackgroundClip: "text", backgroundClip: "text", filter: "drop-shadow(0 0 14px rgba(var(--accRGB),.55))",
            backgroundImage: L.img ? `url(${L.img})` : "radial-gradient(circle at 20% 30%,#fff 0 6%,transparent 7%),radial-gradient(circle at 70% 60%,var(--lavT) 0 5%,transparent 6%),repeating-linear-gradient(115deg,var(--deep) 0 14px,var(--acc2) 14px 26px,var(--lavT) 26px 32px,var(--deep) 32px 44px)",
            backgroundSize: "cover", backgroundPosition: "center" });
          fromTo(d, { opacity: 0, filter: "blur(14px)", scale: 0.92 }, { opacity: 1, filter: "blur(0px) drop-shadow(0 0 14px rgba(var(--accRGB),.55))", scale: 1, duration: 0.4, ease: "power3.out" }, L.t);
        } else if (st === "glow") {
          d.textContent = L.text;
          Object.assign(d.style, { textShadow: "0 0 22px rgba(var(--accRGB),.95),0 0 60px rgba(var(--accRGB),.6)" });
          fromTo(d, { opacity: 0, filter: "blur(14px)", scale: 1.12 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.4, ease: "power3.out" }, L.t);
        } else if (st === "letters") {
          const ch = splitChars(d, L.text);
          fromTo(ch, { opacity: 0, y: 26, color: "var(--lav)", filter: "blur(6px)" }, { opacity: 1, y: 0, color: "#ffffff", filter: "blur(0px)", duration: 0.35, ease: "power3.out", stagger: 0.035 }, L.t);
        } else {
          d.textContent = L.text;
          fromTo(d, { opacity: 0, filter: "blur(16px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, L.t);
        }
        K.sfx("pop", L.t, 0.25);
      });
      if (opt.until) K.out(g, opt.until);
      return g;
    };

    // ============================================================ LEGENDAS DE DESTAQUE (não é legenda contínua!)
    const revealWords = (els, t, phrase) => {
      const times = phrase ? K.wt(phrase) : null;
      els.forEach((e, i) => {
        const ti = times && times[i] != null ? times[i] : t + i * 0.12;
        fromTo(e, { opacity: 0, filter: "blur(8px)", y: 10 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.22, ease: "power2.out" }, ti);
      });
      return times ? times[times.length - 1] : t + els.length * 0.12;
    };
    const wordsHTML = (text, accIdx = []) => text.split(/\s+/).map((w, i) => `<span class="w${accIdx.includes(i) ? " acc" : ""}">${esc(w)}</span>`).join(" ");
    /**
     * cap({l1:'construído com a ajuda da', hl:'INTELIGÊNCIA ARTIFICIAL'}, t)   → linha + caixa roxa
     * cap({l1:'uma edição que', big:'PRENDE O OLHAR'}, t)                     → linha + linha grande lavanda
     * cap({acc:'no seu ritmo', accWords:[2]}, t)                              → linha única, palavra(s) lavanda
     * Se a frase existir no transcript, cada palavra entra no tempo em que é falada.
     */
    K.cap = (spec, t, opt = {}) => {
      const y = opt.y || C.capY;
      const g = mk("#cap", "k center-x", "", { top: y + "px" });
      set(g, { opacity: 1 }, t);
      let tEnd = t;
      if (spec.l1) {
        const l = mk(g, "capL1", wordsHTML(spec.l1));
        tEnd = revealWords(l.querySelectorAll(".w"), t, K.has(spec.l1) ? spec.l1 : null);
      }
      if (spec.hl) {
        const wrap = mk(g, "", `<span class="capHL"><span class="hlt">${esc(spec.hl)}</span></span>`, { marginTop: "14px" });
        const box = wrap.querySelector(".capHL"), txt = wrap.querySelector(".hlt");
        const th = K.has(spec.hl) ? K.at(spec.hl) : tEnd + 0.15;
        fromTo(box, { scaleX: 0, transformOrigin: "0% 50%", opacity: 1 }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, th);
        fromTo(txt, { opacity: 0 }, { opacity: 1, duration: 0.2 }, th + 0.12);
        set(box, { opacity: 1 }, th);
        K.sfx("pop", th, 0.3);
      }
      if (spec.big) {
        const b = mk(g, "capBig", wordsHTML(spec.big), { marginTop: "4px" });
        revealWords(b.querySelectorAll(".w"), K.has(spec.big) ? K.at(spec.big) : tEnd + 0.12, K.has(spec.big) ? spec.big : null);
      }
      if (spec.acc) {
        const a = mk(g, "capAcc", wordsHTML(spec.acc, spec.accWords || [spec.acc.split(/\s+/).length - 1]));
        revealWords(a.querySelectorAll(".w"), t, K.has(spec.acc) ? spec.acc : null);
      }
      if (opt.until) K.out(g, opt.until, 0.2);
      return g;
    };

    // ============================================================ HUD DE ROSTO
    K.faceHud = (t, opt = {}) => {
      const b = opt.box || C.face, arm = opt.arm || 52;
      const g = mk("#fx", "k", "", { inset: "0" });
      const corners = [[b.x, b.y, "Left", "Top"], [b.x + b.w - arm, b.y, "Right", "Top"], [b.x, b.y + b.h - arm, "Left", "Bottom"], [b.x + b.w - arm, b.y + b.h - arm, "Right", "Bottom"]]
        .map(([x, y, h, v]) => mk(g, "hb", "", { left: x + "px", top: y + "px", width: arm + "px", height: arm + "px", ["border" + h + "Width"]: "3px", ["border" + v + "Width"]: "3px" }));
      set(g, { opacity: 1 }, t);
      fromTo(corners, { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.6)", stagger: 0.03 }, t + 0.05);
      if (opt.label !== false) {
        const tag = mk(g, "htag", esc(opt.label || "APRESENTADOR"), { left: b.x + "px", top: b.y - 40 + "px" });
        fromTo(tag, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.25 }, t + 0.15);
      }
      if (opt.scan !== false) {
        const s = mk(g, "scan", "", { top: "0px" });
        tl.fromTo(s, { y: 0, opacity: 1 }, { y: H, duration: opt.scanD || 1.0, ease: "none", immediateRender: false }, t);
        set(s, { opacity: 0 }, t + (opt.scanD || 1.0));
        K.sfx("riser", t - 0.1, 0.18);
      }
      if (opt.until) K.out(g, opt.until, 0.2);
      return g;
    };

    // ============================================================ PÍLULAS
    /** pill('A capacidade da IA', t, {y:900, icon:'spark', kind:'solid'|'dark'|'strike', up:true, sm:true, x:'c'|left}) */
    K.pill = (text, t, opt = {}) => {
      const y = opt.y != null ? opt.y : C.capY;
      K.occupy(t, opt.until || t + 3, y);
      const holder = opt.x == null || opt.x === "c" ? mk(opt.parent || "#ui", "k center-x", "", { top: y + "px" }) : mk(opt.parent || "#ui", "k", "", { left: opt.x + "px", top: y + "px" });
      const ic = opt.icon === false ? "" : opt.kind === "strike" ? icon("x") : icon(opt.icon || "spark");
      const p = mk(holder, `pill${opt.kind ? " " + opt.kind : ""}${opt.up ? " up" : ""}${opt.sm ? " sm" : ""}${ic ? "" : " noicon"}`, `${ic ? `<span class="pico">${ic}</span>` : ""}<span class="ptxt">${esc(text)}</span>`);
      set(holder, { opacity: 1 }, t);
      fromTo(p, { opacity: 0, scale: 0.8, filter: "blur(8px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.32, ease: "back.out(1.5)" }, t);
      if (opt.sfx !== false) K.sfx("pop", t, 0.3);
      if (opt.until) K.out(holder, opt.until);
      return holder;
    };
    /** corrente de pílulas: items [{text, t, icon, kind}] separadas por '+' ou '↓', com rótulo opcional acima */
    K.chain = (items, opt = {}) => {
      const y0 = opt.y || 1240, gap = opt.gap || (opt.sep === "↓" ? 98 : 104), sep = opt.sep || "+";
      const out = [];
      if (opt.label) { const l = mk("#ui", "k center-x chainLabel", esc(opt.label), { top: y0 - 46 + "px" }); show(l, opt.labelT != null ? opt.labelT : items[0].t - 0.2, 0.3); out.push(l); }
      items.forEach((it, i) => {
        out.push(K.pill(it.text, it.t, { y: y0 + i * gap, icon: it.icon, kind: it.kind, up: opt.up, sm: opt.sm }));
        if (i < items.length - 1) { const s = mk("#ui", "k center-x sep", sep, { top: y0 + i * gap + (opt.sm ? 58 : 70) + "px", fontSize: (sep === "↓" ? 26 : 30) + "px" }); show(s, items[i + 1].t - 0.1, 0.2); out.push(s); }
      });
      if (opt.until) out.forEach((e) => K.out(e, opt.until));
      return out;
    };

    // ============================================================ TÍTULOS
    /** título de seção (SPLIT): kicker + título palavra a palavra, palavras-acento lavanda */
    K.section = (spec, t, opt = {}) => {
      const x = opt.x || 90, y = opt.y || C.topY;
      const g = mk("#ui", "k", "", { left: x + "px", top: y + "px", width: W - 2 * x + "px" });
      if (spec.kicker) mk(g, "kicker", esc(spec.kicker), { marginBottom: "14px" });
      const words = spec.title.split(/\s+/), acc = spec.acc || [words.length - 1];
      const tt = mk(g, "title", wordsHTML(spec.title, acc), { fontSize: (opt.size || 56) + "px" });
      set(g, { opacity: 1 }, t);
      if (spec.kicker) fromTo(g.firstChild, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, t);
      revealWords(tt.querySelectorAll(".w"), t + 0.08, opt.spoken && K.has(spec.title) ? spec.title : null);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** título central no topo com ícone em quadrado roxo + sublinhado (FULL, 0:38) */
    K.topTitle = (spec, t, opt = {}) => {
      const y = opt.y || C.topY;
      const g = mk("#ui", "k center-x", "", { top: y + "px" });
      if (spec.kicker) mk(g, "kicker", esc(spec.kicker), { color: "var(--lavT)", fontSize: "19px", marginBottom: "14px" });
      const row = mk(g, "", `${spec.icon ? `<span class="tib">${icon(spec.icon)}</span>` : ""}<span>${esc(spec.text)}</span>`,
        { display: "inline-flex", alignItems: "center", gap: "18px", font: `800 ${opt.size || 74}px/1 var(--fS)`, color: "#fff", textShadow: "0 0 24px rgba(var(--accRGB),.6)" });
      const tib = row.querySelector(".tib");
      if (tib) Object.assign(tib.style, { width: "64px", height: "64px", borderRadius: "14px", background: "linear-gradient(135deg,var(--btnA),var(--btnB))", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(var(--accRGB),.8)" });
      if (tib) Object.assign(tib.querySelector("svg").style, { width: "34px", height: "34px", stroke: "#fff", fill: "none", strokeWidth: "2.2" });
      const ul = mk(g, "", "", { width: "340px", height: "3px", margin: "18px auto 0", background: "linear-gradient(90deg,transparent,var(--lav),transparent)" });
      set(g, { opacity: 1 }, t);
      if (spec.kicker) fromTo(g.firstChild, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t);
      fromTo(row, { opacity: 0, filter: "blur(14px)", scale: 0.94 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.4, ease: "power3.out" }, t + 0.1);
      fromTo(ul, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.out" }, t + 0.3);
      K.sfx("whoosh", t, 0.25);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** kicker solto centralizado no topo ("UM PONTO MUITO IMPORTANTE") */
    K.kickerTop = (text, t, opt = {}) => {
      const g = mk("#ui", "k center-x kicker", esc(text), { top: (opt.y || C.topY + 12) + "px", color: "var(--lavT)", fontSize: (opt.size || 19) + "px" });
      fromTo(g, { opacity: 0, letterSpacing: ".4em" }, { opacity: 1, letterSpacing: ".24em", duration: 0.5, ease: "power2.out" }, t);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** categoria grande com ponto lavanda + barra segmentada (1:30). Chame várias vezes trocando i. */
    K.category = (text, t, opt = {}) => {
      const y = opt.y || 90, n = opt.n || 5, i = opt.i || 0;
      const g = mk("#ui", "k", "", { left: "90px", top: y + "px" });
      if (opt.kicker) mk(g, "kicker", esc(opt.kicker), { fontSize: "17px", marginBottom: "12px" });
      mk(g, "", `${esc(text)}<span style="color:var(--lav2)">.</span>`, { font: "800 60px/1 var(--fS)", textTransform: "uppercase" });
      mk(g, "", Array.from({ length: n }, (_, k) => `<span class="seg${k <= i ? " on" : ""}"></span>`).join(""), { marginTop: "18px" });
      fromTo(g, { opacity: 0, y: 14, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power2.out" }, t);
      if (opt.until) set(g, { opacity: 0 }, opt.until);
      K.sfx("tick", t, 0.3);
      return g;
    };

    // ============================================================ CARDS
    /** grade 2×2 de cards de vidro (SPLIT). items: [{img, label, icon, badge:['A','B'], t}] */
    K.grid = (items, opt = {}) => {
      const top = opt.top || 207, cw = opt.w || 467, ch = opt.h || 368, gx = opt.gx || 42, gy = opt.gy || 25, cols = opt.cols || 2;
      const left0 = (W - (cols * cw + (cols - 1) * gx)) / 2;
      return items.map((it, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const e = mk("#ui", "k gcard", `<div class="thumb" style="height:${ch - 110}px">${it.img ? `<img src="${it.img}">` : ""}</div><div class="lbl">${icon(it.icon || "spark")}<span>${esc(it.label || "")}</span></div>`,
          { left: left0 + c * (cw + gx) + "px", top: top + r * (ch + gy) + "px", width: cw + "px", height: ch + "px" });
        if (it.badge) mk(e, "badge", it.badge.map((b) => `<span>${esc(b)}</span>`).join(""), { left: "26px", top: "26px" });
        fromTo(e, { opacity: 0, y: 26, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" }, it.t);
        K.sfx("pop", it.t, 0.25);
        if (opt.until) K.out(e, opt.until);
        return e;
      });
    };
    /** fileira de cards 9:16 em perspectiva entrando em leque (0:03) */
    K.row3d = (imgs, t, opt = {}) => {
      const top = opt.top || 300, w = opt.w || 236, h = opt.h || 420;
      const g = mk("#ui", "k", "", { inset: "0", perspective: "1400px" });
      const n = imgs.length, span = W - 60, step = (span - w) / Math.max(1, n - 1);
      const cards = imgs.map((src, i) => mk(g, "card3d", src ? `<img src="${src}">` : "", { left: 30 + i * step + "px", top: top + "px", width: w + "px", height: h + "px", transformOrigin: "50% 50%" }));
      set(g, { opacity: 1 }, t);
      cards.forEach((c, i) => {
        const ry = (i - (n - 1) / 2) * -9 + 16;
        fromTo(c, { opacity: 0, x: -260, y: -140, rotationY: 55, z: -300 }, { opacity: 1, x: 0, y: 0, rotationY: ry, z: 0, duration: 0.55, ease: "power3.out" }, t + i * 0.07);
        if (opt.drift !== false) tl.to(c, { x: "-=26", duration: (opt.until || t + 4) - t, ease: "none" }, t + 0.6);
      });
      K.sfx("whoosh", t, 0.3);
      if (opt.until) { tl.to(cards, { y: -260, scale: 0.6, opacity: 0, duration: 0.5, ease: "power3.in", stagger: 0.03 }, opt.until); }
      return g;
    };
    /** leque de cards (0:35) */
    K.fan = (imgs, t, opt = {}) => {
      const top = opt.top || 300, w = opt.w || 250, h = opt.h || 400;
      const g = mk("#ui", "k", "", { inset: "0" });
      const n = imgs.length;
      const cards = imgs.map((src, i) => mk(g, "card3d", src ? `<img src="${src}">` : "", { left: 540 - w / 2 + "px", top: top + "px", width: w + "px", height: h + "px", transformOrigin: "50% 120%" }));
      set(g, { opacity: 1 }, t);
      cards.forEach((c, i) => {
        const k = i - (n - 1) / 2;
        fromTo(c, { opacity: 0, rotation: 0, x: 0, y: 40 }, { opacity: 1, rotation: k * 9, x: k * 205, y: Math.abs(k) * 30, duration: 0.5, ease: "power3.out" }, t + i * 0.06);
      });
      K.sfx("whoosh", t, 0.28);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** carimbo "APROVADO ✓" que bate sobre um card */
    K.stamp = (text, t, opt = {}) => {
      K.occupy(t, opt.until || t + 2, opt.y || 200);
      const e = mk(opt.parent || "#ui", "k stamp", esc(text), { left: (opt.x || 620) + "px", top: (opt.y || 200) + "px" });
      fromTo(e, { opacity: 0, scale: 1.45, rotation: (opt.rot || -8) - 4 }, { opacity: 1, scale: 1, rotation: opt.rot || -8, duration: 0.16, ease: "power4.in" }, t);
      tl.to(e, { x: 4, duration: 0.04, yoyo: true, repeat: 3 }, t + 0.16);
      K.sfx("stamp", t + 0.12, 0.5);
      if (opt.until) K.out(e, opt.until);
      return e;
    };
    /** quadrado tracejado que cresce com uma palavra ("ESPAÇO"), depois recebe imagem e wipe */
    K.dashbox = (text, t, opt = {}) => {
      const b = Object.assign({ x: 200, y: 260, w: 680, h: 600 }, opt.box);
      const e = mk("#ui", "k dashbox", `<b>${esc(text)}</b>`, { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
      fromTo(e, { opacity: 0, scale: 0.18 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.3)" }, t);
      K.sfx("pop", t, 0.3);
      const api = { el: e };
      /** imagem cai dentro do quadro */
      api.drop = (src, t2, o = {}) => {
        const w2 = o.w || b.w * 0.56, h2 = o.h || b.h * 0.78;
        const im = mk("#ui", "k card3d", `<img src="${src}">`, { left: b.x + (b.w - w2) / 2 + "px", top: b.y + (b.h - h2) / 2 + "px", width: w2 + "px", height: h2 + "px" });
        fromTo(im, { opacity: 0, y: -60, scale: 1.15, rotation: -4 }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.35, ease: "power3.out" }, t2);
        tl.to(e, { opacity: 0, duration: 0.25 }, t2 + 0.1);
        K.sfx("pop", t2, 0.3);
        api.img = im; return api;
      };
      /** wipe da esquerda transformando a imagem atual em outra (rascunho → render) */
      api.wipe = (src2, t3, d = 0.45) => {
        const im = api.img;
        const over = mk(im, "", `<img src="${src2}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`, { position: "absolute", inset: "0", clipPath: "inset(0 100% 0 0)" });
        const edge = mk(im, "", "", { position: "absolute", top: "0", bottom: "0", width: "40px", left: "0", background: "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85),rgba(255,255,255,0))", opacity: "0" });
        const p = { v: 0 };
        tl.fromTo(p, { v: 0 }, { v: 1, duration: d, ease: "power2.inOut", immediateRender: false, onUpdate() { over.style.clipPath = `inset(0 ${(100 - p.v * 100).toFixed(2)}% 0 0)`; edge.style.left = `calc(${(p.v * 100).toFixed(2)}% - 20px)`; edge.style.opacity = p.v > 0 && p.v < 1 ? "1" : "0"; } }, t3);
        K.sfx("shimmer", t3, 0.3);
        return api;
      };
      api.out = (t4) => { K.out(e, t4); if (api.img) K.out(api.img, t4); };
      return api;
    };
    /** post-its brancos inclinados colados por cima (0:30) */
    K.notes = (items, opt = {}) => items.map((it, i) => {
      const e = mk("#ui", "k note", esc(it.text), { left: it.x + "px", top: it.y + "px" });
      const rot = it.rot != null ? it.rot : (i % 2 ? 5 : -6);
      fromTo(e, { opacity: 0, scale: 1.3, rotation: rot * 2 }, { opacity: 1, scale: 1, rotation: rot, duration: 0.25, ease: "back.out(2)" }, it.t);
      K.sfx("click", it.t, 0.4);
      if (opt.until) K.out(e, opt.until);
      return e;
    });

    // ============================================================ 5 CAMADAS EM PROFUNDIDADE (1:02)
    K.layers3d = (labels, t, d, opt = {}) => {
      const planes = labels.slice(0, 4).map((lab, i) => {
        const p = mk("#rigInner", "plane", `<span class="ptag">${esc(lab)}</span>`);
        $("#rigInner").insertBefore(p, $("#frame"));
        if (i === 1) mk(p, "pico", icon("image"), { right: "40px", top: "520px" });
        if (i === 2) mk(p, "pico", icon("layers"), { left: "40px", top: "1180px" });
        if (i === 3) mk(p, "pico", icon("caption"), { right: "40px", top: "1300px" });
        return p;
      });
      const ftag = mk("#frame", "k", `<span class="ptag" style="position:static">${esc(opt.frontLabel || "01 · FUNDO")}</span>`, { left: "26px", top: "22px" });
      const foot = mk("#fx", "k center-x mono", esc(opt.foot || "5 CAMADAS · PROFUNDIDADE REAL"), { top: "1748px", font: "600 26px/1 var(--fS)", letterSpacing: ".3em" });
      tl.to("#rigInner", { rotationY: -16, rotationX: 4, scale: 0.8, x: 40, duration: 0.7, ease: "power3.inOut" }, t);
      tl.to("#frame", { borderRadius: 30, duration: 0.4 }, t);
      tl.to("#frame .fborder", { opacity: 1, duration: 0.3 }, t + 0.2);
      planes.forEach((p, i) => {
        const k = 4 - i; // plano mais distante primeiro
        fromTo(p, { opacity: 0, x: 0, y: 0, z: 0 }, { opacity: 0.9, x: -k * 46, y: -k * 74, z: -k * 40, duration: 0.7, ease: "power3.out" }, t + 0.1 + i * 0.06);
      });
      show(ftag, t + 0.4); show(foot, t + 0.5, 0.35);
      tl.to("#rigInner", { rotationY: -8, duration: d - 1.2, ease: "sine.inOut" }, t + 0.7);
      const tOut = t + d - 0.5;
      tl.to(planes, { opacity: 0, x: 0, y: 0, z: 0, duration: 0.45, ease: "power3.in" }, tOut);
      tl.to("#rigInner", { rotationY: 0, rotationX: 0, scale: 1, x: 0, duration: 0.5, ease: "power3.inOut" }, tOut);
      tl.to("#frame", { borderRadius: 0, duration: 0.4 }, tOut + 0.1);
      tl.to("#frame .fborder", { opacity: 0, duration: 0.3 }, tOut + 0.2);
      K.out([ftag, foot], tOut);
      K.sfx("riser", t - 0.2, 0.25); K.sfx("whoosh", tOut, 0.3);
    };

    // ============================================================ MURAL "NA SUA ESCALA" (2:31)
    K.wall = (imgs, title, t, d = 1.8, opt = {}) => {
      const cw = 210, chh = 373, gap = 14, cols = 7, rows = 7;
      const g = mk("#under", "k", "", { inset: "0", transformOrigin: "540px 960px" });
      const ox = 540 - cw / 2 - 3 * (cw + gap), oy = 960 - chh / 2 - 3 * (chh + gap);
      let k = 0;
      const cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (r === 3 && c === 3) continue;
        const src = imgs[k++ % imgs.length];
        cells.push(mk(g, "wallc", src ? `<img src="${src}">` : "", { left: ox + c * (cw + gap) + "px", top: oy + r * (chh + gap) + "px", width: cw + "px", height: chh + "px" }));
      }
      K.flash(t, { peak: 0.7, d: 0.25 });
      K.layout({ left: 540 - cw / 2, top: 960 - chh / 2, width: cw, height: chh, borderRadius: 16, lens: () => 1, pos: () => C.fullPos, border: 1, corners: 0 }, t + 0.05, 0.4, { sfx: false });
      set(g, { opacity: 1 }, t + 0.05);
      fromTo(g, { scale: 2.6 }, { scale: 1, duration: 0.45, ease: "power3.out" }, t + 0.05);
      fromTo(cells, { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: { each: 0.004, from: "center" } }, t + 0.05);
      const tt = title ? mk("#ui", "k center-x disp glow", title.map(esc).join("<br>"), { top: "760px", fontSize: (opt.size || 104) + "px", lineHeight: "1" }) : null;
      if (tt) fromTo(tt, { opacity: 0, filter: "blur(16px)", scale: 1.1 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.4, ease: "power3.out" }, t + 0.25);
      const tOut = t + d - 0.45;
      tl.to(g, { scale: 3.1, opacity: 0, duration: 0.45, ease: "power3.in" }, tOut);
      K.layout(opt.back || "full", tOut, 0.45, { sfx: false });
      if (tt) tl.to(tt, { opacity: 0, scale: 1.3, filter: "blur(12px)", duration: 0.35 }, tOut + 0.05);
      K.sfx("whoosh", tOut - 0.1, 0.35);
      return g;
    };

    // ============================================================ ANTES / DEPOIS (2:46)
    K.beforeAfter = (t, d = 2.4, opt = {}) => {
      const line = mk("#fx", "k wipeLine", "", { left: "0px" });
      const a = mk("#fx", "k mono", esc(opt.before || "ANTES"), { left: "90px", top: (opt.y || C.topY) + 8 + "px", font: "600 22px/1 var(--fM)", letterSpacing: ".2em" });
      const b = mk("#fx", "k", "", { right: "90px", top: (opt.y || C.topY) + "px" });
      b.innerHTML = `<span class="pill up sm noicon" style="height:40px;font-size:18px;padding:0 16px">${esc(opt.after || "DEPOIS · COM IA")}</span>`;
      const veil = $("#rawveil");
      const p = { x: 0 };
      const upd = () => { veil.style.clipPath = `inset(0 ${(W - p.x).toFixed(1)}px 0 0)`; line.style.left = p.x.toFixed(1) + "px"; };
      set(veil, { opacity: 1 }, t); set(line, { opacity: 1 }, t);
      show([a, b], t + 0.1, 0.25);
      const seq = opt.seq || [[0.62, 0.55, "power2.out"], [0.42, 0.8, "sine.inOut"], [0.58, 0.7, "sine.inOut"], [0, 0.35, "power2.in"]];
      let tt = t;
      tl.fromTo(p, { x: 0 }, { x: seq[0][0] * W, duration: seq[0][1], ease: seq[0][2], immediateRender: false, onUpdate: upd }, tt);
      tt += seq[0][1];
      for (let i = 1; i < seq.length; i++) {
        const hold = i === seq.length - 1 ? Math.max(0, t + d - seq[i][1] - tt) : 0;
        tl.to(p, { x: seq[i][0] * W, duration: seq[i][1], ease: seq[i][2], onUpdate: upd }, tt + hold);
        tt += seq[i][1] + hold;
      }
      set([veil, line], { opacity: 0 }, t + d);
      K.out([a, b], t + d - 0.2, 0.2);
      K.sfx("swoosh", t, 0.3);
    };

    // ============================================================ MOCKUPS DE UI
    const typeInto = (el, text, t, cps = 20, caret = true) => {
      const p = { n: 0 }, d = text.length / cps;
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: d, ease: "none", immediateRender: false,
        onUpdate() { el.innerHTML = esc(text.slice(0, Math.round(p.n))) + (caret ? '<span class="caret"></span>' : ""); } }, t);
      if (C.sfx) { let k = 0; for (let s = t; s < t + d - 0.2; s += 1.0) K.sfx("type", s, 0.22 + (k++ % 2) * 0.03); }
      return t + d;
    };
    K.typeInto = typeInto;
    /** barra de prompt de IA digitando (0:46) */
    K.prompt = (text, t, opt = {}) => {
      const y = opt.y || 1380, x = opt.x || 52, w = opt.w || 976;
      const g = mk("#ui", "k", "", { left: x + "px", top: y + "px", width: w + "px" });
      if (opt.kicker) mk(g, "kicker center-x", esc(opt.kicker), { position: "absolute", top: "-44px", left: "0", width: w + "px", color: "var(--lavT)", fontSize: "18px" });
      const bar = mk(g, "prompt", `<span class="ic">${icon("chat")}</span><span class="tx"></span><span class="send">${icon("arrowUp")}</span>`);
      fromTo(g, { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power2.out" }, t);
      const tEnd = typeInto(bar.querySelector(".tx"), text, t + 0.25, opt.cps || 20);
      if (opt.send) { tl.to(bar.querySelector(".send"), { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1 }, tEnd + 0.2); K.sfx("click", tEnd + 0.2, 0.5); }
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** DM: cabeçalho, "…" digitando, bolha digitando (1:05) */
    K.dm = (spec, t, opt = {}) => {
      const b = Object.assign({ x: 52, y: 60, w: 976, h: 860 }, opt.box);
      const g = mk("#ui", "k panel dm", `<div class="hd"><div class="av">${icon("user")}</div><div><div class="nm">${esc(spec.name || "Nova mensagem")}</div><div class="sb">${esc(spec.sub || "agora · direct")}</div></div></div>`,
        { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
      const dots = mk(g, "dots k", "<i></i><i></i><i></i>", { left: "30px", top: "150px" });
      const bub = mk(g, "bub k", "");
      fromTo(g, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
      show(dots, t + 0.3, 0.15);
      dots.querySelectorAll("i").forEach((d, i) => tl.to(d, { y: -8, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" }, t + 0.35 + i * 0.08));
      set(dots, { opacity: 0 }, t + 1.1);
      set(bub, { opacity: 1 }, t + 1.1);
      const tEnd = typeInto(bub, spec.text, t + 1.1, opt.cps || 22);
      if (spec.attach) {
        const at = mk(g, "k card3d", `<img src="${spec.attach}">`, { left: "30px", top: "300px", width: "150px", height: "266px" });
        show(at, tEnd + 0.1, 0.25, { scale: 1 });
        K.sfx("pop", tEnd + 0.1, 0.3);
      }
      K.sfx("ding", t + 0.05, 0.25);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** terminal: lines [{cmd:'instalar node', ok:'Node.js instalado', t}] */
    K.terminal = (lines, t, opt = {}) => {
      const b = Object.assign({ x: 52, y: 330, w: 976, h: 560 }, opt.box);
      const g = mk("#ui", "k panel term", `<div class="bar"><i style="background:#ff6b6b"></i><i style="background:#ffc85c"></i><i style="background:#6ee08a"></i><span style="margin-left:12px">${esc(opt.title || "terminal — seu computador")}</span></div>`,
        { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
      fromTo(g, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
      lines.forEach((L, i) => {
        const y = 92 + i * 108;
        const ln = mk(g, "ln", "", { top: y + "px" });
        const t1 = typeInto(ln, "$ " + L.cmd, L.t, 16, false);
        const pr = mk(g, "prog k", "", { left: "28px", top: y + 52 + "px", width: "0px" });
        set(pr, { opacity: 1 }, t1);
        tl.to(pr, { width: 340, duration: 0.5, ease: "power2.inOut" }, t1);
        if (L.ok) { const ok = mk(g, "ln ok k", "✓ " + esc(L.ok), { top: y + 34 + "px", left: "400px", fontSize: "23px" }); show(ok, t1 + 0.5, 0.2); K.sfx("tick", t1 + 0.5, 0.35); }
      });
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** pasta de arquivos: contador sobe, thumbs pop em stagger (0:27) */
    K.files = (n, t, opt = {}) => {
      const b = Object.assign({ x: 52, y: 990, w: 976, h: 330 }, opt.box);
      const g = mk("#ui", "k panel", `<div style="position:absolute;left:28px;top:24px;font:800 26px/1 var(--fS);display:flex;gap:10px;align-items:center">${icon("folder").replace("<svg", '<svg style="width:26px;height:26px;stroke:var(--lav);fill:none;stroke-width:2"')}${esc(opt.title || "Gravações")}</div><div class="cnt" style="position:absolute;right:28px;top:28px;font:600 20px/1 var(--fS);color:var(--muted)"></div>`,
        { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
      const cnt = g.querySelector(".cnt");
      fromTo(g, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
      const cols = 4, tw = (b.w - 56 - 3 * 18) / cols, th = 92;
      for (let i = 0; i < n; i++) {
        const c = i % cols, r = Math.floor(i / cols);
        const th_ = mk(g, "k", `<div style="width:100%;height:${th}px;border-radius:10px;background:linear-gradient(135deg,var(--thumb),var(--panel2));border:1px solid rgba(var(--hiRGB),.25);display:flex;align-items:center;justify-content:center;font:900 30px/1 var(--fS);color:#fff">❚❚</div><div style="font:500 16px/1 var(--fM);color:var(--muted);margin-top:8px">${esc((opt.names && opt.names[i]) || "take-" + String(i + 1).padStart(2, "0") + ".mov")}</div>`,
          { left: 28 + c * (tw + 18) + "px", top: 80 + r * (th + 46) + "px", width: tw + "px" });
        const ti = t + 0.3 + i * 0.12;
        fromTo(th_, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.6)" }, ti);
        set(cnt, { textContent: `${i + 1} arquivos · sem edição` }, ti);
        K.sfx("tick", ti, 0.2);
      }
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** régua de timeline + playhead + diamante de keyframe (0:54) */
    K.scrub = (t, d, opt = {}) => {
      const y = opt.y || 880, x0 = opt.x || 70, w = opt.w || 940;
      const g = mk("#ui", "k", "", { left: x0 + "px", top: y + "px", width: w + "px", height: "40px" });
      mk(g, "tlbar", "", { left: "0", top: "19px", width: w + "px" });
      for (let i = 0; i <= 40; i++) mk(g, "tick", "", { left: (i * w) / 40 + "px", top: i % 5 ? "14px" : "8px", height: i % 5 ? "12px" : "24px" });
      mk(g, "", "◇", { position: "absolute", left: w * 0.72 - 10 + "px", top: "4px", font: "700 28px/1 var(--fS)", color: "var(--lavT)" });
      const ph = mk(g, "playhead", "", { left: "0", top: "-10px", height: "60px" });
      show(g, t, 0.3);
      tl.fromTo(ph, { x: w * 0.05 }, { x: w * (opt.to || 0.9), duration: d, ease: "none", immediateRender: false }, t);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** anel que desenha + número (garantia "7 dias") */
    K.ring = (num, label, t, opt = {}) => {
      const r = opt.r || 56, x = opt.x || 880, y = opt.y || 200;
      const L = 2 * Math.PI * r;
      const g = mk("#ui", "k ring", `<svg width="${2 * r + 20}" height="${2 * r + 20}"><circle cx="${r + 10}" cy="${r + 10}" r="${r}" stroke="rgba(var(--hiRGB),.25)" stroke-width="7" fill="rgba(var(--panelRGB),.6)"/><circle class="arc" cx="${r + 10}" cy="${r + 10}" r="${r}" stroke="var(--lav)" stroke-width="7" fill="none" stroke-linecap="round" transform="rotate(-90 ${r + 10} ${r + 10})" stroke-dasharray="${L}" stroke-dashoffset="${L}" style="filter:drop-shadow(0 0 8px var(--acc))"/></svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><b class="n" style="font:900 52px/1 var(--fS)">${esc(num)}</b><span style="font:700 14px/1 var(--fS);letter-spacing:.2em">${esc(label || "DIAS")}</span></div>`,
        { left: x - r - 10 + "px", top: y - r - 10 + "px", width: 2 * r + 20 + "px", height: 2 * r + 20 + "px" });
      show(g, t, 0.25);
      tl.fromTo(g.querySelector(".arc"), { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut", immediateRender: false }, t + 0.1);
      fromTo(g.querySelector(".n"), { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, t + 0.5);
      K.sfx("ding", t + 0.5, 0.3);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** card de preço: {kicker:'POR APENAS', cur:'R$', value:97, tail:'à vista', sub:'ou 12x de R$ 9,70 no cartão'} */
    K.price = (spec, t, opt = {}) => {
      const b = Object.assign({ x: 52, y: 180, w: 976, h: 300 }, opt.box);
      const g = mk("#ui", "k panel price", `<div class="kicker" style="position:absolute;left:34px;top:30px;color:var(--lavT)">${esc(spec.kicker || "POR APENAS")}</div>
        <div style="position:absolute;left:34px;top:84px;display:flex;align-items:baseline;gap:14px"><span class="rs">${esc(spec.cur || "R$")}</span><span class="num">0</span><span style="font:700 30px/1 var(--fS);color:var(--lavT)">${esc(spec.tail || "")}</span></div>
        <div class="sub" style="position:absolute;left:34px;top:244px;font:700 30px/1 var(--fS)">${esc(spec.sub || "")}</div>`,
        { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
      const num = g.querySelector(".num"), sub = g.querySelector(".sub");
      fromTo(g, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
      const p = { v: 0 };
      tl.fromTo(p, { v: 0 }, { v: +spec.value, duration: 0.7, ease: "power3.out", immediateRender: false, onUpdate() { num.textContent = Math.round(p.v); } }, t + 0.2);
      fromTo(sub, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + (opt.subT || 0.9));
      K.sfx("riser", t - 0.3, 0.2); K.sfx("ding", t + 0.85, 0.3);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** botão CTA com brilho varrendo + cursor clicando + chevrons */
    K.cta = (text, t, opt = {}) => {
      const y = opt.y || 1560, w = opt.w || 920, end = opt.until || C.dur;
      K.occupy(t, end, y);
      const g = mk("#ui", "k", "", { left: (W - w) / 2 + "px", top: y + "px", width: w + "px" });
      const btn = mk(g, "cta", `<span>${esc(text)}</span>${icon("arrowR").replace("<svg", '<svg style="width:32px;height:32px;stroke:#fff;fill:none;stroke-width:2.6"')}<span class="shine"></span>`);
      fromTo(g, { opacity: 0, y: 30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }, t);
      const shine = btn.querySelector(".shine");
      for (let s = t + 0.5; s < end - 0.6; s += 1.4) tl.fromTo(shine, { x: 0 }, { x: w + 260, duration: 0.7, ease: "power2.inOut", immediateRender: false }, s);
      if (opt.chevrons !== false) {
        const ch = mk(g, "", `<svg class="chev" viewBox="0 0 44 30"><path d="M6 6l16 14 16-14"/></svg>`, { textAlign: "center", marginTop: "18px" });
        for (let s = t + 0.4; s < end - 0.5; s += 0.8) tl.fromTo(ch, { y: 0, opacity: 0.5 }, { y: 10, opacity: 1, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut", immediateRender: false }, s);
      }
      if (opt.cursor !== false) {
        const cur = mk("#fx", "k", `<svg class="cursor" viewBox="0 0 46 56"><path d="M4 3l36 24-16 3-8 16z" fill="#fff" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/></svg>`, { left: "0", top: "0" });
        const tc = t + (opt.clickAt || 1.2);
        set(cur, { opacity: 1 }, tc - 0.7);
        tl.fromTo(cur, { x: 900, y: y + 330 }, { x: 600, y: y + 50, duration: 0.6, ease: "power3.out", immediateRender: false }, tc - 0.7);
        tl.to(btn, { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1 }, tc);
        tl.to(cur, { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1 }, tc);
        K.sfx("click", tc, 0.5);
        tl.to(cur, { opacity: 0, duration: 0.3 }, tc + 0.9);
      }
      K.sfx("shimmer", t + 0.4, 0.25);
      if (opt.until) K.out(g, opt.until);
      return g;
    };
    /** revelação de logo em TAKEOVER: linha vertical + wipe com faixa de luz (0:44) */
    K.logo = (spec, t, d = 1.8, opt = {}) => {
      const g = mk("#ui", "k center-x", "", { top: (opt.y || 860) + "px" });
      const inner = mk(g, "", spec.img ? `<img src="${spec.img}" style="height:${opt.h || 150}px">` : `<span class="disp" style="font-size:${opt.size || 96}px">${esc(spec.text || "LOGO")}</span>`, { display: "inline-block", position: "relative", padding: Math.round((opt.size || 96) * 0.4) + "px 6px " + Math.round((opt.size || 96) * 0.32) + "px", clipPath: "inset(0 100% 0 0)" });
      const band = mk(inner, "", "", { position: "absolute", top: "-10px", bottom: "-10px", width: "70px", left: "0", background: "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.9),rgba(255,255,255,0))" });
      const bar = mk("#ui", "k", "", { left: "300px", top: (opt.y || 860) - 10 + "px", width: "8px", height: (opt.h || 150) + 20 + "px", background: "var(--acc)", boxShadow: "0 0 20px var(--acc)" });
      const sub = spec.sub ? mk("#ui", "k center-x mono", esc(spec.sub), { top: (opt.y || 860) + (opt.h || 150) + 70 + "px", fontSize: "20px", letterSpacing: ".34em", color: "var(--lavT)" }) : null;
      tl.to("#bg .beam", { opacity: 1, duration: 0.3 }, t);
      set(g, { opacity: 1 }, t + 0.15);
      fromTo(bar, { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.12 }, t + 0.1);
      const p = { v: 0 };
      tl.fromTo(p, { v: 0 }, { v: 1, duration: 0.45, ease: "power3.inOut", immediateRender: false, onUpdate() { inner.style.clipPath = `inset(0 ${(100 - p.v * 100).toFixed(2)}% 0 0)`; band.style.left = `calc(${(p.v * 100).toFixed(2)}% - 35px)`; band.style.opacity = p.v < 1 ? "1" : "0"; } }, t + 0.22);
      tl.to(bar, { x: 480, opacity: 0, duration: 0.45, ease: "power3.inOut" }, t + 0.22);
      if (sub) fromTo(sub, { opacity: 0, letterSpacing: ".6em" }, { opacity: 1, letterSpacing: ".34em", duration: 0.6 }, t + 0.6);
      K.sfx("whoosh", t, 0.4); K.sfx("boom", t + 0.3, 0.55);
      const tOut = t + d;
      K.out([g, sub].filter(Boolean), tOut - 0.2, 0.2);
      tl.to("#bg .beam", { opacity: 0, duration: 0.3 }, tOut - 0.2);
      return g;
    };
    /** cobre o quadro (TAKEOVER) entre t0 e t1 — o apresentador some atrás do fundo roxo */
    K.takeover = (t0, t1, d = 0.25) => {
      const cover = mk("#cover", "k", "", { inset: "0", background: "radial-gradient(70% 50% at 50% 45%,var(--bg2),var(--bg1) 70%,var(--bg0))" });
      show(cover, t0, d);
      if (t1) tl.to(cover, { opacity: 0, duration: d }, t1);
      return cover;
    };

    // ============================================================ EDIÇÃO SIMULTÂNEA ("a IA está editando enquanto eu falo")
    /** cursor da IA percorrendo pontos [{x,y,t,click}] */
    K.cursor = (points, opt = {}) => {
      const cur = mk("#fx", "k", `<svg class="cursor" viewBox="0 0 46 56"><path d="M4 3l36 24-16 3-8 16z" fill="#fff" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/></svg>`, { left: "0", top: "0", zIndex: "50" });
      const p0 = points[0];
      set(cur, { x: p0.x, y: p0.y }, p0.t - 0.01);
      show(cur, p0.t - 0.3, 0.2);
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        tl.to(cur, { x: b.x, y: b.y, duration: Math.max(0.12, Math.min(0.5, b.t - a.t - 0.05)), ease: "power3.inOut" }, Math.max(a.t, b.t - 0.5));
      }
      points.forEach((p) => { if (p.click) { tl.to(cur, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1 }, p.t); K.sfx("click", p.t, 0.35); } });
      tl.to(cur, { opacity: 0, duration: 0.25 }, opt.until || points[points.length - 1].t + 0.6);
      return cur;
    };

    /** onda de áudio do vídeo bruto com marcas (erro/respiração/falha) que são CORTADAS fechando os buracos */
    K.waveCut = (t, marks, opt = {}) => {
      const b = Object.assign({ x: 90, y: 330, w: 900, h: 470 }, opt.box);
      const g = mk("#ui", "k panel", "", { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
      mk(g, "", `${icon("film").replace("<svg", '<svg style="width:26px;height:26px;stroke:var(--lav);fill:none;stroke-width:2;vertical-align:-5px;margin-right:10px"')}${esc(opt.title || "video-bruto.mp4")}`, { position: "absolute", left: "28px", top: "24px", font: "700 26px/1 var(--fS)" });
      const meta = mk(g, "", esc(opt.meta || "00:52 · sem edição"), { position: "absolute", right: "28px", top: "28px", font: "500 20px/1 var(--fM)", color: "var(--muted)" });
      const thumbs = opt.thumbs || [];
      const strip = mk(g, "", "", { position: "absolute", left: "28px", right: "28px", top: "78px", height: "150px", display: "flex", gap: "6px", overflow: "hidden", borderRadius: "10px" });
      for (let i = 0; i < 9; i++) mk(strip, "", thumbs.length ? `<img src="${thumbs[i % thumbs.length]}" style="width:100%;height:100%;object-fit:cover;filter:saturate(.35) brightness(.9)">` : "", { flex: "1", background: "var(--thumb)", borderRadius: "6px", overflow: "hidden" });
      // onda em segmentos: [normal, marca, normal, marca, ...] — marca encolhe até 0 no corte
      const wave = mk(g, "", "", { position: "absolute", left: "28px", right: "28px", top: "252px", height: "150px", display: "flex", alignItems: "center", overflow: "hidden" });
      const bars = (n, seed, dim) => Array.from({ length: n }, (_, i) => { const h = 12 + Math.abs(Math.sin((i + seed) * 1.7) * Math.cos((i + seed) * 0.37)) * (dim ? 50 : 120); return `<i style="display:inline-block;width:5px;margin:0 2px;height:${h.toFixed(0)}px;border-radius:3px;background:${dim ? "rgba(255,255,255,.45)" : "var(--lav)"}"></i>`; }).join("");
      const sorted = marks.slice().sort((a, c) => a.at - c.at);
      let pos = 0; const segs = [];
      sorted.forEach((m, i) => {
        if (m.at > pos) mk(wave, "", bars(Math.round((m.at - pos) * 110), i * 13, false), { flex: `0 0 ${((m.at - pos) * 100).toFixed(2)}%`, overflow: "hidden", whiteSpace: "nowrap", textAlign: "center" });
        const s = mk(wave, "", bars(Math.round(m.w * 110), i * 7 + 3, true), { flex: `0 0 ${(m.w * 100).toFixed(2)}%`, overflow: "hidden", whiteSpace: "nowrap", position: "relative", textAlign: "center" });
        const hl = mk(s, "", "", { position: "absolute", inset: "0", background: "rgba(255,80,40,.28)", border: "2px solid rgba(255,110,60,.95)", borderRadius: "8px", opacity: "0" });
        const lab = mk(g, "k", `✕ ${esc(m.label)}`, { left: 28 + (m.at + m.w / 2) * (b.w - 56) - 90 + "px", width: "180px", textAlign: "center", top: "414px", font: "700 22px/1 var(--fS)", color: "#ff8a6a", textTransform: "uppercase" });
        fromTo(hl, { opacity: 0 }, { opacity: 1, duration: 0.2 }, m.t); fromTo(lab, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.2 }, m.t);
        K.sfx("tick", m.t, 0.3);
        segs.push({ s, lab });
        pos = m.at + m.w;
      });
      if (pos < 1) mk(wave, "", bars(Math.round((1 - pos) * 110), 99, false), { flex: "1 1 auto", overflow: "hidden", whiteSpace: "nowrap", textAlign: "center" });
      fromTo(g, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
      if (opt.cutAt) {
        segs.forEach(({ s, lab }, i) => { tl.to(s, { flexBasis: "0%", duration: 0.35, ease: "power3.inOut" }, opt.cutAt + i * 0.12); tl.to(lab, { opacity: 0, duration: 0.15 }, opt.cutAt + i * 0.12); K.sfx("click", opt.cutAt + i * 0.12, 0.35); });
        const done = mk(g, "k", `✂ ${esc(opt.cutLabel || `${marks.length} cortes · sem pausas`)}`, { left: "28px", top: "414px", font: "700 24px/1 var(--fS)", color: "var(--lav)" });
        show(done, opt.cutAt + 0.35 + marks.length * 0.12, 0.25);
        set(meta, { textContent: opt.metaAfter || "00:47 · editado" }, opt.cutAt + 0.5);
        tl.to(strip.querySelectorAll("img"), { filter: "saturate(1.1) brightness(1)", duration: 0.4 }, opt.cutAt + 0.3);
      }
      if (opt.until) K.out(g, opt.until);
      return g;
    };

    /** a dor da edição manual: timeline lotada nascendo, cursor frenético, contadores subindo (cortes/keyframes/legendas/horas) */
    K.manual = (t, d, opt = {}) => {
      const b = Object.assign({ x: 90, y: 330, w: 900, h: 1100 }, opt.box);
      const g = mk("#ui", "k panel", "", { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px", overflow: "hidden" });
      mk(g, "", `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#ff4a2a;margin-right:12px;box-shadow:0 0 12px #ff4a2a"></span>${esc(opt.title || "EDIÇÃO MANUAL")}`, { position: "absolute", left: "30px", top: "28px", font: "700 30px/1 var(--fS)", color: "#fff", textTransform: "uppercase" });
      const clk = mk(g, "", "0h00", { position: "absolute", right: "30px", top: "22px", font: "700 44px/1 var(--fM)", color: "#ff8a6a" });
      // contadores
      const stats = [["CORTES", opt.cuts || 312], ["KEYFRAMES", opt.keys || 1480], ["LEGENDAS", opt.caps || 230], ["EFEITOS", opt.fx || 96]];
      const nums = stats.map(([lab], i) => { const c = mk(g, "", `<div style="font:500 17px/1 var(--fM);color:var(--muted);letter-spacing:.14em">${lab}</div><b style="display:block;font:700 46px/1.1 var(--fS);margin-top:8px">0</b>`, { position: "absolute", left: 30 + i * 212 + "px", top: "100px", width: "200px" }); return c.querySelector("b"); });
      // trilhas
      const tracks = ["V3", "V2", "V1", "TXT", "FX", "A1", "A2"], top0 = 230, th = Math.min(92, Math.floor((b.h - top0 - 30) / tracks.length) - 10);
      tracks.forEach((n, i) => mk(g, "", esc(n), { position: "absolute", left: "30px", top: top0 + i * (th + 10) + 34 + "px", font: "600 18px/1 var(--fM)", color: "var(--muted)" }));
      const area = mk(g, "", "", { position: "absolute", left: "90px", right: "24px", top: top0 + "px", height: tracks.length * (th + 10) + "px" });
      const W2 = b.w - 114, N = opt.clips || 70;
      const clips = [];
      for (let k = 0; k < N; k++) {
        const r = k % tracks.length, x = ((k * 97) % 100) / 100 * (W2 - 60), w = 26 + ((k * 53) % 90);
        const hue = r === 3 ? "rgba(var(--hiRGB),.85)" : r >= 5 ? "rgba(90,200,140,.75)" : r === 4 ? "rgba(255,90,60,.8)" : "rgba(var(--accRGB),.8)";
        clips.push(mk(area, "", "", { position: "absolute", left: x.toFixed(0) + "px", top: r * (th + 10) + 8 + "px", width: w + "px", height: th - 16 + "px", borderRadius: "6px", background: hue, opacity: "0", border: "1px solid rgba(255,255,255,.25)" }));
      }
      const ph = mk(area, "playhead", "", { left: "0", top: "-6px", height: tracks.length * (th + 10) + 12 + "px" });
      fromTo(g, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, t);
      clips.forEach((c, k) => set(c, { opacity: 1 }, t + 0.2 + (k / N) * (d - 0.5)));
      tl.fromTo(ph, { x: 0 }, { x: W2 - 10, duration: d - 0.3, ease: "none", immediateRender: false }, t + 0.2);
      const p = { v: 0 };
      tl.fromTo(p, { v: 0 }, { v: 1, duration: d - 0.3, ease: "power1.in", immediateRender: false, onUpdate() {
        stats.forEach(([, max], i) => { nums[i].textContent = Math.round(p.v * max).toLocaleString("pt-BR"); });
        const h = p.v * (opt.hours || 8); clk.textContent = `${Math.floor(h)}h${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`; } }, t + 0.2);
      // cursor frenético
      const pts = []; for (let k = 0; k < 9; k++) pts.push({ x: b.x + 120 + ((k * 211) % (b.w - 220)), y: b.y + top0 + 30 + ((k * 137) % 600), t: t + 0.3 + k * ((d - 0.6) / 9), click: true });
      K.cursor(pts, { until: t + d - 0.1 });
      if (opt.until) K.out(g, opt.until);
      return g;
    };

    /** comparação de tempo: [{label:'Edição manual', value:'8 horas', frac:1, bad:true}, {label:'Com IA', value:'10 min', frac:.06}] */
    K.compare = (rows, t, opt = {}) => {
      const b = Object.assign({ x: 90, y: 360, w: 900 }, opt.box);
      const g = mk("#ui", "k panel", "", { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: 80 + rows.length * 150 + "px" });
      if (opt.title) mk(g, "kicker", esc(opt.title), { position: "absolute", left: "34px", top: "30px", color: "var(--lavT)" });
      fromTo(g, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, t);
      rows.forEach((r, i) => {
        const y = 80 + i * 150, ti = r.t != null ? r.t : t + 0.25 + i * 0.5;
        mk(g, "", esc(r.label), { position: "absolute", left: "34px", top: y + "px", font: "700 32px/1 var(--fS)" });
        const val = mk(g, "", esc(r.value), { position: "absolute", right: "34px", top: y - 4 + "px", font: "700 40px/1 var(--fS)", color: r.bad ? "#ff8a6a" : "var(--lav)", opacity: "0" });
        const track = mk(g, "", "", { position: "absolute", left: "34px", right: "34px", top: y + 52 + "px", height: "34px", borderRadius: "17px", background: "rgba(255,255,255,.07)" });
        const bar = mk(track, "", "", { height: "100%", width: "0%", borderRadius: "17px", background: r.bad ? "linear-gradient(90deg,#7a2a1a,#ff5a3a)" : "linear-gradient(90deg,var(--btnA),var(--btnB))", boxShadow: r.bad ? "none" : "var(--glow)" });
        tl.fromTo(bar, { width: "0%" }, { width: (Math.max(0.03, r.frac) * 100).toFixed(1) + "%", duration: r.bad ? 0.9 : 0.35, ease: r.bad ? "power1.inOut" : "back.out(2)", immediateRender: false }, ti);
        fromTo(val, { opacity: 0 }, { opacity: 1, duration: 0.2 }, ti + (r.bad ? 0.7 : 0.25));
        K.sfx(r.bad ? "riser" : "ding", ti, r.bad ? 0.2 : 0.3);
      });
      if (opt.until) K.out(g, opt.until);
      return g;
    };

    /** painel de personalização: fonte, cor, posição da legenda — a IA clica e a prévia muda */
    K.stylePanel = (t, opt = {}) => {
      const b = Object.assign({ x: 90, y: 330, w: 900, h: 600 }, opt.box);
      const g = mk("#ui", "k panel", "", { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
      mk(g, "kicker", esc(opt.title || "Personalização"), { position: "absolute", left: "34px", top: "30px", color: "var(--lavT)" });
      const row = (y, label) => { mk(g, "", esc(label), { position: "absolute", left: "34px", top: y + "px", font: "500 18px/1 var(--fM)", color: "var(--muted)", letterSpacing: ".14em" }); };
      const chip = (x, y, html, w = 150) => mk(g, "", html, { position: "absolute", left: x + "px", top: y + "px", width: w + "px", height: "64px", borderRadius: "14px", border: "2px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 24px/1 var(--fS)" });
      const sel = (el, ti) => { tl.to(el, { borderColor: "rgba(var(--accRGB),1)", background: "rgba(var(--accRGB),.22)", boxShadow: "0 0 22px rgba(var(--accRGB),.6)", duration: 0.15 }, ti); };
      row(96, "FONTE");
      const fonts = (opt.fonts || [["Inter", "Inter,sans-serif"], ["Advercase", "Advercase"], ["Serifa", "Georgia,serif"]]).map(([n, f], i) => chip(34 + i * 170, 126, `<span style="font-family:${f}">${esc(n)}</span>`));
      row(226, "COR");
      const colors = (opt.colors || ["#8b5cf6", "#2f80ff", "#ff761a", "#22c55e"]).map((c, i) => chip(34 + i * 100, 256, `<i style="width:34px;height:34px;border-radius:50%;background:${c};display:block"></i>`, 80));
      row(356, "LEGENDA");
      const caps = (opt.caps || ["Rodapé", "Pescoço", "Meio"]).map((n, i) => chip(34 + i * 170, 386, esc(n)));
      // prévia
      const pv = mk(g, "", "", { position: "absolute", right: "34px", top: "96px", width: "260px", height: "462px", borderRadius: "18px", overflow: "hidden", background: "var(--thumb)", border: "2px solid rgba(var(--hiRGB),.35)" });
      if (opt.preview) mk(pv, "", `<img src="${opt.preview}" style="width:100%;height:100%;object-fit:cover">`, { position: "absolute", inset: "0" });
      const pc = mk(pv, "", esc(opt.sample || "SEU ESTILO"), { position: "absolute", left: "0", right: "0", top: "380px", textAlign: "center", font: "700 30px/1 Inter,sans-serif", color: "#fff", textShadow: "0 2px 10px #000" });
      fromTo(g, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, t);
      const tF = opt.tFont || t + 0.8, tC = opt.tColor || t + 1.6, tP = opt.tCap || t + 2.4;
      const fi = opt.fontIndex ?? 1, ci = opt.colorIndex ?? 2, pi = opt.capIndex ?? 1;
      sel(fonts[fi], tF); set(pc, { fontFamily: "Advercase" }, tF);
      sel(colors[ci], tC); set(pc, { color: (opt.colors || ["#8b5cf6", "#2f80ff", "#ff761a", "#22c55e"])[ci] }, tC);
      sel(caps[pi], tP); tl.to(pc, { top: 250, duration: 0.3, ease: "power2.out" }, tP);
      const P = (el) => ({ x: b.x + parseFloat(el.style.left) + parseFloat(el.style.width) / 2 - 6, y: b.y + parseFloat(el.style.top) + 30 });
      K.cursor([{ ...P(fonts[0]), t: t + 0.3 }, { ...P(fonts[fi]), t: tF, click: true }, { ...P(colors[ci]), t: tC, click: true }, { ...P(caps[pi]), t: tP, click: true }], { until: opt.until || tP + 0.8 });
      if (opt.until) K.out(g, opt.until);
      return g;
    };

    /** fluxo em passos (enviar → IA edita → baixar → postar), cada passo acende na palavra; progress opcional */
    K.flow = (steps, opt = {}) => {
      const b = Object.assign({ x: 90, y: 360, w: 900, h: 300 }, opt.box);
      const n = steps.length, gap = 26, bw = (b.w - gap * (n - 1)) / n;
      const out = steps.map((s, i) => {
        const e = mk("#ui", "k panel", `<div style="width:76px;height:76px;margin:34px auto 18px;border-radius:18px;background:linear-gradient(135deg,var(--btnA),var(--btnB));display:flex;align-items:center;justify-content:center;box-shadow:var(--glow)">${icon(s.icon || "spark").replace("<svg", '<svg style="width:40px;height:40px;stroke:#fff;fill:none;stroke-width:2.2"')}</div><div style="text-align:center;font:700 28px/1.1 var(--fS);text-transform:uppercase">${esc(s.label)}</div>${s.sub ? `<div style="text-align:center;font:500 20px/1.2 var(--fS);color:var(--muted);margin-top:8px">${esc(s.sub)}</div>` : ""}`,
          { left: b.x + i * (bw + gap) + "px", top: b.y + "px", width: bw + "px", height: b.h + "px" });
        fromTo(e, { opacity: 0, y: 30, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.5)" }, s.t);
        K.sfx("pop", s.t, 0.3);
        if (s.progress) {
          const tr = mk(e, "", "", { position: "absolute", left: "20px", right: "20px", bottom: "26px", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,.1)" });
          const br = mk(tr, "", "", { height: "100%", width: "0%", borderRadius: "4px", background: "linear-gradient(90deg,var(--btnA),var(--btnB))", boxShadow: "var(--glow)" });
          tl.fromTo(br, { width: "0%" }, { width: "100%", duration: s.progress, ease: "power1.inOut", immediateRender: false }, s.t + 0.2);
        }
        if (i < n - 1) { const ar = mk("#ui", "k", icon("arrowR").replace("<svg", '<svg style="width:26px;height:26px;stroke:var(--lav);fill:none;stroke-width:2.6"'), { left: b.x + (i + 1) * (bw + gap) - gap / 2 - 13 + "px", top: b.y + b.h / 2 - 13 + "px" }); show(ar, steps[i + 1].t - 0.1, 0.2); if (opt.until) K.out(ar, opt.until); }
        if (opt.until) K.out(e, opt.until);
        return e;
      });
      return out;
    };

    /** comentário estilo Instagram digitando ("comenta EU QUERO") */
    K.comment = (spec, t, opt = {}) => {
      const b = Object.assign({ x: 90, y: 400, w: 900 }, opt.box);
      const g = mk("#ui", "k panel", `<div style="position:absolute;left:28px;top:28px;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--btnA),var(--btnB))"></div><div style="position:absolute;left:112px;top:30px;font:700 26px/1 var(--fS)">${esc(spec.user || "@voce")} <span style="font:500 20px/1 var(--fS);color:var(--muted)">agora</span></div><div class="tx" style="position:absolute;left:112px;top:70px;font:700 34px/1.2 var(--fS)"></div><div style="position:absolute;right:30px;top:44px;font:400 34px/1 var(--fS);color:#ff5a6a">♥</div>`,
        { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: "140px" });
      fromTo(g, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, t);
      typeInto(g.querySelector(".tx"), spec.text, t + 0.25, opt.cps || 14);
      if (opt.until) K.out(g, opt.until);
      return g;
    };

    /** barra de render/progresso ("renderizando 9:16 · 1080p") */
    K.progress = (label, t, d, opt = {}) => {
      const b = Object.assign({ x: 90, y: 360, w: 900 }, opt.box);
      K.occupy(t, opt.until || t + d + 1, b.y);
      const g = mk("#ui", "k panel", `<div style="position:absolute;left:30px;top:28px;font:700 26px/1 var(--fS)">${esc(label)}</div><div class="pc" style="position:absolute;right:30px;top:26px;font:700 28px/1 var(--fM);color:var(--lav)">0%</div>`, { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: "130px" });
      const tr = mk(g, "", "", { position: "absolute", left: "30px", right: "30px", top: "80px", height: "12px", borderRadius: "6px", background: "rgba(255,255,255,.1)" });
      const br = mk(tr, "", "", { height: "100%", width: "0%", borderRadius: "6px", background: "linear-gradient(90deg,var(--btnA),var(--btnB))", boxShadow: "var(--glow)" });
      const pc = g.querySelector(".pc");
      fromTo(g, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, t);
      const p = { v: 0 };
      tl.fromTo(p, { v: 0 }, { v: 100, duration: d, ease: "power1.inOut", immediateRender: false, onUpdate() { br.style.width = p.v.toFixed(1) + "%"; pc.textContent = Math.round(p.v) + "%"; } }, t + 0.2);
      K.sfx("ding", t + 0.2 + d, 0.3);
      if (opt.until) K.out(g, opt.until);
      return g;
    };

    // ============================================================ ABERTURA EM 3D: as camadas do vídeo se separam e a frase aparece legível
    /** explode(t0, t1, {lines:["FOI EDITADO POR","INTELIGÊNCIA","ARTIFICIAL"], phrase:"foi editado por inteligência artificial"})
     *  Gira o quadro em 3D e afasta as camadas: 01 vídeo (fundo) · 02 texto (o que ele fala, legível) · 03 recorte dele (frente). */
    K.explode = (t0, t1, opt = {}) => {
      const d = opt.d || 0.6, lines = opt.lines || ["TEXTO"];
      const plate = mk("#behind", "k", "", { left: "70px", top: (opt.top || 470) + "px", width: "940px", padding: "34px 30px", borderRadius: "28px", textAlign: "center",
        background: "rgba(var(--panel2RGB),.8)", border: "2px solid rgba(var(--hiRGB),.55)", boxShadow: "0 0 50px rgba(var(--accRGB),.45)" });
      const spans = [];
      lines.forEach((ln) => {
        const L = mk(plate, "", "", { font: `700 ${opt.size || 112}px/1.02 var(--fS)`, textTransform: "uppercase", color: "#fff", textShadow: "0 0 26px rgba(var(--accRGB),.7)" });
        ln.split(/\s+/).forEach((w, j) => { const sp = document.createElement("span"); sp.className = "w"; sp.textContent = (j ? " " : "") + w; L.appendChild(sp); spans.push(sp); });
      });
      const times = opt.phrase ? K.wt(opt.phrase) : null;
      spans.forEach((sp, i) => fromTo(sp, { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.25, ease: "power2.out" }, times && times[i] != null ? times[i] : t0 + 0.3 + i * 0.15));
      const tg = opt.tags || ["01 · VÍDEO BRUTO", "02 · TEXTO", "03 · RECORTE"];
      const tags = [["#layCam", tg[0]], ["#layText", tg[1]], ["#layMatte", tg[2]]]
        .map(([sel, txt], i) => mk(sel, "k", `<span style="display:inline-block;font:700 30px/1 var(--fM);padding:12px 18px;border-radius:8px;background:linear-gradient(90deg,var(--btnA),var(--btnB));color:#fff">${esc(txt)}</span>`, { left: (i === 0 ? 170 : 40) + "px", top: (i === 0 ? 150 : i === 2 ? 1180 : 40) + "px", zIndex: "5" }));
      set(plate, { opacity: 1 }, t0);
      set("#frame", { overflow: "visible", transformStyle: "preserve-3d", backgroundColor: "rgba(0,0,0,0)" }, t0);
      set(".layer", { transformStyle: "preserve-3d" }, t0);
      tl.to(["#tint", "#tint2"], { opacity: 0, duration: 0.3 }, t0);
      const ry = opt.ry ?? 28, depth = opt.depth || 300;
      tl.to("#rigInner", { rotationY: ry, rotationX: opt.rx ?? 14, scale: opt.scale ?? 0.5, x: opt.x ?? 0, y: opt.y ?? -70, duration: d, ease: "power3.inOut" }, t0);
      tl.to("#layCam", { z: -depth, x: -300, y: -400, duration: d, ease: "power3.inOut" }, t0);
      tl.to("#layMatte", { z: depth, x: 300, y: 560, duration: d, ease: "power3.inOut" }, t0);
      tl.to(".lborder", { opacity: 1, duration: 0.3 }, t0 + d * 0.5);
      show(tags, t0 + d * 0.6, 0.25);
      tl.to("#rigInner", { rotationY: ry - 10, duration: Math.max(0.2, t1 - t0 - d), ease: "sine.inOut" }, t0 + d);
      tl.to("#rigInner", { rotationY: 0, rotationX: 0, scale: 1, x: 0, y: 0, duration: d, ease: "power3.inOut" }, t1);
      tl.to(["#layCam", "#layMatte"], { z: 0, x: 0, y: 0, duration: d, ease: "power3.inOut" }, t1);
      tl.to(".lborder", { opacity: 0, duration: 0.25 }, t1);
      K.out(tags, t1, 0.2); K.out(plate, t1 + d * 0.4, 0.25);
      tl.to("#tint", { opacity: C.tint, duration: 0.3 }, t1 + d * 0.5); tl.to("#tint2", { opacity: C.tint2, duration: 0.3 }, t1 + d * 0.5);
      set("#frame", { overflow: "hidden", transformStyle: "flat", backgroundColor: "#000" }, t1 + d + 0.01);
      set(".layer", { transformStyle: "flat" }, t1 + d + 0.01);
      K.sfx("whoosh", t0 - 0.1, 0.35); K.sfx("whoosh", t1 - 0.05, 0.3);
      K.hideMouth(t0, t1 + d);
      return plate;
    };

    // ============================================================ ANTES DA PERSONALIZAÇÃO × DEPOIS (substitui as "camadas")
    /** versus({img, label, cap}, {img, label, cap, t}, t, {box}) — padrão genérico (cinza, legenda Arial) × o estilo dele */
    K.versus = (L, R, t, opt = {}) => {
      const b = Object.assign({ x: 90, y: C.topY, w: 900, h: 560 }, opt.box);
      const cw = (b.w - 40) / 2;
      const card = (side, x, good) => {
        const e = mk("#ui", "k", "", { left: x + "px", top: b.y + 64 + "px", width: cw + "px", height: b.h - 64 + "px", borderRadius: "22px", overflow: "hidden",
          border: good ? "3px solid rgba(var(--accRGB),.95)" : "2px solid rgba(255,255,255,.18)", boxShadow: good ? "0 0 40px rgba(var(--accRGB),.55)" : "0 16px 40px rgba(0,0,0,.5)", background: "var(--thumb)" });
        mk(e, "", side.img ? `<img src="${side.img}" style="width:100%;height:100%;object-fit:cover;${good ? "" : "filter:grayscale(1) brightness(.85) contrast(.9)"}">` : "", { position: "absolute", inset: "0" });
        mk(e, "", esc(side.cap || ""), good
          ? { position: "absolute", left: "0", right: "0", top: "58%", textAlign: "center", font: "700 46px/1 var(--fS)", color: "var(--lav)", textTransform: "uppercase", textShadow: "0 0 18px rgba(var(--accRGB),.8),0 3px 10px #000" }
          : { position: "absolute", left: "0", right: "0", bottom: "34px", textAlign: "center", font: "400 26px/1.2 Arial,sans-serif", color: "#fff", textShadow: "0 1px 3px #000" });
        const lab = mk("#ui", "k", `<span class="pill sm up ${good ? "" : "dark"} noicon" style="height:46px;font-size:20px">${esc(side.label)}</span>`, { left: x + "px", top: b.y + "px", width: cw + "px", textAlign: "center" });
        return [e, lab];
      };
      const [l1, l2] = card(L, b.x, false), [r1, r2] = card(R, b.x + cw + 40, true);
      fromTo([l1, l2], { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }, t);
      const tr = R.t || t + 0.8;
      fromTo([r1, r2], { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" }, tr);
      tl.to(l1, { opacity: 0.55, duration: 0.3 }, tr);
      K.sfx("pop", t, 0.3); K.sfx("shimmer", tr, 0.3);
      if (opt.until) K.out([l1, l2, r1, r2], opt.until);
      return [l1, r1];
    };

    // ============================================================ LEGENDA QUE SEGUE A BOCA (face-track.json)
    const mouthHide = [];
    const OCC = [];
    K.occupy = (a, b, top) => { if (top > 900) OCC.push({ a, b, top }); };
    K.hideMouth = (a, b) => mouthHide.push([a, b]);
    /** mapeia um ponto do vídeo-fonte (px) para a tela, considerando moldura, object-fit, zoom e deslocamento atuais */
    K.srcToCanvas = (sx, sy) => {
      const base = $("#vsl").getBoundingClientRect(), k = base.width / W || 1;
      const fr = $("#frame").getBoundingClientRect();
      const fw = fr.width / k, fh = fr.height / k, fx = (fr.left - base.left) / k, fy = (fr.top - base.top) / k;
      const op = String($("#cam").style.objectPosition || C.fullPos).split(" ").map((v) => parseFloat(v) / 100);
      const c = Math.max(fw / W, fh / H), ox = (fw - W * c) * (op[0] ?? 0.5), oy = (fh - H * c) * (op[1] ?? 0.5);
      const s = +gsap.getProperty("#lensCam", "scale") || 1, ty = +gsap.getProperty("#lensCam", "y") || 0;
      const fo = String(C.focus).split(" ").map((v) => parseFloat(v) / 100), Ox = fw * fo[0], Oy = fh * fo[1];
      return [fx + Ox + (ox + sx * c - Ox) * s, fy + Oy + (oy + sy * c - Oy) * s + ty, c * s, fw];
    };
    /**
     * Legenda em blocos de 1–3 palavras que ACOMPANHA A BOCA: fica logo abaixo do queixo e se move junto com a cabeça
     * (tracking de face-track.json); cada palavra entra com um pop na hora em que é falada. Só aparece com o rosto grande
     * (tela cheia); some sozinha em SPLIT/PIP/TAKEOVER e nos intervalos K.hideMouth(a,b).
     */
    K.mouthCaps = (opt = {}) => {
      if (!face || !face.rows || !face.rows.length) { console.warn("mouthCaps: sem assets/face-track.json"); return; }
      const R = face.rows, fps = face.fps || 30, max = opt.max || 18, gapMax = opt.gap || 0.32;
      const acc = new Set((opt.accent || []).map(norm));
      const ws = words.filter((w) => w.text && w.text.trim());
      const chunks = []; let cur = null;
      ws.forEach((w) => {
        const txt = w.text.replace(/[.,;:!?]+$/, "");
        if (cur && (w.start - cur.end > gapMax || (cur.text + " " + txt).length > max || cur.n >= 3)) { chunks.push(cur); cur = null; }
        if (!cur) cur = { text: txt, words: [{ text: txt, t: w.start }], start: w.start, end: w.end, n: 1 };
        else { cur.text += " " + txt; cur.words.push({ text: txt, t: w.start }); cur.end = w.end; cur.n++; }
        if (/[.!?;:,]$/.test(w.text)) { chunks.push(cur); cur = null; }
      });
      if (cur) chunks.push(cur);
      const holder = mk("#cap", "", "", { position: "absolute", left: "0", top: "0", opacity: "0" });
      chunks.forEach((ch, i) => {
        const next = chunks[i + 1] ? chunks[i + 1].start : ch.end + 0.6;
        const el = mk(holder, "mcap k", "", { transform: "translateX(-50%)" });
        let best = -1, bl = 5;
        ch.words.forEach((w, j) => { const nn = norm(w.text); if (acc.has(nn) || (opt.autoAccent !== false && nn.length > bl)) { best = j; bl = nn.length; } });
        ch.words.forEach((w, j) => {
          const sp = document.createElement("span"); sp.className = "w" + (j === best || acc.has(norm(w.text)) ? " acc" : ""); sp.textContent = w.text; el.appendChild(sp);
          fromTo(sp, { opacity: 0, y: 18, scale: 0.6, filter: "blur(6px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.2, ease: "back.out(2)" }, w.t);
        });
        set(el, { opacity: 1 }, ch.start);
        set(el, { opacity: 0 }, Math.min(next, ch.end + 0.5));
      });
      const off = opt.below ?? 40, sf = C.safe;
      // roda DEPOIS de todos os tweens do quadro (callback do próprio timeline), para ler o enquadramento já atualizado
      const prev = tl.eventCallback("onUpdate");
      tl.eventCallback("onUpdate", function () { if (prev) prev.apply(this, arguments); follow(tl.time()); });
      function follow(t) {
        const hid = mouthHide.some(([a, b]) => t >= a && t < b);
        const r = R[Math.min(R.length - 1, Math.max(0, Math.round(t * fps)))];
        const [x, y, , fw] = K.srcToCanvas(r[1], r[4]);
        if (hid || fw < W * 0.95) { holder.style.opacity = "0"; return; }
        const cx = Math.max(sf.left + 260, Math.min(sf.colX - 260, x)), cy = Math.max(sf.top + 120, Math.min(sf.bottom - 90, y + off));
        const occ = OCC.filter((o) => t >= o.a && t < o.b).reduce((m, o) => Math.min(m, o.top), 1e9);
        const cy2 = Math.min(cy, occ - 92);
        holder.style.opacity = "1";
        holder.style.transform = `translate(${cx.toFixed(1)}px,${cy2.toFixed(1)}px)`;
      }
      return holder;
    };

    // ============================================================ PAINEL LIVRE (esquemas desenhados em HTML/SVG)
    /**
     * panel(html, t, {box:{x,y,w,h}, title, steps:[{sel, t, anim:'pop'|'fade'|'slide'|'draw'|'strike', d, label, sfx}], until})
     * Card de vidro com o SEU HTML/SVG dentro. Cada step revela os filhos que casam com `sel` na palavra `t`
     * ('draw' desenha um <path>/<circle>/<line> SVG; 'strike' cresce um risco da esquerda para a direita).
     * Use para ilustrar exatamente o que está sendo dito (pinta no rosto, vírus × bactéria, FGTS, arroz…).
     */
    K.panel = (html, t, opt = {}) => {
      const b = Object.assign({ x: 90, y: 360, w: 900, h: 520 }, opt.box);
      const g = mk("#ui", "k panel", html, { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px", overflow: "hidden" });
      if (opt.title) mk(g, "kicker", esc(opt.title), { position: "absolute", left: "34px", top: "28px", color: "var(--lavT)" });
      K.occupy(t, opt.until || t + 4, b.y);
      fromTo(g, { opacity: 0, y: 24, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, t);
      K.sfx("whoosh", t, 0.22);
      (opt.steps || []).forEach((s) => {
        const els = Array.from(g.querySelectorAll(s.sel));
        if (!els.length || s.t == null) return;
        const a = s.anim || "pop", d = s.d;
        if (a === "draw") {
          els.forEach((el) => {
            const L = el.getTotalLength ? Math.ceil(el.getTotalLength()) : 800;
            el.style.strokeDasharray = L; el.style.strokeDashoffset = L;
            tl.fromTo(el, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: d || 0.5, ease: "power2.inOut", immediateRender: false }, s.t);
          });
        } else if (a === "strike") {
          els.forEach((el) => { el.style.transformOrigin = "0% 50%"; el.style.transform = "scaleX(0)"; });
          tl.fromTo(els, { scaleX: 0 }, { scaleX: 1, duration: d || 0.25, ease: "power3.out", immediateRender: false }, s.t);
        } else {
          els.forEach((el) => (el.style.opacity = "0"));
          if (a === "fade") fromTo(els, { opacity: 0 }, { opacity: 1, duration: d || 0.3, ease: "power2.out", stagger: 0.06 }, s.t);
          else if (a === "slide") fromTo(els, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: d || 0.35, ease: "power3.out", stagger: 0.08 }, s.t);
          else fromTo(els, { opacity: 0, scale: 0.7, filter: "blur(6px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: d || 0.32, ease: "back.out(1.6)", stagger: 0.08 }, s.t);
        }
        if (s.sfx !== false) K.sfx(s.sfx || (a === "draw" ? "swoosh" : a === "strike" ? "stamp" : "pop"), s.t, 0.22);
        if (s.label) K.ev("MOTION", s.label, s.t);
      });
      if (opt.until) K.out(g, opt.until);
      return g;
    };

    // ------------------------------------------------------------ registro automático de edições (alimenta K.live)
    const EV = [];
    K.ev = (track, label, t, d = 0.6) => { if (t != null && isFinite(t)) EV.push({ track, label, t, d }); };
    const short = (s, n = 22) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
    const AUTO = {
      cap: [(a) => a[1], "TEXTO", (a) => `legenda “${short(a[0].hl || a[0].big || a[0].acc || a[0].l1)}”`],
      pill: [(a) => a[1], "TEXTO", (a) => `pílula “${short(a[0])}”`],
      behindTitle: [(a) => a[1], "MOTION", (a) => `título atrás da cabeça`],
      stack: [(a) => a[0][0].t, "TEXTO", () => "lettering animado"],
      faceHud: [(a) => a[0], "MOTION", () => "HUD no rosto"],
      layout: [(a) => a[1], "VÍDEO", (a) => ({ full: "tela cheia", split: "moldura + cards", pip: "apresentador no canto", splitS: "moldura", card916: "formato 9:16", card11: "formato 1:1", card169: "formato 16:9" }[a[0]] || "reenquadrar")],
      punch: [(a) => a[0], "VÍDEO", (a) => `zoom ${(a[1] || C.punch).toFixed(2).replace(".", ",")}×`],
      glitch: [(a) => a[0], "VÍDEO", () => "transição glitch"], flash: [(a) => a[0], "VÍDEO", () => "flash"], leak: [(a) => a[0], "VÍDEO", () => "light leak"],
      marquee: [(a) => a[1], "MOTION", () => "letreiro em movimento"], orbit: [(a) => a[1], "MOTION", () => "cards 3D em órbita"],
      grid: [(a) => a[0][0].t, "MOTION", () => "cards"], row3d: [(a) => a[1], "MOTION", () => "cards 3D"], fan: [(a) => a[1], "MOTION", () => "cards em leque"],
      stamp: [(a) => a[1], "MOTION", (a) => `carimbo “${short(a[0])}”`], notes: [(a) => a[0][0].t, "TEXTO", () => "notas"],
      layers3d: [(a) => a[1], "MOTION", () => "camadas 3D"], wall: [(a) => a[2], "MOTION", () => "mural de vídeos"],
      beforeAfter: [(a) => a[0], "VÍDEO", () => "correção de cor"], prompt: [(a) => a[1], "MOTION", () => "prompt animado"],
      dm: [(a) => a[1], "MOTION", () => "mockup do direct"], terminal: [(a) => a[1], "MOTION", () => "terminal"], files: [(a) => a[1], "MOTION", () => "pasta de arquivos"],
      ring: [(a) => a[2], "MOTION", () => "anel"], price: [(a) => a[1], "MOTION", () => "card de preço"], cta: [(a) => a[1], "MOTION", () => "botão CTA"],
      logo: [(a) => a[1], "MOTION", () => "revelação do logo"], topTitle: [(a) => a[1], "TEXTO", (a) => `título “${short(a[0].text)}”`],
      section: [(a) => a[1], "TEXTO", (a) => `título “${short(a[0].title)}”`], kickerTop: [(a) => a[1], "TEXTO", () => "kicker"],
      category: [(a) => a[1], "TEXTO", (a) => `categoria “${short(a[0])}”`], chain: [(a) => a[0][0].t, "TEXTO", () => "sequência de pílulas"],
      waveCut: [(a) => a[0], "ÁUDIO", () => "análise do áudio"], manual: [(a) => a[0], "MOTION", () => "timeline manual"], compare: [(a) => a[1], "MOTION", () => "comparação de tempo"],
      stylePanel: [(a) => a[0], "MOTION", () => "painel de estilo"], flow: [(a) => a[0][0].t, "MOTION", () => "fluxo"], comment: [(a) => a[1], "MOTION", () => "comentário"],
      progress: [(a) => a[1], "MOTION", () => "render"], dashbox: [(a) => a[1], "MOTION", () => "quadro"],
      explode: [(a) => a[0], "MOTION", () => "camadas separadas em 3D"], versus: [(a) => a[2], "MOTION", () => "antes × depois do estilo"],
      panel: [(a) => a[1], "MOTION", (a) => (a[2] && a[2].title ? `esquema “${short(a[2].title)}”` : "esquema")],
    };
    Object.entries(AUTO).forEach(([name, [tf, track, lf]]) => {
      const fn = K[name];
      K[name] = function (...args) { try { K.ev(track, lf(args), tf(args)); } catch (e) { /* sem tempo → sem registro */ } return fn.apply(K, args); };
    });
    const sfx0 = K.sfx;
    K.sfx = (name, t, vol) => { if (name !== "type" && name !== "tick") K.ev("SFX", name, t, 0.25); return sfx0(name, t, vol); };

    /**
     * BARRA "IA EDITANDO" fixa no topo — chame POR ÚLTIMO no beats.js: K.live(t0, t1, {hide:[[a,b]]}).
     * Mostra timecode, contador de edições, 4 trilhas (VÍDEO/TEXTO/MOTION/ÁUDIO) com cada edição nascendo no
     * playhead no instante em que acontece, e um aviso "+ legenda “…”" com a última edição.
     */
    K.live = (t0, t1, opt = {}) => {
      const y = opt.y || C.safe.top + 2, x = 90, w = 900, h = 124, pps = opt.pps || 60;
      const g = mk("#fx", "k panel", "", { left: x + "px", top: y + "px", width: w + "px", height: h + "px", overflow: "hidden", zIndex: "20", background: "linear-gradient(180deg,rgba(var(--panelRGB),.86),rgba(var(--panel2RGB),.9))" });
      const dot = mk(g, "", "", { position: "absolute", left: "22px", top: "26px", width: "14px", height: "14px", borderRadius: "50%", background: "var(--acc)", boxShadow: "0 0 12px var(--acc)" });
      mk(g, "", esc(opt.label || "IA EDITANDO"), { position: "absolute", left: "46px", top: "22px", font: "700 22px/1 var(--fS)", letterSpacing: ".06em" });
      const tc = mk(g, "", "00:00:00", { position: "absolute", left: "22px", top: "58px", font: "600 24px/1 var(--fM)", color: "var(--lavT)" });
      const cnt = mk(g, "", "0 edições", { position: "absolute", left: "22px", top: "92px", font: "500 17px/1 var(--fM)", color: "var(--muted)" });
      const TR = ["VÍDEO", "TEXTO", "MOTION", "ÁUDIO"], ax = 250, aw = w - ax - 16, rowH = 22, rowG = 6, ty = 12;
      TR.forEach((n, i) => mk(g, "", n, { position: "absolute", left: ax + "px", top: ty + i * (rowH + rowG) + 4 + "px", font: "600 12px/1 var(--fM)", color: "var(--dim)", letterSpacing: ".1em" }));
      const lane = mk(g, "", "", { position: "absolute", left: ax + 64 + "px", top: ty + "px", width: aw - 64 + "px", height: TR.length * (rowH + rowG) + "px", overflow: "hidden" });
      const phX = (aw - 64) * 0.72;
      const strip = mk(lane, "", "", { position: "absolute", left: "0", top: "0", width: "100000px", height: "100%" });
      // trilha de vídeo contínua + onda de áudio contínua (o "material")
      mk(strip, "", "", { position: "absolute", left: phX + t0 * pps + "px", top: "0", width: (t1 - t0) * pps + "px", height: rowH + "px", borderRadius: "5px", background: "repeating-linear-gradient(90deg,rgba(var(--hiRGB),.35) 0 46px,rgba(var(--hiRGB),.18) 46px 48px)" });
      mk(strip, "", "", { position: "absolute", left: phX + t0 * pps + "px", top: 3 * (rowH + rowG) + "px", width: (t1 - t0) * pps + "px", height: rowH + "px", borderRadius: "5px",
        background: "repeating-linear-gradient(90deg,rgba(120,220,160,.65) 0 3px,transparent 3px 6px)", WebkitMaskImage: "repeating-linear-gradient(90deg,#000 0 18px,rgba(0,0,0,.45) 18px 30px,#000 30px 52px)" });
      const evs = EV.filter((e) => e.t >= t0 - 0.01 && e.t <= t1).sort((a, b) => a.t - b.t);
      const row = { "VÍDEO": 0, "TEXTO": 1, "MOTION": 2, "ÁUDIO": 3, "SFX": 3 };
      evs.forEach((e) => {
        const r = row[e.track] ?? 2, cut = e.track === "VÍDEO", sfx = e.track === "SFX";
        const bw = sfx ? 6 : cut ? 4 : Math.max(18, Math.min(150, e.d * pps * 2));
        const blk = mk(strip, "", "", { position: "absolute", left: phX + e.t * pps + "px", top: r * (rowH + rowG) + (sfx ? 4 : 0) + "px", width: bw + "px", height: (sfx ? rowH - 8 : rowH) + "px", borderRadius: "4px", opacity: "0", transformOrigin: "0% 50%",
          background: cut ? "#fff" : sfx ? "rgba(255,255,255,.8)" : r === 1 ? "linear-gradient(90deg,var(--btnA),var(--btnB))" : "rgba(var(--accRGB),.85)", boxShadow: cut || sfx ? "none" : "0 0 10px rgba(var(--accRGB),.6)" });
        tl.fromTo(blk, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.18, ease: "power2.out", immediateRender: false }, e.t);
      });
      mk(lane, "playhead", "", { left: phX + "px", top: "-4px", height: TR.length * (rowH + rowG) + 8 + "px", width: "2px" });
      tl.fromTo(strip, { x: -t0 * pps }, { x: -t1 * pps, duration: t1 - t0, ease: "none", immediateRender: false }, t0);
      const p = { v: t0 };
      let lastN = -1;
      tl.fromTo(p, { v: t0 }, { v: t1, duration: t1 - t0, ease: "none", immediateRender: false, onUpdate() {
        const s = p.v, f = Math.floor((s % 1) * 30);
        tc.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
        let n = 0; while (n < evs.length && evs[n].t <= s) n++;
        const vis = evs.slice(0, n).filter((e) => e.track !== "SFX").length;
        if (n !== lastN) { cnt.textContent = `${vis} edições`; lastN = n; }
      } }, t0);
      // aviso da última edição, logo abaixo da barra
      const toast = mk("#fx", "k", "", { left: x + "px", top: y + h + 14 + "px", width: w - 24 + "px", textAlign: "right", font: "700 24px/1 var(--fS)", color: "var(--lav)", zIndex: "20", textShadow: "0 2px 12px rgba(0,0,0,.6)" });
      evs.filter((e) => e.track !== "SFX").forEach((e, i, arr) => {
        const next = arr[i + 1] ? arr[i + 1].t : e.t + 1.4;
        if (next - e.t < 0.25) return;
        set(toast, { textContent: "+ " + e.label }, e.t);
        tl.fromTo(toast, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.18, ease: "power2.out", immediateRender: false }, e.t);
        tl.to(toast, { opacity: 0, duration: 0.2 }, Math.min(next, e.t + 1.4) - 0.2);
      });
      const n = Math.floor((t1 - t0) / 0.6);
      for (let i = 0; i < n; i++) set(dot, { opacity: i % 2 ? 1 : 0.25 }, t0 + i * 0.6);
      fromTo(g, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t0);
      (opt.hide || []).forEach(([a, b2]) => { tl.to([g, toast], { opacity: 0, duration: 0.2 }, a); tl.to(g, { opacity: 1, duration: 0.25 }, b2); });
      tl.to([g, toast], { opacity: 0, duration: 0.3 }, t1 - 0.3);
      return g;
    };

    return K;
  }

  window.VSL = { init };
})();
