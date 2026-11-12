# Faceless48: where things stand

Read this first in any new conversation about Faceless48. Update it when Dr. CK says "wrap up". Last updated 2026-11-12.

## Working with Dr. CK

- Address her as Dr. CK. No em dashes. Plain, warm American English. Never invent facts.
- She prefers text or PDF files over Markdown for anything she reads herself.
- She wants whole jobs done in one go, not little steps. Ask only what is truly hers to decide.
- The plug-in works in both Claude Code and Codex. Never call it untested on Codex.
- "Clinic notes" is her personal name for Life Scenes.
- Kai = ChatGPT/Codex. Credits are tight: batch requests, keep replies short.

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

**Next, in order (she builds new effects with Fable; say "pick up" then the task):**
1. Reel effects batch (previews on her avatar, high-quality cutout): over-the-shoulder zoom with floating step cards, iris, match cut, product demo with cursor, floating glass UI cards, pixelated monitor close-up, slot machine, 3D hologram phone, silhouette transformation.
2. Port as video fx: image collage, cover fan of tilted frames, framed clip with notes.
3. From reel DflSIzduyab (Opus vs Fable): side-by-side comparison with labels, vote pill, brand-color flash transition, magazine poster type, duotone, big stat, grayscale thank-you with handwriting, follow end card. Plus NEW `wall-text` (perspective text on a wall surface behind her; her favorite idea). Most of these overlap the upgrade plan below.
4. Upgrade plan, 3 batches of 5 with previews. NEVER replace an effect: each upgrade is a second version (`version: 2` prop, or a new name when the idea differs); the original stays default. Batch 1: v2 of checklist (glass focus-list), odometer (proof-card), chart-grow (trend graph), pointer-callout (note-arrow), clone (clone-row fan). Batch 2: before-after side by side, flash-frame brand flash, kinetic-hook/giant-caption poster type, follow-card handle + FOLLOW stamp, new wall-text beside type-wall. Batch 3: label-maker look for the-stack/sticky-text/freeze-sticker, one Instagram comment style for comment-bubble/drop/cta, spotlight with dust, polaroid-drop fan, phone-mockup v2 hologram. Members say "version 2".
5. Release: port all fx + carousel changes into `beta10/faceless48-creator` (becomes beta.11), update EFFECTS-LIST and docs, tsc + tests, zip, swap into Lesson 1, announcement post + email with the beta11-media clips.
6. Older items: real Mac/Windows setup test; Lesson 1 video + PDF when she sends her recording; "Before you start" stick video (her voice or Jogg avatar?); 3 s of her empty set for blow-away; she should regenerate her Pexels/Pixabay keys (were in git history).

## Small open items

- Ask her to check the space as an ebook-only member (Zulie Rodriguez) once.
