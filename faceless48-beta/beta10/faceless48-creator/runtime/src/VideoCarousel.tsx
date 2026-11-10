import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {customerBrand as B} from './brandConfig';

/**
 * Video carousel: a moving Instagram-style carousel (1080 x 1350, 4:5). Each slide is one idea with a ready-made layout,
 * in the member's brand colors, fonts and logo. Post it as a video, or export the slides as stills for a swipe carousel.
 * Wrap a word in *asterisks* in any headline to set it in the accent script.
 */
const slideSchema = z.object({
  layout: z.enum(['cover', 'statement', 'list', 'checklist', 'compare', 'quote', 'steps', 'cta']),
  seconds: z.number().min(2).max(20).default(6),
  kicker: z.string().max(60).default(''),
  headline: z.string().max(140),
  body: z.string().max(220).default(''),
  items: z.array(z.string().max(110)).max(5).default([]),
  /** compare layout: the two column titles */
  left: z.string().max(40).default('Before'),
  right: z.string().max(40).default('After'),
  /** quote layout: who said it */
  by: z.string().max(60).default(''),
  /** cta layout: the comment keyword */
  keyword: z.string().max(20).default(''),
  /** optional photo or cutout PNG in public/, shown framed on cover and statement slides */
  image: z.string().optional(),
});
export const videoCarouselSchema = z.object({
  kind: z.literal('video-carousel'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** small label in the header, for example a series name */
  series: z.string().max(40).default(''),
  theme: z.enum(['dark', 'light']).default('dark'),
  music: z.object({src: z.string(), volume: z.number().min(0).max(1).default(0.25)}).optional(),
  slides: z.array(slideSchema).min(1).max(10),
});
export type VideoCarouselPlan = z.infer<typeof videoCarouselSchema>;
export const carouselFrames = (p: VideoCarouselPlan, fps = 30) => Math.round(p.slides.reduce((a, s) => a + s.seconds, 0) * fps);

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (p: number) => 1 - Math.pow(1 - p, 3);
const prog = (t: number, a: number, d = 0.6) => clamp((t - a) / d);
const rise = (t: number, a: number): React.CSSProperties => ({opacity: prog(t, a, 0.35), transform: `translateY(${(1 - ease(prog(t, a))) * 26}px)`});

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

type Th = {bg: string; ink: string; muted: string; panel: React.CSSProperties; rule: string};
const theme = (mode: 'dark' | 'light'): Th =>
  mode === 'dark'
    ? {
        bg: `radial-gradient(ellipse at 85% 45%, ${hexA(B.accent, 0.28)}, transparent 60%), radial-gradient(ellipse at 10% 0%, ${hexA(B.metal, 0.16)}, transparent 50%), #0B0B0D`,
        ink: '#FFFFFF',
        muted: 'rgba(255,255,255,0.68)',
        rule: 'rgba(255,255,255,0.14)',
        panel: {background: 'linear-gradient(135deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))', border: `1.5px solid ${hexA(B.metalLight, 0.38)}`, borderRadius: 26, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 24px 70px rgba(0,0,0,0.45)'},
      }
    : {
        bg: `radial-gradient(ellipse at 85% 45%, ${hexA(B.accent, 0.12)}, transparent 60%), #F5F1EA`,
        ink: '#17171A',
        muted: 'rgba(23,23,26,0.62)',
        rule: 'rgba(23,23,26,0.14)',
        panel: {background: '#FFFFFF', border: `1.5px solid ${hexA(B.metal, 0.45)}`, borderRadius: 26, boxShadow: '0 20px 50px rgba(30,20,10,0.14)'},
      };

const serif = `"${B.headingFont}", Georgia, serif`;
const sans = `"${B.bodyFont}", "Helvetica Neue", Arial, sans-serif`;

/** headline with *accent* words in the metallic italic serif */
const Headline: React.FC<{text: string; size: number; th: Th}> = ({text, size, th}) => (
  <h1 style={{fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -size * 0.03, margin: 0, color: th.ink}}>
    {text.split(/(\*[^*]+\*)/g).map((part, i) =>
      part.startsWith('*') && part.endsWith('*') ? (
        <span key={i} style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 600, letterSpacing: 0, color: B.metalLight, background: `linear-gradient(135deg, ${B.metalLight}, ${B.metal})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    )}
  </h1>
);
const Kicker: React.FC<{text: string; t: number}> = ({text, t}) =>
  text ? <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: B.metal, marginBottom: 22, ...rise(t, 0)}}>{text}</div> : null;
const Check: React.FC<{t: number; at: number}> = ({t, at}) => (
  <svg width={44} height={44} viewBox="0 0 40 40" style={{flex: 'none'}}>
    <circle cx={20} cy={20} r={18} fill={B.accent} />
    <path d="m11 20 6 6 13-14" pathLength={1} fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" style={{strokeDasharray: 1, strokeDashoffset: 1 - prog(t, at, 0.4)}} />
  </svg>
);
const Num: React.FC<{n: number}> = ({n}) => <span style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 600, fontSize: 52, color: B.metalLight, minWidth: 74}}>{String(n).padStart(2, '0')}</span>;

const Framed: React.FC<{src: string; t: number; style: React.CSSProperties}> = ({src, t, style}) => (
  <div style={{position: 'absolute', overflow: 'hidden', borderRadius: 30, border: `2px solid ${hexA(B.metalLight, 0.6)}`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', ...rise(t, 0.3), ...style}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + 0.03 * Math.sin(t * 0.4)})`}} />
  </div>
);

const Slide: React.FC<{s: z.infer<typeof slideSchema>; t: number; th: Th}> = ({s, t, th}) => {
  const items = s.items;
  switch (s.layout) {
    case 'cover':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.1)}><Headline text={s.headline} size={96} th={th} /></div>
          {s.body && <p style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: th.muted, marginTop: 30, maxWidth: s.image ? 520 : 900, ...rise(t, 0.35)}}>{s.body}</p>}
          {s.image && <Framed src={s.image} t={t} style={{right: -10, bottom: 0, width: 400, height: 520, transform: `rotate(3deg) ${rise(t, 0.3).transform}`}} />}
        </>
      );
    case 'statement':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={rise(t, 0.1)}><Headline text={s.headline} size={80} th={th} /></div>
          {s.body && (
            <div style={{...th.panel, marginTop: 50, padding: '36px 40px', ...rise(t, 0.45)}}>
              <div style={{width: 60, height: 5, background: B.accent, marginBottom: 22, transform: `scaleX(${prog(t, 0.6)})`, transformOrigin: 'left'}} />
              <div style={{fontFamily: sans, fontSize: 38, lineHeight: 1.35, color: th.ink}}>{s.body}</div>
            </div>
          )}
          {s.image && <Framed src={s.image} t={t} style={{right: 0, bottom: 0, width: 300, height: 380}} />}
        </>
      );
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
              <div key={c} style={{...th.panel, flex: 1, padding: 34, ...(c === 1 ? {borderColor: B.accent, background: `linear-gradient(135deg, ${hexA(B.accent, 0.35)}, ${hexA(B.accentDeep, 0.25)})`} : {opacity: 0.85}), ...rise(t, 0.4 + c * 0.5)}}>
                <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: c === 1 ? B.metalLight : th.muted}}>{c === 0 ? s.left : s.right}</div>
                {col.map((x, i) => (
                  <div key={i} style={{fontFamily: sans, fontSize: 32, lineHeight: 1.3, color: th.ink, marginTop: 22, textDecoration: c === 0 && prog(t, 1.4 + i * 0.25) > 0.5 ? `line-through ${hexA(B.accent, 0.9)}` : 'none'}}>{x}</div>
                ))}
              </div>
            ))}
          </div>
        </>
      );
    }
    case 'quote':
      return (
        <>
          <Kicker text={s.kicker} t={t} />
          <div style={{fontFamily: serif, fontSize: 220, lineHeight: 0.6, color: B.metal, opacity: prog(t, 0, 0.4), height: 110}}>“</div>
          <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 500, fontSize: 70, lineHeight: 1.18, color: th.ink, ...rise(t, 0.2)}}>{s.headline.replace(/\*/g, '')}</div>
          {s.by && <div style={{fontFamily: sans, fontWeight: 700, fontSize: 28, letterSpacing: 3, textTransform: 'uppercase', color: B.metalLight, marginTop: 40, ...rise(t, 0.6)}}>{s.by}</div>}
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
          <div style={rise(t, 0.1)}><Headline text={s.headline} size={80} th={th} /></div>
          <div style={{...th.panel, marginTop: 50, padding: 46, borderColor: B.metal, background: `linear-gradient(135deg, ${hexA(B.accent, 0.4)}, ${hexA(B.accentDeep, 0.3)})`, ...rise(t, 0.4)}}>
            {s.keyword && (
              <>
                <div style={{fontFamily: sans, fontSize: 32, color: th.ink}}>Comment</div>
                <div style={{fontFamily: serif, fontSize: 150, lineHeight: 1.15, letterSpacing: 6, color: B.metalLight, transform: `scale(${0.92 + 0.08 * ease(prog(t, 0.7, 0.5))})`, transformOrigin: 'left center'}}>{s.keyword.toUpperCase()}</div>
              </>
            )}
            {s.body && <div style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: th.ink}}>{s.body}</div>}
          </div>
        </>
      );
  }
};

