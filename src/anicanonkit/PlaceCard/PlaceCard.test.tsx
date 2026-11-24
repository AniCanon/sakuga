import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlaceCard } from './PlaceCard';

const live = () => document.querySelector('[aria-live="polite"]');

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

const facts = [{ label: 'District', value: 'Centro' }, { label: 'Inside or out', value: 'Interior' }];

describe('PlaceCard', () => {
  it('is a region named by name, its name a level-2 heading, then caption, facts and note as text; nothing focusable', () => {
    const { container } = render(<PlaceCard name="Sé station" caption="A place in EBA" image="se.jpg" facts={facts} note="Approve it and the other views are drawn from it." />);
    const r = screen.getByRole('region', { name: 'Sé station' });
    expect(r.tagName).toBe('SECTION');
    expect(r.className).toBe('sk-placecard');
    expect(screen.getByRole('heading', { level: 2, name: 'Sé station' }).className).toBe('sk-placecard__name');
    expect(r.querySelector('.sk-placecard__caption')!.textContent).toBe('A place in EBA');
    expect(r.querySelector('.sk-placecard__note')!.textContent).toBe('Approve it and the other views are drawn from it.');
    expect(r.textContent).toContain('DistrictCentro');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('the picture’s alt is alt, or the name', () => {
    const { rerender } = render(<PlaceCard name="Sé station" image="se.jpg" />);
    expect(screen.getByRole('img', { name: 'Sé station' })).toBeTruthy();
    rerender(<PlaceCard name="Sé station" image="se.jpg" alt="Sé station: the mezzanine over the platforms" />);
    expect(screen.getByRole('img', { name: 'Sé station: the mezzanine over the platforms' })).toBeTruthy();
  });

  it('with no image the empty frame reads its placeholder; while it draws its loader stays quiet inside the card', () => {
    const { container } = render(<PlaceCard name="Sé station" placeholder="Drawing the anchor" drawing />);
    expect(screen.queryByRole('img')).toBeNull();
    const empty = container.querySelector('.sk-placecard__empty')!;
    expect(empty.textContent).toBe('Drawing the anchor');
    expect(empty.querySelector('.sk-loader')!.getAttribute('aria-label')).toBe('Drawing the anchor');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(live()?.textContent ?? '').not.toBe('Drawing the anchor');
  });

  it('not drawing, the empty frame has no loader; no facts draws no list', () => {
    const { container } = render(<PlaceCard name="Sé station" placeholder="The anchor view" facts={[]} className="mine" />);
    expect(container.querySelector('.sk-loader')).toBeNull();
    expect(container.querySelector('.sk-placecard__empty')!.textContent).toBe('The anchor view');
    expect(container.querySelector('.sk-facts')).toBeNull();
    expect(screen.getByRole('region').className).toBe('sk-placecard mine');
  });
});
