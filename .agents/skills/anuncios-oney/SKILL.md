---
name: anuncios-oney
description: Edit a talking-head recording into an AD in Oney Araujo's style (anúncio / criativo) — a headline title in the first 5 s, then animated SCHEMATICS above the head that illustrate what the person is saying (flows, before/after, não ✕ / sim ✓, mock app screens, real prints with view counters) instead of text that repeats the captions; word-by-word captions, Meta Reels safe zones, no pauses or retakes. Use when the user says /anuncios-oney", "anúncio", "criativo", or asks for the ad-style edit. For organic Reels use reel-oney instead.
---

# Anúncios no estilo do Oney

First read `../_perfil-oney.md` and load (or create) `perfil.json`. Also ask, if not given: product name,
the call to action, and the product images/prints to show (cover, mockup, results, prints of past videos
with their view counts). Put them in `assets/img/` replacing the placeholders (see the list below).

`src/index.template.html` (copied from `template/esquemas.template.html`) is a full working ad from the
course author ("Edição Viral com Claude", 1:48) with placeholders where his images were. Keep its CSS
system and helpers; rewrite the headline and the schematics for the new script. The older text-beat
ad is in `src/classico.template.html` (use only if the user asks for that look).

## Structure: headline, then schematics (mandatory)

1. **0 → ~5 s: headline only.** One big Advercase Bold title (white line + yellow line, ~90–125 px,
   optional yellow underline sweep on the key word). No diagram, no UI, no images.
2. **After the headline: one schematic per spoken idea, changing on the word.** The top zone SHOWS the
   mechanism; it never re-types the sentence (the captions already say it). Text inside a schematic is
   limited to short labels (1–3 words: "bruto · 4:05", "gaguejo", "com IA", "seu vídeo").
3. When the product sells a process, show the **complexity of the old way next to the simplicity of the
   new one** (e.g. crowded manual timeline + clock to 40:00 + ✕ vs one request + 10:00 + ✓).

Schematic patterns in the template (reuse and re-time them):

