# Repository notes

- The web app in this folder (Vite, Netlify, Supabase) is separate from the video tooling.
- **Talking-head videos** (Dr. CK's AI avatar, Dr. CiCi, as short vertical clips with kinetic captions and cutaways) live in `remotion-cutaways/`.
  When asked to make, edit or re-render one, read `remotion-cutaways/docs/PLAYBOOK.md` first. It holds the templates, the locked style rules, the exact workflow and the render settings that avoid glitches.
- **Life Scenes** (short cinematic clips from Flow or Seedance, finished with on-screen text, captioned, logged in Notion and scheduled in Marky) follow `remotion-cutaways/docs/LIFE_SCENES_WORKFLOW.md`. Read it first. It holds the standing rules (no color changes, plain-English text, captions that extend the script), the Remotion pipeline, the Notion row format, the Marky scheduling steps and the prompt for starting a new batch. The project skill `life-scenes` points to it.
