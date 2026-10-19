# Life Scenes Production Workflow

End to end: clips from Dr. CK → edited Life Scene → approved copy → Notion row → scheduled in Marky.
Built and proven on the Oct 2026 batches (Finished Version, Weeks After, Queue and Report, Count to Ten, Second Sentence, Every Status Is Green, Red Is a Gift).

Read these first, in this order: this file, `LIFE_SCENE_EFFECTS.md` (effects, rules, how each is built), `PLAYBOOK.md` section 9.

## 0. Standing rules (Dr. CK's decisions, do not re-ask)
- **No color changes, ever, unless she asks.** Her clips arrive already graded. No grades, glow, light leaks, golden or blue hour, no letterbox bars on reels. Finish with `--plain` (grain only). She rejected golden hour, glow-as-grade and bars on 2026-10-16.
- **Motion is fine.** Slow push-in, punch-in at a gesture, freeze, handheld drift. Punch-in needs real strength on HD sources (1.20 to 1.25x), 1.10x reads too subtle.
- **No tags, badges, end cards, fades or dissolves between clips.** Hard cuts only. No talking-head clips in Life Scenes.
- **On-screen text is the point of a Life Scene.** Text pill = crimson velvet with penny copper rim, Covered By Your Grace, inside the caption band. If she has not supplied wording, propose lines for her approval. Never build text she has not approved.
- **Plain English, said the way Dr. CK talks.** No idioms nobody uses ("put a name to it"), no jargon from the generator briefs ("writes red", "team's own list"). Every line must make sense on one hearing. Start from her spoken wording and tighten it. Ask "what does this mean?" before using a phrase from a brief.
- **Captions extend the scene, they do not repeat the script.** Explain the idea, add a clearer or deeper thought, use emojis (Instagram, TikTok, Facebook, YouTube). Keep the opening template and the approved CTA word for word.
- **Never invent** facts, numbers, quotes, clients, urgency. Em dashes are banned everywhere.
- **Voiceover:** if the voiceover is longer than the clip, play the clip at normal speed then hold the last frame under a slow push-in (`LSClip` prop `holdFromSec`). Never slow the clip down. Remove the clip's own audio with `--no-audio` when a voiceover replaces it.
- **One video per day.** Life Scenes go only on days with no talking head, explainer or miniseries scheduled.
- **Claude cannot hear.** Sound is measured, Dr. CK approves by ear. Real recordings only for sound effects. Music is an Audiio track she picks.

## 1. Intake (ask only what is missing)
For each scene: scene title, the clip file, which Notion script row it belongs to, any voiceover she will record. The title beside the date in her script doc tells you which clip is which. Do not ask her to repeat it.
- Probe every clip (`ffprobe`): length, size, fps, audio. Pull a 5-frame contact sheet and look at it.
- Compare the clip to the brief. Flag mismatches (wrong outfit, wrong setting, clip shorter than the brief) before editing.
- Note the clip's own audio. Marky's video analysis shows generated clips often carry a music bed and sometimes speech. Listen-check items go in the report.

## 2. Copy (before any build)
Sources, in Notion (C3 Global ContentOS):
- Week script pages ("Week N Scripts (dates)") hold the Life Scene scripts, overlay lines and draft captions.
- `Approved Copy Library > Copy Rules`, `Hooks & Caption Starters`, and `CTA & Keyword System`.
Rules to apply:
- Each caption is built from a named template (Hooks & Caption Starters page and number). Keep the template opener. Record it in "Hook Template Used".
- One keyword, one ask, one question per caption. Approved CTA lines: Instagram, Facebook, Pinterest "Comment KEYWORD ..."; TikTok "DM me KEYWORD ..."; LinkedIn and YouTube carry the canonical link. SHIFT sends the Shift Index, PRESENCE the Presence Profile, AIREADY the AI Advantage Audit.
- Contractions, no banned vocabulary, no negate-then-reveal pairs, no false absolutes (nobody, everyone, always, never), complete sentences, read-aloud test.
- No fictional clients. "Your client" spoken to the viewer is fine.
- Present theory as one possible explanation. Do not cite studies that are still flagged for verification.
- Pinterest descriptions are short: use a compact caption variant.

## 3. Edit (in `remotion-cutaways/`)
Environment: Remotion 4, Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, flags `--browser-executable=... --chrome-mode=chrome-for-testing`, env `REMOTION_LOCAL_FONTS=1`. Copy source clips to `public/raw/` (git-ignored).

Pipeline per scene:
1. Camera pass: `LSClip` (props: `src`, `effect` zoom | pullback | punch | drift | freeze | none, `from`, `to`, `moveSec`, `px`, `py`, `atSec`, `drift`, `holdFromSec`). Render a JPEG sequence with `--sequence --image-format=jpeg --jpeg-quality=95 --frames=0-N`. Compositions are 480 frames max; raise `durationInFrames` in `src/Root.tsx` for longer clips.
2. Text pass: `LifeSceneText` (props `font` covered, `durationSec`, `lines[{text[], fromSec, toSec, top}]`). PNG sequence with alpha. Keep each line to about 22 characters or fewer. Two or three lines per card. For a short clip, keep the first card up and add the second below it so both stay on screen (tops 950 and 1110).
3. Finish: `python3 scripts/ls_finish.py --picture CAM/element-%03d.jpeg --overlay TXT/element-%03d.png --audio-from CLIP.mp4 --plain --out out/LS_Title_draft1.mp4`.
   - Frame-number padding follows the frame count: under 100 frames is `%02d`, 100 or more is `%03d`. Check the first filename.
   - Flags: `--plain` (grain only), `--no-audio`, `--blackout S E` (M05), `--flash`, `--letterbox`, `--glow`, `--grade`, `--leaks` (only when she asks).
