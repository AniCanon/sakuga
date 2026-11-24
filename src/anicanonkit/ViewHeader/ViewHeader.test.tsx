import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ViewHeader } from './ViewHeader';

afterEach(cleanup);

describe('ViewHeader', () => {
  it('the title is a level-1 heading, the eyebrow before it and the meta after it read as text', () => {
    const { container } = render(<ViewHeader eyebrow="Plan" title="#5 · Red Line · Sé station" meta="4 of 6 cuts approved" className="x" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-viewhead x');
    expect(screen.getByRole('heading', { level: 1, name: '#5 · Red Line · Sé station' })).toBeTruthy();
    expect(root.querySelector('.sk-viewhead__text')!.textContent).toBe('Plan#5 · Red Line · Sé station4 of 6 cuts approved');
    expect(root.querySelector('.sk-viewhead__eyebrow')!.textContent).toBe('Plan');
    expect(root.querySelector('.sk-viewhead__meta')!.textContent).toBe('4 of 6 cuts approved');
  });

  it('the actions sit on the right in order, and take focus', () => {
    const { container } = render(<ViewHeader title="Make"><button type="button">Ask Maki</button><button type="button">Approve 2 cuts</button></ViewHeader>);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Ask Maki', 'Approve 2 cuts']);
    expect(container.querySelector('.sk-editor__fill')!.nextElementSibling!.textContent).toBe('Ask Maki');
    expect(container.querySelector('.sk-viewhead__eyebrow')).toBeNull();
    expect(container.querySelector('.sk-viewhead__meta')).toBeNull();
  });
});
