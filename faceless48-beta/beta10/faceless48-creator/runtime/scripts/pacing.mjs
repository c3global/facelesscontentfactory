#!/usr/bin/env node
/**
 * Pacing rule for talking-head videos: her face never carries the screen for long.
 * Every full-frame stretch (layout A, merged across back-to-back segments) is checked:
 *   over 4.0 s  -> warning: cut to a cutaway, a picture-in-picture swap, or a hidden-avatar graphic on a key word
 *   over 6.0 s  -> error: only allowed as a deliberate hold, and never longer than this
 *
 *   npm run pacing -- four-places
 */
import {readFileSync} from 'node:fs';
import path from 'node:path';

const WARN = 4.0;
const MAX = 6.0;
const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run pacing -- <slug>');
  process.exit(1);
}
const plan = JSON.parse(readFileSync(path.join(process.cwd(), 'content', `${slug}.scene.json`), 'utf8'));
const segs = plan.scenes.flatMap((s) => s.segments).sort((a, b) => a.start - b.start);
const stretches = [];
for (const s of segs) {
  const last = stretches[stretches.length - 1];
  if (s.layout === 'A') {
    if (last && Math.abs(last.end - s.start) < 0.01) last.end = s.end;
    else stretches.push({start: s.start, end: s.end});
  }
}
let bad = 0;
for (const st of stretches) {
  const d = st.end - st.start;
  const tag = d > MAX ? 'ERROR' : d > WARN ? 'warn ' : 'ok   ';
  if (d > MAX) bad++;
  console.log(`${tag} full-frame ${st.start.toFixed(1)}s to ${st.end.toFixed(1)}s (${d.toFixed(1)}s)`);
}
console.log(bad ? `${bad} stretch(es) over ${MAX}s` : 'pacing ok');
process.exit(bad ? 1 : 0);
