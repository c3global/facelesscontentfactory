# Video carousels

A video carousel is a moving Instagram-style carousel: 4:5 (1080 x 1350), one idea per slide, each slide animating in, in the member's brand colors, fonts and logo. Post it as a video (Reels or feed), or post the storyboard stills as a regular swipe carousel.

Member says: **"Make a video carousel about ..."** (or gives slide text).

1. Write 4 to 8 slides from their idea or approved copy. Never invent facts, numbers or quotes. Show the slide text and get approval.
2. Pick a layout per slide:
   - `cover`: kicker, big headline, one line under it, optional `image` (photo or avatar cutout PNG in public/).
   - `statement`: headline plus one supporting line in a panel.
   - `list`: up to 5 numbered points. `checklist`: up to 5 points that check off.
   - `compare`: two columns (`left`, `right` titles); `items` split in half, the left ones strike through.
   - `quote`: a pull quote with `by`.
   - `steps`: up to 5 steps on a growing line.
   - `cta`: `keyword` to comment, plus a line.
3. Wrap a word in `*asterisks*` in a headline to set it in the accent script. Keep headlines under about 12 words.
4. Save `content/<slug>.json`:

```json
{"kind": "video-carousel", "slug": "my-carousel", "series": "Field Notes", "theme": "dark",
 "slides": [
  {"layout": "cover", "kicker": "New series", "headline": "Your idea in *one* line", "body": "One supporting sentence."},
  {"layout": "checklist", "headline": "Ask *three questions*", "items": ["First", "Second", "Third"]},
  {"layout": "cta", "headline": "Want the guide?", "keyword": "guide", "body": "and I'll send it to you."}
 ]}
```

`theme` is `dark` or `light`. Each slide can set `seconds` (default 6). Optional `music`: `{"src": "music/track.mp3", "volume": 0.25}`.

5. `npm run f48 -- storyboard content/<slug>.json` and show the sheet (one frame per slide). After approval, `npm run f48 -- render content/<slug>.json`. The storyboard frames double as the stills for a swipe carousel.
