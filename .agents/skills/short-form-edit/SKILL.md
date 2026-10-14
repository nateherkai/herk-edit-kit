---
name: short-form-edit
description: Turn talking-head footage into a finished reel, YouTube Short, or short advertisement with curiosity-led openings, earned payoffs, story-driven cuts, transcript-synced motion graphics, moving B-roll, captions, subtle music, and synchronized sound effects. Use for short-form editing; use edit-video for long-form videos and cut-silences for pause removal alone.
---

# Short form edit

Input: a source-video path and an optional reference-reel path.

Deliver the requested formats and the editable project. Default to 1080x1920;
when requested, also compose 1920x1080 with its own framing and text placement.
Verify each aspect ratio independently, including its opening and CTA. The edit must tell the
speaker's story through images, timing, and sound. Virality is an aspiration, not
a result that editing can guarantee. Work locally unless delegation is requested.

## Priority

The first creative gate is: **"In the first 3 seconds is someone convinced they
need to watch until the end?"** Establish a specific reason to stay and earn its
payoff inside the video. Effects, asset volume, and production polish come after
this test. Treat the answer as editorial judgment until audience data exists.

## House style and notes

Read `docs/EDITING-PLAYBOOK.md` before planning. It holds Nate's measured reel
style (pacing, layouts, captions, B-roll order, sound palette), the raw-reel,
long-to-Short, and narrated-explainer variants, and the lessons that cost time.
Use it as the default when the user gives no style; the user's brief wins.

When the user gives a note on a draft, fix the edit, then offer to write the
note into the relevant skill or reference as a rule, check, or script change, so
the next edit starts from it. Record the note and the resulting rule together.

## Establish the edit

1. Read the scoped workspace guide, `MOTION_PHILOSOPHY.md`, and the HyperFrames
   and video-storytelling skills before composition work. Use the user's brief
   over aesthetic defaults. Keep all artifacts in `video-projects/<slug>/`.
2. Probe the supplied source and reference: duration, dimensions, frame rate,
   audio, and existing transcript identity. Preserve originals. Transcribe with
   the student's chosen provider; ElevenLabs Scribe is Nate's default. Read
   `docs/TOOLS-AND-API-KEYS.md` for Whisper alternatives, word-timestamp
   normalization, credentials, and service costs. Never substitute an older take.
3. When a reference is supplied, inspect the entire reel using contact sheets,
   individual full-size frames, and contiguous frame strips at representative
   transitions. Review its sound when an audio-capable review surface is available.
   Save `REFERENCE-ANALYSIS.md` with timestamped observations, inferred principles,
   and explicit limits. Do not imply you heard audio based on waveform analysis.
   Read [reference-analysis.md](references/reference-analysis.md) for the reusable
   worksheet and analysis questions. Borrow editorial mechanisms, not branded copy.
4. Before locking the concept, inspect the supplied footage, brand assets, and
   relevant source demos. Save an asset shortlist with exact usable intervals,
   visible action, consequence, provenance, and a possible story role. Let a
   distinctive source moment shape the idea. Choose what reads in one glance;
   fit the complete action and result before considering a tighter crop. A filled
   frame is not useful if the viewer cannot see what is happening.
5. Read every spoken line. Run silence and mistake tools, then manually review
   the full transcript: a zero-candidate report can miss an obvious retake.
   Remove abandoned takes, preserve meaningful qualifications and the payoff,
   and keep natural breath around joins. Save reviewed source-time cut reasons.
   Render the clean cut once and derive word timing from the actual frame-aligned
   EDL. Lock the cut after the rough animatic, before polished graphics. Every later timing change rebuilds dependent
   captions, graphics, and sound from the same map.
   When pulling phrases out of a long recording, use `scripts/cut-phrases.mjs`:
   name each phrase's first and last words, transcribe short windows of the
   source file itself for ground truth (never a retimed transcript), and let it
   snap each cut to the local audio minimum. Cutting at ASR word times plus a
   fixed pad lands on the next word's first syllable. Cut pieces with a keyframe
   every second (`-g 30`) or the renderer warns about seek failures. The script
   re-transcribes the assembly and diffs it against the intended text; do the
   same on the final render.

User authorization persists. An instruction to make a finished video and iterate
authorizes ordinary local editing and rendering. An explicit request for Kie
B-roll authorizes those generations. Resolve review gates through the current
authorization; ask only for missing approval, not again at every draft. Never post
the reel or contact anyone without explicit authorization.

## Design the emotional journey

Write `DESIGN.md` and a beat plan before HTML. Identify the hook, open loop,
escalation, evidence, payoff, and CTA. Give every shot a reason to exist.

