---
name: life-scenes
description: Produce Dr. CK's Life Scenes end to end. Use when asked to edit, caption, add Notion rows for, or schedule Life Scenes (short cinematic AI clips for the Dr. CiCi series): intake of clips, plain-English on-screen text, Remotion edit with no color changes, captions that extend the script, Content Library rows in Notion, and scheduling in Marky on video-free days.
---

# Life Scenes

Read `remotion-cutaways/docs/LIFE_SCENES_WORKFLOW.md` in full and follow it step by step. It is the single source of truth. Also read `remotion-cutaways/docs/LIFE_SCENE_EFFECTS.md` before building any effect.

Non-negotiables, repeated here because they were the costly mistakes:
- Never change the color of her clips (use `ls_finish.py --plain`). No letterbox bars.
- Never build on-screen text she has not approved. Propose plain-English lines first.
- Captions extend the script, start from the approved template, keep the approved CTA word for word.
- One video per day: schedule Life Scenes only on days with no talking head, explainer or miniseries.
- Read post ids back from Marky before writing them to Notion.
