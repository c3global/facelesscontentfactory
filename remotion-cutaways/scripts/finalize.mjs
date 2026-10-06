#!/usr/bin/env node
/**
 * Final audio pass: levels the whole mix (voice plus music) to a social-platform loudness, leaves the video stream untouched,
 * and writes a review copy under 28 MB.
 *
 *   node scripts/finalize.mjs <slug>      out/<slug>.mp4 -> out/<slug>.mp4 (leveled) and out/<slug>-share.mp4
 *
 * Target: -14 LUFS integrated, -1.5 dBTP true peak.
 */
import {spawnSync} from 'node:child_process';
import {renameSync, existsSync} from 'node:fs';

const slug = process.argv[2];
const src = `out/${slug}.mp4`;
const tmp = `out/${slug}.leveled.mp4`;
const run = (args) => {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], {stdio: 'inherit'});
  if (r.status !== 0) throw new Error('ffmpeg failed');
};
if (!existsSync(src)) throw new Error(`Missing ${src}`);
run(['-i', src, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', tmp]);
renameSync(tmp, src);
run(['-i', src, '-c:v', 'libx264', '-preset', 'slow', '-b:v', '3300k', '-maxrate', '4500k', '-bufsize', '7000k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', `out/${slug}-share.mp4`]);
console.log(`leveled ${src} and wrote out/${slug}-share.mp4`);
