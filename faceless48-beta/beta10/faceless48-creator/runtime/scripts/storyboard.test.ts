import test from 'node:test';
import assert from 'node:assert/strict';
import {storyboardMoments, thin, storyboardMarkdown} from './storyboard';

const cap = (text: string, a: number, b: number) => ({text, startMs: a, endMs: b, timestampMs: null, confidence: 1});
const th = (fx: any[], graphics: any[] = [], extra: any = {}) => ({
  kind: 'talking-head',
  captions: [cap('Your', 0, 300), cap(' brand', 300, 900), cap(' colors', 3000, 3400), cap(' done', 9000, 9400)],
  plan: {slug: 'x', video: 'raw/x.mp4', durationSec: 10, scenes: [{id: 'a', mood: 'dark', segments: [{start: 0, end: 10, layout: 'A', graphics}]}], fx, ...extra},
});

test('a talking-head plan gets a frame for its scene, its effect and what is being said', () => {
  const {moments} = storyboardMoments(th([{type: 'type-wall', at: 2.8, until: 6, props: {}}]));
  assert.ok(moments.some((m) => m.label === 'Scene 1'));
  const wall = moments.find((m) => m.label === 'Type wall')!;
  assert.ok(wall, 'effect shown');
  assert.match(wall.caption, /colors/);
});

test('moments are in order, never bunched together, and cover long quiet stretches', () => {
  const {moments} = storyboardMoments(th([{type: 'digital-zoom', at: 0.2, until: 1, props: {}}]));
  for (let i = 1; i < moments.length; i++) {
    assert.ok(moments[i].t > moments[i - 1].t, 'in order');
    assert.ok(moments[i].t - moments[i - 1].t < 4.2, `gap before frame ${i + 1}`);
  }
  assert.ok(moments[moments.length - 1].t > 6, 'the last frame is near the end');
});

test('thin keeps the first and last of a long list and never goes over the cap', () => {
  const many = Array.from({length: 60}, (_, i) => ({t: i, label: `m${i}`, caption: ''}));
  const out = thin(many, 20);
  assert.ok(out.length <= 20);
  assert.equal(out[0].label, 'm0');
  assert.equal(out[out.length - 1].label, 'm59');
});

test('explainers get one frame per scene, and stick plans are sampled evenly', () => {
  const ex = {slug: 'e', durationSec: 12, scenes: [{start: 0, end: 6, title: 'One', visual: 'steps'}, {start: 6, end: 12, title: 'Two', visual: 'layers'}], captions: []};
  assert.equal(storyboardMoments(ex).moments.filter((m) => m.label.startsWith('Scene')).length, 2);
  const stick = storyboardMoments({kind: 'stick', plan: {durationSec: 40}, captions: []}).moments;
  assert.ok(stick.length >= 8 && stick.length <= 14);
});

test('the markdown lists every frame with its time and words', () => {
  const {moments} = storyboardMoments(th([]));
  const md = storyboardMarkdown('x', moments, moments.map((_, i) => `${i + 1}.png`));
  assert.match(md, /\| 1 \| 0:00\.\d \| Scene 1/);
});

test('stick plans use their named beats when they have them', () => {
  const plan = {durationSec: 30, cues: {problem: 0.2, ideas: 4, brand: 12, style: 20, ciciIn: 999}};
  const out = storyboardMoments({kind: 'stick', plan, captions: []}).moments;
  assert.ok(out.some((m) => m.label === 'Brand'));
  assert.ok(!out.some((m) => m.label === 'CiciIn'), 'unused beats are skipped');
});
