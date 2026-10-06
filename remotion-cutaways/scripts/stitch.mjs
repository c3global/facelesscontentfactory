#!/usr/bin/env node
/**
 * Joins two takes into one source video and merges their word lists.
 *
 *   node scripts/stitch.mjs <slug> <slugA> <endA> <slugB> <startB>
 *
 * Takes public/raw/<slugA>.mp4 up to <endA> seconds, then public/raw/<slugB>.mp4 from <startB> seconds.
 * Audio: part B is level-matched to part A and joined with a 60 ms crossfade. Video is a hard cut, so hide the
 * seam with a cutaway in the scene plan. Writes public/raw/<slug>.mp4 and content/<slug>.words.tsv (then run
 * words-to-captions).
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const [slug, a, endA, b, startB] = process.argv.slice(2);
const eA = parseFloat(endA);
const sB = parseFloat(startB);
const lufs = (f) => {
  const r = spawnSync('ffmpeg', ['-i', f, '-af', 'loudnorm=I=-14:print_format=summary', '-vn', '-f', 'null', '-'], {encoding: 'utf8'});
  return parseFloat(/Input Integrated:\s+(-?[0-9.]+)/.exec(r.stderr)?.[1] ?? '-23');
};
const gain = lufs(`public/raw/${a}.mp4`) - lufs(`public/raw/${b}.mp4`); // dB to add to B
const fc =
  `[0:v]trim=0:${eA},setpts=PTS-STARTPTS[v0];[1:v]trim=start=${sB},setpts=PTS-STARTPTS[v1];[v0][v1]concat=n=2:v=1:a=0[v];` +
  `[0:a]atrim=0:${eA},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[a0];` +
  `[1:a]atrim=start=${sB},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume=${gain.toFixed(2)}dB[a1];` +
  `[a0][a1]acrossfade=d=0.06:c1=tri:c2=tri[a]`;
const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `public/raw/${a}.mp4`, '-i', `public/raw/${b}.mp4`, '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', `public/raw/${slug}.mp4`], {stdio: 'inherit'});
if (r.status !== 0) throw new Error('ffmpeg failed');

const rows = (s) => readFileSync(`content/${s}.words.tsv`, 'utf8').trim().split('\n').map((l) => l.split('\t'));
const A = rows(a).filter((w) => parseFloat(w[1]) < eA - 0.02);
const lenA = eA - 0.03; // the crossfade eats 60 ms of overlap
const B = rows(b)
  .filter((w) => parseFloat(w[1]) >= sB - 0.02)
  .map((w) => [w[0], (parseFloat(w[1]) - sB + lenA).toFixed(3), (parseFloat(w[2]) - sB + lenA).toFixed(3)]);
writeFileSync(`content/${slug}.words.tsv`, [...A, ...B].map((w) => w.join('\t')).join('\n') + '\n');
console.log(`B level adjusted by ${gain.toFixed(2)} dB; ${A.length + B.length} words; join at ${lenA.toFixed(2)} s`);
