import {customerBrand} from './brandConfig';
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Arrival, Surface, Paper} from './ClinicCardTrials';
import {brand} from './brand';
import {handFamilies} from './fonts';
import {MetalBox, MetalRim} from './metal';
import type {Props} from './NextClinicNotes';

type TipProps = {tips: Props['tips']};

export function CenteredCards({tips, treatment}: Pick<Props, 'tips' | 'treatment'>) {
  const rest = treatment === 'rest-cards';
  let offset = 1080;
  return <>{tips.map((tip, index) => {
    const top = offset;
    offset += 125;
    return (
      <div key={tip.at} style={{position: 'absolute', top, left: rest ? 45 : 70, width: rest ? 990 : 940}}>
        <Arrival at={tip.at} snap>
          <Surface radius={20} dark opacity={.93}>
            <div style={{
              fontFamily: handFamilies.caveat, fontWeight: 600,
              color: brand.white, fontSize: rest ? 60 : 64, lineHeight: 1.08,
              padding: '17px 25px 20px', textAlign: 'center', whiteSpace: 'nowrap',
            }}>
              <span style={{color: `${customerBrand.metalLight}`}}>{index + 1}. </span>
              {tip.lines.join(' ')}
            </div>
          </Surface>
        </Arrival>
      </div>
    );
  })}</>;
}

/** Adapt the Faceless48 envelope-open effect to reveal three readable tips. */
export function InvitationEnvelope({tips}: TipProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const opening = interpolate(frame, [Math.round((tips[0].at - .95) * fps), Math.round((tips[0].at - .45) * fps)], [0, 1], clamp);
  const rise = interpolate(frame, [Math.round((tips[0].at - .65) * fps), Math.round(tips[0].at * fps)], [0, 1], {
    ...clamp,
    easing: x => 1 - (1 - x) ** 3,
  });
  return (
    <div style={{position: 'absolute', top: 860, left: 70, width: 940, height: 640, perspective: 1200}}>
      <Arrival at={.65}>
        <div style={{
          position: 'absolute', left: 0, top: 280, width: 940, height: 360,
          borderRadius: 16, background: brand.crimsonDeep, zIndex: 1,
          boxShadow: '0 12px 30px rgba(0,0,0,.35)',
        }}>
          <MetalRim radius={16} thickness={4} kind="copper" variant="bright" seed={23} />
        </div>
        <div style={{
          position: 'absolute', top: 285 - rise * 205, left: 24, width: 892, height: 320,
          boxSizing: 'border-box', padding: '24px 18px', backgroundColor: brand.white,
          borderRadius: 7, boxShadow: '0 9px 22px rgba(0,0,0,.3)', zIndex: rise > .55 ? 4 : 0,
        }}>
          <MetalRim radius={7} thickness={2} kind="copper" variant="deep" seed={8} />
          {tips.map((tip, index) => frame < Math.round(tip.at * fps) ? null : (
            <div key={tip.at} style={{
              fontFamily: handFamilies.caveat, fontWeight: 600, fontSize: 62, lineHeight: 1.1,
              marginTop: index ? 17 : 0, color: brand.charcoal, whiteSpace: 'nowrap',
            }}>
              <span style={{color: brand.crimson}}>{index + 1}. </span>
              {tip.lines.join(' ')}
            </div>
          ))}
        </div>
        <div style={{
          position: 'absolute', left: 0, top: 280, width: 940, height: 360, zIndex: 2,
          borderRadius: 16, overflow: 'hidden',
          background: 'linear-gradient(165deg,' + brand.crimson + ',' + brand.crimsonDeep + ')',
        }}>
          <svg width={940} height={360} viewBox="0 0 940 360">
            <path d="M0 0L470 230L940 0M0 360L329 180M940 360L611 180"
              fill="none" stroke={`${customerBrand.metal}`} strokeWidth={3} />
          </svg>
          <MetalRim radius={16} thickness={4} kind="copper" variant="bright" seed={23} />
        </div>
        <div style={{
          position: 'absolute', left: 0, top: 280, width: 940, height: 230, zIndex: 3,
          transformOrigin: '50% 0', transform: 'rotateX(' + (-opening * 175) + 'deg)',
          opacity: opening > .6 ? 0 : 1,
        }}>
          <svg width={940} height={230} viewBox="0 0 940 230">
            <polygon points="0,0 940,0 470,230" fill={brand.crimson} stroke={`${customerBrand.metal}`} strokeWidth={3} />
          </svg>
        </div>
        <MetalBox kind="copper" variant="deep" seed={11} style={{
          position: 'absolute', left: 428, top: 454, width: 84, height: 84, borderRadius: 42,
          zIndex: 5, opacity: 1 - opening, boxShadow: '0 4px 10px rgba(0,0,0,.4)',
        }}>
          <div style={{position: 'absolute', inset: 10, border: `2px solid ${customerBrand.metalLight}`, borderRadius: '50%'}} />
        </MetalBox>
      </Arrival>
    </div>
  );
}

export function AnnouncementNumbered({tips}: TipProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 1080, left: 45, width: 990}}>
      <Arrival at={tips[0].at} snap>
        <Paper padding="26px 18px 28px">
          {tips.map((tip, index) => frame < Math.round(tip.at * fps) ? null : (
            <div key={tip.at} style={{
              fontFamily: handFamilies.caveat, fontWeight: 600, fontSize: 60,
              color: brand.charcoal, lineHeight: 1.25, whiteSpace: 'nowrap',
              marginTop: index ? 4 : 0,
            }}>
              <span style={{color: brand.crimson}}>{index + 1}. </span>{tip.lines.join(' ')}
            </div>
          ))}
        </Paper>
      </Arrival>
    </div>
  );
}
