# The full list: everything in the talking-head template (Oct 2026)

**61 effects in all: 17 original graphics and end cards, 26 from the first FX batch, 13 from the second batch, and 5 from the third.** Plus the speed ramp tool, 2 extra modes, and the look dial. Also: 6 layouts, 3 caption styles, 14 sounds, 6 style presets. Names below are what goes in a video plan (`type`). Say any name in chat and Claude can use it.

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
Built Oct 2026 from the effect list Dr. CK collected. They read colors, icons and cards from `src/fx/theme.tsx` (copper first, gold secondary, crimson action color, her orbital globe at `public/brand/orbital-globe.png`). Pills sit low, stay brief, and never cover her face. Each takes an optional `y` to move it. Her lab objects (`molecule`, `dropper`, `microscope`, `beaker`, `stylus`, in `public/brand/lab/`) work as `glyph` values on `icon-strike` and `jiggle-delete`, and the dropper is the pointer in `eyedropper-grade`.

| Name | What it does |
|---|---|
| `prompt-bar` | A white bar types a line, the crimson send button presses, then it flips to a "Done" state with a copper check |
| `comment-drop` | A comment field types the keyword, Post, the comment lands with a heart, a dark reply card arrives (optional link chip) |
| `comment-cta` | The same field with an instruction line above it |
| `file-drop` | A file card drops into a dashed drop zone and settles with a check |
| `icon-strike` | A generic app tile gets a crimson strike, then the C3 mark pops in beside it |
| `jiggle-delete` | An "Edit mode" tray of wiggling app tiles where the unwanted ones are deleted and the kept one centers |
| `storyboard-deck` | A fan of three cards: a script page with numbered lines and two real freeze frames from her clip (`stills` seconds) |
| `gravity-drop` | A big copper serif word whose letters fall and bounce into place, with an optional italic `kicker` (turn captions off for that moment, the kicker sits in the caption band) |
| `grade-slider` | A slider card whose knob moves while a warm, cool or golden grade fades in over the frame |
| `kinetic-hook` | A stack of up to four lines that rise through a mask one after another, mixing serif, bold sans and copper italic (set `captions: "off"` on that segment) |
| `giant-caption` | One huge word on a dark block with a copper italic accent line under it (captions off for that moment) |
| `playing-grid` | A row of three or four small portrait tiles that each play a different moment of her own clip (`offsets`) and pop in with a tilt |
| `video-card` | A white card with a copper rim: her clip playing, a progress bar, a serif title and a small sub line |
| `reel-feed` | A scroll-blur takeover into a reel-style screen: her clip playing, handle and brand mark, and the like, comment, share and save rail (captions off) |
| `eyedropper-grade` | An eyedropper picks a brand swatch (`pick` index) and the frame grades toward it |

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
Stick-figure explainers (Dr. CiCi with a modern gray cast) have their own playbook, `docs/STICK_PLAYBOOK.md`; they are not part of the talking-head count above.
