---
name: brand-setup
description: "First-time onboarding for Faceless48 Creator. Use when the member says 'get me set up', 'set up my brand', 'onboard me', 'change my brand', or when a project has no brand-profile.md yet. Interviews the member, previews choices on screen, and saves brand.json and brand-profile.md so they never set up again."
---

# Get me set up

This is the most important session a member has. Plan on 30 to 60 minutes. Tell them that up front, and tell them why: everything they answer now is saved, and every future video uses it without asking again.

Work in the member's project folder (create it first with the video-production skill's "First use" steps if it doesn't exist). Ask one small group of questions at a time, in plain language. Never use placeholders. If they skip a question, write down "not set" and move on; they can come back to it.

Before you ask anything, read `brand-profile.md` if it exists. If it does, show what is saved and ask what they want to change. Do not repeat the interview.

## 1. The business

- What's your company or brand name, exactly as you want it to appear on screen?
- Do you have a slogan or tagline? (Optional. It can appear on end cards.)
- In one or two sentences: who are your videos for, and what do you help them with?

## 2. Logo

- Ask them to add their logo file. Best: a PNG with a transparent background, at least 1000 pixels wide. An SVG also works.
- Local agent: ask them to copy it into `public/brand/` and tell you the file name. Cloud agent: ask for a share link (see START-HERE.md, "Getting your footage to the assistant").
- Check it opens and is not tiny. If it has a white box around it, say so and offer to keep it as-is or ask them for a transparent version. Save the path in `brand.json` as `logo` (path inside `public/`).

## 3. Brand colors

Ask for three colors as six-digit hex codes (like `#087F8C`): a main color, a darker version, and the darkest version for backgrounds. If they only have one, compute the darker two yourself and show them.

If they don't know their hex codes, offer these ways to find them, in this order:
1. **Their brand kit or designer.** Brand guides list hex codes, often as "HEX" or starting with #.
2. **Canva:** open any branded design, click a colored element, click the color swatch. The hex code shows next to the color (Brand Kit also lists them).
3. **Their website:** on a computer in Chrome, right-click a colored button and choose Inspect; the color shows as # plus six characters. Or use a free color-picker browser extension.
4. **Their logo:** if they gave you the logo, read the main colors from the file yourself (for example with Python or ffmpeg) and suggest them. Say they are suggestions from the logo.

Use only what they confirm. Write `accent`, `accentMid`, `accentDeep`.

## 4. Metallic finish

Explain: "Your videos use a metallic trim on frames, lines and check marks. Which feels like you?"
Options for `metalFinish` in brand.json: `copper`, `rose-gold`, `gold`, `silver`, or `custom` (then ask for two hex codes: the metal and its bright highlight, saved as `metal` and `metalLight`).

## 5. Fonts

Offer the bundled pairs, and show them on the preview in step 7:
- Heading: Playfair Display (elegant serif) or DM Sans (clean modern).
- Body: DM Sans or Montserrat.
If they have a brand font, say it can be added later but needs testing; do not promise it today.

## 6. Who appears in the videos

Ask: "When you make videos, who is on screen?" Save the answer as `host.type` in brand.json:
- `face`: they film themselves (talking-head edits).
- `ai-avatar`: an AI avatar of them made in another tool (HeyGen, Jogg, Synthesia and similar). The plugin edits the avatar's video like real footage; it does not generate avatars.
- `character-2d` or `character-3d`: a cartoon or 3D character they own. Ask for transparent PNG or WebP poses (see CHARACTERS.md for the recommended pose list), all at the same size and baseline, copied into `public/characters/`. List the files in `host.art`. These replace the stick figure in explainers.
- `stick-figure`: the built-in drawn figure. Nothing to upload.
- `none`: voiceover with graphics only.
More than one is fine (for example, face for talking heads and a 2D character for explainers). Save a list.
Confirm they own the rights to any character art and music.

## 7. Caption style (show, don't describe)

Run `npm run f48 -- brand-preview` (or `npm run f48 -- brand-preview raw/<their-clip>.mp4` if they already have footage in `public/raw/`; their own face is the best preview). It saves one image with three caption styles side by side, in their colors:
- **Editorial**: words appear in elegant kinetic lockups with emphasis words in color. Polished and premium.
- **Heavy**: big bold words. High energy, social-first.
- **Pill**: classic subtitles in a rounded pill. Simple and readable.
Show them the image (open it or send it) and ask which one they want as their default. Save it as `captionStyle` in brand.json. Tell them they can still ask for a different style on any single video.

## 8. Video defaults

- Main format: portrait for Reels/TikTok/Shorts, landscape for YouTube, or both.
- Talking-head style preset (show `docs/STYLES.md` names in plain words): Signature, Quiet Authority, Spotlight, Show and Tell, Hype Reel, Raw Tape. Note a preset can change the caption style; if their saved caption style should always win, write that down.
- Explainer style: whiteboard, editorial or dark.
- Background music: none, or their own licensed tracks in `public/music/`.

## 9. Save and confirm

1. Write `brand.json` (only six-digit hex colors, supported fonts, real file paths). Run `npm run f48 -- validate content/example-talking.json` to make sure the project still loads.
2. Write `brand-profile.md` in the project root: every answer above in plain words, including audience, tagline, host choices, character files, caption style, preset, formats and anything they said they dislike. This file is the memory for every future session.
3. Run `npm run f48 -- brand-preview` one last time and show the result.
4. Read the summary back to them and ask: "Anything you want to change before we make your first video?"

End by telling them the next step: "Say 'make my first video' and share your clip or voiceover."
