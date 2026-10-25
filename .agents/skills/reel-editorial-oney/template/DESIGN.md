# Design — the creator's editorial reel (reel-editorial)

## Style Prompt
Talking-head reel that openly looks *edited*: calm, polished, magazine-like. One lowercase word at a time
in a neo-grotesk sans in the middle of the frame; the words that carry the meaning switch to a pale-yellow
condensed italic serif. Hard cuts between camera angles and punch-ins every sentence or two. Floating
rounded cards, thumbnail bursts, a film strip, a grid wall of past reels, a handwritten aside with a drawn
arrow, and small UI moments (a text toolbar that restyles a phrase). Every visual illustrates the exact
words being said and leaves within a sentence.

## Colors
- `#ffffff` — sans type, handwritten notes
- `#f4e27c` — serif "voice" words (pale butter yellow, never saturated `#ffd21f`)
- `#0d0d0d` — dark cards
- `#f2ede6` — grid-wall paper behind thumbnails
- Shadows: soft, `0 3px 22px rgba(0,0,0,.30)` on type, `0 24px 60px rgba(0,0,0,.38)` on cards

## Typography
- Sans: Inter SemiBold, lowercase, tracking −0.035em — captions 92 px, stack lines 104 px, asides 42 px
- Serif voice: Instrument Serif Italic — 124–132 px
- Hand: Caveat Bold — notes 86 px

## What NOT to Do
- No black outlines on captions, no boxes or scrims behind words
- No Advercase, no `#ffd21f` (those are the reel / anuncio looks)
- No more than ~1 serif word per sentence, or the emphasis stops meaning anything
- No overlay covering the face; cards live beside or above the head
- No bounce on text; only thumbnails get `back.out`
