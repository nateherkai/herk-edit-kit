---
name: edit-video
description: Edit a raw talking-head video through transcription, silence trimming, mistake review, visual storytelling, motion graphics, and verified HyperFrames rendering. Use for a complete edit; route a single requested operation directly to its specialist skill.
---

# Edit a video

Keep each project in `video-projects/<slug>/`, preserving the source recording.
Read the workspace guide and the project's brief or DESIGN.md. If a direction is
missing, propose a style from `style-library/registry.json` based on the footage.

1. Inspect duration, streams, and source resolution with ffprobe. Copy the source
   into the project's assets or reference an explicitly provided local path.
2. Read `docs/TOOLS-AND-API-KEYS.md` before service setup. Reuse a matching word
   transcript. Otherwise default to local Whisper:
   `node scripts/transcribe-local.mjs <source>` (offline, already normalized).
   Use `node scripts/transcribe-elevenlabs.mjs <source>` only on request.
   Check available credentials or local dependencies. Explain uploads and costs
   before any service call whose authorization is still missing.
3. Read `../cut-silences/SKILL.md`. Produce an EDL and a retimed transcript, and
   render the silence pass when editing is authorized.
4. Read `../cut-mistakes/SKILL.md`. Inspect candidates in context and preserve
   intentional emphasis. Record the reviewed cuts. If no mistakes need cutting,
   carry forward the silence output. Match every transcript to its actual video.
5. Read `../video-storytelling/SKILL.md` for the visual arc and
   `../hyperframes-video-beats/SKILL.md` for overlays. Write a beat sheet with
   transcript anchors, one visual idea per beat, and deliberate callbacks.
6. Read `MOTION_PHILOSOPHY.md`, `../hyperframes/SKILL.md`, and relevant GSAP
   references before authoring. Use `../style-library/SKILL.md` to select or
   adapt a card. Localize every asset used by the composition.
7. Run preflight and HyperFrames lint from the project, plus the transcript-sync
   validator for anchored sub-compositions. Review Studio before the draft.
8. Render a draft, inspect encoded frames and transitions, and listen across cut
   boundaries. Check face framing, text legibility, black frames, and A/V sync.
   Resolve failures before the final render. Follow any review approvals already
   provided; do not repeat approval requests for the same authorized action.

Deliver the final MP4 path, edit decisions, retimed transcript, composition,
and `VERIFY.md` describing what was checked and any remaining limitations.
An automated detector proposes edits; editorial judgment remains necessary.
