import React, {createContext, useContext} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Palette, Mood, FieldOption, SansOption, MetalVariant, brand, paletteFor} from './brand';
import {serifFamily, sansFamily} from './fonts';

type ThemeCtx = {palette: Palette; sans: SansOption; mood: Mood; field: FieldOption; sceneIndex: number};
const Ctx = createContext<ThemeCtx>({
  palette: paletteFor('light', 'crimson'),
  sans: 'DM Sans',
  mood: 'light',
  field: 'crimson',
  sceneIndex: 0,
});

export const ThemeProvider: React.FC<{
  mood: Mood;
  field: FieldOption;
  sans: SansOption;
  sceneIndex?: number;
  children: React.ReactNode;
}> = ({mood, field, sans, sceneIndex = 0, children}) => (
  <Ctx.Provider value={{palette: paletteFor(mood, field), sans, mood, field, sceneIndex}}>{children}</Ctx.Provider>
);
export const useTheme = () => useContext(Ctx);

/** Metal variant for things that sit directly on the scene background. On cards always use 'deep'. */
export const useBgMetal = (): MetalVariant => useContext(Ctx).palette.metalOnBg;

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

/** Small spaced-caps label. Charcoal on cards; white or charcoal on the field depending on mood. */
export const Label: React.FC<{
  children: React.ReactNode;
  onCard?: boolean;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, onCard = true, size = 24, style}) => {
  const {palette} = useTheme();
  const sans = useSans();
  return (
    <div
      style={{
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: onCard ? brand.charcoal : palette.labelOnBg,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Words in the emphasis list render in the Playfair italic metal treatment. Case and punctuation insensitive. */
export const normalizeWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
export const isEmphasis = (word: string, list: string[] | undefined) =>
  !!list && list.map(normalizeWord).includes(normalizeWord(word));

export {brand};
