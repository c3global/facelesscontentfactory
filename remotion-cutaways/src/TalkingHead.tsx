import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions} from './Captions';
import {BRollFrame} from './cutaways/BRollFrame';
import {CTACard} from './cutaways/CTACard';
import {NameCard} from './cutaways/NameCard';
import {QuoteCard} from './cutaways/QuoteCard';
import {StatCallout} from './cutaways/StatCallout';
import {captions, hideCaptions, schedule as s} from './data';
import {loadFonts} from './fonts';

export type TalkingHeadProps = {
  /** false renders the cutaways on an empty frame (for a transparent/alpha export). */
  showVideo: boolean;
};

const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (hideCaptions.some(([a, b]) => t >= a && t <= b)) return null;
  return <Captions words={captions} />;
};

export const TalkingHead: React.FC<TalkingHeadProps> = ({showVideo}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{backgroundColor: showVideo ? '#000' : 'transparent'}}>
      {showVideo && <OffthreadVideo src={staticFile('raw-avatar.mp4')} style={{width: '100%', height: '100%'}} />}

      {/* soft bottom scrim for caption legibility; transparent over the face and upper frame */}
      <AbsoluteFill
        style={{background: 'linear-gradient(180deg, transparent 58%, rgba(11,7,16,0.6) 100%)'}}
      />

      <Sequence from={s.stat.from} durationInFrames={s.stat.dur} layout="none">
        <StatCallout value={20} unit="years" caption="teaching English across cultures" durationInFrames={s.stat.dur} />
      </Sequence>
      <Sequence from={s.quote1.from} durationInFrames={s.quote1.dur} layout="none">
        <QuoteCard text="Silence in a meeting doesn't always mean agreement." durationInFrames={s.quote1.dur} />
      </Sequence>
      <Sequence from={s.name.from} durationInFrames={s.name.dur} layout="none">
        <NameCard name="Dr. CiCi" tag="C3 Global" durationInFrames={s.name.dur} />
      </Sequence>
      <Sequence from={s.broll.from} durationInFrames={s.broll.dur} layout="none">
        <BRollFrame caption="People waited for the most competent voice." durationInFrames={s.broll.dur} />
      </Sequence>
      <Sequence from={s.quote2.from} durationInFrames={s.quote2.dur} layout="none">
        <QuoteCard
          text="That gap could indicate that psychological safety is missing."
          durationInFrames={s.quote2.dur}
        />
      </Sequence>
      <Sequence from={s.statement.from} durationInFrames={s.statement.dur} layout="none">
        <QuoteCard
          quote={false}
          fontSize={92}
          text="Want to understand how culture shapes communication?"
          durationInFrames={s.statement.dur}
        />
      </Sequence>
      <Sequence from={s.cta.from} durationInFrames={s.cta.dur} layout="none">
        <CTACard text="Link below or in my bio" durationInFrames={s.cta.dur} />
      </Sequence>

      <CaptionLayer />
    </AbsoluteFill>
  );
};
