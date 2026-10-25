// Edit Review: watch the cut, drop notes at timestamps, keep an edits list, follow the transcript.
// Saved to video-projects/<slug>/review.json (+ REVIEW.md) through /api/review. Local draft in localStorage meanwhile.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ts = (t, d = 1) => { t = Math.max(0, +t || 0); const m = Math.floor(t / 60), s = (t % 60).toFixed(d); return `${m}:${(+s < 10 ? "0" : "") + s}`; };
const uid = () => Math.random().toString(36).slice(2, 9);

const R = { project: null, clip: null, notes: [], edits: [], transcript: null, edl: [], clips: [], dirty: false, tab: "notes" };
const video = $("#video");
const LS = (k) => `edit-review:v1:${R.project}:${k}`;

// ---------------------------------------------------------------- load
async function boot() {
  const q = new URLSearchParams(location.search);
  R.project = q.get("project") || localStorage.getItem("edit-review:lastProject") || null;
  const all = await fetch("/api/clips").then((x) => x.json()).catch(() => ({ clips: [] }));
  const projects = [...new Set(all.clips.map((c) => c.project).filter(Boolean))];
  const sel = $("#clipSelect");
  sel.innerHTML = `<option value="">— projeto / clipe —</option>` + all.clips.filter((c) => c.project).map((c) => `<option value="${esc(c.path)}" data-project="${esc(c.project)}">${esc(c.project)} / ${esc(c.name)}</option>`).join("");
  sel.onchange = () => { const o = sel.selectedOptions[0]; if (o && o.value) openProject(o.dataset.project, o.value); };
  const clip = q.get("clip");
  if (R.project && projects.includes(R.project)) await openProject(R.project, clip || null);
  else status("Escolha um projeto no topo.");
}
async function openProject(slug, clipPath) {
  if (R.dirty && !confirm("Há notas não salvas. Trocar de projeto mesmo assim?")) return;
  R.project = slug; localStorage.setItem("edit-review:lastProject", slug);
  const r = await fetch(`/api/review?project=${encodeURIComponent(slug)}`).then((x) => x.json());
  R.transcript = r.transcript; R.edl = r.edl || []; R.clips = r.clips || [];
  const saved = r.review || {}; let draft = null; try { draft = JSON.parse(localStorage.getItem(LS("draft")) || "null"); } catch {}
  const src = draft && (!saved.updatedAt || draft.updatedAt > saved.updatedAt) ? draft : saved;
  R.notes = src.notes || []; R.edits = src.edits || []; R.dirty = src === draft && !!draft;
  R.clip = clipPath || src.clip || (R.clips[0] || {}).path || null;
  if (R.clip) { video.src = `/api/clip?path=${encodeURIComponent(R.clip)}`; $("#videoWrap").classList.add("has"); const sel = $("#clipSelect"); const o = $$("option", sel).find((o) => o.value === R.clip); if (o) sel.value = R.clip; }
  $("#toLook").href = R.clip ? `/?clip=${encodeURIComponent(R.clip)}` : "/";
  history.replaceState(null, "", `/review?project=${encodeURIComponent(slug)}${R.clip ? `&clip=${encodeURIComponent(R.clip)}` : ""}`);
  renderAll();
  status(`${slug}: ${R.notes.length} notas, ${R.edits.length} edits, ${R.transcript ? R.transcript.words.length + " palavras (" + R.transcript.file + ")" : "sem transcrição"}, ${R.edl.length} cortes na EDL.${R.dirty ? " Rascunho local não salvo." : ""}`);
}
function status(t) { $("#status").textContent = t; }
function draft() { R.dirty = true; try { localStorage.setItem(LS("draft"), JSON.stringify({ clip: R.clip, notes: R.notes, edits: R.edits, updatedAt: new Date().toISOString() })); } catch {} $("#save").textContent = "Salvar •"; }
async function save() {
  if (!R.project) return status("Escolha um projeto antes de salvar.");
  const r = await fetch("/api/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ project: R.project, clip: R.clip, notes: R.notes, edits: R.edits }) }).then((x) => x.json());
  if (r.error) return status("Erro ao salvar: " + r.error);
  R.dirty = false; $("#save").textContent = "Salvar"; try { localStorage.removeItem(LS("draft")); } catch {}
  $("#files").textContent = r.files.join(" · "); status("Salvo.");
}

// ---------------------------------------------------------------- player + timeline
const dur = () => video.duration || 0;
function seek(t) { video.currentTime = Math.max(0, Math.min(dur() || t, t)); }
video.addEventListener("loadedmetadata", () => { $("#tDur").textContent = ts(dur(), 0); renderMarks(); });
video.addEventListener("timeupdate", tick);
video.addEventListener("play", () => ($("#play").textContent = "❚❚"));
video.addEventListener("pause", () => ($("#play").textContent = "▶"));
function tick() {
  const t = video.currentTime, d = dur() || 1;
  $("#tNow").textContent = ts(t); $("#noteAt").textContent = ts(t);
  $("#played").style.width = `${(t / d) * 100}%`; $("#head").style.left = `${(t / d) * 100}%`;
  // items near the playhead light up; the transcript follows
  $$(".rv-item").forEach((el) => el.classList.toggle("now", Math.abs(+el.dataset.t - t) < 1.5));
  if (R.transcript) {
    const ws = R.transcript.words; let cur = null;
    $$(".rv-words .w").forEach((el, i) => { const w = ws[i]; const now = t >= w.start && t < Math.max(w.end, w.start + 0.25); el.classList.toggle("now", now); el.classList.toggle("past", w.end < t); if (now) cur = { el, i }; });
    if (cur) { if ($("#follow").checked && R.tab === "transcript") cur.el.scrollIntoView({ block: "center", behavior: "smooth" }); const line = ws.slice(Math.max(0, cur.i - 3), cur.i + 4).map((w, k) => (k === Math.min(3, cur.i) ? `<b>${esc(w.text)}</b>` : esc(w.text))).join(" "); $("#liveCaption").innerHTML = line; }
  }
}
$("#timeline").onclick = (e) => { const r = $("#timeline").getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur()); };
$("#play").onclick = () => (video.paused ? video.play() : video.pause());
$("#back5").onclick = () => seek(video.currentTime - 5); $("#fwd5").onclick = () => seek(video.currentTime + 5);
$("#rate").onchange = (e) => (video.playbackRate = +e.target.value);
function renderMarks() {
  const d = dur() || 1;
  $("#marks").innerHTML = R.notes.map((n) => `<i data-id="${n.id}" class="${n.done ? "done" : ""}" style="left:${(n.t / d) * 100}%" title="${esc(ts(n.t) + " " + n.text)}"></i>`).join("")
    + R.edits.map((e) => `<i data-id="${e.id}" class="edit ${e.done ? "done" : ""}" style="left:${(e.in / d) * 100}%" title="${esc(ts(e.in) + " " + (e.type || "") + " " + (e.text || ""))}"></i>`).join("");
  $("#cuts").innerHTML = R.edl.map((c) => `<i style="left:${(c.start / d) * 100}%;width:${Math.max(0.2, ((c.end - c.start) / d) * 100)}%" title="${esc(ts(c.start) + "–" + ts(c.end) + " " + c.reason)}"></i>`).join("");
  $$("#marks i").forEach((i) => (i.onclick = (e) => { e.stopPropagation(); const it = R.notes.find((n) => n.id === i.dataset.id) || R.edits.find((n) => n.id === i.dataset.id); if (it) seek(it.t ?? it.in); }));
}

