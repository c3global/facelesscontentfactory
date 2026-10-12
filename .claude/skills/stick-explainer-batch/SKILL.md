---
name: stick-explainer-batch
description: Make a batch of Dr. CK's stick-figure explainer videos (Dr. CiCi hybrid stick figure, her voiceover, portrait and landscape) from script and recording through render, Notion Content Library rows, Kai cover prompts, and Marky scheduling. Use when Dr. CK says she has new explainer voiceovers or scripts, asks to batch, re-render or edit a stick-figure explainer, or asks for explainer cover prompts or scheduling.
---

# Stick-figure explainer batch (C3 Global, Dr. CK)

Read `remotion-cutaways/docs/STICK_PLAYBOOK.md` first, all of it. Sections 0 to 11 hold the locked style rules, layout rules from her reviews and the posting standard. Section 12 holds the batch workflow, keyword endings, cover prompt template and Marky steps. This skill is the order of work; the playbook has the detail. Also follow her standing preferences: address her as Dr. CK, no em dashes, never invent facts, captions in first person or expert-friend second person, three hashtags, one ask, no fictional clients (Copy Rules section 7).

## Order of work
1. **Setup.** Fetch the branch that holds `remotion-cutaways/` (merged into the default branch as of Oct 12). Rebuild the git-ignored assets: `node scripts/sync-stick.mjs`, `npm run sync-music`, voiceovers via `node scripts/fetch-drive.mjs <id> public/raw/<slug>-vo.mp3`. Env: `REMOTION_LOCAL_FONTS=1`, `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
2. **Intake.** Her scripts (usually a claude.ai artifact link) and the publish dates. Match each recording to a slug. The recording wins over the written script; list every difference, and any closing "Follow..." line the transcript dropped, for her to confirm by ear.
3. **Build.** One episode at a time or one builder per episode (see `remotion-cutaways/work/batch5/BRIEF.md` if present in the container; otherwise follow playbook section 12). Words file, captions, plan JSON, stage component, stills, `check-stick`, then render both formats in the foreground. Different visual metaphor for every episode. Send her the videos with SendUserFile.
4. **Notion.** One Content Library row per episode (collection 6d3eb389-7c81-4696-aa91-d4827ac1b6bf): title, Marky Title, Marky Caption, CTA fields, hook template, pillar, publish date, notes, voiceover, keyword line, Kai cover prompt, YouTube tags. Stage stays Draft until she approves captions.
5. **Captions first.** Show her all captions. She approves before anything is scheduled. Keyword follows what the caption diagnoses (EXPERIENCE, AIREADY, SHIFT; mapping in playbook section 12). Only the last line differs per platform.
6. **Covers.** Give her the Kai prompts (16:9 plus 9:16 per episode). Rotate the photoreal Dr. CiCi left and right and mirror the text block.
7. **Schedule in Marky** only after approval: upload both files, seven posts per episode at the standard slots, title overrides, Pinterest link. Then set Stage Scheduled and the post ids on the row. She adds covers in Marky herself.

## Do not
- Schedule or publish before she approves the captions.
- Remap keywords or change her approved endings.
- Run `pkill -f`; render in the background; commit or edit sprites and music into git (they are git-ignored).
