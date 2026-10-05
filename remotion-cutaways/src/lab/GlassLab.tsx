import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** Throwaway experiment: does backdrop-filter with an SVG displacement filter survive the render? */
export const GlassLab: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = Array.from({length: 40}, (_, i) => i);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg,#C91B19,#6F0D0F)'}}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <defs>
          <filter id="lab-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      {lines.map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 40 + i * 46 + (frame % 46), height: 6, background: 'rgba(255,255,255,0.55)'}} />
      ))}
      <div style={{position: 'absolute', left: 80, top: 300, width: 420, height: 300, borderRadius: 60, backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.08)', border: '2px solid white'}}>
        <span style={{color: 'white', font: '700 40px sans-serif', padding: 20}}>blur only</span>
      </div>
      <div style={{position: 'absolute', left: 560, top: 300, width: 420, height: 300, borderRadius: 60, backdropFilter: 'url(#lab-refract)', background: 'rgba(255,255,255,0.08)', border: '2px solid white'}}>
        <span style={{color: 'white', font: '700 40px sans-serif', padding: 20}}>url() only</span>
      </div>
      <div style={{position: 'absolute', left: 80, top: 760, width: 900, height: 300, borderRadius: 60, backdropFilter: 'url(#lab-refract) blur(3px) saturate(1.6)', background: 'rgba(255,255,255,0.10)', border: '2px solid white'}}>
        <span style={{color: 'white', font: '700 40px sans-serif', padding: 20}}>url() + blur + saturate</span>
      </div>
    </AbsoluteFill>
  );
};
