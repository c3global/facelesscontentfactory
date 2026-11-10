import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {parseSpec, buildFilter, redactCli} from './redact';

test('a spec fills in strength and the start second', () => {
  const s = parseSpec({input: 'public/raw/a.mp4', boxes: [{x: 0, y: 0, w: 100, h: 40}]});
  assert.equal(s.strength, 24);
  assert.equal(s.boxes[0].from, 0);
});
test('a spec rejects empty boxes, bad sizes and an end before the start', () => {
  assert.throws(() => parseSpec({input: 'a.mp4', boxes: []}));
  assert.throws(() => parseSpec({input: 'a.mp4', boxes: [{x: 0, y: 0, w: 0, h: 10}]}));
  assert.throws(() => parseSpec({input: 'a.mp4', boxes: [{x: 0, y: 0, w: 10, h: 10, from: 5, to: 2}]}));
});
test('the filter blurs each box only during its seconds and trims boxes to the frame', () => {
  const f = buildFilter(parseSpec({input: 'a.mp4', boxes: [{x: 10, y: 20, w: 300, h: 50, from: 1, to: 3}, {x: 1800, y: 1000, w: 500, h: 500, from: 2}]}), 1920, 1080);
  assert.match(f, /crop=300:50:10:20/);
  assert.match(f, /enable='between\(t,1,3\)'/);
  assert.match(f, /crop=120:80:1800:1000/);
  assert.match(f, /enable='gte\(t,2\)'/);
  assert.match(f, /\[o1\]format=yuv420p\[out\]$/);
});
test('apply blurs a real clip, keeps the original and refuses to overwrite', {skip: spawnSync('ffmpeg', ['-version']).status !== 0}, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f48-redact-'));
  fs.mkdirSync(path.join(dir, 'public'));
  const clip = path.join(dir, 'public', 'a.mp4');
  const made = spawnSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=10:duration=2', '-f', 'lavfi', '-i', 'sine=d=2', '-shortest', '-pix_fmt', 'yuv420p', clip]);
  assert.equal(made.status, 0);
  fs.writeFileSync(path.join(dir, 'spec.json'), JSON.stringify({input: 'public/a.mp4', boxes: [{x: 0, y: 0, w: 320, h: 180, from: 0, to: 1}]}));
  const before = fs.readFileSync(clip);
  redactCli(['apply', 'spec.json'], dir);
  const out = path.join(dir, 'public', 'a-redacted.mp4');
  assert.ok(fs.existsSync(out));
  assert.deepEqual(fs.readFileSync(clip), before);
  const grab = (file: string, t: string) => spawnSync('ffmpeg', ['-v', 'error', '-ss', t, '-i', file, '-frames:v', '1', '-vf', 'crop=320:180:0:0', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], {maxBuffer: 1 << 24}).stdout;
  assert.notDeepEqual(grab(out, '0.5'), grab(clip, '0.5'));
  const code = process.exitCode;
  redactCli(['apply', 'spec.json'], dir);
  assert.equal(process.exitCode, 1);
  process.exitCode = code;
  fs.rmSync(dir, {recursive: true, force: true});
});
