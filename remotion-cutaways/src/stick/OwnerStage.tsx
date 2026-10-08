import React from 'react';
import {interpolate} from 'remotion';
import {Stick, STAND, type Pose} from './figure';
import {Chair, Cross, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "The Owner After Launch". Three questions to ask before launch (who reads it, how often, what happens
 * when it is wrong), then the plan-do-study-act loop drawn as a ring whose STUDY quarter stays empty (an empty chair)
 * until a reviewer's name is on the project plan and someone sits in it.
 * `t` is seconds into the voiceover, `q` the cue times from content/owner-after-launch.stick.json.
 */
const G = 630;
const stand = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lin = (v: number) => v;

/** Pill with a numeral circle: "1  WHO READS IT". */
const Badge: React.FC<{n: string; text: string; opacity: number; y?: number}> = ({n, text, opacity, y = 44}) => {
  const size = 24;
  const tw = text.length * size * 0.78 + 44;
  const total = 56 + 14 + tw;
  const x0 = 500 - total / 2;
  return (
    <g opacity={opacity}>
      <circle cx={x0 + 28} cy={y} r={28} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
      <text x={x0 + 28} y={y + 13} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={36} fill={C.ink}>
        {n}
      </text>
      <Tag x={x0 + 70 + tw / 2} y={y} text={text} size={size} />
    </g>
  );
};

/** A plain, unbranded app screen: rounded rectangle, three dots, and chat-like rows of grey lines. */
const AppScreen: React.FC<{x: number; y: number; w: number; h: number; opacity?: number; rows?: number; rowsIn?: number; scan?: number; scale?: number}> = ({x, y, w, h, opacity = 1, rows = 3, rowsIn = 1, scan = -1, scale = 1}) => {
  const hh = Math.min(54, h * 0.2);
  const top = y - h / 2;
  const left = x - w / 2;
  const rh = (h - hh - 24) / rows;
  const av = Math.min(18, w * 0.07);
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>
      <rect x={left} y={top} width={w} height={h} rx={Math.min(28, h * 0.14)} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <line x1={left} y1={top + hh} x2={left + w} y2={top + hh} stroke={C.ink} strokeWidth={5} />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={left + 26 + k * Math.min(26, w * 0.08)} cy={top + hh / 2} r={Math.min(8, hh * 0.15)} fill="none" stroke={C.ink} strokeWidth={4} />
      ))}
      {scan >= 0 && <rect x={left + 10} y={top + hh + 12 + scan * rh * (rows - 1) - 2} width={w - 20} height={rh * 0.9} rx={12} fill={C.soft} opacity={0.75} />}
      {Array.from({length: rows}).map((_, i) => {
        const p = Math.max(0, Math.min(1, rowsIn * rows - i));
        const cy = top + hh + 12 + i * rh + rh * 0.45;
        const right = i % 2 === 1;
        const x0 = right ? left + w * 0.34 : left + 24 + av * 2 + 10;
        return (
          <g key={i} opacity={p}>
            {!right && <circle cx={left + 24 + av} cy={cy} r={av} fill="none" stroke={C.ink} strokeWidth={4} />}
            <line x1={x0} y1={cy - 9} x2={left + w - 26} y2={cy - 9} stroke={C.mid} strokeWidth={9} strokeLinecap="round" />
            <line x1={x0} y1={cy + 11} x2={left + w * (right ? 0.68 : 0.72)} y2={cy + 11} stroke={C.mid} strokeWidth={9} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

/** A squiggle that reads as handwriting without being a name. Drawn with pathLength 1. */
const Scrawl: React.FC<{x: number; y: number; p: number; w?: number; color?: string}> = ({x, y, p, w = 1, color = C.crimson}) =>
  p <= 0.01 ? null : (
  <path d="M 0 0 C 10 -26 22 -22 24 -2 C 26 14 34 12 44 -14 C 50 -28 58 -20 58 -4 L 66 -4 C 76 -30 88 -24 90 -4 C 92 12 102 10 112 -16 C 116 -24 124 -22 126 -8 L 142 -10 C 150 -20 158 -22 168 -6" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform={`translate(${x} ${y}) scale(${w})`} />
);

/** Two-line card used for the app's answer. */
const AnswerCard: React.FC<{x: number; y: number; w: number; h: number; opacity?: number; lines: number[]; scale?: number; dashed?: boolean}> = ({x, y, w, h, opacity = 1, lines, scale = 1, dashed}) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeDasharray={dashed ? '12 9' : undefined} />
    <circle cx={-w / 2 + 34} cy={-h / 2 + 36} r={16} fill="none" stroke={C.ink} strokeWidth={4} />
    {lines.map((ln, i) => (
      <line key={i} x1={-w / 2 + 28} y1={-h / 2 + 82 + i * 28} x2={-w / 2 + 28 + (w - 56) * ln} y2={-h / 2 + 82 + i * 28} stroke={C.mid} strokeWidth={9} strokeLinecap="round" />
    ))}
  </g>
);

const pt = (cx: number, cy: number, R: number, a: number): [number, number] => [cx + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)];

export const OwnerStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ====================== 1: three stations, then the launch flag ======================
  const o1 = between(t, -1, 4.15, 0.3);
  const stn = [prog(t, q.s1, 0.4, bounce), prog(t, q.s2, 0.4, bounce), prog(t, q.s3, 0.4, bounce)];
  const flagIn = prog(t, q.launch, 0.45, bounce);
  const trackP = prog(t, q.s1 - 0.1, 1.0);

  // ====================== 2: who reads it ======================
  const o2 = between(t, 4.1, 10.5, 0.3);
  const ghost = 0.26 + 0.74 * prog(t, q.someone, 0.4);
  const manGone = prog(t, q.someone, 0.5);
  const scanP = prog(t, q.reads, 1.3, lin);
  const plateIn = prog(t, q.byName - 0.1, 0.4, bounce);
  const womanPose = stand({look: -1, lh: t > q.own ? [-0.28, 0.02] : [-0.17, 0.27], rh: t > q.byName - 0.2 ? [0.22, 0.12] : [0.17, 0.27]});

  // ====================== 3: how often (weekly vs yearly) ======================
  const o3 = between(t, 10.55, 18.4, 0.3);
  const X0 = 200;
  const X1 = 690;
  const cells = 12;
  const cw = (X1 - X0) / cells;
  const wkP = prog(t, q.weekly + 0.1, 2.15, lin);
  const yrP = prog(t, q.yearly, 1.3, lin);
  const wkPts: string[] = [];
  for (let i = 0; i < cells; i++) {
    const a = X0 + i * cw;
    wkPts.push(`${a},0`, `${a + cw},${26}`, `${a + cw},0`);
  }
  const yrPts: string[] = [];
  for (let k = 0; k <= 40; k++) {
    const u = k / 40;
    yrPts.push(`${X0 + (X1 - X0) * u},${80 * Math.pow(u, 1.7)}`);
  }
  const noteIn = prog(t, q.drift, 0.4, bounce);
  const newsIn = prog(t, q.headline, 0.45, bounce);
  const gapIn = prog(t, q.headline - 0.1, 0.3);

  // ====================== 4: what happens when it is wrong ======================
  const o4 = between(t, 18.45, 28.0, 0.3);
  const cardIn = prog(t, q.q3 + 0.1, 0.45, bounce);
  const crossP = prog(t, q.wrong, 0.4, lin);
  const btnIn = prog(t, q.there, 0.35);
  const corrIn = prog(t, q.correct, 0.3, bounce);
  const chgIn = prog(t, q.change, 0.3, bounce);
  const press1 = Math.max(0, 1 - Math.abs(t - (q.correct + 0.55)) / 0.18);
  const press2 = Math.max(0, 1 - Math.abs(t - (q.change + 0.55)) / 0.18);
  const fixed = prog(t, q.correct + 0.55, 0.3);
  const rewrote = prog(t, q.change + 0.55, 0.3);
  const arrowFlow = prog(t, q.instr, 0.5);

  // ====================== 5 and 6: the loop ======================
  const o5 = between(t, 28.05, 51.4, 0.3);
  const cx = 430;
  const cy = 345;
  const R = 205;
  const Rt = R - 62;
  const Ro = R + 48;
  const quarters = [
    {name: 'PLAN', a0: 186, a1: 262, mid: 225, at: q.plan},
    {name: 'DO', a0: 276, a1: 352, mid: 315, at: q.do},
    {name: 'STUDY', a0: 6, a1: 82, mid: 45, at: q.study},
    {name: 'ACT', a0: 96, a1: 172, mid: 135, at: q.act},
  ];
  const arcPath = (a0: number, a1: number) => {
    const [x0, y0] = pt(cx, cy, R, a0);
    const [x1, y1] = pt(cx, cy, R, a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };
  const head = (a1: number) => {
    const tip = pt(cx, cy, R, a1 + 9);
    const b1 = pt(cx, cy, R + 19, a1);
    const b2 = pt(cx, cy, R - 19, a1);
    return `${tip.join(',')} ${b1.join(',')} ${b2.join(',')}`;
  };
  const empty = prog(t, q.reviewer, 0.5);
  const appC = prog(t, q.afterL2, 0.45, bounce);
  const clipIn = prog(t, q.review, 0.4, bounce) * (1 - prog(t, q.reviewer - 0.15, 0.3));
  const chairIn = prog(t, q.reviewer + 0.1, 0.4, bounce);
  const pulse = (a: number) => 1 + 0.16 * Math.sin(Math.min(1, Math.max(0, (t - a) / 0.5)) * Math.PI);
  // token: waypoints (time, ring angle in degrees, chord from the previous waypoint)
  const wps: {t: number; a: number; chord?: boolean}[] = [
    {t: 34.3, a: 225},
    {t: 34.9, a: 315},
    {t: 36.0, a: 405},
    {t: 37.5, a: 495},
    {t: 38.6, a: 585},
    {t: 39.7, a: 675},
    {t: 47.4, a: 675},
    {t: 47.9, a: 720},
    {t: 48.3, a: 810, chord: true},
    {t: 48.8, a: 855},
    {t: 49.6, a: 945},
    {t: 50.0, a: 1035},
    {t: 50.3, a: 1080},
    {t: 50.7, a: 1170, chord: true},
    {t: 51.1, a: 1215},
  ];
  let tok: [number, number] = pt(cx, cy, Rt, 225);
  for (let i = 0; i < wps.length - 1; i++) {
    const A = wps[i];
    const B = wps[i + 1];
    if (t >= A.t && t <= B.t) {
      const u = interpolate(t, [A.t, B.t], [0, 1]);
      const e = u * u * (3 - 2 * u);
      tok = pt(cx, cy, B.chord ? Rt + (Ro - Rt) * Math.sin(Math.PI * e) : Rt, lerp(A.a, B.a, e));
    } else if (t > B.t && i === wps.length - 2) tok = pt(cx, cy, Rt, B.a);
  }
  const tokOn = (prog(t, 34.2, 0.3) * (1 - prog(t, 39.9, 0.3)) + prog(t, 47.3, 0.3) * (1 - prog(t, 51.2, 0.2))) as number;
  const cardsIn = [prog(t, q.keeps, 0.35, bounce), prog(t, q.same, 0.35, bounce), prog(t, q.answers, 0.35, bounce)];
  const fitQ = prog(t, q.fit, 0.4, bounce);

  // ====================== 7 and 8: the name on the plan, and who would that be ======================
  const o7 = between(t, 51.4, 59.75, 0.25);
  const sheetIn = prog(t, q.so, 0.45, bounce);
  const scrawl = prog(t, q.rev, 1.0, lin) * (1 - prog(t, q.who2 + 0.15, 0.8, lin));
  const calIn = prog(t, q.launchDay - 0.2, 0.4, bounce);
  const sit = prog(t, q.name - 0.05, 0.5);
  const leave = prog(t, q.who2, 0.5);
  const chair2In = prog(t, q.so + 0.15, 0.4, bounce);
  const qMark = prog(t, q.who2 + 0.2, 0.4, bounce);
  const qBeat = 1 + 0.14 * Math.sin(Math.min(1, Math.max(0, (t - q.yours) / 0.5)) * Math.PI);
  const sitter: Pose = stand({crouch: 1, lf: -0.3, rf: -0.22, lh: [-0.02, 0.2], rh: [0.04, 0.2], lean: 0.0});

  // ====================== end card ======================
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  return (
    <g>
      {/* 1 */}
      {o1 > 0 && (
        <g opacity={o1}>
          <AppScreen x={500} y={205} w={360} h={250} opacity={prog(t, 0.05, 0.4)} rowsIn={prog(t, q.launch, 0.9, lin)} />
          <Tag x={500} y={40} text="AI APP" size={24} opacity={prog(t, q.aiApp, 0.3, bounce)} />
          <line x1={150} y1={480} x2={150 + 670 * trackP} y2={480} opacity={trackP > 0.02 ? 1 : 0} stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeDasharray="2 16" />
          {[230, 370, 510].map((sx, i) => (
            <g key={sx} transform={`translate(${sx} 480) scale(${stn[i]})`} opacity={Math.min(1, stn[i] * 2)}>
              <circle r={42} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              <text y={15} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={46} fill={C.ink}>
                {i + 1}
              </text>
            </g>
          ))}
          {flagIn > 0 && (
            <g opacity={Math.min(1, flagIn * 2)} transform={`translate(700 480) scale(${flagIn})`}>
              <line x1={0} y1={30} x2={0} y2={-110} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
              <path d="M 0 -110 L 86 -84 L 0 -56 Z" fill={C.crimson} stroke={C.crimson} strokeWidth={4} strokeLinejoin="round" />
            </g>
          )}
          <Tag x={700} y={560} text="LAUNCH" size={24} opacity={flagIn} />
        </g>
      )}

      {/* 2 */}
      {o2 > 0 && (
        <g opacity={o2}>
          <Badge n="1" text="WHO READS IT" opacity={prog(t, q.q1, 0.3)} />
          <AppScreen x={290} y={345} w={330} h={370} rows={4} scan={scanP > 0 && scanP < 1 ? scanP : -1} />
          <Tag x={290} y={120} text="AFTER LAUNCH" size={22} opacity={prog(t, q.afterL, 0.3, bounce)} />
          {manGone < 1 && <Stick x={720 + 90 * manGone} y={G} h={290} pose={stand({look: -1})} opacity={prog(t, q.who, 0.3) * 0.26 * (1 - manGone) * (t < q.someone ? 1 : 1)} />}
          <Stick x={570} y={G} h={290} hair="bob" pose={womanPose} opacity={prog(t, q.who, 0.3) * ghost} />
          {t >= q.who && t < q.someone + 0.15 && (
            <text x={645} y={265} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={96} fill={C.ink} opacity={prog(t, q.who, 0.35, bounce) * (1 - prog(t, q.someone, 0.25))}>
              ?
            </text>
          )}
          {plateIn > 0 && (
            <g opacity={Math.min(1, plateIn * 2)} transform={`translate(765 410) scale(${plateIn})`}>
              <rect x={-95} y={-40} width={190} height={80} rx={18} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <line x1={-70} y1={18} x2={70} y2={18} stroke={C.soft} strokeWidth={6} strokeLinecap="round" />
              <Scrawl x={-66} y={6} p={prog(t, q.byName + 0.1, 0.5, lin)} w={0.82} />
            </g>
          )}
        </g>
      )}

      {/* 3 */}
      {o3 > 0 && (
        <g opacity={o3}>
          <Badge n="2" text="HOW OFTEN" opacity={prog(t, q.q2, 0.3)} />
          <g opacity={prog(t, q.often, 0.4)}>
            <rect x={142} y={104} width={740} height={510} rx={34} fill={C.soft} />
            <rect x={130} y={90} width={740} height={510} rx={34} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
          </g>
          {[
            {tag: 'WEEKLY', tagY: 135, base: 195, strip: 290, at: q.weekly},
            {tag: 'YEARLY', tagY: 385, base: 445, strip: 540, at: q.yearly},
          ].map((r, ri) => (
            <g key={r.tag} opacity={prog(t, ri === 0 ? q.often + 0.1 : q.often + 0.35, 0.4)}>
              <Tag x={X0 + 74} y={r.tagY} text={r.tag} size={22} />
              <line x1={X0} y1={r.base} x2={X1} y2={r.base} stroke={C.ink} strokeWidth={4} strokeDasharray="10 9" />
              <rect x={X0} y={r.strip} width={X1 - X0} height={34} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
              {Array.from({length: cells - 1}).map((_, k) => (
                <line key={k} x1={X0 + (k + 1) * cw} y1={r.strip} x2={X0 + (k + 1) * cw} y2={r.strip + 34} stroke={C.mid} strokeWidth={3} />
              ))}
            </g>
          ))}
          {/* weekly: small saw-teeth, a check in each cell as the pen passes */}
          <clipPath id="own-wk"><rect x={X0 - 6} y={150} width={(X1 - X0 + 12) * wkP} height={160} /></clipPath>
          <g clipPath="url(#own-wk)">
            <g transform="translate(0 195)">
              <polyline points={wkPts.join(' ')} fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </g>
          {Array.from({length: cells}).map((_, i) => {
            const on = wkP >= (i + 1) / cells - 0.005;
            return on ? <path key={i} d={`M ${X0 + i * cw + 11} 308 L ${X0 + i * cw + 18} 316 L ${X0 + i * cw + 30} 299`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /> : null;
          })}
          {noteIn > 0 && (
            <g transform={`translate(790 250) scale(${noteIn})`} opacity={Math.min(1, noteIn * 2)}>
              <rect x={-44} y={-34} width={88} height={68} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <line x1={-26} y1={-10} x2={26} y2={-10} stroke={C.mid} strokeWidth={7} strokeLinecap="round" />
              <line x1={-26} y1={10} x2={8} y2={10} stroke={C.mid} strokeWidth={7} strokeLinecap="round" />
            </g>
          )}
          {/* yearly: one long slide, one check at the end, then the headline */}
          <clipPath id="own-yr"><rect x={X0 - 6} y={400} width={(X1 - X0 + 12) * yrP} height={150} /></clipPath>
          <g clipPath="url(#own-yr)">
            <g transform="translate(0 445)">
              <polyline points={yrPts.join(' ')} fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </g>
          {newsIn > 0 && (
            <g opacity={gapIn}>
              <g stroke={C.crimson} strokeWidth={6} strokeLinecap="round" fill="none">
                <path d={`M ${X1 + 22} 445 L ${X1 + 22} ${445 + 80 * gapIn}`} />
                <path d={`M ${X1 + 12} 445 L ${X1 + 32} 445 M ${X1 + 12} ${445 + 80 * gapIn} L ${X1 + 32} ${445 + 80 * gapIn}`} />
              </g>
              <path d={`M ${X0 + 11 + (cells - 1) * cw} 558 L ${X0 + 18 + (cells - 1) * cw} 566 L ${X0 + 30 + (cells - 1) * cw} 549`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {newsIn > 0 && (
            <g transform={`translate(795 495) scale(${newsIn})`} opacity={Math.min(1, newsIn * 2)}>
              <rect x={-58} y={-52} width={116} height={104} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <rect x={-42} y={-38} width={84} height={26} rx={4} fill={C.ink} />
              <line x1={-42} y1={6} x2={42} y2={6} stroke={C.mid} strokeWidth={7} strokeLinecap="round" />
              <line x1={-42} y1={24} x2={42} y2={24} stroke={C.mid} strokeWidth={7} strokeLinecap="round" />
              <line x1={-42} y1={42} x2={8} y2={42} stroke={C.mid} strokeWidth={7} strokeLinecap="round" />
            </g>
          )}
        </g>
      )}

      {/* 4 */}
      {o4 > 0 && (
        <g opacity={o4}>
          <Badge n="3" text="IF IT'S WRONG" opacity={prog(t, q.q3, 0.3)} />
          {/* instructions sheet behind the answer */}
          <g opacity={cardIn} transform={`translate(0 ${(1 - cardIn) * 20})`}>
            <path d="M 580 140 L 760 140 L 800 180 L 800 380 L 580 380 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 760 140 L 760 180 L 800 180" fill="none" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            {[0, 1, 2, 3].map((i) => {
              const base = [0.8, 0.55, 0.9, 0.5][i];
              const alt = [0.8, 0.9, 0.45, 0.7][i];
              return <line key={i} x1={608} y1={218 + i * 36} x2={608 + 160 * lerp(base, alt, rewrote)} y2={218 + i * 36} stroke={C.mid} strokeWidth={9} strokeLinecap="round" />;
            })}
            <line x1={608} y1={168} x2={700} y2={168} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          </g>
          {/* dashed arrow: the instructions produce the answer */}
          <g opacity={cardIn}>
            <path d="M 570 260 L 446 260" fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="10 9" strokeDashoffset={-arrowFlow * t * 40} strokeLinecap="round" />
            <path d="M 462 246 L 440 260 L 462 274" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <AnswerCard x={270} y={255} w={290} h={200} opacity={cardIn} scale={interpolate(cardIn, [0, 1], [0.9, 1])} lines={[lerp(0.9, 0.7, fixed), lerp(0.6, 0.9, fixed), lerp(0.8, 0.5, fixed)]} />
          {crossP > 0 && crossP < 1.001 && fixed < 1 && (
            <g opacity={1 - fixed}>
              <Cross x={410} y={158} r={26} p={crossP} />
            </g>
          )}
          {fixed > 0 && (
            <g opacity={Math.min(1, fixed * 3)}>
              <circle cx={410} cy={158} r={40} fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
              <path d="M 392 160 L 405 173 L 430 144" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fixed} />
            </g>
          )}
          {/* the two controls */}
          {[
            {x: 270, label: 'CORRECT', p: corrIn, press: press1},
            {x: 690, label: 'CHANGE', p: chgIn, press: press2},
          ].map((b) => (
            <g key={b.label}>
              <g opacity={btnIn * (1 - b.p)}>
                <rect x={b.x - 125} y={445} width={250} height={74} rx={37} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeDasharray="12 10" />
              </g>
              {b.p > 0 && (
                <g transform={`translate(${b.x} ${482 + b.press * 4}) scale(${interpolate(b.p, [0, 1], [0.9, 1]) * (1 - 0.04 * b.press)})`} opacity={Math.min(1, b.p * 2)}>
                  <rect x={-125} y={-37} width={250} height={74} rx={37} fill={b.press > 0.4 ? C.ink : '#FFFFFF'} stroke={C.ink} strokeWidth={6} />
                  <text y={11} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={31} letterSpacing={3} fill={b.press > 0.4 ? '#FFFFFF' : C.ink}>
                    {b.label}
                  </text>
                </g>
              )}
            </g>
          ))}
        </g>
      )}

      {/* 5 and 6 */}
      {o5 > 0 && (
        <g opacity={o5}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.mid} strokeWidth={5} strokeLinecap="round" strokeDasharray="1 17" opacity={prog(t, q.loop, 0.5) * (1 - prog(t, q.act + 0.6, 0.3))} />
          {quarters.map((qt) => {
            const p = prog(t, qt.at, 0.55, lin);
            const isStudy = qt.name === 'STUDY';
            const col = isStudy ? C.crimson : C.ink;
            const solid = isStudy ? 1 - empty : 1;
            const [tx, ty] = pt(cx, cy, R, qt.mid);
            const tp = prog(t, qt.at, 0.35, bounce) * (qt.name === 'STUDY' ? pulse(q.studyStep) : 1);
            return (
              <g key={qt.name}>
                <path d={arcPath(qt.a0, qt.a1)} fill="none" stroke={col} strokeWidth={17} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={solid} />
                {p > 0.92 && <polygon points={head(qt.a1)} fill={col} stroke={col} strokeWidth={4} strokeLinejoin="round" opacity={solid} />}
                {isStudy && empty > 0 && (
                  <g opacity={empty}>
                    <path d={arcPath(qt.a0, qt.a1)} fill="none" stroke={C.crimson} strokeWidth={13} strokeLinecap="round" strokeDasharray="4 22" />
                    <polygon points={head(qt.a1)} fill="none" stroke={C.crimson} strokeWidth={4} strokeLinejoin="round" />
                  </g>
                )}
                <g transform={`translate(${tx} ${ty}) scale(${tp})`} opacity={Math.min(1, tp * 2)}>
                  <Tag x={0} y={0} text={qt.name} size={22} fill={isStudy && empty > 0.5 ? '#FFFFFF' : C.ink} color={isStudy && empty > 0.5 ? C.crimson : '#FFFFFF'} />
                  {isStudy && empty > 0.5 && <rect x={-65} y={-21} width={130} height={42} rx={21} fill="none" stroke={C.crimson} strokeWidth={4} strokeDasharray="8 7" />}
                </g>
              </g>
            );
          })}
          {/* the app in the middle once it is live */}
          {appC > 0 && <AppScreen x={cx - 12} y={cy - 28} w={124} h={94} rows={2} opacity={Math.min(1, appC * 2)} scale={appC} />}
          {/* the review (a checklist) sits in the study quarter, then leaves; the chair stays empty */}
          {clipIn > 0 && (
            <g transform={`translate(${cx + 92} ${cy + 66}) scale(${clipIn * 1.1})`} opacity={Math.min(1, clipIn * 2)}>
              <rect x={-36} y={-48} width={72} height={96} rx={12} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <rect x={-14} y={-56} width={28} height={16} rx={6} fill={C.ink} />
              {[-18, 6, 30].map((yy) => (
                <g key={yy}>
                  <path d={`M -24 ${yy} L -19 ${yy + 5} L -11 ${yy - 5}`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                  <line x1={-2} y1={yy} x2={24} y2={yy} stroke={C.mid} strokeWidth={5} strokeLinecap="round" />
                </g>
              ))}
            </g>
          )}
          {chairIn > 0 && <Chair x={cx + 92} y={cy + 90} s={0.62 * chairIn} opacity={Math.min(1, chairIn * 2)} />}
          {tokOn > 0 && (
            <g transform={`translate(${tok[0]} ${tok[1]})`} opacity={tokOn}>
              <circle r={19} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              <circle r={7} fill={C.ink} />
            </g>
          )}
          {/* the same answers keep coming */}
          {cardsIn.map((p, i) =>
            p > 0 ? (
              <g key={i} transform={`translate(790 ${250 + i * 82}) scale(${p})`} opacity={Math.min(1, p * 2)}>
                <rect x={-66} y={-32} width={132} height={64} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
                <circle cx={-42} cy={0} r={10} fill="none" stroke={C.ink} strokeWidth={4} />
                <line x1={-22} y1={-8} x2={46} y2={-8} stroke={C.mid} strokeWidth={7} strokeLinecap="round" />
                <line x1={-22} y1={10} x2={22} y2={10} stroke={C.mid} strokeWidth={7} strokeLinecap="round" />
              </g>
            ) : null,
          )}
          {fitQ > 0 && (
            <text x={790} y={190} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={70} fill={C.ink} opacity={fitQ} transform={`scale(1)`}>
              ?
            </text>
          )}
        </g>
      )}

      {/* 7 and 8 */}
      {o7 > 0 && (
        <g opacity={o7}>
          {/* the project plan */}
          <g opacity={Math.min(1, sheetIn * 2)} transform={`translate(0 ${(1 - sheetIn) * 24})`}>
            <rect x={142} y={114} width={340} height={470} rx={22} fill={C.soft} />
            <rect x={130} y={100} width={340} height={470} rx={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
            <text x={160} y={158} fontFamily={SANS} fontWeight={700} fontSize={28} letterSpacing={3} fill={C.ink}>
              PROJECT PLAN
            </text>
            <line x1={160} y1={180} x2={440} y2={180} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            {[212, 244, 276].map((yy, i) => (
              <line key={yy} x1={160} y1={yy} x2={i === 2 ? 340 : 440} y2={yy} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
            ))}
            <text x={160} y={352} fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={3} fill={C.ink}>
              REVIEWER
            </text>
            <line x1={160} y1={420} x2={440} y2={420} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            <Scrawl x={176} y={404} p={scrawl} w={1.5} />
            {calIn > 0 && (
              <g transform={`translate(215 508) scale(${calIn})`} opacity={Math.min(1, calIn * 2)}>
                <rect x={-50} y={-38} width={100} height={78} rx={12} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
                <rect x={-50} y={-38} width={100} height={24} rx={12} fill={C.ink} />
                <path d="M -26 -46 L -26 -30 M 26 -46 L 26 -30" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
                <line x1={-12} y1={30} x2={-12} y2={-4} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
                <path d="M -12 -4 L 22 6 L -12 16 Z" fill="none" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
              </g>
            )}
            {calIn > 0 && <Tag x={365} y={508} text="LAUNCH" size={20} opacity={calIn} />}
          </g>
          {/* the study chair: empty until the name is written */}
          <Chair x={660} y={562} s={0.74 * chair2In} opacity={Math.min(1, chair2In * 2)} dashed={sit < 0.5} />
          {sit > 0 && leave < 1 && (
            <g opacity={Math.min(1, sit * 2) * (1 - leave)} transform={`translate(${(1 - sit) * 90 + leave * 80} 0)`}>
              <Stick x={665} y={608} h={360} pose={sitter} />
            </g>
          )}
          {qMark > 0 && (
            <text x={660} y={425} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={130} fill={C.ink} opacity={qMark} transform={`translate(660 425) scale(${qBeat}) translate(-660 -425)`}>
              ?
            </text>
          )}
        </g>
      )}

      {/* end card */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 1.5)}>
          <FollowIcon x={500} y={215} s={1.45 * ctaOn} />
          <Bell x={500} y={385} s={1.15 * ctaOn} ring={Math.max(0, t - q.cta - 0.4)} />
          <Tag x={500} y={515} text="FOLLOW FOR MORE" size={34} opacity={prog(t, q.cta + 0.15, 0.3)} />
        </g>
      )}
    </g>
  );
};
