---
name: beat-sync
description: "Use when a member wants music-synchronized text, the beat picker, or exact frame cue handoff."
---

# Beat picker workflow

Read brand-profile.md and approved copy. The member selects musical accents; detected peaks are suggestions, not approval. Adapt assets/beat-picker-session-reference.html to the current media, copy, duration, FPS and fonts. It is a working session reference, not a generic one-command generator. The preserved project snapshot contains the tested builder and analysis source.

Serve the adapted page on localhost, open it visibly, and let the member restart and tap the desired accents. They can audition, nudge by frames, and copy/download cue times. Save those integer frames as JSON. Apply each frame / FPS to clinicNote.tips[].at or cardTrial.tips[].at exactly. Do not respace or snap user picks automatically. Keep music unchanged and render a new slug.

Use runtime/docs/BEAT-SYNC-WORKFLOW.md for the complete production workflow.
