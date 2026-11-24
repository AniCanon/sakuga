import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { List } from './List';
import { ListRow } from '../ListRow/ListRow';
import { Switch } from '../Switch/Switch';

afterEach(cleanup);

describe('List', () => {
  it('is a list named by its label, its rows its items', () => {
    render(<List label="Sound"><ListRow title="Takes’ own sound" sub="Voices and sound from each take" /><ListRow title="Cue 2 · wind" sub="Music" /></List>);
    const list = screen.getByRole('list', { name: 'Sound' });
    expect(list.className).toBe('sk-list');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('surface sets the rows in a surface', () => {
    render(<List label="Sound" surface className="x"><ListRow title="Cue 2" /></List>);
    expect(screen.getByRole('list').className).toBe('sk-list sk-list--surface x');
  });

  it('Tab reaches only the rows that are links or hold a control', () => {
    const { container } = render(
      <List label="Tracks">
        <ListRow title="Takes’ own sound"><Switch on label="Takes’ own sound" /></ListRow>
        <ListRow title="Notes" sub="Read only" />
        <ListRow title="2A · take 1" href="#take" />
      </List>,
    );
    const tabbable = [...container.querySelectorAll<HTMLElement>('a[href],button,[role="switch"],[tabindex="0"]')].filter((el) => el.tabIndex >= 0);
    expect(tabbable.map((el) => el.getAttribute('role') || el.tagName.toLowerCase())).toEqual(['switch', 'a']);
  });

  it('columns flows the rows across that many columns, at most 4, and a list without it stays one column', () => {
    const { rerender } = render(<List label="In progress" columns={2}><ListRow title="Episode 2" href="/e/2" /><ListRow title="The popcorn incident" href="/s/1" /></List>);
    const list = screen.getByRole('list', { name: 'In progress' });
    expect(list.className).toBe('sk-list sk-list--columns sk-list--cols-2');
    expect(list.style.getPropertyValue('--list-columns')).toBe('2');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    rerender(<List label="In progress" columns={9 as 4}><ListRow title="Episode 2" /></List>);
    expect(screen.getByRole('list').className).toBe('sk-list sk-list--columns sk-list--cols-4');
    rerender(<List label="In progress"><ListRow title="Episode 2" /></List>);
    expect(screen.getByRole('list').className).toBe('sk-list');
    expect(screen.getByRole('list').style.getPropertyValue('--list-columns')).toBe('');
  });

  it('reorders: each row gets a grip, Up and Down on it move the row a place, keep focus on it and say the move', () => {
    vi.useFakeTimers();
    const moves: [number, number][] = [];
    function Voices() {
      const [rows, setRows] = useState(['Voices', 'Music', 'Sound']);
      return <List label="Tracks" onReorder={(from, to) => { moves.push([from, to]); setRows((r) => { const n = [...r]; n.splice(to, 0, n.splice(from, 1)[0]); return n; }); }}>
        {rows.map((t) => <ListRow key={t} title={t} />)}
      </List>;
    }
    render(<Voices />);
    const grips = () => screen.getAllByRole('button', { name: /^Move / });
    expect(grips().map((g) => g.getAttribute('aria-label'))).toEqual(['Move Voices, 1 of 3', 'Move Music, 2 of 3', 'Move Sound, 3 of 3']);
    expect(document.getElementById(grips()[0].getAttribute('aria-describedby')!)!.textContent).toContain('Up and Down');
    act(() => { grips()[1].focus(); });
    fireEvent.keyDown(grips()[1], { key: 'ArrowUp' });
    expect(moves).toEqual([[1, 0]]);
    expect(document.activeElement).toBe(grips()[0]);
    expect(grips()[0].getAttribute('aria-label')).toBe('Move Music, 1 of 3');
    act(() => { vi.advanceTimersByTime(100); });
    expect(document.querySelector('[aria-live="polite"]')!.textContent).toBe('Music moved to 1 of 3');
    // The first row goes no higher
    fireEvent.keyDown(grips()[0], { key: 'ArrowUp' });
    expect(moves).toHaveLength(1);
    vi.useRealTimers();
  });

  it('a board draws a row mid-move: lifted where it was, a line at the slot it lands in, and grips that do not move', () => {
    const { container } = render(<List label="Tracks" moving={{ from: 0, to: 2 }}><ListRow title="Voices" /><ListRow title="Music" /><ListRow title="Sound" /></List>);
    const rows = [...container.querySelectorAll('.sk-listrow')];
    expect(rows.map((r) => r.classList.contains('is-lifted'))).toEqual([true, false, false]);
    expect(rows[2].querySelector('.sk-listrow__drop')!.className).toContain('is-after');
    expect(screen.getAllByRole('button', { name: /^Move / }).map((g) => g.tabIndex)).toEqual([-1, -1, -1]);
  });

  it('a list that does not reorder has no grips', () => {
    render(<List label="Tracks"><ListRow title="Voices" /></List>);
    expect(screen.queryByRole('button', { name: /^Move / })).toBeNull();
  });
});
