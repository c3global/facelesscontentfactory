import React from 'react';
import {interpolate} from 'remotion';
import {Stick, STAND, type Pose} from './figure';
import {Bubble, Card, Tag, C, SANS, between, bounce, prog} from './kit';
import {Bulb, Book, CommentIcon, Heart, Shield, Target} from './parts';
import type {Cues} from './PileStage';

/**
 * Stage art for "Role and Relationship". A fictional client gets the lead role; the three things that hold a
 * working relationship up (shared goals, shared knowledge, mutual respect) are drawn as a table on three legs.
 * `t` is seconds into the voiceover, `q` the cue times from content/role-relationship.stick.json.
 */
const G = 630;

const smile = (p: Partial<Pose> = {}): Pose => ({...STAND, ...p});

const Chip: React.FC<{x: number; y: number; text: string; opacity: number}> = ({x, y, text, opacity}) => {
  const w = text.length * 14.5 + 46;
  return (
    <g opacity={opacity}>
      <rect x={x - w / 2} y={y - 24} width={w} height={48} rx={24} fill="#FFFFFF" stroke={C.ink} strokeWidth={5} />
      <text x={x} y={y + 8} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={22} letterSpacing={1.5} fill={C.ink}>
        {text}
      </text>
    </g>
  );
};

export const RoleStage: React.FC<{t: number; q: Cues}> = ({t, q}) => {
  // ---------------- 1: the client, the lead role, the one-word reply ----------------
  const o1 = 1 - prog(t, q.table - 0.5, 0.35, (v) => v);
  const leadGrow = prog(t, q.lead, 0.5, bounce);
  const leadH = 270 + 28 * leadGrow;
  const msgIn = prog(t, q.msg - 0.3, 0.4);
  const replyIn = prog(t, q.word - 0.15, 0.35, bounce);
  const flagIn = prog(t, q.same, 0.4) * (1 - prog(t, q.lead + 0.2, 0.5));
  const highFive = 1 - prog(t, q.lead - 0.1, 0.3, (v) => v);
  const leadPose: Pose = smile(
    highFive > 0.5
      ? {rh: [0.17, -0.12], lh: [-0.17, 0.27]}
      : leadGrow > 0.1 && t < q.now
        ? {lh: [-0.12, -0.26], rh: [0.12, -0.26]}
        : {rh: [0.22, -0.06], lh: [-0.17, 0.27]},
  );
  const colPose: Pose = smile({
    lh: highFive > 0.5 ? [-0.17, -0.12] : [-0.12, 0.27],
    mood: t > q.word - 0.15 ? 'flat' : 'smile',
    lean: t > q.word - 0.15 ? 0.015 : 0,
  });

  // ---------------- 2: the table on three legs ----------------
  const tableIn = prog(t, q.table, 0.45, bounce);
  const shrink = prog(t, q.travel, 0.7);
  const grow = prog(t, q.which - 0.1, 0.7);
  const tableOut = prog(t, q.cta - 0.1, 0.3);
  const small = shrink * (1 - grow);
  const sc = interpolate(small, [0, 1], [1, 0.7]);
  const ty = interpolate(small, [0, 1], [200, 122]);
  const legIn = [prog(t, q.goals, 0.45, bounce), prog(t, q.knowledge, 0.45, bounce), prog(t, q.respect, 0.45, bounce)];
  const goalShift = prog(t, q.goalsShift, 0.5) * (1 - prog(t, q.restate + 1.2, 0.6));
  const knowShift = prog(t, q.knowShift, 0.5) * (1 - prog(t, q.share + 1.3, 0.6));
  const quake = between(t, q.disrupt, q.disrupt + 2.3, 0.15);
  const tilt = 7 * prog(t, q.knowShift, 0.6) * (1 - prog(t, q.him, 0.5)) + Math.sin(t * 34) * 2.6 * quake;
  const pulse = (i: number) => {
    const a = q.which + 0.75 + i * 0.55;
    return 1 + 0.12 * Math.sin(Math.min(1, Math.max(0, (t - a) / 0.5)) * Math.PI);
  };
  const legs = [
    {x: -250, label: 'GOALS', dx: -95 * goalShift, rot: -16 * goalShift, icon: <Target s={0.8} />},
    {x: 0, label: 'KNOWLEDGE', dx: 85 * knowShift, rot: 18 * knowShift, icon: <Bulb s={0.8} />},
    {x: 250, label: 'RESPECT', dx: 0, rot: Math.sin(t * 30) * 4 * quake, icon: <Heart s={0.85} />},
  ];

  // ---------------- 3: the two of them below the table ----------------
  const commOn = between(t, q.travel + 0.3, q.which - 0.1, 0.35);
  const chips = [
    {text: 'FREQUENT', at: q.frequent},
    {text: 'TIMELY', at: q.timely},
    {text: 'ACCURATE', at: q.accurate},
    {text: 'PROBLEM-SOLVING', at: q.solving},
  ];
  const chipsOut = prog(t, q.disrupt + 0.1, 0.3);
  const newRole = prog(t, q.disrupt + 0.1, 0.4, bounce) * (1 - prog(t, q.goalsShift - 0.5, 0.4));
  const lift = prog(t, q.reporting, 0.5) * (1 - prog(t, q.rebuild, 0.5));
  const reportOn = prog(t, q.reporting, 0.4) * (1 - prog(t, q.wordAns, 0.3));
  const shield = prog(t, q.protect, 0.4, bounce) * (1 - prog(t, q.rebuild + 0.3, 0.3));
  const goalFly = prog(t, q.restate, 0.9);
  const bookFly = prog(t, q.share, 0.9);
  const askFly = prog(t, q.ask, 1.0);
  const checkP = prog(t, q.ask + 1.9, 0.5, (v) => v);
  const leadPose2: Pose = smile({
    rh: lift > 0.5 ? [0.2, 0.1] : t > q.restate - 0.2 && t < q.which ? [0.22, -0.1] : [0.17, 0.27],
    lean: lift > 0.5 ? 0.01 : 0,
  });
  const colPose2: Pose = smile({
    mood: t > q.disrupt && t < q.rebuild ? 'flat' : 'smile',
    lh: shield > 0.5 ? [-0.1, 0.0] : [-0.17, 0.27],
    rh: shield > 0.5 ? [0.1, 0.0] : [0.17, 0.27],
  });

  // ---------------- 4: the call to comment ----------------
  const ctaOn = prog(t, q.cta, 0.5, bounce);

  return (
    <g>
      {/* 1 */}
      {o1 > 0 && (
        <g opacity={o1}>
          {flagIn > 0 && (
            <g opacity={flagIn}>
              <line x1={500} y1={330} x2={500} y2={G} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
              <path d="M 500 330 L 590 358 L 500 388 Z" fill={C.crimson} stroke={C.crimson} strokeWidth={4} strokeLinejoin="round" />
              <Tag x={500} y={250} text="SAME TEAM" size={26} />
            </g>
          )}
          <Stick x={330} y={G} h={leadH} pose={leadPose} />
          <Stick x={670} y={G} h={270} pose={colPose} />
          {t >= q.client && t < q.lead && <Tag x={330} y={290} text="FICTIONAL CLIENT" size={22} fill="#FFFFFF" color={C.mid} opacity={prog(t, q.client, 0.3) * (1 - prog(t, q.lead - 0.2, 0.2))} />}
          {t >= q.lead && <Tag x={330} y={262} text="LEAD ROLE" size={26} opacity={prog(t, q.lead, 0.35, bounce) * (1 - prog(t, q.title + 0.9, 0.3))} />}
          {msgIn > 0 && (
            <g opacity={msgIn}>
              <circle cx={380} cy={330} r={9} fill="none" stroke={C.ink} strokeWidth={4} />
              <circle cx={410} cy={290} r={13} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={520} y={165} w={290} h={110}>
                {[-24, 0, 24].map((dy, i) => (
                  <line key={i} x1={420} y1={165 + dy} x2={i === 2 ? 550 : 620} y2={165 + dy} stroke={C.soft} strokeWidth={9} strokeLinecap="round" />
                ))}
              </Bubble>
            </g>
          )}
          {replyIn > 0 && (
            <g transform={`translate(0 0) scale(1)`} opacity={replyIn}>
              <circle cx={690} cy={330} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={720} y={282} w={86} h={64}>
                <circle cx={720} cy={296} r={7} fill={C.ink} />
              </Bubble>
            </g>
          )}
        </g>
      )}

      {/* 2: the table */}
      {tableIn > 0 && tableOut < 1 && (
        <g opacity={(1 - tableOut) * Math.min(1, tableIn * 2)} transform={`translate(500 ${ty}) scale(${sc})`}>
          <g transform={`rotate(${tilt})`}>
            <rect x={-350} y={-30} width={700} height={60} rx={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
            <text y={9} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} letterSpacing={3} fill={C.ink}>
              WORKING RELATIONSHIP
            </text>
          </g>
          {legs.map((l, i) => (
            <g key={l.label}>
              <g transform={`translate(${l.x + l.dx} 290) rotate(${l.rot}) scale(1 ${legIn[i]})`}>
                <rect x={-34} y={-262} width={68} height={262} rx={22} fill="#FFFFFF" stroke={C.ink} strokeWidth={6} />
                <g transform={`translate(0 -190) scale(${pulse(i)})`}>{l.icon}</g>
              </g>
              <g opacity={legIn[i]} transform={`translate(${l.x} 332)`}>
                <Tag x={0} y={0} text={l.label} size={21} />
              </g>
            </g>
          ))}
          {t >= q.which + 0.1 && t < q.cta - 0.2 && (
            <text x={0} y={-82} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={130} fill={C.ink} opacity={prog(t, q.which + 0.1, 0.4, bounce)}>
              ?
            </text>
          )}
        </g>
      )}

      {/* 3: below the table */}
      {commOn > 0 && (
        <g opacity={commOn}>
          <Stick x={240} y={G - 80 * lift} h={235} pose={leadPose2} />
          <Stick x={760} y={G} h={235} pose={colPose2} />
          {lift > 0 && <rect x={170} y={G - 80 * lift} width={120} height={80 * lift} rx={10} fill={C.soft} stroke={C.ink} strokeWidth={5} />}
          {chips.map((c, i) => (
            <Chip key={c.text} x={interpolate(prog(t, c.at, 0.5), [0, 1], [380, 500])} y={425 + i * 54} text={c.text} opacity={prog(t, c.at, 0.35) * (1 - chipsOut)} />
          ))}
          {newRole > 0 && <Tag x={500} y={470} text="NEW ROLE" size={36} fill={C.crimson} opacity={newRole} />}
          {reportOn > 0 && (
            <g opacity={reportOn}>
              <path d="M 310 470 L 690 540 M 648 512 L 692 541 L 646 556" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
              <Tag x={500} y={420} text="REPORTING LINE" size={26} />
            </g>
          )}
          {shield > 0 && (
            <g opacity={shield} transform="translate(760 540)">
              <Shield s={shield * 0.9} />
            </g>
          )}
          {t >= q.wordAns && t < q.rebuild && (
            <g opacity={prog(t, q.wordAns + 0.3, 0.3) * (1 - prog(t, q.rebuild, 0.3))}>
              <circle cx={730} cy={420} r={8} fill="none" stroke={C.ink} strokeWidth={4} />
              <Bubble x={720} y={375} w={86} h={64}>
                <circle cx={720} cy={389} r={7} fill={C.ink} />
              </Bubble>
            </g>
          )}
          {goalFly > 0 && askFly < 1 && <g transform={`translate(${interpolate(goalFly, [0, 1], [320, 680])} 470)`} opacity={1 - prog(t, q.restate + 1.0, 0.3)}><Target s={0.9} /></g>}
          {bookFly > 0 && <g transform={`translate(${interpolate(bookFly, [0, 1], [320, 680])} 530)`} opacity={1 - prog(t, q.share + 1.0, 0.3)}><Book s={0.9} /></g>}
          {askFly > 0 && (
            <g opacity={1 - prog(t, q.which - 0.4, 0.3)}>
              <Card x={interpolate(askFly, [0, 1], [330, 590])} y={575} w={250} h={64} scale={0.9} check={checkP} />
            </g>
          )}
        </g>
      )}

      {/* 4: call to comment */}
      {ctaOn > 0 && (
        <g opacity={ctaOn}>
          <CommentIcon x={500} y={290} s={1.4 * ctaOn} />
          <Tag x={500} y={480} text="COMMENT BELOW" size={46} />
        </g>
      )}
    </g>
  );
};
