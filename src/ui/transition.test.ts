import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { transition } from './transition';

const base = readFileSync('src/base.css', 'utf8');
const doc = document as Document & { startViewTransition?: (u: () => void) => unknown };
const root = document.documentElement;

afterEach(() => { delete doc.startViewTransition; vi.restoreAllMocks(); root.removeAttribute('data-sk-move'); root.removeAttribute('data-sk-reduced'); });

function viewTransitions() {
  let finish!: () => void;
  const finished = new Promise<void>((r) => { finish = r; });
  doc.startViewTransition = vi.fn((u: () => void) => { u(); return { finished, ready: finished, updateCallbackDone: finished, skipTransition() {} }; });
  return () => finish();
}
const motion = (reduce: boolean) => vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduce } as MediaQueryList);

describe('transition', () => {
  it('without view transitions it switches at once', () => {
    const update = vi.fn();
    expect(transition(update)).toBeNull();
    expect(update).toHaveBeenCalledTimes(1);
    expect(root.hasAttribute('data-sk-move')).toBe(false);
  });

  it('marks the move while it plays: a page, a view forward or back, and reduced motion; and clears it after', async () => {
    motion(false);
    let end = viewTransitions();
    transition(() => {}, { kind: 'page' });
    expect(root.getAttribute('data-sk-move')).toBe('page');
    end();
    await Promise.resolve(); await Promise.resolve();
    expect(root.hasAttribute('data-sk-move')).toBe(false);

    end = viewTransitions();
    transition(() => {}, { direction: 'back' });
    expect(root.getAttribute('data-sk-move')).toBe('back');
    end();
    await Promise.resolve(); await Promise.resolve();

    vi.restoreAllMocks();
    motion(true);
    viewTransitions();
    transition(() => {});
    expect(root.getAttribute('data-sk-move')).toBe('forward');
    expect(root.hasAttribute('data-sk-reduced')).toBe(true);
  });

  it('when the transition can’t start, the marks come off and it switches at once, so the page never stays dimmed', () => {
    motion(true);
    doc.startViewTransition = vi.fn(() => { throw new Error('InvalidStateError'); });
    const update = vi.fn();
    expect(transition(update, { kind: 'takeover' })).toBeNull();
    expect(update).toHaveBeenCalledTimes(1);
    expect(root.hasAttribute('data-sk-move')).toBe(false);
    expect(root.hasAttribute('data-sk-reduced')).toBe(false);
  });

  it('moves only the sk-page or the sk-view; the chrome stays put', () => {
    expect(base).toContain('html[data-sk-move=page] .sk-page,html[data-sk-move=forward] .sk-view,html[data-sk-move=back] .sk-view{view-transition-name:sk-view}');
    expect(base).toContain('html[data-sk-move]::view-transition-old(root),html[data-sk-move]::view-transition-new(root),html[data-sk-move]::view-transition-group(sk-view){animation:none}');
    expect(base).toContain('html[data-sk-move][data-sk-reduced]::view-transition-new(sk-view){animation:var(--motion-reduced-in) both}');
  });

  it('a takeover rises over the page it came from and drops back to uncover it; the page underneath dims, never moves', () => {
    motion(false);
    viewTransitions();
    transition(() => {}, { kind: 'takeover' });
    expect(root.getAttribute('data-sk-move')).toBe('takeover');
    viewTransitions();
    transition(() => {}, { kind: 'takeover', direction: 'back' });
    expect(root.getAttribute('data-sk-move')).toBe('takeover-back');
    expect(base).toContain('html[data-sk-move=takeover]::view-transition-new(root){animation:var(--motion-takeover-in) both}');
    expect(base).toContain('html[data-sk-move=takeover]::view-transition-old(root){animation:var(--motion-takeover-under) both}');
    expect(base).toContain('html[data-sk-move=takeover-back]::view-transition-old(root){z-index:1;animation:var(--motion-takeover-out) both}');
    expect(base).toContain('html[data-sk-move^=takeover][data-sk-reduced]::view-transition-new(root){animation:var(--motion-reduced-in) both}');
    /* the takeover rules come after the reset that stops the root from animating, so they win */
    expect(base.indexOf('html[data-sk-move=takeover]::view-transition-new(root)')).toBeGreaterThan(base.indexOf('html[data-sk-move]::view-transition-old(root),'));
  });
});
