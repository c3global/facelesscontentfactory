#!/usr/bin/env tsx
/**
 * Render every content/<slug>.scene.json to out/<slug>.mp4 at 1080x1920, 30 fps.
 *
 *   npm run render                 # all slugs
 *   npm run render -- 20-years     # one slug
 *
 * Env: REMOTION_BROWSER_EXECUTABLE, REMOTION_LOCAL_FONTS=1 (offline fonts), RENDER_CONCURRENCY.
 */
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {browserOptions, bundleProject, listSlugs, loadCaptions, loadPlan, root} from './lib.mjs';

const wanted = process.argv.slice(2);
const slugs = wanted.length ? wanted : listSlugs();
if (!slugs.length) {
  console.error('No scene plans found in content/*.scene.json');
  process.exit(1);
}

mkdirSync(path.join(root, 'out'), {recursive: true});
console.log('Bundling...');
const serveUrl = await bundleProject();

for (const slug of slugs) {
  const plan = loadPlan(slug);
  const captions = loadCaptions(slug);
  const inputProps = {plan, captions};
  const composition = await selectComposition({serveUrl, id: 'Video', inputProps, ...browserOptions()});
  const outputLocation = path.join(root, 'out', `${slug}.mp4`);
  console.log(`Rendering ${slug}: ${composition.width}x${composition.height} @ ${composition.fps}fps, ${composition.durationInFrames} frames`);
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
