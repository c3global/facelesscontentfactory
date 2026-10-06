#!/usr/bin/env node
/**
 * Starts a new talking-head video from a template.
 *
 *   node scripts/new-video.mjs <slug> <black-glass|fun-cuts>
 *
 * Copies content/templates/<template>.scene.json to content/<slug>.scene.json with the slug and video path set.
 * The template's graphics are examples: replace them with cutaways that fit the new script, keeping the cadence
 * (a cut at least every 4 seconds, checked by `npm run pacing -- <slug>`).
 */
import {copyFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs';

const [slug, template = 'black-glass'] = process.argv.slice(2);
if (!slug) {
  console.error('Usage: node scripts/new-video.mjs <slug> <black-glass|fun-cuts>');
  process.exit(1);
}
const from = `content/templates/${template}.scene.json`;
const to = `content/${slug}.scene.json`;
if (!existsSync(from)) throw new Error(`No template ${from}`);
if (existsSync(to)) throw new Error(`${to} already exists`);
copyFileSync(from, to);
const plan = JSON.parse(readFileSync(to, 'utf8'));
plan.slug = slug;
plan.video = `raw/${slug}.mp4`;
writeFileSync(to, JSON.stringify(plan, null, 2) + '\n');
console.log(`created ${to}\nnext: put the conformed video at public/raw/${slug}.mp4, transcribe, then edit the plan (see CLAUDE.md, steps 3 to 8)`);
