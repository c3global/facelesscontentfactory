# Faceless48: where things stand

Read this first in any new conversation about Faceless48. Update it when Dr. CK says "wrap up". Last updated 2026-11-09.

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

**Also in beta.10 (Nov 10, later):** video carousels (`src/VideoCarousel.tsx`, kind `video-carousel`, 10 layouts incl. `status` and `branches`, 4 styles, optional presenter cutout via `npm run cutout -- <photo>`, docs/VIDEO-CAROUSELS.md); every effect, Life Scene/Codex style and metal finish now reads brand.json (no fixed copper/gold); effect list covers all 169 + carousel layouts. Lesson 1 has this zip. Announcement drafted (Announcements channel, email to plug-in members) and waiting on her: Pinball post-email sender (Faceless48 info@faceless48.com) and its reply-to -> support@faceless48.com; auto mode blocked me from changing sender settings. Her carousel examples: IG DfYJvfeHSj2 and Dfic7csgp4I (YouTube ue0ITM7a_II, kan_LPXuZ00). Support email is now support@faceless48.com. Never say "clinic notes" to members: say Life Scenes. Her face in effect previews is her AI avatar, not her.

**Next:**
1. Real Mac and Windows test of setup (Mac may need Command Line Tools for whisper; setup triggers the install prompt). Not yet tested there.
2. Swap the zip into lesson 1 (Pinball media) and update the Start Here guide and recording checklist (still says beta.7).
3. "Before you start" stick-figure video: open question, her voice or Jogg avatar.
4. Blow away reveals a dark backdrop; ask her for 3 s of her empty set to reveal the room.
5. Her Pexels/Pixabay keys were in the demo zip in git history on branch claude/jolly-allen-3bm01m (removed from the file Nov 10). She should regenerate both keys.

## Small open items

- Ask her to check the space as an ebook-only member (Zulie Rodriguez) once.
