#!/usr/bin/env tsx
/**
 * Review stills at chosen moments, for a contact sheet.
 *   npm run stills -- four-places 1.9 12.1 17.4 ...        (seconds into the video)
 */
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {browserOptions, bundleProject, loadCaptions, loadPlan, root} from './lib.mjs';

const [slug, ...secs] = process.argv.slice(2);
if (!slug || !secs.length) {
  console.error('Usage: npm run stills -- <slug> <sec> [<sec> ...]');
  process.exit(1);
}
const plan = loadPlan(slug);
const captions = loadCaptions(slug);
const outDir = path.join(root, 'out', 'stills', slug);
mkdirSync(outDir, {recursive: true});
const serveUrl = await bundleProject();
const inputProps = {plan, captions};
const composition = await selectComposition({serveUrl, id: 'Video', inputProps, ...browserOptions()});
for (const s of secs) {
  const frame = Math.round(parseFloat(s) * 30);
  await renderStill({composition, serveUrl, inputProps, frame, output: path.join(outDir, `${String(frame).padStart(4, '0')}.png`), ...browserOptions()});
  console.log('still', s, frame);
}
