# Faceless48: where things stand

Read this first in any new conversation about Faceless48. Update it when Dr. CK says "wrap up". Last updated 2026-11-12.

## Working with Dr. CK

- Address her as Dr. CK. No em dashes. Plain, warm American English. Never invent facts.
- She prefers text or PDF files over Markdown for anything she reads herself.
- She wants whole jobs done in one go, not little steps. Ask only what is truly hers to decide.
- The plug-in works in both Claude Code and Codex. Never call it untested on Codex.
- "Clinic notes" is her personal name for Life Scenes.
- Kai = ChatGPT/Codex. Credits are tight: batch requests, keep replies short.
- Her primary accent is SHINY METALLIC copper running into rose gold, never flat brown copper or flat gold (her note, Nov 12). In the studio fx use `ROSE` / `ROSE_TEXT` from `src/fx/theme.tsx`. Crimson is always welcome. Gold is secondary.
- A list with switches is a FOCUS LIST, never a checklist. A checklist has boxes that get checked.

## What is live

- **Course** (Pinball community "Faceless48 Downloads", id 01m5x8zcszqbm0v9cqfdmgrvz6), course 01m5x8zjyheqd57dfy090jrrn1, 3 modules, 9 lessons, all open (no completion gating, Pinball cannot do it).
  - Lesson ids: L1 01m5x9045w6avg2y338qb1h34r, L2 01m61t0mq73pkywxnm6gtp8yhj, L3 01m61t0ng7heypkw0smvnrverf, L4 01m61t0pak5t6vaj9mcw259nhy, L5 01m5zjra8mm56x35bsw56mkz58, L6 01m5zjrar8dcs3dsg5pjpem2hb, L7 01m5zjrbd5xqy99xyq4s9fb06r, L8 01m5zjrc1052hgbz4gxm5e8ace, L9 01m61t0q2spr857cgm0e8vs9yf.
  - Lesson 1 download: plug-in **beta.8** zip (media 01m6497n6mdfqzs11vx19x8n8j), Start Here guide (01m61se6c43pv2bv6t0s987xyh), Instructions and transcript PDF.
  - Lessons 1 to 4 and 9 have edited videos (blur, captions) and thumbnail posters; 5 to 8 have posters. Lesson 3 mentions "Blur my private info".
- **Access**: plug-in course opens for the Plug-in Beta product (01m5wt8texshmexkanj9wewdye) and Studio Founder Lifetime (01kv67kgk9z028tn0hy1kzk92r). 12 of 13 channels are hidden unless the member owns one of those or has tag `f48-community-access` (01m6798qw9xms7kv79km2ey8xg). The six founders are tagged. General is the default channel (Pinball keeps it open): staff-only, with a pinned post pointing to the plug-in. Ebook (order-bump) buyers see only their ebook courses.
- **Plug-in checkout on its own**: https://www.faceless48.com/plugin ($97, 7-day guarantee).
- **Toolkit nurture**: automation 01m66y6t3w2ygnb91yyjmzzkhr (tag, welcome, then days 1, 3, 5, 8, 12; emails 4 and 5 pitch the plug-in; skips anyone who bought it). Old "F48 | Main Product Purchase" (01m5x5q11a3r1ey94fj22hehp1) is paused and can be deleted.
- **Landing page** faceless48.com: footer pill says v2. Leave the rest alone unless asked.

## Plug-in source

- The full source is inside the latest zip in this folder (`faceless48-creator-0.1.0-beta.8.zip`). Unzip it to work on it; `npm ci` then `npm run test:beta` (31 tests) and `npx tsc --noEmit`.
- beta.8 added `redact` (blur private details). Readable copy in `plugin-source/redact/`.
- Codex made a **beta.9 update pack**: `codex/faceless48-creator-beta.9-codex-update.zip` (15 files laid over beta.8): beat-sync skill and picker page, clinic-note (Life Scene) styles, native-footage clinic render, music-section finder. It compiles and tests pass on top of beta.8, but: the clinic-note files are not wired into any composition yet; the picker page is hard-coded to her Nov 18 session; it dropped `redact.test.ts` from `test:beta` and reset the README title to beta.7. Fix these in the merge.

## In progress: beta.10

