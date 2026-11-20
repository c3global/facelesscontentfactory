import {z} from 'zod';

const defaultOrder = ['sprite', 'headline', 'content'];
export const layerOrderSchema = z.array(z.string().regex(/^(?:sprite|headline|content|item:[a-z][a-z0-9-]{0,50}|headline-part:[0-9]{1,3})$/))
  .max(80).refine((order) => new Set(order).size === order.length, 'Duplicate layers');
export const headlineWidthSchema = z.number().int().min(340).max(970);
export const defaultHeadlineWidth = 830;

export function headlineParts(text: string) {
  return text.split(/(\*[^*]+\*)/g).flatMap((chunk) => {
    const accent = chunk.startsWith('*') && chunk.endsWith('*');
    return (accent ? chunk.slice(1, -1) : chunk).split(/(\n)/).filter(Boolean).map((text) => ({text, accent}));
  });
}

export function slideLayerOrder(order?: string[]) {
  if (!order?.length) return [...defaultOrder];
  return [...defaultOrder.filter((key) => !order.includes(key)), ...order];
}

export function isIndividualLayer(key: string) {
  return key.startsWith('item:') || key.startsWith('headline-part:');
}

export function layerOwner(key: string) {
  return key.startsWith('headline-part:') ? 'headline' : 'content';
}

export function layerSelector(key: string) {
  if (key.startsWith('item:')) return `[data-carousel-item="${key.slice(5)}"]`;
  if (key.startsWith('headline-part:')) return `[data-carousel-headline-part="${key.slice(14)}"]`;
  if (key === 'headline') return '[data-carousel-editable-headline]';
  if (key === 'content') return '[data-carousel-graphics]';
  return '[data-carousel-sprite]';
}

export type LayerDirection = 'front' | 'forward' | 'backward' | 'back';

export function reorderLayer(order: string[], key: string, direction: LayerDirection) {
  const at = order.indexOf(key);
  const rest = order.filter((item) => item !== key);
  const owner = rest.indexOf(layerOwner(key));
  let target: number;
  switch (direction) {
    case 'front': target = rest.length; break;
    case 'back': target = 0; break;
    case 'forward': target = at === -1 ? owner + 1 : Math.min(rest.length, at + 1); break;
    case 'backward': target = at === -1 ? owner : Math.max(0, at - 1); break;
  }
  if (at === target) return order;
  return [...rest.slice(0, target), key, ...rest.slice(target)];
}
