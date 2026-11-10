/**
 * Optional stock footage from Pexels and Pixabay, using the member's OWN API keys.
 *
 *   npm run f48 -- stock keys                      which keys are set (never prints them)
 *   npm run f48 -- stock search "phrase" [--provider pexels|pixabay|both] [--orientation portrait|landscape|any] [--min-sec 4]
 *   npm run f48 -- stock pick pexels:123456 [--name city-walk]
 *   npm run f48 -- stock credits                   every clip used, with source link and creator credit
 *
 * Keys come from the environment (PEXELS_API_KEY, PIXABAY_API_KEY) or from stock-keys.json in the
 * project root. Keys never leave the member's computer except in requests to the provider itself.
 *
 * Provider rules this follows (check the current terms at pexels.com/api/documentation and pixabay.com/api/docs):
 * - Pixabay: search results are cached for 24 hours and reused; no hotlinking (clips are downloaded into
 *   the project before use); no systematic mass downloads (one clip per pick, picked by a person).
 * - Pexels: show Pexels and the creator as the source, link back to the clip page; stay within the rate limit.
 * - Both: every search result shows its provider, page link and creator; every picked clip is recorded in
 *   content/stock-credits.json with its source URL and creator credit.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PIXABAY_WIDE_PAGE = 50;

export type Provider = 'pexels' | 'pixabay';
export type StockResult = {
  ref: string; // provider:id, used with "stock pick"
  provider: Provider;
  id: string;
  pageUrl: string;
  creator: string;
  creatorUrl: string;
  durationSec: number;
  width: number;
  height: number;
  thumbnail: string;
  /** best download for this project's format, chosen from the provider's files */
  downloadUrl: string;
  downloadWidth: number;
  downloadHeight: number;
};

const CACHE_MS = 24 * 60 * 60 * 1000;
const root = () => process.cwd();
const cacheDir = () => path.join(root(), '.stock-cache');
const creditsFile = () => path.join(root(), 'content', 'stock-credits.json');
const lastSearchFile = () => path.join(cacheDir(), 'last-results.json');

export function readKeys(): Partial<Record<Provider, string>> {
  const keys: Partial<Record<Provider, string>> = {};
  const file = path.join(root(), 'stock-keys.json');
  if (fs.existsSync(file)) {
    try {
      const j = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (typeof j.pexels === 'string' && j.pexels.trim()) keys.pexels = j.pexels.trim();
      if (typeof j.pixabay === 'string' && j.pixabay.trim()) keys.pixabay = j.pixabay.trim();
    } catch {
      throw Error('stock-keys.json is not valid JSON. It should look like {"pexels": "your key", "pixabay": "your key"}.');
    }
  }
  if (process.env.PEXELS_API_KEY) keys.pexels = process.env.PEXELS_API_KEY.trim();
  if (process.env.PIXABAY_API_KEY) keys.pixabay = process.env.PIXABAY_API_KEY.trim();
  return keys;
}

const keyHelp = (p: Provider) =>
  p === 'pexels'
    ? 'No Pexels key. Get a free one at https://www.pexels.com/api/ (sign in, then "Your API Key"), and put it in stock-keys.json as {"pexels": "..."}. See docs/STOCK-FOOTAGE.md.'
    : 'No Pixabay key. Get a free one at https://pixabay.com/api/docs/ (sign in; the key shows under "Parameters"), and put it in stock-keys.json as {"pixabay": "..."}. See docs/STOCK-FOOTAGE.md.';

/** Pick the provider file closest to the target size without going far beyond it. */
export function bestFile<T extends {width: number; height: number}>(files: T[], target: {w: number; h: number}): T | undefined {
  const usable = files.filter((f) => f.width > 0 && f.height > 0);
  if (!usable.length) return undefined;
  const long = Math.max(target.w, target.h);
  const score = (f: T) => {
    const fl = Math.max(f.width, f.height);
    return fl >= long ? fl - long : (long - fl) * 3; // prefer at least the target size, avoid huge 4K files
  };
  return [...usable].sort((a, b) => score(a) - score(b))[0];
}

