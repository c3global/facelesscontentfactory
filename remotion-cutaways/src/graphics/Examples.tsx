import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {handFamily, heavyFamily, sansFamily, serifFamily} from '../fonts';
import {metalTextStyle} from '../metal';
import {normalizeWord, useAbsSec} from '../ui';

/**
 * Examples: as she names each point, a small illustrated example of it appears under a heading that carries her
 * exact words (each word lands as she says it, so captions step aside). Illustration text is generic on purpose.
 * Skins follow the template: glass, paper, editorial, data, dark, light.
 */
export type ExampleKind = 'replies' | 'name' | 'reaction' | 'holidays' | 'newcomer' | 'rules' | 'leftout' | 'chat';
export type ExampleSkin = 'glass' | 'paper' | 'editorial' | 'data' | 'dark' | 'light' | 'noir' | 'punch' | 'board';
export type ExampleItem = {say: string; wordTimes: number[]; kind: ExampleKind; at: number};
export type ExamplesProps = {skin: ExampleSkin; items: ExampleItem[]; y: number; height: number; emphasis?: string[]};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SANS = sansFamily('DM Sans');

type Sk = {panel: React.CSSProperties; ink: string; muted: string; line: string; soft: string; head: React.CSSProperties; bubble: string; bubbleInk: string};
const skinOf = (skin: ExampleSkin): Sk => {
  switch (skin) {
    case 'glass':
      return {panel: {background: 'linear-gradient(140deg, rgba(40,44,56,0.82), rgba(12,13,18,0.7))', border: '1.5px solid rgba(255,214,196,0.45)', borderRadius: 36, boxShadow: '0 30px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'}, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.55)', line: 'rgba(255,255,255,0.18)', soft: 'rgba(255,255,255,0.1)', head: {fontFamily: SANS, fontWeight: 700, fontSize: 56}, bubble: 'rgba(255,255,255,0.14)', bubbleInk: '#FFFFFF'};
    case 'paper':
      return {panel: {background: '#FBFBFA', borderRadius: 6, boxShadow: '0 24px 50px rgba(0,0,0,0.45)', transform: 'rotate(-1.4deg)'}, ink: '#141414', muted: 'rgba(20,20,20,0.5)', line: 'rgba(20,20,20,0.14)', soft: 'rgba(20,20,20,0.06)', head: {fontFamily: handFamily, fontWeight: 700, fontSize: 66, lineHeight: 1}, bubble: '#EDEDEC', bubbleInk: '#141414'};
    case 'editorial':
      return {panel: {background: '#FFFFFF', borderRadius: 2, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', borderTop: `6px solid ${brand.crimson}`}, ink: '#111111', muted: 'rgba(17,17,17,0.5)', line: 'rgba(17,17,17,0.16)', soft: 'rgba(17,17,17,0.05)', head: {fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 58}, bubble: '#F1F1F1', bubbleInk: '#111111'};
    case 'data':
      return {panel: {background: '#121417', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px'}, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', line: 'rgba(255,255,255,0.14)', soft: 'rgba(255,255,255,0.06)', head: {fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 1.5, textTransform: 'uppercase'}, bubble: '#1E2126', bubbleInk: '#FFFFFF'};
    case 'dark':
      return {panel: {background: 'linear-gradient(180deg, rgba(14,10,10,0.92), rgba(6,6,6,0.92))', borderRadius: 4, border: '1px solid rgba(255,214,196,0.25)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)'}, ink: '#F4F0EC', muted: 'rgba(244,240,236,0.5)', line: 'rgba(244,240,236,0.14)', soft: 'rgba(244,240,236,0.06)', head: {fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 500, fontSize: 54}, bubble: 'rgba(244,240,236,0.1)', bubbleInk: '#F4F0EC'};
    case 'noir':
      // quiet: a black panel with a gold hairline, square corners, clean white type
      return {panel: {background: 'rgba(4,4,4,0.94)', borderRadius: 0, border: '1.5px solid rgba(213,170,74,0.7)', boxShadow: '0 40px 90px rgba(0,0,0,0.7)'}, ink: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', line: 'rgba(255,255,255,0.14)', soft: 'rgba(255,255,255,0.06)', head: {fontFamily: SANS, fontWeight: 500, fontSize: 52, letterSpacing: -0.5}, bubble: 'rgba(255,255,255,0.08)', bubbleInk: '#FFFFFF'};
    case 'punch':
      // hype: white with a heavy black border and a hard offset shadow, condensed capitals
      return {panel: {background: '#FFFFFF', borderRadius: 0, border: '6px solid #000', boxShadow: '16px 16px 0 #000'}, ink: '#000000', muted: 'rgba(0,0,0,0.55)', line: 'rgba(0,0,0,0.18)', soft: 'rgba(0,0,0,0.06)', head: {fontFamily: heavyFamily, fontSize: 68, lineHeight: 1.02, textTransform: 'uppercase'}, bubble: '#F0F0F0', bubbleInk: '#000000'};
    case 'board':
      // teach: a small whiteboard with a charcoal frame and marker handwriting
      return {panel: {background: '#FFFFFF', borderRadius: 10, border: `5px solid ${brand.charcoal}`, boxShadow: '0 18px 40px rgba(0,0,0,0.22)', backgroundImage: 'linear-gradient(rgba(58,63,66,0.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(58,63,66,0.06) 1.5px, transparent 1.5px)', backgroundSize: '60px 60px'}, ink: brand.charcoal, muted: 'rgba(58,63,66,0.55)', line: 'rgba(58,63,66,0.2)', soft: 'rgba(58,63,66,0.06)', head: {fontFamily: handFamily, fontWeight: 700, fontSize: 70, lineHeight: 1}, bubble: '#F2F2F2', bubbleInk: brand.charcoal};
    default:
      return {panel: {background: '#FFFFFF', borderRadius: 32, boxShadow: '0 24px 60px rgba(0,0,0,0.35)'}, ink: '#111111', muted: 'rgba(17,17,17,0.5)', line: 'rgba(17,17,17,0.12)', soft: 'rgba(17,17,17,0.05)', head: {fontFamily: SANS, fontWeight: 800, fontSize: 56}, bubble: '#F2F2F2', bubbleInk: '#111111'};
  }
};

const Avatar: React.FC<{c: string; s?: number; label?: string; dim?: number}> = ({c, s = 56, label = '', dim = 1}) => (
  <div style={{flex: 'none', width: s, height: s, borderRadius: s / 2, background: c, opacity: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: s * 0.4}}>{label}</div>
);
const Bar: React.FC<{w: number; c: string; h?: number}> = ({w, c, h = 14}) => <div style={{width: w, height: h, borderRadius: h / 2, background: c}} />;
const Heart: React.FC<{s: number; c: string}> = ({s, c}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.2 4.6 2.7C12 6.2 13.6 5 15.6 5 19 5 21.1 8.4 19.6 11.8 17.5 16.4 12 21 12 21z" fill={c} /></svg>
);
const PALETTE = ['#C91B19', '#3A3F42', '#B76E79', '#6F0D0F', '#8E959C', '#B5622C'];

const Illustration: React.FC<{kind: ExampleKind; t: number; sk: Sk; w: number; h: number}> = ({kind, t, sk, w, h}) => {
  const k = (a: number, d = 0.35) => interpolate(t, [a, a + d], [0, 1], clamp);
  const pop = (a: number): React.CSSProperties => ({opacity: k(a, 0.2), transform: `translateY(${(1 - k(a, 0.3)) * 16}px) scale(${0.92 + 0.08 * k(a, 0.3)})`});
  const post = (who: number, name: string, text: string, extra?: React.ReactNode, dim = 1, small = false) => (
    <div style={{display: 'flex', gap: 16, alignItems: 'flex-start', opacity: dim}}>
      <Avatar c={PALETTE[who % PALETTE.length]} s={small ? 50 : 60} label={name[0]} />
      <div style={{flex: 1, background: sk.bubble, borderRadius: 20, padding: small ? '12px 18px' : '16px 22px', display: 'flex', flexDirection: 'column', gap: 6}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: small ? 22 : 24, color: sk.muted}}>{name}</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: small ? 28 : 32, lineHeight: 1.25, color: sk.bubbleInk}}>{text}</div>
        {extra}
      </div>
    </div>
  );
  switch (kind) {
    case 'replies':
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, width: w}}>
          <div style={pop(0)}>{post(0, 'Maya', 'Who has tips for running the Monday call?')}</div>
          {[['Jordan', 'Here is what works for us'], ['Priya', 'Agenda first, always'], ['Sam', 'Love this question']].map(([n, txt], i) => (
            <div key={n} style={{...pop(0.3 + i * 0.22), marginLeft: 76}}>{post(i + 2, n, txt, undefined, 1, true)}</div>
          ))}
          <div style={{...pop(1.1), marginTop: 8}}>{post(4, 'Amara', 'Hi all, I am new here', <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: brand.crimson, marginTop: 4}}>0 replies</div>, 0.85)}</div>
        </div>
      );
    case 'name': {
      const typed = 'Siobahn';
      const fixed = 'Siobhán';
      const strike = k(0.7, 0.25);
      const fix = k(1.0, 0.3);
      return (
        <div style={{width: w, display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'center'}}>
          <div style={{...pop(0), width: Math.min(620, w), borderRadius: 22, overflow: 'hidden', background: sk.bubble}}>
            <div style={{background: brand.crimson, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 3, padding: '16px 0', textAlign: 'center'}}>HELLO, MY NAME IS</div>
            <div style={{padding: '30px 0 36px', textAlign: 'center', position: 'relative'}}>
              <span style={{fontFamily: handFamily, fontWeight: 700, fontSize: 92, color: sk.bubbleInk, position: 'relative', opacity: 1 - fix}}>
                {typed.slice(0, Math.round(typed.length * k(0.15, 0.45)))}
                <span style={{position: 'absolute', left: 0, top: '55%', height: 6, width: `${strike * 100}%`, background: brand.crimson, borderRadius: 3}} />
              </span>
              <span style={{position: 'absolute', left: 0, right: 0, top: 30, fontFamily: handFamily, fontWeight: 700, fontSize: 92, color: sk.bubbleInk, opacity: fix}}>{fixed}</span>
            </div>
          </div>
        </div>
      );
    }
    case 'reaction': {
      const n = Math.round(interpolate(t, [0.3, 1.2], [0, 24], clamp));
      const hearts = Math.min(5, Math.ceil(n / 5));
      return (
        <div style={{width: w, display: 'flex', flexDirection: 'column', gap: 24}}>
          <div style={pop(0)}>
            {post(1, 'Jordan', 'Our team hit the launch date!', (
              <div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 8}}>
                {Array.from({length: hearts}).map((_, i) => (
                  <div key={i} style={{transform: `scale(${spring({frame: Math.round((t - 0.3 - i * 0.18) * 30), fps: 30, config: {damping: 9}})})`}}><Heart s={34} c={brand.crimson} /></div>
                ))}
                <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: sk.bubbleInk, marginLeft: 6, fontVariantNumeric: 'tabular-nums'}}>{n}</span>
              </div>
            ))}
          </div>
          <div style={pop(0.5)}>{post(5, 'Amara', 'Sharing a resource from my last role', <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: sk.muted, marginTop: 6}}>0 reactions</div>, 0.8)}</div>
        </div>
      );
    }
    case 'holidays': {
      const rows: [string, boolean][] = [['Thanksgiving', true], ['Christmas', true], ['Diwali', false], ['Lunar New Year', false], ['Eid al-Fitr', false]];
      return (
        <div style={{width: w, display: 'flex', flexDirection: 'column', gap: 14}}>
          {rows.map(([name, lit], i) => (
            <div key={name} style={{...pop(0.15 + i * 0.18), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderRadius: 16, background: lit ? sk.bubble : sk.soft, border: `1px solid ${sk.line}`}}>
              <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: lit ? sk.ink : sk.muted}}>{name}</span>
              {lit ? (
                <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: '#fff', background: brand.crimson, padding: '8px 16px', borderRadius: 20, opacity: k(0.9 + i * 0.1, 0.2)}}>POSTED</span>
              ) : (
                <span style={{fontFamily: SANS, fontSize: 26, color: sk.muted}}>no post</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    case 'newcomer':
      return (
        <div style={{width: w, display: 'flex', flexDirection: 'column', gap: 14}}>
          <div style={{...pop(0), alignSelf: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: sk.muted, padding: '8px 18px', borderRadius: 20, border: `1px solid ${sk.line}`}}>AMARA JOINED THE GROUP</div>
          <div style={pop(0.25)}>{post(1, 'Jordan', 'Same as last year, you know how we do it', undefined, 1, true)}</div>
          <div style={pop(0.55)}>{post(3, 'Priya', 'Ha, the usual spot', undefined, 1, true)}</div>
          <div style={{...pop(0.9), display: 'flex', justifyContent: 'flex-end', gap: 14, alignItems: 'center'}}>
            <div style={{background: brand.crimson, color: '#fff', borderRadius: 20, padding: '14px 24px', fontFamily: SANS, fontWeight: 600, fontSize: 30}}>Sorry, what is the usual spot?</div>
            <Avatar c="#8E959C" label="A" />
          </div>
        </div>
      );
    case 'rules':
      return (
        <div style={{...pop(0), width: Math.min(w, 700), alignSelf: 'center', background: '#FFFFFF', borderRadius: 10, padding: '30px 38px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', backgroundImage: 'linear-gradient(transparent 63px, rgba(0,80,160,0.12) 64px)', backgroundSize: '100% 64px', margin: '0 auto'}}>
          {[1, 2, 3, 4, 5].map((n, i) => (
            <div key={n} style={{height: 64, display: 'flex', alignItems: 'center', gap: 22}}>
              <span style={{fontFamily: handFamily, fontWeight: 700, fontSize: 52, color: brand.crimson, opacity: k(0.2 + i * 0.25, 0.15)}}>{n}.</span>
              <svg width={480} height={30} style={{overflow: 'visible'}}>
                <path d={`M0 18 C 60 6, 120 26, 180 14 S 300 8, ${300 + i * 30} 18`} stroke="#3A3F42" strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - k(0.3 + i * 0.25, 0.3))} />
              </svg>
            </div>
          ))}
        </div>
      );
    case 'leftout': {
      // seven people sit ON the circle; one stands outside it and drifts further away
      const out = k(0.6, 0.8);
      const R = Math.min(w, h) * 0.3;
      const cx = w / 2;
      const cy = R + 50;
      const A = 36; // half an avatar
      return (
        <div style={{width: w, height: Math.min(h, 2 * R + 120), position: 'relative'}}>
          <div style={{position: 'absolute', left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, borderRadius: R, border: `3px dashed ${sk.line}`, boxSizing: 'border-box', opacity: k(0.2)}} />
          {Array.from({length: 7}).map((_, i) => {
            const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
            return <div key={i} style={{position: 'absolute', left: cx - A + Math.cos(a) * R, top: cy - A + Math.sin(a) * R, ...pop(0.05 * i)}}><Avatar c={PALETTE[i % PALETTE.length]} s={72} /></div>;
          })}
          <div style={{position: 'absolute', left: cx + R + 40 + out * 50 - A, top: cy + R * 0.35 - A, opacity: k(0.4) * (1 - 0.4 * out)}}><Avatar c="#8E959C" s={72} /></div>
        </div>
      );
    }
    default:
      return (
        <div style={{...pop(0), width: w, display: 'flex', borderRadius: 20, overflow: 'hidden', border: `1px solid ${sk.line}`}}>
          <div style={{width: 210, background: sk.soft, padding: 22, display: 'flex', flexDirection: 'column', gap: 18}}>
            {['# general', '# wins', '# help'].map((c, i) => <div key={c} style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: i === 0 ? sk.ink : sk.muted, ...pop(0.1 + i * 0.1)}}>{c}</div>)}
          </div>
          <div style={{flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14}}>
            {[['Maya', 'Morning, everyone'], ['Jordan', 'Notes from Friday are up'], ['Priya', 'Thank you!']].map(([n, txt], i) => <div key={n} style={pop(0.3 + i * 0.25)}>{post(i, n, txt, undefined, 1, true)}</div>)}
          </div>
        </div>
      );
  }
};

