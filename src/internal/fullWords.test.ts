import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FULL_REST, installFullWords, linesOf } from './fullWords';

/* jsdom draws nothing, so a cut is given: the box is narrower than its words */
function cut(el: Element, on = true) {
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: 100 });
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: on ? 180 : 100 });
}

/* jsdom has no PointerEvent: a mouse event that says which pointer it came from */
const pointer = (pointerType: 'mouse' | 'touch') => Object.assign(new MouseEvent('pointerover', { bubbles: true }), { pointerType });

function castTile(name: string, role: string) {
  document.body.innerHTML = `<a class="sk-cast" href="#"><span class="sk-cast__name">${name}</span><span class="sk-cast__role">${role}<span class="sk-sr">, not in the story at this point</span></span></a>`;
  return document.querySelector('.sk-cast')!;
}

describe('full words', () => {
  let undo: () => void;
  beforeEach(() => { vi.useFakeTimers(); undo = installFullWords(); });
  afterEach(() => { undo(); vi.useRealTimers(); document.body.innerHTML = ''; });

  it('reads a cut part whole, its name first, never its screen-reader words; nothing when nothing is cut', () => {
    const tile = castTile('Arthur Penhaligon the Younger', 'The Professor');
    expect(linesOf(tile)).toBeNull();
    cut(tile.querySelector('.sk-cast__name')!);
    expect(linesOf(tile)).toEqual(['Arthur Penhaligon the Younger', 'The Professor']);
  });

  it('shows after a rest on hover, hidden from a screen reader, and leaves on Escape', () => {
    const tile = castTile('Arthur Penhaligon the Younger', 'The Professor');
    cut(tile.querySelector('.sk-cast__name')!);
    tile.querySelector('.sk-cast__name')!.dispatchEvent(pointer('mouse'));
    vi.advanceTimersByTime(FULL_REST - 1);
    expect(document.querySelector('.sk-fulltip')).toBeNull();
    vi.advanceTimersByTime(1);
    const tip = document.querySelector('.sk-fulltip')!;
    expect(tip.getAttribute('aria-hidden')).toBe('true');
    expect(tip.querySelector('.sk-fulltip__name')!.textContent).toBe('Arthur Penhaligon the Younger');
    expect(tip.querySelector('.sk-fulltip__line')!.textContent).toBe('The Professor');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.sk-fulltip')).toBeNull();
  });

  it('never shows for a part whose words fit, nor for touch', () => {
    const tile = castTile('Kiko', 'Leads the E.R.A.');
    tile.dispatchEvent(pointer('mouse'));
    vi.advanceTimersByTime(FULL_REST);
    expect(document.querySelector('.sk-fulltip')).toBeNull();
    cut(tile.querySelector('.sk-cast__name')!);
    tile.dispatchEvent(pointer('touch'));
    vi.advanceTimersByTime(FULL_REST);
    expect(document.querySelector('.sk-fulltip')).toBeNull();
  });

  it('leaves on a scroll, and its undo stops listening', () => {
    const tile = castTile('Arthur Penhaligon the Younger', 'The Professor');
    cut(tile.querySelector('.sk-cast__name')!);
    tile.dispatchEvent(pointer('mouse'));
    vi.advanceTimersByTime(FULL_REST);
    window.dispatchEvent(new Event('scroll'));
    expect(document.querySelector('.sk-fulltip')).toBeNull();
    undo();
    undo = () => undefined;
    tile.dispatchEvent(pointer('mouse'));
    vi.advanceTimersByTime(FULL_REST);
    expect(document.querySelector('.sk-fulltip')).toBeNull();
  });
});
