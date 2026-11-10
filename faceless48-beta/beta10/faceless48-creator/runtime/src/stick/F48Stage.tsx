import React from 'react';
import {interpolate} from 'remotion';
import {Stick, STAND, mix, type Pose} from './figure';
import {Panel, SANS, Tag, Window, C, between, bounce, prog} from './kit';
import type {Cues} from './PileStage';
import customerBrand from '../brandConfig';

/**
 * Stage art for the Faceless48 Creator demo explainer. Drawn in the 1000 x 700 stage box, timed to the
 * voiceover cues in content/f48-explainer.stick.json. One accent color per scene (the brand's main color).
 */
const G = 630;
const A = C.crimson; // the member's main brand color
const METAL = customerBrand.metal;
const HOLO = 'url(#f48holo)';
const Holo: React.FC<{t: number}> = ({t}) => (
  <defs>
    <linearGradient id="f48holo" gradientUnits="userSpaceOnUse" x1={-200 + ((t * 120) % 1400)} y1="0" x2={600 + ((t * 120) % 1400)} y2="700" spreadMethod="reflect">
      <stop offset="0" stopColor="#25F4EE" />
      <stop offset="0.35" stopColor="#7F77DD" />
      <stop offset="0.7" stopColor="#E1306C" />
      <stop offset="1" stopColor="#25F4EE" />
    </linearGradient>
  </defs>
);

const pose = (p: Partial<Pose>): Pose => ({...STAND, ...p});
const ARMS_UP = pose({lh: [-0.08, -0.28], rh: [0.08, -0.28], mood: 'open', lf: -0.1, rf: 0.1});
const TYPING = pose({lh: [0.16, 0.1], rh: [0.22, 0.1], mood: 'flat', lean: 0.02});
const SLUMP = pose({lh: [-0.1, 0.3], rh: [0.1, 0.3], crouch: 0.18, lean: 0.04, mood: 'sad'});
const POINT_R = pose({rh: [0.3, -0.05], mood: 'smile'});
const CHIN = pose({rh: [0.02, -0.05], mood: 'flat', look: 0.4});
const WAVE = (t: number) => pose({rh: [0.16 + Math.sin(t * 9) * 0.05, -0.3], mood: 'open'});
const HOLD_PHONE = pose({rh: [0.12, 0.02], mood: 'smile', look: 0.5});

/** A light bulb that pops in with a bounce. */
const Bulb: React.FC<{x: number; y: number; p: number; s?: number}> = ({x, y, p, s = 1}) => {
  if (p <= 0) return null;
  const k = interpolate(p, [0, 1], [0.2, 1]) * s;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, p * 3)}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (-150 + i * 30) * (Math.PI / 180);
        return <line key={i} x1={Math.cos(a) * 46} y1={Math.sin(a) * 46} x2={Math.cos(a) * 62} y2={Math.sin(a) * 62} stroke={A} strokeWidth={6} strokeLinecap="round" />;
      })}
      <circle r={32} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
      <path d="M -12 10 L -12 -4 L -5 6 L 0 -6 L 5 6 L 12 -4 L 12 10" fill="none" stroke={A} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={-14} y={30} width={28} height={18} rx={5} fill={C.ink} />
    </g>
  );
};

const Laptop: React.FC<{x: number; y: number; s?: number; dim?: number; children?: React.ReactNode}> = ({x, y, s = 1, dim = 0, children}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-190} width={300} height={190} rx={14} fill="#FFFFFF" stroke={dim ? C.mid : C.ink} strokeWidth={6} />
    <g>{children}</g>
    <path d="M -190 0 L 190 0 L 170 22 L -170 22 Z" fill="#FFFFFF" stroke={dim ? C.mid : C.ink} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** Cobweb in a corner, drawn in over `p`. */
