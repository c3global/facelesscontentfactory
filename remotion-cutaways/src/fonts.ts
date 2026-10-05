import {continueRender, delayRender, staticFile} from 'remotion';
import {loadFont as loadDMSans} from '@remotion/google-fonts/DMSans';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import type {SansOption} from './brand';

declare const process: {env: Record<string, string | undefined>};

export const serifFamily = '"Playfair Display", Georgia, serif';
export const sansFamily = (sans: SansOption) => `"${sans}", "Helvetica Neue", Arial, sans-serif`;

/**
 * Fonts load through @remotion/google-fonts. If Google Fonts is unreachable (for example a
 * locked-down render sandbox), set REMOTION_LOCAL_FONTS=1 to load the bundled copies in
 * public/fonts instead. Same families, same weights.
 */
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
];

let started = false;

export const loadBrandFonts = () => {
  if (started) return;
  started = true;

  if (process.env.REMOTION_LOCAL_FONTS === '1') {
    const handle = delayRender('Loading bundled brand fonts');
    Promise.all(
      localFaces.map(([family, file, weight, style]) =>
        new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, {weight, style})
          .load()
          .then((face) => document.fonts.add(face)),
      ),
    )
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
    return;
  }

  loadDMSans('normal', {weights: ['500', '700'], subsets: ['latin']});
  loadMontserrat('normal', {weights: ['500', '700'], subsets: ['latin']});
  loadPlayfair('normal', {weights: ['400', '600', '700'], subsets: ['latin']});
  loadPlayfair('italic', {weights: ['400', '600', '700'], subsets: ['latin']});
};
