/**
 * Faceless48 handoff: import what the Script, Shorts and Thumbnail engines exported.
 *
 *   npm run f48 -- handoff check <package.f48handoff.zip | folder>    validate, write nothing
 *   npm run f48 -- handoff import <package.f48handoff.zip | folder>   validate and save to content/handoffs/<slug>/
 *   npm run f48 -- handoff show <slug>                                what was imported and what to bring next
 *   npm run f48 -- handoff stock <slug> [--orientation portrait|landscape|any] [--per 5]
 *                                                                     search Pexels and Pixabay for each section and
 *                                                                     write the options for the member to review
 *
 * The package format is in docs/HANDOFF.md. It holds text and at most one thumbnail image. Nothing in a
 * package is run or executed, and only the three known file names are ever read from a zip.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {z} from 'zod';
import {search, savePreviews} from './stock';

export const VIDEO_TYPES = ['talking-head', 'yap', 'explainer', 'faceless', 'life-scene'] as const;
export type VideoType = (typeof VIDEO_TYPES)[number];

const MAX_JSON = 2 * 1024 * 1024;
const MAX_TEXT = 2 * 1024 * 1024;
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_TOTAL = 10 * 1024 * 1024;
const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp'];

const plain = (label: string) => z.string().refine((s) => !/<\/?[a-z][^>]*>/i.test(s), `${label} must be plain text, with no HTML tags`);
const id = z.string().regex(/^[A-Za-z0-9_-]{1,40}$/, 'must be 1 to 40 letters, numbers, dashes or underscores');

const section = z.object({
  id,
  heading: plain('heading').optional(),
  text: plain('text').refine((s) => s.trim().length > 0, 'every section needs text'),
  message: plain('message').optional(),
  visual: plain('visual').optional(),
});
const short = z.object({
  id,
  title: plain('title'),
  text: plain('text').refine((s) => s.trim().length > 0, 'every short needs text'),
  fromSections: z.array(id).default([]),
  approxSeconds: z.number().positive().max(180).optional(),
});

export const handoffSchema = z
  .object({
    handoffVersion: z.number().int(),
    createdAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'must be a date such as 2026-11-02T14:05:00Z'),
    source: z.object({app: z.string(), engines: z.array(z.enum(['script', 'shorts', 'thumbnail'])).min(1)}),
    title: plain('title').refine((s) => s.trim().length > 0 && s.length <= 200, 'must be 1 to 200 characters'),
    type: z.enum(VIDEO_TYPES, {error: () => `must be one of: ${VIDEO_TYPES.join(', ')}`}),
    format: z.enum(['portrait', 'landscape']).optional(),
    script: z.object({text: plain('text'), sections: z.array(section).min(1)}).optional(),
    shorts: z.array(short).optional(),
    thumbnail: z.object({file: z.string(), headline: plain('headline').optional(), alt: plain('alt').optional()}).optional(),
    stock: z.object({terms: z.array(z.object({sectionId: id, terms: z.array(z.string().min(2).max(100)).min(1).max(6)}))}).optional(),
    notes: plain('notes').refine((s) => s.length <= 1000, 'must be 1000 characters or fewer').optional(),
  })
  .superRefine((h, ctx) => {
    const bad = (p: (string | number)[], message: string) => ctx.addIssue({code: 'custom', path: p, message});
    const ids = new Set<string>();
    h.script?.sections.forEach((s, i) => {
      if (ids.has(s.id)) bad(['script', 'sections', i, 'id'], `section id "${s.id}" is used twice`);
      ids.add(s.id);
    });
    h.shorts?.forEach((s, i) =>
      s.fromSections.forEach((f) => {
        if (h.script && !ids.has(f)) bad(['shorts', i, 'fromSections'], `"${f}" is not a section id in this script`);
      }),
    );
    h.stock?.terms.forEach((t, i) => {
      if (h.script && !ids.has(t.sectionId)) bad(['stock', 'terms', i, 'sectionId'], `"${t.sectionId}" is not a section id in this script`);
    });
    if (h.thumbnail && !new RegExp(`^[A-Za-z0-9_-]+\\.(${IMAGE_EXT.join('|')})$`, 'i').test(h.thumbnail.file)) bad(['thumbnail', 'file'], 'must be a plain file name ending in .png, .jpg, .jpeg or .webp');
    if (['explainer', 'faceless'].includes(h.type) && !h.script) bad(['script'], `a ${h.type} video needs the script with sections`);
    if (h.type === 'life-scene' && !h.script && !h.shorts?.length) bad(['script'], 'a life-scene needs script sections with message lines, or a shorts list');
  });
export type Handoff = z.infer<typeof handoffSchema>;

/** What the member still has to bring, and how the plug-in uses the package, per video type. */
export const NEEDS: Record<VideoType, {bring: string; uses: string; scriptNeeded: boolean}> = {
  'talking-head': {bring: 'your raw video clip (the audio is already in it, so no voiceover is needed)', uses: 'The script is the transcript check. Cutaways, captions, effects and stock B-roll are planned from it.', scriptNeeded: false},
  yap: {bring: 'your raw video clip (the audio is already in it, so no voiceover is needed)', uses: 'Captions and a light edit only. A script, if there is one, is the transcript check.', scriptNeeded: false},
  explainer: {bring: 'your voiceover audio file (mp3, wav or m4a; the plug-in does not create voiceovers)', uses: 'Sections become scenes. The recording sets the timing, not the script.', scriptNeeded: true},
  faceless: {bring: 'your voiceover audio file (mp3, wav or m4a; the plug-in does not create voiceovers), plus visuals: your own images or clips, or stock clips you choose from the options the plug-in shows you', uses: 'Sections become scenes with images, footage or stock. The recording sets the timing.', scriptNeeded: true},
  'life-scene': {bring: 'your clips (your own, AI-generated, or stock you choose from the options shown). A voiceover is optional', uses: 'Each message becomes on-screen text of about 22 characters a line. The plug-in proposes the lines and you approve them first.', scriptNeeded: true},
};

