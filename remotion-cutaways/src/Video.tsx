import React, {useMemo} from 'react';
import {Audio, AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, BackdropKind, PhotoBackdrop} from './backdrops';
import {FieldOption, brand} from './brand';
import {CaptionLayer, buildPages} from './Captions';
import {KineticLayer} from './Kinetic';
import {loadBrandFonts} from './fonts';
import {GlassSurface, RefractDefs} from './glass';
import {ChapterCard} from './graphics/ChapterCard';
import {FilmFinish} from './Finish';
import {NotesCard} from './graphics/NotesCard';
import {CongruenceMap} from './graphics/CongruenceMap';
import {CitationCard, QuietFeed} from './graphics/Cutaways';
import {ScreenshotCard} from './graphics/ScreenshotCard';
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
import {FxBehind, FxLooks, FxOver, FxSound, OutlineAlways, videoMods} from './fx/FxLayers';
import {FxEnvProvider, fxRange, useLoadedAnchors} from './fx/util';

const FULL_FRAME: Graphic['type'][] = ['tag', 'floating-chips', 'chapter-card', 'congruence-map', 'screenshot-card', 'quiet-feed', 'citation-card'];

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
  }
};

const kindFor = (scene: Scene, field: FieldOption): BackdropKind =>
  field.startsWith('marble') ? (field as BackdropKind) : scene.mood === 'light' ? 'light' : (field as BackdropKind);

