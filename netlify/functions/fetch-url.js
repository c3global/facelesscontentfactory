// POST { url }  →  { text, title, source_url }
// Server-side fetch of a public URL with basic HTML → text extraction.
// Used by the Brand sample trainer so users can pull in past content
// directly from a Substack post, blog article, LinkedIn article, etc.
//
// Auth-gated (must be a signed-in Cadence user). No third-party
// scraping libraries — we do a light readability heuristic in pure JS.

import { requireUser } from './lib/supabase-admin.js';

const MAX_BYTES = 2 * 1024 * 1024;  // 2 MB cap on the fetched HTML
const FETCH_TIMEOUT_MS = 15_000;

export async function handler(event) {
  if (event.httpMethod !== 'POST') return resp(405, 'Method not allowed');

  const auth = await requireUser(event);
  if (auth.error) return auth.error;

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return resp(400, 'Invalid JSON'); }

  const url = (body.url || '').trim();
  if (!url) return resp(400, 'Missing url');

  let parsed;
  try { parsed = new URL(url); }
  catch { return resp(400, 'Invalid URL'); }
  if (!/^https?:$/.test(parsed.protocol)) {
    return resp(400, 'URL must use http or https');
  }

  let html;
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(parsed.toString(), {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        // Some sites block obvious bots; use a benign UA
        'User-Agent': 'Mozilla/5.0 (compatible; CadenceContentImporter/1.0; +https://cadencefcc.netlify.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return resp(res.status, `Fetch failed: ${res.status} ${res.statusText}`);
    const ct = res.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml/.test(ct)) {
      return resp(415, `Unsupported content-type: ${ct}. URL importer reads HTML pages only.`);
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return resp(413, 'Page is too large to import.');
    }
    html = new TextDecoder('utf-8').decode(buf);
  } catch (e) {
    if (e.name === 'AbortError') return resp(504, 'Fetch timed out');
    return resp(500, `Fetch error: ${e.message}`);
  }

  const { text, title } = extractReadable(html);
  if (!text || text.length < 80) {
    return resp(422, 'No readable text found on the page. Try pasting the content directly.');
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      title: title || parsed.hostname,
      source_url: parsed.toString(),
    }),
  };
}

// ---------------------------------------------------------------------------
// Minimal-but-effective readability extraction:
// 1. Strip script/style/nav/header/footer/aside/form/svg blocks
// 2. Pull the title from <title> or <meta og:title>
// 3. Prefer <article>, <main>, or the largest block of paragraph text
// 4. Collapse whitespace, decode entities
// ---------------------------------------------------------------------------

function extractReadable(html) {
  const title = extractTitle(html);
  // Strip elements we never want in the body text
  let body = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|svg|iframe|nav|header|footer|aside|form)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|noscript|svg|iframe)\b[^>]*\/>/gi, '');

  // If there's an <article> or <main>, prefer that subtree
  const articleMatch = body.match(/<(article|main)\b[^>]*>([\s\S]*?)<\/\1>/i);
  if (articleMatch) body = articleMatch[2];

  // Split into block-level chunks, keep the ones with real prose
  const chunks = body.split(/<\/?(?:p|div|section|li|h[1-6]|blockquote|br)\b[^>]*>/i)
    .map((chunk) => stripTags(chunk))
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 30);

  const text = chunks.join('\n\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return { text, title };
}

function extractTitle(html) {
  const og = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
  if (og) return decodeEntities(og[1]).trim();
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (t) return decodeEntities(stripTags(t[1])).trim();
  return '';
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, ''));
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function resp(statusCode, body) { return { statusCode, body }; }