**Built (Nov 10):** `faceless48-creator-0.1.0-beta.10.zip` from the working copy `beta10/faceless48-creator/`. tsc clean, 31/31 tests. Contains:
- beta.8 (redact kept) + Codex beta.9 (beat-sync skill, picker reference, music-section finder) + her demo-folder wiring (clinic notes in LifeScene: `clinicNote`, `cardTrial`, `velvetEditorial`, `graphicsOnly`; LSClip accepts stills).
- 25 new effects (seventh/eighth/ninth.tsx, 119 total), member defaults use `customerBrand.name`, never C3 or Dr. CK. Studio copy in `remotion-cutaways/src/fx/` (previews `content/drck-fx*.scene.json` on her clip `public/raw/drck-fx.mp4`, not in git).
- One-step setup: `node tools/setup.mjs "<folder>"` / `npm run setup`: ffmpeg-static + ffprobe-static (Remotion's own ffmpeg lacks overlay/afade/sidechaincompress), Remotion browser, private Python in `.venv` (requirements.txt), whisper.cpp + small.en, BiRefNet lite; report in `out/setup-report.txt`. Tools reach scripts via `--import ./scripts/tools-path.mjs` on each npm script (an .npmrc node-options approach broke npm ci). Python scripts run through `scripts/py.mjs`. Passed end to end on Linux in 2.5 min.

**Also in beta.10 (Nov 10, later):** video carousels (`src/VideoCarousel.tsx`, kind `video-carousel`, 10 layouts incl. `status` and `branches`, 4 styles, optional presenter cutout via `npm run cutout -- <photo>`, docs/VIDEO-CAROUSELS.md); every effect, Life Scene/Codex style and metal finish now reads brand.json (no fixed copper/gold); effect list covers all 169 + carousel layouts. Lesson 1 has this zip. Beta.10 announcement POSTED Nov 10 in Announcements (post 01m71qp7x4ebfsj42426n6x3s2) and emailed to members; post-email sender is Faceless48 info@faceless48.com, reply-to support@faceless48.com (forwards to her Gmail). Carousels later got: center alignment default, 5 end screens, 3 starter templates (content/templates), looping motion, music on by default from public/music, `f48 carousel-slides` (one video per slide, song split across slides). Her licensed music: Drive folder 1_zehp3xfDSjuOx8Zs8zKauSUQF9k5DU0 (Cinematic Carousels subfolder: Audiio tracks); never ship them in the plug-in. Her carousel examples: IG DfYJvfeHSj2 and Dfic7csgp4I (YouTube ue0ITM7a_II, kan_LPXuZ00). Support email is now support@faceless48.com. Never say "clinic notes" to members: say Life Scenes. Her face in effect previews is her AI avatar, not her.

**Lesson 1 PDF (Nov 10):** new `lesson-pdfs/Lesson-1-Instructions.pdf` (one-sentence setup, support@faceless48.com) replaced the old instructions-and-transcript PDF in Lesson 1. She is recording a new Lesson 1 video today (Mac setup test); when she sends it, make the matching Instructions-and-Transcript PDF and swap the lesson video.

**Beta 11 (release next week; Lesson 1 stays on beta.10 until then).** Built so far in `remotion-cutaways/src/fx` (studio copy; port to the plug-in at release) and the plug-in carousel:
- Carousel: styles `glass` and `showcase`, layouts media/toggles/proof/graph/ab/doc, collage end screen, handwritten notes with arrows (arrows start outside the note on the side facing the target and bend away from the words; `from` and `bend` adjustable), cover fan, starter templates 4 and 5 (`content/templates/carousel-showcase.json`, `carousel-glass.json`).
- `tenth.tsx` text-pop pack (look: focus, shiny, gradient, blur-in, split, glitch, scramble, badge, glass, fill, stack; each has an exit). Bubble glass font: Bagel Fat One (OFL, `public/fonts`, also in fonts.ts). Fontspace fonts are mostly personal-use only: do not ship them.
- `eleventh.tsx` carousel slides as video fx: proof-card, focus-list, compare (winner), trend-graph, freebie-doc, note-arrow (dark scrim behind each).
- Fixes she asked for: head-stack (big cream label blocks; video eases down with a blurred fill for headroom; the stack tumbles off on exit), live-cursor (the cursor drags the box and everything inside moves; default nudge -180).
- Preview plans: content/drck-text*, drck-cards, drck-head, drck-cursor (render with `REMOTION_LOCAL_FONTS=1 npm run render -- <slug>`; online fonts time out here).
- ANNOUNCEMENT MEDIA: keep every preview and storyboard; they go in `faceless48-beta/beta11-media` (README lists each). Add each new preview there.

**Built Nov 12 (studio copy `remotion-cutaways/src/fx`, all in docs/EFFECTS-LIST.md; tsc clean; previews rendered):**
- `twelfth.tsx` upgrade batch 1: `"version": 2` on odometer, chart-grow, pointer-callout, clone. The switch list is NOT a checklist (her correction): it is `focus-list` with `{text, at}` items.
- `thirteenth.tsx` reel effects (9): shoulder-steps, iris, match-cut, demo-cursor, glass-cards, pixel-monitor, slot-machine, holo-phone, silhouette-shift.
- `fourteenth.tsx` carousel pieces (3): image-collage, cover-fan, framed-clip.
- `fifteenth.tsx` comparison set + upgrade batch 2: side-by-side, vote-pill, duotone, big-stat, thank-you, wall-text; version 2 of before-after, flash-frame, kinetic-hook, giant-caption, follow-card, checklist (a true checklist, boxes get checked).
- Rule kept: originals never replaced. `fifteenthOver` is checked first in FxOver so a version 2 draws its new look.
- PREVIEW CLIP: `drck-fx.mp4` is lost (was never in git or Drive). Previews now use Drive file 1GB0yYL4EHV93VbtsPxH7Kfy8rz0EvMaB ("Dr. CiCi TH - Test Small Pieces.mp4", has a HeyGen watermark): `curl -L "https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t"`, then seconds 2 to 24 conformed to 1080x1920 30 fps as `public/raw/cici-fx.mp4`; `npm run matte -- cici-fx` (needs `apt-get install libegl1 libgles2`, `pip install mediapipe`), then `python3 scripts/matte-hq.py cici-fx 11.0 15.0` (behind-her effects in every cici plan sit inside seconds 11 to 15). Plans: content/cici-*.scene.json. Previews saved in beta11-media.
- Awaiting her review of the 7 previews. Known soft spots: wall-text (uses head-stack headroom, text partly over the blurred fill), holo-phone is faint on busy backgrounds.

**Her real videos (Nov 12, kills two birds: real edits double as Beta 11 announcement proof).** Drive folder 1aMpwazzlUvLNpzcvQXOG3ZUiJj98PCLU has 12 clean C3 Global clips = 6 videos, joined to `public/raw/<slug>.mp4` (1080x1920, 30 fps): who-owns (Pt 1+2, 50 s), change-ai (26 s), paste-ai (Pt 1+2+3, 30 s), quiet-space (40 s), tolerance (40 s, International Day for Tolerance is Nov 16: do first), decisions (40 s). Download each with the usercontent curl line below. Transcribed with small.en (content/<slug>.captions.json). Next: she confirms transcripts, then playbook section 12 per video using the new effects (one strong effect every 4 to 6 s, on her words; stills before render; RENDER_CONCURRENCY=1). She is also sending details for about 8 video carousels.

**Next, in order:**
1. She said the Nov 12 previews are beautiful (only note: the metallic accent, done). Edit her 6 real videos and build her carousels.
2. Upgrade batch 3 (second versions): label-maker look for the-stack/sticky-text/freeze-sticker, one Instagram comment style for comment-bubble/drop/cta, spotlight with dust, polaroid-drop fan, phone-mockup v2 (reuse holo-phone).
3. Release: port all fx (tenth to fifteenth) + carousel changes into `beta10/faceless48-creator` (becomes beta.11; member defaults read brand.json, never C3 colors), update EFFECTS-LIST and docs, tsc + tests, zip, swap into Lesson 1, announcement post + email with the beta11-media clips.
4. Older items: real Mac/Windows setup test; Lesson 1 video + PDF when she sends her recording; "Before you start" stick video (her voice or Jogg avatar?); 3 s of her empty set for blow-away; she should regenerate her Pexels/Pixabay keys (were in git history).

## Small open items

- Ask her to check the space as an ebook-only member (Zulie Rodriguez) once.
