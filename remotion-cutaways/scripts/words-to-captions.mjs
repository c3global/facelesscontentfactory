#!/usr/bin/env node
/**
 * Offline fallback: turn a hand-checked words file into Remotion `Caption[]` JSON.
 *
 * Input:  content/<slug>.words.tsv    (word <TAB> startSec <TAB> endSec)
 * Output: content/<slug>.captions.json
 *
 * Use this when whisper.cpp cannot be used (for example the model download is blocked).
 * Every caption except the first starts with a space, as @remotion/captions expects.
 */
import {readFileSync, writeFileSync} from 'node:fs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/words-to-captions.mjs <slug>');
  process.exit(1);
}

const rows = readFileSync(`content/${slug}.words.tsv`, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => l.split('\t'));

const captions = rows.map(([word, start, end], i) => {
  const startMs = Math.round(parseFloat(start) * 1000);
  const endMs = Math.round(parseFloat(end) * 1000);
  return {
    text: (i === 0 ? '' : ' ') + word,
    startMs,
    endMs,
    timestampMs: Math.round((startMs + endMs) / 2),
    confidence: null,
  };
});

writeFileSync(`content/${slug}.captions.json`, JSON.stringify(captions, null, 2) + '\n');
console.log(`Wrote content/${slug}.captions.json (${captions.length} words)`);
