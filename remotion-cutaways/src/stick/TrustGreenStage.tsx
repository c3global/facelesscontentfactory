import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Tag, Panel, Gauge, Bubble, Cross, C, SANS, between, bounce, prog} from './kit';
import {Bell, CommentIcon, FollowIcon, Shield} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Three Questions Before You Trust a Green". A green status is a report card with a dot on it.
 * Status encoding (no green or yellow in the palette): RED = crimson fill, YELLOW = half crimson / half white,
 * GREEN = white with a black outline and a check. Three numbered questions open the card up (who wrote it, what
 * it replaced, where the team's own list is), then "make red cheap": a red flag any figure can raise with one tap.
 * `t` is seconds into the voiceover, `q` the cue times from content/trust-a-green.stick.json.
 */
type Kind = 'red' | 'yellow' | 'green';
const KIND_TAG: Record<Kind, string> = {red: 'RED', yellow: 'YELLOW', green: 'GREEN'};

const lin = (v: number) => v;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const smile = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const line = {fill: 'none', stroke: C.ink, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

/** A status dot in the series palette. */
const Dot: React.FC<{x?: number; y?: number; r?: number; kind: Kind; check?: number; opacity?: number; scale?: number}> = ({x = 0, y = 0, r = 22, kind, check = 1, opacity = 1, scale = 1}) => {
  const sw = Math.max(3.5, r * 0.2);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle r={r} fill="#FFFFFF" />
      {kind === 'red' && <circle r={r} fill={C.crimson} />}
      {kind === 'yellow' && <path d={`M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} Z`} fill={C.crimson} />}
      <circle r={r} fill="none" stroke={kind === 'green' ? C.ink : C.crimson} strokeWidth={sw} />
      {kind === 'green' && (
        <path d={`M ${-r * 0.45} ${r * 0.02} L ${-r * 0.1} ${r * 0.36} L ${r * 0.48} ${-r * 0.34}`} fill="none" stroke={C.ink} strokeWidth={sw * 1.3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={r * 3} strokeDashoffset={r * 3 * (1 - check)} />
      )}
    </g>
  );
};

/** A tiny white pill so the status reads without color (same look as the red-turns-green episode). */
const MiniTag: React.FC<{x: number; y: number; text: string; opacity?: number; size?: number}> = ({x, y, text, opacity = 1, size = 15}) => {
  const w = text.length * size * 0.72 + 24;
  const h = size * 1.7;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill="#FFFFFF" stroke={C.ink} strokeWidth={3} />
      <text x={x} y={y + size * 0.35} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={size} letterSpacing={2} fill={C.ink}>
        {text}
      </text>
    </g>
  );
};

/** A status report card: a few lines of text, a big status dot and its tiny tag. */
const Report: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  scale?: number;
  kind: Kind;
  kind2?: Kind;
  flip?: number;
  check?: number;
  lines?: [number, number, number];
  hl?: number;
  opacity?: number;
  tagOn?: number;
  dotP?: number;
  shadow?: boolean;
}> = ({x, y, w = 240, h = 260, scale = 1, kind, kind2, flip = 0, check = 1, lines = [0.5, 0.78, 0.6], hl = 0, opacity = 1, tagOn = 1, dotP = 1, shadow = true}) => {
  const k = flip > 0.5 && kind2 ? kind2 : kind;
  const lx = -w / 2 + 28;
  const rows = [
    {y: -h / 2 + 36, len: lines[0] * w, c: C.ink, sw: 8},
    {y: -h / 2 + 62, len: lines[1] * w, c: C.soft, sw: 7},
    {y: -h / 2 + 84, len: lines[2] * w, c: C.soft, sw: 7},
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      {shadow && <rect x={-w / 2 + 9} y={-h / 2 + 11} width={w} height={h} rx={20} fill={C.soft} />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={20} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      {rows.map((r, i) => (
        <line key={i} x1={lx} y1={r.y} x2={lx + r.len - 28} y2={r.y} stroke={r.c} strokeWidth={r.sw} strokeLinecap="round" />
      ))}
      {hl > 0 &&
        rows.map((r, i) => (
          <line key={i} x1={lx} y1={r.y + 13} x2={lx + r.len - 28} y2={r.y + 13} stroke={C.crimson} strokeWidth={5} strokeLinecap="round" strokeDasharray={r.len} strokeDashoffset={r.len * (1 - hl)} />
        ))}
      <g transform={`translate(0 ${h * 0.06})`}>
        <Dot kind={kind} r={h * 0.17} check={check} opacity={(kind2 ? 1 - Math.min(1, flip * 1.5) : 1) * Math.min(1, dotP * 2)} scale={0.7 + 0.3 * dotP} />
        {kind2 && flip > 0 && <Dot kind={kind2} r={h * 0.17} opacity={Math.min(1, flip * 1.5)} scale={0.8 + 0.2 * Math.min(1, flip * 1.5)} />}
      </g>
      <MiniTag x={0} y={h / 2 - 34} text={KIND_TAG[k]} size={16} opacity={tagOn} />
    </g>
  );
};

const Pencil: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s}) rotate(40)`} {...line} strokeWidth={6}>
    <rect x={-11} y={-52} width={22} height={74} rx={4} fill="#FFFFFF" />
    <path d="M -11 22 L 0 48 L 11 22 Z" fill="#FFFFFF" />
    <line x1={-11} y1={-34} x2={11} y2={-34} />
  </g>
);

const SheetIcon: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...line} strokeWidth={5}>
    <rect x={-38} y={-31} width={76} height={62} rx={8} fill="#FFFFFF" />
    <line x1={-38} y1={-10} x2={38} y2={-10} />
    <line x1={-13} y1={-31} x2={-13} y2={31} stroke={C.mid} />
    <line x1={13} y1={-31} x2={13} y2={31} stroke={C.mid} />
    <line x1={-38} y1={10} x2={38} y2={10} stroke={C.mid} />
  </g>
);

const NotebookIcon: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} {...line} strokeWidth={5}>
    <rect x={-28} y={-36} width={56} height={72} rx={7} fill="#FFFFFF" />
    {[-22, 0, 22].map((yy) => (
      <circle key={yy} cx={-28} cy={yy} r={5} fill="#FFFFFF" />
    ))}
    {[-14, 2, 18].map((yy) => (
      <line key={yy} x1={-12} y1={yy} x2={18} y2={yy} stroke={C.mid} strokeWidth={5} />
    ))}
  </g>
);

const Mark: React.FC<{d: string; p: number; len?: number; color?: string; w?: number}> = ({d, p, len = 120, color = C.ink, w = 4}) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
);

export const TrustGreenStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // scene windows
  const s1 = 1 - prog(t, 10.9, 0.35, lin);
  const s2 = between(t, 5.4, 11.1, 0.3);
  const s3 = between(t, 10.95, 23.0, 0.3);
  const s4 = between(t, 22.95, 36.15, 0.3);
  const s5 = between(t, 38.25, 49.7, 0.3);
  const s6 = between(t, 49.6, 55.85, 0.3);
  const s7 = between(t, 55.75, 60.75, 0.3);
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  // ---------------- pips: the three questions (and a fourth, "one more thing") ----------------
  const pipsIn = (i: number) => prog(t, [q.three, q.three + 0.31, q.questions][i], 0.3, bounce);
  const toBig = prog(t, q.more, 0.5) * (1 - prog(t, q.make, 0.5));
  const pipsOut = 1 - prog(t, q.safe - 0.3, 0.3, lin);
  const bigA = prog(t, q.three - 0.3, 0.01, lin) - prog(t, q.one - 0.1, 0.45); // 1 while the pips are the scene-one headline
  const pipY = 105 + 65 * bigA + 245 * toBig;
  const pipR = 26 + 18 * bigA + 24 * toBig;
  const pipGap = 70 + 54 * bigA + 68 * toBig;
  const fourth = prog(t, q.oneMore, 0.4, bounce);
  const rowShift = -pipGap * 0.5 * fourth;
  const pips = [0, 1, 2, 3].map((i) => {
    const active = i === 0 ? t >= q.one && t < q.two : i === 1 ? t >= q.two && t < q.q3 : i === 2 ? t >= q.q3 && t < q.more : t >= q.make;
    const done = i === 0 ? t >= q.two : i === 1 ? t >= q.q3 : i === 2 ? t >= q.more : false;
    return {i, active, done, a: i < 3 ? pipsIn(i) : fourth};
  });

  // ---------------- 1: the green card, then three questions ----------------
  const cardIn = prog(t, 0.15, 0.5, bounce);
  const dotCheck = prog(t, q.green, 0.45, lin);
  const toRight = prog(t, q.one - 0.05, 0.6);
  const card1X = lerp(500, 700, toRight);
  const card1Y = lerp(405, 440, toRight);
  const card1S = lerp(1.25, 0.88, toRight);
  const ask = prog(t, q.ask, 0.35, bounce) * (1 - prog(t, q.one - 0.05, 0.3));
  const flipRed = prog(t, q.red, 0.25, bounce) * (1 - prog(t, q.two - 0.15, 0.2));

  // ---------------- 2: who wrote it, and what did they expect if it said red ----------------
  const whoQ = prog(t, q.who, 0.35, bounce) * (1 - prog(t, q.bubble, 0.25));
  const wLine = prog(t, q.who + 0.1, 0.5, lin);
  const pen = prog(t, q.wrote, 0.5);
  const bub = prog(t, q.bubble, 0.45, bounce);
  const worry = prog(t, q.happen, 0.4, bounce);
  const redBub = prog(t, q.red - 0.1, 0.35, bounce);
  const writerPose: Pose = smile({rh: [0.17, -0.08], lh: [-0.17, 0.27], mood: t > q.happen ? 'flat' : 'smile'});

  // ---------------- 3: what did this status replace ----------------
  const rightIn = prog(t, q.replace, 0.5, bounce);
  const slot = prog(t, q.slotQ, 0.4, bounce) * (1 - prog(t, q.last, 0.3));
  const leftIn = prog(t, q.last, 0.45, bounce);
  const yel = prog(t, q.yellow, 0.35, bounce);
  const arrow = prog(t, q.became, 0.5, lin) * (1 - prog(t, q.askChanged, 0.3));
  const gap = prog(t, q.askChanged, 0.4);
  const qMark = prog(t, q.changed, 0.4, bounce);
  const bracket = prog(t, q.between, 0.5, lin);
  const hl = prog(t, q.wording, 0.7, lin);
  void q.greenAgain;

  // ---------------- 4: the team's own list ----------------
  const team = prog(t, q.q3, 0.45, bounce);
  const trayQ = prog(t, q.list - 0.1, 0.4, bounce);
  const ic = [prog(t, q.sheet, 0.4, bounce), prog(t, q.notebook, 0.4, bounce), prog(t, q.chat, 0.4, bounce)];
  const trayOn = prog(t, q.sheet, 0.3, lin);
  const trayTag = prog(t, q.listIs, 0.35, bounce);
  const nearBar = prog(t, q.closer, 0.4, lin);
  const workTag = prog(t, q.work, 0.35, bounce);
  const farCard = prog(t, q.report, 0.5, bounce);
  const farBar = prog(t, q.report + 0.1, 0.7, lin);
  const nod = Math.sin(t * 3) * 0.01;

  // ---------------- 5: make red cheap ----------------
  const woman = prog(t, q.make, 0.45, bounce);
  const tap = prog(t, q.make + 0.15, 0.6, lin);
  const raise = prog(t, q.cheap, 0.55, bounce);
  const cheapTag = prog(t, q.cheap + 0.1, 0.35, bounce) * (1 - prog(t, q.letRed - 0.1, 0.25));
  const cardsOut = 1 - prog(t, q.letRed - 0.15, 0.3);
  const c1 = prog(t, q.line, 0.45, bounce);
  const c2 = prog(t, q.meeting - 0.1, 0.45, bounce);
  const c3 = prog(t, q.explain - 0.1, 0.45, bounce);
  const x2 = prog(t, q.meeting + 0.3, 0.3, bounce);
  const x3 = prog(t, q.explain + 0.5, 0.3, bounce);
  const man = prog(t, q.letRed, 0.6);
  const rowA = prog(t, q.needHelp - 0.1, 0.4, bounce);
  const rowB = prog(t, q.notSomeone, 0.4, bounce);
  const crossB = prog(t, q.failed, 0.3, bounce);
  const womanPose: Pose = smile({rh: [0.18, 0.14], lh: [-0.17, 0.27], mood: 'smile'});
  const manPose: Pose = smile({lh: [-0.22, 0.02], rh: [0.17, 0.27], lean: -0.03 * man});

  // ---------------- 6: the report gets messier and more useful ----------------
  const shield = prog(t, q.safe, 0.4, bounce);
  const rowKind = (i: number): {kind: Kind; at: number} => {
    const cfg: {kind: Kind; at: number}[] = [
      {kind: 'red', at: q.write},
      {kind: 'green', at: 0},
      {kind: 'yellow', at: q.messyStart},
      {kind: 'red', at: q.messier},
      {kind: 'green', at: 0},
      {kind: 'red', at: q.messier + 0.6},
    ];
    return cfg[i];
  };
  const level = 0.14 + 0.78 * prog(t, q.useful - 0.1, 0.9, lin);
  const gaugeIn = prog(t, q.safe + 0.2, 0.4, bounce);

  // ---------------- 7: which would you ask first ----------------
  const cardsIn = [0, 1, 2].map((i) => prog(t, q.which + i * 0.18, 0.45, bounce));
  const focus = t < q.first ? Math.floor(Math.max(0, t - 56.7) / 0.32) : Math.floor((t - q.first) / 0.9) % 3;
  const showFocus = t >= 56.7;
  const bigQ = prog(t, q.first, 0.4, bounce);

  return (
    <g>
      {/* pips */}
      {pipsOut > 0 && t >= q.three && (
        <g opacity={pipsOut}>
          {pips.map((p) => {
            const px = 500 + rowShift + (p.i - 1) * pipGap;
            const r = pipR * (0.4 + 0.6 * p.a);
            return (
              <g key={p.i} opacity={Math.min(1, p.a * 2)}>
                <circle cx={px} cy={pipY} r={r} fill={p.active ? C.ink : '#FFFFFF'} stroke={C.ink} strokeWidth={5} />
                {p.done ? (
                  <path d={`M ${px - r * 0.42} ${pipY + r * 0.02} L ${px - r * 0.1} ${pipY + r * 0.34} L ${px + r * 0.46} ${pipY - r * 0.32}`} fill="none" stroke={C.crimson} strokeWidth={Math.max(5, r * 0.2)} strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <text x={px} y={pipY + r * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={r * 1.05} fill={p.active ? '#FFFFFF' : C.ink}>
                    {p.i < 3 ? p.i + 1 : '+'}
                  </text>
                )}
              </g>
            );
          })}
          {fourth > 0 && toBig > 0.3 && <Tag x={500 + rowShift + 2 * pipGap * 0.5 + 60} y={pipY + pipR + 48} text="ONE MORE" size={26} opacity={fourth * toBig} />}
        </g>
      )}

      {/* 1 and 2: the card (green, then it travels right) */}
      {s1 > 0 && cardIn > 0 && (
        <g opacity={s1 * Math.min(1, cardIn * 2)}>
          <Report x={card1X} y={card1Y} scale={card1S * (0.85 + 0.15 * cardIn)} kind="green" kind2="red" flip={flipRed} check={dotCheck} tagOn={dotCheck > 0.5 ? 1 : 0} />
          {ask > 0 && (
            <g opacity={ask} transform={`translate(${card1X + 150} ${card1Y - 120})`}>
              <circle r={30} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              <line x1={22} y1={22} x2={48} y2={48} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
              <text y={12} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={36} fill={C.ink}>
                ?
              </text>
            </g>
          )}
        </g>
      )}

      {/* 2: the writer */}
      {s2 > 0 && (
        <g opacity={s2}>
          <Stick x={270} y={630} h={270} pose={writerPose} hair="bob" />
          {whoQ > 0 && (
            <text x={270} y={310} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={110} fill={C.ink} opacity={whoQ}>
              ?
            </text>
          )}
          {wLine > 0 && (
            <line x1={345} y1={470} x2={345 + 160 * wLine} y2={470} stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeDasharray="4 14" />
          )}
          {pen > 0 && (
            <g transform={`translate(${lerp(360, 560, pen)} ${lerp(455, 395, pen)}) scale(${0.9})`} opacity={Math.min(1, pen * 3)}>
              <Pencil s={0.9} />
            </g>
          )}
          {bub > 0 && (
            <g opacity={Math.min(1, bub * 1.5)}>
              <circle cx={274} cy={326} r={7} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
              <circle cx={288} cy={304} r={11} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
              <g transform={`translate(330 225) scale(${0.6 + 0.4 * bub}) translate(-330 -225)`}>
                <Bubble x={330} y={225} w={340} h={170} />
                {worry > 0 && (
                  <g opacity={worry}>
                    <Stick x={285} y={292} h={120} pose={smile({lh: [-0.2, -0.05], rh: [0.2, -0.05], mood: 'sad'})} sw={6} />
                  </g>
                )}
                {redBub > 0 && (
                  <g>
                    <Dot x={395} y={218} r={30} kind="red" scale={redBub} />
                    <MiniTag x={395} y={268} text="RED" size={14} opacity={redBub} />
                  </g>
                )}
              </g>
            </g>
          )}
        </g>
      )}

      {/* 3: what did it replace */}
      {s3 > 0 && (
        <g opacity={s3}>
          {rightIn > 0 && (
            <g opacity={Math.min(1, rightIn * 2)}>
              <Report x={lerp(930, 760, rightIn)} y={400} kind="green" tagOn={1} hl={hl} lines={[0.62, 0.7, 0.5]} />
              {t >= q.thisMonth && <Tag x={760} y={225} text="THIS MONTH" size={21} opacity={prog(t, q.thisMonth, 0.3, bounce)} />}
            </g>
          )}
          {slot > 0 && (
            <g opacity={slot}>
              <rect x={120} y={270} width={240} height={260} rx={20} fill="none" stroke={C.mid} strokeWidth={5} strokeDasharray="14 12" />
              <text x={240} y={435} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={130} fill={C.mid}>
                ?
              </text>
            </g>
          )}
          {leftIn > 0 && (
            <g opacity={Math.min(1, leftIn * 2)}>
              <Report x={240} y={400} kind="yellow" tagOn={yel} dotP={yel} lines={[0.7, 0.55, 0.62]} scale={0.9 + 0.1 * leftIn} />
              <Tag x={240} y={225} text="LAST MONTH" size={21} opacity={prog(t, q.last, 0.3, bounce)} />
            </g>
          )}
          {arrow > 0 && (
            <g opacity={arrow}>
              <path d={`M 385 400 L ${385 + 230 * prog(t, q.became, 0.5, lin)} 400`} fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
              <path d="M 585 372 L 618 400 L 585 428" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={prog(t, q.became + 0.35, 0.15, lin)} />
            </g>
          )}
          {gap > 0 && (
            <g opacity={gap}>
              <path d={`M 372 ${470 - 8} L 372 478 L ${372 + 256 * bracket} 478 M 628 ${470 - 8} L 628 478`} fill="none" stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 12" opacity={bracket} />
              <path d={`M 372 322 L 372 332 L ${372 + 256 * bracket} 332 M 628 322 L 628 332`} fill="none" stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 12" opacity={bracket} />
              <text x={500} y={445} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={150} fill={C.ink} transform={`translate(0 ${(1 - qMark) * 30})`} opacity={qMark}>
                ?
              </text>
            </g>
          )}
          {hl > 0 && <Tag x={760} y={578} text="WORDING" size={22} opacity={prog(t, q.wording, 0.3, bounce)} />}
        </g>
      )}

      {/* 4: the team's list */}
      {s4 > 0 && (
        <g opacity={s4}>
          <g transform={`translate(0 ${nod * 100})`}>
            <Stick x={150} y={530} h={200} pose={smile()} opacity={team} />
            <Stick x={265} y={530} h={200} pose={smile({rh: [0.2, 0.0]})} hair="ponytail" opacity={team} />
          </g>
          {workTag > 0 && <Tag x={208} y={285} text="THE WORK" size={20} opacity={workTag} />}
          {trayQ > 0 && (
            <g opacity={trayQ}>
              <rect x={345} y={375} width={210} height={130} rx={22} fill="#FFFFFF" stroke={trayOn > 0 ? C.ink : C.mid} strokeWidth={5} strokeDasharray={trayOn > 0.5 ? undefined : '14 12'} />
              {ic[0] < 0.05 && (
                <text x={450} y={462} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={80} fill={C.mid}>
                  ?
                </text>
              )}
              <g transform={`translate(392 440) scale(${ic[0]})`}>
                <SheetIcon s={0.62} />
              </g>
              <g transform={`translate(450 440) scale(${ic[1]})`}>
                <NotebookIcon s={0.62} />
              </g>
              <g transform={`translate(512 440) scale(${ic[2]})`}>
                <CommentIcon s={0.36} />
              </g>
            </g>
          )}
          {trayTag > 0 && <Tag x={450} y={338} text="TEAM LIST" size={20} opacity={trayTag} />}
          {farCard > 0 && (
            <g opacity={Math.min(1, farCard * 2)}>
              <Report x={lerp(960, 810, farCard)} y={440} w={240} h={260} scale={0.62} kind="green" tagOn={1} />
              <Tag x={810} y={332} text="REPORT" size={18} opacity={prog(t, q.report + 0.3, 0.3, bounce)} />
            </g>
          )}
          {nearBar > 0 && (
            <g opacity={nearBar}>
              <line x1={207} y1={585} x2={207 + 243 * nearBar} y2={585} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
              <Tag x={450 + 74} y={585} text="CLOSE" size={18} opacity={prog(t, q.closer + 0.3, 0.3, bounce)} />
            </g>
          )}
          {farBar > 0 && (
            <g>
              <line x1={207} y1={628} x2={207 + 603 * farBar} y2={628} stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeDasharray="2 16" />
              <Tag x={810} y={598} text="FAR" size={18} opacity={prog(t, q.report + 0.8, 0.3, bounce)} />
            </g>
          )}
        </g>
      )}

      {/* 5: make red cheap */}
      {s5 > 0 && (
        <g opacity={s5}>
          {/* the flag */}
          <g opacity={woman}>
            <line x1={420} y1={630} x2={420} y2={300} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
            <circle cx={420} cy={296} r={10} fill={C.ink} />
            <rect x={388} y={624} width={64} height={14} rx={7} fill={C.ink} />
            <circle cx={420} cy={470} r={17} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
            {tap > 0 && tap < 1 && <circle cx={420} cy={470} r={17 + 40 * tap} fill="none" stroke={C.ink} strokeWidth={4} opacity={1 - tap} />}
            <path d={`M 420 ${lerp(580, 322, raise)} L 528 ${lerp(580, 322, raise) + 30} L 420 ${lerp(580, 322, raise) + 62} Z`} fill={C.crimson} stroke={C.crimson} strokeWidth={5} strokeLinejoin="round" />
          </g>
          <Stick x={360} y={630} h={260} pose={womanPose} hair="ponytail" opacity={woman} />
          {cheapTag > 0 && <Tag x={430} y={240} text="CHEAP" size={26} opacity={cheapTag} />}

          {/* one line, no meeting, no explanation */}
          {cardsOut > 0 && (
            <g opacity={cardsOut}>
              {[
                {k: c1, y: 225, label: 'ONE LINE'},
                {k: c2, y: 385, label: 'NO MEETING'},
                {k: c3, y: 545, label: 'NO EXPLANATION'},
              ].map((c, i) => (
                <g key={i} transform={`translate(710 ${c.y}) scale(${0.85 + 0.15 * c.k})`} opacity={Math.min(1, c.k * 2)}>
                  <rect x={-140} y={-66} width={280} height={132} rx={18} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
                  <text y={46} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={22} letterSpacing={2} fill={C.ink}>
                    {c.label}
                  </text>
                  {i === 0 && (
                    <g>
                      <Dot x={-62} y={-16} r={15} kind="red" />
                      <line x1={-30} y1={-16} x2={70} y2={-16} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
                    </g>
                  )}
                  {i === 1 && (
                    <g {...line} strokeWidth={5}>
                      <rect x={-46} y={-14} width={92} height={22} rx={8} fill="#FFFFFF" />
                      {[-28, 0, 28].map((dx) => (
                        <circle key={dx} cx={dx} cy={-32} r={9} fill="#FFFFFF" />
                      ))}
                    </g>
                  )}
                  {i === 2 && (
                    <g {...line} strokeWidth={5}>
                      <rect x={-27} y={-52} width={54} height={66} rx={8} fill="#FFFFFF" />
                      {[-36, -24, -12, 0].map((yy) => (
                        <line key={yy} x1={-15} y1={yy} x2={15} y2={yy} stroke={C.mid} strokeWidth={4} />
                      ))}
                    </g>
                  )}
                  {i === 0 && <path d={`M 98 -4 L 106 6 L 122 -16`} fill="none" stroke={C.crimson} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={c1} />}
                  {i === 1 && x2 > 0 && <g transform="translate(95 -30) scale(0.55)"><Cross x={0} y={0} p={x2} /></g>}
                  {i === 2 && x3 > 0 && <g transform="translate(70 -30) scale(0.55)"><Cross x={0} y={0} p={x3} /></g>}
                </g>
              ))}
            </g>
          )}

          {/* red means we need help, not someone failed */}
          <Stick x={725} y={630} h={260} pose={manPose} opacity={man} />
          {rowA > 0 && (
            <g opacity={rowA}>
              <Dot x={568} y={225} r={24} kind="red" />
              <MiniTag x={568} y={263} text="RED" size={13} />
              <text x={614} y={236} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={36} fill={C.ink}>
                =
              </text>
              <Tag x={745} y={225} text="NEED HELP" size={24} />
            </g>
          )}
          {rowB > 0 && (
            <g opacity={rowB}>
              <Dot x={568} y={312} r={24} kind="red" />
              <MiniTag x={568} y={350} text="RED" size={13} />
              <text x={614} y={323} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={36} fill={C.ink}>
                =
              </text>
              <g>
                <rect x={642} y={290} width={236} height={44} rx={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
                <text x={760} y={319} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={19} letterSpacing={2.5} fill={C.ink}>
                  SOMEONE FAILED
                </text>
              </g>
              {crossB > 0 && <line x1={650} y1={312} x2={870} y2={312} stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeDasharray={220} strokeDashoffset={220 * (1 - crossB)} />}
            </g>
          )}
        </g>
      )}

      {/* 6: messier, more useful */}
      {s6 > 0 && (
        <g opacity={s6}>
          <Panel x={150} y={130} w={500} h={490} />
          <line x1={185} y1={175} x2={400} y2={175} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
          {shield > 0 && (
            <g transform={`translate(590 182)`} opacity={shield}>
              <Shield s={0.7 * shield} />
              <path d="M -13 2 L -3 14 L 15 -12" fill="none" stroke={C.crimson} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" transform={`scale(${shield * 0.7})`} />
            </g>
          )}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const y = 240 + i * 58;
            const rk = rowKind(i);
            const p = rk.at === 0 ? 0 : prog(t, rk.at, 0.35, bounce);
            const note = rk.at === 0 ? 0 : prog(t, rk.at + 0.15, 0.5, lin);
            return (
              <g key={i}>
                <Dot x={215} y={y} r={20} kind="green" />
                {p > 0 && <Dot x={215} y={y} r={20} kind={rk.kind} scale={Math.min(1.15, 0.6 + p * 0.5)} />}
                <line x1={260} y1={y - 6} x2={500 - (i % 3) * 30} y2={y - 6} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
                <line x1={260} y1={y + 12} x2={440 - (i % 2) * 40} y2={y + 12} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
                {note > 0 && i % 2 === 0 && <Mark d={`M 470 ${y + 16} q 12 -22 22 0 q 12 22 22 0 q 12 -22 22 0 q 10 20 20 2`} p={note} len={140} />}
                {note > 0 && i % 2 === 1 && <Mark d={`M 520 ${y - 18} q 22 -2 30 14 q -6 22 -34 14`} p={note} len={110} color={C.crimson} />}
              </g>
            );
          })}
          {prog(t, q.messier, 0.5, lin) > 0 && (
            <g>
              <Mark d="M 575 300 L 620 292" p={prog(t, q.messier, 0.4, lin)} len={60} />
              <Mark d="M 585 410 q 14 -26 28 0 q 12 24 24 -2" p={prog(t, q.messier + 0.3, 0.4, lin)} len={90} />
              <Mark d="M 560 520 L 625 540 M 560 540 L 625 520" p={prog(t, q.messier + 0.5, 0.4, lin)} len={160} color={C.crimson} />
            </g>
          )}
          <g opacity={gaugeIn}>
            {([['red', 'RED', 230], ['yellow', 'YELLOW', 360], ['green', 'GREEN', 510]] as const).map(([k, label, lx]) => (
              <g key={label}>
                <Dot x={lx - 38} y={594} r={10} kind={k} />
                <MiniTag x={lx + 10} y={594} text={label} size={12} />
              </g>
            ))}
          </g>
          {gaugeIn > 0 && <Gauge x={770} y={560} h={360} level={level} limit={0.55} opacity={gaugeIn} label="USEFUL" />}
        </g>
      )}

      {/* 7: which question first */}
      {s7 > 0 && (
        <g opacity={s7}>
          {[
            {x: 250, label: 'WHO WROTE IT', icon: <Pencil s={0.95} />},
            {x: 500, label: 'WHAT CHANGED', icon: <g><Dot x={-34} y={0} r={20} kind="yellow" /><Dot x={38} y={0} r={20} kind="green" /><path d="M -8 0 L 10 0 M 4 -8 L 12 0 L 4 8" {...line} strokeWidth={5} /></g>},
            {x: 750, label: 'TEAM LIST', icon: <g><g transform="translate(-52 6)"><SheetIcon s={0.5} /></g><g transform="translate(0 6)"><NotebookIcon s={0.5} /></g><g transform="translate(52 6)"><CommentIcon s={0.3} /></g></g>},
          ].map((c, i) => {
            const on = showFocus && focus % 3 === i;
            return (
              <g key={i} transform={`translate(${c.x} 330) scale(${(0.8 + 0.2 * cardsIn[i]) * (on ? 1.05 : 1)})`} opacity={Math.min(1, cardsIn[i] * 2)}>
                <rect x={-112} y={-122} width={224} height={252} rx={22} fill="#FFFFFF" stroke={on ? C.crimson : C.ink} strokeWidth={on ? 8 : 5} />
                <circle cx={0} cy={-82} r={24} fill={C.ink} />
                <text y={-72} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} fill="#FFFFFF">
                  {i + 1}
                </text>
                <g transform="translate(0 6)">{c.icon}</g>
                <text y={96} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={21} letterSpacing={1.5} fill={C.ink}>
                  {c.label}
                </text>
              </g>
            );
          })}
          {bigQ > 0 && (
            <text x={500} y={205} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={120 * bigQ} fill={C.ink} opacity={bigQ}>
              ?
            </text>
          )}
        </g>
      )}

      {/* end card */}
      {ctaOn > 0 && (
        <g opacity={ctaOn}>
          <FollowIcon x={500} y={250} s={1.35 * ctaOn} />
          <Bell x={500} y={420} s={1.5 * ctaOn} ring={Math.max(0, t - q.cta - 0.4)} />
          <Tag x={500} y={560} text="FOLLOW AND SUBSCRIBE" size={32} />
        </g>
      )}
    </g>
  );
};