export function parsePexels(json: any, target: {w: number; h: number}): StockResult[] {
  return (json?.videos ?? []).map((v: any) => {
    const files = (v.video_files ?? []).filter((f: any) => (f.file_type ?? '').includes('mp4'));
    const f = bestFile(files as {width: number; height: number; link: string}[], target);
    return {
      ref: `pexels:${v.id}`,
      provider: 'pexels' as const,
      id: String(v.id),
      pageUrl: v.url,
      creator: v.user?.name ?? 'Unknown',
      creatorUrl: v.user?.url ?? v.url,
      durationSec: v.duration ?? 0,
      width: v.width ?? 0,
      height: v.height ?? 0,
      thumbnail: v.image ?? '',
      downloadUrl: f?.link ?? '',
      downloadWidth: f?.width ?? 0,
      downloadHeight: f?.height ?? 0,
    };
  }).filter((r: StockResult) => r.downloadUrl);
}

export function parsePixabay(json: any, target: {w: number; h: number}): StockResult[] {
  return (json?.hits ?? []).map((h: any) => {
    const sizes = Object.values(h.videos ?? {}).filter((s: any) => s?.url) as {url: string; width: number; height: number; thumbnail?: string}[];
    const f = bestFile(sizes, target);
    const big = sizes.sort((a, b) => b.width - a.width)[0];
    return {
      ref: `pixabay:${h.id}`,
      provider: 'pixabay' as const,
      id: String(h.id),
      pageUrl: h.pageURL,
      creator: h.user ?? 'Unknown',
      creatorUrl: h.user && h.user_id ? `https://pixabay.com/users/${h.user}-${h.user_id}/` : h.pageURL,
      durationSec: h.duration ?? 0,
      width: big?.width ?? 0,
      height: big?.height ?? 0,
      thumbnail: f?.thumbnail ?? big?.thumbnail ?? '',
      downloadUrl: f?.url ?? '',
      downloadWidth: f?.width ?? 0,
      downloadHeight: f?.height ?? 0,
    };
  }).filter((r: StockResult) => r.downloadUrl);
}

/** Cached GET. Pixabay requires caching search results for 24 hours; the same cache is used for Pexels. */
async function cachedJson(url: string, headers: Record<string, string>, label: string, fetcher: typeof fetch): Promise<any> {
  fs.mkdirSync(cacheDir(), {recursive: true});
  // the cache key leaves out the key itself, so stock-cache never stores a secret
  const safeUrl = url.replace(/([?&]key=)[^&]+/, '$1hidden');
  const file = path.join(cacheDir(), crypto.createHash('sha1').update(safeUrl).digest('hex') + '.json');
  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < CACHE_MS) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const res = await fetcher(url, {headers});
  if (res.status === 429) throw Error(`${label} says too many requests. Wait a while before searching again (provider rate limit).`);
  if (res.status === 401 || res.status === 403) throw Error(`${label} rejected the API key. Check stock-keys.json.`);
  if (!res.ok) throw Error(`${label} search failed (HTTP ${res.status}).`);
  const json = await res.json();
  fs.writeFileSync(file, JSON.stringify(json));
  return json;
}

