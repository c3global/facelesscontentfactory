---
name: handoff
description: "Import a Faceless48 handoff package (the script, Shorts and thumbnail exported from the Script, Shorts and Thumbnail engines) and start the right video workflow from it. Use when the member says 'import my handoff', 'start from my script', 'I exported from Faceless48', or drops a .f48handoff.zip or a folder with handoff.json."
---

# Import my handoff

A handoff is text plus at most one thumbnail, made by the Faceless48 Script, Shorts and Thumbnail engines. Full format: `docs/HANDOFF.md`. Read `brand-profile.md` first.

1. **Find the package.** Ask the member to copy the `.f48handoff.zip` (or the folder) into the project, for example `content/incoming/`. Run `npm run f48 -- handoff check <package>`. If it fails, read the message to the member in plain words, name the exact field, and tell them to export it again from the engine. Never edit their package to make it pass.
2. **Import.** `npm run f48 -- handoff import <package>`. It saves to `content/handoffs/<slug>/` and keeps any earlier import of the same slug. Read out the summary: the video type, how many sections and Shorts, and whether a thumbnail came with it.
3. **Say what they must bring next.** Use the summary's "Next, bring..." line as it is. The plug-in does not create voiceovers: a faceless or explainer video needs the member's voiceover file; a talking-head or yap needs the raw clip, which already has the audio; a life-scene needs clips. Do not start planning until they have it.
4. **Stock footage (faceless, life-scene, and talking-head cutaways).** Offer it once. If they want it:
   - Sections without search terms need terms from you: 2 to 4 concrete words per section, written to `content/handoffs/<slug>/stock-terms.json` as `[{"sectionId":"s2","terms":["person typing laptop"]}]`. Keep any terms the engine supplied.
   - Run `npm run f48 -- handoff stock <slug>`. It searches Pexels and Pixabay and saves the options to `out/handoff-<slug>/stock-options.md` with preview images in `out/stock-preview/`.
   - Show the previews and links. The member chooses. Download only what they choose with `stock pick`, then follow docs/STOCK-FOOTAGE.md. Never choose for them, never download in bulk, never ask for keys in chat. If keys are missing, give the 5-minute setup from that doc.
5. **Start the workflow for the type**, using the script as follows:
   - `talking-head`: skills/video-production/SKILL.md. The script is a transcript check only; the recording is the authority.
   - `yap`: skills/yap/SKILL.md. Captions and a light edit.
   - `explainer`: video-production explainer workflow. Sections become scenes; the voiceover recording sets timings.
   - `faceless`: video-production image and footage scenes. Sections become scenes; the voiceover sets timings.
   - `life-scene`: skills/life-scenes/SKILL.md. Each section's `message` becomes the on-screen lines; propose them in plain words and wait for approval.
6. **Shorts.** Each short is its own video. Ask which ones to make; never batch them without being asked.
7. **Thumbnail.** It is saved with the import. Use it as it is; do not redesign it unless asked.

Always stop at the storyboard and wait for approval before rendering, as video-production requires. Never invent dialogue, numbers or sources that are not in the package or the recording. Never post or schedule.
