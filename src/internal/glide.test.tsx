import { useRef } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Glide, useGlide } from './glide';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function Host({ value = 'a', unrelated = '' }) {
  const ref = useRef<HTMLDivElement>(null);
  useGlide(ref, '[aria-pressed="true"]', false, [value]);
  return <div ref={ref} aria-label={unrelated}><Glide /><button aria-pressed={value === 'a'}>A</button><button aria-pressed={value === 'b'}>B</button></div>;
}
it('measures selection changes, skips unrelated renders, follows sibling resizing and cleans up', () => {
  let resize: () => void = () => {};
  let width = 40;
  const disconnect = vi.fn(), observe = vi.fn();
  vi.stubGlobal('ResizeObserver', class { constructor(fn: () => void) { resize = fn; } observe = observe; disconnect = disconnect; });
  vi.stubGlobal('requestAnimationFrame', () => 0);
  const reads = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) { return this.tagName === 'BUTTON' ? width : 100; });
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) { return this.textContent === 'B' ? width : 0; });
  const { container, rerender, unmount } = render(<Host />);
  reads.mockClear();
  rerender(<Host unrelated="changed" />);
  expect(reads).not.toHaveBeenCalled();
  rerender(<Host value="b" />);
  const indicator = container.querySelector<HTMLElement>('.sk-glide')!;
  expect(indicator.style.transform).toBe('translate(40px,0px)');
  width = 60;
  act(() => resize());
  expect(indicator.style.width).toBe('60px');
  expect(indicator.style.transform).toBe('translate(60px,0px)');
  expect(observe).toHaveBeenCalledWith(container.querySelector('button'));
  unmount();
  expect(disconnect).toHaveBeenCalled();
});
