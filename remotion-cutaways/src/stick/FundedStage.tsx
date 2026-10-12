import React from 'react';
import {Stick, STAND, joints, type Hair, type Pose} from './figure';
import {Tag, Panel, Bubble, C, SANS, between, bounce, prog} from './kit';
import {Bell, Coin, FollowIcon} from './parts';
import {serifFamily} from '../fonts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Funded for Seven". Ten desks are needed, seven are paid for. The three empty desks (crimson
 * dashes) hand their work to the seven, who keep giving a thumbs-up while the report stays green: the green is
 * a status dot with a check mark and a tag, and in the end it is a loan (a hand holds it out).
 * `t` is seconds into the voiceover, `q` the cue times from content/funded-for-seven.stick.json.
 */
const COLS = [180, 340, 500, 660, 820];
const ROWS = [300, 540];
const seat = (i: number) => ({x: COLS[i % 5], yb: ROWS[i < 5 ? 0 : 1]});
const HAIR: (Hair | undefined)[] = [undefined, 'bob', undefined, 'long', undefined, 'bun', 'ponytail'];
const FH = 150;
/** Which empty desk each slice of the three cards goes to, and which of the seven receives it. */
const FLY = [
  {src: 7, dst: 6},
  {src: 7, dst: 2},
  {src: 8, dst: 3},
  {src: 8, dst: 1},
  {src: 9, dst: 4},
  {src: 9, dst: 0},
  {src: 9, dst: 5},
];

const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const SLOT_ROT = [-3, 4, -2, 3];

/** A work card: a sheet with a checkbox and two grey lines. */
const Sheet: React.FC<{x: number; y: number; w?: number; h?: number; rot?: number; opacity?: number; scale?: number}> = ({x, y, w = 54, h = 40, rot = 0, opacity = 1, scale = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.16} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
    <rect x={-w / 2 + w * 0.12} y={-h * 0.28} width={h * 0.24} height={h * 0.24} rx={2} fill="none" stroke={C.ink} strokeWidth={3} />
    <line x1={-w / 2 + w * 0.12} y1={h * 0.2} x2={w / 2 - w * 0.14} y2={h * 0.2} stroke={C.soft} strokeWidth={h * 0.14} strokeLinecap="round" />
    <line x1={-w / 2 + w * 0.36} y1={-h * 0.14} x2={w / 2 - w * 0.14} y2={-h * 0.14} stroke={C.soft} strokeWidth={h * 0.14} strokeLinecap="round" />
  </g>
);

const Desk: React.FC<{x: number; yb: number; s?: number; dashed?: boolean; color?: string; opacity?: number}> = ({x, yb, s = 1, dashed, color = C.ink, opacity = 1}) => {
  const w = 124 * s;
  const h = 58 * s;
  const dash = dashed ? '12 10' : undefined;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={yb - h} width={w} height={h} rx={8 * s} fill="#FFFFFF" stroke={color} strokeWidth={5} strokeDasharray={dash} />
      <rect x={x - w / 2 - 8 * s} y={yb - h - 10 * s} width={w + 16 * s} height={14 * s} rx={7 * s} fill={C.soft} stroke={color} strokeWidth={5} strokeDasharray={dash} />
    </g>
  );
};

/** The empty chair behind an empty desk. */
const EmptyChair: React.FC<{x: number; yb: number; color: string; opacity?: number}> = ({x, yb, color, opacity = 1}) => (
  <g opacity={opacity} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray="10 9">
    <rect x={x - 30} y={yb - 138} width={60} height={64} rx={12} />
  </g>
);

const Check: React.FC<{x?: number; y?: number; s?: number; p?: number; color?: string; w?: number}> = ({x = 0, y = 0, s = 1, p = 1, color = C.ink, w = 9}) => (
  <path d="M -16 2 L -5 14 L 17 -12" transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - p)} />
);

/** "Green" is never drawn green: a black-outline status dot with a check and a tiny GREEN tag. */
const Dot: React.FC<{x: number; y: number; r: number; p?: number}> = ({x, y, r, p = 1}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#FFFFFF" stroke={C.ink} strokeWidth={Math.max(5, r * 0.12)} />
    <Check x={x} y={y} s={r / 26} p={p} w={9} />
  </g>
);

