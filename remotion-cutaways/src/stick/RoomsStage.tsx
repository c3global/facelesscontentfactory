import React from 'react';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Chair, Cross, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bell, FollowIcon} from './parts';
import {Calendar} from './icons2';
import type {Cues} from './PileStage';

/**
 * Stage art for "Every Community Is Different".
 * Metaphor: three rooms in a row (a classroom, a living room, a workshop). A "Welcome home" sign hangs in the wrong one.
 */
const G = 630;
const lin = (v: number) => v;
const pose = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});
const sm = (x: number) => x * x * (3 - 2 * x);

const RX = [220, 500, 780];
const RW = 216;
const RT = 120;
const RB = 460;

const Qmark: React.FC<{x: number; y: number; size?: number; color?: string}> = ({x, y, size = 40, color = C.ink}) => (
  <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={color}>
    ?
  </text>
);

const Room: React.FC<{k: number; on: number; solid: number; dim: number; hot: boolean; children?: React.ReactNode}> = ({k, on, solid, dim, hot, children}) => (
  <g opacity={on * (1 - 0.65 * dim)} transform={`translate(0 ${12 * (1 - on)})`}>
    <rect x={RX[k] - RW / 2} y={RT} width={RW} height={RB - RT} rx={22} fill="#FFFFFF" stroke={hot ? C.crimson : C.ink} strokeWidth={hot ? 8 : 6} strokeDasharray={solid > 0.5 ? undefined : '16 12'} strokeLinecap="round" />
    <line x1={RX[k] - RW / 2} y1={RB - 12} x2={RX[k] + RW / 2} y2={RB - 12} stroke={C.soft} strokeWidth={6} />
    {children}
  </g>
);

const Desk: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 56}) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={8} rx={4} fill={C.ink} />
    <line x1={x - w / 2 + 6} y1={y + 8} x2={x - w / 2 + 6} y2={y + 30} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <line x1={x + w / 2 - 6} y1={y + 8} x2={x + w / 2 - 6} y2={y + 30} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
  </g>
);

const Folder: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M -34 -22 L -10 -22 L 0 -12 L 34 -12 L 34 24 L -34 24 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

