import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
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
  layout: z.enum(['cover', 'statement', 'list', 'checklist', 'compare', 'quote', 'steps', 'status', 'branches', 'cta']),
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
  /** show the presenter cutout on this slide (default: on cover, statement, status and branches) */
  presenter: z.boolean().optional(),
});
export const videoCarouselSchema = z.object({
  kind: z.literal('video-carousel'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** look: editorial (glass panels, serif accents), luxe (deeper, metallic rules), clean (light paper), bold (big type, accent fields) */
  style: z.enum(['editorial', 'luxe', 'clean', 'bold']).default('editorial'),
  /** small label in the header, for example a series name */
  series: z.string().max(40).default(''),
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
let LIGHT = false;
const metalTextBase: React.CSSProperties = {fontFamily: serif, fontStyle: 'italic', fontWeight: 600, letterSpacing: 0, background: `linear-gradient(135deg, ${B.metalLight}, ${B.metal} 70%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'};

const metalTextFor = (light: boolean, bold = false): React.CSSProperties =>
  bold ? {...metalTextBase, background: `linear-gradient(135deg, #FFFFFF, ${shade(B.metalLight, 0.45)})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.25))'} : light ? {...metalTextBase, background: `linear-gradient(135deg, ${shade(B.metal, -0.05)}, ${shade(B.metal, -0.4)})`, WebkitBackgroundClip: 'text', backgroundClip: 'text'} : metalTextBase;
let metalText = metalTextBase;
const Headline: React.FC<{text: string; size: number; th: Th; center?: boolean}> = ({text, size, th, center}) => (
  <h1 style={{fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -size * 0.03, margin: 0, color: th.ink, textAlign: center ? 'center' : 'left'}}>
    {text.split(/(\*[^*]+\*)/g).map((part, i) => (part.startsWith('*') && part.endsWith('*') ? <span key={i} style={metalText}>{part.slice(1, -1)}</span> : <React.Fragment key={i}>{part}</React.Fragment>))}
  </h1>
);
const Kicker: React.FC<{text: string; t: number; center?: boolean}> = ({text, t, center}) =>
  text ? <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: HI, marginBottom: 22, textAlign: center ? 'center' : 'left', ...rise(t, 0)}}>{text}</div> : null;
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

const SlideBody: React.FC<{s: Slide; t: number; th: Th; withPresenter: boolean}> = ({s, t, th, withPresenter}) => {
  const items = s.items;
  const narrow: React.CSSProperties = withPresenter ? {maxWidth: 640} : {};
  switch (s.layout) {
    case 'cover':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={{...rise(t, 0.1), ...narrow}}><Headline text={s.headline} size={th.hero} th={th} /></div>
          {s.body && <p style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: th.muted, marginTop: 30, maxWidth: s.image || withPresenter ? 560 : 900, ...rise(t, 0.35)}}>{s.body}</p>}
          <Note text={s.note} t={t} at={1.2} />
          {s.image && <Framed src={s.image} t={t} style={{right: -10, bottom: 0, width: 400, height: 520, transform: 'rotate(3deg)'}} />}
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
          <div style={{position: 'relative', height: 520, marginTop: 40}}>
            <StatusPanel s={s} t={t} th={th} style={{position: 'absolute', left: 0, top: 0, transform: `rotate(-3deg) ${rise(t, 0.3).transform}`, opacity: prog(t, 0.3, 0.35)}} />
            {items.length > 0 && <Paper items={items} t={t} at={2.2} style={{position: 'absolute', left: withPresenter ? 330 : 520, top: 170, transform: `rotate(5deg) translateY(${Math.sin(t * 1.1) * 4}px)`, opacity: prog(t, 1.9, 0.35)}} />}
          </div>
          <Note text={s.note} t={t} at={3.2} />
        </>
      );
    case 'branches': {
      const cards = items.slice(0, 3).map((x) => {
        const [label, ...rest] = x.split(':');
        return rest.length ? {label: label.trim(), text: rest.join(':').trim()} : {label: '', text: x};
      });
      return (
        <>
          <Kicker text={s.kicker} t={t} center={!withPresenter} />
          <div style={{...rise(t, 0.1), ...narrow}}><Headline text={s.headline} size={74} th={th} center={!withPresenter} /></div>
          <div style={{...th.panel, marginTop: 40, padding: '24px 30px', width: withPresenter ? 520 : 600, alignSelf: withPresenter ? 'flex-start' : 'center', ...rise(t, 0.35)}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 20, letterSpacing: 2.5, textTransform: 'uppercase', color: th.muted}}>{s.panel || 'The plan'}</div>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 36, color: th.ink, marginTop: 10}}>{s.root}</div>
          </div>
          <svg width={928} height={70} style={{display: 'block'}}>
            <path d={`M ${withPresenter ? 260 : 464} 0 V 30 H 155 V 70 M ${withPresenter ? 260 : 464} 30 H 773 V 70 M 464 30 V 70`} fill="none" stroke={hexA(B.metalLight, 0.6)} strokeWidth={2.5} pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - prog(t, 0.8, 0.6)}} />
          </svg>
          <div style={{display: 'flex', gap: 22}}>
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
              <div key={i} style={{...th.panel, padding: '26px 32px', display: 'flex', alignItems: 'center', gap: 26, ...rise(t, 0.45 + i * 0.35)}}>
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
          <div style={{display: 'flex', gap: 24, marginTop: 50}}>
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
          <div style={{position: 'relative', marginTop: 50, paddingLeft: 40}}>
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
    case 'cta':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={{...rise(t, 0.1), ...narrow}}><Headline text={s.headline} size={80} th={th} /></div>
          <div style={{...th.panel, marginTop: 50, padding: 46, borderColor: B.metal, background: LIGHT ? `linear-gradient(135deg, ${B.accent}, ${B.accentDeep})` : `linear-gradient(135deg, ${hexA(B.accent, 0.4)}, ${hexA(B.accentDeep, 0.3)})`, ...narrow, ...rise(t, 0.4)}}>
            {s.keyword && (
              <>
                <div style={{fontFamily: sans, fontSize: 32, color: LIGHT ? '#FFFFFF' : th.ink}}>Comment</div>
                <div style={{fontFamily: serif, fontSize: 150, lineHeight: 1.15, letterSpacing: 6, color: LIGHT ? shade(B.metalLight, 0.4) : HI, transform: `scale(${0.92 + 0.08 * ease(prog(t, 0.7, 0.5))})`, transformOrigin: 'left center'}}>{s.keyword.toUpperCase()}</div>
              </>
            )}
            {s.body && <div style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: LIGHT ? '#FFFFFF' : th.ink}}>{s.body}</div>}
          </div>
        </>
      );
  }
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
      {plan.style === 'luxe' && <div style={{position: 'absolute', left: 40, right: 40, top: 40, bottom: 40, border: `1px solid ${hexA(B.metal, 0.35)}`, borderRadius: 8}} />}
      {/* the presenter: a cutout of the member or their AI avatar, standing in the frame with a soft brand glow */}
      {showP && P && (
        <div style={{position: 'absolute', bottom: 150, [P.side]: -30, width: ph * 0.75, height: ph, opacity: pIn, transform: `translateY(${(1 - pIn) * 40 - 4 * Math.sin(u * 0.7)}px)`}}>
          <div style={{position: 'absolute', left: '10%', right: '10%', top: '20%', bottom: '5%', borderRadius: '50%', background: `radial-gradient(circle, ${hexA(B.accent, 0.45)}, transparent 70%)`, filter: 'blur(30px)'}} />
          <Img src={staticFile(P.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.55))'}} />
        </div>
      )}
      <div style={{position: 'absolute', top: 58, left: 76, right: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {B.logo ? <Img src={staticFile(B.logo)} style={{height: 52, maxWidth: 220, objectFit: 'contain'}} /> : <span style={{fontFamily: serif, fontSize: 30, color: th.ink}}>{B.name}</span>}
        {plan.series && <span style={{fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: th.muted}}>{plan.series}</span>}
        <span style={{fontSize: 22, letterSpacing: 3, color: HI}}>{String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
      </div>
      <div style={{position: 'absolute', top: 140, left: 76, width: 70 + 40 * Math.sin((Math.min(1, u) * Math.PI) / 2), height: 5, background: B.accent}} />
      <div style={{position: 'absolute', left: 76, right: 76, top: 190, bottom: 170, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: enterK, transform: `translateX(${(1 - enterK) * 70}px)`}}>
        <SlideBody s={s} t={u} th={th} withPresenter={showP} />
      </div>
      <div style={{position: 'absolute', bottom: 64, left: 76, right: 76, borderTop: `1px solid ${th.rule}`, paddingTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 10}}>
          {plan.slides.map((_, i) => <div key={i} style={{width: i === idx ? 34 : 10, height: 10, borderRadius: 5, background: i === idx ? B.metal : th.rule}} />)}
        </div>
        {plan.link && <span style={{fontSize: 22, letterSpacing: 1, color: th.muted}}>{plan.link}</span>}
        <span style={{fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: th.muted, opacity: last ? 0 : 1, transform: `translateX(${4 * Math.sin(u * 3)}px)`}}>Swipe →</span>
      </div>
      {plan.music && <Audio src={staticFile(plan.music.src)} volume={plan.music.volume} />}
    </AbsoluteFill>
  );
};
