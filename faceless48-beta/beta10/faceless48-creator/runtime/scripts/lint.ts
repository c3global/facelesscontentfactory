/**
 * Plan lint for talking-head plans: catches the problems a reviewer notices on screen before anything is rendered.
 *
 *   npm run f48 -- lint content/<plan>.json
 *
 * 1. Collision: a caption band shares seconds with a graphic that sits in the same part of the frame.
 * 2. Echo: a caption says the same thing as text already on screen (captions should be off for that stretch, or the
 *    graphic should say something different).
 * 3. Timing: an effect item (checklist tick, type-wall word, chip, drop) lands far from the word it is about.
 *
 * It prints warnings and never blocks a render. A clean lint is not a promise the video looks right: still look at stills.
 */
export type Issue = {kind: 'collision' | 'echo' | 'timing'; at: number; message: string};

type Cap = {text: string; startMs: number; endMs: number};
const STOP = new Set('a an the and or but of to in on at for with your you my our it its is are was were be been this that these those so as by from into than then there here i we they he she me us them his her their do does did not no just also very can will would could should have has had'.split(' '));
const stem = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(ing|ed|es|s)$/, '');
const content = (s: string) => s.split(/\s+/).map(stem).filter((w) => w.length > 2 && !STOP.has(w));

/** fx that occupy the lower third by default */
const LOWER = new Set(['checklist', 'prompt-bar', 'comment-drop', 'comment-cta', 'comment-bubble', 'card-flip', 'receipt-ticket', 'toggle-switch', 'stack', 'odometer', 'chart-grow']);

type Shown = {text: string; from: number; to: number; what: string};

