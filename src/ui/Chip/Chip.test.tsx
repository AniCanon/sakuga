import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chip } from './Chip';

afterEach(() => { cleanup(); vi.useRealTimers(); });

const css = readFileSync('src/ui/Chip/Chip.css', 'utf8');

describe('Chip', () => {
  it('is a button in a group named by Chip.Group, pressed when selected', () => {
    render(<Chip.Group label="What to show"><Chip selected>All</Chip><Chip>Shorts</Chip></Chip.Group>);
    const group = screen.getByRole('group', { name: 'What to show' });
    expect(group.className).toBe('sk-chips');
    expect(screen.getByRole('button', { name: 'All', pressed: true }).className).toBe('sk-chip');
    expect(screen.getByRole('button', { name: 'Shorts', pressed: false }).getAttribute('type')).toBe('button');
  });

  it('runs onClick, and Tab reaches each chip', () => {
    const onClick = vi.fn();
    render(<><Chip onClick={onClick}>Episodes</Chip><Chip>Manga</Chip></>);
    const [a, b] = screen.getAllByRole('button');
    expect(a.tabIndex).toBe(0);
    expect(b.tabIndex).toBe(0);
    fireEvent.click(a);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('hides its icon; soft is the multi-select look', () => {
    render(<Chip variant="soft" icon="trait-fierce" selected>Fierce</Chip>);
    const c = screen.getByRole('button', { name: 'Fierce', pressed: true });
    expect(c.className).toBe('sk-chip sk-chip--soft');
    expect(c.querySelector('.sk-chip__icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('removable is a choice a press takes away: named "Remove …" from its words (removeLabel changes the verb), never a pressed toggle', () => {
    const off = vi.fn();
    const { rerender } = render(<Chip removable selected onClick={off}><b>Smith</b></Chip>);
    const c = screen.getByRole('button', { name: 'Remove Smith' });
    expect(c.className).toBe('sk-chip is-removable');
    expect(c.hasAttribute('aria-pressed')).toBe(false);
    fireEvent.click(c);
    expect(off).toHaveBeenCalledOnce();
    rerender(<Chip removable removeLabel="Take away">Smith</Chip>);
    expect(screen.getByRole('button', { name: 'Take away Smith' })).toBeTruthy();
    rerender(<Chip removable aria-label="Smith, remove">Smith</Chip>);
    expect(screen.getByRole('button', { name: 'Smith, remove' })).toBeTruthy();
  });

  it('scrolls sideways as one row with scroll', () => {
    render(<Chip.Group label="Kinds" scroll><Chip>All</Chip></Chip.Group>);
    expect(screen.getByRole('group').className).toBe('sk-chips sk-chips--scroll');
  });
  it('keeps an edge in forced colours, selected in Highlight, and does not scale under reduced motion', () => {
    expect(css).toContain('@media (forced-colors:active){.sk-chip{border:var(--chip-forced-edge-width) solid ButtonText}}');
    expect(css).toContain('@media (forced-colors:active){.sk-chip[aria-pressed="true"]{forced-color-adjust:none;background:Highlight;color:HighlightText;border-color:Highlight}}');
    expect(css).toContain('@media (prefers-reduced-motion:reduce){.sk-chip:active{transform:none}}');
  });

  it('in a group, keyed chips arrive and leave: a removed chip keeps its place, inert and hidden, until its exit has played', () => {
    vi.useFakeTimers();
    const gone = vi.fn();
    function Filters() {
      const [left, setLeft] = useState(['Smith', 'Kiko']);
      return (
        <>
          <Chip.Group label="Shown on the map">
            {left.map((n) => <Chip key={n} removable onClick={() => { gone(n); setLeft(left.filter((x) => x !== n)); }}>{n}</Chip>)}
          </Chip.Group>
          <button type="button" onClick={() => setLeft([...left, 'Lisa'])}>Add Lisa</button>
        </>
      );
    }
    const { container } = render(<Filters />);
    expect(container.querySelector('.is-arriving')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Smith' }));
    const leaving = container.querySelector('.sk-chip.is-leaving') as HTMLButtonElement;
    expect(leaving.textContent).toBe('Smith');
    expect(leaving.getAttribute('aria-hidden')).toBe('true');
    expect(leaving.hasAttribute('inert')).toBe(true);
    expect(leaving.tabIndex).toBe(-1);
    expect(screen.queryByRole('button', { name: 'Remove Smith' })).toBeNull();
    fireEvent.click(leaving);
    expect(gone).toHaveBeenCalledTimes(1);
    expect([...container.querySelectorAll('.sk-chip')].map((c) => c.textContent)).toEqual(['Smith', 'Kiko']);
    act(() => { vi.advanceTimersByTime(400); });
    expect([...container.querySelectorAll('.sk-chip')].map((c) => c.textContent)).toEqual(['Kiko']);
    fireEvent.click(screen.getByRole('button', { name: 'Add Lisa' }));
    expect(screen.getByRole('button', { name: 'Remove Lisa' }).className).toContain('is-arriving');
    expect(screen.getByRole('button', { name: 'Remove Kiko' }).className).not.toContain('is-arriving');
  });

  it('a soft chip with no icon is padded alike on both sides; arriving and leaving fade alone under reduced motion', () => {
    expect(css).toContain('.sk-chip--soft:not(:has(.sk-chip__icon)){padding-left:var(--chip-soft-padding-plain);padding-right:var(--chip-soft-padding-plain)}');
    expect(css).toContain('@media (prefers-reduced-motion:reduce){.sk-chip.is-leaving{animation:var(--motion-reduced-out) both!important}}');
  });
});

describe('Chip.Group focus hand-off', () => {
  it('moves focus to the chip now in its place when a focused chip leaves, never to the page', () => {
    function Filters() {
      const [on, setOn] = useState(['Kiko', 'Ken', 'Smith']);
      return <Chip.Group label="Filters">{on.map((n) => <Chip key={n} removable onClick={() => setOn(on.filter((x) => x !== n))}>{n}</Chip>)}</Chip.Group>;
    }
    render(<Filters />);
    const kiko = screen.getByRole('button', { name: 'Remove Kiko' });
    kiko.focus();
    fireEvent.click(kiko);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove Ken' }));
  });
});
