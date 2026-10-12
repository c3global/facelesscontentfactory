// Renders the stick cast preview sheet (men and women) to out/review/cast.png
import path from 'node:path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {browserOptions, bundleProject, root} from './lib.mjs';

const serveUrl = await bundleProject();
const composition = await selectComposition({serveUrl, id: 'StickCast', ...browserOptions()});
await renderStill({composition, serveUrl, output: path.join(root, 'out', 'review', 'cast.png'), frame: 0, ...browserOptions()});
console.log('wrote out/review/cast.png');
