# DESIGN.md — Nutrition Rx Tutorial

## Style Prompt

iOS 26 liquid-glass cards layered over a lightly dimmed talking head. Warm cream frosted glass, forest-green accents, terracotta secondary hits. Light canvas — the talking head is the hero, the cards are surgical callouts that feel native to the device era. Every card is a floating pane: blurred, warm, with an inner-highlight lip at the top edge and a 1px white border. Motion is confident and fast — cards snap in, content staggers up, nothing floats aimlessly.

## Colors

| Role | Hex | Usage |
|------|-----|-------|
| Background glass fill | `rgba(237,232,224,0.14)` | Card background, all beats |
| Forest green | `#3d6b52` | Primary accent — numbered badges, highlight underlines, CTA text |
| Terracotta | `#c4776a` | Secondary accent — Beat 3 label, decorative lines |
| White | `#ffffff` | Body text, card headings |
| Near-black | `#1a1a1a` | Beat 4 dark panel background |
| Video dim overlay | `rgba(0,0,0,0.30)` | Applied over talking head for all beats except Beat 4 where it deepens |

## Typography

- **Display / titles:** `Instrument Serif` — used for Beat 1 title card and Beat 4 "Thanks for watching"
- **Body / captions / lists:** `Inter` — used for subtitles, numbered list items, labels

## Liquid Glass Card Recipe (copy-paste)

```css
.glass-card {
  background: linear-gradient(135deg,
    rgba(237,232,224,0.18) 0%,
    rgba(237,232,224,0.10) 40%,
    rgba(237,232,224,0.06) 70%,
    rgba(237,232,224,0.12) 100%);
  backdrop-filter: blur(22px) saturate(1.18);
  -webkit-backdrop-filter: blur(22px) saturate(1.18);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.32),
    0 8px 40px rgba(0,0,0,0.20);
  border: 1px solid rgba(255,255,255,0.24);
  border-radius: 24px;
}
```

## What NOT to Do

1. No chrome gradient text — text is `#ffffff` or `#1a1a1a`, not gradient-clipped
2. No dark canvas behind the cards — talking head must remain visible
3. No vignette over the video — the glass cards provide all the visual focus
4. No flat white card backgrounds — always use the glass recipe with backdrop-filter
5. No bounce eases on cards — cards use `expo.out` for authority, not playfulness
