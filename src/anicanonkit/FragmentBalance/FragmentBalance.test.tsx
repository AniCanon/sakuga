import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FragmentBalance } from './FragmentBalance';

/* The live region is the page's one region with aria-live */
const live = () => document.querySelector('[aria-live="polite"]');

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('FragmentBalance', () => {
  it('pill reads its amount as fragments, the mark hidden, its caption after', () => {
    const { container } = render(<FragmentBalance amount="9,427" caption="left" />);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.tagName).toBe('SPAN');
    expect(pill.className).toBe('sk-frag sk-frag--pill');
    expect(pill.textContent).toBe('9,427 fragmentsleft');
    expect(pill.querySelector('.sk-sr')!.textContent).toBe(' fragments');
    expect(pill.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(pill.querySelector('svg')!.style.width).toBe('var(--fragments-pill-mark-size)');
  });

  it('block is named "Fragments balance: amount": a link with href, else a button that runs onClick, never a link to #', () => {
    const open = vi.fn();
    const { container } = render(<><FragmentBalance variant="block" amount="1,240" onClick={open} /><FragmentBalance variant="block" amount="20" href="/fragments" /></>);
    const a = screen.getByRole('button', { name: 'Fragments balance: 1,240' });
    expect(a.className).toBe('sk-frag sk-frag--block');
    expect(a.getAttribute('type')).toBe('button');
    fireEvent.click(a);
    expect(open).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[href="#"]')).toBeNull();
    expect(a.querySelector('.sk-frag__eyebrow')!.textContent).toBe('Fragments');
    expect(a.querySelector('.sk-frag__amount')!.textContent).toBe('1,240');
    expect(a.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('link', { name: 'Fragments balance: 20' }).getAttribute('href')).toBe('/fragments');
  });

  it('card is a group of that name; its amount reads as fragments; caption defaults to available; held runs along the foot', () => {
    const { container } = render(<FragmentBalance variant="card" amount="9,427" title="Creator" held="520" text="for 2 jobs in progress" image="plan.png" />);
    const card = screen.getByRole('group', { name: 'Fragments balance: 9,427' });
    expect(card.className).toBe('sk-frag sk-frag--card');
    expect(card.querySelector('.sk-frag__big')!.textContent).toBe('9,427 fragments');
    expect(card.querySelector('.sk-frag__plan')!.textContent).toBe('Creator');
    expect(card.querySelector('.sk-frag__caption')!.textContent).toBe('available');
    expect(card.querySelector('.sk-frag__foot')!.textContent).toBe('520 heldfor 2 jobs in progress');
    expect(card.querySelector('img.sk-frag__art')!.getAttribute('alt')).toBe('');
    expect([...container.querySelectorAll('svg')].every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('card without held has no foot, and takes a caption', () => {
    render(<FragmentBalance variant="card" amount="20" caption="available · Fragments never expire" />);
    const card = screen.getByRole('group', { name: 'Fragments balance: 20' });
    expect(card.querySelector('.sk-frag__foot')).toBeNull();
    expect(card.querySelector('.sk-frag__plan')).toBeNull();
    expect(card.querySelector('.sk-frag__caption')!.textContent).toBe('available · Fragments never expire');
  });

  it('inline reads its amount as fragments, its caption after a space', () => {
    const { container } = render(<FragmentBalance variant="inline" amount="~520" caption="is held" />);
    const s = container.firstElementChild as HTMLElement;
    expect(s.className).toBe('sk-frag sk-frag--inline');
    expect(s.textContent).toBe('~520 fragments is held');
  });

  it('held is said once through the live region when it appears, then reads as its text', () => {
    const { container, rerender } = render(<FragmentBalance variant="held" amount="20" text="Charged when you approve it." />);
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('20 held. Charged when you approve it.');
    const held = container.firstElementChild as HTMLElement;
    expect(held.className).toBe('sk-frag sk-frag--held');
    expect(held.textContent).toBe('20 heldCharged when you approve it.');
    expect(held.getAttribute('role')).toBeNull();
    live()!.textContent = '';
    rerender(<FragmentBalance variant="held" amount="20" text="Charged when you approve it." />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(live()!.textContent).toBe('');
  });

  it('held takes a title in place of the amount', () => {
    const { container } = render(<FragmentBalance variant="held" amount="20" title="120 held" />);
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('120 held');
    expect(container.querySelector('b')!.textContent).toBe('120 held');
  });

  it('only held speaks', () => {
    render(<><FragmentBalance amount="1" /><FragmentBalance variant="card" amount="2" /><FragmentBalance variant="block" amount="3" /><FragmentBalance variant="inline" amount="4" /></>);
    const before = live()?.textContent ?? '';
    act(() => { vi.advanceTimersByTime(2000); });
    expect(live()?.textContent ?? '').toBe(before);
  });
});
