import React from 'react';
import {Stick, STAND, mix, type Pose} from './figure';
import {Panel, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon, Shield, Bulb} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Where Red Turns Green". One item travels up a three-level tower (the team, the managers, the
 * readers of the report). Its status dot softens at each rung, so the report reads green while the team below is
 * tired. Then the exercise: the team's own list beside the report, one item followed across, a marker where it
 * changed and a question mark for who changed it.
 *
 * Status encoding (no green or yellow in the palette; every dot also carries a tiny RED / YELLOW / GREEN tag):
 *   RED    = solid crimson dot
 *   YELLOW = crimson outline, left half filled crimson, right half white
 *   GREEN  = black outline with a black check mark
 * `t` is seconds into the voiceover, `q` the cue times from content/red-turns-green.stick.json.
 */
const FL = {top: 240, mid: 455, bot: 665}; // floor lines (feet)
const LX = 240; // ladder x
const DY = {bot: 585, mid: 375, top: 160}; // where the item dot sits at each level
const H = 150; // figure height in the tower
const CARD = {x: 296, y: 78, w: 170, h: 148}; // the report card on the top floor
const CARD_DOT = {x: 381, y: 151};

const cl = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const P = (o: Partial<Pose> = {}): Pose => ({...STAND, ...o});
const dotName = (s: number) => (s < 0.5 ? 'RED' : s < 1.5 ? 'YELLOW' : 'GREEN');

/** A status dot. s = 0 red, 1 yellow, 2 green (in between, it cross-fades). */
const Dot: React.FC<{x: number; y: number; r?: number; s: number; sw?: number; opacity?: number; scale?: number}> = ({x, y, r = 28, s, sw = 6, opacity = 1, scale = 1}) => {
  const a = cl(s);
  const b = cl(s - 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <circle r={r} fill="#FFFFFF" />
      <circle r={r} fill={C.crimson} opacity={1 - a} />
      <path d={`M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} Z`} fill={C.crimson} opacity={1 - b} />
      <circle r={r} fill="none" stroke={C.crimson} strokeWidth={sw} opacity={1 - b} />
      <circle r={r} fill="none" stroke={C.ink} strokeWidth={sw} opacity={b} />
      <path d={`M ${-r * 0.42} ${r * 0.04} L ${-r * 0.1} ${r * 0.36} L ${r * 0.46} ${-r * 0.34}`} fill="none" stroke={C.ink} strokeWidth={sw + 0.5} strokeLinecap="round" strokeLinejoin="round" opacity={b} />
    </g>
  );
};

/** A tiny label so the status reads without color. */
const MiniTag: React.FC<{x: number; y: number; text: string; opacity?: number; size?: number}> = ({x, y, text, opacity = 1, size = 17}) => {
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

const Ring: React.FC<{x: number; y: number; w: number; h: number; p: number; color?: string}> = ({x, y, w, h, p, color = C.ink}) =>
  p > 0 && p < 1 ? <rect x={x - w / 2 - 30 * p} y={y - h / 2 - 20 * p} width={w + 60 * p} height={h + 40 * p} rx={40} fill="none" stroke={color} strokeWidth={5} opacity={1 - p} /> : null;

const Rocket: React.FC<{x: number; y: number; flame: number}> = ({x, y, flame}) => (
  <g transform={`translate(${x} ${y})`}>
    {flame > 0 && (
      <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={flame}>
        <line x1={0} y1={44} x2={0} y2={44 + 26 * flame} />
        <line x1={-10} y1={42} x2={-12} y2={42 + 16 * flame} />
        <line x1={10} y1={42} x2={12} y2={42 + 16 * flame} />
      </g>
    )}
    <path d="M -16 14 L -34 42 L -14 34 Z M 16 14 L 34 42 L 14 34 Z" fill={C.soft} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 0 -62 C 24 -40 24 8 15 36 L -15 36 C -24 8 -24 -40 0 -62 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5.5} strokeLinejoin="round" />
    <circle cx={0} cy={-18} r={8} fill="none" stroke={C.ink} strokeWidth={4.5} />
  </g>
);

