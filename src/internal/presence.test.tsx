import { Profiler, StrictMode, Suspense, startTransition, type ReactNode } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { usePresence } from './presence';

let reduced = false;
beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  vi.stubGlobal('matchMedia', () => ({ matches: reduced }));
  document.documentElement.style.setProperty('--test-exit', 'sk-fade-out 160ms ease');
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); document.documentElement.removeAttribute('style'); });
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

function Surface({ open, child }: { open: boolean; child?: ReactNode }) {
  const p = usePresence(open, '--test-exit');
  return p.mounted ? <div data-testid="surface" data-leaving={p.leaving}>{child}</div> : null;
}

it('opens in one committed update with one child render, then keeps the full exit', () => {
  const commits = vi.fn(), child = vi.fn();
  function Child() { child(); return <button>Inside</button>; }
  const tree = (open: boolean) => <Profiler id="surface" onRender={commits}><Surface open={open} child={<Child />} /></Profiler>;
  const view = render(tree(false));
  expect(view.queryByTestId('surface')).toBeNull();
  commits.mockClear();
  view.rerender(tree(true));
  expect(commits).toHaveBeenCalledTimes(1);
  expect(child).toHaveBeenCalledTimes(1);
  expect(view.getByTestId('surface').dataset.leaving).toBe('false');
  view.rerender(tree(false));
  expect(view.getByTestId('surface').dataset.leaving).toBe('true');
  tick(159); expect(view.queryByTestId('surface')).not.toBeNull();
  tick(1); expect(view.queryByTestId('surface')).toBeNull();
});

it('cancels an interrupted exit and gives the next close its complete duration', () => {
  const view = render(<Surface open />);
  const element = view.getByTestId('surface');
  view.rerender(<Surface open={false} />); tick(80);
  view.rerender(<Surface open />);
  expect(view.getByTestId('surface')).toBe(element);
  expect(element.dataset.leaving).toBe('false');
  tick(200); expect(view.getByTestId('surface')).toBe(element);
  view.rerender(<Surface open={false} />);
  tick(159); expect(view.getByTestId('surface')).toBe(element);
  tick(1); expect(view.queryByTestId('surface')).toBeNull();
});

it('keeps mounted child state across unrelated rerenders and an interrupted close', () => {
  const view = render(<Surface open child={<input defaultValue="Original" />} />);
  const input = view.getByRole('textbox') as HTMLInputElement; input.value = 'Edited';
  view.rerender(<Surface open child={<input defaultValue="Original" />} />);
  view.rerender(<Surface open={false} child={<input defaultValue="Original" />} />);
  view.rerender(<Surface open child={<input defaultValue="Original" />} />);
  tick(200); expect(view.getByRole('textbox')).toBe(input); expect(input.value).toBe('Edited');
});

it('uses the reduced-motion duration and clears the timer on unmount', () => {
  reduced = true;
  const view = render(<Surface open />);
  view.rerender(<Surface open={false} />);
  tick(99); expect(view.queryByTestId('surface')).not.toBeNull();
  tick(1); expect(view.queryByTestId('surface')).toBeNull();
  view.rerender(<Surface open />); view.rerender(<Surface open={false} />);
  expect(vi.getTimerCount()).toBe(1); view.unmount(); expect(vi.getTimerCount()).toBe(0);
});

it('does not schedule timers for initially closed surfaces under StrictMode', () => {
  const view = render(<StrictMode><Surface open={false} /></StrictMode>);
  expect(view.queryByTestId('surface')).toBeNull(); expect(vi.getTimerCount()).toBe(0);
  view.rerender(<StrictMode><Surface open /></StrictMode>);
  view.rerender(<StrictMode><Surface open={false} /></StrictMode>);
  expect(vi.getTimerCount()).toBe(1); tick(160); expect(view.queryByTestId('surface')).toBeNull();
});

it('does not retain an opening from an abandoned suspended render', () => {
  const pending = new Promise(() => {});
  function Interrupted({ open, suspend }: { open: boolean; suspend: boolean }) {
    const p = usePresence(open, '--test-exit');
    if (suspend) throw pending;
    return p.mounted ? <div data-testid="surface" /> : null;
  }
  const tree = (open: boolean, suspend: boolean) => <Suspense fallback={<p>Loading</p>}><Interrupted open={open} suspend={suspend} /></Suspense>;
  const view = render(tree(false, false));
  act(() => startTransition(() => view.rerender(tree(true, true))));
  view.rerender(tree(false, false));
  expect(view.queryByTestId('surface')).toBeNull(); expect(vi.getTimerCount()).toBe(0);
});
