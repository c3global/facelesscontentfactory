import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {handoffSchema, loadPackage, importPackage, readZipEntries, termsFor, readImported, stockOptions, NEEDS, VIDEO_TYPES} from './handoff';

const good = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'handoff-example', 'handoff.json'), 'utf8'));
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'f48-handoff-'));

/** A tiny zip writer for tests: [name, data, deflate?] */
function zip(entries: [string, Buffer | string, boolean?][]): Buffer {
  const locals: Buffer[] = [], central: Buffer[] = [];
  let off = 0;
  for (const [name, d, deflate] of entries) {
    const raw = Buffer.from(d), body = deflate ? zlib.deflateRawSync(raw) : raw, nm = Buffer.from(name);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(deflate ? 8 : 0, 8); lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nm.length, 26);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(deflate ? 8 : 0, 10); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, nm, body); central.push(ch, nm);
    off += 30 + nm.length + body.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}
const png = fs.readFileSync(path.join(__dirname, '..', 'docs', 'handoff-example', 'thumbnail.png'));
const bad = (h: any) => handoffSchema.safeParse(h);

test('the shipped example passes, and every video type is accepted with what it needs', () => {
  assert(handoffSchema.safeParse(good).success);
  for (const type of VIDEO_TYPES) assert(NEEDS[type].bring.length > 10);
  for (const type of ['talking-head', 'yap']) assert(handoffSchema.safeParse({...good, type, script: undefined, shorts: undefined, thumbnail: undefined, stock: undefined}).success, `${type} needs no script`);
  for (const type of ['explainer', 'faceless']) assert(!handoffSchema.safeParse({...good, type, script: undefined, stock: undefined}).success, `${type} needs a script`);
  assert(handoffSchema.safeParse({...good, type: 'life-scene'}).success);
  assert(!handoffSchema.safeParse({...good, type: 'life-scene', script: undefined, shorts: [], stock: undefined}).success);
});

test('the schema names the exact field that is wrong', () => {
  assert(!bad({...good, type: 'podcast'}).success);
  assert(!bad({...good, title: ''}).success);
  assert(!bad({...good, createdAt: 'yesterday'}).success);
  assert(!bad({...good, script: {...good.script, sections: [good.script.sections[0], {...good.script.sections[1], id: 's1'}]}}).success, 'duplicate section ids');
  assert(!bad({...good, shorts: [{...good.shorts[0], fromSections: ['nope']}]}).success, 'short points at a missing section');
  assert(!bad({...good, stock: {terms: [{sectionId: 'nope', terms: ['x y']}]}}).success);
  assert(!bad({...good, script: {...good.script, sections: [{id: 's1', text: '<b>Hi</b>'}]}}).success, 'html is refused');
  assert(!bad({...good, thumbnail: {file: '../x.png'}}).success, 'thumbnail path escape');
  assert(!bad({...good, script: {text: 'x', sections: [{id: 's1', text: '  '}]}}).success, 'blank section');
  assert(bad({...good, unknownField: 1}).success, 'unknown fields are ignored');
});

test('loads a zip, a zip made from a folder, and a plain folder', () => {
  const d = tmp();
  const files: [string, Buffer | string, boolean?][] = [['handoff.json', JSON.stringify(good), true], ['script.txt', 'hi'], ['thumbnail.png', png]];
  fs.writeFileSync(path.join(d, 'my-video.f48handoff.zip'), zip(files));
  const a = loadPackage(path.join(d, 'my-video.f48handoff.zip'));
  assert.equal(a.slug, 'my-video'); assert(a.files.has('thumbnail.png'));
  fs.writeFileSync(path.join(d, 'wrapped.zip'), zip([['wrapped/handoff.json', JSON.stringify(good)], ['wrapped/thumbnail.png', png], ['__MACOSX/._handoff.json', 'junk']]));
  assert.equal(loadPackage(path.join(d, 'wrapped.zip')).slug, 'wrapped');
  assert.equal(loadPackage(path.join(__dirname, '..', 'docs', 'handoff-example')).slug, 'handoff-example');
});

