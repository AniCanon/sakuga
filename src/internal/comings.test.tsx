import { StrictMode, Suspense } from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useComings } from './comings';

function Host({ names }: { names: string[] }) {
  const shown = useComings(names.map((n) => ({ key: n })), 'fast');
  return <p>{shown.map((m) => `${m.item.key}${m.state ? ':' + m.state : ''}`).join(' ')}</p>;
}

describe('useComings', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('moves nothing at the first drawing', () => {
    const { container } = render(<Host names={['a', 'b']} />);
    expect(container.textContent).toBe('a b');
  });

  it('marks one added later as arriving, and keeps one removed at its place, leaving, until its exit has played', () => {
    const { container, rerender } = render(<Host names={['a', 'b', 'c']} />);
    rerender(<Host names={['a', 'c', 'd']} />);
    expect(container.textContent).toBe('a b:leaving c d:arriving');
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.textContent).toBe('a c d:arriving');
  });

  it('lets an item put back before its exit ends arrive again, without a second copy leaving', () => {
    const { container, rerender } = render(<Host names={['a', 'b']} />);
    rerender(<Host names={['a']} />);
    rerender(<Host names={['a', 'b']} />);
    expect(container.textContent).toBe('a b:arriving');
  });
});

const pending = new Promise<void>(() => {});
function Suspended({ names, suspend = false }: { names: string[]; suspend?: boolean }) {
  const shown = useComings(names.map(key => ({ key })), 'fast');
  if (suspend) throw pending;
  return <p>{shown.map(m => `${m.item.key}:${m.state}`).join(' ')}</p>;
}
it('ignores list changes from an abandoned Suspense render', () => {
  const view = (names: string[], suspend = false) => <StrictMode><Suspense fallback="pending"><Suspended names={names} suspend={suspend} /></Suspense></StrictMode>;
  const { container, rerender, unmount } = render(view(['a', 'b']));
  rerender(view(['a'], true));
  rerender(view(['a', 'b']));
  expect(container.textContent).toBe('a:null b:null');
  unmount();
});
it('keeps the same DOM node and latest committed content during exit, including StrictMode', () => {
  vi.useFakeTimers();
  function Items({ items }: { items: { key: string; text: string }[] }) {
    return <div>{useComings(items, 'fast').map(x => <span key={x.item.key}>{x.item.text}:{x.state}</span>)}</div>;
  }
  const view = (items: { key: string; text: string }[]) => <StrictMode><Items items={items} /></StrictMode>;
  const { container, rerender, unmount } = render(view([{key:'a',text:'old'}]));
  const node = container.querySelector('span');
  rerender(view([{key:'a',text:'new'}]));
  rerender(view([]));
  expect(container.querySelector('span')).toBe(node);
  expect(node!.textContent).toBe('new:leaving');
  act(() => { vi.advanceTimersByTime(400); });
  expect(container.querySelector('span')).toBeNull();
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
