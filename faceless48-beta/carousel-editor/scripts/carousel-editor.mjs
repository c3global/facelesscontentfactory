import {createServer} from 'node:http';
import {access, mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {z} from 'zod';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = await realpath(path.join(root, 'public'));
const port = Number(process.env.CAROUSEL_EDITOR_PORT ?? 4412);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid CAROUSEL_EDITOR_PORT.');
const url = `http://127.0.0.1:${port}/`;
const editDirectory = 'content/carousel-edits';
async function listFiles(directory) {
  try {
    return (await readdir(directory, {withFileTypes: true})).filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}
const plans = new Map();
for (const directory of ['content/examples', 'content/carousel-plans']) {
  for (const file of await listFiles(path.join(root, directory))) {
    if (!file.endsWith('.json')) continue;
    const original = JSON.parse(await readFile(path.join(root, directory, file), 'utf8'));
    if (!original.c3ContentGrid || original.kind !== 'video-carousel' || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(original.slug)) {
      throw new Error(`Expected a video carousel plan with c3ContentGrid and a valid slug: ${file}`);
    }
    if (plans.has(original.slug)) throw new Error(`Duplicate carousel slug: ${original.slug}`);
    plans.set(original.slug, original);
  }
}
const iconPattern = /^[a-z0-9-]+\.(?:png|webp|jpe?g|svg)$/;
const library = [];
const quickIcons = [];
for (const [directory, icons, category] of [['carousel-icons', quickIcons, 'Quick picks'], ['carousel-icons/library', library, 'Library']]) {
  for (const file of await listFiles(path.join(publicRoot, directory))) {
    if (!iconPattern.test(file)) continue;
    const name = file.replace(/\.[^.]+$/, '').replaceAll('-', ' ');
    icons.push({src: `${directory}/${file}`, name, category});
  }
}
const spriteFiles = (await listFiles(path.join(publicRoot, 'portraits/sprites'))).filter((file) => /^[a-z0-9-]+\.png$/.test(file));
const saveSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,119}$/),
  slides: z.array(z.object({
    headline: z.string().max(140).optional(),
    headlineWidth: z.number().int().min(340).max(970).nullable().optional(),
    layerOrder: z.array(z.string().regex(/^(?:sprite|headline|content|item:[a-z][a-z0-9-]{0,50}|headline-part:[0-9]{1,3})$/))
      .max(80).refine((order) => new Set(order).size === order.length).nullable().optional(),
    graphicPlacement: z.object({
      x: z.number().min(-460).max(460),
      y: z.number().min(-520).max(520),
      scale: z.number().min(0.55).max(1.45),
      rotation: z.number().min(-180).max(180).optional(),
    }).nullable(),
    headlineOffset: z.object({
      x: z.number().min(-520).max(520),
      y: z.number().min(-500).max(500),
      rotation: z.number().min(-180).max(180).optional(),
    }).nullable().optional(),
    elementOffsets: z.record(z.string().regex(/^[a-z][a-z0-9-]{0,50}$/), z.object({
      x: z.number().min(-1080).max(1080),
      y: z.number().min(-1350).max(1350),
      rotation: z.number().min(-180).max(180).optional(),
    })).refine((offsets) => Object.keys(offsets).length <= 60).nullable().optional(),
    icon: z.object({
      src: z.string().regex(/^carousel-icons\/(?:library\/)?[a-z0-9-]+\.(?:png|webp|jpe?g|svg)$/),
      align: z.enum(['left', 'center', 'right']),
      size: z.number().min(60).max(155),
    }).nullable(),
    spriteEdit: z.object({
      src: z.string().regex(/^portraits\/sprites\/[a-z0-9-]+\.png$/).nullable(),
      x: z.number().min(-1080).max(1080),
      y: z.number().min(-1350).max(1350),
      scale: z.number().min(0.2).max(1.5),
      flip: z.boolean(),
      rotation: z.number().min(-180).max(180).optional(),
    }).nullable().optional(),
  })).min(1).max(10),
});
const openBrowser = () => {
  if (process.platform === 'darwin' && !process.argv.includes('--no-open')) spawn('open', [url], {stdio: 'ignore'}).unref();
};
const html = await readFile(path.join(root, 'src/carousel-editor/index.html'));
const {outputFiles: [bundle]} = await build({
  absWorkingDir: root,
  entryPoints: ['src/carousel-editor/index.tsx'],
  bundle: true,
  write: false,
  minify: true,
  platform: 'browser',
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.CAROUSEL_PLANS': JSON.stringify([...plans.values()]),
    'process.env.CAROUSEL_ICON_LIBRARY': JSON.stringify([...quickIcons, ...library]),
    'process.env.CAROUSEL_QUICK_ICONS': JSON.stringify(quickIcons),
    'process.env.CAROUSEL_SPRITE_FILES': JSON.stringify(spriteFiles),
  },
});
const types = {
  '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.m4a': 'audio/mp4',
};

