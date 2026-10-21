# Talking-head video playbook (Remotion)

Owner: Dr. CK (C3 Global). Her AI avatar is Dr. CiCi. Output: 1080x1920, 30 fps, for Instagram Reels, TikTok and Shorts.
Everything here was settled with Dr. CK on real videos. Treat the rules as locked unless she changes them.

## 0. What a "template" means here
A template locks the look and the rules. Each video still gets its own scene plan (`content/<slug>.scene.json`) built from its script.
Starter plans: `content/templates/black-glass.scene.json` and `content/templates/fun-cuts.scene.json`.
Start one with `npm run new -- <slug> black-glass` (or `fun-cuts`).

| Template | Look | Use for |
| --- | --- | --- |
| **Black Glass** | black field, full frame her, picture-in-picture window (layout `E`), hidden-avatar scenes, holographic glass pills | frameworks, diagrams, "four things" scripts |
| **Fun Cuts** | scenes alternate black and white, split screen (layout `S`), notes cards, notifications, headline cards, source cards | stories, contrast, research explainers |

Both share: editorial kinetic captions, italic Playfair, metal and crimson rules, film finish, music, end card, pacing rule.
Red velvet background: `public/backdrops/red-velvet.jpg` (crimson velvet from Kai's carousels, 1122x1402), use per scene with `bg: "backdrops/red-velvet.jpg"` on dark scenes. Dr. CK loves it ("it is me") and wants it mixed in with black, not used everywhere. Rose gold emphasis words are low contrast on it; check stills. Marble photo backgrounds: waiting on Dr. CK's source files (see "Open items"). The generated marble in `backdrops.tsx` was rejected as too busy; only `MARBLE_STRENGTH` 0.3 remains as an option.

## 1. Environment (cloud session)
- Allowed domains needed (Environment settings, Network access): `drive.google.com`, `drive.usercontent.google.com`, `huggingface.co`, `us.aws.cdn.hf.co` (or `*.hf.co`), `c3globalco.substack.com`, `substackcdn.com`.
- Fonts offline: `export REMOTION_LOCAL_FONTS=1`
- Browser: `export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
- Whisper model (git-ignored) downloads on first use: `WHISPER_MODEL=small.en`.
- Disk hygiene: the session disk allowance is small. Each stills or render run copies `public/` (about 400 MB with mattes) into `/tmp/remotion-webpack-bundle-*`, and stills pile up in `out/stills`. After every review round delete `out/stills`, `out/prev` and the `/tmp/remotion-webpack-bundle-*` folders (all regenerable). A full disk shows up as ENOSPC. Keep masters, `public/raw` and `public/matte` for any video Dr. CK has not downloaded yet; delete a master only when she says she has it.
- Upload limit here is about 30 MB per file: send a review copy (`-b:v 3000k`) and keep the master in `out/`.
- Files are pulled from Dr. CK's Drive folder "Talking Head Videos" through the Drive connector. Downloading needs the file shared by link: `node scripts/fetch-drive.mjs <fileId> <out>`. Ask her to switch sharing back to Restricted afterwards.

## 2. Workflow
1. **Get the video.** Drive file id (or an attachment). Conform to 30 fps: `ffmpeg -i in.mp4 -r 30 -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k public/raw/<slug>.mp4`.
   - Check the ending. Takes are sometimes cut off mid-sentence. If so, propose closing lines and stitch a part 2 with `npm run stitch -- <slug> <slugA> <endA> <slugB> <startB>` (cut at a sentence break, cover the picture seam with a cutaway).
2. **Transcribe.** `npx tsx scripts/transcribe.mjs <slug> public/raw/<slug>.mp4` then `node scripts/tokens-to-words.mjs <slug>`, `node scripts/snap-words.mjs <slug>`, `node scripts/words-to-captions.mjs <slug>`.
   - Whisper splits names into pieces and invents words after the real end of the audio. Delete words that start after the video ends. Strip stray quote marks. Fix names against Dr. CK's own docs in Drive (her "Content Pack" docs hold the sources and spellings).
3. **Send Dr. CK the transcript to confirm** before building anything. Ask about names, links and the closing line.
4. **Plan.** `npm run new -- <slug> <template>`, then rewrite the scenes for this script (see section 4). Run `npm run pacing -- <slug>`.
5. **Stills.** `npm run stills -- <slug> <seconds...>` and look at them yourself. Optional: `--field=...`.
6. **Render.** Always one frame at a time: `RENDER_CONCURRENCY=1 npx tsx scripts/render-batch.mjs <slug>` (about 15 to 20 minutes).
   Parallel rendering paints random frames half white. After rendering, scan for flashes with `signalstats` YDIF: any spike that is not at a planned cut is a bug.
7. **Review copy** under 28 MB, send with the file tool, then commit and push.
8. Dr. CK's rule: **stills before a full render on a new look; a full render is fine once the look is approved.**

## 3. Locked style rules
- Captions: **Editorial** kinetic lockups. When a graphic already shows every content word of a lockup (statement, headline, chips, chat, notes lines that are visible), the lockup is skipped so nothing is read twice; if even one word is missing from the graphic the caption stays, so no word is ever lost (Dr. CK's rule, Oct 2026). Statement cards in hidden-her scenes use `box {y: 60, h: 620}` so a 3 to 4 line card never reaches the caption band. Hero word huge in Playfair Display **italic** 800 (lowercase), small support words in DM Sans 700 sentence case at 56 px, white on dark scenes and black on white scenes. Highlight boxes white or black only. Emphasis words get the metallic rose gold italic.
  - Band: 55 to 72 percent of the frame (y 1056 to 1382). Captions can move to the top band (y 250 to 560) and may alternate by sentence in hidden-avatar scenes. Keep clear of the top 12 percent, bottom 22 percent and right 12 percent.
  - No chunk ends on a connector word. Auto-chunker is in `src/Kinetic.tsx`.
- Fonts: Playfair Display and DM Sans. **Wherever Playfair appears it is italic.**
- Colors: crimson #C91B19, white, black, charcoal #3A3F42, metallic rose gold (#B76E79, #D48A8C) and gold (#D5AA4A). Metallic red built on the crimson hex is allowed (`kind="crimson"`). No cream, ivory or off-white. Metal only over black or white fields. One small crimson accent per scene.
- Glass: translucent pills with a holographic foil rim in brand tints only (rose gold, champagne, white, pale crimson). Labels 44 px in diagrams. Lines must stop at the pill edges (mask), never show through the glass.
- Her face: **no hook tag on her forehead.** She stays full frame only up to about 4 seconds at a time (hard stop at 6). Picture-in-picture, split screen and hidden-avatar scenes all count as cuts.
- Finish: `finish.grain` about 0.35 and `finish.lightLeaks` about 0.5 (she liked it, asked for it hoping it reduces the "fake" look).
- Music: Audiio tracks from her Drive "Music" folder, mixed under her voice with automatic ducking (`music` in the plan). `npm run sync-music`, then **`node scripts/level-music.mjs`** (levels every track to -24 LUFS with a gentle compressor into `public/music/leveled/`), then `npm run music -- <slug> <mood>`. Defaults for leveled tracks: volume 0.35 (rest), duckTo 0.16 (while she speaks: about 17 dB under her voice, her videos sit near -23 LUFS). Ducking bridges gaps shorter than 0.9 s, attacks in 0.15 s and releases over 0.6 s so the bed does not pump in every breath. History: Dr. CK said the music was too loud on `dialects` and `rough` (raw tracks are mastered near -10 LUFS and sat only 2 to 5 dB under her voice at the worst moments); `reverse-joined` stays at 0.24 / 0.085 on the raw track as delivered. She asked not to re-level the voice for now (`npm run finalize -- <slug>` exists and does -14 LUFS if she changes her mind).
- End card: link pill. Typical label "LINK BELOW OR IN MY BIO", url `bio.c3global.co`; for article videos "FULL ARTICLE ON SUBSTACK" with `c3globalco.substack.com`. Captions stop where the end card starts.
- Substack: show her **publication archive page** (a real capture) when the article is not live yet. Capture recipe: curl the page and its assets, rewrite urls to local files, screenshot with headless Chromium at 720 px wide (see git history, `work/sub*/snap.py` pattern), save to `public/shots/`, use `screenshot-card` with `mode: "full"`.
- Never invent facts, numbers, quotes or credentials. Citations come from her own Content Pack docs. Illustrative message text (like "I have some news!") must stay generic.
- Voice when writing to her: no em dashes, address her as Dr. CK, give the production-ready thing first.

## 4. Cadence and cutaways (what she wants more of)
- A visual change at least every 4 seconds, and on key words. Either cut away to show relevance, or stay on her on purpose.
- **Diagrams and B-roll are welcome**, including cutaways to examples of what the research describes. Plan at least one diagram per framework script, and a proof cutaway (source card, abstract page capture, article page) for each cited source.
- Graphic types (see `src/schema.ts`): `congruence-map` (4 linked pills), `notes-card`, `notification-stack`, `chat-ui`, `meeting-tile`, `quiet-feed`, `citation-card`, `headline-card`, `rewrite-card`, `statement-card`, `floating-chips` (`mode: "stack"`), `hub-diagram`, `chapter-card`, `screenshot-card` (`mode: "card" | "full"`).
- Layouts: `A` full frame, `B` / `C` / `D` windows (older), `E` centered portrait window with room underneath, `S` split screen (cutaway on top, her in the lower half). `avatar: "hidden"` on `C` or `E` removes her (audio continues). Per-segment `focus: {y, zoom}` frames her inside a window. `captionPos`: `bottom`, `top`, `alternate`.

## 5. Known pitfalls
- `backdrop-filter` and the SVG refraction filter caused white-tile flashes in video renders: clear glass no longer uses either. Do not add them back.
- Remotion renders `OffthreadVideo` audio at the source level; music is added with `<Audio>` and a volume function (ducking uses caption word times).
- Part-2 takes may differ slightly in level and sample rate: `stitch` level-matches and crossfades the audio.

## 6. Open items
- **Marble photo backgrounds.** Dr. CK found three beautiful marble textures (white with rose gold veins, black with rose gold and silver, deep red with cream veins). The image only appeared in chat; she must supply the files (ideally 2160x3840+) in Drive or as an attachment. Scenes already support `bg: "backdrops/<file>.jpg"` via `PhotoBackdrop`. Save the files to `public/backdrops/`, show stills first.
- **Text behind her head / hair over the card edge.** Needs a person matte. Best: her avatar tool exports a transparent or green-screen version. Fallback: AI matting (check the model licence allows commercial use; curly hair is the risk) tested on a few frames first.
- **B-roll sourcing**: screenshots of real sources (PubMed abstracts, HBR, author pages) are possible; stock images need a licensed source she approves.
- Sound effects (whoosh, bell) are in `content/music-library.json` but not wired into cuts yet.
- Larger idea: `captionStyle: "heavy"` exists but she prefers Editorial.

## 7. Image + voiceover with Jogg.ai (comparison only, not the primary method)
Dr. CK's first verdict on the Jogg test (`terrace`, Oct 2026): the movements were not up to par, so she did not make it the primary method. After comparing it with the stitched two-clip version (`week2`, clips from her other avatar generator, MediaPlace.io), she said the Jogg video looks much better: the other generator over-animates her and she keeps moving the mic away from her face. Which one becomes primary is her call; ask her before assuming. Her primary method is stitching clips from her avatar generator (she called it MediaPlace.io). Keep `terrace` as the comparison piece against the stitched version of the same script.
How it was done, in case she wants it again:
1. Allowed domains: `asset-intl.jogg.ai` and `res-intl.jogg.ai` (plus the usual list).
2. Convert the still to JPG (`ffmpeg -i face.webp -q:v 2 face.jpg`). For a test, cut the voiceover to about 16 s at a pause; for the real thing use the full audio.
3. Jogg MCP `jogg_post_upload_asset` returns `sign_url` and `asset_url`. PUT the bytes to `sign_url` with the right `Content-Type` (curl), then use `asset_url` in later calls.
4. `jogg_post_photo_avatar_add_motion` (model `2.0-Pro`, her custom voice id) makes the animated avatar. It took about 12 minutes; poll `jogg_get_photo_avatar` with the `motion_id`. It is paid work.
5. `jogg_post_create_video_from_avatar` with `avatar_type: 1`, `voice.type: "audio"`, `audio_url` of the uploaded voiceover, `aspect_ratio: "portrait"`, `screen_style: 1`, `caption: false`. The render took seconds. Download `video_url`.
6. Conform to 30 fps, pad 2.5 s of frozen picture and silence at the end for the end card (`tpad=stop_mode=clone:stop_duration=2.5`, `apad=pad_dur=2.5`), then follow section 2 from step 2 (transcribe the audio file itself).
7. Align every scene cut to a caption chunk start (`buildLockups` prints chunk times). A cut inside a chunk puts the caption in the wrong band for part of the cut.
Her Jogg account had 400 credits at the time; the OpenArt account is on the free plan (40 credits), too few for any video model.
- Comparison pair for this decision: `out/terrace.mp4` (Jogg, one image plus voiceover, 50 s) and `out/week2.mp4` (two stitched clips, 78 s). Different scripts, same Fun Cuts template and music level.
- The handheld mic is part of her influencer look on purpose. Do not suggest removing it. Jogg kept the mic in her hand and steady; the other generator (MediaPlace.io) over-animates and moves the mic away from her face.

## 8. From finished video to scheduled posts (Marky and the Notion Content Library)
Run this only after Dr. CK approves the finished video. The approval can be a plain "this is it". She approved Dialects and Rough this way (Oct 2026) and then asked for scheduling.
1. **Render both cuts.** Master (`out/<name>.mp4`) plus a share cut (`out/<name>-share.mp4`, about 20 MB) for the platforms.
2. **Read the Content Library row** (Notion data source `collection://6d3eb389-7c81-4696-aa91-d4827ac1b6bf`): Publish Date, Platform, Marky Caption, CTA Mechanism, CTA Copy, CTA Keyword, CTA Link. If the row has no Marky Caption, the caption lives on the week's Scripts page in ContentOS (Instagram and Facebook version). Never write new copy; use what is there and flag gaps.
3. **Check connected accounts** with `list_connected_social_accounts` (Marky business `29797760-861d-4235-bd99-880bddc16f09`, "C3 Global"). X is intentionally skipped (Dr. CK: do not worry about X). LinkedIn means the C3 Global Agency page (`linkedIn`), not the personal profile.
4. **Upload the share cut.** `create_media_upload` returns a URL; PUT the file to it with curl (`Content-Type: video/mp4`). Sandbox egress to `api.mymarky.ai` works. The response gives the media id and its public `original_url`.
5. **One `create_post` per platform**, `status: SCHEDULED`, `media_ids`, `restrict_publish_to`, and metadata (`format: talking-head`, `series: talking-head`, `episode`, `keyword`, `platform`). Times follow the existing explainer posts, America/New_York: Instagram, TikTok and Pinterest 9:53 AM; LinkedIn 10:53 AM; Facebook 11:53 AM; YouTube 2:53 PM. Send an explicit offset (`-04:00` in October, `-05:00` after the clocks change).
6. **CTA wording per platform.** Instagram and Facebook: "Comment <KEYWORD> and ...". TikTok: "DM me <KEYWORD> and ...". LinkedIn, YouTube and Pinterest: drop the keyword line and put the CTA Link in the post text. Pinterest must always carry a link (pin `link` plus the same link in the caption); Dr. CK's rule. TikTok, YouTube and Pinterest get a `title` override (the row's Marky Title, or the video's title). Hashtags, when the week has them, go in the caption (that is how the existing scheduled posts do it). Do not invent hashtags a row does not have. Marky appends `https://www.c3global.co` to TikTok captions on its own.
7. **Update Notion** after Marky confirms: Stage `Scheduled`, Marky Post ID (list each platform's id), Marky Caption if it was empty, and Render Link (the Marky `original_url` of the share cut; Dr. CK allowed Claude to fill this in). Dr. CK's approval of the video and the scheduling request count as the approval to move Stage to Scheduled.
8. **Say what you did** in plain terms: platforms, dates, times, anything skipped, anything on the row that still needs her.

## 9. Dr. CK's standing preferences for this work
- Show **stills before a full render** whenever a look is new.
- Do **not re-level the audio** for now. Music is already leveled (-24 LUFS tracks, steady ducking); apply the current levels to new videos without asking again.
- Captions: the graphic becomes the caption where it carries every word; never drop a spoken word.
- Do not merge pull requests without her explicit word. Tell her when one is waiting.
- The handheld mic in her avatar image is intentional. Do not suggest removing it.
- Never use em dashes in anything written for her, and address her as Dr. CK.
- Drive sharing for source clips goes back to Restricted when she says so; do not change sharing on your own.
- Pills (labels, tags, caption pills, comment and follow pills): each one goes in the correct area for what it labels (never over her face, never colliding with captions or another graphic) and stays on screen only briefly, just long enough to read. No pill that lingers for a whole scene. Applies to new effects too (prompt bar, comment drop, follow card).
- Palette: crimson, white, black, charcoal, with metallic rose gold and metallic copper used MORE and gold as the secondary accent. No cream. Never write caption or card copy: use what is in Notion, Marky or her script and flag gaps. Demo text in lab plans is placeholder only and must never reach a real video.
- Open questions to ask her once, not every time: the voice profile accent line (A or B) and whether the recordings are her live voice or a clone; the exact sources for the Edward Hall and Coch and French cards.

## 10. FX Pack: 26 effects on her clip, plus the sound kit (added Oct 2026)
Dr. CK asked for "all of them" after seeing a paid bundle's effect list. These are our own builds in the C3 look (crimson, black, white, copper, gold, Playfair, DM Sans, Anton, Caveat for handwriting). Code lives in `src/fx/`; plans use a top-level `fx` array and a `matte` slug. Two demo reels show every effect: `content/fxdemo-a.scene.json` (Dialects footage: the behind-her effects) and `fxdemo-b.scene.json` (Rough footage: the over-her effects). Render them with `npm run render -- fxdemo-a` (the default `npm run render` skips slugs that start with `fx`).

**Person matte (needed by the behind-her effects, the sticker, and pointers/labels).** `npm run matte -- <slug>` reads `public/raw/<slug>.mp4` and writes `public/matte/<slug>.webm` (transparent cutout, full size) and `<slug>.anchors.json` (per-frame head, chest, shoulder positions). Both are git-ignored. Needs `pip install mediapipe opencv-python-headless` and, on a bare Linux box, `apt-get install libegl1 libgles2`. The model is committed in `scripts/models/`. About 3 minutes of segmenting plus 3 to 5 minutes of VP9 encoding for a 60 s clip. Then set `"matte": "<slug>"` in the plan. The matte edge is choked slightly to remove the gray-room halo around her curls; look at hair edges in stills before a full render. Desk props touching her (notebook, flowers, mic) count as foreground, which is fine because effects sit behind them.

**Plan syntax.** `"fx": [{"type": "type-wall", "at": 10.0, "until": 14.2, "props": {...}}]`. Times are absolute seconds like graphics. `until` is optional (each type has a default length). `"sfx": "none"` silences one event; any file name in `public/sfx/fx-<name>.wav` replaces its main sound. `"fxVolume"` (0 to 1, default 0.6) sets the whole kit under her voice.

| Effect (`type`) | What it does | Needs matte |
| --- | --- | --- |
| `digital-zoom` | slow creep onto her face, hard snap on a key word | no |
| `zoom-through` | camera dives through her, cuts to a tighter second framing | no |
| `blackout` | lights cut on a line and snap back | no |
| `type-wall` | giant words march behind her and swap on the word she says | yes |
| `headline-wall` | the wall behind her fills with scrolling headline cards | yes |
| `couch-wall` | grid of cover tiles on the wall behind her | yes |
| `knockout-tiles` | name tiles slam on, then are knocked out one by one | yes |
| `spotlight` | room goes dark, she stays lit, key words land in gold | yes |
| `orbit` | cards circle her, passing behind and in front | yes |
| `clone` | copies of her pop up beside her on her words | yes |
| `frame-break` | her clip shrinks into a gold-rimmed card and she pops out of it | yes |
| `ui-world` | an app screen fills the frame, she steps back in front of it | yes |
| `green-screen` | a full-screen plate (text or screenshot) with her shrunk at the bottom | yes |
| `freeze-sticker` | freeze frame becomes a die-cut sticker with handwritten notes | yes |
| `the-stack` | data cards with racing bars (lower third) | no |
| `sticky-text` | copper tag stuck above her cap that follows her | anchors |
| `freeze-label` | picture freezes, labels point at her | anchors |
| `phone-mockup` | 3D phone flies in beside her | no |
| `checklist` | steps tick off as she says them (lower third) | no |
| `pointer-callout` | cards tied to her by lines that follow her | anchors |
| `odometer` | numbers roll digit by digit | no |
| `before-after` | wipe line turns the raw look into the edit | no |
| `chart-grow` | a chart draws and ends on a gold label | no |
| `comment-bubble` | the keyword types itself, posts, reply with link lands | no |
| `timeline-burn` | an editing timeline builds, then catches fire | no |
| `pull-back-reveal` | her clip shrinks into an editing app window and gets cut | no |

**Rules learned in the stills.** Her face fills the frame, so cards that sit in the top half cover her face: lists, charts, odometer and comment bubbles go in the lower third (already their defaults). Behind-her effects work best in layout A (full frame); the hook scrim steps aside while any effect runs. Do not stack two effects that both cover the lower third. One strong effect every 4 to 6 seconds is plenty; the demos are packed on purpose. Show stills before any full render of a new effect combination (standing rule).

**Sound kit (v2).** `npm run sfx` synthesizes 14 sounds into `public/sfx/fx-*.wav` (numpy and scipy, no licensing): whoosh, swish, riser, thud, boom, snap, pop, blip, tick, type, ding, shutter, crackle, glitch. Dr. CK said the first version sounded amateur and misplaced, so v2 uses real frequency sweeps, rounded UI sounds, a short room tail, and plays far fewer cues. `"fxSound"` in the plan: `minimal` (default, only each effect's main entrance sound, about 11 cues across all 26 effects), `full` (adds ticks, pops and per-item cues) or `off`. `"fxVolume"` (default 0.5) sets the level under her voice; `"sfx": "none"` silences one event. Claude cannot hear audio, so Dr. CK's ear decides; ask which names felt wrong.

**Land effects on her words.** `npm run word -- <slug> "phrase" ["phrase" ...]` prints the second she says each phrase (from `content/<slug>.words.tsv`). Use it for `at`, word times, `knockAt`, checklist and stack row times so text and effects hit the right word. The first demos used guessed times and felt off; the demos now use these lookups. The stack rows and chart in the demos are illustrative bars only, never real study numbers.

**Cutout outline (optional).** If edges look soft against a busy room, bake an outline: `npm run outline -- <slug> copper` (also `white` or `gold`, optional width in px, default 15, Dr. CK's pick: thicker covers more of the hair edge), then set `"matteOutline": "copper"` in the plan. The outline is baked into `public/matte/<slug>.<kind>.webm`, with the brand metal bands and the slow 3.5 s shimmer sweep, so rendering costs the same as the plain cutout. With `matteOutline` set, the outlined cutout is drawn over her clip for the whole video (not only during behind-her effects), so the outline is always visible. Each clip needs its own bake; a plan with `matteOutline` but no baked file will fail, so bake first. Do not use a CSS filter outline: it made stills take over ten minutes.

**Footage advice.** The cutout and the effects look best with a plain, uncluttered background and clear light between her and the wall. Busy shelves, a black-and-white outfit and red locs are all fine, but clutter touching her edges costs the most cleanup.

## 11. Style presets and mix-and-match
Six named presets (Signature, Quiet Authority, Spotlight, Show and Tell, Hype Reel, Raw Tape) plus freestyle dials for captions, backdrop, finish, music, effect sounds, outline and an effects pack. Signature is the look Dr. CK approved and reproduces it exactly; plans without `style` or `mix` are untouched. Full table, rules and commands are in `docs/STYLES.md`. Use `npm run style -- list`, `set` and `show`. When she says "make it Spotlight but keep the Signature captions", set `"style": "spotlight"` and `"mix": {"captions": "editorial"}`. Show stills before a full render of a new combination (standing rule).

## 12. "Do ya thing" (Dr. CK's one-line command)
This command is for regular talking-head videos. Casual in-car and at-home videos are yaps and use "edit my yap" (section 15). If she says "do ya thing" on a clip that is clearly a yap, ask her once which she means.
She drops raw clips (and scripts or captions text) and says **"do ya thing"**. It means: run the whole workflow below with the Signature style unless she names another, and stop where marked. She chose the phrase herself; do not call it "edit it".
1. Read this playbook, `docs/STYLES.md` and `docs/EFFECTS-LIST.md`. Check the environment (section 1).
2. Transcribe, build word timings and captions (section 2). Pad the end card.
3. If the plan will use behind-her effects, a sticker, or pointers: `npm run matte -- <slug>` (and `npm run outline` if the style has one).
4. Pick the style (default Signature; effects come from `docs/EFFECTS-LIST.md`, 111 in all, see section 14; she may say "use Spotlight" or "mix: ..." in the same message). Plan scenes, graphics and effects. Place effects on her words with `npm run word`. Effects are placed by Claude, not automatic: if the script has no obvious moments, propose three to five and let her pick.
5. **Stop and show stills** of every new look and effect moment (standing rule). Wait for her approval.
6. Render master and share cut. Flash scan. Report what you did and did not check (Claude cannot hear audio).
7. **Stop.** Do not schedule or merge anything until she asks (section 8 covers scheduling). Her approval of the video plus a request to schedule starts section 8.
If footage is cluttered or the background touches her edges, say so and suggest the outline dial. If she gives only a script and no clips, this command does not apply (see section 7 for image plus voiceover).

## 13. Second FX batch and the speed ramp (added Oct 2026)
Dr. CK asked for the rest of a paid bundle's list, so 13 more effects were added (`docs/EFFECTS-LIST.md`: pull-back, flash-frame, freeze-hold, grade, glow, dust, letterbox, voice-memo, polaroid-drop, notes-page, email-compose, lock-screen, date-stamp), a `"mode": "cut"` for before-after, a `"style": "line"` for timeline-burn, and a `look` dial in the style presets. Demo reel: `content/fxdemo-c.scene.json` (Dialects footage).
**Speed ramp is made first, before the plan.** `npm run ramp -- <slug> --at <sec> --dur <sec> --factor 0.5` bakes a slow-mo into a new clip (`<slug>-ramp`) and rewrites words, captions and every time in a copy of the plan, so nothing drifts. Voice: `--audio stretch` slows her voice with pitch kept (can sound odd; Dr. CK's ear decides), or `--audio silence` mutes her in the slow part, best for a silent gesture. Add `--smooth` for in-between frames; it renders slower and a few frames can still repeat in very still moments. If the plan uses a matte, run `npm run matte -- <slug>-ramp` after. Do ramps before placing effects on words, or re-run the ramp from the original.
Rules: lists and cards stay in the lower third; the voice-memo waveform follows when she speaks, not the actual sound; the polaroid needs a real photo from Dr. CK; never invent numbers in odometer, chart-grow or stack.

### Third FX batch (paper cut, doodle boil, vertigo, cover story, glass type)
Five more effects in `src/fx/third.tsx` (61 effects in all); descriptions in `docs/EFFECTS-LIST.md`, demo plan `content/fxdemo-d.scene.json` (Dialects footage). Her phrases: "add a paper cut at ...", "circle my head at ...", "add a vertigo at ...", "put me on a cover at ...", "add glass type: <word> at ...". Use `npm run word` to land them on her words.
- `paper-cut` (needs matte): `props.tone` kraft, cream or crimson; optional `props.label` makes a ransom-note strip drawn over her at the bottom.
- `doodle-boil` (no matte): `props.marks` is 1 to 6 marks, each `{kind: circle|underline|arrow|star|burst|heart|text, target: head|cap|chest|left|right|hands, at, text?, side?, color: white|gold|red}`. Marks follow her per frame through the matte anchors, so run the matte first for accurate placement; without one they use a default head position. Keep handwritten text short (it is clamped to the frame).
- `vertigo` (needs matte): `props.to` 1.1 to 2 (default 1.5), `props.direction` in or out. Her enlarged copy is hidden by a soft hole around her, so it reads best on a clean room; check stills.
- `cover-story` (needs matte): `props.masthead`, `props.headline`, up to 3 `props.lines`, optional `issue` and `kicker`. Her head should overlap the masthead. The headline sits low, over her torso, on a dark gradient.
- `glass-type` (no matte): `props.words` each with `at`, `props.y` default 0.82 (low on the desk; the middle of the frame is her face and body). Frosted fill is a blurred copy of the room.
Sounds: paper cut, doodle marks and glass type use detail cues (heard in `full` mode only); vertigo (whoosh) and cover story (shutter) are main cues. Check new looks with stills before a full render.

## 14. Fourth to sixth FX batches, flight, 3D tilt (added Oct 2026)
Dr. CK sent a screenshot list and then reference reels (the Claude edit reel among them) and asked for every effect she did not have. All of them are in the C3 skin (`src/fx/theme.tsx`: copper first, gold second, her orbital globe and lab objects as icons) and are listed with props in `docs/EFFECTS-LIST.md`, which is the source of truth for names and counts (111 effects and graphics now).
- Files: `src/fx/fourth.tsx` (UI moments, storyboard deck, card orbit, shared flight and tilt helpers), `fifth.tsx` (20 desk-object and UI moments), `sixth.tsx` (receipt ticket, frame calendar, cover frame, keycap drop, film strip, phone frame, clip type, storyboard wall, step chips, pen circle, caption stack, card carousel, card flip, script panel).
- **Flight** (`fly`: `off`, `swoop`, `orbit`): cards arc in from the sides or loop around the screen, then land. The storyboard deck flies by default; the playing grid, reel stack, testimonial stack and generating tiles take `fly` and default to `off`.
- **3D tilt** (`tilt`: `off`, `in`, `float`) on the storyboard deck, playing grid, video card, cover frame and phone frame. `card-carousel` is a true 3D ring and `card-flip` turns a card from her words to her own clip frame. Both use CSS perspective, so they need no matte.
- **Script panel** is a behind-her effect (needs the matte). The lab plan `content/fxlab15.scene.json` borrows the clean-report matte by setting `slug` to `clean-report`; its demo script lines are placeholders. Her cutout is edge-faded because the matte includes the sofa.
- Combining: effects stack by overlapping times and later effects draw on top. Do not put two on the lower third at once unless it is a deliberate combination.
- Pills and labels follow the section 9 pill rule. Cards sit low (under the caption band) or are full cutaway panels held only briefly.
- Real thumbnails: every `ClipTile` is a live `OffthreadVideo`. More than about 12 on screen at once is slow; the render timeout is raised to 180 s in `ClipTile`, but keep tile counts modest.
- Lab plans `content/fxlab*.scene.json` (and `fxdemo-*`) are for stills only. Review with `npm run stills -- <slug> <sec> ...` after exporting `REMOTION_LOCAL_FONTS=1` and `REMOTION_BROWSER_EXECUTABLE`, then clear `out/stills` (section 1).
- Placing effects on a real video: `npm run word -- <slug> "phrase"` for the time, then add the effect to the plan's `fx` array with real text from her script. Never reuse lab text.

## 15. Yaps (casual in-car and at-home talking videos, added Oct 2026)
Her command is **"edit my yap"**. It means: run the steps below with no further questions, except confirming the transcript. ("Do ya thing" is the regular talking-head command in section 12.)
1. Conform the clip (join parts in order if there are several) and transcribe it. Send her the transcript to confirm.
2. Tighten the pauses (`python3 scripts/tighten-pauses.py <slug> 0.3`) and build the plan from the recipe below.
3. Render the `-tight` slug, scan it for brightness jumps, and send a review copy. A yap uses the approved look, so stills are not needed first.
4. When she approves, send the final at about 6000 kbps under 28 MB. Do not schedule or merge anything until she asks.
A yap is a relaxed, lifestyle talking video. Dr. CK's rule: it must not drift toward the regular talking-head style, so it gets captions and a light edit, nothing more. The first two yaps were `stop-blaming-tech` (in a car) and `quiet-in-a-room` (three parts, `pt1` to `pt3`, joined in order).
- **The recipe:** word-by-word editorial captions with a few hero words; the pauses tightened (below); a lo-fi music bed at the standard levels (`music/leveled/warm-marscott-warm-sunlight.mp3`, the library's "lo-fi bed"); two or three slow zooms (`digital-zoom` with `snapTo` equal to `creepTo`, so there is no snap); no end card; end right after her last line, before her hand reaches for the camera. Set `"scrim": 0.7` so the room shows and white captions still read on light clothing.
- **No effects unless one matches what she says and shows something the captions do not.** The first car edit used a receipt, keycaps, a caption stack and a "meeting" tag; she rejected all of them as off-topic and as repeating the captions. She kept the card flip (software turns into the people) and agreed one cutaway at most.
- **Pauses:** `python3 scripts/tighten-pauses.py <slug> 0.3` shortens every silence longer than 0.3 s to 0.3 s and writes `<slug>-tight` (clip, word times, captions, plan with its effect times remapped). Render the `-tight` slug. These are jump cuts; watch the pose at each cut. A looser pace is 0.4, a tighter one 0.2. She asked for pauses to be edited out of yaps; talking heads keep her pacing.
- **Joining parts:** conform each part to 30 fps and 720x1280, then `ffmpeg -f concat`, then transcribe the joined file. Check that the video and audio stream lengths match for every part.
- **Brightness flicker bug (fixed):** the dark hook gradient used to switch off whenever any effect ran, including a plain zoom, so the picture flashed at every zoom start and end. `digital-zoom` no longer turns it off. Check any render with `signalstats` YDIF: big spikes should only sit on real cuts.
- **Caption timing:** measured on four videos, captions start about 50 to 90 ms after the sound begins, and the avatar's mouth moves about 70 to 200 ms before its sound, so captions look late against the mouth. `captionLeadSec` shows captions earlier, but Dr. CK saw no improvement at 0.15 s, so do not rely on it. When she says a caption is off, ask for the exact second and the word, then check that moment's word time against the audio.
- **Sound:** Claude cannot hear. Dr. CK's ear decides voice and music. The car yap's source has three different voices; ElevenLabs voice-changing removed the in-car sound, so she kept the original audio.
- **Platform notes:** trial reels (Instagram, shown only to non-followers) are a way to test a raw yap against an edited one; Marky may not schedule them.


## 16. Cutouts and caption rules from the Faceless48 demo review (added Oct 21, 2026)
Dr. CK reviewed the Faceless48 funnel demo and said the high-quality cutout was "literally perfect" and that hers must look like that from now on. Her standing instruction: **hers must look like that moving forward.**
- **Cutouts for behind-her effects (`type-wall`, `spotlight`, `orbit`, `clone`, `frame-break`, `ui-world`, ...) use BiRefNet, not the default cutout.** The default cutout (MediaPipe, `npm run matte`) is fast but leaks into dark sofas and chairs and wobbles at the edge. BiRefNet gave a crisp edge with no bleed on the same footage.
  1. One time only: `pip install onnxruntime opencv-python-headless numpy`, then `mkdir -p models && curl -L -o models/birefnet_lite.onnx https://huggingface.co/onnx-community/BiRefNet_lite-ONNX/resolve/main/onnx/model.onnx` (about 220 MB, MIT license, `models/` is git-ignored; needs `huggingface.co` in the allowed domains). Ask Dr. CK before downloading.
  2. `npm run matte -- <slug>` first (it writes the per-frame anchors the effects need), then `npm run matte:hq -- <slug> <startSec> <endSec>` for the seconds the effects use. It overwrites `public/matte/<slug>.webm` at 1080x1920 and leaves the person transparent outside the window. With no times it cuts the whole clip.
  3. Cost: about 13 to 18 s per computed frame on this container's CPU (it computes every second frame and blends between them), and about 12 GB of RAM, so cut only the effect windows and do not render at the same time (an earlier run was killed for memory).
  4. Look at a close crop of an effect moment before rendering. If the edge is not clean, do not hide it with an outline: the outline follows the mask, so a bad mask makes a bad outline.
- **A caption never sits on top of a graphic.** Check each effect that lives in the lower third (checklist, prompt bar, comment drop, flip card) against the caption position and move captions to the top band while it shows. Do not put the style label and top captions in the same seconds.
- **A caption never repeats text that is on screen.** If a graphic shows every spoken word, set that segment to `captions: "off"`. Words spoken inside a `captions: "off"` stretch are no longer captioned at all (the player now skips them even when a caption group started just before), so the graphic must carry them. Otherwise write the graphic so it adds something (a short label or a picture) instead of echoing the sentence.
- **Effects land on their words.** Every tick, wall word, chip and drop uses the real word time from `npm run word`, never a guess or a "nice" round time. Check by sampling a still at the word.
- **Strike-through dot bug (fixed).** `headline-card` and `rewrite-card` drew a small dot at the start of each line before the strike began. The strike bar is now zero width until it starts.
