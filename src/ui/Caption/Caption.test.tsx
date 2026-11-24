import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Caption } from './Caption';

afterEach(cleanup);

describe('Caption', () => {
  it('is a paragraph read where it sits, lg by default', () => {
    render(<Caption>To the people who did what I couldn’t do alone.</Caption>);
    const c = screen.getByText('To the people who did what I couldn’t do alone.');
    expect(c.tagName).toBe('P');
    expect(c.className).toBe('sk-caption sk-caption--lg');
    expect(c.tabIndex).toBe(-1);
  });

  it('is not a live region, so a new line is not announced', () => {
    const { rerender } = render(<Caption size="md">One</Caption>);
    rerender(<Caption size="md">Two</Caption>);
    const c = screen.getByText('Two');
    expect(c.className).toBe('sk-caption sk-caption--md');
    expect(c.getAttribute('role')).toBeNull();
    expect(c.getAttribute('aria-live')).toBeNull();
  });
});
