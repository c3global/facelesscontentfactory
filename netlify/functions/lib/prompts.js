// One prompt-builder per platform. Each asks Claude for that platform's
// 30 fully-written items as JSON. The function caller parses and merges.

const SYSTEM_PREAMBLE = (niche) => `You are Cadence, an elite content strategist for faceless creators.
Niche: "${niche}".
Voice: confident, warm, specific. No fluff, no "in today's world", no AI-tells.
Every piece must be FULLY WRITTEN and paste-ready — never outlines, never placeholders, never "[insert example]".
Return ONLY valid JSON. No prose before or after.`;

function jsonGuard(shape) {
  return `Return ONLY valid JSON matching this exact shape:\n${shape}\nDo not include markdown, backticks, or commentary.`;
}

export const PROMPTS = {
  youtube: (niche) => `${SYSTEM_PREAMBLE(niche)}

Produce 30 days of YouTube videos. Each item must include:
- day (1-30)
- title (under 70 chars, click-curious without being clickbait)
- hook (the first 15 seconds, verbatim)
- fullScript (600–900 words, complete script: hook → intro → 3-5 body beats → recap → CTA. Plain text, no stage directions in brackets.)

${jsonGuard('{"items":[{"day":1,"title":"...","hook":"...","fullScript":"..."}, ... 30 items]}')}`,

  shorts: (niche) => `${SYSTEM_PREAMBLE(niche)}

Produce 30 days of vertical short-form videos (Shorts/Reels/TikTok). Each item:
- day (1-30)
- hook (first 3 seconds, verbatim)
- fullScript (80–150 words, complete script with on-screen text cues in (parens))
- caption (under 150 chars)
- hashtags (array of 5-8 strings, no # sign)

${jsonGuard('{"items":[{"day":1,"hook":"...","fullScript":"...","caption":"...","hashtags":["..."]}, ... 30 items]}')}`,

  linkedin: (niche) => `${SYSTEM_PREAMBLE(niche)}

Produce 30 days of LinkedIn posts. Each item:
- day (1-30)
- fullPost (150–300 words, complete post with single-sentence opener, line breaks between thoughts, ending with a clear CTA or question)
- hashtags (array of 3-5 strings, no # sign)

${jsonGuard('{"items":[{"day":1,"fullPost":"...","hashtags":["..."]}, ... 30 items]}')}`,

  blog: (niche) => `${SYSTEM_PREAMBLE(niche)}

Produce 30 days of blog articles. Each item:
- day (1-30)
- title (SEO-friendly, under 65 chars)
- fullArticle (800–1200 words in markdown, with H2 sections, complete body, no placeholders)

${jsonGuard('{"items":[{"day":1,"title":"...","fullArticle":"..."}, ... 30 items]}')}`,

  substack: (niche) => `${SYSTEM_PREAMBLE(niche)}

Produce 30 days of Substack newsletter issues. Each item:
- day (1-30)
- subject (compelling email subject line, under 60 chars)
- fullNewsletter (500–800 words, complete: greeting → 1 strong idea fully developed → personal aside → sign-off)

${jsonGuard('{"items":[{"day":1,"subject":"...","fullNewsletter":"..."}, ... 30 items]}')}`,

  social: (niche) => `${SYSTEM_PREAMBLE(niche)}

Produce 30 days of Instagram/Facebook static post captions. Each item:
- day (1-30)
- fullCaption (complete caption: hook line → body → CTA, 80–200 words)
- hashtags (array of 8-15 strings, no # sign)

${jsonGuard('{"items":[{"day":1,"fullCaption":"...","hashtags":["..."]}, ... 30 items]}')}`,

  text: (niche) => `${SYSTEM_PREAMBLE(niche)}

Produce 30 days of text-only posts (X / Threads style). Each item:
- day (1-30)
- fullPost (100–250 words, complete standalone post. Can be a thread written as one block with double-newlines between tweets, or a single longer post.)

${jsonGuard('{"items":[{"day":1,"fullPost":"..."}, ... 30 items]}')}`,
};
