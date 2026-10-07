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

## 8. Batch notes (episodes two and three: Role and Relationship, Equity Theory)
- **Read the Content Library row first.** `Explainer:` rows in Notion carry the title, CTA keyword, scene beats and Marky fields. The voiceover Dr. CK actually records can differ from the row (pronouns, closing line, keyword). The recording wins for the video; flag any difference before staging copy anywhere.
- Marky captions were blank on both rows, and The Pile has no row. Staging a post needs approved caption copy: do not write it.
- A stage that reads a cue the plan lacks now throws `Missing cue "name"` (it used to draw with NaN).
- Dr. CiCi can be on screen from t = 0 (`ciciIn: 0`, first `cici` entry `walkIn`), which removes the empty bottom half of portrait for long scenario openings.
- Tag widths are 0.78 x size per character; pillar labels must be short (GOALS, KNOWLEDGE, RESPECT) to fit a 250 px spacing.
- Music level: measure each bed (`ffmpeg ... ebur128`) and set `volume` = 10^((-36.7 - LUFS)/20); duck to about 0.45 of that.
- Run `check-stick.mjs` for every episode and format before rendering. All four passed.

## 9. Dr. CK's notes on episodes two and three (apply from the next episode on)
The delivered videos stay as they are ("Let's just keep it all"). Do not re-render them unless she asks.
- **Landscape: Dr. CiCi sits closer to the action.** `spriteLeft` went from 70 to 190 (about 6 points toward the centre; she asked for 4 to 7, not centred). Checked on Role: no collisions with the stage art or the pointing hand.
- **Music loops and ends.** Tracks shorter than the video are chained as equal-power crossfaded `<Sequence>` segments, and every level is computed from absolute video time. Remotion's `<Audio loop>` restarts the frame counter on each pass, which broke the ducking and the final fade (this is what Dr. CK heard on Role: an awkward pause, then no fade-out).
  - Set `music.lengthSec` to the usable length of the track, which is **before the track's own fade-out tail** (the Role track decays from about 57 s, so `lengthSec` is 56), and `crossfadeSec` to about 2.5. A crossfade placed on the track's own tail dips about 12 dB.
  - The end fade is squared (`fadeOutSec` about 3.5) so it is audible over its whole length.
  - **Remotion rounds every volume to 1/97 steps.** A bed at 0.02 therefore has about two levels, and ducking and fades turn into steps. Pre-attenuate the file with `node scripts/prep-bed.mjs public/music/<track>.mp3 <volume>`, point `music.src` at the `.bed.mp3` it writes and set `music.scaled: true` (the curve then runs 0 to 1). Role is the reference plan. The Pile and Equity were rendered before this and still use the unscaled path.
  - Check a bed without rendering video: `npx tsx scripts/render-stick.mjs music <slug> portrait` writes `out/check/<slug>-music.mp3`. Look for a steady level through the crossfade and a smooth fall to silence at the end.
- **Stick women.** `Stick` takes `hair`: `'bob' | 'long' | 'bun' | 'ponytail'` (a solid cap with a fringe above the brows, plus the style). Leave it out for the men. `npx tsx scripts/render-cast.mjs` writes the preview sheet to `out/review/cast.png`. Mix the cast in new episodes so it is not all men.
- **Open: logo or end element.** She is considering a logo near the end of the landscape videos, maybe on all videos including the talking heads. She has not decided. Ask which logo(s) and where before building anything.
- **CQ Compass CTA on Equity Theory** does not follow from that script. She is keeping it as an experiment. Do not change it unless she asks.
- **Hair color (built, switched OFF).** `Stick` takes `hairColor` (`'blonde' | 'brown' | 'silver' | 'teal'`, muted on purpose, no red so it never competes with Dr. CiCi's hair). It does nothing until `COLOR_HAIR` in `src/stick/figure.tsx` is set to `true`, so every figure stays cast gray. **Dr. CK decides when to turn it on; do not flip it without her say-so.** It only affects new renders. Her reasoning: she is the only full-colour character (plus the crimson accent in the diagrams), and she wants to test the plain look first. Judge the test on three-second hold and completion rate, not raw views, and change one thing at a time. A preview of the colours is `npx tsx scripts/render-cast.mjs` (the sheet forces them on).

## 10. Posting standard (Dr. CK, Oct 7)
Dr. CK made this the standard for every post. Use the ContentOS schedule, never Marky's recurring queue: create each post with an explicit `scheduled_publish_time`. Times are ET and sit just before the platform's peak hour (the minute is :53, changed from :47 on Oct 7), never on or after the hour.
- Instagram and TikTok: 9:53 AM. If the morning is missed, they go out the same day at the evening slot, 5:53 PM (Metricool's peak for both is 6 PM).
- LinkedIn company page (`linkedIn`) 10:53 AM first, then her personal profile (`linkedInProfile`) shares a snippet with a link to the company post. Facebook 11:53 AM, YouTube 3:53 PM (peak hour 4 PM), Google Business 9:53 AM, Pinterest 7:57 PM.
- Added same-day slots used on Oct 7: YouTube landscape 2:53 PM, LinkedIn 4:53 PM.
- One Marky post per platform. TikTok and YouTube take a title override. Portrait goes everywhere (Instagram Reel, TikTok, Facebook Reel, LinkedIn, YouTube Short). Landscape goes only to the YouTube channel as a regular video.
- Captions are written from the idea, not copied from the script (a first pass overlapped the script by about 75 percent and Dr. CK called it out). Hook from a numbered library starter, one question at most, one ask, three hashtags, written-out "the link is in my bio". Links go in the caption on LinkedIn, Facebook and YouTube.
- Changing a scheduled post's time uses `schedule_post` (`update_post` cannot move it).
- Marky upload: `create_media_upload`, then PUT the file (needs `api.mymarky.ai` allowed in the environment's network settings), then pass the media id to `create_post`.
- Content Library `Destination` has no Substack option. For a Substack ask leave it blank and use CTA Mechanism "Direct link".
- Check scripts against Copy Rules section 7 (no fictional clients) before rendering. Role and Relationship's recording says "A fictional client says to me"; Dr. CK saw this and chose to publish as it is.