Read [curiosity-and-entertainment.md](references/curiosity-and-entertainment.md).
Create `OPEN-LOOPS.json` with each honest viewer question, planted object,
setup time, reminders or partial answers, closure time, and the spoken evidence
that earns the closure. Default to one main loop and at most one secondary loop
open at once. Close the promised lesson before the CTA; a comment request must
not be the only answer. A recurring object alone is not an open loop: establish
what is missing or unresolved, then visibly change that state.

Build three materially different rough openings using the same truthful source
speech. Compare the first three seconds for topic clarity, curiosity, muted
comprehension, and follow-through. Choose and record the reason; do not select
only the loudest effect. Render a low-resolution moving animatic with speech and
rough sound before polishing materials. Fix predictability, missing context, or
weak payoffs at this stage. Existing approved materials can be reused, but still
review the new sequence before spending time on final rendering.

Vary rhythm by sequence: a short cluster of discoveries, a brief anticipation,
then a payoff. Preserve word timing while varying animation speed and scale.
The 1-2 second event guideline is not a metronome or permission to add filler.
Allow the speaker's expression to carry a conviction beat. For every shot record
the viewer's expectation and the new information or consequence it supplies.

Audit information duplication. Narration and captions carry the exact words;
graphics should usually show the example, relationship, evidence, or consequence.
Remove a third restatement as a headline unless deliberate emphasis earns it.
Prefer a specific product action or source detail to generic typing footage.
Do not invent a product result simply to make a more satisfying payoff.

### Treat the first three seconds as a separate edit

For each opening record the viewer benefit, unresolved question, visible evidence
by second three, and the exact payoff scene. Reject vague teasing and any promise
that this footage cannot fulfill. An advertisement may resolve a concrete example
or explain a mechanism before inviting the viewer to learn more; it must not
promise a complete tutorial and deliver only a registration CTA.

Make the first frame immediately meaningful. A surprising action, contradiction,
result glimpse, or revealing human expression can establish the tension. Choose
an impact or transition only when it sharpens that idea. A quiet impossible-looking
result can beat a loud montage. Avoid a mandatory stamp, flash, or 0.3-second effect.

Use a supplied sound reference when available. Remove recording lead-in, align
the effect's audible impact with the visual landing within two frames, and shape
its level and tail around the first words. Make the hit noticeable while keeping
speech clear; briefly dip the music if helpful. Do not make loudness the only hook.

The opening still has to work muted. Establish the topic or tension immediately,
then reveal another meaningful state within the first three seconds. Avoid an
unrelated logo bumper, added silence, repeated flashes, or an effect that delays
the argument. Match the chosen material style. Vary the device between reels;
do not automatically stamp STOP on every video.

Save a first-three-seconds shot/sound plan and inspect the encoded opening
frame by frame, including its first frame, impact, reveal, and return to the main
edit. Check that the first spoken word survives the impact mix. Record this as
a distinct opening-hook gate in the verification report.

### Build the visual world

- Choose a visual direction from the subject, audience, source material, and
  brand brief. Record why it suits this story. Documentary footage, visual comedy,
  product demonstrations, and designed objects are options, not required quotas.
  Use coherent colors, type, and transitions without imposing paper on every reel.
- Choose full speaker, split, or full supporting footage by the current attention
  target. Preserve expressions, gestures, and the evidence in each requested ratio.
- Plan rhythm by sequence: burst, anticipation, reveal, and breathing room. Treat
  1-2 seconds as a pacing diagnostic, not a cutting schedule. Keep longer holds
  when a developing action or performance earns them, and record the reason.
  Assign transitions by their editorial purpose, never by shot-index rotation.
- Escalate and release. Use short moments of relative stillness to land conviction
  or a reveal. Do not enforce the long-form 4-6-second outro on a short reel.
- Use an object callback: the unfinished model planted in the hook should resolve
  at the payoff. Show relationships and transformations, not just successive
  title cards. A viewer watching muted should still follow the central idea.
- Keep text within a phone-safe region. For 1080x1920, start with x=90..930,
  y=200..1600, reserving the right edge and bottom for social UI. Adjust captions
  to actual face position in every layout. Use short phrase groups and exact
  word onsets; keyword emphasis must preserve the speaker's wording.

For a minimal, Apple-style brief, read
[premium-motion-and-footage.md](references/premium-motion-and-footage.md).
Use restrained type, negative space, real object depth, directional light, and
soft contact shadows. Minimal composition can still have rich, purposeful motion
and sound. Do not mistake a small object on a blank slide for premium design.

### Make the reel entertaining through layers and actions

Give the eye one clear attention target. Use depth, occlusion, light, and camera
movement when they make the action easier to follow. Keep typography readable
and use dimensional treatment only when the chosen material world calls for it.
For a paper brief, inspect fibers, edges, folds, contact shadows, and perspective
in the encoded output. These are conditional craft checks, not universal style rules.

