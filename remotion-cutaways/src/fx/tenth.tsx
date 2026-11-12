import React from 'react';
import {heavyFamily, serifFamily} from '../fonts';
import {useSpan} from './fourth';
import type {Fx} from './schema';
import {C3} from './theme';
import {pop, tw} from './util';

/**
 * Tenth FX batch (beta 11): the text animation pack. One effect, `text-pop`, eight looks:
 * focus, shiny, gradient, blur-in, split, glitch, scramble (a signature reveal) and badge ("Effect of the day").
 */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, pointerEvents: 'none'};
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*';
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

export const TextPop: React.FC<{fx: Of<'text-pop'>}> = ({fx}) => {
  const {t, len, frame, outK} = useSpan(fx);
  const {text, look, y, size, sub} = fx.props;
  const chars = [...text];
  const serif = look === 'scramble' || look === 'focus';
  const base: React.CSSProperties = {fontFamily: serif ? serifFamily : heavyFamily, fontSize: size, lineHeight: 1, color: '#fff', textShadow: '0 8px 36px rgba(0,0,0,0.45)', whiteSpace: 'pre', fontStyle: look === 'scramble' ? 'italic' : undefined, letterSpacing: serif ? -1 : 2};
  const wrap = (node: React.ReactNode) => (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: y, transform: 'translateY(-50%)', textAlign: 'center'}}>{node}</div>
    </div>
  );
  switch (look) {
    case 'focus': {
      // true focus: each word comes into focus in turn inside a bracket frame
      const words = text.split(' ');
      const step = Math.max(0.35, (len - 0.6) / words.length);
      const cur = Math.min(words.length - 1, Math.floor(t / step));
      return wrap(
        <div style={{...base, display: 'inline-flex', gap: 28}}>
          {words.map((w, i) => {
            const on = i === cur;
            return (
              <span key={i} style={{position: 'relative', filter: on ? 'none' : 'blur(7px)', opacity: on ? 1 : 0.55, padding: '0 10px'}}>
                {w}
                {on && ['0 0', '100% 0', '0 100%', '100% 100%'].map((p, k) => (
                  <span key={k} style={{position: 'absolute', left: p.startsWith('0') ? -6 : undefined, right: p.startsWith('100') ? -6 : undefined, top: p.endsWith(' 0') ? -10 : undefined, bottom: p.endsWith('100%') ? -10 : undefined, width: 26, height: 26, borderColor: C3.copper, borderStyle: 'solid', borderWidth: `${p.endsWith(' 0') ? 5 : 0}px ${p.startsWith('100') ? 5 : 0}px ${p.endsWith('100%') ? 5 : 0}px ${p.startsWith('0') ? 5 : 0}px`}} />
                ))}
              </span>
            );
          })}
        </div>,
      );
    }
    case 'shiny': {
      const pos = 140 - ((t * 70) % 280);
      return wrap(<span style={{...base, textShadow: 'none', background: `linear-gradient(110deg, #b9b9b9 ${pos}%, #fff ${pos + 12}%, #b9b9b9 ${pos + 24}%)`, backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', color: 'transparent', opacity: tw(t, 0, 0.3), filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.45))'}}>{text}</span>);
    }
    case 'gradient': {
      const sh = (t * 120) % 400;
      return wrap(<span style={{...base, textShadow: 'none', background: `linear-gradient(90deg, ${C3.accent}, ${C3.gold}, ${C3.copper}, #fff, ${C3.accent})`, backgroundSize: '400% 100%', backgroundPosition: `${sh}% 0`, WebkitBackgroundClip: 'text', color: 'transparent', transform: `scale(${0.85 + 0.15 * tw(t, 0, 0.35, 0, 1, pop)})`, display: 'inline-block', filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.5))'}}>{text}</span>);
    }
    case 'blur-in':
      return wrap(
        <div style={base}>
          {chars.map((c, i) => {
            const k = tw(t, i * 0.05, i * 0.05 + 0.45);
            return <span key={i} style={{display: 'inline-block', filter: `blur(${(1 - k) * 18}px)`, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>{c}</span>;
          })}
        </div>,
      );
    case 'split': {
      const k = tw(t, 0.05, 0.5, 0, 1, pop);
      const half = (top: boolean): React.CSSProperties => ({...base, position: 'absolute', left: 0, right: 0, top: 0, clipPath: top ? 'inset(0 0 50% 0)' : 'inset(50% 0 0 0)', transform: `translateX(${(top ? -1 : 1) * (1 - k) * 700}px)`});
      return wrap(
        <div style={{position: 'relative', height: size}}>
          <div style={half(true)}>{text}</div>
          <div style={half(false)}>{text}</div>
          <div style={{position: 'absolute', left: 540 - 300 * k, width: 600 * k, top: size / 2 - 2, height: 4, background: C3.copper, opacity: 1 - tw(t, 0.5, 0.8)}} />
        </div>,
      );
    }
    case 'glitch': {
      const g = frame % 9 < 2 || (t < 0.4 && frame % 3 === 0);
      const dx = g ? (hash(frame) - 0.5) * 40 : 0;
      return wrap(
        <div style={{position: 'relative', display: 'inline-block'}}>
          <span style={{...base, position: 'absolute', left: dx, top: 0, color: '#00e5ff', mixBlendMode: 'screen', opacity: g ? 0.9 : 0}}>{text}</span>
          <span style={{...base, position: 'absolute', left: -dx, top: 0, color: '#ff2d6f', mixBlendMode: 'screen', opacity: g ? 0.9 : 0}}>{text}</span>
          <span style={{...base, position: 'relative', clipPath: g ? `inset(${hash(frame + 3) * 60}% 0 ${hash(frame + 7) * 30}% 0)` : undefined, transform: g ? `translateX(${dx / 2}px)` : undefined, display: 'inline-block'}}>{text}</span>
        </div>,
      );
    }
    case 'scramble': {
      // a signature reveal: random letters settle left to right, then a pen line underlines it
      const settle = Math.max(0.6, len * 0.55);
      const shown = chars.map((c, i) => {
        const at = (i / chars.length) * settle;
        return t >= at || c === ' ' ? c : GLYPHS[Math.floor(hash(i * 13 + Math.floor(frame / 2)) * GLYPHS.length)];
      });
      const line = tw(t, settle, settle + 0.5);
      return wrap(
        <div style={{display: 'inline-block', position: 'relative'}}>
          <div style={base}>{shown.join('')}</div>
          <svg width={1000} height={60} viewBox="0 0 1000 60" style={{position: 'absolute', left: '50%', marginLeft: -500, top: size * 0.95}}>
            <path d="M80 40 C 300 10, 600 60, 920 20" fill="none" stroke={C3.copper} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
          </svg>
        </div>,
      );
    }
    case 'badge': {
      const k = tw(t, 0, 0.4, 0, 1, pop);
      const shine = ((t * 0.9) % 1.6) * 140 - 40;
      return wrap(
        <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16, transform: `scale(${k}) rotate(${(1 - k) * -10}deg)`}}>
          <div style={{position: 'relative', overflow: 'hidden', padding: '18px 44px', borderRadius: 999, background: C3.copperGrad, color: '#1d1a17', fontFamily: heavyFamily, fontSize: size * 0.45, letterSpacing: 4, boxShadow: '0 14px 40px rgba(0,0,0,0.45)'}}>
            {text.toUpperCase()}
            <div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: 60, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)', transform: 'skewX(-20deg)'}} />
          </div>
          {sub && <div style={{fontFamily: serifFamily, fontStyle: 'italic', fontSize: size * 0.5, color: '#fff', textShadow: '0 6px 26px rgba(0,0,0,0.5)', opacity: tw(t, 0.3, 0.6)}}>{sub}</div>}
        </div>,
      );
    }
  }
};

export const tenthOver = (fx: Fx): React.ReactNode => (fx.type === 'text-pop' ? <TextPop fx={fx} /> : null);
