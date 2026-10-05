#!/usr/bin/env tsx
/**
 * Finish-pass review stills: three fields x three moments (hub, inbox, rewrite), one white scene,
 * full-resolution close-ups, and per-field backdrop clips. Writes into out/finish/.
 *
 *   npm run finish -- 20-years
 */
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {browserOptions, bundleProject, loadCaptions, loadPlan, root} from './lib.mjs';

const slug = process.argv[2] ?? '20-years';
const plan = loadPlan(slug);
const captions = loadCaptions(slug);
const outDir = path.join(root, 'out', 'finish');
mkdirSync(outDir, {recursive: true});
const serveUrl = await bundleProject();
const log = [];

const withField = (field) => ({...plan, theme: {...plan.theme, field}});

const still = async (name, props, frame, scale = 1) => {
  const inputProps = {plan: props, captions};
  const composition = await selectComposition({serveUrl, id: 'Video', inputProps, ...browserOptions()});
  const t0 = Date.now();
  await renderStill({composition, serveUrl, inputProps, frame, scale, output: path.join(outDir, `${name}.png`), ...browserOptions()});
  const ms = Date.now() - t0;
  log.push({name, ms});
  console.log(`still ${name}: ${(ms / 1000).toFixed(1)}s`);
};

// the same three moments for every field: hub (15.4s), inbox (22.6s), rewrite (26.3s)
const MOMENTS = {hub: 462, inbox: 678, rewrite: 790};
for (const field of ['crimson', 'charcoal', 'rosegold']) {
  for (const [name, frame] of Object.entries(MOMENTS)) await still(`${field}-${name}`, withField(field), frame);
}
// one white scene with the animated backdrop (split layout, glass window)
await still('white-scene', withField('crimson'), 198);
await still('white-scene-b', withField('crimson'), 150);
await still('white-scene-c', withField('crimson'), 232);
// full-resolution close-ups, rendered at 2x so the glass detail is visible
await still('closeup-window@2x', withField('crimson'), 198, 2);
await still('closeup-card@2x', withField('crimson'), 790, 2);

// 3-second backdrop clips with the metal shimmer running (composition FieldDemo)
for (const field of ['crimson', 'charcoal', 'rosegold']) {
  const inputProps = {field};
  const composition = await selectComposition({serveUrl, id: 'FieldDemo', inputProps, ...browserOptions()});
  const t0 = Date.now();
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    crf: 20,
    outputLocation: path.join(outDir, `backdrop-${field}.mp4`),
    inputProps,
    ...browserOptions(),
  });
  const ms = Date.now() - t0;
  log.push({name: `backdrop-${field}`, ms, frames: composition.durationInFrames});
  console.log(`clip backdrop-${field}: ${(ms / 1000).toFixed(1)}s for ${composition.durationInFrames / composition.fps}s of video`);
}

// real-composition timing with glass on: 3 seconds of the 20-years video (inbox scene) per field
for (const field of ['crimson', 'charcoal', 'rosegold']) {
  const props = withField(field);
  const inputProps = {plan: props, captions};
  const composition = await selectComposition({serveUrl, id: 'Video', inputProps, ...browserOptions()});
  const t0 = Date.now();
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    crf: 18,
    outputLocation: path.join(outDir, `timing-${field}.mp4`),
    inputProps,
    frameRange: [660, 749],
    ...browserOptions(),
  });
  const ms = Date.now() - t0;
  log.push({name: `timing-${field}`, ms, seconds: 3});
  console.log(`timing ${field}: ${(ms / 1000).toFixed(1)}s render for 3s of video (${(ms / 3000).toFixed(1)}s per video second)`);
}
console.log(JSON.stringify(log, null, 2));
