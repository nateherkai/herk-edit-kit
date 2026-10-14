# From recording to finished edit

## 1. Create a project and transcribe

From the repository root run `npm run new-video -- my-video`. Put your recording
at `video-projects/my-video/assets/raw.mp4`. Preserve this original.

```sh
node scripts/transcribe-elevenlabs.mjs video-projects/my-video/assets/raw.mp4
```

This is Nate's default and uploads audio to ElevenLabs using your key and credits.
You may choose OpenAI Whisper, local Whisper, or another provider instead; see
[provider setup and transcript normalization](TOOLS-AND-API-KEYS.md).
You can also supply an existing word-level
JSON transcript with `words: [{text, start, end}]` and `audio_duration_secs`.

## 2. Remove dead air

```sh
node .agents/skills/cut-silences/scripts/cut-silences.mjs video-projects/my-video/assets/raw.json --video video-projects/my-video/assets/raw.mp4 --out-dir video-projects/my-video/assets --output video-projects/my-video/assets/silenced.mp4 --apply
```

The retimed transcript is `raw.silence-transcript.json`. Tune gap and breathing
parameters in the skill; do not remove pauses that carry meaning.

## 3. Review mistakes

```sh
node .agents/skills/cut-mistakes/scripts/find-cut-candidates.mjs video-projects/my-video/assets/raw.silence-transcript.json --out-dir video-projects/my-video/assets
```

Read each proposal against the speech. Write reviewed decisions to
`approved-cuts.json` using `{ "cuts": [{ "start": 1.2, "end": 1.5, "reason": "stutter" }] }`.
These times are on the SILENCED timeline. Empty cuts are valid.

```sh
node .agents/skills/cut-mistakes/scripts/apply-cuts.mjs video-projects/my-video/assets/raw.silence-transcript.json --cuts video-projects/my-video/assets/approved-cuts.json --video video-projects/my-video/assets/silenced.mp4 --out-dir video-projects/my-video/assets --output video-projects/my-video/assets/clean.mp4 --apply
```

Use `raw.mistakes-transcript.json` alongside `clean.mp4`. Copy that transcript to
the project's `assets/transcript.json` for beat validation. Never use raw timings
against the cleaned video. Claude users can substitute `.claude` for `.agents`.

With `--video`, each cut edge is snapped to the quietest point near the approved
time so it never lands on the next word's first syllable (`--no-snap-audio` to
disable). For cutdowns and short ads pulled out of a long recording, use
`node scripts/cut-phrases.mjs <project>` with a `spec.json` of phrases and
ground-truth windows; it cuts, assembles, and re-transcribes the result to diff
it against the intended text.

## 4. Design the visual layer

Read video-storytelling and the motion philosophy. Fill a beat sheet with the
spoken anchor, on-screen idea, visual, entry time, and callback. Pick a style and
copy cards with their CSS/assets into your composition. Preserve the speaker's
face and use a non-timed wrapper for camera reframing. See style-library skill.
The graph-paper template is a background; it needs your story content on top.

## 5. Check, preview, and render

```sh
node scripts/preflight.mjs video-projects/my-video
node scripts/validate-beat-sync.mjs video-projects/my-video
cd video-projects/my-video
npx hyperframes lint
npx hyperframes preview
```

Run beat-sync only for anchored external sub-compositions; it fails when none
are present. For inline compositions, check timing manually. Review Studio, then
render a draft. Inspect encoded frames at hero moments and transitions, and
listen at joins. Fix problems and write VERIFY.md before a standard render.
Publication is a separate action requiring the student's instruction.
