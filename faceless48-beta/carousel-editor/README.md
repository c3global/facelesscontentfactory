# Faceless48 Carousel Editor

Open a 1080 × 1350 carousel on your computer. Edit headlines, wrapping, placement, rotation, sprites, icons, and layer order. The editor runs locally without an account or API key.

## Open it

From the repository root, run:

```sh
cd faceless48-beta/carousel-editor
npm ci
npm start
```

Use Node.js 20.6 or later. Open [http://127.0.0.1:4412](http://127.0.0.1:4412) if macOS does not open the browser automatically. Keep the terminal running while you edit. Use `npm start -- --no-open` to start it without opening a tab. Set `CAROUSEL_EDITOR_PORT` if 4412 is in use.

Choose a carousel and slide. Use **Content**, **Headline**, **Sprite**, or **Layers** to edit it. **Save to project** writes a new JSON version to `content/carousel-edits/`. **Download edits** downloads the plan. Drafts also stay in the current browser. The editor previews and saves plans. Use the Faceless48 production project to export videos from those plans.

## Dr. CK’s brand

- `brand.json` sets the C3 Global name, Dr. CiCi header, crimson `#C91B19`, and metallic accents `#A9574A` and `#F1B9A5`. The carousel layout uses black, charcoal `#3A3F42`, and white, with DM Sans, Playfair Display, and Caveat.
- Optional branding comes from your existing C3 brand kit. Put the logo under `public/brand/` and set `logo` in `brand.json` to its path relative to `public/`. Set the footer URL with each plan’s `link` field.
- To use your own carousels, place their JSON files in `content/carousel-plans/` and restart the editor. Each plan needs `kind: "video-carousel"`, `c3ContentGrid: true`, a unique slug, and no more than ten slides. To reopen a saved version, copy it from `content/carousel-edits/` into the plans folder.
- Put your approved PNG sprites in `public/portraits/sprites/` and icons in `public/carousel-icons/` or `public/carousel-icons/library/`. Use lowercase names with hyphens. Existing plans should keep the same asset paths they use in the production project. Restart after adding assets. The bundled sprite and icon are generic samples.

The public branch includes the starter palette, a sample carousel, and fonts with their licenses. Keep production plans, personal sprites, brand assets, and exports local.

Run `npm run typecheck` and `npm test` to check the build and save endpoint.
