import { memo, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactElement } from 'react';
import { cx } from '../../internal/cx';
import { usePointerSeek } from '../../internal/pointerSeek';
import { sliderProps } from '../../internal/slider';
import { announce } from '../../internal/live';
import { tc } from '../../internal/time';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { IconButton } from '../IconButton/IconButton';

interface Props {
  duration: number;
  step: number;
  offset: number;
  rate?: string;
  markers?: { at: number; label: string; selected?: boolean }[];
  /** With onSelectMarker or onMoveMarker: each marker's flag is a button the app selects or moves (`help` names the move's keys). */
  flags?: { onSelect?: (marker: number) => void; onMove?: (marker: number, seconds: number) => void; onMoveEnd?: (marker: number, seconds: number) => void; trim: number; help: string };
  /** The lane's width in px, so markers closer than a readable flag share one; 0 before it is measured. */
  laneW: number;
  /** With onSeek: a press on the scale seeks, a drag scrubs, and the playhead's head at the foot of the ruler is a slider. */
  /** With onView: the zoom control in the ruler's head. by(1.5) zooms out, by(1 / 1.5) in. */
  zoom?: { whole: boolean; by: (factor: number) => void; fit: () => void };
  seek?: { playhead: number; label: string; trim: number; text: (v: number) => string; onSeek: (seconds: number) => void };
}

/* Playback never changes the ruler unless it seeks. Measure flags and end times only for content, font or container size changes. */
/* Markers closer than a readable flag at this zoom (or at one time) share one flag: the first named, the rest counted */
const FLAG_MIN = 40;

