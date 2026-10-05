import type {FieldOption, Mood, SansOption} from './brand';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

/** Platform-button safe zone: no text in the top 12%, bottom 22%, or right 12% of the frame. */
export const SAFE = {
  top: Math.round(H * 0.12), // 230
  bottom: Math.round(H * 0.78), // 1498
  right: Math.round(W * 0.88), // 950
  left: 60,
};

export type LayoutKey = 'A' | 'B' | 'C' | 'D';
export type AvatarMode = 'circle' | 'hidden';

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
  frame: number; // 0..1: glass bezel and metal rim strength
};

export const AVATAR: Record<LayoutKey | 'Chidden', AvatarState> = {
  // A: full-bleed hook
  A: {x: 0, y: 0, w: W, h: H, r: 0, zoom: 1, focusY: 30, opacity: 1, frame: 0},
  // B: liquid glass window. It ends at y=1380 so the caption pill sits below it, clear of the bottom 22%.
  B: {x: 60, y: 890, w: 960, h: 490, r: 50, zoom: 1, focusY: 15, opacity: 1, frame: 1},
  // C: corner circle, 280px (40% bigger than before) with a thick metal ring
  C: {x: 70, y: 280, w: 280, h: 280, r: 140, zoom: 2.4, focusY: 24, opacity: 1, frame: 1},
  // C hidden: she is gone, audio keeps running
  Chidden: {x: 70, y: 280, w: 280, h: 280, r: 140, zoom: 2.4, focusY: 24, opacity: 0, frame: 1},
  // D: small portrait window, top right, under the 12% safe line
  D: {x: 760, y: 250, w: 260, h: 440, r: 44, zoom: 1.45, focusY: 24, opacity: 1, frame: 1},
};

export const stateFor = (layout: LayoutKey, avatar?: AvatarMode): AvatarState => {
  if (layout === 'C' && avatar === 'hidden') return AVATAR.Chidden;
  return AVATAR[layout];
};

/** The rectangle graphics are allowed to fill for each layout (text stays inside SAFE). */
export type Rect = {x: number; y: number; w: number; h: number};
export const GRAPHIC_AREA: Record<LayoutKey | 'Chidden', Rect> = {
  A: {x: 60, y: 300, w: 960, h: 900},
  B: {x: 60, y: 250, w: 960, h: 620},
  C: {x: 60, y: 620, w: 960, h: 740},
  Chidden: {x: 60, y: 250, w: 960, h: 1090},
  D: {x: 60, y: 720, w: 960, h: 640},
};

export const areaFor = (layout: LayoutKey, avatar?: AvatarMode): Rect =>
  layout === 'C' && avatar === 'hidden' ? GRAPHIC_AREA.Chidden : GRAPHIC_AREA[layout];

export const CAPTION = {
  /** centered at 540, max 820 wide so the right edge stays <= 950 */
  maxWidth: 820,
  A_y: 1180,
  pill_y: 1440,
  bottom_y: 1430,
};

/** Layout change timing measured from the references: ~0.33s, hard ease-out. */
export const TRANSITION_FRAMES = 12;

export type Theme = {field: FieldOption; sans: SansOption};
export type MoodTheme = Theme & {mood: Mood};
