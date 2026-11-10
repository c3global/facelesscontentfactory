/**
 * One-step setup: `npm run setup` (the assistant runs this for the member, after asking).
 *
 * Installs and tests everything Faceless48 needs, inside this project folder, then prints a plain-English report:
 *   1. Node packages, including the project's own ffmpeg and ffprobe (no Homebrew, no system install)
 *   2. The video browser Remotion renders with
 *   3. A private Python (.venv) with the cutout and sound packages
 *   4. The caption engine (whisper.cpp) and its small.en model (about 470 MB)
 *   5. The high-quality cutout model (BiRefNet lite, about 220 MB)
 * Each step is skipped when it is already done, so running it again is safe and fast.
 *
 * Flags: --skip-captions, --skip-cutouts (Python + cutout model), --skip-models (both downloads).
 */
import {spawnSync} from 'node:child_process';
import {copyFileSync, createWriteStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';

const root = process.cwd();
const win = process.platform === 'win32';
const mac = process.platform === 'darwin';
const args = new Set(process.argv.slice(2));
const skipCaptions = args.has('--skip-captions') || args.has('--skip-models');
const skipCutouts = args.has('--skip-cutouts');
const skipHqModel = skipCutouts || args.has('--skip-models');

const results = [];
const ok = (step, note = '') => results.push({step, status: 'ready', note});
const fail = (step, fix) => results.push({step, status: 'needs attention', note: fix});
const skip = (step, note) => results.push({step, status: 'skipped', note});
const say = (m) => console.log(`\n== ${m}`);
const run = (cmd, a, opts = {}) => spawnSync(cmd, a, {stdio: 'inherit', shell: win, cwd: root, ...opts});
const quiet = (cmd, a) => spawnSync(cmd, a, {encoding: 'utf8', shell: win, cwd: root});

async function download(url, file, minBytes) {
  if (existsSync(file) && statSync(file).size > minBytes) return 'present';
  mkdirSync(path.dirname(file), {recursive: true});
  const res = await fetch(url);
  if (!res.ok || !res.body) throw Error(`download failed (${res.status})`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(file));
  if (statSync(file).size < minBytes) {
    rmSync(file);
    throw Error('the download was cut short or blocked');
  }
  return 'downloaded';
}

// ---------------------------------------------------------------- 1. Node
say('Checking Node');
const [maj, min] = process.versions.node.split('.').map(Number);
if (maj < 20 || (maj === 20 && min < 6)) {
  fail('Node', `This computer has Node ${process.versions.node}; Faceless48 needs 20.6 or newer. Install the LTS version from nodejs.org, then run setup again.`);
  report();
  process.exit(1);
}
ok('Node', process.versions.node);

// ---------------------------------------------------------------- 2. packages (includes ffmpeg and ffprobe)
say('Installing the video packages (first time takes a few minutes)');
if (!existsSync(path.join(root, 'node_modules', 'remotion'))) {
  const r = run('npm', ['ci', '--no-audit', '--no-fund']);
  if (r.status !== 0) {
    fail('Video packages', 'npm could not install the packages. Check the internet connection and run setup again. If it repeats, send the last 20 lines of the output.');
    report();
    process.exit(1);
  }
}
ok('Video packages');

// the tools live inside node_modules; tools-path.mjs puts them on PATH for every npm script
const require = createRequire(path.join(root, 'package.json'));
let ffmpeg = '';
let ffprobe = '';
try {
  ffmpeg = require('ffmpeg-static');
  ffprobe = require('ffprobe-static').path;
} catch {}
const ffOk = ffmpeg && existsSync(ffmpeg) && quiet(ffmpeg, ['-version']).status === 0;
const fpOk = ffprobe && existsSync(ffprobe) && quiet(ffprobe, ['-version']).status === 0;
if (ffOk && fpOk) ok('ffmpeg and ffprobe', 'built into the project');
else fail('ffmpeg and ffprobe', 'The built-in video tools did not install. Delete the node_modules folder and run setup again.');

// ---------------------------------------------------------------- 3. render browser
say('Setting up the video browser');
const br = run('npx', ['remotion', 'browser', 'ensure']);
if (br.status === 0) ok('Video browser');
else fail('Video browser', 'Remotion could not download its browser. Check the internet connection and run setup again.');

// ---------------------------------------------------------------- 4. Python for cutouts and sounds
const venvPy = path.join(root, '.venv', win ? 'Scripts/python.exe' : 'bin/python3');
if (skipCutouts) skip('Cutout tools (Python)', 'skipped on request; behind-you effects will not work until setup runs without --skip-cutouts');
else {
  say('Setting up the private Python for cutouts');
  if (!existsSync(venvPy)) {
    const candidates = win ? [['py', ['-3']], ['python', []], ['python3', []]] : [['python3', []], ['python', []]];
    let base = null;
    for (const [cmd, pre] of candidates) {
      const v = quiet(cmd, [...pre, '--version']);
      if (v.status === 0 && /Python 3\.(9|1\d)/.test(`${v.stdout}${v.stderr}`)) {
        base = [cmd, pre];
        break;
      }
    }
    if (!base) {
      fail('Cutout tools (Python)', win
        ? 'Python is not installed. Install Python 3.12 from python.org (tick "Add python.exe to PATH" on the first screen), then run setup again.'
        : mac
          ? 'Python is not installed. Run setup again: it will ask macOS to install the Command Line Tools, which include Python. Click Install, wait for it to finish, then run setup again.'
          : 'Python 3 is not installed. Install it with your system package manager (for example: sudo apt install python3 python3-venv), then run setup again.');
      if (mac) quiet('xcode-select', ['--install']);
    } else {
      const v = run(base[0], [...base[1], '-m', 'venv', '.venv']);
      if (v.status !== 0) fail('Cutout tools (Python)', 'Could not create the private Python folder. On Linux install python3-venv, then run setup again.');
    }
  }
  if (existsSync(venvPy)) {
    // scripts call `python3`; on Windows the private Python only ships python.exe
    if (win) {
      const py3 = path.join(root, '.venv', 'Scripts', 'python3.exe');
      if (!existsSync(py3)) copyFileSync(venvPy, py3);
    }
    run(venvPy, ['-m', 'pip', 'install', '--upgrade', 'pip', '--quiet']);
    const p = run(venvPy, ['-m', 'pip', 'install', '-r', 'requirements.txt', '--quiet']);
    const t = quiet(venvPy, ['-c', 'import mediapipe, cv2, numpy, scipy, onnxruntime, PIL, pymatting; print("ok")']);
    if (p.status === 0 && t.stdout.includes('ok')) ok('Cutout tools (Python)', 'private copy in .venv');
    else fail('Cutout tools (Python)', 'Some Python packages did not install. Run setup again. If it repeats, send the last 20 lines of the output.');
  }
}

// ---------------------------------------------------------------- 5. captions (whisper.cpp + small.en)
if (skipCaptions) skip('Captions engine', 'skipped on request');
else {
  say('Setting up the captions engine (one time, about 470 MB)');
  if (mac && quiet('xcode-select', ['-p']).status !== 0) {
    quiet('xcode-select', ['--install']);
    fail('Captions engine', 'macOS needs its free Command Line Tools to build the captions engine. A window should have opened: click Install, wait for it to finish (about 5 to 10 minutes), then run setup again.');
  } else {
    try {
      const {installWhisperCpp, downloadWhisperModel} = await import('@remotion/install-whisper-cpp');
      const to = path.join(root, 'whisper.cpp');
      await installWhisperCpp({to, version: '1.5.5'});
      await downloadWhisperModel({model: 'small.en', folder: to, printOutput: false});
      const model = path.join(to, 'ggml-small.en.bin');
      if (existsSync(model) && statSync(model).size > 100 * 1024 * 1024) ok('Captions engine', 'small.en model');
      else fail('Captions engine', 'The captions model download was blocked or cut short. Check the internet connection and run setup again.');
    } catch (e) {
      fail('Captions engine', `It could not be built: ${String(e).slice(0, 160)}. ${win ? 'Run setup again.' : 'Make sure git and a C compiler are installed (on Linux: sudo apt install git build-essential), then run setup again.'}`);
    }
  }
}

// ---------------------------------------------------------------- 6. high-quality cutout model
if (skipHqModel) skip('High-quality cutout model', 'skipped on request');
else {
  say('Downloading the high-quality cutout model (one time, about 220 MB)');
  try {
    const st = await download('https://huggingface.co/onnx-community/BiRefNet_lite-ONNX/resolve/main/onnx/model.onnx', path.join(root, 'models', 'birefnet_lite.onnx'), 150 * 1024 * 1024);
    ok('High-quality cutout model', st);
  } catch (e) {
    fail('High-quality cutout model', `The download did not finish (${String(e.message ?? e).slice(0, 80)}). Check the internet connection and run setup again.`);
  }
}

// ---------------------------------------------------------------- 7. a real end-to-end test
say('Testing: make a 1-second clip and read it back');
if (ffOk && fpOk) {
  mkdirSync(path.join(root, 'out', 'tmp'), {recursive: true});
  const clip = path.join(root, 'out', 'tmp', 'setup-test.mp4');
  const mk = quiet(ffmpeg, ['-y', '-f', 'lavfi', '-i', 'color=c=0xB5622C:s=320x568:d=1', '-f', 'lavfi', '-i', 'sine=d=1', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', clip]);
  const pr = quiet(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip]);
  if (mk.status === 0 && parseFloat(pr.stdout) > 0.5) ok('Video test');
  else fail('Video test', 'The test clip did not encode. Send the setup output.');
  rmSync(clip, {force: true});
}
report();

function report() {
  const pad = Math.max(...results.map((r) => r.step.length));
  const lines = ['', 'FACELESS48 SETUP REPORT', ''];
  for (const r of results) lines.push(`${r.status === 'ready' ? '[ready]' : r.status === 'skipped' ? '[skip] ' : '[FIX]  '} ${r.step.padEnd(pad)}  ${r.note}`);
  const bad = results.filter((r) => r.status === 'needs attention');
  lines.push('', bad.length ? `${bad.length} item(s) need attention. Follow the [FIX] lines above, then run setup again; finished steps are skipped.` : 'Everything is ready. Next: "Get me set up" for your brand, then "Make my video".', '');
  console.log(lines.join('\n'));
  mkdirSync(path.join(root, 'out'), {recursive: true});
  writeFileSync(path.join(root, 'out', 'setup-report.txt'), lines.join('\n'));
  if (bad.length) process.exitCode = 1;
}
