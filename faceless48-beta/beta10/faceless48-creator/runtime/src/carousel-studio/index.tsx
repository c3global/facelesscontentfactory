import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {VideoCarousel, resolveSlideSprite, videoCarouselSchema, type VideoCarouselPlan} from '../VideoCarousel';
import {carousels} from './plans';
import {IconLibrary} from './IconLibrary';
import {editHistory, openDraft} from './edit-history';
import {defaultHeadlineWidth, headlineParts, layerSelector, reorderLayer, slideLayerOrder, type LayerDirection} from '../carousel-layers';

type Slide = VideoCarouselPlan['slides'][number];
type Placement = NonNullable<Slide['graphicPlacement']>;
const defaultPlacement: Placement = {x: 0, y: 0, scale: 1};
declare const process: {env: {
  CAROUSEL_QUICK_ICONS: {src: string; name: string}[];
  CAROUSEL_CHARACTER_FILES: string[];
}};
const icons = process.env.CAROUSEL_QUICK_ICONS;
// Characters: poses in public/characters/ and photo cutouts in public/cutouts/. Files named face-... are expressions.
const characterFiles = process.env.CAROUSEL_CHARACTER_FILES;
const characterName = (file: string) => file.replace(/^.*\//, '').replace(/\.png$/, '').replace(/^face-/, '').replace(/[-_]/g, ' ');
const characterGroups: [string, string[]][] = [
  ['Poses', characterFiles.filter((file) => file.startsWith('characters/') && !/\/face-/.test(file))],
  ['Expressions', characterFiles.filter((file) => /\/face-/.test(file))],
  ['Photo cutouts', characterFiles.filter((file) => file.startsWith('cutouts/') && !/\/face-/.test(file))],
];
const isGrid = (plan: VideoCarouselPlan) => !!(plan.contentGrid ?? plan.c3ContentGrid);
type Layer = 'content' | 'headline' | 'sprite' | 'layers';
type EditableItem = {id: string; label: string};
const clamp = (value: number, lower: number, upper: number) => Math.min(upper, Math.max(lower, value));

function dragMatrix(item: Element | null, preview: Element | null, screenScale: number) {
  if (item?.parentElement instanceof SVGGraphicsElement) {
    const matrix = item.parentElement.getScreenCTM();
    if (matrix) return matrix.inverse();
  }

  let matrix = new DOMMatrix().scale(screenScale);
  if (item) {
    let local = new DOMMatrix();
    for (let parent = item.parentElement; parent && parent !== preview; parent = parent.parentElement) {
      // The Player's own screen scale was already measured from the preview.
      if (parent.matches('[data-carousel-slide]')) break;
      const style = getComputedStyle(parent);
      const rotation = parseFloat(style.rotate);
      const transform = new DOMMatrix(style.transform === 'none' ? undefined : style.transform);
      local = new DOMMatrix().rotate(rotation || 0).multiply(transform).multiply(local);
    }
    matrix = matrix.multiply(local);
  }
  return matrix.inverse();
}

// Show each slide once its parts have arrived. Template looks animate in from blank, so their first slide starts later too.
const previewStart = (plan: VideoCarouselPlan, i: number) => i === 0 && isGrid(plan) ? 0 : Math.min(i === 0 ? 2.5 : 4.75, plan.slides[i].seconds - 0.15);
const storageKey = (plan: VideoCarouselPlan) => `carousel-studio/1/${plan.slug}`;
function readDraft(original: VideoCarouselPlan) {
  const saved = localStorage.getItem(storageKey(original));
  if (saved) {
    try {
      const draft = videoCarouselSchema.parse(JSON.parse(saved));
      if (draft.slug === original.slug && draft.slides.length === original.slides.length) return draft;
    } catch {
      // A malformed browser draft should never prevent access to the original.
    }
  }
  return original;
}

function App() {
  const [drafts, dispatch] = useReducer(editHistory, carousels, (source) => source.map(({plan}) => openDraft(readDraft(plan))));
  const [carousel, setCarousel] = useState(0);
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(() => previewStart(carousels[0].plan, 0));
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [layer, setLayer] = useState<Layer>(() => isGrid(carousels[0].plan) ? 'content' : 'headline');
  const [individual, setIndividual] = useState(false);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [arrangedKey, setArrangedKey] = useState('content');
  const [browsingIcons, setBrowsingIcons] = useState(false);
  const player = useRef<PlayerRef>(null);
  const preview = useRef<HTMLDivElement>(null);
  const drag = useRef<{clientX: number; clientY: number; screenToLocal: DOMMatrix; x: number; y: number; item?: string; gesture: number}>();
  const nextGesture = useRef(0);
  const sliderGesture = useRef<number>();
  const headlineGesture = useRef<number>();
  const persisted = useRef(drafts);
  const draft = drafts[carousel];
  const plan = draft.plan;
  const slide = plan.slides[index];
  const placement = slide.graphicPlacement ?? defaultPlacement;
  const headline = slide.headlineOffset ?? defaultPlacement;
  const sprite = resolveSlideSprite(plan, slide);
  // Full layout editing needs the Content Grid look. Other looks can change their words here.
  const grid = isGrid(plan);
  const startedGrid = isGrid(carousels[carousel].plan);
  const itemMode = layer === 'content' && individual;
  const itemPosition = slide.elementOffsets?.[selectedItem] ?? defaultPlacement;
  const canUndo = draft.undo.length > 0;
  const canRedo = draft.redo.length > 0;
  const partOptions = headlineParts(slide.headline).flatMap(({text}, i) =>
    text.trim() ? [{id: `headline-part:${i}`, label: text.trim()}] : []);
  const mainLayers = [
    {id: 'content', label: 'Content group'},
    {id: 'headline', label: 'Headline'},
    ...(sprite.src ? [{id: 'sprite', label: 'Character'}] : []),
  ];
  const itemLayers = items.map(({id, label}) => ({id: `item:${id}`, label}));
  const layerLabels = new Map([...mainLayers, ...partOptions, ...itemLayers].map(({id, label}) => [id, label]));
  const activeKey = layerLabels.has(arrangedKey) ? arrangedKey : 'content';
  const order = slideLayerOrder(slide.layerOrder);
  const visibleOrder = order.filter((key) => layerLabels.has(key));
  const layerButtons: [LayerDirection, string][] = [
    ['front', 'Bring to front'], ['forward', 'Bring forward'],
    ['backward', 'Send backward'], ['back', 'Send to back'],
  ];
  const activePosition = layer === 'sprite' ? sprite : layer === 'headline' ? headline : itemMode ? itemPosition : placement;
  const previewPlan = useMemo(() => ({...plan, music: undefined}), [plan]);
  const frameOffset = plan.slides.slice(0, index).reduce((total, item) => total + Math.round(item.seconds * 30), 0);

  useEffect(() => {
    player.current?.seekTo(frameOffset + Math.round(time * 30));
  }, [frameOffset, time, carousel]);

  useEffect(() => {
    const canvas = preview.current;
    if (!canvas) return;
    const refreshItems = () => {
      const visibleItems = [...canvas.querySelectorAll('[data-carousel-item]')]
        .filter((node) => getComputedStyle(node).visibility === 'visible');
      const byId = new Map(visibleItems.map((node) => [node.getAttribute('data-carousel-item')!, node.getAttribute('data-carousel-item-label')!]));
      const next = [...byId].map(([id, label]) => ({id, label}));
      setItems((current) => current.length === next.length && current.every((item, i) => item.id === next[i].id && item.label === next[i].label) ? current : next);
      setSelectedItem((current) => next.some(({id}) => id === current) ? current : next[0]?.id ?? '');
    };
    const observer = new MutationObserver(refreshItems);
    observer.observe(canvas, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-carousel-item', 'data-carousel-item-label']});
    refreshItems();
    return () => observer.disconnect();
  }, [carousel, index]);

  useEffect(() => {
    const previous = persisted.current;
    persisted.current = drafts;
    try {
      drafts.forEach(({plan}, i) => {
        if (plan !== previous[i].plan) localStorage.setItem(storageKey(plan), JSON.stringify(plan));
      });
    } catch {
      setMessage('Use Save to project to keep this draft.');
    }
  }, [drafts]);

  const stepHistory = useCallback((type: 'undo' | 'redo') => {
    const stack = draft[type];
    const entry = stack[stack.length - 1];
    if (!entry) return;
    if (entry.slideIndex !== index) {
      setIndex(entry.slideIndex);
      setTime(previewStart(plan, entry.slideIndex));
    }
    dispatch({type, carousel});
    setMessage(type === 'undo' ? 'Edit undone.' : 'Edit redone.');
  }, [carousel, draft, index, plan]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || !(event.metaKey || event.ctrlKey)) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.matches('textarea, input:not([type=range]):not([type=number]):not([type=checkbox])'))) return;
      const key = event.key.toLowerCase();
      const action = key === 'z' ? (event.shiftKey ? 'redo' : 'undo') : event.ctrlKey && key === 'y' ? 'redo' : null;
      if (!action || !(action === 'undo' ? canUndo : canRedo)) return;
      event.preventDefault();
      stepHistory(action);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canRedo, canUndo, stepHistory]);

  const sliderHandlers = {
    onPointerDown: () => {sliderGesture.current = ++nextGesture.current;},
    onPointerUp: () => {sliderGesture.current = undefined;},
    onPointerCancel: () => {sliderGesture.current = undefined;},
    onBlur: () => {sliderGesture.current = undefined;},
    onKeyDown: () => {sliderGesture.current = undefined;},
  };

  function changeCarousel(index: number) {
    setCarousel(index);
    if (!isGrid(drafts[index].plan)) setLayer('headline');
    setIndex(0);
    setTime(previewStart(drafts[index].plan, 0));
    setMessage('');
  }

  function changeSlide(index: number) {
    setIndex(index);
    setTime(previewStart(plan, index));
    setMessage('');
  }

  function updateSlide(update: Partial<Slide>, gesture?: number) {
    dispatch({type: 'edit', carousel, slideIndex: index, update, gesture});
    setMessage('Draft saved in this browser.');
  }

  function move(x: number, y: number, item = selectedItem, gesture?: number) {
    if (layer === 'sprite') {
      if (sprite.src) updateSlide({spriteEdit: {
        ...sprite,
        x: clamp(Math.round(x), -1080, 1080),
        y: clamp(Math.round(y), -1350, 1350),
      }}, gesture);
      return;
    }
    if (layer === 'headline') {
      updateSlide({headlineOffset: {...slide.headlineOffset, x: clamp(Math.round(x), -520, 520), y: clamp(Math.round(y), -500, 500)}}, gesture);
      return;
    }
    if (itemMode) {
      if (item) updateSlide({elementOffsets: {
        ...slide.elementOffsets,
        [item]: {...slide.elementOffsets?.[item], x: clamp(Math.round(x), -1080, 1080), y: clamp(Math.round(y), -1350, 1350)},
      }}, gesture);
      return;
    }
    updateSlide({graphicPlacement: {
      ...placement,
      x: clamp(Math.round(x), -460, 460),
      y: clamp(Math.round(y), -520, 520),
    }}, gesture);
  }

  function arrange(direction: LayerDirection) {
    // Remove out-of-date item and text-part entries. Keep the sprite's place when it is hidden.
    const known = new Set([...visibleOrder, 'sprite']);
    updateSlide({layerOrder: reorderLayer(order.filter((key) => known.has(key)), activeKey, direction)});
  }

  function chooseLayerAtPoint(x: number, y: number) {
    for (const node of document.elementsFromPoint(x, y)) {
      const target = node.closest('[data-carousel-item], [data-carousel-headline-part], [data-carousel-editable-headline], [data-carousel-sprite], [data-carousel-graphics]');
      if (!target || !preview.current?.contains(target)) continue;
      if (target.hasAttribute('data-carousel-item')) setArrangedKey(`item:${target.getAttribute('data-carousel-item')}`);
      else if (target.hasAttribute('data-carousel-headline-part')) setArrangedKey(`headline-part:${target.getAttribute('data-carousel-headline-part')}`);
      else if (target.hasAttribute('data-carousel-editable-headline')) setArrangedKey('headline');
      else if (target.hasAttribute('data-carousel-sprite')) setArrangedKey('sprite');
      else setArrangedKey('content');
      return;
    }
  }

  function rotate(rotation: number) {
    const gesture = sliderGesture.current;
    if (rotation === (activePosition.rotation ?? 0)) return;
    if (layer === 'sprite' && sprite.src) {
      updateSlide({spriteEdit: {...sprite, rotation}}, gesture);
    } else if (layer === 'headline') {
      updateSlide({headlineOffset: {x: headline.x, y: headline.y, rotation}}, gesture);
    } else if (itemMode && selectedItem) {
      updateSlide({elementOffsets: {...slide.elementOffsets, [selectedItem]: {x: itemPosition.x, y: itemPosition.y, rotation}}}, gesture);
    } else if (layer === 'content' && !itemMode) {
      updateSlide({graphicPlacement: {...placement, rotation}}, gesture);
    }
  }

  const rotationControl = (
    <label className="slider">Rotation <output>{activePosition.rotation ?? 0}°</output>
      <input {...sliderHandlers} type="range" min={-180} max={180} step={1} value={activePosition.rotation ?? 0}
        aria-valuetext={`${activePosition.rotation ?? 0} degrees`} onChange={(event) => rotate(Number(event.currentTarget.value))} />
    </label>
  );

  function selectIcon(src: string) {
    updateSlide({icon: src ? {src, align: slide.icon?.align ?? 'center', size: slide.icon?.size ?? 112} : undefined});
  }

  function download() {
    const slug = `${plan.slug}-my-edit`;
    const file = new Blob([JSON.stringify({...plan, slug}, null, 2) + '\n'], {type: 'application/json'});
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Downloaded the editable carousel file.');
  }

  async function saveToProject() {
    setSaving(true);
    setMessage('Saving to the project…');
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          slug: plan.slug,
          contentGrid: isGrid(plan),
          slides: plan.slides.map(({headline, headlineWidth, layerOrder, graphicPlacement, headlineOffset, elementOffsets, icon, spriteEdit}) => ({
            headline,
            headlineWidth: headlineWidth ?? null,
            layerOrder: layerOrder ?? null,
            graphicPlacement: graphicPlacement ?? null,
            headlineOffset: headlineOffset ?? null,
            elementOffsets: elementOffsets ?? null,
            icon: icon ?? null,
            spriteEdit: spriteEdit ?? null,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(`Saved ${carousels[carousel].name} to the project: ${result.file}.`);
    } catch {
      setMessage('Could not save to the project. Reopen the editor and try again, or use Download edits.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <header>
        <div><p className="brand">FACELESS48</p><h1>Carousel Studio</h1></div>
        <div className="actions">
          <div className="history" role="group" aria-label="Edit history">
            <button type="button" disabled={!canUndo} title="Undo (⌘Z)" aria-keyshortcuts="Meta+Z Control+Z" onClick={() => stepHistory('undo')}>Undo</button>
            <button type="button" disabled={!canRedo} title="Redo (⌘⇧Z)" aria-keyshortcuts="Meta+Shift+Z Control+Shift+Z Control+Y" onClick={() => stepHistory('redo')}>Redo</button>
          </div>
          <button onClick={download}>Download edits</button>
          <button className="primary" onClick={saveToProject} disabled={saving}>{saving ? 'Saving…' : 'Save to project'}</button>
        </div>
      </header>
      <div className="toolbar">
        <label>Carousel <select value={carousel} onChange={(event) => changeCarousel(Number(event.currentTarget.value))}>
          {carousels.map(({name}, i) => <option key={name} value={i}>{name}</option>)}
        </select></label>
        <label>Slide <select value={index} onChange={(event) => changeSlide(Number(event.currentTarget.value))}>
          {plan.slides.map((item, i) => <option key={i} value={i}>{i + 1} · {item.headline.replace(/[*\n]/g, ' ').replace(/ +/g, ' ')}</option>)}
        </select></label>
      </div>
      <div className="workspace">
        <section aria-label="Slide preview">
          <div className="preview" ref={preview}>
            {(layer === 'layers' || (itemMode && selectedItem)) && <style>{`.preview ${layerSelector(layer === 'layers' ? activeKey : `item:${selectedItem}`)} {outline: 3px solid #B8B2FF; outline-offset: 4px;}`}</style>}
            <Player
              ref={player}
              component={VideoCarousel}
              inputProps={{plan: previewPlan}}
              durationInFrames={plan.slides.reduce((total, item) => total + Math.round(item.seconds * 30), 0)}
              fps={30}
              compositionWidth={1080}
              compositionHeight={1350}
              style={{width: '100%', aspectRatio: '4 / 5'}}
              controls={false}
              spaceKeyToPlayOrPause={false}
            />
            <div className={layer === 'layers' ? 'drag select-layer' : 'drag'} tabIndex={layer === 'layers' ? -1 : 0} aria-label={layer === 'layers' ? 'Select a layer in the preview' : `Move the ${layer} by dragging or using the arrow keys`}
              onKeyDown={(event) => {
                if (layer === 'layers' || !grid) return;
                const directions: Record<string, [number, number]> = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
                const direction = directions[event.key];
                if (!direction) return;
                event.preventDefault();
                const step = event.shiftKey ? 10 : 1;
                move(activePosition.x + step * direction[0], activePosition.y + step * direction[1]);
              }}
              onPointerDown={(event) => {
                if (event.button !== 0 || !grid || (layer === 'sprite' && !sprite.src)) return;
                if (layer === 'layers') {
                  chooseLayerAtPoint(event.clientX, event.clientY);
                  return;
                }
                const picked = itemMode ? document.elementsFromPoint(event.clientX, event.clientY)
                  .map((node) => node.closest('[data-carousel-item]'))
                  .find((node) => node && preview.current?.contains(node)) : null;
                const item = picked?.getAttribute('data-carousel-item') || selectedItem;
                if (itemMode && !item) return;
                if (itemMode && item !== selectedItem) setSelectedItem(item);
                const start = itemMode ? slide.elementOffsets?.[item] ?? defaultPlacement : activePosition;
                event.currentTarget.focus();
                event.currentTarget.setPointerCapture(event.pointerId);
                const selectedNode = itemMode && (picked ?? [...preview.current?.querySelectorAll(layerSelector(`item:${item}`)) ?? []]
                  .find((node) => getComputedStyle(node).visibility === 'visible'));
                const screenScale = event.currentTarget.getBoundingClientRect().width / 1080;
                const screenToLocal = dragMatrix(selectedNode || null, preview.current, screenScale);
                drag.current = {
                  clientX: event.clientX, clientY: event.clientY, screenToLocal,
                  x: start.x, y: start.y, item, gesture: ++nextGesture.current,
                };
              }}
              onPointerMove={(event) => {
                const active = drag.current;
                if (!active) return;
                const dx = event.clientX - active.clientX;
                const dy = event.clientY - active.clientY;
                const {a, b, c, d} = active.screenToLocal;
                move(active.x + a * dx + c * dy, active.y + b * dx + d * dy, active.item, active.gesture);
              }}
              onLostPointerCapture={() => {drag.current = undefined;}}
            />
          </div>
          <label className="scrub">Preview moment
            <input type="range" min="0" max={slide.seconds - 1 / 30} step={1 / 30} value={time} onChange={(event) => setTime(Number(event.currentTarget.value))} />
            <output>{time.toFixed(1)}s</output>
          </label>
        </section>
        <section className="panel" aria-label="Slide adjustments">
          {!grid && <div className="look-note">
            <p>This carousel uses its template's own layout, so here you can change the headlines. To move, rotate, layer, and add icons and characters, switch it to the Content Grid look.</p>
            <button onClick={() => {dispatch({type: 'look', carousel, contentGrid: true}); setLayer('content'); setMessage('Switched to the Content Grid look. Undo history starts fresh.');}}>Switch to Content Grid</button>
          </div>}
          {grid && !startedGrid && <button className="reset" onClick={() => {dispatch({type: 'look', carousel, contentGrid: false}); setLayer('headline'); setMessage('Back to the template look.');}}>Back to the template look</button>}
          <div className="layer-picker" role="group" aria-label="Layer to edit">
            <button disabled={!grid} aria-pressed={layer === 'content'} onClick={() => setLayer('content')}>Content</button>
            <button aria-pressed={layer === 'headline'} onClick={() => setLayer('headline')}>Headline</button>
            <button disabled={!grid} aria-pressed={layer === 'sprite'} onClick={() => setLayer('sprite')}>Character</button>
            <button disabled={!grid} aria-pressed={layer === 'layers'} onClick={() => {
              if (layer !== 'layers') setArrangedKey(itemMode && selectedItem ? `item:${selectedItem}` : layer);
              setLayer('layers');
            }}>Layers</button>
          </div>
          {layer === 'layers' ? <>
            <h2>Layers</h2>
            <label>Layer to arrange <select value={activeKey} onChange={(event) => setArrangedKey(event.currentTarget.value)}>
              {mainLayers.map(({id, label}) => <option key={id} value={id}>{label}</option>)}
              {partOptions.length > 0 && <optgroup label="Headline parts">
                {partOptions.map(({id, label}) => <option key={id} value={id}>{label}</option>)}
              </optgroup>}
              {itemLayers.length > 0 && <optgroup label="Content items">
                {itemLayers.map(({id, label}) => <option key={id} value={id}>{label}</option>)}
              </optgroup>}
            </select></label>
            <div className="layer-actions" role="group" aria-label="Change layer order">
              {layerButtons.map(([direction, label]) => (
                <button key={direction} disabled={reorderLayer(visibleOrder, activeKey, direction) === visibleOrder} onClick={() => arrange(direction)}>{label}</button>
              ))}
            </div>
            <p className="layer-stack-label">Front to back</p>
            <ol className="layer-stack" aria-label="Layers from front to back">
              {[...visibleOrder].reverse().map((key) => (
                <li key={key}>
                  <button aria-pressed={activeKey === key} onClick={() => setArrangedKey(key)}>{layerLabels.get(key)}</button>
                </li>
              ))}
            </ol>
            {slide.layerOrder && <button className="reset" onClick={() => updateSlide({layerOrder: undefined})}>Reset layer order</button>}
          </> : layer === 'content' ? <>
          <h2>Content</h2>
          <div className="layer-picker move-mode" role="group" aria-label="How to move content">
            <button aria-pressed={!individual} onClick={() => setIndividual(false)}>Whole group</button>
            <button aria-pressed={individual} onClick={() => setIndividual(true)}>Individual item</button>
          </div>
          {individual ? <>
            <p>Drag an item in the preview, or choose it from the list to position or rotate it.</p>
            <label>Item <select value={selectedItem} onChange={(event) => setSelectedItem(event.currentTarget.value)}>
              {!items.length && <option value="">No editable items on this slide</option>}
              {items.map(({id, label}) => <option key={id} value={id}>{label}</option>)}
            </select></label>
            {selectedItem && <>
              <div className="coordinates">
                <label>Left / right <input type="number" min={-1080} max={1080} value={itemPosition.x} onChange={(event) => move(Number(event.currentTarget.value), itemPosition.y)} /></label>
                <label>Up / down <input type="number" min={-1350} max={1350} value={itemPosition.y} onChange={(event) => move(itemPosition.x, Number(event.currentTarget.value))} /></label>
              </div>
              {rotationControl}
              <button onClick={() => {
                const offsets = {...slide.elementOffsets};
                const original = carousels[carousel].plan.slides[index].elementOffsets?.[selectedItem];
                if (original) offsets[selectedItem] = original;
                else delete offsets[selectedItem];
                updateSlide({elementOffsets: Object.keys(offsets).length ? offsets : undefined});
              }}>Reset selected item</button>
            </>}
          </> : <>
            <p>Drag to move the artwork, arrows, and copy together.</p>
            <div className="coordinates">
            <label>Left / right <input type="number" min={-460} max={460} value={placement.x} onChange={(event) => move(Number(event.currentTarget.value), placement.y)} /></label>
            <label>Up / down <input type="number" min={-520} max={520} value={placement.y} onChange={(event) => move(placement.x, Number(event.currentTarget.value))} /></label>
          </div>
          {rotationControl}
          <label className="slider">Content size <output>{Math.round(placement.scale * 100)}%</output>
            <input {...sliderHandlers} type="range" min="55" max="145" step="1" value={placement.scale * 100} onChange={(event) => updateSlide({graphicPlacement: {...placement, scale: Number(event.currentTarget.value) / 100}}, sliderGesture.current)} />
          </label>
          </>}
          <h2>Icon</h2>
          <label>Icon <select value={slide.icon?.src ?? ''} onChange={(event) => selectIcon(event.currentTarget.value)}>
            <option value="">None</option>
            {icons.map(({src, name}) => <option key={src} value={src}>{name}</option>)}
            {slide.icon?.src.startsWith('carousel-icons/library/') && <option value={slide.icon.src}>Selected library icon</option>}
          </select></label>
          <button aria-expanded={browsingIcons} onClick={() => setBrowsingIcons(!browsingIcons)}>{browsingIcons ? 'Close icon library' : 'Browse icon library'}</button>
          {browsingIcons && <IconLibrary onPick={(src) => {selectIcon(src); setBrowsingIcons(false);}} />}
          {slide.icon && <>
            <label>Icon position <select value={slide.icon.align} onChange={(event) => updateSlide({icon: {...slide.icon!, align: event.currentTarget.value as 'left' | 'center' | 'right'}})}>
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select></label>
            <label className="slider">Icon size <output>{slide.icon.size}</output>
              <input {...sliderHandlers} type="range" min="60" max="155" step="1" value={slide.icon.size} onChange={(event) => updateSlide({icon: {...slide.icon!, size: Number(event.currentTarget.value)}}, sliderGesture.current)} />
            </label>
          </>}
          </> : layer === 'headline' ? <>
            <h2>Headline</h2>
            <label>Headline text
              <textarea aria-describedby="headline-help" rows={3} maxLength={140} value={slide.headline}
                onFocus={() => {headlineGesture.current = ++nextGesture.current;}}
                onBlur={() => {headlineGesture.current = undefined;}}
                onChange={(event) => updateSlide({headline: event.currentTarget.value}, headlineGesture.current)} />
            </label>
            <p id="headline-help">Text wraps automatically. Press Return for a new line. Use *asterisks* for the accent style.</p>
            {grid && <>
            <label className="slider">Wrap width <output>{slide.headlineWidth ?? defaultHeadlineWidth} px</output>
              <input {...sliderHandlers} type="range" min="340" max="970" step="1" value={slide.headlineWidth ?? defaultHeadlineWidth}
                onChange={(event) => updateSlide({headlineWidth: Number(event.currentTarget.value)}, sliderGesture.current)} />
            </label>
            <div className="coordinates">
              <label>Left / right <input type="number" min={-520} max={520} value={headline.x} onChange={(event) => move(Number(event.currentTarget.value), headline.y)} /></label>
              <label>Up / down <input type="number" min={-500} max={500} value={headline.y} onChange={(event) => move(headline.x, Number(event.currentTarget.value))} /></label>
            </div>
            {rotationControl}
            </>}
            <button className="reset" onClick={() => {
              const original = carousels[carousel].plan.slides[index];
              updateSlide({headline: original.headline, headlineWidth: original.headlineWidth, headlineOffset: original.headlineOffset});
            }}>Reset headline</button>
          </> : <>
            <h2>Character</h2>
            {!characterFiles.length && <p>Add transparent PNGs to public/characters/, or make one from a photo with npm run cutout, then reopen Carousel Studio.</p>}
            <label>Pose <select value={sprite.src ?? ''} onChange={(event) => {
              const src = event.currentTarget.value || null;
              const previous = carousels[carousel].plan.slides[index];
              const original = resolveSlideSprite(carousels[carousel].plan, previous);
              const scale = src && !sprite.src && !original.src && !slide.spriteEdit ? 0.45 : sprite.scale;
              updateSlide({spriteEdit: {...sprite, src, scale}});
              if (src && index !== 0 && time < 0.85) setTime(0.85);
            }}>
              <option value="">None</option>
              {characterGroups.filter(([, files]) => files.length).map(([label, files]) => (
                <optgroup key={label} label={label}>
                  {files.map((file) => <option key={file} value={file}>{characterName(file)}</option>)}
                </optgroup>
              ))}
              {sprite.src && !characterFiles.includes(sprite.src) && <option value={sprite.src}>{characterName(sprite.src)}</option>}
            </select></label>
            {sprite.src && <>
              <p>Drag the preview to move just the character. Use the arrow keys to fine-tune its position.</p>
              <div className="coordinates">
                <label>Left / right <input type="number" min={-1080} max={1080} value={sprite.x} onChange={(event) => move(Number(event.currentTarget.value), sprite.y)} /></label>
                <label>Up / down <input type="number" min={-1350} max={1350} value={sprite.y} onChange={(event) => move(sprite.x, Number(event.currentTarget.value))} /></label>
              </div>
              <label className="slider">Character size <output>{Math.round(sprite.scale * 100)}%</output>
                <input {...sliderHandlers} type="range" min="20" max="150" step="1" value={sprite.scale * 100} onChange={(event) => updateSlide({spriteEdit: {...sprite, scale: Number(event.currentTarget.value) / 100}}, sliderGesture.current)} />
              </label>
              {rotationControl}
              <label className="checkbox"><input type="checkbox" checked={sprite.flip} onChange={(event) => updateSlide({spriteEdit: {...sprite, flip: event.currentTarget.checked}})} /> Flip horizontally</label>
            </>}
            <button className="reset" onClick={() => updateSlide({spriteEdit: undefined})}>Reset character</button>
          </>}
          {layer === 'content' && !individual && <button className="reset" onClick={() => {
            const original = carousels[carousel].plan.slides[index];
            updateSlide({icon: original.icon, graphicPlacement: original.graphicPlacement});
          }}>Reset content and icon</button>}
          <p className="status" role="status">{message}</p>
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
