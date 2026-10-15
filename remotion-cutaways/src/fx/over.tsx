import React from 'react';
import {Freeze, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {brand} from '../brand';
import {handFamily, heavyFamily, sansFamily, serifFamily} from '../fonts';
import {metalFill, metalTextStyle} from '../metal';
import {Cutout} from './behind';
import type {Fx} from './schema';
import {anchorPx, fxRange, pop, tw, useFxEnv, useFxTime} from './util';

type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const FILL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};
const SANS = sansFamily('DM Sans');
const GLASS = 'rgba(12,13,15,0.82)';
const HAIR = '1.5px solid rgba(213,170,74,0.75)';

const useSpan = (fx: Fx) => {
  const [a, b] = fxRange(fx);
  const {t, abs, frame, fps} = useFxTime(a);
  const len = b - a;
  return {a, b, len, t, abs, frame, fps, inK: tw(t, 0, 0.3, 0, 1, pop), outK: 1 - tw(t, len - 0.3, len)};
};

// ---------------------------------------------------------------- the stack
export const TheStack: React.FC<{fx: Of<'the-stack'>}> = ({fx}) => {
  const {t, outK} = useSpan(fx);
  return (
    <div style={{...FILL, opacity: outK}}>
      {fx.props.rows.map((r, i) => {
        const rt = r.at !== undefined ? r.at - fx.at : 0.15 + i * 0.22;
        const k = tw(t, rt, rt + 0.35, 0, 1, pop);
        const bar = tw(t, rt + 0.3, rt + 1.3);
        return (
          <div key={i} style={{position: 'absolute', left: 54 + i * 10, top: 1120 + i * 170, width: 960 - i * 20, height: 156, borderRadius: 30, background: GLASS, border: HAIR, boxSizing: 'border-box', padding: '16px 34px', opacity: k, transform: `translateY(${(1 - k) * 60}px) scale(${0.94 + 0.06 * k})`, boxShadow: '0 18px 40px rgba(0,0,0,0.5)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.86)'}}>{r.label}</div>
              <div style={{fontFamily: heavyFamily, fontSize: 62, ...metalTextStyle({kind: 'copper', variant: 'bright', frame: 0, shimmer: false})}}>{r.display}</div>
            </div>
            <div style={{marginTop: 8, height: 20, borderRadius: 11, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
              <div style={{width: `${r.value * bar}%`, height: '100%', borderRadius: 11, ...metalFill({kind: 'copper', variant: 'bright', frame: 0, shimmer: false})}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- sticky text
export const StickyText: React.FC<{fx: Of<'sticky-text'>}> = ({fx}) => {
  const {abs, fps, inK, outK} = useSpan(fx);
  const {anchors} = useFxEnv();
  const p = anchorPx(anchors, Math.round(abs * fps), fx.props.anchor);
  return (
    <div style={{...FILL}}>
      <div style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%, -125%) rotate(-5deg) scale(${inK * outK})`, transformOrigin: '50% 120%'}}>
        <div style={{padding: '12px 30px 8px', borderRadius: 18, fontFamily: heavyFamily, fontSize: 74, letterSpacing: 2, color: '#2a1206', textTransform: 'uppercase', ...metalFill({kind: 'copper', variant: 'bright', frame: 0, shimmer: false}), boxShadow: '0 10px 26px rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>{fx.props.text}</div>
        <div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '22px solid #B5622C'}} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- freeze + label / pointer callouts share the line-to-her drawing
const Pointer: React.FC<{x: number; y: number; cx: number; cy: number; k: number}> = ({x, y, cx, cy, k}) => {
  const len = Math.hypot(cx - x, cy - y);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <line x1={cx} y1={cy} x2={x} y2={y} stroke="#E3BF63" strokeWidth={4} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} />
      <circle cx={x} cy={y} r={14 * k} fill="#C91B19" stroke="#FFF3C9" strokeWidth={4} />
    </svg>
  );
};
const CalloutCard: React.FC<{text: string; left: boolean; y: number; k: number}> = ({text, left, y, k}) => (
  <div style={{position: 'absolute', top: y, [left ? 'left' : 'right']: 36, width: 400, padding: '22px 28px', borderRadius: 26, background: GLASS, border: HAIR, boxSizing: 'border-box', fontFamily: SANS, fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: brand.white, opacity: k, transform: `scale(${0.88 + 0.12 * k})`, boxShadow: '0 14px 34px rgba(0,0,0,0.5)'}}>{text}</div>
);

export const FreezeLabel: React.FC<{fx: Of<'freeze-label'>}> = ({fx}) => {
  const {a, abs, fps, outK, t} = useSpan(fx);
  const {anchors, video} = useFxEnv();
  const flash = 1 - tw(t, 0, 0.14);
  return (
    <div style={{...FILL, opacity: outK}}>
      <Freeze frame={0}>
        <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover', filter: 'saturate(1.08) contrast(1.06)'}} />
      </Freeze>
      <div style={{...FILL, background: '#fff', opacity: flash * 0.85}} />
      {fx.props.labels.map((l, i) => {
        const k = tw(abs, l.at, l.at + 0.35, 0, 1, pop);
        const p = anchorPx(anchors, Math.round(a * fps), l.target);
        const left = i % 2 === 0;
        const y = 250 + i * 230;
        return (
          <React.Fragment key={i}>
            <Pointer x={left ? 436 : 1080 - 436} y={y + 55} cx={p.x} cy={p.y} k={tw(abs, l.at + 0.1, l.at + 0.45)} />
            <CalloutCard text={l.text} left={left} y={y} k={k} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const PointerCallout: React.FC<{fx: Of<'pointer-callout'>}> = ({fx}) => {
  const {abs, fps, outK} = useSpan(fx);
  const {anchors} = useFxEnv();
  return (
    <div style={{...FILL, opacity: outK}}>
      {fx.props.cards.map((c, i) => {
        const k = tw(abs, c.at, c.at + 0.35, 0, 1, pop);
        const p = anchorPx(anchors, Math.round(abs * fps), c.target);
        const left = i % 2 === 0;
        const y = 260 + i * 240;
        return (
          <React.Fragment key={i}>
            <Pointer x={left ? 436 : 1080 - 436} y={y + 55} cx={p.x} cy={p.y} k={tw(abs, c.at + 0.05, c.at + 0.4)} />
            <CalloutCard text={c.text} left={left} y={y} k={k} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- phone mockup
export const PhoneMockup: React.FC<{fx: Of<'phone-mockup'>}> = ({fx}) => {
  const {t, outK, len} = useSpan(fx);
  const right = fx.props.side === 'right';
  const fly = tw(t, 0, 0.7, 0, 1, pop) * outK;
  const bob = Math.sin(t * 2) * 8;
  return (
    <div style={{...FILL, perspective: 1600, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', [right ? 'right' : 'left']: 44, top: 760 + bob, width: 400, height: 820, transform: `translateX(${(1 - fly) * (right ? 700 : -700)}px) rotateY(${(right ? -20 : 20) * fly}deg) rotateX(${6 * fly}deg) rotateZ(${(right ? 5 : -5) * fly}deg)`, opacity: Math.min(1, fly * 2), transformStyle: 'preserve-3d'}}>
        <div style={{...FILL, width: 400, height: 820, borderRadius: 68, padding: 14, boxSizing: 'border-box', ...metalFill({kind: 'copper', variant: 'bright', frame: 0, shimmer: false}), boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
          <div style={{width: '100%', height: '100%', borderRadius: 56, background: '#0b0c0d', overflow: 'hidden', position: 'relative'}}>
            <div style={{position: 'absolute', left: 130, top: 14, width: 140, height: 30, borderRadius: 15, background: '#000'}} />
            <div style={{position: 'absolute', left: 24, top: 70, fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: '#E3BF63', textTransform: 'uppercase'}}>{fx.props.title}</div>
            <div style={{position: 'absolute', left: 24, right: 24, top: 120, height: 360, borderRadius: 30, background: 'linear-gradient(160deg,#C91B19,#3d0709)', border: '1.5px solid rgba(213,170,74,0.7)'}}>
              <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 0, height: 0, borderTop: '30px solid transparent', borderBottom: '30px solid transparent', borderLeft: '50px solid rgba(255,255,255,0.92)'}} />
            </div>
            {fx.props.lines.map((l, i) => (
              <div key={i} style={{position: 'absolute', left: 24, right: 24, top: 510 + i * 82, padding: '14px 18px', borderRadius: 22, background: 'rgba(255,255,255,0.1)', fontFamily: SANS, fontWeight: 500, fontSize: 25, color: brand.white, opacity: tw(t, 0.8 + i * 0.25, 1.05 + i * 0.25), transform: `translateY(${(1 - tw(t, 0.8 + i * 0.25, 1.05 + i * 0.25)) * 14}px)`}}>{l}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{display: 'none'}}>{len}</div>
    </div>
  );
};

// ---------------------------------------------------------------- checklist
export const Checklist: React.FC<{fx: Of<'checklist'>}> = ({fx}) => {
  const {abs, inK, outK} = useSpan(fx);
  const n = fx.props.items.length;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 54, top: 1090, width: 800, padding: '26px 40px 14px', borderRadius: 34, background: GLASS, border: HAIR, boxSizing: 'border-box', transform: `scale(${0.94 + 0.06 * inK})`, opacity: inK, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
        {fx.props.title && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', color: '#E3BF63', marginBottom: 12}}>{fx.props.title}</div>}
        {fx.props.items.map((it, i) => {
          const k = tw(abs, it.at, it.at + 0.28, 0, 1, pop);
          const draw = tw(abs, it.at + 0.3, it.at + 0.55);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, height: 100, borderTop: i ? '1px solid rgba(255,255,255,0.1)' : 'none', opacity: tw(abs, it.at - 0.2, it.at + 0.1, 0.35, 1)}}>
              <div style={{width: 62, height: 62, borderRadius: 31, border: `3px solid ${draw > 0.05 ? '#E3BF63' : 'rgba(255,255,255,0.5)'}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', background: draw > 0.95 ? 'rgba(227,191,99,0.2)' : 'transparent'}}>
                <svg width={34} height={34} viewBox="0 0 34 34">
                  <path d="M6 18 L14 26 L29 8" fill="none" stroke="#E3BF63" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - draw)} />
                </svg>
              </div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, color: brand.white, transform: `translateX(${(1 - k) * 20}px)`}}>{it.text}</div>
            </div>
          );
        })}
      </div>
      <div style={{display: 'none'}}>{n}</div>
    </div>
  );
};

