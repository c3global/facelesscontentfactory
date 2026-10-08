import React from 'react';
import {interpolate} from 'remotion';
import {Stick, STAND, joints, type Hair, type Pose} from './figure';
import {Bubble, Panel, Tag, Window, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Before the Tool, the Thaw". Lewin's three steps drawn as ice. A small team stands waist-deep in a
 * slab of ice (the old way) while the new tool glows, unused. The three steps appear and the project skips to the
 * middle one. Three small badges are what the old way gives them (the day, the skill, the colleagues). Unfreezing is
 * asking: the slab drips. Skip it and the tool sits while the habit goes on. The fix is a THAW line on the plan, then
 * the question: what does the old way do that the new tool does not do yet (an empty dashed slot). `t` is seconds into
 * the voiceover, `q` the cue times from content/thaw.stick.json.
 */
const G = 630;
const H = 225;
const ICE = '#DCE0E3';
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});

/** the team: man, woman, man, woman */
const TEAM: {dx: number; hair?: Hair}[] = [{dx: -132}, {dx: -44, hair: 'bob'}, {dx: 44}, {dx: 132, hair: 'ponytail'}];

// ------------------------------------------------------------------ pieces

/** A slab of ice the team stands in, up to the waist. `melt` lowers the top and rounds it, `drips` runs drops down it. */
const Slab: React.FC<{x: number; t: number; melt?: number; shake?: number; pulse?: number; drips?: number; tag?: number}> = ({x, t, melt = 0, shake = 0, pulse = 0, drips = 0, tag = 1}) => {
  const W = 380;
  const top = 515 + melt * 40;
  const bot = 654;
  const r = 22 + melt * 18;
  const x0 = x - W / 2 + shake;
  const x1 = x + W / 2 + shake;
  const d = `M ${x0 + r} ${top} L ${x1 - r} ${top} Q ${x1} ${top} ${x1} ${top + r} L ${x1} ${bot - 14} Q ${x1} ${bot} ${x1 - 14} ${bot} L ${x0 + 14} ${bot} Q ${x0} ${bot} ${x0} ${bot - 14} L ${x0} ${top + r} Q ${x0} ${top} ${x0 + r} ${top} Z`;
  const drop = 'M 0 -13 C 9 0, 10 9, 0 11 C -10 9, -9 0, 0 -13 Z';
  const runs = [
    {x: x0 + 70, ph: 0.0, front: true},
    {x: x1 - 80, ph: 0.45, front: true},
    {x: x0 - 14, ph: 0.2, front: false},
    {x: x1 + 14, ph: 0.7, front: false},
  ];
  return (
    <g>
      <path d={d} fill={ICE} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <line x1={x0 + 32} y1={top + 14} x2={x1 - 32} y2={top + 14} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${x0 + 44} ${top + 74} l 30 -30 M ${x1 - 74} ${top + 96} l 24 -24 M ${x0 + 150} ${top + 112} l 20 -20`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
      {drips > 0 &&
        runs.map((rn, i) => {
          const u = (t * 0.8 + rn.ph) % 1;
          const y = rn.front ? top + 10 + u * (bot - top - 28) : top + 18 + u * (bot - top - 6);
          return (
            <g key={i} opacity={drips * (1 - Math.max(0, u - 0.82) * 5.5)} transform={`translate(${rn.x} ${y})`}>
              <path d={drop} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
            </g>
          );
        })}
      {tag > 0 && (
        <g transform={`translate(${x + shake} 604) scale(${1 + 0.14 * Math.sin(Math.min(1, pulse) * Math.PI)})`} opacity={tag}>
          <Tag x={0} y={0} text="OLD WAY" size={26} />
        </g>
      )}
    </g>
  );
};

/** The new tool: a plain window, with a crimson glow when it is new and unused. */
const Tool: React.FC<{x: number; t: number; y?: number; w?: number; h?: number; glow?: number; idle?: number; build?: number; opacity?: number}> = ({x, t, y = 330, w = 200, h = 270, glow = 0, idle = 0, build = 1, opacity = 1}) => {
  const L = x - w / 2;
  const ray = (x1: number, y1: number, x2: number, y2: number, i: number) => (
    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.crimson} strokeWidth={7} strokeLinecap="round" opacity={glow * (0.55 + 0.45 * Math.sin(t * 6 + i))} />
  );
  const rays = [
    ...[-2, -1, 0, 1, 2].map((k) => [x + k * 40, y - 40, x + k * 46, y - 62] as const),
    ...[0, 1, 2].map((k) => [L - 40, y + 50 + k * 80, L - 62, y + 40 + k * 90] as const),
    ...[0, 1, 2].map((k) => [L + w + 40, y + 50 + k * 80, L + w + 62, y + 40 + k * 90] as const),
  ];
  return (
    <g opacity={opacity} transform={`translate(0 ${y + h}) scale(1 ${Math.max(0.001, build)}) translate(0 ${-(y + h)})`}>
      {glow > 0 && (
        <g>
          <rect x={L - 14} y={y - 14} width={w + 28} height={h + 28} rx={38} fill="none" stroke={C.crimson} strokeWidth={6} opacity={0.5 * glow} />
          <rect x={L - 28} y={y - 28} width={w + 56} height={h + 56} rx={50} fill="none" stroke={C.crimson} strokeWidth={5} opacity={0.22 * glow} />
          {rays.map((r, i) => ray(r[0], r[1], r[2], r[3], i))}
        </g>
      )}
      <Window x={L} y={y} w={w} h={h} dim={idle} />
      {[96, 128, 160].map((dy, i) => (
        <line key={dy} x1={L + 30} y1={y + dy} x2={L + w - (i === 2 ? 80 : 30)} y2={y + dy} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
      ))}
      <rect x={L + 30} y={y + h - 70} width={w - 60} height={38} rx={19} fill="none" stroke={idle ? C.mid : C.ink} strokeWidth={5} />
    </g>
  );
};

const Zs: React.FC<{x: number; y: number; t: number; opacity: number}> = ({x, y, t, opacity}) => (
  <g opacity={opacity}>
    {[0, 1, 2].map((i) => {
      const u = (t * 0.5 + i / 3) % 1;
      return (
        <text key={i} x={x + u * 26} y={y - u * 50} fontFamily={SANS} fontWeight={700} fontSize={26 + u * 22} fill={C.mid} opacity={Math.sin(u * Math.PI)}>
          z
        </text>
      );
    })}
  </g>
);

/** Eight little head-circles: who is using the tool. */
const Usage: React.FC<{x: number; y: number; p: number; filled: number}> = ({x, y, p, filled}) => (
  <g opacity={p}>
    <Tag x={x} y={y - 54} text="USING IT" size={20} />
    {Array.from({length: 8}).map((_, k) => (
      <circle key={k} cx={x + ((k % 4) - 1.5) * 42} cy={y + Math.floor(k / 4) * 42} r={14} fill={k < filled ? C.ink : '#FFFFFF'} stroke={C.ink} strokeWidth={5} />
    ))}
  </g>
);

const Slide: React.FC<{x: number; y: number; p: number; check: number}> = ({x, y, p, check}) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 2)}>
    <rect x={-130} y={-36} width={260} height={72} rx={16} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <rect x={-112} y={-13} width={26} height={26} rx={6} fill="none" stroke={C.ink} strokeWidth={4} />
    <path d="M -107 0 L -101 7 L -90 -9" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - check)} />
    <text x={-68} y={10} fontFamily={SANS} fontWeight={700} fontSize={28} letterSpacing={1} fill={C.ink}>
      TRAINING
    </text>
  </g>
);

const Megaphone: React.FC<{x: number; y: number; p: number; t: number}> = ({x, y, p, t}) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 2)}>
    <path d="M 36 -18 L 36 18 L -16 42 L -16 -42 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <rect x={36} y={-14} width={24} height={28} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
    <rect x={6} y={26} width={22} height={34} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
    {[0, 1, 2].map((i) => {
      const u = (t * 1.6 + i / 3) % 1;
      return <path key={i} d={`M ${-34 - i * 26} -26 Q ${-52 - i * 26} 0 ${-34 - i * 26} 26`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={0.3 + 0.7 * Math.sin(u * Math.PI)} />;
    })}
  </g>
);

const Magnifier: React.FC<{x: number; y: number; opacity: number}> = ({x, y, opacity}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <line x1={24} y1={24} x2={54} y2={54} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
    <circle r={32} fill="#FFFFFF" fillOpacity={0.55} stroke={C.ink} strokeWidth={7} />
  </g>
);

type Kind = 'day' | 'skill' | 'team';
/** What the old way gives them, as a round badge. */
const Badge: React.FC<{x: number; y: number; kind: Kind; p: number; ghost?: number; pulse?: number; s?: number}> = ({x, y, kind, p, ghost = 0, pulse = 0, s = 1}) => {
  const ink = {fill: 'none', stroke: C.ink, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  const star = Array.from({length: 10}, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 27 : 12;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(' ');
  return (
    <g transform={`translate(${x} ${y}) scale(${p * s * (1 + 0.16 * Math.sin(Math.min(1, pulse) * Math.PI))})`} opacity={Math.min(1, p * 2) * (1 - 0.55 * ghost)}>
      <circle r={46} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeDasharray={ghost > 0.5 ? '10 9' : undefined} />
      {kind === 'day' && (
        <g {...ink}>
          <path d="M -30 16 L 30 16" />
          <path d="M -17 16 A 17 17 0 0 1 17 16" />
          {[-150, -110, -70, -30].map((a) => (
            <path key={a} d={`M ${Math.cos((a * Math.PI) / 180) * 26} ${16 + Math.sin((a * Math.PI) / 180) * 26} L ${Math.cos((a * Math.PI) / 180) * 36} ${16 + Math.sin((a * Math.PI) / 180) * 36}`} />
          ))}
          <path d="M -14 28 L 14 28" strokeWidth={4} />
        </g>
      )}
      {kind === 'skill' && <polygon points={star} {...ink} transform="translate(0 2)" />}
      {kind === 'team' && (
        <g {...ink}>
          <circle cx={-15} cy={-17} r={8} />
          <circle cx={15} cy={-17} r={8} />
          <path d="M -15 -4 L -15 18 M 15 -4 L 15 18" strokeWidth={11} />
          <path d="M -7 6 L 7 6" strokeWidth={4} strokeDasharray="3 5" />
        </g>
      )}
    </g>
  );
};

const Cube: React.FC<{x: number; y: number; s?: number; tool?: boolean}> = ({x, y, s = 1, tool}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-44} y={-44} width={88} height={88} rx={16} fill={ICE} stroke={C.ink} strokeWidth={6} />
    <path d="M -28 -16 l 18 -18 M -28 8 l 8 -8" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
    {tool && (
      <g>
        <rect x={-16} y={-20} width={32} height={44} rx={7} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
        <line x1={-8} y1={-6} x2={8} y2={-6} stroke={C.soft} strokeWidth={5} strokeLinecap="round" />
        <line x1={-8} y1={6} x2={4} y2={6} stroke={C.soft} strokeWidth={5} strokeLinecap="round" />
      </g>
    )}
  </g>
);

/** One of Lewin's three steps as a card with an ice picture. `p` draws it in; before that it is a dashed slot. */
const StepCard: React.FC<{x: number; kind: 'thaw' | 'move' | 'freeze'; slot: number; p: number; t: number; dim?: number; hot?: number}> = ({x, kind, slot, p, t, dim = 0, hot = 0}) => {
  const bump = 1 + 0.07 * Math.sin(Math.min(1, hot * 2) * Math.PI);
  return (
    <g opacity={1 - 0.65 * dim} transform={`translate(${x} 305) scale(${bump}) translate(${-x} -305)`}>
      <rect x={x - 105} y={190} width={210} height={230} rx={34} fill="none" stroke={C.mid} strokeWidth={5} strokeDasharray="14 12" opacity={slot * (1 - p)} />
      {p > 0 && (
        <g opacity={Math.min(1, p * 2)}>
          <Panel x={x - 105} y={190} w={210} h={230} />
          {hot > 0 && <rect x={x - 105} y={190} width={210} height={230} rx={34} fill="none" stroke={C.crimson} strokeWidth={9} opacity={hot} />}
          <g transform={`translate(${x} 305) scale(${0.7 + 0.3 * p}) translate(${-x} -305)`}>
            {kind === 'thaw' && (
              <g>
                <ellipse cx={x} cy={385} rx={64} ry={10} fill={C.soft} stroke={C.ink} strokeWidth={4} />
                <Cube x={x} y={285} s={0.92} />
                {[-26, 2, 28].map((dx, i) => {
                  const u = (t * 0.9 + i * 0.33) % 1;
                  return (
                    <path key={i} transform={`translate(${x + dx} ${330 + u * 44}) scale(0.8)`} d="M 0 -13 C 9 0, 10 9, 0 11 C -10 9, -9 0, 0 -13 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={4.5} opacity={1 - Math.max(0, u - 0.7) * 3.3} />
                  );
                })}
              </g>
            )}
            {kind === 'move' && (
              <g fill="none" stroke={C.ink} strokeLinecap="round" strokeLinejoin="round">
                <path d={`M ${x - 74} 262 q 18 -22 37 0 t 37 0 t 37 0 t 37 0`} strokeWidth={7} opacity={0.4} />
                <path d={`M ${x - 74} 308 q 18 -22 37 0 t 37 0 t 37 0 t 37 0`} strokeWidth={9} />
                <path d={`M ${x - 74} 354 q 18 -22 37 0 t 37 0 t 37 0 t 37 0`} strokeWidth={7} opacity={0.4} />
                <path d={`M ${x + 58} 286 L ${x + 82} 308 L ${x + 58} 330`} strokeWidth={9} />
              </g>
            )}
            {kind === 'freeze' && (
              <g>
                <Cube x={x} y={310} s={1.1} tool />
                <path d={`M ${x + 58} 244 l 0 -22 M ${x + 47} 233 l 22 0 M ${x - 62} 258 l 0 -14 M ${x - 69} 251 l 14 0`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
              </g>
            )}
          </g>
        </g>
      )}
    </g>
  );
};

const LABELS = {thaw: 'UNFREEZE', move: 'MOVE', freeze: 'REFREEZE'} as const;

const Pill: React.FC<{x: number; y: number; text: string; opacity?: number}> = ({x, y, text, opacity = 1}) => {
  const w = text.length * 15 + 46;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y - 24} width={w} height={48} rx={24} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <text x={x} y={y + 8} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={22} letterSpacing={2} fill={C.ink}>
        {text}
      </text>
    </g>
  );
};

const CrimsonHeart: React.FC<{x: number; y: number; s: number; opacity?: number}> = ({x, y, s, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M 0 30 C -52 -6 -34 -46 -4 -26 L 0 -20 L 4 -26 C 34 -46 52 -6 0 30 Z" fill={C.crimson} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

const Clipboard: React.FC<{x: number; y: number; checks: number[]}> = ({x, y, checks}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-30} y={-40} width={60} height={80} rx={9} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <rect x={-13} y={-48} width={26} height={14} rx={5} fill={C.ink} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <line x1={-4} y1={-12 + i * 21} x2={20} y2={-12 + i * 21} stroke={C.soft} strokeWidth={6} strokeLinecap="round" />
        <path d={`M -22 ${-12 + i * 21} l 5 6 l 10 -12`} fill="none" stroke={C.crimson} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={26} strokeDashoffset={26 * (1 - (checks[i] ?? 0))} />
      </g>
    ))}
  </g>
);

const Bracket: React.FC<{cx: number; cy: number; rx: number; ry: number; p: number}> = ({cx, cy, rx, ry, p}) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={C.ink} strokeWidth={5} strokeDasharray="14 12" opacity={p} />
);

// ------------------------------------------------------------------ the stage

export const ThawStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  const sway = (i: number, k = 8) => Math.sin(t * k + i * 1.7);

  // ================= 1: frozen team and the unused tool (0 to 13) =================
  const s1 = between(t, -1, q.lewin - 0.1, 0.25);
  const toolDrop = prog(t, q.launched, 0.55, bounce);
  const newTag = prog(t, q.newTool, 0.3, bounce);
  const trainP = prog(t, q.ran, 0.4, bounce);
  const trainCheck = prog(t, q.trained, 0.35, lin);
  const usageIn = prog(t, q.hardly, 0.4);
  const usageFill = t >= q.using ? 1 : 0;
  const ringIn = prog(t, q.people, 0.4) * (1 - prog(t, q.check - 0.1, 0.3));
  const askMark = prog(t, q.problem, 0.35, bounce) * (1 - prog(t, q.check - 0.1, 0.3));
  const lensX = interpolate(prog(t, q.check, 0.9, lin), [0, 1], [235, 560]);
  const lensOn = between(t, q.check - 0.05, q.help - 0.2, 0.2);
  const ghostIn = prog(t, q.help, 0.4) * (1 - prog(t, q.lewin - 0.5, 0.3));
  const strain = prog(t, q.letgo, 0.25) * (1 - prog(t, q.lewin - 0.4, 0.3));
  const s1pose = (i: number): Pose =>
    strain > 0.5
      ? pose({lh: [-0.13, -0.16 + 0.07 * sway(i)], rh: [0.13, -0.16 - 0.07 * sway(i)], lean: 0.012 * sway(i, 6), mood: 'sad'})
      : pose({lh: [-0.15, 0.22], rh: [0.15, 0.22], mood: 'flat'});

  // ================= 2: Lewin's three steps (13 to 23) =================
  const s2 = between(t, q.lewin - 0.05, q.build - 0.1, 0.3);
  const slotIn = prog(t, q.three, 0.4);
  const stepAt = [q.unfreeze, q.move, q.refreeze];
  const stepP = stepAt.map((a) => prog(t, a, 0.5, bounce));
  const skipArc = prog(t, q.start, 0.9, lin);
  const dimFirst = prog(t, q.start + 0.5, 0.4);
  const hotMid = prog(t, q.middle, 0.35, bounce);

  // ================= 3-5: build, announce, expect; then the reasons; then the asking (23 to 42.6) =================
  const s3 = between(t, q.build - 0.15, q.when - 0.05, 0.3);
  const shift = prog(t, q.moveAgain + 0.6, 0.7);
  const bx3 = interpolate(shift, [0, 1], [425, 500]);
  const toolBuild = prog(t, q.build, 0.7, bounce);
  const toolExit = prog(t, q.moveAgain + 0.5, 0.5);
  const megaP = prog(t, q.announce, 0.4, bounce) * (1 - prog(t, q.moveAgain + 0.5, 0.3));
  const expectP = prog(t, q.expect, 0.9, lin) * (1 - prog(t, q.moveAgain + 0.5, 0.3));
  const reach = prog(t, q.expect, 0.35) * (1 - prog(t, q.moveAgain + 0.9, 0.3));
  const heartP = prog(t, q.attached, 0.45, bounce) * (1 - prog(t, q.unfreezing, 0.35));
  const badgeAt = [q.day, q.goodAt, q.colleagues];
  const badgeP = badgeAt.map((a) => prog(t, a, 0.45, bounce));
  const badgeX = [330, 500, 670];
  const kinds: Kind[] = ['day', 'skill', 'team'];
  const tagsAt = ['MY DAY', 'MY SKILL', 'MY TEAM'];
  const givesPulse = [q.gives, q.gives + 0.5, q.gives + 1.0].map((a) => prog(t, a, 0.5, lin));
  const ghostBadge = prog(t, q.lose, 0.5);
  const melt = prog(t, q.unfreezing, 1.4) * 0.8;
  const helperIn = prog(t, q.unfreezing, 0.9);
  const askBubble = prog(t, q.asking, 0.4, bounce);
  const checks = [q.gives, q.gives + 0.5, q.gives + 1.0].map((a) => prog(t, a + 0.15, 0.35, lin));
  const oldPulse = Math.min(1, Math.max(0, (t - q.oldway2) / 0.6));
  const s3pose = (i: number): Pose => {
    if (t < q.moveAgain + 0.9 && reach > 0.5) return pose({lh: [-0.2, 0.2], rh: [0.26, -0.08 + 0.03 * sway(i, 7)], lean: 0.035, mood: 'flat'});
    if (t < q.attached) return pose({lh: [-0.15, 0.22], rh: [0.15, 0.22], mood: 'flat'});
    if (t < q.unfreezing) return pose({mood: 'smile', lean: 0});
    return pose({mood: 'smile'});
  };
  const helperPose = pose({rh: [0.2, -0.1], lh: [-0.15, 0.24], mood: 'smile'});
  const helperX = interpolate(helperIn, [0, 1], [30, 175]);
  const hj = joints(helperX, G, H, helperPose);

  // ================= 6: skipped (42.6 to 47.8) =================
  const s6 = between(t, q.when - 0.05, q.put - 0.1, 0.3);
  const pillsIn = prog(t, q.when, 0.4);
  const strike = prog(t, q.skipped, 0.3, lin);
  const toolIdle = prog(t, q.sits, 0.5);
  const habit = prog(t, q.habit, 0.4);
  const s6pose = (i: number): Pose =>
    t > q.habit
      ? pose({lh: [-0.1, 0.12 + 0.1 * sway(i, 9)], rh: [0.1, 0.12 - 0.1 * sway(i, 9)], mood: 'flat'})
      : pose({lh: [-0.15, 0.22], rh: [0.15, 0.22], mood: 'flat'});

  // ================= 7: put the thaw on the plan (47.8 to 50.6) =================
  const s7 = between(t, q.put - 0.1, q.ask - 0.05, 0.3);
  const rowIn = [q.put, q.put + 0.3, q.put + 0.6].map((a) => prog(t, a, 0.4, bounce));
  const thawIn = prog(t, q.thaw, 0.5, bounce);
  const thawCheck = prog(t, q.thaw + 0.5, 0.4, lin);
  const planTag = prog(t, q.plan, 0.35, bounce);

  // ================= 8-9: ask the people, then the comparison (50.6 to 61.1) =================
  const s89 = between(t, q.ask - 0.05, q.cta - 0.1, 0.3);
  const zoom = prog(t, q.what - 0.3, 0.6);
  const sc = 1 - 0.333 * zoom;
  const bx8 = 500;
  const team8Y = G + 10 * zoom;
  const team8H = H * sc;
  const spread = 1 - 0.36 * zoom;
  const puddle = prog(t, q.ask, 0.6);
  const free = (i: number): Pose =>
    t < q.work + 0.9 && t > q.who
      ? pose({lh: [-0.1, 0.1 + 0.1 * sway(i, 8)], rh: [0.1, 0.1 - 0.1 * sway(i, 8)], mood: 'smile'})
      : pose({mood: 'smile', rh: i === 1 ? [0.2, -0.05] : [0.17, 0.27]});
  const helper8X = interpolate(zoom, [0, 1], [175, 240]);
  const helper8Pose = pose({rh: [0.2, -0.1], lh: [-0.15, 0.24], mood: 'smile'});
  const hj8 = joints(helper8X, team8Y, team8H, helper8Pose);
  const qBubble = prog(t, q.what, 0.4, bounce);
  const panelL = prog(t, q.current, 0.45, bounce);
  const panelR = prog(t, q.that, 0.45, bounce);
  const oldBadgeAt = [q.doyou, q.doyou + 0.28, q.doyou + 0.56];
  const oldP = oldBadgeAt.map((a) => prog(t, a, 0.4, bounce));
  const newP = [prog(t, q.newtool2 + 0.3, 0.4, bounce), prog(t, q.newtool2 + 0.6, 0.4, bounce)];
  const checkNew = [prog(t, q.newtool2 + 0.6, 0.3, lin), prog(t, q.newtool2 + 0.9, 0.3, lin)];
  const slotP = prog(t, q.doesnt, 0.4, bounce);
  const slotBeat = 1 + 0.07 * Math.sin(Math.max(0, t - q.doesnt) * 5);

  const miniPlan = prog(t, q.ask, 0.5) * (1 - prog(t, q.current - 0.2, 0.3));

  // ================= 10: follow =================
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  return (
    <g>
      {/* 1: frozen team, unused tool */}
      {s1 > 0 && (
        <g opacity={s1}>
          {TEAM.map((m, i) => (
            <Stick key={i} x={425 + m.dx} y={G} h={H} hair={m.hair} pose={s1pose(i)} />
          ))}
          <Slab x={425} t={t} shake={strain > 0.5 ? Math.sin(t * 40) * 2.2 : 0} pulse={(t - q.oldway) / 0.6} />
          {ringIn > 0 && <Bracket cx={425} cy={420} rx={218} ry={76} p={ringIn} />}
          {askMark > 0 && (
            <text x={425} y={332} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={92} fill={C.ink} opacity={askMark} transform={`scale(${0.6 + 0.4 * askMark})`} style={{transformOrigin: '425px 300px'}}>
              ?
            </text>
          )}
          {lensOn > 0 && <Magnifier x={lensX} y={540} opacity={lensOn} />}
          {toolDrop > 0 && (
            <g transform={`translate(0 ${(1 - toolDrop) * -140})`}>
              <Tool x={745} t={t} glow={Math.min(1, toolDrop)} opacity={Math.min(1, toolDrop * 2)} />
            </g>
          )}
          {newTag > 0 && <Tag x={745} y={296} text="NEW TOOL" size={24} opacity={newTag} />}
          {trainP > 0 && <Slide x={420} y={150} p={trainP} check={trainCheck} />}
          {usageIn > 0 && <Usage x={745} y={196} p={usageIn} filled={usageFill} />}
          {ghostIn > 0 && (
            <g opacity={ghostIn}>
              <Stick x={150} y={G} h={H} hair="bun" opacity={0.28} pose={pose({mood: 'flat'})} />
              <circle cx={172} cy={368} r={7} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
              <circle cx={186} cy={344} r={11} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.6} />
              <Bubble x={226} y={300} w={96} h={72}>
                <text x={226} y={325} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={56} fill={C.ink}>
                  ?
                </text>
              </Bubble>
            </g>
          )}
        </g>
      )}

      {/* 2: Lewin's three steps */}
      {s2 > 0 && (
        <g opacity={s2} transform="translate(0 55)">
          <Tag x={500} y={96} text="KURT LEWIN" size={24} opacity={prog(t, q.lewin, 0.3, bounce) * (1 - prog(t, q.start, 0.3))} />
          {(['thaw', 'move', 'freeze'] as const).map((k, i) => (
            <g key={k}>
              <StepCard x={[230, 500, 770][i]} kind={k} slot={slotIn} p={stepP[i]} t={t} dim={i === 0 ? dimFirst : 0} hot={i === 1 ? hotMid : 0} />
              <Tag
                x={[230, 500, 770][i]}
                y={478}
                text={LABELS[k]}
                size={26}
                fill={i === 1 && hotMid > 0.5 ? C.crimson : C.ink}
                opacity={Math.min(1, stepP[i] * 2) * (i === 0 ? 1 - 0.55 * dimFirst : 1)}
              />
            </g>
          ))}
          {skipArc > 0 && (
            <g>
              <circle cx={160} cy={160} r={13} fill={C.ink} opacity={Math.min(1, skipArc * 4)} />
              <path d="M 160 160 Q 330 40 478 158" fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - skipArc)} />
              <path d="M 450 128 L 482 160 L 440 170" fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={prog(t, q.start + 0.8, 0.15, lin)} />
            </g>
          )}
        </g>
      )}

      {/* 3-5: the set moves to the middle for the reasons and the asking */}
      {s3 > 0 && (
        <g opacity={s3}>
          {TEAM.map((m, i) => (
            <Stick key={i} x={bx3 + m.dx} y={G} h={H} hair={m.hair} pose={s3pose(i)} />
          ))}
          <Slab x={bx3} t={t} melt={melt} drips={prog(t, q.unfreezing + 0.4, 0.6)} pulse={(t - q.oldway2) / 0.6 * oldPulse} />
          {/* build, announce, expect */}
          {toolExit < 1 && (
            <g transform={`translate(${toolExit * 200} 0)`} opacity={1 - toolExit}>
              <Tool x={745} t={t} build={toolBuild} glow={0.9 * toolBuild} />
              <Tag x={745} y={296} text="NEW TOOL" size={24} opacity={toolBuild} />
            </g>
          )}
          {megaP > 0 && <Megaphone x={560} y={236} p={megaP} t={t} />}
          {expectP > 0 && (
            <g opacity={Math.min(1, expectP * 3)}>
              <line x1={330} y1={340} x2={330 + 290 * expectP} y2={340} stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeDasharray="22 16" />
              <path d="M 596 316 L 628 340 L 596 364" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={prog(t, q.expect + 0.7, 0.2, lin)} />
            </g>
          )}
          {/* reasons */}
          {heartP > 0 && <CrimsonHeart x={500} y={118} s={1.2 * heartP + 0.1 * Math.sin(Math.max(0, t - q.attached) * 5) * heartP} opacity={Math.min(1, heartP * 2)} />}
          {badgeP.map((p, i) =>
            p > 0 ? (
              <g key={i}>
                <line x1={500} y1={168} x2={badgeX[i]} y2={176} stroke={C.ink} strokeWidth={4} strokeDasharray="6 8" strokeLinecap="round" opacity={Math.min(1, p) * (1 - heartP < 0.5 ? 1 : 0.5) * heartP} />
                <Badge x={badgeX[i]} y={232} kind={kinds[i]} p={p} ghost={ghostBadge} pulse={givesPulse[i]} s={1.15} />
                <Tag x={badgeX[i]} y={312} text={tagsAt[i]} size={20} opacity={Math.min(1, p * 2) * (1 - 0.5 * ghostBadge)} />
              </g>
            ) : null,
          )}
          {/* the helper asks */}
          {helperIn > 0 && (
            <g>
              <Stick x={helperX} y={G} h={H} hair="bun" pose={helperPose} />
              <Clipboard x={hj.handR[0] + 22} y={hj.handR[1] - 14} checks={checks} />
              {askBubble > 0 && (
                <g opacity={askBubble}>
                  <circle cx={helperX + 4} cy={366} r={7} fill="none" stroke={C.ink} strokeWidth={4} />
                  <circle cx={helperX + 12} cy={340} r={11} fill="none" stroke={C.ink} strokeWidth={4} />
                  <Bubble x={helperX + 20} y={296} w={96} h={72}>
                    <text x={helperX + 20} y={321} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={56} fill={C.ink}>
                      ?
                    </text>
                  </Bubble>
                </g>
              )}
            </g>
          )}
        </g>
      )}

      {/* 6: skipped: the tool sits, the habit goes on */}
      {s6 > 0 && (
        <g opacity={s6}>
          {[270, 500, 730].map((px, i) => (
            <g key={px}>
              <Pill x={px} y={175} text={['UNFREEZE', 'MOVE', 'REFREEZE'][i]} opacity={pillsIn * (i === 0 ? 1 - 0.5 * strike : 1)} />
            </g>
          ))}
          {strike > 0 && <line x1={270 - 92 + 18} y1={197} x2={270 + 92 - 18} y2={153} stroke={C.crimson} strokeWidth={9} strokeLinecap="round" opacity={strike} />}
          {TEAM.map((m, i) => (
            <Stick key={i} x={425 + m.dx} y={G} h={H} hair={m.hair} pose={s6pose(i)} />
          ))}
          <Slab x={425} t={t} />
          <Tool x={745} t={t} idle={toolIdle} />
          <Zs x={790} y={320} t={t} opacity={toolIdle} />
          {habit > 0 && (
            <g opacity={habit} transform={`translate(425 318) rotate(${(t - q.habit) * 140})`}>
              <path d="M 0 -46 A 46 46 0 1 1 -40 23" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
              <path d="M 16 0 L -9 -12 L -9 12 Z" transform="translate(-40 23) rotate(-120)" fill={C.ink} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
            </g>
          )}
        </g>
      )}

      {/* 7: put the thaw on the plan */}
      {s7 > 0 && (
        <g opacity={s7}>
          <PlanBoard panel={prog(t, q.put - 0.1, 0.4)} rowIn={rowIn} thawIn={thawIn} thawCheck={thawCheck} planTag={planTag} />
        </g>
      )}

      {/* the plan stays up, small, while the team is asked */}
      {miniPlan > 0 && (
        <g opacity={miniPlan} transform="translate(500 188) scale(0.55) translate(-500 -343)">
          <PlanBoard panel={1} rowIn={[1, 1, 1]} thawIn={1} thawCheck={1} planTag={1} />
        </g>
      )}

      {/* 8-9: ask the people, then the comparison */}
      {s89 > 0 && (
        <g opacity={s89}>
          <ellipse cx={500} cy={G + 20 + 10 * zoom} rx={250 - 70 * zoom} ry={16} fill={C.soft} stroke={C.ink} strokeWidth={4} opacity={puddle} />
          {TEAM.map((m, i) => (
            <Stick key={i} x={bx8 + m.dx * spread} y={team8Y} h={team8H} hair={m.hair} pose={free(i)} opacity={prog(t, q.ask + 0.05 * i, 0.3)} />
          ))}
          <Stick x={helper8X} y={team8Y} h={team8H} hair="bun" pose={helper8Pose} opacity={prog(t, q.ask, 0.3)} />
          <Clipboard x={hj8.handR[0] + 22 * sc} y={hj8.handR[1] - 14 * sc} checks={[1, 1, 0]} />
          {qBubble > 0 && (
            <g opacity={qBubble}>
              <circle cx={helper8X + 38 * sc} cy={team8Y - H * sc * 0.97} r={6} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={helper8X + 106 * sc} y={team8Y - H * sc * 1.2} w={80} h={60}>
                <text x={helper8X + 106 * sc} y={team8Y - H * sc * 1.2 + 20} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={48} fill={C.ink}>
                  ?
                </text>
              </Bubble>
            </g>
          )}
          {panelL > 0 && (
            <g opacity={Math.min(1, panelL * 2)} transform={`translate(305 240) scale(${0.85 + 0.15 * panelL}) translate(-305 -240)`}>
              <Panel x={140} y={96} w={330} h={285} />
              <Tag x={305} y={150} text="OLD WAY" size={24} />
              {[205, 305, 405].map((bxx, i) => (
                <Badge key={i} x={bxx - 0} y={266} kind={kinds[i]} p={oldP[i]} s={0.9} />
              ))}
            </g>
          )}
          {panelR > 0 && (
            <g opacity={Math.min(1, panelR * 2)} transform={`translate(695 240) scale(${0.85 + 0.15 * panelR}) translate(-695 -240)`}>
              <Panel x={530} y={96} w={330} h={285} />
              <Tag x={695} y={150} text="NEW TOOL" size={24} />
              {[595, 695].map((bxx, i) => (
                <g key={i}>
                  <Badge x={bxx} y={266} kind={kinds[i]} p={newP[i]} s={0.9} />
                  <path d={`M ${bxx + 14} ${318} l 10 12 l 20 -26`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - checkNew[i])} />
                </g>
              ))}
              {slotP > 0 && (
                <g transform={`translate(795 266) scale(${slotP * slotBeat})`} opacity={Math.min(1, slotP * 2)}>
                  <circle r={46} fill="#FFFFFF" stroke={C.crimson} strokeWidth={7} strokeDasharray="12 9" />
                  <text y={20} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={60} fill={C.crimson}>
                    ?
                  </text>
                </g>
              )}
            </g>
          )}
        </g>
      )}

      {/* 10: follow */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={240} s={1.5 * ctaOn} />
          <Bell x={500} y={410} s={1.5 * ctaOn} ring={prog(t, q.cta + 0.4, 1.4, lin)} />
          <Tag x={500} y={560} text="MORE WAYS TO THAW" size={34} />
        </g>
      )}
    </g>
  );
};

const PlanRow: React.FC<{y: number; label?: string; check?: number; accent?: boolean}> = ({y, label, check = 0, accent}) => (
  <g transform={`translate(500 ${y})`}>
    <rect x={-200} y={-34} width={400} height={68} rx={16} fill="#FFFFFF" stroke={accent ? C.crimson : C.ink} strokeWidth={accent ? 7 : 5} />
    <rect x={-176} y={-13} width={26} height={26} rx={6} fill="none" stroke={accent ? C.crimson : C.ink} strokeWidth={4} />
    {check > 0 && <path d="M -171 0 L -165 7 L -154 -9" fill="none" stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - check)} />}
    {label ? (
      <text x={-126} y={11} fontFamily={SANS} fontWeight={700} fontSize={32} letterSpacing={3} fill={C.ink}>
        {label}
      </text>
    ) : (
      <>
        <line x1={-126} y1={-8} x2={168} y2={-8} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
        <line x1={-126} y1={12} x2={80} y2={12} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
      </>
    )}
  </g>
);

const PlanBoard: React.FC<{panel: number; rowIn: number[]; thawIn: number; thawCheck: number; planTag: number}> = ({panel, rowIn, thawIn, thawCheck, planTag}) => (
  <g>
    <Panel x={250} y={118} w={500} h={450} opacity={panel} />
    {planTag > 0 && <Tag x={500} y={182} text="PLAN" size={30} opacity={planTag} />}
    {[340, 425, 510].map((y, i) => (
      <g key={y} opacity={rowIn[i]} transform={`translate(0 ${(1 - rowIn[i]) * 24})`}>
        <PlanRow y={y} />
      </g>
    ))}
    {thawIn > 0 && (
      <g opacity={Math.min(1, thawIn * 2)} transform={`translate(0 ${(1 - thawIn) * -60})`}>
        <PlanRow y={255} label="THAW" check={thawCheck} accent />
      </g>
    )}
  </g>
);
