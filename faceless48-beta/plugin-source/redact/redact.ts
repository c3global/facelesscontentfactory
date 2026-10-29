/**
 * Faceless48 redact: blur private details in a screen recording before you edit it.
 *
 *   npm run f48 -- redact frame <clip> [second]      one still of the clip with a 100 pixel grid, to read box positions from
 *   npm run f48 -- redact check <spec.json>          validate the boxes and show what will be blurred, write nothing
 *   npm run f48 -- redact apply <spec.json>          write a new clip with the boxes blurred (the original is never changed)
 *
 * A spec lists boxes in the clip's own pixels, each with the seconds it is on screen:
 *   {"input": "public/raw/lesson.mp4", "boxes": [{"x": 0, "y": 0, "w": 1920, "h": 72, "from": 0, "to": 30, "label": "bookmarks bar"}]}
 *
 * The tool blurs exactly the boxes you give it. It cannot find private details for you, so watch the whole clip.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {z} from 'zod';

export const boxSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  w: z.number().positive(),
  h: z.number().positive(),
  /** second the blur starts */
  from: z.number().min(0).default(0),
  /** second the blur ends; leave out to blur until the end of the clip */
  to: z.number().min(0).optional(),
  /** what the box hides, for your own notes */
  label: z.string().max(80).optional(),
}).refine((b) => b.to === undefined || b.to > b.from, 'to must be later than from');

export const redactSchema = z.object({
  /** clip to protect, for example public/raw/lesson.mp4 */
  input: z.string().min(1),
  /** new clip to write; defaults to <input>-redacted.mp4 next to the original */
  output: z.string().min(1).optional(),
  /** blur strength. 24 hides small text; raise it for large type */
  strength: z.number().min(8).max(80).default(24),
  boxes: z.array(boxSchema).min(1).max(40),
});
export type RedactSpec = z.infer<typeof redactSchema>;

export class RedactError extends Error {}
const fail = (m: string): never => {throw new RedactError(m);};

export function parseSpec(raw: unknown): RedactSpec {
  const r = redactSchema.safeParse(raw);
  if (!r.success) fail(`The redact spec is not valid:\n${r.error.issues.map((i) => `- ${i.path.join('.') || 'spec'}: ${i.message}`).join('\n')}`);
  return (r as any).data;
}

const num = (n: number) => String(Math.round(n * 1000) / 1000);

/** The ffmpeg filter graph: each box is cropped, blurred hard and laid back over the frame for its seconds only. */
export function buildFilter(spec: RedactSpec, width: number, height: number): string {
  const parts: string[] = [];
  let cur = '0:v';
  spec.boxes.forEach((b, i) => {
    const x = Math.min(Math.round(b.x), width - 2);
    const y = Math.min(Math.round(b.y), height - 2);
    const w = Math.max(2, Math.min(Math.round(b.w), width - x));
    const h = Math.max(2, Math.min(Math.round(b.h), height - y));
    const on = b.to === undefined ? `gte(t,${num(b.from)})` : `between(t,${num(b.from)},${num(b.to)})`;
    parts.push(`[${cur}]split[base${i}][cut${i}]`);
    parts.push(`[cut${i}]crop=${w}:${h}:${x}:${y},gblur=sigma=${spec.strength}:steps=3[blur${i}]`);
    parts.push(`[base${i}][blur${i}]overlay=${x}:${y}:enable='${on}'[o${i}]`);
    cur = `o${i}`;
  });
  return `${parts.join(';')};[${cur}]format=yuv420p[out]`;
}

type Probe = {width: number; height: number; duration: number};
function probe(file: string): Probe {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file], {encoding: 'utf8'});
  if (r.error || r.status !== 0) fail('Could not read the clip. Check the file and that ffmpeg is installed (npm run f48 -- doctor).');
  const j = JSON.parse(r.stdout);
  return {width: j.streams?.[0]?.width, height: j.streams?.[0]?.height, duration: Number(j.format?.duration)};
}

function resolveInside(root: string, p: string): string {
  const abs = path.resolve(root, p);
  const rel = path.relative(root, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) fail(`Keep the clip inside your project folder: ${p}`);
  return abs;
}

function problems(spec: RedactSpec, pr: Probe): string[] {
  const out: string[] = [];
  spec.boxes.forEach((b, i) => {
    const n = `Box ${i + 1}${b.label ? ` (${b.label})` : ''}`;
    if (b.x >= pr.width || b.y >= pr.height) out.push(`${n} starts outside the ${pr.width}x${pr.height} frame.`);
    else if (b.x + b.w > pr.width || b.y + b.h > pr.height) out.push(`${n} runs past the frame edge; it will be trimmed to fit.`);
    if (b.from >= pr.duration) out.push(`${n} starts after the clip ends (${pr.duration.toFixed(1)} s).`);
  });
  return out;
}

function summary(spec: RedactSpec, pr: Probe): string {
  const lines = spec.boxes.map((b, i) => `${i + 1}. ${b.label ?? 'box'}: x ${b.x}, y ${b.y}, ${b.w} by ${b.h}, from ${b.from} s ${b.to === undefined ? 'to the end' : `to ${b.to} s`}`);
  return `Clip ${pr.width}x${pr.height}, ${pr.duration.toFixed(1)} s\n${lines.join('\n')}`;
}