const Web: React.FC<{x: number; y: number; p: number; flip?: boolean}> = ({x, y, p, flip}) => {
  if (p <= 0) return null;
  const d = 110 * p;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} stroke={C.mid} strokeWidth={3} fill="none" opacity={p}>
      {[0, 30, 60, 90].map((a) => (
        <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * d} y2={Math.sin((a * Math.PI) / 180) * d} />
      ))}
      {[0.35, 0.65, 0.95].map((r) => (
        <path key={r} d={`M ${d * r} 0 Q ${d * r * 0.8} ${d * r * 0.35} ${d * r * 0.87} ${d * r * 0.5} Q ${d * r * 0.55} ${d * r * 0.7} ${d * r * 0.5} ${d * r * 0.87} Q ${d * r * 0.3} ${d * r * 0.85} 0 ${d * r}`} />
      ))}
    </g>
  );
};

/** A keyframe diamond. */
const Diamond: React.FC<{x: number; y: number; s?: number; fill?: string; rot?: number; opacity?: number}> = ({x, y, s = 1, fill = '#FFFFFF', rot = 0, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${45 + rot}) scale(${s})`} opacity={opacity}>
    <rect x={-13} y={-13} width={26} height={26} rx={4} fill={fill} stroke={C.ink} strokeWidth={5} />
  </g>
);

/** A small video card with a play button that assembles from four tiles. */
const VideoCard: React.FC<{x: number; y: number; p: number; w?: number; h?: number; t: number}> = ({x, y, p, w = 230, h = 380, t}) => {
  const tiles = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  const done = prog(p, 0.75, 0.25, (v) => v);
  return (
    <g transform={`translate(${x} ${y})`}>
      {tiles.map(([sx, sy], i) => {
        const k = prog(p, i * 0.12, 0.45, bounce);
        const ox = sx * (1 - k) * 260;
        const oy = sy * (1 - k) * 200;
        return (
          <rect key={i} x={(sx < 0 ? -w / 2 : 0) + ox} y={(sy < 0 ? -h / 2 : 0) + oy} width={w / 2} height={h / 2} fill={i % 3 === 0 ? '#FFFFFF' : C.soft} stroke={C.ink} strokeWidth={4} opacity={Math.min(1, k * 3)} />
        );
      })}
      <g opacity={done}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
        <circle r={46} fill={HOLO} />
        <path d="M -14 -22 L 24 0 L -14 22 Z" fill="#FFFFFF" />
        <rect x={-w / 2 + 26} y={h / 2 - 54} width={w - 52} height={10} rx={5} fill={C.soft} />
        <rect x={-w / 2 + 26} y={h / 2 - 54} width={(w - 52) * ((t * 0.25) % 1)} height={10} rx={5} fill={A} />
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2 + t * 1.5;
          return <path key={i} d="M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z" transform={`translate(${Math.cos(a) * (w * 0.62)} ${Math.sin(a) * (h * 0.48)}) scale(${0.8 + 0.3 * Math.sin(t * 6 + i)})`} fill={METAL} />;
        })}
      </g>
    </g>
  );
};

/* ---------- scene 3: the conveyor ---------- */
const STATIONS = [
  {label: 'DROP IN', cue: 'drop'},
  {label: 'TRANSCRIBE', cue: 'transcribe'},
  {label: 'PLAN', cue: 'plans'},
  {label: 'PREVIEW', cue: 'previews'},
  {label: 'EXPORT', cue: 'exports'},
] as const;
const SX = (i: number) => 120 + i * 190;

const StationIcon: React.FC<{i: number; x: number; y: number; on: number; t: number}> = ({i, x, y, on, t}) => {
  const stroke = on > 0.5 ? A : C.ink;
  if (i === 0)
    return (
      <g transform={`translate(${x} ${y})`} stroke={stroke} strokeWidth={6} fill="#FFFFFF" strokeLinecap="round">
        <rect x={-22} y={-50} width={44} height={70} rx={22} />
        <path d="M -38 0 Q -38 42 0 42 Q 38 42 38 0" fill="none" />
        <line x1={0} y1={42} x2={0} y2={62} />
      </g>
    );
  if (i === 1)
    return (
      <g transform={`translate(${x} ${y})`}>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => {
          const hgt = 16 + Math.abs(Math.sin(t * 7 + k)) * 44 * (1 - on * 0.85);
          return <rect key={k} x={-56 + k * 16} y={-hgt / 2 - 12} width={9} height={hgt} rx={4} fill={stroke} />;
        })}
        {[0, 1, 2].map((k) => (
          <rect key={`l${k}`} x={-56} y={18 + k * 16} width={(k === 2 ? 70 : 112) * on} height={8} rx={4} fill={C.ink} />
        ))}
      </g>
    );
  if (i === 2)
    return (
      <g transform={`translate(${x} ${y})`}>
        {[0, 1, 2].map((k) => (
          <rect key={k} x={-64 + k * 44} y={-34 + (k === 1 ? -8 : 0)} width={40} height={60} rx={6} fill={k === 1 && on > 0.5 ? A : '#FFFFFF'} stroke={C.ink} strokeWidth={5} opacity={prog(on, k * 0.25, 0.3)} />
        ))}
      </g>
    );
  if (i === 3)
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-62} y={-48} width={124} height={86} rx={12} fill="#FFFFFF" stroke={stroke} strokeWidth={6} />
        <path d="M -12 -18 L 16 -4 L -12 10 Z" fill={stroke} />
        <circle cx={46} cy={36} r={20 * on} fill={A} />
        <path d="M 37 36 L 44 43 L 56 29" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={on} />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y})`} stroke={stroke} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x={-40} y={-20} width={80} height={62} rx={10} fill="#FFFFFF" />
      <path d="M 0 -60 L 0 6 M -22 -18 L 0 6 L 22 -18" transform={`translate(0 ${-on * 6})`} />
    </g>
  );
};

