import { readFileSync } from 'node:fs';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AniCanonLoader } from './AniCanonLoader';
import { Loader } from '../index';

/* The live region is the page's one region with aria-live */
const live = () => document.querySelector('[aria-live="polite"]');

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('AniCanonLoader', () => {
  it('draws in its theme inside a theme island: an island takes its theme’s text colour, which the mark’s currentColor follows', () => {
    expect(readFileSync('src/base.css', 'utf8')).toContain('[data-theme]{color:var(--text-primary)}');
    expect(readFileSync('src/anicanonkit/AniCanonLoader/AniCanonLoader.css', 'utf8')).toContain('.sk-loader__moon{fill:currentColor}');
  });

  it('is AniCanonKit’s Loader', () => {
    expect(Loader).toBe(AniCanonLoader);
  });

  it('is a status named by its label, Loading by default, not focusable, with the mark hidden', () => {
    render(<><AniCanonLoader /><AniCanonLoader label="Drawing the portrait" size={40} /></>);
    expect(screen.getByRole('status', { name: 'Loading' }).className).toBe('sk-loader');
    const big = screen.getByRole('status', { name: 'Drawing the portrait' });
    expect(big.tabIndex).toBe(-1);
    const svg = big.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('40');
    expect(big.style.width).toBe('40px');
  });

  it('takes a size token as style', () => {
    render(<AniCanonLoader size="var(--button-icon-size)" />);
    const svg = screen.getByRole('status', { name: 'Loading' }).querySelector('svg')!;
    expect(svg.getAttribute('width')).toBeNull();
    expect(svg.style.width).toBe('var(--button-icon-size)');
  });

  it('draws the mark: the track and the arc on one ring, the crescent and the moon dot', () => {
    const { container } = render(<AniCanonLoader />);
    expect([...container.querySelectorAll('circle, path')].map((n) => n.getAttribute('class'))).toEqual(['sk-loader__track', 'sk-loader__arc', 'sk-loader__moon', 'sk-loader__moon']);
    expect(container.querySelector('path')!.getAttribute('fill-rule')).toBe('evenodd');
  });

  it('says its label once through the live region when it appears', () => {
    render(<AniCanonLoader label="Drawing the look" />);
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('Drawing the look');
  });

  it('stays quiet inside a button or a card, which says it', () => {
    render(<AniCanonLoader label="Drawing the look" />);
    act(() => { vi.advanceTimersByTime(1200); });
    live()!.textContent = '';
    render(<><button type="button" aria-label="Generating"><AniCanonLoader label="Saving the take" /></button><div className="sk-card"><span><AniCanonLoader label="Drawing the card" /></span></div></>);
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('');
  });
});
