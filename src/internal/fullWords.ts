/* Full words: one tip for every part that cuts its text. The unit is the part (a cast tile, an entity row, a map card…); its lines
   are the cut texts inside it, read whole. The words are already the part's own, so a screen reader hears them in full; the tip is
   for eyes (aria-hidden). It shows after a short rest on hover and at once on keyboard focus, stays while the pointer moves onto
   it, and leaves on Escape, a scroll, or the pointer and focus leaving both. */
const FULL_UNIT = '.sk-cast,.sk-erow,.sk-map__node,.sk-select,.sk-tl__flag,.sk-tl__label,.sk-tl__name,.sk-panelrow,.sk-props__value,.sk-qrow,.sk-picker__title,.sk-pick,.sk-layers__item,.sk-activity-row,.sk-audio,.sk-voice,.sk-mk-file,.sk-pbar__sec,.sk-prodnav__head,.sk-prodnav__scene,.sk-scrub2__arcname,.sk-viewhead,.sk-prem,.sk-mchip';

const FULL_CUT = '.sk-cast__name,.sk-cast__role,.sk-cast--row,.sk-erow__text,.sk-erow__chip,.sk-erow__source,.sk-map__text,.sk-map__rest,.sk-map__event,.sk-select__text,.sk-select__value,.sk-tl__flag,.sk-tl__label,.sk-tl__name,.sk-panelrow__value,.sk-props__value,.sk-qrow__event,.sk-picker__title,.sk-pick,.sk-layers__item,.sk-activity-row__text,.sk-audio__sub,.sk-voice__text,.sk-mk-file,.sk-pbar__sec,.sk-prodnav__head,.sk-prodnav__scene,.sk-scrub2__arcname,.sk-viewhead,.sk-prem__title,.sk-mchip__text';

/** How long the pointer rests before the tip shows, in ms. */
export const FULL_REST = 400;

/* Cut: the text box itself or a line inside it (a map card's title) overflows; words only a screen reader gets don't count */
function isCut(el: Element): boolean {
  return [el, ...Array.from(el.querySelectorAll('*'))].some((e) => !e.closest('.sk-sr') && e.clientWidth > 0 && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1));
}

/* A text box's lines as drawn: each child that holds words is a line (a name, its quiet line), never the screen-reader words */
function seen(el: Element): string {
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll('.sk-sr').forEach((n) => n.remove());
  return c.textContent || '';
}

function wordsOf(el: Element): string[] {
  const kids = Array.from(el.children).filter((k) => !k.classList.contains('sk-sr') && seen(k).trim());
  if (!kids.length) return [seen(el)];
  return kids.flatMap((k) => (k.children.length && !k.matches('b,strong,small') ? wordsOf(k) : [seen(k)]));
}

/** The whole words of a part whose text is cut, its name first; none when nothing in it is cut. */
export function linesOf(unit: Element): string[] | null {
  const cut = [unit, ...Array.from(unit.querySelectorAll(FULL_CUT))].filter((el) => el.matches(FULL_CUT));
  if (!cut.some(isCut)) return null;
  const had = new Set<string>();
  const out: string[] = [];
  cut.filter((el) => !cut.some((o) => o !== el && o.contains(el))).forEach((el) => {
    wordsOf(el).forEach((l) => {
      const line = l.trim();
      if (line && !had.has(line)) { had.add(line); out.push(line); }
    });
  });
  return out.length ? out : null;
}

/** Listens on the document for every part Sakuga draws that cuts its text; returns the undo. <Sakuga> runs it as it mounts. */
export function installFullWords(): () => void {
  if (typeof document === 'undefined') return () => undefined;
  let tip: HTMLDivElement | null = null;
  let unit: Element | null = null;
  let timer = 0;
  const hide = () => {
    window.clearTimeout(timer);
    unit = null;
    if (tip) { tip.remove(); tip = null; }
  };
  const show = (u: Element) => {
    const lines = linesOf(u);
    if (!lines) return;
    hide();
    unit = u;
    const el = document.createElement('div');
    el.className = 'sk-fulltip';
    el.setAttribute('aria-hidden', 'true');
    const themed = u.closest('[data-theme]');
    if (themed) el.setAttribute('data-theme', themed.getAttribute('data-theme') || '');
    lines.forEach((l, i) => {
      const s = document.createElement('span');
      s.className = i ? 'sk-fulltip__line' : 'sk-fulltip__name';
      s.textContent = l;
      el.appendChild(s);
    });
    el.addEventListener('pointerleave', (e) => { if (!unit || !unit.contains(e.relatedTarget as Node | null)) hide(); });
    document.body.appendChild(el);
    tip = el;
    const r = u.getBoundingClientRect(), t = el.getBoundingClientRect(), gap = 8, vw = document.documentElement.clientWidth;
    let top = r.top - t.height - gap;
    if (top < gap) top = r.bottom + gap;
    const left = Math.min(Math.max(gap, r.left + r.width / 2 - t.width / 2), vw - t.width - gap);
    el.style.top = top + 'px';
    el.style.left = left + 'px';
    requestAnimationFrame(() => { if (tip === el) el.classList.add('is-on'); });
  };
  const over = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const target = e.target as Element | null;
    if (!target || (tip && tip.contains(target))) return;
    const u = target.closest?.(FULL_UNIT) ?? null;
    if (u === unit) return;
    hide();
    if (u) {
      unit = u;
      timer = window.setTimeout(() => { if (unit === u) show(u); }, FULL_REST);
    }
  };
  const out = (e: PointerEvent) => {
    if (!unit) return;
    const to = e.relatedTarget as Node | null;
    if (to && (unit.contains(to) || (tip && tip.contains(to)))) return;
    if ((e.target as Element | null)?.closest?.(FULL_UNIT) === unit) hide();
  };
  const focusIn = (e: FocusEvent) => {
    const target = e.target as Element | null;
    const u = target?.closest?.(FULL_UNIT) ?? null;
    if (u && target!.matches(':focus-visible')) show(u);
    else if (!u) hide();
  };
  const focusOut = (e: FocusEvent) => { if (unit && !unit.contains(e.relatedTarget as Node | null)) hide(); };
  const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && tip) hide(); };
  document.addEventListener('pointerover', over);
  document.addEventListener('pointerout', out);
  document.addEventListener('focusin', focusIn);
  document.addEventListener('focusout', focusOut);
  document.addEventListener('keydown', key);
  window.addEventListener('scroll', hide, true);
  return () => {
    hide();
    document.removeEventListener('pointerover', over);
    document.removeEventListener('pointerout', out);
    document.removeEventListener('focusin', focusIn);
    document.removeEventListener('focusout', focusOut);
    document.removeEventListener('keydown', key);
    window.removeEventListener('scroll', hide, true);
  };
}
