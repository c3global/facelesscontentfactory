import React from 'react';
import {Glass, neonCopperGlow, useGlassMotion} from '../Glass';
import {colors, copperText, fonts} from '../theme';

type Props = {text: string; durationInFrames: number; top?: number};

/** Call-to-action card with a bouncing arrow pointing down toward the link. */
export const CTACard: React.FC<Props> = ({text, durationInFrames, top = 1080}) => {
  const {frame} = useGlassMotion(durationInFrames);
  const bob = Math.sin(frame / 5) * 12;
  const pulse = 0.65 + 0.35 * Math.sin(frame / 7);

  return (
    <Glass durationInFrames={durationInFrames} width={860} top={top} padding={46} radius={999}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34}}>
        <div
          style={{
            fontFamily: fonts.display,
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1,
            color: colors.white,
            textShadow: `0 0 ${24 * pulse}px rgba(233,176,138,${0.55 * pulse})`,
          }}
        >
          {text}
        </div>
        <svg
          width="76"
          height="76"
          viewBox="0 0 24 24"
          style={{
            transform: `translateY(${bob}px)`,
            filter: `drop-shadow(0 0 12px rgba(233,176,138,${pulse}))`,
            flexShrink: 0,
          }}
        >
          <defs>
            <linearGradient id="cu" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F7D9C6" />
              <stop offset="1" stopColor="#B87333" />
            </linearGradient>
          </defs>
          <path
            d="M12 4v14m0 0l-6-6m6 6l6-6"
            fill="none"
            stroke="url(#cu)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Glass>
  );
};
