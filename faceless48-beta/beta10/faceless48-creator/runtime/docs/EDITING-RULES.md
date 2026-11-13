# Editing rules (read before planning any talking-head edit)

These rules come from weeks of real edits and reviews. They are what makes a video feel finished instead of busy. Follow them unless the member asks for something different, and save any standing change they ask for in `brand-profile.md`.

## Cadence
- A visual change at least every 4 seconds, and on key words. Either cut away to show what the words mean, or stay on the person on purpose.
- The person stays full frame for about 4 seconds at a time, 6 at most. Picture-in-picture, split screen, hidden-person scenes and B-roll cutaways (`broll`, stock or your own clip) all count as cuts.
- One strong effect every 4 to 6 seconds is plenty. Packed demos are not a model for real videos.
- Plan at least one diagram or list for any script that teaches a framework or steps, and a proof cutaway (a real source card or page capture the member supplies) for every cited source.

## Face and safe zones
- **Balanced portrait compositions:** Arrange the presenter, graphics, and captions as a cohesive group around the middle of the frame. Keep visual breathing room above and below roughly balanced where platform safe areas permit. Center headings and numerals unless their alignment serves a clear design purpose; avoid off-center presenters without a visual purpose, isolated elements, awkward gaps, and overlap. Check several points in motion, not only one still.
- Never put a tag, pill or card on the face. Cards that sit in the top half of a full-frame shot cover the face: lists, charts and comment bubbles go in the lower third.
- Keep text clear of the top 12 percent, the bottom 22 percent and the right 12 percent of a portrait frame (platform buttons live there).
- Pill captions always sit at the bottom. In split-screen layout `S` the person fills the lower half, so pill captions land on the face. Use layout `C` or `E`, or editorial captions, for those moments.
- Do not stack two effects that both cover the lower third.
- Behind-person effects work best in full-frame layout `A`. They need a matte (`npm run matte -- <slug>`). Footage with a plain background and clear light between the person and the wall cuts out best; say so if the background touches their edges, and offer the outline dial.

## Captions
- Never drop a spoken word.
- When a graphic shows every word being said (statement card with word times, headline, chips), turn captions off for that segment (`"captions": "off"`) so nothing is read twice. If even one word is missing from the graphic, keep the captions.
- A caption chunk never ends on a connector word (and, the, of, to). The editorial chunker handles this; check it in stills.
- Captions stop where the end card starts.

## Pills and labels
- Each pill goes in the right place for what it labels, never over the face, never colliding with captions or another graphic.
- Pills stay on screen only long enough to read. No pill lingers for a whole scene.

## Timing
- Land effects on the words. Use the real word times from the transcript (`npm run word -- <slug> "phrase"` or the captions file), never guessed times. Guessed timing is the most common reason an edit feels off.

