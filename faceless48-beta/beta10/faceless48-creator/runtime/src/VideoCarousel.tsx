import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {customerBrand as B} from './brandConfig';
import {handFamily, loadBrandFonts} from './fonts';

/**
 * Video carousel: an animated Instagram-style carousel (1080 x 1350, 4:5). One idea per slide, ready-made layouts,
 * always in the member's brand (colors, fonts, metallic finish and logo come from brand.json automatically).
 * Optional presenter: a cutout PNG of the member or their AI avatar (make one with `npm run cutout -- <photo>`), or nobody.
 * Wrap a word in *asterisks* in any headline to set it in the accent script.
 */
const slideSchema = z.object({
  layout: z.enum(['cover', 'statement', 'list', 'checklist', 'compare', 'quote', 'steps', 'status', 'branches', 'media', 'toggles', 'proof', 'graph', 'ab', 'doc', 'cta']),
  seconds: z.number().min(2).max(20).default(6),
  kicker: z.string().max(60).default(''),
  headline: z.string().max(140),
  body: z.string().max(220).default(''),
  items: z.array(z.string().max(110)).max(6).default([]),
  /** compare: the two column titles */
  left: z.string().max(40).default('Before'),
  right: z.string().max(40).default('After'),
  /** quote: who said it */
  by: z.string().max(60).default(''),
  /** cta: the comment keyword */
  keyword: z.string().max(20).default(''),
  /** status: the panel title, the working line and the finished line; items become a paper checklist that ticks */
  panel: z.string().max(40).default(''),
  working: z.string().max(60).default('Working...'),
  done: z.string().max(60).default('Complete'),
  /** branches: the top card; items become up to 3 cards ("Label: text") */
  root: z.string().max(60).default(''),
  /** a handwritten line that writes on near the bottom */
  note: z.string().max(80).default(''),
  /** photo in public/ shown framed (cover and statement) */
  image: z.string().optional(),
  /** text alignment for this slide (defaults to the carousel's align) */
  align: z.enum(['left', 'center', 'right']).optional(),
  /** cta: which end screen: keyword (comment a word), follow, save, link (link in bio), question */
  end: z.enum(['keyword', 'follow', 'save', 'link', 'question', 'collage']).default('keyword'),
  /** media: a clip (.mp4) or picture in public/ shown in a frame; collage end: pictures for the grid */
  media: z.string().optional(),
  side: z.enum(['left', 'right', 'center']).default('center'),
  images: z.array(z.string()).max(12).default([]),
  /** proof: the number to count up to, with optional prefix/suffix ("$", "%") */
  value: z.number().optional(),
  prefix: z.string().max(4).default(''),
  suffix: z.string().max(6).default(''),
  /** graph: points (any scale) and the closing value label */
  points: z.array(z.number()).max(12).default([]),
  /** ab: the two panel titles and which one wins (a or b) */
  winner: z.enum(['a', 'b']).default('b'),
  /** handwritten notes with curved arrows: x, y and the arrow tip `to` in percent of the slide area */
  notes: z.array(z.object({text: z.string().max(60), x: z.number().min(0).max(100), y: z.number().min(0).max(100), to: z.tuple([z.number(), z.number()]).optional()})).max(4).default([]),
  /** cta follow/link: the handle or link to show, for example @yourbrand */
  handle: z.string().max(40).default(''),
  /** show the presenter cutout on this slide (default: on cover, statement, status and branches) */
  presenter: z.boolean().optional(),
});
export const videoCarouselSchema = z.object({
  kind: z.literal('video-carousel'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** look: editorial (glass panels, serif accents), luxe (deeper, metallic rules), clean (light paper), bold (big type, accent fields) */
  style: z.enum(['editorial', 'luxe', 'clean', 'bold', 'glass', 'showcase']).default('editorial'),
  /** small label in the header, for example a series name */
  series: z.string().max(40).default(''),
  /** text alignment for every slide: center (default), left or right */
  align: z.enum(['left', 'center', 'right']).default('center'),
  /** footer link or handle, for example bio.yourbrand.com */
  link: z.string().max(40).default(''),
  /** cutout PNG of the member or their AI avatar (transparent background), or leave out for no presenter */
  presenter: z.object({src: z.string(), side: z.enum(['right', 'left']).default('right'), scale: z.number().min(0.5).max(1.5).default(1)}).optional(),
  music: z.object({src: z.string(), volume: z.number().min(0).max(1).default(0.25)}).optional(),
  slides: z.array(slideSchema).min(1).max(10),
});
export type VideoCarouselPlan = z.infer<typeof videoCarouselSchema>;
type Slide = z.infer<typeof slideSchema>;
export const carouselFrames = (p: VideoCarouselPlan, fps = 30) => Math.round(p.slides.reduce((a, s) => a + s.seconds, 0) * fps);

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (p: number) => 1 - Math.pow(1 - p, 3);
const prog = (t: number, a: number, d = 0.6) => clamp((t - a) / d);
const rise = (t: number, a: number): React.CSSProperties => ({opacity: prog(t, a, 0.35), transform: `translateY(${(1 - ease(prog(t, a))) * 26}px)`});
const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

type Th = {bg: string; ink: string; muted: string; rule: string; panel: React.CSSProperties; hero: number};
const theme = (style: VideoCarouselPlan['style']): Th => {
  const glass: React.CSSProperties = {background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.07))', border: `1.5px solid ${hexA(B.metalLight, 0.36)}`, borderRadius: 26, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 24px 70px rgba(0,0,0,0.45)'};
  if (style === 'glass')
    return {bg: `#06091A`, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.7)', rule: 'rgba(255,255,255,0.16)', panel: {background: 'linear-gradient(140deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.09))', border: '1.5px solid rgba(255,255,255,0.28)', borderRadius: 28, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 30px 80px rgba(0,0,0,0.5)', backdropFilter: 'blur(18px)'}, hero: 88};
  if (style === 'showcase')
    return {bg: `radial-gradient(ellipse at 70% 30%, ${hexA(B.metal, 0.22)}, transparent 60%), linear-gradient(170deg, #2A1A12, #120B07)`, ink: '#FFFFFF', muted: 'rgba(255,240,225,0.7)', rule: 'rgba(255,220,190,0.18)', panel: {background: 'rgba(255,255,255,0.07)', border: `1.5px solid ${hexA(B.metalLight, 0.3)}`, borderRadius: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}, hero: 88};
  if (style === 'clean')
    return {bg: `radial-gradient(ellipse at 85% 40%, ${hexA(B.accent, 0.1)}, transparent 60%), #F6F3EE`, ink: '#16161A', muted: 'rgba(22,22,26,0.62)', rule: 'rgba(22,22,26,0.14)', panel: {background: '#FFFFFF', border: `1.5px solid ${hexA(B.metal, 0.4)}`, borderRadius: 24, boxShadow: '0 18px 46px rgba(30,20,10,0.12)'}, hero: 84};
  if (style === 'bold')
    return {bg: `radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(155deg, ${B.accent}, ${B.accentMid} 55%, ${B.accentDeep})`, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.82)', rule: 'rgba(255,255,255,0.28)', panel: {background: 'rgba(255,255,255,0.14)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 30, boxShadow: '0 20px 50px rgba(0,0,0,0.25)'}, hero: 108};
  if (style === 'luxe')
    return {bg: `radial-gradient(ellipse at 80% 55%, ${hexA(B.accentDeep, 0.55)}, transparent 62%), radial-gradient(ellipse at 15% 0%, ${hexA(B.metal, 0.18)}, transparent 50%), #070708`, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.66)', rule: hexA(B.metal, 0.35), panel: glass, hero: 90};
  return {bg: `radial-gradient(ellipse at 85% 45%, ${hexA(B.accent, 0.26)}, transparent 60%), radial-gradient(ellipse at 10% 0%, ${hexA(B.metal, 0.16)}, transparent 50%), #0B0B0D`, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.68)', rule: 'rgba(255,255,255,0.14)', panel: glass, hero: 92};
};

