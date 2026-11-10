import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {bestFile, parsePexels, parsePixabay, search, pick} from './stock';

const pexelsJson = {videos: [{id: 11, url: 'https://www.pexels.com/video/11/', duration: 9, width: 1080, height: 1920, image: 'https://img/11.jpg', user: {name: 'Ana', url: 'https://www.pexels.com/@ana'},
  video_files: [{file_type: 'video/mp4', width: 720, height: 1280, link: 'https://v/11-720'}, {file_type: 'video/mp4', width: 1080, height: 1920, link: 'https://v/11-1080'}, {file_type: 'video/mp4', width: 2160, height: 3840, link: 'https://v/11-4k'}]},
  {id: 12, url: 'https://www.pexels.com/video/12/', duration: 3, width: 1920, height: 1080, image: '', user: {name: 'Bo', url: ''}, video_files: [{file_type: 'video/mp4', width: 1920, height: 1080, link: 'https://v/12'}]}]};
const pixabayJson = {hits: [{id: 21, pageURL: 'https://pixabay.com/videos/x-21/', duration: 12, user: 'cal', user_id: 5,
  videos: {large: {url: 'https://p/21-l', width: 2160, height: 3840, thumbnail: 'https://t/21'}, medium: {url: 'https://p/21-m', width: 1080, height: 1920, thumbnail: 'https://t/21m'}, tiny: {url: 'https://p/21-t', width: 360, height: 640}}}]};

function fakeFetch(calls: string[]) {
  return (async (url: string) => {
    calls.push(String(url));
    const body = String(url).includes('pexels') ? pexelsJson : String(url).includes('pixabay.com/api') ? pixabayJson : 'VIDEO';
    return {ok: true, status: 200, json: async () => body, arrayBuffer: async () => new TextEncoder().encode('fake').buffer} as any;
  }) as unknown as typeof fetch;
}

test('best file prefers the target size over 4K and small files', () => {
  assert.equal(bestFile([{width: 720, height: 1280}, {width: 1080, height: 1920}, {width: 2160, height: 3840}], {w: 1080, h: 1920})!.width, 1080);
});

test('results carry provider, page link and creator credit', () => {
  const [p] = parsePexels(pexelsJson, {w: 1080, h: 1920});
  assert.equal(p.ref, 'pexels:11');
  assert.equal(p.pageUrl, 'https://www.pexels.com/video/11/');
  assert.equal(p.creator, 'Ana');
  assert.equal(p.downloadUrl, 'https://v/11-1080');
  const [x] = parsePixabay(pixabayJson, {w: 1080, h: 1920});
  assert.equal(x.creatorUrl, 'https://pixabay.com/users/cal-5/');
  assert.equal(x.downloadUrl, 'https://p/21-m');
});

test('search needs keys, caches for 24 hours, filters orientation, and pick records the credit', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f48-stock-'));
  const cwd = process.cwd();
  process.chdir(dir);
  delete process.env.PEXELS_API_KEY; // a member's real keys in the environment must not leak into this test
  delete process.env.PIXABAY_API_KEY;
  try {
    const none = await search('city at night', {}, fakeFetch([]));
    assert.equal(none.results.length, 0);
    assert.equal(none.notes.length, 2, 'explains how to get both keys');
    fs.writeFileSync('stock-keys.json', JSON.stringify({pexels: 'PK', pixabay: 'XK'}));
    const calls: string[] = [];
    const a = await search('city at night', {}, fakeFetch(calls));
    assert.deepEqual(a.results.map((r) => r.ref).sort(), ['pexels:11', 'pixabay:21'], 'landscape clip filtered out of a portrait search');
    await search('city at night', {}, fakeFetch(calls));
    assert.equal(calls.length, 2, 'second identical search is served from the cache');
    for (const f of fs.readdirSync('.stock-cache')) assert.ok(!fs.readFileSync(path.join('.stock-cache', f), 'utf8').includes('XK'), 'cache never stores the key');
    await assert.rejects(pick('pexels:999', undefined, fakeFetch([])), /not in your recent search results/);
    const got = await pick('pexels:11', 'Night Walk', fakeFetch([]));
    assert.equal(got.file, 'stock/night-walk.mp4');
    assert.ok(fs.existsSync('public/stock/night-walk.mp4'));
    const credits = JSON.parse(fs.readFileSync('content/stock-credits.json', 'utf8'));
    assert.equal(credits[0].sourceUrl, 'https://www.pexels.com/video/11/');
    assert.equal(credits[0].creditLine, 'Video by Ana on Pexels');
    await assert.rejects(pick('pexels:11', 'Night Walk', fakeFetch([])), /already exists/);
  } finally {
    process.chdir(cwd);
  }
});

test('Pixabay portrait search asks for a wide page, finds portrait clips below the first hits, and explains what it hid', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f48-stock-'));
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    delete process.env.PEXELS_API_KEY;
    delete process.env.PIXABAY_API_KEY;
    fs.writeFileSync('stock-keys.json', JSON.stringify({pixabay: 'XK'}));
    const land = (id: number) => ({id, pageURL: `https://pixabay.com/videos/id-${id}/`, duration: 10, user: 'dee', user_id: 7, videos: {large: {url: `https://p/${id}`, width: 1920, height: 1080, thumbnail: `https://t/${id}`}}});
    const hits = [...Array.from({length: 9}, (_, i) => land(100 + i)), pixabayJson.hits[0]];
    const calls: string[] = [];
    const fetcher = (async (url: string) => {
      calls.push(String(url));
      return {ok: true, status: 200, json: async () => ({hits}), arrayBuffer: async () => new ArrayBuffer(0)} as any;
    }) as unknown as typeof fetch;
    const a = await search('desk at night', {provider: 'pixabay'}, fetcher);
    assert.deepEqual(a.results.map((r) => r.ref), ['pixabay:21'], 'portrait clip ranked tenth is found');
    assert.match(calls[0], /per_page=50/);
    assert.ok(a.notes.some((n) => /9 landscape clips hidden/.test(n)));

    const onlyLand = (async () => ({ok: true, status: 200, json: async () => ({hits: hits.slice(0, 9)}), arrayBuffer: async () => new ArrayBuffer(0)} as any)) as unknown as typeof fetch;
    const b = await search('another desk', {provider: 'pixabay'}, onlyLand);
    assert.equal(b.results.length, 0);
    assert.ok(b.notes.some((n) => /none are portrait.*--orientation any/.test(n)), 'says why the list is empty instead of a bare "No matching clips"');

    const c = await search('desk at night', {provider: 'pixabay', orientation: 'any'}, fetcher);
    assert.equal(c.results.length, 8, 'results trimmed to the requested page size');
    assert.match(calls[calls.length - 1], /per_page=8/);
  } finally {
    process.chdir(cwd);
  }
});
