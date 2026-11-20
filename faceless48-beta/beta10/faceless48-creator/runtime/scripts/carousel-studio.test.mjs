import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile, rm} from 'node:fs/promises';
import {test} from 'node:test';
import {setTimeout as delay} from 'node:timers/promises';

test('Carousel Studio serves templates and saves a versioned edit', {timeout: 120000}, async () => {
  const port = String(20000 + process.pid % 20000);
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['scripts/carousel-studio.mjs', '--no-open'], {
    env: {...process.env, CAROUSEL_STUDIO_PORT: port},
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  let saved;
  try {
    let response;
    for (let attempt = 0; attempt < 600; attempt++) {
      response = await fetch(origin).catch(() => undefined);
      if (response?.ok) break;
      if (child.exitCode !== null) throw Error('Carousel Studio exited before serving.');
      await delay(100);
    }
    assert.match(await response?.text() ?? '', /<title>Carousel Studio<\/title>/);
    const bundle = await (await fetch(origin + '/editor.js')).text();
    assert.ok(bundle.includes('carousel-tech') && bundle.includes('carousel-grid'), 'every template is listed');
    assert.equal((await fetch(origin + '/assets/carousel-icons/starter/calendar.svg')).status, 200);
    assert.equal((await fetch(origin + '/assets/..%2Fbrand.json')).status, 404, 'no files outside public/');

    const plan = JSON.parse(await readFile('content/templates/carousel-tech.json', 'utf8'));
    const slides = plan.slides.map(() => ({graphicPlacement: null, icon: null}));
    slides[0] = {headline: 'Saved *test* headline', headlineWidth: 620, layerOrder: ['content', 'headline', 'sprite'], graphicPlacement: {x: 10, y: -20, scale: 1.1, rotation: 4}, icon: {src: 'carousel-icons/starter/check.svg', align: 'left', size: 100}};
    const body = JSON.stringify({slug: plan.slug, contentGrid: true, slides});

    const foreign = await fetch(origin + '/api/save', {method: 'POST', headers: {origin: 'http://example.com', 'content-type': 'application/json'}, body});
    assert.equal(foreign.status, 403, 'other sites cannot save');
    const bad = await fetch(origin + '/api/save', {method: 'POST', headers: {origin, 'content-type': 'application/json'}, body: JSON.stringify({slug: plan.slug, slides: [{graphicPlacement: null, icon: {src: '../../brand.json', align: 'left', size: 100}}]})});
    assert.equal(bad.status, 400);

    const result = await fetch(origin + '/api/save', {method: 'POST', headers: {origin, 'content-type': 'application/json'}, body});
    assert.equal(result.status, 201);
    saved = (await result.json()).file;
    const edited = JSON.parse(await readFile(saved, 'utf8'));
    assert.match(edited.slug, /^carousel-tech-edit-/);
    assert.equal(edited.contentGrid, true);
    assert.equal(edited.slides[0].headline, slides[0].headline);
    assert.deepEqual(edited.slides[0].layerOrder, slides[0].layerOrder);
    assert.equal(edited.slides[0].icon.src, 'carousel-icons/starter/check.svg');
    assert.equal(edited.slides[1].headline, plan.slides[1].headline, 'untouched slides keep their words');
  } finally {
    child.kill();
    if (saved) await rm(saved);
  }
});
