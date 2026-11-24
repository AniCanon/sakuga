import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FragmentSoul } from './FragmentSoul';

afterEach(cleanup);

describe('FragmentSoul', () => {
  it('is hidden from a screen reader: the words beside it say the amount', () => {
    const { container } = render(<FragmentSoul />);
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('svg')!.getAttribute('width')).toBe('24');
  });

  it('takes a size token as style and dims as a filter', () => {
    const { container } = render(<FragmentSoul size="var(--button-icon-size)" dim />);
    const svg = container.querySelector('svg')!;
    expect(svg.style.width).toBe('var(--button-icon-size)');
    expect(svg.style.filter).toBe('saturate(0.4) brightness(0.95)');
  });
});
