---
name: reel-explicativo-oney
description: Edit a talking-head recording into an Oney Araujo-style EXPLAINER / news Reel in the "Quem manda na arena?" method — a hidden mechanism (money, control, who really owns what) told by the presenter, proved with REAL footage in a 16:9 band on top (tagged ARQUIVO / ILUSTRAÇÃO / year), one word-at-a-time captions, voice at 1.05x, and a review checkpoint (edit map with IDs, footage sourcing request, fact checks) BEFORE assembly. Use when the user says /reel-explicativo-oney", "estilo explicativo", "estilo notícia", "mecanismo", or sends a script that explains how a business/deal works. For the phone look use reel-oney; editorial look reel-editorial-oney; ads anuncios-oney.
---

# Reel explicativo (método "Quem manda na arena?")

**The one rule:** the story is the mechanism, and every image has a job: **prove** (real footage),
**illustrate** (generic AI B-roll, labelled), or **explain** (the diagram). Nothing is decoration, nothing
is faked. The edit stays sober so the argument looks credible.

First read `../_perfil-oney.md` and load (or create) `perfil.json`.

Reference: the course author's reel (88 s, Palmeiras / Nubank Parque / BTG).
What matters is **how it was conducted**, not the Palmeiras look. Contact sheets at 1 fps in
`references/sheet-0.jpg`, `sheet-24.jpg`, `sheet-48.jpg`, `sheet-72.jpg` (each row = 8 s), plus
`references/diagram-step3.png`. Look at them before designing. Beat map:

| Reel | Shot | Job |
|---|---|---|
| 0–4.5 | split: real aerial `ARQUIVO` + presenter | hook as a paradox question ("como um banco controla o estádio sem nunca ter comprado?") |
| 4.5–7.7 | full: real facade with the name | the fact everyone knows |
| 7.7–11 | split: official campaign photo | the known actor and its number (50 mi/ano) |
| 11–15 | presenter, punch-in | twist: "a relação dele para por aí" |
| 15–18 | split: real show `ARQUIVO · GPWEEK 2022` → AI parking | list of what the operator explores, one shot per item |
| 18–29 | presenter, framing alternates | the new actor + "só que tem um problema" + what it did NOT do |
| 29–32 | split: AI construction `ILUSTRAÇÃO` | the past (who financed) |
| 32–39 | presenter | restates the open question |
| 39–42 | split: archive photo `INAUGURAÇÃO · 2014` + credit | anchor date + the debt |
| 45–51 | diagram `1 · A DÍVIDA` → `2 · MUDA O CREDOR` | creditor swapped **on the same spot**, thin outline on the new one |
| 51–58 | presenter | "a dívida não sumiu, só mudou quem cobra" |
| 58–65 | **same diagram plane** → `3 · O ACORDO` + caveat | debt becomes control: dotted "segue sócia", accent arrow "controle majoritário" |
| 65–72 | presenter "então fica assim" → recap montage (one shot per actor) | 3 actors, 3 roles, one line each |
| 72–79 | split: AI ticket scan → presenter | brings it to the viewer ("você passou por 4 bancos") |
| 79–88 | full: facade **reprise** → presenter + CTA | ironic callback to the opening, then follow CTA tied to the series promise |

Rhythm: presenter on screen ~55 %, support ~30 %, diagram ~15 %. A support shot every 5–8 s, each
2–5 s, entering on the noun it shows. Presenter reframes (wide ↔ punch-in) on sentence boundaries.

## Default overrides (they win over the reference look)

- Captions: `reel.json {"captions": "words"}` → Advercase Bold, one word at a time, white, black outline,
  centred on the chest (`capTop` ≈ 1540). Not the dark phrase box.
- No diagrams: every beat gets an IMAGE — real footage, a live print, a crop of a news broadcast, or a
  freely-licensed photo when he mentions a type of person ("o senhorzinho do sertão", "os jovens"), tagged
  `IMAGEM ILUSTRATIVA` with author + licence. Google Images blocks automated search (CAPTCHA): use Openverse
  (`api.openverse.org/v1/images/?q=…&license_type=commercial`) and Wikimedia Commons.
- News clips: seek with `-ss` AFTER `-i` (keyframe seeking lands on the wrong shot) and crop to the picture window.

## Look

Colors, sizes, layout and don'ts: `template/DESIGN.md` (copied into every project). In short:
support band on top (y 0–668) with a context tag · captions 1–2 lines on a 100 % opaque `#0f1a24`
box at the same spot all video · one near-white diagram plane, text-as-nodes, thin arrows, ONE accent
color, step labels `1 · …`, caveat in grey under the label · hard cuts only, no zooms or whooshes.

## Script shape (check it before editing; suggest fixes if the recording lacks a beat)

1. **Paradox hook** — a question with a contradiction in it (who controls X without owning X?).
2. **The visible fact** — what everyone sees (the name on the facade, the logo, the price).
3. **Twist** — "mas a relação dele para por aí" / "só que tem um problema".
4. **Hidden actors** — who really operates / financed / owns; say what each did NOT do.
5. **Mechanism in numbered steps** (2–3) — this is the diagram. One plane, changes in place.
6. **"Então fica assim"** — recap: one line per actor, one shot per actor.
7. **Bring it to the viewer** — how this touches them ("você passou por 4 bancos").
8. **Callback + CTA** — return to the opening image with an ironic line; CTA = the series promise.

## Speed rules (students may have slow PCs — these override the steps below)

- The raw transcription in the scaffold step is automatically `--fast` (small model when there is no NVIDIA GPU):
  it is only used to choose the cut. The re-transcription of `clean.mp4` (captions) uses the accurate settings —
  run it once per cut version, not after every small change.
