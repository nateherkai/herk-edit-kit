---
name: reel-editorial-oney
description: Edit a talking-head recording into a Reel in Oney Araujo's polished EDITORIAL look — one lowercase word at a time mid-frame with keywords in pale-yellow italic serif, phrase stacks built line by line, hard cuts between angles and punch-ins, floating rounded print cards, thumbnail bursts, film strip, grid wall of past reels, handwritten asides with drawn arrows. Use when the user says /reel-editorial-oney", "estilo editorial", "estilo serifado", or asks for a reel that looks visibly designed. For the raw phone look use reel-oney; explainer use reel-explicativo-oney; ads use anuncios-oney.
---

# Reel editorial (estilo "o Claude editou")

**The one rule:** the edit is part of the message. Calm, expensive, obviously *designed* — the
opposite of `reel-oney`. But every visual illustrates the exact words being said, enters on the word, and
leaves within the sentence. Decoration with no line attached is a failure.

First read `../_perfil-oney.md` and load (or create) `perfil.json`.

## Look

| Element | Rule |
|---|---|
| Captions | **One word at a time**, lowercase, centred mid-frame (`capTop` in `reel.json`). Inter SemiBold 92 px, tight tracking, soft shadow, **no outline**. Hard cut word to word. |
| Serif voice | The word that carries the meaning (≈1 per sentence) switches to pale-yellow `#f4e27c` Instrument Serif Italic, 124 px. Set in `assets/emphasis.json` (`words` every occurrence, `at` one occurrence). Asides drop to the small size (`small` ranges). |
| Phrase stack | Hook and big claims built **line by line** in the top third, mixing sans and serif lines. Lines blur-rise in on their spoken word; captions hidden (`hide` range) while a stack speaks. |
| Camera | Hard cut every 1–2 sentences: between real angles if the creator recorded more than one, otherwise **punch-ins** (`punch(1.2–1.35)` ↔ `punch(1)`). Never an animated zoom. |
| Cards | Real prints in **rounded** frames (34 px radius) with soft shadow, beside/above the head, sliding in with a slight tilt. Up to 2 at once. |
| Thumbnail burst | "uma semana inteira de vídeos" → 10–14 small rounded thumbs burst out of the speaker (`scatter`). |
| Film strip | "em lote", "B-roll" → a row of frames sliding across the top (`strip`). |
| Grid wall | Proof beats → top and bottom close in with a grid of past reels, speaker in a band (`wallIn/wallOut`). |
| Handwritten aside | One personal confession per video in Caveat + drawn arrow pointing at the speaker. |
| UI moments | Small honest mockups of the tool doing the work (`restyle` toolbar, a timeline window). Max 2 per video, only where the line describes that action. |
| CTA | Final 4–6 s: closest framing; "comenta *palavra*" with the keyword in serif. |

Colors, sizes and don'ts: `template/DESIGN.md` (copied into every project).

## Cut rules

Remove every pause (−30 dB / 0.15 s) and every retake; ≤ 90 s; re-transcribe `clean.mp4` and read it
end to end before composing. Aim for 35–60 s. Run `build-cut.mjs --no-jl`.

## Speed rules (students may have slow PCs — these override the steps below)

- The raw transcription in the scaffold step is automatically `--fast` (small model when there is no NVIDIA GPU):
  it is only used to choose the cut. The re-transcription of `clean.mp4` (captions) uses the accurate settings —
  run it once per cut version, not after every small change.
- Check all splices in ONE call (one model load): `$PY $S/transcribe-local-whisper.py clean.mp4 --windows t1,t2,…`
  (times on the clean timeline). Never transcribe windows one by one.
- Do not render a full draft just to look at frames. Use `npx hyperframes snapshot --at t1,t2,… -o snapshots`
  (one time per beat / overlay change) and look at the PNGs. Render the video once, when the snapshots are right:
  `npx hyperframes render --output renders/<slug>-final.mp4`. Render again only for requested changes.
- raw.mp4 / clean.mp4 encoding picks the fastest encoder automatically (NVIDIA / Intel Quick Sync / AMD / Apple,
  else libx264 ultrafast). Do not override it.
- Before each slow step, tell the user in one short Portuguese line what is running and that it may take a few
  minutes ("Transcrevendo o vídeo — no seu PC pode levar uns minutos."), so the wait never looks like a freeze.

## Workflow (run from the kit root)

`S=.claude/skills/reel-editorial-oney/scripts` · `PY=~/.venvs/whisper/Scripts/python.exe`

1. **Scaffold + transcribe**: `node $S/new-reel.mjs "<video>" <slug> ["<angle2>" …]`.
2. **Probe framing**: contact sheet of raw.mp4; set `reel.json` → `{"capTop": <px>}` (≈ 950–1150).
3. **Cut**: write `assets/keeps.json`; in `assets/`: `node ../../../$S/build-cut.mjs --no-jl` → `clean.mp4`.
   Extra angles: sync to raw.mp4, trim to the same start, cut each with the same keeps.
4. **Verify**: in `assets/`: `PYTHONIOENCODING=utf-8 $PY ../../../$S/transcribe-local-whisper.py clean.mp4 transcript.json`.
   Fix keeps until clean; mishearings → `assets/caption-fixes.json`.
5. **Plan beats** in `assets/beats.md`: for each sentence ONE of caption only · stack · card · burst · strip ·
   wall · note · UI moment, plus camera and the serif word. Alternate busy and empty; never two takeovers in a row.
6. **Assets**: prints via `node $S/find-prints.mjs "<terms>"` (uses the index built by the `reel-oney` skill;
   view every candidate) → `assets/prints/`. Thumbs of the creator's past reels → `assets/thumbs/`.
   Log sources in `assets/prints/SOURCES.md`. Never invent numbers, profiles or UI.
7. **Compose**: in `src/index.template.html` adapt the components and write the TIMING block with the
   helpers (`line`, `punch`, `cardIn/cardOut`, `scatter`, `strip`, `wallIn/wallOut`, `noteIn`, `restyle`,
   `fadeOut`). Times from `node $S/anchors.mjs "frase" …`. Write `assets/emphasis.json`.
8. **Build + check**: `node $S/build-index.mjs` → `npx hyperframes lint` → `npx hyperframes snapshot --at …` at
   every beat and LOOK (face never covered, serif readable, cards not cropped). Then final render
   `renders/<slug>-final.mp4`.
9. **Hand-off** (Portuguese, short): final path, what was cut, the beat plan, assets used. Never publish.
