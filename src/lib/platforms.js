export const PLATFORMS = [
  { id: 'youtube',  label: 'YouTube',        icon: '▶',  accent: '#FF4444' },
  { id: 'shorts',   label: 'Shorts / Reels', icon: '✦',  accent: '#C9956C' },
  { id: 'linkedin', label: 'LinkedIn',       icon: 'in', accent: '#5FB0E8' },
  { id: 'substack', label: 'Substack / Blog', icon: '✎', accent: '#FF8B5C' },
  { id: 'social',   label: 'IG / FB',        icon: '◉',  accent: '#E879A6' },
  { id: 'text',     label: 'X / Threads',    icon: '✕',  accent: '#94A3C8' },
];

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));
