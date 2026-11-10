#!/usr/bin/env node
/**
 * Speed ramp: slow her clip on a key moment, then ramp back to normal speed. Baked into a new clip, so it is made BEFORE the plan is finished.
 *
 *   npm run ramp -- dialects --at 12.0 --dur 2.0 --factor 0.5
 *   npm run ramp -- dialects --at 12.0 --dur 2.0 --factor 0.5 --audio silence --smooth
 *
 * Options
 *   --at <sec>        where the slow-down starts, in her clip
 *   --dur <sec>       how many seconds of her clip are slowed (including the ramp in and out)
 *   --factor <0.25-0.9>  speed at the slowest point (0.5 = half speed). Default 0.5
 *   --ease <sec>      seconds of ramp in and out inside --dur (default: a quarter of --dur, at most 0.5)
 *   --audio stretch|silence   stretch = her voice slows with the picture, pitch kept (default). silence = mute her during the slow part
 *   --smooth          interpolate in-between frames so slow motion is not choppy (slower to render)
 *
 * Writes (the original is never touched):
 *   public/raw/<slug>-ramp.mp4            the re-timed clip (1080x1920, 30 fps)
 *   content/<slug>-ramp.words.tsv         her word times, shifted to match
 *   content/<slug>-ramp.captions.json     captions from those words
 *   content/<slug>-ramp.scene.json        a copy of the plan with video, duration, and EVERY time re-mapped (graphics, effects, end card)
 * Then render or review <slug>-ramp like any other video. Claude cannot hear audio: check how her voice sounds in the slow part.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const slug = args[0];
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const at = parseFloat(opt('at'));
const dur = parseFloat(opt('dur'));
const factor = parseFloat(opt('factor', '0.5'));
const audioMode = opt('audio', 'stretch');
const smooth = args.includes('--smooth');
if (!slug || Number.isNaN(at) || Number.isNaN(dur)) {
  console.error('Usage: npm run ramp -- <slug> --at <sec> --dur <sec> [--factor 0.5] [--ease <sec>] [--audio stretch|silence] [--smooth]');
  process.exit(1);
}
if (!(factor >= 0.25 && factor <= 0.9)) throw new Error('--factor must be between 0.25 and 0.9');
const ease = Math.min(parseFloat(opt('ease', String(Math.min(0.5, dur / 4)))), dur / 2 - 0.05);
const root = process.cwd();
const src = path.join(root, 'public', 'raw', `${slug}.mp4`);
if (!existsSync(src)) throw new Error(`Missing ${src}`);
const total = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], {encoding: 'utf8'}));
if (at + dur > total) throw new Error(`The slow part (${at} to ${at + dur}) runs past the end of the clip (${total.toFixed(2)} s)`);

// pieces of her clip: [from, to, speed]. Ramp in and out are one mid speed each.
const mid = (1 + factor) / 2;
const pieces = [
  [0, at, 1],
  [at, at + ease, mid],
  [at + ease, at + dur - ease, factor],
  [at + dur - ease, at + dur, mid],
  [at + dur, total, 1],
].filter(([a, b]) => b - a > 0.01);
const outLen = pieces.map(([a, b, s]) => (b - a) / s);
const starts = outLen.reduce((acc, l, i) => [...acc, (acc[i] ?? 0) + l], [0]);
const newTotal = starts[starts.length - 1];

/** her clip second -> new clip second */
const mapT = (t) => {
  if (t <= 0) return t;
  for (let i = 0; i < pieces.length; i++) {
    const [a, b, s] = pieces[i];
    if (t <= b || i === pieces.length - 1) return starts[i] + (t - a) / s;
  }
  return t;
};