export const VideoCarousel: React.FC<{plan: VideoCarouselPlan}> = ({plan}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const th = theme(plan.theme);
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
  // slide change: the old slide slides out left while the new one slides in (0.35 s)
  const enterK = ease(prog(u, 0, 0.35));
  const last = idx === n - 1;
  return (
    <AbsoluteFill style={{background: th.bg, fontFamily: sans, overflow: 'hidden'}}>
      <svg width={1080} height={1350} style={{position: 'absolute', opacity: plan.theme === 'dark' ? 0.07 : 0.04}}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      {/* header: logo or name, series, counter */}
      <div style={{position: 'absolute', top: 58, left: 76, right: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {B.logo ? <Img src={staticFile(B.logo)} style={{height: 52, maxWidth: 220, objectFit: 'contain'}} /> : <span style={{fontFamily: serif, fontSize: 30, color: th.ink}}>{B.name}</span>}
        {plan.series && <span style={{fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: th.muted}}>{plan.series}</span>}
        <span style={{fontSize: 22, letterSpacing: 3, color: B.metalLight}}>{String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
      </div>
      <div style={{position: 'absolute', top: 140, left: 76, width: 70 + 40 * Math.sin(Math.min(1, u) * Math.PI / 2), height: 5, background: B.accent}} />
      <div style={{position: 'absolute', left: 76, right: 76, top: 190, bottom: 170, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: enterK, transform: `translateX(${(1 - enterK) * 70}px)`}}>
        <Slide s={s} t={u} th={th} />
      </div>
      {/* footer: progress dots and swipe cue */}
      <div style={{position: 'absolute', bottom: 64, left: 76, right: 76, borderTop: `1px solid ${th.rule}`, paddingTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 10}}>
          {plan.slides.map((_, i) => <div key={i} style={{width: i === idx ? 34 : 10, height: 10, borderRadius: 5, background: i === idx ? B.metal : th.rule}} />)}
        </div>
        <span style={{fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: th.muted, opacity: last ? 0 : 1, transform: `translateX(${4 * Math.sin(u * 3)}px)`}}>Swipe →</span>
      </div>
      {plan.music && <Audio src={staticFile(plan.music.src)} volume={plan.music.volume} />}
    </AbsoluteFill>
  );
};
export const carouselSlideStarts = (p: VideoCarouselPlan) => {
  const out: number[] = [];
  let a = 0;
  for (const s of p.slides) {
    out.push(a);
    a += s.seconds;
  }
  return out;
};
export {interpolate};