// ---------------------------------------------------------------- odometer
const Digit: React.FC<{x: number; h: number}> = ({x, h}) => {
  const pos = x % 10;
  return (
    <div style={{height: h, width: h * 0.62, overflow: 'hidden', position: 'relative'}}>
      <div style={{transform: `translateY(${-pos * h}px)`}}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
          <div key={i} style={{height: h, lineHeight: `${h}px`, textAlign: 'center'}}>{d}</div>
        ))}
      </div>
    </div>
  );
};
export const Odometer: React.FC<{fx: Of<'odometer'>}> = ({fx}) => {
  const {t, outK, inK} = useSpan(fx);
  const v = fx.props.from + (fx.props.to - fx.props.from) * tw(t, 0.25, 2.4);
  const places = String(Math.round(Math.max(fx.props.to, fx.props.from))).length;
  const h = 170;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1290, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `scale(${0.9 + 0.1 * inK})`}}>
        <div style={{display: 'flex', alignItems: 'center', fontFamily: heavyFamily, fontSize: h * 0.92, padding: '20px 44px', borderRadius: 40, background: GLASS, border: HAIR, boxShadow: '0 24px 60px rgba(0,0,0,0.55)', ...{color: '#F8E8B4'}}}>
          <span style={{marginRight: 10}}>{fx.props.prefix}</span>
          {Array.from({length: places}).map((_, i) => (
            <Digit key={i} x={v / Math.pow(10, places - 1 - i)} h={h} />
          ))}
          <span style={{marginLeft: 12}}>{fx.props.suffix}</span>
        </div>
      </div>
      {fx.props.label && <div style={{position: 'absolute', left: 0, width: 1080, top: 1560, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 6, textTransform: 'uppercase', color: brand.white, textShadow: '0 2px 16px rgba(0,0,0,0.7)', opacity: tw(t, 0.4, 0.8)}}>{fx.props.label}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- before and after
export const BeforeAfter: React.FC<{fx: Of<'before-after'>}> = ({fx}) => {
  const {a, t, fps, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const cutAt = fx.props.cutAt ?? a + 1.3;
  const wipeP = tw(t, 0.4, 0.4 + fx.props.sweepSec, 0, 1, (x) => x * x * (3 - 2 * x));
  const isCut = fx.props.mode === 'cut';
  const p = isCut ? (a + t >= cutAt ? 1 : 0) : wipeP;
  const x = p * 1080;
  const show = p < 0.999 ? 1 : outK;
  return (
    <div style={{...FILL, opacity: show}}>
      {p < 0.999 && (
        <div style={{...FILL, clipPath: `inset(0 0 0 ${x}px)`}}>
          <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover', filter: 'saturate(0.5) contrast(0.8) brightness(1.1) blur(0.5px)'}} />
        </div>
      )}
      {!isCut && p > 0.001 && p < 0.999 && <div style={{position: 'absolute', left: x - 3, top: 0, width: 6, height: 1920, background: 'linear-gradient(180deg,#FFF3C9,#E3BF63)', boxShadow: '0 0 30px 8px rgba(227,191,99,0.7)'}} />}
      <div style={{position: 'absolute', left: 40, top: 250, padding: '10px 26px', borderRadius: 30, background: 'rgba(0,0,0,0.7)', fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: 4, textTransform: 'uppercase', color: '#F8E8B4', opacity: (isCut ? (p >= 1 ? 1 : 0) : tw(t, 1.0, 1.4)) * outK}}>{fx.props.afterLabel}</div>
      <div style={{position: 'absolute', right: 40, top: 250, padding: '10px 26px', borderRadius: 30, background: 'rgba(0,0,0,0.7)', fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: 4, textTransform: 'uppercase', color: brand.white, opacity: (isCut ? (p >= 1 ? 0 : 1) : 1 - tw(t, 0.4 + fx.props.sweepSec * 0.7, 0.4 + fx.props.sweepSec)) * tw(t, 0, 0.3)}}>{fx.props.beforeLabel}</div>
    </div>
  );
};

// ---------------------------------------------------------------- chart grow
export const ChartGrow: React.FC<{fx: Of<'chart-grow'>}> = ({fx}) => {
  const {t, outK, inK} = useSpan(fx);
  const pts = fx.props.points;
  const W = 900;
  const Hh = 340;
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, Hh - ((v - lo) / (hi - lo || 1)) * (Hh - 40) - 20]);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const total = xy.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - xy[i - 1][0], p[1] - xy[i - 1][1]) : 0), 0);
  const draw = tw(t, 0.35, 2.2);
  const end = xy[xy.length - 1];
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 54, top: 1100, width: 972, height: 600, borderRadius: 36, background: GLASS, border: HAIR, boxSizing: 'border-box', padding: 36, opacity: inK, transform: `scale(${0.94 + 0.06 * inK})`, boxShadow: '0 22px 56px rgba(0,0,0,0.55)'}}>
        {fx.props.label && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', color: '#E3BF63', marginBottom: 14}}>{fx.props.label}</div>}
        <svg width={W} height={Hh + 20} viewBox={`0 0 ${W} ${Hh}`} style={{overflow: 'visible'}}>
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E08A57" stopOpacity="0.55" />
              <stop offset="1" stopColor="#E08A57" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1={0} x2={W} y1={Hh * g} y2={Hh * g} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
          ))}
          <path d={`${d} L${W} ${Hh} L0 ${Hh} Z`} fill="url(#cg)" opacity={draw} style={{clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`}} />
          <path d={d} fill="none" stroke="#F4B08A" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={total} strokeDashoffset={total * (1 - draw)} />
          {draw > 0.97 && <circle cx={end[0]} cy={end[1]} r={16} fill="#C91B19" stroke="#FFF3C9" strokeWidth={5} />}
        </svg>
        {fx.props.endLabel && draw > 0.97 && <div style={{position: 'absolute', left: 36 + end[0] - 170, top: 36 + 50 + end[1] - 100, padding: '10px 26px', borderRadius: 24, fontFamily: heavyFamily, fontSize: 56, color: '#2a1206', ...metalFill({kind: 'gold', variant: 'bright', frame: 0, shimmer: false}), transform: `scale(${tw(t, 2.2, 2.5, 0, 1, pop)})`}}>{fx.props.endLabel}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- comment bubble
export const CommentBubble: React.FC<{fx: Of<'comment-bubble'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const {postAt, replyAt} = fx.props;
  const typed = fx.props.comment.slice(0, Math.floor(tw(abs, postAt - 0.9, postAt - 0.15, 0, fx.props.comment.length, (x) => x)));
  const posted = abs >= postAt;
  const k = tw(abs, postAt - 1.1, postAt - 0.8, 0, 1, pop);
  const rk = tw(abs, replyAt, replyAt + 0.3, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 60, top: 1170, display: 'flex', alignItems: 'center', gap: 20, opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>
        <div style={{width: 74, height: 74, borderRadius: 37, background: '#9aa0a3', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 28, color: '#fff'}}>you</div>
        <div style={{position: 'relative', padding: '18px 34px', borderRadius: 40, background: 'rgba(255,255,255,0.95)', fontFamily: SANS, fontWeight: 700, fontSize: 56, color: '#111', minWidth: 120, boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}}>
          {typed}
          {!posted && <span style={{color: brand.crimson}}>|</span>}
          {posted && <div style={{position: 'absolute', right: -16, bottom: -18, fontSize: 40, transform: `scale(${tw(abs, postAt, postAt + 0.25, 0, 1, pop)})`}}>❤️</div>}
        </div>
      </div>
      <div style={{position: 'absolute', left: 150, top: 1340, display: 'flex', alignItems: 'center', gap: 18, opacity: rk, transform: `translateY(${(1 - rk) * 30}px) scale(${0.9 + 0.1 * rk})`}}>
        <div style={{width: 64, height: 64, borderRadius: 32, background: `linear-gradient(135deg,${brand.crimson},#3d0709)`, border: '2px solid #D5AA4A', flex: 'none'}} />
        <div style={{padding: '16px 28px', borderRadius: 36, background: 'rgba(30,32,34,0.95)', fontFamily: SANS, fontWeight: 500, fontSize: 40, color: brand.white, boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}}>
          {fx.props.reply}
          <div style={{display: 'inline-block', marginLeft: 18, padding: '8px 22px', borderRadius: 24, fontWeight: 700, fontSize: 36, color: '#2a1206', ...metalFill({kind: 'gold', variant: 'bright', frame: 0, shimmer: false})}}>🔗 {fx.props.linkLabel}</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- timeline that catches fire
export const TimelineBurn: React.FC<{fx: Of<'timeline-burn'>}> = ({fx}) => {
  const {abs, t, frame, outK} = useSpan(fx);
  const {burnAt, clips} = fx.props;
  if (fx.props.style === 'line') {
    const prog = tw(abs, burnAt - 1.0, burnAt + 2.2, 0, 1, (x) => x);
    const x0 = 70;
    const w = 940;
    const head = x0 + w * prog;
    const inK2 = tw(t, 0, 0.35, 0, 1, pop);
    return (
      <div style={{...FILL, opacity: outK}}>
        <div style={{position: 'absolute', left: x0, top: 1330, width: w, height: 22, borderRadius: 11, background: 'linear-gradient(90deg,#6F0D0F,#C91B19,#6F0D0F)', opacity: inK2, boxShadow: '0 0 24px rgba(201,27,25,0.55)'}} />
        {[0.12, 0.34, 0.58, 0.8].map((m, i) => (
          <div key={i} style={{position: 'absolute', left: x0 + w * m, top: 1310, width: 4, height: 62, background: 'rgba(255,255,255,0.55)', opacity: inK2}} />
        ))}
        {prog > 0 && (
          <>
            <div style={{position: 'absolute', left: x0, top: 1330, width: Math.max(0, head - x0), height: 22, borderRadius: 11, background: '#1a1a1a', boxShadow: '0 0 12px rgba(0,0,0,0.6)'}} />
            {Array.from({length: 8}).map((_, i) => {
              const hh = (90 + ((i * 53) % 90)) * (0.6 + 0.4 * Math.sin(frame * 0.5 + i * 1.7)) * Math.min(1, prog * 6) * (1 - tw(abs, burnAt + 2.2, burnAt + 3.0));
              return <div key={i} style={{position: 'absolute', left: head - 46 + (i - 4) * 12, bottom: 1920 - 1345, width: 70, height: Math.max(0, hh), borderRadius: '50% 50% 40% 40% / 70% 70% 30% 30%', background: 'radial-gradient(ellipse at 50% 90%, #FFF1B0 0%, #FFB020 30%, #F0561A 62%, rgba(201,27,25,0) 100%)', filter: 'blur(6px)', mixBlendMode: 'screen'}} />;
            })}
            {Array.from({length: 14}).map((_, i) => {
              const life = (frame * 0.03 + i * 0.211) % 1;
              return <div key={`e${i}`} style={{position: 'absolute', left: head + Math.sin(life * 8 + i) * 40 - 20, top: 1330 - life * 260, width: 6, height: 6, borderRadius: 3, background: '#FFB020', opacity: (1 - life) * Math.min(1, prog * 4), boxShadow: '0 0 10px #F0561A'}} />;
            })}
          </>
        )}
      </div>
    );
  }
  const burn = tw(abs, burnAt, burnAt + 1.2, 0, 1, (x) => x);
  const shake = abs >= burnAt ? Math.sin(frame * 3.1) * 4 * (1 - burn) : 0;
  const colors = ['#C91B19', '#D5AA4A', '#3A3F42', '#B5622C', '#8d1214', '#E3BF63', '#6F0D0F', '#9aa0a3'];
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 40, top: 1080, width: 1000, height: 420, borderRadius: 34, background: GLASS, border: HAIR, boxSizing: 'border-box', padding: 30, transform: `translate(${shake}px, ${burn * 40}px)`, opacity: 1 - burn * 0.85, filter: `brightness(${1 - 0.5 * burn}) sepia(${burn})`}}>
        {[0, 1, 2].map((tr) => (
          <div key={tr} style={{position: 'relative', height: 92, marginBottom: 20, borderRadius: 14, background: 'rgba(255,255,255,0.06)'}}>
            {Array.from({length: clips}).map((_, i) => {
              const w = 90 + ((i * 53 + tr * 31) % 120);
              const x = 10 + i * (940 / clips) + ((tr * 37) % 30);
              const k = tw(t, 0.2 + i * 0.16 + tr * 0.1, 0.5 + i * 0.16 + tr * 0.1, 0, 1, pop);
              return <div key={i} style={{position: 'absolute', left: x, top: 8, width: w * k, height: 76, borderRadius: 12, background: colors[(i + tr * 3) % colors.length], opacity: 0.95}} />;
            })}
          </div>
        ))}
        <div style={{position: 'absolute', left: 30 + tw(t, 0.5, burnAt - fx.at) * 900, top: 14, width: 5, height: 390, background: '#fff', boxShadow: '0 0 16px #fff'}} />
      </div>
      {burn > 0 && (
        <div style={{position: 'absolute', left: 20, top: 900, width: 1040, height: 640, pointerEvents: 'none'}}>
          {Array.from({length: 22}).map((_, i) => {
            const bx = (i / 21) * 1040;
            const life = ((frame * 0.045 + i * 0.37) % 1);
            const h = (160 + ((i * 71) % 220)) * (0.5 + 0.5 * Math.sin(frame * 0.35 + i)) * Math.min(1, burn * 1.6) * (abs > burnAt + 2.4 ? Math.max(0, 1 - (abs - burnAt - 2.4)) : 1);
            return (
              <div key={i} style={{position: 'absolute', left: bx - 70, bottom: 130 - life * 0, width: 140, height: Math.max(0, h), borderRadius: '50% 50% 40% 40% / 70% 70% 30% 30%', background: 'radial-gradient(ellipse at 50% 85%, #FFF1B0 0%, #FFB020 28%, #F0561A 58%, rgba(201,27,25,0) 100%)', filter: 'blur(8px)', transform: `translateY(${-(i % 3) * 16}px) scaleX(${0.8 + 0.3 * Math.sin(frame * 0.4 + i * 2)})`, mixBlendMode: 'screen'}} />
            );
          })}
          {Array.from({length: 26}).map((_, i) => {
            const life = (frame * 0.025 + i * 0.173) % 1;
            return <div key={`e${i}`} style={{position: 'absolute', left: ((i * 83) % 1040) + Math.sin(life * 9 + i) * 24, bottom: 160 + life * 460, width: 7, height: 7, borderRadius: 4, background: '#FFB020', opacity: (1 - life) * Math.min(1, burn * 2), boxShadow: '0 0 10px #F0561A'}} />;
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- pull-back reveal (the video shrinks into an editing app and gets cut)
export const PullBackReveal: React.FC<{fx: Of<'pull-back-reveal'>}> = ({fx}) => {
  const {a, b, abs, fps, outK} = useSpan(fx);
  const {video} = useFxEnv();
  const s = tw(abs, a, a + 0.6) * (1 - tw(abs, b - 0.5, b, 0, 1, (x) => x * x));
  const scale = 1 - 0.48 * s;
  const playX = tw(abs, a + 0.7, b - 0.6) * 640;
  return (
    <div style={{...FILL, opacity: tw(abs, a, a + 0.1) * (abs > b - 0.1 ? outK : 1)}}>
      <div style={{...FILL, background: PLATE_BG, opacity: s}} />
      <div style={{position: 'absolute', left: 120, top: 180, width: 840, height: 1280, borderRadius: 36, background: '#17191b', border: HAIR, opacity: s, transform: `scale(${0.96 + 0.04 * s})`, boxShadow: '0 40px 100px rgba(0,0,0,0.6)'}}>
        <div style={{height: 70, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 28px'}}>
          {['#C91B19', '#D5AA4A', '#9aa0a3'].map((c, i) => (
            <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: c}} />
          ))}
          <div style={{marginLeft: 18, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: brand.white}}>{fx.props.appTitle}</div>
        </div>
        <div style={{position: 'absolute', left: 60, right: 60, top: 1130, height: 110, borderRadius: 18, background: 'rgba(255,255,255,0.06)'}}>
          {fx.props.cuts.map((c, i) => {
            const k = tw(abs, c, c + 0.2, 0, 1, pop);
            const cx = 20 + ((c - a) / (b - a)) * 700;
            return <div key={i} style={{position: 'absolute', left: cx, top: 8, width: 5, height: 94, background: brand.crimson, opacity: k, transform: `scaleY(${k})`}} />;
          })}
          <div style={{position: 'absolute', left: 20 + playX, top: 4, width: 4, height: 102, background: '#fff'}} />
        </div>
      </div>
      <div style={{...FILL, transform: `translateY(${-190 * s}px) scale(${scale})`, borderRadius: 14 + 28 * s, overflow: 'hidden', boxShadow: s > 0.05 ? '0 20px 50px rgba(0,0,0,0.55)' : 'none'}}>
        <OffthreadVideo src={staticFile(video)} muted startFrom={Math.round(a * fps)} style={{...FILL, objectFit: 'cover'}} />
      </div>
    </div>
  );
};
const PLATE_BG = 'radial-gradient(120% 75% at 50% 28%, #3a0709 0%, #0a0203 60%, #000 100%)';

// ---------------------------------------------------------------- blackout
export const Blackout: React.FC<{fx: Of<'blackout'>}> = ({fx}) => {
  const {t} = useSpan(fx);
  const hold = fx.props.holdSec;
  const o = tw(t, 0, 0.07) * (1 - tw(t, hold, hold + 0.1));
  return <div style={{...FILL, background: '#000', opacity: o}} />;
};

// ---------------------------------------------------------------- spotlight words
export const SpotlightWords: React.FC<{fx: Of<'spotlight'>}> = ({fx}) => {
  const {abs, outK} = useSpan(fx);
  const words = fx.props.words;
  let idx = -1;
  words.forEach((w, i) => {
    if (abs >= w.at) idx = i;
  });
  if (idx < 0) return null;
  const w = words[idx];
  const k = tw(abs - w.at, 0, 0.22, 0, 1, pop);
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{position: 'absolute', left: 0, width: 1080, top: 1240, textAlign: 'center', fontFamily: serifFamily, fontStyle: 'italic', fontWeight: 800, fontSize: 150, lineHeight: 1, transform: `scale(${0.8 + 0.2 * k})`, opacity: k, ...metalTextStyle({kind: 'gold', variant: 'bright', frame: 0, shimmer: false}), filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.8))'}}>{w.text}</div>
    </div>
  );
};

// ---------------------------------------------------------------- freeze sticker (die-cut freeze frame with handwritten notes)
export const FreezeSticker: React.FC<{fx: Of<'freeze-sticker'>}> = ({fx}) => {
  const {a, t, abs, outK} = useSpan(fx);
  const {fps} = useVideoConfig();
  const k = tw(t, 0, 0.35, 0, 1, pop);
  const white = '#fff';
  const stroke = `drop-shadow(10px 0 0 ${white}) drop-shadow(-10px 0 0 ${white}) drop-shadow(0 10px 0 ${white}) drop-shadow(0 -10px 0 ${white}) drop-shadow(7px 7px 0 ${white}) drop-shadow(-7px -7px 0 ${white}) drop-shadow(7px -7px 0 ${white}) drop-shadow(-7px 7px 0 ${white}) drop-shadow(0 18px 26px rgba(0,0,0,0.55))`;
  return (
    <div style={{...FILL, opacity: outK}}>
      <div style={{...FILL, background: 'rgba(0,0,0,0.5)', opacity: k}} />
      <div style={{...FILL, transform: `translate(0px, ${60 * (1 - k)}px) rotate(${fx.props.angle * k}deg) scale(${0.4 + 0.34 * k})`, transformOrigin: '50% 36%', filter: stroke}}>
        {/* the die-cut keeps head, shoulders and chest; the desk props are cropped off so the outline stays clean */}
        <div style={{...FILL, clipPath: 'inset(0 0 40% 0)'}}>
          <Freeze frame={0}>
            <Cutout from={Math.round(a * fps)} plain />
          </Freeze>
        </div>
      </div>
      {fx.props.notes.map((n, i) => {
        const nk = tw(abs, fx.at + 0.5 + i * 0.35, fx.at + 0.8 + i * 0.35, 0, 1, pop);
        const left = i % 2 === 0;
        return (
          <div key={i} style={{position: 'absolute', [left ? 'left' : 'right']: 50, top: 520 + i * 330, width: 340, fontFamily: handFamily, fontWeight: 700, fontSize: 82, lineHeight: 1, color: '#fff', transform: `rotate(${left ? -7 : 6}deg) scale(${nk})`, opacity: nk, textShadow: '0 4px 18px rgba(0,0,0,0.7)', textAlign: left ? 'left' : 'right'}}>{n}</div>
        );
      })}
    </div>
  );
};

export const overItem = (fx: Fx): React.ReactNode => {
  switch (fx.type) {
    case 'the-stack':
      return <TheStack fx={fx} />;
    case 'sticky-text':
      return <StickyText fx={fx} />;
    case 'freeze-label':
      return <FreezeLabel fx={fx} />;
    case 'pointer-callout':
      return <PointerCallout fx={fx} />;
    case 'phone-mockup':
      return <PhoneMockup fx={fx} />;
    case 'checklist':
      return <Checklist fx={fx} />;
    case 'odometer':
      return <Odometer fx={fx} />;
    case 'before-after':
      return <BeforeAfter fx={fx} />;
    case 'chart-grow':
      return <ChartGrow fx={fx} />;
    case 'comment-bubble':
      return <CommentBubble fx={fx} />;
    case 'timeline-burn':
      return <TimelineBurn fx={fx} />;
    case 'pull-back-reveal':
      return <PullBackReveal fx={fx} />;
    case 'blackout':
      return <Blackout fx={fx} />;
    case 'spotlight':
      return <SpotlightWords fx={fx} />;
    case 'freeze-sticker':
      return <FreezeSticker fx={fx} />;
    default:
      return null;
  }
};