4. Check: pull frames at the text moments and look at them. Confirm length, audio stream, text inside the caption band, nothing cut off.
5. Send drafts with SendUserFile (30 MB limit per file). Name `LS_Title_Words_draftN.mp4`, final `LS_Title_Words.mp4`.
Long renders: run in the background with `setsid nohup`, use a Monitor on the log, keep each foreground command under 600 s. Do not `rm` with a bare variable glob; use `"${VAR:?}/dir"`.

Voiceover mix: `ffmpeg -i vo.mp3 -af "loudnorm=I=-16:TP=-1.5:LRA=7,adelay=500|500,aresample=48000"`, then pass the wav to `--audio-from`. Measure length first and compare to the clip.

## 4. Notion (Content Library)
Data source `collection://6d3eb389-7c81-4696-aa91-d4827ac1b6bf`. One row per scene, modeled on "Life Scene: The Finished Version".
Properties: Title "Life Scene: Name", Content Type Life Scene, Format Cinematic short, Pillar, Platform (Instagram, TikTok, Pinterest, LinkedIn, Facebook, YouTube), Stage, Lifecycle Status Active, Visual Status Rendered, Drafted By Claude, CTA Mechanism Hybrid, CTA Keyword, CTA Link, CTA Copy (all platform variants), Hook Template Used, Marky Title, Marky Caption (paragraphs joined with `<br><br>`), Marky Post ID (one per platform), Notes, Publish Date.
Stage flow: Produced (video done) → Scheduled (posts exist in Marky). Notes record the file name, on-screen text, what is pending approval, and anything to confirm.

## 5. Schedule in Marky
Business: C3 Global, id `29797760-861d-4235-bd99-880bddc16f09`. Tools are the `mcp__marky__*` set (list_businesses, create_media_upload, create_post, list_posts, get_post). Plugin tools `plugin:marky:marky` may ask for sign-in; the `mcp__marky__` ones worked.
1. Find video-free days: query Notion Content Library for Talking head, Explainer, Miniseries and Life Scene rows, then confirm against `list_posts` (status SCHEDULED, view summary). Pick one day per scene. Check the Content Library for an existing row first so nothing doubles up.
2. Upload each video once: `create_media_upload`, then `curl -X PUT -H 'Content-Type: video/mp4' --data-binary @file URL`. The response `id` is the media id.
3. Six separate posts per scene, each with `restrict_publish_to` one platform, `status` SCHEDULED, `scheduled_publish_time`, `media_ids`, and metadata `{slot, topic, format: life-scene, series: Life Scene, keyword}`.
   - Times (ET): Instagram, TikTok, Pinterest 9:53 AM; LinkedIn 10:53; Facebook 11:53; YouTube 2:53 PM. UTC offsets: EDT is UTC-4 until Nov 1 2026, then EST is UTC-5.
   - Titles via `platform_overrides`: TikTok short title, YouTube and Pinterest "Title: Question".
   - Caption variants: Instagram and Facebook "Comment KEYWORD ..."; TikTok "DM me KEYWORD ..." with collapsed paragraphs and `https://www.c3global.co` last; LinkedIn and YouTube replace the CTA with the canonical link; Pinterest compact caption.
   - TikTok cover: `video_cover_timestamp_ms` at a moment with the text pill showing.
4. Read all posts back with `list_posts` and copy the exact ids into Notion. Do not trust ids copied from memory.
5. Known issue: Pinterest rejected `https://www.c3global.co/aiaudit` as a pin link ("This site doesn't allow you to save Pins", BAD_LINK) on The Finished Version. Leave the Pinterest link off new posts and check the pins already scheduled with that link.

## 6. Report back (keep it short)
- What was built and which days, with the effects used.
- Anything that does not match the brief or needs a listen.
- What is not scheduled and why.
- Anything she must approve (captions, pillar, CTA wording for LinkedIn and YouTube).

## 7. Prompt to start a new batch
Paste this into a new Claude Code session on this repo, fill the brackets, attach the clips:

> Read `remotion-cutaways/docs/LIFE_SCENES_WORKFLOW.md` and follow it. Here is a new batch of Life Scenes: [list each: date and title from the Notion week script page]. The clips are attached in the same order. [For any scene: voiceover I will record / no text / I want these lines: ...]. Propose the on-screen lines and captions in plain English for my approval before you build. Do not change the color of my clips. After I approve, build them, send me the drafts, then create the Notion rows and schedule them in Marky on the days with no videos.

Shorter version once the batch is simple: "Run the Life Scenes workflow on these clips: [titles]."
