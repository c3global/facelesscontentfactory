# Style presets and mix-and-match (Dr. CK's talking-head videos)

Drafted Oct 2026 after Dr. CK asked for style templates like the paid bundle, without losing the look she already approved. Code: `src/styles.ts`; command: `npm run style`.

## The idea
A video plan can say `"style": "<preset>"` and/or `"mix": {"<dial>": "<value>"}`.
- **Preset** = a named bundle of dial settings.
- **Dial** = one independent choice (captions, backdrop, finish, music, sound, outline, effects).
- **Freestyle** = no preset, only `mix`. Pick any dial values in any combination.
- Order, later wins: what the plan wrote, then the preset, then `mix`. Choosing a style is a decision to change the look, so it beats values the plan wrote for those same dials. `mix` beats the preset.
- A plan with no `style` and no `mix` renders exactly as before. Checked on Dialects, Rough, Terrace and Week 2: output is identical.

## Presets (draft for Dr. CK to approve and rename)
| Preset | Feel | Dials |
| --- | --- | --- |
| `signature` | The approved look. Kinetic editorial captions, red velvet where the plan puts it, glass cutaways, copper and gold, film finish, the plan's own music levels. Effects only when asked. | captions editorial, backdrop as-planned, finish film, music as-planned, sound minimal, outline none, effects authority |
| `quiet-authority` | Executive and restrained. Pill subtitles, plain black, clean finish, soft music, slow zoom and a spotlight on the key line. | pill, black, clean, soft, minimal, none, authority |
| `spotlight` | Dramatic and cinematic. Heavy captions, velvet, stronger film finish, copper outline, spotlight and type-wall moments. | heavy, velvet, cinematic, bed, minimal, copper, spotlight |
| `show-and-tell` | Teaching. App screen, stacks, checklists, callouts and charts carry the lesson. | editorial, charcoal, clean, soft, minimal, white, teach |
| `hype-reel` | Social energy. Heavy captions, orbit, clones, wall effects, comment bubble, full sounds. | heavy, crimson, film, bed, full, white, hype |
| `raw-tape` | Unpolished and personal. Pill subtitles, grain, no music, no effect sounds. | pill, black, cinematic, none, off, none, none |

## Dials (mix any, any time)
`npm run style -- list` prints every value with a note. In short:
- **captions**: editorial, heavy, pill
- **backdrop**: as-planned, velvet (photo behind every dark scene without one), black, crimson, charcoal, marble-black, marble-red, marble-white. The plain ones replace scene photos so the whole video changes.
- **finish**: clean, film, cinematic
- **music**: as-planned, bed, soft, none (levels only; a plan with no track keeps no music)
- **sound**: off, minimal, full (effect sounds)
- **outline**: none, white, copper, gold (bake first: `npm run outline -- <slug> <kind>`)
- **effects**: none, authority, spotlight, teach, hype, all. This is a recommended pack Claude draws from when placing effects. It does not auto-place or filter effects.

## Using it
- `npm run style -- set dialects --style spotlight`
- Freestyle: `npm run style -- set dialects captions=heavy outline=copper sound=full`
- `npm run style -- show dialects` shows what the plan resolves to.
- `npm run style -- set dialects --clear` removes the preset and mixes.
- Say it in chat: "make this one Spotlight, but keep the Signature captions" and Claude sets `style` and `mix`.

## Not built yet
- Effect auto-placement from the transcript ("edit it"). Effects are still placed by Claude with `npm run word`.
- Metal choice as a dial (copper stays the default metal; gold is used for accents).
- Preview stills of a preset on any clip in one command.
