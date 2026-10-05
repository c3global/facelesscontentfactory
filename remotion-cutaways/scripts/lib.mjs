import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {planSchema} from './plan-schema.mjs';

export const root = process.cwd();

export const listSlugs = () =>
  readdirSync(path.join(root, 'content'))
    .filter((f) => f.endsWith('.scene.json'))
    .map((f) => f.replace('.scene.json', ''))
    .filter((s) => s !== 'showcase');

export const loadPlan = (slug) => {
  const raw = JSON.parse(readFileSync(path.join(root, 'content', `${slug}.scene.json`), 'utf8'));
  return planSchema.parse(raw); // throws a readable zod error if the scene plan is invalid
};

export const loadCaptions = (slug) => {
  const file = path.join(root, 'content', `${slug}.captions.json`);
  if (!existsSync(file)) {
    throw new Error(
      `Missing ${file}. Run: npm run transcribe -- ${slug}   (or node scripts/words-to-captions.mjs ${slug})`,
    );
  }
  return JSON.parse(readFileSync(file, 'utf8'));
};

/** Browser to render with. Set REMOTION_BROWSER_EXECUTABLE to use a system Chromium or Chrome. */
export const browserOptions = () => {
  const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
  const env = process.env.REMOTION_LOCAL_FONTS === '1' ? {envVariables: {REMOTION_LOCAL_FONTS: '1'}} : {};
  return {...(browserExecutable ? {browserExecutable, chromeMode: 'chrome-for-testing'} : {}), ...env};
};

export const bundleProject = () =>
  bundle({entryPoint: path.join(root, 'src', 'index.ts'), onProgress: () => undefined});
