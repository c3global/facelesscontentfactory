import {CSSProperties} from 'react';

// C3 Global palette (from the Brand Blueprint "Palette" note)
export const colors = {
  crimson: '#C91B19',
  eggplant: '#2A1237',
  white: '#FFFFFF',
  black: '#0B0710',
  copperDeep: '#8C4A2A',
  copper: '#B87333',
  copperLight: '#E9B08A',
  roseGold: '#F4CDB8',
};

export const fonts = {
  display: '"Cormorant Garamond", "Times New Roman", serif',
  label: '"Manrope", "Helvetica Neue", Arial, sans-serif',
};

export const copperGradient =
  'linear-gradient(135deg, #8C4A2A 0%, #E9B08A 28%, #F7D9C6 46%, #B87333 64%, #E9B08A 82%, #8C4A2A 100%)';

export const copperText: CSSProperties = {
  backgroundImage: copperGradient,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

// Safe zones for a 1080x1920 vertical frame with the Dr. CiCi avatar framing:
// face ends near y=640, platform UI starts near y=1630.
export const layout = {
  width: 1080,
  height: 1920,
  cardTop: 720,
  cardBottom: 1380,
  captionY: 1470,
};
