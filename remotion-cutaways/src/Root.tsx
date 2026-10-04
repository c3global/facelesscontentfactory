import React from 'react';
import {Composition} from 'remotion';
import {TalkingHead, TalkingHeadProps} from './TalkingHead';
import {DURATION_FRAMES, FPS} from './data';

export const Root: React.FC = () => (
  <>
    <Composition
      id="TalkingHead"
      component={TalkingHead}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{showVideo: true}}
    />
    <Composition
      id="CutawaysOnly"
      component={TalkingHead}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{showVideo: false}}
    />
  </>
);
