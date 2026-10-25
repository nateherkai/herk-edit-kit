---
name: video-colagem-oney
description: Edit a talking-head recording in Oney Araujo's "colagem" (collage) style — vertical Reels (1080x1920, Instagram safe box) or horizontal (1920x1080). Every sentence becomes an object; real people appear as cut-out stickers/photo cards the moment they are named; takeover cards over the presenter (kept sharp, lightly dimmed — never blurred); big titles BEHIND the head (person matte); name reveals with an arched title over a cut-out; stacked thumbnail walls; real news prints on grid paper; items stacked with glowing blue arcs; neon red X; glow flash + hand-drawn arrow on a real prop; phone mockup whose screen changes per clause; light flashes and whooshes; short caption chunks at chest height with key words big, in Advercase; low SFX and smooth motion. Use when the user says /video-colagem-oney", "estilo colagem", "vídeo com esquemas", "muito animado / muito ilustrado". Other looks - reel-oney (phone), reel-editorial-oney (serif), reel-explicativo-oney (news band), anuncios-oney (ads).
---

# Vídeo colagem

**The one rule:** every sentence becomes an OBJECT doing something, entering on (or 0.1–0.5 s before) the
word that names it. Something new happens every 1–2.5 s. When a real person, brand or place is named,
its real image is on screen. Text is never decoration: captions carry the speech, titles carry concepts.

First read `../_perfil-oney.md` and load (or create) `perfil.json`.

## Technique catalogue (what the style looks like, second by second, in a reference 80 s reel)

| What happens | Technique |
|---|---|
| small captions; a key phrase gets a blue glow underline | caption chunk + glow line |
| cut to the named person with the NAME arched in 3D white letters behind the head, blue grid bg | name reveal |
| presenter dimmed, photo cards of the person pop in the centre, tilted, glowing white edge; red curved arrows mark people in a group photo | takeover card |
| a key concept built word by word in 3D caps at chest, blue glow | keyword title |
| white → blue light flash | transition |
| black bg, 3 stacked thumbnails sliding/focusing in (blur → sharp) | thumbnail wall |
| brand logo glowing, centred | logo hit |
| extreme zoom into the face | zoom transition |
| white GRID PAPER, real videos/news in 3D-tilted frames swapping one after another | proof prints |
| huge caps one word at a time over a card | word punch |
| captions grow BIG on the key word, lower | big caption |
| curved 3D video wall (3×3) on black, a name slides across | video wall |
| thumbnails stacked vertically, each with a big view count, joined by GLOWING BLUE ARCS, camera scrolls, ends on a TOTAL | stacked items + arcs |
| dark UI canvas: a product/lesson page mock with screens swapping inside | product mock |
| CTA pill "Comente: PALAVRA pra receber o link na sua DM" (white box, keyword in a red tag) stays to the end | persistent CTA |

**Captions:** 2–3 words per chunk (≤ 18 chars), **Advercase Bold** 58 px white with a THIN subtle outline
(3 px rgba(0,0,0,.55) + soft shadow), no box, hard swap, at the chest and steady; the punch word of a sentence
becomes a BIG chunk (96 px, red/blue glow or yellow) on its own. On white grid paper the captions switch to dark
text (`--capc`). `scripts/build-index.mjs` makes them from `assets/emphasis.json`.

**Sound:** music bed under the voice, whoosh on every scene change, hit on stamps/X, pop on chips, tick on list
items — all LOW (sfx.json volumes 0.1–0.2). Generate SFX locally with ffmpeg (see Workflow) — no licence issues.

## Vertical layout (Instagram safe box)

Safe box **x 65–1015, y 270–1248** on 1080×1920 (Meta Reels guide: 14 % top, 35 % bottom, 6 % sides).
Text and key images inside it; only backgrounds bleed. Measure the presenter per video with `head-top.mjs`.
- **Top zone** y 280 → head top: chips, stickers, titles above/behind the head.
- **Takeover zone** y 280–1080 centre: cards/scenes over the presenter. **No blur on the presenter**: keep them
  sharp, only dimmed to brightness .72; lists/checklists sit on an opaque dark `.panel` (.94) so text never floats
  over the face.
- **Captions** at the chest, under the chin and above y 1248.

## Toolkit (helpers in `template/index.vertical.example.html` — a full example from the course author)

`punch(t, scale)` reframe · `blurIn/blurOut` takeover · `flash/leak` light transitions · `pop/rise/slideX`
entrances · `tilt` 3D card in + slow swing · `swapCard` print → next print · `stamp` big red stamp + `shake` ·
`draw` SVG stroke (arrows, X, arcs) · `out` exit with hard kill. Components: `.bh` title behind the head
(inside `#stage` between `#cam` and `#fg`), name-reveal scene (`.navy` + arched SVG `textPath` + cut-out),
`.card` / `.card.print`, `.stick` sticker (white outline), `.chip` (blue / red / yel / white), `.stamp`,
`.fn` stacked items + arcs, `.panel` + `.row` checklist (✅/❌), `.phone` mockup with scrolling `.feed`
and a live mini copy of `clean.mp4`, IG profile card (Seguir → Seguindo), product card + "LINK NA BIO".
The example's images are not included: rebuild every scene with the user's own story and sources.

