import React from 'react';
import {Img, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Card} from '../glass';
import {clamp, easeOut, useCardMotion} from '../ui';

type Props = {src: string; pan: number};

/**
 * A real screenshot in a glass frame, beside her portrait window. Absolute in the frame: x 395..950, y 255..650.
 * `pan` slowly scrolls a tall screenshot downward while it is on screen.
 */
export const ScreenshotCard: React.FC<Props> = ({src, pan}) => {
  const {opacity, frame, translateY} = useCardMotion(0, 8, 8);
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [6, durationInFrames - 6], [0, 1], {...clamp, easing: easeOut});
  return (
    <div style={{position: 'absolute', left: 395, top: 262 + translateY, width: 555, height: 390, opacity}}>
      <Card fade={opacity} radius={36} rim={3.5} seed={44} style={{height: '100%'}} contentStyle={{height: '100%', padding: 10}}>
        <div style={{width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden', background: '#fff'}}>
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `50% ${p * pan * 100}%`}} />
        </div>
      </Card>
    </div>
  );
};
