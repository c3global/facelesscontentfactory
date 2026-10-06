import React from 'react';

/**
 * The supporting cast: modern stick figures drawn in code (thick round-capped lines, a chunky torso, a big
 * round head). Limbs are solved with two-bone IK, so a scene only says where the hands and feet should be.
 * Dr. CiCi herself is never drawn here: she is Kai's artwork (see Cici.tsx).
 */
export type V = [number, number];
export type Mood = 'smile' | 'flat' | 'sad' | 'open';

export type Pose = {
  /** hand targets relative to each shoulder, in units of the figure's height (x right, y down) */
  lh: V;
  rh: V;
  /** foot x offsets from the hip line, in units of height */
  lf: number;
  rf: number;
  /** 0 = standing, 1 = deep squat */
  crouch: number;
  /** head and torso shift, in units of height */
  lean: number;
  mood: Mood;
  /** eye shift, in units of the head radius */
  look?: number;
};

export const STAND: Pose = {lh: [-0.17, 0.27], rh: [0.17, 0.27], lf: -0.07, rf: 0.07, crouch: 0, lean: 0, mood: 'smile'};

const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Two-bone IK. Picks the elbow or knee that bends away from the body's centre line (`side` is -1 left, +1 right). */
export const ik = (root: V, target: V, l1: number, l2: number, side: -1 | 1, centerX: number) => {
  const dx = target[0] - root[0];
  const dy = target[1] - root[1];
  const d = Math.hypot(dx, dy);
  const dc = Math.min((l1 + l2) * 0.999, Math.max(Math.abs(l1 - l2) * 1.001 + 0.001, d));
  const ang = Math.atan2(dy, dx);
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc))));
  const cand = ([1, -1] as const).map((s) => [root[0] + Math.cos(ang + s * a) * l1, root[1] + Math.sin(ang + s * a) * l1] as V);
  const score = (p: V) => (p[0] - centerX) * side + (p[1] - root[1]) * 0.35;
  const mid = score(cand[0]) >= score(cand[1]) ? cand[0] : cand[1];
  const end: V = [root[0] + Math.cos(ang) * dc, root[1] + Math.sin(ang) * dc];
  return {mid, end};
};

export type Joints = {
  head: V;
  hr: number;
  neck: V;
  hip: V;
  shL: V;
  shR: V;
  elbowL: V;
  elbowR: V;
  handL: V;
  handR: V;
  kneeL: V;
  kneeR: V;
  footL: V;
  footR: V;
};

export const joints = (x: number, y: number, h: number, p: Pose): Joints => {
  const hr = 0.115 * h;
  const drop = p.crouch * 0.15 * h;
  const hip: V = [x, y - 0.4 * h + drop];
  const neck: V = [x + p.lean * h, y - 0.8 * h + drop];
  const shY = neck[1] + 0.045 * h;
  const shL: V = [neck[0] - 0.05 * h, shY];
  const shR: V = [neck[0] + 0.05 * h, shY];
  const aL = ik(shL, [shL[0] + p.lh[0] * h, shL[1] + p.lh[1] * h], 0.15 * h, 0.14 * h, -1, neck[0]);
  const aR = ik(shR, [shR[0] + p.rh[0] * h, shR[1] + p.rh[1] * h], 0.15 * h, 0.14 * h, 1, neck[0]);
  const lL = ik(hip, [x + p.lf * h, y], 0.2 * h, 0.2 * h, -1, x);
  const lR = ik(hip, [x + p.rf * h, y], 0.2 * h, 0.2 * h, 1, x);
  return {
    head: [neck[0], neck[1] - hr - 0.012 * h],
    hr,
    neck,
    hip,
    shL,
    shR,
    elbowL: aL.mid,
    elbowR: aR.mid,
    handL: aL.end,
    handR: aR.end,
    kneeL: lL.mid,
    kneeR: lR.mid,
    footL: lL.end,
    footR: lR.end,
  };
};

