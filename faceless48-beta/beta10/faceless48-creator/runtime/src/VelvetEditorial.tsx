import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import brand, {accentRgba} from './brandConfig';
import {ClinicTypeTrials} from './ClinicTypeTrials';

export const velvetEditorialSchema = z.object({
  treatment: z.enum(['engraved-serif', 'gallery-sans', 'copper-script']).optional(),
  hook: z.tuple([z.string(), z.string(), z.string()]),
  hookAt: z.number().nonnegative(),
  tips: z.array(z.object({
    lead: z.string(),
    accent: z.string(),
    at: z.number().nonnegative(),
  })).min(1).max(4),
});

const FAMILY = 'C3 Velvet Cormorant';
const SERIF = `"${FAMILY}", Georgia, serif`;
const SHADOW = '0 2px 4px #000, 0 6px 22px rgba(0, 0, 0, .85)';
const FOIL: React.CSSProperties = {
  display: 'inline-block',
  backgroundImage: `linear-gradient(161deg, ${brand.metalLight} 3%, ${brand.metal} 36%, ${brand.metalLight} 53%, ${brand.metalLight} 62%, ${brand.metal} 89%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  textShadow: 'none',
  filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, .85))',
};

const VelvetFonts: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading the C3 editorial type'));
  useEffect(() => {
    const variants = [['600', 'normal'], ['600', 'italic'], ['700', 'normal']];
    Promise.all(variants.map(async ([weight, style]) => {
      const file = staticFile(`fonts/cormorant-garamond-latin-${weight}-${style}.woff2`);
      const face = await new FontFace(FAMILY, `url("${file}")`, {weight, style}).load();
      document.fonts.add(face);
    })).then(() => continueRender(handle)).catch((error) => {
      console.error(error);
      continueRender(handle);
    });
  }, [handle]);
  return null;
};

/** The masked rise used by Faceless48's kinetic hook, adjusted for music cues. */
const Rise: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const first = Math.round(at * fps);
  if (frame < first) return null;
  const travel = interpolate(frame, [first, first + 6], [32, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: (x) => 1 - (1 - x) ** 4,
  });
  return <div style={{overflow: 'hidden', padding: '4px 10px 8px'}}>
    <div style={{transform: `translateY(${travel}px)`}}>{children}</div>
  </div>;
};

const VelvetWash: React.FC<z.infer<typeof velvetEditorialSchema>> = ({hook, hookAt, tips}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const firstTip = Math.round(tips[0].at * fps);
  const velvet = interpolate(frame, [firstTip - 2, firstTip + 9], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const tipGap = tips.length === 4 ? 144 : 165;
  const tipTop = tips.length === 4 ? 650 : 805;
  return <AbsoluteFill style={{pointerEvents: 'none', color: '#FFFFFF', fontFamily: SERIF}}>
    <VelvetFonts />
    <AbsoluteFill style={{
      opacity: velvet,
      background: [
        `radial-gradient(ellipse at 10% 64%, ${accentRgba(.45)} 1%, ${accentRgba(.25)} 32%, transparent 72%)`,
        'linear-gradient(101deg, rgba(0,0,0,.82) 1%, rgba(0,0,0,.55) 37%, rgba(0,0,0,.08) 93%)',
      ].join(', '),
    }} />
    <div style={{position: 'absolute', top: 344, left: 114, right: 132, textShadow: SHADOW}}>
      <Rise at={hookAt}>
        <div style={{fontSize: 78, fontWeight: 700, lineHeight: .91, letterSpacing: -1.7}}>
          {hook[0]}<br />{hook[1]}
        </div>
        <div style={{marginTop: 11, fontSize: 65, fontWeight: 600, fontStyle: 'italic', lineHeight: .97}}>
          <span style={FOIL}>{hook[2]}</span>
        </div>
      </Rise>
    </div>
    {tips.map((tip, i) => (
      <div key={tip.at} style={{position: 'absolute', top: tipTop + i * tipGap, left: 114, right: 130, textShadow: SHADOW}}>
        <Rise at={tip.at}>
          <div style={{height: 3, width: 81, backgroundColor: brand.accent, marginBottom: 10}} />
          <div style={{fontSize: 58, fontWeight: 600, lineHeight: 1.08, whiteSpace: 'nowrap'}}>
            {tip.lead}{' '}<span style={{...FOIL, fontSize: 86, fontStyle: 'italic', lineHeight: .98}}>{tip.accent}</span>
          </div>
        </Rise>
      </div>
    ))}
  </AbsoluteFill>;
};

export const VelvetEditorial: React.FC<z.infer<typeof velvetEditorialSchema>> = (props) =>
  props.treatment
    ? <ClinicTypeTrials {...props} treatment={props.treatment} />
    : <VelvetWash {...props} />;