// ---- ffmpeg filtergraph
const atempoChain = (s) => {
  const f = [];
  let r = s;
  while (r < 0.5) {
    f.push('atempo=0.5');
    r /= 0.5;
  }
  f.push(`atempo=${r.toFixed(4)}`);
  return f.join(',');
};
const v = [];
const a = [];
pieces.forEach(([from, to, s], i) => {
  let vf = `[0:v]trim=${from}:${to},setpts=(PTS-STARTPTS)/${s}`;
  if (smooth && s < 1) vf += `,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1`;
  vf += `,fps=30,format=yuv420p[v${i}]`;
  v.push(vf);
  let af = `[0:a]atrim=${from}:${to},asetpts=PTS-STARTPTS`;
  if (s < 1) af += `,${atempoChain(s)}`;
  if (s < 1 && audioMode === 'silence') af += ',volume=0';
  af += `,aformat=sample_rates=48000:channel_layouts=mono[a${i}]`;
  a.push(af);
});
const inputs = pieces.map((_, i) => `[v${i}][a${i}]`).join('');
const graph = [...v, ...a, `${inputs}concat=n=${pieces.length}:v=1:a=1[v][a]`].join(';');
const out = path.join(root, 'public', 'raw', `${slug}-ramp.mp4`);
console.log(`Slowing ${at}s to ${(at + dur).toFixed(2)}s to ${factor}x (${audioMode}${smooth ? ', smooth' : ''}). New length ${newTotal.toFixed(2)} s (was ${total.toFixed(2)} s).`);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-filter_complex', graph, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', out], {stdio: 'inherit'});

// ---- words and captions
const wordsIn = path.join(root, 'content', `${slug}.words.tsv`);
if (existsSync(wordsIn)) {
  const rows = readFileSync(wordsIn, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t'));
  const mapped = rows.map(([w, s, e]) => `${w}\t${mapT(parseFloat(s)).toFixed(3)}\t${mapT(parseFloat(e)).toFixed(3)}`).join('\n') + '\n';
  writeFileSync(path.join(root, 'content', `${slug}-ramp.words.tsv`), mapped);
  execFileSync('node', [path.join(root, 'scripts', 'words-to-captions.mjs'), `${slug}-ramp`], {stdio: 'inherit'});
}

// ---- plan: copy with every time mapped
const planIn = path.join(root, 'content', `${slug}.scene.json`);
if (existsSync(planIn)) {
  const TIME_KEYS = new Set(['start', 'end', 'at', 'until', 'strikeAt', 'writeAt', 'mutedAt', 'statusAt', 'connectAt', 'pulseAt', 'labelAt', 'changeAt', 'drawAt', 'centerAt', 'startAt', 'knockAt', 'popAt', 'postAt', 'replyAt', 'burnAt', 'typeAt', 'sendAt', 'cutAt', 'snapAt']);
  const TIME_ARRAYS = new Set(['wordTimes', 'cuts']);
  const walk = (n, key) => {
    if (Array.isArray(n)) return n.map((x) => (TIME_ARRAYS.has(key) && typeof x === 'number' ? Number(mapT(x).toFixed(3)) : walk(x, key)));
    if (n && typeof n === 'object') return Object.fromEntries(Object.entries(n).map(([k, x]) => [k, typeof x === 'number' && TIME_KEYS.has(k) ? Number(mapT(x).toFixed(3)) : walk(x, k)]));
    return n;
  };
  const plan = JSON.parse(readFileSync(planIn, 'utf8'));
  const next = walk(plan, '');
  next.slug = `${slug}-ramp`;
  next.video = `raw/${slug}-ramp.mp4`;
  next.durationSec = Number((plan.durationSec + (newTotal - total)).toFixed(2));
  if (plan.matte) next.matte = `${slug}-ramp`; // matte must be re-made for the new clip: npm run matte -- <slug>-ramp
  writeFileSync(path.join(root, 'content', `${slug}-ramp.scene.json`), JSON.stringify(next, null, 2) + '\n');
  console.log(`Wrote content/${slug}-ramp.scene.json (duration ${next.durationSec} s${plan.matte ? '; run npm run matte -- ' + slug + '-ramp before behind-her effects' : ''}).`);
}
console.log(`Her words now: ${at} s -> ${mapT(at).toFixed(2)} s, ${(at + dur).toFixed(2)} s -> ${mapT(at + dur).toFixed(2)} s.`);
