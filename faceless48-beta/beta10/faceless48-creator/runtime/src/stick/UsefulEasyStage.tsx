import React from 'react';
import {interpolate} from 'remotion';
import {Stick, STAND, mix, type Pose} from './figure';
import {Bubble, Card, Cross, Tag, Window, C, SANS, between, bounce, clampX, ease, prog} from './kit';
import {Bell, Book, FollowIcon} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Useful and Easy". A plain, unbranded tool sits on a small console with two dials, USEFUL and EASY.
 * The people who use the tool turn the dials (the vendor's demo cannot). A low USEFUL aims the tool at a problem that
 * is not there; a low EASY piles extra steps on a job that was already full. Two questions (a hope, a stuck point)
 * point to three things to change: the tool, the training, the job.
 * `t` is seconds into the voiceover, `q` the cue times from content/useful-easy.stick.json.
 */
const G = 630;
const H = 280; // height of the two users at the console
const UX = 255; // left user x
const VX = 785; // right user x
const DY = 440; // dial centre y
const DL = 410; // USEFUL dial x
const DR = 630; // EASY dial x
const DRAD = 64;
const KNOB = DRAD + 18;

const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
/** eased keyframes: [[time, value], ...] */
const pw = (t: number, keys: [number, number][]) =>
  interpolate(
    t,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    {...clampX, easing: ease},
  );
const pop = (t: number, a: number, d = 0.4) => prog(t, a, d, bounce);
const EPS = 0.001;
const vis = (t: number, a: number, b: number, f = 0.3) => between(t, a, b, f);

/** The plain tool: a rounded window with a few lines and a button. `demo` swaps the lines for a play button. */
const ToolBox: React.FC<{x: number; y: number; s?: number; demo?: number; opacity?: number}> = ({x, y, s = 1, demo = 0, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <Window x={-150} y={-100} w={300} h={200} />
    <g opacity={1 - demo}>
      <line x1={-110} y1={-8} x2={110} y2={-8} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
      <line x1={-110} y1={20} x2={50} y2={20} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
      <line x1={-110} y1={48} x2={80} y2={48} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
      <rect x={-110} y={64} width={78} height={22} rx={11} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
    </g>
    {demo > 0 && (
      <g opacity={demo}>
        <circle cx={0} cy={26} r={50} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
        <path d="M -14 4 L 26 26 L -14 48 Z" fill={C.ink} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      </g>
    )}
  </g>
);

/** A half-circle dial. v = 0 points left (low), 1 points right (high). */
const Dial: React.FC<{x: number; y: number; r?: number; v: number; hot?: boolean; knob?: -1 | 0 | 1; opacity?: number; scale?: number}> = ({x, y, r = DRAD, v, hot, knob = 0, opacity = 1, scale = 1}) => {
  const a = Math.PI + v * Math.PI;
  const L = r - 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle r={r} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
      {Array.from({length: 7}).map((_, i) => {
        const b = Math.PI + (i * Math.PI) / 6;
        return <line key={i} x1={Math.cos(b) * (r - 17)} y1={Math.sin(b) * (r - 17)} x2={Math.cos(b) * (r - 7)} y2={Math.sin(b) * (r - 7)} stroke={C.ink} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" />;
      })}
      <text x={-r * 0.5} y={r * 0.5} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={r * 0.4} fill={C.mid}>
        -
      </text>
      <text x={r * 0.5} y={r * 0.5} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={r * 0.4} fill={C.mid}>
        +
      </text>
      <line x1={0} y1={0} x2={Math.cos(a) * L} y2={Math.sin(a) * L} stroke={hot ? C.crimson : C.ink} strokeWidth={8} strokeLinecap="round" />
      <circle r={10} fill={hot ? C.crimson : C.ink} />
      {knob !== 0 && (
        <g>
          <line x1={knob * r} y1={0} x2={knob * (r + 8)} y2={0} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <circle cx={knob * (r + 18)} cy={0} r={11} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
        </g>
      )}
    </g>
  );
};

const Thought: React.FC<{x: number; y: number; w?: number; h?: number; side: -1 | 1; opacity?: number; children?: React.ReactNode}> = ({x, y, w = 124, h = 98, side, opacity = 1, children}) => (
  <g opacity={opacity}>
    <circle cx={x + side * 18} cy={y + h / 2 + 52} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
    <circle cx={x + side * 8} cy={y + h / 2 + 28} r={12} fill="none" stroke={C.ink} strokeWidth={4} />
    <Bubble x={x} y={y} w={w} h={h}>
      {children}
    </Bubble>
  </g>
);

const Briefcase: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    <rect x={-32} y={-16} width={64} height={44} rx={9} fill="#FFFFFF" />
    <path d="M -12 -16 L -12 -28 L 12 -28 L 12 -16 M -32 4 L 32 4" />
  </g>
);

