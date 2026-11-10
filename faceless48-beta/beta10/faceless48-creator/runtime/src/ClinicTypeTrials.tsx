import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import brand from './brandConfig';

export type Treatment = 'engraved-serif' | 'gallery-sans' | 'copper-script';
type Tip = {lead: string; accent: string; at: number};
type Props = {treatment: Treatment; hook: [string, string, string]; hookAt: number; tips: Tip[]};

const shadow = '0 2px 2px #000, 0 4px 9px rgba(0,0,0,.95), 0 5px 22px rgba(0,0,0,.7)';
const foil: React.CSSProperties = {
  display: 'inline-block',
  backgroundImage: `linear-gradient(155deg, ${brand.metalLight} 8%, ${brand.metal} 30%, ${brand.metalLight} 54%, ${brand.metalLight} 65%, ${brand.metal} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 2px 1px #000) drop-shadow(0 2px 7px rgba(0,0,0,.75))',
  textShadow: 'none',
};
const crimson: React.CSSProperties = {
  color: brand.accent,
  WebkitTextStroke: '0.7px #F1B9A5',
  paintOrder: 'stroke fill',
  textShadow: shadow,
};
const titleSerif = '"Playfair Display", Georgia, serif';
const gallerySans = '"C3 Manrope", sans-serif';
const scriptSerif = '"C3 Cormorant", Georgia, serif';

function TrialFonts() {
  const [handle] = useState(() => delayRender('Loading type for the November 4 trials'));
  useEffect(() => {
    const faces = [
      ['C3 Manrope', 'manrope-latin-500-normal.woff2', '500', 'normal'],
      ['C3 Manrope', 'manrope-latin-700-normal.woff2', '700', 'normal'],
      ['C3 Manrope', 'manrope-latin-800-normal.woff2', '800', 'normal'],
      ['C3 Cormorant', 'cormorant-garamond-latin-700-italic.woff2', '700', 'italic'],
    ];
    Promise.all(faces.map(async ([name, file, weight, style]) => {
      const face = await new FontFace(name, `url("${staticFile('fonts/' + file)}")`, {weight, style}).load();
      document.fonts.add(face);
    })).then(() => continueRender(handle)).catch((error) => {
      console.error(error);
      continueRender(handle);
    });
  }, [handle]);
  return null;
}

/** Three restrained takes on the Faceless48 kinetic hook, each locked to the same cue. */
function Entrance({at, treatment, children}: {at: number; treatment: Treatment; children: React.ReactNode}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cue = Math.round(at * fps);
  if (frame < cue) return null;
  const length = treatment === 'gallery-sans' ? 4 : 7;
  const t = interpolate(frame, [cue, cue + length], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (x) => 1 - (1 - x) ** 3,
  });
  const move = {
    'engraved-serif': `translateY(${(1 - t) * 28}px)`,
    'gallery-sans': `scale(${0.96 + t * 0.04})`,
    'copper-script': `translateX(${(1 - t) * -26}px)`,
  }[treatment];
  return <div style={{overflow: 'hidden', padding: '9px 12px 15px'}}>
    <div style={{transform: move, opacity: .46 + .54 * t}}>{children}</div>
  </div>;
}

function EngravedSerif({hook, hookAt, tips, treatment}: Props) {
  return <>
    <div style={{position: 'absolute', top: 342, left: 112, width: 775, fontFamily: titleSerif}}>
      <Entrance at={hookAt} treatment={treatment}>
        <div style={{fontSize: 65, fontWeight: 700, lineHeight: 1.03, letterSpacing: -1.1}}>
          {hook[0]}<br />{hook[1]}
        </div>
        <div style={{...foil, fontSize: 48, fontWeight: 600, fontStyle: 'italic', marginTop: 7}}>{hook[2]}</div>
      </Entrance>
    </div>
    {tips.map((tip, i) =>
      <div key={tip.at} style={{position: 'absolute', left: 112, top: 790 + i * 139, width: 780, fontFamily: titleSerif}}>
        <Entrance at={tip.at} treatment={treatment}>
          <div style={{width: 54, height: 3, backgroundColor: brand.accent, marginBottom: 7, boxShadow: '0 1px 4px #000'}} />
          <div style={{fontWeight: 600, fontSize: 45, lineHeight: 1.2}}>
            {tip.lead}{' '}<span style={{...foil, fontWeight: 600, fontStyle: 'italic', fontSize: 66}}>{tip.accent}</span>
          </div>
        </Entrance>
      </div>
    )}
  </>;
}

function GallerySans({hook, hookAt, tips, treatment}: Props) {
  return <>
    <div style={{position: 'absolute', top: 350, left: 115, width: 756, textAlign: 'center', fontFamily: gallerySans}}>
      <Entrance at={hookAt} treatment={treatment}>
        <div style={{fontSize: 61, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2.3}}>
          {hook[0]}<br />{hook[1]}
        </div>
        <div style={{marginTop: 14, fontSize: 42, fontWeight: 800, letterSpacing: 1}}>
          <span style={crimson}>{hook[2]}</span>
        </div>
      </Entrance>
    </div>
    {tips.map((tip, i) =>
      <div key={tip.at} style={{position: 'absolute', left: 115, width: 756, top: 815 + i * 125, textAlign: 'center', fontFamily: gallerySans}}>
        <Entrance at={tip.at} treatment={treatment}>
          <div style={{fontSize: 47, fontWeight: 500, lineHeight: 1.18, letterSpacing: -1}}>
            {tip.lead}{' '}<strong style={{fontWeight: 800}}>{tip.accent}</strong>
          </div>
          <div style={{width: 72, height: 3, margin: '13px auto 0', backgroundColor: brand.accent, boxShadow: '0 1px 4px #000'}} />
        </Entrance>
      </div>
    )}
  </>;
}

function CopperScript({hook, hookAt, tips, treatment}: Props) {
  return <>
    <div style={{position: 'absolute', top: 349, left: 105, width: 780, fontFamily: scriptSerif}}>
      <Entrance at={hookAt} treatment={treatment}>
        <div style={{fontSize: 74, fontWeight: 700, fontStyle: 'italic', lineHeight: .96, letterSpacing: -.9}}>
          {hook[0]}<br />{hook[1]}
        </div>
        <div style={{fontFamily: gallerySans, fontSize: 35, fontWeight: 700, marginTop: 12}}>
          <span style={crimson}>{hook[2]}</span>
        </div>
      </Entrance>
    </div>
    {tips.map((tip, i) =>
      <div key={tip.at} style={{position: 'absolute', left: 108, width: 412, top: 774 + i * 157}}>
        <Entrance at={tip.at} treatment={treatment}>
          <div style={{borderLeft: `3px solid ${brand.accent}`, paddingLeft: 21}}>
            <div style={{fontFamily: gallerySans, fontSize: 35, lineHeight: 1.04, fontWeight: 700}}>
              {tip.lead}
            </div>
            <div style={{...foil, marginTop: -4, fontFamily: scriptSerif, fontSize: 88, fontStyle: 'italic', fontWeight: 700, lineHeight: 1}}>
              {tip.accent}
            </div>
          </div>
        </Entrance>
      </div>
    )}
  </>;
}

const layouts = {'engraved-serif': EngravedSerif, 'gallery-sans': GallerySans, 'copper-script': CopperScript};

export function ClinicTypeTrials(props: Props) {
  const Layout = layouts[props.treatment];
  return <AbsoluteFill style={{pointerEvents: 'none', color: '#FFFFFF', textShadow: shadow}}>
    <TrialFonts />
    <Layout {...props} />
  </AbsoluteFill>;
}
