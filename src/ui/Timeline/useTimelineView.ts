import { useCallback, useEffect, useRef, type RefObject } from 'react';

interface ViewInput {
  /** The whole cut's length in seconds; zero or without onView the Timeline does not zoom. */
  total?: number;
  onView?: (start: number, length: number) => void;
  follow?: boolean;
  /** The window shown: its start in the cut and its length, in seconds. */
  offset: number;
  duration: number;
  /** The window's playhead, in seconds from its start. */
  playhead?: number;
  /** A frame, in seconds: the closest window is a frame about 24 px wide. */
  trim: number;
}

export interface TimelineView {
  zoomable: boolean;
  /** The window already shows the whole cut. */
  whole: boolean;
  /** Zooms by a factor of the window's length (above 1 out, below 1 in), around the playhead when it is in view. */
  zoomBy: (factor: number) => void;
  fit: () => void;
}

const scaleWidth = (root: RefObject<HTMLElement>) => root.current?.querySelector<HTMLElement>('.sk-tl__scale')?.clientWidth || 800;

/* Zoom and pan (onView with total): the window is offset + duration of a cut `total` long. Ctrl/⌘+wheel and a pinch zoom around the
   pointer, a sideways wheel or Shift+wheel pans; the closest is a frame about 24 px wide, the furthest the whole cut. Never snapped. */
export function useTimelineView(root: RefObject<HTMLElement>, v: ViewInput): TimelineView {
  const T = v.total || 0, zoomable = !!v.onView && T > 0;
  const now = useRef(v);
  now.current = v;
  const setView = useCallback((start: number, length: number, width: number) => {
    const c = now.current, total = c.total || 0;
    const least = Math.min(total, Math.max(c.trim * 4, width / 24 * c.trim));
    const len = Math.min(total, Math.max(least, length)), at = Math.min(total - len, Math.max(0, start));
    if (Math.abs(at - c.offset) > 1e-6 || Math.abs(len - c.duration) > 1e-6) c.onView?.(at, len);
  }, []);
  useEffect(() => {
    const el = root.current;
    if (!el || !zoomable) return;
    const wheel = (e: WheelEvent) => {
      const lane = el.querySelector<HTMLElement>('.sk-tl__scale');
      if (!lane) return;
      const r = lane.getBoundingClientRect(), c = now.current;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), at = c.offset + x * c.duration, len = c.duration * Math.exp(e.deltaY * 0.01);
        setView(at - x * len, len, r.width);
      } else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        setView(c.offset + (e.shiftKey ? e.deltaY : e.deltaX) / r.width * c.duration, c.duration, r.width);
      }
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [zoomable, root, setView]);
  /* follow: while it plays, the window turns the page when the playhead reaches its end */
  useEffect(() => {
    if (!zoomable || !v.follow || v.playhead === undefined) return;
    if (v.playhead > v.duration - 1e-6 || v.playhead < 0) setView(v.offset + v.playhead - v.duration * 0.1, v.duration, scaleWidth(root));
  });
  const zoomBy = useCallback((factor: number) => {
    const c = now.current, len = c.duration * factor;
    const anchor = c.playhead !== undefined && c.playhead >= 0 && c.playhead <= c.duration ? c.playhead / c.duration : 0.5;
    setView(c.offset + anchor * c.duration - anchor * len, len, scaleWidth(root));
  }, [root, setView]);
  const fit = useCallback(() => setView(0, now.current.total || 0, scaleWidth(root)), [root, setView]);
  return { zoomable, whole: v.duration >= T - 1e-6, zoomBy, fit };
}