export class HandoffError extends Error {}
const fail = (m: string): never => {
  throw new HandoffError(m);
};

/** Read only the allowed files out of a zip, using Node's own zlib. Never writes anything and never trusts a path. */
export function readZipEntries(buf: Buffer, allowed: (name: string) => boolean): Map<string, Buffer> {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) if (buf.readUInt32LE(i) === 0x06054b50) {eocd = i; break;}
  if (eocd < 0) return fail('That file is not a valid zip. Export the handoff again from the engine.');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = new Map<string, Buffer>();
  let total = 0;
  for (let n = 0; n < count; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) return fail('The zip is damaged. Export the handoff again.');
    const flags = buf.readUInt16LE(p + 8), method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20), usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const raw = buf.toString('utf8', p + 46, p + 46 + nlen).replace(/\\/g, '/');
    p += 46 + nlen + xlen + clen;
    const parts = raw.split('/').filter(Boolean);
    if (raw.endsWith('/') || parts.includes('__MACOSX') || parts.some((x) => x.startsWith('._')) || parts.some((x) => x === '..') || raw.startsWith('/') || /^[A-Za-z]:/.test(raw)) continue;
    // a zip made by "Compress" on a folder has one folder level on top; accept that and nothing deeper
    if (parts.length > 2) continue;
    const base = parts[parts.length - 1];
    if (!allowed(base) || out.has(base)) continue;
    if (flags & 1) return fail('The zip is password protected. Export it again without a password.');
    if (csize === 0xffffffff || usize === 0xffffffff) return fail('That zip is too large to be a handoff package.');
    const limit = /\.json$/i.test(base) ? MAX_JSON : /\.txt$/i.test(base) ? MAX_TEXT : MAX_IMAGE;
    if (usize > limit) return fail(`${base} is too large (limit ${Math.round(limit / 1048576)} MB).`);
    if (buf.readUInt32LE(off) !== 0x04034b50) return fail('The zip is damaged. Export the handoff again.');
    const start = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    const body = buf.subarray(start, start + csize);
    let data: Buffer;
    if (method === 0) data = Buffer.from(body);
    else if (method === 8) {
      try {data = zlib.inflateRawSync(body, {maxOutputLength: limit});} catch {return fail(`${base} could not be unpacked, or is larger than allowed.`);}
    } else return fail('That zip uses a compression method the plug-in does not read. Export it again with normal zip compression.');
    total += data.length;
    if (total > MAX_TOTAL) return fail('The package is larger than 10 MB, which a handoff should never be.');
    out.set(base, data);
  }
  return out;
}

export type Loaded = {slug: string; data: Handoff; files: Map<string, Buffer>};

