import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Backdrop} from './backdrops';
import {brand} from './brand';
import {handFamilies} from './fonts';
import {MetalRim, metalFill} from './metal';

export const clinicCardTrialSchema = z.object({
  treatment: z.enum(['crimson-card', 'message-bubbles', 'handwritten-note']),
  layout: z.enum(['combined', 'split']).default('combined'),
  snapTips: z.boolean().default(false),
  inset: z.boolean().default(false),
  hook: z.tuple([z.string(), z.string(), z.string()]),
  hookAt: z.number(),
  tips: z.array(z.object({lead: z.string(), accent: z.string(), at: z.number()})).min(1).max(4),
});
type Props = z.infer<typeof clinicCardTrialSchema>;

const hand = handFamilies.covered;
const ease = (x: number) => 1 - (1 - x) ** 3;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const shadow = '0 12px 34px rgba(0,0,0,.36)';
const whiteType = {fontFamily: hand, color: brand.white, fontWeight: 400, textShadow: '0 1px 4px rgba(0,0,0,.35)'};

export function Arrival({at, children, origin = '50% 100%', snap = false}: {
  at: number; children: React.ReactNode; origin?: string; snap?: boolean;
}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = Math.round(at * fps);
  if (frame < cue) return null;
  if (snap) return <>{children}</>;
  const k = interpolate(frame, [cue, cue + 6], [0, 1], {...clamp, easing: ease});
  return <div style={{opacity: .72 + .28*k, transform: `translateY(${(1-k)*16}px) scale(${.975 + .025*k})`, transformOrigin: origin}}>
    {children}
  </div>;
}

export function Surface({children, radius = 24, dark = false, opacity = .84}: {
  children: React.ReactNode; radius?: number | string; dark?: boolean; opacity?: number;
}) {
  const frame = useCurrentFrame();
  return <div style={{position: 'relative', borderRadius: radius, overflow: 'hidden', boxShadow: shadow}}>
    <AbsoluteFill style={{opacity}}>
      {dark ? <AbsoluteFill style={{backgroundColor: brand.charcoal}} /> : <Backdrop kind="crimson" frame={frame} />}
    </AbsoluteFill>
    <AbsoluteFill style={{
      backgroundImage: 'linear-gradient(112deg,transparent 38%,rgba(255,255,255,.12) 50%,transparent 62%)',
      backgroundSize: '300% 100%',
      backgroundPosition: `${120 - ((frame / 24 * 28) % 140)}% 0`,
    }} />
    <MetalRim radius={radius} thickness={4} kind="copper" variant="bright" seed={3} />
    <div style={{position: 'relative'}}>{children}</div>
  </div>;
}

function CrimsonCard({hook, hookAt, tips, layout, snapTips, inset}: Props) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const split = layout === 'split';
  const tipLines = tips.map((tip, i) => {
    if (frame < Math.round(tip.at * fps)) return null;
    return <Arrival key={tip.at} at={tip.at} snap={snapTips}>
      <div style={{marginTop: !split && i === 0 ? 17 : 2,
        paddingTop: !split && i === 0 ? 12 : 0,
        borderTop: !split && i === 0 ? '1px solid rgba(241,185,165,.65)' : undefined,
        fontSize: 63, lineHeight: 1.23, textAlign: 'center', whiteSpace: 'nowrap'}}>
        {tip.lead} {tip.accent}
      </div>
    </Arrival>;
  });
  return <>
  <div style={{position: 'absolute', top: split ? 340 : 1014, left: inset ? 160 : 116, width: inset ? 760 : 806}}>
    <Arrival at={hookAt}>
      <Surface opacity={.82}>
        <div style={{padding: '26px 34px 27px', ...whiteType}}>
          <div style={{fontSize: 57, lineHeight: 1.13, textAlign: 'center'}}>
            {hook[0]}<br />{hook[1]} {hook[2]}
          </div>
          {!split && tipLines}
        </div>
      </Surface>
    </Arrival>
  </div>
  {split && <div style={{position: 'absolute', top: 1148, left: inset ? 160 : 116, width: inset ? 760 : 806}}>
    <Arrival at={tips[0].at} snap={snapTips}>
      <Surface opacity={.82}>
        <div style={{padding: '20px 34px 25px', ...whiteType}}>{tipLines}</div>
      </Surface>
    </Arrival>
  </div>}
  </>;
}