| Idea said | Schematic |
|---|---|
| "I did X → sent to Y → got Z" | Flow: phone card (raw frame) → dashed arrow + travelling dot → round node → arrow → result phone card |
| removes errors / pauses | Waveform panel: problem parts turn blue/red with tags, then shrink away; timer counts down to the new length |
| happens automatically | Phone mock where elements appear by themselves + "0 cliques" counter |
| old way × new way | Two panels: dense multi-track timeline + clock + ✕ stamp vs a single request box + ✓ stamp |
| objections ("sem tempo", "não sei") | **Não ✕ / Sim ✓**: problem cards each get a red ✕ → arrow → solution card with green ✓ |
| doubt → proof | Chat bubble with the doubt → test card with ✓ |
| "you must explain what you want" | Generic request → grey generic result ✕ vs a detailed instruction file typing → ✓ |
| list of offerings | Dashed empty slots that fill with real frames/images, one per spoken item |
| course / product | Real cover + chips flying into it + rising chart |
| social proof | Real prints with view counters ticking up (crop the print's own counter out) |
| copy a style | Reference → node → the user's frame receiving the same styling + "= mesmo estilo" |
| offer / launch | Price-tag shape + rubber-stamp discount → post mock with upload bar → "✓ publicado" |
| "grava, edita, posta" | Three icon nodes lit on each word |

Before rendering, read every beat and ask: "does the top zone SHOW it, or just repeat the caption?"

Placeholders in `assets/img/` (replace with the user's real images; never invent logos, covers or results):
`bruto.jpg` (made automatically from the recording) · `editado.jpg` (frame of an edited video) · `capa.jpg`
(product cover, portrait) · `exemplo1-4.jpg` (frames of the user's own videos) · `referencia.jpg` ·
`print1-3.png` (prints of the user's videos) · `avatar.png` · `produto.jpg`, `antes.png`, `agora.png` (classic
template). Write the user's @ from `perfil.json` where the template says `seu_usuario`. If an image is
missing, drop or redesign that schematic instead of showing a placeholder.

## Safe zones (Meta Reels ads — mandatory)

Keep **14 % top, 35 % bottom, 6 % each side** free of text. On 1080×1920 the safe box is
**x 65–1015, y 270–1248**: every word, number, badge, CTA and the schematics' labels must sit inside it
(including scale/rotation peaks). Only decoration (scrim, panel shadows) may bleed. Captions go on the chest
just under the chin, centred, and above y ~1640 (the post's name/caption start below). Check with
`node $S/safe-sheet.mjs renders/<draft>.mp4 safe.jpg t1 t2 …` (red box on each frame).

## Look

| Element | Rule |
|---|---|
| Top zone | y 280 → head top (measure per video on a contact sheet). Soft top scrim `linear-gradient(180deg, rgba(0,0,0,.66) → transparent)`. |
| Schematic kit | Dark panels `rgba(16,16,19,.92)` radius 22 with a 1 px light border; phone cards 160×284 (9:16) with real frames; round orange node `#d97757` for the AI step; dashed arrows with a travelling yellow dot; red `#ff453a` ✕ and green `#30d158` ✓ round stamps that pop on the word; UI labels in Arial bold. Repeated decoration (waveform bars, timeline clips) uses the template's seeded `rnd()`, never `Math.random` or GSAP `from:"random"`. |
| Type | Advercase Bold for headline, labels, captions. White; accent **yellow `#ffd21f`**. |
| Motion | Short entrances: rise + fade 0.45–0.6 s (`power3.out` / `expo.out`), stamps `back.out` pop, counters ticking, bars filling, arrows growing. Exits 0.28 s fade. Beats change on the spoken word. |
| Captions | One word at a time, Advercase Bold 46 px, white with dark stroke, just under the chin (`#cap{top:…}`, set per video). |
| CTA | Comment-box mock typing the keyword ("EU QUERO") + direct-message card, or a white "Saiba mais ›" bar. |

## Cuts

Remove every pause (−30 dB / 0.15 s) and every retake, ≤ 90 s if possible. When a sentence is said twice,
keep the LAST (corrected) version. Run `build-cut.mjs --no-jl`, re-transcribe `clean.mp4` and read it for
doubled phrases / clipped words. The full transcript HIDES retakes: also scan the whole clean video in short
windows in ONE call, `$PY $S/transcribe-local-whisper.py clean.mp4 --windows 1,3,5,7,…` (every 2 s to the
end), and compare.

## Speed rules (students may have slow PCs — these override the steps below)

- The raw transcription in the scaffold step is automatically `--fast` (small model when there is no NVIDIA GPU):
  it is only used to choose the cut. The re-transcription of `clean.mp4` (captions) uses the accurate settings —
  run it once per cut version, not after every small change.
- Check splices / retakes in ONE call (one model load) with `--windows`. Never transcribe windows one by one.
- Do not render a full draft just to look at frames. Use `npx hyperframes snapshot --at t1,t2,… -o snapshots`
  (one time per beat) and look at the PNGs. Render the video once, when the snapshots are right:
  `npx hyperframes render --output renders/<slug>-final.mp4`. Render again only for requested changes.
- raw.mp4 / clean.mp4 encoding picks the fastest encoder automatically. Do not override it.
- Before each slow step, tell the user in one short Portuguese line what is running and that it may take a few
  minutes ("Transcrevendo o vídeo — no seu PC pode levar uns minutos."), so the wait never looks like a freeze.

## Workflow (run from the kit root)

`S=.agents/skills/anuncios-oney/scripts` · `PY=~/.venvs/whisper/Scripts/python.exe` (Mac: `~/.venvs/whisper/bin/python`)

1. `node $S/new-anuncio.mjs "<video>" <slug>` → project with raw.mp4, raw.json, words.txt, the templates,
   placeholder images and `assets/img/bruto.jpg`.
2. Contact sheet of raw.mp4 to find head top / chin; set the top zone and `#cap` top.
3. Write `assets/keeps.json`; in `assets/`: `node ../../../$S/build-cut.mjs --no-jl`.
4. In `assets/`: `PYTHONIOENCODING=utf-8 $PY ../../../$S/transcribe-local-whisper.py clean.mp4 transcript.json`;
   read it; run the `--windows` scan; fix keeps until clean; mishearings → `assets/caption-fixes.json`.
5. Rewrite `src/index.template.html`: headline for 0–5 s, then a schematic per spoken idea; fill name/@/avatar
   from `perfil.json`; times from `node $S/anchors.mjs "frase" …`. Swap imagery in `assets/img/`.
6. `node $S/build-index.mjs` → `npx hyperframes lint` (0 errors) → `npx hyperframes snapshot --at …` at every beat
   and LOOK (face never covered, labels readable, numbers correct, no placeholder left) → render → `safe-sheet.mjs`
   on the beat times → final `renders/<slug>-final.mp4`.
7. Hand-off (Portuguese, short): path, what was cut, assets used, anything uncertain. Never publish.
