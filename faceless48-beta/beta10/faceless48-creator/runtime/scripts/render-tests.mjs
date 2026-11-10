#!/usr/bin/env tsx
/**
 * Review stills for a slug:
 *   - field options (crimson / charcoal / rosegold) for the hub and statement scenes
 *   - font comparison (DM Sans vs Montserrat)
 *
 *   npm run tests -- 20-years
 */
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {browserOptions, bundleProject, loadCaptions, loadPlan, root} from './lib.mjs';

const slug = process.argv[2] ?? '20-years';
const plan = loadPlan(slug);
const captions = loadCaptions(slug);
const outDir = path.join(root, 'out', 'tests');
mkdirSync(outDir, {recursive: true});
const serveUrl = await bundleProject();

const still = async (name, props, frame) => {
  const inputProps = {plan: props, captions};
  const composition = await selectComposition({serveUrl, id: 'Video', inputProps, ...browserOptions()});
  await renderStill({composition, serveUrl, inputProps, frame, output: path.join(outDir, `${name}.png`), ...browserOptions()});
  console.log('wrote', `out/tests/${name}.png`);
};

const withTheme = (theme) => ({...plan, theme: {...plan.theme, ...theme}});
// frame 462 is scene 3 (hub diagram); frame 780 is scene 5 (rewrite card). Both at 30 fps.
for (const field of ['crimson', 'charcoal', 'rosegold']) {
  await still(`field-${field}-scene3`, withTheme({field}), 462);
  await still(`field-${field}-scene5`, withTheme({field}), 780);
}
for (const sans of ['DM Sans', 'Montserrat']) {
  const key = sans.replace(' ', '').toLowerCase();
  await still(`font-${key}-hook`, withTheme({sans}), 70);
  await still(`font-${key}-split`, withTheme({sans}), 198);
}
