import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SliderRow } from './SliderRow';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const db = (v: number) => (v === 0 ? 'Off' : Math.round((v - 100) / 10) + ' dB');
function Live({ start = 70, onChange }: { start?: number; onChange?: (v: number) => void }) {
  const [v, set] = useState(start);
  return <SliderRow label="Volume" value={v} readout={db(v)} onChange={(x) => { set(x); onChange?.(x); }} />;
}

/* A pointer event jsdom can dispatch: its MouseEvent carries the position, the id is added */
function pointer(type: string, target: EventTarget, x: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 2, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  act(() => { target.dispatchEvent(e); });
}

describe('SliderRow', () => {
  it('is a slider named by its label that Tab reaches, its value spoken as the readout', () => {
    render(<Live />);
    const s = screen.getByRole('slider', { name: 'Volume' });
    expect(s.tabIndex).toBe(0);
    expect(s.getAttribute('aria-valuenow')).toBe('70');
    expect(s.getAttribute('aria-valuemin')).toBe('0');
    expect(s.getAttribute('aria-valuemax')).toBe('100');
    expect(s.getAttribute('aria-valuetext')).toBe('-3 dB');
    expect(s.className).toBe('sk-slidertrack is-live');
    expect(screen.getByText('-3 dB').tagName).toBe('B');
  });

  it('hides its label and readout beside the slider, so each is heard once, from the slider', () => {
    const { container } = render(<Live />);
    expect(container.querySelector('.sk-sliderrow__label')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.sk-sliderrow__value')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('arrows move it by 1, 10 with Shift, Page Up and Page Down by 10, Home and End to the ends', () => {
    const changed = vi.fn();
    render(<Live start={50} onChange={changed} />);
    const s = screen.getByRole('slider');
    const key = (k: string, shift = false) => fireEvent.keyDown(s, { key: k, shiftKey: shift });
    key('ArrowRight'); key('ArrowUp'); key('ArrowLeft', true); key('PageUp'); key('PageDown'); key('ArrowDown'); key('End'); key('Home');
    expect(changed.mock.calls.map((c) => c[0])).toEqual([51, 52, 42, 52, 42, 41, 100, 0]);
    expect(s.getAttribute('aria-valuetext')).toBe('Off');
  });

  it('follows the pointer along the track', () => {
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    const s = screen.getByRole('slider');
    vi.spyOn(s, 'getBoundingClientRect').mockReturnValue({ left: 100, width: 200, top: 0, height: 4, right: 300, bottom: 4, x: 100, y: 0, toJSON() {} } as DOMRect);
    pointer('pointerdown', s, 150);
    expect(s.className).toBe('sk-slidertrack is-live is-dragging');
    pointer('pointermove', s, 250);
    pointer('pointerup', s, 250);
    expect(changed.mock.calls.map((c) => c[0])).toEqual([25, 75]);
    expect(s.className).toBe('sk-slidertrack is-live');
  });

  it('reads as read-only without onChange, and disabled leaves the tab order, marked disabled', () => {
    render(<><SliderRow label="Exposure" value={55} readout="+0.2" /><SliderRow label="Glow" value={0} readout="Off" disabled /></>);
    const ro = screen.getByRole('slider', { name: 'Exposure' });
    expect(ro.getAttribute('aria-readonly')).toBe('true');
    expect(ro.className).toBe('sk-slidertrack');
    fireEvent.keyDown(ro, { key: 'ArrowRight' });
    expect(ro.getAttribute('aria-valuenow')).toBe('55');
    const off = screen.getByRole('slider', { name: 'Glow' });
    expect(off.tabIndex).toBe(-1);
    expect(off.getAttribute('aria-disabled')).toBe('true');
    expect(off.parentElement!.className).toBe('sk-sliderrow is-off');
  });
});
