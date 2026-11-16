import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync, rmSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';

// Two parts, each tone-silence-tone. Clean cut drops a stumble and shortens the long silences to a breath.
const dir = path.join('work', 'cleancut-test');
const ff = (args: string[]) => {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], {encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
};
const dur = (f: string) => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], {encoding: 'utf8'}).stdout);
const py = existsSync(path.join('.venv', 'bin', 'python3')) ? path.join('.venv', 'bin', 'python3') : process.platform === 'win32' ? 'python' : 'python3';

test('clean-cut joins parts, drops a stumble and shortens pauses', () => {
  rmSync(dir, {recursive: true, force: true});
  mkdirSync(dir, {recursive: true});
  for (const n of ['a', 'b']) {
    // 1 s tone, 1.2 s silence, 1 s tone
    ff(['-f', 'lavfi', '-i', 'color=c=gray:s=360x640:r=30:d=3.2', '-f', 'lavfi', '-i', "aevalsrc='if(between(t,1,2.2),0,0.5*sin(2*PI*440*t))':s=48000:d=3.2",
      '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', path.join(dir, `${n}.mp4`)]);
  }
  const spec = {slug: 'cleancut-test', parts: [{src: `${dir}/a.mp4`}, {src: `${dir}/b.mp4`, drop: [[0, 1.0]]}], tail: 0.5};
  writeFileSync(path.join(dir, 'spec.json'), JSON.stringify(spec));
  const r = spawnSync(py, ['scripts/clean-cut.py', path.join(dir, 'spec.json')], {encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  const out = path.join('public', 'raw', 'cleancut-test.mp4');
  const d = dur(out);
  // part a: 1 + breath + 1, part b: stumble dropped, 1 s left, plus a 0.5 s tail; about 3.7 s instead of 6.4 s
  assert(d > 3.2 && d < 4.3, `duration ${d}`);
  rmSync(out, {force: true});
  rmSync(dir, {recursive: true, force: true});
  rmSync(path.join('work', 'cleancut-test.cutlist.json'), {force: true});
});
