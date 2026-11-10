#!/usr/bin/env tsx
/**
 * Caption style review stills: the same moments rendered in each kinetic caption style.
 *   npm run captions:test -- 20-years
 */
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {browserOptions, bundleProject, loadCaptions, loadPlan, root} from './lib.mjs';

const slug = process.argv[2] ?? '20-years';
const plan = loadPlan(slug);
const captions = loadCaptions(slug);
const outDir = path.join(root, 'out', 'captions');
mkdirSync(outDir, {recursive: true});
const serveUrl = await bundleProject();

// seconds into the video: hook, hook, split, hub, hub, inbox, rewrite, end card
const MOMENTS = [1.55, 2.85, 7.7, 12.6, 15.7, 21.4, 27.2, 33.9];
for (const style of ['editorial', 'heavy']) {
  const inputProps = {plan: {...plan, captionStyle: style}, captions};
  const composition = await selectComposition({serveUrl, id: 'Video', inputProps, ...browserOptions()});
  for (const sec of MOMENTS) {
    const frame = Math.round(sec * 30);
    await renderStill({composition, serveUrl, inputProps, frame, output: path.join(outDir, `${style}-${String(frame).padStart(4, '0')}.png`), ...browserOptions()});
    console.log('still', style, frame);
  }
}
