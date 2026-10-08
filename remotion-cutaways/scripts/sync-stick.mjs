#!/usr/bin/env node
/**
 * Downloads Dr. CiCi's stick-figure sprites listed in content/stick-assets.json into public/stick (git-ignored).
 *
 *   node scripts/sync-stick.mjs
 *
 * The Drive folder must be shared by link. Files already present are skipped.
 */
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const lib = JSON.parse(readFileSync('content/stick-assets.json', 'utf8'));
mkdirSync('public/stick/composed', {recursive: true});
for (const f of lib.files) {
  const out = `public/stick/${f.file}`;
  if (existsSync(out)) continue;
  const r = spawnSync('node', ['scripts/fetch-drive.mjs', f.driveId, out], {stdio: 'inherit'});
  if (r.status !== 0) throw new Error(`could not fetch ${f.file}`);
}
console.log('stick assets ready');
