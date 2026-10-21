# Reference frames (the locked look)

One frame from each finished stick-figure explainer, mid-video, portrait (1080x1920) and landscape (1920x1080). A new episode must look like these.

**Anchor set (the original look, compare against these first):** the-pile, role-relationship, equity-theory.
**Newer episodes (same look, new metaphors):** agreement, thaw, useful-easy, owner-after-launch, red-turns-green, funded-for-seven, trust-a-green, more-than-you-can-tell, quick-or-quiet, three-things-to-avoid.

What to check against them: white field, thin black line art, charcoal gray supporting cast (men and women), one crimson accent per scene, caption lockups with crimson italic emphasis words, Dr. CiCi in the lower third in portrait, props off every face, the same spacing between art and captions.

Regenerate: `ffmpeg -ss <55 percent of duration> -i out/<slug>-<format>.mp4 -frames:v 1 -q:v 3 docs/reference-frames/<slug>-<format>.jpg`