const Calendar: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <rect x={-52} y={-46} width={104} height={92} rx={14} fill="#FFFFFF" stroke={C.ink} strokeWidth={5.5} />
    <line x1={-52} y1={-16} x2={52} y2={-16} stroke={C.ink} strokeWidth={5.5} />
    <path d="M -26 -58 L -26 -34 M 26 -58 L 26 -34" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    {[-30, -10, 10].map((dx) => [8, 28].map((dy) => <rect key={`${dx}${dy}`} x={dx - 8} y={dy - 7} width={16} height={14} rx={3} fill={dx === 10 && dy === 28 ? C.crimson : C.soft} />))}
  </g>
);

/** One row of a list: a status dot, its tiny tag and a grey line of "text". */
const Row: React.FC<{x: number; y: number; w: number; s: number; opacity?: number}> = ({x, y, w, s, opacity = 1}) => (
  <g opacity={opacity}>
    <Dot x={x + 44} y={y} r={19} s={s} sw={5} />
    <text x={x + 78} y={y + 3} fontFamily={SANS} fontWeight={700} fontSize={18} letterSpacing={2} fill={C.ink}>
      {dotName(s)}
    </text>
    <line x1={x + 78} y1={y + 22} x2={x + w - 34} y2={y + 22} stroke={C.soft} strokeWidth={7} strokeLinecap="round" />
  </g>
);