const slugify = (s: string) => s.toLowerCase().replace(/\.f48handoff(\.zip)?$/i, '').replace(/\.zip$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const allowedName = (n: string) => /^(handoff\.json|script\.txt)$/i.test(n) || new RegExp(`^[A-Za-z0-9_-]+\\.(${IMAGE_EXT.join('|')})$`, 'i').test(n);

export function loadPackage(src: string): Loaded {
  if (!fs.existsSync(src)) return fail(`Not found: ${src}`);
  let files = new Map<string, Buffer>();
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(src)) {
      const full = path.join(src, name);
      if (!fs.statSync(full).isFile() || !allowedName(name)) continue;
      if (fs.statSync(full).size > (name.endsWith('.json') || name.endsWith('.txt') ? MAX_JSON : MAX_IMAGE)) return fail(`${name} is too large to be part of a handoff.`);
      files.set(name, fs.readFileSync(full));
    }
  } else {
    if (stat.size > MAX_TOTAL + 1024 * 1024) return fail('That file is too large to be a handoff package.');
    files = readZipEntries(fs.readFileSync(src), allowedName);
  }
  const jsonName = [...files.keys()].find((k) => k.toLowerCase() === 'handoff.json');
  if (!jsonName) return fail('No handoff.json found in the package. Export it again from the engine.');
  let raw: any;
  try {raw = JSON.parse(files.get(jsonName)!.toString('utf8').replace(/^﻿/, ''));} catch (e) {return fail(`handoff.json is not valid JSON (${(e as Error).message}).`);}
  if (typeof raw?.handoffVersion === 'number' && raw.handoffVersion > 1) return fail(`This package was made by a newer export (version ${raw.handoffVersion}). Update the plug-in, then import it again.`);
  const parsed = handoffSchema.safeParse(raw);
  if (!parsed.success) return fail(`The handoff has problems:\n${parsed.error.issues.map((i) => `  - ${i.path.join('.') || 'handoff.json'}: ${i.message}`).join('\n')}`);
  if (parsed.data.handoffVersion !== 1) return fail('handoffVersion must be 1.');
  const th = parsed.data.thumbnail;
  if (th && ![...files.keys()].some((k) => k === th.file)) return fail(`thumbnail.file is "${th.file}" but that file is not in the package.`);
  const stem = stat.isDirectory() ? path.basename(path.resolve(src)) : path.basename(src);
  const slug = slugify(stem) || slugify(parsed.data.title) || 'handoff';
  return {slug, data: parsed.data, files};
}

export function summarize(h: Handoff, slug: string, hasThumb: boolean): string {
  const n = NEEDS[h.type];
  const lines = [
    `Handoff "${h.title}" (${slug})`,
    `Video type: ${h.type}${h.format ? `, ${h.format}` : ''}`,
    `From: ${h.source.engines.join(', ')} engine${h.source.engines.length > 1 ? 's' : ''}`,
    h.script ? `Script: ${h.script.sections.length} section${h.script.sections.length === 1 ? '' : 's'}, ${h.script.text.split(/\s+/).filter(Boolean).length} words` : 'Script: none',
    `Shorts: ${h.shorts?.length ?? 0}`,
    `Thumbnail: ${hasThumb ? h.thumbnail!.file : 'none'}`,
    '',
    `Next, bring ${n.bring}.`,
    n.uses,
  ];
  if (!h.script && !n.scriptNeeded) lines.push('There is no script in this package. That is fine for this type; the clip is transcribed instead.');
  return lines.join('\n');
}

export function importPackage(src: string, projectRoot: string): {slug: string; dir: string; summary: string; replaced?: string} {
  const {slug, data, files} = loadPackage(src);
  const base = path.join(projectRoot, 'content', 'handoffs');
  const dir = path.join(base, slug);
  let replaced: string | undefined;
  if (fs.existsSync(dir)) {
    replaced = `${slug}-replaced-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`;
    fs.renameSync(dir, path.join(base, replaced));
  }
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'handoff.json'), JSON.stringify(data, null, 2));
  const script = [...files.entries()].find(([k]) => k.toLowerCase() === 'script.txt');
  fs.writeFileSync(path.join(dir, 'script.txt'), script ? script[1] : data.script?.text ?? '');
  const th = data.thumbnail && files.get(data.thumbnail.file);
  if (data.thumbnail && th) fs.writeFileSync(path.join(dir, data.thumbnail.file), th);
  return {slug, dir, replaced, summary: summarize(data, slug, !!th)};
}

export function readImported(projectRoot: string, slug: string): Handoff {
  const file = path.join(projectRoot, 'content', 'handoffs', slugify(slug), 'handoff.json');
  if (!fs.existsSync(file)) return fail(`No imported handoff named "${slug}". Import one first: npm run f48 -- handoff import <package>`);
  return handoffSchema.parse(JSON.parse(fs.readFileSync(file, 'utf8')));
}

/** Search terms per section: the engine's hints first, then the assistant's own terms from stock-terms.json. */
export function termsFor(projectRoot: string, slug: string, h: Handoff): {sectionId: string; heading?: string; terms: string[]}[] {
  const own = path.join(projectRoot, 'content', 'handoffs', slugify(slug), 'stock-terms.json');
  const extra: {sectionId: string; terms: string[]}[] = fs.existsSync(own) ? JSON.parse(fs.readFileSync(own, 'utf8')) : [];
  const out = new Map<string, string[]>();
  for (const t of [...(h.stock?.terms ?? []), ...extra]) out.set(t.sectionId, t.terms);
  return (h.script?.sections ?? []).map((s) => ({sectionId: s.id, heading: s.heading, terms: out.get(s.id) ?? []}));
}

