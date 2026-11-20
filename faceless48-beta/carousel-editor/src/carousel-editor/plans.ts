import {videoCarouselSchema} from '../VideoCarousel';
declare const process: {env: {CAROUSEL_PLANS: unknown[]}};

export const carousels = process.env.CAROUSEL_PLANS.map((source) => {
  const plan = videoCarouselSchema.parse(source);
  return {name: plan.series || plan.slug.replaceAll('-', ' '), plan};
});
