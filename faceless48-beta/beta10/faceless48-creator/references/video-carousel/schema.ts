import {z} from 'zod';
export const motionSceneSchema=z.object({
 start:z.number().nonnegative(),end:z.number().positive(),number:z.number().int().min(1),
 layout:z.enum(['duplicate','parallel','replace','signature','protect','questions','invitation','experience','team-story']),
 theme:z.enum(['charcoal','slate','paper','crimson']).default('charcoal'),
 headline:z.array(z.object({text:z.string().min(1).max(65),accent:z.enum(['white','copper','crimson']).default('white')})).min(1).max(4),
 label:z.string().max(70),body:z.string().max(160).default(''),
 items:z.array(z.string().max(90)).max(4).default([]),
 avatar:z.boolean().default(false),
 nonInstagram:z.boolean().optional(),
 storyboardAt:z.number().positive().default(4.5),
 motionNote:z.string().default(''),
});
export const motionCarouselSchema=z.object({
 kind:z.literal('motion-carousel'),slug:z.string().regex(/^[a-z0-9-]+$/),
 style:z.literal('editorial-motion').default('editorial-motion'),title:z.string(),durationSec:z.number().positive(),
 scenes:z.array(motionSceneSchema).min(1),
}).superRefine((p,c)=>{let end=0;for(const s of p.scenes){if(s.start!==end||s.end<=s.start||s.end>p.durationSec||s.storyboardAt>=s.end-s.start)c.addIssue({code:'custom',message:'Scenes must fill the timeline and contain their storyboard sample'});end=s.end;}if(end!==p.durationSec)c.addIssue({code:'custom',message:'Scenes must fill the full duration'});});
export type MotionScene=z.infer<typeof motionSceneSchema>;
export type MotionPlan=z.infer<typeof motionCarouselSchema>;
