#!/usr/bin/env node
/**
 * Where does she say it? Prints the start and end second of a phrase so effects can land on her words.
 *   npm run word -- dialects "went quiet"
 *   npm run word -- rough "pick three people" "show them the rough version"
 * Reads content/<slug>.words.tsv (word, start, end). Case and punctuation are ignored. Prints every match.
 */
import {readFileSync} from 'node:fs';
import path from 'node:path';

const [slug, ...phrases] = process.argv.slice(2);
if (!slug || !phrases.length) {
  console.error('Usage: npm run word -- <slug> "<phrase>" ["<phrase>" ...]');
  process.exit(1);
}
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
const rows = readFileSync(path.join(process.cwd(), 'content', `${slug}.words.tsv`), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => l.split('\t'))
  .map(([w, s, e]) => ({w: norm(w), s: parseFloat(s), e: parseFloat(e)}));
for (const ph of phrases) {
  const parts = ph.split(/\s+/).map(norm);
  let found = false;
  for (let i = 0; i + parts.length <= rows.length; i++) {
    if (parts.every((p, k) => rows[i + k].w === p)) {
      console.log(`"${ph}": ${rows[i].s.toFixed(2)} to ${rows[i + parts.length - 1].e.toFixed(2)}`);
      found = true;
    }
  }
  if (!found) console.log(`"${ph}": not found`);
}
