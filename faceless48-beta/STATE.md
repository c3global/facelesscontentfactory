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

1. **Waiting on** `F48-code.zip`: her Faceless48 Demo folder (iCloud, `~/Library/Mobile Documents/com~apple~CloudDocs/C3 Global/Clients/Faceless48 Demo`) zipped without node_modules, out, .git and media. It should hold the video carousels and the wiring for clinic notes. Folder connection from cloud sessions is not available to her.
2. **Merge** Codex beta.9 pack and that folder into beta.8. Keep redact and everything else from beta.8.
3. **New effects from three reels** (frame sheets in `reels/`; download reels again with `yt-dlp`, it works for public Instagram reels):
   - Reel 1 https://www.instagram.com/reel/DfgSB4DthfJ/ : build all: Live cursor, Clone row (new look), Day dial, Predict keys, Letter orbit (text ring look of orbit), Code body, Post wall, Letter dive, Comment drop (new look), Layer explode, Sketch words, Blade slice, Head stack, Rack focus, Banknote, Voice note (new look), Impact frame, Dolly zoom (new look of vertigo), Press front (newspaper), Paper tear, Blow away.
   - Reel 3 https://www.instagram.com/reel/Dff6wULz-i4/ : Rack focus, Depth scatter, Spatial glass, Shatter 3D, Scene text.
   - Reel 2 https://www.instagram.com/reel/Def9pj5TWtA/ : all 17 already exist; add new looks only where his version differs.
   - Use her brand, not his designs. Effects that go behind her need the high-quality cutout.
4. **Easier setup** (her client needed an hour): assistant runs the installs with permission; use Remotion's bundled ffmpeg/ffprobe (`@remotion/compositor-*`) instead of a system FFmpeg; install cutout tools up front (python3, mediapipe, opencv-python-headless, numpy, pymatting, onnxruntime, Pillow; BiRefNet lite model about 220 MB) and captions (whisper.cpp small.en, about 470 MB); test each piece. Needs one real Mac and one Windows test.
5. **"Before you start" video**: stick-figure explainer with a drawn computer and Terminal. Open question: her voice or Jogg avatar.
6. Then: tests, effects list, zip, swap into lesson 1, update Start Here.

## Small open items

- Recording checklist PDF still says beta.7.
- Ask her to check the space as an ebook-only member (Zulie Rodriguez) once.
