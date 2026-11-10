---
name: yap
description: "Edit a yap with Faceless48 Creator: a relaxed, casual talking video (in the car, at home) that gets captions and a light edit, nothing more. Use when the member says 'edit my yap', 'yap', or drops a casual in-car or at-home clip. For polished talking heads with cutaways and effects use video-production instead."
---

# Edit my yap

A yap is a relaxed lifestyle talking video. It must not drift toward the polished talking-head style, so it gets captions and a light edit. Follow `docs/YAPS.md` in the member's project. Read `brand-profile.md` first.

Run these steps without further questions, except confirming the transcript:
1. Conform the clip (join several parts in order first) and transcribe it. Show the member the transcript and wait for them to confirm names and wording.
2. Tighten the pauses: `python3 scripts/tighten-pauses.py content/<slug>.json 0.3`, then build the plan from the recipe in docs/YAPS.md (style `yap`).
3. Render the `-tight` plan, scan it for brightness jumps, and send a review copy. A yap uses the approved look, so stills are not needed first.
4. When the member approves, deliver the final under 28 MB. Never schedule or post.

If the member says "make my video" or "do ya thing" on a clip that is clearly a yap, ask once which they mean: yap (captions and a light edit) or a full talking-head edit.

An assistant cannot hear. Say so, and let the member judge voice and music.
