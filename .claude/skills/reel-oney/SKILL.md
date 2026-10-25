---
name: reel-oney
description: Edit a vertical talking-head recording into a Reel in Oney Araujo's raw PHONE-EDITED style (Instagram-native one-word captions, raw prints above the head, Advercase titles, Apple emojis, dry cuts, J/L cuts, no pauses or retakes, max 90 s). Use when the user sends a video path and says /reel-oney", "edita esse", "edita esse vídeo", or asks for a Reel in the phone/celular style. For the designed serif look use reel-editorial-oney; explainer/news use reel-explicativo-oney; ads use anuncios-oney.
---

# Reel no estilo do Oney (celular)

**The one rule:** the viewer must feel the creator edited it on their own phone, in the Instagram
editor. Never let it look like an agency or an AI made it. When in doubt, do less, rawer, smaller.
Polished motion graphics are a failure here.

First read `../_perfil-oney.md` and load (or create) `perfil.json`. Style stills: `references/sheet1-4.jpg`
and `references/oney-reels-frames.png` (the course author's reels). Look at them before designing.

## Look — non-negotiable

| Element | Rule |
|---|---|
| Prints | Real screenshots from the creator's prints folder (Instagram profile headers, insights, likes/comments/saves/shares, views, DMs, comments, posts). Raw crop: **square corners, no border, no shadow, no frame, no rounded card**. Above the head. |
| Text above the head | Advercase **Bold**, white, **small** — titles 48–70 px, labels 40–48 px on 1080 wide. **Left-aligned with the print's left edge.** Yellow `#ffd21f` only for an occasional highlighted word. Sans bold (`.sans`) only for labels like "Ruim / Bom / Viral". |
| Shadow | Only when the wall behind is light (`.sh`). Never boxes or scrims behind text. |
| Motion | **None.** Overlays appear/disappear on a dry cut (`show()`/`hide()`). No fade, slide, scale, bounce. |
| Emojis | Real emoji characters in the template (✅ ❌ 🔥 ❤️ 👇 🚨 …); `build-index.mjs` swaps them for Apple artwork (downloaded and cached). Never draw icons. |
| Captions | **One word at a time**, 54 px Advercase Bold, white with deep black outline. Centred on the chest just under the chin (`capTop` in `reel.json`). Hard cut word to word. |
| Persistent title | A topic title can stay on screen for long stretches with prints swapping above it. |
| Lists | Emoji + word checklists (✅ Legenda / ❌ Título), revealed item by item on the spoken word. |
| Mockups | Avoid. Use a real print. Only draw a mockup if no print exists AND the user asked. |

## Cut rules

- No breaths or pauses: everything under −30 dB for ≥ 0.15 s is removed (`build-cut.mjs`).
- Remove every retake, false start and repeated phrase. Keep the last, cleanest take.
- **Whisper hides repetitions and mis-times words.** After cutting, ALWAYS re-transcribe `clean.mp4`
  and read it end to end for doubled phrases, clipped words and missing verbs. Recut until clean.
- Max 90 s unless the user says otherwise. Tell them in the hand-off what you dropped.
- **J/L cuts** on by default (`--jl 6` softer, `--no-jl` off).

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

`S=.claude/skills/reel-oney/scripts` · `PY=~/.venvs/whisper/Scripts/python.exe` (Mac/Linux: `~/.venvs/whisper/bin/python`)

1. **Scaffold + transcribe**: `node $S/new-reel.mjs "<video>" <slug>` → `video-projects/<slug>/`
   with `assets/raw.mp4`, `raw.json`, `words.txt`. First run downloads the Whisper model (slow once).
2. **Probe framing**: contact sheet of raw.mp4 (`fps=1/4,scale=180:-1,tile=12x1`) to find head top and
   chin. Overlays live between y≈100 and the head top; captions under the chin (`reel.json` → `{"capTop": <px>}`).
3. **Choose the cut**: read `words.txt`, write `assets/keeps.json` (`{fps:30, keeps:[{from,to,why}]}`).
4. **Cut**: in `assets/`: `node ../../../$S/build-cut.mjs` → `clean.mp4`.
5. **Verify**: in `assets/`: `PYTHONIOENCODING=utf-8 $PY ../../../$S/transcribe-local-whisper.py clean.mp4 transcript.json`.
   Repeats/clipped words → back to 3. Mishearings → `assets/caption-fixes.json`.
   `ffmpeg -i clean.mp4 -af silencedetect=noise=-30dB:d=0.25 -f null -` → no pauses.
6. **Find prints**: index the creator's prints folder once (and when new prints exist):
   `powershell -ExecutionPolicy Bypass -File $S/index-prints.ps1 -Folder "<pasta_prints from perfil.json>"`.
   Search: `node $S/find-prints.mjs "<terms>" [--since 2026-01-01] [--min-w 600]`. ALWAYS view a candidate
   before using it; crop with ffmpeg into `assets/prints/`; log sources in `assets/prints/SOURCES.md`.
   No suitable print → ask the user for the exact screen. Never invent one.
   **On Mac** the OCR index (Windows-only) is not available: skip `index-prints.ps1` / `find-prints.mjs`,
   list the images in `pasta_prints`, view the likely candidates directly, or ask the user for the print.
7. **Compose**: edit `src/index.template.html` (overlays + `show/hide` timing). Times from
   `node $S/anchors.mjs "frase" ...` (project root). Hard cuts only.
8. **Build + check**: `node $S/build-index.mjs` → `npx hyperframes lint` → snapshots of every overlay
   change (`npx hyperframes snapshot --at …`) and LOOK: face never covered, text readable. Then `npx hyperframes render --output renders/<slug>-final.mp4`.
9. **Hand-off** (in Portuguese, short): final file path, what was cut, prints used, anything uncertain.
   Never publish or send anything.
