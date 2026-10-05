#!/usr/bin/env node
/**
 * Word-level transcription with Remotion's whisper.cpp integration.
 *
 *   npm run transcribe -- 20-years            # reads the video named in content/20-years.scene.json
 *   npm run transcribe -- 20-years public/raw/other.mp4
 *
 * Output: content/<slug>.captions.json   (Remotion `Caption[]`, one entry per word)
 *
 * Packages: @remotion/install-whisper-cpp (installWhisperCpp, downloadWhisperModel, transcribe, toCaptions).
 * The first run compiles whisper.cpp into ./whisper.cpp and downloads the model (about 1.5 GB for
 * medium.en). Needs git, make and a C++ compiler. Set WHISPER_MODEL to use another model (e.g. small.en).
 *
 * Note: Remotion's newer docs also describe @remotion/whisper-webgpu (GPU only). This script uses the
 * whisper.cpp package because it runs on any machine with a compiler.
 */
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {downloadWhisperModel, installWhisperCpp, toCaptions, transcribe} from '@remotion/install-whisper-cpp';

const WHISPER_VERSION = '1.5.5';
const MODEL = process.env.WHISPER_MODEL || 'medium.en';
const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run transcribe -- <slug> [path/to/video.mp4]');
  process.exit(1);
}

const root = process.cwd();
const plan = JSON.parse(readFileSync(path.join(root, 'content', `${slug}.scene.json`), 'utf8'));
const videoPath = path.resolve(process.argv[3] ?? path.join('public', plan.video));
if (!existsSync(videoPath)) {
  console.error(`Video not found: ${videoPath}`);
  process.exit(1);
}

const whisperPath = path.join(root, 'whisper.cpp');
const tmpDir = path.join(root, 'out', 'tmp');
mkdirSync(tmpDir, {recursive: true});
const wavPath = path.join(tmpDir, `${slug}.16k.wav`);

// whisper.cpp needs 16 kHz mono WAV. Use system ffmpeg, else Remotion's bundled one.
const ffmpegArgs = ['-y', '-i', videoPath, '-ar', '16000', '-ac', '1', wavPath];
let ff = spawnSync('ffmpeg', ffmpegArgs, {stdio: 'inherit'});
if (ff.error) ff = spawnSync('npx', ['remotion', 'ffmpeg', ...ffmpegArgs], {stdio: 'inherit'});
if (ff.status !== 0) throw new Error('Could not extract audio with ffmpeg.');

console.log(`Installing whisper.cpp ${WHISPER_VERSION} (skipped if already built)...`);
await installWhisperCpp({to: whisperPath, version: WHISPER_VERSION});

console.log(`Downloading model ${MODEL} (skipped if already present)...`);
try {
  await downloadWhisperModel({model: MODEL, folder: whisperPath, printOutput: true});
} catch (err) {
  console.error(
    `\nModel download failed: ${String(err).slice(0, 200)}\n` +
      'The model is hosted on huggingface.co. If that host is blocked, download ggml-' + MODEL + '.bin elsewhere\n' +
      `and place it in ${whisperPath}/, or use the offline fallback: node scripts/words-to-captions.mjs ${slug}`,
  );
  process.exit(1);
}

// A blocked download can leave a tiny error page behind instead of the ~1.5 GB model. Catch that early.
const modelFile = path.join(whisperPath, `ggml-${MODEL}.bin`);
if (!existsSync(modelFile) || statSync(modelFile).size < 10 * 1024 * 1024) {
  console.error(
    `\n${modelFile} is missing or only ${existsSync(modelFile) ? statSync(modelFile).size : 0} bytes, so the download was blocked or interrupted.\n` +
      'Delete it and retry on a network that can reach huggingface.co, or use the offline fallback:\n' +
      `  node scripts/words-to-captions.mjs ${slug}`,
  );
  process.exit(1);
}

console.log('Transcribing...');
const whisperCppOutput = await transcribe({
  model: MODEL,
  whisperPath,
  whisperCppVersion: WHISPER_VERSION,
  inputPath: wavPath,
  tokenLevelTimestamps: true,
  language: MODEL.endsWith('.en') ? undefined : 'en',
  onProgress: (p) => process.stdout.write(`  ${Math.round(p * 100)}%\r`),
});

const {captions} = toCaptions({whisperCppOutput});
const out = path.join(root, 'content', `${slug}.captions.json`);
writeFileSync(out, JSON.stringify(captions, null, 2) + '\n');
console.log(`\nWrote ${path.relative(root, out)} (${captions.length} tokens)`);
console.log('Check spelling of names, URLs and brand terms against your script, then render.');
