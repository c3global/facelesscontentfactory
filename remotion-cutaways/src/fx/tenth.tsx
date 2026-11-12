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
    case 'focus':
      return wrap(<FocusLine text={text} t={t} size={size * 0.55} />);
    case 'glass':
      return wrap(<GlassLine text={text} t={t} size={size} id={`g${fx.at}`} />);
    case 'fill':
      return wrap(<FillLine text={text} t={t} size={size} />);
    case 'stack':
      // his opener: a glass word, a red word that is drawn on guide lines and filled, then a focus line
      return (
        <div style={{...FILL, opacity: outK}}>
          <div style={{position: 'absolute', left: 0, width: 1080, top: y - size * 1.25, textAlign: 'center'}}><GlassLine text={text} t={t} size={size} id={`g${fx.at}`} /></div>
          <div style={{position: 'absolute', left: 0, width: 1080, top: y + size * 0.05, textAlign: 'center'}}><FillLine text={fx.props.line2 ?? ''} t={t - 0.9} size={size} /></div>
          <div style={{position: 'absolute', left: 0, width: 1080, top: y + size * 1.55, textAlign: 'center'}}><FocusLine text={fx.props.line3 ?? ''} t={t - 1.6} size={size * 0.42} /></div>
        </div>
      );
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


// ---------------------------------------------------------------- the three building blocks of his opener
/** chrome glass letters: dark clear body, chrome rim, build in, white gloss running letter by letter, a twinkling sparkle */
export const GlassLine: React.FC<{text: string; t: number; size: number; id: string}> = ({text, t, size, id}) => {
  if (t < 0 || !text) return null;
  const chars = [...text];
  const n = chars.length;
  const fs = size * 1.15;
  const W = Math.min(1020, fs * 0.66 * n);
  const x0 = 540 - W / 2;
  const k = tw(t, 0, 0.5, 0, 1, pop);
  const flash = t > 0.9 ? Math.floor((t - 0.9) / 0.09) % (n + 14) : -1;
  const sp = Math.floor(t / 1.1);
  const spT = (t % 1.1) / 1.1;
  const spI = Math.floor(hash(sp + 4) * n);
  const spX = x0 + (W * (spI + 0.75)) / n;
  const spS = Math.sin(Math.min(1, spT * 2) * Math.PI) * 26;
  const bx = -200 + ((t / 1.8) % 1) * 1500;
  const font: React.CSSProperties = {fontFamily: C3.sans, fontWeight: 900, fontSize: fs, letterSpacing: -3};
  const T = (props: React.SVGProps<SVGTextElement>, kids: React.ReactNode) => (
    <text x={x0} y={fs * 0.95} textLength={W} lengthAdjust="spacingAndGlyphs" style={font} {...props}>{kids}</text>
  );
  return (
    <svg width={1080} height={fs * 1.2} viewBox={`0 0 1080 ${fs * 1.2}`} style={{overflow: 'visible', opacity: Math.min(1, t * 4), transform: `scale(${0.85 + 0.15 * k})`, filter: `blur(${(1 - k) * 10}px) drop-shadow(0 10px 26px rgba(0,0,0,0.55))`}}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3b3f" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#18191b" stopOpacity="0.35" />
          <stop offset="1" stopColor="#0c0c0d" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.3" stopColor="#7d7f84" />
          <stop offset="0.55" stopColor="#f2f2f2" />
          <stop offset="0.8" stopColor="#4b4c50" />
          <stop offset="1" stopColor="#d9d9d9" />
        </linearGradient>
        <linearGradient id={`${id}h`} gradientUnits="userSpaceOnUse" x1={bx - 140} y1={0} x2={bx + 140} y2={fs * 0.6}>
          <stop offset="0" stopColor={C3.copper} stopOpacity="0" />
          <stop offset="0.5" stopColor={C3.copper} stopOpacity="0.55" />
          <stop offset="1" stopColor={C3.copper} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bfc3c9" />
        </linearGradient>
      </defs>
      {T({fill: `url(#${id}b)`, stroke: `url(#${id}r)`, strokeWidth: 5}, chars.map((c, i) => <tspan key={i} opacity={tw(t, i * 0.04, i * 0.04 + 0.3)} fill={i === flash || i === flash - 1 ? `url(#${id}w)` : undefined}>{c}</tspan>))}
      {T({fill: `url(#${id}h)`}, text)}
      {T({fill: 'none', stroke: 'rgba(255,255,255,0.55)', strokeWidth: 1.2, transform: 'translate(-2 -3)'}, text)}
      {spS > 0.5 && (
        <path transform={`translate(${spX} ${fs * 0.12}) scale(${spS / 20})`} d="M0 -20 C2 -4 4 -2 20 0 C4 2 2 4 0 20 C-2 4 -4 2 -20 0 C-4 -2 -2 -4 0 -20Z" fill="#fff" style={{filter: 'drop-shadow(0 0 8px #fff)'}} />
      )}
    </svg>
  );
};

