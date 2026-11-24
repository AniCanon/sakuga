import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { cx } from '../../internal/cx';
import { announce } from '../../internal/live';
import { useUid } from '../../internal/uid';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { IconButton } from '../IconButton/IconButton';
import { SliderTrack } from '../SliderRow/SliderRow';
import { cropClamp, type CropValue, type CropView } from './crop';
import '../../base.css';
import '../SliderRow/SliderRow.css';
import '../Text/Text.css';
import './Cropper.css';

/** A place to jump to: a press inside `area`, 1 to 9, or Home for the first lands on `crop`'s centre at the size the circle has now. */
export interface CropRegion {
  /** The region's name, said when the crop lands on it ("Face 3 of 6"). */
  label: string;
  /** Where the crop lands when the region is chosen. */
  crop: CropValue;
  /** The part of the picture a press chooses it from. */
  area?: CropView;
}

export interface CropperProps {
  /** The picture, shown whole. */
  image: string;
  /** Names the picture. */
  alt?: string;
  /** The picture's width over its height. */
  aspect?: number;
  /** The centre as fractions of the picture's width and height, and the side of the square it cuts as a fraction of its height: what the server cuts. */
  value?: CropValue;
  /** Without it the crop is shown, not moved. */
  onChange?: (value: CropValue) => void;
  /** The closest and the widest size. Equal, the size is fixed: there is no handle, zoom row, wheel, pinch or + and −. */
  min?: number;
  /** The closest and the widest `size`. Set them from what is being cropped (one face, not the sheet), so zoom can't close in past a face. Equal, the size is fixed: there is no handle, zoom row, wheel, pinch or + and −, only moving. */
  max?: number;
  /** Places to jump to: a press inside a region's `area`, 1 to 9, or Home for the first. Each jump lands on the region's centre at the size the circle has now, and is said by its label. */
  regions?: CropRegion[];
  /** A region shown alone (a phone shows one face of a sheet); the circle stays inside it. */
  view?: CropView;
  /** Circle by default: an avatar shows round. */
  shape?: 'circle' | 'square';
  /** The crop's name. */
  label?: string;
  /** The line under the crop. */
  hint?: string;
  /** The zoom slider's name. */
  zoomLabel?: string;
  /** What is said when a move ends; by default the region and the zoom. */
  describe?: (value: CropValue, region: CropRegion | null) => string;
  /** Extra class on the root element. */
  className?: string;
}

const pct = (n: number) => (n * 100).toFixed(3) + '%';

/* A crop of a picture: a circle (or a square) moved over the whole picture, never the picture under it, so every part of it stays
   in sight while choosing. Press a region and it lands on that region's centre, or press anywhere else to move it there; then drag.
   The handle, the wheel, a pinch, the slider or + and − size it, about its centre. Outside the circle the picture dims, and only
   the picture. */
