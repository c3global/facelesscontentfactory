# Talking-head templates (8), drafted Nov 13 2026

A template changes everything a viewer reads in the first two seconds, not just the effects: framing, caption style, card language, background, motion, grade, finish and sound. Brand colors and fonts still come from the brand. Built on Tolerance first (`scripts/build-templates-tolerance.py`, plans `content/tol-<name>.scene.json`); comparison sheet in `faceless48-beta/beta11-media/templates/`.

| Template | Captions (`captionStyle`) | Framing and motion | Card language (effects it draws from) | Finish |
|---|---|---|---|---|
| Quiet Authority (`quiet`) | `quiet`: one calm sentence-case line, emphasis in metallic serif italic | full frame, slow creeps, gentle 1.06 punch-ins | statement cards on plain black, nothing else | clean |
| Magazine (`magazine`) | `magazine`: serif italic pull-quote on a paper slab between metal rules | light pages, split layout | cover-frame (scaled), press-front (scaled), giant-caption v2, kinetic-hook v2, headline cards | light grain |
| Glass Lab (`glass`) | `glass`: dark glass panel, words light up as said | full frame, hidden-her glass moments | layer-explode, glass-cards, spatial-glass, holo-phone, glass-type | cool grade |
| Scrapbook (`scrapbook`) | `tape`: black and white label tape, key word handwritten | full frame, velvet, split with notes | paper-tear, doodle-boil, framed-clip with notes, pen-circle, notes card | warm grade, heavy grain |
| The Analyst (`analyst`) | `ticker`: data bar with accent block, typed words, numbers in metal | full frame on charcoal | date-stamp, focus-list, big-stat (real numbers only), checklist v2 | clean |
| Cinematic (`cinematic`) | `film`: small film subtitles | letterbox, slow pushes, rack focus, iris, blackout | statement on velvet only | golden grade, dust, cinematic grain |
| Creator Hype (`hype`) | `punch`: one or two huge condensed words that pop | hard 1.16 punch-ins on every cut | text-pop, slot-machine, flash-frame v2, impact-frame | film, full sound |
| Teach Board (`teach`) | `karaoke`: the word being said sits in a white box | full frame, split for the key card | shoulder-steps, headline card, step-chips | clean |

Rules: every jump cut from the clean cut gets a hard punch-in (`"cut": true` on the segment, alternating `focus.zoom`). Full-page effects that would hide captions take `scale` so captions sit under the page. Card text is the member's script or supplied on-screen text only.

## Rules from Dr. CK's review of the Tolerance renders (Nov 13 2026)
- Captions appear word by word as she speaks, and never repeat words already written on screen (automatic, `src/TemplateCaptions.tsx`).
- A caption never sits on an effect or card. Each scene sets `captionY` so the caption lands in empty space (between her window and the card for layout T, under the circle for O). Keep inside the portrait safe zone (y 240 to 1480).
- When examples change, she changes position (card on top and her below, then her on top and the card below): `seq()` in the builder.
- Cut every pause (clean cut breath 0.08 s); Creator Hype especially. Check the seams between parts for a cut-off word (Part 1 of Tolerance ended on a half "write").
- Clean the voice before editing: `scripts/voice-polish.sh public/raw/<slug>.mp4`. Master the final mix to -14 LUFS (work/finish.sh does it).
- Nothing on her face; effects that would cover a caption move (holo phone above, glass panels higher, notes stay in frame).
- No letterbox on Cinematic, no orange golden-hour grade (she found it ugly); cool moody grade.
- Single cards and big numbers sit front and center, never low on an empty screen.
- Magazine opens on a broadsheet front page with our own masthead (never a real paper's brand).