function json(response, status, data) {
  response.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'});
  response.end(JSON.stringify(data));
}

async function saveEdits(request, response) {
  if (request.headers.origin !== new URL(url).origin || request.headers['content-type'] !== 'application/json') {
    json(response, 403, {error: 'Open the Carousel Editor on this Mac to save changes.'});
    return;
  }
  let body = '';
  request.setEncoding('utf8');
  for await (const chunk of request) {
    body += chunk;
  if (body.length > 65536) {
      json(response, 413, {error: 'The edit is too large to save.'});
      return;
    }
  }
  let edit;
  try {
    edit = saveSchema.parse(JSON.parse(body));
  } catch {
    json(response, 400, {error: 'Check the slide adjustments and try saving again.'});
    return;
  }
  try {
    const original = plans.get(edit.slug);
    if (!original || original.slug !== edit.slug || original.kind !== 'video-carousel' || !original.c3ContentGrid || original.slides.length !== edit.slides.length) {
      json(response, 400, {error: 'The edit does not match the project carousel.'});
      return;
    }
    const assets = new Set(edit.slides.flatMap(({icon, spriteEdit}) => [icon?.src, spriteEdit?.src].filter(Boolean)));
    await Promise.all([...assets].map(async (src) => {
      const asset = await realpath(path.join(publicRoot, src));
      if (!asset.startsWith(publicRoot + path.sep) || !(await stat(asset)).isFile()) throw new Error('Invalid asset.');
      await access(asset);
    }));
    const slides = original.slides.map((slide, index) => {
      const {headline, headlineWidth, layerOrder, graphicPlacement, headlineOffset, elementOffsets, icon, spriteEdit} = edit.slides[index];
      return {
        ...slide,
        headline: headline ?? slide.headline,
        headlineWidth: headlineWidth === undefined ? slide.headlineWidth : headlineWidth ?? undefined,
        layerOrder: layerOrder === undefined ? slide.layerOrder : layerOrder ?? undefined,
        graphicPlacement: graphicPlacement ?? undefined,
        headlineOffset: headlineOffset === undefined ? slide.headlineOffset : headlineOffset ?? undefined,
        elementOffsets: elementOffsets === undefined ? slide.elementOffsets : elementOffsets ?? undefined,
        icon: icon ?? undefined,
        spriteEdit: spriteEdit === undefined ? slide.spriteEdit : spriteEdit ?? undefined,
      };
    });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
    const slug = `${original.slug}-edit-${timestamp}-${randomUUID().slice(0, 8)}`;
    const directory = path.join(root, editDirectory);
    const filename = slug + '.json';
    const temporary = path.join(directory, '.' + filename + '.tmp');
    await mkdir(directory, {recursive: true});
    try {
      await writeFile(temporary, JSON.stringify({...original, slug, slides}, null, 2) + '\n', {flag: 'wx'});
      await rename(temporary, path.join(directory, filename));
    } finally {
      await rm(temporary, {force: true});
    }
    json(response, 201, {file: `${editDirectory}/${filename}`});
  } catch (error) {
    console.error('Carousel save failed:', error.message);
    json(response, 500, {error: 'Could not save to the project folder. Your draft is still in the editor.'});
  }
}

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, url).pathname;
    if (pathname === '/api/save' && request.method === 'POST') {
      await saveEdits(request, response);
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405).end();
      return;
    }
    if (pathname === '/' || pathname === '/editor.js') {
      response.writeHead(200, {'Content-Type': pathname === '/' ? 'text/html; charset=utf-8' : 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store'});
      response.end(request.method === 'HEAD' ? undefined : pathname === '/' ? html : bundle.contents);
      return;
    }
    if (!pathname.startsWith('/assets/')) {
      response.writeHead(404).end();
      return;
    }
    const file = await realpath(path.resolve(publicRoot, decodeURIComponent(pathname.slice('/assets/'.length))));
    if (!file.startsWith(publicRoot + path.sep)) {
      response.writeHead(404).end();
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Content-Length': info.size});
    if (request.method === 'HEAD') response.end();
    else {
      const stream = createReadStream(file);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    }
  } catch {
    response.writeHead(404).end();
  }
});

server.on('error', async (error) => {
  if (error.code === 'EADDRINUSE') {
    const existing = await fetch(url).then((result) => result.text()).catch(() => '');
    if (existing.includes('<title>C3 Global Carousel Editor</title>')) {
      openBrowser();
      return;
    }
  }
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Carousel editor is open at ${url}. Keep this window open while editing.`);
  openBrowser();
});
