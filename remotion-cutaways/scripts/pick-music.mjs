#!/usr/bin/env node
/**
 * Picks a track from public/music for a video and writes it into the scene plan. Tracks rotate so back-to-back
 * videos do not get the same song, and a mood word in the file name steers the choice:
 *   calm-..., warm-..., driving-..., cinematic-...   (anything else counts as "any")
 *
 *   node scripts/pick-music.mjs <slug> [mood]
 */
import {readdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const [slug, mood] = process.argv.slice(2);
const dir = 'public/music';
const tracks = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(mp3|wav|m4a|aac)$/i.test(f)).sort() : [];
if (!tracks.length) {
  console.error('No tracks in public/music. Put licensed files there (they stay out of git).');
  process.exit(1);
}
const logFile = 'content/music-log.json';
const log = existsSync(logFile) ? JSON.parse(readFileSync(logFile, 'utf8')) : {used: []};
const pool = mood ? tracks.filter((t) => t.toLowerCase().startsWith(mood.toLowerCase())) : tracks;
const candidates = pool.length ? pool : tracks;
const fresh = candidates.filter((t) => !log.used.slice(-Math.max(1, Math.min(3, candidates.length - 1))).includes(t));
const pick = (fresh.length ? fresh : candidates)[0];
log.used.push(pick);
writeFileSync(logFile, JSON.stringify(log, null, 2) + '\n');
const planFile = path.join('content', `${slug}.scene.json`);
const plan = JSON.parse(readFileSync(planFile, 'utf8'));
plan.music = {...(plan.music ?? {}), src: `music/${pick}`};
writeFileSync(planFile, JSON.stringify(plan, null, 2) + '\n');
console.log(`music for ${slug}: ${pick}`);
