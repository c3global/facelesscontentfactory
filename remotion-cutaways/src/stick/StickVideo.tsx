import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import {loadBrandFonts, serifFamily} from '../fonts';
import {buildLockups, type Lockup} from '../Kinetic';
import {MetalText} from '../metal';
import {normalizeWord} from '../ui';
import {PileStage, type Cues} from './PileStage';
import {C, SANS, prog} from './kit';

/**
 * Stick-figure explainer: a white field, a stage for the art, Dr. CiCi (Kai's sprites) swapped on the beats,
 * editorial captions, her own voice and a music bed. One plan, two formats (1080x1920 and 1920x1080).
 */
export type Format = 'portrait' | 'landscape';
export type StickPlan = {
  slug: string;
  stage: string;
  durationSec: number;
  vo: string;
  music?: {src: string; volume: number; duckTo: number; fadeInSec: number; fadeOutSec: number; startFromSec: number};
  emphasis: string[];
  hero: string[];
  captionsEnd: number;
  cues: Cues;
  cici: {at: number; src: string; walkIn?: boolean}[];
};
export type StickProps = {format: Format; plan: StickPlan; captions: Caption[]};

export const SIZES: Record<Format, {width: number; height: number}> = {portrait: {width: 1080, height: 1920}, landscape: {width: 1920, height: 1080}};

type Rect = {x: number; y: number; w: number; h: number};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p)});

/** Where the stage art and the captions sit, before (p = 0) and after (p = 1) Dr. CiCi walks in. */
const layout = (fmt: Format, p: number) =>
  fmt === 'portrait'
    ? {
        viewBox: '110 0 780 700',
        stage: lerpRect({x: 60, y: 250, w: 960, h: 862}, {x: 111, y: 150, w: 858, h: 770}, p),
        caption: lerpRect({x: 60, y: 1130, w: 960, h: 300}, {x: 60, y: 925, w: 960, h: 250}, p),
        spriteH: 740,
        spriteLeft: (1080 - 740 * (1024 / 1536)) / 2,
        spriteTop: 1195,
        heroMax: 140,
        smallPx: 48,
      }
    : {
        viewBox: '0 0 1000 700',
        stage: lerpRect({x: 430, y: 25, w: 1060, h: 742}, {x: 790, y: 25, w: 1060, h: 742}, p),
        caption: lerpRect({x: 300, y: 790, w: 1320, h: 255}, {x: 790, y: 790, w: 1060, h: 255}, p),
        spriteH: 1010,
        spriteLeft: 70,
        spriteTop: 115,
        heroMax: 125,
        smallPx: 42,
      };