const FONTS = ['/System/Library/Fonts/Supplemental/Arial.ttf', '/Library/Fonts/Arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'C:/Windows/Fonts/arial.ttf'];

function frameCommand(root: string, clip: string | undefined, sec: string | undefined): void {
  if (!clip) fail('Usage: npm run f48 -- redact frame <clip> [second]');
  const abs = resolveInside(root, clip!);
  if (!fs.existsSync(abs)) fail(`Clip not found: ${clip}`);
  const pr = probe(abs);
  const t = sec === undefined ? Math.min(1, pr.duration / 2) : Number(sec);
  if (!Number.isFinite(t) || t < 0 || t > pr.duration) fail(`Pick a second between 0 and ${pr.duration.toFixed(1)}.`);
  const dir = path.join(root, 'content', 'redact');
  fs.mkdirSync(dir, {recursive: true});
  const out = path.join(dir, `${path.basename(abs, path.extname(abs))}-${Math.round(t)}s-grid.png`);
  const font = FONTS.find((f) => fs.existsSync(f));
  const labels = font ? Array.from({length: Math.floor(pr.width / 200) + 1}, (_, k) => `drawtext=fontfile='${font}':text='${k * 200}':x=${k * 200 + 4}:y=4:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.6`)
    .concat(Array.from({length: Math.floor(pr.height / 200) + 1}, (_, k) => `drawtext=fontfile='${font}':text='${k * 200}':x=4:y=${k * 200 + 4}:fontsize=20:fontcolor=cyan:box=1:boxcolor=black@0.6`)) : [];
  const vf = ['drawgrid=w=100:h=100:t=1:c=white@0.45', ...labels].join(',');
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', abs, '-frames:v', '1', '-vf', vf, out], {encoding: 'utf8'});
  if (r.status !== 0) fail(`Could not make the grid still: ${r.stderr}`);
  console.log(`${out}\nClip is ${pr.width}x${pr.height}. Grid lines are every 100 pixels${font ? ', numbered every 200 (yellow across, blue down)' : ''}. Give each box x, y, w and h in these pixels.`);
}

function loadSpec(root: string, file: string | undefined): {spec: RedactSpec; input: string; output: string; pr: Probe} {
  if (!file) fail('Usage: npm run f48 -- redact check|apply <spec.json>');
  const specPath = resolveInside(root, file!);
  if (!fs.existsSync(specPath)) fail(`Spec not found: ${file}`);
  let raw: unknown;
  try {raw = JSON.parse(fs.readFileSync(specPath, 'utf8'));} catch {fail('The spec is not valid JSON.');}
  const spec = parseSpec(raw);
  const input = resolveInside(root, spec.input);
  if (!fs.existsSync(input)) fail(`Clip not found: ${spec.input}`);
  const output = resolveInside(root, spec.output ?? spec.input.replace(/\.[^.]+$/, '') + '-redacted.mp4');
  if (path.resolve(output) === path.resolve(input)) fail('The new clip needs a different name from the original.');
  return {spec, input, output, pr: probe(input)};
}

export function redactCli(args: string[], root = process.cwd()): void {
  try {
    const [sub, a, b] = args;
    if (sub === 'frame') return frameCommand(root, a, b);
    if (sub === 'check') {
      const {spec, pr, output} = loadSpec(root, a);
      const warn = problems(spec, pr);
      console.log(`${summary(spec, pr)}\nWill write: ${path.relative(root, output)}${warn.length ? `\n\nCheck these:\n- ${warn.join('\n- ')}` : '\n\nLooks good.'}`);
      return;
    }
    if (sub === 'apply') {
      const {spec, input, output, pr} = loadSpec(root, a);
      const warn = problems(spec, pr).filter((w) => /outside|after the clip/.test(w));
      if (warn.length) fail(`Fix these first:\n- ${warn.join('\n- ')}`);
      if (fs.existsSync(output)) fail(`Already exists: ${path.relative(root, output)}. Choose another output name so nothing is overwritten.`);
      fs.mkdirSync(path.dirname(output), {recursive: true});
      const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-filter_complex', buildFilter(spec, pr.width, pr.height), '-map', '[out]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'copy', '-movflags', '+faststart', output], {encoding: 'utf8'});
      if (r.status !== 0) {fs.rmSync(output, {force: true}); fail(`Blurring failed: ${r.stderr}`);}
      const dir = path.join(root, 'content', 'redact');
      fs.mkdirSync(dir, {recursive: true});
      const stills: string[] = [];
      spec.boxes.forEach((bx, i) => {
        const end = bx.to ?? pr.duration;
        const t = Math.min(pr.duration - 0.1, Math.max(0, (bx.from + end) / 2));
        const still = path.join(dir, `${path.basename(output, '.mp4')}-box${i + 1}.png`);
        const s = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', output, '-frames:v', '1', still], {encoding: 'utf8'});
        if (s.status === 0) stills.push(still);
      });
      console.log(`Wrote ${path.relative(root, output)}. The original was not changed.\nLook at these stills to confirm the details are unreadable, then watch the new clip all the way through before you edit or share it:\n${stills.map((s) => `- ${path.relative(root, s)}`).join('\n')}`);
      return;
    }
    fail('Usage: npm run f48 -- redact frame <clip> [second] | redact check <spec.json> | redact apply <spec.json>');
  } catch (e) {
    if (e instanceof RedactError) {console.error(e.message); process.exitCode = 1; return;}
    throw e;
  }
}
