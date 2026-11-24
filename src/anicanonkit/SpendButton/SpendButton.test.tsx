import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/* jsdom joins inline parts without a browser's spaces, so names here allow either; e2e/names.spec.ts pins them exactly */
import { SpendButton } from './SpendButton';

afterEach(cleanup);

describe('SpendButton', () => {
  it('reads its cost after the label as fragments, with the mark hidden', () => {
    render(<SpendButton cost="~100">Generate</SpendButton>);
    const b = screen.getByRole('button', { name: /^Generate ?~100 fragments$/ });
    expect(b.querySelector('.sk-btn__cost svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('reads "fragments" right after the number, before a unit', () => {
    render(<SpendButton cost="~10 a second">Animate</SpendButton>);
    expect(screen.getByRole('button', { name: /^Animate ?~10 fragments a second$/ })).toBeTruthy();
  });

  it('takes the mark at the button icon size of its own size', () => {
    render(<SpendButton cost="~10" size="lg">Start</SpendButton>);
    expect((screen.getByRole('button').querySelector('.sk-btn__cost svg') as SVGElement).style.width).toBe('var(--button-icon-size-lg)');
  });
  it('is a disabled button with href and disabled, so a price cannot be spent through a disabled link', () => {
    render(<SpendButton cost="~100" href="/generate" disabled>Generate</SpendButton>);
    expect(screen.queryByRole('link')).toBeNull();
    const b = screen.getByRole('button') as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.hasAttribute('href')).toBe(false);
  });

  it('keeps its price while busy, and passes busy through', () => {
    render(<SpendButton cost="~100" busy busyLabel="Drawing the anchor…">Draw the anchor</SpendButton>);
    const b = screen.getByRole('button');
    expect(b.getAttribute('aria-disabled')).toBe('true');
    expect(b.textContent).toContain('~100');
  });
});
