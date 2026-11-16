# Architecture

- `scripts/carousel-editor.mjs` reads local plans and asset names, bundles the editor with esbuild, and serves the preview and save endpoint over loopback.
- `src/carousel-editor/` contains the React controls, browser drafts, and undo and redo. `src/VideoCarousel.tsx` renders the preview, and `src/carousel-layers.ts` handles order and headline parts.
- `brand.json` and `public/` provide the styling and assets. `content/examples/` contains the starter plan. Local source plans and saved edits live in separate ignored folders under `content/`.
