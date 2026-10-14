---
name: cut-silences
description: Agent 1 of the video editing pipeline. Removes silences and dead air from a talking-head recording. Use when asked to cut silences, trim pauses, remove dead air / gaps, or tighten the pacing of a raw video, given a word-level transcript. Produces an edit list (EDL), a re-timed transcript for downstream agents, and optionally the cut video via ffmpeg. Does NOT cut mistakes, repeats, or false starts — that is the cut-mistakes agent.
---

# Cut Silences (Pipeline Agent 1)

First step of the automated edit. Takes a raw recording + its word-level transcript and removes **only silence**: dead air before the first word and after the last word, plus inter-word pauses longer than a threshold (trimmed down to a natural breath, never a hard zero-gap). It leaves the speaker's words untouched — false starts, retakes, and stutters are the **cut-mistakes** agent's job (Agent 2).

This agent is deterministic and transcript-driven, so its output (`*.silence-transcript.json`) feeds cleanly into the next agents and the beat-sync validator.

## When to use

- "cut the silences", "trim the pauses", "remove dead air", "tighten the pacing"
- As the first stage of the master edit workflow, right after transcription.

## Prerequisites

A word-level transcript JSON. Either the ElevenLabs Scribe shape
(`{ words: [{ text, start, end, type }], audio_duration_secs }`) or a generic
`{ words: [{ text, start, end }] }`. Generate one with the workspace transcriber:

```bash
node scripts/transcribe-elevenlabs.mjs path/to/raw.mp4    # -> path/to/raw.json
```

## Usage

```bash
# 1) Plan only — compute the cut, write EDL + re-timed transcript (no video touched)
node .agents/skills/cut-silences/scripts/cut-silences.mjs <transcript.json> \
  --out-dir video-projects/<slug>/assets

# 2) With a video — also write the ffmpeg command (still does not render yet)
node .agents/skills/cut-silences/scripts/cut-silences.mjs <transcript.json> \
  --video video-projects/<slug>/assets/raw.mp4 --out-dir video-projects/<slug>/assets

# 3) Render the cut video (local ffmpeg, re-encode, A/V kept in sync)
#    add --apply to actually run ffmpeg
node .agents/skills/cut-silences/scripts/cut-silences.mjs <transcript.json> \
  --video video-projects/<slug>/assets/raw.mp4 --apply \
  --output video-projects/<slug>/assets/edited-silenced.mp4
```

### Options

| Flag | Default | Meaning |
| --- | --- | --- |
| `--video <path>` | — | Source video; enables the ffmpeg command / render |
| `--out-dir <dir>` | next to transcript | Where outputs are written |
| `--output <path>` | `<video-stem>.silenced.mp4` | Cut-video path |
| `--gap <s>` | `0.55` | Minimum pause treated as trimmable silence |
| `--head-pad <s>` | `0.22` | Silence kept before the first word |
| `--tail-pad <s>` | `0.34` | Silence kept after the last word |
| `--apply` | off | Actually run ffmpeg to render the cut |

## How it decides (the silence rules)

- Pauses below `--gap` (0.55s) are left alone — natural speech rhythm.
- For a trimmed pause, a **natural breath is kept**, scaled by context: `0.24s` for long pauses (≥2s), `0.20s` after a sentence ender (`. ! ?`), `0.14s` otherwise. The kept breath is biased slightly toward the end of the previous phrase.
- Head/tail dead air is trimmed to `--head-pad` / `--tail-pad`.
- Delete ranges are merged; keep ranges are the complement. The cut is rendered with an ffmpeg `trim`/`atrim` + `concat` filtergraph (written to a `*.silence-filter.txt` script and passed via `-/filter_complex`), so video and audio stay in sync.

## Outputs (written to `--out-dir`)

| File | Purpose |
| --- | --- |
| `<stem>.silence-edl.json` | Keep/delete ranges, durations, params — the edit list |
| `<stem>.silence-transcript.json` | Words re-timed onto the edited timeline (feeds Agent 2 + beats) |
| `<stem>.silence-decisions.md` | Human-readable summary + largest pauses trimmed |
| `<stem>.silence-filter.txt` | The ffmpeg filtergraph (only with `--video`) |
| `<video-stem>.silenced.mp4` | The cut video (only with `--apply`) |

The JSON summary printed to stdout includes `removed`, `removedPct`, range counts, and output paths — useful for the master workflow to log and chain.

## Tuning notes

- Talking-head YouTube default (`--gap 0.55`) removes roughly 15-20% of a typical raw take as pure silence. Lower `--gap` for a punchier, faster cut; raise it to preserve more natural breathing room.
- If a cut feels too aggressive at sentence boundaries, raise the sentence-break breath, or raise `--gap`.

## Hand-off to the next agent

Pass `<stem>.silence-transcript.json` (and the `silenced.mp4` if rendered) to the **cut-mistakes** agent.

## Retimed-transcript precision

`<stem>.silence-transcript.json` only lines up with `silenced.mp4` if every
cut lands on a real frame. Two things have to hold, and originally neither
did:

1. Delete-range edges are snapped to the nearest source frame (via
   `ffprobe`'s `r_frame_rate`, only when `--video` is given) before any
   retiming math.
2. The filtergraph writes those times at microsecond precision. At
   millisecond precision a 30fps boundary (33.333…ms) rounds past the frame's
   real timestamp, ffmpeg drops the boundary frame, video runs one frame
   short of its sample-exact audio, and `concat` shifts every later segment
   by a few ms — always in the same direction. Across a few hundred cuts that
   compounded to 1–3s.

Measured on one identical 45-cut clip: pre-fix drift 0.27s at the end of the
file; snap-only (ms precision) 0.31s — no improvement; snap + µs precision
0.01s, with the rendered duration matching the transcript's claim exactly.

Still re-transcribe the final render and diff it against the intended text
before calling any downstream cut done. Transcription timing itself has
~10–100ms of jitter, variable-frame-rate sources are not handled, and a
locked-off single-camera shot looks identical a second early in a frame
strip — that check is the only thing that catches a uniform time offset.
