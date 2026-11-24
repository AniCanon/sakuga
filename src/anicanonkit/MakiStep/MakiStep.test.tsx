import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MakiStep } from './MakiStep';

afterEach(cleanup);

describe('MakiStep', () => {
  it('reads as text: done with a check and its detail after it', () => {
    const { container } = render(<MakiStep done label="Read the story" detail="26 events" />);
    expect(container.querySelector('.sk-mk-step')!.className).toBe('sk-mk-step is-done');
    expect(container.querySelector('.sk-mk-step__line')!.tagName).toBe('SPAN');
    expect(container.querySelector('.sk-mk-step__detail')!.textContent).toBe('26 events');
    expect(container.querySelector('.sk-mk-step__mark')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('with children it is a button, expanded or collapsed, that opens to show them', () => {
    render(<MakiStep done label="Read the story"><p>Fire at Sé</p></MakiStep>);
    const b = screen.getByRole('button');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Fire at Sé')).toBeNull();
    fireEvent.click(b);
    expect(b.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Fire at Sé')).toBeTruthy();
  });
});
