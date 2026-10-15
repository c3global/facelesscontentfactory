#!/usr/bin/env node
/**
 * Synthesizes the effect sound kit into public/sfx/fx-*.wav with ffmpeg only (no licensing questions).
 *   node scripts/make-sfx.mjs
 * Each file is normalized to a -12 dBFS peak. The video applies a per-cue volume below that so effects sit under her voice.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const out = path.join(process.cwd(), 'public', 'sfx');
mkdirSync(out, {recursive: true});

// [name, lavfi source, extra filters]
const kit = {
  whoosh: ["anoisesrc=d=0.8:c=pink:r=44100:a=0.9", "highpass=f=250,lowpass=f=5200,afade=t=in:st=0:d=0.32,afade=t=out:st=0.38:d=0.42,tremolo=f=9:d=0.2"],
  swish: ["anoisesrc=d=0.4:c=white:r=44100:a=0.8", "highpass=f=1800,lowpass=f=9000,afade=t=in:st=0:d=0.12,afade=t=out:st=0.14:d=0.26"],
  pop: ["aevalsrc='exp(-t*38)*sin(2*PI*(520-1800*t)*t)':d=0.16:s=44100", ""],
  tick: ["aevalsrc='exp(-t*420)*sin(2*PI*3100*t)':d=0.05:s=44100", ""],
  blip: ["aevalsrc='exp(-t*26)*sin(2*PI*1040*t)':d=0.14:s=44100", ""],
  thud: ["aevalsrc='exp(-t*9)*sin(2*PI*62*t)+0.4*exp(-t*60)*sin(2*PI*180*t)':d=0.5:s=44100", ""],
  boom: ["aevalsrc='exp(-t*3.2)*sin(2*PI*48*t)':d=1.3:s=44100", "lowpass=f=240"],
  snap: ["anoisesrc=d=0.09:c=white:r=44100:a=0.9", "highpass=f=900,afade=t=out:st=0.01:d=0.08"],
  riser: ["anoisesrc=d=1.4:c=pink:r=44100:a=0.7", "highpass=f=400,lowpass=f=7000,afade=t=in:st=0:d=1.25,afade=t=out:st=1.3:d=0.1,tremolo=f=14:d=0.35"],
  shutter: ["anoisesrc=d=0.22:c=white:r=44100:a=0.9", "highpass=f=1500,lowpass=f=7000,volume='if(lt(t,0.03),1,if(lt(t,0.1),0,0.8))':eval=frame,afade=t=out:st=0.14:d=0.08"],
  type: ["anoisesrc=d=0.035:c=white:r=44100:a=0.9", "highpass=f=2200,lowpass=f=6500,afade=t=out:st=0.005:d=0.03"],
  ding: ["aevalsrc='exp(-t*5)*(sin(2*PI*1320*t)+0.5*sin(2*PI*1980*t))':d=0.9:s=44100", ""],
  crackle: ["anoisesrc=d=1.6:c=brown:r=44100:a=0.9", "highpass=f=700,lowpass=f=6500,volume='if(lt(mod(t*37,1),0.18),1,0.15)':eval=frame,afade=t=in:st=0:d=0.2,afade=t=out:st=1.2:d=0.4"],
  glitch: ["anoisesrc=d=0.3:c=white:r=44100:a=0.8", "highpass=f=600,volume='if(lt(mod(t*28,1),0.5),1,0)':eval=frame,afade=t=out:st=0.22:d=0.08"],
};

for (const [name, [src, filt]] of Object.entries(kit)) {
  const raw = path.join(out, `.raw-${name}.wav`);
  const dst = path.join(out, `fx-${name}.wav`);
  const first = [filt].filter(Boolean).join(',');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', src, ...(first ? ['-af', first] : []), '-ar', '44100', '-ac', '2', raw]);
  // measure the peak, then scale so every file peaks at -12 dBFS
  const log = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8'}).stderr ?? '';
  const m = /max_volume: (-?[\d.]+) dB/.exec(log);
  const peak = m ? parseFloat(m[1]) : 0;
  const gain = -12 - peak;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB`, dst]);
  execFileSync('rm', ['-f', raw]);
  console.log('wrote', `fx-${name}.wav`, `(peak ${peak} dB -> -12 dB)`);
}
