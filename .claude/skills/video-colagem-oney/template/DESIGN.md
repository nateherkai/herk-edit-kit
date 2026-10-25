# Design — collage video, Oney style (video-colagem-oney)

## Style Prompt
Horizontal explainer with two worlds. A: the presenter in a dark, cinematic room with practical lights,
and objects that appear in his space (annotation with leader line, 3D object, prop with glow and
hand-drawn arrow, a screen whose content changes). B: the explanation acted out by B&W paper cut-outs
on an off-white vignetted page, one crimson accent, handwritten tape labels, a condensed crimson title
stamp at the payoff. Every sentence is an object doing something. No running captions.

## Canvas
1920 × 1080, 30 fps. Safe margin 96 px. Mode A annotations top-left (x 96–700, y 120–300).

## Colors
- `#ffffff` — annotation text, leader lines, hand-drawn arrows (mode A)
- `#5b7cff` — mode A keyword accent (one word per annotation)
- `#ff2a2a` + glow — neon X / strike
- `#8dff6a` — prop glow flash (one frame burst)
- `#e9e7e3` — mode B paper; vignette to `#5a5550` at corners
- `#9e1b2c` — mode B accent: clock sector, eye bar, tape, title, duotone
- `#1a1a1a` — sticker offset shadow

## Typography
- Annotation: Inter Regular 56 px with Inter Bold keywords, 2 lines max, tight leading.
- Tape label: handwritten marker caps 40 px, white on crimson tape, rotated −3°.
- Title stamp: condensed heavy caps (Anton / Bebas Neue), crimson, 150–190 px, 2 lines, ▶ beside it.

## Motion
- Mode A: word-by-word reveal; object pop with overshoot (back.out); pull-out 0.5 s power3.inOut into
  the screen rect; neon X two strokes in 0.4 s; glow 0.25 s; arrow draw 0.3 s.
- Mode B: rise from bottom edge, tear (two halves rotate apart ±8°), falling bills, whip pan between
  scenes, slow push while held. White flash 2–3 frames on A→B.

## What NOT to Do
- No running captions, no emojis, no Advercase, no yellow highlight words.
- No flat vector icons or infographic boxes in mode B — photos cut out as stickers.
- Never cover the face in mode A. Never hold a collage still more than ~2 s.
- Max one accent color per mode.
