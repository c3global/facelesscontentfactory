import React from 'react';
import {brand} from '../brand';
import {handFamily, heavyFamily, serifFamily} from '../fonts';
import {metalTextStyle} from '../metal';
import {Caret, ClipTile, flyPose, typedSlice, useSpan} from './fourth';
import type {Fx} from './schema';
import {AppIcon, BrandAvatar, C3, CheckMark, GlobeIcon} from './theme';
import {easeInC, pop, tw} from './util';

/** Fifth FX batch (C3 skin): desk-object and UI moments from the reference reels. Pills and cards sit low and stay brief. */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
const MONO = '"SF Mono", "Menlo", "Courier New", monospace';
const cap = (extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: C3.sans, fontWeight: 700, fontSize: 21, letterSpacing: 4, textTransform: 'uppercase', color: '#A5551F', ...extra});

// ---------------------------------------------------------------- name tag
export const NameTag: React.FC<{fx: Of<'name-tag'>}> = ({fx}) => {
  const {inK, outK} = useSpan(fx);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 290, top: fx.props.y, width: 500, borderRadius: 24, overflow: 'hidden', background: '#fff', border: C3.hair, transform: `rotate(${-4 + (1 - inK) * 10}deg) scale(${0.6 + 0.4 * inK})`, opacity: inK, boxShadow: C3.cardShadow}}>
        <div style={{background: `linear-gradient(135deg,${brand.crimson},${brand.crimsonDeep})`, padding: '14px 0 10px', textAlign: 'center'}}>
          <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 56, letterSpacing: 8, color: '#fff'}}>{fx.props.top}</div>
          <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 26, letterSpacing: 3, color: 'rgba(255,255,255,0.85)'}}>{fx.props.sub}</div>
        </div>
        <div style={{padding: '14px 24px 20px', textAlign: 'center', fontFamily: handFamily, fontWeight: 700, fontSize: 108, lineHeight: 1, color: C3.cardText}}>{fx.props.name}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- planner grid
