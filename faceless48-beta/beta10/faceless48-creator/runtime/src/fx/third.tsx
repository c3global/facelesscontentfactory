import React from 'react';
import {OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {handFamily, heavyFamily, sansFamily, serifFamily} from '../fonts';
import type {Fx, Target} from './schema';
import {anchorPx, easeOutC, fxRange, pop, tw, useFxEnv, useFxTime} from './util';

/** Third FX batch: paper cut, doodle boil, vertigo, cover story, glass type. */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
const SANS = sansFamily('DM Sans');

const rand = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** hand-made motion: the drawing re-rolls 8 times a second, whatever the video frame rate */
const useStep = (hz = 8) => {
  const {abs} = useFxTime(0);
  return Math.floor(abs * hz);
};
const useSpan = (fx: Fx) => {
  const [a, b] = fxRange(fx);
  const {t, abs, frame, fps} = useFxTime(a);
  const len = b - a;
  return {a, b, len, t, abs, frame, fps, inK: tw(t, 0, 0.35, 0, 1, pop), outK: 1 - tw(t, len - 0.3, len)};
};

// ================================================================ paper cut
const TONES = {
  kraft: {back: '#c8a27c', a: '#efe3cf', b: '#b0452f', c: '#2b2523'},
  cream: {back: '#efe6d6', a: '#d9c7a6', b: '#b0452f', c: '#3a2a22'},
  crimson: {back: '#8a1a1d', a: '#efe3cf', b: '#d5aa4a', c: '#2b0e0f'},
} as const;

/** a sheet of paper with torn, uneven edges (a polygon with jittered edge points) */
const tornPoints = (x: number, y: number, w: number, h: number, seed: number, amp = 14, step = 60) => {
  const pts: string[] = [];
  const j = (i: number) => (rand(i, seed) - 0.5) * 2 * amp;
  let n = 0;
  for (let px = 0; px <= w; px += step) pts.push(`${x + px + j(n++) * 0.4},${y + j(n++)}`);
  for (let py = step; py <= h; py += step) pts.push(`${x + w + j(n++)},${y + py + j(n++) * 0.4}`);
  for (let px = w - step; px >= 0; px -= step) pts.push(`${x + px + j(n++) * 0.4},${y + h + j(n++)}`);
  for (let py = h - step; py > 0; py -= step) pts.push(`${x + j(n++)},${y + py + j(n++) * 0.4}`);
  return pts.join(' ');
};

const PAPER_NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .13 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const PaperCutPlate: React.FC<{fx: Of<'paper-cut'>}> = ({fx}) => {
  const {a, abs, inK, outK} = useSpan(fx);
  const {fps} = useVideoConfig();
  const {slug, videoStyle} = useFxEnv();
  const step = useStep(8);
  const tone = TONES[fx.props.tone];
  const sheets = [
    {x: -40, y: 120, w: 1160, h: 560, c: tone.a, rot: -4},
    {x: -60, y: 760, w: 1200, h: 440, c: tone.b, rot: 3},
    {x: -50, y: 1320, w: 1180, h: 640, c: tone.c, rot: -2},
    {x: 560, y: 380, w: 560, h: 360, c: tone.b, rot: 6},
  ];
  const jit = (i: number, amt: number) => (rand(step * 3 + i, 9) - 0.5) * amt;
  return (
    <div style={{...FILL, background: tone.back, opacity: inK > 0.98 ? outK : inK * outK, overflow: 'hidden'}}>
      <div style={{...FILL, backgroundImage: PAPER_NOISE}} />
      {sheets.map((s, i) => {
        const slide = tw(abs - a, 0.05 * i, 0.4 + 0.07 * i, 1, 0, easeOutC);
        return (
          <svg key={i} width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(9px 13px 0 rgba(0,0,0,0.32))', transform: `translateX(${(i % 2 ? 1 : -1) * 900 * slide + jit(i, 5)}px) rotate(${s.rot + jit(i + 7, 0.8)}deg)`, transformOrigin: '50% 50%'}}>
            <polygon points={tornPoints(s.x, s.y, s.w, s.h, i + 2)} fill={s.c} />
          </svg>
        );
      })}
      {/* her hard cut-paper shadow: a black copy of the cutout, offset, no blur (a real paper shadow) */}
      {slug && (
        <OffthreadVideo
          src={staticFile(`matte/${slug}.webm`)}
          transparent
          muted
          startFrom={Math.round(a * fps)}
          style={{...FILL, objectFit: 'cover', ...videoStyle, filter: 'brightness(0)', opacity: 0.38 * outK, transform: `${videoStyle.transform ?? ''} translate(12px, 16px)`.trim()}}
        />
      )}
    </div>
  );
};

/** ransom-note label cut from paper, drawn over her */
export const PaperCutFront: React.FC<{fx: Of<'paper-cut'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const step = useStep(8);
  const text = fx.props.label;
  if (!text) return null;
  const letters = text.toUpperCase().split('');
  const tiles = ['#f6efe1', '#1f1a18', '#b0452f', '#d5aa4a'];
  return (
    <div style={{...FILL, opacity: outK, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1560, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, padding: '0 40px'}}>
        {letters.map((ch, i) =>
          ch === ' ' ? (
            <div key={i} style={{width: 34}} />
          ) : (
            <div
              key={i}
              style={{
                fontFamily: i % 3 === 0 ? serifFamily : i % 3 === 1 ? heavyFamily : SANS,
                fontWeight: 800,
                fontSize: 96 + Math.floor(rand(i, 3) * 26),
                lineHeight: 1,
                padding: '8px 14px',
                background: tiles[i % tiles.length],
                color: i % tiles.length === 0 || i % tiles.length === 3 ? '#1f1a18' : '#f6efe1',
                transform: `rotate(${(rand(i, 5) - 0.5) * 12 + (rand(step + i, 8) - 0.5) * 1.6}deg) translateY(${(1 - tw(abs - fx.at, 0.5 + i * 0.05, 0.7 + i * 0.05)) * 40}px)`,
                opacity: tw(abs - fx.at, 0.5 + i * 0.05, 0.62 + i * 0.05),
                boxShadow: '5px 7px 0 rgba(0,0,0,0.32)',
                clipPath: `polygon(${rand(i, 1) * 5}% 0, 100% ${rand(i, 2) * 6}%, ${100 - rand(i, 4) * 5}% 100%, 0 ${100 - rand(i, 6) * 6}%)`,
              }}
            >
              {ch}
            </div>
          ),
        )}
      </div>
    </div>
  );
};

// ================================================================ doodle boil
type Pt = [number, number];
const sampleQuad = (p0: Pt, p1: Pt, p2: Pt, n = 22): Pt[] =>
  Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    return [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]] as Pt;
  });

