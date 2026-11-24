import { useRef, useState, type PointerEvent, type RefObject } from 'react';

/* Seeking by pointer: the value follows the pointer from press to release (pointer capture) and is never eased. */
export function usePointerSeek(ref: RefObject<HTMLElement>, seek: (fraction: number) => void) {
  const [dragging, setDragging] = useState(false), held = useRef(false);
  function at(e: PointerEvent) {
    const r = ref.current!.getBoundingClientRect();
    return r.width ? Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) : 0;
  }
  function end() { if (held.current) { held.current = false; setDragging(false); } }
  return {
    dragging,
    handlers: {
      onPointerDown(e: PointerEvent<HTMLElement>) {
        if (e.button) return;
        held.current = true;
        setDragging(true);
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* capture is a nicety; seeking works without it */ }
        seek(at(e));
      },
      onPointerMove(e: PointerEvent) { if (held.current) seek(at(e)); },
      onPointerUp: end,
      onPointerCancel: end,
      onLostPointerCapture: end,
    },
  };
}
