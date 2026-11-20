import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {customerBrand as B} from './brandConfig';
import {handFamily, loadBrandFonts} from './fonts';
import {defaultHeadlineWidth, headlineParts, headlineWidthSchema, isIndividualLayer, layerOrderSchema, layerSelector, slideLayerOrder} from './carousel-layers';

/**
 * Video carousel: an animated Instagram-style carousel (1080 x 1350, 4:5). One idea per slide, ready-made layouts,
 * always in the member's brand (colors, fonts, metallic finish and logo come from brand.json automatically).
 * Optional presenter: a cutout PNG of the member or their AI avatar (make one with `npm run cutout -- <photo>`), or nobody.
 * Wrap a word in *asterisks* in any headline to set it in the accent script.
 */
const slideSchema = z.object({
  layout: z.enum(['cover', 'statement', 'list', 'checklist', 'compare', 'quote', 'steps', 'status', 'branches', 'media', 'toggles', 'proof', 'graph', 'ab', 'doc', 'cta']),
  surface: z.enum(['dark', 'marble']).default('dark'),
  seconds: z.number().min(2).max(20).default(6),
  kicker: z.string().max(60).default(''),
  headline: z.string().max(140),
  headlineWidth: headlineWidthSchema.optional(),
  layerOrder: layerOrderSchema.optional(),
  body: z.string().max(220).default(''),
  items: z.array(z.string().max(110)).max(6).default([]),
  /** compare: the two column titles */
  left: z.string().max(40).default('Before'),
  right: z.string().max(40).default('After'),
  crossOutLeft: z.boolean().default(true),
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
  notes: z.array(z.object({text: z.string().max(60), x: z.number().min(0).max(100), y: z.number().min(0).max(100), to: z.tuple([z.number(), z.number()]).optional(), /** which side of the note the arrow leaves from (auto picks the side facing the target) */ from: z.enum(['auto', 'left', 'right', 'top', 'bottom']).default('auto'), /** curve: -1 bends one way, 1 the other, 0 straight; auto bends away from the note */ bend: z.number().min(-1).max(1).optional()})).max(4).default([]),
  /** cta follow/link: the handle or link to show, for example @yourbrand */
  handle: z.string().max(40).default(''),
  /** show the presenter cutout on this slide (default: on cover, statement, status and branches) */
  presenter: z.boolean().optional(),
  /** Scale override for a sprite already enabled on this slide. */
  spriteScale: z.number().min(0.5).max(1.5).optional(),
  spriteSide: z.enum(['left', 'right']).optional(),
  spriteFlip: z.boolean().optional(),
  /** A manual edit of the sprite layer, independent of the graphic group. */
  spriteEdit: z.object({
    src: z.string().regex(/^portraits\/sprites\/[a-z0-9-]+\.png$/).nullable(),
    x: z.number().min(-1080).max(1080),
    y: z.number().min(-1350).max(1350),
    scale: z.number().min(0.2).max(1.5),
    rotation: z.number().min(-180).max(180).optional(),
    flip: z.boolean(),
  }).optional(),
  /** Transparent artwork. Reusing the same asset on adjacent slides passes it between them. */
  icon: z.object({
    src: z.string(),
    align: z.enum(['left', 'center', 'right']).default('center'),
    size: z.number().min(60).max(155).default(112),
  }).optional(),
  /** Manual adjustment of the artwork and copy as a group in composition pixels. */
  graphicPlacement: z.object({
    x: z.number().min(-460).max(460).default(0),
    y: z.number().min(-520).max(520).default(0),
    scale: z.number().min(0.55).max(1.45).default(1),
    rotation: z.number().min(-180).max(180).optional(),
  }).optional(),
  /** Move the headline while preserving the grid and kicker position. */
  headlineOffset: z.object({
    x: z.number().min(-520).max(520),
    y: z.number().min(-500).max(500),
    rotation: z.number().min(-180).max(180).optional(),
  }).optional(),
  elementOffsets: z.record(z.string().regex(/^[a-z][a-z0-9-]{0,50}$/), z.object({
    x: z.number().min(-1080).max(1080),
    y: z.number().min(-1350).max(1350),
    rotation: z.number().min(-180).max(180).optional(),
  })).refine((offsets) => Object.keys(offsets).length <= 60, 'Too many individual items.').optional(),
  visual: z.enum(['team-calendar', 'purchase-card', 'audit-card', 'before-workflow', 'after-workflow', 'review-workflow']).optional(),
  /** A small use of the carousel's sprite. Position and width are in composition pixels. */
  spriteAccent: z.object({
    left: z.number().min(0).max(1080),
    top: z.number().min(0).max(1350),
    width: z.number().min(48).max(340),
  }).refine(({left, top, width}) => left + width <= 1080 && top + width * 1.5 <= 1350, 'Sprite accent must fit within the carousel frame.').optional(),
});
export const videoCarouselSchema = z.object({
  kind: z.literal('video-carousel'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** look: editorial (glass panels, serif accents), luxe (deeper, metallic rules), clean (light paper), bold (big type, accent fields) */
  style: z.enum(['editorial', 'luxe', 'clean', 'bold', 'glass', 'showcase']).default('editorial'),
  /** small label in the header, for example a series name */
  series: z.string().max(40).default(''),
  composedOpening: z.boolean().default(false),
  fullPortraitLayout: z.boolean().optional(),
  starterPortrait: z.boolean().optional(),
  /** Use the C3 dotted background and white/metallic typography with any starter. */
  c3Dotted: z.boolean().optional(),
  /** Use the revised C3 content grid and motion treatments. */
  c3ContentGrid: z.boolean().optional(),
  spaciousTech: z.boolean().optional(),
  /** text alignment for every slide: center (default), left or right */
  align: z.enum(['left', 'center', 'right']).default('center'),
  /** footer link or handle, for example bio.yourbrand.com */
  link: z.string().max(40).default(''),
  /** cutout PNG of the member or their AI avatar (transparent background), or leave out for no presenter */
  presenter: z.object({
    src: z.string(),
    side: z.enum(['right', 'left']).default('right'),
    scale: z.number().min(0.5).max(1.5).default(1),
    flip: z.boolean().optional(),
    anchor: z.literal('bottom').optional(),
    sprite: z.boolean().optional(),
  }).optional(),
  music: z.object({src: z.string(), volume: z.number().min(0).max(1).default(0.25)}).optional(),
  /** the member's own background picture (a texture such as velvet, marble or paper) under every slide, path under public/.
   *  It drifts slowly so the loop never looks frozen. `dim` darkens it so text stays readable (0 none, 1 black). */
  background: z.object({src: z.string(), dim: z.number().min(0).max(1).default(0.35), drift: z.boolean().default(true)}).optional(),
  slides: z.array(slideSchema).min(1).max(10),
});
export type VideoCarouselPlan = z.infer<typeof videoCarouselSchema>;
type Slide = z.infer<typeof slideSchema>;
export const carouselFrames = (p: VideoCarouselPlan, fps = 30) => Math.round(p.slides.reduce((a, s) => a + s.seconds, 0) * fps);

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (p: number) => 1 - Math.pow(1 - p, 3);
const prog = (t: number, a: number, d = 0.6) => clamp((t - a) / d);
const rise = (t: number, a: number): React.CSSProperties => ({opacity: prog(t, a, 0.35), transform: `translateY(${(1 - ease(prog(t, a))) * 26}px)`});
const editable = (id: string, label: string) => ({
  'data-carousel-item': id,
  'data-carousel-item-label': label,
});
const rotationStyle = (rotation?: number) => rotation ? ` rotate(${rotation}deg)` : '';
const groupTransform = (placement: Slide['graphicPlacement']) => placement
  ? `translate(${placement.x}px, ${placement.y}px)${rotationStyle(placement.rotation)} scale(${placement.scale})`
  : undefined;
const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

type Th = {bg: string; ink: string; muted: string; rule: string; panel: React.CSSProperties; hero: number};
const CHARCOAL = '#3A3F42';
const theme = (style: VideoCarouselPlan['style'], composed: boolean, marble: boolean): Th => {
  const glass: React.CSSProperties = {background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.07))', border: `1.5px solid ${hexA(B.metalLight, 0.36)}`, borderRadius: 26, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 24px 70px rgba(0,0,0,0.45)'};
  if (marble)
    return {bg: '#FFFFFF', ink: '#000000', muted: CHARCOAL, rule: hexA(CHARCOAL, 0.3), panel: {background: hexA('#FFFFFF', 0.88), border: `1.5px solid ${hexA(CHARCOAL, 0.28)}`, borderRadius: 26, boxShadow: '0 16px 48px rgba(0,0,0,0.12)'}, hero: 90};
  if (style === 'luxe' && composed)
    return {bg: `radial-gradient(ellipse at 74% 64%, ${hexA(CHARCOAL, 0.64)}, transparent 75%), #000000`, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.78)', rule: hexA(B.metal, 0.5), panel: glass, hero: 90};
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
const shine = (base: React.CSSProperties): React.CSSProperties => {
  const {background, ...textStyle} = base;
  return {
    ...textStyle,
    backgroundImage: `linear-gradient(110deg, transparent ${SHINE - 12}%, rgba(255,255,255,0.65) ${SHINE}%, transparent ${SHINE + 12}%), ${String(background)}`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
  };
};
const Headline: React.FC<{text: string; size: number; th: Th; center?: boolean; separateParts?: boolean}> = ({text, size, th, center, separateParts}) => (
  <h1 style={{fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -size * 0.03, margin: 0, color: th.ink, textAlign: center ? 'center' : 'inherit', whiteSpace: 'pre-line', overflowWrap: separateParts ? 'anywhere' : undefined}}>
    {separateParts ? headlineParts(text).map(({text, accent}, i) => text === '\n' ? <br key={i} /> : (
      <span key={i} data-carousel-headline-part={i} style={accent ? shine(metalText) : undefined}>{text}</span>
    )) : text.split(/(\*[^*]+\*)/g).map((part, i) => (part.startsWith('*') && part.endsWith('*') ? <span key={i} style={shine(metalText)}>{part.slice(1, -1)}</span> : <React.Fragment key={i}>{part}</React.Fragment>))}
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
  text ? <div {...editable('handwritten-note', 'Handwritten note')} style={{fontFamily: handFamily, fontWeight: 700, fontSize: 56, color: HI, clipPath: `inset(0 ${100 - prog(t, at, 0.9) * 100}% 0 0)`, marginTop: 30}}>{text}</div> : null;
const Framed: React.FC<{src: string; t: number; style: React.CSSProperties}> = ({src, t, style}) => (
  <div style={{position: 'absolute', overflow: 'hidden', borderRadius: 30, border: `2px solid ${hexA(B.metalLight, 0.6)}`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', opacity: prog(t, 0.3, 0.4), ...style}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + 0.03 * Math.sin(t * 0.4)})`}} />
  </div>
);

const CoverComparison: React.FC<{items: string[]; source: string; t: number; th: Th; contentGrid?: boolean}> = ({items, source, t, th, contentGrid}) => (
  <div {...editable('cover-statistics', 'Statistics card')} style={{...th.panel, marginTop: contentGrid ? 0 : 31, padding: '23px 26px 22px', background: 'linear-gradient(135deg, #242426, #101012 75%)', borderColor: hexA(B.metalLight, 0.55), textAlign: 'left'}}>
    <div style={{fontSize: 19, fontWeight: 700, lineHeight: 1.25, color: B.metalLight}}>{source}</div>
    {items.map((item, index) => {
      const match = item.match(/^(\d{1,3})%\s+(.+)$/);
      const color = index === 0 ? B.metalLight : B.accent;
      return (
        <div key={item} style={{marginTop: 20}}>
          <div style={{display: 'flex', gap: 15, alignItems: 'center', lineHeight: 1.15, fontWeight: 700, fontSize: 24, color: th.ink}}>
            {match && <span style={{fontSize: 44, letterSpacing: -2, color: B.metalLight}}>{match[1]}%</span>}
            <span>{match ? match[2] : item}</span>
          </div>
          {match && (
            <div style={{height: 5, marginTop: 11, borderRadius: 3, background: CHARCOAL}}>
              <div style={{position: 'relative', width: `${Math.min(100, Number(match[1]))}%`, height: '100%', borderRadius: 3, background: color, overflow: 'hidden'}}>
                <div style={{position: 'absolute', inset: '0 auto 0 0', width: 32, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)', left: `${prog(t, 0.35 + index * 0.5, 0.95) * 100}%`, opacity: Math.sin(prog(t, 0.35 + index * 0.5, 0.95) * Math.PI)}} />
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

const TechCoverArtwork: React.FC<{t: number; placement?: Slide['graphicPlacement']}> = ({t, placement}) => {
  const trace = 'M 76 841 H 151 L 204 787 H 387 L 466 708 H 548 L 608 648';
  return (
    <svg data-carousel-group-member width={1080} height={1350} style={{position: 'absolute', pointerEvents: 'none', transform: groupTransform(placement), transformOrigin: '50% 58%'}}>
      <circle cx={271} cy={702} r={233} fill={hexA(CHARCOAL, 0.25)} stroke={hexA(B.metalLight, 0.28)} strokeWidth={2} />
      <circle cx={271} cy={702} r={258} fill="none" stroke={hexA(B.metalLight, 0.2)} strokeDasharray="2 12" strokeWidth={2} />
      <path d="M 55 768 A 227 227 0 0 1 240 477" fill="none" stroke={B.accent} strokeWidth={3} />
      <g {...editable('cover-connector', 'Cover connector')} style={{pointerEvents: 'stroke'}}>
        <path d={trace} fill="none" stroke={hexA(B.metalLight, 0.34)} strokeWidth={2} />
        <path d={trace} fill="none" stroke={B.metalLight} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, 0.45, 1.2)} />
        <circle cx={608} cy={648} r={5} fill={B.metalLight} opacity={0.6 + 0.4 * prog(t, 1.55, 0.25)} />
      </g>
    </svg>
  );
};

// ---- props: the animated status panel and the paper checklist (the AI review / old checklist look)
const StatusPanel: React.FC<{s: Slide; t: number; th: Th; style?: React.CSSProperties}> = ({s, t, th, style}) => {
  const doneK = prog(t, 1.6, 0.3);
  const bar = Math.min(1, t / 1.6);
  return (
    <div {...editable('status-card', 'Status card')} style={{...th.panel, width: 560, padding: '30px 34px', ...style}}>
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
const Paper: React.FC<{items: string[]; t: number; at: number; spacious?: boolean; style?: React.CSSProperties}> = ({items, t, at, spacious, style}) => (
  <div {...editable('checklist-card', 'Checklist')} style={{width: 300, padding: '26px 28px', background: '#FAFAF8', borderRadius: 12, color: '#16181D', boxShadow: '0 28px 65px rgba(0,0,0,0.5)', ...style}}>
    <div style={{fontFamily: sans, fontSize: 18, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase'}}>Checklist</div>
    {items.map((x, n) => (
      <div key={n} {...editable(`checklist-row-${n+1}`, `Checklist item ${n+1}`)} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: spacious ? 24 : 18}}>
        <svg width={26} height={26} viewBox="0 0 25 25" style={{flex: 'none'}}>
          <rect x={2} y={2} width={21} height={21} rx={4} fill="none" stroke="#A9ADB5" strokeWidth={1.5} />
          <path d="m6 12 5 5 9-11" fill="none" stroke={B.accent} strokeWidth={2.6} pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - prog(t, at + n * 0.45, 0.3)}} />
        </svg>
        <span style={{fontFamily: sans, fontSize: spacious ? 27 : 21, lineHeight: 1.25}}>{x}</span>
      </div>
    ))}
  </div>
);

// Give the thin connector a larger grab area without changing its appearance.
const ChecklistArrow: React.FC<{
  from: string;
  curve: string;
  tip: string;
  color: string;
  draw: number;
  tipOpacity: number;
}> = ({from, curve, tip, color, draw, tipOpacity}) => (
  <g {...editable('checklist-arrow', `${from || 'Status card'} → Checklist arrow`)}>
    {draw > 0 && (
      <path d={curve} fill="none" stroke="transparent" strokeWidth={32} strokeLinecap="round"
        pointerEvents="stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    )}
    <path d={curve} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
      pointerEvents="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    {tipOpacity > 0 && (
      <path d={tip} fill="none" stroke="transparent" strokeWidth={32} strokeLinecap="round" pointerEvents="stroke" />
    )}
    <path d={tip} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
      strokeLinejoin="round" pointerEvents="none" opacity={tipOpacity} />
  </g>
);

const TechStatus: React.FC<{s: Slide; t: number; th: Th; contentGrid?: boolean}> = ({s, t, th, contentGrid}) => (
  <>
    <div style={{position: 'relative', height: contentGrid ? 510 : 620, marginTop: contentGrid ? 0 : 40, width: 928, alignSelf: 'center', textAlign: 'left'}}>
      <StatusPanel s={s} t={t} th={th} style={{position: 'absolute', left: 32, top: contentGrid ? 12 : 81, transform: `rotate(-2deg) ${rise(t, 0.3).transform}`, opacity: prog(t, 0.3, 0.35)}} />
      <Paper items={s.items} t={t} at={2.85} spacious style={{position: 'absolute', width: 343, left: 529, top: contentGrid ? 244 : 313, transform: 'rotate(3deg)', opacity: prog(t, 2.02, 0.35)}} />
      <svg width={928} height={620} style={{position: 'absolute', inset: 0, pointerEvents: 'none', transform: contentGrid ? 'translateY(-69px)' : undefined}}>
        <ChecklistArrow
          from={s.panel} curve="M 374 257 C 471 255, 476 310, 500 351 Q 521 385, 543 395"
          tip="M 521 394 L 543 395 L 536 374" color={B.accent} draw={prog(t, 1.75, 0.75)} tipOpacity={prog(t, 2.45, 0.2)}
        />
      </svg>
    </div>
    <Note text={s.note} t={t} at={3.65} />
  </>
);

const TechPortraitCallout: React.FC<{s: Slide; t: number; th: Th; contentGrid?: boolean}> = ({s, t, th, contentGrid}) => (
  <>
    <div {...editable('call-to-action', 'Call to action')} style={{...th.panel, ...(contentGrid ? {position: 'relative', marginLeft: 20} : {position: 'absolute', top: 173, left: 52, right: 0}), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15, padding: '25px 29px', background: '#171719', borderColor: hexA(B.metalLight, 0.72), ...rise(t, 0.5)}}>
      <span style={{position: 'absolute', bottom: -11, left: '24%', width: 19, height: 19, background: '#171719', borderRight: `1.5px solid ${hexA(B.metalLight, 0.72)}`, borderBottom: `1.5px solid ${hexA(B.metalLight, 0.72)}`, transform: 'rotate(45deg)'}} />
      <span style={{color: th.ink, fontSize: 32, lineHeight: 1.15, fontWeight: 700}}>
        {s.handle || 'Link in bio'}
        {s.keyword && <span style={{display: 'block', marginTop: 5, fontSize: 42, color: B.metalLight, letterSpacing: 0.5}}>{s.keyword}</span>}
      </span>
      <span {...editable('cta-arrow', 'Call to action arrow')} style={{flex: 'none', display: 'grid', placeItems: 'center', width: 53, height: 53, borderRadius: '50%', background: B.accent, color: '#fff', fontSize: 29, transform: `translateX(${3 * Math.sin(t * 4)}px)`}}>→</span>
    </div>
    {s.body && <p {...editable('closing-copy', 'Closing text')} style={{...(contentGrid ? {margin: '30px 10px 0 20px'} : {position: 'absolute', top: 557, right: 0, width: 435, margin: 0}), fontSize: 30, lineHeight: 1.35, color: th.ink, textAlign: contentGrid ? 'left' : 'right', ...rise(t, 0.9)}}>{s.body}</p>}
  </>
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
          <div {...editable(`annotation-note-${i + 1}`, `Annotation note ${i + 1}`)} style={{position: 'absolute', pointerEvents: 'auto', left: x, top: y, width: 300, fontFamily: handFamily, fontWeight: 700, fontSize: 40, lineHeight: 1.05, color: NOTE_INK, transform: `rotate(-4deg)`, clipPath: `inset(0 ${100 - prog(t, at, 0.7) * 100}% 0 0)`, textShadow: '0 2px 8px rgba(0,0,0,0.35)'}}>{n.text}</div>
          {n.to && (() => {
            const tx = (n.to[0] / 100) * W;
            const ty = (n.to[1] / 100) * H;
            // the note's own box (rotation ignored), so the arrow starts just outside it and never runs through the words
            const words = n.text.split(' ');
            let lines = 1;
            let cur = 0;
            let widest = 0;
            for (const w of words) {
              const ww = w.length * 18 + 10;
              if (cur + ww > 300 && cur > 0) { lines++; widest = Math.max(widest, cur); cur = ww; } else cur += ww;
            }
            widest = Math.max(widest, cur);
            const bw = Math.min(300, widest);
            const bh = lines * 42 + 6;
            const cx = x + bw / 2;
            const cy = y + bh / 2;
            const gap = 16;
            const side = n.from !== 'auto' ? n.from : Math.abs(tx - cx) / bw > Math.abs(ty - cy) / bh ? (tx > cx ? 'right' : 'left') : ty > cy ? 'bottom' : 'top';
            const sx = side === 'left' ? x - gap : side === 'right' ? x + bw + gap : Math.max(x + 20, Math.min(x + bw - 20, tx));
            const sy = side === 'top' ? y - gap : side === 'bottom' ? y + bh + gap : cy;
            // bend away from the note: push the control point to the side of the line that is farther from the box center
            const nx = -(ty - sy);
            const ny = tx - sx;
            const away = (sx + tx) / 2 + nx * 0.1 - cx;
            const away2 = (sy + ty) / 2 + ny * 0.1 - cy;
            const autoSign = away * nx + away2 * ny >= 0 ? 1 : -1;
            const b = (n.bend ?? autoSign * 0.6) * 0.42;
            const mx = (sx + tx) / 2 + nx * b;
            const my = (sy + ty) / 2 + ny * b;
            const ang = Math.atan2(ty - my, tx - mx);
            const k = prog(t, at + 0.6, 0.5);
            return (
              <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <g {...editable(`annotation-arrow-${i + 1}`, `Annotation arrow ${i + 1}`)} style={{pointerEvents: 'stroke'}}>
                  <path d={`M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`} fill="none" stroke={NOTE_INK} strokeWidth={4} strokeLinecap="round" pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - k}} />
                  <path d={`M ${tx - 22 * Math.cos(ang - 0.5)} ${ty - 22 * Math.sin(ang - 0.5)} L ${tx} ${ty} L ${tx - 22 * Math.cos(ang + 0.5)} ${ty - 22 * Math.sin(ang + 0.5)}`} fill="none" stroke={NOTE_INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={k > 0.95 ? 1 : 0} />
                </g>
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
const GlassLight: React.FC<{t: number; restrained?: boolean}> = ({t, restrained}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    {[{c: B.metal, x: 760, y: 980, r: 420, s: 0.35}, {c: B.accent, x: 120, y: 260, r: 520, s: 0.27}, {c: B.metalLight, x: 980, y: 260, r: 260, s: 0.5}].map((b, i) => (
      <div key={i} style={{position: 'absolute', left: b.x - b.r + 70 * Math.sin(t * b.s + i), top: b.y - b.r + 50 * Math.cos(t * b.s * 0.8 + i * 2), width: b.r * 2, height: b.r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${hexA(restrained ? CHARCOAL : b.c, restrained ? 0.21 : 0.55)}, transparent 65%)`, filter: 'blur(40px)'}} />
    ))}
  </div>
);

const Media: React.FC<{src: string; t: number; style: React.CSSProperties}> = ({src, t, style}) => (
  <div style={{position: 'absolute', overflow: 'hidden', borderRadius: 28, border: `2px solid ${hexA(B.metalLight, 0.45)}`, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', opacity: prog(t, 0.2, 0.4), ...style}}>
    {/\.(mp4|mov|webm)$/i.test(src) ? <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.03 + 0.03 * Math.sin(t * 0.5)})`}} />}
  </div>
);

const CoverFan: React.FC<{images: string[]; t: number; compact?: boolean; complete?: boolean; fitted?: boolean}> = ({images, t, compact, complete, fitted}) => (
  <div {...editable('cover-art', 'Artwork')} style={{position: 'relative', height: fitted ? 259 : compact ? 320 : 470, marginTop: fitted ? 15 : 30}}>
    {images.slice(0, 3).map((src, i, tiles) => {
      const offset = i - (tiles.length - 1) / 2;
      const spread = complete ? 0.96 + 0.04 * Math.cos(t * 1.4 + i * 0.15) : ease(prog(t, 0.4 + i * 0.15, 0.6));
      return (
        <div key={i} style={{position: 'absolute', left: fitted ? `calc(50% - 85px + ${offset * 108 * spread}px)` : compact ? 144 + offset * 139 * spread : 314 + offset * 230 * spread, top: (fitted ? 12 : 30) + Math.abs(offset) * 22, width: fitted ? 170 : compact ? 188 : 300, height: fitted ? 212 : compact ? 235 : 400, borderRadius: 22, overflow: 'hidden', border: `2px solid ${hexA(B.metalLight, 0.5)}`, boxShadow: '0 30px 60px rgba(0,0,0,0.55)', transform: `rotate(${offset * 9 * spread}deg) translateY(${Math.sin(t * 0.9 + i) * 5}px)`, opacity: complete ? 1 : spread, zIndex: 3 - Math.abs(offset)}}>
          {/\.(mp4|mov|webm)$/i.test(src) ? <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
        </div>
      );
    })}
  </div>
);

const crimsonGlass: React.CSSProperties = {
  background: 'linear-gradient(152deg, rgba(255,255,255,0.20), rgba(255,255,255,0.075) 37%, rgba(255,255,255,0.13))',
  border: '1.5px solid rgba(255,255,255,0.28)',
  borderRadius: 28,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 22px 60px rgba(0,0,0,0.42)',
};

const CarouselIcon: React.FC<{
  icon: NonNullable<Slide['icon']>;
  t: number;
  seconds: number;
  completeCover: boolean;
  arriving: boolean;
  departing: boolean;
}> = ({icon, t, seconds, completeCover, arriving, departing}) => {
  const enter = completeCover ? 1 : ease(prog(t, 0.04, arriving ? 0.65 : 0.45));
  const exit = departing ? Math.pow(prog(t, seconds - 0.48, 0.48), 2) : 0;
  const x = arriving ? -1080 * (1 - enter) : 0;
  const y = arriving ? 22 * (1 - enter) : 16 * (1 - enter);
  const scale = 0.86 + 0.14 * enter - 0.12 * exit;
  const align = icon.align === 'left' ? 'flex-start' : icon.align === 'right' ? 'flex-end' : 'center';
  return (
    <div style={{display: 'flex', justifyContent: align, height: icon.size, flex: 'none', marginBottom: 18}}>
      <Img
        data-carousel-icon
        {...editable('icon', 'C3 icon')}
        src={staticFile(icon.src)}
        alt=""
        style={{
          width: icon.size * 1.28,
          height: '100%',
          objectFit: 'contain',
          opacity: arriving || completeCover ? 1 : enter,
          transform: `translate(${x + 1080 * exit}px, ${y - 22 * exit}px) rotate(${-10 * (1 - enter) + 14 * exit}deg) scale(${scale})`,
          filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.38))',
        }}
      />
    </div>
  );
};

const GlassSheen: React.FC<{t: number; at: number}> = ({t, at}) => {
  const k = prog(t, at, 1.15);
  return <div style={{position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', background: `linear-gradient(116deg, transparent ${k * 150 - 40}%, rgba(255,255,255,0.17) ${k * 150 - 18}%, transparent ${k * 150 + 7}%)`, opacity: Math.sin(Math.PI * k)}} />;
};

const TeamCalendar: React.FC<{t: number; cover?: boolean}> = ({t, cover}) => (
  <div {...editable('calendar', 'Calendar')} style={{...crimsonGlass, position: 'relative', boxSizing: 'border-box', width: '100%', padding: cover ? 28 : 42, color: '#fff', textAlign: 'left'}}>
    <GlassSheen t={t} at={cover ? 0.65 : 1.2} />
    <div style={{fontWeight: 700, fontSize: cover ? 20 : 24, letterSpacing: 2.6, color: B.metalLight, textTransform: 'uppercase'}}>Team calendar</div>
    <div style={{fontSize: cover ? 33 : 42, lineHeight: 1.15, fontWeight: 700, margin: '11px 0 30px'}}>December availability</div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: cover ? 6 : 9, textAlign: 'center'}}>
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} style={{fontSize: cover ? 17 : 22, color: 'rgba(255,255,255,0.70)'}}>{d}</div>)}
      {Array.from({length: 11}, (_, i) => 21 + i).map((day, i) => {
        const marked = [22, 24, 28, 30].includes(day);
        const at = 0.45 + i * 0.11;
        const active = cover ? 1 : prog(t, at, 0.35);
        return <div key={day} style={{height: cover ? 44 : 58, display: 'grid', placeItems: 'center', borderRadius: 8, fontSize: cover ? 18 : 25, fontWeight: 700, color: '#fff', background: marked ? hexA(B.accent, active * (cover ? 0.7 + 0.22 * Math.pow(Math.sin(t * 1.4 + i), 6) : 0.93)) : 'rgba(255,255,255,0.08)', border: `1.5px solid ${marked && active > 0.5 ? B.accent : 'rgba(255,255,255,0.14)'}`}}>{day}</div>;
      })}
    </div>
    <div style={{display: 'grid', gap: 11, marginTop: 26, fontSize: cover ? 21 : 27, color: '#fff'}}>
      {['Time off confirmed', 'Backup confirmed'].map((x, i) => (
        <div key={x} style={{display: 'flex', alignItems: 'center', gap: 11, ...(cover ? {} : rise(t, 1.7 + i * 0.5))}}>
          <span style={{display: 'inline-block', width: 11, height: 11, borderRadius: '50%', background: i === 0 ? B.accent : '#fff'}} />{x}
        </div>
      ))}
    </div>
  </div>
);

const workflowCards = {
  'before-workflow': {title: 'Before the pilot', steps: [['Read the incoming request', 'Find the right policy.'], ['Draft each reply from scratch', 'Switch between reference documents.'], ['Ask whoever is available', 'Review ownership is unclear.']]},
  'after-workflow': {title: 'One redesigned task', steps: [['Start with a safe example', 'Keep private details out of the prompt.'], ['Use the approved tool to draft', 'Check against the support policy.'], ['Name the reviewer', 'The support lead approves the reply.']]},
  'review-workflow': {title: 'The 30-day check-in', steps: [['Time the task again', 'Compare against the original workflow.'], ['Review a sample of replies', 'Look for errors and extra rework.'], ['Decide what to do next', 'Keep it, adjust it, or stop the pilot.']]},
};

const WorkflowLayers: React.FC<{variant: keyof typeof workflowCards; t: number; note: string}> = ({variant, t, note}) => {
  const {title, steps} = workflowCards[variant];
  const separate = variant === 'after-workflow' || variant === 'review-workflow';
  return (
    <div style={{textAlign: 'left', margin: '0 28px', color: '#fff'}}>
      <div style={{fontSize: 21, letterSpacing: 2.5, color: B.metalLight, textTransform: 'uppercase', fontWeight: 700, ...rise(t, 0.1)}}>Example · Customer support</div>
      <div {...editable('workflow-title', 'Workflow title')} style={{fontSize: 54, fontWeight: 700, margin: '10px 0 27px', ...rise(t, 0.18)}}>{title}</div>
      {steps.map(([label, detail], i) => {
        const at = 0.42 + i * 0.44;
        const k = ease(prog(t, at, 0.65));
        const travel = separate ? (i - 1) * 15 * k : 0;
        return <div key={label} {...editable(`workflow-step-${i+1}`, `Workflow step ${i+1}`)} style={{...crimsonGlass, position: 'relative', margin: '0 0 18px', padding: '22px 25px', display: 'flex', alignItems: 'center', gap: 23, opacity: k, transform: `translate(${travel + (1 - k) * (i % 2 ? 84 : -84)}px, ${(1 - k) * (-38 - 20 * i)}px)`, borderLeft: `4px solid ${variant === 'before-workflow' ? B.metalLight : B.accent}`}}>
          <GlassSheen t={t} at={at + 0.45} />
          <span style={{fontSize: 29, fontWeight: 700, color: B.metalLight, flex: 'none'}}>{String(i + 1).padStart(2, '0')}</span>
          <div><div style={{fontSize: 33, fontWeight: 700}}>{label}</div><div style={{fontSize: 26, color: 'rgba(255,255,255,0.78)', marginTop: 3}}>{detail}</div></div>
        </div>;
      })}
      {note && <div {...editable('workflow-note', 'Handwritten note')} style={{fontSize: 34, fontFamily: handFamily, color: B.metalLight, fontWeight: 700, marginTop: 27, ...rise(t, 2.1)}}>{note}</div>}
    </div>
  );
};

const CoverChecklist: React.FC<{s: Slide; t: number}> = ({s, t}) => (
  <div {...editable('cover-checklist', 'Cover checklist')} style={{...crimsonGlass, position: 'relative', padding: '32px 30px', color: '#fff'}}>
    <GlassSheen t={t} at={0.35} />
    <div style={{fontWeight: 700, fontSize: 21, letterSpacing: 2.5, textTransform: 'uppercase', color: B.metalLight}}>{s.visual === 'purchase-card' ? 'Purchase request' : 'Subscription review'}</div>
    <div style={{fontSize: 35, fontWeight: 700, lineHeight: 1.17, margin: '16px 0 26px'}}>{s.body}</div>
    {s.items.map((item, i) => <div key={item} style={{borderTop: '1px solid rgba(255,255,255,0.22)', padding: '20px 0', fontSize: 27, lineHeight: 1.2, display: 'flex', gap: 15, alignItems: 'center'}}>
      <span style={{color: B.metalLight, fontSize: 19, fontWeight: 700}}>{String(i + 1).padStart(2, '0')}</span>{item}
    </div>)}
    <div style={{height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.20)', marginTop: 12}}>
      <div style={{height: '100%', width: `${47 + 43 * ease(prog(t, 0.3, 1.6))}%`, borderRadius: 3, background: B.accent}} />
    </div>
  </div>
);

const LabeledTrend: React.FC<{s: Slide; t: number}> = ({s, t}) => {
  const [first, last] = s.points;
  const k = ease(prog(t, 0.85, 2.0));
  const start = {x: 194, y: first > last ? 146 : 356};
  const end = {x: 728, y: first > last ? 356 : 146};
  const cursor = {x: start.x + k * (end.x - start.x), y: start.y + k * (end.y - start.y)};
  const delta = last - first;
  return (
    <div {...editable('trend-chart', 'Trend chart')} style={{...crimsonGlass, position: 'relative', textAlign: 'left', padding: '34px 28px 25px', ...rise(t, 0.22)}}>
      <GlassSheen t={t} at={1.2} />
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', gap: 12}}>
        <span style={{fontSize: 23, fontWeight: 700, letterSpacing: 2.3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)'}}>{s.panel}</span>
        <span style={{fontSize: 24, whiteSpace: 'nowrap', fontWeight: 700, color: B.metalLight, ...rise(t, 3.1)}}>{delta < 0 ? '−' : '+'}{Math.abs(delta)} percentage points</span>
      </div>
      <svg width="100%" viewBox="0 0 872 528" style={{display: 'block', marginTop: 10}} role="img" aria-label={`${s.items[0]}: ${first}${s.suffix}. ${s.items[1]}: ${last}${s.suffix}.`}>
        <defs>
          <linearGradient id="trend-stroke"><stop stopColor={B.accent} /><stop offset="1" stopColor={B.metalLight} /></linearGradient>
          <linearGradient id="trend-area" x2="0" y2="1"><stop stopColor={B.accent} stopOpacity="0.28" /><stop offset="1" stopColor={B.accent} stopOpacity="0" /></linearGradient>
        </defs>
        {[146, 251, 356].map(y => <line key={y} x1={60} x2={812} y1={y} y2={y} stroke="rgba(255,255,255,0.24)" strokeDasharray="5 8" />)}
        <path d={`M ${start.x} 454 V ${start.y} L ${cursor.x} ${cursor.y} V 454 Z`} fill="url(#trend-area)" />
        <line x1={60} x2={812} y1={454} y2={454} stroke="rgba(255,255,255,0.34)" />
        {[start, end].map(({x, y}, i) => (
          <g key={x} opacity={prog(t, i === 0 ? 0.44 : 2.76, 0.35)}>
            <line x1={x} x2={x} y1={y + 13} y2={451} stroke="rgba(255,255,255,0.5)" strokeDasharray="4 8" />
            <text x={x} y={494} textAnchor="middle" fill="#fff" fontSize={26}>{s.items[i]}</text>
            <rect x={x - 54} y={y - 85} width={108} height={53} rx={12} fill="#151618" stroke={B.metalLight} />
            <text x={x} y={y - 49} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={31}>{s.prefix}{s.points[i]}{s.suffix}</text>
          </g>
        ))}
        <path d={`M ${start.x} ${start.y} L ${cursor.x} ${cursor.y}`} fill="none" stroke="url(#trend-stroke)" strokeWidth={8} strokeLinecap="round" />
        <circle cx={start.x} cy={start.y} r={9} fill={B.accent} stroke="#fff" strokeWidth={3} opacity={prog(t, 0.34, 0.3)} />
        <circle cx={cursor.x} cy={cursor.y} r={10 + (k < 1 ? 2 * Math.sin(t * 8) : 0)} fill="#fff" stroke={B.metalLight} strokeWidth={4} opacity={prog(t, 0.85, 0.35)} />
      </svg>
    </div>
  );
};

const SpriteClosing: React.FC<{s: Slide; t: number}> = ({s, t}) => {
  const collage = s.end === 'collage';
  const bookmark = s.end === 'save';
    const k = ease(prog(t, 0.45, 0.55));
  return (
    <div style={{color: '#fff', textAlign: 'left'}}>
      {collage && s.items.length > 0 && <div style={{display: 'grid', gap: 14, marginBottom: 26}}>
        {s.items.map((question, i) => (
          <div key={question} style={{...crimsonGlass, position: 'relative', display: 'flex', alignItems: 'center', gap: 16, minHeight: 79, borderRadius: 15, padding: '13px 18px', fontSize: 25, fontWeight: 700, lineHeight: 1.22, ...rise(t, 0.18 + 0.3 * i)}}>
            <GlassSheen t={t} at={0.55 + 0.3 * i} />
            <span style={{color: B.metalLight, fontSize: 20, flex: 'none'}}>{String(i + 1).padStart(2, '0')}</span>
            <span>{question}</span>
          </div>
        ))}
      </div>}
      {collage && s.images.length > 0 && <div style={{display: 'grid', gridTemplateColumns: s.images.length === 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 12, marginBottom: 22}}>
        {s.images.map((src, i) => <div key={src} style={{...crimsonGlass, borderRadius: 16, aspectRatio: s.images.length === 4 ? '1.05 / 1' : '4 / 5', overflow: 'hidden', ...rise(t, 0.22 + 0.2 * i)}}>
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: s.images.length === 4 ? 'cover' : 'contain'}} />
        </div>)}
      </div>}
      <div {...editable('closing-card', 'Call to action')} style={{...crimsonGlass, position: 'relative', padding: '26px 28px', borderLeft: `4px solid ${B.accent}`, overflow: 'hidden', ...rise(t, collage ? 1.02 : 0.4)}}>
        <GlassSheen t={t} at={1.3} />
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          {bookmark && <svg width={43} height={53} viewBox="0 0 34 42" style={{flex: 'none', transform: `translateY(${-18 * (1 - k)}px)`}}>
            <path d="M4 2 H30 V40 L17 31 L4 40 Z" fill={B.accent} stroke={B.metalLight} strokeWidth={1.4} />
          </svg>}
          <div style={{flex: 1, minWidth: 0}}><div style={{fontWeight: 700, fontSize: 26}}>{s.handle || 'Comment'}</div><div style={{fontWeight: 700, fontSize: 39, letterSpacing: 0.2, color: B.metalLight}}>{s.keyword}</div></div>
          {s.end === 'link' && <span {...editable('cta-arrow', 'Call to action arrow')} style={{borderRadius: '50%', width: 54, height: 54, display: 'grid', placeItems: 'center', background: B.accent, fontSize: 30, flex: 'none'}}>→</span>}
        </div>
        {s.body && <div {...editable('closing-note', 'Closing text')} style={{marginTop: 19, borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 17, fontSize: 28, lineHeight: 1.30, color: 'rgba(255,255,255,0.89)', ...rise(t, collage ? 1.42 : 0.88)}}>{s.body}</div>}
      </div>
    </div>
  );
};

const StyledProof: React.FC<{s: Slide; t: number; style: 'bold' | 'editorial' | 'showcase'}> = ({s, t, style}) => {
  const k = ease(prog(t, 0.5, 1.6));
  const value = s.value ?? 0;
  const fraction = value * k / 100;
  const source = <div style={{color: B.metalLight, fontWeight: 700, fontSize: 23, letterSpacing: 2.3, textTransform: 'uppercase'}}>{s.panel}</div>;
  const number = <div style={{fontWeight: 700, fontSize: style === 'bold' ? 113 : 178, lineHeight: 1.06, color: '#fff', letterSpacing: -7, fontVariantNumeric: 'tabular-nums'}}>{Math.round(value * k)}%</div>;
  const description = <div {...editable('proof-description', 'Statistic description')} style={{fontSize: 39, lineHeight: 1.26, color: 'rgba(255,255,255,0.88)'}}>{s.body}</div>;
  if (style === 'bold') return (
    <div {...editable('gauge', 'Gauge card')} style={{...crimsonGlass, position: 'relative', textAlign: 'center', padding: '37px 58px 45px', ...rise(t, 0.25)}}>
      <GlassSheen t={t} at={1.6} />
      {source}
      <div style={{display: 'grid', placeItems: 'center', position: 'relative', width: 327, height: 327, margin: '17px auto 10px'}}>
        <svg width={327} height={327} viewBox="0 0 327 327" style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
          <circle cx={163.5} cy={163.5} r={141} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={10} />
          <circle cx={163.5} cy={163.5} r={141} fill="none" stroke={B.accent} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fraction} />
        </svg>
        {number}
      </div>
      {description}
    </div>
  );
  if (style === 'showcase') return (
    <div style={{position: 'relative', textAlign: 'left', margin: '0 24px'}}>
      <div {...editable('proof-main', 'Statistic card')} style={{...crimsonGlass, padding: '36px 48px 32px', position: 'relative', width: 640, ...rise(t, 0.2)}}>
        <GlassSheen t={t} at={1.55} />
        {source}
        <div style={{marginTop: 20}}>{number}</div>
        <div style={{height: 6, width: `${fraction * 100}%`, borderRadius: 3, background: B.accent, marginTop: 18}} />
      </div>
      <div style={{...crimsonGlass, position: 'relative', margin: '30px 0 0 112px', padding: '37px 40px', borderLeft: `5px solid ${B.accent}`, opacity: prog(t, 0.78, 0.35), transform: `translateX(${(1 - ease(prog(t, 0.78, 0.72))) * 112}px)`}}>{description}</div>
    </div>
  );
  return (
    <div {...editable('proof-card', 'Statistic card')} style={{...crimsonGlass, position: 'relative', padding: '42px 49px 50px', textAlign: 'left', ...rise(t, 0.25)}}>
      <GlassSheen t={t} at={1.7} />
      {source}
      <div style={{display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.35fr', alignItems: 'center', gap: 36, margin: '42px 0 44px'}}>
        {number}
        {description}
      </div>
      <div style={{position: 'relative', height: 13, borderRadius: 7, background: 'rgba(255,255,255,0.18)'}}>
        <div style={{height: '100%', width: `${fraction * 100}%`, borderRadius: 7, background: `linear-gradient(90deg, ${B.accent}, ${B.metalLight})`}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 17, color: 'rgba(255,255,255,0.77)', fontSize: 24}}><span>0%</span><span>100%</span></div>
    </div>
  );
};

const SlideBody: React.FC<{s: Slide; t: number; th: Th; withPresenter: boolean; composedOpening: boolean; starterPortrait?: boolean; groundedPortrait?: boolean; spaciousTech?: boolean; completeCover?: boolean; headlineAbove?: boolean; fanBehindPresenter?: boolean; expandedInterior?: boolean; contentGrid?: boolean; carouselStyle: VideoCarouselPlan['style']}> = ({s, t, th, withPresenter, composedOpening, starterPortrait, groundedPortrait, spaciousTech, completeCover, headlineAbove, fanBehindPresenter, expandedInterior, contentGrid, carouselStyle}) => {
  const items = s.items;
  const SlideHeadline = headlineAbove ? () => null : Headline;
  const SlideKicker = headlineAbove ? () => null : Kicker;
  const headlineIn = composedOpening ? {} : rise(t, 0.1);
  const portraitLayout = withPresenter && composedOpening;
  const narrow: React.CSSProperties = withPresenter && !starterPortrait ? {maxWidth: composedOpening ? 320 : 640} : {};
  const panelAlign: React.CSSProperties = AL === 'center' && !withPresenter ? {marginLeft: 'auto', marginRight: 'auto'} : AL === 'right' ? {marginLeft: 'auto'} : {};
  switch (s.layout) {
    case 'cover':
      if (contentGrid && s.visual === 'team-calendar') return <><TeamCalendar t={t} cover /><p {...editable('calendar-copy', 'Calendar caption')} style={{fontSize: 28, margin: '24px 0 0', lineHeight: 1.3, color: th.muted}}>{s.body}</p></>;
      if (contentGrid && (s.visual === 'purchase-card' || s.visual === 'audit-card')) return <CoverChecklist s={s} t={t} />;
      return (
        <>
          <SlideKicker text={s.kicker} t={completeCover ? Math.max(t, 0.4) : t} />
          <div style={{...headlineIn, ...(!portraitLayout ? narrow : {})}}><SlideHeadline text={s.headline} size={starterPortrait ? 74 : s.images.length ? 120 : portraitLayout ? 80 : th.hero} th={th} /></div>
          {completeCover && starterPortrait && items.length > 0
            ? <CoverComparison items={items} source={s.body} t={t} th={th} contentGrid={contentGrid} />
            : s.body && <p {...editable('cover-copy', 'Cover text')} style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: th.muted, ...(contentGrid ? {margin: 0} : {marginTop: 30}), maxWidth: s.image || withPresenter ? 560 : 900, ...panelAlign, ...rise(completeCover ? Math.max(t, 1) : t, 0.35)}}>{s.body}</p>}
          {!starterPortrait && portraitLayout && items.length > 0 && (
            <div style={{width: 320, display: 'grid', gap: 18, marginTop: 60}}>
              {items.map((item) => <div key={item} style={{...th.panel, borderLeft: `4px solid ${B.accent}`, padding: '20px 22px', color: th.ink, fontSize: 28, fontWeight: 700}}>{item}</div>)}
            </div>
          )}
          <Note text={s.note} t={t} at={1.2} />
          {s.image && <Framed src={s.image} t={t} style={{right: -10, bottom: 0, width: 400, height: 520, transform: 'rotate(3deg)'}} />}
          {s.images.length > 0 && !fanBehindPresenter && <CoverFan images={s.images} t={t} compact={starterPortrait} complete={completeCover} fitted={contentGrid} />}
        </>
      );
    case 'statement':
      if (contentGrid && s.items.length) return (
        <div {...editable('statement-card', 'Statement card')} style={{...crimsonGlass, position: 'relative', marginTop: 0, padding: '42px 50px', textAlign: 'left', ...rise(t, 0.2)}}>
          <GlassSheen t={t} at={1.5} />
          <div style={{fontSize: 42, fontWeight: 700, lineHeight: 1.25, color: th.ink}}>{s.body}</div>
          <div style={{marginTop: 33}}>
            {s.items.map((item, i) => <div key={item} style={{display: 'flex', alignItems: 'center', gap: 23, padding: '23px 0', borderTop: '1px solid rgba(255,255,255,0.22)', fontSize: 33, color: th.ink, ...rise(t, 0.7 + i * 0.46)}}>
              <Check t={t} at={0.9 + i * 0.46} size={34} />{item}
            </div>)}
          </div>
        </div>
      );
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={{...headlineIn, ...narrow}}><SlideHeadline text={s.headline} size={80} th={th} /></div>
          {s.body && (
            <div {...editable('statement', 'Statement')} style={{...th.panel, marginTop: contentGrid ? 0 : 50, padding: expandedInterior ? '60px 64px' : '36px 40px', ...narrow, ...rise(t, 0.45)}}>
              <div style={{width: 60, height: 5, background: B.accent, marginBottom: 22, transform: `scaleX(${prog(t, 0.6)})`, transformOrigin: 'left'}} />
              <div style={{fontFamily: sans, fontSize: expandedInterior ? 50 : 38, lineHeight: 1.35, color: th.ink}}>{s.body}</div>
            </div>
          )}
          <Note text={s.note} t={t} at={1.4} />
          {s.image && <Framed src={s.image} t={t} style={{right: 0, bottom: 0, width: 300, height: 380}} />}
        </>
      );
    case 'status':
      if (spaciousTech) return <TechStatus s={s} t={t} th={th} contentGrid={contentGrid} />;
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={{...headlineIn, ...narrow}}><SlideHeadline text={s.headline} size={78} th={th} /></div>
          <div style={{position: 'relative', height: 520, marginTop: 40, width: withPresenter ? 640 : 860, alignSelf: AL === 'center' && !withPresenter ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', textAlign: 'left'}}>
            <StatusPanel s={s} t={t} th={th} style={{position: 'absolute', left: 0, top: 0, transform: `rotate(-3deg) ${rise(t, 0.3).transform} translateY(${Math.sin(t * 0.9) * 5}px)`, opacity: prog(t, 0.3, 0.35)}} />
            {items.length > 0 && (
              <svg width={300} height={220} viewBox="0 0 300 220" style={{position: 'absolute', left: withPresenter ? 150 : 300, top: 150, overflow: 'visible'}}>
                <ChecklistArrow
                  from={s.panel} curve="M 10 30 C 120 30, 170 80, 215 160"
                  tip="M 192 150 L 218 166 L 224 136" color={HI} draw={prog(t, 1.75, 0.45)} tipOpacity={prog(t, 2.15, 0.15)}
                />
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
      const branchPath = 'M464 0 V43 M147 106 V43 H781 V106 M464 43 V106';
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={{...headlineIn, ...narrow}}><SlideHeadline text={s.headline} size={74} th={th} /></div>
          <div {...editable('branch-start', 'Announcement card')} style={{...th.panel, marginTop: contentGrid ? 0 : spaciousTech ? 77 : 40, padding: spaciousTech ? '27px 30px' : '24px 30px', width: withPresenter ? 520 : 600, alignSelf: withPresenter ? 'flex-start' : AL === 'center' ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', textAlign: spaciousTech ? 'center' : 'left', ...rise(t, 0.35)}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 20, letterSpacing: 2.5, textTransform: 'uppercase', color: th.muted}}>{s.panel || 'The plan'}</div>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 36, color: th.ink, marginTop: 10}}>{s.root}</div>
          </div>
          <svg width={928} height={spaciousTech ? 106 : 70} style={{display: 'block', flexShrink: 0}}>
            <g {...editable('branch-connectors', 'Branch connectors')} style={{pointerEvents: 'stroke'}}>
              <path d={spaciousTech ? branchPath : `M ${withPresenter ? 260 : 464} 0 V 30 H 155 V 70 M ${withPresenter ? 260 : 464} 30 H 773 V 70 M 464 30 V 70`} fill="none" stroke={spaciousTech ? B.accent : hexA(B.metalLight, 0.6)} strokeWidth={spaciousTech ? 4 : 2.5} pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - prog(t, 0.8, 0.6)}} />
            </g>
          </svg>
          <div style={{display: 'flex', gap: 22, textAlign: spaciousTech ? 'center' : 'left'}}>
            {cards.map((c, i) => (
              <div key={i} {...editable(`branch-item-${i+1}`, `Branch card ${i+1}`)} style={{...th.panel, flex: 1, padding: spaciousTech ? '27px 24px 30px' : '24px 24px 28px', ...(spaciousTech ? {minHeight: 166, borderTop: `3px solid ${B.accent}`} : {}), ...rise(t, 1.2 + i * (composedOpening || spaciousTech ? 0.65 : 0.3))}}>
                <span style={{...metalText, fontSize: 40}}>{String(i + 1).padStart(2, '0')}</span>
                {c.label && <div style={{fontFamily: sans, fontWeight: 700, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: HI, marginTop: 8}}>{c.label}</div>}
                <div style={{fontFamily: sans, fontSize: spaciousTech ? 30 : 27, lineHeight: 1.3, color: th.ink, marginTop: 8}}>{c.text}</div>
              </div>
            ))}
          </div>
          {spaciousTech && s.body && (
            <>
              <svg width={928} height={88} style={{display: 'block', flexShrink: 0}}>
                <g {...editable('summary-connector', 'Takeaway connector')} style={{pointerEvents: 'stroke'}}>
                  <path d="M147 0 V35 H781 V0 M464 0 V88" fill="none" stroke={B.metalLight} strokeWidth={3} opacity={0.8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, 2.65, 0.8)} />
                </g>
              </svg>
              <div {...editable('branch-summary', 'Takeaway text')} style={{...th.panel, alignSelf: 'center', maxWidth: 660, background: '#1A1A1C', borderLeft: `5px solid ${B.accent}`, padding: '27px 35px', color: th.ink, fontSize: 31, lineHeight: 1.25, fontWeight: 700, ...rise(t, 3.45)}}>{s.body}</div>
            </>
          )}
          <Note text={s.note} t={t} at={2.4} />
        </>
      );
    }
    case 'list':
    case 'checklist':
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={headlineIn}><SlideHeadline text={s.headline} size={76} th={th} /></div>
          {s.body && <p style={{fontFamily: sans, fontSize: 30, lineHeight: 1.4, color: th.muted, marginTop: 20, ...rise(t, 0.2)}}>{s.body}</p>}
          <div style={{display: 'flex', flexDirection: 'column', gap: contentGrid ? 32 : spaciousTech || expandedInterior ? 26 : 20, marginTop: contentGrid ? 0 : spaciousTech ? 87 : 40, ...(spaciousTech ? {width: contentGrid ? 820 : 728, alignSelf: 'center'} : {})}}>
            {items.map((x, i) => (
              <div key={i} {...editable(`list-item-${i+1}`, `List item ${i+1}`)} style={{...th.panel, padding: spaciousTech || expandedInterior ? '31px 36px' : '26px 32px', ...(spaciousTech ? {minHeight: 91, borderLeft: `4px solid ${B.accent}`} : expandedInterior ? {minHeight: 86} : {}), ...(contentGrid ? {boxSizing: 'border-box', minHeight: 126} : {}), display: 'flex', alignItems: 'center', gap: 26, textAlign: 'left', ...rise(t, 0.45 + i * (spaciousTech ? 0.55 : 0.35)), marginLeft: Math.sin(t * 1.3 + i) * 3}}>
                {s.layout === 'checklist' ? <Check t={t} at={0.75 + i * (spaciousTech ? 0.55 : 0.35)} /> : <Num n={i + 1} />}
                <span style={{fontFamily: sans, fontSize: expandedInterior ? 41 : spaciousTech ? 36 : 34, lineHeight: 1.3, color: th.ink}}>{x}</span>
              </div>
            ))}
          </div>
          {s.note && <div style={spaciousTech ? {maxWidth: 740, alignSelf: 'center', marginTop: 40} : undefined}>
            <Note text={s.note} t={t} at={1.2 + items.length * (spaciousTech ? 0.55 : 0.35)} />
          </div>}
        </>
      );
    case 'compare': {
      const half = Math.ceil(items.length / 2);
      const cols = [items.slice(0, half), items.slice(half)];
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={headlineIn}><SlideHeadline text={s.headline} size={74} th={th} /></div>
          <div style={{display: 'flex', gap: contentGrid ? 32 : 24, marginTop: contentGrid ? 0 : 50, textAlign: 'left'}}>
            {cols.map((col, c) => (
              <div key={c} {...editable(`comparison-${c+1}`, c === 0 ? 'Left card' : 'Right card')} style={{
                ...th.panel, flex: 1, padding: expandedInterior ? '48px 38px' : 34, position: 'relative',
                ...(expandedInterior ? {minHeight: contentGrid ? 435 : 265} : {}),
                ...(!contentGrid && c === 1 ? (LIGHT ? {borderColor: B.accent, background: B.accent, color: '#fff'} : {borderColor: B.accent, background: `linear-gradient(135deg, ${hexA(B.accent, 0.35)}, ${hexA(B.accentDeep, 0.25)})`}) : {}),
                ...(contentGrid ? crimsonGlass : {}),
                ...rise(t, 0.4 + c * 0.5),
                ...(contentGrid ? {transform: `translate(${(c === 0 ? -1 : 1) * (1 - ease(prog(t, 0.4 + c * 0.5))) * 56}px, ${(1 - ease(prog(t, 0.4 + c * 0.5))) * 30}px)`} : {}),
              }}>
                {contentGrid && c === 1 && <><GlassSheen t={t} at={1.35} /><div style={{height: 5, position: 'absolute', top: 0, left: 26, right: 26, background: B.accent, borderRadius: 4, transform: `scaleX(${ease(prog(t, 1.1, 0.7))})`, transformOrigin: 'left'}} /></>}
                <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: c === 1 ? (LIGHT ? '#FFFFFF' : HI) : th.muted}}>{c === 0 ? s.left : s.right}</div>
                {col.map((x, i) => (
                  <div key={i} style={{fontFamily: sans, fontSize: expandedInterior ? 41 : 32, lineHeight: 1.26, color: LIGHT && c === 1 ? '#FFFFFF' : th.ink, marginTop: expandedInterior ? 32 : 22, ...(!contentGrid && s.crossOutLeft && c === 0 && prog(t, 1.4 + i * 0.25) > 0.5 ? {textDecoration: `line-through ${hexA(B.accent, 0.9)}`} : {})}}>
                    {contentGrid && s.crossOutLeft && c === 0 ? <span style={{backgroundImage: `linear-gradient(transparent 48%, ${B.accent} 48%, ${B.accent} 55%, transparent 55%)`, backgroundRepeat: 'no-repeat', backgroundSize: `${100 * ease(prog(t, 1.25 + i * 0.25, 0.7))}% 100%`}}>{x}</span> : x}
                  </div>
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
          <SlideKicker text={s.kicker} t={t} />
          {!s.icon && <div style={{fontFamily: serif, fontSize: 220, lineHeight: 0.6, color: B.metal, opacity: prog(t, 0, 0.4), height: 110}}>“</div>}
          <div {...editable('quote-text', 'Quote')} style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 500, fontSize: expandedInterior ? 81 : 70, lineHeight: 1.18, color: th.ink, ...(composedOpening ? {} : rise(t, 0.2))}}>{headlineAbove ? s.body : s.headline.replace(/\*/g, '')}</div>
          {s.by && <div style={{fontFamily: sans, fontWeight: 700, fontSize: 28, letterSpacing: 3, textTransform: 'uppercase', color: HI, marginTop: 40, ...rise(t, 0.6)}}>{s.by}</div>}
          {s.note && (
            <div {...editable('quote-note', 'Supporting text')} style={{marginTop: 58, fontSize: expandedInterior ? 39 : 34, color: th.muted, ...rise(t, 1.2)}}>
              <div style={{height: 4, width: 118, background: B.accent, margin: expandedInterior && AL === 'center' ? '0 auto 20px' : '0 0 20px', transformOrigin: 'left', transform: `scaleX(${ease(prog(t, 1.25, 1.2))})`}} />
              {s.note}
            </div>
          )}
        </>
      );
    case 'steps': {
      const stepHeight = contentGrid ? 190 : expandedInterior ? 172 : 150;
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={headlineIn}><SlideHeadline text={s.headline} size={74} th={th} /></div>
          <div style={{position: 'relative', marginTop: contentGrid ? 0 : 50, paddingLeft: 40, alignSelf: AL === 'center' ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', textAlign: 'left'}}>
            <div style={{position: 'absolute', left: 21, top: expandedInterior ? stepHeight / 2 : 20, width: 3, height: `${Math.max(0, items.length - 1) * stepHeight * prog(t, 0.5, 0.4 + items.length * 0.35)}px`, background: `linear-gradient(${B.metalLight}, ${B.metal})`}} />
            {items.map((x, i) => (
              <div key={i} {...editable(`step-${i+1}`, `Step ${i+1}`)} style={{display: 'flex', alignItems: 'center', gap: 34, height: stepHeight, marginLeft: -40, ...rise(t, 0.5 + i * (composedOpening ? 0.7 : 0.35))}}>
                <div style={{width: 46, height: 46, borderRadius: 23, background: `linear-gradient(135deg, ${B.metalLight}, ${B.metal})`, color: '#1a0e06', fontFamily: sans, fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
                <span style={{fontFamily: sans, fontSize: expandedInterior ? 44 : 36, lineHeight: 1.3, color: th.ink}}>{x}</span>
              </div>
            ))}
          </div>
        </>
      );
    }
    case 'media': {
      if (contentGrid && s.visual === 'team-calendar') return (
        <div style={{display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 36, alignItems: 'center'}}>
          <TeamCalendar t={t} />
          <div {...editable('calendar-note', 'Handwritten note')} style={{textAlign: 'left', color: HI, fontFamily: handFamily, fontSize: 45, lineHeight: 1.12, ...rise(t, 2.2)}}>{s.note}</div>
        </div>
      );
      if (contentGrid && s.visual && s.visual in workflowCards) return <WorkflowLayers variant={s.visual as keyof typeof workflowCards} t={t} note={s.note} />;
      const w = s.side === 'center' ? 560 : 520;
      const left = s.side === 'left' ? 0 : s.side === 'right' ? 928 - w : (928 - w) / 2;
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={composedOpening ? {} : rise(t, 0.05)}><SlideHeadline text={s.headline} size={78} th={th} /></div>
          <div style={{position: 'relative', height: 700, marginTop: 30}}>
            {s.media && <Media src={s.media} t={t} style={{left, top: 0, width: w, height: 700, transform: `translateY(${Math.sin(t * 0.8) * 4}px)`}} />}
          </div>
        </>
      );
    }
    case 'toggles': {
      const active = Math.min(items.length - 1, Math.floor(Math.max(0, t - 0.6) / (composedOpening ? 1.45 : 0.9)));
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={composedOpening ? {} : rise(t, 0.05)}><SlideHeadline text={s.headline} size={78} th={th} /></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: expandedInterior ? 28 : 18, marginTop: contentGrid ? 0 : 44, textAlign: 'left'}}>
            {items.map((x, i) => {
              const on = i < active || (i === active && t > 0.6);
              const cur = i === active;
              return (
                <div key={i} {...editable(`toggle-${i+1}`, `Toggle ${i+1}`)} style={{...th.panel, borderRadius: 60, padding: expandedInterior ? '32px 38px' : cur ? '26px 34px' : '20px 34px', ...(expandedInterior ? {minHeight: 74} : {}), display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${cur ? 1.04 : 0.94})`, filter: cur || i < active ? 'none' : 'blur(2.5px)', opacity: cur ? 1 : i < active ? 0.75 : 0.5, ...rise(t, 0.2 + i * 0.12)}}>
                  <span style={{fontFamily: sans, fontWeight: 700, fontSize: 26, color: HI}}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{flex: 1, fontFamily: sans, fontWeight: 700, fontSize: expandedInterior ? 37 : cur ? 36 : 30, color: th.ink}}>{x}</span>
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
      if (contentGrid && s.suffix === '%' && !s.prefix && v >= 0 && v <= 100 && (carouselStyle === 'bold' || carouselStyle === 'editorial' || carouselStyle === 'showcase')) {
        return <StyledProof s={s} t={t} style={carouselStyle} />;
      }
      const k = 1 - Math.pow(1 - prog(t, 0.5, 1.6), 3);
      const shown = Math.round(v * k).toLocaleString('en-US');
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={composedOpening ? {} : rise(t, 0.05)}><SlideHeadline text={s.headline} size={78} th={th} /></div>
          <div {...editable('statistic', 'Statistic card')} style={{...th.panel, ...(contentGrid ? crimsonGlass : {}), position: 'relative', marginTop: contentGrid ? 0 : 60, padding: expandedInterior ? '50px 52px' : '44px 50px', textAlign: 'left', ...panelAlign, maxWidth: contentGrid ? 820 : expandedInterior ? 788 : 760, ...rise(t, 0.3)}}>
            {contentGrid && <GlassSheen t={t} at={1.8} />}
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: th.muted}}>{s.panel}</div>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: expandedInterior ? 210 : 150, lineHeight: 1.1, color: LIGHT && composedOpening ? B.accentMid : th.ink, letterSpacing: -4, display: 'inline-block', position: 'relative'}}>
              {s.prefix}{shown}{s.suffix}
              <div style={{position: 'absolute', left: 0, bottom: 4, height: 7, borderRadius: 4, width: `${prog(t, 1.9, 0.6) * 100}%`, background: B.metal}} />
            </div>
            {s.body && <div {...editable('statistic-description', 'Statistic description')} style={{fontFamily: serif, fontStyle: 'italic', fontSize: expandedInterior ? 44 : 36, color: th.muted, marginTop: expandedInterior ? 22 : 8}}>{s.body}</div>}
            {contentGrid && s.suffix === '%' && v >= 0 && v <= 100 && <div style={{display: 'grid', gridTemplateColumns: 'repeat(20, minmax(0, 1fr))', gap: 7, marginTop: 43}}>
              {Array.from({length: 20}, (_, i) => (
                <div key={i} style={{height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.15)', overflow: 'hidden'}}>
                  <div style={{width: `${100 * clamp((v * k - i * 5) / 5)}%`, height: '100%', background: B.accent}} />
                </div>
              ))}
            </div>}
          </div>
        </>
      );
    }
    case 'graph': {
      if (contentGrid && s.points.length === 2 && items.length === 2 && s.suffix === '%') return <LabeledTrend s={s} t={t} />;
      const pts = s.points.length > 1 ? s.points : [2, 3, 2.6, 4, 4.8, 6.5, 8.2];
      const mn = Math.min(...pts);
      const mx = Math.max(...pts);
      const W2 = 760;
      const H2 = expandedInterior ? 420 : 300;
      const xMargin = expandedInterior ? 65 : 40;
      const yMargin = expandedInterior ? 76 : 40;
      const xy = pts.map((p, i) => [xMargin + (i / (pts.length - 1)) * (W2 - 2 * xMargin), yMargin + (1 - (p - mn) / (mx - mn || 1)) * (H2 - 2 * yMargin)]);
      const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
      const k = prog(t, 0.6, 1.6);
      const position = k * (xy.length - 1);
      const segment = Math.min(xy.length - 2, Math.floor(position));
      const tip = xy[segment].map((axis, i) => axis + (xy[segment + 1][i] - axis) * (position - segment));
      return (
        <>
          <SlideKicker text={s.kicker} t={t} />
          <div style={composedOpening ? {} : rise(t, 0.05)}><SlideHeadline text={s.headline} size={78} th={th} /></div>
          <div style={{...th.panel, marginTop: 50, padding: '34px 40px', textAlign: 'left', ...panelAlign, width: 840, ...rise(t, 0.3)}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <span style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: th.muted}}>{s.panel}</span>
              <span style={{fontFamily: sans, fontWeight: 700, fontSize: 72, color: th.ink}}>{s.prefix}{Math.round(composedOpening || (s.points.length > 1 && pts[0] > pts[pts.length - 1]) ? pts[0] + ((s.value ?? pts[pts.length - 1]) - pts[0]) * k : (s.value ?? 0) * k)}{s.suffix}</span>
            </div>
            <svg width={W2} height={H2} style={{display: 'block', marginTop: 10}}>
              <defs><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stopColor={B.accent} /><stop offset="1" stopColor={LIGHT && composedOpening ? B.accentMid : B.metalLight} /></linearGradient></defs>
              {expandedInterior && [yMargin, H2 / 2, H2 - yMargin].map(y => <line key={y} x1={20} x2={W2 - 20} y1={y} y2={y} stroke={th.rule} strokeDasharray="5 8" />)}
              <path d={d} fill="none" stroke="url(#gl)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{strokeDasharray: 1, strokeDashoffset: 1 - k, filter: `drop-shadow(0 0 10px ${hexA(B.metalLight, 0.7)})`}} />
              {k > 0.02 && <circle cx={tip[0]} cy={tip[1]} r={11 + 2 * Math.sin(t * 5)} fill="#fff" stroke={B.metalLight} strokeWidth={4} />}
              {expandedInterior && items.length === pts.length && xy.map(([x, y], i) => (
                <g key={items[i]} opacity={prog(t, 0.65 + i * 1.45, 0.35)}>
                  <text x={x} y={y - 24} textAnchor={i ? 'end' : 'start'} fontFamily={sans} fontSize={34} fontWeight={700} fill={th.ink}>{s.prefix}{pts[i]}{s.suffix}</text>
                  <text x={x} y={y + 48} textAnchor={i ? 'end' : 'start'} fontFamily={sans} fontSize={23} fill={th.muted}>{items[i]}</text>
                </g>
              ))}
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
          <SlideKicker text={s.kicker} t={t} />
          <div style={composedOpening ? {} : rise(t, 0.05)}><SlideHeadline text={s.headline} size={78} th={th} /></div>
          <div style={{display: 'flex', gap: 24, marginTop: contentGrid ? 0 : 50, textAlign: 'left'}}>
            {[s.left, s.right].map((title, c) => (
              <div key={c} {...editable(`result-${c+1}`, c === 0 ? 'Left card' : 'Right card')} style={{...th.panel, flex: 1, minHeight: 420, padding: 34, transform: `scale(${c === win ? 1 + 0.04 * pick : 1 - 0.03 * pick})`, ...rise(t, 0.3 + c * 0.3), ...(contentGrid ? {transform: `${rise(t, 0.3 + c * 0.3).transform} scale(${c === win ? 1 + 0.04 * pick : 1 - 0.03 * pick})`, opacity: prog(t, 0.3 + c * 0.3, 0.35) * (c === win ? 1 : 1 - 0.28 * pick)} : {}), border: c === win && pick > 0.5 ? `3px solid ${contentGrid ? B.accent : B.metalLight}` : (th.panel.border as string)}}>
                <div style={{fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: c === win ? HI : th.muted}}>{title}</div>
                <div style={{fontFamily: sans, fontSize: expandedInterior ? 40 : 32, lineHeight: 1.35, color: th.ink, marginTop: 20}}>{items[c] ?? ''}</div>
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
          <SlideKicker text={s.kicker} t={t} />
          <div style={composedOpening ? {} : rise(t, 0.05)}><SlideHeadline text={s.headline} size={78} th={th} /></div>
          <div {...editable('prompt-card', 'Prompt card')} style={{...th.panel, marginTop: contentGrid ? 0 : 44, padding: expandedInterior ? '48px 48px' : '40px 44px', width: expandedInterior ? 746 : 620, alignSelf: AL === 'center' ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', textAlign: 'left', transform: `rotate(-2deg) translateY(${Math.sin(t * 0.8) * 5}px)`, ...rise(t, 0.3)}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: th.ink, marginBottom: 20}}>{s.panel || s.body}</div>
            {items.length ? items.map((item, i) => (
              <div key={item} style={{fontSize: expandedInterior ? 37 : 28, lineHeight: 1.24, color: th.ink, marginTop: expandedInterior ? 30 : 16, display: 'flex', alignItems: 'flex-start', gap: 16, ...rise(t, 0.7 + i * 0.5)}}>
                <Check t={t} at={0.9 + i * 0.5} size={30} />
                <span>{item}</span>
              </div>
            )) : Array.from({length: 9}, (_, i) => <div key={i} style={{height: 12, borderRadius: 6, marginBottom: 16, width: `${[92, 80, 88, 60, 90, 76, 84, 70, 50][i]}%`, background: i % 4 === 0 ? hexA(B.metal, 0.75) : 'rgba(255,255,255,0.22)', transform: `scaleX(${prog(t, 0.5 + i * 0.08, 0.4)})`, transformOrigin: 'left'}} />)}
          </div>
          {s.keyword && (
            <div {...editable('keyword', 'Comment keyword')} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 34, padding: '14px 16px 14px 30px', borderRadius: 50, ...th.panel, width: 560, alignSelf: AL === 'center' ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', ...rise(t, 1.2)}}>
              <span style={{flex: 1, fontFamily: sans, fontWeight: 700, fontSize: 34, color: th.ink, textAlign: 'left'}}>{s.keyword.slice(0, Math.floor(prog(t, 1.5, 0.6) * s.keyword.length))}</span>
              <div style={{width: 58, height: 58, borderRadius: 29, background: B.metal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700}}>↑</div>
            </div>
          )}
        </>
      );
    case 'cta': {
      if (contentGrid && starterPortrait && s.keyword && !(spaciousTech && s.end === 'link' && groundedPortrait && !s.spriteSide)) {
        return <SpriteClosing s={s} t={t} />;
      }
      const onPanel = LIGHT ? '#FFFFFF' : th.ink;
      const panelBg = composedOpening && !LIGHT ? hexA(CHARCOAL, 0.86) : LIGHT ? `linear-gradient(135deg, ${B.accent}, ${B.accentDeep})` : `linear-gradient(135deg, ${hexA(B.accent, 0.4)}, ${hexA(B.accentDeep, 0.3)})`;
      const pop = 0.92 + 0.08 * ease(prog(t, 0.7, 0.5));
      const big: React.CSSProperties = {fontFamily: serif, fontSize: portraitLayout ? 55 : 150, lineHeight: 1.15, letterSpacing: 6, color: LIGHT ? shade(B.metalLight, 0.4) : HI, transform: `scale(${pop})`};
      const head = <><SlideKicker text={s.kicker} t={t} /><div style={{...headlineIn, ...(!portraitLayout ? narrow : {}), ...panelAlign}}><SlideHeadline text={s.headline} size={80} th={th} /></div></>;
      if (s.end === 'collage') {
        const tiles = s.images.length ? s.images : [];
        return (
          <>
            <SlideKicker text={s.kicker} t={t} />
            <div style={{...rise(t, 0.05)}}><SlideHeadline text={s.headline} size={78} th={th} /></div>
            {s.keyword && <div style={{display: 'inline-block', alignSelf: AL === 'center' ? 'center' : 'flex-start', marginTop: 20, padding: '10px 26px', borderRadius: 14, background: B.accent, color: '#fff', fontFamily: sans, fontWeight: 700, fontSize: 34, transform: `rotate(-2deg) scale(${pop})`}}>Comment "{s.keyword.toUpperCase()}"</div>}
            {s.body && <div style={{fontFamily: serif, fontStyle: 'italic', fontSize: starterPortrait ? 30 : 34, color: starterPortrait ? th.ink : th.muted, marginTop: 14, ...(starterPortrait ? {alignSelf: 'flex-start', maxWidth: 335, background: '#171719', borderRadius: 12, padding: '10px 15px'} : {})}}>{s.body}</div>}
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
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 16, marginTop: 44, padding: '22px 46px', borderRadius: 60, background: `linear-gradient(135deg, ${B.metalLight}, ${B.metal})`, color: '#14100c', fontFamily: sans, fontWeight: 700, fontSize: s.keyword ? 30 : 38, alignSelf: AL === 'center' && !withPresenter ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', transform: `scale(${pop})`, ...rise(t, 0.5)}}>{s.keyword ? `Comment ${s.keyword}` : `+ Follow${s.handle ? ` ${s.handle}` : ''}`}</div>
            {s.body && <p style={{fontFamily: sans, fontSize: 32, lineHeight: 1.4, color: th.muted, marginTop: 30, ...narrow, ...panelAlign, ...rise(t, 0.8)}}>{s.body}</p>}
          </>
        );
      if (s.end === 'save')
        return (
          <>
            <svg width={170} height={210} viewBox="0 0 34 42" style={{marginBottom: 36, alignSelf: starterPortrait || AL === 'right' ? 'flex-end' : AL === 'center' && !withPresenter ? 'center' : 'flex-start', transform: `translateY(${(1 - ease(prog(t, 0, 0.6))) * -80}px) scale(${pop})`, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.35))'}}>
              <defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={B.metalLight} /><stop offset="1" stopColor={B.metal} /></linearGradient></defs>
              <path d="M4 2 H30 V40 L17 31 L4 40 Z" fill="url(#bm)" />
            </svg>
            {head}
            {s.keyword && <div style={{...th.panel, alignSelf: withPresenter ? 'flex-start' : 'center', padding: '16px 24px', fontSize: 30, fontWeight: 700, color: th.ink, ...rise(t, 0.45)}}>Comment <span style={{color: B.metalLight}}>{s.keyword}</span></div>}
            {s.body && <p style={{fontFamily: sans, fontSize: 34, lineHeight: 1.4, color: th.muted, marginTop: 30, ...narrow, ...panelAlign, ...rise(t, 0.5)}}>{s.body}</p>}
          </>
        );
      if (s.end === 'link' && spaciousTech && groundedPortrait)
        return <TechPortraitCallout s={s} t={t} th={th} contentGrid={contentGrid} />;
      if (s.end === 'link')
        return (
          <>
            {head}
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 22, marginTop: 50, padding: groundedPortrait ? '28px 34px' : '28px 50px', borderRadius: 22, background: groundedPortrait ? '#171719' : panelBg, border: `2px solid ${hexA(B.metalLight, 0.6)}`, borderLeft: groundedPortrait ? `5px solid ${B.accent}` : undefined, color: onPanel, fontFamily: sans, fontWeight: 700, fontSize: starterPortrait ? 34 : 42, alignSelf: AL === 'center' && !withPresenter ? 'center' : AL === 'right' ? 'flex-end' : 'flex-start', ...rise(t, 0.45)}}>
              {s.handle || 'Link in bio'}
              <span {...editable('cta-arrow', 'Call to action arrow')} style={{display: 'inline-block', transform: `translateX(${8 * Math.sin(t * 4)}px)`, color: LIGHT ? '#FFFFFF' : HI}}>→</span>
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
          <div style={{...th.panel, marginTop: 50, padding: portraitLayout ? 28 : 46, borderColor: B.metal, background: panelBg, ...narrow, ...rise(t, 0.4)}}>
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
const Ambient: React.FC<{t: number; style: VideoCarouselPlan['style']; contentGrid?: boolean}> = ({t, style, contentGrid}) => {
  const n = style === 'bold' ? 34 : style === 'clean' ? 12 : 22;
  const color = style === 'clean' ? B.metal : style === 'bold' ? '#FFFFFF' : B.metalLight;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', maskImage: contentGrid ? 'linear-gradient(transparent 22%, black 30%, black 89%, transparent 96%)' : undefined}}>
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

const PortraitCopy: React.FC<{slide: Slide; t: number; th: Th; side: 'left' | 'right'}> = ({slide, t, th, side}) => {
  const closing = slide.layout === 'cta';
  const textEdge = side === 'left' ? 'right' : 'left';
  return (
    <div style={{position: 'absolute', top: 176, bottom: 150, [textEdge]: 69, width: 435, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left'}}>
      <div>
        <div style={{fontSize: 21, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: B.metalLight, marginBottom: 27}}>{slide.kicker}</div>
        <Headline text={slide.headline} size={closing ? 65 : 68} th={th} />
      </div>
      {closing ? (
        <div style={{...th.panel, padding: '28px 32px', borderColor: B.metal, position: 'relative', overflow: 'hidden', marginLeft: side === 'left' ? 56 : 0, marginRight: side === 'right' ? 56 : 0, ...rise(t, 0.65)}}>
          <div style={{height: 4, background: B.accent, position: 'absolute', top: 0, left: 0, right: 0, transformOrigin: 'left', transform: `scaleX(${ease(prog(t, 0.9, 1.1))})`}} />
          <div style={{fontSize: 25, color: th.muted}}>Comment</div>
          <div style={{...shine(metalText), fontSize: 70, margin: '5px 0 14px'}}>{slide.keyword}</div>
          <div style={{fontSize: 29, lineHeight: 1.35, color: th.ink}}>{slide.body}</div>
        </div>
      ) : (
        <div style={{display: 'grid', gap: 20, marginLeft: side === 'left' ? 66 : 0, marginRight: side === 'right' ? 66 : 0}}>
          {slide.items.map((item, index) => {
            const at = 0.25 + index * 1.2;
            return (
              <div key={item} style={{...th.panel, padding: '22px 24px', color: th.ink, fontSize: 30, fontWeight: 700, position: 'relative', overflow: 'hidden'}}>
                <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, background: index === 0 ? B.accent : B.metalLight, transformOrigin: 'top', transform: `scaleY(${ease(prog(t, at + 0.2, 0.6))})`}} />
                <div style={{color: B.metalLight, fontSize: 16, letterSpacing: 3, marginBottom: 8}}>0{index + 1}</div>
                {item}
              </div>
            );
          })}
          <div style={{display: 'flex', alignItems: 'center', gap: 14, color: B.metalLight, fontSize: 22, ...rise(t, 3.4)}}>
            {'Swipe'} <span style={{fontSize: 32, transform: `translateX(${4 * Math.sin(t * 3)}px)`}}>→</span>
          </div>
        </div>
      )}
    </div>
  );
};

const DEFAULT_PRESENTER: Slide['layout'][] = ['cover', 'statement', 'status', 'branches', 'cta'];

export function resolveSlideSprite(plan: VideoCarouselPlan, slide: Slide): NonNullable<Slide['spriteEdit']> {
  if (slide.spriteEdit) return slide.spriteEdit;
  const presenter = plan.presenter;
  const visible = slide.presenter ?? DEFAULT_PRESENTER.includes(slide.layout);
  return {
    src: presenter?.sprite && visible ? presenter.src : null,
    x: 0,
    y: 0,
    scale: slide.spriteScale ?? presenter?.scale ?? 1,
    flip: slide.spriteFlip ?? presenter?.flip ?? false,
  };
}

export const VideoCarousel: React.FC<{plan: VideoCarouselPlan}> = ({plan}) => {
  loadBrandFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
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
  const marble = s.surface === 'marble';
  const contentGrid = !!plan.c3ContentGrid;
  const starter = !!(plan.starterPortrait || plan.c3Dotted || contentGrid);
  const standardTheme = theme(plan.style, plan.composedOpening, marble);
  const dottedDark = plan.c3Dotted && !marble;
  const professionalPanel: React.CSSProperties = {
    ...standardTheme.panel,
    background: 'rgba(255,255,255,0.075)',
    border: `1.5px solid ${hexA(B.metalLight, 0.32)}`,
  };
  const darkInk = {ink: '#FFFFFF', muted: 'rgba(255,255,255,0.74)', rule: 'rgba(255,255,255,0.16)'};
  const th = dottedDark
    ? {...standardTheme, ...darkInk, bg: '#000000', panel: plan.style === 'clean' ? professionalPanel : standardTheme.panel}
    : starter ? {...standardTheme, bg: '#000000'} : standardTheme;
  LIGHT = (plan.style === 'clean' && !dottedDark) || marble;
  HI = LIGHT ? shade(B.metal, -0.15) : plan.style === 'bold' && !dottedDark ? shade(B.metalLight, 0.6) : B.metalLight;
  metalText = metalTextFor(LIGHT, plan.style === 'bold' && !dottedDark);
  NOTE_INK = LIGHT ? shade(B.metal, -0.2) : plan.style === 'showcase' && !dottedDark ? '#F2D24B' : shade(B.metalLight, 0.35);
  if (marble) {
    HI = B.accent;
    metalText = {...metalTextBase, background: `linear-gradient(135deg, ${B.accentMid}, ${B.accent} 45%, ${B.accentMid} 85%)`};
  }
  const u = t - start;
  const n = plan.slides.length;
  AL = s.align ?? plan.align;
  SHINE = ((u * 28) % 160) - 30;
  const completeCover = starter && idx === 0 && s.layout === 'cover';
  const enterK = plan.composedOpening || completeCover ? 1 : ease(prog(u, 0, 0.35));
  const last = idx === n - 1;
  const P = plan.presenter ? {...plan.presenter, side: s.spriteSide ?? plan.presenter.side, flip: s.spriteFlip ?? plan.presenter.flip} : undefined;
  const showP = !!P && (s.presenter ?? DEFAULT_PRESENTER.includes(s.layout));
  const pIn = plan.composedOpening && !last ? 1 : ease(prog(u, 0.2, 0.6));
  const composedPortrait = plan.composedOpening && showP;
  const ph = 760 * (P?.scale ?? 1);
  const fullPortrait = composedPortrait && plan.fullPortraitLayout;
  const starterPortrait = starter && showP;
  const groundedPortrait = starterPortrait && P?.anchor === 'bottom';
  const usesSprite = starter && !!P?.sprite;
  const sprite = resolveSlideSprite(plan, s);
  const expressionSprite = usesSprite && !!sprite.src?.startsWith('portraits/sprites/face-');
  const renderPresenter = P && (usesSprite ? !!sprite.src : showP);
  const fanBehindPresenter = !contentGrid && starterPortrait && usesSprite && s.layout === 'cover' && s.images.length > 0 && !s.visual;
  const techCover = completeCover && groundedPortrait && plan.style === 'editorial' && P?.side === 'left' && s.items.length > 0 && !s.visual;
  const spriteHeight = 1035 * sprite.scale;
  const portraitWidth = usesSprite ? spriteHeight * 2 / 3 : groundedPortrait ? 764 : starterPortrait ? 740 : fullPortrait ? 660 : composedPortrait ? ph * 0.8 : ph * 0.75;
  const portraitBottom = usesSprite ? (contentGrid ? 55 : 0) : starterPortrait ? 0 : fullPortrait ? 110 : composedPortrait ? -6 : 150;
  const portraitOffset = usesSprite ? 25 : groundedPortrait ? 3 : starterPortrait ? 22 : fullPortrait ? 27 : composedPortrait ? -100 : -30;
  const headlineLines = s.headline.split('\n').length;
  const interiorClearance = dottedDark && !showP && s.layout !== 'status' && s.layout !== 'media' ? 60 : 0;
  const expandedInterior = !!(plan.presenter?.sprite && (interiorClearance || (contentGrid && !showP)) && !['branches', 'cover', 'cta', 'media', 'status'].includes(s.layout) && !(s.layout === 'checklist' && plan.spaciousTech));
  const starterBodyTop = 240 + 83 * (headlineLines - 1) + (s.kicker ? 45 : 0) + interiorClearance;
  const bodyBottom = starterPortrait && last ? 186 : 170;
  const bodyLeft = starterPortrait && P?.side === 'left' ? (contentGrid ? 563 : last ? 565 : 624) : 76;
  const bodyRight = starterPortrait && P?.side === 'right' ? (contentGrid ? 537 : last ? 495 : 530) : 76;
  const slideGraphic = <SlideBody s={s} t={u} th={th} withPresenter={showP} composedOpening={plan.composedOpening || completeCover} starterPortrait={starterPortrait} groundedPortrait={groundedPortrait} spaciousTech={plan.spaciousTech} completeCover={completeCover} headlineAbove={starter} fanBehindPresenter={fanBehindPresenter} expandedInterior={expandedInterior} contentGrid={contentGrid} carouselStyle={plan.style} />;
  const order = contentGrid && s.layerOrder?.length ? slideLayerOrder(s.layerOrder) : undefined;
  const fixedDepth = order ? order.length + 1 : undefined;
  const detached = order?.filter(isIndividualLayer) ?? [];
  const depthRules = order ? [
    '[data-carousel-paint="headline"] [data-carousel-visuals] { visibility: hidden; }',
    '[data-carousel-paint="content"] [data-carousel-headline] { visibility: hidden; }',
    ...detached.map((key) => {
      const target = layerSelector(key);
      // Keep the normal layout in each plane so a moved item retains its transforms and animation.
      return `[data-carousel-slide] ${target} { visibility: hidden; }
        [data-carousel-slide] [data-carousel-paint="${key}"] ${target} { visibility: visible; }`;
    }),
  ].join('\n') : undefined;

  const starterHeadline = (
    <div data-carousel-headline style={{width: s.headlineWidth ?? defaultHeadlineWidth, textAlign: 'center', ...(contentGrid ? {justifySelf: 'center'} : {position: 'absolute', top: 127, left: 125})}}>
      <div style={{marginBottom: s.kicker ? 22 : 0, fontSize: 20, lineHeight: contentGrid ? '27px' : undefined, fontWeight: 700, letterSpacing: 3.5, textTransform: 'uppercase', color: th.muted}}>{s.kicker}</div>
      <div data-carousel-editable-headline style={{transform: s.headlineOffset ? `translate(${s.headlineOffset.x}px, ${s.headlineOffset.y}px)${rotationStyle(s.headlineOffset.rotation)}` : undefined}}>
        <Headline text={s.headline} size={76} th={th} separateParts={contentGrid} />
      </div>
    </div>
  );
  const graphicPosition: React.CSSProperties = contentGrid
    ? {position: 'relative', marginLeft: bodyLeft, marginRight: bodyRight, justifyContent: 'center'}
    : {position: 'absolute', left: bodyLeft, right: bodyRight, top: starter ? starterBodyTop : 190, bottom: bodyBottom, justifyContent: starterPortrait && last ? 'flex-end' : expandedInterior ? 'center' : starter || composedPortrait ? 'flex-start' : 'center'};
  const graphicBody = fullPortrait && P ? <PortraitCopy slide={s} t={u} th={th} side={P.side} /> : (
    <div data-carousel-visuals style={{...graphicPosition, display: 'flex', flexDirection: 'column', textAlign: starterPortrait ? 'left' : AL, opacity: enterK, transform: `translateX(${(1 - enterK) * 70}px)`}}>
      {contentGrid ? (
        <div data-carousel-graphics style={{display: 'flex', flexDirection: 'column', flexShrink: 0, width: '100%', transform: groupTransform(s.graphicPlacement)}}>
          {s.icon && <CarouselIcon icon={s.icon} t={u} seconds={s.seconds} completeCover={completeCover} arriving={plan.slides[idx - 1]?.icon?.src === s.icon.src} departing={plan.slides[idx + 1]?.icon?.src === s.icon.src} />}
          {slideGraphic}
        </div>
      ) : slideGraphic}
      {starter ? <AbsoluteFill data-carousel-group-member style={{top: -146, bottom: 0, pointerEvents: 'none', transform: contentGrid ? groupTransform(s.graphicPlacement) : undefined, transformOrigin: '50% calc(50% + 73px)'}}><Annotations notes={s.notes} t={u} /></AbsoluteFill> : <Annotations notes={s.notes} t={u} />}
    </div>
  );
  const grid = (
    <div style={{position: 'absolute', top: 127, bottom: 118, left: 0, right: 0, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', rowGap: 32}}>
      {starterHeadline}
      {graphicBody}
    </div>
  );
  const coverArt = techCover && <TechCoverArtwork t={u} placement={contentGrid ? s.graphicPlacement : undefined} />;
  const presenterVisual = renderPresenter && P && (
    <div data-carousel-sprite={usesSprite || undefined} style={{position: 'absolute', bottom: portraitBottom, [P.side]: portraitOffset, width: portraitWidth, height: usesSprite ? spriteHeight : groundedPortrait ? 960 : starterPortrait ? 940 : ph, opacity: completeCover ? 1 : pIn, transform: usesSprite ? `translate(${sprite.x}px, ${sprite.y + 3 * Math.sin(u * 1.2)}px)${rotationStyle(sprite.rotation)}` : groundedPortrait ? undefined : `translate(${composedPortrait ? (1 - pIn) * 28 - 5 * Math.sin(u * 0.8) : 0}px, ${(1 - pIn) * 24 - 4 * Math.sin(u * 0.7)}px)`}}>
      {!expressionSprite && <div style={{position: 'absolute', left: '10%', right: '10%', top: '20%', bottom: '5%', borderRadius: '50%', background: `radial-gradient(circle, ${hexA(composedPortrait || starterPortrait ? CHARCOAL : B.accent, 0.35 + 0.15 * Math.sin(u * 1.6))}, transparent 70%)`, filter: 'blur(30px)', transform: `scale(${1 + 0.05 * Math.sin(u * 1.6)})`}} />}
      <Img src={staticFile(usesSprite ? sprite.src! : P.src)} style={{position: 'absolute', ...(expressionSprite ? {left: '16%', top: '9%', width: '68%', aspectRatio: '1'} : {inset: 0, width: '100%', height: '100%'}), objectFit: 'contain', objectPosition: 'bottom', maskImage: !expressionSprite && starterPortrait && !groundedPortrait ? 'linear-gradient(black 86%, transparent 100%)' : undefined, transform: (usesSprite ? sprite.flip : P.flip) ? 'scaleX(-1)' : undefined, filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.55))'}} />
    </div>
      );
  const footer = (
    <div data-carousel-footer style={{position: 'absolute', bottom: 34, left: 65, right: 65, height: 52, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center'}}>
      {B.logo ? <Img src={staticFile(B.logo)} style={{width: 120, height: 52, objectFit: 'contain', objectPosition: 'left center'}} /> : <span />}
      <span style={{justifySelf: 'center', fontWeight: 700, fontSize: 24, color: th.ink, textShadow: groundedPortrait ? '0 1px 3px #000, 0 1px 6px #000' : undefined}}>{plan.link}</span>
      {!last && (
        <span data-carousel-swipe style={{justifySelf: 'end', display: 'inline-flex', alignItems: 'center', gap: 10, color: marble ? B.accent : B.metalLight, fontWeight: 700, fontSize: 24, letterSpacing: 1.4, textTransform: 'uppercase', textShadow: marble ? undefined : '0 1px 4px #000'}}>
          Swipe
          <svg {...editable('swipe-arrow', 'Footer swipe arrow')} width={28} height={24} viewBox="0 0 28 24" fill="none" aria-hidden="true" style={{pointerEvents: 'auto'}}>
            <path d="M2 12h22m-8-8 8 8-8 8" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </div>
  );
  return (
    <AbsoluteFill data-carousel-slide style={{background: th.bg, fontFamily: sans, overflow: 'hidden'}}>
      {depthRules && <style>{depthRules}</style>}
      {s.elementOffsets && <style>{Object.entries(s.elementOffsets).map(([id, offset]) =>
        `[data-carousel-slide] [data-carousel-item="${id}"] { translate: ${offset.x}px ${offset.y}px; ${offset.rotation ? `rotate: ${offset.rotation}deg; transform-box: fill-box; transform-origin: center;` : ''} }`,
      ).join('\n')}</style>}
      <svg width={1080} height={1350} style={{position: 'absolute', opacity: plan.style === 'clean' ? 0.04 : 0.07}}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      {marble && <Img src={staticFile('backdrops/beta10-white-marble.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.46}} />}
      {!marble && plan.background && (
        <AbsoluteFill>
          <Img src={staticFile(plan.background.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: plan.background.drift ? `scale(${1.06 + 0.03 * Math.sin(t * 0.18)}) translate(${8 * Math.sin(t * 0.11)}px, ${6 * Math.cos(t * 0.13)}px)` : undefined}} />
          <AbsoluteFill style={{background: `rgba(0,0,0,${plan.background.dim})`}} />
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.45))'}} />
        </AbsoluteFill>
      )}
      {(plan.fullPortraitLayout || starter) && !marble && (
        <AbsoluteFill style={{
          backgroundImage: `radial-gradient(circle, ${hexA(B.metalLight, 0.33)} 1.15px, transparent 1.55px), radial-gradient(ellipse at 37% 66%, ${hexA(CHARCOAL, 0.65)}, transparent 70%)`,
          backgroundSize: '24px 24px, 100% 100%',
          backgroundPosition: `0 ${2 * Math.sin(u * 0.65)}px, center`,
        }} />
      )}
      {fullPortrait && P && (
        <svg width={1080} height={1350} style={{position: 'absolute'}}>
          <path d={P.side === 'left' ? 'M82 419 H294 L349 474 H510 M397 852 H573 L647 926 H1009' : 'M998 419 H786 L731 474 H570 M683 852 H507 L433 926 H71'} fill="none" stroke={hexA(B.metalLight, 0.38)} strokeWidth={2} />
          <path d={P.side === 'left' ? 'M397 852 H573 L647 926 H1009' : 'M683 852 H507 L433 926 H71'} fill="none" stroke={B.metalLight} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(prog(u, 0.4, 1.65))} />
        </svg>
      )}
      {plan.style === 'glass' && <GlassLight t={t} restrained={starter} />}
      {!marble && !plan.composedOpening && <Ambient t={t} style={plan.style} contentGrid={contentGrid} />}
      {coverArt}
      {plan.style === 'luxe' && <div style={{position: 'absolute', left: 40, right: 40, top: 40, bottom: 40, border: `1px solid ${hexA(B.metal, 0.35)}`, borderRadius: 8}} />}
      {fanBehindPresenter && (
        <div style={{position: 'absolute', left: P?.side === 'left' ? 552 : 76, top: starterBodyTop + (contentGrid ? 180 : 226), width: 490, transform: 'scale(0.81)', transformOrigin: 'left top'}}>
          <CoverFan images={s.images} t={u} compact complete={completeCover} />
        </div>
      )}
      {P?.sprite && s.spriteAccent && (
        <Img src={staticFile(P.src)} style={{position: 'absolute', ...s.spriteAccent, height: s.spriteAccent.width * 1.5, objectFit: 'contain', opacity: prog(u, 1.6, 0.4), transform: `translateY(${(1 - ease(prog(u, 1.6, 0.4))) * 16}px) scaleX(${P.flip ? -1 : 1})`}} />
      )}
      {!order && presenterVisual}
      {starter ? (
        <div style={{position: 'absolute', top: 45, left: 67, right: 67, zIndex: fixedDepth, display: 'flex', justifyContent: 'space-between', fontSize: 19, fontWeight: 700, letterSpacing: 1.1, color: th.muted}}>
          <span>{B.header}</span>
          <span>{String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        </div>
      ) : <div style={{position: 'absolute', top: 58, left: 76, right: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {B.logo ? <Img src={staticFile(B.logo)} style={{height: 52, maxWidth: 220, objectFit: 'contain'}} /> : <span style={{fontFamily: serif, fontSize: 30, color: th.ink}}>{B.name}</span>}
        {plan.series && <span style={{fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: th.muted}}>{plan.series}</span>}
        <span style={{fontSize: 22, letterSpacing: 3, color: HI}}>{String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
      </div>}
      {starter && !contentGrid && starterHeadline}
      {!starter && <div style={{position: 'absolute', top: 140, left: 76, width: 70 + 40 * Math.sin((Math.min(1, u) * Math.PI) / 2), height: 5, background: B.accent}} />}
      {order ? order.map((key, index) => (
        <div key={key} data-carousel-paint={key} style={{position: 'absolute', inset: 0, zIndex: index + 1, visibility: isIndividualLayer(key) ? 'hidden' : undefined}}>
          {key === 'sprite' ? presenterVisual
            : key === 'item:swipe-arrow' ? footer
            : key === 'item:cover-connector' ? coverArt
            : grid}
        </div>
      )) : contentGrid ? grid : graphicBody}
      {starterPortrait && !groundedPortrait && <AbsoluteFill style={{top: 'auto', height: 185, zIndex: fixedDepth, pointerEvents: 'none', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'}} />}
      {starter ? (order ? <div style={{position: 'absolute', inset: 0, zIndex: fixedDepth, pointerEvents: 'none'}}>{footer}</div> : footer) : <div style={{position: 'absolute', bottom: 64, left: 76, right: 76, borderTop: `1px solid ${th.rule}`, paddingTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...(composedPortrait && !fullPortrait ? {right: 730} : {})}}>
        <div style={{display: 'flex', gap: 10}}>
          {plan.slides.map((_, i) => <div key={i} style={{width: i === idx ? 34 : 10, height: 10, borderRadius: 5, background: i === idx ? B.metal : th.rule}} />)}
        </div>
        {plan.link && <span style={{fontSize: 22, letterSpacing: 1, color: th.muted}}>{plan.link}</span>}
        <span style={{fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: th.muted, display: composedPortrait ? 'none' : undefined, opacity: last ? 0 : 1, transform: `translateX(${4 * Math.sin(u * 3)}px)`}}>Swipe →</span>
      </div>}
      {plan.music && <Audio src={staticFile(plan.music.src)} volume={(f) => plan.music!.volume * Math.min(1, f / (plan.fullPortraitLayout || starter ? fps : 15))} />}
    </AbsoluteFill>
  );
};
