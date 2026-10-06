# Stick-figure explainer playbook (Remotion)

Owner: Dr. CK (C3 Global). Host character: **Dr. CiCi**, as a hybrid stick figure (Kai's artwork: cartoon head, locs, glasses and suit torso, thin stick arms and legs). Output: one plan, two formats, 30 fps: portrait 1080x1920 (TikTok, Shorts, Reels) and landscape 1920x1080 (her YouTube channel).
Separate from the talking-head template (`PLAYBOOK.md`). Same toolchain, different look.

## 0. What this format is (locked)
- It is an **explainer**, not an episode. Her voiceover only (recorded by her). Nobody speaks on screen: no dialogue, no speech bubbles with words, no lip sync.
- One concept per video, one CTA. The scenario is a teaching device of about 20 seconds, not a plot. The supporting cast is anonymous and gray, with no names or backstory.
- White field (no cream or ivory), black line work, charcoal cast, **one crimson accent per scene**. Emphasis words in the captions are metallic crimson Playfair italic (rose gold was too pale on white).
- Dr. CiCi is the only figure with color and detail. The cast is drawn in code (`src/stick/figure.tsx`) and is deliberately a different, more modern stick-figure style so she stands out.
- Keep it visually distinct from the cinematic miniseries (dark, photoreal).

## 1. Files
| What | Where |
| --- | --- |
| Sprites (Kai): 17 poses 1024x1536, 9 head-only faces 1254x1254, transparent PNG | Drive folder "Dr. CiCi Stick Figure Assets"; ids in `content/stick-assets.json`; `node scripts/sync-stick.mjs` downloads to `public/stick/` (git-ignored) |
| Plan: cues, Dr. CiCi pose schedule, music, emphasis words | `content/<slug>.stick.json` |
| Words and timings | `content/<slug>.captions.json` (from her recording) |
| Stage art for one episode (bespoke) | `src/stick/<Name>Stage.tsx` |
| Shared: figure rig, prop kit, captions, layouts, audio | `src/stick/figure.tsx`, `kit.tsx`, `StickVideo.tsx` |
| Compositions | `Stick-portrait`, `Stick-landscape` in `src/Root.tsx` |
| Face-on-body patches | `scripts/compose-faces.py` |
| Stills and renders | `scripts/render-stick.mjs` |

## 2. Workflow
1. **Assets.** `node scripts/sync-stick.mjs` (Drive folder must be shared by link; needs `drive.usercontent.google.com`).
2. **Script.** Interview her for a true story first. Draft, she edits. She records one take; the file goes in a Drive folder. `node scripts/fetch-drive.mjs <id> public/raw/<slug>-vo.mp3`.
3. **Transcribe.** `WHISPER_MODEL=small.en npx tsx scripts/transcribe.mjs <slug> public/raw/<slug>-vo.mp3`, then `node scripts/tokens-to-words.mjs <slug>`, `node scripts/snap-words.mjs <slug>`, edit `content/<slug>.words.tsv` if needed (first word capitalised), `node scripts/words-to-captions.mjs <slug>`. Whisper emits punctuation as separate tokens; the merge step is required.
4. **Plan.** Copy `content/the-pile.stick.json`. Set `cues` (seconds, read off the captions), the `cici` pose schedule and music (`npm run sync-music`).
5. **Stage.** Write the episode's stage component against the cues (see `PileStage.tsx`). Everything is drawn in a 1000x700 box; portrait crops it to `110 0 780 700`, so keep key art inside x 110 to 890.
6. **Stills first.** `npx tsx scripts/render-stick.mjs stills <slug> portrait|landscape <sec> ...`, contact-sheet them, fix, then render.
7. **Render.** `npx tsx scripts/render-stick.mjs render <slug> both`. Scan for flashes with `signalstats` YDIF.
8. Send review copies under 28 MB (`-b:v 3000k`), keep masters in `out/`.

Env: `REMOTION_LOCAL_FONTS=1`, `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

## 3. Layout (both formats come from one plan)
- Portrait: stage art 960 wide, captions in a band below it, Dr. CiCi cropped at the hips at the bottom. Keep the top 12 percent and bottom 22 percent clear of key content.
- Landscape: Dr. CiCi full height on the left, stage art and captions on the right. Before she enters (first scene) the stage is centred; when she walks in the stage slides right.
- Captions: editorial lockups (support words DM Sans 700, hero word Playfair italic 800 lowercase), bottom-anchored so a tall lockup grows upward. They stop at `captionsEnd`, where the end card begins.
- Music ducks under her words (`music` block). Her voice is not re-levelled.

## 4. Dr. CiCi sprites
- Poses swap on the beats (hard cut with a 7-frame pop). A gentle bob keeps her alive. `walkIn` slides `pose-walking-in` in from the left.
- Heads differ slightly between poses (hair strands redraw), so never cross-fade two poses.
- **Expressions on the body** (`scripts/compose-faces.py`): glasses are aligned and a feathered patch of the head-only face replaces the face. Works for front-facing poses only. Seams: the patch must end in flat skin; glasses and mouth must be fully inside the patch. `pose-standing-hands-clasped + face-concerned` is clean. `pose-hands-on-hips + face-one-eyebrow` leaves a ghost of the old open mouth (needs a taller mask for that pose). Prefer native poses when one fits.
- The whiteboard pose is drawn smaller than the rest (the board is in frame), so scale it up by head size if used.

## 5. Open items
- Per-pose glasses boxes for more face patches (`BODY_GLASSES` in `compose-faces.py`).
- Sound effects (whoosh, bell) are in `content/music-library.json` but not wired in.
- Ask Kai for: front-facing whiteboard pose, a three-quarter pose with an expression set.
