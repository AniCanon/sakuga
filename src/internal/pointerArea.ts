import { useRef, type PointerEvent, type RefObject } from 'react';

/* Choosing a point in an area by pointer: from press to release (pointer capture) the point follows the pointer, as fractions of
   the area's width and height, never eased. A press also focuses the area, so the keys take over where the pointer left off. */
export function usePointerArea(ref: RefObject<HTMLElement>, move: (x: number, y: number) => void) {
  const held = useRef(false);
  function at(e: PointerEvent) {
    const r = ref.current!.getBoundingClientRect();
    move(r.width ? Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) : 0, r.height ? Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) : 0);
  }
  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button) return;
      held.current = true;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* capture is a nicety; choosing works without it */ }
      e.currentTarget.focus();
      at(e);
    },
    onPointerMove(e: PointerEvent) { if (held.current) at(e); },
    onPointerUp() { held.current = false; },
    onPointerCancel() { held.current = false; },
  };
}
