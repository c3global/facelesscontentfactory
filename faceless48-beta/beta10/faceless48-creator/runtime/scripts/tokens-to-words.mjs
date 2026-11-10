#!/usr/bin/env node
/**
 * Merges whisper sub-word tokens ("Nad" + "ler", "." on its own) into whole words and writes
 * content/<slug>.words.tsv, ready for scripts/snap-words.mjs and scripts/words-to-captions.mjs.
 *
 *   node scripts/tokens-to-words.mjs <slug>
 */
import {readFileSync, writeFileSync} from 'node:fs';

const slug = process.argv[2];
const c = JSON.parse(readFileSync(`content/${slug}.captions.json`, 'utf8'));
const words = [];
for (const t of c) {
  const isNew = t.text.startsWith(' ') || words.length === 0;
  const txt = t.text.trim();
  if (isNew) words.push({w: txt, s: t.startMs, e: t.endMs});
  else {
    const p = words[words.length - 1];
    p.w += txt;
    if (!/^[.,?!;:-]+$/.test(txt)) p.e = t.endMs;
  }
}
writeFileSync(`content/${slug}.words.tsv`, words.map((w) => [w.w, (w.s / 1000).toFixed(3), (w.e / 1000).toFixed(3)].join('\t')).join('\n') + '\n');
console.log(`${words.length} words`);
