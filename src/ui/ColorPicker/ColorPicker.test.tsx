import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColorPicker } from './ColorPicker';
import { hexOf, hexOfHsv, hsvOf } from './colour';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const presets = [{ label: 'Ink', color: '#0b0a10' }, { label: 'Camellia', color: '#c2335f' }, { label: 'Paper', color: '#f6f1e7' }];
const picture = [{ label: 'Logo red', color: '#d6402b' }, { label: 'Logo gold', color: '#e8b03a' }];

function Live({ start = '#c2335f', onChange }: { start?: string; onChange?: (hex: string) => void }) {
  const [v, set] = useState(start);
  return <ColorPicker label="Brand colour" value={v} onChange={(x) => { set(x); onChange?.(x); }} presets={presets} fromPicture={picture} />;
}

const field = () => screen.getByRole('slider', { name: 'Saturation and brightness' });
const hue = () => screen.getByRole('slider', { name: 'Hue' });
const hex = () => screen.getByRole('textbox', { name: 'Brand colour, hex' }) as HTMLInputElement;

/* A pointer event jsdom can dispatch: its MouseEvent carries the position, the id is added */
function pointer(type: string, target: EventTarget, x: number, y: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  act(() => { target.dispatchEvent(e); });
}

describe('colour', () => {
  it('reads hex of 3 or 6 digits, with or without #, and round-trips through hue, saturation and brightness', () => {
    expect(hexOf('1F6FEB')).toBe('#1f6feb');
    expect(hexOf('#abc')).toBe('#aabbcc');
    expect(hexOf('#abcd')).toBeNull();
    expect(hexOfHsv(hsvOf('#c2335f'))).toBe('#c2335f');
    expect(hsvOf('#ff0000')).toEqual({ h: 0, s: 1, v: 1 });
  });
});

describe('ColorPicker', () => {
  it('is a group named by its label, holding the field, the hue track and the hex', () => {
    render(<Live />);
    expect(screen.getByRole('group', { name: 'Brand colour' }).className).toBe('sk-colorpick');
    expect(field().tabIndex).toBe(0);
    expect(field().getAttribute('aria-valuetext')).toBe('Saturation 74%, brightness 76%');
    expect(hue().tabIndex).toBe(0);
    expect(hue().getAttribute('aria-valuetext')).toBe('Hue 342°');
    expect(hue().getAttribute('aria-valuemax')).toBe('359');
    expect(hex().value).toBe('C2335F');
  });

  it('the field moves 1% by arrow, 10% with Shift: left and right saturation, up and down brightness', () => {
    const changed = vi.fn();
    render(<Live start="#808080" onChange={changed} />);
    const f = field();
    expect(f.getAttribute('aria-valuetext')).toBe('Saturation 0%, brightness 50%');
    fireEvent.keyDown(f, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(f, { key: 'ArrowUp' });
    expect(f.getAttribute('aria-valuetext')).toBe('Saturation 10%, brightness 51%');
    fireEvent.keyDown(f, { key: 'ArrowLeft' });
    fireEvent.keyDown(f, { key: 'ArrowDown', shiftKey: true });
    expect(f.getAttribute('aria-valuetext')).toBe('Saturation 9%, brightness 41%');
    expect(changed).toHaveBeenCalledTimes(4);
  });

  it('the hue moves by 1, 10 with Shift, Page Up and Page Down by 30, Home and End to either end', () => {
    render(<Live start="#ff0000" />);
    const h = hue();
    const key = (k: string, shift = false) => fireEvent.keyDown(h, { key: k, shiftKey: shift });
    key('ArrowRight'); expect(h.getAttribute('aria-valuenow')).toBe('1');
    key('ArrowRight', true); expect(h.getAttribute('aria-valuenow')).toBe('11');
    key('PageUp'); expect(h.getAttribute('aria-valuenow')).toBe('41');
    key('PageDown'); key('ArrowDown'); expect(h.getAttribute('aria-valuenow')).toBe('10');
    key('End'); expect(h.getAttribute('aria-valuetext')).toBe('Hue 359°');
    key('Home'); expect(h.getAttribute('aria-valuenow')).toBe('0');
  });

  it('keeps the hue while the colour passes through grey, black or white', () => {
    render(<Live start="#3b82c4" />);
    for (let i = 0; i < 10; i++) fireEvent.keyDown(field(), { key: 'ArrowDown', shiftKey: true });
    expect(hex().value).toBe('000000');
    expect(hue().getAttribute('aria-valuenow')).toBe('209');
  });

  it('typing a full hex moves the field and the track to it', () => {
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    fireEvent.change(hex(), { target: { value: '#3b8' } });
    expect(changed).toHaveBeenLastCalledWith('#33bb88');
    expect(hue().getAttribute('aria-valuenow')).toBe('158');
    fireEvent.change(hex(), { target: { value: '3b82c' } });
    expect(hex().value).toBe('3b82c');
    expect(changed).toHaveBeenCalledTimes(1);
    fireEvent.blur(hex());
    expect(hex().value).toBe('33BB88');
  });

  it('presets and picture colours are radio groups, the chosen one checked when it matches', () => {
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    const inUse = screen.getByRole('radiogroup', { name: 'Colours in use' });
    expect(within(inUse).getByRole('radio', { name: 'Camellia', checked: true })).toBeTruthy();
    const fromPicture = screen.getByRole('radiogroup', { name: 'From the picture' });
    fireEvent.click(within(fromPicture).getByRole('radio', { name: 'Logo gold' }));
    expect(changed).toHaveBeenCalledWith('#e8b03a');
    expect(within(fromPicture).getByRole('radio', { name: 'Logo gold', checked: true })).toBeTruthy();
    expect(within(inUse).queryByRole('radio', { checked: true })).toBeNull();
  });

  it('the field follows the pointer from press to release, and a press focuses it', () => {
    render(<Live />);
    const f = field();
    vi.spyOn(f, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} } as DOMRect);
    pointer('pointerdown', f, 100, 25);
    expect(document.activeElement).toBe(f);
    expect(f.getAttribute('aria-valuetext')).toBe('Saturation 50%, brightness 75%');
    pointer('pointermove', f, 200, 100);
    pointer('pointerup', f, 200, 100);
    pointer('pointermove', f, 0, 0);
    expect(f.getAttribute('aria-valuetext')).toBe('Saturation 100%, brightness 0%');
  });
});
