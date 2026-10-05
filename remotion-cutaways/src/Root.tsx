import React from 'react';
import {Composition} from 'remotion';
import type {CalculateMetadataFunction} from 'remotion';
import captions from '../content/20-years.captions.json';
import plan from '../content/20-years.scene.json';
import showcasePlan from '../content/showcase.scene.json';
import {FPS, H, W} from './layouts';
import {planSchema, videoPropsSchema, VideoProps} from './schema';
import {Video} from './Video';
import {GlassLab} from './lab/GlassLab';
import {FieldDemo} from './lab/FieldDemo';

const calculateMetadata: CalculateMetadataFunction<VideoProps> = ({props}) => ({
  durationInFrames: Math.ceil(props.plan.durationSec * FPS),
  fps: FPS,
  width: W,
  height: H,
});

export const Root: React.FC = () => (
  <>
    <Composition
      id="Video"
      component={Video}
      schema={videoPropsSchema}
      defaultProps={{plan: planSchema.parse(plan), captions}}
      calculateMetadata={calculateMetadata}
      durationInFrames={Math.ceil(plan.durationSec * FPS)}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="Showcase"
      component={Video}
      schema={videoPropsSchema}
      defaultProps={{plan: planSchema.parse(showcasePlan), captions}}
      calculateMetadata={calculateMetadata}
      durationInFrames={Math.ceil(showcasePlan.durationSec * FPS)}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition id="FieldDemo" component={FieldDemo} defaultProps={{field: 'crimson' as const}} durationInFrames={90} fps={FPS} width={W} height={H} />
    <Composition id="GlassLab" component={GlassLab} durationInFrames={30} fps={30} width={1080} height={1920} />
  </>
);