export async function search(
  phrase: string,
  opts: {provider?: Provider | 'both'; orientation?: 'portrait' | 'landscape' | 'any'; minSec?: number; perPage?: number},
  fetcher: typeof fetch = fetch,
): Promise<{results: StockResult[]; notes: string[]}> {
  const q = phrase.trim();
  if (!q) throw Error('Give a search phrase, for example: stock search "woman walking city night"');
  if (q.length > 100) throw Error('Keep search phrases under 100 characters (Pixabay limit).');
  const keys = readKeys();
  const want: Provider[] = opts.provider && opts.provider !== 'both' ? [opts.provider] : ['pexels', 'pixabay'];
  const orientation = opts.orientation ?? 'portrait';
  const target = orientation === 'landscape' ? {w: 1920, h: 1080} : {w: 1080, h: 1920};
  const per = Math.min(Math.max(opts.perPage ?? 8, 3), 20);
  const notes: string[] = [];
  let results: StockResult[] = [];
  const fits = (r: StockResult) => orientation === 'any' || (orientation === 'portrait' ? r.height >= r.width : r.width >= r.height);
  for (const p of want) {
    const key = keys[p];
    if (!key) {
      notes.push(keyHelp(p));
      continue;
    }
    let found: StockResult[];
    if (p === 'pexels') {
      const o = orientation === 'any' ? '' : `&orientation=${orientation}`;
      const json = await cachedJson(`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=${per}${o}`, {Authorization: key}, 'Pexels', fetcher);
      found = parsePexels(json, target);
    } else {
      // Pixabay has no orientation filter, so ask for a wider page and filter here. Otherwise a page of
      // eight landscape-heavy hits can leave a portrait search empty even when portrait clips exist further down.
      const ask = orientation === 'any' ? per : PIXABAY_WIDE_PAGE;
      const json = await cachedJson(`https://pixabay.com/api/videos/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&per_page=${ask}&safesearch=true`, {}, 'Pixabay', fetcher);
      found = parsePixabay(json, target);
    }
    const kept = found.filter(fits);
    const label = p === 'pexels' ? 'Pexels' : 'Pixabay';
    if (found.length && !kept.length) {
      notes.push(`${label}: ${found.length} clips matched, but none are ${orientation}. Add --orientation any to see them (they will need cropping).`);
    } else if (kept.length < found.length && orientation !== 'any') {
      notes.push(`${label}: ${found.length - kept.length} ${orientation === 'portrait' ? 'landscape' : 'portrait'} clips hidden. Add --orientation any to see them.`);
    }
    results.push(...kept.slice(0, per));
  }
  if (opts.minSec) results = results.filter((r) => r.durationSec >= opts.minSec!);
  fs.mkdirSync(cacheDir(), {recursive: true});
  // remembered so "stock pick" can download exactly what the member saw, without searching again
  const prev = fs.existsSync(lastSearchFile()) ? JSON.parse(fs.readFileSync(lastSearchFile(), 'utf8')) : {};
  for (const r of results) prev[r.ref] = {...r, phrase: q, seenAt: new Date().toISOString()};
  fs.writeFileSync(lastSearchFile(), JSON.stringify(prev, null, 1));
  return {results, notes};
}

export function formatResults(results: StockResult[]): string {
  if (!results.length) return 'No matching clips. Try a simpler phrase (2 to 4 concrete words) or --orientation any.';
  return results
    .map((r, i) => `${i + 1}. ${r.ref}  ${r.durationSec}s  ${r.width}x${r.height} (download ${r.downloadWidth}x${r.downloadHeight})\n   by ${r.creator} on ${r.provider === 'pexels' ? 'Pexels' : 'Pixabay'}: ${r.pageUrl}\n   preview: ${r.thumbnail}`)
    .join('\n');
}

/** Saves the preview images (small thumbnails only, never the videos) so the member can see the options. */
export async function savePreviews(results: StockResult[], fetcher: typeof fetch = fetch): Promise<string[]> {
  const dir = path.join(root(), 'out', 'stock-preview');
  fs.mkdirSync(dir, {recursive: true});
  const saved: string[] = [];
  for (const r of results) {
    if (!r.thumbnail) continue;
    try {
      const res = await fetcher(r.thumbnail);
      if (!res.ok) continue;
      const file = path.join(dir, `${r.provider}-${r.id}.jpg`);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      saved.push(file);
    } catch {
      /* a missing preview is not fatal */
    }
  }
  return saved;
}

