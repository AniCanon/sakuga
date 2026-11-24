import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { PropertyList } from './PropertyList';

afterEach(cleanup);

describe('PropertyList', () => {
  it('is a group named by its label, each row a button Tab reaches, read as its name and value', () => {
    render(<PropertyList label="Direction" items={[{ icon: 'camera', label: 'Shot type', value: 'Over the shoulder' }, { label: 'Lens', value: 'Normal' }]} />);
    const group = screen.getByRole('group', { name: 'Direction' });
    const rows = screen.getAllByRole('button');
    expect(rows.map((r) => r.getAttribute('aria-label') ?? r.textContent)).toEqual(['Shot typeOver the shoulder', 'LensNormal']);
    expect(screen.getByRole('button', { name: 'Shot type Over the shoulder' }).getAttribute('type')).toBe('button');
    rows.forEach((r) => { expect(group.contains(r)).toBe(true); expect(r.tabIndex).toBe(0); expect(r.className).toBe('sk-props__row'); });
  });

  it('hides icons and chevrons; a row with no icon keeps its column', () => {
    const { container } = render(<PropertyList items={[{ icon: 'camera', label: 'Shot type', value: 'Wide' }, { label: 'Lens', value: 'Normal' }]} />);
    const [a, b] = container.querySelectorAll('.sk-props__row');
    expect(a.querySelectorAll('svg')).toHaveLength(2);
    expect(b.querySelectorAll('svg')).toHaveLength(1);
    expect(b.firstElementChild!.tagName).toBe('SPAN');
    container.querySelectorAll('svg').forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
  });

  it('expanded says whether its choice is open; unset says nothing', () => {
    render(<PropertyList items={[{ label: 'Shot type', value: 'Wide', expanded: true }, { label: 'Angle', value: 'Low', expanded: false }, { label: 'Lens', value: 'Normal' }]} />);
    expect(screen.getByRole('button', { name: 'Shot type Wide', expanded: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Angle Low', expanded: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Lens Normal' }).getAttribute('aria-expanded')).toBeNull();
  });

  it('runs onClick on a press; with href the row is a link', () => {
    const open = vi.fn();
    render(<PropertyList items={[{ label: 'Shot type', value: 'Wide', onClick: open }, { label: 'Lens', value: 'Normal', href: '#lens' }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Shot type Wide' }));
    expect(open).toHaveBeenCalledTimes(1);
    const link = screen.getByRole('link', { name: 'Lens Normal' });
    expect(link.getAttribute('href')).toBe('#lens');
    expect(link.getAttribute('type')).toBeNull();
  });

  it('the label and slot="action" sit on top; with neither there is no head', () => {
    const { container, rerender } = render(<PropertyList label="Direction" items={[]}><Button slot="action" variant="ghost" size="sm">All options</Button></PropertyList>);
    const head = container.querySelector('.sk-props__head')!;
    expect(head.textContent).toBe('DirectionAll options');
    rerender(<PropertyList items={[]} className="x" />);
    expect(container.querySelector('.sk-props__head')).toBeNull();
    expect(container.firstElementChild!.className).toBe('sk-props x');
  });
});
