#!/usr/bin/env tsx
/**
 * Layout check for stick explainers: finds moments where a caption touches the art.
 *
 *   npx tsx scripts/check-stick.mjs <slug> <portrait|landscape> [stepSec=0.8]
 *
 * For each sample time it renders two stills, one with only the captions and one with only the art
 * (stage and Dr. CiCi), then python3 scripts/overlap_report.py dilates the captions by a clearance margin
 * and counts shared pixels. Frames over the threshold are listed (and kept in out/check/).
 */
import {mkdirSync, readFileSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {browserOptions, bundleProject, loadCaptions, root} from './lib.mjs';

const [slug, format, stepArg] = process.argv.slice(2);
if (!slug || !format) {
  console.error('Usage: check-stick.mjs <slug> <portrait|landscape> [stepSec]');
  process.exit(1);
}
const step = Number(stepArg ?? 0.8);
const plan = JSON.parse(readFileSync(path.join(root, 'content', `${slug}.stick.json`), 'utf8'));
const captions = loadCaptions(slug);
const dir = path.join(root, 'out', 'check', `${slug}-${format}`);
rmSync(dir, {recursive: true, force: true});
mkdirSync(dir, {recursive: true});
const serveUrl = await bundleProject();
const times = [];
for (let t = 0.5; t < plan.captionsEnd; t += step) times.push(Number(t.toFixed(2)));
for (const debug of ['captions', 'art']) {
  const inputProps = {format, plan, captions, debug};
  const composition = await selectComposition({serveUrl, id: `Stick-${format}`, inputProps, ...browserOptions()});
  for (const t of times) {
    await renderStill({composition, serveUrl, inputProps, frame: Math.round(t * 30), output: path.join(dir, `${t.toFixed(2)}-${debug === 'captions' ? 'cap' : 'art'}.png`), ...browserOptions()});
  }
  console.log(`rendered ${times.length} ${debug} stills`);
}
const r = spawnSync('python3', ['-I', path.join(root, 'scripts', 'overlap_report.py'), dir], {stdio: 'inherit'});
process.exit(r.status ?? 0);
