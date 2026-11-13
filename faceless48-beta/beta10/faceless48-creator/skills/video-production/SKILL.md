---
name: video-production
description: "Create and revise Remotion talking-head edits, branded animated explainers, image/footage videos and batches using the Faceless48 Creator local plugin. Use for supplied footage or voiceover, style selection, captions, effects, previews and MP4 export."
---

# Faceless48 Creator

Work in a customer project, never inside the installed plugin. Resolve this package from this skill's directory (two levels up). Read README.md and runtime/docs/EFFECTS-LIST.md when selecting effects. These instructions work with local coding agents; do not claim browser/mobile-only chat can render without an execution environment.

## First use

For a new member, ask where to keep their videos and ask permission once, then run `node <plugin>/tools/setup.mjs "<project-folder>"`: it creates the project and installs and tests everything inside it (packages, the project's own ffmpeg and ffprobe, the render browser, a private Python in .venv for cutouts, the captions engine with the small.en model, and the high-quality cutout model). Read `out/setup-report.txt` and walk the member through each FIX line in plain language; rerunning setup skips finished steps. Never ask the member to type commands or install tools by hand. Set the working directory explicitly for every command. Keep concurrency 1. Use bundled fonts. Ask before downloading large models or installing system-level tools. Do not access personal C3 accounts, schedule posts, or publish.

Configure brand.json before the first video: customer name, accent/mid/deep colors, metal and highlight colors, bundled font choices, optional local logo. The customer's palette is independent of the template style. Use only six-digit hex colors. Supported heading font: Playfair Display or DM Sans. Body font: DM Sans or Montserrat. Do not promise arbitrary fonts without adding and testing them.

## Stock footage (optional)

If the member wants stock clips, follow runtime/docs/STOCK-FOOTAGE.md (in the project: docs/STOCK-FOOTAGE.md). Write the shot list from the script, turn each shot into a 2 to 4 word concrete search phrase, run `npm run f48 -- stock search`, show the preview images and page links, and download only the clips the member chooses with `stock pick`. Never pick for them, never download in bulk, never ask them to paste keys into chat. If no keys are set, explain the 5-minute setup in that doc, or continue without stock footage. Place a chosen clip with a `broll` graphic (see the Use it as a cutaway step in that doc): pick a camera move, keep it 2 to 4 seconds, and let her voice carry on underneath. Their own footage, images and animations always work without it.

## Handoff from the engines

If the member has a package exported from the Faceless48 Script, Shorts or Thumbnail engine (a `.f48handoff.zip` or a folder with `handoff.json`), or says "import my handoff", use skills/handoff/SKILL.md first.

If the clip is a screen recording that may show private details (an inbox, share links, keys, file paths, account names or pictures), or the member says "blur my private info", use skills/redact/SKILL.md before editing, and edit from the redacted clip.

## Brand applies automatically

Every effect, graphic, caption, Life Scene style and carousel reads the member's brand.json (colors, metallic finish, heading and body fonts, logo). Never ask the member to repeat their brand for a new video. Everything stays customizable: if they ask for a different color, font or look on any effect, change it for that video, or update brand.json when they want it everywhere.

## Video carousels

For "make a video carousel", follow runtime/docs/VIDEO-CAROUSELS.md (in the project: docs/VIDEO-CAROUSELS.md).

## Life Scenes

For cinematic clips with on-screen text (no talking head), use skills/life-scenes/SKILL.md. Clinic notes (her name for Life Scenes with tip cards) use `clinicNote` or `cardTrial` in the Life Scene plan; for text timed to music beats, use skills/beat-sync/SKILL.md.

## Yaps

Casual in-car or at-home talking videos are yaps. When the member says "edit my yap", or a clip is clearly a yap, use skills/yap/SKILL.md and docs/YAPS.md instead of the full talking-head workflow. If they say "make my video" on a clip that looks like a yap, ask once which they mean.

## One-line command

When the member drops a clip or voiceover and says "make my video" (or "edit this", "make my first video"), run the whole workflow: read brand-profile.md and docs/EDITING-RULES.md, get the media, clean-cut it (retakes, stumbles and dead air out; EDITING-RULES Process step 1), transcribe and confirm the transcript with them, matte if needed, plan with their saved style, **stop and show stills**, render after approval, verify the file, and stop. Never post or schedule.

## Getting large media

Never ask the customer to attach a large video to chat. If the agent runs on their computer, ask them to copy the file into the project's `public/raw/`. If it runs in the cloud, ask for a cloud-folder link shared as "Anyone with the link can view" (Google Drive, Dropbox or OneDrive), download it with a direct-download request (for Drive: `https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t`; for Dropbox: change `dl=0` to `dl=1`), check the result is a real video with ffprobe rather than an HTML warning page, and remind them to set sharing back to Restricted afterwards. If a download is blocked by the network, tell them which domains to allow (see START-HERE.md). Conform the clip to 30 fps before transcription: `ffmpeg -i in.mp4 -r 30 -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k public/raw/<slug>.mp4`.

If any render or preview prints "The video browser could not start", follow that message's steps in order before trying anything else, and run `npm run f48 -- doctor` to confirm the browser works.

## Intake and style

Reuse supplied answers. Determine video type, media/voiceover, portrait or landscape, desired style, key message and requested duration. The audio recording is the timing authority; a script alone cannot establish spoken word times. Do not manufacture citations, dialogue, statistics or endorsements.

Talking-head: supplied footage, optional reference script; six existing presets and effect selection. **Before planning any talking-head edit, read runtime/docs/EDITING-RULES.md (in the project: docs/EDITING-RULES.md) and follow it.** Talking-head edits render portrait (1080 x 1920) by default. For YouTube and other horizontal videos set `"format": "landscape"` in the plan: it renders 1920 x 1080 with a full-frame speaker, split layouts (her on the left, graphics on the right), captions, graphics, end cards, camera moves and looks. In landscape, only these effects work: digital-zoom, pull-back, zoom-through, blackout, flash-frame, grade, glow and dust. The other effects, cutouts (matte) and outlines are drawn for the portrait frame, so `validate` rejects them in a landscape plan with a plain message. Tell the member that before planning, and never stretch a portrait plan into landscape. Source footage can be any shape: horizontal footage suits a landscape plan, vertical footage suits portrait.

Explainer: voiceover plus an optional script and optional customer character. Offer `whiteboard` (clean line art), `editorial` (serif-led typography) or `dark` (dark field, light figures). Show a representative still before producing a new look. This is actual scene planning, not applying effects at arbitrary intervals. Default figure is drawn in code, no image-generation API required.

Image/footage: voiceover, local licensed assets, a scene plan. Use the explainer media scenes. Generated imagery is optional and external: verify a connected provider, disclose its cost, use the customer's account and get spending authorization. The plugin does not contain an image generator or Faceless48 B-roll MCP.

## Timings and planning

With a local recording, run the packaged transcription workflow in the project: `WHISPER_MODEL=small.en npm run transcribe -- <slug> <local-media>`, then the tokens-to-words, snap-words and words-to-captions scripts where applicable. Inspect actual output first; do not run conversions against nonexistent token files. Reconcile names and closing lines against the recording/script. No transcription success claim without output checks.

Explainer plans follow src/Explainer.tsx's schema; examples are in content/. Produce scene titles, visual metaphors, timings and caption phrases matched to voiceover. The five reusable layouts are Compare (comparison), Numbered List (steps), Layers (layers), Load versus Capacity (capacity), and Process/Loop (process). Presenter, image and video scenes are also supported. Capacity scenes require real supplied load/capacity numbers; never invent them. For richer action, build a bespoke scene component using src/stick/figure.tsx, kit.tsx and parts.tsx; the included historical stages demonstrate rig usage. Do not reuse their episode wording as the customer's story. Register any bespoke composition and test it. Figure motion should communicate the sentence; alternate shot content rather than merely changing headings. Supplied character images use scene.character; use a sequence of customer pose images for pose changes. New generated poses require a separate tool.

**Talking-head templates:** there are 8 finished templates (Quiet Authority, Magazine, Glass, Scrapbook, Analyst, Cinematic, Creator Hype, Teach Board). When the member names one, or asks for a template, read runtime/docs/TEMPLATES.md (in the project: docs/TEMPLATES.md), set `template` and `captionStyle` on the plan, and build the scenes the way that template's row and its worked example in docs/templates/ show.

Talking-head plans use `{ "kind": "talking-head", "plan": <scene plan>, "captions": <Caption[]> }`. Keep all original effect schemas from src/fx/schema.ts. Read style options in docs/STYLES.md. Effects are selected and placed by you using word timings, not automatically placed by a preset. Preserve all 163 catalog entries. Avoid simultaneous effects that obscure the face/captions. For behind-person effects, create a matte first with the packaged matte tool and verify its edges. Do not remove an unsupported effect silently; explain its missing prerequisite.

## Preview, revise, render

Run `npm run f48 -- validate <plan.json>` and `npm run f48 -- lint <plan.json>` before render, and fix every collision, echo and timing warning. Run `npm run f48 -- storyboard <plan.json>` before the first render of any video. It saves the whole video as numbered stills in order (`out/storyboard-<slug>/`: `sheet.png`, `index.html`, `storyboard.md`), with the words being said under each frame. Show the member `sheet.png`, read out the list from `storyboard.md`, and wait for approval. If they name frames to change, change the plan, then make a new storyboard (it never overwrites the old one). Use `npm run f48 -- preview <plan.json> <second>` to look closer at one moment. Inspect images. Check safe zones, text length, contrast and face/prop collisions. Ask for approval of the first new style. Render only after the member has approved the storyboard. Once approved, render using `npm run f48 -- render <plan.json>`.

Output filenames are protected against overwrite. For revisions create a new slug/version, preserve the previous plan and output, and change only the requested sections. Verify duration, dimensions, audio presence and frames from the exported file. Previewing stills is not equivalent to listening to audio or watching motion; disclose verification limits.

For batches, create one plan per video and a JSON array of their paths. Use `npm run f48 -- batch <jobs.json>`. Jobs run sequentially; a failure is recorded and does not stop remaining jobs. Inspect the report, retry only failed jobs, never report all complete unless every intended output was verified.

## Delivery and updates

Deliver local MP4 links and a concise list of checks/limitations. No automated posting. Never overwrite a customer's project during a plugin update. New plugin versions create new projects; migrate existing projects only with backups and explicit intent. New creative collections must identify compatible runtime versions.

## Automatic keyword timing

Create an editorial brief with `captionsFile` relative to the brief, `durationSec` measured from the recording, `vo` inside public/, style/format, and scenes. Each scene may use `startCue: {phrase, occurrence?}` and optional `endCue`; otherwise it ends at the next scene or audio duration. Item emphasis uses `highlightCues: [{index, cue: {phrase, occurrence?}}]`. Run `npm run f48 -- compile content/brief.json content/compiled.json`. The cue engine matches punctuation-insensitive phrases against actual word times. Repeated phrases require an occurrence number. Missing phrases fail with a clear message; do not invent a timing. Validate and preview the compiled plan. The customer describes their video; you author this brief for them.
