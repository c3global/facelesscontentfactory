// Two-phase prompt set:
//   IDEAS_PROMPTS — cheap Haiku call. 30 idea cards per platform (title + one-line angle).
//   CONTENT_PROMPTS — Sonnet call to write a single piece of long-form content from one approved idea.
//
// Each prompt accepts the user's brand profile (from public.brand_settings)
// so the voice, signature CTA, and banned phrases steer every piece. The
// brand block is built once via brandBlock() and woven into VOICE / HEADER.

function brandBlock(brand) {
  if (!brand) return '';
  const tags  = Array.isArray(brand.voice_tags) ? brand.voice_tags.filter(Boolean) : [];
  const notes = (brand.voice_notes || '').trim();
  const cta   = (brand.signature_cta || '').trim();
  const banned = (brand.banned_phrases || '').trim();
  const lines = [];
  if (tags.length) lines.push(`Voice descriptors: ${tags.join(', ')}.`);
  if (notes)       lines.push(`Voice notes from the creator (follow these closely): ${notes}`);
  if (cta)         lines.push(`Where it fits naturally, weave in this signature closer: "${cta}". Do not force it.`);
  if (banned)      lines.push(`Never use these words or phrases: ${banned}.`);
  return lines.length ? `\n\nBRAND PROFILE — match this voice precisely:\n${lines.join('\n')}` : '';
}

const NO_AI_TELLS = `Never write as "Cadence" or any AI assistant. Never sign off as Cadence or include "— Cadence" or any model byline. The piece is published BY the creator, not by an AI. Do not use AI-tells like "in today's digital landscape", "game-changer", "unlock", "let's dive in", "in conclusion", "navigate the", or em-dash overuse.`;

const VOICE = (niche, brand) => `Niche: "${niche}".
Voice: confident, warm, specific. No filler.
You are helping a faceless creator in the C3 Global community plan and write content they'll publish under their own name.
${NO_AI_TELLS}${brandBlock(brand)}`;

const JSON_ONLY = `Return ONLY valid JSON. No markdown, no backticks, no commentary before or after.`;

// =========================================================================
// IDEAS (Haiku) — small, fast, cheap. Just title + angle per item.
// =========================================================================

export const IDEAS_PROMPTS = {
  youtube: (niche, brand) => `${VOICE(niche, brand)}
Plan 30 days of YouTube videos for this niche. Each idea has:
- day (1-30)
- title (under 70 chars, click-curious not clickbait)
- angle (one sentence: what's the unique take or promise?)
${JSON_ONLY}
Shape: {"items":[{"day":1,"title":"...","angle":"..."}, ... 30 items]}`,

  shorts: (niche, brand) => `${VOICE(niche, brand)}
Plan 30 days of Shorts/Reels/TikTok videos. Each idea:
- day (1-30)
- title (5-9 word hook line)
- angle (one sentence: the payoff or twist)
${JSON_ONLY}
Shape: {"items":[{"day":1,"title":"...","angle":"..."}, ... 30 items]}`,

  linkedin: (niche, brand) => `${VOICE(niche, brand)}
Plan 30 days of LinkedIn posts. Each idea:
- day (1-30)
- title (the opener line, under 90 chars)
- angle (one sentence: the insight or story arc)
${JSON_ONLY}
Shape: {"items":[{"day":1,"title":"...","angle":"..."}, ... 30 items]}`,

  substack: (niche, brand) => `${VOICE(niche, brand)}
Plan 30 days of long-form pieces (Substack newsletter issues, blog posts, or Medium articles — same shape, different destinations). Each idea:
- day (1-30)
- title (compelling headline / subject line, under 65 chars)
- angle (one sentence: the core idea or promise)
${JSON_ONLY}
Shape: {"items":[{"day":1,"title":"...","angle":"..."}, ... 30 items]}`,

  social: (niche, brand) => `${VOICE(niche, brand)}
Plan 30 days of Instagram/Facebook static posts. Each idea:
- day (1-30)
- title (the hook line)
- angle (one sentence: the value or hot take)
${JSON_ONLY}
Shape: {"items":[{"day":1,"title":"...","angle":"..."}, ... 30 items]}`,

  text: (niche, brand) => `${VOICE(niche, brand)}
Plan 30 days of text-only posts (X / Threads style). Each idea:
- day (1-30)
- title (the opener / hook)
- angle (one sentence: where it goes)
${JSON_ONLY}
Shape: {"items":[{"day":1,"title":"...","angle":"..."}, ... 30 items]}`,
};

