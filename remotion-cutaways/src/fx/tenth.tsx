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
      // SVG text with a moving gradient band (background-clip text is unreliable in the renderer)
      const bx = -300 + ((t / 1.2) % 1) * 1680;
      const id = `shine-${fx.at}`;
      return wrap(
        <svg width={1080} height={size * 1.3} style={{overflow: 'visible', opacity: tw(t, 0, 0.3), filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.55))'}}>
          <defs>
            <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={bx - 160} y1={0} x2={bx + 160} y2={size * 0.4}>
              <stop offset="0" stopColor="#9a9a9a" />
              <stop offset="0.5" stopColor="#ffffff" />
              <stop offset="1" stopColor="#9a9a9a" />
            </linearGradient>
          </defs>
          <text x={540} y={size * 1.05} textAnchor="middle" fill={`url(#${id})`} style={{fontFamily: heavyFamily, fontSize: size, letterSpacing: 2}}>{text}</text>
        </svg>,
      );
    }
    case 'glass': {
      // liquid glass letters: clear rounded body, bright rim, top sheen, and a highlight that rolls through
      const k = tw(t, 0, 0.45, 0, 1, pop);
      const fs = size * 1.15;
      const bx = -300 + ((t / 1.6) % 1) * 1680;
      const id = `glass-${fx.at}`;
      const font: React.CSSProperties = {fontFamily: C3.sans, fontWeight: 900, fontSize: fs, letterSpacing: -2};
      return wrap(
        <svg width={1080} height={fs * 1.3} style={{overflow: 'visible', opacity: k, transform: `scale(${0.8 + 0.2 * k})`, filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.6))'}}>
          <defs>
            <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="0.35" stopColor="#fff" stopOpacity="0.06" />
              <stop offset="0.75" stopColor="#000" stopOpacity="0.25" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id={`${id}-h`} gradientUnits="userSpaceOnUse" x1={bx - 120} y1={0} x2={bx + 120} y2={fs * 0.5}>
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <text x={540} y={fs * 1.02} textAnchor="middle" fill={`url(#${id}-v)`} stroke="rgba(255,255,255,0.85)" strokeWidth={3.5} style={font}>{text}</text>
          <text x={540} y={fs * 1.02} textAnchor="middle" fill={`url(#${id}-h)`} style={font}>{text}</text>
          <text x={540} y={fs * 1.02} textAnchor="middle" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={1.2} transform="translate(3 4)" style={font}>{text}</text>
        </svg>,
      );
    }
    case 'fill': {
      // outlined letters fill with color bottom to top, one after another, with a design-tool selection box on the letter filling
      const per = Math.min(0.32, (len - 0.8) / Math.max(1, chars.length));
      const fillCol = C3.accent;
      return wrap(
        <div style={{...base, fontSize: size * 1.3, display: 'inline-flex', textShadow: 'none'}}>
          {chars.map((c, i) => {
            const k = tw(t, 0.2 + i * per, 0.2 + i * per + per * 1.6, 0, 1, (x) => x);
            const active = k > 0 && k < 1 && c !== ' ';
            return (
              <span key={i} style={{position: 'relative', display: 'inline-block', whiteSpace: 'pre'}}>
                <span style={{color: 'transparent', WebkitTextStroke: `3px ${fillCol}`, opacity: 0.9}}>{c}</span>
                <span style={{position: 'absolute', left: 0, top: 0, color: fillCol, clipPath: `inset(${(1 - k) * 100}% 0 0 0)`, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.45))'}}>{c}</span>
                {active && (
                  <>
                    <span style={{position: 'absolute', left: -4, right: -4, top: size * 0.06, bottom: size * 0.04, border: '2px dashed rgba(255,255,255,0.9)'}} />
                    {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], q) => <span key={q} style={{position: 'absolute', width: 10, height: 10, background: '#fff', left: x ? undefined : -9, right: x ? -9 : undefined, top: y ? undefined : size * 0.06 - 5, bottom: y ? size * 0.04 - 5 : undefined}} />)}
                    <span style={{position: 'absolute', left: 0, top: -30, fontFamily: 'monospace', fontSize: 22, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 0}}>{`${c.toUpperCase()}  ${Math.round(size * 0.46)} × ${Math.round(size * 1.1)}`}</span>
                  </>
                )}
              </span>
            );
          })}
        </div>,
      );
    }
    case 'gradient': {
      const sh = (t * 120) % 400;
      return wrap(<span style={{...base, textShadow: 'none', background: `linear-gradient(90deg, ${C3.accent}, ${C3.gold}, ${C3.copper}, #fff, ${C3.accent})`, backgroundSize: '400% 100%', backgroundPosition: `${sh}% 0`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', transform: `scale(${0.85 + 0.15 * tw(t, 0, 0.35, 0, 1, pop)})`, display: 'inline-block', filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.5))'}}>{text}</span>);
    }
    case 'blur-in':
      return wrap(
        <div style={base}>
          {chars.map((c, i) => {
            const k = tw(t, 0.1 + i * 0.09, 0.1 + i * 0.09 + 0.7);
            return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', filter: `blur(${(1 - k) * 26}px)`, opacity: k, transform: `translateY(${(1 - k) * 60}px) scale(${1.4 - 0.4 * k})`}}>{c}</span>;
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
