# The full list: everything in the talking-head template (Oct 2026)

**111 effects in all: 17 original graphics and end cards, 26 from the first FX batch, 13 from the second batch, 5 from the third, 16 in the C3-skin fourth batch, 20 in the fifth, and 14 in the sixth.** Effects stack: any number can overlap in time, and later ones in the list draw on top. Plus the speed ramp tool, 2 extra modes, and the look dial. Also: 6 layouts, 3 caption styles, 14 sounds, 6 style presets. Names below are what goes in a video plan (`type`). Say any name in chat and Claude can use it.

## Original graphics and end cards (17), in the `graphics` list of a scene segment
| Name | What it does |
| --- | --- |
| `tag` | Small spaced-caps label at the top of a scene |
| `headline-card` | Card with a headline, optionally struck through on a word |
| `rewrite-card` | An old line struck through, then the new line writes in |
| `notification-stack` | Stack of app notifications arriving |
| `hub-diagram` | Center node with spokes that change state (waiting to agreeing) |
| `chat-ui` | Chat window with messages arriving by channel |
| `meeting-tile` | Video-meeting tile with participants and a muted moment |
| `floating-chips` | Chips drifting around her, or stacked large when she is hidden |
| `chapter-card` | Numbered chapter title with a short flow of steps |
| `congruence-map` | Four-part map with links and a pulse |
| `notes-card` | Notes card with lines that check off |
| `quiet-feed` | Community post sitting unanswered, with a status line |
| `citation-card` | Source card: authors, year, title, journal |
| `screenshot-card` | A real screenshot as a card or full screen, with slow pan |
| `statement-card` | Big statement whose words pop in as she says them (the graphic becomes the caption) |
| `link-pill` (end card) | "Follow and subscribe" plus the link |
| `comment-keyword` (end card) | "Comment KEYWORD" end card |

## The FX Pack (26 new), in the `fx` list of a plan
Camera and cuts: `digital-zoom`, `zoom-through`, `blackout`.
Behind her (need her cutout): `type-wall`, `headline-wall`, `couch-wall`, `knockout-tiles`, `spotlight`, `orbit`, `clone`, `frame-break`, `ui-world`, `green-screen`, `freeze-sticker`.
Over her: `the-stack`, `sticky-text`, `freeze-label`, `phone-mockup`, `checklist`, `pointer-callout`, `odometer`, `before-after`, `chart-grow`, `comment-bubble`, `timeline-burn`, `pull-back-reveal`.

| Name | What it does |
| --- | --- |
| `digital-zoom` | Slow creep onto her face, hard snap on a key word |
| `zoom-through` | Camera dives through her and cuts to a tighter framing |
| `blackout` | Lights cut on a line, snap back |
| `type-wall` | Giant words march behind her and swap on the word she says |
| `headline-wall` | Wall behind her fills with scrolling headline cards |
| `couch-wall` | Grid of cover tiles on the wall behind her |
| `knockout-tiles` | Name tiles slam on, then are knocked out one by one |
| `spotlight` | Room goes dark, she stays lit, key words land in gold |
| `orbit` | Cards circle her, passing behind and in front |
| `clone` | Copies of her pop up beside her on her words |
| `frame-break` | Her clip shrinks into a gold-rimmed card, she pops out |
| `ui-world` | An app screen fills the frame, she steps back in front of it |
| `green-screen` | Full-screen plate (text or screenshot), she shrinks to the bottom |
| `freeze-sticker` | Freeze frame becomes a die-cut sticker with handwritten notes |
| `the-stack` | Data cards with racing bars (lower third) |
| `sticky-text` | Copper tag above her cap that follows her |
| `freeze-label` | Picture freezes, labels point at her |
| `phone-mockup` | 3D phone flies in beside her |
| `checklist` | Steps tick off as she says them (lower third) |
| `pointer-callout` | Cards tied to her by lines that follow her |
| `odometer` | Numbers roll digit by digit |
| `before-after` | Wipe line turns the raw look into the edit |
| `chart-grow` | A chart draws and ends on a gold label |
| `comment-bubble` | The keyword types itself, posts, reply with link lands |
| `timeline-burn` | An editing timeline builds, then catches fire |
| `pull-back-reveal` | Her clip shrinks into an editing app window and gets cut |

