import React, {useMemo} from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  brand,
  fieldGradients,
  lightField,
  Mood,
} from './brand';
import {CaptionLayer, buildPages} from './Captions';
import {loadBrandFonts} from './fonts';
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
import {GRAPHIC_AREA, H, W} from './layouts';
import type {Graphic, VideoProps} from './schema';
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

const Field: React.FC<{mood: Mood; field: 'crimson' | 'charcoal' | 'rosegold'; opacity: number}> = ({mood, field, opacity}) => (
  <AbsoluteFill
    style={{
      background: mood === 'light' ? lightField : fieldGradients[field],
      opacity,
    }}
  />
);

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
  const curOpacity = curField ? (prevField ? blend.p : blend.p) : 0;
  const scrim = 1 - av.frame;

  return (
    <AbsoluteFill style={{backgroundColor: blend.cur.scene.mood === 'light' && curField ? brand.white : brand.black}}>
      {/* field layers, previous one underneath so mood changes cross-fade */}
      {blend.prev && <Field mood={blend.prev.scene.mood} field={field} opacity={prevOpacity} />}
      <Field mood={blend.cur.scene.mood} field={field} opacity={curOpacity} />

      {/* one video element for the whole runtime so her audio never cuts or restarts */}
      <div
        style={{
          position: 'absolute',
          left: av.x,
          top: av.y,
          width: av.w,
          height: av.h,
          borderRadius: av.r,
          overflow: 'hidden',
          opacity: av.opacity,
          boxShadow:
            av.frame > 0.01
              ? `0 ${28 * av.frame}px ${70 * av.frame}px rgba(0,0,0,${0.32 * av.frame}), 0 0 0 ${3 * av.frame}px rgba(212,138,140,${0.9 * av.frame})`
              : 'none',
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

      {/* bottom scrim only while she is full-bleed, so white captions stay readable */}
      {scrim > 0.01 && (
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 52%, rgba(0,0,0,0.5) 100%)',
            opacity: scrim,
          }}
        />
      )}

      {/* scene tags and graphics */}
      {plan.scenes.map((scene) => {
        const sStart = Math.min(...scene.segments.map((s) => s.start));
        const sEnd = Math.max(...scene.segments.map((s) => s.end));
        return (
          <ThemeProvider key={scene.id} mood={scene.mood} field={field} sans={sans}>
            {scene.tag && (
              <Sequence from={Math.round(sStart * fps) + 8} durationInFrames={Math.max(1, Math.round((sEnd - sStart) * fps) - 8)} premountFor={fps}>
                <Tag text={scene.tag} />
              </Sequence>
            )}
            {scene.segments.map((seg, si) =>
              seg.graphics.map((g, gi) => {
                const from = Math.round(g.at * fps);
                const until = Math.round((g.until ?? seg.end) * fps);
                const area = GRAPHIC_AREA[seg.layout];
                const full = FULL_FRAME.includes(g.type);
                return (
                  <Sequence key={`${scene.id}-${si}-${gi}`} from={from} durationInFrames={Math.max(1, until - from)} premountFor={fps}>
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

      <ThemeProvider mood={blend.cur.scene.mood} field={field} sans={sans}>
        <CaptionLayer pages={pages} emphasis={plan.emphasis} flat={flat as FlatSegment[]} />
      </ThemeProvider>
    </AbsoluteFill>
  );
};
