#!/usr/bin/env tsx
/**
 * Stick-figure explainers (one plan, two formats).
 *
 *   npx tsx scripts/render-stick.mjs stills <slug> <portrait|landscape> <sec> [<sec> ...]
 *   npx tsx scripts/render-stick.mjs render <slug> <portrait|landscape|both>
 *
 * Reads content/<slug>.stick.json and content/<slug>.captions.json. Stills go to out/stills/<slug>-<format>/,
 * videos to out/<slug>-<format>.mp4. Render one frame at a time (RENDER_CONCURRENCY=1) if frames flash.
 */
import {mkdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {browserOptions, bundleProject, loadCaptions, root} from './lib.mjs';

const [mode, slug, which, ...secs] = process.argv.slice(2);
if (!mode || !slug || !which) {
  console.error('Usage: render-stick.mjs stills|render <slug> <portrait|landscape|both> [secs...]');
  process.exit(1);
}
const plan = JSON.parse(readFileSync(path.join(root, 'content', `${slug}.stick.json`), 'utf8'));
const captions = loadCaptions(slug);
const formats = which === 'both' ? ['portrait', 'landscape'] : [which];
const serveUrl = await bundleProject();

for (const format of formats) {
  const inputProps = {format, plan, captions};
  const composition = await selectComposition({serveUrl, id: `Stick-${format}`, inputProps, ...browserOptions()});
  if (mode === 'stills') {
    const dir = path.join(root, 'out', 'stills', `${slug}-${format}`);
    mkdirSync(dir, {recursive: true});
    for (const s of secs) {
      const frame = Math.round(parseFloat(s) * 30);
      await renderStill({composition, serveUrl, inputProps, frame, output: path.join(dir, `${String(frame).padStart(4, '0')}.png`), ...browserOptions()});
      console.log('still', format, s);
    }
  } else {
    mkdirSync(path.join(root, 'out'), {recursive: true});
    const outputLocation = path.join(root, 'out', `${slug}-${format}.mp4`);
    console.log(`Rendering ${slug} ${format}: ${composition.width}x${composition.height}, ${composition.durationInFrames} frames`);
    let last = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      crf: 18,
      outputLocation,
      inputProps,
      concurrency: process.env.RENDER_CONCURRENCY ? Number(process.env.RENDER_CONCURRENCY) : undefined,
      onProgress: ({progress}) => {
        const pct = Math.floor(progress * 10) * 10;
        if (pct !== last) {
          last = pct;
          process.stdout.write(`  ${pct}%\r`);
        }
      },
      ...browserOptions(),
    });
    console.log(`  wrote ${path.relative(root, outputLocation)}`);
  }
}