## Second batch (13 more), in the `fx` list
| Name | What it does |
| --- | --- |
| `pull-back` | Camera starts tight and eases out to normal framing (keep `from` near 1.10 on 720p sources) |
| `flash-frame` | One or two frames of white (or warm) like a camera flash |
| `freeze-hold` | Holds the frame while a line of gold text lands. Her voice keeps playing, so use it on a pause |
| `grade` | Color look over her frame: `golden-hour`, `blue-hour`, `warm`, `cool` |
| `glow` | Soft bloom on the highlights |
| `dust` | Drifting warm dust particles |
| `letterbox` | Cinema bars top and bottom that slide in and out |
| `voice-memo` | Voice-memo card with a copper waveform that moves while she speaks (driven by her word timings, not a true audio spectrum) |
| `polaroid-drop` | A photo with handwritten caption drops in and lands. Give it `src`, or it shows "photo goes here" |
| `notes-page` | A notes page with lines that type in on her words |
| `email-compose` | An email types itself and sends |
| `lock-screen` | A phone lock-screen notification slides in over the scene |
| `date-stamp` | A small stamp like "Tuesday, 4:20 PM" in a corner |

## Third batch (5 more), in the `fx` list

| Name | What it does |
|---|---|
| `paper-cut` | Behind her: torn paper sheets in kraft, cream or crimson with hard cut-paper shadows that jitter like stop motion. Optional `label` becomes a ransom-note strip of paper letters. Needs the matte |
| `doodle-boil` | Over her: hand-drawn marks that draw on and wobble 8 times a second. Marks: `circle`, `underline`, `arrow`, `star`, `burst`, `heart`, `text`, each pinned to `head`, `chest` and so on, with optional handwritten text and white, gold or red ink |
| `vertigo` | Behind her: the dolly-zoom feel. She holds her size while the room stretches and blurs away (`to` 1.1 to 2, `direction` in or out). Needs the matte |
| `cover-story` | Behind her: a magazine cover. Masthead, issue line and cover lines, her head in front of the masthead, a big headline and barcode in front. Needs the matte |
| `glass-type` | Over her: frosted-glass lettering that blurs the room under it, one word at a time (`words` with `at`, `y` as a fraction of the frame, default low on the desk) |

## Fourth batch (C3 skin), in the `fx` list
Built Oct 2026 from the effect list the creator collected. They read colors, icons and cards from `src/fx/theme.tsx` (copper first, gold secondary, crimson action color, her orbital globe at `public/brand/orbital-globe.png`). Pills sit low, stay brief, and never cover her face. Each takes an optional `y` to move it. Her lab objects (`molecule`, `dropper`, `microscope`, `beaker`, `stylus`, in `public/brand/lab/`) work as `glyph` values on `icon-strike` and `jiggle-delete`, and the dropper is the pointer in `eyedropper-grade`.