## Process
1. **Clean cut first.** Never just join the parts of a video. Transcribe each part on its own and read it for retakes, repeated lines, false starts and stumbles. List the parts in order in `content/edits/<slug>.cut.json` (`{"slug", "parts": [{"src", "from"?, "to"?, "drop"?: [[start, end]]}]}`), then run `npm run clean-cut -- content/edits/<slug>.cut.json`. It joins the parts, drops what you listed and shortens every pause to a short breath, measured from the audio. Transcribe the cleaned clip and read it end to end: no fragments, no repeated lines. Every jump cut then gets a punch-in (`digital-zoom`) or a cutaway in the plan. Only skip this if the member asks to keep their own pacing.
2. Transcribe the cleaned clip, then show the member the transcript to confirm names, links and the closing line before building anything. Whisper splits names and sometimes invents words after the audio ends: delete words that start after the video ends.
3. Check the ending of the take. If it is cut off mid-sentence, say so before editing.
4. Show stills of every new look and effect moment before a full render. Once a look is approved, full renders of that look need no new approval.
5. Render one frame at a time (concurrency 1). Parallel rendering can paint random frames white. After rendering, scan for flashes: `ffmpeg -i out/<slug>.mp4 -vf signalstats -f null -` and look for YDIF spikes that are not at planned cuts.
6. Report what you checked and what you could not (an assistant cannot hear audio; the member's ear decides music and sound levels).

## Content
- Never invent facts, numbers, quotes, credentials, testimonials or client results. Card text comes from the member's script or supplied material. Flag gaps instead of filling them.
- Illustrative interface text (a chat message, a notification) must stay generic.
- Music sits well under the voice (about 17 dB below while speaking) with ducking. Use only music the member has the rights to.

## Proven-effects shortlist
- **Hook:** digital-zoom with a snap on the key word.
- **Contrast or myth:** headline-card with strikeAt on the word that rejects it.
- **The thesis line:** statement-card with word times, captions off, layout `E` or `C`.
- **A question the audience should ask:** prompt-bar.
- **Close or call to action:** type-wall behind the person (needs matte), or an end card.

## Cutouts (behind-person effects)
- The default cutout (`npm run matte`) is fast but can leak into a sofa or chair of a similar color, or wobble at the edges. Check it on a close crop of an effect moment before rendering.
- If the edge is not clean, use the high-quality cutout: `python3 scripts/matte-hq.py <slug> <startSec> <endSec>` (BiRefNet, MIT license). It needs a one-time 220 MB model download (see the top of that script; ask the member first) and takes about 18 seconds per frame on a CPU, so cut only the seconds an effect uses. A GPU is much faster.
- Do not hide a poor cutout with an outline. The outline follows the mask, so a bad mask makes a bad outline.

## Music
- Add the member's licensed track with `npm run f48 -- mix-music <video.mp4> <track.mp3> [out.mp4]`. It loops the track to length, ducks it under speech and fades in and out. Level the track first (about -24 LUFS), and use only music the member has the license for. An assistant cannot hear: the member approves the mix by ear.
- Explainers (stick plans) take a `music` block in the plan instead.

## Gradient and labels
- The dark gradient behind a full-frame hook caption starts low (56 percent of the frame height) and is light, so it never covers the torso.
- A style label (`tag`) and top-of-frame captions must never share the same seconds. Show the label while captions are at the bottom, then move captions up.

## Run the lint before every render
`npm run f48 -- storyboard content/<plan>.json` shows the whole video as numbered stills before it renders (one per scene, effect and graphic, plus a frame wherever a long stretch has nothing new). Approve it or name the frame numbers to change; nothing renders until then.

`npm run f48 -- lint content/<plan>.json` (it also prints on `validate`, `preview` and `render`). It finds:
- **Collisions:** a caption band sharing seconds with a graphic in the same part of the frame (a lower-third effect with bottom captions, a style label with top captions).
- **Echoes:** captions that repeat text already on screen. Fix by turning captions off for that stretch (the graphic must then show every spoken word) or by writing the graphic so it adds something instead of echoing the sentence.
- **Timing:** a checklist tick, type-wall word or chip that lands more than 0.4 s from the word it is about. Use real word times.
Fix every warning or say why it stays. A clean lint is not a promise the video looks right: still look at stills at each effect and at the busiest caption moment.

## Captions off
Words spoken inside a `captions: "off"` stretch are never captioned, even when a caption group started just before it. The graphic in that stretch must carry them.

## Landscape (YouTube)
Set `"format": "landscape"` in the plan for a 1920 x 1080 talking-head video. Everything above still applies (cadence, never covering the face, real word times, storyboard before render). What changes:
- **Layouts.** `A` is full frame. Every other layout (`B`, `C`, `D`, `E`, `S`) becomes one split layout: she sits in a framed window on the left and graphics fill the right. With `avatar: "hidden"` the graphics are centered and she is out of frame (audio keeps running).
- **Captions** sit in the lower part of the frame for every segment. `captionPos: top` is ignored.
- **Graphics** keep their portrait design, so they fit a 960 wide area. Full-frame graphics (chips, chapter card, congruence map, screenshot card, quiet feed, citation card) show their middle band. Look at the stills for these.
- **Effects.** Only camera moves and looks: `digital-zoom`, `pull-back`, `zoom-through`, `blackout`, `flash-frame`, `grade`, `glow`, `dust`. Everything else, and every cutout or outline, is portrait-only for now. `validate` stops with a plain message if a landscape plan asks for one. Offer the portrait version of the video for those moments.
- **End card** is centered in the lower third. Check that it does not sit on her face.
- **Safe zones.** The platform-button zones are a portrait rule. Keep text away from the outer 5 percent of the frame.
