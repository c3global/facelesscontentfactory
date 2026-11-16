---
name: effect-map
description: "Use when a member wants to see the talking-head templates and effects, pick effects for a template, or asks for the effect map, effect list with pictures, or 'show me the effects'."
---

# Template Effect Map

`assets/template-effect-map.html` is a picture guide to the 8 talking-head templates and the full effect library: each template's look (backdrop, quote card, frame, example cards), its default effect kit grouped by job, and a preview of every effect. It needs no internet except for its two web fonts.

1. Open it for the member: serve the `assets/` folder on localhost (for example `npx serve skills/effect-map/assets` or `python3 -m http.server` inside that folder) and open `template-effect-map.html` in their browser. Opening the file directly also works in most browsers.
2. They can click a template, remove effects from its kit with ×, and add any effect from the library with "Add effects from the library". Their changes are saved in that browser.
3. "Copy my kits for my agent" copies their kits as text. When they paste it to you, use those effects for that template (and only real numbers, their own words and their own media in any effect). Read runtime/docs/TEMPLATES.md for how each template is built.

The previews show Faceless48's demo colors; the member's videos use their own brand.json colors.
