// Starter icons for Carousel Studio, drawn in the member's brand accent. Rewritten each time the studio opens,
// so a brand change carries through. The member's own icons go in public/carousel-icons/ and are never touched.
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

const glyphs = {
  calendar: 'M33 40h46v40H33zM33 52h46M45 32v14m22-14v14M44 66l7 7 16-16',
  check: 'M36 57l13 13 27-28',
  clock: 'M56 34a22 22 0 1 0 0.01 0M56 44v13l9 7',
  question: 'M45 47a11 11 0 1 1 15 10c-3 2-4 4-4 7v3M56 77v1',
  idea: 'M47 70h18M49 78h14M56 34a15 15 0 0 0-9 27c2 2 2 4 2 6h14c0-2 0-4 2-6a15 15 0 0 0-9-27z',
  chart: 'M36 78h42M42 70V58m12 12V46m12 24V38',
  target: 'M56 34a22 22 0 1 0 0.01 0M56 45a11 11 0 1 0 0.01 0M56 56l20-20',
  heart: 'M56 76S35 64 35 49a10 10 0 0 1 21-4 10 10 0 0 1 21 4c0 15-21 27-21 27z',
  star: 'M56 34l6 14 15 1-11 10 4 15-14-8-14 8 4-15-11-10 15-1z',
  chat: 'M35 40h42v28H52l-11 9v-9h-6z',
  link: 'M51 61a10 10 0 0 0 14 0l9-9a10 10 0 0 0-14-14l-3 3M61 51a10 10 0 0 0-14 0l-9 9a10 10 0 0 0 14 14l3-3',
  lock: 'M40 54h32v24H40zM46 54v-7a10 10 0 0 1 20 0v7M56 63v6',
  globe: 'M56 34a22 22 0 1 0 0.01 0M34 56h44M56 34c-8 8-8 36 0 44M56 34c8 8 8 36 0 44',
  people: 'M46 52a7 7 0 1 0 0.01 0M34 76c0-8 5-13 12-13s12 5 12 13M68 50a6 6 0 1 0 0.01 0M62 63c8-2 15 3 15 12',
  book: 'M56 42c-6-5-14-6-21-5v35c7-1 15 0 21 5 6-5 14-6 21-5V37c-7-1-15 0-21 5zM56 42v35',
  megaphone: 'M37 50v12h8l20 11V39L45 50zM45 62l4 14M71 50a6 6 0 0 1 0 12',
};

export async function writeStarterIcons(runtimeRoot) {
  let accent = '#087F8C';
  try {
    const brand = JSON.parse(await readFile(path.join(runtimeRoot, 'brand.json'), 'utf8'));
    if (/^#[0-9a-f]{6}$/i.test(brand.accent ?? '')) accent = brand.accent;
  } catch {
    // Without a readable brand.json the starter icons fall back to the default accent.
  }
  const directory = path.join(runtimeRoot, 'public', 'carousel-icons', 'starter');
  await mkdir(directory, {recursive: true});
  await Promise.all(Object.entries(glyphs).map(([name, d]) => writeFile(path.join(directory, `${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112" fill="none">
  <circle cx="56" cy="56" r="48" fill="${accent}"/>
  <path d="${d}" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)));
  return Object.keys(glyphs);
}
