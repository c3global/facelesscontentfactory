/**
 * Single source of truth for C3 Global video brand tokens.
 *
 * Only these colors may appear in a render. No cream, ivory, off-white or eggplant:
 * white is #FFFFFF, and eggplant belongs to the Substack publication only.
 */
export const brand = {
  crimson: '#C91B19',
  crimsonDeep: '#6F0D0F', // deeper tone of the same crimson, used for field gradients
  crimsonMid: '#A31516',
  roseGold: '#B76E79',
  roseSecondary: '#D48A8C',
  gold: '#D5AA4A',
  white: '#FFFFFF',
  black: '#000000',
  charcoal: '#3A3F42',
} as const;

/** Metallic finishes: highlight stop, base tone, deeper shadow stop leaning slightly copper. */
export const roseGoldGradient =
  'linear-gradient(135deg, #F6D2CC 0%, #D48A8C 22%, #B76E79 46%, #A35A58 70%, #D79A86 100%)';
/** Same finish with a lower-key highlight so emphasis words stay legible on white cards. */
export const roseGoldOnWhite =
  'linear-gradient(135deg, #D9959A 0%, #B76E79 38%, #94505B 68%, #C98A86 100%)';
/** Same finish, weighted toward the highlight so it stays legible on a crimson field. */
export const roseGoldBright =
  'linear-gradient(135deg, #FBE3DE 0%, #F0B9B4 30%, #D48A8C 62%, #F3C4B8 100%)';
export const goldGradient =
  'linear-gradient(135deg, #F6E3A6 0%, #D5AA4A 42%, #A47E2A 72%, #E6C46C 100%)';

export type FieldOption = 'crimson' | 'charcoal' | 'rosegold';
export type SansOption = 'DM Sans' | 'Montserrat';
export type Mood = 'dark' | 'light';

/** Full-screen field gradients used by dark mood. `crimson` is the brand default. */
export const fieldGradients: Record<FieldOption, string> = {
  crimson: `linear-gradient(165deg, ${brand.crimson} 0%, ${brand.crimsonMid} 52%, ${brand.crimsonDeep} 100%)`,
  charcoal: `linear-gradient(165deg, ${brand.charcoal} 0%, #1C1F21 55%, ${brand.black} 100%)`,
  rosegold: `linear-gradient(165deg, ${brand.roseSecondary} 0%, ${brand.roseGold} 52%, #8E4F57 100%)`,
};

/** Light mood: white base with very soft charcoal-tinted diagonal light bands. */
export const lightField = `
  linear-gradient(118deg, rgba(58,63,66,0) 0%, rgba(58,63,66,0.05) 22%, rgba(58,63,66,0) 38%, rgba(58,63,66,0.035) 62%, rgba(58,63,66,0) 80%),
  ${brand.white}`;

export type Palette = {
  mood: Mood;
  field: FieldOption;
  /** text color directly on the scene background (not on a card) */
  onBg: string;
  /** small-label color on the scene background */
  labelOnBg: string;
  /** whether metallic text on the bg should use the bright variant */
  brightMetal: boolean;
  /** text on white cards */
  onCard: string;
  /** muted text on white cards */
  onCardMuted: string;
  /** shadow for text drawn over video / dark fields */
  shadow: string;
};

export const paletteFor = (mood: Mood, field: FieldOption): Palette => {
  const onRoseField = mood === 'dark' && field === 'rosegold';
  return {
    mood,
    field,
    onBg: mood === 'light' ? brand.charcoal : onRoseField ? brand.charcoal : brand.white,
    labelOnBg: mood === 'light' ? brand.crimson : onRoseField ? brand.charcoal : brand.white,
    brightMetal: mood === 'dark' && field !== 'rosegold',
    onCard: brand.charcoal,
    onCardMuted: 'rgba(58,63,66,0.62)',
    shadow: mood === 'light' ? 'none' : '0 2px 18px rgba(0,0,0,0.45)',
  };
};