const Conveyor: React.FC<{t: number; q: Cues; o: number}> = ({t, q, o}) => {
  const times = STATIONS.map((s) => q[s.cue]);
  // the file token rides the belt and stops under each station on its word
  let tx = SX(0) - 120;
  for (let i = 0; i < times.length; i++) {
    const arrive = prog(t, times[i] - 0.45, 0.45);
    if (t >= times[i] - 0.45) tx = interpolate(arrive, [0, 1], [i === 0 ? SX(0) - 120 : SX(i - 1), SX(i)]);
  }
  const exitP = prog(t, times[4] + 0.9, 0.8);
  tx += exitP * 260;
  return (
    <g opacity={o}>
      <rect x={30} y={500} width={940} height={34} rx={17} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      {Array.from({length: 18}).map((_, k) => {
        const xx = 50 + ((k * 54 + t * 90) % 920);
        return <line key={k} x1={xx} y1={508} x2={xx - 16} y2={526} stroke={C.mid} strokeWidth={4} strokeLinecap="round" />;
      })}
      {STATIONS.map((s, i) => {
        const pop = prog(t, q.how + 0.25 + i * 0.18, 0.45, bounce);
        const on = prog(t, times[i], 0.4);
        const active = t >= times[i] && (i === 4 || t < times[i + 1]);
        return (
          <g key={s.label} opacity={Math.min(1, pop * 2)} transform={`translate(${SX(i)} ${360}) scale(${0.6 + 0.4 * pop}) translate(${-SX(i)} ${-360})`}>
            <Panel x={SX(i) - 82} y={250} w={164} h={200} />
            {active && <rect x={SX(i) - 82} y={250} width={164} height={200} rx={34} fill="none" stroke={HOLO} strokeWidth={8} />}
            <StationIcon i={i} x={SX(i)} y={340} on={on} t={t} />
            <Tag x={SX(i)} y={208} text={s.label} size={18} fill={active ? HOLO : C.ink} />
            <line x1={SX(i)} y1={450} x2={SX(i)} y2={500} stroke={C.ink} strokeWidth={5} strokeDasharray="8 8" />
          </g>
        );
      })}
      <g transform={`translate(${tx} 468)`} opacity={prog(t, times[0] - 0.6, 0.3) * (1 - exitP)}>
        <path d="M -26 -34 L 10 -34 L 26 -18 L 26 34 L -26 34 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 10 -34 L 10 -18 L 26 -18" fill="none" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -8 -6 L 10 4 L -8 14 Z" fill={A} />
      </g>
    </g>
  );
};

