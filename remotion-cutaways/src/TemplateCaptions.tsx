import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import {brand} from './brand';
import {handFamily, heavyFamily, sansFamily, serifFamily} from './fonts';
import {fxRange} from './fx/util';
import {metalTextStyle} from './metal';
import type {ScenePlan} from './schema';
import {normalizeWord} from './ui';

/**
 * Caption styles that belong to the talking-head templates.
 *  quiet     Quiet Authority: one calm sentence-case line, emphasis words in metallic serif italic
 *  magazine  Magazine: serif italic pull-quote on a paper slab between metal rules
 *  glass     Glass Lab: a dark glass panel
 *  tape      Scrapbook: black and white label-tape strips, the key word handwritten
 *  ticker    The Analyst: a data bar with an accent block, numbers in metal
 *  film      Cinematic: small, spaced film subtitles
 *  punch     Creator Hype: one or two huge condensed words that pop
 *  karaoke   Teach Board: the word being said sits in a box
 *
 * Two rules hold for every style (Dr. CK, Nov 13 2026):
 *  1. Each word appears only when she says it (a hair early, to match the avatar's mouth). Words still to come are
 *     not shown; their space is kept so nothing reflows.
 *  2. A word that is already written on screen at that moment (a graphic, an effect, the end card) is not captioned,
 *     so viewers never read the same words twice. Short words drop with it when the words around them are dropped.
 */
export const TEMPLATE_CAPTION_STYLES = ['quiet', 'magazine', 'glass', 'tape', 'ticker', 'film', 'punch', 'karaoke'] as const;
export type TemplateCaptionStyle = (typeof TEMPLATE_CAPTION_STYLES)[number];
export const isTemplateCaption = (s: string): s is TemplateCaptionStyle => (TEMPLATE_CAPTION_STYLES as readonly string[]).includes(s);

type Word = {text: string; start: number; end: number; hidden?: boolean};
type Phrase = {words: Word[]; start: number; end: number};

const LEAD = 0.06;
const CONNECT = new Set('a an the of to in on at for and or but nor so who whom whose that which when where while with by from as my your our their his her its this these those is are was were be been do does did if than i we you they it'.split(' '));
const isConn = (w: Word) => CONNECT.has(normalizeWord(w.text));

/** Phrases of at most `max` words: break after punctuation or a pause, and never end a phrase on a connector word. */
export const toPhrases = (ws: Word[], max: number): Phrase[] => {
  const out: Phrase[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
    cur = [];
  };
  ws.forEach((w, i) => {
    cur.push(w);
    const next = ws[i + 1];
    const punct = /[.?!,;:]$/.test(w.text);
    const gap = next ? next.start - w.end : 9;
    if (cur.length >= max || (punct && cur.length >= Math.min(2, max)) || gap > 0.45 || /[.?!]$/.test(w.text)) {
      const carry: Word[] = [];
      // carry a trailing connector into the next phrase, but never across a pause
      while (cur.length > 1 && isConn(cur[cur.length - 1]) && next && !punct && gap <= 0.45) carry.unshift(cur.pop() as Word);
      flush();
      cur = carry;
    }
  });
  flush();
  return out;
};

/** Text that is written on screen, with the seconds it is visible. */
type Shown = {start: number; end: number; words: Set<string>};
const SKIP_KEYS = new Set(['src', 'media', 'video', 'look', 'face', 'side', 'kind', 'target', 'mode', 'color', 'position', 'tone', 'plate', 'tilt', 'from', 'blend', 'sfx', 'type', 'skin', 'images']);
const wordsOf = (v: unknown, out: Set<string>) => {
  if (typeof v === 'string') v.split(/[\s|/\n]+/).forEach((w) => normalizeWord(w) && (out.add(normalizeWord(w)), out.add(key(w))));
  else if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 10) out.add(String(v));
  else if (Array.isArray(v)) v.forEach((x) => wordsOf(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP_KEYS.has(k)) wordsOf(x, out);
};
/** Items with their own `at` (chips, steps, lines, notes) count from their own second; the rest from the graphic's start. */
const collect = (props: unknown, start: number, end: number, out: Shown[]) => {
  const loose = new Set<string>();
  const walk = (v: unknown, key = '') => {
    if (SKIP_KEYS.has(key)) return;
    if (Array.isArray(v)) return v.forEach((x) => walk(x));
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      const own = typeof o.at === 'number' ? o.at : typeof o.knockAt === 'number' ? (o.knockAt as number) - 3 : undefined;
      if (own !== undefined && key !== 'props') {
        const s = new Set<string>();
        wordsOf(o, s);
        out.push({start: Math.max(start, own), end, words: s});
        return;
      }
      for (const [k, x] of Object.entries(o)) walk(x, k);
      return;
    }
    if (typeof v === 'string') wordsOf(v, loose);
    else if (key === 'value' && typeof v === 'number') wordsOf(v, loose);
  };
  walk(props, 'props');
  if (loose.size) out.push({start, end, words: loose});
};
export const onScreenText = (plan: ScenePlan): Shown[] => {
  const out: Shown[] = [];
  for (const sc of plan.scenes) {
    if (sc.tag) collect(sc.tag, Math.min(...sc.segments.map((s) => s.start)), Math.max(...sc.segments.map((s) => s.end)), out);
    for (const sg of sc.segments) for (const g of sg.graphics) collect(g.props, g.at, g.until ?? sg.end, out);
  }
  for (const f of plan.fx) {
    const [a, b] = fxRange(f);
    collect(f.props, a, b, out);
  }
  if (plan.endCard) collect(plan.endCard, plan.endCard.startAt, plan.durationSec, out);
  return out;
};

