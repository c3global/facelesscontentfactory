#!/usr/bin/env node
/**
 * Levels every track in public/music to the same loudness so one volume setting means the same thing for every track.
 *
 *   node scripts/level-music.mjs            # all tracks
 *   node scripts/level-music.mjs name.mp3   # one track
 *
 * Each track gets a gentle compressor (so loud drums and swells do not poke out from under her voice) and is set to
 * -24 LUFS integrated, written to public/music/leveled/. Her voice sits near -23 LUFS, so in a plan:
 *   volume 0.35 (rest, about 10 dB under the voice) and duckTo 0.16 (while she speaks, about 17 dB under the voice).
 */
import {spawnSync} from 'node:child_process';
import {mkdirSync, readdirSync} from 'node:fs';

const TARGET = -24;
const dir = 'public/music';
const out = `${dir}/leveled`;
mkdirSync(out, {recursive: true});
const only = process.argv[2];
const tracks = readdirSync(dir).filter((f) => f.endsWith('.mp3') && (!only || f === only));
const COMP = 'acompressor=threshold=0.063:ratio=3:attack=15:release=300';
const lufs = (file, af) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', `${af},ebur128=peak=true`, '-f', 'null', '-'], {encoding: 'utf8'});
  const m = /I:\s+(-?[0-9.]+) LUFS/g;
  let last;
  for (let x; (x = m.exec(r.stderr)); ) last = x[1];
  return parseFloat(last);
};
for (const f of tracks) {
  const src = `${dir}/${f}`;
  const measured = lufs(src, COMP);
  const gain = TARGET - measured;
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', `${COMP},volume=${gain.toFixed(2)}dB,alimiter=limit=0.7:level=disabled`, '-c:a', 'libmp3lame', '-b:a', '192k', `${out}/${f}`]);
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${f}`);
  console.log(`${f}: ${measured.toFixed(1)} LUFS after compressor, gain ${gain.toFixed(1)} dB -> ${TARGET} LUFS`);
}
