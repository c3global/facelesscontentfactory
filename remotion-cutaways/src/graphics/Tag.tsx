import React from 'react';
import {interpolate} from 'remotion';
import {GlassSurface} from '../glass';
import {MetalBox} from '../metal';
import {SAFE, W} from '../layouts';
import {clamp, easeOut, useBgMetal, useCardMotion, useSans, useTheme} from '../ui';

/**
 * Small spaced-caps label at the top of a scene, below the 12% safe line, over a metal rule.
 * On dark scenes it sits inside a black glass pill, so the metal rule never sits over the video.
 */
export const Tag: React.FC<{text: string}> = ({text}) => {
  const {frame, opacity} = useCardMotion(0, 8, 6);
  const {palette, mood} = useTheme();
  const metal = useBgMetal();
  const sans = useSans();
  const rule = interpolate(frame, [4, 18], [0, 1], {...clamp, easing: easeOut});
  const dark = mood === 'dark';

  return (
    <div style={{position: 'absolute', left: 0, top: SAFE.top + 18, width: W, display: 'flex', justifyContent: 'center'}}>
      <div style={{position: 'relative', padding: dark ? '18px 44px 20px' : '4px 0'}}>
        {dark && <GlassSurface variant="clear" tone="dark" radius={999} fade={opacity} rim={0} darkAlpha={0.88} elevated={false} />}
        <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity}}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 25,
              letterSpacing: '0.34em',
              paddingLeft: '0.34em',
              textTransform: 'uppercase',
              color: palette.labelOnBg,
            }}
          >
            {text}
          </div>
          <MetalBox variant={metal} seed={1} style={{height: 4, width: 170 * rule, borderRadius: 2}} />
        </div>
      </div>
    </div>
  );
};
