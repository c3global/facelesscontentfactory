# Faceless48 project

Before any video work, read `brand-profile.md` (the member's saved brand and preferences) and follow it.
If `brand-profile.md` does not exist, run the brand-setup skill first ("get me set up").
Video workflow: the plugin's `skills/video-production/SKILL.md`. Onboarding: `skills/brand-setup/SKILL.md`.

Commands: "import my handoff" runs skills/handoff/SKILL.md (docs/HANDOFF.md). "Blur my private info" runs skills/redact/SKILL.md (docs/REDACT.md). "Edit my yap" runs the yap workflow (skills/yap/SKILL.md, docs/YAPS.md): confirm the transcript, tighten pauses, apply the yap recipe, send a review copy, then the final after approval. "Make my video" runs the regular talking-head workflow; if the clip is clearly a yap, ask once which is meant.

Storyboard first: before the first render of any video (talking head, yap, life scene or explainer), run `npm run f48 -- storyboard <plan.json>`, show the member `sheet.png` from `out/storyboard-<slug>/` and the frame list in `storyboard.md`, and wait for their approval or the frame numbers they want changed. Never render before that.

Talking-head templates: when the member names a template (Quiet Authority, Magazine, Glass, Scrapbook, Analyst, Cinematic, Creator Hype, Teach Board), read `docs/TEMPLATES.md` and the worked example in `docs/templates/`.
