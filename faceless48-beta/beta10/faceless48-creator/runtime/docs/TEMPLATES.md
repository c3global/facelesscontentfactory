# Talking-head templates (8)

Eight finished talking-head templates, approved by Dr. CK on Nov 13 2026. A template is more than a caption style: each one has its own captions, its own kit (backdrop, quote card and frame around the speaker's window), its own example-card skin and its own signature effects. Colors come from the brand (`brand.json`): the brand accent stands in for crimson and the brand metal for the metallic accent.

To use one, set two fields on the plan and build the scenes the way its row says:

```json
{ "template": "teach", "captionStyle": "karaoke" }
```

`template` switches on the kit (backdrop, quote card, window frame). `captionStyle` picks the captions. Worked examples, one full plan per template, are in `docs/templates/` (built on Dr. CK's Tolerance video; copy the structure, never the words).

| Template | `template` | `captionStyle` | Kit: backdrop, quote card, window frame | Example card skin | Signature effects | Music mood |
|---|---|---|---|---|---|---|
| Quiet Authority | `quiet` | `quiet` | Black room with one soft overhead light; no card, white serif with a gold rule and the key word in metal; gold hairline frame | `noir` | statement card, spotlight | calm, cinematic |
| Magazine | `magazine` | `magazine` | White newsprint with halftone and an accent rule; pull quote with a giant accent quote mark between black rules; square photo with a white border | `editorial` | press-front with `liveWords` (the headline is the captions), page-turn corner peels, paper-tear, headline-wall, giant-caption v2, kinetic-hook v2 | upbeat |
| Glass | `glass` | `glass` | Accent and metal light drifting behind frosted glass; frosted glass card; glass bezel with metal rim | `glass` | text-pop glass, spatial-glass, holo-phone, layer-explode | calm, cinematic |
| Scrapbook | `scrapbook` | `tape` | Charcoal pinboard with paper scraps; torn white note, taped, handwritten, key word underlined; polaroid with tape | `paper` | framed-clip with a note, pen-circle, doodle-boil, sketch-words, paper-tear | upbeat |
| Analyst | `analyst` | `ticker` | Data room: grid, chart lines, bars; "Key insight" panel with an accent bar; corner brackets and a blinking LIVE tag | `data` | big-stat (real numbers only), focus-list, date-stamp, checklist v2 | calm, focused |
| Cinematic | `cinematic` | `film` | True black with a slow light streak, grain and vignette; wide-tracked capitals that rise out of a blur; soft edges and a deep shadow | `dark` | zoom-through, freeze-hold, dust, glow, blackout | calm, cinematic |
| Creator Hype | `hype` | `punch` | Accent field with moving diagonal stripes; heavy capitals on black blocks that slam in; thick white border with a hard black shadow | `punch` | orbit and couch-wall (words, pictures or clips), clone v2, impact-frame, type-wall, flash-frame v2 | high energy |
| Teach Board | `teach` | `karaoke` | Whiteboard; marker "Key point" note with the key word circled; window pinned with two magnets | `board` | lesson-board (marker list written on as each point is said), doodle-boil "Today's lesson" | calm, focused |

## How the plans are built
- Clean the voice and cut every pause first (`scripts/voice-polish.sh`, `clean-cut`). Hype especially: no pauses at all. Check the seams between recorded parts for a cut-off word.
- Every jump cut gets a hard punch-in: a full-frame stretch is split at each cut, wide and close alternate (`focus.zoom` about 1.0 and 1.35 to 1.7), and every segment after the first has `"cut": true`.
- Window layouts for examples and cards: `T` (wide window across the top, card under it), `S` (card on top, speaker fills the bottom), `O` (circle window, card under it), `F` (large window, room under it), `E` with `"avatar": "hidden"` for a full quote card. When the speaker moves to the next point, swap her position (card on top and her below, then her on top and the card below).
- The `examples` graphic draws a small illustrated example under a heading made of the speaker's exact words (`items[].say` and `wordTimes`). Kinds: `replies`, `name`, `reaction`, `holidays`, `newcomer`, `rules`, `leftout`, `chat`. Use the template's skin from the table.
- Captions appear word by word as they are said and automatically skip any word already written on screen. A caption never sits on a card or effect: set `captionY` on the segment so it lands in empty space (layout T: 935, O: 735, under a lesson board: 1472). Keep text inside y 240 to 1480.
- Full-page effects that would hide captions either carry the words themselves (press-front `liveWords`) or take `scale` so captions sit below.
- Single cards and big numbers sit front and center. Nothing on the speaker's face. Text never runs off frame.
- Music: `volume` 0.42, `duckTo` 0.2. Master the final mix to -14 LUFS.

## Dr. CK's standing preferences (C3 Global)
- Colors: crimson #C91B19, black, white, charcoal #3A3F42, metallic accent #A9574A with the #F1B9A5 highlight (her "rose gold", never orange copper), gold #D5AA4A as secondary metal.
- No letterbox. No sepia, golden or orange grades on her videos (a member may still choose a warm look for their own brand).
- Song 1 (Empires) for Quiet, Glass, Analyst, Cinematic and Teach; song 2 (Make It Look Easy) for Hype, Magazine and Scrapbook.
- The page turn is a corner peel from the bottom right; it gets a page-turn sound once she supplies one.