const strokesFor = (kind: Of<'doodle-boil'>['props']['marks'][number]['kind'], cx: number, cy: number, side: number): Pt[][] => {
  switch (kind) {
    case 'circle': {
      const rx = 250;
      const ry = 285;
      return [Array.from({length: 46}, (_, i) => {
        const a = -2 + (i / 45) * (Math.PI * 2 + 0.55);
        const wob = 1 + 0.04 * Math.sin(a * 2.3);
        return [cx + Math.cos(a) * rx * wob, cy + 40 + Math.sin(a) * ry * wob] as Pt;
      })];
    }
    case 'underline':
      return [Array.from({length: 34}, (_, i) => [cx - 270 + (i / 33) * 540, cy + 6 * Math.sin(i * 0.9) + (i / 33) * -8] as Pt), Array.from({length: 26}, (_, i) => [cx - 200 + (i / 25) * 400, cy + 34 + 5 * Math.sin(i * 1.1 + 1)] as Pt)];
    case 'arrow': {
      const tail: Pt = [cx + side * 320, cy + 250];
      const tip: Pt = [cx + side * 70, cy + 30];
      const curve = sampleQuad(tail, [cx + side * 330, cy + 60], tip);
      return [curve, [[tip[0] + side * 62, tip[1] + 8], tip, [tip[0] + side * 18, tip[1] + 70]]];
    }
    case 'star': {
      const pts: Pt[] = Array.from({length: 11}, (_, i) => {
        const r = i % 2 === 0 ? 70 : 30;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        return [cx + side * 250 + Math.cos(a) * r, cy - 150 + Math.sin(a) * r] as Pt;
      });
      return [pts];
    }
    case 'burst': {
      const ox = cx + side * 260;
      const oy = cy - 120;
      return Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return [[ox + Math.cos(a) * 44, oy + Math.sin(a) * 44], [ox + Math.cos(a) * 96, oy + Math.sin(a) * 96]] as Pt[];
      });
    }
    case 'heart': {
      const hx = cx + side * 250;
      const hy = cy - 130;
      return [Array.from({length: 40}, (_, i) => {
        const t = (i / 39) * Math.PI * 2;
        const x = 16 * Math.sin(t) ** 3;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return [hx + x * 5.2, hy + y * 5.2] as Pt;
      })];
    }
    default:
      return [];
  }
};