/* ---------- scene 4: the three layers ---------- */
const SWATCHES = [customerBrand.accentDeep, customerBrand.accent, customerBrand.accentMid, customerBrand.metal, customerBrand.metalLight];

const Slab: React.FC<{y: number; p: number; label: string; active: boolean; children?: React.ReactNode}> = ({y, p, label, active, children}) => {
  if (p <= 0) return null;
  const drop = (1 - p) * -380;
  return (
    <g transform={`translate(0 ${drop})`} opacity={Math.min(1, p * 3)}>
      <path d={`M 380 ${y} L 860 ${y} L 920 ${y - 60} L 440 ${y - 60} Z`} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M 380 ${y} L 860 ${y} L 860 ${y + 46} L 380 ${y + 46} Z`} fill={active ? A : C.soft} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M 860 ${y} L 920 ${y - 60} L 920 ${y - 14} L 860 ${y + 46} Z`} fill={active ? A : C.mid} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <text x={398} y={y + 33} fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={3} fill={active ? '#FFFFFF' : C.ink}>
        {label}
      </text>
      {children}
    </g>
  );
};

const Layers: React.FC<{t: number; q: Cues; o: number}> = ({t, q, o}) => {
  const pb = prog(t, q.brand - 0.2, 0.6, bounce);
  const ps = prog(t, q.style - 0.2, 0.6, bounce);
  const pt = prog(t, q.story - 0.2, 0.6, bounce);
  const act = t >= q.story ? 2 : t >= q.style ? 1 : t >= q.brand ? 0 : -1;
  const hostPose = t >= q.story ? mix(CHIN, ARMS_UP, prog(t, q.story + 0.6, 0.5)) : CHIN;
  return (
    <g opacity={o}>
      <Stick x={190} y={G} h={360} pose={hostPose} hair="bob" />
      <Slab y={560} p={pb} label="YOUR BRAND" active={act === 0}>
        {SWATCHES.map((c, i) => (
          <circle key={i} cx={560 + i * 56} cy={530} r={20} fill={c} stroke={C.ink} strokeWidth={4} opacity={prog(t, q.brand + 0.4 + i * 0.12, 0.3)} />
        ))}
      </Slab>
      <Slab y={430} p={ps} label="YOUR STYLE" active={act === 1}>
        {['Editorial', 'Heavy', 'Pill'].map((s, i) => {
          const on = prog(t, q.style + 0.4 + i * 0.25, 0.35, bounce);
          return (
            <g key={s} opacity={on} transform={`translate(${560 + i * 112} 398) scale(${0.6 + 0.4 * on})`}>
              <rect x={-50} y={-20} width={100} height={40} rx={20} fill={i === 0 ? C.ink : '#FFFFFF'} stroke={C.ink} strokeWidth={4} />
              <text y={8} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={20} fill={i === 0 ? '#FFFFFF' : C.ink}>
                {s}
              </text>
            </g>
          );
        })}
      </Slab>
      <Slab y={300} p={pt} label="YOUR STORY" active={act === 2}>
        <g opacity={prog(t, q.story + 0.4, 0.3)}>
          <Stick x={640} y={292} h={96} pose={pose({rh: [0.2, -0.2], mood: 'open'})} sw={6} hair="long" />
          <path d="M 742 236 c -10 -16 -34 -10 -30 10 c 4 16 30 28 30 28 c 0 0 26 -12 30 -28 c 4 -20 -20 -26 -30 -10 Z" fill={A} transform={`translate(0 ${Math.sin(t * 4) * 4})`} />
        </g>
      </Slab>
    </g>
  );
};

/* ---------- scene 5: the four kinds of video ---------- */
const TILES = [
  {label: 'TALKING HEADS', cue: 'th'},
  {label: 'YAPS & SCENES', cue: 'yaps'},
  {label: 'EXPLAINERS', cue: 'explainers'},
  {label: 'BATCHES', cue: 'batches'},
] as const;

