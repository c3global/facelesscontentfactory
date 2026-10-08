import React from 'react';
import {interpolate} from 'remotion';
import {Stick, STAND, joints, type Pose} from './figure';
import {Bubble, Panel, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon, Heart} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "The Agreement You Did Not Write Down". Two business partners each carry a private contract sheet
 * in a thought cloud. At first the sheets match (three terms, drawn as icons: cheer for each other, share news first,
 * stay at the same level). The launch rewrites one sheet; the other stays old; the mismatch opens a gap.
 * Renegotiating is one old term named and one question. `t` is seconds into the voiceover, `q` the cue times from
 * content/agreement.stick.json.
 */
const G = 655;
const H = 250;
const XL = 285;
const XR = 715;
const CLOUD_Y = 205;
const CS = 1.2; // cloud scale
const SHEET_S = 0.88;
const HEAD_TOP = 390; // top of the heads, for thought tails
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});

// ---------------------------------------------------------------- icons (box about +-30)
type Term = 'cheer' | 'news' | 'level' | 'ring' | 'diamond' | 'tri';

const Icon: React.FC<{kind: Term; s?: number; x?: number; y?: number; opacity?: number}> = ({kind, s = 1, x = 0, y = 0, opacity = 1}) => {
  const sw = Math.min(8, 4.6 / Math.max(0.3, s));
  const common = {fill: '#FFFFFF', stroke: C.ink, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  const star = Array.from({length: 10}, (_, i) => {
    const r = i % 2 === 0 ? 24 : 10.5;
    const a = (-90 + i * 36) * (Math.PI / 180);
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r + 4).toFixed(1)}`;
  }).join(' ');
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {kind === 'cheer' && (
        <>
          <polygon points={star} {...common} />
          <path d="M -26 -18 L -33 -26 M 26 -18 L 33 -26 M 0 -26 L 0 -34" fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
      {kind === 'news' && (
        <>
          <path d="M -26 -9 L 6 -9 L 26 -23 L 26 23 L 6 9 L -26 9 Z" {...common} />
          <path d="M -14 9 L -9 25 L 1 25 L -1 9" {...common} />
        </>
      )}
      {kind === 'level' && (
        <>
          <rect x={-27} y={-6} width={19} height={30} rx={6} {...common} />
          <rect x={8} y={-6} width={19} height={30} rx={6} {...common} />
          <path d="M -32 -17 L 32 -17" fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${sw * 1.4} ${sw * 1.8}`} />
        </>
      )}
      {kind === 'ring' && <circle r={19} {...common} />}
      {kind === 'diamond' && <path d="M 0 -25 L 22 0 L 0 25 L -22 0 Z" {...common} />}
      {kind === 'tri' && <path d="M 0 -23 L 25 19 L -25 19 Z" {...common} />}
    </g>
  );
};

// ---------------------------------------------------------------- the contract sheet
const OLD: Term[] = ['cheer', 'news', 'level'];
const NEW: Term[] = ['ring', 'diamond', 'tri'];
const ROW_Y = [-34, 16, 66];

