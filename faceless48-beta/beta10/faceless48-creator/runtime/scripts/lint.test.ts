import test from 'node:test';
import assert from 'node:assert/strict';
import {lintPlan} from './lint';

const cap = (text: string, a: number, b: number) => ({text, startMs: a, endMs: b, timestampMs: null, confidence: 1});
const words = [cap('Your', 0, 300), cap(' assistant', 300, 900), cap(' transcribes', 900, 1500), cap(' every', 1500, 1800), cap(' word', 1800, 2200)];
const plan = (segs: any[], fx: any[]) => ({kind: 'talking-head', captions: words, plan: {slug: 'x', video: 'raw/x.mp4', durationSec: 3, scenes: [{id: 'a', mood: 'dark', segments: segs}], fx}});

test('flags a lower-third effect that shares seconds with bottom captions', () => {
  const issues = lintPlan(plan([{start: 0, end: 3, layout: 'A', graphics: []}], [{type: 'checklist', at: 0.2, until: 2.8, props: {items: [{text: 'Transcript', at: 1}, {text: 'Captions', at: 2}]}}]));
  assert.ok(issues.some((i) => i.kind === 'collision'));
  const fixed = lintPlan(plan([{start: 0, end: 3, layout: 'A', captionPos: 'top', graphics: []}], [{type: 'checklist', at: 0.2, until: 2.8, props: {items: [{text: 'Transcript', at: 1}, {text: 'Captions', at: 2}]}}]));
  assert.ok(!fixed.some((i) => i.kind === 'collision'));
});

test('flags captions that repeat on-screen text, and accepts captions turned off', () => {
  const echo = [{type: 'statement-card', at: 0, props: {text: 'Your assistant transcribes every word'}}];
  assert.ok(lintPlan(plan([{start: 0, end: 3, layout: 'E', graphics: echo}], [])).some((i) => i.kind === 'echo'));
  assert.ok(!lintPlan(plan([{start: 0, end: 3, layout: 'E', captions: 'off', graphics: echo}], [])).some((i) => i.kind === 'echo'));
});

test('flags an effect item that lands far from its word', () => {
  const late = lintPlan(plan([{start: 0, end: 3, layout: 'A', captionPos: 'top', graphics: []}], [{type: 'type-wall', at: 0, until: 3, props: {words: [{text: 'TRANSCRIBES', at: 2.4}]}}]));
  assert.ok(late.some((i) => i.kind === 'timing'));
  const ok = lintPlan(plan([{start: 0, end: 3, layout: 'A', captionPos: 'top', graphics: []}], [{type: 'type-wall', at: 0, until: 3, props: {words: [{text: 'TRANSCRIBES', at: 0.95}]}}]));
  assert.ok(!ok.some((i) => i.kind === 'timing'));
});