- Check all splices in ONE call (one model load): `$PY $E/transcribe-local-whisper.py clean.mp4 --windows t1,t2,…`
  (times on the clean timeline). Never transcribe windows one by one.
- Do not render a full draft just to look at frames. Use `npx hyperframes snapshot --at t1,t2,… -o snapshots`
  (one time per beat / overlay change) and look at the PNGs. Render the video once, when the snapshots are right:
  `npx hyperframes render --output renders/<slug>-final.mp4`. Render again only for requested changes.
- raw.mp4 / clean.mp4 encoding picks the fastest encoder automatically (NVIDIA / Intel Quick Sync / AMD / Apple,
  else libx264 ultrafast). Do not override it.
- Before each slow step, tell the user in one short Portuguese line what is running and that it may take a few
  minutes ("Transcrevendo o vídeo — no seu PC pode levar uns minutos."), so the wait never looks like a freeze.

## Workflow (run from the kit root)

`S=.claude/skills/reel-explicativo-oney/scripts` · `E=.claude/skills/reel-editorial-oney/scripts` (shared tools) · `PY=~/.venvs/whisper/Scripts/python.exe`

1. **Scaffold + transcribe**: `node $S/new-reel.mjs "<video>" <slug>` → `video-projects/<slug>/`.
2. **Probe framing**: contact sheet of raw.mp4. Set `reel.json`:
   `{"capTop": 1545, "punch": 1.18, "split": {"y": 668, "scale": 1, "origin": "50% 0%"}}` — in split the
   face must sit clearly below the band (try `scale` 0.8–1 and `y` 520–700; check a frame).
3. **Cut**: `assets/keeps.json` (editorial: retakes, false starts) → in `assets/`:
   `$PY ../../../$S/tight-cut.py cut.mp4` — cuts by the SOUND of speech
   (energy + low/high spectral tilt), so pauses AND breaths go, word tails stay, and every editorial edge snaps
   outward to the nearest energy valley. Whisper word starts are often late: if a word loses its first syllable,
   measure the onset in raw16.pcm and move that keep's `from`. Then speed the voice to **1.05x**:
   `ffmpeg -i cut.mp4 -filter_complex "[0:v]setpts=PTS/1.05[v];[0:a]atempo=1.05[a]" -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 20 -r 30 -c:a aac -b:a 192k clean.mp4`.
   Re-transcribe `clean.mp4` with faster-whisper `condition_on_previous_text=False` + an `initial_prompt` with the
   names (it drops fewer words), read it end to end, then transcribe a 3 s window around EVERY splice on its own:
   a half word or a murmured retake shows up there, not in the full transcript.
4. **Story check**: map the transcript to the 8 beats above. Flag missing beats or claims that need a
   source (numbers, dates, "controla", "comprou"). Do not rewrite what the presenter said.
5. **Edit map with IDs** (`assets/map.md`), one row per insert, times on the OUTPUT timeline + raw time:
   `V##` real video to find · `R##` real photo · `B##` AI B-roll (generic) · `M##` motion diagram ·
   `-reprise` for callbacks (don't count as new). For each: what it shows, the line it covers, layout
   (split / full), tag text, status (pronto / pendente). For each `M##`: second-by-second action
   ("0–1.2 s …; 1.2–2.6 s card A replaced by B on the same spot; …; hold still for reading").
6. **Checkpoint page — before any assembly.** Publish a private Artifact (load `artifact-design`)
   in Portuguese, like the reference: title = the hook, counters (B-rolls prontos / filmagens a buscar /
   motions / duração), the M## specs with quote + timing, B-roll list, real photos with source and what
   each may or may NOT prove, the full edit map table, the **sourcing request** for missing real footage
   (copy-ready text for the user: per V## what to show, duration, "não aceitar IA/render/simulação",
   return link + channel + date + IN/OUT mm:ss verified by watching), and **"Antes da publicação"**:
   facts to confirm, values that are approximate, brand relations the images must not imply.
   End with "Revisar agora. Montar depois." and wait for approval (by ID).
7. **Assets**: real footage → `assets/broll/V##.mp4` (trim to IN/OUT, mute, crop away letterbox bars,
   keep the original). AI B-roll: write Flow/Veo prompts (6 s, generic, no readable brands, no fake
   documents or app screens) and ask the user before any paid generation; tag `ILUSTRAÇÃO`. Photos →
   `assets/photos/R##.jpg` with credit; log every source in `assets/SOURCES.md`.
8. **Compose**: `src/index.template.html` — one `.sup` per V/R/B, one `.dia` plane per mechanism
   (reuse it across M01/M02 — `relabel` the step, `swap` in place, `outline`, `fade` to secondary).
   Helpers: `split / swapSup / full / drift / punch / wide / diaIn / reveal / swap / draw / outline / fade`.
   Times from `node $E/anchors.mjs "frase" …`; enter on the spoken noun. Hold the final diagram state
   still ≥ 1.5 s before cutting back.
9. **Build + check**: `node $S/build-index.mjs` → `npx hyperframes lint` → `npx hyperframes snapshot --at …` at every insert and LOOK: face visible under the band, tag legible, caption box never over the face
   or a diagram node, no letterbox bars, diagram readable in the time it's held, A/V sync after 1.05x.
   Then final render `renders/<slug>-final.mp4`. Save evidence in `VERIFY.md`.
10. **Hand-off** (Portuguese, short): final path, what was cut, the edit map, sources, open fact checks. Never publish.

## Honesty rules (from the reference — non-negotiable)

- Real place/brand/person claims are shown only with real material. If the real shot can't be found,
  say so; don't fill the gap with AI.
- Archive images carry their year; they never "prove" the current state.
- A diagram shows the deal as **announced**; pending approvals stay on screen as a caveat.
- Approximate numbers are said/labelled as approximate ("cerca de").
