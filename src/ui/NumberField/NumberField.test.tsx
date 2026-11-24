import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NumberField } from './NumberField';

const live = () => document.querySelector('[aria-live="polite"]');

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

function Live({ start = 1, unit = 'px' }: { start?: number; unit?: string }) {
  const [v, set] = useState(start);
  return <NumberField label="Border" value={v} unit={unit} min={0} max={8} onStep={(d) => set(v + d)} />;
}

describe('NumberField', () => {
  it('is a spinbutton named by its label that takes typing, its value read with its unit, and its range', () => {
    render(<Live />);
    const s = screen.getByRole('spinbutton', { name: 'Border' }) as HTMLInputElement;
    expect(s.value).toBe('1px');
    expect(s.getAttribute('aria-valuenow')).toBe('1');
    expect(s.getAttribute('aria-valuetext')).toBe('1px');
    expect(s.getAttribute('aria-valuemin')).toBe('0');
    expect(s.getAttribute('aria-valuemax')).toBe('8');
    expect(s.readOnly).toBe(false);
    fireEvent.input(s, { target: { value: '12px' } });
    expect(document.querySelector('.sk-num__size')!.textContent).toBe('12px');
  });

  it('Up and Down step it through onStep', () => {
    render(<Live />);
    const s = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.keyDown(s, { key: 'ArrowUp' });
    fireEvent.keyDown(s, { key: 'ArrowUp' });
    expect(s.value).toBe('3px');
    fireEvent.keyDown(s, { key: 'ArrowDown' });
    expect(s.getAttribute('aria-valuenow')).toBe('2');
  });

  it('Tab reaches the Less and More buttons, whose steps are said aloud', () => {
    render(<Live />);
    const more = screen.getByRole('button', { name: 'More border' });
    expect(screen.getByRole('button', { name: 'Less border' }).tabIndex).toBe(0);
    act(() => { vi.advanceTimersByTime(1200); });
    fireEvent.click(more);
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('Border 2px');
    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('2px');
  });

  it('a step by key is not said, since the value is read in place', () => {
    render(<Live start={4} />);
    act(() => { vi.advanceTimersByTime(1200); });
    live()!.textContent = '';
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('');
  });

  it('sets a word unit after a space, a symbol on the number', () => {
    render(<><NumberField label="Hold" value={3} unit="days" /><NumberField label="Rotate" value={-6} unit="°" /></>);
    expect((screen.getByRole('spinbutton', { name: 'Hold' }) as HTMLInputElement).value).toBe('3 days');
    expect((screen.getByRole('spinbutton', { name: 'Rotate' }) as HTMLInputElement).value).toBe('-6°');
  });

  it('read-only takes no steps by key, and both buttons are off', () => {
    const step = vi.fn();
    render(<NumberField label="Frames" value={24} readOnly onStep={step} />);
    const s = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(s.readOnly).toBe(true);
    fireEvent.keyDown(s, { key: 'ArrowUp' });
    const less = screen.getByRole('button', { name: 'Less frames' }), more = screen.getByRole('button', { name: 'More frames' });
    expect([(less as HTMLButtonElement).disabled, (more as HTMLButtonElement).disabled]).toEqual([true, true]);
    fireEvent.click(more);
    expect(step).not.toHaveBeenCalled();
  });

  it('without onStep the buttons only draw: hidden and no Tab stop', () => {
    const { container } = render(<NumberField label="Frames" value={24} />);
    expect(screen.queryByRole('button')).toBeNull();
    const bs = [...container.querySelectorAll('button')];
    expect(bs.map((b) => [b.getAttribute('aria-hidden'), b.tabIndex])).toEqual([['true', -1], ['true', -1]]);
  });

  it('typed, it hands the number over on Enter or leaving the field: the unit dropped, a comma read as a point, inside min and max', () => {
    const change = vi.fn();
    render(<NumberField label="Border" value={2} unit="px" min={0} max={8} onChange={change} />);
    const s = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(s, { target: { value: '3,5 px' } });
    fireEvent.keyDown(s, { key: 'Enter' });
    expect(change).toHaveBeenLastCalledWith(3.5);
    fireEvent.change(s, { target: { value: '40px' } });
    fireEvent.blur(s);
    expect(change).toHaveBeenLastCalledWith(8);
    fireEvent.change(s, { target: { value: '-3' } });
    fireEvent.blur(s);
    expect(change).toHaveBeenLastCalledWith(0);
    expect(change).toHaveBeenCalledTimes(3);
    /* Untouched, leaving hands nothing over */
    fireEvent.change(s, { target: { value: '2px' } });
    fireEvent.blur(s);
    expect(change).toHaveBeenCalledTimes(3);
  });

  it('what is typed goes back to value without onChange, when read-only, or when it is no number', () => {
    const change = vi.fn();
    const { rerender } = render(<NumberField label="Border" value={2} unit="px" />);
    const s = () => screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(s(), { target: { value: '5px' } });
    fireEvent.input(s(), { target: { value: '5px' } });
    fireEvent.blur(s());
    expect(s().value).toBe('2px');
    expect(document.querySelector('.sk-num__size')!.textContent).toBe('2px');
    rerender(<NumberField label="Border" value={2} unit="px" onChange={change} />);
    fireEvent.change(s(), { target: { value: 'wide' } });
    fireEvent.keyDown(s(), { key: 'Enter' });
    expect(s().value).toBe('2px');
    rerender(<NumberField label="Border" value={2} unit="px" onChange={change} readOnly />);
    fireEvent.change(s(), { target: { value: '6' } });
    fireEvent.blur(s());
    expect(s().value).toBe('2px');
    expect(change).not.toHaveBeenCalled();
  });

  it('an arrow after typing hands the typed value over first, and does not step from the old one', () => {
    const change = vi.fn(), step = vi.fn();
    render(<NumberField label="Border" value={2} unit="px" onChange={change} onStep={step} />);
    const s = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(s, { target: { value: '6' } });
    fireEvent.keyDown(s, { key: 'ArrowUp' });
    expect(change).toHaveBeenCalledWith(6);
    expect(step).not.toHaveBeenCalled();
  });
});
