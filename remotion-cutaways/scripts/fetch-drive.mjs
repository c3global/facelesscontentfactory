#!/usr/bin/env node
/**
 * Downloads a Google Drive file that is shared as "anyone with the link".
 *
 *   node scripts/fetch-drive.mjs <fileId> <outPath>
 *
 * Needs drive.usercontent.google.com in the environment's allowed domains.
 */
import {spawnSync} from 'node:child_process';
import {statSync} from 'node:fs';

const [id, out] = process.argv.slice(2);
if (!id || !out) {
  console.error('Usage: node scripts/fetch-drive.mjs <fileId> <outPath>');
  process.exit(1);
}
const r = spawnSync('curl', ['-sS', '-m', '600', '-L', '-o', out, '-w', '%{http_code}', `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`], {encoding: 'utf8'});
const size = statSync(out).size;
if (r.stdout.trim() !== '200' || size < 10_000) throw new Error(`download failed (${r.stdout}, ${size} bytes). Is the file shared by link?`);
console.log(`saved ${out} (${(size / 1e6).toFixed(1)} MB)`);
