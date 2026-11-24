import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function Live({ start = false, onChange }: { start?: boolean; onChange?: (on: boolean) => void }) {
  const [on, set] = useState(start);
  return <Switch label="Loop this track" on={on} onChange={(v) => { set(v); onChange?.(v); }} />;
}

/* A pointer event jsdom can dispatch: its MouseEvent carries the position, the id is added */
function pointer(type: string, target: EventTarget, x: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 10, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  act(() => { target.dispatchEvent(e); });
}

describe('Switch', () => {
  it('is a switch named by its label that Tab reaches, announced on or off', () => {
    render(<><Switch label="Name who speaks" on /><Switch label="Loop this track" /></>);
    const a = screen.getByRole('switch', { name: 'Name who speaks', checked: true });
    expect(a.tabIndex).toBe(0);
    expect(a.getAttribute('type')).toBe('button');
    expect(a.className).toBe('sk-switch is-on');
    expect(screen.getByRole('switch', { name: 'Loop this track', checked: false }).className).toBe('sk-switch');
  });

  it('flips through onChange on a press (Enter and Space arrive as its click)', () => {
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(changed).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch', { checked: true })).toBeTruthy();
  });

  it('disabled leaves the tab order and takes no press', () => {
    const changed = vi.fn();
    render(<Switch label="Locked" on disabled onChange={changed} />);
    const s = screen.getByRole('switch') as HTMLButtonElement;
    expect(s.disabled).toBe(true);
    fireEvent.click(s);
    expect(changed).not.toHaveBeenCalled();
  });

  it('with showLabel the whole row is its label, the hint its description, a child at the row’s end', () => {
    const changed = vi.fn();
    const { container } = render(<Switch label="Loops without a seam" showLabel hint="The end runs into the start." onChange={changed} className="x"><span>English</span></Switch>);
    const row = container.firstElementChild!;
    expect(row.tagName).toBe('LABEL');
    expect(row.className).toBe('sk-switchrow has-hint x');
    expect(screen.getByRole('switch', { name: 'Loops without a seam', description: 'The end runs into the start.' }).className).toBe('sk-switch');
    expect(row.querySelector('.sk-switchrow__end')!.textContent).toBe('English');
    fireEvent.click(screen.getByText('Loops without a seam'));
    expect(changed).toHaveBeenCalledWith(true);
  });

  it('slides: the knob follows the pointer, and let go past the middle it is on, the click swallowed', () => {
    const real = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => (pseudo === '::after' ? ({ left: '2px', width: '20px' } as CSSStyleDeclaration) : real(el)));
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(40);
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    const s = screen.getByRole('switch');
    pointer('pointerdown', s, 100);
    pointer('pointermove', window, 106);
    expect(s.className).toBe('sk-switch is-dragging');
    expect(s.style.getPropertyValue('--switch-drag-x')).toBe('6px');
    pointer('pointermove', window, 140);
    expect(s.style.getPropertyValue('--switch-drag-x')).toBe('16px');
    pointer('pointerup', window, 140);
    fireEvent.click(s);
    expect(changed.mock.calls).toEqual([[true]]);
    expect(s.style.getPropertyValue('--switch-drag-x')).toBe('');
    pointer('pointerdown', s, 100);
    pointer('pointermove', window, 94);
    pointer('pointerup', window, 94);
    expect(changed.mock.calls).toEqual([[true]]);
  });
});