export const PlannerGrid: React.FC<{fx: Of<'planner-grid'>}> = ({fx}) => {
  const {abs, inK, outK, len} = useSpan(fx);
  const {days, rows, blocks, endWord, y} = fx.props;
  const clearAt = fx.props.clearAt ?? fx.at + len - 1.6;
  const colW = 800 / days.length;
  const rowH = 84;
  const clear = tw(abs, clearAt, clearAt + 0.5);
  const word = tw(abs, clearAt + 0.25, clearAt + 0.75, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 140, top: y, width: 800, borderRadius: 34, background: '#fff', border: C3.hair, boxSizing: 'border-box', padding: '0 0 16px', opacity: inK, transform: `scale(${0.94 + 0.06 * inK})`, boxShadow: C3.cardShadow, overflow: 'hidden'}}>
        <div style={{display: 'flex', height: 62, alignItems: 'center', background: '#f1f2f2', marginBottom: 10}}>
          {days.map((d) => <div key={d} style={{...cap({fontSize: 20, textAlign: 'center'}), width: colW}}>{d}</div>)}
        </div>
        <div style={{position: 'relative', height: rows * rowH}}>
          {Array.from({length: rows}).map((_, r) => <div key={r} style={{position: 'absolute', left: 14, right: 14, top: r * rowH, height: 1, background: 'rgba(58,63,66,0.14)'}} />)}
          {blocks.map(([d, r, n], i) => {
            const k = tw(abs, fx.at + 0.4 + i * 0.18, fx.at + 0.7 + i * 0.18, 0, 1, pop);
            return <div key={i} style={{position: 'absolute', left: d * colW + 10, top: r * rowH + 6, width: colW - 20, height: n * rowH - 12, borderRadius: 14, background: i % 3 === 0 ? `linear-gradient(135deg,${brand.crimson},${brand.crimsonDeep})` : i % 3 === 1 ? 'linear-gradient(135deg,#4a5054,#24282b)' : C3.copperGrad, opacity: k * (1 - clear), transform: `scale(${0.8 + 0.2 * k})`}} />;
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: (rows * rowH) / 2 - 80, textAlign: 'center', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 150, opacity: word, transform: `scale(${0.8 + 0.2 * word})`, ...metalTextStyle({kind: 'copper', variant: 'deep', frame: 0, shimmer: false})}}>{endWord}</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- dropdown select
export const DropdownSelect: React.FC<{fx: Of<'dropdown-select'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {options, pick, y} = fx.props;
  const openAt = fx.props.openAt ?? fx.at + 0.8;
  const pickAt = fx.props.pickAt ?? openAt + 1.2;
  const open = tw(abs, openAt, openAt + 0.3, 0, 1, pop);
  const picked = abs >= pickAt;
  const idx = Math.min(pick, options.length - 1);
  const rowH = 76;
  const cx = 360 + 80;
  const cy = y + 100 + (idx + 0.5) * rowH;
  const cur = tw(abs, openAt + 0.3, pickAt - 0.1, 0, 1);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 190, top: y, width: 700, opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`}}>
        <div style={{height: 96, borderRadius: 28, background: '#fff', border: C3.hair, boxSizing: 'border-box', padding: '10px 28px', boxShadow: C3.cardShadow}}>
          <div style={cap({fontSize: 18})}>{fx.props.label}</div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: C3.sans, fontWeight: 500, fontSize: 36, color: C3.cardText}}>
            <span>{picked ? options[idx] : fx.props.placeholder}</span><span style={{opacity: 0.6}}>⌄</span>
          </div>
        </div>
        {abs >= openAt && !picked && (
          <div style={{marginTop: 10, borderRadius: 26, background: '#fff', border: C3.hair, overflow: 'hidden', opacity: open, transform: `scaleY(${0.8 + 0.2 * open})`, transformOrigin: 'top', boxShadow: C3.cardShadow}}>
            {options.map((o, i) => (
              <div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', padding: '0 28px', fontFamily: C3.sans, fontWeight: 500, fontSize: 34, color: C3.cardText, background: i === idx && cur > 0.9 ? 'rgba(224,138,87,0.22)' : 'transparent'}}>{o}</div>
            ))}
          </div>
        )}
      </div>
      {abs >= openAt && !picked && (
        <svg width={46} height={46} viewBox="0 0 24 24" style={{position: 'absolute', left: 1000 - (1 - cur) * 0 + 0 - 300 - (1 - cur) * -260, top: cy - 6 + (1 - cur) * 40, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}}><path d="M5 3l14 8-6 2-3 6z" fill="#fff" stroke="#24282b" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      )}
      {picked && <div style={{position: 'absolute', left: 190 + 640, top: y + 44, transform: `scale(${tw(abs, pickAt, pickAt + 0.25, 0, 1, pop)})`}}><div style={{width: 50, height: 50, borderRadius: 25, background: C3.copperGrad, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><CheckMark size={30} color="#2a1206" /></div></div>}
      <div style={{display: 'none'}}>{cx}</div>
    </div>
  );
};

// ---------------------------------------------------------------- effort dial
export const EffortDial: React.FC<{fx: Of<'effort-dial'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {labels, y} = fx.props;
  const turnAt = fx.props.turnAt ?? fx.at + 0.7;
  const k = tw(abs, turnAt, turnAt + 1.3, 0, fx.props.to, (x) => x * x * (3 - 2 * x));
  const ang = -135 + 270 * k;
  const R = 130;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 340, top: y, width: 400, height: 400, borderRadius: 44, background: C3.glass, border: C3.hair, opacity: inK, transform: `scale(${0.92 + 0.08 * inK})`, boxShadow: C3.cardShadow}}>
        <div style={{...cap({textAlign: 'center', marginTop: 22, color: C3.copper})}}>{fx.props.label}</div>
        <svg width={400} height={330} viewBox="0 0 400 330">
          {labels.map((l, i) => {
            const a = ((-135 + (270 * i) / (labels.length - 1) - 90) * Math.PI) / 180;
            return <text key={i} x={200 + (R + 52) * Math.cos(a)} y={190 + (R + 52) * Math.sin(a) + 8} textAnchor="middle" fontFamily={C3.sans} fontWeight={700} fontSize={22} fill={k * (labels.length - 1) >= i - 0.05 ? '#fff' : 'rgba(255,255,255,0.45)'}>{l.toUpperCase()}</text>;
          })}
          <circle cx={200} cy={190} r={R} fill="url(#dg)" stroke="#E08A57" strokeWidth={5} />
          <defs><radialGradient id="dg" cx="35%" cy="30%"><stop offset="0" stopColor="#4a5054" /><stop offset="1" stopColor="#15181a" /></radialGradient></defs>
          <g transform={`rotate(${ang} 200 190)`}><rect x={192} y={190 - R + 12} width={16} height={46} rx={8} fill="#F4B08A" /></g>
        </svg>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- specimen card
export const SpecimenCard: React.FC<{fx: Of<'specimen-card'>}> = ({fx}) => {
  const {inK, outK} = useSpan(fx);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 390, top: fx.props.y, width: 300, height: 420, borderRadius: 26, background: '#fff', border: C3.hair, boxSizing: 'border-box', padding: 24, opacity: inK, transform: `rotate(${(1 - inK) * 8 - 3}deg) scale(${0.8 + 0.2 * inK})`, boxShadow: C3.cardShadow}}>
        <div style={cap({fontSize: 16})}>Typeface</div>
        <div style={{fontFamily: serifFamily, fontWeight: 600, fontSize: 160, lineHeight: 1.1, color: C3.cardText, marginTop: 12}}>{fx.props.sample}</div>
        <div style={{fontFamily: serifFamily, fontWeight: 700, fontSize: 38, color: C3.cardText, marginTop: 20}}>{fx.props.name}</div>
        {fx.props.role && <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 22, color: C3.cardMuted, marginTop: 4}}>{fx.props.role}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- pencil strike
export const PencilStrike: React.FC<{fx: Of<'pencil-strike'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {lines, strike, y} = fx.props;
  const strikeAt = fx.props.strikeAt ?? fx.at + 1.2;
  const k = tw(abs, strikeAt, strikeAt + 0.5, 0, 1, (x) => x);
  const rowH = 82;
  const top = 96;
  const sy = top + strike * rowH + rowH / 2;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 190, top: y, width: 700, height: top + lines.length * rowH + 22, borderRadius: 30, background: '#fff', border: C3.hair, boxSizing: 'border-box', opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <div style={{...cap({textAlign: 'center', paddingTop: 26, fontSize: 26, color: C3.cardText})}}>{fx.props.title}</div>
        {lines.map((l, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: top + i * rowH, height: rowH, textAlign: 'center', lineHeight: `${rowH}px`, fontFamily: C3.sans, fontWeight: 500, fontSize: 38, color: C3.cardText, opacity: i === strike ? 1 - 0.55 * k : 1}}>{l}</div>)}
        <svg width={700} height={top + lines.length * rowH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <line x1={80} y1={sy + 4} x2={80 + 540 * k} y2={sy - 2} stroke={C3.accent} strokeWidth={7} strokeLinecap="round" />
          {k > 0 && k < 1 && <g transform={`translate(${80 + 540 * k} ${sy - 2}) rotate(35)`}><rect x={-6} y={-96} width={14} height={90} rx={4} fill="#E08A57" /><polygon points="-6,-6 8,-6 1,12" fill="#f3d9c0" /></g>}
        </svg>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- stamp
export const Stamp: React.FC<{fx: Of<'stamp'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const k = tw(abs, fx.at, fx.at + 0.22, 0, 1, easeInC);
  const sc = 2.4 - 1.4 * k;
  const shake = abs > fx.at + 0.22 && abs < fx.at + 0.5 ? Math.sin(abs * 90) * 5 * (1 - (abs - fx.at - 0.22) / 0.28) : 0;
  const col = fx.props.tone === 'crimson' ? brand.crimson : '#B5622C';
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: fx.props.y, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateX(${shake}px) rotate(-7deg) scale(${sc})`}}>
        <div style={{padding: '6px 36px 10px', border: `10px solid ${col}`, borderRadius: 14, color: col, fontFamily: heavyFamily, fontSize: 130, letterSpacing: 4, textTransform: 'uppercase', background: 'rgba(255,255,255,0.12)', textShadow: '0 0 1px rgba(0,0,0,0.4)', opacity: 0.94}}>{fx.props.text}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- waitlist card
