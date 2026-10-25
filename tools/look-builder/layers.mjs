// Behind / in front of the person.
//
// An effect marks the parts that pass BEHIND the presenter with class="back" (a part inside a back block that must
// still sit in front gets class="front"). The stage and the real test render the whole look twice:
//   video  →  .lb-back copy (only .back parts visible)  →  the person cut out (matte)  →  .lb-front copy (the rest)
// Both copies run the same timeline, so every effect animates in sync without knowing about layers.
// Without a matte (`.matte-on` absent) the front copy shows everything, .back parts included, as before.
// Full-frame backdrops also carry class="hole": without a matte they open a soft oval around the person
// (--hx/--hy/--hrx/--hry set inline); with a matte the hole closes and the real cut-out sits on top.
export const LAYER_CSS = `
.matte-on .lb-front .back,.matte-on .lb-front .back *{visibility:hidden!important}
.matte-on .lb-front .back .front,.matte-on .lb-front .back .front *{visibility:visible!important}
.lb-back *{visibility:hidden!important}
.lb-back .back,.lb-back .back *{visibility:visible!important}
.lb-back .back .front,.lb-back .back .front *{visibility:hidden!important}
.el .hole,.el.hole{-webkit-mask:radial-gradient(ellipse var(--hrx,40%) var(--hry,30%) at 50% var(--hy,60%),transparent 60%,#000 80%);mask:radial-gradient(ellipse var(--hrx,40%) var(--hry,30%) at 50% var(--hy,60%),transparent 60%,#000 80%)}
.matte-on .el .hole,.matte-on .el.hole{-webkit-mask:none;mask:none}
.mnote{display:none!important}
`;
// inline vars for a .hole backdrop (centre and radii follow the framing)
export const holeVars = (S) => `--hx:50%;--hy:${S.headTop + 700}px;--hrx:${S.W * 0.44}px;--hry:${S.H * 0.5}px;`;
// does this rendered HTML have anything that passes behind the person?
export const hasBack = (html) => /class="[^"]*\bback\b/.test(html || "");
