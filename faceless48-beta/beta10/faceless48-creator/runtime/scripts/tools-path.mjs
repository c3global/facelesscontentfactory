// Loaded into every npm script (see .npmrc). Puts the project's own ffmpeg, ffprobe and Python first on PATH,
// so nothing has to be installed system-wide and every script finds the same tools on Mac, Windows and Linux.
import {existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

const require = createRequire(path.join(process.cwd(), 'package.json'));
const dirs = [];
try {
  const ff = require('ffmpeg-static');
  if (ff && existsSync(ff)) dirs.push(path.dirname(ff));
} catch {}
try {
  const fp = require('ffprobe-static').path;
  if (fp && existsSync(fp)) dirs.push(path.dirname(fp));
} catch {}
const venvBin = path.join(process.cwd(), '.venv', process.platform === 'win32' ? 'Scripts' : 'bin');
if (existsSync(venvBin)) dirs.push(venvBin);
if (dirs.length) {
  const key = Object.keys(process.env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH';
  process.env[key] = [...dirs, process.env[key] ?? ''].join(path.delimiter);
}