function MessageBubbles({hook, hookAt, tips, layout}: Props) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const text = `${hook[0]} ${hook[1]} ${hook[2]}`;
  const count = Math.min(text.length, Math.max(1, Math.floor((frame / fps - hookAt) * 92)));
  const first = hook[0].length;
  return <>
    <div style={{position: 'absolute', top: layout === 'split' ? 340 : 973, right: 130, width: 792}}>
      <Arrival at={hookAt} origin="100% 100%">
        <Surface radius="30px 30px 8px 30px">
          <div style={{padding: '22px 31px 24px', ...whiteType, fontSize: 56, lineHeight: 1.14}}>
            <div>{text.slice(0, Math.min(first, count))}<span style={{visibility: 'hidden'}}>{text.slice(Math.min(first, count), first)}</span></div>
            <div>{text.slice(first + 1, Math.max(first + 1, count))}<span style={{visibility: 'hidden'}}>{text.slice(Math.max(first + 1, count))}</span></div>
          </div>
        </Surface>
      </Arrival>
    </div>
    {tips.map((tip, i) => {
      const right = i === 1;
      return <div key={tip.at} style={{position: 'absolute', top: 1152 + i * 112,
        left: right ? 239 : 108, width: 684}}>
        <Arrival at={tip.at} origin={right ? '100% 100%' : '0% 100%'}>
          <Surface radius={right ? '28px 28px 8px 28px' : '28px 28px 28px 8px'} dark={!right} opacity={.9}>
            <div style={{padding: '15px 28px 19px', ...whiteType, fontSize: 60, lineHeight: 1.14, whiteSpace: 'nowrap'}}>
              {tip.lead} {tip.accent}
            </div>
          </Surface>
        </Arrival>
      </div>;
    })}
  </>;
}

export function Paper({children, padding = '34px 40px 30px'}: {children: React.ReactNode; padding?: string}) {
  const frame = useCurrentFrame();
  return <div style={{position: 'relative', backgroundColor: brand.white, padding,
    borderRadius: 3, boxShadow: shadow, color: brand.charcoal}}>
    <div style={{position: 'absolute', top: -18, left: '50%', width: 184, height: 41,
      transform: 'translateX(-50%) rotate(3deg)', borderRadius: 2, overflow: 'hidden', opacity: .94}}>
      <Backdrop kind="crimson" frame={frame} />
      <MetalRim radius={2} thickness={3} kind="copper" variant="bright" seed={19} />
    </div>
    {children}
  </div>;
}

function HandwrittenNote({hook, hookAt, tips, layout}: Props) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const split = layout === 'split';
  const title = <div style={{fontFamily: hand, fontSize: 54, lineHeight: 1.09}}>
    {split
      ? <>{hook[0]}<br />{hook[1]} {hook[2]}</>
      : hook.map((line) => <div key={line}>{line}</div>)}
  </div>;
  return <>
  {split && <div style={{position: 'absolute', top: 340, left: 122, width: 742,
    transform: 'rotate(-2deg)', transformOrigin: '50% 50%'}}>
    <Arrival at={hookAt}><Paper>{title}</Paper></Arrival>
  </div>}
  <div style={{position: 'absolute', top: split ? 1140 : 1028, left: 122, width: 742,
    transform: 'rotate(-2deg)', transformOrigin: '50% 50%'}}>
    <Arrival at={split ? tips[0].at : hookAt}>
      <Paper>
        {!split && title}
        {!split && <div style={{height: 3, margin: '14px 0 7px', width: 250,
          ...metalFill({kind: 'copper', variant: 'deep', frame, seed: 17})}} />
        }
        {tips.map((tip) => {
          const cue = Math.round(tip.at*fps);
          if (frame < cue) return null;
          const p = interpolate(frame, [cue, cue+6], [0,1], {...clamp, easing: ease});
          return <div key={tip.at} style={{fontFamily: hand, fontSize: 61, lineHeight: 1.18,
            whiteSpace: 'nowrap', clipPath: `inset(-8% ${(1-p)*100}% -8% 0)`}}>
            {tip.lead} <span style={{color: brand.crimson}}>{tip.accent}</span>
          </div>;
        })}
      </Paper>
    </Arrival>
  </div>
  </>;
}

const treatments = {
  'crimson-card': CrimsonCard,
  'message-bubbles': MessageBubbles,
  'handwritten-note': HandwrittenNote,
};

export function ClinicCardTrials(props: Props) {
  const Treatment = treatments[props.treatment];
  return <AbsoluteFill style={{pointerEvents: 'none'}}><Treatment {...props} /></AbsoluteFill>;
}
