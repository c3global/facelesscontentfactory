import {continueRender, delayRender, staticFile} from 'remotion';

const faces: Array<[string, string, string, string]> = [
  ['Cormorant Garamond', 'cormorant-garamond-latin-600-normal.woff2', '600', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-700-normal.woff2', '700', 'normal'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-600-italic.woff2', '600', 'italic'],
  ['Cormorant Garamond', 'cormorant-garamond-latin-700-italic.woff2', '700', 'italic'],
  ['Manrope', 'manrope-latin-500-normal.woff2', '500', 'normal'],
  ['Manrope', 'manrope-latin-700-normal.woff2', '700', 'normal'],
];

let started = false;

export const loadFonts = () => {
  if (started) return;
  started = true;
  const handle = delayRender('Loading C3 fonts');
  Promise.all(
    faces.map(([family, file, weight, style]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, {weight, style});
      return face.load().then((loaded) => document.fonts.add(loaded));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
