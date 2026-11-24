import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SidePanel } from './SidePanel';

afterEach(cleanup);

describe('SidePanel', () => {
  it('a section named by label: the head, the body and the foot, as props or slots', () => {
    const { container } = render(<SidePanel label="Event" foot={<p>Foot</p>}><span slot="head"><h2>Fire at Sé</h2></span><p>Body</p></SidePanel>);
    const s = screen.getByRole('region', { name: 'Event' });
    expect(s.tagName).toBe('SECTION');
    expect(container.querySelector('.sk-side__head h2')!.textContent).toBe('Fire at Sé');
    expect(container.querySelector('.sk-side__body')!.textContent).toBe('Body');
    expect(container.querySelector('.sk-side__foot')!.textContent).toBe('Foot');
  });

  it('a body with role="region" is a Tab stop named by bodyLabel; a conversation is a log, a Tab stop too, held back while busy', () => {
    const { container, rerender } = render(<SidePanel role="region" bodyLabel="What Maki found"><p>x</p></SidePanel>);
    let b = container.querySelector('.sk-side__body')!;
    expect(b.getAttribute('tabindex')).toBe('0');
    expect(b.getAttribute('aria-label')).toBe('What Maki found');
    rerender(<SidePanel role="log" follow busy bodyLabel="Conversation with Maki"><p>x</p></SidePanel>);
    b = container.querySelector('.sk-side__body')!;
    expect(b.getAttribute('role')).toBe('log');
    expect(b.getAttribute('aria-busy')).toBe('true');
    expect(b.getAttribute('tabindex')).toBe('0');
  });
});
