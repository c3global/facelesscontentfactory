import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Arrival, Surface, Paper} from './ClinicCardTrials';
import {brand} from './brand';
import {handFamilies} from './fonts';
import {MetalRim, MetalBox} from './metal';
import {CenteredCards, InvitationEnvelope, AnnouncementNumbered} from './ClinicNoteVariations';
import {InsetClinicBody} from './ClinicInset';

export const nextClinicNoteSchema = z.object({
  treatment: z.enum(['invitation-messages', 'invitation-cards', 'invitation-envelope', 'visitor-checklist', 'announcement-note', 'announcement-numbered', 'welcome-clipboard', 'appreciation-cards', 'rest-cards']),
  hook: z.array(z.string()).min(1).max(3),
  hookAt: z.number().nonnegative(),
  hookTop: z.number().default(320),
  hookSize: z.number().default(55),
  hookEffect: z.enum(['standard', 'stamp', 'holiday']).default('standard'),
  inset: z.boolean().default(false),
  profileCover: z.boolean().default(false),
  bodyTop: z.number().optional(),
  cardTilt: z.boolean().default(false),
  tips: z.array(z.object({
    lines: z.array(z.string()).min(1).max(2),
    at: z.number().nonnegative(),
  })).min(1).max(4),
});
export type Props = z.infer<typeof nextClinicNoteSchema>;
const hand = handFamilies.covered;
const ink = {fontFamily: hand, fontWeight: 400};
const light = {...ink, color: brand.white, textShadow: '0 1px 4px rgba(0,0,0,.35)'};

function Hook({hook, hookAt, hookTop, hookSize, hookEffect, paper, inset}: {
  hook: string[]; hookAt: number; hookTop: number; hookSize: number; hookEffect: Props['hookEffect']; paper: boolean; inset: boolean;
}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = hookEffect === 'stamp';
  const impact = interpolate(frame, [Math.round(hookAt*fps), Math.round(hookAt*fps)+5], [1,0], {
    extrapolateLeft:'clamp', extrapolateRight:'clamp',
  });
  const title = <div style={{fontFamily: hand, fontSize: hookSize, lineHeight: 1.1,
    textAlign: 'center', color: paper ? brand.charcoal : brand.white}}>
    {hook.map(line => <div key={line}>{line}</div>)}
  </div>;
  return <div style={{position: 'absolute', left: inset ? 160 : 60, top: hookTop, width: inset ? 760 : 960,
    transform: stamp ? 'scale('+(1+.12*impact)+') rotate('+(-2.5*impact)+'deg)' : paper ? 'rotate(-1.2deg)' : undefined}}>
    <Arrival at={hookAt} snap={stamp}>
      {paper
        ? <Paper>{title}</Paper>
        : <Surface radius={stamp ? 7 : 24}><div style={{padding: hookEffect === 'holiday' ? '45px 29px 32px' : '24px 29px 26px'}}>{title}</div>
          {hookEffect === 'holiday' && <HolidayTrim />}
        </Surface>}
    </Arrival>
  </div>;
}

/** Local Christmas ornament details, in the approved crimson and copper finish. */
function HolidayTrim(){
 return <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
   <div style={{position:'absolute',left:30,right:30,top:16,height:1,background:'#F1B9A5',opacity:.65}} />
   {[0,1].map((i)=><div key={i} style={{position:'absolute',...(i ? {right:32} : {left:32}),top:0,width:32,height:75}}>
     <div style={{position:'absolute',left:15,top:0,width:1,height:33,background:'#F1B9A5'}} />
     <MetalBox kind="copper" variant="deep" seed={51+i} style={{position:'absolute',left:1,top:32,width:30,height:34,borderRadius:'48%',boxShadow:'0 3px 5px rgba(0,0,0,.22)'}}>
       <div style={{position:'absolute',left:5,right:5,top:14,height:1,background:'rgba(255,255,255,.7)'}} />
     </MetalBox>
   </div>)}
   <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',top:2,width:54,height:29}}>
     <svg width="54" height="29" viewBox="0 0 54 29"><path d="M27 15C5-12-8 21 23 18M27 15C49-12 62 21 31 18M25 17L15 28M29 17L39 28" fill="#C91B19" stroke="#F1B9A5" strokeWidth="1.5"/></svg>
   </div>
 </div>;
}

function InvitationMessages({tips}: {tips: Props['tips']}) {
  let offset = 1038;
  return <>{tips.map((tip,i) => {
    const top = offset;
    offset += tip.lines.length * 63 + 47;
    const outgoing = i === 1;
    return <div key={tip.at} style={{position: 'absolute', top,
      left: outgoing ? 205 : 108, width: 714}}>
      <Arrival at={tip.at} snap origin={outgoing ? '100% 100%' : '0% 100%'}>
        <Surface radius={outgoing ? '29px 29px 8px 29px' : '29px 29px 29px 8px'} dark={!outgoing} opacity={.9}>
          <div style={{...light, fontSize: 57, lineHeight: 1.1, padding: '16px 28px 19px'}}>
            {tip.lines.map(line => <div key={line}>{line}</div>)}
          </div>
        </Surface>
      </Arrival>
    </div>;
  })}</>;
}

