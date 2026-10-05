import React from 'react';
import {Img, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Card} from '../glass';
import {clamp, useCardMotion} from '../ui';

type Props = {src: string; pan: number; mode: 'card' | 'full'};

/**
 * A real screenshot in a glass frame, centered between the top and bottom caption bands. Absolute in the frame: x 150..930, y 585..1055 (her window is hidden in these scenes).
 * `pan` slowly scrolls a tall screenshot downward while it is on screen.
 */
export const ScreenshotCard: React.FC<Props> = ({src, pan, mode}) => {
  const {opacity, frame, translateY} = useCardMotion(0, 8, 8);
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [20, durationInFrames - 6], [0, 1], clamp);
  if (mode === 'full') {
    // like a screen recording: the page fills the frame and scrolls, with a scrim so captions stay readable
    return (
      <div style={{position: 'absolute', inset: 0, opacity, overflow: 'hidden', backgroundColor: '#000'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${p * pan * 100}%`}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 32%, rgba(0,0,0,0.84) 56%, rgba(0,0,0,0.93) 100%)'}} />
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', left: 150, top: 585 + translateY, width: 780, height: 470, opacity}}>
      <Card fade={opacity} radius={36} rim={3.5} seed={44} style={{height: '100%'}} contentStyle={{height: '100%', padding: 10}}>
        <div style={{width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', background: '#fff'}}>
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${p * pan * 100}%`}} />
        </div>
      </Card>
    </div>
  );
};