| Name | What it does |
|---|---|
| `prompt-bar` | A white bar types a line, the crimson send button presses, then it flips to a "Done" state with a copper check |
| `comment-drop` | A comment field types the keyword, Post, the comment lands with a heart, a dark reply card arrives (optional link chip) |
| `comment-cta` | The same field with an instruction line above it |
| `file-drop` | A file card drops into a dashed drop zone and settles with a check |
| `icon-strike` | A generic app tile gets a crimson strike, then the C3 mark pops in beside it |
| `jiggle-delete` | An "Edit mode" tray of wiggling app tiles where the unwanted ones are deleted and the kept one centers |
| `storyboard-deck` | A fan of three cards: a script page with numbered lines and two real freeze frames from her clip (`stills` seconds). The cards fly: `fly` is `orbit` (default, loop around the screen then land in the fan), `swoop` or `off` |
| `gravity-drop` | A big copper serif word whose letters fall and bounce into place, with an optional italic `kicker` (turn captions off for that moment, the kicker sits in the caption band) |
| `grade-slider` | A slider card whose knob moves while a warm, cool or golden grade fades in over the frame |
| `kinetic-hook` | A stack of up to four lines that rise through a mask one after another, mixing serif, bold sans and copper italic (set `captions: "off"` on that segment) |
| `giant-caption` | One huge word on a dark block with a copper italic accent line under it (captions off for that moment) |
| `playing-grid` | A row of three or four small portrait tiles that each play a different moment of her own clip (`offsets`) and pop in with a tilt. `fly`: `swoop` or `orbit` (default `off`) |
| `video-card` | A white card with a copper rim: her clip playing, a progress bar, a serif title and a small sub line |
| `reel-feed` | A scroll-blur takeover into a reel-style screen: her clip playing, handle and brand mark, and the like, comment, share and save rail (captions off) |
| `card-orbit` | Three to six video cards of her own clip circle the screen with depth, tilt and a stagger. Stack it with `reel-feed` for a feed with cards flying around it |
| `eyedropper-grade` | An eyedropper picks a brand swatch (`pick` index) and the frame grades toward it |

## Fifth batch (C3 skin), in the `fx` list
More UI and desk-object moments from the reference reels. Same rules as the fourth batch: copper first, low placement, short holds, an optional `y`. Text on cards is whatever you pass in; nothing is invented (the testimonial stack needs real comments).

| Name | What it does |
|---|---|
| `name-tag` | A "HELLO my name is" tag with a handwritten name |
| `planner-grid` | A weekly planner fills with colored blocks, then clears to a copper italic word ("free") |
| `dropdown-select` | A field opens a list, the pointer picks an option, a copper check lands |
| `effort-dial` | A dark knob turns from low to max with labeled ticks |
| `specimen-card` | A typeface card: big "Aa", the font name and a role line |
| `pencil-strike` | A card of lines where a pencil strikes one out in crimson |
| `stamp` | A rubber stamp slams down at an angle ("NEXT WEEK") |
| `waitlist-card` | A numbered list where your row highlights, writes "you" and checks |
| `envelope-open` | An envelope with a copper wax seal opens and a document card rises out |
| `testimonial-stack` | Up to three comment cards slide in one after another (real comments only). `fly: swoop` arcs them in (default `off`) |
| `render-progress` | A rendering card with a progress bar and thumbnails of her clip filling in |
| `feedback-note` | A note card from the brand mark that types a feedback line |
| `leaderboard` | A ranked list where the first row glows copper with a trophy |
| `countdown-timer` | A ring timer that counts up or down with a unit and label |
| `terminal-type` | A dark terminal window typing command lines |
| `toggle-switch` | A tile row with a switch that flips on to "Connected" |
| `generating-tiles` | Shimmering "Generating" tiles resolve into your lab objects. `fly: swoop` arcs the tiles in (default `off`) |
| `follow-card` | A profile pill where Follow flips to Following |
| `defocus` | The whole frame blurs and refocuses, a soft transition between beats |
| `reel-stack` | Reel cards of her clip in perspective, each with a "Link copied" chip. `fly: swoop` arcs the cards in (default `off`) |

Also covered without new code: giant numerals behind her are `type-wall` with numbers as the words, and glow hero words are the hero-word caption styles.

Notes: `vertigo` hides her enlarged copy with a soft hole around her, so the edges of the room stretch while she stays sharp. It reads best on a clean room. `glass-type` sits low by default because her face and body cover the middle of the frame.

New modes on earlier effects: `before-after` has `"mode": "cut"` (a hard A/B cut at `cutAt`, no wipe). `timeline-burn` has `"style": "line"` (one crimson timeline with a flame burning along it).

