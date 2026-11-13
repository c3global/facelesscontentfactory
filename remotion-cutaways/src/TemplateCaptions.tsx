import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import {brand} from './brand';
import {handFamily, heavyFamily, sansFamily, serifFamily} from './fonts';
import {metalTextStyle} from './metal';
import type {ScenePlan} from './schema';
import {normalizeWord} from './ui';

/**
 * Caption styles that belong to the talking-head templates. Each template reads differently at a glance:
 *  quiet     Quiet Authority: one calm sentence-case line, emphasis words in metallic serif italic
 *  magazine  Magazine: serif italic pull-quote lines between two drawn rules, left aligned
 *  glass     Glass Lab: a dark glass panel; words light up as they are spoken
 *  tape      Scrapbook: words on black and white label-tape strips, the key word handwritten
 *  ticker    The Analyst: a data bar with an accent block; words type on, numbers in metal
 *  film      Cinematic: film subtitles, small and spaced, fading by sentence
 *  punch     Creator Hype: one or two words at a time, huge condensed caps that pop
 *  karaoke   Teach Board: a two-line phrase; the word being said sits in a white box
 * Colors come from the brand (crimson accent, metal); text is white on dark scenes and black on light ones.
 */
export const TEMPLATE_CAPTION_STYLES = ['quiet', 'magazine', 'glass', 'tape', 'ticker', 'film', 'punch', 'karaoke'] as const;
export type TemplateCaptionStyle = (typeof TEMPLATE_CAPTION_STYLES)[number];
export const isTemplateCaption = (s: string): s is TemplateCaptionStyle => (TEMPLATE_CAPTION_STYLES as readonly string[]).includes(s);

type Word = {text: string; start: number; end: number};
type Phrase = {words: Word[]; start: number; end: number};

const CONNECT = new Set('a an the of to in on at for and or but nor so who whom whose that which when where while with by from as my your our their his her its this these those is are was were be been do does did if than i we you they'.split(' '));
const isConn = (w: Word) => CONNECT.has(normalizeWord(w.text));

