import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import {Mood, brand} from './brand';
import {heavyFamily, sansFamily, serifFamily} from './fonts';
import {H, LOCKUP} from './layouts';
import {MetalText} from './metal';
import type {ScenePlan} from './schema';
import {normalizeWord} from './ui';

/**
 * Kinetic caption lockups. Instead of small subtitles, each phrase is a designed block that is part of the
 * production: one hero word set huge, small support words above and below it, an optional highlight box,
 * and words that slam in on the beat of her voice.
 *
 *  - editorial: hero in Playfair Black caps, support in tracked DM Sans caps
 *  - heavy:     hero in Anton (condensed), support in tight DM Sans
 *
 * Emphasized words (plan.emphasis) become the hero as the metallic Playfair italic. Metal is only ever used
 * there. Plain text is white on dark scenes and black on white scenes; boxes are white or black, never crimson.
 */
type KWord = {text: string; startMs: number; endMs: number};
export type Lockup = {words: KWord[]; h0: number; h1: number; startMs: number; endMs: number};

const STOP = new Set(
  'a an the of to in on at for and or but i ive is are was that this it as my me we you your how where who get than with by from then there'.split(' '),
);

const chunk = <T,>(arr: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

/** Groups the word-level captions into lockups at pauses, sentence ends and a six-word cap. */
export const buildLockups = (captions: Caption[], plan: Pick<ScenePlan, 'hero' | 'emphasis'>): Lockup[] => {
  const words: KWord[] = captions.map((c) => ({text: c.text.trim(), startMs: c.startMs, endMs: c.endMs}));
  const groups: KWord[][] = [];
  let cur: KWord[] = [];
  for (const w of words) {
    const prev = cur[cur.length - 1];
    if (
      prev &&
      (w.startMs - prev.endMs >= 220 || cur.length >= 6 || /[.?!]$/.test(prev.text) || (/[,:]$/.test(prev.text) && cur.length >= 3))
    ) {
      groups.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) groups.push(cur);
  // never leave a lone trailing word on its own (for example "voice,"): fold it back into the previous lockup
  for (let k = groups.length - 1; k > 0; k--) {
    const g = groups[k];
    const prev = groups[k - 1];
    if (g.length === 1 && prev.length <= 6 && g[0].startMs - prev[prev.length - 1].endMs < 400) {
      prev.push(g[0]);
      groups.splice(k, 1);
    }
  }

  const heroSet = new Set([...plan.hero, ...plan.emphasis].map(normalizeWord));
  const emphSet = new Set(plan.emphasis.map(normalizeWord));
  return groups.map((g) => {
    let i = g.findIndex((w) => heroSet.has(normalizeWord(w.text)));
    if (i < 0) {
      let best = -1;
      let bestLen = 0;
      g.forEach((w, k) => {
        const n = normalizeWord(w.text);
        if (!STOP.has(n) && n.length >= bestLen) {
          best = k;
          bestLen = n.length;
        }
      });
      i = best < 0 ? g.length - 1 : best;
    }
    let j = i;
    if (emphSet.has(normalizeWord(g[i].text)) && j + 1 < g.length && emphSet.has(normalizeWord(g[j + 1].text))) j++; // "20 years"
    return {words: g, h0: i, h1: j, startMs: g[0].startMs, endMs: g[g.length - 1].endMs};
  });
};

type Style = 'editorial' | 'heavy';

const fitSize = (chars: number, perChar: number, max: number, min = 84) =>
  Math.max(min, Math.min(max, (LOCKUP.width - 20) / Math.max(1, chars * perChar)));

const Word: React.FC<{
  w: KWord;
  kind: 'small' | 'hero';
  boxed: boolean;
  mood: Mood;
  style: React.CSSProperties;
  children: React.ReactNode;
}> = ({w, kind, boxed, mood, style, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = (w.startMs / 1000) * fps;
  const hero = kind === 'hero';
  const p = spring({
    frame: frame - start,
    fps,
    durationInFrames: hero ? 16 : 10,
    config: hero ? {damping: 9, stiffness: 210, mass: 0.7} : {damping: 14, stiffness: 240, mass: 0.6},
  });
  const visible = frame >= start - 0.5 ? 1 : 0;
  const scale = interpolate(p, [0, 1], [hero ? 1.55 : 0.82, 1]);
  const rot = hero ? interpolate(p, [0, 1], [-3, 0]) : 0;
  const lift = interpolate(p, [0, 1], [hero ? 0 : 20, 0]);
  const boxP = interpolate(frame - start, [-2, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dark = mood === 'dark';

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        opacity: visible,
        transform: `translateY(${lift}px) scale(${scale}) rotate(${rot}deg)`,
        transformOrigin: 'center 70%',
        padding: boxed ? '0 0.2em' : 0,
        ...style,
        ...(boxed ? {color: dark ? brand.black : brand.white, textShadow: 'none'} : {}),
      }}
    >
      {boxed && (
        <span
          style={{
            position: 'absolute',
            inset: '0.02em 0',
            borderRadius: '0.14em',
            background: dark ? brand.white : brand.black,
            transform: `scaleX(${boxP})`,
            transformOrigin: 'left center',
            zIndex: 0,
          }}
        />
      )}
      <span style={{position: 'relative', zIndex: 1}}>{children}</span>
    </span>
  );
};

const LockupView: React.FC<{
  l: Lockup;
  style: Style;
  mood: Mood;
  sans: string;
  endShow: number;
  emphasis: string[];
  boxedSet: Set<string>;
}> = ({l, style, mood, sans, endShow, emphasis, boxedSet}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = (frame / fps) * 1000;
  const dark = mood === 'dark';
  const exit = interpolate(t, [endShow - 130, endShow], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const color = dark ? brand.white : brand.black;
  const shadow = dark ? '0 4px 26px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)' : 'none';

  const pre = l.words.slice(0, l.h0);
  const heroWords = l.words.slice(l.h0, l.h1 + 1);
  const post = l.words.slice(l.h1 + 1);
  const emphSet = new Set(emphasis.map(normalizeWord));
  const heroIsMetal = heroWords.every((w) => emphSet.has(normalizeWord(w.text)));
  const heroText = heroWords.map((w) => w.text.replace(/[,:;]+$/, '')).join(' ');
  const heroBoxed = !heroIsMetal && heroWords.some((w) => boxedSet.has(normalizeWord(w.text)));

  const small: React.CSSProperties =
    style === 'editorial'
      ? {fontFamily: sans, fontWeight: 700, fontSize: 40, letterSpacing: '0.2em', textTransform: 'uppercase', lineHeight: 1.25, color, textShadow: shadow}
      : {fontFamily: sans, fontWeight: 700, fontSize: 58, letterSpacing: '-0.02em', lineHeight: 1.1, color, textShadow: shadow};

  let heroStyle: React.CSSProperties;
  if (heroIsMetal) {
    heroStyle = {
      fontFamily: serifFamily,
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: fitSize(heroText.length, 0.5, 200),
      letterSpacing: '-0.015em',
      lineHeight: 1,
      paddingBottom: '0.16em',
      filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.55))',
    };
  } else if (style === 'editorial') {
    heroStyle = {
      fontFamily: serifFamily,
      fontWeight: 900,
      textTransform: 'uppercase',
      fontSize: fitSize(heroText.length, 0.74, 176),
      letterSpacing: '-0.015em',
      lineHeight: 0.98,
      color,
      textShadow: shadow,
    };
  } else {
    heroStyle = {
      fontFamily: heavyFamily,
      textTransform: 'uppercase',
      fontSize: fitSize(heroText.length, 0.46, 236),
      letterSpacing: '0.005em',
      lineHeight: 0.98,
      color,
      textShadow: shadow,
    };
  }

  const renderLine = (ws: KWord[], key: string) => (
    <div key={key} style={{display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', columnGap: style === 'editorial' ? 30 : 18, whiteSpace: 'nowrap'}}>
      {ws.map((w, i) => (
        <Word key={i} w={w} kind="small" boxed={boxedSet.has(normalizeWord(w.text))} mood={mood} style={small}>
          {w.text.replace(/[,:;]+$/, '')}
        </Word>
      ))}
    </div>
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: LOCKUP.left,
        width: LOCKUP.width,
        bottom: H - LOCKUP.bottom,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 14,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 12}px) scale(${1 - exit * 0.03})`,
      }}
    >
      {chunk(pre, 3).map((ws, i) => renderLine(ws, `pre${i}`))}
      <div style={{display: 'flex', justifyContent: 'center', columnGap: style === 'editorial' ? 28 : 22, whiteSpace: 'nowrap'}}>
        {heroWords.map((w, i) => (
          <Word key={i} w={w} kind="hero" boxed={heroBoxed} mood={mood} style={heroStyle}>
            {heroIsMetal ? (
              <MetalText variant={dark ? 'bright' : 'deep'} seed={l.h0 * 3 + i + 2}>
                {w.text.replace(/[,:;]+$/, '')}
              </MetalText>
            ) : (
              w.text.replace(/[,:;]+$/, '')
            )}
          </Word>
        ))}
      </div>
      {chunk(post, 3).map((ws, i) => renderLine(ws, `post${i}`))}
    </div>
  );
};

export const KineticLayer: React.FC<{captions: Caption[]; plan: ScenePlan; mood: Mood}> = ({captions, plan, mood}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = (frame / fps) * 1000;
  const lockups = useMemo(() => buildLockups(captions, plan), [captions, plan]);
  const boxedSet = useMemo(() => new Set(plan.boxed.map(normalizeWord)), [plan.boxed]);

  const idx = lockups.findIndex((l, k) => {
    const next = lockups[k + 1];
    return t >= l.startMs - 80 && t < Math.min(l.endMs + 320, next ? next.startMs - 40 : Infinity);
  });
  if (idx < 0) return null;
  const l = lockups[idx];
  const next = lockups[idx + 1];
  const endShow = Math.min(l.endMs + 320, next ? next.startMs - 40 : Infinity);
  const style: Style = plan.captionStyle === 'heavy' ? 'heavy' : 'editorial';

  return (
    <LockupView
      key={idx}
      l={l}
      style={style}
      mood={mood}
      sans={sansFamily(plan.theme.sans)}
      endShow={endShow}
      emphasis={plan.emphasis}
      boxedSet={boxedSet}
    />
  );
};
