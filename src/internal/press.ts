import type { KeyboardEvent, SyntheticEvent } from 'react';

/* Enter, and Space unless it is a link, on an element that is not a native control */
export function pressProps(fn: (e: SyntheticEvent) => void, role: 'button' | 'link' | string = 'button') {
  return {
    role,
    tabIndex: 0,
    onClick: fn,
    onKeyDown(e: KeyboardEvent) {
      if (e.target !== e.currentTarget || !(e.key === 'Enter' || (role !== 'link' && e.key === ' '))) return;
      e.preventDefault();
      fn(e);
    },
  };
}