**Looks as a style dial.** `look`: none, golden-hour, blue-hour, soft-glow, dust, letterbox, cinema (grade plus glow plus dust plus bars). Mix it with any preset.

**Speed ramp (a tool, not an effect in the list).** `npm run ramp -- <slug> --at 12 --dur 2 --factor 0.5 [--audio stretch|silence] [--smooth]` slows her clip on a key moment and ramps back, and re-times her words, captions and every plan time to match. It writes `<slug>-ramp` files; the original is untouched.

## Layouts (6)
`A` full-bleed hook, `B` glass window, `C` rounded portrait, `D` small portrait top right, `E` centered portrait at the top, `S` split screen (cutaway on top, her below).

## Caption styles (3)
`editorial` (Playfair lockups, the approved look), `heavy` (Anton capitals), `pill` (small glass-pill subtitles).

## Sounds (14)
whoosh, swish, riser, thud, boom, snap, pop, blip, tick, type, ding, shutter, crackle, glitch (glitch is unused by default). Modes: `minimal` (default), `full`, `off`.

## Style presets (6) and dials
Signature, Quiet Authority, Spotlight, Show and Tell, Hype Reel, Raw Tape, plus freestyle dials for captions, backdrop, finish, music, sound, outline and effects pack. See `docs/STYLES.md`.

## Separate pipeline
Animated explainers are separate from this effect count. See the plugin CHARACTERS.md and production skill for the reusable layouts. Historical stage code is retained as reference.

**Flying motion** (`fly` prop): `orbit` loops the cards around the screen and lands them in place, `swoop` arcs each card in from the side and lets it float. Both stay below her face and ease out, so they sit in the same lane as the other card effects. Lab plan: `content/fxlab11.scene.json`.

## Sixth batch: editing-desk moments (from the Claude edit reel)

| Effect | What it does |
|---|---|
| `receipt-ticket` | A torn-edge slip prints from a slot under the captions, types your `text`, then shows `TOTAL, 1 SENTENCE`. The timecode line is the real time in the video |
| `frame-calendar` | Full cutaway: a 30-day grid fills with copper tiles and a few real frames of her clip (`thumbs`) |
| `cover-frame` | A white magazine page: copper masthead, her clip as the cover photo, a barcode and a headline. `issue` is `left|right` (for example `No. 01|Oct 2026`). Different from `cover-story`, which puts her head in front of the masthead and needs the matte |
| `keycap-drop` | Editing-shortcut keys fall, bounce and pile up low on the screen |
| `film-strip` | Two strips of her own frames on a white card. `marks` circles or crosses out frames with a pen stroke, with an optional handwritten `label` |
| `phone-frame` | Her clip shrinks into a phone bezel on a solid field. Different from `phone-mockup`, which sits at the side |
| `clip-type` | Giant letters (`word`, use `/` for line breaks) with her clip playing inside them. `field` is `white` or `black` |
| `storyboard-wall` | A row (or two) of small numbered cards of her clip fly in and pin low on the screen |
| `step-chips` | One numbered chip at a time ("01 The raw take"), each timed by `steps[].at` |
| `pen-circle` | A hand-drawn crimson ring around her head (follows the matte anchors), an arrow and a handwritten `note`, with a black-and-white grade |
| `card-carousel` | A true 3D ring of her own clip cards that turns in perspective: the front card faces you and the side cards foreshorten as they pass. Props `tiles`, `cy`, `radius`, `width`, `spinSec`, `tiltX` |
| `card-flip` | One to three cards turn over in 3D. The front shows your own words (`front`), the back shows her clip at the second you set (`from`) with an optional small `back` label. `flipAt` sets when the first one turns; the others follow a beat later. Lab plan: `content/fxlab17.scene.json` |
| `script-panel` | Behind her (needs the matte): a dark script document scrolls across the screen while she steps to the lower left. `beats` hold your real lines (`quote`, optional `time`, `label`, `notes`) and `steps` show numbered chips on her words. Lab plan: `content/fxlab15.scene.json`, which borrows the clean-report matte |
| `caption-stack` | Each line steps up in size ("and the / captions / come / in"), the last in copper |