const serif = `"${B.headingFont}", Georgia, serif`;
const sans = `"${B.bodyFont}", "Helvetica Neue", Arial, sans-serif`;
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};
// HI: the readable highlight color for the current style (light styles use the deeper metal tone)
let HI = B.metalLight;
let AL: 'left' | 'center' | 'right' = 'center';
let LIGHT = false;
const metalTextBase: React.CSSProperties = {fontFamily: serif, fontStyle: 'italic', fontWeight: 600, letterSpacing: 0, background: `linear-gradient(135deg, ${B.metalLight}, ${B.metal} 70%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'};

const metalTextFor = (light: boolean, bold = false): React.CSSProperties =>
  bold ? {...metalTextBase, background: `linear-gradient(135deg, #FFFFFF, ${shade(B.metalLight, 0.45)})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.25))'} : light ? {...metalTextBase, background: `linear-gradient(135deg, ${shade(B.metal, -0.05)}, ${shade(B.metal, -0.4)})`, WebkitBackgroundClip: 'text', backgroundClip: 'text'} : metalTextBase;
let metalText = metalTextBase;
let SHINE = 0;
const shine = (base: React.CSSProperties): React.CSSProperties => ({...base, backgroundImage: `linear-gradient(110deg, transparent ${SHINE - 12}%, rgba(255,255,255,0.85) ${SHINE}%, transparent ${SHINE + 12}%), ${String(base.background)}`});
const Headline: React.FC<{text: string; size: number; th: Th; center?: boolean}> = ({text, size, th, center}) => (
  <h1 style={{fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -size * 0.03, margin: 0, color: th.ink, textAlign: center ? 'center' : 'inherit'}}>
    {text.split(/(\*[^*]+\*)/g).map((part, i) => (part.startsWith('*') && part.endsWith('*') ? <span key={i} style={shine(metalText)}>{part.slice(1, -1)}</span> : <React.Fragment key={i}>{part}</React.Fragment>))}
  </h1>
);
const Kicker: React.FC<{text: string; t: number; center?: boolean}> = ({text, t, center}) =>
  text ? <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: HI, marginBottom: 22, textAlign: center ? 'center' : 'inherit', ...rise(t, 0)}}>{text}</div> : null;
const Check: React.FC<{t: number; at: number; size?: number}> = ({t, at, size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{flex: 'none'}}>
    <circle cx={20} cy={20} r={18} fill={B.accent} />
    <path d="m11 20 6 6 13-14" pathLength={1} fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" style={{strokeDasharray: 1, strokeDashoffset: 1 - prog(t, at, 0.4)}} />
  </svg>
);
const Num: React.FC<{n: number}> = ({n}) => <span style={{...metalText, fontSize: 52, minWidth: 74}}>{String(n).padStart(2, '0')}</span>;
const Note: React.FC<{text: string; t: number; at: number}> = ({text, t, at}) =>
  text ? <div style={{fontFamily: handFamily, fontWeight: 700, fontSize: 56, color: HI, clipPath: `inset(0 ${100 - prog(t, at, 0.9) * 100}% 0 0)`, marginTop: 30}}>{text}</div> : null;