function VisitorChecklist({tips}: {tips: Props['tips']}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <div style={{position: 'absolute', top: 1090, left: 45, width: 990}}>
    <Arrival at={tips[0].at} snap>
      <Surface dark opacity={.94}>
        <div style={{padding: '22px 20px 25px'}}>
          {tips.map((tip,i) => {
            if (frame < Math.round(tip.at*fps)) return null;
            return <div key={tip.at} style={{display: 'flex', gap: 12, alignItems: 'center', marginTop: i ? 16 : 0}}>
              <div style={{position: 'relative', width: 38, height: 38, flexShrink: 0,
                borderRadius: 8, backgroundColor: brand.crimson, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: brand.white,
                fontFamily: 'DM Sans', fontSize: 27, fontWeight: 700}}>
                <MetalRim radius={8} thickness={2} kind="copper" variant="bright" seed={12+i} />
                {i + 1}
              </div>
              <div style={{fontFamily: handFamilies.caveat, fontWeight: 600,
                color: brand.white, fontSize: 58, lineHeight: 1.2, whiteSpace: 'nowrap'}}>
                {tip.lines.join(' ')}
              </div>
            </div>;
          })}
        </div>
      </Surface>
    </Arrival>
  </div>;
}

function AnnouncementNote({tips}: {tips: Props['tips']}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <div style={{position: 'absolute', top: 960, left: 123, width: 775,
    transform: 'rotate(-1.5deg)', transformOrigin: '50% 0'}}>
    <Arrival at={tips[0].at} snap>
      <Paper>
        {tips.map((tip,i) => {
          if(frame < Math.round(tip.at*fps)) return null;
          return <div key={tip.at} style={{...ink, fontSize: 52, lineHeight: 1.05,
            color: brand.charcoal, marginTop: i ? 6 : 0, paddingBottom: 3,
            borderBottom: '1px solid rgba(169,87,74,.22)'}}>
            {tip.lines.map((line,j) => <div key={line} style={{color: i===3 && j===0 ? brand.crimson : undefined}}>{line}</div>)}
          </div>;
        })}
      </Paper>
    </Arrival>
  </div>;
}

function WelcomeClipboard({tips}: {tips: Props['tips']}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <div style={{position:'absolute',top:1050,left:70,width:940}}>
    <Arrival at={tips[0].at} snap>
      <div style={{position:'relative',padding:'32px 22px 24px',backgroundColor:brand.charcoal,
        borderRadius:16,boxShadow:'0 12px 30px rgba(0,0,0,.35)'}}>
        <MetalRim radius={16} thickness={4} kind="copper" variant="bright" seed={13} />
        <div style={{backgroundColor:brand.white,padding:'24px 25px 26px',borderRadius:4}}>
          {tips.map((tip,i) => frame < Math.round(tip.at*fps) ? null : (
            <div key={tip.at} style={{display:'flex',gap:16,alignItems:'center',marginTop:i?16:0}}>
              <div style={{width:42,height:42,borderRadius:21,background:brand.crimson,
                color:brand.white,fontFamily:'DM Sans',fontSize:25,fontWeight:700,
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
              <div style={{fontFamily:handFamilies.caveat,fontSize:62,fontWeight:600,
                color:brand.charcoal,lineHeight:1.15,whiteSpace:'nowrap'}}>{tip.lines.join(' ')}</div>
            </div>
          ))}
        </div>
        <MetalBox kind="copper" variant="deep" seed={17} style={{
          position:'absolute',top:-15,left:375,width:190,height:43,borderRadius:8,
          boxShadow:'0 4px 8px rgba(0,0,0,.3)',
        }}>
          <div style={{position:'absolute',left:16,right:16,top:10,height:8,
            borderRadius:4,background:'rgba(0,0,0,.2)'}} />
        </MetalBox>
      </div>
    </Arrival>
  </div>;
}

function AppreciationCards({tips}: {tips: Props['tips']}) {
  return <>{tips.map((tip,i) => (
    <div key={tip.at} style={{position:'absolute',top:1060+i*137,left:70,width:940,
      transform:'rotate('+([-.8,.7,-.5][i]??0)+'deg)'}}>
      <Arrival at={tip.at} snap>
        <div style={{position:'relative',padding:'20px 24px',backgroundColor:brand.white,
          borderRadius:5,boxShadow:'0 10px 25px rgba(0,0,0,.3)'}}>
          <MetalRim radius={5} thickness={3} kind="copper" variant="deep" seed={30+i} />
          <div style={{fontFamily:handFamilies.caveat,fontSize:61,fontWeight:600,
            color:brand.charcoal,lineHeight:1.1,textAlign:'center',whiteSpace:'nowrap'}}>
            <span style={{color:brand.crimson}}>{i+1}. </span>{tip.lines.join(' ')}
          </div>
        </div>
      </Arrival>
    </div>
  ))}</>;
}

const bodies = {
  'invitation-messages': InvitationMessages,
  'invitation-cards': CenteredCards,
  'rest-cards': CenteredCards,
  'invitation-envelope': InvitationEnvelope,
  'visitor-checklist': VisitorChecklist,
  'announcement-note': AnnouncementNote,
  'announcement-numbered': AnnouncementNumbered,
  'welcome-clipboard': WelcomeClipboard,
  'appreciation-cards': AppreciationCards,
};

export function NextClinicNotes(props: Props) {
  const Body = bodies[props.treatment];
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <Hook hook={props.hook} hookAt={props.hookAt} hookTop={props.hookTop} hookSize={props.hookSize} hookEffect={props.hookEffect}
      paper={props.treatment.startsWith('invitation-')} inset={props.inset} />
    {!props.profileCover && (props.inset ? <InsetClinicBody {...props} /> : <Body {...props} />)}
  </AbsoluteFill>;
}
