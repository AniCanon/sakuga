import type { KeyboardEvent } from 'react';

export interface SliderOptions {
  label?: string;
  min?: number;
  max: number;
  value?: number;
  step: number;
  shiftStep?: number;
  page?: number;
  text?: string;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

/* A value on a track, by keyboard: arrows step (by shiftStep with Shift, when given), Page Up and Page Down by page, Home and End
   to either end. Without onChange it reads as read-only; disabled leaves the tab order. */
export function sliderProps(o: SliderOptions) {
  const min = o.min || 0, max = o.max, v = Math.min(max, Math.max(min, o.value || 0)), live = !!o.onChange && !o.disabled;
  function onKeyDown(e: KeyboardEvent) {
    const s = e.shiftKey && o.shiftStep ? o.shiftStep : o.step;
    const map: Record<string, number> = { ArrowRight: s, ArrowUp: s, ArrowLeft: -s, ArrowDown: -s };
    if (o.page) { map.PageUp = o.page; map.PageDown = -o.page; }
    const next = e.key === 'Home' ? min : e.key === 'End' ? max : map[e.key] !== undefined ? v + map[e.key] : null;
    if (next === null) return;
    e.preventDefault();
    o.onChange!(Math.min(max, Math.max(min, next)));
  }
  return {
    role: 'slider' as const,
    tabIndex: o.disabled ? -1 : 0,
    'aria-label': o.label,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': v,
    'aria-valuetext': o.text,
    'aria-disabled': o.disabled ? ('true' as const) : undefined,
    'aria-readonly': !o.onChange && !o.disabled ? ('true' as const) : undefined,
    onKeyDown: live ? onKeyDown : undefined,
  };
}
