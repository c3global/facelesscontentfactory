import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Cross, Dots, Panel, Tag, Window, C, SANS, bounce, prog} from './kit';
import {Book, Bell, FollowIcon} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "More Than You Can Tell". An iceberg carries the argument: above the waterline is what you can
 * explain (a book, a course, a transcript); below it is what you notice and what you do next (an eye, a pause, a
 * turn). An unbranded app reads only the tip. Two small cutaways (a face in a crowd, a coach sensing a shift)
 * and a closing "someone sits down" scene. `t` is seconds into the voiceover, `q` the cue times from
 * content/more-than-you-can-tell.stick.json.
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
/** 1 between a and b, linear fades of f seconds (the fade-out starts at b). */
const win = (t: number, a: number, b: number, f = 0.25) => prog(t, a, f, lin) * (1 - prog(t, b, f, lin));
const pulse = (t: number, a: number, d = 0.45, amp = 0.22) => 1 + amp * Math.sin(Math.min(1, Math.max(0, (t - a) / d)) * Math.PI);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const quad = (p0: [number, number], c: [number, number], p1: [number, number], u: number): [number, number] => [
  (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0],
  (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1],
];

// ---------------------------------------------------------------- small icons (local)
const Sheet: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}>
    <rect x={-30} y={-39} width={60} height={78} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <path d="M -16 -16 L 16 -16 M -16 2 L 16 2 M -16 20 L 4 20" stroke={C.soft} strokeWidth={7} strokeLinecap="round" />
  </g>
);
const Course: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}>
    <rect x={-40} y={-30} width={80} height={58} rx={10} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    <path d="M -10 -15 L 16 -1 L -10 13 Z" fill={C.ink} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -22 40 L 22 40" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
  </g>
);
const Transcript: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}>
    <rect x={-30} y={-39} width={60} height={78} rx={8} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
    {[-18, 0, 18].map((y) => (
      <g key={y}>
        <circle cx={-17} cy={y} r={4} fill={C.ink} />
        <line x1={-6} y1={y} x2={18} y2={y} stroke={C.soft} strokeWidth={7} strokeLinecap="round" />
      </g>
    ))}
  </g>
);
const Eye: React.FC<{s?: number; color?: string}> = ({s = 1, color = C.crimson}) => (
  <g transform={`scale(${s})`}>
    <path d="M -42 0 Q 0 -38 42 0 Q 0 38 -42 0 Z" fill="#FFFFFF" stroke={color} strokeWidth={6} strokeLinejoin="round" />
    <circle r={14} fill={color} />
    <circle cx={-4} cy={-5} r={4} fill="#FFFFFF" />
  </g>
);
const PauseMark: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}>
    <rect x={-15} y={-17} width={10} height={34} rx={4} fill={C.crimson} />
    <rect x={5} y={-17} width={10} height={34} rx={4} fill={C.crimson} />
  </g>
);
const TurnArrow: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`} fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M -22 24 L -22 -4 Q -22 -22 -4 -22 L 22 -22" />
    <path d="M 8 -38 L 26 -22 L 8 -6" />
  </g>
);
const Badge: React.FC<{x: number; y: number; p: number; boost?: number; children: React.ReactNode}> = ({x, y, p, boost = 1, children}) => (
  <g transform={`translate(${x} ${y}) scale(${p * boost})`} opacity={Math.min(1, p * 2.5)}>
    <circle r={47} fill="#FFFFFF" stroke={C.crimson} strokeWidth={6} />
    {children}
  </g>
);
const Face: React.FC<{x: number; y: number; r?: number; s?: number; opacity?: number; ring?: number}> = ({x, y, r = 34, s = 1, opacity = 1, ring = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    {ring > 0 && <circle r={(r + 15) * ring} fill="none" stroke={C.crimson} strokeWidth={7} opacity={Math.min(1, ring * 2)} />}
    <circle r={r} fill="#FFFFFF" stroke={C.cast} strokeWidth={6} />
    <circle cx={-r * 0.36} cy={-r * 0.1} r={3.6} fill={C.cast} />
    <circle cx={r * 0.36} cy={-r * 0.1} r={3.6} fill={C.cast} />
    <path d={`M ${-r * 0.3} ${r * 0.3} Q 0 ${r * 0.55} ${r * 0.3} ${r * 0.3}`} fill="none" stroke={C.cast} strokeWidth={4} strokeLinecap="round" />
  </g>
);

/** An unbranded app: a window with a few lines inside. `fill` (0..1) writes the lines in. */
const AppWin: React.FC<{x: number; y: number; w: number; h: number; fill?: number; opacity?: number; scale?: number}> = ({x, y, w, h, fill = 1, opacity = 1, scale = 1}) => (
  <g opacity={opacity} transform={`translate(${x + w / 2} ${y + h / 2}) scale(${scale}) translate(${-(x + w / 2)} ${-(y + h / 2)})`}>
    <Window x={x} y={y} w={w} h={h} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={x + 28} y1={y + 94 + i * 26} x2={x + 28 + (w - 90) * Math.min(1, Math.max(0, fill * 3 - i)) * (i === 2 ? 0.6 : 1)} y2={y + 94 + i * 26} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
    ))}
  </g>
);

/** A chair seen from the front. Hips of a seated Stick land on the seat bar. */
const Seat: React.FC<{x: number; opacity?: number; dashed?: boolean}> = ({x, opacity = 1, dashed}) => (
  <g opacity={opacity} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '12 12' : undefined}>
    <rect x={x - 58} y={432} width={116} height={124} rx={14} fill="#FFFFFF" />
    <rect x={x - 76} y={556} width={152} height={26} rx={10} fill="#FFFFFF" />
    <path d={`M ${x - 60} 584 L ${x - 60} ${G} M ${x + 60} 584 L ${x + 60} ${G}`} />
  </g>
);

export const TacitStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ============================================================ scene windows
  const aOp = prog(t, q.helper - 0.1, 0.3, lin) * (1 - prog(t, 8.38, 0.4, lin));
  const ice1 = win(t, 8.38, 14.4, 0.3);
  const ice2 = win(t, 26.2, 44.85, 0.3);
  const iceOp = Math.max(ice1, ice2);
  const crowdOp = win(t, 14.7, 19.15, 0.25);
  const coachOp = win(t, 19.3, 26.15, 0.25);
  const s8 = prog(t, 44.95, 0.3, lin) * (1 - prog(t, 57.3, 0.12, lin));
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  // ============================================================ the sheets (written down): scene A stack, then the tip
  const sheetAt = [q.written, q.written + 0.34, q.down];
  const stack = [
    {x: 440, y: 585, r: -9},
    {x: 482, y: 576, r: 2},
    {x: 524, y: 586, r: 10},
  ];
  const TIPX = [356, 450, 544];
  const TIPY = 284;
  const realAt = [q.book, q.course, q.transcript];
  const sheetsOp = t < 20 ? 1 - prog(t, 14.35, 0.3, lin) : ice2;

  // ============================================================ iceberg pieces
  const subGrow = prog(t, q.know, 1.0);
  const subOutline = prog(t, q.lives, 0.5, lin);
  const waterIn = prog(t, 8.38, 0.5);
  const tipThick = 6 + 4 * prog(t, q.explain, 0.3);
  const eyeP = prog(t, q.notice, 0.45, bounce);
  const pauseP = prog(t, q.pause, 0.45, bounce);
  const turnP = prog(t, q.next, 0.45, bounce);
  const turnNudge = 12 * Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - q.move) / 1.6)) * Math.PI * 3));
  const eyeBoost = pulse(t, 43.9);
  const pauseBoost = pulse(t, 44.12);
  const turnBoost = pulse(t, q.move) * pulse(t, q.thinking);
  const iceBlob = 'M 270 330 L 630 330 L 680 366 L 740 430 L 705 520 L 632 590 L 530 650 L 410 645 L 300 595 L 215 505 L 185 425 L 225 365 Z';
  const tipPath = 'M 270 330 L 318 262 L 372 276 L 425 206 L 452 150 L 495 214 L 540 204 L 590 262 L 630 330 Z';
  const wave = `M 130 330 ${Array.from({length: 12}, (_, i) => `Q ${130 + i * 62 + 15} ${330 - 5} ${130 + i * 62 + 31} 330 T ${130 + (i + 1) * 62} 330`).join(' ')}`;

  // ============================================================ scene 7: the app reads the tip
  const appP = prog(t, q.appAgain, 0.45, bounce);
  const appFill = prog(t, q.sound - 0.4, 1.0, lin);
  const talkP = prog(t, q.sound, 0.4, bounce);
  const reachP = prog(t, q.miss - 0.4, 0.55, lin);
  const crossP = prog(t, q.miss + 0.25, 0.4);
  const tipIcons = [
    {at: 38.24, from: [356, 284] as [number, number], icon: <Book s={0.6} />},
    {at: 38.62, from: [450, 284] as [number, number], icon: <Course s={0.66} />},
    {at: 39.0, from: [544, 284] as [number, number], icon: <Transcript s={0.72} />},
  ];

  // ============================================================ scene A: you help people, you wrote some of it down, could an app do it?
  const clientP = prog(t, q.help, 0.35, bounce) * (1 - prog(t, q.clientOut, 0.3, lin));
  const helperPose = pose({
    rh: t > q.help && t < q.clientOut ? [0.22, -0.06] : t > q.job - 0.3 ? [0.2, -0.12] : [0.17, 0.27],
    look: t > q.app && t < 8.2 ? 1 : 0,
  });
  const clientPose = pose({mood: t < q.help + 0.55 ? 'sad' : 'smile', look: -1});
  const tally = [0, 1, 2, 3, 4].map((i) => prog(t, q.years + i * 0.28, 0.25, lin));
  const appA = prog(t, q.app, 0.45, bounce);
  const flowDots = [0, 1, 2].map((i) => prog(t, q.flow + i * 0.3, 0.85, lin));
  const fillA = prog(t, q.writing, 0.9, lin);
  const qMark = prog(t, q.job, 0.4, bounce);

  // ============================================================ scene 3: a face in a crowd
  const cols = [270, 385, 500, 615, 730];
  const rows = [180, 300, 420];
  const picked = {c: 3, r: 1};
  const panelP = prog(t, 14.8, 0.35, bounce);
  const pickIn = prog(t, q.recognize, 0.4, bounce);
  const ringP = prog(t, q.face, 0.35, bounce);
  const zoomOut = prog(t, q.crowd, 0.7);
  const listP = prog(t, q.listing, 0.4, bounce);
  const noList = prog(t, q.features, 0.4);

  // ============================================================ scene 4: the coach senses a shift
  const eyeCoach = prog(t, q.sense, 0.4, bounce);
  const arrowsIn = prog(t, q.conversation, 0.4, lin);
  const turn = prog(t, q.changed, 0.55, bounce);
  const noWords = prog(t, q.unsaid, 0.4, bounce);
  const arrow = (rest: {x: number; y: number; r: number}, now: {x: number; y: number; r: number}, k: number) => {
    const x = lerp(rest.x, now.x, turn);
    const y = lerp(rest.y, now.y, turn);
    const r = lerp(rest.r, now.r, turn);
    const col = turn > 0.35 ? C.crimson : C.ink;
    return (
      <g key={k} transform={`translate(${x} ${y}) rotate(${r})`} opacity={arrowsIn} fill="none" stroke={col} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
        <path d="M -78 0 L 76 0 M 54 -20 L 78 0 L 54 20" />
      </g>
    );
  };

  // ============================================================ scene 8: so before you build anything, ask yourself, what do you notice when someone sits down?
  const buildP = prog(t, q.build - 0.2, 1.1, lin);
  const buildOut = prog(t, q.ask - 0.1, 0.25, lin);
  const youP = prog(t, q.ask, 0.35, bounce) * (1 - prog(t, 49.05, 0.2, lin));
  const thinkP = prog(t, q.yourself, 0.35, bounce);
  const seatP = prog(t, 49.15, 0.35, lin);
  const eye2 = prog(t, q.notice2, 0.4, bounce) * (1 - prog(t, q.andHave - 0.1, 0.25, lin));
  const walk = prog(t, q.someone, 0.45, lin);
  const sit = prog(t, q.sits, 0.4, lin);
  const sitterX = lerp(960, 640, walk);
  const sitterPose = pose({
    lf: sit > 0 ? lerp(-0.07, -0.15, sit) : -0.07 + Math.sin(t * 15) * 0.07 * (walk < 1 ? 1 : 0),
    rf: sit > 0 ? lerp(0.07, 0.15, sit) : 0.07 + Math.sin(t * 15 + Math.PI) * 0.07 * (walk < 1 ? 1 : 0),
    crouch: sit,
    lh: [lerp(-0.17, -0.025, sit), lerp(0.27, 0.3, sit)],
    rh: [lerp(0.17, 0.025, sit), lerp(0.27, 0.3, sit)],
    mood: sit > 0.5 ? 'flat' : 'smile',
    look: -1,
  });
  const ringHands = prog(t, q.down2, 0.4, bounce);
  const sightP = prog(t, q.down2 - 0.1, 0.45, lin);
  const pageP = prog(t, q.andHave, 0.4, bounce);
  const writeP = prog(t, q.written2, 1.5, lin);
  const askMark = prog(t, q.it, 0.35, bounce);
  const youPose = pose({rh: [-0.1, 0.06], look: 0});

  // ============================================================ end card
  const ring = Math.min(1, Math.max(0, (t - q.cta - 0.45) / 1.0));

  return (
    <g>
      {/* ---------------- scene A ---------------- */}
      {aOp > 0 && (
        <g opacity={aOp}>
          {tally.map((p, i) => (
            <line
              key={i}
              x1={i < 4 ? 190 + i * 22 : 186}
              y1={i < 4 ? 276 : 320}
              x2={i < 4 ? 190 + i * 22 : 276}
              y2={i < 4 ? 276 + 44 * p : 320 - 44 * p}
              stroke={C.ink}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={p > 0 ? 1 : 0}
            />
          ))}
          <Stick x={250} y={G} h={270} pose={helperPose} hair="bob" />
          {clientP > 0 && <Stick x={720} y={G} h={270} pose={clientPose} opacity={clientP} />}
          {appA > 0 && (
            <g>
              <AppWin x={650} y={240} w={230} h={180} fill={fillA} scale={appA} opacity={Math.min(1, appA * 2)} />
              {flowDots.map((u, i) =>
                u > 0 && u < 1 ? (
                  <g key={i} transform={`translate(${quad([524, 560], [560, 330], [660, 330], u).join(' ')}) scale(0.42)`} opacity={1 - Math.max(0, u - 0.8) * 5}>
                    <Sheet />
                  </g>
                ) : null,
              )}
            </g>
          )}
          {qMark > 0 && (
            <text x={500} y={290} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={150} fill={C.ink} opacity={qMark} transform={`scale(${qMark})`} style={{transformOrigin: '500px 250px'}}>
              ?
            </text>
          )}
        </g>
      )}

      {/* ---------------- the iceberg (scenes 2, 5, 6, 7) ---------------- */}
      {iceOp > 0 && (
        <g opacity={iceOp}>
          <path d="M 130 330 L 870 330 L 870 664 Q 870 690 844 690 L 156 690 Q 130 690 130 664 Z" fill="#EEF0F1" opacity={waterIn} />
          <g transform={`translate(440 330) scale(${lerp(0.55, 1, subGrow)} ${lerp(0.3, 1, subGrow)}) translate(-440 -330)`} opacity={lerp(0.45, 1, subGrow)}>
            <path d={iceBlob} fill="#FFFFFF" stroke={subOutline > 0.5 ? C.crimson : C.ink} strokeWidth={6} strokeDasharray="14 12" strokeLinejoin="round" />
          </g>
          <path d={wave} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" opacity={waterIn} />
          <path d={tipPath} fill="#FFFFFF" stroke={C.ink} strokeWidth={tipThick} strokeLinejoin="round" />

          {/* below the line: what you notice and what you do next */}
          {t >= q.more && t < 14.4 && <Tag x={460} y={400} text="MORE" size={30} fill={C.crimson} opacity={prog(t, q.more, 0.35, bounce)} />}
          {t >= q.tacit && <Tag x={460} y={398} text="TACIT KNOWLEDGE" size={22} fill={C.crimson} opacity={prog(t, q.tacit, 0.35, bounce)} />}
          <Badge x={350} y={492} p={eyeP} boost={eyeBoost}><Eye s={0.8} /></Badge>
          <Badge x={470} y={545} p={pauseP} boost={pauseBoost}><PauseMark s={1.1} /></Badge>
          <g transform={`translate(${turnNudge} 0)`}>
            <Badge x={590} y={492} p={turnP} boost={turnBoost}><TurnArrow s={1} /></Badge>
          </g>

          {/* above the line */}
          {TIPX.map((x, i) => {
            const p = prog(t, realAt[i], 0.4, bounce);
            return p > 0 ? (
              <g key={i} transform={`translate(${x} ${TIPY}) scale(${p})`}>
                {i === 0 && <Book s={0.75} />}
                {i === 1 && <Course s={0.82} />}
                {i === 2 && <Transcript s={0.95} />}
              </g>
            ) : null;
          })}
          {t >= q.tell && t < 14.4 && <Tag x={440} y={112} text="CAN TELL" size={26} opacity={prog(t, q.tell, 0.35, bounce)} />}
          {t >= q.explain && <Tag x={440} y={112} text="CAN EXPLAIN" size={26} opacity={prog(t, q.explain, 0.35, bounce)} />}
          {t >= q.y1966 && t < 14.4 && <Tag x={775} y={110} text="1966" size={30} opacity={prog(t, q.y1966, 0.35, bounce)} />}
          {t >= q.polanyi && t < 14.4 && <Tag x={775} y={182} text="POLANYI" size={28} opacity={prog(t, q.polanyi, 0.35, bounce)} />}

          {/* the app reads only the tip */}
          {appP > 0 && (
            <g>
              <AppWin x={690} y={60} w={180} h={140} fill={appFill} scale={appP} opacity={Math.min(1, appP * 2)} />
              {tipIcons.map((it, i) => {
                const u = prog(t, it.at, 0.9, lin);
                if (u <= 0 || u >= 1) return null;
                const [px, py] = quad(it.from, [(it.from[0] + 690) / 2 + 20, 150], [690, 140], u);
                return (
                  <g key={i} transform={`translate(${px} ${py}) scale(${1 - u * 0.3})`} opacity={1 - Math.max(0, u - 0.8) * 5}>
                    {it.icon}
                  </g>
                );
              })}
              {talkP > 0 && (
                <g opacity={talkP}>
                  <circle cx={781} cy={218} r={6} fill="none" stroke={C.ink} strokeWidth={4} />
                  <circle cx={775} cy={238} r={9} fill="none" stroke={C.ink} strokeWidth={4} />
                  <Bubble x={780} y={282} w={170} h={64}>
                    <line x1={720} y1={272} x2={840} y2={272} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
                    <line x1={720} y1={292} x2={810} y2={292} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
                  </Bubble>
                </g>
              )}
              {reachP > 0 && (
                <path d="M 690 178 Q 640 215 612 326" fill="none" stroke={C.crimson} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${320 * reachP} 400`} />
              )}
              {crossP > 0 && <Cross x={608} y={330} r={26} p={crossP} />}
            </g>
          )}
        </g>
      )}

      {/* the sheets that were written down fly to the tip, then turn into a book, a course and a transcript */}
      {sheetsOp > 0 &&
        stack.map((s, i) => {
          const pIn = prog(t, sheetAt[i], 0.4, bounce);
          const real = prog(t, realAt[i], 0.25, lin);
          if (pIn <= 0 || real >= 1) return null;
          const u = prog(t, 8.38 + i * 0.1, 0.9);
          const x = lerp(s.x, TIPX[i], u);
          const y = lerp(s.y, TIPY, u) - Math.sin(u * Math.PI) * 70 + (1 - pIn) * -70;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${lerp(s.r, 0, u)}) scale(${lerp(0.95, 0.92, u) * Math.min(1, pIn)})`} opacity={sheetsOp * (1 - real)}>
              <Sheet />
            </g>
          );
        })}

      {/* ---------------- scene 3: a face in a crowd ---------------- */}
      {crowdOp > 0 && (
        <g opacity={crowdOp}>
          <Panel x={190} y={90} w={620} h={420} opacity={Math.min(1, panelP * 2)} />
          {rows.map((y, r) =>
            cols.map((x, c) => {
              const isPicked = c === picked.c && r === picked.r;
              if (isPicked) {
                const cx = lerp(500, x, zoomOut);
                const cy = lerp(300, y, zoomOut);
                const s = lerp(2.6, 1, zoomOut);
                return <Face key={`${r}${c}`} x={cx} y={cy} s={Math.max(0.01, pickIn) * s} ring={ringP} />;
              }
              const p = prog(t, q.crowd + 0.08 * (Math.abs(c - picked.c) + Math.abs(r - picked.r)), 0.35, bounce);
              return p > 0 ? <Face key={`${r}${c}`} x={x} y={y} s={p} opacity={Math.min(1, p * 2)} /> : null;
            }),
          )}
          {listP > 0 && (
            <g opacity={listP} transform={`translate(500 590) scale(${0.9 + 0.1 * listP})`}>
              <rect x={-220} y={-36} width={440} height={72} rx={16} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeDasharray="12 10" />
              <rect x={-202} y={-13} width={26} height={26} rx={6} fill="none" stroke={C.ink} strokeWidth={4} strokeDasharray="6 5" />
              <line x1={-150} y1={-8} x2={150} y2={-8} stroke={C.soft} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 12" />
              <line x1={-150} y1={12} x2={70} y2={12} stroke={C.soft} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 12" />
            </g>
          )}
          {noList > 0 && <Cross x={500} y={590} r={26} p={noList} />}
        </g>
      )}

      {/* ---------------- scene 4: the coach senses a shift ---------------- */}
      {coachOp > 0 && (
        <g opacity={coachOp}>
          <Stick x={290} y={G} h={270} pose={pose({mood: t > q.unsaid ? 'flat' : 'smile', look: 1})} />
          <Stick x={710} y={G} h={270} pose={pose({mood: turn > 0.4 ? 'open' : 'smile', look: -1})} hair="ponytail" />
          {eyeCoach > 0 && (
            <g transform={`translate(255 285) scale(${eyeCoach * 1.1})`} opacity={Math.min(1, eyeCoach * 2)}>
              <Eye s={1} />
            </g>
          )}
          {arrow({x: 500, y: 345, r: 0}, {x: 452, y: 400, r: -90}, 0)}
          {arrow({x: 500, y: 430, r: 180}, {x: 548, y: 400, r: -90 + 360}, 1)}
          {noWords > 0 && (
            <g opacity={noWords}>
              <circle cx={330} cy={318} r={7} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={352} cy={290} r={11} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={430} y={240} w={130} h={68}>
                <Dots x={400} y={242} t={t} />
              </Bubble>
            </g>
          )}
        </g>
      )}

      {/* ---------------- scene 8: so before you build anything ---------------- */}
      {s8 > 0 && (
        <g opacity={s8}>
          {buildP > 0 && buildOut < 1 && (
            <g opacity={1 - buildOut}>
              <rect x={360} y={210} width={280} height={210} rx={26} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={(1 - buildP) * 240} opacity={Math.min(1, buildP * 3)} />
              <g opacity={prog(t, q.build + 0.3, 0.4, lin)}>
                <line x1={360} y1={268} x2={640} y2={268} stroke={C.ink} strokeWidth={5} strokeDasharray="14 12" />
                {[0, 1, 2].map((k) => (
                  <circle key={k} cx={392 + k * 30} cy={239} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
                ))}
                <line x1={390} y1={312} x2={600} y2={312} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
                <line x1={390} y1={340} x2={560} y2={340} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
                <line x1={390} y1={368} x2={510} y2={368} stroke={C.soft} strokeWidth={10} strokeLinecap="round" />
              </g>
            </g>
          )}
          {youP > 0 && (
            <g opacity={youP}>
              <Stick x={500} y={G} h={270} pose={youPose} hair="long" />
              {thinkP > 0 && (
                <g opacity={thinkP}>
                  <circle cx={508} cy={322} r={7} fill="none" stroke={C.ink} strokeWidth={4} />
                  <circle cx={516} cy={296} r={11} fill="none" stroke={C.ink} strokeWidth={4} />
                  <Bubble x={500} y={236} w={190} h={84}>
                    <Dots x={465} y={238} t={t} />
                  </Bubble>
                </g>
              )}
            </g>
          )}
          {seatP > 0 && <Seat x={640} dashed={sit < 0.5} opacity={seatP} />}
          {walk > 0 && <Stick x={sitterX} y={G} h={320} pose={sitterPose} hair="bun" />}
          {eye2 > 0 && (
            <g transform={`translate(290 400) scale(${eye2 * 1.7 * pulse(t, 50.32, 0.4, 0.15)})`} opacity={Math.min(1, eye2 * 2)}>
              <Eye s={1} />
            </g>
          )}
          {sightP > 0 && eye2 > 0 && (
            <path d="M 345 418 L 586 514" fill="none" stroke={C.crimson} strokeWidth={6} strokeLinecap="round" strokeDasharray="4 14" strokeDashoffset={-120 * (1 - sightP)} opacity={sightP * eye2} />
          )}
          {ringHands > 0 && <circle cx={640} cy={532} r={52 * ringHands} fill="none" stroke={C.crimson} strokeWidth={7} opacity={Math.min(1, ringHands * 2)} />}
          {pageP > 0 && (
            <g transform={`translate(290 430) scale(${pageP})`} opacity={Math.min(1, pageP * 2)}>
              <rect x={-95} y={-125} width={190} height={250} rx={16} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
              {[0, 1, 2, 3].map((k) => (
                <line key={k} x1={-60} y1={-70 + k * 46} x2={60} y2={-70 + k * 46} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
              ))}
              {writeP > 0 && <path d="M -60 -70 q 10 -14 20 0 t 20 0 t 20 0 t 20 0 t 10 -6" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={140} strokeDashoffset={140 * (1 - writeP)} />}
              {writeP > 0 && (
                <g transform={`translate(${-60 + 110 * writeP} ${-70 - 4}) rotate(35)`}>
                  <rect x={0} y={-6} width={62} height={12} rx={4} fill="#FFFFFF" stroke={C.ink} strokeWidth={4} />
                  <path d="M 0 -6 L -14 0 L 0 6 Z" fill={C.ink} />
                </g>
              )}
            </g>
          )}
          {askMark > 0 && (
            <text x={290} y={300} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={110} fill={C.ink} opacity={askMark} transform={`scale(${askMark})`} style={{transformOrigin: '290px 260px'}}>
              ?
            </text>
          )}
        </g>
      )}

      {/* ---------------- end card ---------------- */}
      {ctaOn > 0 && (
        <g opacity={ctaOn}>
          <FollowIcon x={500} y={205} s={1.8 * ctaOn} />
          <Bell x={500} y={385} s={1.4 * ctaOn} ring={ring} />
          <Tag x={500} y={570} text="FOLLOW" size={46} opacity={ctaOn} />
        </g>
      )}
    </g>
  );
};