export const WaitlistCard: React.FC<{fx: Of<'waitlist-card'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const {rows, youRow, y} = fx.props;
  const youAt = fx.props.youAt ?? fx.at + 1.3;
  const hit = tw(abs, youAt, youAt + 0.3, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 200, top: y, width: 680, borderRadius: 30, background: '#fff', border: C3.hair, boxSizing: 'border-box', padding: '22px 28px 24px', opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}><div style={cap({fontSize: 22})}>{fx.props.title}</div>{fx.props.tag && <div style={cap({fontSize: 18, color: C3.cardMuted})}>{fx.props.tag}</div>}</div>
        {Array.from({length: rows}).map((_, i) => {
          const you = i === Math.min(youRow, rows - 1);
          return (
            <div key={i} style={{marginTop: 14, height: 76, borderRadius: 16, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20, background: you ? `rgba(224,138,87,${0.28 * hit})` : 'rgba(58,63,66,0.06)', border: you && hit > 0.5 ? '2px solid #E08A57' : '2px solid transparent'}}>
              <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 30, color: C3.cardMuted, width: 96, whiteSpace: 'nowrap'}}>No. {i + 1}</div>
              <div style={{flex: 1, fontFamily: handFamily, fontWeight: 700, fontSize: 56, lineHeight: 1, color: C3.cardText, opacity: you ? hit : 0}}>you</div>
              {you && <div style={{width: 50, height: 50, borderRadius: 25, background: C3.copperGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${hit})`}}><CheckMark size={30} color="#2a1206" /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- envelope open
export const EnvelopeOpen: React.FC<{fx: Of<'envelope-open'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const openAt = fx.props.openAt ?? fx.at + 1.4;
  const flap = tw(abs, openAt, openAt + 0.45);
  const rise = tw(abs, openAt + 0.3, openAt + 1.1);
  const seal = 1 - tw(abs, openAt - 0.05, openAt + 0.2);
  const W = 620;
  const H = 400;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 230, top: fx.props.y, width: W, height: H + 330, opacity: inK, transform: `scale(${0.9 + 0.1 * inK})`}}>
        <div style={{position: 'absolute', left: 30, top: 330 - rise * 300, width: W - 60, height: 380, borderRadius: 18, background: '#fff', border: C3.hair, boxSizing: 'border-box', padding: '26px 28px', boxShadow: '0 12px 30px rgba(0,0,0,0.4)', zIndex: 1}}>
          <div style={{fontFamily: serifFamily, fontWeight: 600, fontSize: 40, lineHeight: 1.1, color: C3.cardText}}>{fx.props.label}</div>
          {fx.props.lines.map((l, i) => <div key={i} style={{marginTop: 12, fontFamily: C3.sans, fontWeight: 500, fontSize: 26, color: C3.cardMuted}}>{l}</div>)}
          {fx.props.lines.length === 0 && [0, 1, 2].map((i) => <div key={i} style={{marginTop: 18, height: 12, width: `${90 - i * 18}%`, borderRadius: 6, background: 'rgba(58,63,66,0.14)'}} />)}
        </div>
        <div style={{position: 'absolute', left: 0, top: 330, width: W, height: H, borderRadius: 22, background: 'linear-gradient(160deg,#ffffff,#dfe2e3)', border: C3.hair, boxShadow: C3.cardShadow, zIndex: 2}}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}><path d={`M0 ${H} L${W / 2} ${H * 0.52} L${W} ${H}`} fill="none" stroke="rgba(58,63,66,0.22)" strokeWidth={3} /></svg>
        </div>
        <div style={{position: 'absolute', left: 0, top: 330, width: W, height: H / 2, zIndex: 3, transformOrigin: '50% 0%', transform: `perspective(900px) rotateX(${-flap * 175}deg)`, opacity: flap > 0.5 ? 0.0 : 1}}>
          <svg width={W} height={H / 2} viewBox={`0 0 ${W} ${H / 2}`}><polygon points={`0,0 ${W},0 ${W / 2},${H / 2}`} fill="#eceeef" stroke="#E08A57" strokeWidth={2.5} /></svg>
        </div>
        <div style={{position: 'absolute', left: W / 2 - 60, top: 330 + H / 2 - 62, width: 120, height: 120, borderRadius: 60, zIndex: 4, opacity: seal, transform: `scale(${0.8 + 0.2 * seal})`, background: C3.copperGrad, border: '4px solid #8d4a1f', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.45)'}}><GlobeIcon size={84} /></div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- testimonial stack
export const TestimonialStack: React.FC<{fx: Of<'testimonial-stack'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  return (
    <div style={{...FILL, opacity: outK}}>
      {fx.props.comments.map((c, i) => {
        const k = tw(t, 0.15 + i * 0.55, 0.5 + i * 0.55, 0, 1, pop);
        const pose = fx.props.fly === 'off' ? null : flyPose('swoop', Math.max(0, t - i * 0.4), i, 3, {x: 540, y: fx.props.y + i * 190 + 84, rot: 0});
        const box: React.CSSProperties = pose
          ? {left: 90 + (pose.x - 540), top: pose.y - 84, opacity: pose.op, transform: `rotate(${pose.rot * 0.35}deg) scale(${pose.sc})`}
          : {left: 90, top: fx.props.y + i * 190, opacity: k, transform: `translateX(${(1 - k) * 500}px)`};
        return (
          <div key={i} style={{position: 'absolute', width: 900, minHeight: 168, borderRadius: 32, background: '#fff', border: C3.hair, boxSizing: 'border-box', padding: '20px 28px', display: 'flex', gap: 20, boxShadow: C3.cardShadow, ...box}}>
            <div style={{flex: 'none', width: 72, height: 72, borderRadius: 36, background: C3.copperGrad, color: '#2a1206', fontFamily: C3.sans, fontWeight: 700, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.name.slice(0, 1)}</div>
            <div><div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 28, color: C3.cardText}}>{c.name}</div><div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 32, lineHeight: 1.25, color: C3.cardText}}>{c.text}</div></div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- render progress
export const RenderProgress: React.FC<{fx: Of<'render-progress'>}> = ({fx}) => {
  const {abs, inK, outK, len} = useSpan(fx);
  const p = tw(abs, fx.at + 0.5, fx.at + len - 1.0, 0, 1, (x) => x);
  const done = p >= 0.999;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 110, top: fx.props.y, width: 860, borderRadius: 30, background: '#fff', border: C3.hair, boxSizing: 'border-box', padding: '20px 26px 24px', opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}><div style={cap({fontSize: 22})}>{done ? fx.props.doneLabel : fx.props.label}</div><div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 30, color: C3.cardText}}>{Math.round(p * 100)}%</div></div>
        <div style={{display: 'flex', gap: 10, marginTop: 14}}>
          {[2, 6, 10, 14].map((o, i) => <div key={i} style={{opacity: p * 4 > i ? 1 : 0.25, borderRadius: 10, overflow: 'hidden'}}><ClipTile w={196} h={150} startSec={o} zoom={1.2} /></div>)}
        </div>
        <div style={{marginTop: 14, height: 14, borderRadius: 7, background: 'rgba(58,63,66,0.14)'}}><div style={{height: 14, borderRadius: 7, width: `${p * 100}%`, background: C3.copperGrad}} /></div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- feedback note
export const FeedbackNote: React.FC<{fx: Of<'feedback-note'>}> = ({fx}) => {
  const {abs, frame, inK, outK} = useSpan(fx);
  const typeAt = fx.props.typeAt ?? fx.at + 0.5;
  const shown = typedSlice(fx.props.text, abs, typeAt, typeAt + Math.max(1, fx.props.text.length * 0.04));
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 150, top: fx.props.y, width: 780, borderRadius: 30, background: '#fff', border: C3.hair, boxSizing: 'border-box', padding: '20px 26px 24px', opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><BrandAvatar size={52} /><div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 28, color: C3.cardText}}>{fx.props.name}</div></div>
        <div style={{marginTop: 12, fontFamily: C3.sans, fontWeight: 500, fontSize: 38, lineHeight: 1.25, color: C3.cardText, minHeight: 100}}>{shown}<Caret frame={frame} h={38} /></div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- leaderboard
const Trophy: React.FC = () => (
  <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke="#E3BF63" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M12 14v4M8 20h8" /></svg>
);
export const Leaderboard: React.FC<{fx: Of<'leaderboard'>}> = ({fx}) => {
  const {t, inK, outK} = useSpan(fx);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 190, top: fx.props.y, width: 700, borderRadius: 30, background: C3.glass, border: C3.hair, boxSizing: 'border-box', padding: '18px 20px 20px', opacity: inK, boxShadow: C3.cardShadow}}>
        {fx.props.title && <div style={{...cap({color: C3.copper, padding: '4px 12px 10px'})}}>{fx.props.title}</div>}
        {fx.props.items.map((it, i) => {
          const k = tw(t, 0.25 + i * 0.22, 0.55 + i * 0.22, 0, 1, pop);
          return (
            <div key={i} style={{height: 76, marginTop: 8, borderRadius: 18, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20, opacity: k, transform: `translateX(${(1 - k) * 80}px)`, background: i === 0 ? 'linear-gradient(135deg,rgba(224,138,87,0.55),rgba(181,98,44,0.4))' : 'rgba(255,255,255,0.08)', border: i === 0 ? '1.5px solid #E08A57' : '1.5px solid transparent'}}>
              <div style={{width: 46, height: 46, borderRadius: 12, background: i === 0 ? C3.copperGrad : 'rgba(255,255,255,0.14)', color: i === 0 ? '#2a1206' : '#fff', fontFamily: C3.sans, fontWeight: 700, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
              <div style={{flex: 1, fontFamily: C3.sans, fontWeight: 700, fontSize: 34, color: '#fff'}}>{it}</div>
              {i === 0 && <Trophy />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- countdown timer
export const CountdownTimer: React.FC<{fx: Of<'countdown-timer'>}> = ({fx}) => {
  const {abs, inK, outK, len} = useSpan(fx);
  const p = tw(abs, fx.at + 0.3, fx.at + len - 0.7, 0, 1, (x) => x);
  const v = Math.round(fx.props.from + (fx.props.to - fx.props.from) * p);
  const R = 150;
  const C = 2 * Math.PI * R;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 340, top: fx.props.y, width: 400, opacity: inK, transform: `scale(${0.9 + 0.1 * inK})`, textAlign: 'center'}}>
        <svg width={400} height={400} viewBox="0 0 400 400" style={{filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.5))'}}>
          <circle cx={200} cy={200} r={R + 24} fill="rgba(12,13,15,0.88)" />
          <circle cx={200} cy={200} r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={16} />
          <circle cx={200} cy={200} r={R} fill="none" stroke="#E08A57" strokeWidth={16} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 200 200)" />
          <text x={200} y={224} textAnchor="middle" fontFamily={serifFamily} fontWeight={600} fontSize={120} fill="#fff">{v}</text>
          <text x={200} y={276} textAnchor="middle" fontFamily={C3.sans} fontWeight={700} fontSize={26} letterSpacing={4} fill="#E08A57">{fx.props.unit.toUpperCase()}</text>
        </svg>
        {fx.props.label && <div style={{marginTop: 4, fontFamily: C3.sans, fontWeight: 700, fontSize: 34, color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,0.9)'}}>{fx.props.label}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- terminal typing
export const TerminalType: React.FC<{fx: Of<'terminal-type'>}> = ({fx}) => {
  const {abs, frame, inK, outK} = useSpan(fx);
  const lines = fx.props.lines;
  let t0 = fx.at + 0.5;
  const rows = lines.map((l, i) => {
    const at = l.at ?? t0;
    const dur = Math.max(0.6, l.text.length * 0.035);
    t0 = at + dur + 0.35;
    return {l, at, dur, i};
  });
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 90, top: fx.props.y, width: 900, borderRadius: 26, background: 'rgba(14,15,17,0.94)', border: C3.hair, boxSizing: 'border-box', padding: '16px 26px 26px', opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <div style={{display: 'flex', gap: 10, marginBottom: 16}}>{['#C91B19', '#E3BF63', '#7a8085'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />)}</div>
        {rows.map(({l, at, dur, i}) => abs >= at && (
          <div key={i} style={{fontFamily: MONO, fontSize: 34, lineHeight: 1.45, color: i === rows.length - 1 ? '#fff' : 'rgba(255,255,255,0.78)'}}>
            <span style={{color: '#E08A57'}}>{'> '}</span>{typedSlice(l.text, abs, at, at + dur)}
            {i === rows.findIndex((r) => abs < r.at + r.dur) && <Caret frame={frame} h={34} color="#E08A57" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- toggle switch
export const ToggleSwitch: React.FC<{fx: Of<'toggle-switch'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const flipAt = fx.props.flipAt ?? fx.at + 1.0;
  const k = tw(abs, flipAt, flipAt + 0.22, 0, 1, (x) => x);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 140, top: fx.props.y, width: 800, height: 128, borderRadius: 36, background: '#fff', border: C3.hair, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 22, opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <AppIcon size={80} glyph={fx.props.glyph} tone="white" />
        <div style={{flex: 1}}>
          <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 40, color: C3.cardText}}>{fx.props.label}</div>
          {fx.props.sub && <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 24, color: k > 0.5 ? '#A5551F' : C3.cardMuted}}>{k > 0.5 ? `Connected · ${fx.props.sub}` : fx.props.sub}</div>}
        </div>
        <div style={{width: 112, height: 62, borderRadius: 31, background: k > 0.5 ? C3.copperGrad : 'rgba(58,63,66,0.25)', position: 'relative'}}>
          <div style={{position: 'absolute', top: 5, left: 5 + 50 * k, width: 52, height: 52, borderRadius: 26, background: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,0.35)'}} />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- generating tiles
export const GeneratingTiles: React.FC<{fx: Of<'generating-tiles'>}> = ({fx}) => {
  const {abs, t, inK, outK} = useSpan(fx);
  const g = fx.props.glyphs;
  const S = 250;
  return (
    <div style={{...FILL, opacity: outK}}>
      {g.map((gl, i) => {
        const x = 540 + ((i % 2) - 0.5) * (S + 22) - S / 2;
        const y = fx.props.y + Math.floor(i / 2) * (S + 22);
        const resolveAt = fx.at + 1.0 + i * 0.4;
        const res = tw(abs, resolveAt, resolveAt + 0.35, 0, 1, pop);
        const shimmer = (Math.sin(t * 6 + i) + 1) / 2;
        const pose = fx.props.fly === 'off' ? null : flyPose('swoop', t, i, g.length, {x: x + S / 2, y: y + S / 2, rot: 0});
        const box: React.CSSProperties = pose
          ? {left: pose.x - S / 2, top: pose.y - S / 2, opacity: pose.op, transform: `rotate(${pose.rot}deg) scale(${pose.sc})`}
          : {left: x, top: y, opacity: inK, transform: `scale(${0.85 + 0.15 * inK})`};
        return (
          <div key={i} style={{position: 'absolute', width: S, height: S, borderRadius: 28, overflow: 'hidden', border: C3.hair, boxSizing: 'border-box', background: `linear-gradient(135deg,rgba(255,255,255,${0.14 + 0.1 * shimmer}),rgba(255,255,255,0.05))`, boxShadow: C3.cardShadow, ...box}}>
            {res < 0.05 && <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center', ...cap({fontSize: 18, color: 'rgba(255,255,255,0.7)'})}}>{fx.props.label}</div>}
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', opacity: res}}><AppIcon size={S * 0.82} glyph={gl} tone="white" /></div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- follow card
export const FollowCard: React.FC<{fx: Of<'follow-card'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const followAt = fx.props.followAt ?? fx.at + 1.0;
  const on = abs >= followAt;
  const press = tw(abs, followAt - 0.08, followAt, 0, 1) * (1 - tw(abs, followAt, followAt + 0.18));
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 150, top: fx.props.y, width: 780, height: 118, borderRadius: 59, background: '#fff', border: C3.hair, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 18, opacity: inK, transform: `translateY(${(1 - inK) * 40}px)`, boxShadow: C3.cardShadow}}>
        <BrandAvatar size={84} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 36, color: C3.cardText}}>{fx.props.handle}</div>
          {fx.props.sub && <div style={{fontFamily: C3.sans, fontWeight: 500, fontSize: 24, color: C3.cardMuted}}>{fx.props.sub}</div>}
        </div>
        <div style={{padding: '0 34px', height: 70, borderRadius: 35, display: 'flex', alignItems: 'center', fontFamily: C3.sans, fontWeight: 700, fontSize: 32, color: on ? C3.cardText : '#fff', background: on ? 'transparent' : C3.accent, border: on ? '2px solid rgba(58,63,66,0.35)' : '2px solid transparent', transform: `scale(${1 - 0.1 * press})`}}>{on ? 'Following' : 'Follow'}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- defocus
export const Defocus: React.FC<{fx: Of<'defocus'>}> = ({fx}) => {
  const {t, len} = useSpan(fx);
  const k = Math.sin(Math.PI * tw(t, 0, len, 0, 1, (x) => x));
  return <div style={{...FILL, backdropFilter: `blur(${fx.props.peak * k}px)`, WebkitBackdropFilter: `blur(${fx.props.peak * k}px)`}} />;
};

// ---------------------------------------------------------------- reel stack (cards in perspective)
export const ReelStack: React.FC<{fx: Of<'reel-stack'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const offs = fx.props.offsets;
  return (
    <div style={{...FILL, opacity: outK, perspective: 1800}}>
      {offs.map((o, i) => {
        const k = tw(t, 0.1 + i * 0.18, 0.55 + i * 0.18, 0, 1, pop);
        const n = offs.length;
        const x = 540 + (i - (n - 1) / 2) * 250 - 150;
        const top = fx.props.y + Math.abs(i - (n - 1) / 2) * 24;
        const pose = fx.props.fly === 'off' ? null : flyPose('swoop', t, i, n, {x: x + 150, y: top + 260, rot: 0});
        const tilt = (i - (n - 1) / 2) * -24;
        const box: React.CSSProperties = pose
          ? {left: pose.x - 150, top: pose.y - 260, opacity: pose.op, transform: `rotateY(${tilt}deg) rotate(${pose.rot}deg) scale(${pose.sc})`}
          : {left: x, top, opacity: k, transform: `rotateY(${tilt}deg) translateY(${(1 - k) * 160}px)`};
        return (
          <div key={i} style={{position: 'absolute', width: 300, height: 520, borderRadius: 26, overflow: 'hidden', border: C3.hair, boxSizing: 'border-box', boxShadow: '0 24px 50px rgba(0,0,0,0.6)', zIndex: 10 - Math.abs(i - (n - 1) / 2), ...box}}>
            <ClipTile w={300} h={520} startSec={o} zoom={1.4} />
            <div style={{position: 'absolute', left: 16, bottom: 16, padding: '6px 16px', borderRadius: 18, background: 'rgba(12,13,15,0.85)', color: '#fff', fontFamily: C3.sans, fontWeight: 700, fontSize: 20, opacity: tw(t, 0.9 + i * 0.2, 1.1 + i * 0.2)}}>{fx.props.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export const fifthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'name-tag': return <NameTag fx={fx} />;
    case 'planner-grid': return <PlannerGrid fx={fx} />;
    case 'dropdown-select': return <DropdownSelect fx={fx} />;
    case 'effort-dial': return <EffortDial fx={fx} />;
    case 'specimen-card': return <SpecimenCard fx={fx} />;
    case 'pencil-strike': return <PencilStrike fx={fx} />;
    case 'stamp': return <Stamp fx={fx} />;
    case 'waitlist-card': return <WaitlistCard fx={fx} />;
    case 'envelope-open': return <EnvelopeOpen fx={fx} />;
    case 'testimonial-stack': return <TestimonialStack fx={fx} />;
    case 'render-progress': return <RenderProgress fx={fx} />;
    case 'feedback-note': return <FeedbackNote fx={fx} />;
    case 'leaderboard': return <Leaderboard fx={fx} />;
    case 'countdown-timer': return <CountdownTimer fx={fx} />;
    case 'terminal-type': return <TerminalType fx={fx} />;
    case 'toggle-switch': return <ToggleSwitch fx={fx} />;
    case 'generating-tiles': return <GeneratingTiles fx={fx} />;
    case 'follow-card': return <FollowCard fx={fx} />;
    case 'defocus': return <Defocus fx={fx} />;
    case 'reel-stack': return <ReelStack fx={fx} />;
    default: return null;
  }
};
