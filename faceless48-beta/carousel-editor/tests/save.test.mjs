import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile, rm} from 'node:fs/promises';
import {test} from 'node:test';
import {setTimeout as delay} from 'node:timers/promises';

test('serves the editor and saves a versioned headline and layer edit', async () => {
  const port = String(20000 + process.pid % 20000);
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['scripts/carousel-editor.mjs', '--no-open'], {
    env: {...process.env, CAROUSEL_EDITOR_PORT: port},
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  let saved;
  try {
    let response;
    for (let attempt = 0; attempt < 80; attempt++) {
      response = await fetch(origin).catch(() => undefined);
      if (response?.ok) break;
      if (child.exitCode !== null) throw Error('Editor exited before serving.');
      await delay(100);
    }
    assert.match(await response?.text() ?? '', /C3 Global Carousel Editor/);
    assert.equal((await fetch(origin + '/editor.js')).status, 200);
    assert.equal((await fetch(origin + '/assets/portraits/sprites/waving.png')).status, 200);

    const slides = [
      {headline: 'Saved test headline', headlineWidth: 620, layerOrder: ['content', 'headline', 'sprite'], graphicPlacement: null, icon: null},
      {graphicPlacement: null, icon: {src: 'carousel-icons/library/calendar.svg', align: 'center', size: 112}},
      {graphicPlacement: null, icon: null},
    ];
    const result = await fetch(origin + '/api/save', {
      method: 'POST',
      headers: {origin, 'content-type': 'application/json'},
      body: JSON.stringify({slug: 'editor-demo', slides}),
    });
    assert.equal(result.status, 201);
    saved = (await result.json()).file;
    const plan = JSON.parse(await readFile(saved, 'utf8'));
    assert.equal(plan.slides[0].headline, slides[0].headline);
    assert.deepEqual(plan.slides[0].layerOrder, slides[0].layerOrder);
    assert.equal(plan.slides[1].icon.src, slides[1].icon.src);
  } finally {
    child.kill();
    if (saved) await rm(saved);
  }
});
