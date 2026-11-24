import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { install } from '../install';
import { Loader } from './Loader';

/* The live region is the page's one region with aria-live */
const live = () => document.querySelector('[aria-live="polite"]');

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('Loader', () => {
  it('is a status named by its label, Loading by default, with the drawing hidden', () => {
    render(<><Loader /><Loader label="Drawing the portrait" size={48} /></>);
    expect(screen.getByRole('status', { name: 'Loading' }).className).toBe('sk-load');
    const big = screen.getByRole('status', { name: 'Drawing the portrait' });
    expect(big.tabIndex).toBe(-1);
    const svg = big.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('48');
  });

  it('speaks into the region install() made before it, the page\'s one live region', () => {
    const undo = install();
    const region = live();
    expect(region).not.toBeNull();
    render(<Loader label="Loading the pages" />);
    act(() => { vi.advanceTimersByTime(100); });
    expect(document.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
    expect(region!.textContent).toBe('Loading the pages');
    undo();
  });

  it('says its label once through the live region when it appears', () => {
    render(<Loader label="Loading the pages" />);
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('Loading the pages');
  });

  it('stays quiet inside a button, which says it', () => {
    render(<Loader label="Loading the pages" />);
    act(() => { vi.advanceTimersByTime(1200); });
    live()!.textContent = '';
    render(<button type="button" aria-label="Generating"><Loader label="Saving the take" /></button>);
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('');
  });

  it('bounces on twos, the onion skin a drawing behind', () => {
    const { container } = render(<Loader />);
    const [onion, ball] = container.querySelectorAll('ellipse');
    expect(onion.getAttribute('class')).toBe('sk-load__onion');
    expect(ball.querySelector('animate[attributeName="cy"]')!.getAttribute('values')).toBe('22;22;28;42;62;79;62;42;28');
    expect(onion.querySelector('animate[attributeName="cy"]')!.getAttribute('values')).toBe('28;22;22;28;42;62;79;62;42');
  });

  it('rests at the top with reduced motion: no onion skin, nothing moves', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
    const { container } = render(<Loader />);
    const ellipses = container.querySelectorAll('ellipse');
    expect(ellipses).toHaveLength(1);
    expect(ellipses[0].getAttribute('cy')).toBe('22');
    expect(container.querySelector('animate')).toBeNull();
  });
});
