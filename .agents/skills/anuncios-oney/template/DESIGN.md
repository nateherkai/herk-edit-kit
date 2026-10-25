# Design — Oney ad style (anuncios-oney)

## Style Prompt
Talking-head ad. The speaker stays full-frame. The first ~5 s carry ONE headline above the head
(Advercase Bold, white line + yellow line) and nothing else. After that, the space above the head
shows an animated schematic of what he is saying — flows, before/after, não ✕ / sim ✓, mock editor
and app UIs, real frames and prints — one idea at a time, changing on the spoken word. The schematics
illustrate; they do not repeat the sentence (word-by-word captions already do). Labels stay 1–3 words.
Short, confident entrances; nothing covers the face.

## Colors
- `#ffffff` — type
- `#ffd21f` — headline accent, badges, travelling dots, charts
- `#d97757` — Claude node / AI elements
- `#ff453a` ✕ stamps, problems · `#30d158` ✓ stamps, results · `#5ac8fa` / `#e535e5` secondary UI accents
- `rgba(0,0,0,.66)` → transparent — top scrim; panels `rgba(16,16,19,.92)`
- IG ring `#feda75 → #d62976 → #4f5bd5`

## Typography
- Advercase Bold — headline (90–125 px), schematic titles and labels, captions (46 px)
- Arial bold — UI text inside mock apps (prompts, file names, chips)

## Safe box (Meta Reels ads)
- 1080×1920: text only inside x 65–1015, y 270–1248 (14 % top / 35 % bottom / 6 % sides clear)
- Decoration (scrim, student wall behind the speaker) may bleed past it

## What NOT to Do
- No schematic in the first ~5 s (headline only); no text beat that just repeats the caption
- No text, number, badge, CTA or caption outside the safe box
- No overlay below the head except captions; never cover the face
- No invented logos, covers or follower numbers (use perfil.json and the user's real prints)
- No long holds without a change; no flashing or shake effects