export const Examples: React.FC<ExamplesProps> = ({skin, items, y, height, emphasis = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useAbsSec();
  const sk = skinOf(skin);
  const idx = Math.max(0, items.reduce((acc, it, i) => (t >= it.at - 0.15 ? i : acc), -1));
  const it = items[idx];
  const local = t - it.at;
  // the card enters once; when she moves to the next point only the contents change
  const enter = spring({frame: Math.round((t - items[0].at + 0.15) * fps), fps, config: {damping: 16, mass: 0.6}});
  const swap = spring({frame: Math.round((local + 0.15) * fps), fps, config: {damping: 18, mass: 0.5}});
  const emph = new Set(emphasis.map(normalizeWord));
  const W = 900;
  const words = it.say.split(' ');
  // shrink the drawing so it always fits under the heading (two heading lines on long sentences)
  const NATURAL: Record<ExampleKind, number> = {replies: 560, reaction: 330, holidays: 430, newcomer: 380, rules: 420, leftout: 400, chat: 320, name: 330};
  const headLines = Math.ceil(it.say.length / (skin === 'paper' || skin === 'board' ? 30 : skin === 'data' ? 34 : skin === 'punch' ? 24 : 28));
  const room = height - 80 - headLines * 66 - 30 - (items.length > 1 ? 42 : 0);
  const fit = Math.max(0.5, Math.min(1, room / NATURAL[it.kind]));
  return (
    <div style={{position: 'absolute', left: 90, top: y, width: W, height}}>
      <div style={{...sk.panel, position: 'absolute', inset: 0, padding: '40px 46px', boxSizing: 'border-box', opacity: Math.min(1, enter * 1.5), transform: `${sk.panel.transform ?? ''} translateY(${(1 - enter) * 40}px)`, display: 'flex', flexDirection: 'column', gap: 30, overflow: 'hidden'}}>
        <div style={{...sk.head, color: sk.ink, lineHeight: (sk.head.lineHeight as number) ?? 1.12, minHeight: 60}}>
          {words.map((w, i) => {
            const at = it.wordTimes[i] ?? it.at;
            const k = interpolate(t - (at - 0.06), [0, 0.14], [0, 1], clamp);
            const em = emph.has(normalizeWord(w));
            return (
              <span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: k, transform: `translateY(${(1 - k) * 12}px)`, ...(em ? (skin === 'paper' || skin === 'light' || skin === 'editorial' || skin === 'punch' || skin === 'board' ? {color: brand.crimson, ...(skin === 'board' ? {textDecoration: 'underline', textDecorationThickness: 6, textUnderlineOffset: 8} : {})} : metalTextStyle({kind: 'rose', variant: 'bright', frame, seed: i})) : {})}}>
                {w}
              </span>
            );
          })}
        </div>
        <div style={{flex: 1, minHeight: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', position: 'relative', opacity: idx === 0 ? 1 : Math.min(1, swap * 1.4), transform: idx === 0 ? undefined : `translateX(${(1 - swap) * 60}px)`}}>
          <div style={{transform: `scale(${fit})`, transformOrigin: 'top center', width: W - 92}}>
            <Illustration kind={it.kind} t={local} sk={sk} w={W - 92} h={height - 220} />
          </div>
        </div>
        {items.length > 1 && (
          <div style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
            {items.map((_, i) => <div key={i} style={{width: i === idx ? 34 : 12, height: 12, borderRadius: 6, background: i === idx ? brand.crimson : sk.line}} />)}
          </div>
        )}
      </div>
    </div>
  );
};