const Report: React.FC<{x: number; y: number; s?: number; opacity?: number; p?: number; tag?: number}> = ({x, y, s = 1, opacity = 1, p = 1, tag = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <Panel x={-150} y={-42} w={300} h={84} />
    <Dot x={-100} y={0} r={26} p={p} />
    <line x1={-56} y1={-12} x2={40} y2={-12} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
    <line x1={-56} y1={12} x2={0} y2={12} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
    <g opacity={tag} transform="translate(98 0)">
      <Tag x={0} y={0} text="GREEN" size={14} />
    </g>
  </g>
);

const Clock: React.FC<{x: number; y: number; r?: number; t: number; fast?: number; opacity?: number}> = ({x, y, r = 34, t, fast = 0, opacity = 1}) => {
  const m = (t * (30 + fast * 400)) % 360;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <circle r={r} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${m / 12})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.75} stroke={C.ink} strokeWidth={4} strokeLinecap="round" transform={`rotate(${m})`} />
      <circle r={4} fill={C.ink} />
    </g>
  );
};

const Moon: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M 12 -34 A 36 36 0 1 0 30 20 A 30 30 0 0 1 12 -34 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 52 -30 L 52 -14 M 44 -22 L 60 -22 M 60 14 L 60 26 M 54 20 L 66 20" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
  </g>
);

const Eye: React.FC<{x: number; y: number; t: number; opacity?: number}> = ({x, y, t, opacity = 1}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <path d="M -54 0 Q 0 -46 54 0 Q 0 46 -54 0 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={Math.sin(t * 3) * 12} cy={0} r={15} fill={C.ink} />
  </g>
);

/** Dots grid for the plan page: ten places, `filled` of them paid for, the rest dashed. */
const Places: React.FC<{cx: number; cy: number; filled: number; p: number; gapColor: string}> = ({cx, cy, filled, p, gapColor}) => (
  <g>
    {Array.from({length: 10}).map((_, i) => {
      const x = cx + ((i % 5) - 2) * 44;
      const y = cy + Math.floor(i / 5) * 44;
      const on = Math.min(1, Math.max(0, p * 12 - i));
      const paid = i < filled;
      return (
        <circle key={i} cx={x} cy={y} r={14 * on} fill={paid ? C.ink : '#FFFFFF'} stroke={paid ? C.ink : gapColor} strokeWidth={5} strokeDasharray={paid ? undefined : '6 6'} />
      );
    })}
  </g>
);