/** Phrases of at most `max` words: break after punctuation or a pause, and never end a phrase on a connector word. */
export const toPhrases = (caps: Caption[], max: number): Phrase[] => {
  const ws: Word[] = caps.map((c) => ({text: c.text.trim(), start: c.startMs / 1000, end: c.endMs / 1000})).filter((w) => w.text);
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
      // never end on a connector: carry it into the next phrase
      const carry: Word[] = [];
      while (cur.length > 1 && isConn(cur[cur.length - 1]) && next && !punct) carry.unshift(cur.pop() as Word);
      flush();
      cur = carry;
    }
  });
  flush();
  return out;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const TemplateCaptionLayer: React.FC<{captions: Caption[]; plan: ScenePlan; mood: 'dark' | 'light'}> = ({captions, plan, mood}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const style = plan.captionStyle as TemplateCaptionStyle;
  const max = {quiet: 7, magazine: 5, glass: 5, tape: 3, ticker: 6, film: 8, punch: 2, karaoke: 7}[style];
  const phrases = useMemo(() => toPhrases(captions, max), [captions, max]);
  const i = phrases.findIndex((p, k) => t >= p.start - 0.05 && t < (phrases[k + 1] ? Math.min(phrases[k + 1].start - 0.05, p.end + 0.8) : p.end + 0.8));
  if (i < 0) return null;
  const p = phrases[i];
  const since = t - p.start;
  const seg = plan.scenes.flatMap((s) => s.segments).find((s) => t >= s.start && t < s.end);
  const top = seg?.captionPos === 'top';
  const emph = new Set(plan.emphasis.map(normalizeWord));
  const isEm = (w: Word) => emph.has(normalizeWord(w.text));
  const ink = mood === 'light' ? '#111111' : '#FFFFFF';
  const sans = sansFamily(plan.theme.sans);
  const metal = (seed: number): React.CSSProperties => ({...metalTextStyle({kind: 'rose', variant: mood === 'light' ? 'deep' : 'bright', frame, seed}), paddingRight: '0.08em'});
  const said = (w: Word) => t >= w.start - 0.03;
  const yBand = top ? 400 : 1260;
  const fadeIn = interpolate(since, [0, 0.18], [0, 1], clamp);
  const shadow = mood === 'light' ? 'none' : '0 3px 18px rgba(0,0,0,0.65)';

  if (style === 'quiet') {
    return (
      <div style={{position: 'absolute', left: 120, width: 840, top: yBand - 70, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: fadeIn}}>
        <div style={{fontFamily: sans, fontWeight: 500, fontSize: 48, lineHeight: 1.28, color: ink, textShadow: shadow}}>
          {p.words.map((w, k) => (
            <span key={k} style={isEm(w) ? {fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 700, fontSize: 56, ...metal(k)} : undefined}>
              {k ? ' ' : ''}
              {w.text}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (style === 'magazine') {
    const rule = interpolate(since, [0, 0.35], [0, 1], clamp);
    return (
      <div style={{position: 'absolute', left: 80, width: 840, top: (top ? 400 : 1385) - 100, padding: '22px 34px', boxSizing: 'border-box', background: mood === 'light' ? 'rgba(255,255,255,0.96)' : 'rgba(10,10,10,0.9)', boxShadow: '0 18px 40px rgba(0,0,0,0.35)', opacity: fadeIn}}>
        <div style={{height: 2, width: `${rule * 100}%`, ...metalLine(frame)}} />
        <div style={{padding: '14px 0 16px', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 64, lineHeight: 1.08, color: ink}}>
          {p.words.map((w, k) => {
            const r = interpolate(t - w.start, [-0.05, 0.22], [0, 1], clamp);
            return (
              <span key={k} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', marginRight: '0.24em'}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - r) * 100}%)`, ...(isEm(w) ? {color: brand.crimson, fontWeight: 800} : {})}}>{w.text}</span>
              </span>
            );
          })}
        </div>
        <div style={{height: 2, width: `${rule * 60}%`, ...metalLine(frame)}} />
      </div>
    );
  }

  if (style === 'glass') {
    const rise = spring({frame: Math.round(since * fps), fps, config: {damping: 18, mass: 0.6}});
    return (
      <div style={{position: 'absolute', left: 0, right: 0, top: yBand - 80, display: 'flex', justifyContent: 'center', opacity: fadeIn, transform: `translateY(${(1 - rise) * 24}px)`}}>
        <div style={{maxWidth: 860, padding: '24px 40px', borderRadius: 30, background: 'linear-gradient(135deg, rgba(30,32,40,0.78), rgba(12,12,16,0.62))', border: '1.5px solid rgba(255,220,205,0.38)', boxShadow: '0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)', textAlign: 'center'}}>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 52, lineHeight: 1.2}}>
            {p.words.map((w, k) => (
              <span key={k} style={said(w) ? (isEm(w) ? metal(k) : {color: '#FFFFFF'}) : {color: 'rgba(255,255,255,0.32)'}}>
                {k ? ' ' : ''}
                {w.text}
              </span>
            ))}
          </span>
        </div>
      </div>
    );
  }

  if (style === 'tape') {
    return (
      <div style={{position: 'absolute', left: 90, right: 150, top: yBand - 110, height: 220, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '10px 14px'}}>
        {p.words.map((w, k) => {
          const s = spring({frame: Math.round((t - w.start) * fps), fps, config: {damping: 14, mass: 0.5}});
          if (t < w.start - 0.03) return null;
          const rot = (((i * 7 + k * 13) % 7) - 3) * 1.1;
          const dark = (i + k) % 2 === 1;
          if (isEm(w))
            return (
              <span key={k} style={{fontFamily: handFamily, fontWeight: 700, fontSize: 104, lineHeight: 1, color: brand.crimson, background: '#FFFFFF', padding: '0 22px 6px', transform: `rotate(${rot}deg) scale(${1.3 - 0.3 * s})`, boxShadow: '0 8px 18px rgba(0,0,0,0.35)', opacity: s}}>
                {w.text}
              </span>
            );
          return (
            <span key={k} style={{fontFamily: sans, fontWeight: 800, fontSize: 54, letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.1, color: dark ? '#FFFFFF' : '#111111', background: dark ? '#111111' : '#FFFFFF', padding: '8px 18px 6px', transform: `rotate(${rot}deg) scale(${1.3 - 0.3 * s})`, boxShadow: '0 6px 14px rgba(0,0,0,0.35)', opacity: s, clipPath: 'polygon(0 4%, 3% 0, 97% 2%, 100% 0, 99% 96%, 96% 100%, 2% 98%, 0 100%)'}}>
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
      <div style={{position: 'absolute', left: 70, width: 860, top: yBand - 50, display: 'flex', alignItems: 'stretch', opacity: fadeIn, transform: `translateX(${slide}px)`}}>
        <div style={{width: 14, background: brand.crimson, borderRadius: '4px 0 0 4px'}} />
        <div style={{flex: 1, padding: '20px 28px', background: 'rgba(10,11,13,0.86)', borderRadius: '0 6px 6px 0', fontFamily: sans, fontWeight: 700, fontSize: 44, letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 1.25, color: '#FFFFFF'}}>
          {p.words.filter(said).map((w, k) => (
            <span key={k} style={num(w) || isEm(w) ? metal(k) : undefined}>
              {k ? ' ' : ''}
              {w.text}
            </span>
          ))}
          <span style={{display: 'inline-block', width: 4, height: 40, marginLeft: 8, verticalAlign: 'middle', background: brand.crimson, opacity: Math.floor(t * 3) % 2 ? 0.15 : 1}} />
        </div>
      </div>
    );
  }

  if (style === 'film') {
    const out = interpolate(t - p.end, [0.4, 0.75], [1, 0], clamp);
    return (
      <div style={{position: 'absolute', left: 110, width: 860, top: top ? 330 : 1420, textAlign: 'center', opacity: fadeIn * out}}>
        <span style={{fontFamily: sans, fontWeight: 400, fontSize: 40, letterSpacing: 0.6, lineHeight: 1.35, color: '#F4F4F4', textShadow: '0 2px 6px rgba(0,0,0,0.9)'}}>{p.words.map((w) => w.text).join(' ')}</span>
      </div>
    );
  }

  if (style === 'punch') {
    const s = spring({frame: Math.round(since * fps), fps, config: {damping: 11, mass: 0.45, stiffness: 220}});
    const rot = i % 2 ? 2.5 : -2.5;
    return (
      <div style={{position: 'absolute', left: 60, right: 130, top: (top ? 470 : 1180) - 130, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rot}deg) scale(${0.55 + 0.45 * s})`, opacity: Math.min(1, s * 1.5)}}>
        <span style={{fontFamily: heavyFamily, fontSize: p.words.map((w) => w.text).join(' ').length > 12 ? 128 : 160, lineHeight: 0.95, textTransform: 'uppercase', textAlign: 'center', color: '#FFFFFF', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.55)'}}>
          {p.words.map((w, k) => (
            <span key={k} style={isEm(w) ? {...metal(k), WebkitTextStroke: '0px'} : undefined}>
              {k ? ' ' : ''}
              {w.text.replace(/[,.;:]$/, '')}
            </span>
          ))}
        </span>
      </div>
    );
  }

  // karaoke
  return (
    <div style={{position: 'absolute', left: 100, width: 860, top: yBand - 80, textAlign: 'center', opacity: fadeIn}}>
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 54, lineHeight: 1.5, color: ink, textShadow: shadow}}>
        {p.words.map((w, k) => {
          const on = t >= w.start - 0.03 && t < (p.words[k + 1]?.start ?? p.end + 0.5) - 0.03;
          return (
            <span key={k}>
              {k ? ' ' : ''}
              <span style={{padding: '2px 12px', borderRadius: 10, background: on ? (mood === 'light' ? '#111111' : '#FFFFFF') : 'transparent', color: on ? (mood === 'light' ? '#FFFFFF' : '#111111') : t > w.start ? ink : mood === 'light' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)', textShadow: on ? 'none' : undefined}}>{w.text}</span>
            </span>
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
