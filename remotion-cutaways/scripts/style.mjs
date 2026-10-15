#!/usr/bin/env tsx
/**
 * Style presets and mix-and-match dials.
 *   npm run style -- list                                   presets and every dial value
 *   npm run style -- set dialects --style spotlight          pick a preset for a video
 *   npm run style -- set dialects captions=heavy outline=copper     freestyle: set single dials (keeps any preset already set)
 *   npm run style -- set dialects --clear                    remove the preset and mixes (back to the plan as written)
 *   npm run style -- show dialects                           what the plan resolves to
 * Writes only the "style" and "mix" keys of content/<slug>.scene.json.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {DIALS, DIAL_NAMES, PRESETS, applyStyle} from '../src/styles.ts';

const [cmd, slug, ...rest] = process.argv.slice(2);
if (cmd === 'list' || !cmd) {
  console.log('PRESETS');
  for (const [k, p] of Object.entries(PRESETS)) console.log(`  ${k.padEnd(16)} ${p.summary}\n  ${' '.repeat(16)} dials: ${Object.entries(p.mix).map(([d, v]) => `${d}=${v}`).join(', ')}`);
  console.log('\nDIALS (mix any of these, with or without a preset: freestyle)');
  for (const d of DIAL_NAMES) {
    console.log(`  ${d}`);
    for (const [v, info] of Object.entries(DIALS[d])) console.log(`    ${v.padEnd(14)} ${info.note}`);
  }
  process.exit(0);
}
const file = path.join(process.cwd(), 'content', `${slug}.scene.json`);
const plan = JSON.parse(readFileSync(file, 'utf8'));
if (cmd === 'show') {
  const out = applyStyle(plan);
  const {scenes, fx, ...top} = out;
  console.log(JSON.stringify({style: plan.style ?? '(none)', mix: plan.mix ?? {}, resolved: top}, null, 2));
  process.exit(0);
}
if (cmd === 'set') {
  if (rest.includes('--clear')) {
    delete plan.style;
    delete plan.mix;
  }
  const si = rest.indexOf('--style');
  if (si >= 0) {
    const name = rest[si + 1];
    if (!PRESETS[name]) throw new Error(`Unknown style "${name}". Run: npm run style -- list`);
    plan.style = name;
  }
  for (const a of rest.filter((x) => x.includes('=') && !x.startsWith('--'))) {
    const [d, v] = a.split('=');
    if (!DIALS[d]?.[v]) throw new Error(`Unknown dial value "${a}". Run: npm run style -- list`);
    plan.mix = {...(plan.mix ?? {}), [d]: v};
  }
  writeFileSync(file, JSON.stringify(plan, null, 2) + '\n');
  console.log(`style: ${plan.style ?? '(none)'}  mix: ${JSON.stringify(plan.mix ?? {})}`);
  process.exit(0);
}
console.error('Usage: npm run style -- list | show <slug> | set <slug> [--style name] [dial=value ...] [--clear]');
process.exit(1);
