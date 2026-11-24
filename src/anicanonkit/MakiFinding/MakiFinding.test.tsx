import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MakiFinding } from './MakiFinding';

afterEach(cleanup);

describe('MakiFinding', () => {
  it('an item of its list; a line that opens is one button read as its severity, Show {title} on the map and its note, collapsed until open; the mark hidden', () => {
    const onSelect = vi.fn();
    const { container } = render(<div role="list"><MakiFinding severity="conflict" title="Genzo appears after dying" note="He dies in the fire." onSelect={onSelect} /></div>);
    expect(container.querySelector('[role="listitem"]')!.className).toBe('sk-mk-find');
    const b = screen.getByRole('button');
    expect(b.getAttribute('aria-label')).toBe('Conflict: Show Genzo appears after dying on the map. He dies in the fire.');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('.sk-mk-find__mark')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.sk-mk-find__mark')!.className).toContain('is-conflict');
    fireEvent.click(b);
    expect(onSelect).toHaveBeenCalled();
  });

  it('open: its events are a list named "In 2 events", then Ask Maki and Keep on purpose, one pair a page passes the presses of', () => {
    const onAsk = vi.fn(), onKeep = vi.fn();
    render(<MakiFinding severity="warning" title="Quiet" open onSelect={() => {}} onAsk={onAsk} onKeep={onKeep}
      events={[{ name: '“Fire”', type: 'twist', chip: 'Ep 2' }, { name: '“Ash”', source: 'Lantern Tide — series bible · Act I' }]} />);
    const list = screen.getByRole('list', { name: 'In 2 events' });
    expect(list.querySelectorAll('[role="listitem"]')).toHaveLength(2);
    expect(list.querySelector('.sk-erow__source')!.textContent).toBe('Lantern Tide — series bible · Act I');
    fireEvent.click(screen.getByRole('button', { name: 'Ask Maki' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep on purpose' }));
    expect(onAsk).toHaveBeenCalled();
    expect(onKeep).toHaveBeenCalled();
  });

  it('kept reads "Kept on purpose by {name} · {date}" and its reason, then Reopen', () => {
    const onReopen = vi.fn();
    const { container } = render(<MakiFinding title="Not placed" kept={{ by: 'Raul', date: '3 Nov', reason: 'It pays off later.' }} onReopen={onReopen} />);
    expect(container.querySelector('.sk-mk-find__kept')!.textContent).toBe('Kept on purpose by Raul · 3 Nov');
    expect(container.querySelector('q')!.textContent).toBe('It pays off later.');
    fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
    expect(onReopen).toHaveBeenCalled();
  });

  it('kept without who reads "Kept on purpose", never the action', () => {
    const { container } = render(<MakiFinding title="Not placed" kept={{ reason: 'It pays off later.' }} />);
    expect(container.querySelector('.sk-mk-find__kept')!.textContent).toBe('Kept on purpose');
  });
});
