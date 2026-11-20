import type {VideoCarouselPlan} from '../VideoCarousel';

type Slide = VideoCarouselPlan['slides'][number];
type Edit = {slideIndex: number; before: Slide; after: Slide; gesture?: number};
type CarouselDraft = {plan: VideoCarouselPlan; undo: Edit[]; redo: Edit[]};

type Action =
  | {type: 'edit'; carousel: number; slideIndex: number; update: Partial<Slide>; gesture?: number}
  | {type: 'undo' | 'redo'; carousel: number};

const historyLimit = 100;
const sameSlide = (a: Slide, b: Slide) => JSON.stringify(a) === JSON.stringify(b);

export function openDraft(plan: VideoCarouselPlan): CarouselDraft {
  return {plan, undo: [], redo: []};
}

function replaceSlide(plan: VideoCarouselPlan, slideIndex: number, slide: Slide): VideoCarouselPlan {
  return {...plan, slides: plan.slides.map((current, i) => i === slideIndex ? slide : current)};
}

export function editHistory(drafts: CarouselDraft[], action: Action): CarouselDraft[] {
  const draft = drafts[action.carousel];
  let next: CarouselDraft;
  if (action.type === 'edit') {
    const before = draft.plan.slides[action.slideIndex];
    const after = {...before, ...action.update};
    if (sameSlide(before, after)) return drafts;

    const last = draft.undo[draft.undo.length - 1];
    const extendsGesture = action.gesture !== undefined && last?.gesture === action.gesture && last.slideIndex === action.slideIndex;
    const entry = {slideIndex: action.slideIndex, before: extendsGesture ? last.before : before, after, gesture: action.gesture};
    const undo = extendsGesture ? draft.undo.slice(0, -1) : draft.undo.slice(-(historyLimit - 1));
    if (!sameSlide(entry.before, entry.after)) undo.push(entry);
    next = {plan: replaceSlide(draft.plan, action.slideIndex, after), undo, redo: []};
  } else {
    const stack = draft[action.type];
    const entry = stack[stack.length - 1];
    if (!entry) return drafts;
    next = action.type === 'undo'
      ? {
        plan: replaceSlide(draft.plan, entry.slideIndex, entry.before),
        undo: draft.undo.slice(0, -1),
        redo: [...draft.redo, entry],
      }
      : {
        plan: replaceSlide(draft.plan, entry.slideIndex, entry.after),
        undo: [...draft.undo, entry],
        redo: draft.redo.slice(0, -1),
      };
  }
  return drafts.map((current, i) => i === action.carousel ? next : current);
}
