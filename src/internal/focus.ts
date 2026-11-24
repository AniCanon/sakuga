import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

export const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[contenteditable="true"],[contenteditable="plaintext-only"],[tabindex]:not([tabindex="-1"])';

export function focusables(box: HTMLElement | null): HTMLElement[] {
  if (!box) return [];
  return Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getAttribute('tabindex') !== '-1' && el.getClientRects().length > 0 && !el.closest('[aria-hidden="true"]'),
  );
}

export interface FocusScopeOptions {
  open: boolean;
  onClose?: () => void;
  trap?: boolean;
  outside?: boolean;
  first?: (box: HTMLElement) => HTMLElement | null | undefined;
}

/* A surface that holds focus while open. The surface itself is always tabindex=-1, so a press on its words keeps focus in it. On
   open, focus moves to opts.first(box), else its first control, else the surface; Escape runs onClose; with trap, Tab and
   Shift+Tab wrap inside; with outside, a press outside or focus leaving it runs onClose, and focus stays where it went. On close, focus goes
   back to what had it, unless the person has moved it somewhere else. Spread the returned onKeyDown on the surface: a nested
   surface handles Escape first and stops it there. */
export function useFocusScope(ref: RefObject<HTMLElement>, opts: FocusScopeOptions): (e: KeyboardEvent) => void {
  const o = useRef(opts), outside = useRef(false);
  o.current = opts;
  const open = !!opts.open;
  useEffect(() => {
    if (!open) return undefined;
    const box = ref.current, back = document.activeElement as HTMLElement | null;
    /* The surface takes focus itself (never from Tab), so a press on its words keeps focus inside and Escape still closes it */
    if (box && !box.hasAttribute('tabindex')) box.setAttribute('tabindex', '-1');
    /* Only a page the person is in is pulled to it: a board on a design canvas or a background tab keeps its focus where it is */
    if (box && !box.contains(document.activeElement) && document.hasFocus()) {
      const to = o.current.first?.(box) || focusables(box)[0] || box;
      to.focus({ preventScroll: true });
    }
    /* A press on the control that opened it is left to that control, which toggles it */
    function away(e: PointerEvent) {
      const t = e.target as Node;
      if (!o.current.outside || !o.current.onClose || !ref.current || ref.current.contains(t) || (back && back !== document.body && back.contains(t))) return;
      outside.current = true;
      o.current.onClose();
    }
    /* Tab out of a surface that closes on a press outside closes it too, and focus stays where Tab put it */
    function leave(e: FocusEvent) {
      const to = e.relatedTarget as Node | null;
      if (!o.current.outside || !o.current.onClose || !to || !ref.current || ref.current.contains(to) || (back && back !== document.body && back.contains(to))) return;
      outside.current = true;
      o.current.onClose();
    }
    document.addEventListener('pointerdown', away);
    box?.addEventListener('focusout', leave);
    return () => {
      document.removeEventListener('pointerdown', away);
      box?.removeEventListener('focusout', leave);
      /* Closed by a press or a Tab elsewhere: focus stays where that put it */
      if (outside.current) { outside.current = false; return; }
      const b = ref.current, at = document.activeElement;
      if (back && back.focus && document.contains(back) && (!at || at === document.body || (b && b.contains(at)))) back.focus();
    };
  }, [open]);
  return (e) => {
    const box = ref.current;
    if (!box) return;
    if (e.key === 'Escape' && o.current.onClose) { e.stopPropagation(); e.preventDefault(); o.current.onClose(); return; }
    if (e.key !== 'Tab' || !o.current.trap) return;
    const list = focusables(box), first = list[0], last = list[list.length - 1];
    if (!list.length) { e.preventDefault(); return; }
    if (e.shiftKey && (document.activeElement === first || document.activeElement === box)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
}