const Cici: React.FC<{plan: StickPlan; fmt: Format; t: number}> = ({plan, fmt, t}) => {
  const frame = useCurrentFrame();
  const L = layout(fmt, 1);
  const cur = [...plan.cici].reverse().find((c) => t >= c.at);
  if (!cur) return null;
  const sinceCut = frame - Math.round(cur.at * 30);
  const pop = interpolate(sinceCut, [0, 7], [0.95, 1], {extrapolateRight: 'clamp'});
  const fade = interpolate(sinceCut, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
  let dx = 0;
  if (cur.walkIn) {
    const w = prog(t, cur.at, 0.95, (v) => v);
    dx = (1 - w) * (fmt === 'portrait' ? -900 : -820);
  }
  const bob = Math.sin(t * Math.PI * 2 * (cur.walkIn ? 2.4 : 0.7)) * (cur.walkIn ? 9 : 5);
  const w = L.spriteH * (1024 / 1536);
  return (
    <Img
      src={staticFile(`stick/${cur.src}`)}
      style={{position: 'absolute', left: L.spriteLeft + dx, top: L.spriteTop + bob, width: w, height: L.spriteH, opacity: fade, transform: `scale(${pop})`, transformOrigin: '50% 100%'}}
    />
  );
};

const fixCase = (s: string) => s.replace(/[,:;]+$/, '').replace(/^substack$/i, 'Substack');

const CaptionWord: React.FC<{startMs: number; hero: boolean; children: React.ReactNode; style: React.CSSProperties}> = ({startMs, hero, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = (startMs / 1000) * fps;
  const p = spring({frame: frame - start, fps, durationInFrames: hero ? 16 : 10, config: hero ? {damping: 9, stiffness: 210, mass: 0.7} : {damping: 14, stiffness: 240, mass: 0.6}});
  return (
    <span style={{display: 'inline-block', opacity: frame >= start - 0.5 ? 1 : 0, transform: `translateY(${interpolate(p, [0, 1], [hero ? 0 : 18, 0])}px) scale(${interpolate(p, [0, 1], [hero ? 1.5 : 0.85, 1])}) rotate(${hero ? interpolate(p, [0, 1], [-3, 0]) : 0}deg)`, transformOrigin: 'center 70%', ...style}}>
      {children}
    </span>
  );
};

const normSet = (a: string[]) => new Set(a.map(normalizeWord));

const CaptionView: React.FC<{l: Lockup; rect: Rect; emphasis: Set<string>; small: number; heroMax: number; endMs: number}> = ({l, rect, emphasis, small, heroMax, endMs}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const t = (frame / 30) * 1000;
  const exit = interpolate(t, [endMs - 130, endMs], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pre = l.words.slice(0, l.h0);
  const hero = l.words.slice(l.h0, l.h1 + 1);
  const post = l.words.slice(l.h1 + 1);
  const heroText = hero.map((w) => fixCase(w.text)).join(' ');
  const isMetal = hero.every((w) => emphasis.has(normalizeWord(w.text)));
  const heroPx = Math.max(76, Math.min(heroMax, (rect.w - 20) / Math.max(1, heroText.length * 0.5)));
  const smallStyle: React.CSSProperties = {fontFamily: SANS, fontWeight: 700, fontSize: small, letterSpacing: '-0.01em', lineHeight: 1.18, color: C.ink};
  const line = (ws: typeof pre, k: string) => (
    <div key={k} style={{display: 'flex', justifyContent: 'center', columnGap: 16, whiteSpace: 'nowrap'}}>
      {ws.map((w, i) => (
        <CaptionWord key={i} startMs={w.startMs} hero={false} style={smallStyle}>
          {fixCase(w.text)}
        </CaptionWord>
      ))}
    </div>
  );
  const heroStyle: React.CSSProperties = {fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 800, fontSize: heroPx, letterSpacing: '-0.015em', lineHeight: 1, paddingBottom: '0.12em', color: C.ink};
  return (
    <div style={{position: 'absolute', left: rect.x, bottom: height - (rect.y + rect.h), width: rect.w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: 1 - exit, transform: `translateY(${-exit * 10}px)`}}>
      {line(pre, 'pre')}
      <div style={{display: 'flex', justifyContent: 'center', columnGap: 26, whiteSpace: 'nowrap'}}>
        {hero.map((w, i) => (
          <CaptionWord key={i} startMs={w.startMs} hero style={heroStyle}>
            {isMetal ? (
              <MetalText kind="crimson" variant="deep" seed={l.h0 * 3 + i + 2}>
                {fixCase(w.text).toLowerCase()}
              </MetalText>
            ) : (
              fixCase(w.text).toLowerCase()
            )}
          </CaptionWord>
        ))}
      </div>
      {line(post, 'post')}
    </div>
  );
};

export const StickVideo: React.FC<StickProps> = ({format, plan, captions}) => {
  loadBrandFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const present = prog(t, plan.cues.ciciIn, 0.7);
  const L = layout(format, present);
  const caps = useMemo(() => captions.filter((c) => c.startMs / 1000 < plan.captionsEnd), [captions, plan.captionsEnd]);
  const lockups = useMemo(() => buildLockups(caps, {hero: plan.hero, emphasis: plan.emphasis}), [caps, plan.hero, plan.emphasis]);
  const emphasis = useMemo(() => normSet(plan.emphasis), [plan.emphasis]);

  const musicVolume = useMemo(() => {
    const m = plan.music;
    if (!m) return () => 0;
    const spans = captions.map((c) => [c.startMs / 1000 - 0.12, c.endMs / 1000 + 0.25] as const);
    return (f: number) => {
      const s = f / fps;
      let near = 0;
      for (const [a, b] of spans) {
        if (s >= a && s <= b) {
          near = 1;
          break;
        }
        const d = Math.min(Math.abs(s - a), Math.abs(s - b));
        if (d < 0.35) near = Math.max(near, 1 - d / 0.35);
      }
      const level = m.volume + (m.duckTo - m.volume) * near;
      const fin = m.fadeInSec > 0 ? Math.min(1, s / m.fadeInSec) : 1;
      const fout = m.fadeOutSec > 0 ? Math.min(1, Math.max(0, (plan.durationSec - s) / m.fadeOutSec)) : 1;
      return level * fin * fout;
    };
  }, [plan.music, plan.durationSec, captions, fps]);

  const idx = lockups.findIndex((l, k) => {
    const next = lockups[k + 1];
    return t * 1000 >= l.startMs - 80 && t * 1000 < Math.min(l.endMs + 320, next ? next.startMs - 40 : Infinity);
  });
  const lk = idx >= 0 ? lockups[idx] : null;
  const next = idx >= 0 ? lockups[idx + 1] : undefined;

  return (
    <AbsoluteFill style={{backgroundColor: C.white}}>
      <svg viewBox={L.viewBox} style={{position: 'absolute', left: L.stage.x, top: L.stage.y, width: L.stage.w, height: L.stage.h, overflow: 'visible'}}>
        <PileStage t={t} q={plan.cues} />
      </svg>
      <Cici plan={plan} fmt={format} t={t} />
      {lk && <CaptionView key={idx} l={lk} rect={L.caption} emphasis={emphasis} small={L.smallPx} heroMax={L.heroMax} endMs={Math.min(lk.endMs + 320, next ? next.startMs - 40 : Infinity)} />}
      <Audio src={staticFile(plan.vo)} />
      {plan.music && <Audio src={staticFile(plan.music.src)} volume={musicVolume} startFrom={Math.round(plan.music.startFromSec * fps)} loop />}
    </AbsoluteFill>
  );
};
