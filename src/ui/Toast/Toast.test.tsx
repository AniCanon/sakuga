import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { liveRegion } from '../../internal/live';
import { Button } from '../Button/Button';
import { Toast } from './Toast';

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Toast', () => {
  it('says its title and text through the page’s live region when it appears', () => {
    render(<Toast title="Plaid overshirt joined his looks" text="20 fragments charged." />);
    act(() => { vi.advanceTimersByTime(100); });
    expect(liveRegion()!.textContent).toBe('Plaid overshirt joined his looks. 20 fragments charged.');
  });

  it('reads in place with the icon or picture hidden', () => {
    const { container, rerender } = render(<Toast title="Saved" text="In his looks" />);
    const t = container.firstElementChild!;
    expect(t.className).toBe('sk-toast');
    expect(t.querySelector('.sk-toast__body')!.textContent).toBe('SavedIn his looks');
    expect(t.querySelector('.sk-toast__icon')!.getAttribute('aria-hidden')).toBe('true');
    rerender(<Toast title="Saved" image="/a.jpg" />);
    expect(container.querySelector('img')!.getAttribute('alt')).toBe('');
    expect(container.querySelector('.sk-toast__icon')).toBeNull();
  });

  it('Tab reaches its actions, then "Dismiss"', () => {
    render(<Toast title="Saved"><Button variant="ghost" size="sm">Undo</Button></Toast>);
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label') || b.textContent)).toEqual(['Undo', 'Dismiss']);
  });

  it('without open, Dismiss plays the exit, then runs onDismiss and unmounts', () => {
    const done = vi.fn();
    const { container } = render(<Toast title="Saved" onDismiss={done} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(container.firstElementChild!.className).toBe('sk-toast is-leaving');
    expect(done).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(done).toHaveBeenCalledTimes(1);
    expect(container.firstElementChild).toBeNull();
  });

  it('with open, Dismiss runs onDismiss and false plays the exit', () => {
    function Held() { const [open, set] = useState(true); return <Toast title="Saved" open={open} onDismiss={() => set(false)} />; }
    const { container } = render(<Held />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(container.firstElementChild!.className).toBe('sk-toast is-leaving');
    act(() => { vi.advanceTimersByTime(1000); });
    expect(container.firstElementChild).toBeNull();
  });

  it('dismissed with focus inside, focus goes to the next toast\'s first button', () => {
    render(<><Toast title="One" /><Toast title="Two"><Button size="sm">Undo</Button></Toast><Toast title="Three" /></>);
    const dismiss = screen.getAllByRole('button', { name: 'Dismiss' });
    dismiss[0].focus();
    fireEvent.click(dismiss[0]);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Undo' }));
  });

  it('dismissed with focus inside, the last toast hands focus back to the one before it, and a lone toast to where focus came from', () => {
    render(<><Button>Save</Button><Toast title="One" /><Toast title="Two" /></>);
    const dismiss = screen.getAllByRole('button', { name: 'Dismiss' });
    dismiss[1].focus();
    fireEvent.click(dismiss[1]);
    expect(document.activeElement).toBe(dismiss[0]);
    cleanup();
    render(<><Button>Save</Button><Toast title="Saved" /></>);
    const save = screen.getByRole('button', { name: 'Save' });
    save.focus();
    screen.getByRole('button', { name: 'Dismiss' }).focus();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(document.activeElement).toBe(save);
  });

  it('dismissed with focus elsewhere, focus stays where it is', () => {
    render(<><Button>Save</Button><Toast title="One" /><Toast title="Two" /></>);
    const save = screen.getByRole('button', { name: 'Save' });
    save.focus();
    fireEvent.click(screen.getAllByRole('button', { name: 'Dismiss' })[0]);
    expect(document.activeElement).toBe(save);
  });

  it('slid sideways it follows the pointer and fades; let go past 35% of its width it leaves that way, short of that it returns', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
    const gone = vi.fn();
    const { container } = render(<Toast title="Saved" onDismiss={gone} />);
    const t = container.firstElementChild as HTMLElement;
    const pointer = (type: string, target: EventTarget, x: number) => {
      const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 10, button: 0 });
      Object.defineProperty(e, 'pointerId', { value: 1 });
      act(() => { target.dispatchEvent(e); });
    };
    pointer('pointerdown', t, 100);
    pointer('pointermove', window, 160);
    expect(t.style.transform).toBe('translateX(60px)');
    expect(t.style.opacity).toBe('0.8');
    pointer('pointerup', window, 160);
    expect([t.style.transform, t.style.opacity]).toEqual(['', '']);
    expect(gone).not.toHaveBeenCalled();
    pointer('pointerdown', t, 100);
    pointer('pointermove', window, -20);
    pointer('pointerup', window, -20);
    expect(t.style.transform).toBe('translateX(-300px)');
    act(() => { vi.advanceTimersByTime(1000); });
    expect(gone).toHaveBeenCalledTimes(1);
    expect(container.firstElementChild).toBeNull();
  });

  it('a press on its own buttons is never a swipe', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
    const { container } = render(<Toast title="Saved" />);
    const t = container.firstElementChild as HTMLElement;
    const e = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100, clientY: 10, button: 0 });
    Object.defineProperty(e, 'pointerId', { value: 1 });
    act(() => { screen.getByRole('button', { name: 'Dismiss' }).dispatchEvent(e); });
    const m = new MouseEvent('pointermove', { bubbles: true, clientX: 200, clientY: 10 });
    Object.defineProperty(m, 'pointerId', { value: 1 });
    act(() => { window.dispatchEvent(m); });
    expect(t.style.transform).toBe('');
  });

  it('open false from the start draws nothing', () => {
    const { container } = render(<Toast title="Saved" open={false} />);
    expect(container.firstElementChild).toBeNull();
  });
});
