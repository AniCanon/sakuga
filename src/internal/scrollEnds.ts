import { useLayoutEffect, useState, type RefObject } from 'react';

/* A scroller's ends that have more past them: 'is-more-above', 'is-more-below' (a hairline each, drawn by the scroller's own CSS) */
export function useScrollEnds(ref: RefObject<HTMLElement>) {
  const [ends, setEnds] = useState('');
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mark = () => {
      const more = (el.scrollTop > 1 ? 'is-more-above ' : '') + (el.scrollTop + el.clientHeight < el.scrollHeight - 1 ? 'is-more-below' : '');
      setEnds((was) => (was === more.trim() ? was : more.trim()));
    };
    mark();
    el.addEventListener('scroll', mark, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mark) : null;
    if (ro) { ro.observe(el); Array.from(el.children).forEach((c) => ro.observe(c)); } else window.addEventListener('resize', mark);
    return () => { el.removeEventListener('scroll', mark); if (ro) ro.disconnect(); else window.removeEventListener('resize', mark); };
  });
  return ends;
}
