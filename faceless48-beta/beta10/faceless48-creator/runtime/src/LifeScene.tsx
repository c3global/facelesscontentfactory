import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {z} from 'zod';
import {LSClip, lsClipSchema} from './LSClip';
import {LifeSceneText, lifeSceneTextSchema, LS_FPS} from './LifeSceneText';
import {LSMessage, lsMessageSchema, LSNote, lsNoteSchema} from './LifeSceneOverlays';
import {LSChecklist, lsChecklistSchema, LSPhone, lsPhoneSchema, LSStack, lsStackSchema} from './LifeSceneEffects';
import {LSComment, lsCommentSchema, LSTimeline, lsTimelineSchema} from './LifeSceneEffects2';
import {LSDust} from './LSAtmosphere';

/**
 * A Life Scene: short cinematic clips (Google Flow, Seedance, Veo, stock or your own camera) with
 * camera moves, hard cuts, on-screen text cards and optional graphic overlays, in one render.
 * Colors of the clips are never changed. 24 fps, portrait 1080x1920.
 */
const overlay = z.discriminatedUnion('type', [
  z.object({type: z.literal('message'), atSec: z.number().default(0), props: lsMessageSchema}),
  z.object({type: z.literal('note'), atSec: z.number().default(0), props: lsNoteSchema}),
  z.object({type: z.literal('stack'), atSec: z.number().default(0), props: lsStackSchema}),
  z.object({type: z.literal('phone'), atSec: z.number().default(0), props: lsPhoneSchema}),
  z.object({type: z.literal('checklist'), atSec: z.number().default(0), props: lsChecklistSchema}),
  z.object({type: z.literal('comment'), atSec: z.number().default(0), props: lsCommentSchema}),
  z.object({type: z.literal('timeline'), atSec: z.number().default(0), props: lsTimelineSchema}),
]);

export const lifeScenePlanSchema = z.object({
  kind: z.literal('life-scene'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  durationSec: z.number().positive(),
  /** shots play in order with hard cuts; each shot's camera move uses the LSClip options */
  shots: z.array(lsClipSchema.extend({lengthSec: z.number().positive(), keepAudio: z.boolean().default(true)})).min(1),
  /** optional voiceover inside public/; when set, clip audio is dropped unless a shot says keepAudio */
  voiceover: z.string().optional(),
  voiceoverDelaySec: z.number().default(0.5),
  /** on-screen text cards: the point of a Life Scene */
  text: lifeSceneTextSchema.shape.lines.default([]),
  font: lifeSceneTextSchema.shape.font.default('covered'),
  overlays: z.array(overlay).default([]),
  dust: z.boolean().default(false),
  /** optional stock-footage credits shown nowhere on screen; kept for the record (see credits.json) */
  credits: z.array(z.string()).default([]),
});
export type LifeScenePlan = z.infer<typeof lifeScenePlanSchema>;
export const lifeSceneFrames = (p: LifeScenePlan) => Math.ceil(p.durationSec * LS_FPS);

const OVERLAY: Record<string, React.FC<any>> = {message: LSMessage, note: LSNote, stack: LSStack, phone: LSPhone, checklist: LSChecklist, comment: LSComment, timeline: LSTimeline};

export const LifeScene: React.FC<{plan: LifeScenePlan}> = ({plan}) => {
  let at = 0;
  const vo = !!plan.voiceover;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {plan.shots.map((s, i) => {
        const from = Math.round(at * LS_FPS);
        const len = Math.round(s.lengthSec * LS_FPS);
        at += s.lengthSec;
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <LSClip {...s} />
            {!vo && s.keepAudio && (
              <Audio src={staticFile(s.src)} startFrom={Math.round((s.startSec ?? 0) * LS_FPS)} />
            )}
          </Sequence>
        );
      })}
      {plan.dust && <LSDust count={55} />}
      {plan.overlays.map((o, i) => {
        const C = OVERLAY[o.type];
        return (
          <Sequence key={`o${i}`} from={Math.round(o.atSec * LS_FPS)}>
            <C {...(o.props as object)} />
          </Sequence>
        );
      })}
      <LifeSceneText lines={plan.text} font={plan.font} durationSec={plan.durationSec} />
      {plan.voiceover && (
        <Sequence from={Math.round(plan.voiceoverDelaySec * LS_FPS)}>
          <Audio src={staticFile(plan.voiceover)} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
