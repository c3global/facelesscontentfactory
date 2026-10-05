import React from 'react';
import {interpolate} from 'remotion';
import {brand} from '../brand';
import {GlassSurface} from '../glass';
import {MetalText} from '../metal';
import {clamp, easeOut, serif, useCardMotion, useRel, useSans, useTheme} from '../ui';
import {Holo} from './CongruenceMap';

/**
 * Cutaways that sit under her picture-in-picture window (x 130..950, y 650..1030), same glass and holographic
 * foil rim as the diagram pills so they read as one system.
 */
const Shell: React.FC<{children: React.ReactNode; height: number; fade: number; frame: number; seed: number}> = ({children, height, fade, frame, seed}) => {
  const {mood} = useTheme();
  const dark = mood === 'dark';
  return (
    <div style={{position: 'absolute', left: 130, top: 650, width: 820, height, opacity: fade}}>
      <GlassSurface variant="clear" tone={dark ? 'dark' : 'light'} radius={46} fade={fade} refract rim={0} seed={seed} darkAlpha={dark ? 0.3 : undefined} />
      <Holo i={seed} frame={frame} active={false} fade={fade} dark={dark} radius={46} />
      <div style={{position: 'relative', height: '100%'}}>{children}</div>
    </div>
  );
};

/** A community feed with a post nobody has answered. No numbers: it depicts the silence, not a metric. */
export const QuietFeed: React.FC<{label: string; post: string; status: string; statusAt: number}> = ({label, post, status, statusAt}) => {
  const {opacity, frame, translateY} = useCardMotion(0, 8, 8);
  const rel = useRel();
  const sans = useSans();
  const {mood} = useTheme();
  const dark = mood === 'dark';
  const ink = dark ? brand.white : brand.charcoal;
  const sIn = interpolate(frame - rel(statusAt), [0, 10], [0, 1], {...clamp, easing: easeOut});
  const pulse = 0.55 + 0.45 * Math.sin(frame / 6);
  return (
    <div style={{transform: `translateY(${translateY}px)`}}>
      <Shell height={330} fade={opacity} frame={frame} seed={3}>
        <div style={{padding: '34px 44px'}}>
          <div style={{fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: '0.24em', color: ink, opacity: 0.7}}>{label}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 26}}>
            <div style={{width: 84, height: 84, borderRadius: 999, flexShrink: 0, background: dark ? 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08))' : 'linear-gradient(135deg, rgba(58,63,66,0.35), rgba(58,63,66,0.08))', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.35)'}} />
            <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 52, lineHeight: 1.12, color: ink}}>{post}</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 34, opacity: sIn}}>
            <div style={{width: 16, height: 16, borderRadius: 999, background: brand.crimson, opacity: pulse, boxShadow: '0 0 18px rgba(201,27,25,0.7)'}} />
            <MetalText kind="crimson" variant={dark ? 'bright' : 'deep'} seed={9} style={{fontFamily: sans, fontWeight: 700, fontSize: 38}}>
              {status}
            </MetalText>
          </div>
        </div>
      </Shell>
    </div>
  );
};

/** A research citation: the source she is drawing on, set like a reference line. */
export const CitationCard: React.FC<{label: string; authors: string; year: string; title: string; source: string}> = ({label, authors, year, title, source}) => {
  const {opacity, frame, translateY} = useCardMotion(0, 8, 8);
  const sans = useSans();
  const {mood} = useTheme();
  const dark = mood === 'dark';
  const ink = dark ? brand.white : brand.charcoal;
  const line = (d: number) => interpolate(frame - d, [0, 10], [0, 1], {...clamp, easing: easeOut});
  return (
    <div style={{transform: `translateY(${translateY}px)`}}>
      <Shell height={380} fade={opacity} frame={frame} seed={5}>
        <div style={{padding: '30px 48px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: '0.24em', color: ink, opacity: 0.7}}>{label}</div>
            <MetalText kind="crimson" variant={dark ? 'bright' : 'deep'} seed={4} style={{fontFamily: sans, fontWeight: 800, fontSize: 40}}>
              {year}
            </MetalText>
          </div>
          <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 800, fontSize: 66, lineHeight: 1.05, color: ink, marginTop: 16, opacity: line(4), transform: `translateY(${(1 - line(4)) * 14}px)`}}>{authors}</div>
          <div style={{fontFamily: sans, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: ink, marginTop: 18, opacity: line(12)}}>{title}</div>
          <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 600, fontSize: 36, color: ink, opacity: 0.75 * line(18), marginTop: 12}}>{source}</div>
        </div>
      </Shell>
    </div>
  );
};