Lab plans: `content/fxlab12`, `fxlab13` and `fxlab14`. 

**3D tilt** (`tilt` prop on `storyboard-deck`, `playing-grid`, `video-card`, `cover-frame` and `phone-frame`): `in` swings the card or page flat from rotated back in space, `float` does that and then drifts slowly in perspective. Default `off`. `reel-stack` already sits in real perspective. Lab plan: `content/fxlab16.scene.json`.

## Beta 10: 25 new effects (three reference reels)

Behind-you effects (marked *) need the high-quality cutout: `npm run matte -- <slug>` then `npm run matte:hq -- <slug> <start> <end>`.

| Name | Type | What it does |
| --- | --- | --- |
| Live cursor | `live-cursor` | A named cursor draws a box on the head, then pulls it out to a big rectangle (any `width`/`height`), with a live size readout and a center guide. |
| Clone row* | `clone-row` | Copies of the speaker fan out in a row behind them, smaller toward the edges. |
| Day dial* | `day-dial` | A cream clock face swings in behind them; the hand ticks through the days. |
| Predict keys | `predict-keys` | A phone keyboard types the words with a suggestion bar. |
| Letter orbit* | `letter-orbit` | The letters of a word circle the head, passing behind and in front. |
| Code body* | `code-body` | The room goes dark and code scrolls across the speaker. |
| Post wall* | `post-wall` | A feed of post tiles (`images`, `quotes`) fills in behind them while a counter climbs. |
| Letter dive | `letter-dive` | The clip plays inside a giant serif word, then the camera dives into one letter. |
| Comment post | `comment-post` | A white comment box types a keyword, posts it, a heart pops, a reply drops in. |
| Layer explode | `layer-explode` | The frame splits into 3D glass layers: room, speaker, title, sound. |
| Sketch words* | `sketch-words` | A notebook page behind them: a handwritten word, then a big inked word with an underline. |
| Blade slice | `blade-slice` | A white line flashes across, the frame is cut along it and the top half slides off and snaps back (`slide` px). |
| Head stack | `head-stack` | Label tiles drop and pile up on the head. |
| Rack focus | `rack-focus` | Soft shapes sharp in the foreground, then focus racks to the speaker. |
| Banknote | `banknote` | A full-screen green currency note with the speaker engraved in the oval; the number counts up. |
| Voice note | `voice-note` | A chat voice message records with a live waveform, sends, reads Delivered. |
| Impact frame | `impact-frame` | Comic panel: hard black ink on cream, speed lines, a double flash and one huge word. |
| Dolly zoom* | `dolly-zoom` | The speaker holds still while the room recedes behind them. |
| Press front | `press-front` | A newspaper front page with a halftone photo and the headline. |
| Paper tear | `paper-tear` | A printed page rips down the middle and flies apart to reveal the speaker. |
| Blow away* | `blow-away` | The speaker dissolves into dust that drifts off (`plate`: a still of the empty set reveals the empty room). |
| Depth scatter* | `depth-scatter` | Words hang in the room at different depths, some behind and some in front. |
| Spatial glass | `spatial-glass` | A frosted glass panel floats in 3D in front of them with an orb and a progress bar. |
| Shatter 3D | `shatter-3d` | The frame breaks into shards that pop toward camera, then settle back. |
| Scene text* | `scene-text` | A big serif word sits in the room behind the speaker. |

## Life Scenes (cinematic B-roll with your text on top): 33

Life Scenes are short cinematic clips, mostly B-roll (or still photos), with on-screen text layered over them. Plan details: docs/LIFE-SCENES.md.

