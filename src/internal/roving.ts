import { useLayoutEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

export interface RovingOptions {
  selector: string;
  axis?: 'x' | 'y' | 'both';
  active?: string;
  select?: boolean;
  move?: (items: HTMLElement[], i: number, key: string) => number | null | undefined;
}

/* One Tab stop for a set of items. The stop sits on the focused item, else the last one focused, else the chosen one (opts.active),
   else the first. Arrows move along opts.axis ('x', 'y' or both), Home and End go to either end, opts.move(items, i, key) can
   replace the step, and with select the item moved to is also clicked, so it is chosen through its own onClick. Spread the
   returned onKeyDown on the container. */
export function useRoving(ref: RefObject<HTMLElement>, opts: RovingOptions): (e: KeyboardEvent) => void {
  const o = useRef(opts), last = useRef<HTMLElement | null>(null);
  o.current = opts;
  function items(): HTMLElement[] {
    const box = ref.current;
    return box
      ? Array.from(box.querySelectorAll<HTMLElement>(o.current.selector)).filter(
          (el) => !(el as HTMLButtonElement).disabled && el.getAttribute('aria-disabled') !== 'true',
        )
      : [];
  }
  useLayoutEffect(() => {
    const list = items();
    if (!list.length) return;
    let at = list.indexOf(document.activeElement as HTMLElement);
    if (at < 0) at = list.indexOf(last.current as HTMLElement);
    if (at < 0) at = list.findIndex((el) => el.matches(o.current.active || '[aria-checked="true"],[aria-pressed="true"],[aria-selected="true"]'));
    if (at < 0) at = 0;
    list.forEach((el, i) => { el.tabIndex = i === at ? 0 : -1; });
  });
  return (e) => {
    const list = items(), i = list.indexOf(e.target as HTMLElement);
    if (i < 0) return;
    const axis = o.current.axis;
    const prev = axis === 'y' ? ['ArrowUp'] : axis === 'x' ? ['ArrowLeft'] : ['ArrowLeft', 'ArrowUp'];
    const next = axis === 'y' ? ['ArrowDown'] : axis === 'x' ? ['ArrowRight'] : ['ArrowRight', 'ArrowDown'];
    let to = o.current.move ? o.current.move(list, i, e.key) : null;
    if (to === null || to === undefined) {
      if (prev.includes(e.key)) to = (i - 1 + list.length) % list.length;
      else if (next.includes(e.key)) to = (i + 1) % list.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = list.length - 1;
      else return;
    }
    e.preventDefault();
    if (to < 0 || to === i) return;
    list.forEach((el, k) => { el.tabIndex = k === to ? 0 : -1; });
    last.current = list[to];
    list[to].focus();
    if (o.current.select) list[to].click();
  };
}