test('refuses broken, hostile and mismatched packages with plain messages', () => {
  const d = tmp();
  const w = (n: string, b: Buffer | string) => {fs.writeFileSync(path.join(d, n), b); return path.join(d, n);};
  assert.throws(() => loadPackage(w('a.zip', 'not a zip')), /not a valid zip/);
  assert.throws(() => loadPackage(w('b.zip', zip([['script.txt', 'x']]))), /No handoff.json/);
  assert.throws(() => loadPackage(w('c.zip', zip([['handoff.json', '{nope']]))), /not valid JSON/);
  assert.throws(() => loadPackage(w('d.zip', zip([['handoff.json', JSON.stringify({...good, handoffVersion: 2})]]))), /newer export/);
  assert.throws(() => loadPackage(w('e.zip', zip([['handoff.json', JSON.stringify(good)]]))), /thumbnail.file is "thumbnail.png"/);
  assert.throws(() => loadPackage(w('f.zip', zip([['handoff.json', JSON.stringify({...good, type: 'podcast'})]]))), /type: must be one of/);
  // path escape and extra files are never read
  const sneaky = readZipEntries(zip([['../../evil.json', 'x'], ['/abs/handoff.json', 'x'], ['notes/deep/handoff.json', 'x'], ['handoff.json', '{}'], ['run.sh', 'rm -rf']]), (n) => /^handoff\.json$/.test(n));
  assert.deepEqual([...sneaky.keys()], ['handoff.json']);
  // a zip bomb is stopped by the size cap
  assert.throws(() => readZipEntries(zip([['handoff.json', Buffer.alloc(3 * 1024 * 1024, 65), true]]), (n) => n === 'handoff.json'), /too large|larger than allowed/);
});

test('import saves the files, and a second import keeps the first', () => {
  const d = tmp(), root = tmp();
  const pkg = path.join(d, 'vid.f48handoff.zip');
  fs.writeFileSync(pkg, zip([['handoff.json', JSON.stringify(good), true], ['thumbnail.png', png]]));
  const r = importPackage(pkg, root);
  assert(fs.existsSync(path.join(r.dir, 'handoff.json')) && fs.existsSync(path.join(r.dir, 'thumbnail.png')));
  assert.equal(fs.readFileSync(path.join(r.dir, 'script.txt'), 'utf8'), good.script.text, 'script.txt is written from the script when the package has none');
  assert.match(r.summary, /Next, bring your voiceover audio file/);
  assert.match(r.summary, /does not create voiceovers/);
  const again = importPackage(pkg, root);
  assert(again.replaced && fs.existsSync(path.join(root, 'content', 'handoffs', again.replaced, 'handoff.json')));
  assert.equal(readImported(root, 'vid').title, good.title);
});

test('search terms come from the engine first, then from the assistant, per section', () => {
  const root = tmp(), pkg = path.join(root, 'v.zip');
  fs.writeFileSync(pkg, zip([['handoff.json', JSON.stringify(good)], ['thumbnail.png', png]]));
  importPackage(pkg, root);
  const h = readImported(root, 'v');
  assert.deepEqual(termsFor(root, 'v', h).map((r) => r.terms.length), [1, 0, 0]);
  fs.writeFileSync(path.join(root, 'content', 'handoffs', 'v', 'stock-terms.json'), JSON.stringify([{sectionId: 's2', terms: ['person typing laptop']}]));
  assert.deepEqual(termsFor(root, 'v', h).map((r) => r.terms.length), [1, 1, 0]);
});

test('stock options search each section, show previews and credits, and never download', async () => {
  const root = tmp(), pkg = path.join(root, 'v.zip');
  fs.writeFileSync(pkg, zip([['handoff.json', JSON.stringify(good)], ['thumbnail.png', png]]));
  importPackage(pkg, root);
  const cwd = process.cwd(); process.chdir(root);
  process.env.PEXELS_API_KEY = 'k'; delete process.env.PIXABAY_API_KEY;
  let downloads = 0;
  const fetcher: any = async (url: string) => {
    if (/pexels\.com\/videos\/search/.test(url)) return {ok: true, status: 200, json: async () => ({videos: [{id: 7, url: 'https://pexels.com/video/7', duration: 8, width: 1920, height: 1080, image: '', user: {name: 'Ana'}, video_files: [{link: 'https://x/7.mp4', width: 1920, height: 1080, file_type: 'video/mp4'}]}]})};
    downloads++; return {ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(4), headers: new Map()};
  };
  try {
    const out = await stockOptions(root, 'v', {orientation: 'landscape'}, fetcher);
    assert.match(out, /stock-options\.md/);
    const md = fs.readFileSync(path.join(root, 'out', 'handoff-v', 'stock-options.md'), 'utf8');
    assert.match(md, /pexels:7/); assert.match(md, /by Ana on Pexels/); assert.match(md, /No search terms for this section yet/);
    assert(!fs.existsSync(path.join(root, 'public', 'stock')), 'nothing is downloaded until the member chooses');
  } finally {process.chdir(cwd); delete process.env.PEXELS_API_KEY;}
});