const Framed: React.FC<{src: string; t: number; style: React.CSSProperties}> = ({src, t, style}) => (
  <div style={{position: 'absolute', overflow: 'hidden', borderRadius: 30, border: `2px solid ${hexA(B.metalLight, 0.6)}`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', opacity: prog(t, 0.3, 0.4), ...style}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + 0.03 * Math.sin(t * 0.4)})`}} />
  </div>
);

// ---- props: the animated status panel and the paper checklist (the AI review / old checklist look)
const StatusPanel: React.FC<{s: Slide; t: number; th: Th; style?: React.CSSProperties}> = ({s, t, th, style}) => {
  const doneK = prog(t, 1.6, 0.3);
  const bar = Math.min(1, t / 1.6);
  return (
    <div style={{...th.panel, width: 560, padding: '30px 34px', ...style}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{fontFamily: sans, fontWeight: 700, fontSize: 21, letterSpacing: 2.5, textTransform: 'uppercase', color: th.muted}}>{s.panel}</span>
        <div style={{width: 13, height: 13, borderRadius: 7, background: doneK > 0.5 ? B.metalLight : B.accent, boxShadow: `0 0 16px ${doneK > 0.5 ? B.metalLight : B.accent}`}} />
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 30}}>
        {doneK > 0.5 ? <Check t={t} at={1.65} size={42} /> : <div style={{width: 34, height: 34, borderRadius: 17, border: `4px solid ${hexA(B.metalLight, 0.25)}`, borderTopColor: B.metalLight, transform: `rotate(${t * 360}deg)`}} />}
        <span style={{fontFamily: sans, fontWeight: 700, fontSize: 36, color: th.ink}}>{doneK > 0.5 ? s.done : s.working}</span>
      </div>
      <div style={{marginTop: 26, height: 8, borderRadius: 4, background: th.rule, overflow: 'hidden'}}>
        <div style={{width: `${bar * 100}%`, height: '100%', background: `linear-gradient(90deg, ${B.accent}, ${B.metalLight})`}} />
      </div>
    </div>
  );
};
const Paper: React.FC<{items: string[]; t: number; at: number; style?: React.CSSProperties}> = ({items, t, at, style}) => (
  <div style={{width: 300, padding: '26px 28px', background: '#FAFAF8', borderRadius: 12, color: '#16181D', boxShadow: '0 28px 65px rgba(0,0,0,0.5)', ...style}}>
    <div style={{fontFamily: sans, fontSize: 18, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase'}}>Checklist</div>
    {items.map((x, n) => (
      <div key={n} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18}}>
        <svg width={26} height={26} viewBox="0 0 25 25" style={{flex: 'none'}}>
          <rect x={2} y={2} width={21} height={21} rx={4} fill="none" stroke="#A9ADB5" strokeWidth={1.5} />
          <path d="m6 12 5 5 9-11" fill="none" stroke={B.accent} strokeWidth={2.6} pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - prog(t, at + n * 0.45, 0.3)}} />
        </svg>
        <span style={{fontFamily: sans, fontSize: 21, lineHeight: 1.25}}>{x}</span>
      </div>
    ))}
  </div>
);

// ---- handwritten notes with curved arrows (annotate any slide)
const Annotations: React.FC<{notes: Slide['notes']; t: number}> = ({notes, t}) => (
  <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    {notes.map((n, i) => {
      const at = 1.0 + i * 0.5;
      const W = 928;
      const H = 990;
      const x = (n.x / 100) * W;
      const y = (n.y / 100) * H;
      return (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: x, top: y, width: 300, fontFamily: handFamily, fontWeight: 700, fontSize: 40, lineHeight: 1.05, color: NOTE_INK, transform: `rotate(-4deg)`, clipPath: `inset(0 ${100 - prog(t, at, 0.7) * 100}% 0 0)`, textShadow: '0 2px 8px rgba(0,0,0,0.35)'}}>{n.text}</div>
          {n.to && (() => {
            const tx = (n.to[0] / 100) * W;
            const ty = (n.to[1] / 100) * H;
            const sx = x + 40;
            const sy = y + 70;
            const mx = (sx + tx) / 2 + (ty - sy) * 0.25;
            const my = (sy + ty) / 2 - (tx - sx) * 0.25;
            const ang = Math.atan2(ty - my, tx - mx);
            const k = prog(t, at + 0.6, 0.5);
            return (
              <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <path d={`M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`} fill="none" stroke={NOTE_INK} strokeWidth={4} strokeLinecap="round" pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - k}} />
                <path d={`M ${tx - 22 * Math.cos(ang - 0.5)} ${ty - 22 * Math.sin(ang - 0.5)} L ${tx} ${ty} L ${tx - 22 * Math.cos(ang + 0.5)} ${ty - 22 * Math.sin(ang + 0.5)}`} fill="none" stroke={NOTE_INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={k > 0.95 ? 1 : 0} />
              </svg>
            );
          })()}
        </React.Fragment>
      );
    })}
  </div>
);
let NOTE_INK = '#F2D24B';

// ---- drifting light for the glass style
const GlassLight: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    {[{c: B.metal, x: 760, y: 980, r: 420, s: 0.35}, {c: B.accent, x: 120, y: 260, r: 520, s: 0.27}, {c: B.metalLight, x: 980, y: 260, r: 260, s: 0.5}].map((b, i) => (
      <div key={i} style={{position: 'absolute', left: b.x - b.r + 70 * Math.sin(t * b.s + i), top: b.y - b.r + 50 * Math.cos(t * b.s * 0.8 + i * 2), width: b.r * 2, height: b.r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(b.c, 0.55)}, transparent 65%)`, filter: 'blur(40px)'}} />
    ))}
  </div>
);

const Media: React.FC<{src: string; t: number; style: React.CSSProperties}> = ({src, t, style}) => (
  <div style={{position: 'absolute', overflow: 'hidden', borderRadius: 28, border: `2px solid ${hexA(B.metalLight, 0.45)}`, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', opacity: prog(t, 0.2, 0.4), ...style}}>
    {/\.(mp4|mov|webm)$/i.test(src) ? <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.03 + 0.03 * Math.sin(t * 0.5)})`}} />}
  </div>
);