| Group | Names |
| --- | --- |
| Overlays (7) | `message`, `note`, `stack`, `phone`, `checklist`, `comment`, `timeline` |
| Camera moves (5) | `zoom`, `pullback`, `punch`, `drift`, `freeze` |
| Atmosphere (3) | dust, light leaks, zoom-through |
| Tip-card text styles (9), `clinicNote.treatment` | `invitation-messages`, `invitation-cards`, `invitation-envelope`, `visitor-checklist`, `announcement-note`, `announcement-numbered`, `welcome-clipboard`, `appreciation-cards`, `rest-cards` |
| Hook openers (3), `clinicNote.hookEffect` | `standard`, `stamp`, `holiday` |
| Card styles (3), `cardTrial.treatment` | `crimson-card`, `message-bubbles`, `handwritten-note` |
| Editorial type styles (3), `velvetEditorial.treatment` | `engraved-serif`, `gallery-sans`, `copper-script` |

Beat picker: time tip cards to music beats (skills/beat-sync/SKILL.md).

## Video carousels: 16 slide layouts, 6 styles, 6 end screens

Layouts: `cover`, `statement`, `list`, `checklist`, `compare`, `quote`, `steps`, `status`, `branches`, `media`, `toggles`, `proof`, `graph`, `ab`, `doc`, `cta`. Styles: `editorial`, `luxe`, `clean`, `bold`, `glass`, `showcase`. End screens: keyword, follow, save, link, question, collage. Handwritten notes with arrows on any slide. Five starter templates. Optional presenter cutout (`npm run cutout`). See docs/VIDEO-CAROUSELS.md.

## Beta 11: 25 new effects, plus second versions

Every effect below reads your brand.json: the metal finish, accent color and fonts. Version 2 looks never replace the originals.

### Text pops (1 effect, 11 looks)
| Name | What it does |
| --- | --- |
| `text-pop` | A short line of text pops in and has its own exit. `look`: `focus`, `shiny`, `gradient`, `blur-in` (default), `split`, `glitch`, `scramble`, `badge` (rising title with ribbon; `sub`, `tag`), `glass` (puffy bubble letters), `fill`, `stack` (`line2`, `line3`). `y` and `size` move and scale it |

### Carousel slides as video effects (6), each with a dark scrim behind it
| Name | What it does |
| --- | --- |
| `proof-card` | A frosted card with a number that counts up (`value`, `prefix`, `suffix`, `label`, `sub`). Real numbers only |
| `focus-list` | A list with switches. Give every item `{"text": "...", "at": <second>}` so each switch turns on at its own word. This is not a checklist |
| `compare` | Two options side by side (`left`, `right`, `leftText`, `rightText`); the `winner` gets a badge |
| `trend-graph` | A line graph draws through your `points` and lands on a labeled `value`. Real numbers only |
| `freebie-doc` | A document card for your lead magnet with a Comment "`keyword`" pill |
| `note-arrow` | A handwritten note with a curved arrow pointing at `to: [x, y]`. The arrow starts outside the note on the side facing its target; `from` and `bend` adjust it |

## Second versions (upgrade batch 1), same effect name plus `"version": 2`
The original look stays the default and is never replaced. Add `"version": 2` to the effect's props (or say "version 2" in chat) for the newer look. All timing props stay the same, so switching versions never changes when things land.

| Name | Version 2 look | Extra props in version 2 |
| --- | --- | --- |
| `odometer` | The rolling digits on a frosted proof card, with commas, an underline that draws in, and a line under the number. | `sub`, `y` |
| `chart-grow` | A glowing line on a frosted card; the end label lands as the dot starts to pulse. | `y` |
| `pointer-callout` | Handwritten notes with curved arrows that follow her (needs the matte anchors, as before). | `size` (handwriting size) |
| `clone` | The copies fan out in a row behind her, each on its own second, smaller and darker toward the edges (needs the cutout, as before). | none |

The list with switches is a focus list, not a checklist: it lives in `focus-list`, never under the checklist name. Give every item `{"text": "...", "at": <second>}` and each switch turns on at its own second; plain words still switch on at an even pace.

Code: `src/fx/twelfth.tsx`.

