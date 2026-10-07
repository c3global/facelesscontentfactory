// Pre-attenuates a music bed so Remotion's 0..1 volume curve works at fine resolution.
// Remotion rounds every volume to 1/97 steps, so a bed played at 0.02 has about two levels and its ducking and
// fade-out turn into steps. With the file already at bed level, the curve runs 0..1 and the steps are inaudible.
//   node scripts/prep-bed.mjs public/music/<track>.mp3 <volume>      -> public/music/<track>.bed.mp3
import {execFileSync} from 'node:child_process';
const [src, vol] = process.argv.slice(2);
if (!src || !(Number(vol) > 0)) throw new Error('usage: prep-bed.mjs <track.mp3> <volume>');
const out = src.replace(/\.mp3$/, '.bed.mp3');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', `volume=${vol}`, '-c:a', 'libmp3lame', '-b:a', '192k', out]);
console.log('wrote', out);