const SlideBody: React.FC<{s: Slide; t: number; th: Th; withPresenter: boolean}> = ({s, t, th, withPresenter}) => {
  const items = s.items;
  const narrow: React.CSSProperties = withPresenter ? {maxWidth: 640} : {};
  const panelAlign: React.CSSProperties = AL === 'center' && !withPresenter ? {marginLeft: 'auto', marginRight: 'auto'} : AL === 'right' ? {marginLeft: 'auto'} : {};
  switch (s.layout) {
    case 'cover':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={{...rise(t, 0.1), ...narrow}}><Headline text={s.headline} size={s.images.length ? 120 : th.hero} th={th} /></div>
          {s.body && <p style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: th.muted, marginTop: 30, maxWidth: s.image || withPresenter ? 560 : 900, ...panelAlign, ...rise(t, 0.35)}}>{s.body}</p>}
          <Note text={s.note} t={t} at={1.2} />
          {s.image && <Framed src={s.image} t={t} style={{right: -10, bottom: 0, width: 400, height: 520, transform: 'rotate(3deg)'}} />}
          {s.images.length > 0 && (
            <div style={{position: 'relative', height: 470, marginTop: 30}}>
              {s.images.slice(0, 3).map((src, i) => {
                const n = Math.min(3, s.images.length);
                const off = i - (n - 1) / 2;
                const k = ease(prog(t, 0.4 + i * 0.15, 0.6));
                return (
                  <div key={i} style={{position: 'absolute', left: 464 - 150 + off * 230 * k, top: 30 + Math.abs(off) * 30, width: 300, height: 400, borderRadius: 22, overflow: 'hidden', border: `2px solid ${hexA(B.metalLight, 0.5)}`, boxShadow: '0 30px 60px rgba(0,0,0,0.55)', transform: `rotate(${off * 9 * k}deg) translateY(${Math.sin(t * 0.9 + i) * 5}px)`, opacity: k, zIndex: 3 - Math.abs(off)}}>
                    {/\.(mp4|mov|webm)$/i.test(src) ? <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                  </div>
                );
              })}
            </div>
          )}
        </>
      );
    case 'statement':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={{...rise(t, 0.1), ...narrow}}><Headline text={s.headline} size={80} th={th} /></div>
          {s.body && (
            <div style={{...th.panel, marginTop: 50, padding: '36px 40px', ...narrow, ...rise(t, 0.45)}}>
              <div style={{width: 60, height: 5, background: B.accent, marginBottom: 22, transform: `scaleX(${prog(t, 0.6)})`, transformOrigin: 'left'}} />
              <div style={{fontFamily: sans, fontSize: 38, lineHeight: 1.35, color: th.ink}}>{s.body}</div>
            </div>
          )}
          <Note text={s.note} t={t} at={1.4} />
          {s.image && <Framed src={s.image} t={t} style={{right: 0, bottom: 0, width: 300, height: 380}} />}
        </>
      );
    case 'status':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={{...rise(t, 0.1), ...narrow}}><Headline text={s.headline} size={78} th={th} /></div>
          <div style={{position: 'relative', height: 520, marginTop: 40, width: withPresenter ? 640 : 860, alignSelf: AL === 'center' && !withPresenter ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', textAlign: 'left'}}>
            <StatusPanel s={s} t={t} th={th} style={{position: 'absolute', left: 0, top: 0, transform: `rotate(-3deg) ${rise(t, 0.3).transform} translateY(${Math.sin(t * 0.9) * 5}px)`, opacity: prog(t, 0.3, 0.35)}} />
            {items.length > 0 && (
              <svg width={300} height={220} viewBox="0 0 300 220" style={{position: 'absolute', left: withPresenter ? 150 : 300, top: 150, overflow: 'visible'}}>
                <path d="M 10 30 C 120 30, 170 80, 215 160" fill="none" stroke={HI} strokeWidth={5} strokeLinecap="round" pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - prog(t, 1.75, 0.45)}} />
                <path d="M 192 150 L 218 166 L 224 136" fill="none" stroke={HI} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={prog(t, 2.15, 0.15)} />
              </svg>
            )}
            {items.length > 0 && <Paper items={items} t={t} at={2.6} style={{position: 'absolute', left: withPresenter ? 330 : 520, top: 190, transform: `rotate(5deg) translateY(${Math.sin(t * 1.1) * 6}px)`, opacity: prog(t, 2.2, 0.35)}} />}
          </div>
          <Note text={s.note} t={t} at={3.4} />
        </>
      );
    case 'branches': {
      const cards = items.slice(0, 3).map((x) => {
        const [label, ...rest] = x.split(':');
        return rest.length ? {label: label.trim(), text: rest.join(':').trim()} : {label: '', text: x};
      });
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={{...rise(t, 0.1), ...narrow}}><Headline text={s.headline} size={74} th={th} /></div>
          <div style={{...th.panel, marginTop: 40, padding: '24px 30px', width: withPresenter ? 520 : 600, alignSelf: withPresenter ? 'flex-start' : AL === 'center' ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', textAlign: 'left', ...rise(t, 0.35)}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 20, letterSpacing: 2.5, textTransform: 'uppercase', color: th.muted}}>{s.panel || 'The plan'}</div>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 36, color: th.ink, marginTop: 10}}>{s.root}</div>
          </div>
          <svg width={928} height={70} style={{display: 'block'}}>
            <path d={`M ${withPresenter ? 260 : 464} 0 V 30 H 155 V 70 M ${withPresenter ? 260 : 464} 30 H 773 V 70 M 464 30 V 70`} fill="none" stroke={hexA(B.metalLight, 0.6)} strokeWidth={2.5} pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - prog(t, 0.8, 0.6)}} />
          </svg>
          <div style={{display: 'flex', gap: 22, textAlign: 'left'}}>
            {cards.map((c, i) => (
              <div key={i} style={{...th.panel, flex: 1, padding: '24px 24px 28px', ...rise(t, 1.2 + i * 0.3)}}>
                <span style={{...metalText, fontSize: 40}}>{String(i + 1).padStart(2, '0')}</span>
                {c.label && <div style={{fontFamily: sans, fontWeight: 700, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: HI, marginTop: 8}}>{c.label}</div>}
                <div style={{fontFamily: sans, fontSize: 27, lineHeight: 1.3, color: th.ink, marginTop: 8}}>{c.text}</div>
              </div>
            ))}
          </div>
          <Note text={s.note} t={t} at={2.4} />
        </>
      );
    }
    case 'list':
    case 'checklist':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.1)}><Headline text={s.headline} size={76} th={th} /></div>
          {s.body && <p style={{fontFamily: sans, fontSize: 30, lineHeight: 1.4, color: th.muted, marginTop: 20, ...rise(t, 0.2)}}>{s.body}</p>}
          <div style={{display: 'flex', flexDirection: 'column', gap: 20, marginTop: 40}}>
            {items.map((x, i) => (
              <div key={i} style={{...th.panel, padding: '26px 32px', display: 'flex', alignItems: 'center', gap: 26, textAlign: 'left', ...rise(t, 0.45 + i * 0.35), marginLeft: Math.sin(t * 1.3 + i) * 3}}>
                {s.layout === 'checklist' ? <Check t={t} at={0.75 + i * 0.35} /> : <Num n={i + 1} />}
                <span style={{fontFamily: sans, fontSize: 34, lineHeight: 1.3, color: th.ink}}>{x}</span>
              </div>
            ))}
          </div>
          <Note text={s.note} t={t} at={1.2 + items.length * 0.35} />
        </>
      );
    case 'compare': {
      const half = Math.ceil(items.length / 2);
      const cols = [items.slice(0, half), items.slice(half)];
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.1)}><Headline text={s.headline} size={74} th={th} /></div>
          <div style={{display: 'flex', gap: 24, marginTop: 50, textAlign: 'left'}}>
            {cols.map((col, c) => (
              <div key={c} style={{...th.panel, flex: 1, padding: 34, ...(c === 1 ? (LIGHT ? {borderColor: B.accent, background: B.accent, color: '#fff'} : {borderColor: B.accent, background: `linear-gradient(135deg, ${hexA(B.accent, 0.35)}, ${hexA(B.accentDeep, 0.25)})`}) : {opacity: 0.85}), ...rise(t, 0.4 + c * 0.5)}}>
                <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: c === 1 ? (LIGHT ? '#FFFFFF' : HI) : th.muted}}>{c === 0 ? s.left : s.right}</div>
                {col.map((x, i) => (
                  <div key={i} style={{fontFamily: sans, fontSize: 32, lineHeight: 1.3, color: LIGHT && c === 1 ? '#FFFFFF' : th.ink, marginTop: 22, textDecoration: c === 0 && prog(t, 1.4 + i * 0.25) > 0.5 ? `line-through ${hexA(B.accent, 0.9)}` : 'none'}}>{x}</div>
                ))}
              </div>
            ))}
          </div>
          <Note text={s.note} t={t} at={2} />
        </>
      );
    }
    case 'quote':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={{fontFamily: serif, fontSize: 220, lineHeight: 0.6, color: B.metal, opacity: prog(t, 0, 0.4), height: 110}}>“</div>
          <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 500, fontSize: 70, lineHeight: 1.18, color: th.ink, ...rise(t, 0.2)}}>{s.headline.replace(/\*/g, '')}</div>
          {s.by && <div style={{fontFamily: sans, fontWeight: 700, fontSize: 28, letterSpacing: 3, textTransform: 'uppercase', color: HI, marginTop: 40, ...rise(t, 0.6)}}>{s.by}</div>}
        </>
      );
    case 'steps':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.1)}><Headline text={s.headline} size={74} th={th} /></div>
          <div style={{position: 'relative', marginTop: 50, paddingLeft: 40, alignSelf: AL === 'center' ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', textAlign: 'left'}}>
            <div style={{position: 'absolute', left: 21, top: 20, width: 3, height: `${Math.max(0, items.length - 1) * 150 * prog(t, 0.5, 0.4 + items.length * 0.35)}px`, background: `linear-gradient(${B.metalLight}, ${B.metal})`}} />
            {items.map((x, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 34, height: 150, marginLeft: -40, ...rise(t, 0.5 + i * 0.35)}}>
                <div style={{width: 46, height: 46, borderRadius: 23, background: `linear-gradient(135deg, ${B.metalLight}, ${B.metal})`, color: '#1a0e06', fontFamily: sans, fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
                <span style={{fontFamily: sans, fontSize: 36, lineHeight: 1.3, color: th.ink}}>{x}</span>
              </div>
            ))}
          </div>
        </>
      );
    case 'media': {
      const w = s.side === 'center' ? 560 : 520;
      const left = s.side === 'left' ? 0 : s.side === 'right' ? 928 - w : (928 - w) / 2;
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.05)}><Headline text={s.headline} size={78} th={th} /></div>
          <div style={{position: 'relative', height: 700, marginTop: 30}}>
            {s.media && <Media src={s.media} t={t} style={{left, top: 0, width: w, height: 700, transform: `translateY(${Math.sin(t * 0.8) * 4}px)`}} />}
          </div>
        </>
      );
    }
    case 'toggles': {
      const active = Math.min(items.length - 1, Math.floor(Math.max(0, t - 0.6) / 0.9));
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.05)}><Headline text={s.headline} size={78} th={th} /></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 44, textAlign: 'left'}}>
            {items.map((x, i) => {
              const on = i < active || (i === active && t > 0.6);
              const cur = i === active;
              return (
                <div key={i} style={{...th.panel, borderRadius: 60, padding: cur ? '26px 34px' : '20px 34px', display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${cur ? 1.04 : 0.94})`, filter: cur || i < active ? 'none' : 'blur(2.5px)', opacity: cur ? 1 : i < active ? 0.75 : 0.5, ...rise(t, 0.2 + i * 0.12)}}>
                  <span style={{fontFamily: sans, fontWeight: 700, fontSize: 26, color: HI}}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{flex: 1, fontFamily: sans, fontWeight: 700, fontSize: cur ? 36 : 30, color: th.ink}}>{x}</span>
                  <div style={{width: 74, height: 42, borderRadius: 21, background: on && !cur ? B.accent : on ? hexA(B.metalLight, 0.35) : 'rgba(255,255,255,0.15)', position: 'relative'}}>
                    <div style={{position: 'absolute', top: 4, left: on ? 36 : 4, width: 34, height: 34, borderRadius: 17, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)'}} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      );
    }
    case 'proof': {
      const v = s.value ?? 0;
      const k = 1 - Math.pow(1 - prog(t, 0.5, 1.6), 3);
      const shown = Math.round(v * k).toLocaleString('en-US');
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.05)}><Headline text={s.headline} size={78} th={th} /></div>
          <div style={{...th.panel, marginTop: 60, padding: '44px 50px', textAlign: 'left', ...panelAlign, maxWidth: 760, ...rise(t, 0.3)}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: th.muted}}>{s.panel}</div>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 150, lineHeight: 1.1, color: th.ink, letterSpacing: -4, display: 'inline-block', position: 'relative'}}>
              {s.prefix}{shown}{s.suffix}
              <div style={{position: 'absolute', left: 0, bottom: 4, height: 7, borderRadius: 4, width: `${prog(t, 1.9, 0.6) * 100}%`, background: B.metal}} />
            </div>
            {s.body && <div style={{fontFamily: serif, fontStyle: 'italic', fontSize: 36, color: th.muted, marginTop: 8}}>{s.body}</div>}
          </div>
        </>
      );
    }
    case 'graph': {
      const pts = s.points.length > 1 ? s.points : [2, 3, 2.6, 4, 4.8, 6.5, 8.2];
      const mn = Math.min(...pts);
      const mx = Math.max(...pts);
      const W2 = 760;
      const H2 = 300;
      const xy = pts.map((p, i) => [40 + (i / (pts.length - 1)) * (W2 - 80), 40 + (1 - (p - mn) / (mx - mn || 1)) * (H2 - 80)]);
      const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
      const k = prog(t, 0.6, 1.6);
      const tip = xy[Math.min(xy.length - 1, Math.floor(k * (xy.length - 1) + 0.0001))];
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.05)}><Headline text={s.headline} size={78} th={th} /></div>
          <div style={{...th.panel, marginTop: 50, padding: '34px 40px', textAlign: 'left', ...panelAlign, width: 840, ...rise(t, 0.3)}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <span style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: th.muted}}>{s.panel}</span>
              <span style={{fontFamily: sans, fontWeight: 700, fontSize: 72, color: th.ink}}>{s.prefix}{Math.round((s.value ?? 0) * k)}{s.suffix}</span>
            </div>
            <svg width={W2} height={H2} style={{display: 'block', marginTop: 10}}>
              <defs><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stopColor={B.accent} /><stop offset="1" stopColor={B.metalLight} /></linearGradient></defs>
              <path d={d} fill="none" stroke="url(#gl)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - k, filter: `drop-shadow(0 0 10px ${hexA(B.metalLight, 0.7)})`}} />
              {k > 0.02 && <circle cx={tip[0]} cy={tip[1]} r={11 + 2 * Math.sin(t * 5)} fill="#fff" stroke={B.metalLight} strokeWidth={4} />}
            </svg>
          </div>
        </>
      );
    }
    case 'ab': {
      const win = s.winner === 'a' ? 0 : 1;
      const pick = prog(t, 2.0, 0.4);
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.05)}><Headline text={s.headline} size={78} th={th} /></div>
          <div style={{display: 'flex', gap: 24, marginTop: 50, textAlign: 'left'}}>
            {[s.left, s.right].map((title, c) => (
              <div key={c} style={{...th.panel, flex: 1, minHeight: 420, padding: 34, transform: `scale(${c === win ? 1 + 0.04 * pick : 1 - 0.03 * pick})`, opacity: c === win ? 1 : 1 - 0.4 * pick, border: c === win && pick > 0.5 ? `3px solid ${B.metalLight}` : (th.panel.border as string), ...rise(t, 0.3 + c * 0.3)}}>
                <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: c === win ? HI : th.muted}}>{title}</div>
                <div style={{fontFamily: sans, fontSize: 32, lineHeight: 1.35, color: th.ink, marginTop: 20}}>{items[c] ?? ''}</div>
                {c === win && pick > 0.5 && <div style={{marginTop: 26, display: 'inline-block', padding: '8px 20px', borderRadius: 30, background: B.accent, color: '#fff', fontFamily: sans, fontWeight: 700, fontSize: 24}}>Winner</div>}
              </div>
            ))}
          </div>
        </>
      );
    }
    case 'doc':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.05)}><Headline text={s.headline} size={78} th={th} /></div>
          <div style={{...th.panel, marginTop: 44, padding: '40px 44px', width: 620, alignSelf: AL === 'center' ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', textAlign: 'left', transform: `rotate(-2deg) translateY(${Math.sin(t * 0.8) * 5}px)`, ...rise(t, 0.3)}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: th.ink, marginBottom: 20}}>{s.panel || s.body}</div>
            {Array.from({length: 9}, (_, i) => <div key={i} style={{height: 12, borderRadius: 6, marginBottom: 16, width: `${[92, 80, 88, 60, 90, 76, 84, 70, 50][i]}%`, background: i % 4 === 0 ? hexA(B.metal, 0.75) : 'rgba(255,255,255,0.22)', transform: `scaleX(${prog(t, 0.5 + i * 0.08, 0.4)})`, transformOrigin: 'left'}} />)}
          </div>
          {s.keyword && (
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 34, padding: '14px 16px 14px 30px', borderRadius: 50, ...th.panel, width: 560, alignSelf: AL === 'center' ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', ...rise(t, 1.2)}}>
              <span style={{flex: 1, fontFamily: sans, fontWeight: 700, fontSize: 34, color: th.ink, textAlign: 'left'}}>{s.keyword.slice(0, Math.floor(prog(t, 1.5, 0.6) * s.keyword.length))}</span>
              <div style={{width: 58, height: 58, borderRadius: 29, background: B.metal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700}}>↑</div>
            </div>
          )}
        </>
      );
    case 'cta': {
      const onPanel = LIGHT ? '#FFFFFF' : th.ink;
      const panelBg = LIGHT ? `linear-gradient(135deg, ${B.accent}, ${B.accentDeep})` : `linear-gradient(135deg, ${hexA(B.accent, 0.4)}, ${hexA(B.accentDeep, 0.3)})`;
      const pop = 0.92 + 0.08 * ease(prog(t, 0.7, 0.5));
      const big: React.CSSProperties = {fontFamily: serif, fontSize: 150, lineHeight: 1.15, letterSpacing: 6, color: LIGHT ? shade(B.metalLight, 0.4) : HI, transform: `scale(${pop})`};
      const head = <><Kicker text={s.kicker} t={t} /><div style={{...rise(t, 0.1), ...narrow, ...panelAlign}}><Headline text={s.headline} size={80} th={th} /></div></>;
      if (s.end === 'collage') {
        const tiles = s.images.length ? s.images : [];
        return (
          <>
            <Kicker text={s.kicker} t={t} />
            <div style={{...rise(t, 0.05)}}><Headline text={s.headline} size={78} th={th} /></div>
            {s.keyword && <div style={{display: 'inline-block', alignSelf: AL === 'center' ? 'center' : 'flex-start', marginTop: 20, padding: '10px 26px', borderRadius: 14, background: B.accent, color: '#fff', fontFamily: sans, fontWeight: 700, fontSize: 34, transform: `rotate(-2deg) scale(${pop})`}}>Comment "{s.keyword.toUpperCase()}"</div>}
            {s.body && <div style={{fontFamily: serif, fontStyle: 'italic', fontSize: 34, color: th.muted, marginTop: 14}}>{s.body}</div>}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 36}}>
              {(tiles.length ? tiles : Array.from({length: 8}, () => '')).slice(0, 12).map((src, i) => (
                <div key={i} style={{aspectRatio: '4 / 5', borderRadius: 14, overflow: 'hidden', ...th.panel, padding: 0, opacity: prog(t, 0.4 + i * 0.07, 0.3), transform: `translateY(${(1 - prog(t, 0.4 + i * 0.07, 0.4)) * 30}px)`}}>
                  {src && <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                </div>
              ))}
            </div>
          </>
        );
      }
      if (s.end === 'follow')
        return (
          <>
            <div style={{width: 260, height: 260, borderRadius: 130, padding: 8, background: `conic-gradient(from ${t * 60}deg, ${B.metalLight}, ${B.accent}, ${B.metal}, ${B.metalLight})`, marginBottom: 40, ...panelAlign, ...rise(t, 0)}}>
              <div style={{width: '100%', height: '100%', borderRadius: '50%', background: LIGHT ? '#FFFFFF' : '#0B0B0D', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                {B.logo ? <Img src={staticFile(B.logo)} style={{width: '70%', height: '70%', objectFit: 'contain'}} /> : <span style={{...metalText, fontSize: 96}}>{B.name.slice(0, 1)}</span>}
              </div>
            </div>
            {head}
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, marginTop: 44, padding: '22px 46px', borderRadius: 60, background: `linear-gradient(135deg, ${B.metalLight}, ${B.metal})`, color: '#14100c', fontFamily: sans, fontWeight: 700, fontSize: 38, alignSelf: AL === 'center' && !withPresenter ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', transform: `scale(${pop})`, ...rise(t, 0.5)}}>+ Follow{s.handle ? ` ${s.handle}` : ''}</div>
            {s.body && <p style={{fontFamily: sans, fontSize: 32, lineHeight: 1.4, color: th.muted, marginTop: 30, ...narrow, ...panelAlign, ...rise(t, 0.8)}}>{s.body}</p>}
          </>
        );
      if (s.end === 'save')
        return (
          <>
            <svg width={170} height={210} viewBox="0 0 34 42" style={{marginBottom: 36, alignSelf: AL === 'center' && !withPresenter ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', transform: `translateY(${(1 - ease(prog(t, 0, 0.6))) * -80}px) scale(${pop})`, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.35))'}}>
              <defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={B.metalLight} /><stop offset="1" stopColor={B.metal} /></linearGradient></defs>
              <path d="M4 2 H30 V40 L17 31 L4 40 Z" fill="url(#bm)" />
            </svg>
            {head}
            {s.body && <p style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: th.muted, marginTop: 30, ...narrow, ...panelAlign, ...rise(t, 0.5)}}>{s.body}</p>}
          </>
        );
      if (s.end === 'link')
        return (
          <>
            {head}
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, marginTop: 50, padding: '28px 50px', borderRadius: 22, background: panelBg, border: `2px solid ${hexA(B.metalLight, 0.6)}`, color: onPanel, fontFamily: sans, fontWeight: 700, fontSize: 42, alignSelf: AL === 'center' && !withPresenter ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', ...rise(t, 0.45)}}>
              {s.handle || 'Link in bio'}
              <span style={{display: 'inline-block', transform: `translateX(${8 * Math.sin(t * 4)}px)`, color: LIGHT ? '#FFFFFF' : HI}}>→</span>
            </div>
            {s.body && <p style={{fontFamily: sans, fontSize: 32, lineHeight: 1.4, color: th.muted, marginTop: 30, ...narrow, ...panelAlign, ...rise(t, 0.7)}}>{s.body}</p>}
          </>
        );
      if (s.end === 'question')
        return (
          <>
            <div style={{fontFamily: serif, fontSize: 260, lineHeight: 0.8, ...metalText, marginBottom: 10, ...rise(t, 0)}}>?</div>
            {head}
            <div style={{position: 'relative', marginTop: 50, padding: '30px 40px', borderRadius: 34, borderBottomLeftRadius: 6, background: LIGHT ? '#FFFFFF' : 'rgba(255,255,255,0.12)', border: `1.5px solid ${hexA(B.metalLight, 0.45)}`, color: th.ink, fontFamily: sans, fontSize: 34, lineHeight: 1.35, maxWidth: 760, textAlign: 'left', alignSelf: AL === 'center' && !withPresenter ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', boxShadow: '0 18px 40px rgba(0,0,0,0.25)', ...rise(t, 0.5)}}>
              {s.body || 'Tell me in the comments.'}
              <span style={{display: 'inline-block', width: 4, height: 34, marginLeft: 6, verticalAlign: 'middle', background: B.accent, opacity: Math.floor(t * 2) % 2 ? 0.2 : 1}} />
            </div>
          </>
        );
      return (
        <>
          {head}
          <div style={{...th.panel, marginTop: 50, padding: 46, borderColor: B.metal, background: panelBg, ...narrow, ...rise(t, 0.4)}}>
            {s.keyword && (
              <>
                <div style={{fontFamily: sans, fontSize: 32, color: onPanel}}>Comment</div>
                <div style={{...big, transformOrigin: AL === 'center' ? 'center' : AL === 'right' ? 'right center' : 'left center'}}>{s.keyword.toUpperCase()}</div>
              </>
            )}
            {s.body && <div style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: onPanel}}>{s.body}</div>}
          </div>
        </>
      );
    }
  }
};

/** looping ambient motion: twinkling sparkles and soft drifting light, so a still moment never looks frozen */
const Ambient: React.FC<{t: number; style: VideoCarouselPlan['style']}> = ({t, style}) => {
  const n = style === 'bold' ? 34 : style === 'clean' ? 12 : 22;
  const color = style === 'clean' ? B.metal : style === 'bold' ? '#FFFFFF' : B.metalLight;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {Array.from({length: n}, (_, i) => {
        const r1 = ((i * 9301 + 49297) % 233280) / 233280;
        const r2 = ((i * 4271 + 17) % 9973) / 9973;
        const x = 40 + r1 * 1000;
        const y = 60 + r2 * 1230 - ((t * (8 + r1 * 14)) % 1350);
        const tw = Math.max(0, Math.sin(t * (1.2 + r2 * 2.2) + i * 1.7));
        const size = 6 + r1 * (style === 'bold' ? 16 : 10);
        return (
          <svg key={i} width={size * 2} height={size * 2} viewBox="-10 -10 20 20" style={{position: 'absolute', left: x, top: ((y % 1350) + 1350) % 1350, opacity: tw * (style === 'clean' ? 0.45 : 0.8), transform: `rotate(${t * 40 + i * 30}deg) scale(${0.6 + tw * 0.6})`}}>
            <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill={color} />
          </svg>
        );
      })}
    </div>
  );
};

const DEFAULT_PRESENTER: Slide['layout'][] = ['cover', 'statement', 'status', 'branches', 'cta'];

export const VideoCarousel: React.FC<{plan: VideoCarouselPlan}> = ({plan}) => {
  loadBrandFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const th = theme(plan.style);
  LIGHT = plan.style === 'clean';
  HI = LIGHT ? shade(B.metal, -0.15) : plan.style === 'bold' ? shade(B.metalLight, 0.6) : B.metalLight;
  metalText = metalTextFor(LIGHT, plan.style === 'bold');
  NOTE_INK = plan.style === 'clean' ? shade(B.metal, -0.2) : plan.style === 'showcase' ? '#F2D24B' : shade(B.metalLight, 0.35);
  let start = 0;
  let idx = plan.slides.length - 1;
  for (let i = 0; i < plan.slides.length; i++) {
    if (t < start + plan.slides[i].seconds) {
      idx = i;
      break;
    }
    start += plan.slides[i].seconds;
  }
  if (idx === plan.slides.length - 1 && t >= start + plan.slides[idx].seconds) start = plan.slides.slice(0, -1).reduce((a, s) => a + s.seconds, 0);
  const s = plan.slides[idx];
  const u = t - start;
  const n = plan.slides.length;
  AL = s.align ?? plan.align;
  SHINE = ((u * 28) % 160) - 30;
  const enterK = ease(prog(u, 0, 0.35));
  const last = idx === n - 1;
  const P = plan.presenter;
  const showP = !!P && (s.presenter ?? DEFAULT_PRESENTER.includes(s.layout));
  const pIn = ease(prog(u, 0.2, 0.6));
  const ph = 760 * (P?.scale ?? 1);
  return (
    <AbsoluteFill style={{background: th.bg, fontFamily: sans, overflow: 'hidden'}}>
      <svg width={1080} height={1350} style={{position: 'absolute', opacity: plan.style === 'clean' ? 0.04 : 0.07}}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      {plan.style === 'glass' && <GlassLight t={t} />}
      <Ambient t={t} style={plan.style} />
      {plan.style === 'luxe' && <div style={{position: 'absolute', left: 40, right: 40, top: 40, bottom: 40, border: `1px solid ${hexA(B.metal, 0.35)}`, borderRadius: 8}} />}
      {/* the presenter: a cutout of the member or their AI avatar, standing in the frame with a soft brand glow */}
      {showP && P && (
        <div style={{position: 'absolute', bottom: 150, [P.side]: -30, width: ph * 0.75, height: ph, opacity: pIn, transform: `translateY(${(1 - pIn) * 40 - 4 * Math.sin(u * 0.7)}px)`}}>
          <div style={{position: 'absolute', left: '10%', right: '10%', top: '20%', bottom: '5%', borderRadius: '50%', background: `radial-gradient(circle, ${hexA(B.accent, 0.35 + 0.15 * Math.sin(u * 1.6))}, transparent 70%)`, filter: 'blur(30px)', transform: `scale(${1 + 0.05 * Math.sin(u * 1.6)})`}} />
          <Img src={staticFile(P.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.55))'}} />
        </div>
      )}
      <div style={{position: 'absolute', top: 58, left: 76, right: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {B.logo ? <Img src={staticFile(B.logo)} style={{height: 52, maxWidth: 220, objectFit: 'contain'}} /> : <span style={{fontFamily: serif, fontSize: 30, color: th.ink}}>{B.name}</span>}
        {plan.series && <span style={{fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: th.muted}}>{plan.series}</span>}
        <span style={{fontSize: 22, letterSpacing: 3, color: HI}}>{String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
      </div>
      <div style={{position: 'absolute', top: 140, left: 76, width: 70 + 40 * Math.sin((Math.min(1, u) * Math.PI) / 2), height: 5, background: B.accent}} />
      <div style={{position: 'absolute', left: 76, right: 76, top: 190, bottom: 170, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: AL, opacity: enterK, transform: `translateX(${(1 - enterK) * 70}px)`}}>
        <SlideBody s={s} t={u} th={th} withPresenter={showP} />
        <Annotations notes={s.notes} t={u} />
      </div>
      <div style={{position: 'absolute', bottom: 64, left: 76, right: 76, borderTop: `1px solid ${th.rule}`, paddingTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 10}}>
          {plan.slides.map((_, i) => <div key={i} style={{width: i === idx ? 34 : 10, height: 10, borderRadius: 5, background: i === idx ? B.metal : th.rule}} />)}
        </div>
        {plan.link && <span style={{fontSize: 22, letterSpacing: 1, color: th.muted}}>{plan.link}</span>}
        <span style={{fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: th.muted, opacity: last ? 0 : 1, transform: `translateX(${4 * Math.sin(u * 3)}px)`}}>Swipe →</span>
      </div>
      {plan.music && <Audio src={staticFile(plan.music.src)} volume={(f) => plan.music!.volume * Math.min(1, f / 15)} />}
    </AbsoluteFill>
  );
};