const pl = (pts: V[]) => pts.map((p) => p.join(',')).join(' ');

export const Stick: React.FC<{
  x: number;
  y: number;
  h: number;
  pose?: Pose;
  color?: string;
  sw?: number;
  opacity?: number;
}> = ({x, y, h, pose = STAND, color = '#3A3F42', sw = 9, opacity = 1}) => {
  const j = joints(x, y, h, pose);
  const line = {fill: 'none', stroke: color, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  const eyeY = j.head[1] - j.hr * 0.05;
  const look = (pose.look ?? 0) * j.hr * 0.18;
  const my = j.head[1] + j.hr * 0.42;
  const mw = j.hr * 0.34;
  return (
    <g opacity={opacity}>
      <polyline points={pl([j.hip, j.kneeL, j.footL])} {...line} strokeWidth={sw} />
      <polyline points={pl([j.hip, j.kneeR, j.footR])} {...line} strokeWidth={sw} />
      <line x1={j.footL[0]} y1={j.footL[1]} x2={j.footL[0] - 0.06 * h} y2={j.footL[1]} {...line} strokeWidth={sw} />
      <line x1={j.footR[0]} y1={j.footR[1]} x2={j.footR[0] + 0.06 * h} y2={j.footR[1]} {...line} strokeWidth={sw} />
      <line x1={j.neck[0]} y1={j.neck[1]} x2={j.hip[0]} y2={j.hip[1]} {...line} strokeWidth={sw * 1.7} />
      <line x1={j.shL[0]} y1={j.shL[1]} x2={j.shR[0]} y2={j.shR[1]} {...line} strokeWidth={sw} />
      <polyline points={pl([j.shL, j.elbowL, j.handL])} {...line} strokeWidth={sw} />
      <polyline points={pl([j.shR, j.elbowR, j.handR])} {...line} strokeWidth={sw} />
      <circle cx={j.head[0]} cy={j.head[1]} r={j.hr} fill="#FFFFFF" stroke={color} strokeWidth={sw} />
      <circle cx={j.head[0] - j.hr * 0.38 + look} cy={eyeY} r={Math.max(3, j.hr * 0.09)} fill={color} />
      <circle cx={j.head[0] + j.hr * 0.38 + look} cy={eyeY} r={Math.max(3, j.hr * 0.09)} fill={color} />
      {pose.mood === 'smile' && <path d={`M ${j.head[0] - mw} ${my} Q ${j.head[0]} ${my + j.hr * 0.3} ${j.head[0] + mw} ${my}`} {...line} strokeWidth={sw * 0.5} />}
      {pose.mood === 'sad' && <path d={`M ${j.head[0] - mw} ${my + j.hr * 0.12} Q ${j.head[0]} ${my - j.hr * 0.18} ${j.head[0] + mw} ${my + j.hr * 0.12}`} {...line} strokeWidth={sw * 0.5} />}
      {pose.mood === 'flat' && <line x1={j.head[0] - mw * 0.8} y1={my + 3} x2={j.head[0] + mw * 0.8} y2={my + 3} {...line} strokeWidth={sw * 0.5} />}
      {pose.mood === 'open' && <ellipse cx={j.head[0]} cy={my + 2} rx={j.hr * 0.16} ry={j.hr * 0.2} fill={color} />}
    </g>
  );
};

export const mix = (a: Pose, b: Pose, t: number): Pose => {
  const m = (u: number, v: number) => u + (v - u) * t;
  const mv = (u: V, v: V): V => [m(u[0], v[0]), m(u[1], v[1])];
  return {lh: mv(a.lh, b.lh), rh: mv(a.rh, b.rh), lf: m(a.lf, b.lf), rf: m(a.rf, b.rf), crouch: m(a.crouch, b.crouch), lean: m(a.lean, b.lean), mood: t < 0.5 ? a.mood : b.mood, look: m(a.look ?? 0, b.look ?? 0)};
};

export const distance = dist;
