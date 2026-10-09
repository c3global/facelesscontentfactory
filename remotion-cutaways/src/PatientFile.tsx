import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {brand} from './brand';
import {heavyFamily, loadBrandFonts, serifFamily} from './fonts';

loadBrandFonts();

export const PF_FPS = 24;
export const COVER_FRAMES = 72; // 3 s
const VIDEO_START = 64; // video begins under the last frames of the cover so the dissolve has footage behind it

export const patientFileSchema = z.object({
  /** "002" */
  number: z.string(),
  /** episode title, shown under the number */
  title: z.string(),
  /** path inside public/ */
  video: z.string(),
  videoSec: z.number(),
});
export type PatientFileProps = z.infer<typeof patientFileSchema>;

export const patientFileFrames = (videoSec: number) => VIDEO_START + Math.ceil(videoSec * PF_FPS);

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Cover: React.FC<{number: string; title: string}> = ({number, title}) => {
  const f = useCurrentFrame();
  const label = interpolate(f, [2, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const lineW = interpolate(f, [4, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  // stamp slams in on frame 10 with a short shake
  const hit = 10;
  const stampScale = interpolate(f, [hit - 5, hit], [1.7, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const stampOpacity = interpolate(f, [hit - 5, hit - 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shakeAmt = f >= hit && f < hit + 8 ? (1 - (f - hit) / 8) * 14 : 0;
  const sx = (random(`x${f}`) - 0.5) * shakeAmt;
  const sy = (random(`y${f}`) - 0.5) * shakeAmt;
  const flash = interpolate(f, [hit, hit + 5], [0.35, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleIn = interpolate(f, [26, 42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const out = interpolate(f, [COVER_FRAMES - 12, COVER_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const drift = interpolate(f, [0, COVER_FRAMES], [1.0, 1.05]);

  return (
    <AbsoluteFill style={{opacity: out, backgroundColor: brand.black}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 46%, ${brand.crimsonDeep} 0%, rgba(111,13,15,0.55) 28%, #000 72%)`,
          transform: `scale(${drift})`,
        }}
      />
      <AbsoluteFill style={{backgroundColor: brand.crimson, opacity: flash}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translate(${sx}px, ${sy}px)`}}>
        <div style={{opacity: label, fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: 54, letterSpacing: 22, color: brand.white, marginRight: -22}}>
          PATIENT FILE
        </div>
        <div style={{width: 760 * lineW, height: 4, background: brand.crimson, margin: '44px 0 8px'}} />
        <div style={{opacity: label, fontFamily: '"Montserrat", sans-serif', fontWeight: 500, fontSize: 46, letterSpacing: 30, color: brand.crimson, marginRight: -30}}>
          NUMBER
        </div>
        <div
          style={{
            opacity: stampOpacity,
            transform: `scale(${stampScale})`,
            fontFamily: heavyFamily,
            fontSize: 560,
            lineHeight: 1,
            color: brand.crimson,
            textShadow: '0 0 60px rgba(201,27,25,0.55), 0 6px 0 #6F0D0F',
            letterSpacing: 6,
          }}
        >
          {number}
        </div>
        <div style={{width: 760 * lineW, height: 4, background: brand.crimson, margin: '8px 0 56px'}} />
        <div style={{opacity: titleIn, transform: `translateY(${(1 - titleIn) * 24}px)`, fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 112, color: brand.white, textAlign: 'center', padding: '0 80px'}}>
          {title}
        </div>
      </AbsoluteFill>
      {/* film grain */}
      <AbsoluteFill style={{opacity: 0.13, mixBlendMode: 'overlay', backgroundImage: `radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.2px)`, backgroundSize: `${5 + (f % 3)}px ${5 + (f % 3)}px`, backgroundPosition: `${random(`gx${f}`) * 50}px ${random(`gy${f}`) * 50}px`}} />
    </AbsoluteFill>
  );
};

export const PatientFile: React.FC<PatientFileProps> = ({number, title, video, videoSec}) => (
  <AbsoluteFill style={{backgroundColor: brand.black}}>
    <Sequence from={VIDEO_START}>
      <OffthreadVideo src={staticFile(video)} />
    </Sequence>
    <Sequence from={0} durationInFrames={COVER_FRAMES}>
      <Cover number={number} title={title} />
    </Sequence>
    <Sequence from={10}>
      <Audio src={staticFile('sfx/stamp-thud.wav')} volume={0.9} />
    </Sequence>
    <Sequence from={VIDEO_START - 18}>
      <Audio src={staticFile('sfx/whoosh-in.wav')} volume={0.55} />
    </Sequence>
  </AbsoluteFill>
);
