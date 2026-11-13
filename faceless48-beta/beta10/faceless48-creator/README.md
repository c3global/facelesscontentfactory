# Faceless48 Creator — private beta 0.1.0-beta.11

Local video production with Remotion. Includes the creator's 163-effect source library, six talking-head presets, eight finished talking-head templates (Quiet Authority, Magazine, Glass, Scrapbook, Analyst, Cinematic, Creator Hype, Teach Board; see runtime/docs/TEMPLATES.md), an original stick-figure rig and reusable explainer scene planning with whiteboard, editorial and dark styles.

## Start

Use a local coding agent (Claude Code or Codex), Node 20+, npm and Chrome. FFmpeg is used for media preparation. Transcription additionally needs git, make, a C++ compiler and a downloaded Whisper model. Cutouts additionally need Python, MediaPipe and OpenCV. AI-account usage and optional third-party generation are the customer's responsibility.

1. Unzip to a permanent, locally stored folder outside iCloud/OneDrive/Dropbox sync. Cloud offloading can interrupt native tools and fonts. Claude Code can load the folder via its local plugin flow (`claude --plugin-dir /absolute/path/faceless48-creator`, where supported). The root portable manifest is included for compatible Codex plugin import. The package ships `AGENTS.md` for Codex and `.claude-plugin/plugin.json` for Claude Code. The package works in both Claude Code and Codex.
2. Reliable local fallback: open the folder in your coding agent and ask it to read `skills/video-production/SKILL.md`. This uses the same workflow but is not proof of native plugin registration.
3. Ask: “Create a new project from this plugin, set my brand, and help me make a video.” The project-copy tool prevents overwriting existing folders.
4. Run `npm run setup` inside the new project (or `node tools/setup.mjs <folder>` to create and set up in one step). It installs the packages, the project's own ffmpeg and ffprobe, the render browser, a private Python for cutouts and the caption and cutout models, then prints a report.
5. Configure `brand.json`, add your media inside `public/`, and let the agent produce the scene plan, previews and export.

Example commands inside a project:

```
npm run f48 -- validate content/example.explainer.json
npm run f48 -- preview content/example.explainer.json 1
npm run f48 -- render content/example.explainer.json
npm run f48 -- batch content/example-batch.json
```

## Style and assets

Brand colors and bundled fonts are configurable. Talking-head presets: Signature, Quiet Authority, Spotlight, Show and Tell, Hype Reel, Raw Tape. Explainer styles: whiteboard, editorial, dark. See runtime/docs/EFFECTS-LIST.md for effects. Complex effect combinations, cutouts, custom stages and long text require preview review.

No raw personal footage, personal music, customer records or account credentials are distributed. Bring your own footage, voiceover, music and character art. Do not assume permission to redistribute a downloaded track. Original branded decorative assets are replaced with neutral defaults. Historical explainer stage code is retained as a code reference, not advertised as interchangeable templates.

No paid image/video generator, stock-search MCP, social scheduler or hosted renderer is included. An assistant can use separately connected tools when authorized. Ordinary ChatGPT browser chat is not a supported local rendering environment.

## Founding-member testing

Private beta for invited existing lifetime founders, without a second purchase for the test. Their original entitlements are unchanged. This package does not implement subscription billing or access revocation.

Test: brand setup; 30–60 second talking-head edit; voiceover explainer; a revision; then a three-video batch. Report OS, agent/version, setup time, error text, and whether you needed help. Do not send passwords or API keys.

Keep projects outside the plugin folder. Updates do not modify existing projects. Template collections can ship separately when tested; no release frequency is promised.

Read VALIDATION.md before distributing. This is a locally built beta, not a promise of universal compatibility.

## Included layout examples

`runtime/content/example-layouts.json` demonstrates all five layouts plus supplied image/video scenes. `cue-demo.brief.json` and `cue-demo.words.json` demonstrate keyword matching with a synthetic timed transcript, not a transcription of the sample voiceover. The assistant should obtain actual timestamps from your recording for production.

The supported beta entry point is `npm run f48`. Other retained scripts are advanced source tools, not a tested alternate installer or product UI. Historical episode compositions require explicit registration before rendering; their original personal media is not included.

## Beta 11

- **Clean cut for talking heads:** videos recorded in several parts are no longer just joined. The assistant reads each part for retakes, repeated lines and stumbles, then `npm run clean-cut` joins the parts, drops those and shortens every pause to a short breath, measured from the audio. See runtime/docs/EDITING-RULES.md (Process, step 1).
- **25 new effects:** text pops (11 looks, including bubble glass, badge and stack), six carousel slides as video effects (proof card, focus list, compare, trend graph, freebie doc, note with arrow), nine reel effects (shoulder steps, iris, match cut, demo cursor, glass cards, pixel monitor, slot machine, holo phone, silhouette shift), three carousel pieces (image collage, cover fan, framed clip) and a comparison set (side by side, vote pill, duotone, big stat, thank you, wall text).
- **Second versions:** add `"version": 2` for a newer look on odometer, chart grow, pointer callout, clone, before-after, flash frame, kinetic hook, giant caption, follow card and checklist. The originals stay the default.
- **Shiny metal accent:** the new effects draw a multi-stop metal with a bright highlight from your brand.json metal, never a flat color.
- **Video carousels:** two new styles (`glass`, `showcase`), six new layouts (media, toggles, proof, graph, ab, doc), a collage end screen, handwritten notes with arrows on any slide, a cover fan, two more starter templates, and a `background` picture option (the member's own texture, such as velvet or marble, with a slow drift and a dim for readable text). All five starter templates render out of the box with placeholder pictures and clips (`public/collage`, `public/media`) for the member to replace. See runtime/docs/VIDEO-CAROUSELS.md.
- Head stack and live cursor reworked (label-maker blocks with room above the head; the cursor drags the box and everything in it).
- 161 talking-head effects and graphics, 33 Life Scene styles, 16 carousel layouts in 6 styles. All read your brand.json.

## Beta 10

- **One-step setup:** `node tools/setup.mjs "<project folder>"` (or `npm run setup` in a project) installs and tests everything: packages, the project's own ffmpeg and ffprobe, the render browser, a private Python for cutouts, the small.en captions model and the high-quality cutout model. No system installs by hand.
- **Beat picker and clinic notes (from beta 9):** the tested picker reference, member-selected frame cues, clinic-note (Life Scene) styles wired into Life Scenes (`clinicNote`, `cardTrial`, `velvetEditorial`, `graphicsOnly` for native-footage export), and the music-section finder. See runtime/docs/BEAT-SYNC-WORKFLOW.md. The picker page is a session reference to adapt per project.
- **Video carousels:** "make a video carousel" builds an animated 4:5 carousel: 10 slide layouts (including an animated status panel with a ticking paper checklist and a branching plan), 4 styles, and an optional presenter cutout of the member or their AI avatar (`npm run cutout -- <photo>`), always in the member's brand. See runtime/docs/VIDEO-CAROUSELS.md.
- **25 new effects** from three reference reels (live cursor, clone row, day dial, predict keys, letter orbit, code body, post wall, letter dive, comment post, layer explode, sketch words, blade slice, head stack, rack focus, banknote, voice note, impact frame, dolly zoom, press front, paper tear, blow away, depth scatter, spatial glass, shatter 3D, scene text). See runtime/docs/EFFECTS-LIST.md.
- **Brand everywhere:** every effect (including all older batches), Life Scene style and metal finish now draws its colors from brand.json, so nothing shows the template's copper or gold.
- Blur my private info (beta 8) is kept.
