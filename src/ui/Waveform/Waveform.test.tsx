import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Waveform } from './Waveform';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function Live({ start = 12, onSeek }: { start?: number; onSeek?: (v: number) => void }) {
  const [v, set] = useState(start);
  return <Waveform duration={40} value={v} label="Position in Rain on glass" onSeek={(x) => { set(x); onSeek?.(x); }} />;
}

function pointer(type: string, target: EventTarget, x: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 2, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  act(() => { target.dispatchEvent(e); });
}

describe('Waveform', () => {
  it('without onSeek is a picture hidden from screen readers, out of the tab order', () => {
    const { container } = render(<Waveform seed={5} />);
    const w = container.firstElementChild as HTMLElement;
    expect(w.getAttribute('aria-hidden')).toBe('true');
    expect(w.getAttribute('role')).toBeNull();
    expect(w.getAttribute('tabindex')).toBeNull();
    expect(w.className).toBe('sk-wave');
    expect(screen.queryByRole('slider')).toBeNull();
  });

  it('with onSeek is a slider named by label that Tab reaches, its value spoken', () => {
    render(<Live />);
    const s = screen.getByRole('slider', { name: 'Position in Rain on glass' });
    expect(s.tabIndex).toBe(0);
    expect(s.className).toBe('sk-wave is-seekable');
    expect(s.getAttribute('aria-valuenow')).toBe('12');
    expect(s.getAttribute('aria-valuemax')).toBe('40');
    expect(s.getAttribute('aria-valuetext')).toBe('12 seconds of 40 seconds');
  });

  it('is named "Position" by default; arrows move a second, Home and End to the ends, Page keys nothing', () => {
    const seek = vi.fn();
    render(<Waveform duration={4} value={1} onSeek={seek} />);
    const s = screen.getByRole('slider', { name: 'Position' });
    for (const key of ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown', 'End', 'Home']) fireEvent.keyDown(s, { key });
    expect(seek.mock.calls.map((c) => c[0])).toEqual([2, 2, 0, 0, 4, 0]);
    expect(s.getAttribute('aria-valuetext')).toBe('1 second of 4 seconds');
  });

  it('click or drag seeks, the position staying under the pointer', () => {
    const seek = vi.fn();
    render(<Live onSeek={seek} />);
    const s = screen.getByRole('slider');
    vi.spyOn(s, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 400, top: 0, height: 28, right: 400, bottom: 28, x: 0, y: 0, toJSON() {} } as DOMRect);
    pointer('pointerdown', s, 100);
    expect(s.className).toBe('sk-wave is-seekable is-dragging');
    pointer('pointermove', s, 300);
    pointer('pointerup', s, 300);
    expect(seek.mock.calls.map((c) => c[0])).toEqual([10, 30]);
    expect(s.getAttribute('aria-valuenow')).toBe('30');
  });

  it('draws a calm shape from seed, or the real peaks resampled; bars fixes the count', () => {
    const { container } = render(<>
      <Waveform seed={5} bars={4} />
      <Waveform peaks={[0.1, 0.9, 0.5, 0.3, 1, 0.2]} bars={3} />
      <Waveform size="sm" />
      <Waveform />
    </>);
    const heights = (i: number) => [...container.children[i].querySelectorAll<HTMLElement>('.sk-wave__bars > span')].map((b) => b.style.height);
    expect(heights(0)).toEqual(['42%', '95%', '77%', '62%']);
    expect(heights(1)).toEqual(['90%', '50%', '100%']);
    expect(heights(2)).toHaveLength(56);
    expect(heights(3)).toHaveLength(88);
    expect(container.children[2].className).toBe('sk-wave sk-wave--sm');
  });

  it('value of duration puts the played part in one clipped layer', () => {
    const { container } = render(<Waveform duration={4} value={1} bars={8} />);
    const played = container.querySelector<HTMLElement>('.sk-wave__bars--played')!;
    expect(played.className).toBe('sk-wave__bars sk-wave__bars--played');
    expect(played.style.clipPath).toBe('inset(0 75% 0 0)');
    expect(played.children).toHaveLength(8);
    render(<Waveform bars={8} />);
    expect(document.querySelectorAll('.sk-wave__bars--played')).toHaveLength(1);
  });

  it('selected marks the option in use; media takes the art tone', () => {
    const { container } = render(<><Waveform selected /><Waveform variant="media" /><Waveform active /></>);
    expect([...container.children].map((c) => c.className)).toEqual(['sk-wave is-selected', 'sk-wave sk-wave--media', 'sk-wave is-selected']);
  });
});

it('reuses peak samples for playback but resamples when data or bar count changes', () => {
  const peaks = [0.1, 0.5, 0.3, 0.9];
  const sample = vi.fn(() => 0.1);
  Object.defineProperty(peaks, '0', { get: sample });
  const { container, rerender } = render(<Waveform peaks={peaks} bars={2} duration={10} value={1} />);
  sample.mockClear();
  rerender(<Waveform peaks={peaks} bars={2} duration={10} value={2} />);
  expect(sample).not.toHaveBeenCalled();
  expect(container.querySelector<HTMLElement>('.sk-wave__bars--played')!.style.clipPath).toBe('inset(0 80% 0 0)');
  rerender(<Waveform peaks={peaks} bars={3} duration={10} value={2} />);
  expect(sample).toHaveBeenCalled();
  rerender(<Waveform peaks={[1, 1, 1, 1]} bars={2} duration={10} value={2} />);
  expect(container.querySelector<HTMLElement>('.sk-wave__bars > span')!.style.height).toBe('100%');
});
