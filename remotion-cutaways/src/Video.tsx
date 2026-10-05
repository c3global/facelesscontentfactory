import React, {useMemo} from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, BackdropKind} from './backdrops';
import {FieldOption, brand} from './brand';
import {CaptionLayer, buildPages} from './Captions';
import {loadBrandFonts} from './fonts';
import {GlassSurface, RefractDefs} from './glass';
import {ChapterCard} from './graphics/ChapterCard';
import {ChatUI} from './graphics/ChatUI';
import {EndCard} from './graphics/EndCard';
import {FloatingChips} from './graphics/FloatingChips';
import {HeadlineCard} from './graphics/HeadlineCard';
import {HubDiagram} from './graphics/HubDiagram';
import {MeetingTile} from './graphics/MeetingTile';
import {NotificationStack} from './graphics/NotificationStack';
import {RewriteCard} from './graphics/RewriteCard';
import {StatementCard} from './graphics/StatementCard';
import {Tag} from './graphics/Tag';
import {H, W, areaFor} from './layouts';
import {MetalRim} from './metal';
import type {Graphic, Scene, VideoProps} from './schema';
import {FlatSegment, avatarStateBlend, flatten, layoutBlend} from './timeline';
import {GraphicTimeProvider, ThemeProvider} from './ui';

const FULL_FRAME: Graphic['type'][] = ['tag', 'floating-chips', 'chapter-card'];

const renderGraphic = (g: Graphic): React.ReactNode => {
  switch (g.type) {
    case 'tag':
      return <Tag {...g.props} />;
    case 'headline-card':
      return <HeadlineCard {...g.props} />;
    case 'rewrite-card':
      return <RewriteCard {...g.props} />;
    case 'notification-stack':
      return <NotificationStack {...g.props} />;
    case 'hub-diagram':
      return <HubDiagram {...g.props} />;
    case 'chat-ui':
      return <ChatUI {...g.props} />;
    case 'meeting-tile':
      return <MeetingTile {...g.props} />;
    case 'floating-chips':
      return <FloatingChips {...g.props} />;
    case 'chapter-card':
      return <ChapterCard {...g.props} />;
    case 'statement-card':
      return <StatementCard {...g.props} />;
  }
};

const kindFor = (scene: Scene, field: FieldOption): BackdropKind => (scene.mood === 'light' ? 'light' : field);

