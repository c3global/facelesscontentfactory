# Video carousels

A video carousel is a moving Instagram-style carousel: 4:5 (1080 x 1350), one idea per slide, each slide animating in, in the member's brand colors, fonts and logo. Post it as a video (Reels or feed), or post the storyboard stills as a regular swipe carousel.

Member says: **"Make a video carousel about ..."** (or gives slide text).

## Starter templates

Three ready-made carousels live in `content/templates/`. When a member names one ("use the LinkedIn carousel template for my topic"), copy it to `content/<slug>.json`, keep its style and layouts, and rewrite every slide in their words for their topic (never keep the sample copy). Their brand colors, fonts and logo apply automatically.

| Say | File | Look |
| --- | --- | --- |
| "Tech carousel" | `carousel-tech.json` | `editorial` dark glass: status panel with a ticking checklist, branching plan, checklist, link-in-bio end screen |
| "Influencer carousel" | `carousel-influencer.json` | `bold` on the brand color: big hook, statement, numbered list, quote, save-this end screen. No presenter needed. |
| "LinkedIn carousel" | `carousel-linkedin.json` | `clean` light: professional cover, before-and-after, steps, pull quote, follow end screen |

Any template can add a presenter (the member or their AI avatar) or switch style.

1. Write 4 to 8 slides from their idea or approved copy. Never invent facts, numbers or quotes. Show the slide text and get approval.
2. Pick a layout per slide:
   - `cover`: kicker, big headline, one line under it, optional `image` (photo or avatar cutout PNG in public/).
   - `statement`: headline plus one supporting line in a panel.
   - `list`: up to 5 numbered points. `checklist`: up to 5 points that check off.
   - `compare`: two columns (`left`, `right` titles); `items` split in half, the left ones strike through.
   - `quote`: a pull quote with `by`.
   - `steps`: up to 5 steps on a growing line.
   - `status`: an animated panel (`panel` title) that goes from `working` to `done` with a progress bar; `items` become a paper checklist that ticks off.
   - `branches`: a top card (`panel`, `root`) that branches into up to 3 cards (`items` as "Label: text").
   - `cta` (the end screen), with `end`: `keyword` (comment a word, set `keyword`), `follow` (logo ring and a Follow button, optional `handle`), `save` (bookmark: save this for later), `link` (a link-in-bio button, `handle` sets its text) or `question` (a big question mark and a comment bubble with `body`). Vary the end screen between carousels.
   Any slide can add `note`: a handwritten line that writes on.
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

**Alignment** (`align`): `center` by default (where people look first), or `left` or `right`, for the whole carousel or per slide.

**Style** (`style`): `editorial` (glass panels, serif accents), `luxe` (deeper, framed, metallic rules), `clean` (light paper) or `bold` (big type on the accent color). Colors, fonts, metallic finish and logo always come from the member's brand automatically; never ask them to restate it.

**Presenter** (optional): a cutout of the member or their AI avatar, or nobody. Ask once: "Do you want yourself, your AI avatar, or no one on the slides?" If yes, ask for a clear photo (or a frame of their avatar video), run `npm run cutout -- <photo>`, and set `"presenter": {"src": "cutouts/<name>.png", "side": "right"}`. It shows on cover, statement, status, branches and cta slides by default; set `"presenter": false` on a slide to hide it there. Footer `link` adds a handle or URL. Each slide can set `seconds` (default 6). Optional `music`: `{"src": "music/track.mp3", "volume": 0.25}`.

5. **Music is on by default.** Carousels pick a licensed track from `public/music` (leveled copies first), different per carousel, and play it across every slide. Set `"music": {"src": "music/<file>.mp3", "volume": 0.3}` to choose one, or `"music": false` for none. If `public/music` is empty, tell the member once: add licensed tracks there, or pick a sound in Instagram or TikTok when posting.
6. **Motion:** every slide keeps moving (twinkling sparkles, a light sweep across metallic words, floating panels, a pulsing glow behind the presenter), and the status slide draws an arrow from the finished task to the checklist. Nothing to set.
7. `npm run f48 -- storyboard content/<slug>.json` and show the sheet (one frame per slide). After approval:
   - **For an Instagram or TikTok carousel post (each slide its own video):** `npm run f48 -- carousel-slides content/<slug>.json` writes `out/<slug>-slides/slide-01.mp4`, `slide-02.mp4`, ... Upload them in order as one carousel. The song is split across the slides: slide 1 holds the intro, slide 2 picks up exactly where slide 1 ended, and so on, so swiping plays the song through seamlessly. A slide left open loops its own part, with a tiny fade at each end so the loop never clicks.
   - **As one video (Reels):** `npm run f48 -- render content/<slug>.json`.
   - The storyboard frames double as stills for a static carousel.
