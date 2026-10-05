# C3 Global Remotion short-form pipeline

Turns one continuous 9:16 talking-head clip into a finished 1080x1920, 30 fps short: word-by-word captions,
layouts where the graphic takes over and she shrinks into a window, and designed cutaway graphics. Every video is
driven by a JSON scene plan, so batches need no code changes.

## Setup

```bash
cd remotion-cutaways
npm install
npx skills add remotion-dev/skills     # optional: Remotion agent skills (remotion-best-practices and friends)
```

Needs Node 20+ and ffmpeg. Fonts load through `@remotion/google-fonts` (DM Sans, Playfair Display, Montserrat).

## Make a video

1. Put the raw clip at `public/raw/<slug>.mp4` (gitignored).
2. Write `content/<slug>.scene.json` (see the schema below, or copy `content/20-years.scene.json`).
3. Transcribe to word-level captions:
   ```bash
   npm run transcribe -- <slug>        # whisper.cpp via @remotion/install-whisper-cpp -> content/<slug>.captions.json
   ```
   Offline fallback when the model cannot be downloaded: write `content/<slug>.words.tsv`
   (`word<TAB>startSec<TAB>endSec` per line) and run `npm run captions:from-words -- <slug>`.
4. Preview: `npm run studio`
5. Render: `npm run render` (every `content/*.scene.json`) or `npm run render -- <slug>` -> `out/<slug>.mp4`.
6. Review stills (field options and font comparison): `npm run tests -- <slug>` -> `out/tests/`.
7. Finish-pass review set (fields x moments, close-ups, backdrop clips, glass render timing): `npm run finish -- <slug>` -> `out/finish/`.

Check names, URLs and brand terms in the captions against the script before rendering.

Environment variables:

| Variable | Use |
|---|---|
| `REMOTION_BROWSER_EXECUTABLE` | Render with a system Chromium or Chrome instead of downloading one |
| `REMOTION_LOCAL_FONTS=1` | Use the bundled copies in `public/fonts` when Google Fonts is unreachable |
| `RENDER_CONCURRENCY` | Override render threads |
| `WHISPER_MODEL` | whisper.cpp model, default `medium.en` |

## The four layouts

| Layout | What it is |
|---|---|
| A | Hook: she is full-bleed, large word-by-word captions, slow push-in |
| B | Split: graphic area on top, she sits in a rounded window with the caption pill under her chin |
| C | Full-screen graphic: she is a small circle (or hidden), captions at the bottom |
| D | Numbered section: big numeral and card, she is a small portrait window top right |

One `OffthreadVideo` plays the whole runtime so her audio never cuts or restarts. Her position, size, corner
radius and zoom animate between layouts over 12 frames. Text stays out of the top 12%, bottom 22% and right 12%
of the frame (`SAFE` in `src/layouts.ts`).

## Scene plan

```jsonc
{
  "slug": "20-years",
  "video": "raw/20-years.mp4",          // path inside public/
  "durationSec": 36.92,
  "theme": {"field": "crimson", "sans": "DM Sans"},   // field: crimson | charcoal | rosegold, sans: DM Sans | Montserrat
  "emphasis": ["20", "years"],           // words rendered in the Playfair italic rose gold treatment
  "captionPageMs": 500,                  // createTikTokStyleCaptions combineTokensWithinMilliseconds
  "scenes": [{
    "id": "hook", "mood": "dark", "tag": "CULTURAL INTELLIGENCE",
    "segments": [{"start": 0, "end": 4, "layout": "A", "avatar": "circle", "graphics": []}]
  }],
  "endCard": {"variant": "link-pill", "startAt": 32.8, "label": "LINK BELOW OR IN MY BIO", "url": "C3Global.co/CQCompass"}
}
```

Validated with zod (`src/schema.ts`). `at` and `until` on a graphic are absolute seconds. `box: {y, h}` offsets a graphic
inside its layout area. `avatar` (`circle` or `hidden`) applies to layout C. Moods alternate `dark` and `light` per scene.

## Graphic library (`src/graphics/`, props in `src/schema.ts`)