export async function pick(ref: string, name: string | undefined, fetcher: typeof fetch = fetch): Promise<{file: string; credit: any}> {
  if (!/^(pexels|pixabay):\d+$/.test(ref)) throw Error('Pick one clip by its ref from the search results, for example: stock pick pexels:123456');
  const seen = fs.existsSync(lastSearchFile()) ? JSON.parse(fs.readFileSync(lastSearchFile(), 'utf8')) : {};
  const r: StockResult & {phrase?: string} = seen[ref];
  if (!r) throw Error(`${ref} is not in your recent search results. Search first, look at the options, then pick one.`);
  const slug = (name ?? `${r.provider}-${r.id}`).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
  const rel = `stock/${slug}.mp4`;
  const dest = path.join(root(), 'public', rel);
  if (fs.existsSync(dest)) throw Error(`public/${rel} already exists. Choose another --name.`);
  const res = await fetcher(r.downloadUrl);
  if (!res.ok) throw Error(`Download failed (HTTP ${res.status}). Try again later or pick another clip.`);
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  const credit = {
    file: rel,
    provider: r.provider === 'pexels' ? 'Pexels' : 'Pixabay',
    sourceUrl: r.pageUrl,
    creator: r.creator,
    creatorUrl: r.creatorUrl,
    creditLine: `Video by ${r.creator} on ${r.provider === 'pexels' ? 'Pexels' : 'Pixabay'}`,
    license: r.provider === 'pexels' ? 'Pexels License (https://www.pexels.com/license/)' : 'Pixabay Content License (https://pixabay.com/service/license-summary/)',
    searchPhrase: r.phrase ?? '',
    size: `${r.downloadWidth}x${r.downloadHeight}`,
    downloadedAt: new Date().toISOString(),
  };
  const credits = fs.existsSync(creditsFile()) ? JSON.parse(fs.readFileSync(creditsFile(), 'utf8')) : [];
  credits.push(credit);
  fs.mkdirSync(path.dirname(creditsFile()), {recursive: true});
  fs.writeFileSync(creditsFile(), JSON.stringify(credits, null, 2));
  return {file: rel, credit};
}

export function credits(): string {
  if (!fs.existsSync(creditsFile())) return 'No stock clips picked yet.';
  const list = JSON.parse(fs.readFileSync(creditsFile(), 'utf8')) as any[];
  return list.map((c) => `${c.file}: ${c.creditLine}. ${c.sourceUrl}`).join('\n');
}

export async function stockCli(args: string[]): Promise<void> {
  const [sub, ...rest] = args;
  const flag = (n: string) => {
    const i = rest.indexOf(`--${n}`);
    return i >= 0 ? rest[i + 1] : undefined;
  };
  if (sub === 'keys') {
    const k = readKeys();
    console.log(`Pexels key: ${k.pexels ? 'set' : 'not set'}\nPixabay key: ${k.pixabay ? 'set' : 'not set'}`);
    if (!k.pexels) console.log(keyHelp('pexels'));
    if (!k.pixabay) console.log(keyHelp('pixabay'));
    return;
  }
  if (sub === 'search') {
    const phrase = rest.filter((x, i) => !x.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--'))).join(' ');
    const {results, notes} = await search(phrase, {
      provider: (flag('provider') as any) ?? 'both',
      orientation: (flag('orientation') as any) ?? 'portrait',
      minSec: flag('min-sec') ? Number(flag('min-sec')) : undefined,
    });
    for (const n of notes) console.log(n);
    console.log(formatResults(results));
    const previews = await savePreviews(results);
    if (previews.length) console.log(`\nPreview images saved in out/stock-preview/ (${previews.length}). Show them to the member, then pick one with: npm run f48 -- stock pick <ref> --name <short-name>`);
    return;
  }
  if (sub === 'pick') {
    const {file, credit} = await pick(rest[0], flag('name'));
    console.log(`Saved public/${file}\n${credit.creditLine}. ${credit.sourceUrl}\nRecorded in content/stock-credits.json. Use "${file}" as a shot src.`);
    return;
  }
  if (sub === 'credits') {
    console.log(credits());
    return;
  }
  throw Error('Usage: npm run f48 -- stock keys | stock search "phrase" [--provider pexels|pixabay|both] [--orientation portrait|landscape|any] [--min-sec N] | stock pick <provider:id> [--name short-name] | stock credits');
}