Give every extended graphic beat an action with an outcome: a key seats and a
project starts, criteria turn into checks, a card opens to reveal a result, or a
stack assembles into a system. A card such as Define good can swivel or tilt so
its edge and moving contact shadow remain visible as its criteria resolve.
Avoid settle-and-freeze title cards. Subtle secondary motion supports the main
action; identical idle bobbing applied to every object is not storytelling.

Use the supplied human-edited reference to study how attention moves: wide
context, isolated detail, interaction, visible consequence, then return to the
speaker. Before delivery ask what makes each sequence entertaining beyond looking
professional. A new heading or a new caption alone is not the answer.

Audit named people, products, and places in the transcript before storyboarding.
Use a verified portrait when recognizing a real person matters, rather than
defaulting to their name in text. Prefer their own site or an attributable source,
save provenance, and inspect the actual image. Animate the photograph as a
physical object when appropriate, with a meaningful callback. Never generate
a likeness and present it as an authentic photo. A moving portrait remains a
photographic layer and does not count as moving B-roll.

Review adjacent shots as silhouettes and actions, with headings hidden. If they
still look like the same card reveal, redesign the weaker beat. Vary mechanisms:
tear to reveal, unfold to show scale, press to create, connect to enable, process
to produce a result. Preserve a coherent world and understandable cause and
effect. Spend the strongest action on the most important spoken idea. A user's
engagement score is feedback for iteration, not a metric a validator can certify.

For product stories, seek real source material: public product pages, official
documentation, authentic screen recordings, and official logos. Record actual
scrolls, selections, or visible interactions when useful. Present real logos on
dimensional surfaces without redrawing an approximate mark or implying endorsement.
Retain source URLs and distinguish authentic product footage from illustrative
interfaces and generated B-roll. Never expose real credentials in captured UI.
An animated source screenshot may be one layer in an explanatory composition,
but it must not substitute for moving B-roll when the brief requires video.

### Verify brand assets before drawing

Never invent, approximate, trace from memory, or generate an existing brand's
logo. A radial star is not a substitute for the Claude mark. Use the exact
user-supplied asset first; otherwise obtain the asset from the brand's official
site or media kit. Search engines help locate sources, but do not establish
authenticity. Save the source URL or supplied path, original file, and checksum.
Inspect the artwork before use, preserve its shape and proportions, and animate
the authentic asset or the surface carrying it. Do not alter a logo's geometry
to create depth. Audit every logo occurrence in the final encoded reel against
its source asset, including small marks and recurring motifs. If no verified
asset is available, use plain brand-name text rather than fabricate a mark.

### Balance graphics with moving footage

Choose the mix from the story and available evidence. There is no default
graphics/B-roll percentage. Keep a duration ledger with authentic footage,
generated illustration, designed graphics, and speaker-only time; explain the
denominator and count split panels once. Captions over footage remain footage.
A still image with a camera move is a photographic layer, not moving B-roll.

Use each distinct B-roll scene only once per reel. Another crop, filename, speed,
reverse, or grade does not make it a new scene. Reusing the same selected scene
across the two requested aspect ratios is expected. Record source scene identity,
file hash, and selected interval in `assets/footage-ledger.json`; run the footage
validator below. A graphic callback must develop the original idea into a new
state and composition. It is not permission to replay footage.

Default to containing the full source frame when a tighter crop hides context.
Keep the subject, action, and consequence visible throughout the selected interval,
with captions outside that action. Inspect beginning, middle, and end in each
ratio at phone size. Dense demo text must not be required to understand a fleeting
insert; isolate a meaningful visible action or give it more time. Avoid duplicated,
blurred background video as an automatic solution for vertical framing.

Prefer a specific action with a readable consequence. Compare adjacent shots
with headings hidden: if the sequence repeats the same visual mechanism or could
belong in any AI advertisement, replace the weakest insert. Generated metaphors
can add surprise but cannot stand in for captured evidence. Prioritize authentic
human reactions where they support the story.

## Generate and assemble

1. Kie.ai is Nate's optional provider for generated moving inserts and images.
   Use the student's chosen provider or supplied assets; check its account, credits,
   and integration before generating. See `docs/TOOLS-AND-API-KEYS.md`. Verify the
   current official API schema. Save model, prompt, task ID, selected output,
   and generation state; reuse successful jobs rather than resubmitting blindly.
   Download and inspect real video files, including full-size corners throughout
   the selected interval for generated text, logos, or malformed objects. Reframe
   or regenerate defects, then verify the encoded result. B-roll must have genuine motion, not
   a still with a zoom. Static diagrams may be source assets only if the final
   animation meaningfully transforms them. Never generate fake evidence or
   imply a synthetic person is the real named person.
