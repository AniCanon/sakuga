import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Scrubber } from './Scrubber';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function Live({ start = 65, max = 180, onChange }: { start?: number; max?: number; onChange?: (v: number) => void }) {
  const [v, set] = useState(start);
  return <Scrubber value={v} max={max} buffered={120} markers={[30, 90]} onChange={(x) => { set(x); onChange?.(x); }} />;
}

/* A pointer event jsdom can dispatch: its MouseEvent carries the position, the id is added */
function pointer(type: string, target: EventTarget, x: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 2, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  act(() => { target.dispatchEvent(e); });
}

describe('Scrubber', () => {
  it('is a slider named "Seek" that Tab reaches, its value spoken with the length', () => {
    render(<Live />);
    const s = screen.getByRole('slider', { name: 'Seek' });
    expect(s.tabIndex).toBe(0);
    expect(s.getAttribute('aria-valuenow')).toBe('65');
    expect(s.getAttribute('aria-valuemin')).toBe('0');
    expect(s.getAttribute('aria-valuemax')).toBe('180');
    expect(s.getAttribute('aria-valuetext')).toBe('1 minute 5 seconds of 3 minutes 0 seconds');
    expect(s.getAttribute('aria-readonly')).toBeNull();
  });

  it('arrows move it by step (10 s), Page Up and Page Down by six steps, Home and End to either end', () => {
    const changed = vi.fn();
    render(<Live start={100} onChange={changed} />);
    const s = screen.getByRole('slider');
    for (const key of ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown', 'End', 'Home']) fireEvent.keyDown(s, { key });
    expect(changed.mock.calls.map((c) => c[0])).toEqual([110, 120, 110, 100, 160, 100, 180, 0]);
    expect(s.getAttribute('aria-valuetext')).toBe('0 seconds of 3 minutes 0 seconds');
  });

  it('a step of its own sets the arrows and the pages', () => {
    const changed = vi.fn();
    render(<Scrubber value={60} max={600} step={5} onChange={changed} />);
    const s = screen.getByRole('slider');
    fireEvent.keyDown(s, { key: 'ArrowRight' });
    fireEvent.keyDown(s, { key: 'PageDown' });
    expect(changed.mock.calls.map((c) => c[0])).toEqual([65, 30]);
  });

  it('the times beside it read as text; the markers are hidden, the played and buffered parts drawn to scale', () => {
    const { container } = render(<Live start={45} />);
    const wrap = container.firstElementChild!;
    expect(wrap.className).toBe('sk-scrub-wrap');
    expect([...wrap.children].map((c) => c.textContent)).toEqual(['0:45', '', '3:00']);
    const marks = container.querySelectorAll<HTMLElement>('.sk-scrub__mark');
    expect([...marks].map((m) => [m.getAttribute('aria-hidden'), m.style.left])).toEqual([['true', '16.666666666666664%'], ['true', '50%']]);
    expect(container.querySelector<HTMLElement>('.sk-scrub__fill')!.style.width).toBe('25%');
    expect(container.querySelector<HTMLElement>('.sk-scrub__buf')!.style.width).toBe('66.66666666666666%');
    expect(container.querySelector<HTMLElement>('.sk-scrub__thumb')!.style.left).toBe('25%');
  });

  it('showTimes={false} leaves the times out', () => {
    const { container } = render(<Scrubber value={10} max={60} showTimes={false} />);
    expect(container.firstElementChild!.children).toHaveLength(1);
    expect(container.textContent).toBe('');
  });

  it('follows the pointer from press to release, unclamped by easing', () => {
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    const s = screen.getByRole('slider');
    vi.spyOn(s, 'getBoundingClientRect').mockReturnValue({ left: 100, width: 200, top: 0, height: 24, right: 300, bottom: 24, x: 100, y: 0, toJSON() {} } as DOMRect);
    pointer('pointerdown', s, 150);
    expect(s.className).toBe('sk-scrub is-dragging');
    pointer('pointermove', s, 400);
    pointer('pointerup', s, 400);
    expect(changed.mock.calls.map((c) => c[0])).toEqual([45, 180]);
    expect(s.className).toBe('sk-scrub');
  });

  it('reads as read-only without onChange, and keys do nothing', () => {
    render(<Scrubber value={30} max={60} label="Seek in Episode 1" />);
    const s = screen.getByRole('slider', { name: 'Seek in Episode 1' });
    expect(s.getAttribute('aria-readonly')).toBe('true');
    fireEvent.keyDown(s, { key: 'End' });
    expect(s.getAttribute('aria-valuenow')).toBe('30');
  });
});
