import json
M = {
'Q': 'digital-zoom blackout spotlight grade glow defocus statement-card citation-card quiet-feed screenshot-card headline-card chapter-card letterbox-x focus-list follow-card thank-you rack-focus iris examples silhouette-shift notes-card card-flip duotone',
'M': 'cover-story cover-frame press-front kinetic-hook giant-caption headline-card rewrite-card citation-card wall-text pull-back-reveal film-strip clip-type stamp envelope-open testimonial-stack image-collage cover-fan framed-clip side-by-side thank-you duotone headline-wall scene-text letter-dive pencil-strike caption-stack examples statement-card',
'G': 'glass-type glass-cards spatial-glass holo-phone layer-explode depth-scatter prompt-bar demo-cursor live-cursor ui-world phone-mockup phone-frame card-orbit card-carousel card-flip toggle-switch generating-tiles render-progress pixel-monitor text-pop shatter-3d glow voice-note predict-keys floating-chips hub-diagram congruence-map examples lock-screen',
'S': 'paper-cut paper-tear doodle-boil pen-circle sketch-words polaroid-drop notes-page freeze-sticker sticky-text note-arrow framed-clip specimen-card stamp feedback-note receipt-ticket name-tag keycap-drop envelope-open storyboard-wall storyboard-deck image-collage cover-fan pencil-strike notes-card examples freeze-label',
'A': 'freebie-doc big-stat proof-card trend-graph chart-grow odometer the-stack leaderboard compare before-after side-by-side vote-pill date-stamp knockout-tiles terminal-type code-body countdown-timer effort-dial dropdown-select planner-grid frame-calendar day-dial eyedropper-grade grade-slider checklist focus-list examples banknote waitlist-card citation-card',
'C': 'dolly-zoom vertigo rack-focus iris spotlight silhouette-shift blackout zoom-through pull-back freeze-hold grade dust glow defocus blow-away duotone statement-card scene-text depth-scatter letter-orbit flash-frame match-cut examples',
'H': 'freebie-doc clone clone-row orbit couch-wall type-wall headline-wall knockout-tiles frame-break letter-orbit post-wall reel-feed reel-stack playing-grid video-card card-orbit impact-frame blade-slice shatter-3d slot-machine match-cut text-pop flash-frame comment-bubble comment-drop comment-cta comment-post head-stack gravity-drop jiggle-delete timeline-burn icon-strike file-drop countdown-timer vote-pill',
'T': 'freebie-doc shoulder-steps step-chips checklist focus-list notes-card notes-page pointer-callout freeze-label hub-diagram congruence-map chapter-card the-stack before-after card-flip whiteboard-x green-screen script-panel examples headline-card email-compose chat-ui notification-stack meeting-tile rewrite-card voice-memo tag',
}
names = [x['name'] for x in json.load(open('work/effects.json'))]
out = {n: [k for k, v in M.items() if n in v.split()] for n in names}
un = [n for n, v in out.items() if not v]
print('unassigned:', un)
json.dump(out, open('work/mapping.json', 'w'))