2. Animate graphics from the retimed words. Store each shot's anchor phrase and
   time. Bind sub-element reveals to their own spoken nouns, not arbitrary
   `index * 0.4` staggers. Target within 2 frames of word onset for captions and
   impact events, with at most 0.15 seconds of deliberate visual anticipation.
3. Use the HyperFrames timeline contract: one registered paused timeline per
   composition, full duration coverage, local assets, muted video and separate
   audio. Animate the footage wrapper. Deterministic canvas or CSS 3D is fine;
   use genuine rendered 3D when the metaphor needs it. The framework is a tool,
   not an aesthetic. Preserve editable source.
4. Source or generate an instrumental bed with clear narration space. Save its
   provenance. Normalize the voice before mixing; start the bed roughly 14-20 dB
   below voice, then adjust to the actual track. Duck under speech, fade cleanly,
   and measure the final mix. Aim around -16 LUFS and <= -1 dBTP, adapting to
   source dynamics rather than crushing them.
   When the user says music is too loud, reduce its gain relative to the reviewed
   version and save the measured change. Verify after final normalization that
   the bed-to-voice ratio is lower; a lower master level alone is not a fix.
5. Build SFX from the visual-event map. Paper impacts land on object contact;
   swipes support movement; restrained success tones support checks. Align the
   audible onset or impact peak, not just the beginning of an audio file with
   leading silence. Vary effect density and levels. Voice remains dominant.
   Score anticipation, contact, and release separately. A brief bed dip can make
   the next contact more distinct without raising its volume. Let some cuts pass
   without a whoosh. Record cue purpose and audition transitions when supported.
   A request for more SFX calls for a richer event score: paper movement, object
   contact, docking, connection, anticipation, and reveal can each have distinct
   sounds. Make meaningful contacts perceptible, vary texture and density, and
   retain quieter conviction beats. Do not substitute louder music or a whoosh
   on every cut. Inspect the actual animation landing before setting each cue.
6. Run lint and `hyperframes validate` before every render, and render with
   `--strict` so a lint error (a missing font, logo, or GSAP file) blocks the
   render instead of producing a silently broken video. Browser automation is
   headless with Pointer Lock and pointer capture disabled in every context.
   Local automated review is permitted when the user authorized autonomous
   iteration. Render a draft, inspect it, revise, then render final quality.
   If the framework capture stalls, a deterministic graphics export plus FFmpeg
   assembly is acceptable. Await local fonts before capturing canvas. Normalize
   every video input to the same frame time base before overlaying, and inspect
   every encoded cut for one-frame mismatches. Build final face crops from the
   native-resolution source rather than a downscaled editing proxy.

## Gates before delivery

Use [quality-gates.md](references/quality-gates.md). The plan validator catches
structural defects but cannot certify taste, motion, or the audio listening pass:

```powershell
node .agents/skills/short-form-edit/scripts/validate-plan.mjs video-projects/<slug>
node .agents/skills/short-form-edit/scripts/validate-footage.mjs video-projects/<slug>
```

It reads `assets/plan.json`, `assets/transcript.json`, and
`assets/edit-decisions.json`. See [plan-schema.md](references/plan-schema.md).
For another implementation, export that schema or adapt the validator explicitly;
never silently skip checks because the schema differs.

Inspect encoded hero frames for every shot at full size and phone scale. Inspect
contiguous strips across every cut and transition, plus the complete motion where
supported. Check speech joins, fresh ASR from final audio, voice/bed balance,
SFX timing, clipping, and the last syllable. Distinguish listening from signal
analysis. Record any unavailable review modality honestly.

Run a separate uninterrupted entertainment review of the animatic and final
where real-time video review is supported. Record attention-drop timestamps,
predictable sequences, unresolved promises, and reading overload in
`ENTERTAINMENT-REVIEW.md`. Fix the weakest sequences, then recheck them in context.
Automated playback completion and contact sheets are technical/visual evidence,
not a claim of uninterrupted perceptual viewing. If that modality is unavailable,
use chronological sequence strips and explicit loop-state checks, and disclose
the limit. Never manufacture retention scores or call internal hook comparisons
an audience A/B test.

Fix findings, archive superseded versions, and repeat the checks affected by each
change. Give `VERIFY.md` the actual output hash, measured results, inspected
artifacts, revisions, and unresolved limits. Do not claim passes based on code
inspection, file existence, or an empty validator result.

## Delivery

Return a playable final MP4, its absolute path, and the skill path. Keep the
composition, assets, source and retimed transcripts, EDL, shot/event plan, audio
stems, reference analysis, and QA evidence in the project. Clearly identify the
final version. Never label a draft final or claim guaranteed viral performance.
