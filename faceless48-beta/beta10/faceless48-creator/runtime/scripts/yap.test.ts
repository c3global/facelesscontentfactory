import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

test('tighten-pauses cuts a long silence and remaps the plan, captions and effects', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f48-yap-'));
  const scripts = path.resolve('scripts');
  fs.mkdirSync(path.join(dir, 'public/raw'), {recursive: true});
  fs.mkdirSync(path.join(dir, 'content'));
  // 3.5 s: tone for 1 s, 1.5 s of silence, tone for 1 s
  const made = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=black:s=64x64:d=3.5:r=30', '-f', 'lavfi', '-i', "aevalsrc='if(between(t,1,2.5),0,0.5*sin(2*PI*440*t))':d=3.5:s=44100", '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', path.join(dir, 'public/raw/t.mp4')]);
  assert.equal(made.status, 0, String(made.stderr));
  const caption = (text: string, a: number, b: number) => ({text, startMs: a, endMs: b, timestampMs: null, confidence: 1});
  const plan = {slug: 't', video: 'raw/t.mp4', durationSec: 3.5, scenes: [{id: 'a', mood: 'dark', segments: [{start: 0, end: 3.5, layout: 'A', graphics: []}]}], fx: [{type: 'digital-zoom', at: 2.6, until: 3.4, props: {}}]};
  fs.writeFileSync(path.join(dir, 'content/t.json'), JSON.stringify({kind: 'talking-head', plan, captions: [caption('One', 0, 900), caption(' two', 2500, 3400)]}));
  const run = spawnSync('python3', ['-I', path.join(scripts, 'tighten-pauses.py'), 'content/t.json', '0.3'], {cwd: dir, encoding: 'utf8'});
  assert.equal(run.status, 0, run.stderr + run.stdout);
  const out = JSON.parse(fs.readFileSync(path.join(dir, 'content/t-tight.json'), 'utf8'));
  assert.equal(out.plan.slug, 't-tight');
  assert.equal(out.plan.video, 'raw/t-tight.mp4');
  assert.ok(out.plan.durationSec < 2.6 && out.plan.durationSec > 2.0, `duration ${out.plan.durationSec}`);
  assert.ok(out.plan.fx[0].at < 1.6 && out.plan.fx[0].at > 1.2, `effect moved to ${out.plan.fx[0].at}`);
  assert.ok(out.captions[1].startMs < 1600, 'second caption moved earlier');
  assert.equal(out.plan.scenes[0].segments[0].end, out.plan.durationSec);
  const again = spawnSync('python3', ['-I', path.join(scripts, 'tighten-pauses.py'), 'content/t.json', '0.3'], {cwd: dir, encoding: 'utf8'});
  assert.notEqual(again.status, 0, 'never overwrites an existing tightened copy');
});

test('the yap preset sets captions, music bed, no effects and a lighter gradient', async () => {
  const {PRESETS, applyStyle} = await import('../src/styles');
  assert.ok(PRESETS.yap);
  const out: any = applyStyle({slug: 'y', video: 'raw/y.mp4', durationSec: 5, style: 'yap', scenes: [{id: 'a', mood: 'dark', segments: [{start: 0, end: 5, layout: 'A', graphics: []}]}], fx: []});
  assert.equal(out.scrim, 0.7);
  assert.equal(out.captionStyle, 'editorial');
  assert.equal(out.fxSound, 'off');
});
