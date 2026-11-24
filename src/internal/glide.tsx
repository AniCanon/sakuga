import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from 'react';

/* One indicator per group (a .sk-glide first child), placed when selection or content changes so the
   selection travels. Only its transform animates; its size is set outright. `line` keeps a 100px underline and
   scales it to the item's width instead. A resize, or the web fonts arriving, re-places it without animating. */
export function placeGlide(box: HTMLElement | null, selector: string, line: boolean, still: boolean) {
  if (!box) return;
  const g = box.querySelector<HTMLElement>(':scope > .sk-glide'), on = box.querySelector<HTMLElement>(selector);
  if (!g || !on) { box.removeAttribute('data-glide'); return; }
  const width = on.offsetWidth, height = on.offsetHeight, left = on.offsetLeft, top = on.offsetTop;
  if (!width) { box.removeAttribute('data-glide'); return; }
  if (still) g.style.transition = 'none';
  g.style.width = (line ? 100 : width) + 'px';
  g.style.height = height + 'px';
  g.style.transform = `translate(${left}px,${top}px)` + (line ? ` scaleX(${width / 100})` : '');
  if (still) { void g.offsetWidth; g.style.transition = ''; }
  if (!box.hasAttribute('data-glide')) {
    box.setAttribute('data-glide', '');
    requestAnimationFrame(() => { if (box.hasAttribute('data-glide')) box.setAttribute('data-glide', 'live'); });
  }
}

export function useGlide(ref: RefObject<HTMLElement>, selector: string, line: boolean, changes: DependencyList): void {
  useLayoutEffect(() => { placeGlide(ref.current, selector, line, false); }, [ref, selector, line, ...changes]);
  useEffect(() => {
    const box = ref.current;
    if (!box || typeof ResizeObserver === 'undefined') return undefined;
    let alive = true;
    const elements = [box, ...Array.from(box.children).filter(el => !el.classList.contains('sk-glide'))] as HTMLElement[];
    const sizes = new Map(elements.map(el => [el, [el.offsetWidth, el.offsetHeight]]));
    const ro = new ResizeObserver(() => {
      let resized = false;
      for (const el of elements) {
        const size = [el.offsetWidth, el.offsetHeight], previous = sizes.get(el)!;
        if (size[0] !== previous[0] || size[1] !== previous[1]) resized = true;
        sizes.set(el, size);
      }
      if (resized) placeGlide(box, selector, line, true);
    });
    elements.forEach(el => ro.observe(el));
    // A resolved fonts.ready promise must not cancel a selection transition.
    if (document.fonts?.status !== 'loaded') document.fonts?.ready?.then(() => { if (alive) placeGlide(box, selector, line, true); });
    return () => { alive = false; ro.disconnect(); };
  }, [ref, selector, line, ...changes]);
}

export function Glide() {
  return <span className="sk-glide" aria-hidden="true" />;
}
