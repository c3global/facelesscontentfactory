# Life Scene Effects Menu

Pick effects by ID. Example: "LS_Old_Voice_Memo, clip B, G11 + M01 + M05, wording below."

## How to order
Send Claude four things:
1. The clip (or clips) and the scene name, so the file is named `LS_Scene_Name.mp4`.
2. The effect IDs you want (one to three is plenty for a clip this short).
3. The exact wording for any text, from the approved Notion row. Claude never invents wording, numbers or quotes.
4. Any sound you want, as a real recording (see Sounds). Claude cannot hear, so you approve every sound by ear.

## Rules every effect follows
- Hard cuts only between clips. Never a fade or dissolve between clips.
- No tags, badges or end cards. It should look cinematic.
- Crimson velvet with a shiny penny copper metal rim (charcoal cards get a gold rim), small glints, white text, Covered By Your Grace, inside the caption band (y 1056 to 1382, clear of the bottom 22 percent and right 12 percent).
- Palette: crimson, white, black, charcoal, rose gold, gold. No cream or ivory.
- Sources are usually 720p. Digital zoom beyond about 10 percent starts to soften.
- Never invent figures. Odometer and chart effects need numbers you give.
- No talking-head clips in Life Scenes.

Status key: **Built** (ready now), **Easy** (small build, same day), **Build** (new design, send a sample first).

---

## Camera and motion (no graphics)

| ID | Effect | What it does | Best for | Status |
|---|---|---|---|---|
| M01 | Digital zoom | Slow push-in across the whole clip | All types | **Built** |
| M02 | Punch-in | Quick zoom on a beat or a gesture | A, B | Easy |
| M03 | Pull-back reveal | Starts tight on a detail (the phone), pulls back to show her | A, C | **Built** (starts at 1.4x, the limit for a 720p source) |
| M04 | Zoom-through cut | Fast zoom into one thing, then a hard cut out of it | A, B | Build |
| M05 | Blackout | Instant cut to black for a beat, then a hard cut back. Never a fade. Also works as an ending | All types | **Built** |
| M06 | Flash frame | One or two frames of bright white, like a camera flash | A, B | Easy |
| M07 | Speed ramp | Slows down on a key gesture (needs frame smoothing at 24 fps) | A, C | Build |
| M08 | Freeze and hold | Holds the last frame while text lands | All types | Easy |
| M09 | Handheld drift | Slight camera sway, as if filmed by hand | A, B | Easy |
| M10 | Light leaks | Warm flares drift across the picture | All types | Easy (already in the repo's finish) |
| M11 | Golden-hour grade | Warm, sunlit color look | All types | Easy |
| M12 | Blue-hour grade | Cool, evening color look | All types | Easy |
| M13 | Soft glow | Gentle bloom on highlights | All types | Easy |
| M14 | Floating dust | Tiny particles drifting in the light | All types | Easy |
| M15 | Letterbox bars | Cinema bars top and bottom | All types | Easy (check they clear the text band) |
| M16 | Rewind | A short reverse playback for a "if only" moment | A, B | Build |

## Graphics

| ID | Effect | What it does | Best for | Needs from you | Status |
|---|---|---|---|---|---|
| G01 | Text message | Bubble types out, "Sent," typing dots, reply bubble | A, B | Message and reply wording | **Built** |
| G02 | Handwritten note | White paper note with crimson velvet tape, writes itself line by line, crimson underline | A, C | Note wording | **Built** (pencil sound pending a real recording) |
| G03 | The stack | Notification cards pile up, older ones peek out behind | A, B | Card wording | **Built** |
| G04 | Phone mockup | A tilted phone inset with a recordings screen and moving waveform | A, C | Screen title and rows | **Built** |
| G05 | Checklist | Items tick off one by one with a crimson check and strike-through | A, C | List items | **Built** |
| G06 | Comment bubble | A comment pops in, in velvet style | A, B | Comment wording | Build |
| G07 | Timeline burn | A crimson timeline with a glowing line burning along it | A, C | Events and dates | Build |
| G08 | Before and after | Hard A/B cut or a sliding wipe between two states | A, C | Two states to compare | Build |
| G09 | Odometer | A counter rolls up to a number | A, C | The real number and its label | Build |
| G10 | Chart grow | A bar or line grows into place | A, C | Real data and its source | Build |
| G11 | Voice-memo waveform card | A moving waveform in the lower third | A, C | Title line, if any | Build |
| G12 | Notes-app page | Lines type onto a notes-style page | A, C | Page wording | Build |
| G13 | Email compose | Subject and body type out, then send | A, C | Subject and body wording | Build |
| G14 | Lock-screen notification | A notification slides in over the scene | A, B | Notification wording | Build |
| G15 | Polaroid drop | A photo lands on screen like a memory | A, C | The photo | Build |
| G16 | Text pill | The crimson velvet pill with the line in Covered By Your Grace | All types | The wording | **Built** |
| G17 | Date stamp | A small dated slate. Only on request, since it can read like a tag | A, C | Date wording | Build |

## Sounds (real recordings only)
Place each at its exact moment. Sources: your Audiio library first, then free commercial-use libraries (Pixabay, Mixkit, YouTube Audio Library) or CC0 files on Freesound. Tell Claude where each came from so the license note goes in the repo.

| Pairs with | Sound to find |
|---|---|
| G02 Handwritten note | Pencil writing on paper (close, dry, soft) |
| G01, G12, G13 | Soft keyboard or phone-keyboard taps |
| G01, G13 | Send swoosh |
| G06 | Soft pop |
| G03, G14 | Notification ping (gentle) |
| G09 | Soft ticking |
| M04, M03 | Whoosh |
| M05, M08 | A low soft hit or a beat of silence |
| M06 | Camera shutter click |
| G15 | Paper or photo slap, soft |

Synthesized sounds were tried (stamp thud, whoosh, pencil) and missed twice. Use real recordings.

## How effects are built (for Claude)
- M01 and M03: `LSClip` composition (`src/LSClip.tsx`) renders the picture as a sequence with a smooth CSS zoom. Props: `effect` (`zoom` or `pullback`), `from`, `to`, `moveSec`, and `px, py` (the point to move toward).
- G03, G04, G05: `LSStack`, `LSPhone`, `LSChecklist` in `src/LifeSceneEffects.tsx`, rendered as transparent PNG sequences.
- M05 and the final finish: `scripts/ls_finish.py` (`--blackout START END` for the hard black).
- Combine any of them: render the camera sequence (M01 or M03) and the overlay sequence, then `ls_finish.py --picture CAMERA_SEQ --overlay OVERLAY_SEQ --audio-from CLIP --out LS_Name.mp4`.
