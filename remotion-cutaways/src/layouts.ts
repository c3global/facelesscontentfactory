import type {FieldOption, Mood, SansOption} from './brand';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

/** Platform-button safe zone: no text in the top 12%, bottom 22%, or right 12%. */
export const SAFE = {
  top: Math.round(H * 0.12), // 230
  bottom: Math.round(H * 0.78), // 1498
  right: Math.round(W * 0.88), // 950
  left: 60,
};

export type LayoutKey = 'A' | 'B' | 'C' | 'D';
export type AvatarMode = 'window' | 'circle' | 'hidden';

/** Where she lives for each layout. Everything is animated between these states. */
export type AvatarState = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number; // border radius in px
  zoom: number; // inner zoom, anchored on the face
  focusY: number; // percent from top: where the face sits when cropped
  opacity: number;
  frame: number; // 0..1: soft shadow + hairline frame strength
};

export const AVATAR: Record<LayoutKey | 'Chidden', AvatarState> = {
  // A: full-bleed hook
  A: {x: 0, y: 0, w: W, h: H, r: 0, zoom: 1, focusY: 30, opacity: 1, frame: 0},
  // B: rounded window with the caption pill under her chin. Pill bottom stays above y=1498.
  B: {x: 60, y: 1030, w: 960, h: 500, r: 46, zoom: 1, focusY: 15, opacity: 1, frame: 1},
  // C: small circle, top left, graphic takes the screen
  C: {x: 70, y: 330, w: 200, h: 200, r: 100, zoom: 2.5, focusY: 24, opacity: 1, frame: 1},
  Chidden: {x: 70, y: 330, w: 200, h: 200, r: 100, zoom: 2.5, focusY: 24, opacity: 0, frame: 1},
  // D: small rounded portrait, top right, under the 12% safe line
  D: {x: 770, y: 250, w: 250, h: 430, r: 38, zoom: 1.45, focusY: 24, opacity: 1, frame: 1},
};

export const stateFor = (layout: LayoutKey, avatar?: AvatarMode): AvatarState => {
  if (layout === 'C' && avatar === 'hidden') return AVATAR.Chidden;
  return AVATAR[layout];
};

/** The rectangle graphics are allowed to fill for each layout (text stays inside SAFE). */
export type Rect = {x: number; y: number; w: number; h: number};
export const GRAPHIC_AREA: Record<LayoutKey, Rect> = {
  A: {x: 60, y: 300, w: 960, h: 900},
  B: {x: 60, y: 250, w: 960, h: 770},
  C: {x: 60, y: 560, w: 960, h: 800},
  D: {x: 60, y: 720, w: 960, h: 640},
};

export const CAPTION = {
  /** centered at 540, max 780 wide so the right edge stays <= 930 */
  maxWidth: 780,
  A_y: 1170,
  pill_y: 1440,
  bottom_y: 1415,
};

/** Layout change timing measured from the references: ~0.33s, hard ease-out. */
export const TRANSITION_FRAMES = 12;

export type Theme = {field: FieldOption; sans: SansOption};
export type MoodTheme = Theme & {mood: Mood};
