# Your first Faceless48 video

This private beta is for a computer with Claude Code or Codex and local file access.

1. Unzip the package into a folder outside cloud sync.
2. Open that folder in your coding assistant.
3. Paste this:

> Read skills/video-production/SKILL.md and skills/brand-setup/SKILL.md. Get me set up: create a new project folder, check my computer's requirements, then walk me through my brand setup. Explain any missing software in plain language. Do not overwrite existing files.

Set aside 30 to 60 minutes for this first session. The assistant asks about your name, logo, colors, metallic finish, fonts, who appears in your videos (you, an AI avatar, a 2D or 3D character, or the stick figure) and your caption style, and shows you previews. Everything is saved, so you only do this once.

## Getting your footage to the assistant

Chat attachments have size limits, and most talking-head clips are bigger than that. Use one of these instead.

**Best: put the file inside your project folder.** If your assistant runs on your own computer (Claude Code desktop or terminal, or Codex on your computer), copy the video into your project's `public/raw/` folder and tell the assistant the file name. Nothing has to be uploaded.

**If your assistant runs in the cloud** (Claude Code on the web, a Codex cloud task, or a session started from your phone), it cannot see your computer's files. Host the video in a cloud folder:

1. Upload the video to Google Drive, Dropbox or OneDrive.
2. Set sharing to "Anyone with the link can view."
3. Paste the link into the chat and say: "Download this video into my project and edit it."
4. After the edit is done, set sharing back to Restricted.

If the assistant has a Google Drive connector, it can find the file by name, but it can usually download large videos only when they are shared by link.

Cloud sessions also need permission to reach the file host. If the download is blocked, add these to the environment's allowed network domains: `drive.google.com` and `drive.usercontent.google.com` (Google Drive), `dropbox.com` and `dl.dropboxusercontent.com` (Dropbox). Voice transcription downloads its model once from `huggingface.co`, so allow that too.

Keep clips under about 2 minutes for the first tests. A 30 to 60 second clip is ideal.

After setup, choose one:

> Edit my supplied talking-head video. Use my brand colors, meaningful full-screen cutaways and readable captions. Show me a preview before the full export.

> Turn my voiceover into an animated explainer. Choose layouts that teach the ideas, use the neutral character for now, and match the visuals to the spoken words. Handle the plan file for me.

You provide your footage or voiceover. The assistant handles the project and plan. Use your own licensed character art/music if desired. See README.md for optional native plugin loading. This beta has local rendering proofs, but setup on other machines is still being tested.

For feedback, record the assistant/version, operating system, what you asked, and the exact error or problem. Never include passwords or API keys.
