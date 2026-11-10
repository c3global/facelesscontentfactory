#!/usr/bin/env node
/**
 * Person matte for the behind-her effects (type wall, spotlight, orbit, clones, UI world, green screen, frame break, sticker).
 *
 *   npm run matte -- dialects            # reads public/raw/dialects.mp4
 *
 * Writes public/matte/<slug>.webm (her cutout, transparent VP9 at full size) and public/matte/<slug>.anchors.json
 * (per-frame head, chest and shoulder positions used by sticky text, callouts and labels). Both are git-ignored.
 * Needs: python3 with `pip install mediapipe opencv-python-headless`, and on a bare Linux box `apt-get install libegl1 libgles2`.
 * Then set "matte": "<slug>" in the scene plan.
 */
import {execFileSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, mkdtempSync, renameSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run matte -- <slug>');
  process.exit(1);
}
const root = process.cwd();
const src = path.join(root, 'public', 'raw', `${slug}.mp4`);
if (!existsSync(src)) {
  console.error(`Missing ${src}`);
  process.exit(1);
}
const tmp = mkdtempSync(path.join(os.tmpdir(), 'matte-'));
console.log('1/2 segmenting her in every frame...');
execFileSync('python3', [path.join(root, 'scripts', 'matte.py'), src, tmp], {stdio: 'inherit'});
mkdirSync(path.join(root, 'public', 'matte'), {recursive: true});
const outWebm = path.join(root, 'public', 'matte', `${slug}.tmp.webm`);
console.log('2/2 encoding the transparent cutout...');
execFileSync(
  'ffmpeg',
  ['-v', 'error', '-y', '-i', src, '-i', path.join(tmp, 'alpha.mp4'), '-filter_complex', '[1:v]scale=1080:1920:flags=bicubic,format=gray[a];[0:v]scale=1080:1920,format=yuv420p[v];[v][a]alphamerge', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '5M', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-auto-alt-ref', '0', '-an', outWebm],
  {stdio: 'inherit'},
);
renameSync(outWebm, path.join(root, 'public', 'matte', `${slug}.webm`));
copyFileSync(path.join(tmp, 'anchors.json'), path.join(root, 'public', 'matte', `${slug}.anchors.json`));
console.log(`wrote public/matte/${slug}.webm and ${slug}.anchors.json`);
