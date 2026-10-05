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

## Brand

All tokens live in `src/brand.ts`: crimson `#C91B19` fields with a deeper crimson gradient, metallic rose gold
(`#B76E79`, secondary `#D48A8C`) and gold (`#D5AA4A`) accents, neutrals white, black and charcoal `#3A3F42`.
No cream, ivory, off-white or eggplant anywhere. Captions: DM Sans bold; emphasis words and numerals: Playfair
Display italic with the rose gold finish and a one-time sheen sweep.

Motion timings were measured from the references: see `docs/MOTION_NOTES.md`.