export function lintPlan(raw: any): Issue[] {
  const out: Issue[] = [];
  if (!raw || raw.kind !== 'talking-head') return out;
  const plan = raw.plan;
  const caps: Cap[] = (raw.captions || []).filter((c: Cap) => c.text?.trim());
  const segs: any[] = (plan.scenes || []).flatMap((s: any) => s.segments.map((g: any) => ({...g, scene: s})));
  const segAt = (t: number) => segs.find((g) => t >= g.start - 0.001 && t < g.end - 0.001);
  const shown: Shown[] = [];

  // everything with words on screen, and when it is on screen
  for (const g of segs) {
    for (const gr of g.graphics || []) {
      const from = gr.at ?? g.start;
      const to = gr.until ?? g.end;
      const p = gr.props || {};
      const add = (text: unknown, what: string) => typeof text === 'string' && text.trim() && shown.push({text, from, to, what});
      if (gr.type === 'headline-card') add(p.line, 'headline card');
      else if (gr.type === 'statement-card') add(p.text, 'statement card');
      else if (gr.type === 'floating-chips') (p.chips || []).forEach((c: any) => shown.push({text: c.text, from: Math.max(from, c.at ?? from), to, what: 'chip'}));
      else if (gr.type === 'notes-card' || gr.type === 'quiet-feed' || gr.type === 'notification-stack') add(JSON.stringify(p).replace(/[{}":,\[\]]/g, ' '), gr.type);
    }
  }
  for (const f of plan.fx || []) {
    const from = f.at;
    const to = f.until ?? f.at + 3;
    const p = f.props || {};
    const add = (text: unknown, what: string, a = from) => typeof text === 'string' && text.trim() && shown.push({text, from: a, to, what});
    if (f.type === 'prompt-bar') add(p.text, 'prompt bar', p.typeAt ?? from);
    if (f.type === 'checklist') (p.items || []).forEach((i: any) => add(i.text, 'checklist item', i.at));
    if (f.type === 'orbit') (p.items || []).forEach((i: string) => add(i, 'orbiting card'));
    if (f.type === 'type-wall') (p.words || []).forEach((w: any) => add(w.text, 'type wall word', w.at));
    if (f.type === 'card-flip') (p.cards || []).forEach((c: any) => add(`${c.front} ${c.back ?? ''}`, 'flip card', c.from));
  }

  // 1. collisions
  for (const f of plan.fx || []) {
    if (!LOWER.has(f.type)) continue;
    const to = f.until ?? f.at + 3;
    for (const g of segs) {
      if (g.captions === 'off' || g.end <= f.at || g.start >= to) continue;
      const pos = g.captionPos ?? 'bottom';
      if ((pos === 'bottom' || pos === 'alternate') && !(f.type === 'prompt-bar' && plan.captionStyle === 'pill')) {
        out.push({kind: 'collision', at: Math.max(f.at, g.start), message: `"${f.type}" sits in the lower third while captions are at the bottom (${Math.max(f.at, g.start).toFixed(1)}s to ${Math.min(to, g.end).toFixed(1)}s). Move captions to the top (captionPos "top") or move the effect.`});
        break;
      }
    }
  }
  const topBandTop = plan.captionBandTop?.top ?? 250;
  for (const g of segs) {
    if ((g.captionPos === 'top' || g.captionPos === 'alternate') && g.captions !== 'off') {
      for (const gr of g.graphics || []) {
        if (gr.type === 'tag' && topBandTop < 340 && (gr.until ?? g.end) > g.start && (gr.at ?? g.start) < g.end) {
          out.push({kind: 'collision', at: gr.at ?? g.start, message: `The style label and top captions share the top of the frame (${g.start.toFixed(1)}s). Lower captionBandTop to start at 360 or more, or use bottom captions while the label shows.`});
        }
      }
    }
  }

  // 2. echoes: captions repeating text that is already on screen
  for (const s of shown) {
    const want = content(s.text);
    if (want.length < 2) continue; // one word is a label, not an echo
    const spoken = caps.filter((c) => c.startMs / 1000 >= s.from - 0.2 && c.startMs / 1000 < s.to).filter((c) => segAt(c.startMs / 1000)?.captions !== 'off');
    const said = new Set(spoken.flatMap((c) => content(c.text)));
    const hit = want.filter((w) => said.has(w)).length;
    if (hit / want.length >= 0.7) {
      out.push({kind: 'echo', at: s.from, message: `Captions repeat the ${s.what} "${s.text.trim().slice(0, 48)}" (${s.from.toFixed(1)}s). Turn captions off for that stretch if the graphic shows every spoken word, or write the graphic so it adds something instead of echoing.`});
    }
  }

  // 3. timing: effect items should land on their own word
  const wordNear = (w: string, t: number) => caps.filter((c) => stem(c.text) === w && Math.abs(c.startMs / 1000 - t) < 2.5).sort((a, b) => Math.abs(a.startMs / 1000 - t) - Math.abs(b.startMs / 1000 - t))[0];
  for (const s of shown) {
    if (!['checklist item', 'type wall word', 'chip'].includes(s.what)) continue;
    const first = content(s.text)[0];
    if (!first) continue;
    const c = wordNear(first, s.from);
    if (!c) continue;
    const d = s.from - c.startMs / 1000;
    if (Math.abs(d) > 0.4) out.push({kind: 'timing', at: s.from, message: `"${s.text.trim()}" lands at ${s.from.toFixed(2)}s but the word "${c.text.trim()}" is said at ${(c.startMs / 1000).toFixed(2)}s (${d > 0 ? 'late' : 'early'} by ${Math.abs(d).toFixed(2)}s).`});
  }
  return out.sort((a, b) => a.at - b.at);
}

export function printLint(raw: any): number {
  const issues = lintPlan(raw);
  if (!issues.length) {
    console.log('Lint: no collisions, echoes or timing problems found.');
    return 0;
  }
  for (const i of issues) console.log(`Lint ${i.kind}: ${i.message}`);
  console.log(`Lint: ${issues.length} thing(s) to look at before rendering.`);
  return issues.length;
}
