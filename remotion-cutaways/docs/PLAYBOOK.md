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
Marble photo backgrounds: waiting on Dr. CK's source files (see "Open items"). The generated marble in `backdrops.tsx` was rejected as too busy; only `MARBLE_STRENGTH` 0.3 remains as an option.

## 1. Environment (cloud session)
- Allowed domains needed (Environment settings, Network access): `drive.google.com`, `drive.usercontent.google.com`, `huggingface.co`, `us.aws.cdn.hf.co` (or `*.hf.co`), `c3globalco.substack.com`, `substackcdn.com`.
- Fonts offline: `export REMOTION_LOCAL_FONTS=1`
- Browser: `export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
- Whisper model (git-ignored) downloads on first use: `WHISPER_MODEL=small.en`.
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
- Captions: **Editorial** kinetic lockups. Hero word huge in Playfair Display **italic** 800 (lowercase), small support words in DM Sans 700 sentence case at 56 px, white on dark scenes and black on white scenes. Highlight boxes white or black only. Emphasis words get the metallic rose gold italic.
  - Band: 55 to 72 percent of the frame (y 1056 to 1382). Captions can move to the top band (y 250 to 560) and may alternate by sentence in hidden-avatar scenes. Keep clear of the top 12 percent, bottom 22 percent and right 12 percent.
  - No chunk ends on a connector word. Auto-chunker is in `src/Kinetic.tsx`.
- Fonts: Playfair Display and DM Sans. **Wherever Playfair appears it is italic.**
- Colors: crimson #C91B19, white, black, charcoal #3A3F42, metallic rose gold (#B76E79, #D48A8C) and gold (#D5AA4A). Metallic red built on the crimson hex is allowed (`kind="crimson"`). No cream, ivory or off-white. Metal only over black or white fields. One small crimson accent per scene.
- Glass: translucent pills with a holographic foil rim in brand tints only (rose gold, champagne, white, pale crimson). Labels 44 px in diagrams. Lines must stop at the pill edges (mask), never show through the glass.
- Her face: **no hook tag on her forehead.** She stays full frame only up to about 4 seconds at a time (hard stop at 6). Picture-in-picture, split screen and hidden-avatar scenes all count as cuts.
- Finish: `finish.grain` about 0.35 and `finish.lightLeaks` about 0.5 (she liked it, asked for it hoping it reduces the "fake" look).
- Music: Audiio tracks from her Drive "Music" folder, mixed under her voice with automatic ducking (`music` in the plan). `npm run sync-music`, then `npm run music -- <slug> <mood>`. Defaults volume 0.18, duck 0.06 (lowered a little for new videos on Dr. CK's word; the Reverse Perspective video stays at 0.24 / 0.085 as delivered). She asked not to re-level audio for now (`npm run finalize -- <slug>` exists and does -14 LUFS if she changes her mind; her videos measure about -23 LUFS).
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