/** red letters drawn on type guide lines: guides and a wireframe draw in, color rises bottom to top, then an inspect box hops letter to letter */
export const FillLine: React.FC<{text: string; t: number; size: number}> = ({text, t, size}) => {
  if (t < 0 || !text) return null;
  const chars = [...text];
  const fs = size * 1.15;
  const col = C3.accent;
  const g = tw(t, 0, 0.45) * (1 - tw(t, 1.7, 2.1));
  const guides: [string, number][] = [['cap height', 0.13], ['x-height', 0.3], ['baseline', 0.93], ['descender', 1.04]];
  const letters = chars.map((c, i) => ({c, i})).filter((x) => x.c !== ' ');
  const insp = t > 1.6 ? letters[Math.floor((t - 1.6) / 0.38) % letters.length].i : -1;
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      {guides.map(([lab, f]) => (
        <div key={lab} style={{position: 'absolute', left: -40, width: `calc((100% + 80px) * ${g})`, top: fs * f, height: 0, borderTop: '1px dashed rgba(255,255,255,0.6)', opacity: g}}>
          <span style={{position: 'absolute', left: 0, top: -18, fontFamily: 'monospace', fontSize: 15, color: 'rgba(255,255,255,0.8)'}}>{lab}</span>
        </div>
      ))}
      <div style={{display: 'inline-flex', fontFamily: heavyFamily, fontSize: fs, lineHeight: 1.08, letterSpacing: 2}}>
        {chars.map((c, i) => {
          const st = 0.45 + hash(i + 2) * 0.4;
          const k = tw(t, st, st + 0.55, 0, 1, (x) => x);
          const on = i === insp;
          return (
            <span key={i} style={{position: 'relative', display: 'inline-block', whiteSpace: 'pre'}}>
              <span style={{color: 'transparent', WebkitTextStroke: `1.5px ${on ? '#fff' : 'rgba(255,255,255,0.75)'}`, opacity: tw(t, 0.15, 0.45)}}>{c}</span>
              <span style={{position: 'absolute', left: 0, top: 0, color: col, opacity: on ? 0.3 : 1, clipPath: `inset(${(1 - k) * 100}% 0 0 0)`, filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.45))'}}>{c}</span>
              {on && (
                <>
                  <span style={{position: 'absolute', left: -3, right: -3, top: fs * 0.1, bottom: fs * 0.06, border: '1.5px dashed rgba(255,255,255,0.95)'}} />
                  {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, yy], q) => <span key={q} style={{position: 'absolute', width: 9, height: 9, background: '#fff', left: x ? undefined : -7, right: x ? -7 : undefined, top: yy ? undefined : fs * 0.1 - 4, bottom: yy ? fs * 0.06 - 4 : undefined}} />)}
                  <span style={{position: 'absolute', left: 0, top: -6, fontFamily: 'monospace', fontSize: 17, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 0}}>{`${c.toUpperCase()}  ${Math.round(fs * (0.4 + hash(i) * 0.12))} × ${Math.round(fs * 1.02)}`}</span>
                </>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** words blur in left to right, then a bracket frame jumps word to word while the rest stay soft */
export const FocusLine: React.FC<{text: string; t: number; size: number}> = ({text, t, size}) => {
  if (t < 0 || !text) return null;
  const words = text.split(' ');
  const cur = t > 0.8 ? Math.floor((t - 0.8) / 0.42) % words.length : -1;
  return (
    <div style={{display: 'inline-flex', gap: size * 0.32, fontFamily: C3.sans, fontWeight: 800, fontSize: size, color: '#fff', letterSpacing: 1, textShadow: '0 4px 18px rgba(0,0,0,0.5)'}}>
      {words.map((w, i) => {
        const r = tw(t, i * 0.12, i * 0.12 + 0.4);
        const on = i === cur;
        const blur = (1 - r) * 16 + (cur >= 0 && !on ? 5 : 0);
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', padding: '2px 8px'}}>
            <span style={{filter: `blur(${blur}px)`, opacity: r * (cur >= 0 && !on ? 0.6 : 1)}}>{w}</span>
            {on && ['tl', 'tr', 'bl', 'br'].map((p) => (
              <span key={p} style={{position: 'absolute', width: 16, height: 16, left: p[1] === 'l' ? -2 : undefined, right: p[1] === 'r' ? -2 : undefined, top: p[0] === 't' ? -4 : undefined, bottom: p[0] === 'b' ? -4 : undefined, borderStyle: 'solid', borderColor: C3.copper, borderWidth: `${p[0] === 't' ? 3 : 0}px ${p[1] === 'r' ? 3 : 0}px ${p[0] === 'b' ? 3 : 0}px ${p[1] === 'l' ? 3 : 0}px`}} />
            ))}
          </span>
        );
      })}
    </div>
  );
};

export const tenthOver = (fx: Fx): React.ReactNode => (fx.type === 'text-pop' ? <TextPop fx={fx} /> : null);
