import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Contents } from './Contents';

afterEach(cleanup);

const SECTIONS = ['Setting', 'The premise', 'The awakening', 'The leash', 'What they solved', 'The seizure', 'The research', 'Dates', 'Three awakenings'].map((label) => ({ label }));

function Sections({ limit, start = 0 }: { limit?: number; start?: number }) {
  const [open, setOpen] = useState(start);
  return <Contents label="Sections of World rules" items={SECTIONS} current={open} onSelect={setOpen} limit={limit} />;
}

describe('Contents', () => {
  it('is a navigation named by its label holding an ordered list, the open section marked current', () => {
    render(<Sections start={2} />);
    const nav = screen.getByRole('navigation', { name: 'Sections of World rules' });
    expect(nav.querySelector('ol')!.children).toHaveLength(9);
    expect(screen.getByRole('button', { name: 'The awakening' }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('button', { name: 'Setting' }).getAttribute('aria-current')).toBeNull();
  });

  it('calls onSelect with the index, and a section with href is a link', () => {
    const select = vi.fn();
    render(<Contents label="Sections" items={[{ label: 'One', href: '#one' }, { label: 'Two' }]} onSelect={select} />);
    expect(screen.getByRole('link', { name: 'One' }).getAttribute('href')).toBe('#one');
    fireEvent.click(screen.getByRole('button', { name: 'Two' }));
    expect(select).toHaveBeenCalledWith(1);
  });

  it('with limit shows the first sections, then "N more" opens the rest and puts focus on the first it opened', () => {
    render(<Sections limit={6} />);
    expect(screen.queryByRole('button', { name: 'The research' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '3 more' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(9);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'The research' }));
    expect(screen.queryByRole('button', { name: /more$/ })).toBeNull();
  });

  it('never hides the open section, and never folds away just one', () => {
    const { unmount } = render(<Sections limit={6} start={7} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(9);
    unmount();
    render(<Contents label="Sections" items={SECTIONS.slice(0, 7)} limit={6} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
  });
});
