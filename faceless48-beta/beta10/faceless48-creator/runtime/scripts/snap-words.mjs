#!/usr/bin/env node
/**
 * Snaps word timings to the real audio. whisper.cpp stretches the last word of a sentence across the pause
 * that follows it and starts the first word of a sentence at the segment boundary. This pulls each word's
 * start forward and end back to where there is actual speech (RMS above 2% of peak, 10 ms frames).
 *
 *   node scripts/snap-words.mjs <slug>      reads content/<slug>.words.tsv and out/tmp/<slug>.16k.wav
 */
import {readFileSync, writeFileSync} from 'node:fs';

const slug = process.argv[2];
const b = readFileSync(`out/tmp/${slug}.16k.wav`);
const d = new Int16Array(b.buffer, b.byteOffset + 44, (b.length - 44) >> 1);
const win = 160;
const rms = [];
for (let i = 0; i + win <= d.length; i += win) {
  let s = 0;
  for (let j = 0; j < win; j++) s += d[i + j] * d[i + j];
  rms.push(Math.sqrt(s / win));
}
const th = Math.max(...rms) * 0.02;
const speech = (sec) => rms[Math.min(rms.length - 1, Math.max(0, Math.floor(sec * 100)))] > th;

const rows = readFileSync(`content/${slug}.words.tsv`, 'utf8').trim().split('\n').map((l) => l.split('\t'));
const burstEnd = (t) => {
  let x = t;
  while (speech(x)) x += 0.01;
  return x;
};
const out = rows.map(([w, s, e]) => {
  let st = parseFloat(s);
  let en = parseFloat(e);
  // start in silence: move to the next speech onset (max 1 s)
  let guard = 0;
  while (!speech(st + 0.005) && guard++ < 100) st += 0.01;
  if (en <= st) en = Math.min(burstEnd(st), st + 0.5);
  // a pause of 80 ms or more inside the word: the word ends where the pause starts
  for (let t = st + 0.05; t < en; t += 0.01) {
    let run = 0;
    while (t + run < en && !speech(t + run)) run += 0.01;
    if (run >= 0.08) {
      en = t;
      break;
    }
    if (run > 0) t += run;
  }
  while (en - st > 0.08 && !speech(en - 0.01)) en -= 0.01;
  return [w, st.toFixed(3), en.toFixed(3)].join('\t');
});
// keep order, give every word at least 120 ms without running into the next word
const fin = out.map((l) => l.split('\t')).map(([w, a, b]) => [w, parseFloat(a), parseFloat(b)]);
for (let i = 0; i < fin.length; i++) {
  if (i > 0 && fin[i][1] < fin[i - 1][1]) fin[i][1] = fin[i - 1][1];
  const next = fin[i + 1] ? Math.max(fin[i + 1][1], fin[i][1] + 0.04) : Infinity;
  fin[i][2] = Math.min(Math.max(fin[i][2], fin[i][1] + 0.12), next);
}
writeFileSync(`content/${slug}.words.tsv`, fin.map(([w, a, b]) => [w, a.toFixed(3), b.toFixed(3)].join('\t')).join('\n') + '\n');
console.log(`snapped ${out.length} words`);
