import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop} from '../backdrops';
import {FieldOption, brand} from '../brand';
import {loadBrandFonts, serifFamily, sansFamily} from '../fonts';
import {Card, GlassSurface, RefractDefs} from '../glass';
import {MetalBox, MetalGradient, MetalRim, MetalText} from '../metal';
import {ThemeProvider, useBgMetal} from '../ui';

const Inner: React.FC<{field: FieldOption}> = ({field}) => {
  const frame = useCurrentFrame();
  const metal = useBgMetal();
  const sans = sansFamily('DM Sans');
  return (
    <AbsoluteFill>
      <Backdrop kind={field} alt={0} frame={frame} />

      <div style={{position: 'absolute', left: 80, top: 330, fontFamily: serifFamily, fontWeight: 700, fontStyle: 'italic', fontSize: 190, lineHeight: 1}}>
        <MetalText variant={metal} seed={1} style={{filter: field === 'rosegold' ? 'drop-shadow(0 3px 8px rgba(58,63,66,0.55))' : undefined}}>Metal</MetalText>
      </div>
      <div style={{position: 'absolute', left: 80, top: 540, fontFamily: serifFamily, fontWeight: 700, fontStyle: 'italic', fontSize: 190, lineHeight: 1}}>
        <MetalText kind="gold" variant={metal} seed={3}>shimmer</MetalText>
      </div>

      {/* thick metal ring around clear glass */}
      <div style={{position: 'absolute', left: 90, top: 840, width: 300, height: 300, borderRadius: 150}}>
        <GlassSurface variant="clear" tone="dark" radius={150} refract rim={0} seed={4} />
        <MetalRim radius={150} thickness={18} variant={metal} seed={5} />
      </div>

      {/* badge */}
      <MetalBox
        variant={metal}
        seed={6}
        style={{position: 'absolute', left: 470, top: 930, padding: '14px 40px', borderRadius: 999, fontFamily: sans, fontWeight: 700, fontSize: 52, color: metal === 'bright' ? brand.charcoal : brand.white, boxShadow: '0 8px 24px rgba(0,0,0,0.3)'}}
      >
        +3 new
      </MetalBox>

      {/* connector line with a traveling glint */}
      <svg width={900} height={80} style={{position: 'absolute', left: 90, top: 1190}}>
        <defs>
          <MetalGradient id="demo-line" x1={20} y1={40} x2={880} y2={40} variant={metal} seed={7} />
        </defs>
        <line x1={20} y1={40} x2={880} y2={40} stroke="url(#demo-line)" strokeWidth={12} strokeLinecap="round" />
      </svg>

      {/* frosted card with body copy */}
      <div style={{position: 'absolute', left: 90, top: 1250, width: 900}}>
        <Card seed={8} contentStyle={{padding: '34px 44px', fontFamily: sans, fontWeight: 500, fontSize: 40, color: brand.charcoal, lineHeight: 1.25}}>
          Frosted glass keeps body copy legible while the backdrop drifts behind it.
        </Card>
      </div>

      {/* clear glass caption pill */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1500, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', padding: '8px 36px 12px'}}>
          <GlassSurface variant="clear" tone="dark" radius={999} refract rim={2.5} rimVariant="bright" seed={9} />
          <span style={{position: 'relative', fontFamily: sans, fontWeight: 700, fontSize: 60, color: brand.white}}>doesn't always</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** 3-second review clip for one field: backdrop motion, metal shimmer, frosted card, clear glass. */
export const FieldDemo: React.FC<{field: FieldOption}> = ({field}) => {
  loadBrandFonts();
  return (
    <ThemeProvider mood="dark" field={field} sans="DM Sans">
      <RefractDefs />
      <Inner field={field} />
    </ThemeProvider>
  );
};