// Regenerate ONE idea, given a platform + niche + the day number.
export function regenerateIdeaPrompt(niche, platform, day, avoid = [], brand) {
  const base = IDEAS_PROMPTS[platform]?.(niche, brand) ?? '';
  const avoidLine = avoid.length
    ? `\nAvoid repeating these titles: ${avoid.map((a) => `"${a}"`).join(', ')}.`
    : '';
  return `${base}
But return ONLY one idea for day ${day}, not 30.${avoidLine}
Shape: {"day":${day},"title":"...","angle":"..."}`;
}

// =========================================================================
// CONTENT (Sonnet) — write one fully-finished piece from one approved idea.
// =========================================================================

const HEADER = (niche, idea, brand) => `${VOICE(niche, brand)}
You are writing the full piece for ONE approved idea:
- Title: ${idea.title}
- Angle: ${idea.angle}
Stay true to the title and angle. No placeholders, no "[insert example]", no outlines — finished, paste-ready copy.
${NO_AI_TELLS}`;

export const CONTENT_PROMPTS = {
  youtube: (niche, idea, brand) => `${HEADER(niche, idea, brand)}
Write a complete YouTube video script (600-900 words): hook → intro → 3-5 body beats → recap → CTA.
${JSON_ONLY}
Shape: {"day":${idea.day},"title":"${escape(idea.title)}","hook":"...","fullScript":"..."}`,

  shorts: (niche, idea, brand) => `${HEADER(niche, idea, brand)}
Write a complete vertical short script (80-150 words) with on-screen text cues in (parens). Add a caption under 150 chars and 5-8 hashtags (no #).
${JSON_ONLY}
Shape: {"day":${idea.day},"hook":"...","fullScript":"...","caption":"...","hashtags":["..."]}`,

  linkedin: (niche, idea, brand) => `${HEADER(niche, idea, brand)}
Write a complete LinkedIn post (150-300 words): single-sentence opener, line breaks between thoughts, clear CTA or question at the end. Include 3-5 hashtags (no #).
${JSON_ONLY}
Shape: {"day":${idea.day},"fullPost":"...","hashtags":["..."]}`,

  substack: (niche, idea, brand) => `${HEADER(niche, idea, brand)}
Write a complete long-form piece (600-900 words) that works equally well as a Substack issue or a blog post.
Structure: a strong opening lead → one core idea developed across 2-4 distinct beats → a personal takeaway. End with a final paragraph that gives the reader the takeaway in their own hands — do NOT sign off with any name, byline, signature, or "— Cadence".
Use plain paragraphs separated by blank lines. You may use a small number of short subheadings if the piece naturally calls for them, but do not require them. Do not use markdown formatting characters (no #, no **, no backticks — just clean paragraphs).
${JSON_ONLY}
Shape: {"day":${idea.day},"subject":"${escape(idea.title)}","fullNewsletter":"..."}`,

  social: (niche, idea, brand) => `${HEADER(niche, idea, brand)}
Write a complete IG/FB caption (80-200 words): hook → body → CTA. Add 8-15 hashtags (no #).
${JSON_ONLY}
Shape: {"day":${idea.day},"fullCaption":"...","hashtags":["..."]}`,

  text: (niche, idea, brand) => `${HEADER(niche, idea, brand)}
Write a complete standalone post (100-250 words) in X / Threads style. Single block; double-newlines if it's a thread.
${JSON_ONLY}
Shape: {"day":${idea.day},"fullPost":"..."}`,
};

function escape(s = '') {
  return String(s).replace(/"/g, '\\"');
}