// ---------------------------------------------------------------- notes + edits
$("#noteForm").onsubmit = (e) => { e.preventDefault(); addFromForm(false); };
$("#noteText").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); addFromForm(true); } });
function addFromForm(asEdit) {
  const text = $("#noteText").value.trim(); if (!text) return;
  const type = $("#noteType").value;
  if (asEdit || type) R.edits.push({ id: uid(), in: +video.currentTime.toFixed(2), out: null, type: type || "edit", text, done: false });
  else R.notes.push({ id: uid(), t: +video.currentTime.toFixed(2), text, done: false });
  $("#noteText").value = ""; $("#noteType").value = ""; draft(); renderAll(); showTab(asEdit || type ? "edits" : "notes");
}
function item(o, kind) {
  const t = kind === "note" ? o.t : o.in;
  return `<div class="rv-item ${o.done ? "done" : ""}" data-id="${o.id}" data-t="${t}" data-kind="${kind}">
    <button class="t" title="Ir para o tempo">${ts(t)}${kind === "edit" && o.out != null ? `–${ts(o.out)}` : ""}</button>
    <div class="tx"><input value="${esc(o.text)}" placeholder="texto…">${kind === "edit" ? `<div class="meta"><span class="chip type">${esc(o.type || "edit")}</span>${o.edl ? `<span class="chip edl">EDL · ${esc(o.edl)}</span>` : ""}${o.reason ? `<span class="chip">${esc(o.reason)}</span>` : ""}</div>` : ""}</div>
    <div class="acts"><button class="done ${o.done ? "ok" : ""}" title="Feito">✓</button>${kind === "note" ? `<button class="toedit" title="Virar edit">→</button>` : `<button class="setout" title="Marcar OUT no tempo atual">]</button>`}<button class="del" title="Apagar">×</button></div>
  </div>`;
}
function renderList(kind) {
  const list = kind === "note" ? R.notes : R.edits;
  const hide = kind === "edit" && $("#hideDone").checked;
  const sorted = list.slice().sort((a, b) => (a.t ?? a.in) - (b.t ?? b.in)).filter((o) => !(hide && o.done));
  const el = $(kind === "note" ? "#notesList" : "#editsList");
  el.innerHTML = sorted.length ? sorted.map((o) => item(o, kind)).join("") : `<p class="hint">${kind === "note" ? "Dê play, pare onde quiser e escreva a nota. Enter adiciona no tempo atual (atalho: N)." : "Edits são o que vai ser feito: cortes, gráficos, legendas, B-roll. Shift+Enter na caixa de nota, ou o tipo no seletor. Importe os cortes das EDLs do projeto."}</p>`;
  $$(".rv-item", el).forEach((row) => {
    const o = list.find((x) => x.id === row.dataset.id);
    $(".t", row).onclick = () => { seek(o.t ?? o.in); video.play(); };
    $(".tx input", row).onchange = (e) => { o.text = e.target.value; draft(); renderMarks(); };
    $(".done", row).onclick = () => { o.done = !o.done; draft(); renderAll(); };
    $(".del", row).onclick = () => { const i = list.indexOf(o); list.splice(i, 1); draft(); renderAll(); };
    const te = $(".toedit", row); if (te) te.onclick = () => { R.notes.splice(R.notes.indexOf(o), 1); R.edits.push({ id: o.id, in: o.t, out: null, type: "edit", text: o.text, done: o.done }); draft(); renderAll(); showTab("edits"); };
    const so = $(".setout", row); if (so) so.onclick = () => { o.out = +video.currentTime.toFixed(2); if (o.out < o.in) [o.in, o.out] = [o.out, o.in]; draft(); renderAll(); };
  });
}
$("#hideDone").onchange = () => renderList("edit");
$("#importEdl").onclick = () => {
  const have = new Set(R.edits.filter((e) => e.edl).map((e) => `${e.in}-${e.out}`));
  let n = 0; for (const c of R.edl) { const k = `${c.start}-${c.end}`; if (have.has(k)) continue; R.edits.push({ id: uid(), in: c.start, out: c.end, type: "corte", text: c.reason || "corte da EDL", edl: c.file, reason: c.agent || "", done: true }); n++; }
  draft(); renderAll(); status(n ? `${n} cortes importados (marcados como feitos: já estão no vídeo cortado).` : "Nada novo para importar.");
};
$("#copyEdits").onclick = async () => {
  const md = R.edits.slice().sort((a, b) => a.in - b.in).map((e, i) => `${i + 1}. [${ts(e.in)}${e.out != null ? "–" + ts(e.out) : ""}] ${e.type}: ${e.text}${e.done ? " ✅" : ""}`).join("\n");
  try { await navigator.clipboard.writeText(md); status("Lista de edits copiada."); } catch { status("Não deu para copiar; selecione no painel."); }
};

