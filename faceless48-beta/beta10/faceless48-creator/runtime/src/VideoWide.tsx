import React, {useMemo} from 'react';
import {Audio, AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, BackdropKind, PhotoBackdrop} from './backdrops';
import {FieldOption, brand} from './brand';
import {CaptionLayer} from './Captions';
import {KineticLayer} from './Kinetic';
import {loadBrandFonts} from './fonts';
import {GlassSurface, RefractDefs} from './glass';
import {ChapterCard} from './graphics/ChapterCard';
import {FilmFinish} from './Finish';
import {NotesCard} from './graphics/NotesCard';
import {CongruenceMap} from './graphics/CongruenceMap';
import {CitationCard, QuietFeed} from './graphics/Cutaways';
import {ScreenshotCard} from './graphics/ScreenshotCard';
import {BRoll} from './graphics/BRoll';
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
import type {AvatarState, LayoutKey, Rect} from './layouts';
import {MetalRim} from './metal';
import type {Graphic, Scene, ScenePlan, VideoProps} from './schema';
import {avatarStateBlend, layoutBlend} from './timeline';
import {GraphicTimeProvider, ThemeProvider} from './ui';
import {FxLooks, FxOver, FxSound, videoMods} from './fx/FxLayers';
import {FxEnvProvider, fxRange, useLoadedAnchors} from './fx/util';
import {useVideoTiming} from './useVideoTiming';

/**
 * Landscape (1920 x 1080) talking-head canvas, for YouTube.
 * The portrait graphics and captions are designed in 1080 x 1920 pixels, so they are drawn in a portrait "stage"
 * that is moved and scaled into place here. The speaker, backdrops, music and finish are native to this canvas.
 */
export const WIDE = {w: 1920, h: 1080};

/** Effects that work on a landscape canvas: camera moves and looks. The rest are drawn for the portrait frame. */
export const LANDSCAPE_FX = ['digital-zoom', 'pull-back', 'zoom-through', 'blackout', 'flash-frame', 'grade', 'glow', 'dust'];

const SPLIT: AvatarState = {x: 60, y: 80, w: 780, h: 760, r: 48, zoom: 1, focusY: 50, opacity: 1, frame: 1};
const WIDE_AVATAR: Record<LayoutKey | 'Chidden', AvatarState> = {
  A: {x: 0, y: 0, w: WIDE.w, h: WIDE.h, r: 0, zoom: 1, focusY: 50, opacity: 1, frame: 0},
  B: SPLIT,
  C: SPLIT,
  D: SPLIT,
  E: SPLIT,
  S: SPLIT,
  Chidden: {...SPLIT, opacity: 0},
};
const wideState = (layout: LayoutKey, avatar?: 'circle' | 'hidden'): AvatarState =>
  avatar === 'hidden' && layout !== 'A' ? WIDE_AVATAR.Chidden : WIDE_AVATAR[layout];

/** Where graphics may draw, in landscape pixels. The graphics are 960 wide, as in portrait. */
const wideArea = (layout: LayoutKey, avatar?: 'circle' | 'hidden'): Rect =>
  layout === 'A' ? {x: 480, y: 120, w: 960, h: 560} : avatar === 'hidden' ? {x: 480, y: 80, w: 960, h: 760} : {x: 900, y: 80, w: 960, h: 760};

const FULL_FRAME: Graphic['type'][] = ['tag', 'floating-chips', 'chapter-card', 'congruence-map', 'screenshot-card', 'quiet-feed', 'citation-card', 'broll'];
const PORTRAIT = {w: 1080, h: 1920};

/** Draws portrait-designed content inside the landscape canvas: `scale` it, then put the stage's top-left corner at (x, y). */
const Stage: React.FC<{x: number; y: number; scale?: number; children: React.ReactNode}> = ({x, y, scale = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: PORTRAIT.w, height: PORTRAIT.h, transform: `scale(${scale})`, transformOrigin: '0 0'}}>{children}</div>
);

/** Captions: the portrait lockup band is moved to the lower part of the landscape frame. */
const CAP_SCALE = 1.1;
const CAP_STAGE = {x: (WIDE.w - PORTRAIT.w * CAP_SCALE) / 2, y: 1000 - 1490 * CAP_SCALE};