/**
 * A crop of a picture: a circle (or a square) you move over the whole picture. The picture never moves, so every part of it
 * stays in sight while you choose, which matters when it holds several faces. Outside the circle the picture dims, and only the
 * picture.
 *
 * Not for showing a picture already cut (`Thumb` with `cropStyle`); choosing among whole pictures (`Thumb` toggles); a file
 * being added (`DropZone`).
 *
 * Accessibility: An application named by `label`, described by `hint`, and one Tab stop. The arrows move the circle a tenth of
 * its width, and with Shift a whole width. + and − zoom (not at a fixed size), 1 to 9 jump to a region's centre, and Home goes
 * to the first. When a move, a zoom or a jump ends, the page's live region says where it is ("Face 3 of 6, zoom 1.3 times", or
 * "Face 3 of 6" at a fixed size); a drag is never spoken while it runs. The slider, when there is one, is a named slider, and −
 * and + are buttons. In forced colours the circle and its handle keep a Highlight ring.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Cropper({ image, alt, aspect = 16 / 9, value, onChange, min = 0.1, max = 1, regions = [], view, shape, label, hint, zoomLabel, describe, className }: CropperProps) {
  const tx = useWords(ownWords);
  const vw = view ? view.w : 1, vh = view ? view.h : 1, vx = view ? view.x : 0, vy = view ? view.y : 0;
  const hintId = useUid('sk-crop-hint'), stage = useRef<HTMLDivElement>(null);
  const v = cropClamp(value || regions[0]?.crop || { x: 0.5, y: 0.5, size: max }, aspect, view, min, max);
  const live = useRef(v);
  live.current = v;
  const set = (n: CropValue) => { if (onChange) onChange(cropClamp(n, aspect, view, min, max)); };
  /* min equal to max is a fixed size: only moving remains */
  const fixed = !(max > min);
  const zoom = fixed ? 0 : Math.log(max / v.size) / Math.log(max / min), times = Math.round((max / v.size) * 10) / 10;
  const nearest = (n: CropValue) =>
    regions.reduce((best, r, i) => { const d = Math.hypot((r.crop.x - n.x) * aspect, r.crop.y - n.y); return d < best.d ? { d, i } : best; }, { d: Infinity, i: -1 }).i;
  const say = () => {
    const n = live.current, r = regions.length ? regions[nearest(n)] : null, t = Math.round((max / n.size) * 10) / 10;
    announce(describe ? describe(n, r) : fixed ? (r ? r.label : '') : r ? tx('cropRegionZoom', { region: r.label, times: t }) : tx('cropZoom', { times: t }));
  };
  const drag = useRef<{ pinch?: number; from?: CropValue; resize?: boolean; dx?: number; dy?: number } | null>(null);
  const pts = useRef<Record<number, { x: number; y: number }>>({});
  const at = (e: { clientX: number; clientY: number }) => {
    const b = stage.current!.getBoundingClientRect();
    return { x: vx + ((e.clientX - b.left) / b.width) * vw, y: vy + ((e.clientY - b.top) / b.height) * vh };
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (!onChange || (e.button && e.button !== 0)) return;
    e.preventDefault();
    stage.current!.setPointerCapture(e.pointerId);
    stage.current!.focus({ preventScroll: true });
    const p = at(e);
    pts.current[e.pointerId] = p;
    const list = Object.values(pts.current), c = live.current, handle = (e.target as Element).closest?.('.sk-crop__handle');
    if (list.length === 2 && fixed) { delete pts.current[e.pointerId]; return; }
    if (list.length === 2) drag.current = { pinch: Math.hypot((list[0].x - list[1].x) * aspect, list[0].y - list[1].y), from: c };
    else if (handle) drag.current = { resize: true };
    else {
      const inside = Math.hypot((p.x - c.x) * aspect, p.y - c.y) <= c.size / 2;
      const hit = !inside && regions.find((r) => r.area && p.x >= r.area.x && p.x <= r.area.x + r.area.w && p.y >= r.area.y && p.y <= r.area.y + r.area.h);
      const to = hit ? { x: hit.crop.x, y: hit.crop.y, size: c.size } : { x: p.x, y: p.y, size: c.size };
      drag.current = { dx: inside ? c.x - p.x : to.x - p.x, dy: inside ? c.y - p.y : to.y - p.y };
      if (!inside) { set(to); live.current = cropClamp(to, aspect, view, min, max); }
    }
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !pts.current[e.pointerId]) return;
    const p = at(e), c = live.current, d = drag.current;
    pts.current[e.pointerId] = p;
    const list = Object.values(pts.current);
    if (d.pinch && list.length === 2) set({ x: d.from!.x, y: d.from!.y, size: (d.from!.size * d.pinch) / Math.max(1e-6, Math.hypot((list[0].x - list[1].x) * aspect, list[0].y - list[1].y)) });
    else if (d.resize) set({ x: c.x, y: c.y, size: 2 * Math.hypot((p.x - c.x) * aspect, p.y - c.y) });
    else if (!d.pinch) set({ x: p.x + d.dx!, y: p.y + d.dy!, size: c.size });
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    delete pts.current[e.pointerId];
    if (!Object.keys(pts.current).length && drag.current) { drag.current = null; say(); }
    else if (drag.current?.pinch) drag.current = null;
  };
  const by = (f: number) => set({ x: live.current.x, y: live.current.y, size: live.current.size / f });
  /* The wheel zooms about the centre; a trackpad pinch arrives as a wheel with ctrlKey. Passive listeners can't prevent the page's own zoom */
  useEffect(() => {
    const el = stage.current;
    if (!el || !onChange || fixed) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const wheel = (e: WheelEvent) => { e.preventDefault(); by(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002))); clearTimeout(t); t = setTimeout(say, 400); };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => { el.removeEventListener('wheel', wheel); clearTimeout(t); };
  });
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const c = live.current, step = (e.shiftKey ? 1 : 0.1) * c.size;
    let n: CropValue | null = null;
    if (e.key === 'ArrowLeft') n = { x: c.x - step / aspect, y: c.y, size: c.size };
    else if (e.key === 'ArrowRight') n = { x: c.x + step / aspect, y: c.y, size: c.size };
    else if (e.key === 'ArrowUp') n = { x: c.x, y: c.y - step, size: c.size };
    else if (e.key === 'ArrowDown') n = { x: c.x, y: c.y + step, size: c.size };
    else if (fixed && /^[-+=_−]$/.test(e.key)) n = null;
    else if (e.key === '+' || e.key === '=') n = { x: c.x, y: c.y, size: c.size / 1.1 };
    else if (e.key === '-' || e.key === '−' || e.key === '_') n = { x: c.x, y: c.y, size: c.size * 1.1 };
    else if (e.key === 'Home' && regions[0]) n = { x: regions[0].crop.x, y: regions[0].crop.y, size: c.size };
    else if (/^[1-9]$/.test(e.key) && regions[+e.key - 1]) n = { x: regions[+e.key - 1].crop.x, y: regions[+e.key - 1].crop.y, size: c.size };
    if (!n) return;
    e.preventDefault();
    set(n);
    live.current = cropClamp(n, aspect, view, min, max);
    say();
  };
  return (
    <div className={cx('sk-crop', className)}>
      <div
        ref={stage} className={cx('sk-crop__stage', !onChange && 'is-still')} style={{ aspectRatio: ((vw * aspect) / vh).toFixed(4) }}
        role="application" aria-roledescription={tx('cropRole')} aria-label={label || tx('crop')} aria-describedby={hintId} tabIndex={onChange ? 0 : -1}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key} onDragStart={(e) => e.preventDefault()}
      >
        <img src={image} alt={alt || ''} draggable={false} className="sk-crop__picture" style={{ width: pct(1 / vw), height: pct(1 / vh), left: pct(-vx / vw), top: pct(-vy / vh) }} />
        <span className={cx('sk-crop__window', shape === 'square' && 'is-square')} aria-hidden="true" style={{ left: pct((v.x - vx) / vw), top: pct((v.y - vy) / vh), width: pct(v.size / (vw * aspect)) }}>
          {onChange && !fixed && <span className="sk-crop__handle" />}
        </span>
      </div>
      {onChange && !fixed && (
        <div className="sk-crop__zoom">
          <IconButton icon="minus" variant="plain" label={tx('zoomOut')} onClick={() => by(1 / 1.15)} />
          <SliderTrack label={zoomLabel || tx('zoom')} value={Math.round(zoom * 100)} readout={times + '×'} onChange={(n) => set({ x: v.x, y: v.y, size: max / Math.exp((n / 100) * Math.log(max / min)) })} />
          <IconButton icon="plus" variant="plain" label={tx('zoomIn')} onClick={() => by(1.15)} />
        </div>
      )}
      <p id={hintId} className="sk-crop__hint">{hint || (fixed ? tx('cropHintFixed') : tx('cropHint'))}</p>
    </div>
  );
}
