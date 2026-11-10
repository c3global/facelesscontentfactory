/**
 * Storyboard: one still per important moment of a plan, laid out in order so the whole video can be approved before
 * it renders.
 *
 *   npm run f48 -- storyboard content/<plan>.json
 *
 * This file only decides which moments to show and writes the sheet. The stills themselves are rendered in f48.ts.
 */
export type Moment = {t: number; label: string; caption: string};

type Cap = {text: string; startMs: number; endMs: number};

const MAX_FRAMES = 20;
const MIN_GAP = 0.7;

const pretty = (s: string) => s.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** The words spoken around a moment, so the storyboard shows what is being said as well as what is on screen. */
export function captionAround(caps: Cap[], t: number, span = 1.6): string {
  return caps
    .filter((c) => c.text?.trim() && c.startMs / 1000 >= t - span && c.startMs / 1000 <= t + span)
    .map((c) => c.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Keeps the first moment in any burst, then thins the list to at most `max`, always keeping the first and last. */
export function thin(moments: Moment[], max = MAX_FRAMES, gap = MIN_GAP): Moment[] {
  const sorted = [...moments].sort((a, b) => a.t - b.t);
  const kept: Moment[] = [];
  for (const m of sorted) if (!kept.length || m.t - kept[kept.length - 1].t >= gap) kept.push(m);
  if (kept.length <= max) return kept;
  const out: Moment[] = [];
  for (let i = 0; i < max; i++) out.push(kept[Math.round((i * (kept.length - 1)) / (max - 1))]);
  return out.filter((m, i) => i === 0 || m !== out[i - 1]);
}

/** A long stretch with nothing new on screen still gets a frame, so the sheet never skips a few seconds of video. */
export function fillGaps(moments: Moment[], durationSec: number, maxGap = 3.5, max = MAX_FRAMES): Moment[] {
  const out: Moment[] = [];
  let prev = 0;
  for (const m of [...moments, {t: durationSec, label: '', caption: ''}]) {
    const gaps = Math.floor((m.t - prev) / maxGap);
    for (let k = 1; k <= gaps && out.length + moments.length < max + 6; k++) {
      const t = prev + ((m.t - prev) * k) / (gaps + 1);
      if (t < durationSec - 0.1) out.push({t, label: 'Continues', caption: ''});
    }
    if (m.label) out.push(m);
    prev = m.t;
  }
  return out.sort((a, b) => a.t - b.t);
}

/** Even samples for plans that do not list their moments (stick figure videos). */
function evenly(duration: number, count: number): Moment[] {
  const n = Math.max(4, Math.min(count, Math.floor(duration / 3)));
  return Array.from({length: n}, (_, i) => ({t: Math.min(duration - 0.1, 0.4 + (i * (duration - 0.8)) / (n - 1 || 1)), label: `Moment ${i + 1}`, caption: ''}));
}

export function storyboardMoments(raw: any): {moments: Moment[]; durationSec: number} {
  if (!raw) throw Error('Empty plan');
  if (raw.kind === 'talking-head') {
    const plan = raw.plan;
    const caps: Cap[] = raw.captions || [];
    const list: Moment[] = [];
    let scene = 0;
    for (const s of plan.scenes || []) {
      for (const g of s.segments || []) {
        scene += 1;
        list.push({t: g.start + 0.35, label: `Scene ${scene}`, caption: ''});
        for (const gr of g.graphics || []) if (gr.type !== 'tag') list.push({t: (gr.at ?? g.start) + 0.8, label: pretty(gr.type), caption: ''});
      }
    }
    for (const f of plan.fx || []) {
      const span = (f.until ?? f.at + 3) - f.at;
      list.push({t: f.at + Math.min(1.2, span / 2), label: pretty(f.type), caption: ''});
    }
    if (plan.endCard) list.push({t: Math.max(0, plan.durationSec - 0.8), label: 'End card', caption: ''});
    const moments = fillGaps(thin(list), plan.durationSec).map((m) => ({...m, t: Math.min(m.t, plan.durationSec - 0.05), caption: captionAround(caps, m.t)}));
    return {moments, durationSec: plan.durationSec};
  }
  if (raw.kind === 'life-scene') {
    const plan = raw.plan ?? raw;
    const list: Moment[] = [];
    let at = 0;
    (plan.shots || []).forEach((s: any, i: number) => {
      list.push({t: at + Math.min(0.5, s.lengthSec / 2), label: `Shot ${i + 1}`, caption: ''});
      at += s.lengthSec;
    });
    for (const l of plan.text || []) list.push({t: l.fromSec + 0.6, label: 'Text card', caption: String(l.text ?? '')});
    return {moments: fillGaps(thin(list), plan.durationSec).map((m) => ({...m, t: Math.min(m.t, plan.durationSec - 0.05)})), durationSec: plan.durationSec};
  }
  if (raw.kind === 'stick') {
    const plan = raw.plan;
    const caps: Cap[] = raw.captions || [];
    // stick plans name their beats (cues); use those when they exist, otherwise sample evenly
    const cues = Object.entries(plan.cues || {}).filter(([, v]) => typeof v === 'number' && (v as number) >= 0 && (v as number) < plan.durationSec - 0.3) as [string, number][];
    const beats: Moment[] = cues.map(([k, v]) => ({t: v + 0.9, label: pretty(k), caption: ''}));
    const base = beats.length >= 4 ? fillGaps(thin(beats), plan.durationSec) : evenly(plan.durationSec, 14);
    return {moments: base.map((m) => ({...m, t: Math.min(m.t, plan.durationSec - 0.05), caption: captionAround(caps, m.t)})), durationSec: plan.durationSec};
  }
  // explainer plan: one frame per scene
  const caps: Cap[] = raw.captions || [];
  const list: Moment[] = (raw.scenes || []).map((s: any, i: number) => ({
    t: s.start + Math.min(1.2, (s.end - s.start) * 0.6),
    label: `Scene ${i + 1}: ${pretty(s.visual || 'presenter')}`,
    caption: s.title || '',
  }));
  return {moments: fillGaps(thin(list), raw.durationSec).map((m) => ({...m, caption: m.caption || captionAround(caps, m.t)})), durationSec: raw.durationSec};
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]!);
const stamp = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

export function storyboardHtml(title: string, moments: Moment[], files: string[], portrait: boolean): string {
  const cards = moments
    .map(
      (m, i) => `<figure><img src="${files[i]}" alt="Frame ${i + 1}"><figcaption><b>${i + 1}</b> <span>${esc(m.label)}</span> <i>${stamp(m.t)}</i>${m.caption ? `<p>${esc(m.caption)}</p>` : ''}</figcaption></figure>`,
    )
    .join('\n');
  return `<!doctype html><meta charset="utf-8"><title>Storyboard: ${esc(title)}</title>
<style>body{margin:0;padding:32px;background:#120D24;color:#E8E4FF;font:16px/1.4 system-ui,sans-serif}h1{font-size:26px;margin:0 0 6px}p.top{margin:0 0 24px;color:#C9C3EE}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(${portrait ? 220 : 380}px,1fr));gap:20px}figure{margin:0;background:#1C1533;border:1px solid #3D3570;border-radius:14px;overflow:hidden}
img{display:block;width:100%}figcaption{padding:10px 12px}b{display:inline-block;min-width:24px;height:24px;line-height:24px;text-align:center;border-radius:12px;background:#C9956C;color:#1C1533;margin-right:6px}
i{color:#9d96c9;font-style:normal;float:right}p{margin:6px 0 0;color:#C9C3EE;font-size:14px}</style>
<h1>Storyboard: ${esc(title)}</h1><p class="top">${moments.length} frames in order. Tell Claude "approve" to render, or name the frame numbers you want changed.</p>
<div class="g">\n${cards}\n</div>`;
}

export function storyboardMarkdown(title: string, moments: Moment[], files: string[]): string {
  const rows = moments.map((m, i) => `| ${i + 1} | ${stamp(m.t)} | ${m.label} | ${m.caption.replace(/\|/g, '/')} | ${files[i]} |`).join('\n');
  return `# Storyboard: ${title}\n\n| # | Time | What is on screen | Words being said | File |\n|---|------|-------------------|------------------|------|\n${rows}\n\nApprove it, or name the frame numbers to change. Nothing renders until you approve.\n`;
}
