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
import {LifeSceneText, lifeSceneTextSchema, LS_FPS} from './LifeSceneText';
import {PatientFile, patientFileFrames, patientFileSchema, PF_FPS} from './PatientFile';

const lifeSceneTextProps = {
  font: 'covered' as const,
  durationSec: 10,
  lines: [
    {text: ["The reply you're waiting", 'for may be waiting on you', 'to go first.'], fromSec: 0.6, toSec: 5.6, top: 1130},
    {text: ['Who would you record', 'a voice memo for?'], fromSec: 6.6, toSec: 10, top: 1130},
  ],
};

const patientFileProps = {number: '002', title: 'Afterglow', video: 'raw/patient-file-002.mp4', videoSec: 78.25};

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
    <Composition
      id="PatientFile"
      component={PatientFile}
      schema={patientFileSchema}
      defaultProps={patientFileProps}
      calculateMetadata={({props}) => ({durationInFrames: patientFileFrames(props.videoSec), fps: PF_FPS, width: 1080, height: 1920})}
      durationInFrames={patientFileFrames(patientFileProps.videoSec)}
      fps={PF_FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="LifeSceneText"
      component={LifeSceneText}
      schema={lifeSceneTextSchema}
      defaultProps={lifeSceneTextProps}
      calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.durationSec * LS_FPS), fps: LS_FPS, width: 1080, height: 1920})}
      durationInFrames={Math.ceil(lifeSceneTextProps.durationSec * LS_FPS)}
      fps={LS_FPS}
      width={1080}
      height={1920}
    />
    <Composition id="FieldDemo" component={FieldDemo} defaultProps={{field: 'crimson' as const}} durationInFrames={90} fps={FPS} width={W} height={H} />
    <Composition id="GlassLab" component={GlassLab} durationInFrames={30} fps={30} width={1080} height={1920} />
  </>
);