/** A private contract sheet. Old terms pop in as `oldPop`; a wipe erases them; new terms pop in as `newPop`. */
const Sheet: React.FC<{
  x: number;
  y: number;
  s: number;
  opacity?: number;
  oldPop?: number[];
  wipe?: number;
  newPop?: number[];
  pencil?: number;
  lock?: number;
}> = ({x, y, s, opacity = 1, oldPop = [0, 0, 0], wipe = 0, newPop = [0, 0, 0], pencil = 0, lock = 0}) => {
  const row = (i: number, kinds: Term[], pops: number[], key: string) => (
    <g key={key}>
      <line x1={12} y1={ROW_Y[i]} x2={50} y2={ROW_Y[i]} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
      {pops[i] > 0 && <Icon kind={kinds[i]} s={0.78 * Math.max(0.01, pops[i])} x={-28} y={ROW_Y[i]} opacity={Math.min(1, pops[i] * 2)} />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <rect x={-65} y={-100} width={130} height={200} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={5.5} />
      <line x1={-42} y1={-76} x2={26} y2={-76} stroke={C.mid} strokeWidth={9} strokeLinecap="round" />
      {pencil > 0 && <line x1={-42} y1={-62} x2={-42 + 80 * pencil} y2={-62} stroke={C.crimson} strokeWidth={6} strokeLinecap="round" />}
      {[0, 1, 2].map((i) => row(i, OLD, oldPop, `o${i}`))}
      {wipe > 0 && <rect x={-60} y={-52} width={120} height={Math.min(1, wipe) * 146} fill="#FFFFFF" />}
      {wipe >= 1 && [0, 1, 2].map((i) => row(i, NEW, newPop, `n${i}`))}
      {lock > 0 && (
        <g transform={`translate(48 98) scale(${lock * 1.15})`}>
          <circle r={19} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
          <rect x={-8} y={-2} width={16} height={12} rx={3} fill={C.ink} />
          <path d="M -5 -2 L -5 -7 Q -5 -13 0 -13 Q 5 -13 5 -7 L 5 -2" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- a thought cloud over a head
const BUMPS: [number, number, number][] = [
  [-80, 18, 48],
  [-40, -30, 56],
  [25, -48, 58],
  [78, -8, 52],
  [86, 32, 40],
  [-8, 48, 52],
  [-60, 50, 40],
  [40, 40, 50],
];
const Cloud: React.FC<{x: number; y: number; p: number; opacity?: number}> = ({x, y, p, opacity = 1}) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) scale(${CS * p})`}>
    <g>
      {BUMPS.map(([bx, by, r], i) => (
        <circle key={`a${i}`} cx={bx} cy={by} r={r} fill={C.ink} stroke={C.ink} strokeWidth={12} />
      ))}
      <circle cx={6} cy={118} r={9} fill={C.ink} stroke={C.ink} strokeWidth={10} />
      <circle cx={0} cy={138} r={6} fill={C.ink} stroke={C.ink} strokeWidth={9} />
    </g>
    <g>
      {BUMPS.map(([bx, by, r], i) => (
        <circle key={`b${i}`} cx={bx} cy={by} r={r} fill="#FFFFFF" />
      ))}
      <rect x={-84} y={-40} width={176} height={100} fill="#FFFFFF" />
      <circle cx={6} cy={118} r={9} fill="#FFFFFF" />
      <circle cx={0} cy={138} r={6} fill="#FFFFFF" />
    </g>
  </g>
);

const Rocket: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} strokeLinejoin="round" strokeLinecap="round">
    <path d="M -7 24 Q 0 62 7 24 Z" fill={C.crimson} stroke={C.crimson} strokeWidth={4} />
    <path d="M -10 12 L -23 31 L -10 27 Z M 10 12 L 23 31 L 10 27 Z" fill={C.ink} stroke={C.ink} strokeWidth={3} />
    <path d="M 0 -36 C 15 -20 15 8 11 27 L -11 27 C -15 8 -15 -20 0 -36 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <circle cy={-8} r={6} fill="none" stroke={C.ink} strokeWidth={4} />
  </g>
);

const Dots3: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    {[-1, 0, 1].map((k) => (
      <circle key={k} cx={x + k * 22} cy={y} r={7} fill={C.ink} />
    ))}
  </g>
);

export const AgreementStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---------------- timing helpers ----------------
  const win = (a: number, d: number) => t >= a - 0.05 && t < a + d;
  const figsOp = 1 - prog(t, q.which - 0.3, 0.3, (v) => v);
  const gap = prog(t, q.distance, 0.9) * (1 - prog(t, q.reneg, 0.6));
  const xl = XL - 26 * gap;
  const xr = XR + 26 * gap;

  // ---------------- poses ----------------
  const youMood: Pose['mood'] = win(q.wrong, q.maybe - q.wrong) || (t >= q.mismatch && t < q.reneg) ? 'sad' : 'smile';
  const herMood: Pose['mood'] = (t >= q.barely && t < q.maybe) || (t >= q.herCopy && t < q.reneg) ? 'flat' : 'smile';
  const ropeOn = t >= q.started && t < q.launch;
  const cheerUp = win(q.cheer, 1.5) || win(q.launch2, 1.8) || win(q.launch, 1.0);
  const sharing = win(q.share, 1.2);
  const staying = win(q.stay, 1.5);
  const talking = t >= q.nameTerm && t < q.ask - 0.1;
  const asking = t >= q.ask && t < q.now + 0.6;
  const leaning = t >= q.reneg && t < q.which;
  const you: Pose = pose({
    look: 1,
    mood: youMood,
    lean: leaning ? 0.03 : youMood === 'sad' ? -0.012 : 0,
    rh: ropeOn ? [0.17, -0.05] : cheerUp ? [0.12, -0.3] : sharing ? [0.22, -0.04] : staying ? [0.2, -0.02] : talking ? [0.2, -0.1] : asking ? [0.2, -0.14] : [0.17, 0.27],
    lh: cheerUp ? [-0.12, -0.3] : [-0.17, 0.27],
  });
  const her: Pose = pose({
    look: -1,
    mood: herMood,
    lean: leaning ? -0.03 : 0,
    lh: ropeOn ? [-0.17, -0.05] : win(q.cheer, 1.5) ? [-0.12, -0.3] : sharing ? [-0.22, -0.04] : staying ? [-0.2, -0.02] : [-0.17, 0.27],
    rh: win(q.cheer, 1.5) ? [0.12, -0.3] : [0.17, 0.27],
  });

  // ---------------- 1: started together, launch, the barely-there reply ----------------
  const jY = joints(XL, G, H, you).handR;
  const jH = joints(XR, G, H, her).handL;
  const ropeP = prog(t, q.together, 0.4) * (1 - prog(t, q.launch, 0.3));
  const storeP = prog(t, q.business, 0.45, bounce) * (1 - prog(t, q.launch + 0.15, 0.3));
  const sag = 70;
  const ropePt = (u: number): [number, number] => [(1 - u) * (1 - u) * jY[0] + 2 * u * (1 - u) * ((jY[0] + jH[0]) / 2) + u * u * jH[0], (1 - u) * (1 - u) * jY[1] + 2 * u * (1 - u) * (jY[1] + sag * 2) + u * u * jH[1]];
  const msgOn = between(t, q.msg, q.wrong - 0.4, 0.3);
  const replyOn = between(t, q.barely, q.wrong - 0.4, 0.3);
  const rocketP = prog(t, q.launch, 0.95, (v) => v * v);
  const rocketOn = t >= q.launch && t < q.launch + 1.0;
  const qMark = prog(t, q.wrong, 0.4, bounce) * (1 - prog(t, q.maybe, 0.3));

  // ---------------- 2: the contract each of you carries ----------------
  const cloudL = prog(t, q.contract, 0.45, bounce);
  const cloudR = prog(t, q.each, 0.45, bounce);
  const cloudOut = prog(t, q.reneg, 0.45);
  const signed = between(t, q.different, q.early + 0.2, 0.25);
  const sign = prog(t, q.signed, 0.45, (v) => v);

  // ---------------- 3: the sheets match ----------------
  const pop = (a: number) => prog(t, a, 0.4, bounce);
  const oldPop = [pop(q.cheer), pop(q.share), pop(q.stay)];
  const equalP = prog(t, q.same, 0.4, bounce) * (1 - prog(t, q.cant, 0.25));

  // ---------------- 4: a psychological contract, private ----------------
  const psychP = between(t, q.psych, q.launch2 - 0.25, 0.3);
  const lockP = pop(q.private) * (1 - prog(t, q.launch2 - 0.3, 0.25));
  const eyeP = prog(t, q.cant, 0.4, bounce) * (1 - prog(t, q.launch2 - 0.3, 0.25));

  // ---------------- 5: the launch rewrites one sheet ----------------
  const rocket2 = prog(t, q.launch2, 0.85, (v) => v);
  const rocket2On = t >= q.launch2 && t < q.changed + 0.2;
  const wipe = prog(t, q.changed, 0.55, (v) => v);
  const newPop = [pop(q.terms), pop(q.terms + 0.18), pop(q.terms + 0.36)];
  const pencil = prog(t, q.terms, 0.7, (v) => v);
  const herPulse = 1 + 0.07 * Math.sin(Math.min(1, Math.max(0, (t - q.stayed) / 0.6)) * Math.PI);

  // ---------------- 6: old agreement, new one, the mismatch ----------------
  const oldTag = prog(t, q.old, 0.35, bounce) * (1 - cloudOut);
  const newTag = prog(t, q.newOne, 0.35, bounce) * (1 - cloudOut);
  const neqP = prog(t, q.mismatch, 0.4, bounce) * (1 - prog(t, q.reneg, 0.3));
  const distP = prog(t, q.distance, 0.6) * (1 - prog(t, q.reneg, 0.3));

  // ---------------- 7: renegotiating works better than guessing ----------------
  const travel = prog(t, q.reneg, 0.8);
  const arrowsP = prog(t, q.reneg + 0.5, 0.4, bounce) * (1 - prog(t, q.nameTerm - 0.1, 0.3));
  const guessP = prog(t, q.guessing - 0.5, 0.35, bounce) * (1 - prog(t, q.nameTerm - 0.15, 0.3));

  // ---------------- 8: name one old term, say what you miss, ask ----------------
  const toCenter = prog(t, q.nameTerm, 0.6);
  const leftFade = 1 - prog(t, q.nameTerm + 0.05, 0.35);
  const lift = prog(t, q.oldWord, 0.7);
  const ring = prog(t, q.term + 0.4, 0.5, (v) => v);
  const heartP = prog(t, q.miss, 0.4, bounce);
  const sheetGone = 1 - prog(t, q.ask - 0.5, 0.4);
  const askBubble = prog(t, q.ask, 0.4, bounce);
  const answerBubble = prog(t, q.wouldWork, 0.4, bounce);
  const checkP = prog(t, q.now, 0.35, (v) => v);
  const stepsOn = between(t, q.nameTerm - 0.05, q.which - 0.2, 0.3);

  // sheet positions
  const lx = lerp(xl, 400, travel);
  const ly = lerp(CLOUD_Y, 252, travel);
  const rxBase = lerp(xr, 600, travel);
  const rx = lerp(rxBase, 500, toCenter);
  const ry = lerp(CLOUD_Y, 252, travel);
  const sL = lerp(SHEET_S, 1.12, travel);
  const sR = lerp(sL, 1.3, toCenter);
  const sheetsOn = Math.max(cloudL, cloudR) > 0;
  const rightSheetOp = cloudR * sheetGone;
  const leftSheetOp = cloudL * leftFade;

  // the lifted icon
  const sheetOldPop = [oldPop[0] * (1 - prog(t, q.oldWord, 0.05, (v) => v)), oldPop[1], oldPop[2]];
  const liftStart = {x: rx - 28 * sR, y: ry + ROW_Y[0] * sR, s: 0.78 * sR};
  const liftEnd = {x: 500, y: 470, s: 2.1};
  const lx2 = lerp(liftStart.x, liftEnd.x, lift);
  const ly2 = lerp(liftStart.y, liftEnd.y, lift);
  const ls2 = lerp(liftStart.s, liftEnd.s, lift);
  const liftOp = Math.min(1, lift * 4) * (1 - prog(t, q.which - 0.25, 0.3));

  // ---------------- 9: which old term ----------------
  const tilesOn = prog(t, q.which, 0.4, bounce) * (1 - prog(t, q.cta - 0.15, 0.3));
  const tileX = [255, 500, 745];
  const hop = (t - q.which) / 0.9;
  const k = Math.max(0, Math.floor(hop));
  const f = Math.max(0, hop - k);
  const target = k % 3;
  const prev = k === 0 ? 0 : (k - 1) % 3;
  const jump = k === 0 ? 1 : prog(t, q.which + k * 0.9, 0.36, (v) => v);
  const ptrX = lerp(tileX[prev], tileX[target], jump);
  const ptrY = 170 - Math.sin(jump * Math.PI) * (k === 0 ? 0 : 56) + (jump >= 1 ? Math.sin(f * 7) * 3 : 0);
  const landed = (i: number) => (target === i && jump >= 1 ? 1 + 0.05 * Math.max(0, Math.sin(Math.min(1, f * 4) * Math.PI)) : 1);

  // ---------------- 10: follow ----------------
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  const showFigs = figsOp > 0 && t < q.which;
  // the opening scene is drawn larger, then settles to the size the clouds need while she pauses before "contract"
  const k1 = lerp(1.3, 1, prog(t, q.contract - 1.6, 0.7));

  return (
    <g>
      {showFigs && (
        <g opacity={figsOp} transform={`translate(500 ${G}) scale(${k1}) translate(-500 ${-G})`}>
          {/* scene 1 props */}
          {ropeP > 0 && (
            <g opacity={ropeP}>
              <path d={`M ${jY[0]} ${jY[1]} Q ${(jY[0] + jH[0]) / 2} ${jY[1] + sag * 2} ${jH[0]} ${jH[1]}`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
              {[0.25, 0.5, 0.75].map((u) => {
                const [px, py] = ropePt(u);
                return <path key={u} d={`M ${px - 15} ${py - 1} L ${px + 15} ${py - 1} L ${px} ${py + 34} Z`} fill={C.soft} stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round" />;
              })}
            </g>
          )}
          <Stick x={xl} y={G} h={H} pose={you} hair="bun" />
          <Stick x={xr} y={G} h={H} pose={her} hair="long" />

          {storeP > 0 && (
            <g transform={`translate(500 262) scale(${1.35 * storeP})`} opacity={Math.min(1, storeP * 2)} strokeLinejoin="round" strokeLinecap="round">
              <rect x={-60} y={-8} width={120} height={80} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <path d="M -72 -8 L -62 -46 L 62 -46 L 72 -8 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <path d="M -36 -46 L -42 -8 M -12 -46 L -14 -8 M 12 -46 L 14 -8 M 36 -46 L 42 -8" stroke={C.ink} strokeWidth={4} fill="none" />
              <rect x={-44} y={-46} width={24} height={38} fill={C.soft} stroke="none" opacity={0.9} />
              <rect x={4} y={-46} width={24} height={38} fill={C.soft} stroke="none" opacity={0.9} />
              <rect x={-16} y={22} width={32} height={50} rx={4} fill="#FFFFFF" stroke={C.ink} strokeWidth={4.5} />
              <rect x={26} y={14} width={26} height={26} rx={3} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
            </g>
          )}
          {rocketOn && <Rocket x={500} y={lerp(190, 50, rocketP)} s={1.3} opacity={1 - prog(t, q.launch + 0.75, 0.25, (v) => v)} />}
          {msgOn > 0 && (
            <g opacity={msgOn}>
              <circle cx={XL + 48} cy={372} r={9} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={XL + 70} cy={340} r={13} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={XL + 175} y={290} w={190} h={100}>
                {[-22, 0, 22].map((dy, i) => (
                  <line key={i} x1={XL + 98} y1={290 + dy} x2={XL + (i === 2 ? 190 : 252)} y2={290 + dy} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
                ))}
              </Bubble>
            </g>
          )}
          {replyOn > 0 && (
            <g opacity={replyOn}>
              <circle cx={XR - 48} cy={372} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={XR - 64} cy={344} r={11} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={XR - 80} y={296} w={86} h={66}>
                <circle cx={XR - 80} cy={296} r={7} fill={C.ink} />
              </Bubble>
            </g>
          )}
          {qMark > 0 && (
            <text x={XL} y={352} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={130 * (0.6 + 0.4 * qMark)} fill={C.ink} opacity={Math.min(1, qMark * 2)}>
              ?
            </text>
          )}

          {/* clouds and sheets */}
          {cloudL > 0 && <Cloud x={xl} y={CLOUD_Y} p={Math.max(0.01, cloudL)} opacity={1 - cloudOut} />}
          {cloudR > 0 && <Cloud x={xr} y={CLOUD_Y} p={Math.max(0.01, cloudR)} opacity={1 - cloudOut} />}

          {/* the signed paper, which is not the one in her head */}
          {signed > 0 && (
            <g opacity={signed} transform="translate(500 205)">
              <rect x={-38} y={-58} width={76} height={116} rx={10} fill="#FFFFFF" stroke={C.mid} strokeWidth={5} />
              {[-34, -18, -2].map((yy, i) => (
                <line key={i} x1={-22} y1={yy} x2={i === 2 ? 4 : 22} y2={yy} stroke={C.soft} strokeWidth={6} strokeLinecap="round" />
              ))}
              <path d="M -24 38 C -16 16, -10 50, -4 30 C 2 14, 6 42, 12 30 C 16 22, 20 34, 25 26" fill="none" stroke={C.crimson} strokeWidth={5} strokeLinecap="round" strokeDasharray={110} strokeDashoffset={110 * (1 - sign)} />
            </g>
          )}

          {/* equals, eye, not-equals */}
          {equalP > 0 && (
            <g transform={`translate(500 ${CLOUD_Y}) scale(${equalP})`} opacity={Math.min(1, equalP * 2)}>
              <rect x={-30} y={-22} width={60} height={12} rx={6} fill={C.crimson} />
              <rect x={-30} y={10} width={60} height={12} rx={6} fill={C.crimson} />
            </g>
          )}
          {eyeP > 0 && (
            <g transform={`translate(500 ${CLOUD_Y}) scale(${eyeP * 1.2})`} opacity={Math.min(1, eyeP * 2)}>
              <path d="M -40 0 Q 0 -36 40 0 Q 0 36 -40 0 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
              <circle r={12} fill={C.ink} />
              <line x1={-44} y1={36} x2={44} y2={-36} stroke="#FFFFFF" strokeWidth={20} strokeLinecap="round" />
              <line x1={-44} y1={36} x2={44} y2={-36} stroke={C.crimson} strokeWidth={9} strokeLinecap="round" />
            </g>
          )}
          {neqP > 0 && (
            <g transform={`translate(500 ${CLOUD_Y}) scale(${neqP})`} opacity={Math.min(1, neqP * 2)}>
              <rect x={-30} y={-22} width={60} height={12} rx={6} fill={C.crimson} />
              <rect x={-30} y={10} width={60} height={12} rx={6} fill={C.crimson} />
              <line x1={-22} y1={34} x2={22} y2={-34} stroke="#FFFFFF" strokeWidth={20} strokeLinecap="round" />
              <line x1={-22} y1={34} x2={22} y2={-34} stroke={C.crimson} strokeWidth={10} strokeLinecap="round" />
            </g>
          )}

          {/* tags */}
          {psychP > 0 && <Tag x={500} y={46} text="PSYCHOLOGICAL CONTRACT" size={22} opacity={psychP} />}
          {oldTag > 0 && <Tag x={xr} y={46} text="OLD" size={26} fill={C.mid} opacity={oldTag} />}
          {newTag > 0 && <Tag x={xl} y={46} text="NEW" size={26} opacity={newTag} />}

          {/* distance */}
          {distP > 0 && (
            <g opacity={distP} stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d={`M ${xl + 62} 610 L ${xr - 62} 610 M ${xl + 82} 594 L ${xl + 62} 610 L ${xl + 82} 626 M ${xr - 82} 594 L ${xr - 62} 610 L ${xr - 82} 626`} />
            </g>
          )}
        </g>
      )}

      {/* the sheets (they live in the clouds, then travel together to be renegotiated) */}
      {sheetsOn && t < q.which && (
        <g opacity={figsOp}>
          {leftSheetOp > 0 && (
            <Sheet x={lx} y={ly} s={sL} opacity={leftSheetOp} oldPop={oldPop} wipe={wipe} newPop={newPop} pencil={pencil} lock={lockP} />
          )}
          {rightSheetOp > 0 && (
            <Sheet x={rx} y={ry} s={sR * (t >= q.stayed && t < q.stayed + 0.7 ? herPulse : 1)} opacity={rightSheetOp} oldPop={sheetOldPop} lock={lockP} />
          )}
          {rocket2On && <Rocket x={xl} y={lerp(375, ly - 10, rocket2)} s={1.0} opacity={1 - prog(t, q.changed - 0.05, 0.25, (v) => v)} />}
          {arrowsP > 0 && (
            <g opacity={arrowsP} transform={`translate(500 ${ly})`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M -18 -12 L 18 -12 M 8 -22 L 18 -12 L 8 -2 M 18 14 L -18 14 M -8 4 L -18 14 L -8 24" />
            </g>
          )}
          {guessP > 0 && (
            <g opacity={guessP}>
              <text x={500} y={104} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={110} fill={C.mid}>
                ?
              </text>
              <path d="M 466 38 L 534 100 M 534 38 L 466 100" stroke={C.crimson} strokeWidth={11} strokeLinecap="round" strokeDasharray={94} strokeDashoffset={94 * (1 - prog(t, q.guessing, 0.35, (v) => v))} />
            </g>
          )}
        </g>
      )}

      {/* steps: the lifted old term, what you miss about it, the question */}
      {stepsOn > 0 && t < q.which && (
        <g opacity={stepsOn}>
          {liftOp > 0 && (
            <g opacity={liftOp}>
              <Icon kind="cheer" s={ls2} x={lx2} y={ly2} />
              {ring > 0 && lift >= 1 && (
                <circle cx={500} cy={470} r={68} fill="none" stroke={C.crimson} strokeWidth={7} strokeLinecap="round" strokeDasharray={428} strokeDashoffset={428 * (1 - ring)} transform="rotate(-90 500 470)" />
              )}
            </g>
          )}
          {heartP > 0 && (
            <g transform="translate(606 470)" opacity={Math.min(1, heartP * 2)}>
              <Heart s={0.85 * heartP} />
            </g>
          )}
          {askBubble > 0 && (
            <g opacity={Math.min(1, askBubble * 2)}>
              <circle cx={XL + 46} cy={372} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={XL + 62} cy={345} r={11} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={XL + 100} y={292} w={104} h={84}>
                <text x={XL + 100} y={320} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={66} fill={C.ink}>
                  ?
                </text>
              </Bubble>
            </g>
          )}
          {answerBubble > 0 && (
            <g opacity={Math.min(1, answerBubble * 2)}>
              <circle cx={XR - 46} cy={372} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={XR - 62} cy={345} r={11} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={XR - 100} y={292} w={104} h={84}>
                <rect x={XR - 126} y={268} width={52} height={48} rx={7} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="7 6" />
                <line x1={XR - 116} y1={284} x2={XR - 84} y2={284} stroke={C.soft} strokeWidth={6} strokeLinecap="round" />
                <line x1={XR - 116} y1={300} x2={XR - 96} y2={300} stroke={C.soft} strokeWidth={6} strokeLinecap="round" />
              </Bubble>
              {checkP > 0 && (
                <path d="M 636 238 L 648 252 L 672 222" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - checkP)} />
              )}
            </g>
          )}
        </g>
      )}

      {/* which old term would you name first */}
      {tilesOn > 0 && (
        <g opacity={Math.min(1, tilesOn)}>
          {OLD.map((kind, i) => (
            <g key={kind} transform={`translate(${tileX[i]} 360) scale(${landed(i)})`}>
              <Panel x={-105} y={-135} w={210} h={270} />
              <Icon kind={kind} s={2.6} />
            </g>
          ))}
          <g transform={`translate(${ptrX} ${ptrY})`}>
            <path d="M -14 -50 L 14 -50 L 14 -12 L 34 -12 L 0 32 L -34 -12 L -14 -12 Z" fill={C.crimson} stroke={C.crimson} strokeWidth={4} strokeLinejoin="round" />
          </g>
          <Tag x={500} y={574} text="OLD TERM" size={26} fill={C.mid} />
        </g>
      )}

      {/* follow */}
      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={215} s={1.6 * ctaOn} />
          <Bell x={500} y={385} s={1.7 * ctaOn} ring={prog(t, q.cta + 0.4, 1.4, (v) => v)} />
          <Tag x={500} y={540} text="FOLLOW AND SUBSCRIBE" size={36} />
        </g>
      )}
    </g>
  );
};