export const RoomsStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  const roomIn = (k: number) => prog(t, 0.45 + k * 0.45, 0.45, bounce);
  const named = (k: number) => prog(t, [q.learning, q.belonging, q.working][k] - 0.2, 0.3);
  // which room is the focus
  const focus = t < q.learning - 0.1 ? -1 : t < q.belonging - 0.1 ? 0 : t < q.working - 0.1 ? 1 : t < q.blend - 0.3 ? 2 : -1;
  const focusFade = (k: number) => (focus === -1 ? 0 : focus === k ? 0 : 1) * prog(t, q.learning - 0.1, 0.4);
  const dim = (k: number) => (t < q.blend - 0.3 ? focusFade(k) : 0);
  const labelOn = (k: number) => prog(t, [q.learning + 0.4, q.belonging + 0.8, q.working + 0.3][k], 0.35, bounce);
  const needOn = (k: number) => prog(t, [q.steps, q.rituals, q.roles][k], 0.4, bounce);
  const needFade = 1 - prog(t, q.blend - 0.3, 0.3);

  // blend and trouble
  const blend = prog(t, q.blend, 0.6);
  const blendOut = 1 - prog(t, q.group - 0.2, 0.3);
  const troubleX = prog(t, q.trouble + 0.6, 0.45);

  // the sign and the members
  const groupIn = prog(t, q.group, 0.5, bounce);
  const signIn = prog(t, q.promise + 0.1, 0.5, bounce);
  const move = prog(t, q.pick, 1.4, sm);
  const sign = 1 - move; // 1 = over the classroom
  const signX = RX[0] + (RX[1] - RX[0]) * move;
  const relaxed = move > 0.35;
  const studentsTag = prog(t, q.students, 0.35, bounce) * (1 - prog(t, q.pick - 0.1, 0.3));
  const circle = prog(t, q.design, 0.9, sm);

  const ctaOn = prog(t, q.cta, 0.5, bounce);
  const bellP = prog(t, q.subscribe, 1.6, lin);
  const bellIn = prog(t, q.subscribe - 0.1, 0.4, bounce);
  const askP = prog(t, q.cta + 1.0, 0.45, bounce);
  const rooms = 1 - prog(t, q.cta - 0.15, 0.3);

  const memberXs = [-66, 0, 66, -66, 0, 66];
  return (
    <g>
      {rooms > 0 && (
        <g opacity={rooms}>
          {/* classroom */}
          <Room k={0} on={roomIn(0)} solid={named(0)} dim={dim(0)} hot={focus === 0 && t < q.blend - 0.3}>
            <rect x={RX[0] - 70} y={RT + 28} width={140} height={56} rx={6} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} opacity={named(0)} />
            <line x1={RX[0] - 52} y1={RT + 48} x2={RX[0] + 20} y2={RT + 48} stroke={C.soft} strokeWidth={7} strokeLinecap="round" opacity={named(0)} />
            <line x1={RX[0] - 52} y1={RT + 66} x2={RX[0] + 40} y2={RT + 66} stroke={C.soft} strokeWidth={7} strokeLinecap="round" opacity={named(0)} />
            <g opacity={named(0) * (1 - 0.7 * groupIn)}>
              {[RX[0] - 66, RX[0], RX[0] + 66].map((x) => (
                <React.Fragment key={x}>
                  <Desk x={x} y={RT + 170} w={52} />
                  <Desk x={x} y={RT + 250} w={52} />
                </React.Fragment>
              ))}
            </g>
          </Room>
          {/* living room */}
          <Room k={1} on={roomIn(1)} solid={named(1)} dim={dim(1)} hot={focus === 1 && t < q.blend - 0.3}>
            <ellipse cx={RX[1]} cy={RT + 240} rx={86} ry={34} fill={C.soft} opacity={named(1)} />
            <g opacity={named(1) * (1 - 0.7 * move)}>
              <Chair x={RX[1] - 78} y={RT + 250} s={0.55} dashed={false} />
              <Chair x={RX[1] - 30} y={RT + 214} s={0.55} dashed={false} />
              <Chair x={RX[1] + 30} y={RT + 214} s={0.55} dashed={false} />
              <Chair x={RX[1] + 78} y={RT + 250} s={0.55} dashed={false} />
            </g>
            <g opacity={named(1)}>
              <rect x={RX[1] - 40} y={RT + 28} width={80} height={52} rx={26} fill="none" stroke={C.ink} strokeWidth={5} />
            </g>
          </Room>
          {/* workshop */}
          <Room k={2} on={roomIn(2)} solid={named(2)} dim={dim(2)} hot={focus === 2 && t < q.blend - 0.3}>
            <g opacity={named(2)}>
              <Desk x={RX[2] - 50} y={RT + 220} w={84} />
              <Desk x={RX[2] + 52} y={RT + 220} w={84} />
              <rect x={RX[2] - 74} y={RT + 192} width={44} height={28} rx={4} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <rect x={RX[2] + 32} y={RT + 194} width={36} height={26} rx={4} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
              <rect x={RX[2] - 80} y={RT + 36} width={160} height={10} rx={5} fill={C.ink} />
              <rect x={RX[2] - 64} y={RT + 8} width={26} height={28} rx={4} fill="none" stroke={C.ink} strokeWidth={5} />
              <rect x={RX[2] - 20} y={RT + 12} width={26} height={24} rx={4} fill="none" stroke={C.ink} strokeWidth={5} />
              <rect x={RX[2] + 26} y={RT + 6} width={26} height={30} rx={4} fill="none" stroke={C.ink} strokeWidth={5} />
            </g>
          </Room>

          {/* labels and needs */}
          {['LEARNING', 'BELONGING', 'WORKING'].map((l, k) => (
            <g key={k} opacity={labelOn(k) * (1 - 0.55 * dim(k))}>
              <Tag x={RX[k]} y={RB + 56} text={l} size={20} />
            </g>
          ))}
          {[
            {k: 0, text: 'STEPS'},
            {k: 1, text: 'RITUALS'},
            {k: 2, text: 'ROLES'},
          ].map((n) => (
            <g key={n.k} opacity={needOn(n.k) * needFade}>
              <Tag x={RX[n.k]} y={RB + 118} text={n.text} size={22} fill={C.crimson} />
            </g>
          ))}
          {/* small cues for what each type needs */}
          <g opacity={prog(t, q.answer, 0.4, bounce) * needFade}>
            <Bubble x={RX[0] + 60} y={RB + 200} w={60} h={50}>
              <Qmark x={RX[0] + 60} y={RB + 200} size={34} />
            </Bubble>
          </g>
          <g opacity={prog(t, q.welcome, 0.4, bounce) * needFade}>
            <Bubble x={RX[1] + 60} y={RB + 200} w={74} h={50}>
              <text x={RX[1] + 60} y={RB + 212} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill={C.ink}>
                HI
              </text>
            </Bubble>
          </g>
          <g opacity={prog(t, q.deadlines, 0.4, bounce) * needFade}>
            <Calendar x={RX[2] - 40} y={RB + 200} s={0.36} rows={3} shade={[4]} w={200} h={140} />
          </g>
          <g opacity={prog(t, q.files, 0.4, bounce) * needFade}>
            <Folder x={RX[2] + 56} y={RB + 200} s={0.9} />
          </g>

          {/* two types blend */}
          {blend > 0 && (
            <g opacity={blend * blendOut}>
              <path d={`M ${RX[0] + 50} ${RT - 26} Q ${(RX[0] + RX[1]) / 2} ${RT - 80} ${RX[1] - 50} ${RT - 26}`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray="4 14" />
              <path d={`M ${RX[1] + 50} ${RT - 26} Q ${(RX[1] + RX[2]) / 2} ${RT - 80} ${RX[2] - 50} ${RT - 26}`} fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray="4 14" opacity={0.35} />
            </g>
          )}
          {troubleX > 0 && troubleX < 1.01 && t < q.group && <Cross x={500} y={RT - 60} r={26} p={troubleX} />}

          {/* the sign and the members */}
          {signIn > 0 && (
            <g opacity={signIn}>
              <line x1={signX - 70} y1={RT - 4} x2={signX - 70} y2={RT - 34 + 14 * (1 - signIn)} stroke={C.ink} strokeWidth={4} />
              <line x1={signX + 70} y1={RT - 4} x2={signX + 70} y2={RT - 34 + 14 * (1 - signIn)} stroke={C.ink} strokeWidth={4} />
              <Tag x={signX} y={RT - 42 + 14 * (1 - signIn)} text="WELCOME HOME" size={16} fill={C.crimson} />
            </g>
          )}
          {groupIn > 0 && (
            <g opacity={groupIn}>
              {memberXs.map((dx, i) => {
                const x = RX[0] + dx + (RX[1] - RX[0]) * move * (i % 2 === 0 ? 1 : 0.96) + (relaxed && i % 3 === 1 ? 0 : 0);
                const y = i < 3 ? RT + 232 : RT + 308;
                return <Stick key={i} x={x} y={y} h={i < 3 ? 76 : 88} sw={6} hair={i % 3 === 2 ? 'bob' : undefined} pose={pose({mood: relaxed ? 'smile' : 'sad', look: 0})} />;
              })}
              {!relaxed && (
                <g opacity={prog(t, q.group + 0.6, 0.4, bounce)}>
                  <Qmark x={RX[0] - 20} y={RT + 120} size={38} />
                  <Qmark x={RX[0] + 50} y={RT + 144} size={30} />
                </g>
              )}
            </g>
          )}
          {studentsTag > 0 && (
            <g opacity={studentsTag}>
              <Tag x={RX[0]} y={RB + 118} text="STUDENTS" size={22} />
            </g>
          )}
          {circle > 0 && (
            <rect x={RX[1] - RW / 2 - 16} y={RT - 16} width={RW + 32} height={RB - RT + 32} rx={34} fill="none" stroke={C.crimson} strokeWidth={9} strokeLinecap="round" pathLength={100} strokeDasharray={`${circle * 100} 100`} />
          )}
        </g>
      )}

      {ctaOn > 0 && (
        <g opacity={Math.min(1, ctaOn * 2)}>
          <FollowIcon x={500} y={200} s={1.4 * ctaOn} />
          {bellIn > 0 && <Bell x={500} y={340} s={1.3 * bellIn} ring={bellP} />}
          <Tag x={500} y={450} text="FOLLOW AND SUBSCRIBE" size={36} opacity={prog(t, q.cta + 0.15, 0.4, bounce)} />
          <text x={500} y={570} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={C.crimson} opacity={askP}>
            Which type is yours?
          </text>
        </g>
      )}
    </g>
  );
};
