---
name: redact
description: "Blur private details (emails, links, keys, file paths, names, account pictures, folder windows) in a screen recording before editing it. Use when the member says 'blur my private info', 'hide the sensitive stuff', 'redact my recording', or shares a screen recording that shows an inbox, a share link, a key, a file path or a personal account."
---

# Blur private details

Full details: `docs/REDACT.md`. The tool blurs only the boxes you give it, for only the seconds you give it. It cannot see what is private, so the job is yours and the member's: look at the whole recording first.

1. **Find the clip.** It must be inside the project, for example `public/raw/`. The original is never changed.
2. **Look before you blur.** Make stills across the clip (every 10 to 20 seconds, and at every screen change) with `npm run f48 -- redact frame <clip> <second>`. It writes a still with a 100 pixel grid to `content/redact/`. Read the grid numbers to get each box's x, y, width and height.
3. **List what to hide**, in plain words, to the member before blurring: private emails and names, share and Drive links, API keys and passwords, file paths that show a real name or client, account pictures, bookmarks, and Finder or Explorer windows. Ask about anything you are unsure of. If the member wants a column or part of a window left visible, leave it out of the box.
4. **Write the spec** to `content/redact/<name>.json`: the clip, then one box per private area with its `from` and `to` seconds. Things move and scroll, so use a separate box for each stretch of time and add about half a second on each side.
5. **Check, then apply.** `npm run f48 -- redact check <spec>`, fix any warning, then `npm run f48 -- redact apply <spec>`. It writes `<clip>-redacted.mp4` and one still per box.
6. **Look at the stills and the new clip.** Confirm the details are unreadable and nothing needed was hidden. Spot-check the start and end of every time window, because a box that ends half a second early shows the detail for a moment. Fix and apply again under a new output name if needed.
7. **Edit from the redacted clip**, not the original. Tell the member the original still holds the private details and should not be shared.

Never promise that nothing private is left. Say what you blurred, and ask the member to watch the final video once before posting.