const TileArt: React.FC<{i: number; t: number}> = ({i, t}) => {
  if (i === 0)
    return (
      <g>
        <rect x={-70} y={-62} width={140} height={110} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
        <circle cx={0} cy={-18} r={22} fill="none" stroke={C.ink} strokeWidth={5} />
        <path d="M -36 40 Q 0 4 36 40" fill="none" stroke={C.ink} strokeWidth={5} />
        <circle cx={52} cy={-46} r={7} fill={A} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
      </g>
    );
  if (i === 1) {
    const clap = Math.max(0, Math.sin(t * 3)) * 18;
    return (
      <g>
        <rect x={-70} y={-30} width={140} height={84} rx={8} fill={C.ink} />
        <g transform={`rotate(${-clap} -70 -30)`}>
          <rect x={-70} y={-58} width={140} height={26} rx={6} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={`M ${-54 + k * 34} -58 L ${-38 + k * 34} -32`} stroke={C.ink} strokeWidth={8} />
          ))}
        </g>
        <path d="M -10 -4 L 16 12 L -10 28 Z" fill={A} />
      </g>
    );
  }
  if (i === 2)
    return (
      <g>
        <rect x={-74} y={-64} width={148} height={100} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
        <line x1={-30} y1={36} x2={-44} y2={62} stroke={C.ink} strokeWidth={5} />
        <line x1={30} y1={36} x2={44} y2={62} stroke={C.ink} strokeWidth={5} />
        <Stick x={-30} y={30} h={78} pose={pose({rh: [0.32, -0.12], mood: 'smile'})} sw={5} />
        <rect x={10} y={-40} width={50} height={10} rx={5} fill={A} />
        <rect x={10} y={-20} width={40} height={10} rx={5} fill={C.soft} />
        <rect x={10} y={0} width={46} height={10} rx={5} fill={C.soft} />
      </g>
    );
  return (
    <g>
      {[2, 1, 0].map((k) => (
        <rect key={k} x={-56 + k * 14} y={-58 + k * 14} width={100} height={80} rx={10} fill={k === 0 ? '#FFFFFF' : C.soft} stroke={C.ink} strokeWidth={5} transform={`translate(0 ${k === 0 ? Math.sin(t * 4) * 3 : 0})`} />
      ))}
      <Tag x={58} y={46} text="x3" size={18} fill={A} />
    </g>
  );
};

