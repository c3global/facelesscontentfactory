# Motion notes (measured from the three reference videos)

The references are 720x1280 at 24 fps. Frames were extracted at 12 fps (83 ms per frame) around each
moment, then converted to this project's 30 fps timing. The structure, motion and pacing are matched.
Branding, wording and graphics are not copied.

| Moment | Measured at 12 fps | Used here (30 fps) |
|---|---|---|
| Layout change, full-bleed to window or circle | 3 to 4 frames, almost all travel in the first 2 (hard ease-out) | `TRANSITION_FRAMES = 12`, `Easing.bezier(0.16, 1, 0.3, 1)` |
| Field fade behind the shrinking video | about 3 frames | same 12 frames, cross-fades with the layout change |
| Card entrance (headline, notification, chat row) | fade over 2 frames with a short downward settle | 5 to 6 frames, 28 px slide, `easeOut` |
| Strike-through | line fully drawn within 1 to 2 frames, text dims slightly | 5 frames, word by word, text dims to 55% |
| Old card out, new line in (rewrite) | out 2 frames, in 2 to 3 frames, check ring draws over about 6 | words ease in across `writeSeconds`, check draws over 14 frames |
| Notification stack | a new card every 5 to 7 frames, badge counts up with each card | cards on the times in the scene plan (about 0.45 to 0.6 s apart), badge bumps 1.0 to 1.2 to 1.0 |
| Hub diagram | nodes fade in about 2 frames apart, thin lines, then pulses travel along the lines | nodes on plan times, lines draw outward over 12 frames (3-frame stagger), pulses loop every 2 s |
| Chapter card | tint crossfade about 3 frames, numeral and title fade in, flow boxes step in | numeral 12 frames, title 12, flow boxes 7 frames each, 9 frames apart |
| Caption pop | page swaps instantly, small scale pop on each group | 9-frame spring, 0.9 to 1.0 scale, short fade in over 3 frames |

Layout A (full-bleed hook) also pushes in slowly (5% over the segment) so she never sits static.

Structure observed in all three references:
- A full-bleed hook, then the graphic takes the screen and she becomes a window, circle or small portrait.
- The big layout change lands every 4 to 12 seconds, and something new animates in every 1 to 2 seconds.
- Captions are 1 to 3 words, with one emphasized word in the serif accent.