// ---------------------------------------------------------------- transcript
function renderTranscript() {
  const box = $("#words");
  if (!R.transcript) { $("#nWords").textContent = "0"; return; }
  const ws = R.transcript.words; $("#nWords").textContent = ws.length;
  let html = "", last = -10;
  ws.forEach((w, i) => { if (w.start - last > 1.2 && i) html += `<span class="brk"></span><span class="stamp">${ts(w.start, 0)}</span>`; else if (!i) html += `<span class="stamp">${ts(w.start, 0)}</span>`; html += `<span class="w" data-i="${i}">${esc(w.text)}</span> `; last = w.end; });
  box.innerHTML = html;
  box.onclick = (e) => { const w = e.target.closest(".w"); if (!w) return; seek(ws[+w.dataset.i].start); video.play(); };
}
$("#findWord").oninput = (e) => { const q = e.target.value.trim().toLowerCase(); let first = null; $$(".rv-words .w").forEach((el, i) => { const hit = q && R.transcript.words[i].text.toLowerCase().includes(q); el.classList.toggle("hit", !!hit); if (hit && !first) first = el; }); if (first) first.scrollIntoView({ block: "center" }); };

// ---------------------------------------------------------------- tabs, keys
function showTab(id) { R.tab = id; $$("#sideTabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === id)); $$(".rv-pane").forEach((p) => p.classList.toggle("on", p.dataset.pane === id)); }
$$("#sideTabs button").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));
function renderAll() { renderList("note"); renderList("edit"); renderTranscript(); renderMarks(); $("#nNotes").textContent = R.notes.length; $("#nEdits").textContent = R.edits.length; }
$("#save").onclick = save;
document.addEventListener("keydown", (e) => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); save(); return; }
  if (typing) return;
  if (e.key === " " || e.key.toLowerCase() === "k") { e.preventDefault(); video.paused ? video.play() : video.pause(); }
  else if (e.key.toLowerCase() === "j") seek(video.currentTime - 5);
  else if (e.key.toLowerCase() === "l") seek(video.currentTime + 5);
  else if (e.key === "ArrowLeft") seek(video.currentTime - 1);
  else if (e.key === "ArrowRight") seek(video.currentTime + 1);
  else if (e.key.toLowerCase() === "n") { video.pause(); $("#noteType").value = ""; $("#noteText").focus(); }
  else if (e.key.toLowerCase() === "e") { video.pause(); $("#noteType").value = "corte"; $("#noteText").focus(); }
});
window.addEventListener("beforeunload", (e) => { if (R.dirty) { e.preventDefault(); e.returnValue = ""; } });
window.__rv = R;
boot();
