---
name: look-builder
description: Edit a talking-head video using the look the student chose in the Look builder (video-projects/<slug>/look.json). Use when the user says "/look-builder", "edita com o look", "usa o look.json", "aplica o look que eu escolhi", or names a Look builder template ("/look-builder explainer-panel", "/look-builder tier list"). Opens the Look builder when there is no look yet. Routes the actual edit to the kit skill the look points to (reel-oney, reel-editorial-oney, anuncios-oney, video-colagem-oney, reel-explicativo-oney, vsl, short-form-edit) and, for Legenda Dinâmica captions, to the EffectCraft /legenda skill.
---

# Look builder (skill)

The Look builder (`tools/look-builder/`) is a local 7-step wizard where the student picks colours, fonts, hook,
captions, elements and motion over a frame of their own clip, and saves `video-projects/<slug>/look.json`
(+ `LOOK.md`). This skill turns that choice into an edit. **Read `tools/look-builder/README.md` once.**

## Usage

- `/look-builder <video>` or `/look-builder <slug>`: edit using the saved look.
- `/look-builder <video> <template>`: start from a template preset (ids in `tools/look-builder/looks.ajene.mjs`,
  `looks.zee.mjs`, `looks.castilho.mjs`, `looks.mjs`: e.g. `tpl-explainer-panel`, `tpl-ranking-format`, `tpl-fitted-captions`,
  `zee`, `castilho`, `editorial`, `celular`), then apply.
- `/look-builder` alone: open the wizard (`node tools/look-builder/server.mjs`, http://localhost:8765/) and tell the
  student to choose a clip, pick a look and press "Salvar look.json"; wait for them.

## Steps

1. Find the look: `video-projects/<slug>/look.json`. No file → open the wizard (above) or, with a template id, build
   the look.json from that preset's picks (same shape the wizard saves: `colours`, `fonts`, `hook`, `captions`,
   `elements`, `motion`, `framing`, `sampleText`) and save it.
2. Read `look.json` and `LOOK.md`. Honour every pick: colours (`acc/txt/bg`), fonts (`display/body/serif/hand`;
   `userFonts` are files from the student's folder: copy them into `assets/fonts/` and declare `@font-face`), hook,
   captions, elements, motion, `framing.headTop/capTop`, `extras` (variations asked), `notes`.
3. Pick the executor: `skill` in look.json. Load that kit skill and follow its workflow (scaffold, transcription,
   cut, compose, lint, snapshots, render). The look.json's `conflicts` list what the look contradicts in that skill's
   DESIGN.md: resolve with the student before composing, never silently.
   - `captions.engine == "legenda-dinamica-studio"`: captions are made in EffectCraft with the `/legenda` skill
     (pronto, entrada, saída in `captions.lds`); leave the caption band free in the HyperFrames composition and hand
     over `words.json`.
   - `brandNat.codes`: if the student has the Brand Nat skill installed, the equivalent order is
     `Edit <video> with <codes>`; otherwise treat the codes as design notes (names in `brandNat`).
4. Starting point for the composition: `video-projects/<slug>/look-test/index.html` if the student pressed
   "Testar de verdade" (it is valid HyperFrames with the look's renderers and a paused timeline). Otherwise generate
   it with `node -e` importing `tools/look-builder/testbuild.mjs` (`buildTestProject`) and build from there.
5. Layers. `look.json` → `matte.needed: true` means parts of the look pass **behind the person** (in the renderers they
   carry `class="back"`; a part inside them that stays in front carries `class="front"`). Cut the person out of the
   edited video with `npx hyperframes remove-background assets/<edited>.mp4 -o assets/matte.webm` (or the matting
   scripts in `video-colagem-oney` / `vsl`, finer on hair). Tell the student before running: it is slow on the CPU.
   Stack exactly like `look-test/index.html`: video (z 0) → a copy of the look with only `.back` visible (`.lb-back`,
   z 1) → `<video src="assets/matte.webm">` following the same camera moves (z 2) → the look with `.back` hidden
   (`.lb-front`, z 3) → captions (z 5). `LAYER_CSS` in `tools/look-builder/layers.mjs` has the visibility rules; both
   copies run the same timeline. Regenerate the matte whenever the cut changes (a stale matte is a ghost presenter).
6. Verify like every kit skill: lint 0 errors, snapshots at every beat, face never covered, safe zone, then render.
   Hand-off in Portuguese: file path, what was cut, the look applied, anything uncertain. Never publish.