| type | What it does |
|---|---|
| `tag` | Small spaced-caps label at the top of a scene (also available as the scene `tag` field) |
| `headline-card` | Small label above one large serif line, optional `strikeAt` |
| `rewrite-card` | Old text struck through, new line writes in beneath it |
| `notification-stack` | Cards stack in one by one with a counting badge |
| `hub-diagram` | Center node, labeled spokes, lines draw outward, nodes change state |
| `chat-ui` | Mock inbox that builds row by row with a counting badge |
| `meeting-tile` | Mock video call that goes muted and silent |
| `floating-chips` | Labeled chips drifting around her |
| `chapter-card` | Big numeral, title and a before / during / after flow |
| `statement-card` | Full-screen card with one bold line |
| end card | `link-pill` (label plus a typed URL) or `comment-keyword` (prompt plus a typed keyword), set in `endCard` |

`content/showcase.scene.json` exercises every graphic in both moods (composition `Showcase` in the Studio).

## Finish layer (metal, backdrops, liquid glass)

- **Metal** (`src/brand.ts`, `src/metal.tsx`): rose gold and gold are only ever multi-stop metallic gradients
  (shadow, mid, bright highlight, mid, shadow) in a `deep` variant for white cards and a `bright` variant for crimson and
  dark fields. Every use (text, rims, rings, lines, icons, badges) goes through `metal.tsx`, which adds a slow specular
  band that sweeps every 3.5 seconds, staggered per element with `seed`.
- **Fields** (`theme.field`): `black` is the locked field (vertical charcoal #3A3F42 to true black, soft vignette, low
  overlay-blend grain so blacks stay pure, faint rose gold and gold caustics and light blooms). `crimson`, `charcoal` and
  `rosegold` are retired from the video but still selectable in code. Each has an animated backdrop in
  `src/backdrops.tsx`: slow light blooms, fine grain, gentle parallax. White scenes get studio-light blooms and a very
  faint charcoal line texture.
- **Liquid glass** (`src/glass.tsx`): backdrop blur with a saturation lift, thin bright specular edge, inner top
  highlight, soft inner bottom shadow, metallic rim, and (clear glass only) SVG displacement refraction through
  `backdrop-filter: url(#c3-refract)`. Frosted glass for any card with body copy; clear glass for her window, the
  caption pill and decorative elements. Fades are applied to the glass surface itself, because an ancestor with
  opacity below 1 stops backdrop-filter from seeing the backdrop.
- **Her**: she can be hidden completely (`"avatar": "hidden"`) while her audio keeps playing, or shown in a 280 px
  corner circle with a 16 px metal ring.
- `REMOTION_LOCAL_FONTS=1` and `REMOTION_BROWSER_EXECUTABLE` are passed through to the renderer by the scripts.

## Color rules (locked)

- Metallic rose gold and gold appear only on black or white backgrounds, never over a chromatic one.
- Crimson is not a field. It is one small accent per scene at most (a strike-through rule, the end-card pill) and any
  text on or beside it is white or black. Labels are charcoal.
- Body-copy cards are frosted glass at 98.5% white on black scenes, so they read as pure white.
- Captions: DM Sans, white (black on white scenes), in a glass pill. Metal is only the emphasized Playfair word.
- Scenes alternate dark and white. The end card is always on the black field.

## Brand

All tokens live in `src/brand.ts`: crimson `#C91B19` fields with a deeper crimson gradient, metallic rose gold
(`#B76E79`, tint `#D48A8C`) and gold (`#D5AA4A`) accents (never flat, see above), neutrals white, black and charcoal `#3A3F42`.
No cream, ivory, off-white or eggplant anywhere. Captions: DM Sans bold; emphasis words and numerals: Playfair
Display italic with the rose gold finish and a one-time sheen sweep.

Motion timings were measured from the references: see `docs/MOTION_NOTES.md`.

## Plain-avatar preset (four-places)

For a talking head that stays full frame: Editorial kinetic captions in a 55 to 72 percent band (`captionBand` 1056 to 1382),
sentence-case support words at 56 px, no chunk ending on a connector word (auto-chunker in `src/Kinetic.tsx`), highlight boxes white or black only,
no hook tag. Layout `E` is a centered portrait window for scenes that need a wide graphic under it.

Workflow: `npm run transcribe -- <slug> <video>` (needs huggingface.co and *.hf.co allowed), tidy tokens into `content/<slug>.words.tsv`,
`node scripts/snap-words.mjs <slug>` to snap word timings to the real audio, `node scripts/words-to-captions.mjs <slug>`,
then `npm run stills -- <slug> <seconds...>` for review stills. New graphics: `congruence-map`, `screenshot-card`.
