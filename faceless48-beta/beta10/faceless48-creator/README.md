# Faceless48 Creator — private beta 0.1.0-beta.8

Local video production with Remotion. Includes the creator's 111-effect source library, six talking-head presets, an original stick-figure rig and reusable explainer scene planning with whiteboard, editorial and dark styles.

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