const Tap: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={-6} cy={-6} r={20} fill={C.soft} />
    <path d="M 4 2 L 4 40 L 15 30 L 23 48 L 32 44 L 24 27 L 39 27 Z" fill="#FFFFFF" strokeWidth={5} />
  </g>
);

const starPath = (ro: number, ri: number) =>
  Array.from({length: 10})
    .map((_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? ro : ri;
      return `${i === 0 ? 'M' : 'L'} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
    })
    .join(' ') + ' Z';

/** The white question tile: a hope (tool to star) or a stuck point (a path that ends at a wall). */
const Tile: React.FC<{x: number; y: number; s?: number; w?: number; h?: number; dashed?: boolean; opacity?: number; children?: React.ReactNode}> = ({x, y, s = 1, w = 290, h = 210, dashed, opacity = 1, children}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="#FFFFFF" stroke={dashed ? C.mid : C.ink} strokeWidth={6} strokeDasharray={dashed ? '14 12' : undefined} />
    {children}
  </g>
);

const Num: React.FC<{x: number; y: number; n: string; p: number; r?: number}> = ({x, y, n, p, r = 18}) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 2)}>
    <circle r={r} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <text y={r * 0.38} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={r * 1.15} fill={C.ink}>
      {n}
    </text>
  </g>
);

export const UsefulEasyStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // =================== the console: tool, panel, two dials, the people who use it ===================
  const consoleOn = vis(t, -1, q.dialsOut - 0.05, 0.3);
  const drop = pop(t, q.tool, 0.6);
  const settle = prog(t, q.useful1 - 0.1, 0.9);
  const toolY = interpolate(settle, [0, 1], [335, 195]);
  const toolS = interpolate(settle, [0, 1], [1.55, 1]) * (0.9 + 0.1 * drop) * (1 + 0.05 * Math.sin(Math.min(1, Math.max(0, (t - q.tool2) / 0.5)) * Math.PI));
  const newTag = pop(t, q.newTool, 0.4) * (1 - prog(t, q.useful1 - 0.3, 0.3));
  const panelIn = pop(t, q.useful1, 0.5);
  const easyIn = pop(t, q.easy1, 0.45);
  const panelPulse = 1 + 0.035 * Math.sin(Math.min(1, Math.max(0, (t - q.mostly) / 0.6)) * Math.PI);

  // needles: the people turn them
  const turn = (a: number, b: number, amp: number, f = 2.6) => amp * Math.sin((t - a) * f) * vis(t, a, b, 0.4);
  const usefulV =
    pw(t, [
      [0, 0.5],
      [q.usefulHigh, 0.5],
      [q.usefulHigh + 0.6, 0.88],
      [q.usefulLow, 0.88],
      [q.usefulLow + 0.6, 0.12],
      [q.reset, 0.12],
      [q.reset + 0.5, 0.5],
    ]) +
    turn(q.use + 0.4, q.easy1 + 1.9, 0.08) +
    turn(q.judg, q.demo, 0.1, 3.2);
  const easyV =
    pw(t, [
      [0, 0.5],
      [q.easyHigh, 0.5],
      [q.easyHigh + 0.6, 0.85],
      [q.easyLow, 0.85],
      [q.easyLow + 0.6, 0.1],
    ]) +
    turn(q.easy1 + 0.5, q.davis, 0.08) +
    turn(q.judg + 0.2, q.demo, 0.1, 3.6);
  const usefulHot = t >= q.usefulLow + 0.3 && t < q.reset;
  const easyHot = t >= q.easyLow + 0.3;

  // the two users
  const leftIn = pop(t, q.people, 0.45);
  const rightIn = pop(t, q.people + 0.3, 0.45);
  const reachL = prog(t, q.use, 0.5);
  const reachR = prog(t, q.easy1, 0.5);
  const exitR = prog(t, q.exitRight, 0.5);
  const wob = (a: number, b: number) => vis(t, a, b, 0.3);
  const w1 = wob(q.use + 0.5, q.dialsOut - 0.3);
  const leftMood = t >= q.usefulLow + 0.1 && t < q.reset ? 'flat' : t >= q.easyLow + 0.4 ? 'sad' : 'smile';
  const leftPose = pose({
    rh: [
      0.211 + 0.2 * 0 + (1 - reachL) * (0.17 - 0.211) + 0.007 * Math.sin(t * 6) * w1,
      0.0764 + (1 - reachL) * (0.27 - 0.0764) + 0.007 * Math.cos(t * 6) * w1,
    ],
    mood: leftMood,
    look: 1,
  });
  const w2 = wob(q.easy1 + 0.5, q.exitRight - 0.3);
  const rightPose = pose({
    lh: [
      -0.211 + (1 - reachR) * (-0.17 + 0.211) - 0.007 * Math.sin(t * 6.4) * w2,
      0.0764 + (1 - reachR) * (0.27 - 0.0764) + 0.007 * Math.cos(t * 6.4) * w2,
    ],
    look: -1,
    mood: t >= q.notHave && t < q.exitRight ? 'flat' : 'smile',
  });

  // S1: a busy Tuesday on a calendar page
  const calIn = pop(t, q.busy, 0.4) * (1 - prog(t, q.davis - 0.2, 0.3));
  // S2: Fred Davis, 1989, accepted, two judgments, what each one is about
  const davisIn = pop(t, q.davis, 0.35);
  const fredIn = pop(t, q.fred, 0.35);
  const tagsOut = prog(t, q.accept - 0.2, 0.3);
  const acceptIn = pop(t, q.accept, 0.45) * (1 - prog(t, q.judg - 0.4, 0.3));
  const badge1 = pop(t, q.two, 0.4) * (1 - prog(t, q.judg - 0.3, 0.3));
  const badge2 = pop(t, q.two + 0.3, 0.4) * (1 - prog(t, q.judg - 0.3, 0.3));
  const workBubble = pop(t, q.work, 0.45) * (1 - prog(t, q.easyHigh + 1.2, 0.3));
  const tapBubble = pop(t, q.tapped, 0.45) * (1 - prog(t, q.judg - 0.4, 0.3));
  // S3: the person judges, the vendor's demo cannot
  const spin = vis(t, q.judg, q.demo - 0.3, 0.3);
  const userTags = vis(t, q.person, q.demo - 0.3, 0.3);
  const demoOn = prog(t, q.demo, 0.35) * (1 - prog(t, q.usefulLow - 0.6, 0.4));
  const crossP = prog(t, q.cant, 0.4, (v) => v) * (1 - prog(t, q.usefulLow - 0.6, 0.4));
  // S4: low USEFUL, the tool aimed at a problem that is not there
  const beam = prog(t, q.solve, 0.5, (v) => v) * (1 - prog(t, q.reset - 0.2, 0.3));
  const target = pop(t, q.problem, 0.45) * (1 - prog(t, q.reset - 0.2, 0.3));
  const notThere = pop(t, q.notHave, 0.35) * (1 - prog(t, q.reset - 0.2, 0.3));
  // S4: low EASY, steps stacked on a job that was already full
  const jobCards = [q.easyLow + 0.05, q.easyLow + 0.25, q.easyLow + 0.45, q.easyLow + 0.65, q.add, q.add + 0.22, q.add + 0.44];
  const jobSway = Math.sin(Math.max(0, t - q.full) * 7) * 2.4 * vis(t, q.full, q.dialsOut - 0.2, 0.2);
  const jobTag = pop(t, q.job, 0.35);
  const fullTag = pop(t, q.full, 0.35);
  const stackX = 814;

  // =================== the pair of dials: which one is it? ===================
  const pairOn = vis(t, q.find, q.twoQ - 0.05, 0.3);
  const whichQ = pop(t, q.which, 0.4);

  // =================== the two questions, a few users ===================
  const qOn = vis(t, q.twoQ - 0.05, q.cta - 0.2, 0.3);
  const tile1In = pop(t, q.twoQ, 0.45);
  const tile2In = pop(t, q.twoQ + 0.2, 0.45);
  const shrink = prog(t, q.answers - 0.1, 0.7);
  const t1x = interpolate(shrink, [0, 1], [330, 440]);
  const t2x = interpolate(shrink, [0, 1], [690, 560]);
  const ty = interpolate(shrink, [0, 1], [180, 84]);
  const ts = interpolate(shrink, [0, 1], [1, 0.38]);
  const usersOut = 1 - prog(t, q.answers - 0.3, 0.3);
  const u1 = pop(t, q.users, 0.45);
  const u2 = pop(t, q.users + 0.18, 0.45);
  const u3 = pop(t, q.users + 0.36, 0.45);
  const starP = pop(t, q.hoped, 0.45);
  const miniTool = pop(t, q.tool3, 0.4);
  const arrowP = prog(t, q.doIt, 0.4, (v) => v);
  const hopedTag = pop(t, q.hoped, 0.35) * (1 - shrink);
  const pathP = prog(t, q.where, 0.8, (v) => v);
  const wallP = pop(t, q.stuck, 0.4);
  const stuckTag = pop(t, q.stuck, 0.35) * (1 - shrink);
  const hand1 = prog(t, q.hoped, 0.3) * (1 - prog(t, q.where - 0.2, 0.3));
  const stuckOn = prog(t, q.stuck, 0.3);
  const poseU1 = pose({rh: [0.17 + 0.04 * hand1, 0.27 - 0.4 * hand1], mood: stuckOn > 0.5 ? 'flat' : 'smile', look: 1});
  const poseU2 = pose({mood: stuckOn > 0.5 ? 'sad' : 'smile'});
  const poseU3 = mix(pose({look: -1}), pose({lh: [-0.2, 0.08], rh: [0.2, 0.08], mood: 'sad', look: -1}), stuckOn);
  const bobOf = (k: number) => 1 + 0.015 * Math.sin(t * 3 + k);

  // =================== three things to change ===================
  const fanOn = vis(t, q.answers, q.cta - 0.2, 0.3);
  const arrowsP = prog(t, q.tellYou, 0.5, (v) => v);
  const slotsP = prog(t, q.change, 0.4);
  const slotX = [270, 500, 730];
  const slotIn = [pop(t, q.toolA, 0.45), pop(t, q.training, 0.45), pop(t, q.job2, 0.45)];
  const ringAt = t >= q.job2 ? 2 : t >= q.training ? 1 : t >= q.toolA ? 0 : -1;
  const ringP = ringAt < 0 ? 0 : pop(t, [q.toolA, q.training, q.job2][ringAt], 0.35);

  // =================== end card ===================
  const ctaOn = pop(t, q.cta, 0.5);
  const dialEndU = pw(t, [[0, 0.45], [q.usefulEnd, 0.45], [q.usefulEnd + 0.5, 0.9]]);
  const dialEndE = pw(t, [[0, 0.45], [q.easyEnd, 0.45], [q.easyEnd + 0.5, 0.9]]);
  const bothP = pop(t, q.both, 0.4);

  const arc = (cx: number) => {
    const R = DRAD + 16;
    const a1 = Math.PI + 0.35;
    const a2 = 2 * Math.PI - 0.35;
    const sx = cx + R * Math.cos(a1);
    const sy = DY + R * Math.sin(a1);
    const ex = cx + R * Math.cos(a2);
    const ey = DY + R * Math.sin(a2);
    const dx = -Math.sin(a2);
    const dy = Math.cos(a2);
    const nx = Math.cos(a2);
    const ny = Math.sin(a2);
    return `M ${sx} ${sy} A ${R} ${R} 0 0 1 ${ex} ${ey} M ${ex - 13 * dx + 9 * nx} ${ey - 13 * dy + 9 * ny} L ${ex} ${ey} L ${ex - 13 * dx - 9 * nx} ${ey - 13 * dy - 9 * ny}`;
  };

  return (
    <g>
      {/* ============ 1 to 4: the console ============ */}
      {consoleOn > 0 && (
        <g opacity={consoleOn}>
          {/* stand, neck and panel */}
          {panelIn > 0 && (
            <g opacity={Math.min(1, panelIn * 2)} transform={`translate(520 ${460}) scale(${panelPulse}) translate(-520 -460)`}>
              <path d={`M 404 575 L 404 ${G} M 636 575 L 636 ${G}`} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
              <rect x={498} y={290} width={44} height={60} fill={C.soft} stroke={C.ink} strokeWidth={5} />
              <rect x={300} y={345} width={440} height={230} rx={32} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
            </g>
          )}
          <ToolBox x={520} y={toolY} s={toolS} demo={demoOn} />
          {newTag > 0 && <Tag x={520} y={toolY - 115 * toolS - 40} text="NEW AI TOOL" size={26} opacity={Math.min(1, newTag * 2)} />}
          {panelIn > 0 && (
            <g opacity={Math.min(1, panelIn * 2)} transform={`translate(520 ${460}) scale(${panelPulse}) translate(-520 -460)`}>
              <Dial x={DL} y={DY} v={usefulV} hot={usefulHot} knob={-1} />
              <Tag x={DL} y={535} text="USEFUL" size={22} />
              {easyIn <= EPS && <circle cx={DR} cy={DY} r={DRAD} fill="none" stroke={C.mid} strokeWidth={5} strokeDasharray="12 10" />}
              {easyIn > EPS && (
                <g opacity={Math.min(1, easyIn * 2)}>
                  <Dial x={DR} y={DY} v={easyV} hot={easyHot} knob={1} scale={easyIn} />
                  <Tag x={DR} y={535} text="EASY" size={22} />
                </g>
              )}
              {badge1 > 0 && <Num x={DL - 50} y={DY - 52} n="1" p={badge1} />}
              {badge2 > 0 && <Num x={DR + 50} y={DY - 52} n="2" p={badge2} />}
              {spin > 0 && (
                <g opacity={spin} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
                  <path d={arc(DL)} />
                  <path d={arc(DR)} />
                </g>
              )}
            </g>
          )}

          {/* the people who use it */}
          {leftIn > 0 && <Stick x={UX} y={G} h={H * leftIn} pose={leftPose} hair="ponytail" opacity={Math.min(1, leftIn * 3)} />}
          {rightIn > 0 && exitR < 1 && <Stick x={VX + 70 * exitR} y={G} h={H * rightIn} pose={rightPose} opacity={Math.min(1, rightIn * 3) * (1 - exitR)} />}

          {/* 1: busy Tuesday */}
          {calIn > 0 && (
            <g transform={`translate(800 ${150}) scale(${calIn})`} opacity={Math.min(1, calIn * 2)}>
              <rect x={-70} y={-78} width={140} height={156} rx={20} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              <path d="M -70 -42 L -70 -58 Q -70 -78 -50 -78 L 50 -78 Q 70 -78 70 -58 L 70 -42 Z" fill={t >= q.tue ? C.crimson : C.ink} stroke={t >= q.tue ? C.crimson : C.ink} strokeWidth={6} strokeLinejoin="round" />
              {t >= q.tue && (
                <text y={-48} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} letterSpacing={3} fill="#FFFFFF">
                  TUE
                </text>
              )}
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => {
                  const on = prog(t, q.busy + 0.05 * (row * 3 + col), 0.25);
                  return <rect key={`${row}${col}`} x={-52 + col * 38} y={-26 + row * 32} width={30} height={22} rx={6} fill={C.soft} stroke={C.ink} strokeWidth={3} opacity={on} />;
                }),
              )}
            </g>
          )}

          {/* 2: Fred Davis, 1989 */}
          {davisIn > 0 && (
            <g opacity={1 - tagsOut}>
              <Tag x={350} y={45} text="1989" size={26} opacity={Math.min(1, davisIn * 2)} />
              {fredIn > 0 && <Tag x={620} y={45} text="FRED DAVIS" size={26} opacity={Math.min(1, fredIn * 2)} />}
            </g>
          )}
          {acceptIn > 0 && (
            <g opacity={Math.min(1, acceptIn * 2)}>
              <g transform={`translate(672 100) scale(${acceptIn})`}>
                <circle r={30} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
                <path d="M -13 1 L -4 11 L 15 -11" fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <Tag x={790} y={100} text="ACCEPT" size={22} />
            </g>
          )}
          {workBubble > 0 && (
            <g opacity={Math.min(1, workBubble * 2)}>
              <Thought x={190} y={215} side={1}>
                <g transform="translate(190 217)">
                  <Briefcase s={0.9} />
                </g>
              </Thought>
            </g>
          )}
          {tapBubble > 0 && (
            <g opacity={Math.min(1, tapBubble * 2)}>
              <Thought x={800} y={215} side={-1}>
                <g transform="translate(800 217)">
                  <Tap s={0.9} />
                </g>
              </Thought>
            </g>
          )}

          {/* 3: the users, not the vendor */}
          {userTags > 0 && (
            <g opacity={userTags}>
              <Tag x={UX} y={282} text="USER" size={20} />
              <Tag x={VX} y={282} text="USER" size={20} />
            </g>
          )}
          {demoOn > 0 && (
            <g>
              <Tag x={520} y={45} text="VENDOR DEMO" size={24} opacity={demoOn} />
              {crossP > 0 && <Cross x={520} y={218} r={34} p={crossP} />}
            </g>
          )}

          {/* 4: tool aimed at a problem that is not there */}
          {beam > 0 && (
            <g opacity={beam}>
              <path d="M 684 195 L 752 176" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray="4 12" />
              <path d="M 738 164 L 756 175 L 738 190" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {target > 0 && (
            <g transform={`translate(815 160) scale(${target})`} opacity={Math.min(1, target * 2)}>
              <circle r={50} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeDasharray="10 9" />
              <circle r={28} fill="none" stroke={C.ink} strokeWidth={6} strokeDasharray="8 8" />
              <text y={14} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={42} fill={C.ink}>
                ?
              </text>
            </g>
          )}
          {notThere > 0 && <Tag x={790} y={252} text="NOT THERE" size={20} opacity={Math.min(1, notThere * 2)} />}

          {/* 4: steps on a full job */}
          {jobCards.map((at, i) => {
            const p = pop(t, at, 0.4);
            if (p <= 0) return null;
            const extra = i >= 4;
            const sx = stackX + (i % 2 === 0 ? -5 : 6) + jobSway * (i / 3);
            return <Card key={i} x={sx} y={G - 22 - i * 46 - (1 - p) * 90} w={134} h={42} rot={(i % 3 - 1) * 1.8 + jobSway * 0.4} opacity={Math.min(1, p * 2)} accent={extra} />;
          })}
          {jobTag > 0 && <Tag x={stackX} y={668} text="JOB" size={20} opacity={Math.min(1, jobTag * 2)} />}
          {fullTag > 0 && <Tag x={stackX} y={264} text="FULL" size={24} fill={C.crimson} opacity={Math.min(1, fullTag * 2)} />}
        </g>
      )}

      {/* ============ 5a: which one is it? ============ */}
      {pairOn > 0 && (
        <g opacity={pairOn}>
          <Dial x={350} y={330} r={120} v={0.5 + 0.34 * Math.sin(t * 2.3)} scale={pop(t, q.find - 0.45, 0.45)} />
          <Dial x={650} y={330} r={120} v={0.5 + 0.34 * Math.sin(t * 1.7 + 1.5)} scale={pop(t, q.find - 0.3, 0.45)} />
          <Tag x={350} y={500} text="USEFUL" size={28} />
          <Tag x={650} y={500} text="EASY" size={28} />
          {whichQ > 0 && (
            <text x={500} y={175} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={150} fill={C.ink} opacity={Math.min(1, whichQ * 2)} transform={`translate(0 ${(1 - whichQ) * 20})`}>
              ?
            </text>
          )}
        </g>
      )}

      {/* ============ 5b: two questions, a few users ============ */}
      {qOn > 0 && (
        <g opacity={qOn}>
          {tile1In > 0 && (
            <Tile x={t1x} y={ty} s={ts * tile1In} dashed={starP <= EPS}>
              {starP <= EPS && (
                <text y={34} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={96} fill={C.mid}>
                  1
                </text>
              )}
              {starP > EPS && (
                <g>
                  {miniTool > 0 && <ToolBox x={-78} y={4} s={0.4 * miniTool} opacity={Math.min(1, miniTool * 2)} />}
                  {arrowP > 0 && (
                    <path d={`M -4 4 L ${-4 + 40 * arrowP} 4 M ${-4 + 40 * arrowP - 12} -8 L ${-4 + 40 * arrowP} 4 L ${-4 + 40 * arrowP - 12} 16`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  <g transform={`translate(88 2) scale(${starP})`}>
                    <path d={starPath(46, 20)} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
                  </g>
                </g>
              )}
            </Tile>
          )}
          {tile2In > 0 && (
            <Tile x={t2x} y={ty} s={ts * tile2In} dashed={pathP <= 0}>
              {pathP <= 0 && (
                <text y={34} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={96} fill={C.mid}>
                  2
                </text>
              )}
              {pathP > 0 && (
                <g>
                  <circle cx={-96} cy={34} r={11} fill={C.ink} />
                  <path d="M -96 34 L -50 34 L -50 -22 L 8 -22 L 8 34 L 52 34" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={380} strokeDashoffset={380 * (1 - pathP)} />
                  {wallP > 0 && <line x1={78} y1={34 + 56 * (wallP - 1)} x2={78} y2={34 - 56 * wallP} stroke={C.crimson} strokeWidth={12} strokeLinecap="round" />}
                </g>
              )}
            </Tile>
          )}
          {hopedTag > 0 && <Tag x={330} y={322} text="HOPED" size={22} opacity={Math.min(1, hopedTag * 2)} />}
          {stuckTag > 0 && <Tag x={690} y={322} text="STUCK" size={22} opacity={Math.min(1, stuckTag * 2)} />}
          {usersOut > 0 && (
            <g opacity={usersOut}>
              {u1 > 0 && <Stick x={290} y={G} h={230 * u1 * bobOf(0)} pose={poseU1} hair="long" opacity={Math.min(1, u1 * 3)} />}
              {u2 > 0 && <Stick x={520} y={G} h={230 * u2 * bobOf(2)} pose={poseU2} opacity={Math.min(1, u2 * 3)} />}
              {u3 > 0 && <Stick x={750} y={G} h={230 * u3 * bobOf(4)} pose={poseU3} hair="bun" opacity={Math.min(1, u3 * 3)} />}
            </g>
          )}
        </g>
      )}

      {/* ============ 6: tool, training or job ============ */}
      {fanOn > 0 && (
        <g opacity={fanOn}>
          {arrowsP > 0 && (
            <g fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={Math.min(1, arrowsP * 2)}>
              {slotX.map((sx) => {
                const ex = 500 + (sx - 500) * arrowsP;
                const ey = 138 + 92 * arrowsP;
                return (
                  <g key={sx}>
                    <line x1={500} y1={138} x2={ex} y2={ey} />
                    {arrowsP > 0.9 && <path d={`M ${ex + (sx === 500 ? -11 : sx < 500 ? 4 : -4)} ${ey - 16} L ${ex} ${ey} L ${ex + (sx === 500 ? 11 : sx < 500 ? 16 : -16)} ${ey - 10}`} />}
                  </g>
                );
              })}
            </g>
          )}
          {slotX.map((sx, i) => (
            <g key={sx}>
              {slotsP > 0 && slotIn[i] <= EPS && <Tile x={sx} y={365} w={200} h={230} dashed opacity={slotsP} />}
              {slotIn[i] > EPS && (
                <Tile x={sx} y={365} w={200} h={230} s={slotIn[i]} opacity={Math.min(1, slotIn[i] * 2)}>
                  {i === 0 && <ToolBox x={0} y={0} s={0.55} />}
                  {i === 1 && <Book s={1.7} />}
                  {i === 2 &&
                    [-66, -22, 22, 66].map((cy, k) => <Card key={k} x={(k % 2 ? 5 : -5)} y={cy} w={150} h={40} rot={(k % 3 - 1) * 1.6} scale={0.95} />)}
                </Tile>
              )}
              {slotIn[i] > EPS && <Tag x={sx} y={520} text={['TOOL', 'TRAINING', 'JOB'][i]} size={24} opacity={Math.min(1, slotIn[i] * 2)} />}
            </g>
          ))}
          {ringAt >= 0 && <rect x={slotX[ringAt] - 116} y={365 - 131} width={232} height={262} rx={42} fill="none" stroke={C.crimson} strokeWidth={8} opacity={ringP} />}
        </g>
      )}

      {/* ============ 7: end card ============ */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={410} y={140} s={1.3 * ctaOn} />
          <Bell x={720} y={140} s={1.5 * ctaOn} ring={Math.max(0, (t - q.cta - 0.5) * 0.5)} />
          <Tag x={500} y={285} text="FOLLOW AND SUBSCRIBE" size={36} />
          <Dial x={380} y={430} r={58} v={dialEndU} scale={1 + 0.1 * bothP} />
          <Dial x={620} y={430} r={58} v={dialEndE} scale={1 + 0.1 * bothP} />
          <Tag x={380} y={535} text="USEFUL" size={20} />
          <Tag x={620} y={535} text="EASY" size={20} />
        </g>
      )}
    </g>
  );
};