export const RedGreenStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ============================ 1 to 3: the tower ============================
  const towerOut = 1 - prog(t, 35.95, 0.3, (v) => v);
  const tiredK = prog(t, q.tired - 0.2, 0.7);
  const typing = (k: number) => Math.sin(t * 7 + k);
  const working = (k: number): Pose => P({lh: [-0.11, 0.1 + 0.04 * typing(k)], rh: [0.11, 0.1 + 0.04 * typing(k + 2)]});
  const slumped = (k: number): Pose => P({lh: [-0.07, 0.31], rh: [0.07, 0.31], lean: 0.1 + 0.008 * Math.sin(t * 1.6 + k), crouch: 0.13, mood: 'flat'});
  const team = (k: number) => mix(working(k), slumped(k), tiredK);

  // the report card and its dot
  const repIn = prog(t, q.reportGreen, 0.45, bounce);
  const bothA = (t - q.both) / 0.7;
  const bothB = (t - q.canWord - 0.3) / 0.7;
  const readA = (t - q.readers) / 0.7;

  // scene 1: the unknown band and the dot that climbs through it
  const bandOn = between(t, q.unknown, q.argyris - 0.4, 0.35);
  const dot1In = prog(t, q.colorWord, 0.3);
  const climb1 = prog(t, q.climb, 1.25, (v) => v * v * (3 - 2 * v));
  const slide1 = prog(t, q.climb + 1.25, 0.55);
  const dot1Y = lerp(DY.bot, DY.top, climb1);
  const dot1S = cl((460 - dot1Y) / 170) * 2;
  const dot1X = lerp(LX, CARD_DOT.x, slide1);
  const dot1Yy = lerp(dot1Y, CARD_DOT.y, slide1);
  const dot1Out = 1 - prog(t, q.reportWord + 0.2, 0.2);
  const cardPulse = (t - (q.reportWord + 0.15)) / 0.6;

  // scene 2: Argyris, the shield, embarrassment, the problem that cannot rise
  const shieldIn = prog(t, q.routines, 0.5, bounce) * (1 - prog(t, q.redWord + 0.1, 0.35));
  const tagA = between(t, q.argyris + 0.25, q.routines - 0.05, 0.25);
  const tagB = between(t, q.routines + 0.05, q.redWord - 0.1, 0.3);
  const orgIn = prog(t, q.orgAct, 0.4, bounce);
  const orgIn2 = prog(t, q.orgAct + 0.5, 0.4, bounce);
  const hide = prog(t, q.avoid, 0.4);
  const bulbIn = prog(t, q.keep, 0.45, bounce) * (1 - prog(t, q.redWord + 0.1, 0.35));
  const bulbDim = prog(t, q.problem + 0.1, 0.35);
  const crossP = prog(t, q.problem + 0.15, 0.4, (v) => v);
  // the item dot (problem, then the climb with the softening)
  const d2In = prog(t, q.learning, 0.3);
  const rise2 = prog(t, q.learning + 0.55, 0.7, (v) => v * v);
  const fall2 = prog(t, q.problem + 0.1, 0.5, (v) => v * v * (3 - 2 * v));
  const up1 = prog(t, q.softened, 0.95, (v) => v * v * (3 - 2 * v));
  const up2 = prog(t, q.becomes - 0.3, 1.0, (v) => v * v * (3 - 2 * v));
  const hit = 484; // y where the dot meets the shield
  const d2Y = t < q.softened ? lerp(lerp(DY.bot, hit, rise2), DY.bot, fall2) : t < q.becomes - 0.3 ? lerp(DY.bot, DY.mid, up1) : lerp(DY.mid, DY.top, up2);
  const d2S = t < q.becomes - 0.3 ? prog(t, q.softened + 0.2, 0.75) : 1 + prog(t, q.greenWord - 0.1, 0.45);
  const grab = between(t, q.softened - 0.1, q.yellowWord + 0.4, 0.2);
  const squash = 1 - 0.18 * Math.sin(prog(t, q.yellowWord - 0.1, 0.4, (v) => v) * Math.PI);
  const slide2 = prog(t, q.greenWord + 0.55, 0.55);
  const d2X = lerp(LX, CARD_DOT.x, slide2) + 16 * grab;
  const d2Yy = lerp(d2Y, CARD_DOT.y, slide2);
  const d2Out = 1 - prog(t, q.greenWord + 1.25, 0.2);
  const cardPulse2 = (t - (q.greenWord + 1.1)) / 0.6;
  const calIn = prog(t, q.meeting, 0.45, bounce) * (1 - prog(t, 35.9, 0.3));
  const tomorrowTag = prog(t, q.tomorrow, 0.35, bounce) * (1 - prog(t, 35.9, 0.3));
  const seniorIn = prog(t, 30.85, 0.4, bounce);
  const hesitate = prog(t, q.greenWord + 0.85, 0.5) * (1 - prog(t, q.spoils, 0.35));
  const sad = t > q.greenWord + 0.85 && t < q.launch + 0.2;
  const rocketLift = prog(t, q.launch, 0.9, (v) => v * v);
  const flame = prog(t, q.launch, 0.25, (v) => v) * (1 - prog(t, q.launch + 0.85, 0.2));

  // ============================ 3b: each step is reasonable ============================
  const recapOn = prog(t, q.each - 0.05, 0.1, (v) => v) * (1 - prog(t, 41.7, 0.25));
  const rd = [prog(t, q.each, 0.4, bounce), prog(t, q.feels, 0.4, bounce), prog(t, q.reasonable, 0.4, bounce)];
  const ck = [prog(t, q.feels + 0.15, 0.35, bounce), prog(t, q.reasonable + 0.15, 0.35, bounce)];

  // ============================ 4a: the lens ============================
  const lensP = prog(t, q.spot, 1.5, (v) => v);
  const lensOn = prog(t, q.spot, 0.25) * (1 - prog(t, 41.5, 0.25));
  const exTag = prog(t, q.exercise, 0.35, bounce);

  // ============================ 4b: the two lists ============================
  const docsOn = prog(t, q.ask - 0.05, 0.1, (v) => v) * (1 - prog(t, q.cta - 0.18, 0.15, (v) => v));
  const listIn = prog(t, q.list - 0.1, 0.55);
  const repDocIn = prog(t, q.reportDoc - 0.1, 0.55);
  const rowsL = [2, 0, 2, 2];
  const rowsR = [2, 2, 2, 2];
  const rowY = (i: number) => 211 + 72 * i;
  const DOCS = {l: {x: 140, y: 135, w: 260, h: 345}, r: {x: 600, y: 135, w: 260, h: 345}};
  const hl = prog(t, q.single, 0.35, bounce);
  const lineP = prog(t, q.fromOne, q.other + 0.1 - q.fromOne, (v) => v);
  const riderS = cl((lineP - 0.25) / 0.5) * 2;
  const riderX = 404 + 192 * lineP;
  const riderOn = prog(t, q.fromOne - 0.05, 0.15) * (1 - prog(t, q.other + 0.55, 0.25));
  const pin = prog(t, q.change, 0.45, bounce);
  const pinRing = (t - q.change - 0.1) / 0.7;
  const whoFig = prog(t, q.who, 0.4);
  const qMark = prog(t, q.changed, 0.4, bounce);
  const leftFigIn = prog(t, q.list, 0.4);
  const rightFigIn = prog(t, q.reportDoc, 0.4);
  const offer = (p: number): Pose => P({rh: [0.12, 0.27 - 0.5 * p], lh: [-0.12, 0.27 - 0.5 * p], lean: 0.01});

  // ============================ 5: end card ============================
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  return (
    <g>
      {/* ---- the tower (scenes 1 to 3) ---- */}
      {towerOut > 0 && (
        <g opacity={towerOut}>
          {/* ladder */}
          <g stroke={C.mid} strokeWidth={6} strokeLinecap="round">
            <line x1={LX - 24} y1={118} x2={LX - 24} y2={FL.bot} />
            <line x1={LX + 24} y1={118} x2={LX + 24} y2={FL.bot} />
            {Array.from({length: 15}, (_, i) => 150 + i * 36).map((yy) => (
              <line key={yy} x1={LX - 24} y1={yy} x2={LX + 24} y2={yy} />
            ))}
          </g>
          {/* the unknown band, scene 1 */}
          {bandOn > 0 && (
            <g opacity={bandOn}>
              <rect x={186} y={272} width={660} height={176} rx={30} fill="none" stroke={C.crimson} strokeWidth={6} strokeDasharray="16 12" />
              <text x={560} y={405} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={130} fill={C.crimson}>
                ?
              </text>
            </g>
          )}
          {/* floors */}
          {[FL.top, FL.mid, FL.bot].map((f) => (
            <rect key={f} x={176} y={f + 3} width={668} height={18} rx={9} fill={C.soft} stroke={C.ink} strokeWidth={5} />
          ))}

          {/* the report on the top floor */}
          <g>
            <path d={`M ${CARD.x + 36} ${CARD.y + CARD.h} L ${CARD.x + 30} ${FL.top + 3} M ${CARD.x + CARD.w - 36} ${CARD.y + CARD.h} L ${CARD.x + CARD.w - 30} ${FL.top + 3}`} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={16} fill="#FFFFFF" stroke={C.ink} strokeWidth={5.5} />
            <line x1={CARD.x + 26} y1={CARD.y + 24} x2={CARD.x + CARD.w - 26} y2={CARD.y + 24} stroke={C.soft} strokeWidth={8} strokeLinecap="round" />
            {repIn <= 0 && <circle cx={CARD_DOT.x} cy={CARD_DOT.y} r={26} fill="none" stroke={C.mid} strokeWidth={5} strokeDasharray="8 8" />}
            {repIn > 0 && <Dot x={CARD_DOT.x} y={CARD_DOT.y} s={2} scale={repIn} />}
            {repIn > 0 && <MiniTag x={CARD_DOT.x} y={CARD.y + CARD.h - 22} text="GREEN" opacity={cl(repIn)} />}
            {bothA > 0 && bothA < 1 && <circle cx={CARD_DOT.x} cy={CARD_DOT.y} r={28 + 34 * bothA} fill="none" stroke={C.ink} strokeWidth={5} opacity={1 - bothA} />}
            {cardPulse > 0 && cardPulse < 1 && <circle cx={CARD_DOT.x} cy={CARD_DOT.y} r={28 + 30 * cardPulse} fill="none" stroke={C.ink} strokeWidth={5} opacity={1 - cardPulse} />}
            {cardPulse2 > 0 && cardPulse2 < 1 && <circle cx={CARD_DOT.x} cy={CARD_DOT.y} r={28 + 30 * cardPulse2} fill="none" stroke={C.ink} strokeWidth={5} opacity={1 - cardPulse2} />}
          </g>

          {/* top floor: the reader, then the one who passes it up, and the launch */}
          <Stick x={590} y={FL.top} h={H} pose={P({lh: [-0.2, -0.06], rh: [0.17, 0.27]})} />
          <Ring x={(CARD.x + 640) / 2} y={140} w={CARD.w + 290} h={170} p={Math.min(readA, 1)} />
          {seniorIn > 0 && (
            <g opacity={cl(seniorIn)}>
              <Stick x={712} y={FL.top} h={H} hair="bun" pose={P({rh: [0.12 + 0.1 * hesitate, 0.27 - 0.5 * hesitate], mood: sad ? 'sad' : 'smile'})} />
              {hesitate > 0.05 && (
                <g opacity={hesitate}>
                  {[0, 1, 2].map((k) => (
                    <circle key={k} cx={756 + k * 20} cy={132 - 6 * k} r={6 + k * 1.5} fill="none" stroke={C.ink} strokeWidth={4} />
                  ))}
                </g>
              )}
            </g>
          )}
          {seniorIn > 0 && (
            <g opacity={cl(seniorIn) * (1 - prog(t, q.launch + 0.7, 0.25))}>
              <Rocket x={812} y={FL.top - 58 - 70 * rocketLift} flame={flame} />
            </g>
          )}
          {bulbIn > 0 && (
            <g transform={`translate(715 170) scale(${bulbIn})`} opacity={1 - 0.65 * bulbDim}>
              <Bulb s={1} />
              {crossP > 0 && (
                <g transform="translate(34 28)">
                  <circle r={22} fill="#FFFFFF" stroke={C.crimson} strokeWidth={6} />
                  <path d="M -9 -9 L 9 9 M 9 -9 L -9 9" stroke={C.crimson} strokeWidth={7} strokeLinecap="round" strokeDasharray={30} strokeDashoffset={30 * (1 - crossP)} />
                </g>
              )}
            </g>
          )}

          {/* middle floor: the managers */}
          {orgIn > 0 && (
            <g opacity={cl(orgIn)}>
              <Stick x={352} y={FL.mid} h={H} pose={P({lh: grab > 0.5 ? [-0.27, 0.0] : [-0.17, 0.27], rh: [0.17, 0.27], mood: 'smile'})} />
            </g>
          )}
          {orgIn2 > 0 && (
            <g opacity={cl(orgIn2)}>
              <Stick
                x={474}
                y={FL.mid}
                h={H}
                hair="long"
                pose={mix(P({}), P({lh: [0.03, -0.17], rh: [-0.03, -0.17], mood: 'sad', lean: 0.02}), hide * (1 - prog(t, q.redWord, 0.3)))}
              />
            </g>
          )}
          {shieldIn > 0 && (
            <g transform={`translate(${LX} ${FL.mid - 78}) scale(${1.3 * shieldIn})`} opacity={cl(shieldIn)}>
              <Shield s={1} />
            </g>
          )}
          {tagA > 0 && <Tag x={680} y={345} text="ARGYRIS" size={24} opacity={tagA} />}
          {tagB > 0 && <Tag x={675} y={345} text="DEFENSIVE ROUTINES" size={20} opacity={tagB} />}
          {calIn > 0 && (
            <g>
              <Calendar x={660} y={345} s={calIn} opacity={cl(calIn)} />
              {tomorrowTag > 0 && <Tag x={660} y={424} text="TOMORROW" size={20} opacity={cl(tomorrowTag)} />}
            </g>
          )}

          {/* bottom floor: the team */}
          <Stick x={410} y={FL.bot} h={H} hair="bob" pose={team(0)} />
          <Stick x={540} y={FL.bot} h={H} pose={team(1.7)} />
          <Stick x={670} y={FL.bot} h={H} hair="ponytail" pose={team(3.1)} />
          <MiniTag x={792} y={FL.bot - 80} text="TIRED" size={20} opacity={prog(t, q.tired, 0.35, bounce) > 0 ? cl(prog(t, q.tired, 0.35, bounce)) : 0} />
          {bothB > 0 && bothB < 1 && <rect x={355 - 30 * bothB} y={490 - 20 * bothB} width={370 + 60 * bothB} height={185 + 40 * bothB} rx={40} fill="none" stroke={C.ink} strokeWidth={5} opacity={1 - bothB} />}
          <Ring x={540} y={590} w={370} h={185} p={Math.min(Math.max((t - q.workers) / 0.7, 0), 1)} />

          {/* the item dot: scene 1 trip */}
          {dot1In > 0 && dot1Out > 0 && (
            <g opacity={dot1In * dot1Out}>
              <Dot x={dot1X} y={dot1Yy} s={dot1S} />
              {slide1 < 0.05 && <MiniTag x={dot1X} y={dot1Y - 46} text={dotName(dot1S)} />}
            </g>
          )}
          {/* the item dot: scenes 2 and 3 */}
          {d2In > 0 && d2Out > 0 && (
            <g opacity={d2In * d2Out}>
              <Dot x={d2X} y={d2Yy} s={d2S} scale={squash} />
              {slide2 < 0.05 && <MiniTag x={d2X} y={d2Yy - 46} text={dotName(d2S)} />}
            </g>
          )}
        </g>
      )}

      {/* ---- each step is reasonable on its own ---- */}
      {recapOn > 0 && (
        <g opacity={recapOn} transform="translate(0 30)">
          {[250, 500, 750].map((x, i) => (
            <g key={x} transform={`translate(${x} 350) scale(${rd[i]})`} opacity={cl(rd[i])}>
              <Dot x={0} y={0} r={62} s={i} sw={9} />
            </g>
          ))}
          {[250, 500, 750].map((x, i) => (
            <MiniTag key={x} x={x} y={462} text={['RED', 'YELLOW', 'GREEN'][i]} size={25} opacity={cl(rd[i])} />
          ))}
          {[375, 625].map((x, i) => (
            <g key={x} opacity={cl(ck[i])}>
              <path d={`M ${x - 42} 350 L ${x + 42} 350 M ${x + 24} 332 L ${x + 44} 350 L ${x + 24} 368`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              <g transform={`translate(${x} 270) scale(${ck[i]})`}>
                <circle r={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
                <path d="M -9 1 L -3 8 L 10 -8" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          ))}
          {lensOn > 0 && (
            <g opacity={lensOn} transform={`translate(${lerp(230, 770, lensP)} ${350 + Math.sin(lensP * 6) * 10}) rotate(-10)`}>
              <circle r={74} fill="none" stroke={C.ink} strokeWidth={9} />
              <line x1={52} y1={52} x2={108} y2={108} stroke={C.ink} strokeWidth={13} strokeLinecap="round" />
            </g>
          )}
          {exTag > 0 && <Tag x={500} y={590} text="ONE EXERCISE" size={36} opacity={cl(exTag)} />}
        </g>
      )}

      {/* ---- the exercise: two lists, one item followed across ---- */}
      {docsOn > 0 && (
        <g opacity={docsOn} transform="translate(0 8)">
          {listIn > 0 && (
            <g transform={`translate(${-70 * (1 - listIn)} 0)`} opacity={listIn}>
              <Panel x={DOCS.l.x} y={DOCS.l.y} w={DOCS.l.w} h={DOCS.l.h} />
              {rowsL.map((s, i) => (
                <Row key={i} x={DOCS.l.x} y={rowY(i)} w={DOCS.l.w} s={s} />
              ))}
              <Tag x={DOCS.l.x + DOCS.l.w / 2} y={DOCS.l.y} text="TEAM'S LIST" size={21} />
              {hl > 0 && <rect x={DOCS.l.x + 14} y={rowY(1) - 31} width={DOCS.l.w - 28} height={64} rx={18} fill="none" stroke={C.crimson} strokeWidth={5} opacity={cl(hl)} />}
            </g>
          )}
          {repDocIn > 0 && (
            <g transform={`translate(${70 * (1 - repDocIn)} 0)`} opacity={repDocIn}>
              <Panel x={DOCS.r.x} y={DOCS.r.y} w={DOCS.r.w} h={DOCS.r.h} />
              {rowsR.map((s, i) => (
                <Row key={i} x={DOCS.r.x} y={rowY(i)} w={DOCS.r.w} s={s} />
              ))}
              <Tag x={DOCS.r.x + DOCS.r.w / 2} y={DOCS.r.y} text="REPORT" size={21} />
              {hl > 0 && <rect x={DOCS.r.x + 14} y={rowY(1) - 31} width={DOCS.r.w - 28} height={64} rx={18} fill="none" stroke={C.crimson} strokeWidth={5} opacity={cl(hl)} />}
            </g>
          )}
          {/* the line that follows the item */}
          {lineP > 0 && (
            <g>
              <line x1={DOCS.l.x + DOCS.l.w - 14} y1={rowY(1)} x2={DOCS.r.x + 14} y2={rowY(1)} stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeDasharray="212" strokeDashoffset={212 * (1 - lineP)} />
              {riderOn > 0 && <Dot x={riderX} y={rowY(1)} r={19} s={riderS} sw={5} opacity={riderOn} />}
            </g>
          )}
          {/* where it changed */}
          {pin > 0 && (
            <g>
              {pinRing > 0 && pinRing < 1 && <circle cx={500} cy={rowY(1)} r={16 + 44 * pinRing} fill="none" stroke={C.crimson} strokeWidth={5} opacity={1 - pinRing} />}
              <g transform={`translate(500 ${rowY(1) - 6 - 40 * (1 - pin)}) scale(${cl(pin)})`} opacity={cl(pin)}>
                <path d="M 0 0 C -6 -16 -28 -32 -28 -56 A 28 28 0 1 1 28 -56 C 28 -32 6 -16 0 0 Z" fill={C.crimson} />
                <circle cx={0} cy={-56} r={10} fill="#FFFFFF" />
              </g>
            </g>
          )}
          {/* who changed it */}
          {whoFig > 0 && <Stick x={500} y={672} h={H} pose={P({mood: 'flat', lh: [-0.12, 0.28], rh: [0.12, 0.28]})} opacity={0.32 * whoFig} />}
          {qMark > 0 && (
            <text x={500} y={510} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={150} fill={C.ink} opacity={cl(qMark)} transform={`translate(0 ${(1 - cl(qMark)) * 20})`}>
              ?
            </text>
          )}
          {leftFigIn > 0 && <Stick x={270} y={672} h={125} hair="long" pose={offer(listIn)} opacity={leftFigIn} />}
          {rightFigIn > 0 && <Stick x={730} y={672} h={125} pose={offer(repDocIn)} opacity={rightFigIn} />}
        </g>
      )}

      {/* ---- end card ---- */}
      {ctaOn > 0 && (
        <g opacity={cl(ctaOn)}>
          <FollowIcon x={500} y={250} s={1.45 * ctaOn} />
          <Bell x={500} y={430} s={1.5 * ctaOn} ring={prog(t, q.cta + 0.4, 1.4, (v) => v)} />
          <Tag x={500} y={590} text="FOLLOW AND SUBSCRIBE" size={32} />
        </g>
      )}
    </g>
  );
};
