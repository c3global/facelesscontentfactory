# Life Scenes

A Life Scene is a short cinematic clip, or a few clips cut together, finished with a slow camera move and one or two lines of on-screen text. The text is the point: it turns a pretty clip into a message. Portrait 1080x1920, 24 fps.

Clips can come from Google Flow, Veo, Seedance, Kling, stock footage (see `docs/STOCK-FOOTAGE.md`) or the member's own camera. No talking-head clips; those are talking-head edits.

## 1. Intake (ask only what is missing)
For each scene: a title, the clip file or files, the message of the scene, and whether there is a voiceover.
- Copy clips into `public/raw/`. Large files: see START-HERE.md.
- Probe every clip with ffprobe (length, size, fps, audio) and look at a 5-frame contact sheet. Say if a clip does not match what the member described, or is shorter than they think.
- Generated clips often carry their own music or speech. Note it for the member to listen to.

## 2. Copy first, build second
- Propose the on-screen lines in plain English, the way the member talks, and wait for approval. Every line must make sense on one hearing.
- Keep each line to about 22 characters. Two or three lines per card. One or two cards per scene.
- Do not reuse stiff wording from a generator prompt as on-screen text.

## 3. The plan
`content/<slug>.json`:

```json
{
  "kind": "life-scene",
  "slug": "the-quiet-yes",
  "durationSec": 8,
  "shots": [
    {"src": "raw/clip-a.mp4", "startSec": 0, "lengthSec": 4, "effect": "zoom", "from": 1, "to": 1.1, "moveSec": 4, "px": 0.5, "py": 0.35},
    {"src": "raw/clip-b.mp4", "startSec": 1.5, "lengthSec": 4, "effect": "punch", "from": 1, "to": 1.22, "moveSec": 2, "atSec": 0.8, "px": 0.5, "py": 0.4}
  ],
  "text": [{"text": ["The answer you need", "is already yours."], "fromSec": 0.6, "toSec": 3.8, "top": 1130}],
  "overlays": [{"type": "note", "atSec": 4, "props": {"lines": ["Say yes", "out loud."], "fromSec": 0.4}}],
  "voiceover": "raw/vo.wav",
  "dust": false
}
```
- Shot lengths must add up to `durationSec`. Shots play in order with hard cuts.
- `px`, `py`: the point the camera moves toward, as a fraction of the frame (0.5, 0.35 is a face in the upper middle).
- Text `top` sits in the caption band: 950 to 1130 for most cards. Keep text clear of the bottom 22 percent and right 12 percent.
- With `voiceover`, clip audio is dropped. Without it, each shot keeps its own sound (`keepAudio`). Level a voiceover first: `ffmpeg -i vo.mp3 -af "loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 public/raw/vo.wav`.

Then: `npm run f48 -- validate content/<slug>.json`, `npm run f48 -- preview content/<slug>.json <second>` at every text moment, show the stills, and render after approval with `npm run f48 -- render content/<slug>.json`.

## 4. Effect menu
Camera (set per shot, `effect`):
| Effect | What it does | Settings |
|---|---|---|
| `zoom` | Slow push-in across the shot | `from` 1, `to` 1.08 to 1.12, `moveSec` = shot length |
| `pullback` | Starts tight on a detail, pulls back to reveal | `from` 1.3 to 1.4, `to` 1 |
| `punch` | Quick zoom on a beat or gesture | `to` 1.20 to 1.25 on HD clips (1.10 reads too subtle), `atSec` |
| `drift` | Gentle handheld sway | `drift` 1 is gentle |
| `freeze` | Holds the frame from `atSec` while text lands | `atSec` |
| `none` | Plain pass-through | |
| `holdFromSec` (any effect) | Plays normally, then holds the last frame (voiceover longer than the clip) | second to hold from |

Text cards (`text`): a velvet pill in the member's main color with their metal rim, in a handwritten face. `font`: `covered` (default), `caveat` or `swanky`.

Overlays (`overlays`, each with `atSec` and its own `props`):
| Type | What it shows | Props |
|---|---|---|
| `message` | A text message types out, sends, a reply arrives | `sent`, `reply`, `typeFromSec`, `replyFromSec` |
| `note` | A paper note writes itself line by line with brand-color tape | `lines`, `fromSec` |
| `stack` | Notification cards pile up | `cards: [{initial, title, body, atSec}]` |
| `phone` | A tilted phone with a recordings list and moving waveform | `header`, `rows: [{title, meta}]`, `highlight`, `fromSec`, `toSec` |
| `checklist` | Items tick off one by one | `items`, `fromSec`, `everySec` |
| `comment` | Comments pop in with a heart | `comments: [{handle, initial, text, atSec}]` |
| `timeline` | A glowing line burns along a timeline, lighting each point | `items` (3 to 5), `startSec`, `endSec` |
`dust: true` adds floating dust in the light.

All wording inside overlays comes from the member. Interface text (handles, message text) stays generic, never a real person's name or handle.

## 5. Check and deliver
- Pull frames at every text moment and look at them: text inside the band, nothing cut off, nothing on a face.
- Verify the export: length, 1080x1920, audio present.
- Report what you checked and what needs the member's ear.
- Never post or schedule.
