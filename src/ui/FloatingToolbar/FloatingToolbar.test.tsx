import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { FloatingToolbar } from './FloatingToolbar';

afterEach(cleanup);

function Bar() {
  return (
    <>
      <button type="button">Before</button>
      <FloatingToolbar>
        <Button variant="ghost" size="sm" icon="plus">Make it an event</Button>
        <Button variant="ghost" size="sm">Ask Maki</Button>
        <Button variant="ghost" size="sm">Copy</Button>
      </FloatingToolbar>
    </>
  );
}

describe('FloatingToolbar', () => {
  it('is a toolbar named by its label, default "Selection"', () => {
    const { rerender } = render(<FloatingToolbar><button type="button">Copy</button></FloatingToolbar>);
    expect(screen.getByRole('toolbar', { name: 'Selection' }).className).toBe('sk-ftoolbar');
    rerender(<FloatingToolbar label="Selected words" style={{ top: 40 }}><button type="button">Copy</button></FloatingToolbar>);
    expect((screen.getByRole('toolbar', { name: 'Selected words' }) as HTMLElement).style.top).toBe('40px');
  });

  it('is one Tab stop: arrows move between its buttons, Home and End go to either end', () => {
    render(<Bar />);
    const [a, b, c] = ['Make it an event', 'Ask Maki', 'Copy'].map((n) => screen.getByRole('button', { name: n }));
    expect([a, b, c].map((x) => x.tabIndex)).toEqual([0, -1, -1]);
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, { key: 'End' });
    expect(document.activeElement).toBe(c);
    fireEvent.keyDown(c, { key: 'Home' });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(a);
  });

  it('Tab comes back to the one last focused', () => {
    render(<Bar />);
    const a = screen.getByRole('button', { name: 'Make it an event' }), b = screen.getByRole('button', { name: 'Ask Maki' });
    a.focus();
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    screen.getByRole('button', { name: 'Before' }).focus();
    expect([a.tabIndex, b.tabIndex]).toEqual([-1, 0]);
  });

  it('with a count is a selection\'s bar: Clear, then the count, read with the label', () => {
    const clear = vi.fn();
    render(
      <FloatingToolbar label="Selected takes" count="3 selected" onClear={clear}>
        <Button variant="ghost" size="sm" icon="download">Download</Button>
      </FloatingToolbar>,
    );
    const bar = screen.getByRole('toolbar', { name: 'Selected takes, 3 selected' });
    expect(bar.className).toBe('sk-ftoolbar has-count');
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('aria-label') || b.textContent)).toEqual(['Clear selection', 'Download']);
    expect(bar.querySelector('.sk-ftoolbar__count')?.textContent).toBe('3 selected');
    expect(bar.querySelector('.sk-ftoolbar__rule')).toBeTruthy();
    fireEvent.click(buttons[0]);
    expect(clear).toHaveBeenCalledOnce();
  });

  it('names Clear by clearLabel, and draws no Clear without onClear', () => {
    const { rerender } = render(<FloatingToolbar count="2 selected" onClear={() => undefined} clearLabel="Deselect all"><button type="button">Copy</button></FloatingToolbar>);
    expect(screen.getByRole('button', { name: 'Deselect all' })).toBeTruthy();
    rerender(<FloatingToolbar count="2 selected"><button type="button">Copy</button></FloatingToolbar>);
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();
    expect(screen.getByRole('toolbar', { name: 'Selection, 2 selected' })).toBeTruthy();
  });
});
