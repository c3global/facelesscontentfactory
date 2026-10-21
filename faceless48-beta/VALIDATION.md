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

## Life Scenes and stock footage — 2026-10-21

- Life Scenes ported from the creator's workflow as one `kind: "life-scene"` plan rendered in a single pass (shots with hard cuts and camera moves, text cards, seven overlays, dust, voiceover). Text cards and overlays follow brand.json colors and metal. Preview stills verified in a test brand. Full motion render and long voiceover hold not yet reviewed by eye.
- Not ported: color grades, light leaks, letterbox and blackout/flash finishing flags (the creator's rule is no color changes; add on request), the zoom-through transition and the creator's Notion and Marky steps.
- Stock footage: `npm run f48 -- stock keys|search|pick|credits` with the member's own Pexels and Pixabay keys (stock-keys.json, git-ignored, or environment). 24-hour search cache, previews as thumbnails only, one person-picked download at a time, credits saved to content/stock-credits.json. 3 new automated tests (10 total) pass with simulated provider responses. Live API calls not yet tested: this cloud session cannot reach pexels.com or pixabay.com.

## Funnel demo build notes — 2026-10-21 (creator review round 1)

Findings from the first demo draft, and what changed:
- Hook gradient covered the torso: it now starts at 56 percent of the frame height and is lighter.
- Style label and top captions overlapped (Show and Tell) and a label crowded the portrait window (closing section): fixed in the demo plans, rule added to docs/EDITING-RULES.md.
- No music: added `npm run f48 -- mix-music` (licensed track, loop, duck under speech, fade). Explainers use the plan's `music` block.
- Explainer looked static: rebuilt as a bespoke stick-figure stage (src/stick/F48Stage.tsx) with timed action on every spoken cue, a `kind: "stick"` plan type for `npm run f48`, and an optional holographic backdrop (`backdrop: "holo"`).
- Cutout quality: the default cutout (MediaPipe) leaked into the sofa and wobbled at edges on dark-on-dark footage. An outline does not hide this (it follows the bad mask). Added `scripts/matte-hq.py` (BiRefNet, MIT license, one-time 220 MB model download with the member's OK). One-frame test gave a clean silhouette. About 18 s per frame on a CPU and about 12 GB of RAM, so cut only the seconds an effect uses and do not run a render at the same time.
- Also fixed: a wrong time range in one demo cutout (human error while slicing), a metal-finish setting reverted at the creator's request (copper stays main, gold stays the secondary accent).

Still open:
- The talking-head demo is 7 renders joined with ffmpeg because one plan supports one style. Per-section style in a single plan would remove that step.
- Sound mix and effect sounds need a listen by the creator.

## Yap workflow ported — 2026-10-21

From the creator's merged yap workflow (PR 16 and PR 13 on the main repo), ported to the member package:
- `yap` style preset and `scrim` dial; `scrim` and `captionLeadSec` plan fields; digital-zoom no longer switches off the hook gradient (the brightness-flicker fix); `skills/yap` ("edit my yap") and `docs/YAPS.md`; routing in CLAUDE.md and AGENTS.md; "make my video" on a clear yap asks once which is meant.
- `scripts/tighten-pauses.py` rewritten for the member plan format. It finds silences in the audio (transcription word times run end to end and hide pauses), cuts them to 0.3 s, and remaps the plan, captions, effects and end card. Never overwrites. Two new automated tests (12 total) pass.
- Tested end to end on a real 33 s clip: 9 pauses shortened (1.8 s), validated, rendered with captions, music bed and two slow zooms, no whole-frame flicker.
- Not ported: the creator's lo-fi track choice (members bring their own licensed track), Notion and Marky steps, ElevenLabs notes, trial-reel notes.
- Open: listen test of the music and cut points by the creator; `captionLeadSec` showed no visible benefit in the creator's own test.