export const FundedStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---------- which groups are on screen ----------
  const officeA = between(t, -1, q.kahn - 0.25, 0.3);
  const officeC = between(t, q.inside - 0.3, q.nextReport - 1.5, 0.35);
  const office = Math.max(officeA, officeC);
  const scholarsOn = between(t, q.kahn - 0.05, q.overload - 0.3, 0.3);
  const workerOn = between(t, q.overload - 0.05, q.inside - 0.3, 0.3);
  const reportBigOn = between(t, q.nextReport, q.check + 0.1, 0.3);
  const planOn = between(t, q.check, q.greenBack - 0.1, 0.35);
  const loanOn = between(t, q.greenBack, q.cta - 0.05, 0.25);
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  // ---------- the office ----------
  const deskIn = (i: number) => prog(t, q.needs + i * 0.09, 0.35, bounce);
  const figIn = (i: number) => prog(t, q.funds + i * 0.07, 0.3, bounce);
  const workBig = 1 + 0.5 * (1 - prog(t, q.needs, 0.5));
  const gapColor = t >= q.gap ? C.crimson : C.ink;
  const dashedEmpty = t >= q.funds + 0.45;
  const sayAt = (i: number) => q.saying + i * 0.05;
  const thumbs = (i: number) => (t >= sayAt(i) && t < q.nextReport - 1.5 ? prog(t, sayAt(i), 0.25) : 0);
  const worried = t >= q.look;
  const nightLean = prog(t, q.nights, 0.6) * 0.025;
  const mood = (): Pose['mood'] => (worried ? 'sad' : t >= q.trouble && t < q.kahn ? 'flat' : 'smile');
  const poseOf = (i: number): Pose => {
    const th = thumbs(i);
    return pose({rh: th > 0.4 ? [0.2, -0.1] : [0.17, 0.27], mood: mood(), lean: nightLean});
  };
  const pulse = (a: number, b = 0.45) => 1 + 0.18 * Math.sin(Math.min(1, Math.max(0, (t - a) / b)) * Math.PI);
  const origGone = prog(t, q.spreadFly + 0.05, 0.2);
  const flights = FLY.map((f, k) => {
    const a = q.spreadFly + k * 0.11;
    return {...f, a, u: prog(t, a, 0.75, (v) => v * v * (3 - 2 * v)), landed: t >= a + 0.75};
  });
  const slotPos = (i: number, k: number) => {
    const {x, yb} = seat(i);
    return {x: k === 0 ? x - 24 : x + 24, y: yb - 80 - (k >= 2 ? (k - 1) * 8 : 0), rot: SLOT_ROT[k]};
  };
  const extraAt = (i: number, k: number) => prog(t, q.carrying + i * 0.07 + (k - 2) * 0.28, 0.3, bounce);

  // report, moon, clock, eye
  const eyeOn = between(t, q.look, q.report - 0.1, 0.25);
  const repIn = prog(t, q.report, 0.45, bounce);
  const nightsOn = prog(t, q.nights, 0.4, bounce);
  const bubbleOn = between(t, q.lie, q.kahn - 0.25, 0.25);
  const trouble = prog(t, q.trouble, 0.25, bounce);
  const gapTag = between(t, q.gap, q.kahn - 0.3, 0.25);
  const missTag = between(t, q.missing, q.spread + 0.2, 0.25);

  // ---------- the scholars and the overloaded worker ----------
  const scholarIn = (k: number) => prog(t, k === 0 ? q.kahn : q.colleagues + (k - 1) * 0.12, 0.35, bounce);
  const paperIn = prog(t, q.described, 0.4, bounce);
  const yearIn = prog(t, q.year, 0.3, bounce);
  const wk = prog(t, q.overload, 0.4, bounce);
  const NC = 8;
  const cardOn = (i: number) => prog(t, q.demands + i * 0.16, 0.25, bounce);
  const limitIn = prog(t, q.limit, 0.35);
  const meetShake = Math.sin(t * 38) * 4 * between(t, q.meet, q.inside - 0.3, 0.1);
  const workerMood: Pose['mood'] = t >= q.meet ? 'open' : t >= q.time ? 'sad' : t >= q.limit ? 'flat' : 'smile';
  const workerPose = pose({mood: workerMood, lh: t >= q.meet ? [-0.13, -0.05] : [-0.17, 0.27], rh: t >= q.meet ? [0.13, -0.05] : [0.17, 0.27]});

  // ---------- the report, then the plan page ----------
  const bigDot = prog(t, q.nextReport + 0.2, 0.4, (v) => v);
  const numNeed = prog(t, q.needNum, 0.4, bounce);
  const numPay = prog(t, q.payNum, 0.4, bounce);
  const unequal = prog(t, q.different, 0.35, bounce);
  const planSlide = (1 - prog(t, q.check, 0.5)) * 60;

  // ---------- the loan ----------
  const dotIn = prog(t, q.greenBack, 0.45, bounce);
  const handIn = prog(t, q.borrowed, 0.55);
  const loanTag = prog(t, q.borrowed + 0.15, 0.35, bounce);
  const qIn = prog(t, q.lending - 0.05, 0.4, bounce);
  const lift = -8 * Math.sin(Math.max(0, t - q.lending) * 3.2) * prog(t, q.lending, 0.3);

  return (
    <g>
      {/* ---- A and C: the ten desks ---- */}
      {office > 0 && (
        <g opacity={office}>
          {Array.from({length: 10}).map((_, i) => {
            const {x, yb} = seat(i);
            const empty = i >= 7;
            const dIn = Math.max(deskIn(i), t >= q.inside - 0.5 ? 1 : 0);
            const fIn = Math.max(figIn(i), t >= q.inside - 0.5 ? 1 : 0);
            const col = empty ? gapColor : C.ink;
            const cardScale = (t < q.needs + 0.6 ? workBig : 1) * (empty && t >= q.disappear ? pulse(q.disappear) : 1);
            const slot0 = slotPos(i, 0);
            const c0x = empty ? x : slot0.x;
            const cardKept = empty ? 1 - origGone : 1;
            return (
              <g key={i}>
                {empty && dIn > 0 && <EmptyChair x={x} yb={yb} color={col} opacity={dIn} />}
                {!empty && fIn > 0.01 && <Stick x={x} y={yb} h={FH * fIn} pose={poseOf(i)} hair={HAIR[i]} />}
                {dIn > 0.01 && <Desk x={x} yb={yb} s={dIn} dashed={empty && dashedEmpty} color={col} />}
                {cardKept > 0.01 && <Sheet x={c0x} y={yb - 80} rot={slot0.rot} scale={cardScale} opacity={cardKept} />}
                {!empty && flights.some((f) => f.dst === i && f.landed) && <Sheet x={slotPos(i, 1).x} y={slotPos(i, 1).y} rot={slotPos(i, 1).rot} />}
                {!empty && [2, 3].map((k) => extraAt(i, k) > 0.01 && <Sheet key={k} x={slotPos(i, k).x} y={slotPos(i, k).y} rot={slotPos(i, k).rot} scale={extraAt(i, k)} />)}
                {!empty && thumbs(i) > 0.4 && (() => {
                  const j = joints(x, yb, FH, poseOf(i));
                  return <path d={`M ${j.handR[0]} ${j.handR[1] - 4} L ${j.handR[0]} ${j.handR[1] - 17}`} stroke="#3A3F42" strokeWidth={8} strokeLinecap="round" opacity={thumbs(i)} />;
                })()}
                {!empty && t >= q.handle + i * 0.04 && t < q.nextReport - 1.5 && (() => {
                  const j = joints(x, yb, FH, poseOf(i));
                  const dy = ((t - q.handle - i * 0.04) * 22) % 18;
                  return <path d={`M ${j.head[0] + j.hr * 1.15} ${j.head[1] - 6 + dy} q 6 9 0 13 q -6 -4 0 -13 Z`} fill="#FFFFFF" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" opacity={prog(t, q.handle + i * 0.04, 0.2)} />;
                })()}
              </g>
            );
          })}

          {/* cards in flight: the three empty desks' work, cut into seven slices, goes to the seven */}
          {flights.map((f, k) => {
            if (f.u <= 0 || f.landed) return null;
            const s = seat(f.src);
            const d = slotPos(f.dst, 1);
            const x = lerp(s.x, d.x, f.u);
            const y = lerp(s.yb - 80, d.y, f.u) - 70 * Math.sin(Math.PI * f.u);
            return <Sheet key={k} x={x} y={y} rot={lerp(0, d.rot, f.u) + 14 * Math.sin(Math.PI * f.u)} scale={0.9} />;
          })}

          {/* A: the gap, the honest check, the trouble */}
          {gapTag > 0 && (
            <g opacity={gapTag}>
              <path d="M 450 590 L 450 604 L 880 604 L 880 590" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              <Tag x={665} y={648} text="THE GAP" size={24} />
            </g>
          )}
          {missTag > 0 && (
            <g opacity={missTag}>
              <path d="M 450 590 L 450 604 L 880 604 L 880 590" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              <Tag x={665} y={648} text="3 MISSING" size={24} />
            </g>
          )}
          {bubbleOn > 0 && (
            <g opacity={bubbleOn} transform={`translate(0 ${-6 * (1 - prog(t, q.lie, 0.3))})`}>
              <Bubble x={500} y={66} w={124} h={66}>
                {trouble < 0.5 ? <Check x={500} y={68} s={1.1} p={prog(t, q.lie + 0.1, 0.35, (v) => v)} /> : (
                  <g transform={`translate(500 66) scale(${trouble})`}>
                    <line x1={0} y1={-18} x2={0} y2={6} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
                    <circle cx={0} cy={20} r={5} fill={C.ink} />
                  </g>
                )}
              </Bubble>
            </g>
          )}

          {/* C: the eye that makes them say yes, the report that stays green, the nights */}
          {eyeOn > 0 && <Eye x={500} y={64} t={t} opacity={eyeOn} />}
          {repIn > 0.02 && <Report x={500} y={62} s={repIn} p={prog(t, q.green, 0.4, (v) => v)} tag={prog(t, q.green + 0.1, 0.3)} />}
          {nightsOn > 0.02 && (
            <g>
              <Moon x={830} y={74} s={nightsOn} />
              <Clock x={170} y={74} r={34 * nightsOn} t={t - q.nights} fast={1 - prog(t, q.nights + 1, 0.5, (v) => v)} />
            </g>
          )}
        </g>
      )}

      {/* ---- B: Kahn and colleagues, then role overload ---- */}
      {scholarsOn > 0 && (
        <g opacity={scholarsOn}>
          {[
            {x: 330, hair: 'bob' as Hair | undefined, k: 1},
            {x: 670, hair: undefined, k: 2},
            {x: 500, hair: undefined, k: 0},
          ].map((s) => {
            const p = scholarIn(s.k);
            return p > 0.01 ? <Stick key={s.k} x={s.x} y={430} h={210 * p} hair={s.hair} pose={pose(s.k === 0 ? {rh: [0.2, -0.06]} : {})} /> : null;
          })}
          <Tag x={500} y={170} text="KAHN" size={30} opacity={prog(t, q.kahn, 0.3, bounce)} />
          {paperIn > 0.02 && <Sheet x={500} y={555} w={190} h={150} scale={paperIn} />}
          {yearIn > 0.02 && (
            <g transform={`translate(500 555) rotate(-7) scale(${yearIn})`}>
              <Tag x={0} y={0} text="1964" size={34} />
            </g>
          )}
        </g>
      )}

      {workerOn > 0 && (
        <g opacity={workerOn}>
          <Tag x={420} y={64} text="ROLE OVERLOAD" size={30} opacity={prog(t, q.overload, 0.3, bounce)} />
          {wk > 0.01 && <Stick x={290} y={610} h={250 * wk} pose={workerPose} hair="ponytail" />}
          <Desk x={290} yb={610} s={1.9 * wk} />
          <Sheet x={250} y={500} w={120} h={90} scale={wk} />
          {Array.from({length: NC}).map((_, i) => {
            const over = i >= 4;
            const on = cardOn(i);
            if (on <= 0.01) return null;
            const cy = 610 - 36 - i * 62;
            const shake = over ? meetShake * (i % 2 ? 1 : -1) : 0;
            return (
              <g key={i} transform={`translate(${shake} 0)`}>
                <g transform={`translate(700 ${cy}) scale(${on})`} opacity={Math.min(1, on)}>
                  <rect x={-62} y={-27} width={124} height={54} rx={12} fill="#FFFFFF" stroke={over ? C.crimson : C.ink} strokeWidth={5} />
                  <rect x={-46} y={-9} width={18} height={18} rx={4} fill="none" stroke={over ? C.crimson : C.ink} strokeWidth={4} />
                  <line x1={-14} y1={-8} x2={44} y2={-8} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
                  <line x1={-14} y1={10} x2={20} y2={10} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
                </g>
              </g>
            );
          })}
          {limitIn > 0 && <line x1={620} y1={392} x2={620 + 190 * limitIn} y2={392} stroke={C.ink} strokeWidth={5} strokeDasharray="12 9" strokeLinecap="round" />}
          {t >= q.time && <Clock x={845} y={320} r={40 * prog(t, q.time, 0.3, bounce)} t={t} />}
          {t >= q.resources && (
            <g transform="translate(850 452)">
              <Coin y={14} s={prog(t, q.resources, 0.3, bounce) * 1.3} />
              <Coin y={-10} s={prog(t, q.resources + 0.12, 0.3, bounce) * 1.3} />
            </g>
          )}
        </g>
      )}

      {/* ---- E: the next report, then the plan page ---- */}
      {reportBigOn > 0 && <Report x={500} y={300 - 40 * prog(t, q.check, 0.3)} s={1.6 * prog(t, q.nextReport, 0.45, bounce)} opacity={reportBigOn} p={bigDot} tag={prog(t, q.nextReport + 0.3, 0.3)} />}
      {planOn > 0 && (
        <g opacity={planOn} transform={`translate(0 ${planSlide})`}>
          <Panel x={140} y={40} w={720} h={560} />
          <Tag x={500} y={100} text="PLAN" size={28} opacity={prog(t, q.plan, 0.3, bounce)} />
          <line x1={500} y1={150} x2={500} y2={570} stroke={C.soft} strokeWidth={5} strokeLinecap="round" opacity={prog(t, q.needTag, 0.3)} />
          {[0, 1].map((side) => {
            const cx = side === 0 ? 320 : 680;
            const tagAt = side === 0 ? q.needTag : q.payTag;
            const num = side === 0 ? numNeed : numPay;
            const places = prog(t, side === 0 ? q.needNum : q.payNum, 0.7, (v) => v);
            return (
              <g key={side}>
                <Tag x={cx} y={172} text={side === 0 ? 'NEEDS' : 'PAYS FOR'} size={26} opacity={prog(t, tagAt, 0.3, bounce)} />
                {num > 0.02 && (
                  <text x={cx} y={355} textAnchor="middle" fontFamily={serifFamily} fontStyle="italic" fontWeight={800} fontSize={190 * Math.max(0.01, num)} fill={C.ink}>
                    {side === 0 ? '10' : '7'}
                  </text>
                )}
                <Places cx={cx} cy={438} filled={side === 0 ? 10 : 7} p={places} gapColor={side === 1 && t >= q.different ? C.crimson : C.mid} />
              </g>
            );
          })}
          {unequal > 0.02 && (
            <text x={500} y={345} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={110 * unequal} fill={C.ink}>
              ≠
            </text>
          )}
        </g>
      )}

      {/* ---- F: the green is on loan ---- */}
      {loanOn > 0 && (
        <g opacity={loanOn} transform="translate(0 40)">
          <g transform={`translate(0 ${lift})`}>
            <Dot x={470} y={265} r={92 * Math.max(0.01, dotIn)} p={prog(t, q.greenBack + 0.2, 0.4, (v) => v)} />
            <Tag x={470} y={125} text="GREEN" size={24} opacity={prog(t, q.greenBack + 0.3, 0.3, bounce)} />
          </g>
          {handIn > 0.01 && (
            <g transform={`translate(${(1 - handIn) * 260} 0)`} opacity={Math.min(1, handIn * 2)}>
              <path d="M 990 480 L 800 450 L 580 396" fill="none" stroke="#3A3F42" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
              <rect x={430} y={374} width={150} height={46} rx={23} fill="#FFFFFF" stroke="#3A3F42" strokeWidth={9} />
              <path d="M 456 392 L 520 392 M 456 406 L 500 406" stroke={C.soft} strokeWidth={5} strokeLinecap="round" />
            </g>
          )}
          {loanTag > 0.02 && <Tag x={400} y={500} text="ON LOAN" size={32} fill={C.crimson} opacity={loanTag} />}
          {qIn > 0.02 && (
            <text x={790} y={270} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={150 * Math.max(0.01, qIn)} fill={C.ink}>
              ?
            </text>
          )}
        </g>
      )}

      {/* ---- end card ---- */}
      {ctaOn > 0.02 && (
        <g opacity={ctaOn}>
          <FollowIcon x={500} y={250} s={1.5 * ctaOn} />
          <Bell x={500} y={440} s={1.3} ring={Math.max(0, (t - q.cta - 0.4) * 1.1)} />
          <Tag x={500} y={580} text="MORE QUESTIONS" size={34} />
        </g>
      )}
    </g>
  );
};
