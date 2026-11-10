import {useMemo} from 'react';
import type {Caption} from '@remotion/captions';
import {buildPages} from './Captions';
import type {ScenePlan} from './schema';
import {FlatSegment, flatten} from './timeline';

/** Everything both canvases (portrait and landscape) work out from the plan and the word timings. */
export const useVideoTiming = (plan: ScenePlan, captions: Caption[], fps: number) => {
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

  return {flat: flat as FlatSegment[], shown, pages, speech, musicVolume, kineticCaptions};
};