const Kinds: React.FC<{t: number; q: Cues; o: number}> = ({t, q, o}) => {
  const cur = [...TILES].map((x, i) => ({i, at: q[x.cue]})).filter((x) => t >= x.at).pop()?.i ?? -1;
  return (
    <g opacity={o}>
      {TILES.map((tile, i) => {
        const cx = 300 + (i % 2) * 400;
        const cy = 210 + Math.floor(i / 2) * 270;
        const p = prog(t, q[tile.cue] - 0.15, 0.55, bounce);
        if (p <= 0) return null;
        const on = cur === i;
        return (
          <g key={tile.label} transform={`translate(${cx} ${cy}) scale(${0.4 + 0.6 * p})`} opacity={Math.min(1, p * 2.5)}>
            <rect x={-170} y={-112} width={340} height={224} rx={30} fill={C.soft} transform="translate(10 12)" />
            <rect x={-170} y={-112} width={340} height={224} rx={30} fill="#FFFFFF" stroke={on ? HOLO : C.ink} strokeWidth={on ? 9 : 5} />
            <g transform="translate(0 -22)">
              <TileArt i={i} t={t} />
            </g>
            <text y={86} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={3} fill={on ? A : C.ink}>
              {tile.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/* ---------- the finish ---------- */
const Confetti: React.FC<{t: number; at: number}> = ({t, at}) => {
  const s = t - at;
  if (s < 0 || s > 3.2) return null;
  const cols = [A, METAL, C.ink, customerBrand.accentMid];
  return (
    <g>
      {Array.from({length: 34}).map((_, k) => {
        const ang = (k / 34) * Math.PI * 2 + (k % 3) * 0.2;
        const v = 260 + (k % 5) * 70;
        const x = 520 + Math.cos(ang) * v * s;
        const y = 300 + Math.sin(ang) * v * s * 0.8 + 260 * s * s;
        return <rect key={k} x={x} y={y} width={14} height={8} rx={2} fill={cols[k % 4]} transform={`rotate(${k * 37 + s * 400} ${x} ${y})`} opacity={1 - s / 3.2} />;
      })}
    </g>
  );
};

export const F48Stage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  const s1 = between(t, -1, q.diy);
  const s2 = between(t, q.diy, q.how);
  const s3 = between(t, q.how, q.layers);
  const s4 = between(t, q.layers, q.kinds);
  const s5 = between(t, q.kinds, q.made);
  const s6 = between(t, q.made, 999);

  /* scene 1: ideas pop, editing gathers dust */
  const sad = prog(t, q.never - 0.2, 0.5);
  const p1 = s1 > 0 ? mix(HOLD_PHONE, SLUMP, sad) : STAND;

  /* scene 2: do-it-yourself chaos, then one sentence */
  const relief = prog(t, q.f48, 0.6);
  const evening = prog(t, q.evening - 0.3, 1.4);
  const typed = prog(t, q.describe - 0.2, 1.4, (v) => v);
  const built = prog(t, q.describe + 1.0, 1.6, (v) => v);
  const p2 = t < q.f48 ? (t >= q.captions ? TYPING : mix(TYPING, SLUMP, evening)) : mix(SLUMP, t >= q.builds ? ARMS_UP : POINT_R, relief);
  const prompt = 'Make my video';

  return (
    <g>
      <Holo t={t} />
      {/* ---------- scene 1 ---------- */}
      {s1 > 0 && (
        <g opacity={s1}>
          <line x1={40} y1={G} x2={960} y2={G} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <Stick x={330} y={G} h={380} pose={p1} hair="bob" />
          <g transform={`translate(${392} ${G - 205}) rotate(-12)`}>
            <rect x={-18} y={-34} width={36} height={62} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
          </g>
          <Bulb x={250} y={170} p={prog(t, q.ideas, 0.55, bounce) * (1 - sad * 0.6)} />
          <Bulb x={340} y={110} p={prog(t, q.ideas + 0.3, 0.55, bounce) * (1 - sad * 0.6)} s={1.15} />
          <Bulb x={430} y={170} p={prog(t, q.ideas + 0.6, 0.55, bounce) * (1 - sad * 0.6)} />
          <g opacity={prog(t, q.ideas + 0.9, 0.5)}>
            <rect x={560} y={G - 120} width={360} height={120} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
            <Laptop x={740} y={G - 120} s={0.9} dim={sad}>
              <rect x={-120} y={-160} width={240} height={30} rx={6} fill={C.soft} />
              {[0, 1, 2].map((k) => (
                <rect key={k} x={-120} y={-110 + k * 34} width={240} height={22} rx={6} fill="none" stroke={C.mid} strokeWidth={4} />
              ))}
              <Web x={-148} y={-188} p={prog(t, q.never, 0.9)} />
              <Web x={148} y={-188} p={prog(t, q.never + 0.3, 0.9)} flip />
            </Laptop>
          </g>
          <Tag x={740} y={G - 330} text="EDITING" size={20} opacity={prog(t, q.ideas + 1.1, 0.4) * (1 - sad)} />
          <g opacity={sad}>
            <Tag x={740} y={G - 330} text="NOT STARTED" size={20} fill={A} />
          </g>
        </g>
      )}

      {/* ---------- scene 2 ---------- */}
      {s2 > 0 && (
        <g opacity={s2}>
          <line x1={40} y1={G} x2={960} y2={G} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          {/* the evening passing in the window */}
          <g opacity={1 - relief}>
            <rect x={640} y={40} width={300} height={190} rx={18} fill={interpolate(evening, [0, 1], [0, 1]) > 0.5 ? '#1F2430' : '#FFFFFF'} stroke={C.ink} strokeWidth={5} />
            <circle cx={790} cy={interpolate(evening, [0, 1], [110, 260])} r={34} fill={METAL} opacity={1 - evening} />
            <g opacity={evening}>
              <path d="M 830 90 a 34 34 0 1 0 22 58 a 26 26 0 1 1 -22 -58 Z" fill="#FFFFFF" />
              {[
                [690, 80],
                [730, 150],
                [900, 190],
                [690, 190],
              ].map(([sx, sy], k) => (
                <circle key={k} cx={sx} cy={sy} r={4 + (k % 2) * 2} fill="#FFFFFF" opacity={0.5 + 0.5 * Math.sin(t * 5 + k)} />
              ))}
            </g>
            <Tag x={790} y={270} text="EVENING GONE" size={18} opacity={prog(t, q.evening + 0.4, 0.4)} fill={A} />
          </g>
          <Stick x={260} y={G} h={370} pose={p2} hair="bob" />
          {/* the do-it-yourself timeline */}
          <g opacity={1 - relief}>
            <Window x={380} y={290} w={430} h={250} title="TIMELINE" />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={410} y={372 + k * 46} width={370 * prog(t, q.timeline + k * 0.2, 0.5)} height={30} rx={8} fill={k === 1 ? C.soft : '#FFFFFF'} stroke={C.ink} strokeWidth={4} />
            ))}
            {Array.from({length: 9}).map((_, k) => {
              const on = prog(t, q.keyframes + k * 0.1, 0.4, bounce);
              const orbit = t * 2.2 + k * 0.7;
              const fx = 260 + Math.cos(orbit) * (150 + (k % 3) * 22);
              const fy = 230 + Math.sin(orbit) * 70;
              return <Diamond key={k} x={fx} y={fy} s={0.9} fill={k % 3 === 0 ? A : '#FFFFFF'} rot={t * 90} opacity={on} />;
            })}
            <g opacity={prog(t, q.captions, 0.3)}>
              <rect x={410} y={500} width={370} height={28} rx={6} fill="#FFFFFF" stroke={A} strokeWidth={4} />
              <text x={420} y={521} fontFamily={SANS} fontWeight={700} fontSize={18} fill={C.ink}>
                {'Your caption here...'.slice(0, Math.floor(prog(t, q.captions, 2.4, (v) => v) * 20))}
              </text>
            </g>
          </g>
          {/* one sentence instead */}
          <g opacity={relief}>
            <g transform="translate(560 170)">
              <rect x={-190} y={-38} width={380} height={76} rx={38} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <text x={-160} y={11} fontFamily={SANS} fontWeight={700} fontSize={28} fill={C.ink}>
                {prompt.slice(0, Math.round(typed * prompt.length))}
              </text>
              <circle cx={150} cy={0} r={24} fill={A} />
              <path d="M 150 12 L 150 -10 M 140 0 L 150 -10 L 160 0" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {built > 0 && <VideoCard x={620} y={420} p={built} w={200} h={300} t={t} />}
          </g>
        </g>
      )}

      {/* ---------- scene 3 ---------- */}
      {s3 > 0 && <Conveyor t={t} q={q} o={s3} />}

      {/* ---------- scene 4 ---------- */}
      {s4 > 0 && <Layers t={t} q={q} o={s4} />}

      {/* ---------- scene 5 ---------- */}
      {s5 > 0 && <Kinds t={t} q={q} o={s5} />}

      {/* ---------- scene 6 ---------- */}
      {s6 > 0 && (
        <g opacity={s6}>
          <line x1={40} y1={G} x2={960} y2={G} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
          <Stick x={230} y={G} h={380} pose={t >= q.add ? POINT_R : WAVE(t)} hair="bob" />
          <VideoCard x={560} y={300} p={prog(t, q.made - 0.2, 1.1, (v) => v)} w={250} h={380} t={t} />
          <Confetti t={t} at={q.made + 0.9} />
          {(() => {
            const p = prog(t, q.add - 0.2, 0.5, bounce);
            const pulse = 1 + 0.04 * Math.sin(t * 6) * prog(t, q.add + 0.6, 0.4);
            return (
              <g opacity={Math.min(1, p * 2)} transform={`translate(810 560) scale(${(0.6 + 0.4 * p) * pulse})`}>
                <rect x={-150} y={-40} width={300} height={80} rx={40} fill={A} />
                <text y={10} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} letterSpacing={2} fill="#FFFFFF">
                  ADD TO YOUR ORDER
                </text>
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
};
