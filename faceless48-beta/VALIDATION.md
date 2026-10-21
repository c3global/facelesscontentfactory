# Beta validation — 2026-10-20

Status: owner-review build with passing local render checks. Native Claude Code and Codex plugin installation still need testing before broad member distribution.

## Verified on this Mac

- Clean npm dependency installation in a fresh project outside cloud sync.
- TypeScript check passed.
- Seven automated tests passed: style/aspect schema, timeline/caption rejection, path and media checks, original 94 FX schema variants, isolated project creation/overwrite protection, phrase matching ambiguity, and scene/highlight cue compilation.
- Three-video batch completed: whiteboard portrait, editorial landscape, dark portrait. Each output has an audio stream and ~6-second duration.
- Five explainer layouts plus supplied image and video scenes rendered in one 14-second landscape MP4. Representative exported frames inspected for legibility and layout.
- Original talking-head Video composition rendered a synthetic 6-second portrait clip with zoom/card-flip effects and audio. This does not establish real-person segmentation quality.
- Keyword brief compiled into a validated plan. Cue fixture uses synthetic known word times; live transcription accuracy is not established by this test.
- Video dimensions checked with ffprobe: portrait 1080x1920, landscape 1920x1080.

## Remaining founder acceptance checks

- Native install/import in Claude Code and Codex, using a fresh customer account/machine. Reading the skill directly in a coding agent is the available fallback.
- Real 30–60 second talking-head edit, voiceover transcription, optional person matte/outline, character replacement, and a customer-requested revision.
- Visual review of all 111 catalog entries and advanced combinations. Source inclusion and type checking do not equal visual certification.
- Reproduce five of the original custom episodes to measure fidelity. New reusable layouts are functional foundations, not claims of identical original choreography.
- Windows/Linux setup, long videos, larger batches, and varied brand palettes.
- Owner review of asset/product licensing before commercial release.

## Known boundaries

Only local coding environments are supported. Browser-only ChatGPT is not a local renderer. No hosted Faceless48 MCP, paid image/video generation, membership authentication, billing, or update service is implemented here. Talking-head composition is portrait; explainer supports both formats. The generic host is intentionally neutral and optional supplied character art uses scene pose changes. Historical custom episode source remains reference code and needs registration/assets to render.

Use a folder outside iCloud/OneDrive/Dropbox. Cloud-offloaded fonts and native binaries caused stalled tests here; a normal local folder resolved them. Sample MP4 proofs are stored beside the package in ../proof/ rather than included in the install ZIP.

## Second-machine check — 2026-10-21 (Linux cloud session, Claude Code)

Verified:
- Fresh project, `npm ci`, typecheck and the 7 tests pass on Linux.
- Real 33-second talking-head clip (768x1168, 25 fps) fetched from a Google Drive share link, conformed to 30 fps, transcribed with `small.en` in about 2 minutes (word timing clean; one phrase needs a human check against the script).
- Person cutout (matte) built in about 3.5 minutes after installing MediaPipe, OpenCV and, on Linux only, `libegl1 libgles2`.
- Edit with headline card, statement card, prompt bar, digital zoom and a behind-person type wall rendered correctly in stills and full export.

Fixed in this build:
- Visible C3 defaults removed: "C3 Studio", "C3 GLOBAL" and "To C3" now use the member's brand name.
- Accent and copper metal shades were fixed crimson/copper hex codes; they now derive from brand.json.
- Silent freeze: a browser that cannot launch used to hang the CLI with no message (18 minutes observed). Renders and previews now stop with plain-English steps; `doctor` now tests the browser.
- Pill captions ignored `captions: "off"` on a segment, so captions doubled on top of word-by-word cards. Fixed.
- New: `metalFinish` in brand.json (copper, rose-gold, gold, silver, custom) and a silver metal.
- New: `captionStyle` in brand.json as the member's default; `npm run f48 -- brand-preview [clip]` shows editorial, heavy and pill side by side on their footage.
- New: brand-setup onboarding skill ("get me set up"), brand-profile.md memory, and CLAUDE.md/AGENTS.md in every new project.
- New: large-footage instructions (local folder or cloud share link, network domains) in START-HERE.md and the skill.

Still open:
- The creator's placement rules from her PLAYBOOK (face-safe zones, one strong effect every 4 to 6 seconds, caption skip rules) are not in the member skill yet.
- Style presets can override the saved caption style (Quiet Authority switches to pill).
- Pill captions always sit at the bottom; in split-screen layout S they land on the face. Use layout C/E or editorial captions there.
- Native plugin install in Claude Code and Codex still untested.