export const Video: React.FC<VideoProps> = ({plan, captions}) => {
  loadBrandFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flat = useMemo(() => flatten(plan, fps), [plan, fps]);
  const pages = useMemo(() => buildPages(captions, plan.captionPageMs), [captions, plan.captionPageMs]);
  const {field, sans} = plan.theme;

  const blend = layoutBlend(flat, frame);
  const av = avatarStateBlend(flat, frame);
  const curField = blend.layout !== 'A';
  const prevField = blend.prev ? blend.prev.seg.layout !== 'A' : false;
  const prevOpacity = prevField ? (curField ? 1 : 1 - blend.p) : 0;
  const curOpacity = curField ? blend.p : 0;
  const scrim = 1 - av.frame;
  const sceneIdx = (s: Scene) => plan.scenes.indexOf(s);
  const curMood = blend.cur.scene.mood;
  const metalVariant = curMood === 'dark' && field !== 'rosegold' ? 'bright' : 'deep';

  // circle factor: 0 for windows, 1 for the corner circle. Drives the thick metal ring.
  const half = Math.min(av.w, av.h) / 2;
  const cf = Math.min(1, Math.max(0, (av.r - 60) / Math.max(1, half - 60)));
  const inset = av.frame * (22 - 6 * cf);
  const rimT = av.frame * (4 + 12 * cf);

  return (
    <AbsoluteFill style={{backgroundColor: curMood === 'light' && curField ? brand.white : brand.black}}>
      <RefractDefs />

      {/* animated field backdrops; the previous one sits underneath so mood changes cross-fade */}
      {blend.prev && (
        <AbsoluteFill style={{opacity: prevOpacity}}>
          <Backdrop kind={kindFor(blend.prev.scene, field)} alt={sceneIdx(blend.prev.scene)} frame={frame} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{opacity: curOpacity}}>
        <Backdrop kind={kindFor(blend.cur.scene, field)} alt={sceneIdx(blend.cur.scene)} frame={frame} />
      </AbsoluteFill>

      {/* her: one OffthreadVideo for the whole runtime so her audio never cuts or restarts */}
      <ThemeProvider mood={curMood} field={field} sans={sans}>
        <div style={{position: 'absolute', left: av.x, top: av.y, width: av.w, height: av.h, borderRadius: av.r}}>
          {av.frame > 0.01 && av.opacity > 0.01 && (
            <GlassSurface
              variant="clear"
              tone={curMood === 'dark' ? 'dark' : 'light'}
              radius={av.r}
              fade={av.frame * av.opacity}
              refract
              rim={0}
              seed={70}
            />
          )}
          <div
            style={{
              position: 'absolute',
              inset,
              borderRadius: Math.max(0, av.r - inset),
              overflow: 'hidden',
              opacity: av.opacity,
              backgroundColor: brand.black,
            }}
          >
            <OffthreadVideo
              src={staticFile(plan.video)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `50% ${av.focusY}%`,
                transform: `scale(${av.zoom})`,
                transformOrigin: `50% ${av.focusY}%`,
              }}
            />
          </div>
          {av.frame > 0.01 && av.opacity > 0.01 && (
            <>
              {/* specular edge over the video */}
              <div
                style={{
                  position: 'absolute',
                  inset,
                  borderRadius: Math.max(0, av.r - inset),
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5), inset 0 2px 0 rgba(255,255,255,0.3)',
                  opacity: av.opacity,
                  pointerEvents: 'none',
                }}
              />
              <MetalRim radius={av.r} thickness={rimT} variant={metalVariant} seed={71} opacity={av.opacity} />
            </>
          )}
        </div>
      </ThemeProvider>

      {/* lower-third gradient behind the full-frame hook caption, plus a soft bottom scrim */}
      {scrim > 0.01 && (
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 34%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.86) 62%, rgba(0,0,0,0.92) 100%)',
            opacity: scrim,
          }}
        />
      )}

      {/* scene tags and graphics */}
      {plan.scenes.map((scene, si) => {
        const sStart = Math.min(...scene.segments.map((s) => s.start));
        const sEnd = Math.max(...scene.segments.map((s) => s.end));
        return (
          <ThemeProvider key={scene.id} mood={scene.mood} field={field} sans={sans} sceneIndex={si}>
            {scene.tag && (
              <Sequence from={Math.round(sStart * fps) + 8} durationInFrames={Math.max(1, Math.round((sEnd - sStart) * fps) - 8)} premountFor={fps}>
                <Tag text={scene.tag} />
              </Sequence>
            )}
            {scene.segments.map((seg, sgi) =>
              seg.graphics.map((g, gi) => {
                const from = Math.round(g.at * fps);
                const until = Math.round((g.until ?? seg.end) * fps);
                const area = areaFor(seg.layout, seg.avatar);
                const full = FULL_FRAME.includes(g.type);
                return (
                  <Sequence key={`${scene.id}-${sgi}-${gi}`} from={from} durationInFrames={Math.max(1, until - from)} premountFor={fps}>
                    <GraphicTimeProvider atSec={g.at}>
                      <div
                        style={{
                          position: 'absolute',
                          left: full ? 0 : area.x,
                          top: full ? 0 : area.y + (g.box?.y ?? 0),
                          width: full ? W : area.w,
                          height: full ? H : (g.box?.h ?? area.h),
                          ...(full || g.box ? {} : {display: 'flex', flexDirection: 'column', justifyContent: 'center'}),
                        }}
                      >
                        {renderGraphic(g)}
                      </div>
                    </GraphicTimeProvider>
                  </Sequence>
                );
              }),
            )}
          </ThemeProvider>
        );
      })}

      {plan.endCard && (
        <ThemeProvider mood={plan.scenes[plan.scenes.length - 1].mood} field={field} sans={sans}>
          <Sequence
            from={Math.round(plan.endCard.startAt * fps)}
            durationInFrames={Math.max(1, Math.round(plan.durationSec * fps) - Math.round(plan.endCard.startAt * fps))}
            premountFor={fps}
          >
            <GraphicTimeProvider atSec={plan.endCard.startAt}>
              <EndCard card={plan.endCard} />
            </GraphicTimeProvider>
          </Sequence>
        </ThemeProvider>
      )}

      <ThemeProvider mood={curMood} field={field} sans={sans}>
        <CaptionLayer pages={pages} emphasis={plan.emphasis} flat={flat as FlatSegment[]} />
      </ThemeProvider>
    </AbsoluteFill>
  );
};
