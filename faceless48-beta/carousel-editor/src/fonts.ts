import {continueRender, delayRender, staticFile} from 'remotion';

export const handFamily = '"Caveat", "Bradley Hand", cursive';

const localFaces: Array<[string, string, string, string]> = [
  ['DM Sans', 'dm-sans-latin-500-normal.woff2', '500', 'normal'],
  ['DM Sans', 'dm-sans-latin-700-normal.woff2', '700', 'normal'],
  ['Montserrat', 'montserrat-latin-500-normal.woff2', '500', 'normal'],
  ['Montserrat', 'montserrat-latin-700-normal.woff2', '700', 'normal'],
  ['Playfair Display', 'playfair-display-latin-400-normal.woff2', '400', 'normal'],
  ['Playfair Display', 'playfair-display-latin-600-normal.woff2', '600', 'normal'],
  ['Playfair Display', 'playfair-display-latin-700-normal.woff2', '700', 'normal'],
  ['Playfair Display', 'playfair-display-latin-400-italic.woff2', '400', 'italic'],
  ['Playfair Display', 'playfair-display-latin-600-italic.woff2', '600', 'italic'],
  ['Playfair Display', 'playfair-display-latin-700-italic.woff2', '700', 'italic'],
  ['Playfair Display', 'playfair-display-latin-800-normal.woff2', '800', 'normal'],
  ['Playfair Display', 'playfair-display-latin-800-italic.woff2', '800', 'italic'],
  ['Playfair Display', 'playfair-display-latin-900-normal.woff2', '900', 'normal'],
  ['Playfair Display', 'playfair-display-latin-900-italic.woff2', '900', 'italic'],
  ['Caveat', 'caveat-latin-700-normal.woff2', '700', 'normal'],
  ['Caveat', 'caveat-latin-600-normal.woff2', '600', 'normal'],
];

let started = false;

export function loadBrandFonts() {
  if (started) return;
  started = true;
  const handle = delayRender('Loading bundled brand fonts');
  const faces = localFaces.map(async ([family, file, weight, style]) => {
    const face = await new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, {weight, style}).load();
    document.fonts.add(face);
  });
  Promise.all(faces).catch(console.error).finally(() => continueRender(handle));
}
