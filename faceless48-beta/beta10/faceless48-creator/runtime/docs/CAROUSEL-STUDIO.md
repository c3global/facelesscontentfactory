# Carousel Studio

Carousel Studio is a visual editor for video carousels. It opens in the member's browser and runs on their own computer, with no account or API key needed. The member drags, rotates and layers the pieces of each slide while you handle the plans and the final render.

Member says: **"Open Carousel Studio"**, **"let me edit my carousel"**, or **"I want to move things around on my carousel."**

## Open it

1. In the project folder, run `npm run carousel-studio`. The browser opens at http://127.0.0.1:4412. If it does not open, give the member that link. Keep the command running while they edit. If port 4412 is busy, set `CAROUSEL_STUDIO_PORT` to another number.
2. The studio lists every video carousel plan in `content/`, `content/carousels/`, `content/templates/` and `content/carousel-edits/`. Any file it skips is named in the terminal with the reason.
3. When the member adds icons or characters, stop the command and run it again so the studio can see them.

## What the member can do

- **Content Grid carousels** (`"contentGrid": true`, the starter is `content/templates/carousel-grid.json`):
  - Move, rotate and resize the whole content group or any single item.
  - Edit the headline, its wrap width, position and rotation.
  - Add an icon, place a character, and change the layer order (front to back).
- **Every other template**: edit the headlines. A **Switch to Content Grid** button gives that carousel the Content Grid look so everything becomes movable. **Back to the template look** undoes the switch.
- Undo and redo, with drafts kept in the browser while they work.
- **Save to project** writes a new version to `content/carousel-edits/<slug>-edit-<date>-<id>.json` and never overwrites the original. **Download edits** saves a copy anywhere.

## Icons and characters

- **Icons:** 16 starter icons in the member's brand accent are made in `public/carousel-icons/starter/` each time the studio opens. The member's own icons go in `public/carousel-icons/` (quick picks) or `public/carousel-icons/library/` (searchable library). Use PNG, WebP, JPG or SVG with lowercase names and hyphens, like `my-logo-mark.svg`.
- **Characters:** transparent PNG poses go in `public/characters/` (`sample-waving.png` is the generic sample). Files named `face-...png` are listed as expressions. Photo cutouts from `npm run cutout -- <photo>` (in `public/cutouts/`) are listed too. Use only artwork and photos the member owns or has the rights to.

## After they save

1. Run `npm run f48 -- storyboard content/carousel-edits/<file>.json` and show the sheet.
2. After approval, render it the usual way (`carousel-slides` for a carousel post, `render` for one video). See `docs/VIDEO-CAROUSELS.md`.

## Older plans

Plans made for the first carousel editor used `c3ContentGrid` and `c3Dotted` and stored characters in `portraits/sprites/`. These still open and render. New plans use `contentGrid`, `dotted` and `characters/`.
