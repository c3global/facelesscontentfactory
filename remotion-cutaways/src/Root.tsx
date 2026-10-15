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
import {LSMessage, lsMessageSchema, LSNote, lsNoteSchema} from './LifeSceneOverlays';
import {LSChecklist, lsChecklistSchema, LSPhone, lsPhoneSchema, LSStack, lsStackSchema} from './LifeSceneEffects';
import {LSClip, lsClipSchema} from './LSClip';
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
    <Composition
      id="LSMessage"
      component={LSMessage}
      schema={lsMessageSchema}
      defaultProps={{sent: 'Thinking of you. Coffee soon?', reply: 'Yes. Finally.', typeFromSec: 2.6, replyFromSec: 7.4}}
      durationInFrames={240}
      fps={24}
      width={1080}
      height={1920}
    />
    <Composition
      id="LSNote"
      component={LSNote}
      schema={lsNoteSchema}
      defaultProps={{lines: ['Reply first.', 'Overthink later.'], fromSec: 3}}
      durationInFrames={240}
      fps={24}
      width={1080}
      height={1920}
    />
    <Composition
      id="LSStack"
      component={LSStack}
      schema={lsStackSchema}
      defaultProps={{cards: [
        {initial: 'M', title: 'New message', body: 'Are you free later?', atSec: 3.2},
        {initial: 'R', title: 'Reminder', body: 'Three o\'clock today', atSec: 4.9},
        {initial: 'C', title: 'Missed call', body: 'Tried you twice', atSec: 6.6},
      ]}}
      durationInFrames={240}
      fps={24}
      width={1080}
      height={1920}
    />
    <Composition
      id="LSPhone"
      component={LSPhone}
      schema={lsPhoneSchema}
      defaultProps={{header: 'Recordings', rows: [{title: 'Recording 3', meta: '0:08'}, {title: 'Recording 2', meta: '0:31'}, {title: 'Recording 1', meta: '1:12'}], highlight: 1, fromSec: 2.5, toSec: 8.5}}
      durationInFrames={240}
      fps={24}
      width={1080}
      height={1920}
    />
    <Composition
      id="LSChecklist"
      component={LSChecklist}
      schema={lsChecklistSchema}
      defaultProps={{items: ['Start small', 'Say it out loud', 'Press send'], fromSec: 3, everySec: 1.3}}
      durationInFrames={240}
      fps={24}
      width={1080}
      height={1920}
    />
    <Composition
      id="LSClip"
      component={LSClip}
      schema={lsClipSchema}
      defaultProps={{src: 'raw/clip.mp4', effect: 'zoom' as const, from: 1, to: 1.1, moveSec: 10, px: 0.5, py: 0.35}}
      durationInFrames={240}
      fps={24}
      width={1080}
      height={1920}
    />
    <Composition id="FieldDemo" component={FieldDemo} defaultProps={{field: 'crimson' as const}} durationInFrames={90} fps={FPS} width={W} height={H} />
    <Composition id="GlassLab" component={GlassLab} durationInFrames={30} fps={30} width={1080} height={1920} />
  </>
);
