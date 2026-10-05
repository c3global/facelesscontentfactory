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
export type Lockup = {words: KWord[]; h0: number; h1: number; startMs: number; endMs: number; sentence: number};

const STOP = new Set(
  'a an the of to in on at for and or but i ive is are was that this it as my me we you your how where who get than with by from then there actually being exactly any one those like something what does when check wrote use comes problem'.split(' '),
);

/** Words a chunk must not end on: they lean forward into the next chunk. */
const CONNECTORS = new Set(
  'a an the of to in on at for and or but nor so who whom whose that which when where while with by from as my your our their his her its this these those is are was were be been do does did if than because before after about into onto over under any one'.split(' '),
);

/** Splits support words into lines of at most `n`; a line never ends on a connector unless it is the last line. */
const chunk = (arr: KWord[], n: number): KWord[][] => {
  const out: KWord[][] = [];
  let cur: KWord[] = [];
  for (const w of arr) {
    cur.push(w);
    if (cur.length >= n) {
      const tail: KWord[] = [];
      while (cur.length > 1 && CONNECTORS.has(normalizeWord(cur[cur.length - 1].text))) tail.unshift(cur.pop() as KWord);
      out.push(cur);
      cur = tail;
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const endsClause = (w: KWord) => /[,:;]$/.test(w.text);
const endsSentence = (w: KWord) => /[.?!]$/.test(w.text);
const isConnector = (w: KWord) => CONNECTORS.has(normalizeWord(w.text));

/** Best split of one sentence into phrases of 3 to 6 words: break at commas and pauses, never end on a connector. */
const splitSentence = (ws: KWord[]): KWord[][] => {
  const n = ws.length;
  const best: number[] = new Array(n + 1).fill(Infinity);
  const from: number[] = new Array(n + 1).fill(0);
  best[0] = 0;
  for (let e = 1; e <= n; e++) {
    for (let st = Math.max(0, e - 7); st < e; st++) {
      if (best[st] === Infinity) continue;
      const len = e - st;
      const last = ws[e - 1];
      let cost = Math.pow(len - 4, 2) * 0.35;
      if (len <= 2 && !endsClause(last) && !endsSentence(last)) cost += 3.5;
      else if (len <= 2) cost += 0.8;
      if (len > 6) cost += 6;
      if (e < n) {
        const gap = ws[e].startMs - last.endMs;
        if (isConnector(last)) cost += 6;
        const natural = endsClause(last) ? 7 : gap >= 450 ? 4 : gap >= 250 ? 2 : gap >= 150 ? 1 : 0;
        cost += 3 - natural;
      }
      if (best[st] + cost < best[e]) {
        best[e] = best[st] + cost;
        from[e] = st;
      }
    }
  }
  const out: KWord[][] = [];
  for (let e = n; e > 0; e = from[e]) out.unshift(ws.slice(from[e], e));
  return out;
};

const chunkSentence = (words: KWord[]): KWord[][] => {
  const sentences: KWord[][] = [];
  let cur: KWord[] = [];
  for (const w of words) {
    cur.push(w);
    if (endsSentence(w)) {
      sentences.push(cur);
      cur = [];
    }
  }
  if (cur.length) sentences.push(cur);
  return sentences.flatMap(splitSentence);
};

/** Groups the word-level captions into lockups at pauses, sentence ends and a six-word cap. */
export const buildLockups = (captions: Caption[], plan: Pick<ScenePlan, 'hero' | 'emphasis'>): Lockup[] => {
  const words: KWord[] = captions.map((c) => ({text: c.text.trim(), startMs: c.startMs, endMs: c.endMs}));
  const sentenceOf = new Map<KWord, number>();
  {
    let n = 0;
    for (const w of words) {
      sentenceOf.set(w, n);
      if (endsSentence(w)) n++;
    }
  }
  const groups = chunkSentence(words);

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
    return {words: g, h0: i, h1: j, startMs: g[0].startMs, endMs: g[g.length - 1].endMs, sentence: sentenceOf.get(g[0]) ?? 0};
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
  band: {top: number; bottom: number};
}> = ({l, style, mood, sans, endShow, emphasis, boxedSet, band}) => {
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

  const preLines = chunk(pre, 4).length;
  const postLines = chunk(post, 4).length;
  const smallPx = style === 'editorial' ? 56 * 1.15 : 58 * 1.1;
  // keep the whole lockup inside the caption band: the hero gets whatever height the support lines leave
  const heroRoom = band.bottom - band.top - (preLines + postLines) * (smallPx + 14) - 30;
  const squeeze = Math.min(1, heroRoom / 200);
  const small: React.CSSProperties =
    style === 'editorial'
      ? {fontFamily: sans, fontWeight: 700, fontSize: 56, letterSpacing: '-0.01em', lineHeight: 1.15, color, textShadow: shadow}
      : {fontFamily: sans, fontWeight: 700, fontSize: 58, letterSpacing: '-0.02em', lineHeight: 1.1, color, textShadow: shadow};

  let heroStyle: React.CSSProperties;
  if (heroIsMetal) {
    heroStyle = {
      fontFamily: serifFamily,
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: fitSize(heroText.length, 0.5, 200 * squeeze),
      letterSpacing: '-0.015em',
      lineHeight: 1,
      paddingBottom: '0.16em',
      paddingTop: '0.08em',
      filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.55))',
    };
  } else if (style === 'editorial') {
    heroStyle = {
      fontFamily: serifFamily,
      fontStyle: 'italic',
      fontWeight: 800,
      fontSize: fitSize(heroText.length, 0.5, 200 * squeeze),
      letterSpacing: '-0.015em',
      lineHeight: 1,
      paddingBottom: '0.14em',
      color,
      textShadow: shadow,
    };
  } else {
    heroStyle = {
      fontFamily: heavyFamily,
      textTransform: 'uppercase',
      fontSize: fitSize(heroText.length, 0.46, 236 * squeeze),
      letterSpacing: '0.005em',
      lineHeight: 0.98,
      color,
      textShadow: shadow,
    };
  }

  const renderLine = (ws: KWord[], key: string) => (
    <div key={key} style={{display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', columnGap: style === 'editorial' ? 18 : 18, whiteSpace: 'nowrap'}}>
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
        bottom: H - band.bottom,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 14,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 12}px) scale(${1 - exit * 0.03})`,
      }}
    >
      {chunk(pre, 4).map((ws, i) => renderLine(ws, `pre${i}`))}
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
      {chunk(post, 4).map((ws, i) => renderLine(ws, `post${i}`))}
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

  // which band this lockup sits in: the segment can pin captions to the bottom, the top, or alternate by sentence
  const sec = l.startMs / 1000;
  const seg = plan.scenes.flatMap((sc) => sc.segments).find((sg) => sec >= sg.start - 0.001 && sec < sg.end - 0.001);
  let band = plan.captionBand;
  if (seg && seg.captionPos !== 'bottom') {
    const first = Math.min(...lockups.filter((x) => x.startMs / 1000 >= seg.start - 0.001 && x.startMs / 1000 < seg.end - 0.001).map((x) => x.sentence));
    const top = seg.captionPos === 'top' || (l.sentence - first) % 2 === 0;
    if (top) band = plan.captionBandTop;
  }

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
      band={band}
    />
  );
};