const toPath = (pts: Pt[], step: number, seed: number, amp = 5) => pts.map((p, i) => `${i ? 'L' : 'M'}${(p[0] + (rand(i * 2 + step * 7, seed) - 0.5) * amp).toFixed(1)} ${(p[1] + (rand(i * 2 + 1 + step * 5, seed + 3) - 0.5) * amp).toFixed(1)}`).join(' ');

export const DoodleBoil: React.FC<{fx: Of<'doodle-boil'>}> = ({fx}) => {
  const {abs, frame, outK} = useSpan(fx);
  const {anchors} = useFxEnv();
  const step = useStep(8);
  const fallbackBox = {x: 540, y: 400};
  void fallbackBox;
  return (
    <div style={{...FILL, opacity: outK, pointerEvents: 'none'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        {fx.props.marks.map((m, mi) => {
          if (abs < m.at) return null;
          // anchors follow her per frame, so the doodle rides along with her head
          const f0 = Math.round(abs * 30);
          const {x, y} = anchorPx(anchors, f0, m.target);
          const side = m.side === 'left' ? -1 : 1;
          const k = tw(abs - m.at, 0, 0.55, 0, 1, (v) => v);
          const strokes = strokesFor(m.kind, x, y, side);
          const col = m.color === 'gold' ? '#E4BC62' : m.color === 'red' ? '#FF5A55' : '#FFFFFF';
          return (
            <g key={mi} strokeLinecap="round" strokeLinejoin="round" fill="none">
              {strokes.map((s, si) => {
                const n = strokes.length;
                const prog = Math.max(0, Math.min(1, k * n - si));
                const d = toPath(s, step, mi * 13 + si);
                return (
                  <g key={si}>
                    <path d={d} pathLength={1} stroke="rgba(0,0,0,0.38)" strokeWidth={15} strokeDasharray="1 1" strokeDashoffset={1 - prog} transform="translate(3 4)" />
                    <path d={d} pathLength={1} stroke={col} strokeWidth={8} strokeDasharray="1 1" strokeDashoffset={1 - prog} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      {fx.props.marks.map((m, mi) => {
        if (!m.text || abs < m.at + 0.15) return null;
        const f0 = Math.round(abs * 30);
        const {x, y} = anchorPx(anchors, f0, m.target);
        const side = m.side === 'left' ? -1 : 1;
        const col = m.color === 'gold' ? '#E4BC62' : m.color === 'red' ? '#FF5A55' : '#FFFFFF';
        const px = m.kind === 'text' ? x : m.kind === 'arrow' ? x + side * 330 : x + side * 250;
        const py = m.kind === 'text' ? y - 190 : m.kind === 'arrow' ? y + 270 : y - 260;
        const k = tw(abs - m.at, 0.15, 0.45, 0, 1, pop);
        const rot = (m.kind === 'text' ? -4 : side * 5) + (rand(step + mi, 4) - 0.5) * 3;
        void frame;
        return (
          <div key={`t${mi}`} style={{position: 'absolute', left: Math.max(20, Math.min(1080 - 20 - 520, px - 260)), width: 520, top: py - 50, textAlign: 'center', fontFamily: handFamily, fontSize: 92, lineHeight: 1, color: col, textShadow: '0 4px 0 rgba(0,0,0,0.42), 0 0 24px rgba(0,0,0,0.5)', transform: `rotate(${rot}deg) scale(${k})`, opacity: k}}>
            {m.text}
          </div>
        );
      })}
    </div>
  );
};

// ================================================================ vertigo (dolly zoom: she holds her size while the room stretches away)
export const VertigoPlate: React.FC<{fx: Of<'vertigo'>}> = ({fx}) => {
  const {a, b, abs, inK, outK} = useSpan(fx);
  const {fps} = useVideoConfig();
  const {video, videoStyle, anchors} = useFxEnv();
  const row = anchors ? anchors.anchors[Math.max(0, Math.min(anchors.anchors.length - 1, Math.round(a * fps)))] : undefined;
  const [top, cx, , left, right] = row ?? [0.08, 0.5, 0.42, 0.1, 0.9];
  const hold = Math.min(0.6, (b - a) * 0.25);
  const dir = fx.props.direction === 'out' ? -1 : 1;
  // 'in': the room expands from 1 to `to`. 'out': it starts expanded and settles back
  const z = fx.props.direction === 'out' ? 1 + (fx.props.to - 1) * (1 - tw(abs, a, b - hold, 0, 1, (x) => x * x * (3 - 2 * x))) : 1 + (fx.props.to - 1) * tw(abs, a, b - hold, 0, 1, (x) => x * x * (3 - 2 * x));
  void dir;
  const halfW = ((right - left) / 2) * 1080;
  const cy = top * 1920 + ((1 - top) * 1920) / 2;
  const rx = halfW * z * 1.12;
  const ry = ((1 - top) * 1920 * z) / 2 * 1.1;
  const cxp = cx * 1080;
  const fadeIn = tw(abs, a, a + 0.25);
  return (
    <div style={{...FILL, opacity: fadeIn * outK}}>
      <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover', ...videoStyle, filter: 'blur(26px) brightness(0.8)'}} />
      <div
        style={{
          ...FILL,
          overflow: 'hidden',
          WebkitMaskImage: `radial-gradient(ellipse ${rx}px ${ry}px at ${cxp}px ${cy}px, transparent 78%, #000 100%)`,
          maskImage: `radial-gradient(ellipse ${rx}px ${ry}px at ${cxp}px ${cy}px, transparent 78%, #000 100%)`,
        }}
      >
        <OffthreadVideo
          src={staticFile(video)}
          muted
          startFrom={Math.round(a * fps)}
          style={{...FILL, objectFit: 'cover', ...videoStyle, transform: `${videoStyle.transform ?? ''} scale(${z})`.trim(), transformOrigin: `${cxp}px ${top * 1920}px`, filter: `blur(${Math.max(0, (z - 1) * 5)}px)`}}
        />
      </div>
      <div style={{...FILL, background: `radial-gradient(70% 55% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,${0.35 * inK + 0.2 * (z - 1)}) 100%)`}} />
    </div>
  );
};

// ================================================================ cover story (she steps in front of a magazine masthead)
export const CoverStoryPlate: React.FC<{fx: Of<'cover-story'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  const k = tw(t, 0, 0.45, 0, 1, easeOutC);
  const m = fx.props.masthead.toUpperCase();
  const size = Math.min(250, 960 / (m.length * 0.74));
  return (
    <div style={{...FILL, background: '#f2ede2', opacity: outK * Math.min(1, inK * 3), overflow: 'hidden', transform: `scale(${1.05 - 0.05 * k})`}}>
      <div style={{...FILL, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.18) 100%)'}} />
      <div style={{position: 'absolute', left: 46, right: 46, top: 52, height: 3, background: '#1b1512'}} />
      <div style={{position: 'absolute', left: 0, width: 1080, top: 112, whiteSpace: 'nowrap', textAlign: 'center', fontFamily: serifFamily, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: 6, color: '#B01B1B', transform: `translateY(${(1 - k) * -70}px)`, opacity: k}}>{m}</div>
      <div style={{position: 'absolute', left: 46, right: 46, top: 66, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: '#1b1512', opacity: k}}>
        <span>{(fx.props.issue ?? '').toUpperCase()}</span>
        <span>{(fx.props.kicker ?? '').toUpperCase()}</span>
      </div>
    </div>
  );
};

/** the cover line and barcode, drawn over her so they read cleanly */
export const CoverStoryFront: React.FC<{fx: Of<'cover-story'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const k = tw(t, 0.5, 0.95, 0, 1, easeOutC);
  return (
    <div style={{...FILL, opacity: outK, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1280, height: 640, background: 'linear-gradient(180deg, rgba(10,6,6,0) 0%, rgba(10,6,6,0.88) 62%)'}} />
      <div style={{position: 'absolute', left: 54, right: 54, top: 1560, fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 900, fontSize: 104, lineHeight: 1.02, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.55)', transform: `translateY(${(1 - k) * 60}px)`, opacity: k}}>
        {fx.props.headline}
      </div>
      <div style={{position: 'absolute', left: 54, right: 54, top: 1450, display: 'flex', flexWrap: 'wrap', gap: '4px 26px', fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: '#E4BC62', opacity: k}}>
        {fx.props.lines.map((l, i) => (
          <span key={i}>{l.toUpperCase()}</span>
        ))}
      </div>
      <div style={{position: 'absolute', left: 54, bottom: 40, width: 180, height: 62, background: '#fff', opacity: k, display: 'flex', gap: 3, padding: '6px 10px', boxSizing: 'border-box'}}>
        {Array.from({length: 26}, (_, i) => (
          <div key={i} style={{flex: rand(i, 7) > 0.5 ? 2 : 1, background: '#111'}} />
        ))}
      </div>
    </div>
  );
};

// ================================================================ glass type (frosted lettering that blurs the room behind it)
export const GlassTypePlate: React.FC<{fx: Of<'glass-type'>}> = ({fx}) => {
  const {a, abs, t, inK, outK} = useSpan(fx);
  const {fps} = useVideoConfig();
  const {video, videoStyle} = useFxEnv();
  let idx = 0;
  fx.props.words.forEach((w, i) => {
    if (abs >= w.at) idx = i;
  });
  const cur = fx.props.words[idx];
  const word = cur.text.toUpperCase();
  const k = tw(abs - cur.at, 0, 0.22, 0, 1, pop);
  const size = Math.min(380, 960 / (word.length * 0.6));
  const cy = fx.props.y * 1920;
  const id = `glass-${fx.at.toFixed(2).replace('.', '_')}`;
  const textEl = (extra: React.SVGProps<SVGTextElement>) => (
    <text x={540} y={cy} textAnchor="middle" dominantBaseline="central" fontFamily={heavyFamily} fontSize={size} letterSpacing={6} {...extra}>
      {word}
    </text>
  );
  void t;
  return (
    <div style={{...FILL, opacity: inK > 0.98 ? outK : inK * outK, transform: `scale(${0.94 + 0.06 * k})`, transformOrigin: `50% ${fx.props.y * 100}%`}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <clipPath id={id}>{textEl({})}</clipPath>
        </defs>
      </svg>
      {/* soft shadow under the glass */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, filter: 'blur(14px)'}}>
        {textEl({fill: 'rgba(0,0,0,0.38)', transform: 'translate(0 14)'})}
      </svg>
      {/* frosted fill: the same room, blurred and lifted, only inside the letters */}
      <div style={{...FILL, clipPath: `url(#${id})`, overflow: 'hidden'}}>
        <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover', ...videoStyle, filter: 'blur(22px) brightness(1.28) saturate(1.1)'}} />
        <div style={{...FILL, background: `linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.10) 48%, rgba(255,255,255,0.20) 100%)`}} />
      </div>
      {/* glass edge: a bright rim and a thin inner line */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        {textEl({fill: 'none', stroke: 'rgba(255,255,255,0.85)', strokeWidth: 3})}
        {textEl({fill: 'none', stroke: 'rgba(255,255,255,0.28)', strokeWidth: 10, transform: 'translate(0 3)'})}
      </svg>
    </div>
  );
};

export const thirdPlate = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'paper-cut':
      return <PaperCutPlate fx={fx} />;
    case 'vertigo':
      return <VertigoPlate fx={fx} />;
    case 'cover-story':
      return <CoverStoryPlate fx={fx} />;
    default:
      return null;
  }
};
export const thirdFront = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'paper-cut':
      return <PaperCutFront fx={fx} />;
    case 'cover-story':
      return <CoverStoryFront fx={fx} />;
    default:
      return null;
  }
};
export const thirdOver = (fx: Fx): React.ReactNode => (fx.type === 'doodle-boil' ? <DoodleBoil fx={fx} /> : fx.type === 'glass-type' ? <GlassTypePlate fx={fx} /> : null);
export type {Target};
void brand;