## Rules for this style
- Images of every person named, all the time; first seconds = faces/brands people know.
- Insertions dense in explanatory lists (stacked items with photos).
- Neutral on politics: no mocking/praising; real prints prove claims; no invented numbers.
- When a real person is used only "illustratively", tag it `Imagem ilustrativa` and flag it in the hand-off.
- Use only images with a clear source (Wikimedia Commons / Openverse via `find-photos.py`, real news prints,
  the user's own files) and list them in `SOURCES.md`.
- Cut every pause, stutter and repeated sentence (keep the LAST, corrected take). When the user RE-SAYS a sentence
  to correct its meaning, keep only the corrected one — read the transcript for meaning, not only identical words.
- Motion SMOOTH, not jumpy: soft flashes (≤ .45), gentle zooms (0.7 s inOut), small shake, back.out(1.3) pops.

## Speed rules (students may have slow PCs)
- The matte (titles behind the head) runs on the CPU: ~3 min per minute of video on a good PC, more on a slow
  one. Tell the user before starting it, and run it only once per final cut.
- Do not render full drafts just to look: `npx hyperframes snapshot --at t1,t2,… -o snapshots`. Render once.
- Before each slow step, tell the user in one short Portuguese line what is running.

## Workflow (run from the kit root)

`S=.claude/skills/video-colagem-oney/scripts` · `X=.claude/skills/reel-explicativo-oney/scripts` ·
`E=.claude/skills/reel-editorial-oney/scripts` · `PY=~/.venvs/whisper/Scripts/python.exe` (Mac: `~/.venvs/whisper/bin/python`)

1. **Scaffold + transcribe** (vertical): `node $X/new-reel.mjs "<video>" <slug>`. Horizontal: same but the
   scaffold's crop is 9:16 — make a 1920×1080 raw.mp4 and set width/height 1920×1080 in the build.
2. **Cut**: `assets/keeps.json` → in `assets/`: `$PY ../../../$X/tight-cut.py cut.mp4` (sound-based; a keep
   with `"raw": true` is kept verbatim for soft onsets like a whispered "Se"). Optional 1.05x speed-up →
   `clean.mp4` (see reel-explicativo-oney), else rename cut.mp4 to clean.mp4. Re-transcribe
   (`$PY ../../../$E/transcribe-local-whisper.py clean.mp4 transcript.json`) AND check every splice in ONE call
   (`… clean.mp4 --windows t1,t2,…`): stutters only show up there.
3. **Matte** (titles behind the head): in `assets/`: `$PY ../../../$S/matte-person.py clean.mp4 fg.webm`
   (downloads the matting model on first use) → `node ../../../$S/head-top.mjs fg-matte.mp4`.
4. **Assets** → `assets/photos/` + `SOURCES.md`:
   people/places: `$PY $S/find-photos.py <dir> "commons|tag|termo|6"`; generic: `"openverse|tag|termo|6"`;
   contact sheet, LOOK, pick. Cut people out: `$PY $S/cutout.py in.jpg out-cut.png`.
   News proof: `node $S/print-news.mjs "<url>" assets/photos "palavra 1" "palavra 2"`. SFX:
   `ffmpeg -f lavfi -i "anoisesrc=color=pink:d=0.55" -af "highpass=f=300,lowpass=f=5500,afade=t=in:d=0.28,afade=t=out:st=0.3:d=0.25" whoosh.wav`
   (+ hit = 52 Hz sine decay, pop = 1.25 kHz 90 ms, tick = 50 ms white noise) into `assets/sfx/`.
5. **Beat plan**: map every sentence to one technique above with its entry word; check rhythm (no 2.5 s
   without a change), people named = people shown, safe box. Show the plan to the user before composing.
6. **Compose** `src/index.template.html` from `template/index.vertical.example.html` (keep CSS + helpers,
   rewrite scenes + TIMING). `assets/emphasis.json`, `assets/caption-fixes.json`, `assets/sfx.json`.
6b. **Re-cut after composing**: keep `transcript-v1.json`, re-cut, re-transcribe, then
   `$PY $S/remap-times.py assets/transcript-v1.json assets/transcript.json` (moves clips, TIMING, sfx, emphasis).
   **Then re-run the matte**: a stale fg.webm is a ghost copy of the presenter out of sync on top of the video.
   `build-index.mjs` refuses to build if fg.webm and clean.mp4 durations differ.
7. **Build + check**: `node $S/build-index.mjs` → `npx hyperframes lint` (0 errors) → snapshots at every beat
   (`npx hyperframes snapshot --at …`) → fix → render `renders/<slug>-final.mp4` → frames with the safe box
   (`node $S/beat-sheet.mjs <mp4> <prefix> t1 t2 …`).
8. **Hand-off** (Portuguese, short): path, cuts made, sources, illustrative uses, open points. Never publish.
