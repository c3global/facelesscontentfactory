import {CaptionWord} from './Captions';

export const FPS = 25;
export const DURATION_FRAMES = 923; // 36.92s at 25fps
const f = (sec: number) => Math.round(sec * FPS);

/**
 * Cutaway schedule for the "20 years of English" clip.
 * Timings come from the offline transcript of the raw avatar video.
 */
export const schedule = {
  stat: {from: f(0.3), dur: f(3.2)},
  quote1: {from: f(4.1), dur: f(3.8)},
  name: {from: f(8.1), dur: f(2.6)},
  broll: {from: f(10.7), dur: f(5.5)},
  quote2: {from: f(23.1), dur: f(4.4)},
  statement: {from: f(28.0), dur: f(4.6)},
  cta: {from: f(32.8), dur: f(4.1)},
};

const w = (word: string, s: number, e: number): CaptionWord => ({w: word, s, e});

// Captions are hidden while a card repeats the same line (see hideCaptions).
// Spans where the transcript was unreliable are left out on purpose.
export const captions: CaptionWord[][] = [
  [w('After', 0.17, 0.44), w('twenty', 0.45, 0.78), w('years', 0.79, 1.08)],
  [w('teaching', 1.09, 1.45), w('English', 1.46, 1.82), w('across', 1.83, 2.21)],
  [w('cultures,', 2.22, 2.79), w('I', 2.8, 2.97), w('learned', 2.98, 3.29), w('this:', 3.3, 3.71)],
  [w('In', 8.2, 8.35), w('some', 8.36, 8.69), w('Asian', 8.75, 9.09), w('contexts', 9.1, 9.67)],
  [w('where', 9.68, 9.79), w('I', 9.8, 9.88), w('taught,', 9.89, 10.27)],
  [w('people', 10.73, 11.08), w('waited', 11.09, 11.38), w('for', 11.39, 11.51)],
  [w('the', 11.52, 11.59), w('most', 11.6, 11.81), w('competent', 11.82, 12.37), w('voice', 12.38, 12.76)],
  [w('or', 13.06, 13.18), w('one', 13.19, 13.56), w('person', 13.57, 14.05)],
  [w('to', 14.06, 14.16), w('speak', 14.17, 14.58)],
  [w('before', 14.67, 15.1), w('others', 15.14, 15.45), w('agreed', 15.46, 15.9)],
  [w('Check', 32.81, 33.03), w('the', 33.09, 33.18), w('link', 33.19, 33.42), w('below', 33.43, 33.89)],
  [w('or', 33.9, 34.09), w('in', 34.1, 34.31), w('my', 34.32, 34.49), w('bio', 34.5, 34.85)],
];

export const hideCaptions: Array<[number, number]> = [
  [4.0, 7.95],
  [23.0, 27.55],
  [27.95, 32.65],
];
