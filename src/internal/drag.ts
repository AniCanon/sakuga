import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export interface DragState {
  x: number;
  y: number;
  id: number;
  el: HTMLElement;
  target: EventTarget;
  moved: boolean;
  slop: number;
}

export interface DragOptions {
  can?: (e: ReactPointerEvent) => boolean;
  start?: (s: DragState, e: PointerEvent) => void;
  move?: (e: PointerEvent, s: DragState) => void;
  end?: (e: PointerEvent, s: DragState) => void;
  cancel?: (e: PointerEvent, s: DragState) => void;
}

/* A drag, told from a press by distance: until the pointer has travelled motion-nudge from where it went down it is a press, and
   the control's click is as it was; past that the handlers follow it, and the click that ends it is swallowed. What the drag
   moves follows the pointer with no easing; on release the control settles as its own motion says. */
export function useDrag(o: DragOptions) {
  const at = useRef<DragState | null>(null), opts = useRef(o);
  const [dragging, setDragging] = useState(false);
  opts.current = o;

  function slop(el: HTMLElement) { return parseFloat(getComputedStyle(el).getPropertyValue('--motion-nudge')) || 4; }
  function stop(s: DragState | null, e: PointerEvent, done?: (e: PointerEvent, s: DragState) => void) {
    at.current = null;
    if (!s || !s.moved) return;
    setDragging(false);
    document.documentElement.classList.remove('sk-is-dragging');
    const swallow = (c: Event) => { c.stopPropagation(); c.preventDefault(); };
    s.el.addEventListener('click', swallow, true);
    setTimeout(() => s.el.removeEventListener('click', swallow, true), 0);
    if (done) done(e, s);
  }
  /* Once pressed, the pointer is followed on the window until it is let go, so a small grip (a handle) keeps its drag */
  function move(e: PointerEvent) {
    const s = at.current;
    if (!s || s.id !== e.pointerId) return;
    if (!s.moved) {
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) < s.slop) return;
      s.moved = true;
      setDragging(true);
      document.documentElement.classList.add('sk-is-dragging');
      window.getSelection?.()?.removeAllRanges();
      opts.current.start?.(s, e);
    }
    opts.current.move?.(e, s);
  }
  function up(e: PointerEvent) { const s = at.current; if (!s || s.id !== e.pointerId) return; off(); stop(s, e, opts.current.end); }
  function cancel(e: PointerEvent) { const s = at.current; if (!s || s.id !== e.pointerId) return; off(); stop(s, e, opts.current.cancel || opts.current.end); }
  function off() {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
  }
  useEffect(() => off, []);

  return {
    dragging,
    handlers: {
      onPointerDown(e: ReactPointerEvent<HTMLElement>) {
        if (e.button || (opts.current.can && !opts.current.can(e))) return;
        at.current = { x: e.clientX, y: e.clientY, id: e.pointerId, el: e.currentTarget, target: e.target, moved: false, slop: slop(e.currentTarget) };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', cancel);
      },
    },
  };
}