const renderGraphic = (g: Graphic, lengthSec = 0): React.ReactNode => {
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
    case 'congruence-map':
      return <CongruenceMap {...g.props} />;
    case 'notes-card':
      return <NotesCard {...g.props} />;
    case 'quiet-feed':
      return <QuietFeed {...g.props} />;
    case 'citation-card':
      return <CitationCard {...g.props} />;
    case 'screenshot-card':
      return <ScreenshotCard {...g.props} />;
    case 'statement-card':
      return <StatementCard {...g.props} />;
    case 'broll':
      return <BRoll {...g.props} lengthSec={lengthSec} />;
  }
};

const kindFor = (scene: Scene, field: FieldOption): BackdropKind =>
  field.startsWith('marble') ? (field as BackdropKind) : scene.mood === 'light' ? 'light' : (field as BackdropKind);

export const VideoWide: React.FC<VideoProps> = ({plan: sourcePlan, captions}) => {
  loadBrandFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  // captions always sit at the bottom on a landscape canvas (the top band is for portrait)
  const plan = useMemo<ScenePlan>(
    () => ({
      ...sourcePlan,
      captionBand: {top: 1160, bottom: 1490},
      scenes: sourcePlan.scenes.map((sc) => ({...sc, segments: sc.segments.map((sg) => ({...sg, captionPos: 'bottom' as const}))})),
    }),
    [sourcePlan],
  );
  const {flat, pages, speech, musicVolume, kineticCaptions} = useVideoTiming(plan, captions, fps);
  const {field, sans} = plan.theme;
  const anchors = useLoadedAnchors(plan.matte);
  const mods = videoMods(plan.fx, frame / fps);
  const blend = layoutBlend(flat, frame);
  const av = avatarStateBlend(flat, frame, wideState);
  const curField = blend.layout !== 'A';
  const prevField = blend.prev ? blend.prev.seg.layout !== 'A' : false;
  const prevOpacity = prevField ? (curField ? 1 : 1 - blend.p) : 0;
  const curOpacity = curField ? blend.p : 0;
  // a soft gradient behind the captions while she fills the frame
  const scrim = (1 - av.frame) * (plan.scrim ?? 1);
  const sceneIdx = (s: Scene) => plan.scenes.indexOf(s);
  const curMood = blend.cur.scene.mood;
  const metalVariant = curMood === 'dark' && field !== 'rosegold' ? 'bright' : 'deep';

  const fy = mods.focusY ?? av.focusY;
  const videoStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `50% ${fy}%`,
    transform: `scale(${av.zoom * mods.zoom})`,
    transformOrigin: `50% ${fy}%`,
    filter: mods.blur > 0.2 ? `blur(${mods.blur}px)` : undefined,
  };
  const inset = av.frame * 10;
  const rimT = av.frame * 3.5;

  return (
    <AbsoluteFill style={{backgroundColor: curMood === 'light' && curField ? brand.white : brand.black}}>
      <RefractDefs />
      {plan.music && <Audio src={staticFile(plan.music.src)} volume={musicVolume} startFrom={Math.round(plan.music.startFromSec * fps)} loop />}

      {blend.prev && (
        <AbsoluteFill style={{opacity: prevOpacity}}>
          {blend.prev.scene.bg ? (
            <PhotoBackdrop src={blend.prev.scene.bg} mood={blend.prev.scene.mood} frame={frame} />
          ) : (
            <Backdrop kind={kindFor(blend.prev.scene, field)} alt={sceneIdx(blend.prev.scene)} frame={frame} />
          )}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{opacity: curOpacity}}>
        {blend.cur.scene.bg ? (
          <PhotoBackdrop src={blend.cur.scene.bg} mood={blend.cur.scene.mood} frame={frame} />
        ) : (
          <Backdrop kind={kindFor(blend.cur.scene, field)} alt={sceneIdx(blend.cur.scene)} frame={frame} />
        )}
      </AbsoluteFill>

      {/* her: one OffthreadVideo for the whole runtime so her audio never cuts or restarts */}
      <ThemeProvider mood={curMood} field={field} sans={sans}>
        <div style={{position: 'absolute', left: av.x, top: av.y, width: av.w, height: av.h, borderRadius: av.r}}>
          {av.frame > 0.01 && av.opacity > 0.01 && (
            <GlassSurface variant="clear" tone={curMood === 'dark' ? 'dark' : 'light'} radius={av.r} fade={av.frame * av.opacity} refract rim={0} seed={70} />
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
            <OffthreadVideo src={staticFile(plan.video)} style={videoStyle} />
            <FxEnvProvider slug={plan.matte} anchors={anchors} video={plan.video} videoStyle={videoStyle} outline={plan.matteOutline} speech={speech}>
              <FxLooks fx={plan.fx} />
            </FxEnvProvider>
          </div>
          {av.frame > 0.01 && av.opacity > 0.01 && (
            <>
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

      {scrim > 0.01 && (
        <AbsoluteFill
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.85) 100%)',
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
                <Stage x={(WIDE.w - PORTRAIT.w) / 2} y={-130}>
                  <Tag text={scene.tag} />
                </Stage>
              </Sequence>
            )}
            {scene.segments.map((seg, sgi) =>
              seg.graphics.map((g, gi) => {
                const from = Math.round(g.at * fps);
                const until = Math.round((g.until ?? seg.end) * fps);
                const area = wideArea(seg.layout, seg.avatar);
                const full = FULL_FRAME.includes(g.type);
                // full-frame portrait graphics show their middle band, scaled to fit the graphic area
                const s = 0.76;
                return (
                  <Sequence key={`${scene.id}-${sgi}-${gi}`} from={from} durationInFrames={Math.max(1, until - from)} premountFor={fps}>
                    <GraphicTimeProvider atSec={g.at}>
                      {g.type === 'broll' ? (
                        <div style={{position: 'absolute', left: 0, top: 0, width: WIDE.w, height: WIDE.h}}>{renderGraphic(g, (until - from) / fps)}</div>
                      ) : full ? (
                        <div style={{position: 'absolute', left: area.x + (area.w - PORTRAIT.w * s) / 2, top: area.y, width: PORTRAIT.w * s, height: area.h, overflow: 'hidden'}}>
                          <Stage x={0} y={-(PORTRAIT.h / 2 - area.h / 2 / s) * s + 70} scale={s}>
                            {renderGraphic(g, (until - from) / fps)}
                          </Stage>
                        </div>
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            left: area.x,
                            top: area.y + (g.box?.y ?? 0),
                            width: area.w,
                            height: g.box?.h ?? area.h,
                            ...(g.box && !g.box.center ? {} : {display: 'flex', flexDirection: 'column', justifyContent: 'center'}),
                          }}
                        >
                          {renderGraphic(g, (until - from) / fps)}
                        </div>
                      )}
                    </GraphicTimeProvider>
                  </Sequence>
                );
              }),
            )}
          </ThemeProvider>
        );
      })}

      <FxEnvProvider slug={plan.matte} anchors={anchors} video={plan.video} videoStyle={videoStyle} outline={plan.matteOutline} speech={speech}>
        <FxOver fx={plan.fx.filter((f) => LANDSCAPE_FX.includes(f.type))} />
      </FxEnvProvider>
      {plan.fx.length > 0 && <FxSound fx={plan.fx.filter((f) => LANDSCAPE_FX.includes(f.type))} volume={plan.fxVolume} mode={plan.fxSound} labels={plan.soundLabels} />}

      {plan.endCard && (
        <ThemeProvider mood={plan.scenes[plan.scenes.length - 1].mood} field={field} sans={sans}>
          <Sequence
            from={Math.round(plan.endCard.startAt * fps)}
            durationInFrames={Math.max(1, Math.round(plan.durationSec * fps) - Math.round(plan.endCard.startAt * fps))}
            premountFor={fps}
          >
            <GraphicTimeProvider atSec={plan.endCard.startAt}>
              <Stage x={(WIDE.w - PORTRAIT.w * 0.85) / 2} y={110} scale={0.85}>
                <EndCard card={plan.endCard} />
              </Stage>
            </GraphicTimeProvider>
          </Sequence>
        </ThemeProvider>
      )}

      <ThemeProvider mood={curMood} field={field} sans={sans}>
        <Stage x={CAP_STAGE.x} y={CAP_STAGE.y} scale={CAP_SCALE}>
          {plan.captionStyle === 'pill' ? (
            <CaptionLayer pages={pages} emphasis={plan.emphasis} flat={flat.map((f) => ({...f, seg: {...f.seg, layout: 'D' as const}}))} />
          ) : (
            <KineticLayer captions={kineticCaptions} plan={plan} mood={curMood} />
          )}
        </Stage>
      </ThemeProvider>
      {(plan.finish.grain > 0 || plan.finish.lightLeaks > 0) && <FilmFinish plan={plan} />}
    </AbsoluteFill>
  );
};
