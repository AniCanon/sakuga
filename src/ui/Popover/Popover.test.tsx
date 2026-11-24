import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from './Popover';

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

function Menu({ onKeyDown }: { onKeyDown?: () => void }) {
  const [open, set] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" aria-expanded={open} onClick={() => set(!open)}>The Professor</button>
      <Popover open={open} label="The Professor" onClose={() => set(false)} onKeyDown={onKeyDown}>
        <b>The Professor</b>
        <button type="button">Open in Story</button>
      </Popover>
      <p>Outside</p>
    </div>
  );
}

describe('Popover', () => {
  /* jsdom lays nothing out: every control counts as shown, as it would on a page */
  beforeEach(() => { vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList); });

  it('is a dialog named by its label; role changes the role', () => {
    render(<><Popover label="The Professor">Held in London.</Popover><Popover label="Actions" role="menu">x</Popover></>);
    expect(screen.getByRole('dialog', { name: 'The Professor' }).className).toBe('sk-popover is-anchored');
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
  });

  it('with onClose takes focus while open, on its first control', () => {
    render(<Menu />);
    const opener = screen.getByRole('button', { name: 'The Professor' });
    opener.focus();
    fireEvent.click(opener);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open in Story' }));
  });

  it('takes focus itself when it has no control', () => {
    function Note() { const [open, set] = useState(false); return <><button type="button" onClick={() => set(true)}>Note</button><Popover open={open} label="Note" onClose={() => set(false)}>Just words</Popover></>; }
    render(<Note />);
    screen.getByRole('button').focus();
    fireEvent.click(screen.getByRole('button'));
    const d = screen.getByRole('dialog');
    expect(document.activeElement).toBe(d);
    expect(d.getAttribute('tabindex')).toBe('-1');
  });

  it('Escape runs onClose after the caller’s keys, its exit plays, and focus goes back to what opened it', () => {
    const keys = vi.fn();
    render(<Menu onKeyDown={keys} />);
    const opener = screen.getByRole('button', { name: 'The Professor' });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Open in Story' }), { key: 'Escape' });
    expect(keys).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog').className).toBe('sk-popover is-anchored is-leaving');
    expect(document.activeElement).toBe(opener);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('a press outside runs onClose, and focus stays where that press put it', () => {
    render(<Menu />);
    const opener = screen.getByRole('button', { name: 'The Professor' });
    opener.focus();
    fireEvent.click(opener);
    const outside = screen.getByText('Outside');
    outside.tabIndex = -1;
    fireEvent.pointerDown(outside);
    outside.focus();
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(outside);
  });

  it('with onClose the surface is always focusable by script, never by Tab, so a press on its words keeps focus in it', () => {
    render(<Menu />);
    fireEvent.click(screen.getByRole('button', { name: 'The Professor' }));
    const d = screen.getByRole('dialog');
    expect(d.getAttribute('tabindex')).toBe('-1');
    d.focus();
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByRole('dialog').className).toBe('sk-popover is-anchored');
  });

  it('focus leaving it by Tab runs onClose, and focus stays where Tab put it', () => {
    render(<Menu />);
    const opener = screen.getByRole('button', { name: 'The Professor' });
    opener.focus();
    fireEvent.click(opener);
    const outside = screen.getByText('Outside');
    outside.tabIndex = 0;
    act(() => { outside.focus(); });
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(outside);
  });

  it('a surface opened from inside it taking focus closes it too; focus returning to the control that opened it is left to that control', () => {
    function WithDialog() {
      const [open, set] = useState(true), [asked, ask] = useState(false);
      return (
        <>
          <button type="button" onClick={() => set(!open)}>The Professor</button>
          <Popover open={open} label="The Professor" onClose={() => set(false)}><button type="button" onClick={() => ask(true)}>Delete</button></Popover>
          {asked && <div role="alertdialog" aria-label="Delete him?" tabIndex={-1} ref={(el) => el?.focus()} />}
        </>
      );
    }
    const opener = document.createElement('button');
    document.body.append(opener);
    render(<WithDialog />);
    const toggle = screen.getByRole('button', { name: 'The Professor' });
    /* Focus back on the opener (its own press) leaves the toggling to it */
    toggle.focus();
    screen.getByRole('button', { name: 'Delete' }).focus();
    toggle.focus();
    expect(screen.getByRole('dialog').className).toBe('sk-popover is-anchored');
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('alertdialog'));
    opener.remove();
  });

  it('without onClose it never moves focus (a hover card)', () => {
    render(<><button type="button">Mention</button><Popover label="Card"><button type="button">Open</button></Popover></>);
    const m = screen.getByRole('button', { name: 'Mention' });
    m.focus();
    cleanup();
    render(<><button type="button">Mention</button></>);
    screen.getByRole('button', { name: 'Mention' }).focus();
    render(<Popover label="Card"><button type="button">Open</button></Popover>);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Mention' }));
  });

  it('lines up with the anchor’s start or end edge with align, and floats free with anchored false', () => {
    render(<><Popover label="A" align="end">a</Popover><Popover label="B" anchored={false}>b</Popover></>);
    expect(screen.getByRole('dialog', { name: 'A' }).className).toBe('sk-popover is-anchored is-end');
    expect(screen.getByRole('dialog', { name: 'B' }).className).toBe('sk-popover');
  });
});