## Reel effects (9), in the `fx` list
| Name | What it does | Needs cutout |
| --- | --- | --- |
| `shoulder-steps` | The shot pushes in and slides her to one side; numbered step cards float beside her in depth, each on its own second | anchors |
| `iris` | A round iris closes to a circle on her face, holds (optional word), and opens again. `mode`: `peek`, `close` or `open` | anchors |
| `match-cut` | Hard cuts between framings with her face pinned to the same spot, a white flash and an optional big word per cut (`mono` makes a cut black and white) | anchors |
| `demo-cursor` | An app window floats in; a cursor glides to the button and clicks it, and the button turns to done. `src` swaps in a real screenshot | no |
| `glass-cards` | Small frosted cards float around her and bob, each with a label, a value and an optional bar | no |
| `pixel-monitor` | Opens as a close-up of a pixel screen (red, green, blue stripes), then pulls back and sharpens into her clip | anchors |
| `slot-machine` | Up to three reels spin and stop one by one on her words, then the frame glows | no |
| `holo-phone` | A see-through hologram phone turns beside her, with scan lines, glow and a light cone | no |
| `silhouette-shift` | She turns into a dark silhouette on a color field, a big word lands behind her, then a light sweep brings her back | yes |

Code: `src/fx/thirteenth.tsx`. Never put invented numbers in `glass-cards` or `demo-cursor`.

## Carousel pieces as video effects (3), in the `fx` list
Pictures and clips are the member's own files under `public/`.

| Name | What it does |
| --- | --- |
| `image-collage` | A grid of pictures rises in tile by tile, with a title and an optional Comment "WORD" pill |
| `cover-fan` | A stack of 2 to 5 tilted frames fans out like a hand of cards |
| `framed-clip` | A clip or picture in a white frame beside her, with up to 4 handwritten notes and arrows (leave `media` out to frame her own clip) |

Code: `src/fx/fourteenth.tsx`.

## Comparison reel set (6 new), in the `fx` list
| Name | What it does | Needs cutout |
| --- | --- | --- |
| `side-by-side` | Two of the member's pictures or clips with labels; the winner lifts and glows | no |
| `vote-pill` | A question with two answers; one gets picked | no |
| `duotone` | Her whole picture in two colors (`dark`, `light`) | no |
| `big-stat` | One huge number that counts up, poster style, with a label and a line under it. Real numbers only | no |
| `thank-you` | The picture goes black and white and a handwritten line writes on, with an underline | no |
| `wall-text` | Big type lying on the wall in perspective behind her; the shot eases down to make room above her head | yes |

## Second versions (upgrade batch 2), same effect name plus `"version": 2`
| Name | Version 2 look |
| --- | --- |
| `before-after` | The two versions side by side, each centered in its own half with its label and a gold divider |
| `flash-frame` | A slanted brand-color band wipes across the frame as a transition (0.6 s unless `until` is set) |
| `kinetic-hook` | Magazine poster type: heavy caps and gold italic lines rise out of masks between two rules |
| `giant-caption` | The same poster type; the `accent` word gets its own gold italic line |
| `follow-card` | A glass end card with the brand mark and handle; a FOLLOW stamp lands on it |
| `checklist` | One frosted card; square boxes get checked on their seconds |

Code: `src/fx/fifteenth.tsx`.

**Page turn** (`page-turn`, new): a corner peel. The bottom-right corner of the page lifts and the page curls back to reveal the next shot. Put it on a shot change (it turns the shot over as it looked just before), or give it `front` (the press-front props) and `frontT` (the second to hold) to peel a press-front page away. Props: `tone` (`paper` or `dark`), `front`, `frontT`.

**Lesson board** (`lesson-board`, new): a whiteboard list in marker. The heading writes on, then each point writes on as it is said, with its number circled in the brand color. Props: `title`, `items` (`{text, at}`, up to 6), `y`, `height`. Used by the Teach Board template.

**Total: 163 talking-head effects and graphics + 33 Life Scene effects and styles = 196, plus 16 carousel layouts in 6 styles.**
