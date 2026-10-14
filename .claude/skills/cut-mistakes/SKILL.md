---
name: cut-mistakes
description: "Agent 2 of the video editing pipeline. Finds and removes spoken mistakes — stutters, repeated words, false starts, and retakes (re-recorded lines) — from a talking-head recording. Use after cut-silences, when asked to cut mistakes, remove stutters / repeats / filler restarts, clean up flubs, or keep the best take. Works review-gated: it proposes every cut with context and a reason for approval, then renders only the approved cuts via ffmpeg. Requires a word-level transcript."
---

# Cut Mistakes & Repeats (Pipeline Agent 2)

Second step of the automated edit, run after **cut-silences**. It removes the things a human editor cuts on a second pass: stutters ("the the", "I- I-"), immediately repeated words, false starts (an abandoned phrase that restarts), and retakes (a line re-recorded — keep the clean take, drop the botched one).

Deciding what counts as a mistake is **judgment, not a formula** — emphatic repetition ("never, never") and rhetorical doubling ("the first piece is, is this…") look identical to a stutter mechanically. So this agent is **review-gated by default**: it surfaces candidates with full context; the agent (and the user) decide; only approved cuts are rendered.

## When to use

- "cut the mistakes", "remove stutters / repeats", "clean up the flubs", "keep the best take", "cut false starts"
- As the second stage of the master edit workflow, on cut-silences' output.

## The three-part flow

### 1. Find candidates (mechanical)

```bash
node .claude/skills/cut-mistakes/scripts/find-cut-candidates.mjs \
  <silence-transcript.json> --out-dir video-projects/<slug>/assets
```

Input is normally Agent 1's `<stem>.silence-transcript.json`, so cuts land on the already-silenced timeline. Writes:

- `<stem>.cut-candidates.json` — structured candidates (type, confidence, proposed `cut` range, `removes`/`keeps` text, context, recommendation)
- `<stem>.cut-candidates.md` — readable proposal

Candidate types: `stutter` (immediate word repeat), `retake` (duplicate/near-duplicate segment via Jaccard similarity), `false_start` (short abandoned phrase that restarts).

### 2. Review (the gate — REQUIRED)

Read each candidate **in context** and decide keep-or-cut. The mechanical detector cannot tell intentional emphasis/rhetoric from a real flub, so do not trust `recommend` blindly — read `removes` + `context`. Common false positives: emphatic repetition ("it's never, never hands-off"), copula-then-question ("the piece is, is this…"), listing.

Present the candidates to the user with a recommendation per item; collect approvals. Write the approved cuts to a file:

```json
{ "cuts": [ { "start": 100.93, "end": 101.06, "reason": "I- false start" }, ... ] }
```

(`start`/`end` in seconds on the input transcript/video timeline. You can widen a candidate's range — e.g. for a retake, cut from the botched take's start to the clean restart.)

### 3. Apply approved cuts

```bash
node .claude/skills/cut-mistakes/scripts/apply-cuts.mjs \
  <silence-transcript.json> --cuts approved-cuts.json \
  --video video-projects/<slug>/assets/edited-silenced.mp4 \
  --output video-projects/<slug>/assets/edited-clean.mp4 --apply
```

Writes the EDL, a re-timed `<stem>.mistakes-transcript.json` (feeds the motion-graphics agent + `validate-beat-sync.mjs`), a decisions log, and — with `--apply` — the cut video (ffmpeg trim+concat, A/V in sync). Drop `--apply` for a dry run.

With `--video`, every cut edge is **audio-snapped** before frame snapping (see below); pass `--no-snap-audio` to cut at the exact approved times instead.

## Audio-guided edges (why cuts at word times clip the next word)

ASR word timestamps are 50–150ms coarse, and a speaker usually starts the next word inside that window. A cut placed at the approved `end` (which is normally a word's `end`) therefore lands on the first syllable of the following word, and a cut at a word's `start` can leave the tail of the previous one — heard as "the transition is halfway through a word". `apply-cuts.mjs` now moves each delete edge to the quietest 30ms nearby (searching up to 150ms outward, 30ms inward, on a 16 kHz mono extract of the source), and never past the neighbouring kept words. The EDL records both `requested_*` and snapped times. The helper lives in `scripts/lib/audio-edges.mjs` and is shared with `scripts/cut-phrases.mjs`.

Measured on a 41-cut set: last-80ms energy before each cut went from speech level (≈-30 dB) to -31…-78 dB; the few that stay near -31 dB are true no-gap boundaries where the cut sits inside the last word's own decay rather than on the next word's onset.

## Reviewing the result

Use the shared review tool to eyeball the cuts and spot-check boundaries:

```bash
node scripts/build-edl-review.mjs <stem>.mistakes-edl.json \
  --original video-projects/<slug>/assets/edited-silenced.mp4 \
  --edited   video-projects/<slug>/assets/edited-clean.mp4 \
  --output   video-projects/<slug>/assets/mistakes-review.html
npx serve . -p 8080 -n
```

## Retimed-transcript precision (read before reusing timestamps downstream)

`<stem>.mistakes-transcript.json` only lines up with the rendered cut if
every cut lands on a real frame. `apply-cuts.mjs` now snaps each cut edge
to the nearest source frame (via `ffprobe`'s `r_frame_rate`, only when
`--video` is given) *and* writes the filtergraph times at microsecond
precision. The second half matters: at millisecond precision a 30fps
boundary (33.333…ms) rounds past the frame's real timestamp, ffmpeg drops
the boundary frame, video runs a frame short of its sample-exact audio, and
`concat` shifts every later segment a few ms in the same direction. Snapping
alone, with ms-precision output, measured **no improvement** over the
original (0.31s vs 0.27s drift at the end of an identical 45-cut clip);
snap + µs precision measured 0.01s. See the same section in the
`cut-silences` skill for the full comparison.

Because this stage runs on `cut-silences`' output, its input transcript
carries whatever drift that stage left behind — both scripts must be on the
fixed version for the final transcript to be trustworthy. And still
re-transcribe the final render and diff it against the intended text before
calling any downstream cut done: transcription timing has ~10–100ms jitter,
variable-frame-rate sources are not handled, and a locked-off single-camera
shot looks identical a second early in a frame strip.

## Notes

- A very clean delivery may yield few or zero real cuts — that's a valid outcome; don't cut natural speech to hit a quota.
- Cuts between two spoken words are hard joins. With audio snapping on they land in the gap, not on a word; for tighter audio a 20-30ms fade can be added later.
- Cutting *pieces* out of a long recording (short-form ads, cutdowns)? Use `scripts/cut-phrases.mjs` instead of hand-picking timestamps: name the first and last words of each phrase, transcribe short windows of the source itself for ground truth, and let it snap, cut, assemble, and re-transcribe-and-diff.
- Hand the `mistakes-transcript.json` + the clean video to **Agent 3 (motion graphics / tiered cards)**.
