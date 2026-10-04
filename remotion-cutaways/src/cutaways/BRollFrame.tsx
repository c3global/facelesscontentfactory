import React from 'react';
import {Img, OffthreadVideo, interpolate} from 'remotion';
import {Glass, useGlassMotion} from '../Glass';
import {colors, copperGradient, fonts} from '../theme';

type Props = {
  durationInFrames: number;
  caption?: string;
  /** Path inside /public. Image (.png/.jpg/.webp) or video (.mp4/.mov). Omit for the built-in motion stand-in. */
  src?: string;
  top?: number;
};

const Corner: React.FC<{pos: 'tl' | 'tr' | 'bl' | 'br'}> = ({pos}) => {
  const size = 54;
  const s: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderColor: '#F4CDB8',
    borderStyle: 'solid',
    borderWidth: 0,
    filter: 'drop-shadow(0 0 10px rgba(233,176,138,0.8))',
  };
  if (pos === 'tl') Object.assign(s, {top: 22, left: 22, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 16});
  if (pos === 'tr') Object.assign(s, {top: 22, right: 22, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 16});
  if (pos === 'bl') Object.assign(s, {bottom: 22, left: 22, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 16});
  if (pos === 'br') Object.assign(s, {bottom: 22, right: 22, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 16});
  return <div style={s} />;
};

/** Stand-in motion so the frame reads as a window before real B-roll is dropped in. */
const StandIn: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / 30;
  const orbs = [
    {x: 28, y: 36, r: 230, c: colors.crimson, sp: 0.7, ph: 0},
    {x: 70, y: 62, r: 280, c: '#B87333', sp: 0.5, ph: 2},
    {x: 48, y: 20, r: 200, c: '#5B2A73', sp: 0.9, ph: 4},
  ];
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#1a0b24,#2A1237 55%,#0B0710)'}}>
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${o.x + Math.sin(t * o.sp + o.ph) * 10}%`,
            top: `${o.y + Math.cos(t * o.sp * 0.8 + o.ph) * 9}%`,
            width: o.r,
            height: o.r,
            marginLeft: -o.r / 2,
            marginTop: -o.r / 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${o.c}cc 0%, ${o.c}00 70%)`,
            filter: 'blur(14px)',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(244,205,184,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(244,205,184,0.09) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          backgroundPosition: `0px ${(frame * 0.8) % 64}px`,
        }}
      />
    </div>
  );
};

/** Glass window for B-roll with copper corner brackets and a caption strip. */
export const BRollFrame: React.FC<Props> = ({durationInFrames, caption, src, top = 720}) => {
  const {frame} = useGlassMotion(durationInFrames);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const isVideo = !!src && /\.(mp4|mov|webm)$/i.test(src);

  return (
    <Glass durationInFrames={durationInFrames} width={920} height={640} top={top} padding={20} radius={48}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 600,
          borderRadius: 32,
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`}}>
          {src ? (
            isVideo ? (
              <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            )
          ) : (
            <StandIn frame={frame} />
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 55%, rgba(11,7,16,0.72) 100%)',
          }}
        />
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
        {caption && (
          <div
            style={{
              position: 'absolute',
              left: 44,
              right: 44,
              bottom: 40,
              fontFamily: fonts.display,
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 56,
              lineHeight: 1.1,
              color: colors.white,
              textShadow: '0 2px 20px rgba(11,7,16,0.8)',
            }}
          >
            {caption}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 6,
            background: copperGradient,
            opacity: 0.9,
          }}
        />
      </div>
    </Glass>
  );
};
