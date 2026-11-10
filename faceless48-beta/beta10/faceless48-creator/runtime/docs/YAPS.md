# Yaps

A yap is a casual, relaxed talking video: in the car, at the desk, on the couch. It gets captions and a light edit. It is deliberately not the polished talking-head style (cutaways, effect packs, end cards).

## The recipe
- **Style `yap`** (`"style": "yap"` in the plan). It sets word-by-word editorial captions with a few hero words, the grain finish, a music bed at the standard level, no effect sounds, no cutout, and a lighter gradient under the caption (`scrim` 0.7) so the room shows and white captions still read on light clothing.
- **Tightened pauses.** Run `python3 scripts/tighten-pauses.py content/<slug>.json 0.3`. Every silence longer than 0.3 s becomes 0.3 s (0.4 is looser, 0.2 is tighter), and the plan, captions and effect times are remapped to the new clip. Render the new `-tight` plan. These are jump cuts: watch the person's pose at each cut. Talking heads keep the speaker's own pacing; yaps do not.
- **Music.** A calm lo-fi bed from the member's licensed library, leveled to about -24 LUFS (`plan.music` with `volume` 0.35 and `duckTo` 0.16, or `npm run f48 -- mix-music`).
- **Two or three slow zooms.** `digital-zoom` with `creepTo` and `snapTo` set to the same value (about 1.08), so there is a slow push and no snap.
- **No end card.** End right after the last line, before a hand reaches for the camera.
- **No other effects** unless one matches what is said and shows something the captions do not. Cards that repeat the captions or do not fit the topic get rejected. One cutaway at most.

## Steps
1. Conform each clip to 30 fps (`ffmpeg -i in.mp4 -r 30 -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k public/raw/<slug>.mp4`). To join parts: conform each to the same size and 30 fps, join with `ffmpeg -f concat`, check that each part's video and audio lengths match, then transcribe the joined file.
2. Transcribe and show the member the transcript to confirm.
3. Write the plan (`kind: "talking-head"`, `style: "yap"`, one full-frame scene, the zooms). Tighten the pauses. Validate the `-tight` plan.
4. Render it (`npm run f48 -- render content/<slug>-tight.json`). Scan for flashes: `ffmpeg -i out/<slug>-tight.mp4 -vf signalstats -f null -` and look for whole-frame brightness jumps (YDIF above about 40) that are not at a planned cut. Caption pops add small bumps; that is normal.
5. Send a review copy. After approval, deliver the final under 28 MB (about 6000 kbps).

## Caption timing
Captions start about 50 to 90 ms after the sound begins, and an AI avatar's mouth can move 70 to 200 ms before its sound, so captions can look late against the mouth. `captionLeadSec` (0 to 0.5) shows captions earlier. It made no visible difference at 0.15 s on the clips tested, so do not rely on it. When a member says a caption is off, ask for the exact second and word, then check that moment's word time against the audio.

## Source audio
Keep the original audio. Voice-changing tools can strip the room sound that makes a yap feel real.