const NUM: Record<string, string> = {one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10'};
const key = (w: string) => {
  const n = normalizeWord(w);
  return NUM[n] ?? n;
};

/**
 * Marks caption words that are already written on screen when they are said. A run of two or more such words is
 * dropped; a single word is dropped only when it went up on screen within a second of her saying it (so a label
 * left over from earlier never eats a lone word out of a sentence). Short words drop only inside a dropped run.
 */
export const markEchoes = (ws: Word[], shown: Shown[]) => {
  const hits = ws.map((w) => shown.filter((s) => w.start >= s.start - 0.3 && w.start <= s.end && (s.words.has(key(w.text)) || s.words.has(normalizeWord(w.text)))));
  const cand = hits.map((h) => h.length > 0);
  const content = (i: number) => !!ws[i] && !CONNECT.has(normalizeWord(ws[i].text));
  return ws.map((w, i) => {
    if (!cand[i]) return w;
    const inRun = !!cand[i - 1] || !!cand[i + 1];
    const synced = hits[i].some((s) => w.start - s.start <= 1.0);
    if (inRun || (content(i) && synced)) return {...w, hidden: true};
    return w;
  });
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const TemplateCaptionLayer: React.FC<{captions: Caption[]; plan: ScenePlan; mood: 'dark' | 'light'}> = ({captions, plan, mood}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const style = plan.captionStyle as TemplateCaptionStyle;
  const max = {quiet: 6, magazine: 5, glass: 5, tape: 3, ticker: 6, film: 7, punch: 2, karaoke: 6}[style];
  const phrases = useMemo(() => {
    const ws: Word[] = captions.map((c) => ({text: c.text.trim(), start: c.startMs / 1000, end: c.endMs / 1000})).filter((w) => w.text);
    const marked = markEchoes(ws, onScreenText(plan));
    // phrases are built from the words that are actually captioned
    return toPhrases(marked.filter((w) => !w.hidden), max);
  }, [captions, plan, max]);
  const i = phrases.findIndex((p, k) => t >= p.start - LEAD && t < (phrases[k + 1] ? Math.min(phrases[k + 1].start - LEAD, p.end + 0.7) : p.end + 0.7));
  if (i < 0) return null;
  const p = phrases[i];
  const since = t - (p.start - LEAD);
  const seg = plan.scenes.flatMap((s) => s.segments).find((s) => t >= s.start && t < s.end);
  const top = seg?.captionPos === 'top';
  const emph = new Set(plan.emphasis.map(normalizeWord));
  const isEm = (w: Word) => emph.has(normalizeWord(w.text));
  const ink = mood === 'light' ? '#111111' : '#FFFFFF';
  const sans = sansFamily(plan.theme.sans);
  const metal = (seed: number): React.CSSProperties => ({...metalTextStyle({kind: 'rose', variant: mood === 'light' ? 'deep' : 'bright', frame, seed}), paddingRight: '0.08em'});
  /** 0 before the word is said, rising to 1 over a few frames as she says it */
  const on = (w: Word, d = 0.12) => interpolate(t - (w.start - LEAD), [0, d], [0, 1], clamp);
  const rise = (w: Word, px = 18): React.CSSProperties => {
    const k = on(w);
    return {opacity: k, display: 'inline-block', transform: `translateY(${(1 - k) * px}px)`};
  };
  const yBand = seg?.captionY ?? (top ? 400 : 1260);
  const fadeOut = interpolate(t - p.end, [0.45, 0.7], [1, 0], clamp);
  const shadow = mood === 'light' ? 'none' : '0 3px 18px rgba(0,0,0,0.7)';
  const sp = (k: number) => (k ? ' ' : '');

  if (style === 'quiet') {
    return (
      <div style={{position: 'absolute', left: 120, width: 840, top: yBand - 70, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: fadeOut}}>
        <div style={{fontFamily: sans, fontWeight: 500, fontSize: 50, lineHeight: 1.28, color: ink, textShadow: shadow}}>
          {p.words.map((w, k) => (
            <React.Fragment key={k}>
              {sp(k)}
              <span style={{...rise(w, 10), ...(isEm(w) ? {fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 700, fontSize: 58, ...metal(k)} : {})}}>{w.text}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'magazine') {
    const rule = interpolate(since, [0, 0.35], [0, 1], clamp);
    return (
      <div style={{position: 'absolute', left: 80, width: 840, top: (seg?.captionY ?? (top ? 400 : 1385)) - 100, padding: '22px 34px', boxSizing: 'border-box', background: mood === 'light' ? 'rgba(255,255,255,0.96)' : 'rgba(10,10,10,0.9)', boxShadow: '0 18px 40px rgba(0,0,0,0.35)', opacity: interpolate(since, [0, 0.15], [0, 1], clamp) * fadeOut}}>
        <div style={{height: 2, width: `${rule * 100}%`, ...metalLine(frame)}} />
        <div style={{padding: '14px 0 16px', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 64, lineHeight: 1.08, color: ink}}>
          {p.words.map((w, k) => {
            const r = on(w, 0.22);
            return (
              <span key={k} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.24em'}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - r) * 105}%)`, ...(isEm(w) ? {color: brand.crimson, fontWeight: 800} : {})}}>{w.text}</span>
              </span>
            );
          })}
        </div>
        <div style={{height: 2, width: `${rule * 60}%`, ...metalLine(frame)}} />
      </div>
    );
  }

  if (style === 'glass') {
    const s = spring({frame: Math.round(since * fps), fps, config: {damping: 18, mass: 0.6}});
    return (
      <div style={{position: 'absolute', left: 0, right: 0, top: yBand - 80, display: 'flex', justifyContent: 'center', opacity: Math.min(1, s * 2) * fadeOut, transform: `translateY(${(1 - s) * 24}px)`}}>
        <div style={{maxWidth: 860, padding: '24px 40px', borderRadius: 30, background: 'linear-gradient(135deg, rgba(30,32,40,0.78), rgba(12,12,16,0.62))', border: '1.5px solid rgba(255,220,205,0.38)', boxShadow: '0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)', textAlign: 'center'}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 54, lineHeight: 1.2, color: '#FFFFFF'}}>
            {p.words.map((w, k) => (
              <React.Fragment key={k}>
                {sp(k)}
                <span style={{...rise(w, 0), filter: `blur(${(1 - on(w, 0.18)) * 8}px)`, ...(isEm(w) ? metal(k) : {})}}>{w.text}</span>
              </React.Fragment>
            ))}
          </span>
        </div>
      </div>
    );
  }

  if (style === 'tape') {
    return (
      <div style={{position: 'absolute', left: 90, right: 150, top: yBand - 110, height: 220, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '10px 14px', opacity: fadeOut}}>
        {p.words.map((w, k) => {
          const s = spring({frame: Math.round((t - (w.start - LEAD)) * fps), fps, config: {damping: 14, mass: 0.5}});
          const vis = t >= w.start - LEAD ? 1 : 0;
          const rot = (((i * 7 + k * 13) % 7) - 3) * 1.1;
          const dark = (i + k) % 2 === 1;
          const base: React.CSSProperties = {transform: `rotate(${rot}deg) scale(${1.3 - 0.3 * s})`, opacity: vis * Math.min(1, s * 1.4), boxShadow: '0 8px 18px rgba(0,0,0,0.35)'};
          if (isEm(w))
            return (
              <span key={k} style={{...base, fontFamily: handFamily, fontWeight: 700, fontSize: 104, lineHeight: 1, color: brand.crimson, background: '#FFFFFF', padding: '0 22px 6px'}}>
                {w.text}
              </span>
            );
          return (
            <span key={k} style={{...base, fontFamily: sans, fontWeight: 800, fontSize: 54, letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.1, color: dark ? '#FFFFFF' : '#111111', background: dark ? '#111111' : '#FFFFFF', padding: '8px 18px 6px', clipPath: 'polygon(0 4%, 3% 0, 97% 2%, 100% 0, 99% 96%, 96% 100%, 2% 98%, 0 100%)'}}>
              {w.text}
            </span>
          );
        })}
      </div>
    );
  }

  if (style === 'ticker') {
    const slide = interpolate(since, [0, 0.25], [-60, 0], clamp);
    const num = (w: Word) => /\d|^(one|two|three|four|five|six|seven|eight|nine|ten)\W*$/i.test(w.text);
    return (
      <div style={{position: 'absolute', left: 70, width: 860, top: yBand - 50, display: 'flex', alignItems: 'stretch', opacity: interpolate(since, [0, 0.15], [0, 1], clamp) * fadeOut, transform: `translateX(${slide}px)`}}>
        <div style={{width: 14, background: brand.crimson, borderRadius: '4px 0 0 4px'}} />
        <div style={{flex: 1, padding: '20px 28px', background: 'rgba(10,11,13,0.86)', borderRadius: '0 6px 6px 0', fontFamily: sans, fontWeight: 700, fontSize: 44, letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 1.25, color: '#FFFFFF'}}>
          {p.words.map((w, k) => (
            <React.Fragment key={k}>
              {sp(k)}
              <span style={{opacity: t >= w.start - LEAD ? 1 : 0, ...(num(w) || isEm(w) ? metal(k) : {})}}>{w.text}</span>
            </React.Fragment>
          ))}
          <span style={{display: 'inline-block', width: 4, height: 40, marginLeft: 8, verticalAlign: 'middle', background: brand.crimson, opacity: Math.floor(t * 3) % 2 ? 0.15 : 1}} />
        </div>
      </div>
    );
  }

  if (style === 'film') {
    return (
      <div style={{position: 'absolute', left: 110, width: 860, top: (seg?.captionY ?? (top ? 330 : 1400)) - 30, textAlign: 'center', opacity: fadeOut}}>
        <span style={{fontFamily: sans, fontWeight: 500, fontSize: 42, letterSpacing: 0.6, lineHeight: 1.35, color: '#F7F7F7', textShadow: '0 2px 6px rgba(0,0,0,0.9)', background: 'rgba(8,8,10,0.55)', padding: '6px 18px', borderRadius: 10, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
          {p.words.map((w, k) => (
            <React.Fragment key={k}>
              {sp(k)}
              <span style={{opacity: on(w, 0.2)}}>{w.text}</span>
            </React.Fragment>
          ))}
        </span>
      </div>
    );
  }

  if (style === 'punch') {
    // one or two words at a time: the block is the words she has said so far in this phrase
    const said = p.words.filter((w) => t >= w.start - LEAD);
    const last = said[said.length - 1];
    if (!last) return null;
    const s = spring({frame: Math.round((t - (last.start - LEAD)) * fps), fps, config: {damping: 11, mass: 0.45, stiffness: 220}});
    const rot = i % 2 ? 2.5 : -2.5;
    const txt = p.words.map((w) => w.text).join(' ');
    return (
      <div style={{position: 'absolute', left: 60, right: 130, top: (seg?.captionY ?? (top ? 470 : 1180)) - 130, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rot}deg) scale(${0.55 + 0.45 * s})`, opacity: Math.min(1, s * 1.5) * fadeOut}}>
        <span style={{fontFamily: heavyFamily, fontSize: txt.length > 12 ? 128 : 160, lineHeight: 0.95, textTransform: 'uppercase', textAlign: 'center', color: '#FFFFFF', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.55)'}}>
          {p.words.map((w, k) => (
            <React.Fragment key={k}>
              {sp(k)}
              <span style={{opacity: t >= w.start - LEAD ? 1 : 0, ...(isEm(w) ? {...metal(k), WebkitTextStroke: '0px'} : {})}}>{w.text.replace(/[,.;:]$/, '')}</span>
            </React.Fragment>
          ))}
        </span>
      </div>
    );
  }

  // karaoke: words appear as said, and the word being said sits in a box
  return (
    <div style={{position: 'absolute', left: 100, width: 860, top: yBand - 80, textAlign: 'center', opacity: fadeOut}}>
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 56, lineHeight: 1.5, color: ink, textShadow: shadow}}>
        {p.words.map((w, k) => {
          const cur = t >= w.start - LEAD && t < (p.words[k + 1]?.start ?? p.end + 0.5) - LEAD;
          return (
            <React.Fragment key={k}>
              {sp(k)}
              <span style={{opacity: t >= w.start - LEAD ? 1 : 0, padding: '2px 12px', borderRadius: 10, background: cur ? (mood === 'light' ? '#111111' : '#FFFFFF') : 'transparent', color: cur ? (mood === 'light' ? '#FFFFFF' : '#111111') : ink, textShadow: cur ? 'none' : undefined}}>{w.text}</span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const metalLine = (frame: number): React.CSSProperties => {
  const s = metalTextStyle({kind: 'rose', variant: 'bright', frame, seed: 3});
  return {backgroundImage: s.backgroundImage, backgroundSize: s.backgroundSize, backgroundPosition: s.backgroundPosition};
};
