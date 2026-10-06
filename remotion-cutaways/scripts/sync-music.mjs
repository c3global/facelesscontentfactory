#!/usr/bin/env node
/**
 * Downloads the tracks listed in content/music-library.json into public/music as mp3 (git-ignored).
 *
 *   node scripts/sync-music.mjs
 *
 * The Drive folder must be shared by link. Tracks already present are skipped.
 */
import {existsSync, mkdirSync, readFileSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const lib = JSON.parse(readFileSync('content/music-library.json', 'utf8'));
mkdirSync('public/music', {recursive: true});
mkdirSync('work', {recursive: true});
for (const t of lib.tracks) {
  const out = `public/music/${t.file}`;
  if (existsSync(out)) continue;
  const raw = `work/${t.file}.wav`;
  let r = spawnSync('node', ['scripts/fetch-drive.mjs', t.driveId, raw], {stdio: 'inherit'});
  if (r.status !== 0) throw new Error(`could not fetch ${t.file}`);
  r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-b:a', '192k', out], {stdio: 'inherit'});
  rmSync(raw, {force: true});
  console.log(`ready ${out}`);
}
console.log('music library ready');
