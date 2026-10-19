# Repository notes

- The web app in this folder (Vite, Netlify, Supabase) is separate from the video tooling.
- **Talking-head videos** (Dr. CK's AI avatar, Dr. CiCi, as short vertical clips with kinetic captions and cutaways) live in `remotion-cutaways/`.
  When asked to make, edit or re-render one, read `remotion-cutaways/docs/PLAYBOOK.md` first. It holds the templates, the locked style rules, the exact workflow and the render settings that avoid glitches.
  Dr. CK's one-line command for this is **"do ya thing"** (her version of "edit it"): she drops clips and scripts, says it, and Claude runs the whole workflow in playbook section 12. The effect library is now 111 effects (batches 4 to 6, flight, 3D tilt, carousel, flip and the scripted panel are in playbook section 14). Her style presets, effect names and other phrases ("use the Spotlight style", "add a spotlight on 'quiet'", "show me the effect list") are in the playbook and `remotion-cutaways/docs/STYLES.md` and `EFFECTS-LIST.md`.
- **Stick-figure explainers** (Dr. CiCi as a hybrid stick figure with a gray stick cast, her voiceover, portrait and landscape) also live in `remotion-cutaways/`.
  When asked to make, edit or re-render one, read `remotion-cutaways/docs/STICK_PLAYBOOK.md` first.