export async function stockOptions(projectRoot: string, slug: string, opts: {orientation?: 'portrait' | 'landscape' | 'any'; per?: number}, fetcher: typeof fetch = fetch): Promise<string> {
  const h = readImported(projectRoot, slug);
  if (['talking-head', 'yap'].includes(h.type)) return 'Stock options are optional for a talking-head or yap. They would be cutaways, so ask the member which moments they want to cover first.';
  const orientation = opts.orientation ?? (h.format === 'landscape' ? 'landscape' : 'portrait');
  const rows = termsFor(projectRoot, slug, h);
  const missing = rows.filter((r) => !r.terms.length);
  if (missing.length === rows.length) return fail(`No search terms yet. Write 2 to 4 concrete words per section into content/handoffs/${slugify(slug)}/stock-terms.json as [{"sectionId":"s1","terms":["blank laptop screen night"]}], then run this again. The engine did not supply any.`);
  const allNotes = new Set<string>();
  const md: string[] = [`# Stock options for "${h.title}"`, '', 'Choose the clips you like. Only the ones you choose are downloaded.', ''];
  for (const r of rows) {
    md.push(`## ${r.sectionId}${r.heading ? `: ${r.heading}` : ''}`);
    if (!r.terms.length) {md.push('No search terms for this section yet.', ''); continue;}
    for (const term of r.terms) {
      let found: Awaited<ReturnType<typeof search>>;
      try {found = await search(term, {orientation, perPage: opts.per ?? 5}, fetcher);}
      catch (e) {return fail(`Could not reach Pexels or Pixabay (${(e as Error).message}). Check the internet connection and your keys (npm run f48 -- stock keys), then run this again.`);}
      const {results, notes} = found;
      for (const n of notes) allNotes.add(n);
      md.push(`### "${term}"`, '');
      if (!results.length) md.push('No matching clips. Try a simpler phrase.', '');
      results.forEach((c, i) => md.push(`${i + 1}. \`${c.ref}\`, ${c.durationSec}s, ${c.width}x${c.height}, by ${c.creator} on ${c.provider === 'pexels' ? 'Pexels' : 'Pixabay'}. ${c.pageUrl}`));
      md.push('');
      await savePreviews(results, fetcher).catch(() => []);
    }
  }
  if (allNotes.size) md.splice(4, 0, ...[...allNotes], '');
  const outDir = path.join(projectRoot, 'out', `handoff-${slugify(slug)}`);
  fs.mkdirSync(outDir, {recursive: true});
  const file = path.join(outDir, 'stock-options.md');
  fs.writeFileSync(file, md.join('\n'));
  return `Options saved to ${file}\nPreview images are in out/stock-preview/. Show them to the member and ask which they want. Download only the chosen ones with: npm run f48 -- stock pick <ref> --name <short-name>`;
}

export async function handoffCli(args: string[]): Promise<void> {
  const [sub, target, ...rest] = args;
  const flag = (n: string) => {const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : undefined;};
  const root = process.cwd();
  try {
    if (sub === 'check' || sub === 'import') {
      if (!target) return fail(`Usage: npm run f48 -- handoff ${sub} <package.f48handoff.zip | folder>`);
      if (sub === 'check') {
        const {slug, data, files} = loadPackage(target);
        console.log(`Valid.\n\n${summarize(data, slug, !!(data.thumbnail && files.has(data.thumbnail.file)))}`);
        return;
      }
      const r = importPackage(target, root);
      console.log(`Imported to ${path.relative(root, r.dir)}${r.replaced ? `\nThe earlier import of this slug was kept as content/handoffs/${r.replaced}` : ''}\n\n${r.summary}`);
      return;
    }
    if (sub === 'show') {
      if (!target) return fail('Usage: npm run f48 -- handoff show <slug>');
      const h = readImported(root, target);
      console.log(summarize(h, slugify(target), !!h.thumbnail && fs.existsSync(path.join(root, 'content', 'handoffs', slugify(target), h.thumbnail.file))));
      return;
    }
    if (sub === 'stock') {
      if (!target) return fail('Usage: npm run f48 -- handoff stock <slug> [--orientation portrait|landscape|any] [--per 5]');
      console.log(await stockOptions(root, target, {orientation: flag('orientation') as any, per: flag('per') ? Number(flag('per')) : undefined}));
      return;
    }
    return fail('Usage: npm run f48 -- handoff check|import <package> | handoff show <slug> | handoff stock <slug>');
  } catch (e) {
    if (e instanceof HandoffError) {console.error(e.message); process.exitCode = 1; return;}
    throw e;
  }
}