export const Video: React.FC<VideoProps> = ({plan, captions}) => {
  loadBrandFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const flat = useMemo(() => flatten(plan, fps), [plan, fps]);
  // the avatar's mouth moves a little before its sound, so a clip can ask for its captions to arrive early (captionLeadSec)
  const lead = (plan.captionLeadSec ?? 0) * 1000;
  // words spoken inside a "captions: off" stretch are carried by that scene's graphic, so they are never captioned
  const offStretches = useMemo(() => plan.scenes.flatMap((sc) => sc.segments).filter((sg) => sg.captions === 'off'), [plan.scenes]);
  const shown = useMemo(() => {
    const kept = offStretches.length ? captions.filter((c) => !offStretches.some((sg) => c.startMs / 1000 >= sg.start - 0.001 && c.startMs / 1000 < sg.end - 0.001)) : captions;
    return lead ? kept.map((c) => ({...c, startMs: Math.max(0, c.startMs - lead), endMs: Math.max(0, c.endMs - lead)})) : kept;
  }, [captions, lead, offStretches]);
  const pages = useMemo(() => buildPages(shown, plan.captionPageMs), [shown, plan.captionPageMs]);
  const {field, sans} = plan.theme;
  const anchors = useLoadedAnchors(plan.matte);
  // seconds she is speaking (gaps under 0.45 s bridged), used by the voice-memo waveform
  const speech = useMemo(() => {
    const out: [number, number][] = [];
    for (const c of [...captions].sort((x, y) => x.startMs - y.startMs)) {
      const a = c.startMs / 1000;
      const b = c.endMs / 1000;
      const last = out[out.length - 1];
      if (last && a - last[1] < 0.45) last[1] = Math.max(last[1], b);
      else out.push([a, b]);
    }
    return out;
  }, [captions]);
  const mods = videoMods(plan.fx, frame / fps);
  // music level per frame: ducks while she speaks (word timings, smoothed), fades in at the start and out at the end
  const musicVolume = useMemo(() => {
    const m = plan.music;
    if (!m) return () => 0;
    // her speech as spans, with gaps shorter than 0.9 s bridged so the bed does not pump up in every breath
    const raw = captions.map((c) => [c.startMs / 1000 - 0.12, c.endMs / 1000 + 0.25] as [number, number]).sort((x, y) => x[0] - y[0]);
    const spans: [number, number][] = [];
    for (const sp of raw) {
      const last = spans[spans.length - 1];
      if (last && sp[0] - last[1] < 0.9) last[1] = Math.max(last[1], sp[1]);
      else spans.push([sp[0], sp[1]]);
    }
    const total = plan.durationSec;
    return (f: number) => {
      const t = f / fps;
      let near = 0;
      for (const [a, b] of spans) {
        if (t >= a && t <= b) {
          near = 1;
          break;
        }
        // fast attack (0.15 s) when she starts, slow release (0.6 s) after she stops
        if (t < a && a - t < 0.15) near = Math.max(near, 1 - (a - t) / 0.15);
        if (t > b && t - b < 0.6) near = Math.max(near, 1 - (t - b) / 0.6);
      }
      const level = m.volume + (m.duckTo - m.volume) * near;
      const fin = m.fadeInSec > 0 ? Math.min(1, t / m.fadeInSec) : 1;
      const fout = m.fadeOutSec > 0 ? Math.min(1, Math.max(0, (total - t) / m.fadeOutSec)) : 1;
      return level * fin * fout;
    };
  }, [plan.music, plan.durationSec, captions, fps]);
  // the end card says the closing line itself, so captions stop where it begins
  const kineticCaptions = useMemo(
    () => (plan.endCard ? shown.filter((c) => c.startMs < plan.endCard!.startAt * 1000 - 40) : shown),
    [shown, plan.endCard],
  );

  const blend = layoutBlend(flat, frame);
  const av = avatarStateBlend(flat, frame);
  const curField = blend.layout !== 'A';
  const prevField = blend.prev ? blend.prev.seg.layout !== 'A' : false;
  const prevOpacity = prevField ? (curField ? 1 : 1 - blend.p) : 0;
  const curOpacity = curField ? blend.p : 0;
  // the hook scrim darkens the lower half for the full-frame caption; effects bring their own plates, so it steps aside while one runs
  const tNow = frame / fps;
  const fxOn = plan.fx.some((f) => {
    if (['grade', 'glow', 'dust', 'letterbox', 'date-stamp', 'flash-frame', 'pull-back', 'digital-zoom'].includes(f.type)) return false; // looks and marks do not replace the scrim
    const [fa, fb] = fxRange(f);
    return tNow >= fa && tNow <= fb;
  });
  const scrim = (1 - av.frame) * (fxOn ? 0 : 1) * (plan.scrim ?? 1);
  const sceneIdx = (s: Scene) => plan.scenes.indexOf(s);
  const curMood = blend.cur.scene.mood;
  const metalVariant = curMood === 'dark' && field !== 'rosegold' ? 'bright' : 'deep';

  // circle factor: 0 for windows, 1 for the corner circle. Drives the thick metal ring.
  const half = Math.min(av.w, av.h) / 2;
  const cf = Math.min(1, Math.max(0, (av.r - 60) / Math.max(1, half - 60)));
  void cf;
  // her clip's framing (camera-move effects add zoom and blur); the cutout uses the same style so it lines up
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
  // thin frame: a 10 px glass bezel and a 3.5 px metal rim
  const inset = av.frame * 10;
  const rimT = av.frame * 3.5;

  return (
    <AbsoluteFill style={{backgroundColor: curMood === 'light' && curField ? brand.white : brand.black}}>
      <RefractDefs />
      {plan.music && <Audio src={staticFile(plan.music.src)} volume={musicVolume} startFrom={Math.round(plan.music.startFromSec * fps)} loop />}

      {/* animated field backdrops; the previous one sits underneath so mood changes cross-fade */}
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
            <OffthreadVideo src={staticFile(plan.video)} style={videoStyle} />
            <FxEnvProvider slug={plan.matte} anchors={anchors} video={plan.video} videoStyle={videoStyle} outline={plan.matteOutline} speech={speech}>
              <OutlineAlways />
              <FxBehind fx={plan.fx} />
              <FxLooks fx={plan.fx} />
            </FxEnvProvider>
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
                          ...(full || (g.box && !g.box.center) ? {} : {display: 'flex', flexDirection: 'column', justifyContent: 'center'}),
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

      <FxEnvProvider slug={plan.matte} anchors={anchors} video={plan.video} videoStyle={videoStyle} outline={plan.matteOutline} speech={speech}>
        <FxOver fx={plan.fx} />
      </FxEnvProvider>
      {plan.fx.length > 0 && <FxSound fx={plan.fx} volume={plan.fxVolume} mode={plan.fxSound} labels={plan.soundLabels} />}

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
        {plan.captionStyle === 'pill' ? (
          <CaptionLayer pages={pages} emphasis={plan.emphasis} flat={flat as FlatSegment[]} />
        ) : (
          <KineticLayer captions={kineticCaptions} plan={plan} mood={curMood} />
        )}
      </ThemeProvider>
      {(plan.finish.grain > 0 || plan.finish.lightLeaks > 0) && <FilmFinish plan={plan} />}
    </AbsoluteFill>
  );
};
