import React, {createContext, useContext} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  Palette,
  Mood,
  FieldOption,
  SansOption,
  brand,
  goldGradient,
  paletteFor,
  roseGoldBright,
  roseGoldGradient,
  roseGoldOnWhite,
} from './brand';
import {serifFamily, sansFamily} from './fonts';

type ThemeCtx = {palette: Palette; sans: SansOption; mood: Mood; field: FieldOption};
const Ctx = createContext<ThemeCtx>({
  palette: paletteFor('light', 'crimson'),
  sans: 'DM Sans',
  mood: 'light',
  field: 'crimson',
});

export const ThemeProvider: React.FC<{
  mood: Mood;
  field: FieldOption;
  sans: SansOption;
  children: React.ReactNode;
}> = ({mood, field, sans, children}) => (
  <Ctx.Provider value={{palette: paletteFor(mood, field), sans, mood, field}}>{children}</Ctx.Provider>
);
export const useTheme = () => useContext(Ctx);

/** Graphic-local time: converts absolute video seconds to frames inside the graphic's Sequence. */
const TimeCtx = createContext<number>(0);
export const GraphicTimeProvider: React.FC<{atSec: number; children: React.ReactNode}> = ({atSec, children}) => (
  <TimeCtx.Provider value={atSec}>{children}</TimeCtx.Provider>
);
export const useRel = () => {
  const atSec = useContext(TimeCtx);
  const {fps} = useVideoConfig();
  return (absSec: number) => Math.round((absSec - atSec) * fps);
};

export const useSans = () => sansFamily(useContext(Ctx).sans);
export const serif = serifFamily;

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Card entrance measured from the references: ~5 frames at 30fps, short slide. */
export const useCardMotion = (delayFrames = 0, enterFrames = 6, exitFrames = 6) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const inP = interpolate(frame - delayFrames, [0, enterFrames], [0, 1], {...clamp, easing: easeOut});
  const outP = interpolate(frame, [durationInFrames - exitFrames, durationInFrames], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  return {
    frame,
    opacity: inP * (1 - outP),
    translateY: (1 - inP) * 28 - outP * 14,
    scale: 0.97 + inP * 0.03,
    inP,
  };
};

/** Metallic text. `sheenAt` (frame, relative) plays one sheen sweep across the glyphs. */
export const metalText = (
  kind: 'rose' | 'roseBright' | 'roseOnWhite' | 'gold',
  sheenProgress?: number,
): React.CSSProperties => {
  const metal =
    kind === 'gold' ? goldGradient : kind === 'roseBright' ? roseGoldBright : kind === 'roseOnWhite' ? roseGoldOnWhite : roseGoldGradient;
  const hasSheen = sheenProgress !== undefined && sheenProgress > 0 && sheenProgress < 1;
  const base: React.CSSProperties = {
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
  };
  if (!hasSheen) return {...base, backgroundImage: metal};
  const pos = 120 - sheenProgress! * 140;
  return {
    ...base,
    backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 62%), ${metal}`,
    backgroundSize: '300% 100%, 100% 100%',
    backgroundPosition: `${pos}% 0, 0 0`,
    backgroundRepeat: 'no-repeat',
  };
};

/** White card used by every graphic. Hairline in rose gold, soft charcoal shadow. */
export const Card: React.FC<{
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({style, children}) => {
  const {mood} = useTheme();
  return (
    <div
      style={{
        background: brand.white,
        borderRadius: 34,
        border: '2px solid rgba(183,110,121,0.55)',
        boxShadow:
          mood === 'dark'
            ? '0 30px 70px rgba(0,0,0,0.38), 0 4px 10px rgba(0,0,0,0.18)'
            : '0 26px 60px rgba(58,63,66,0.16), 0 3px 8px rgba(58,63,66,0.08)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Small spaced-caps label. On a card it is crimson; on the field it follows the mood. */
export const Label: React.FC<{
  children: React.ReactNode;
  onCard?: boolean;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, onCard = true, size = 24, style}) => {
  const {palette} = useTheme();
  const sans = useSans();
  const color = onCard ? brand.crimson : palette.labelOnBg;
  return (
    <div
      style={{
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Splits text into words, flagging the ones in the emphasis list (case and punctuation insensitive). */
export const normalizeWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
export const isEmphasis = (word: string, list: string[] | undefined) =>
  !!list && list.map(normalizeWord).includes(normalizeWord(word));

export {brand};