export const TimelineRuler = memo(function TimelineRuler({ duration, step, offset, rate, markers, laneW, zoom, seek, flags }: Props) {
  const tx = useWords(ownWords);
  const scale = useRef<HTMLDivElement>(null);
  /* A flag pressed, and where it was grabbed; it moves once the pointer travels past a few pixels, so a press alone selects */
  const press = useRef<{ i: number; x: number; grab: number; r?: DOMRect; moved: boolean; last?: number } | null>(null);
  const [moving, setMoving] = useState<number | null>(null);
  /* A move made by keys ends when the key is let go or focus leaves: then onMoveEnd runs once */
  const nudge = useRef<{ i: number; v: number } | null>(null);
  const settle = () => { const n = nudge.current; nudge.current = null; if (n) flags?.onMoveEnd?.(n.i, n.v); };
  function flagProps(i: number, m: { at: number; label: string; selected?: boolean }) {
    const move = flags?.onMove, step = flags?.trim || 1 / 24;
    return {
      'aria-label': tx('markerAt', { name: m.label, time: tc(offset + m.at) }) + (m.selected ? ', ' + tx('selected') : ''),
      'aria-describedby': move ? flags!.help : undefined,
      'aria-keyshortcuts': move ? 'Alt+ArrowLeft Alt+ArrowRight' : undefined,
      onClick: () => {
        if (press.current?.moved) { press.current.moved = false; return; }
        flags?.onSelect?.(i);
      },
      onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!move || e.button !== 0 || !scale.current) return;
        const r = scale.current.getBoundingClientRect();
        press.current = { i, x: e.clientX, grab: (e.clientX - r.left) / r.width * duration - m.at, r, moved: false };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      },
      onPointerMove: (e: PointerEvent<HTMLButtonElement>) => {
        const p = press.current;
        if (!p || p.i !== i || !p.r || !move) return;
        if (!p.moved && Math.abs(e.clientX - p.x) < 4) return;
        if (!p.moved) { p.moved = true; setMoving(i); }
        const t = Math.min(duration, Math.max(0, Math.round(((e.clientX - p.r.left) / p.r.width * duration - p.grab) / step) * step));
        if (t !== p.last) { p.last = t; move(i, t); }
      },
      onPointerUp: () => {
        const p = press.current;
        if (!p || p.i !== i || !p.r) return;
        p.r = undefined; setMoving(null);
        if (p.moved && p.last !== undefined) { announce(tx('itemMovedTo', { name: m.label, time: tc(offset + p.last) })); flags?.onMoveEnd?.(i, p.last); }
      },
      onPointerCancel: () => { const p = press.current; if (p) { p.r = undefined; p.moved = false; } setMoving(null); },
      onKeyDown: move ? (e: KeyboardEvent<HTMLButtonElement>) => {
        if (!e.altKey) return;
        const by = e.shiftKey ? 1 : step;
        let to = e.key === 'ArrowLeft' ? m.at - by : e.key === 'ArrowRight' ? m.at + by : e.key === 'Home' ? 0 : e.key === 'End' ? duration : null;
        if (to === null) return;
        e.preventDefault(); e.stopPropagation();
        to = Math.min(duration, Math.max(0, Math.round(to / step) * step));
        if (Math.abs(to - m.at) < 1e-6) return;
        move(i, to); nudge.current = { i, v: to };
        announce(tx('itemMovedTo', { name: m.label, time: tc(offset + to) }));
      } : undefined,
      onKeyUp: settle,
      onBlur: settle,
    };
  }
  const trim = seek?.trim || 1;
  /* onSeek: a press on the ruler moves the playhead there and a drag scrubs, a frame at a time */
  const toFrame = (v: number) => Math.min(duration, Math.max(0, Math.round(v / trim) * trim));
  const scrub = usePointerSeek(scale, (f) => { if (seek) seek.onSeek(toFrame(f * duration)); });
  useLayoutEffect(() => {
    const box = scale.current;
    if (!box) return;
    let alive = true;
    /* A time whose label would run past the end stands before its line; a flag starts at its time, one that would run past the end
       ends at its time instead, and one that would run into the next flag is cut short a gap before it */
    const measure = () => {
      const width = box.clientWidth;
      const gap = parseFloat(getComputedStyle(box).getPropertyValue('--timeline-marker-gap')) || 4;
      const tks = Array.from(box.querySelectorAll<HTMLElement>('.sk-tl__tick'));
      tks.forEach((tk) => { tk.classList.remove('is-end', 'is-skipped'); tk.classList.toggle('is-end', tk.offsetLeft + tk.offsetWidth > width); });
      /* An end time that stands before its line and would run into the time before it is left unsaid */
      tks.forEach((tk, i) => {
        const prev = tks[i - 1];
        if (prev && tk.classList.contains('is-end') && tk.offsetLeft - tk.offsetWidth < prev.offsetLeft + prev.offsetWidth + gap) tk.classList.add('is-skipped');
      });
      const ms = Array.from(box.querySelectorAll<HTMLElement>('.sk-tl__marker:not(.is-line)')).sort((a, b) => +a.dataset.at! - +b.dataset.at!);
      const flags = ms.map(m => m.firstChild as HTMLElement);
      flags.forEach(flag => { flag.style.maxWidth = ''; });
      const sizes = flags.map(flag => flag.scrollWidth);
      ms.forEach((m, i) => {
        const x = +m.dataset.at! / duration * width;
        const next = ms[i + 1] ? +ms[i + 1].dataset.at! / duration * width : width;
        const end = x + sizes[i] > width && !ms[i + 1];
        m.classList.toggle('is-end', end);
        if (!end) flags[i].style.maxWidth = Math.max(0, next - x - gap) + 'px';
      });
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(box);
    document.fonts?.ready?.then(() => { if (alive) measure(); });
    document.fonts?.addEventListener('loadingdone', measure);
    return () => { alive = false; observer?.disconnect(); document.fonts?.removeEventListener('loadingdone', measure); };
  }, [duration, markers, rate, step, offset, laneW]);
  const pxs = laneW > 0 ? laneW / duration : 0, groups: { m: { at: number; label: string; selected?: boolean }; i: number }[][] = [];
  (markers || []).map((m, i) => ({ m, i })).sort((a, b) => a.m.at - b.m.at).forEach((o) => {
    const g = groups[groups.length - 1], d = g ? o.m.at - g[g.length - 1].m.at : Infinity;
    if (g && (d < 1e-6 || d * pxs < FLAG_MIN)) g.push(o); else groups.push([o]);
  });
  const marks: ReactElement[] = [];
  groups.forEach((g, gi) => {
    const first = g[0].m, left = { left: (first.at / duration * 100) + '%' };
    if (g.length === 1) {
      marks.push(
        <span key={'m' + g[0].i} className={cx('sk-tl__marker', first.selected && 'is-selected', moving === g[0].i && 'is-moving')} data-at={first.at} style={left}>
          {flags
            ? <button type="button" className="sk-tl__flag" title={first.label} {...flagProps(g[0].i, first)}>{first.label}</button>
            : <span className="sk-tl__flag" title={first.label}>{first.label}</span>}
        </span>,
      );
      return;
    }
    /* Each keeps its hairline at its own time; the shared flag opens along the rail to list them all */
    g.slice(1).forEach((o) => marks.push(<span key={'l' + o.i} className="sk-tl__marker is-line" data-at={o.m.at} style={{ left: (o.m.at / duration * 100) + '%' }} />));
    const said = g.map((o) => tx('markerAt', { name: o.m.label, time: tc(offset + o.m.at) }));
    marks.push(
      <span key={'c' + gi} className={cx('sk-tl__marker is-cluster', g.some((o) => o.m.selected) && 'is-selected')} data-at={first.at} style={left}>
        <button type="button" className="sk-tl__flag sk-tl__flag--cluster" onPointerDown={(e) => { e.stopPropagation(); }} aria-label={tx('markersHere', { count: g.length, list: tx.list(said) })}>{tx('markerAndMore', { name: first.label, count: g.length - 1 })}</button>
        {flags?.onSelect
          ? <span className="sk-tl__clist is-live">{g.map((o) => (
            <button key={o.i} type="button" className={cx('sk-tl__citem', o.m.selected && 'is-selected')} aria-label={tx('markerAt', { name: o.m.label, time: tc(offset + o.m.at) }) + (o.m.selected ? ', ' + tx('selected') : '')}
              onClick={() => { flags.onSelect!(o.i); }}><b>{tc(offset + o.m.at)}</b>{o.m.label}</button>
          ))}</span>
          : <span className="sk-tl__clist" aria-hidden="true">{g.map((o) => <span key={o.i} className="sk-tl__citem"><b>{tc(offset + o.m.at)}</b>{o.m.label}</span>)}</span>}
      </span>,
    );
  });
  const ticks: ReactElement[] = [];
  for (let t = Math.ceil(offset / step - 1e-6) * step - offset; t <= duration + 0.001; t += step) ticks.push(<span key={t} className="sk-tl__tick" style={{ left: (t / duration * 100) + '%' }}>{tc(offset + t)}</span>);
  const ph = seek ? seek.playhead : 0;
  return <div className="sk-tl__ruler">
    <div className="sk-tl__head sk-tl__head--ruler">
      {zoom && <span className="sk-tl__zoom">
        <IconButton variant="plain" icon="minus" iconSize={16} label={tx('zoomOut')} disabled={zoom.whole} onClick={() => zoom.by(1.5)} />
        <IconButton variant="plain" icon="aspect" iconSize={16} label={tx('fitCut')} disabled={zoom.whole} onClick={zoom.fit} />
        <IconButton variant="plain" icon="plus" iconSize={16} label={tx('zoomIn')} onClick={() => zoom.by(1 / 1.5)} />
      </span>}
      {rate || ''}
    </div>
    <div ref={scale} className={cx('sk-tl__scale', seek && 'is-seekable', scrub.dragging && 'is-scrubbing')} {...(seek ? scrub.handlers : null)}>
      {ticks}
      {marks}
      {seek && (
        <span className={cx('sk-tl__seek', ph >= duration && 'is-end')} style={{ left: (ph / duration * 100) + '%' }}
          {...sliderProps({ label: seek.label, value: ph, max: duration, step: trim, shiftStep: 1, page: step, text: seek.text(offset + ph), onChange: (v) => { seek.onSeek(toFrame(v)); } })} />
      )}
    </div>
  </div>;
});
