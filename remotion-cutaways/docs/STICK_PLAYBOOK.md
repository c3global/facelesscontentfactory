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
- Portrait: stage art on top, captions in a band below it, Dr. CiCi **full body** at the bottom (about 740 px tall, centred). Dr. CK asked for her whole body after the first cut. Before she enters the stage is larger and centred.  Keep the top 12 percent and bottom 22 percent clear of key content.
- Landscape: Dr. CiCi full height on the left, stage art and captions on the right. Before she enters (first scene) the stage is centred; when she walks in the stage slides right.
- Captions: editorial lockups (support words DM Sans 700, hero word Playfair italic 800 lowercase), bottom-anchored so a tall lockup grows upward. They stop at `captionsEnd`, where the end card begins. The caption block is pinned by its **bottom** edge (CSS `bottom`), so a three-line lockup grows upward and never reaches her head. A fixed-height flex box with `flex-end` did not do this reliably.
- Music ducks under her words (`music` block). Her voice is not re-levelled. **The Audiio beds are mastered hot (about -10 LUFS) while her voice sits near -23 LUFS, so the bed needs `volume` about 0.045 and `duckTo` about 0.02** (the first pilot at 0.16 / 0.05 was too loud, per Dr. CK).

## 4. Dr. CiCi sprites
- Poses swap on the beats (hard cut with a 7-frame pop). A gentle bob keeps her alive. `walkIn` slides `pose-walking-in` in from the left.
- Heads differ slightly between poses (hair strands redraw), so never cross-fade two poses.
- **Expressions on the body** (`scripts/compose-faces.py`): glasses are aligned and a feathered patch of the head-only face replaces the face. Works for front-facing poses only. Seams: the patch must end in flat skin; glasses and mouth must be fully inside the patch. `pose-standing-hands-clasped + face-concerned` is clean. `pose-hands-on-hips + face-one-eyebrow` leaves a ghost of the old open mouth (needs a taller mask for that pose). Prefer native poses when one fits.
- The whiteboard pose is drawn smaller than the rest (the board is in frame), so scale it up by head size if used.

## 5. Open items
- Per-pose glasses boxes for more face patches (`BODY_GLASSES` in `compose-faces.py`).
- Sound effects (whoosh, bell) are in `content/music-library.json` but not wired in.
- Ask Kai for: front-facing whiteboard pose, a three-quarter pose with an expression set.

## 6. Lessons from the first review
- Never draw two figures at the same spot (one that idles and one that carries): it showed four arms. Blend one figure's pose with `mix()`.
- The cast has a pale shirt-capsule torso, round hands, shoes and brows. Worried brows have the inner ends up. Diagrams sit on a `Panel` (white board with an offset shadow).
- When a `str.replace` edit does not match, it fails silently. Assert the old text is present.

## 7. Layout rules from Dr. CK's review of the pilot (apply to every new episode)
These came from her screenshots of the v2 render. She approved v2 as is and asked that they guide future episodes.
1. **Balance the empty space.** Portrait scenes without Dr. CiCi, and the portrait end card, left large empty bands (CTA pill high on the page, a gap, then her at the bottom). Centre or scale the art so the page reads as one composition, and put the end-card pill and text close to her, larger.
2. **No text collisions.** Keep at least 24 px between any caption line and any stage element (the portrait "What" line touched the bottom of the map panel). Check the busiest caption moments: three-line lockups and the frames where a panel or tag sits at the bottom of the stage.
3. **Props must not cover faces.** In landscape the "FIRST STEP" card sat at head height and hid both stick figures' faces. Keep cards, labels and panels clear of every head: place them above, below or between, and re-check once the card moves (it animates upward).
4. **Landscape captions sit too low.** The bottom of a 16:9 frame is covered by the player's progress bar and controls, and the caption block ended at y 1045. Keep landscape captions above about y 930 (86 percent of the height), and shrink the stage to make room.
5. Review method: run the collision checker, then contact-sheet stills in both formats before rendering.

**v3 applied these.** Landscape captions now end at y 925 and the stage is 957 px wide; portrait stage is 826 px wide while Dr. CiCi is on screen, and she grows on the end card. The first-step card sits above the figures' heads. `npx tsx scripts/check-stick.mjs <slug> <portrait|landscape> [step]` renders every sample twice (captions only, art only) and `scripts/overlap_report.py` lists moments where a caption comes within 22 px of the art. It does not check props against faces: look at those by eye.
