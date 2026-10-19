import React from 'react';
import {brand} from '../brand';
import {handFamily, heavyFamily, serifFamily} from '../fonts';
import {Caret, ClipTile, flyPose, typedSlice, useSpan} from './fourth';
import type {Fx} from './schema';
import {C3, GlobeIcon} from './theme';
import {anchorPx, fxRange, pop, tw, useFxEnv} from './util';

/** Sixth FX batch (C3 skin): editing-desk moments from the Claude edit reel. Cutaway panels are solid and brief; labels sit low, never over her face. */
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
const MONO = '"SF Mono", "Menlo", "Courier New", monospace';
const cap = (extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: C3.sans, fontWeight: 700, fontSize: 20, letterSpacing: 4, textTransform: 'uppercase', color: '#A5551F', ...extra});
const PANEL = 'linear-gradient(160deg,#1b1d1f,#0b0c0d)';

// ---------------------------------------------------------------- receipt ticket
const TORN = `polygon(${Array.from({length: 27}, (_, i) => `${(i / 26) * 100}% ${i % 2 ? 'calc(100% - 9px)' : '100%'}`).join(',')},100% 0,0 0)`;
export const ReceiptTicket: React.FC<{fx: Of<'receipt-ticket'>}> = ({fx}) => {
  const {abs, frame, t, outK} = useSpan(fx);
  const {label, no, to, text, total, y} = fx.props;
  const typeAt = fx.at + 0.8;
  const shown = typedSlice(text, abs, typeAt, typeAt + Math.max(0.9, text.length * 0.045));
  const done = shown.length >= text.length;
  const feed = tw(t, 0.1, 0.8, 0, 1, (x) => 1 - (1 - x) ** 3);
  const w = 540;
  const stamp = tw(abs, typeAt + Math.max(0.9, text.length * 0.045) + 0.2, typeAt + Math.max(0.9, text.length * 0.045) + 0.45, 0, 1, pop);
  const cs = Math.floor(abs * 100) % 100;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 540 - w / 2 - 20, top: y, width: w + 40, height: 18, borderRadius: 9, background: 'linear-gradient(180deg,#4a5054,#1a1c1e)', border: C3.hair, zIndex: 3, boxShadow: '0 6px 18px rgba(0,0,0,0.5)'}} />
      <div style={{position: 'absolute', left: 540 - w / 2, top: y + 10, width: w, overflow: 'hidden', height: 360 * feed + 4}}>
        <div style={{position: 'absolute', left: 0, top: -(1 - feed) * 340, width: w, background: '#fff', clipPath: TORN, padding: '22px 28px 40px', boxSizing: 'border-box', boxShadow: C3.cardShadow}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: 2, color: C3.cardText, textTransform: 'uppercase'}}><span>{label}</span><span>{no}</span></div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 16, color: C3.cardMuted}}><span>00:{String(Math.floor(abs) % 60).padStart(2, '0')}.{String(cs).padStart(2, '0')}</span><span>{to}</span></div>
          <div style={{borderTop: '2px dashed rgba(58,63,66,0.35)', margin: '12px 0'}} />
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 31, lineHeight: 1.25, color: C3.cardText, textTransform: 'uppercase', minHeight: 116}}>{shown}{!done && <Caret frame={frame} h={30} />}</div>
          <div style={{borderTop: '2px dashed rgba(58,63,66,0.35)', margin: '10px 0 8px', opacity: done ? 1 : 0}} />
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: 2, color: C3.cardText, opacity: done ? 1 : 0}}><span>TOTAL</span><span style={{transform: `scale(${0.7 + 0.3 * stamp})`, color: '#A5551F'}}>{total}</span></div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- frame calendar
export const FrameCalendar: React.FC<{fx: Of<'frame-calendar'>}> = ({fx}) => {
  const {t, len, outK} = useSpan(fx);
  const {days, label, thumbs} = fx.props;
  const cols = 6;
  const rows = Math.ceil(days / cols);
  const cell = 150;
  const gap = 10;
  const gw = cols * cell + (cols - 1) * gap;
  const gh = rows * cell + (rows - 1) * gap;
  const fillEnd = Math.max(0.8, len - 0.6);
  const filled = Math.floor(tw(t, 0.25, fillEnd, 0, days + 1, (x) => x * x));
  const step = Math.max(1, Math.floor(days / thumbs.length));
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{...FILL, background: PANEL, opacity: tw(t, 0, 0.25)}} />
      <div style={{position: 'absolute', left: 540 - gw / 2, top: 760 - gh / 2 + 60, width: gw}}>
        <div style={{...cap({fontSize: 24, color: C3.copper, marginBottom: 18}), opacity: tw(t, 0.1, 0.35)}}>{label}</div>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols},${cell}px)`, gap}}>
          {Array.from({length: days}, (_, i) => {
            const on = i < filled;
            const ti = on && i % step === 0 ? Math.floor(i / step) : -1;
            return (
              <div key={i} style={{width: cell, height: cell, borderRadius: 14, boxSizing: 'border-box', overflow: 'hidden', position: 'relative', border: on ? C3.hair : '1.5px solid rgba(255,255,255,0.16)', background: on ? C3.copperGrad : 'rgba(255,255,255,0.05)'}}>
                {ti >= 0 && ti < thumbs.length ? <ClipTile w={cell} h={cell} startSec={thumbs[ti]} zoom={1.4} focusY="8%" /> : !on && <div style={{fontFamily: MONO, fontSize: 22, color: 'rgba(255,255,255,0.35)', padding: '8px 10px'}}>{String(i + 1).padStart(2, '0')}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- cover frame (her clip as the cover photo)
const Barcode: React.FC = () => (
  <svg width={150} height={64} viewBox="0 0 150 64">
    <rect width="150" height="64" fill="#fff" />
    {Array.from({length: 38}, (_, i) => <rect key={i} x={6 + i * 3.6} y={6} width={i % 3 === 0 ? 2.6 : 1.4} height={46} fill="#1a1c1e" />)}
  </svg>
);
export const CoverFrame: React.FC<{fx: Of<'cover-frame'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {masthead, issue, headline, from} = fx.props;
  const k = tw(t, 0, 0.45, 0, 1, pop);
  const hk = tw(t, 0.7, 1.1);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{...FILL, background: PANEL, opacity: tw(t, 0, 0.2)}} />
      <div style={{position: 'absolute', left: 90, top: 330, width: 900, height: 1240, background: '#fff', border: C3.hair, boxSizing: 'border-box', borderRadius: 6, opacity: k, transform: `translateY(${(1 - k) * 80}px) scale(${0.94 + 0.06 * k})`, boxShadow: '0 40px 90px rgba(0,0,0,0.6)', overflow: 'hidden'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', padding: '26px 40px 0', ...cap({fontSize: 18, color: C3.cardMuted})}}><span>{issue ? issue.split('|')[0] : ''}</span><span>{issue ? issue.split('|')[1] ?? '' : ''}</span></div>
        <div style={{padding: '0 36px', fontFamily: serifFamily, fontWeight: 900, fontSize: Math.min(250, Math.floor(800 / (Math.max(3, masthead.length) * 0.66))), lineHeight: 1.0, letterSpacing: -4, color: brand.charcoal, textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'center', backgroundImage: C3.copperGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))'}}>{masthead}</div>
        <div style={{position: 'relative', margin: '10px 36px 0', height: 620, overflow: 'hidden', border: C3.hair}}>
          <ClipTile w={828} h={620} startSec={from} zoom={1.15} focusY="6%" />
          <div style={{position: 'absolute', right: 14, bottom: 14}}><Barcode /></div>
        </div>
        <div style={{padding: '34px 44px', textAlign: 'center', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 70, lineHeight: 1.1, color: C3.cardText, opacity: hk, transform: `translateY(${(1 - hk) * 20}px)`}}>{headline}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- keycap drop
const fall = (p: number) => (p < 0.55 ? (p / 0.55) ** 2 : p < 0.8 ? 1 - 0.14 * Math.sin(((p - 0.55) / 0.25) * Math.PI) : p < 0.93 ? 1 - 0.04 * Math.sin(((p - 0.8) / 0.13) * Math.PI) : 1);
export const KeycapDrop: React.FC<{fx: Of<'keycap-drop'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {keys, y} = fx.props;
  const n = keys.length;
  return (
    <div style={{...FILL, opacity: outK}}>
      {keys.map((k, i) => {
        const wide = k.key.length > 3;
        const w = wide ? 210 : 112;
        const col = i % 5;
        const row = Math.floor(i / 5);
        const rx = 540 + (col - 2) * 168 + (row % 2 ? 40 : -20) + ((i * 37) % 30) - 15;
        const ry = y + row * 128 + ((i * 53) % 26);
        const d = 0.05 + i * 0.1;
        const p = tw(t, d, d + 0.7, 0, 1, (x) => x);
        const dy = (1 - fall(p)) * -(ry + 200);
        const rot = (((i * 47) % 30) - 15) * (0.4 + 0.6 * tw(t, d, d + 0.7));
        return (
          <div key={i} style={{position: 'absolute', left: rx - w / 2, top: ry, width: w, height: 104, borderRadius: 20, background: i === n - 1 ? 'linear-gradient(145deg,#E03A37,#8d1214)' : 'linear-gradient(180deg,#fff,#dfe2e4)', border: C3.hair, boxSizing: 'border-box', transform: `translateY(${dy}px) rotate(${rot}deg)`, opacity: p > 0 ? 1 : 0, boxShadow: '0 10px 0 rgba(0,0,0,0.35), 0 18px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: wide ? 34 : 46, color: i === n - 1 ? '#fff' : C3.cardText}}>{k.key}</div>
            {k.sub && <div style={{fontFamily: C3.sans, fontWeight: 600, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: i === n - 1 ? 'rgba(255,255,255,0.8)' : C3.cardMuted}}>{k.sub}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- film strip review
export const FilmStrip: React.FC<{fx: Of<'film-strip'>}> = ({fx}) => {
  const {abs, t, inK, outK} = useSpan(fx);
  const {y, offsets, marks, label} = fx.props;
  const cols = Math.ceil(offsets.length / 2);
  const cw = 150;
  const ch = 98;
  const w = cols * (cw + 10) + 60;
  const loaded = tw(t, 0.2, 1.0, 0, offsets.length, (x) => x);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 540 - w / 2, top: y, width: w, background: '#fff', border: C3.hair, boxSizing: 'border-box', borderRadius: 22, padding: '16px 0 20px', opacity: inK, transform: `translateY(${(1 - inK) * 60}px)`, boxShadow: C3.cardShadow}}>
        <div style={{...cap({fontSize: 18, textAlign: 'center', marginBottom: 10})}}>{label}</div>
        {[0, 1].map((r) => (
          <div key={r} style={{margin: '0 24px 10px', padding: '8px 6px', background: '#1a1c1e', borderRadius: 8, display: 'flex', gap: 10, justifyContent: 'center'}}>
            {offsets.slice(r * cols, r * cols + cols).map((o, c) => {
              const i = r * cols + c;
              return <div key={i} style={{width: cw, height: ch, opacity: loaded > i ? 1 : 0.15, borderRadius: 4, overflow: 'hidden'}}><ClipTile w={cw} h={ch} startSec={o} zoom={1.3} focusY="6%" /></div>;
            })}
          </div>
        ))}
        <svg width={w} height={2 * (ch + 26)} style={{position: 'absolute', left: 0, top: 46, pointerEvents: 'none'}}>
          {marks.map((m, mi) => {
            const r = Math.floor(m.cell / cols);
            const c = m.cell % cols;
            const cx = 30 + 6 + c * (cw + 10) + cw / 2 + (w - 60 - cols * (cw + 10) + 10) / 2;
            const cy = r * (ch + 26) + ch / 2 + 8;
            const p = tw(abs, fx.at + (m.at ?? 1.4 + mi * 0.45), fx.at + (m.at ?? 1.4 + mi * 0.45) + 0.35, 0, 1, (x) => x);
            return m.kind === 'circle' ? (
              <ellipse key={mi} cx={cx} cy={cy} rx={cw / 2 + 6} ry={ch / 2 + 8} fill="none" stroke={brand.crimson} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform={`rotate(-3 ${cx} ${cy})`} />
            ) : (
              <g key={mi} stroke={brand.crimson} strokeWidth={6} strokeLinecap="round" pathLength={1}>
                <line x1={cx - cw / 2 + 8} y1={cy - ch / 2 + 6} x2={cx - cw / 2 + 8 + (cw - 16) * Math.min(1, p * 2)} y2={cy - ch / 2 + 6 + (ch - 12) * Math.min(1, p * 2)} />
                <line x1={cx + cw / 2 - 8} y1={cy - ch / 2 + 6} x2={cx + cw / 2 - 8 - (cw - 16) * Math.max(0, p * 2 - 1)} y2={cy - ch / 2 + 6 + (ch - 12) * Math.max(0, p * 2 - 1)} />
              </g>
            );
          })}
          {marks.filter((m) => m.label).map((m, mi) => {
            const r = Math.floor(m.cell / cols);
            const c = m.cell % cols;
            const cx = 30 + 6 + c * (cw + 10) + cw / 2 + (w - 60 - cols * (cw + 10) + 10) / 2;
            return <text key={`l${mi}`} x={cx} y={r * (ch + 26) - 2} textAnchor="middle" fontFamily={handFamily} fontWeight={700} fontSize={34} fill={brand.crimson} opacity={tw(abs, fx.at + (m.at ?? 1.4) + 0.3, fx.at + (m.at ?? 1.4) + 0.5)}>{m.label}</text>;
          })}
        </svg>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- phone frame (her clip inside a bezel on a solid field)
export const PhoneFrame: React.FC<{fx: Of<'phone-frame'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {from} = fx.props;
  const k = tw(t, 0, 0.7, 0, 1, (x) => 1 - (1 - x) ** 3);
  const s = 1.55 - 0.55 * k;
  const pw = 640;
  const ph = 1140;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{...FILL, background: PANEL, opacity: tw(t, 0, 0.2)}} />
      <div style={{position: 'absolute', left: 540 - pw / 2, top: 960 - ph / 2, width: pw, height: ph, transform: `scale(${s})`, borderRadius: 64, background: 'linear-gradient(145deg,#fff,#cfd3d5)', padding: 14, boxSizing: 'border-box', boxShadow: `0 40px 90px rgba(0,0,0,0.6), inset 0 0 0 3px ${C3.copper}`}}>
        <div style={{width: pw - 28, height: ph - 28, borderRadius: 50, overflow: 'hidden', position: 'relative', background: '#000'}}>
          <ClipTile w={pw - 28} h={ph - 28} startSec={from} zoom={1} focusY="0%" />
          <div style={{position: 'absolute', left: (pw - 28) / 2 - 56, top: 14, width: 112, height: 30, borderRadius: 15, background: '#0b0c0d'}} />
          <div style={{position: 'absolute', left: 30, right: 30, bottom: 26, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.4)'}}><div style={{width: `${tw(t, 0, fx.props.len ?? 4, 0, 100, (x) => x)}%`, height: 6, borderRadius: 3, background: C3.copperGrad}} /></div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- clip type (her clip plays inside giant letters)
export const ClipType: React.FC<{fx: Of<'clip-type'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {word, field, from} = fx.props;
  const lines = word.split('/');
  const maxC = Math.max(...lines.map((l) => l.length));
  const fs = Math.min(640, Math.floor(1900 / (maxC * 0.78)), Math.floor(1700 / (lines.length * 0.95)));
  const white = field === 'white';
  const k = tw(t, 0, 0.5, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK, background: white ? '#fff' : '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, overflow: 'hidden'}}>
        <ClipTile w={1080} h={1920} startSec={from} zoom={1.0} focusY="0%" />
      </div>
      <div style={{...FILL, background: white ? '#fff' : '#000', mixBlendMode: white ? 'screen' : 'multiply', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.92 + 0.08 * k})`}}>
        {lines.map((l, i) => <div key={i} style={{fontFamily: serifFamily, fontWeight: 900, fontSize: fs, lineHeight: 0.95, letterSpacing: -8, color: white ? '#000' : '#fff', textTransform: 'uppercase'}}>{l}</div>)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- storyboard wall
export const StoryboardWall: React.FC<{fx: Of<'storyboard-wall'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {offsets, y, rows} = fx.props;
  const per = Math.ceil(offsets.length / rows);
  const cw = 138;
  const chh = 220;
  return (
    <div style={{...FILL, opacity: outK}}>
      {offsets.map((o, i) => {
        const r = Math.floor(i / per);
        const c = i % per;
        const rowW = per * (cw + 12) - 12;
        const pose = flyPose('swoop', Math.max(0, t - i * 0.1), i, offsets.length, {x: 540 - rowW / 2 + c * (cw + 12) + cw / 2, y: y + r * (chh + 14) + chh / 2, rot: ((i * 7) % 5) - 2});
        return (
          <div key={i} style={{position: 'absolute', left: pose.x - cw / 2, top: pose.y - chh / 2, width: cw, height: chh, borderRadius: 14, overflow: 'hidden', border: C3.hair, boxSizing: 'border-box', opacity: pose.op, transform: `rotate(${pose.rot}deg) scale(${pose.sc})`, boxShadow: '0 12px 28px rgba(0,0,0,0.55)'}}>
            <ClipTile w={cw} h={chh} startSec={o} zoom={1.3} focusY="6%" />
            <div style={{position: 'absolute', left: 8, top: 8, minWidth: 28, height: 28, borderRadius: 14, background: C3.copperGrad, color: '#2a1206', fontFamily: C3.sans, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- step chips (one chip at a time, timed by you)
export const StepChips: React.FC<{fx: Of<'step-chips'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const {steps, y} = fx.props;
  const idx = steps.reduce((acc, s, i) => (abs >= s.at ? i : acc), -1);
  if (idx < 0) return null;
  const s = steps[idx];
  const k = tw(abs, s.at, s.at + 0.3, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 60, top: y, display: 'flex', alignItems: 'center', gap: 16, padding: '12px 28px 12px 14px', borderRadius: 40, background: C3.glass, border: C3.hair, opacity: k, transform: `translateX(${(1 - k) * -80}px)`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
        <div style={{width: 48, height: 48, borderRadius: 24, background: C3.copperGrad, color: '#2a1206', fontFamily: C3.sans, fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{String(idx + 1).padStart(2, '0')}</div>
        <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 34, color: '#fff'}}>{s.label}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- pen circle (hand-drawn ring, arrow and note, black and white grade)
export const PenCircle: React.FC<{fx: Of<'pen-circle'>}> = ({fx}) => {
  const {abs, t, frame, len, outK} = useSpan(fx);
  const {anchors} = useFxEnv();
  const {note, target, bw} = fx.props;
  const c = anchorPx(anchors, frame + Math.round(fx.at * 30), target);
  const rx = 200;
  const ry = 250;
  const cy = c.y + 20;
  const ring = tw(t, 0.15, 0.85, 0, 1, (x) => x);
  const arrow = tw(t, 0.85, 1.15, 0, 1, (x) => x);
  const word = tw(t, 1.0, 1.3);
  return (
    <div style={{...FILL, opacity: outK}}>
      {bw && <div style={{...FILL, backdropFilter: `grayscale(${tw(t, 0, 0.3)})`, WebkitBackdropFilter: `grayscale(${tw(t, 0, 0.3)})`}} />}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M ${c.x - rx * 0.2} ${cy - ry} C ${c.x + rx * 1.1} ${cy - ry * 1.05} ${c.x + rx * 1.15} ${cy + ry * 0.9} ${c.x - rx * 0.1} ${cy + ry} C ${c.x - rx * 1.2} ${cy + ry * 0.95} ${c.x - rx * 1.15} ${cy - ry * 0.85} ${c.x + rx * 0.35} ${cy - ry * 1.03}`} fill="none" stroke={brand.crimson} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
        {note && (
          <>
            <path d={`M ${c.x + rx + 70} ${cy - ry * 0.62} Q ${c.x + rx + 30} ${cy - ry * 0.5} ${c.x + rx - 4} ${cy - ry * 0.3}`} fill="none" stroke={brand.crimson} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrow} />
            <path d={`M ${c.x + rx - 4} ${cy - ry * 0.3} l 4 -34 M ${c.x + rx - 4} ${cy - ry * 0.3} l 32 -6`} fill="none" stroke={brand.crimson} strokeWidth={7} strokeLinecap="round" opacity={arrow > 0.95 ? 1 : 0} />
            <text x={c.x + rx + 80} y={cy - ry * 0.7} fontFamily={handFamily} fontWeight={700} fontSize={84} fill={brand.crimson} opacity={word} transform={`rotate(-6 ${c.x + rx + 80} ${cy - ry * 0.7})`}>{note}</text>
          </>
        )}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- caption stack (each line steps up in size)
export const CaptionStack: React.FC<{fx: Of<'caption-stack'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  const {words, y} = fx.props;
  let top = y;
  return (
    <div style={{...FILL, opacity: outK}}>
      {words.map((w, i) => {
        const fs = Math.round(40 * 1.28 ** i);
        const k = tw(t, 0.1 + i * 0.4, 0.45 + i * 0.4, 0, 1, pop);
        const h = Math.round(fs * 1.42);
        const el = (
          <div key={i} style={{position: 'absolute', left: 540 - 300, top, width: 600, display: 'flex', justifyContent: 'center', opacity: k, transform: `scale(${0.7 + 0.3 * k})`}}>
            <div style={{padding: `0 ${Math.round(fs * 0.4)}px`, height: h, display: 'flex', alignItems: 'center', background: C3.glass, border: C3.hair, borderRadius: 10, fontFamily: serifFamily, fontWeight: 600, fontSize: fs, color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 10px 24px rgba(0,0,0,0.5)'}}>{i === words.length - 1 ? <span style={{background: C3.copperGrad, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>{w}</span> : w}</div>
          </div>
        );
        top += h + 8;
        return el;
      })}
    </div>
  );
};

// ---------------------------------------------------------------- script panel (behind her: a scrolling script doc fills the screen, she stands in front at the bottom left)
export const scriptPanelCutout = (fx: Of<'script-panel'>, abs: number): React.CSSProperties => {
  const [a, b] = fxRange(fx);
  const k = tw(abs, a, a + 0.5) * (1 - tw(abs, b - 0.35, b));
  const fade = 'linear-gradient(90deg, transparent 0%, #000 12%, #000 80%, transparent 96%)';
  return {transform: `translateX(${-190 * k}px) scale(${1 - 0.46 * k})`, transformOrigin: '50% 100%', WebkitMaskImage: fade, maskImage: fade};
};
export const ScriptPanelPlate: React.FC<{fx: Of<'script-panel'>}> = ({fx}) => {
  const {t, len, outK} = useSpan(fx);
  const {title, beats, steps} = fx.props;
  const inK = tw(t, 0, 0.4);
  const cardH = 330;
  const total = beats.length * (cardH + 24);
  const view = 880;
  const scroll = tw(t, 0.6, len - 0.5, 0, Math.max(0, total - view), (x) => x * x * (3 - 2 * x));
  const [a] = fxRange(fx);
  const idx = steps.reduce((acc, s, i) => (t + a >= s.at ? i : acc), -1);
  const chip = idx >= 0 ? steps[idx] : null;
  const ck = chip ? tw(t + a, chip.at, chip.at + 0.3, 0, 1, pop) : 0;
  return (
    <div style={{...FILL, background: PANEL, opacity: inK * outK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 70, top: 110, width: 940, ...cap({fontSize: 24, color: C3.copper})}}>{title}</div>
      <div style={{position: 'absolute', left: 70, top: 170, width: 940, height: view, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg,transparent,#000 6%,#000 94%,transparent)', maskImage: 'linear-gradient(180deg,transparent,#000 6%,#000 94%,transparent)'}}>
        <div style={{transform: `translateY(${-scroll}px)`}}>
          {beats.map((b, i) => (
            <div key={i} style={{height: cardH, marginBottom: 24, borderRadius: 22, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(224,138,87,0.45)', boxSizing: 'border-box', padding: '22px 30px', overflow: 'hidden'}}>
              <div style={{display: 'flex', gap: 14, alignItems: 'center', ...cap({fontSize: 18, color: C3.copper})}}>
                <span style={{width: 34, height: 34, borderRadius: 17, background: C3.copperGrad, color: '#2a1206', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 0}}>{i + 1}</span>
                {b.time && <span>{b.time}</span>}
                {b.label && <span style={{color: 'rgba(255,255,255,0.55)'}}>{b.label}</span>}
              </div>
              <div style={{marginTop: 16, fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 600, fontSize: 40, lineHeight: 1.2, color: '#fff'}}>“{b.quote}”</div>
              {b.notes && b.notes.slice(0, 3).map((n, j) => <div key={j} style={{marginTop: 8, fontFamily: C3.sans, fontWeight: 500, fontSize: 24, lineHeight: 1.25, color: 'rgba(255,255,255,0.72)'}}>• {n}</div>)}
            </div>
          ))}
        </div>
      </div>
      {chip && (
        <div style={{position: 'absolute', left: 690, top: 1600, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px 10px 12px', borderRadius: 38, background: C3.glass, border: C3.hair, opacity: ck, transform: `translateX(${(1 - ck) * 60}px)`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>
          <div style={{width: 44, height: 44, borderRadius: 22, background: C3.copperGrad, color: '#2a1206', fontFamily: C3.sans, fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{String(idx + 1).padStart(2, '0')}</div>
          <div style={{fontFamily: C3.sans, fontWeight: 700, fontSize: 30, color: '#fff'}}>{chip.label}</div>
        </div>
      )}
    </div>
  );
};
export const sixthPlate = (fx: Fx): React.ReactNode => (fx.type === 'script-panel' ? <ScriptPanelPlate fx={fx} /> : null);

export const sixthOver = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'receipt-ticket': return <ReceiptTicket fx={fx} />;
    case 'frame-calendar': return <FrameCalendar fx={fx} />;
    case 'cover-frame': return <CoverFrame fx={fx} />;
    case 'keycap-drop': return <KeycapDrop fx={fx} />;
    case 'film-strip': return <FilmStrip fx={fx} />;
    case 'phone-frame': return <PhoneFrame fx={fx} />;
    case 'clip-type': return <ClipType fx={fx} />;
    case 'storyboard-wall': return <StoryboardWall fx={fx} />;
    case 'step-chips': return <StepChips fx={fx} />;
    case 'pen-circle': return <PenCircle fx={fx} />;
    case 'caption-stack': return <CaptionStack fx={fx} />;
    default: return null;
  }
};
