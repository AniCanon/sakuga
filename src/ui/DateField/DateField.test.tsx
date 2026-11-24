import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DateField, type DateFieldProps } from './DateField';

/* jsdom lays nothing out: every control counts as shown, as it would on a page */
beforeEach(() => { vi.useFakeTimers(); vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

const live = () => document.querySelector('[aria-live="polite"]');
const presets = [{ label: 'This month', start: '2026-10-01', end: '2026-10-23' }, { label: 'Last month', start: '2026-09-01', end: '2026-09-30' }];
const base: DateFieldProps = { label: 'Dates', today: '2026-10-23', locale: 'en-US', weekStartsOn: 0 };
/* A day is a cell of its month's grid, named by its full date */
const day = (name: string) => document.querySelector<HTMLElement>(`[data-day][aria-label="${name}"]`)!;
const field = () => screen.getByRole('button', { name: /^Dates/ });

describe('DateField', () => {
  it('is a button named by its label and the dates, that opens a dialog named by its label', () => {
    render(<DateField {...base} value="2026-10-05" hint="When it airs." />);
    const f = screen.getByRole('button', { name: 'Dates Oct 5, 2026', description: 'When it airs.' });
    expect(f.getAttribute('aria-haspopup')).toBe('dialog');
    expect(f.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(f, { detail: 1 });
    expect(f.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('dialog', { name: 'Dates' })).toBeTruthy();
  });

  it('names a range by its preset first, then its dates', () => {
    render(<DateField {...base} range value={{ start: '2026-10-01', end: '2026-10-23' }} presets={presets} />);
    expect(screen.getByRole('button', { name: /^Dates This month Oct 1\s–\s23, 2026$/ })).toBeTruthy();
  });

  it('each month is a grid named by its month and year, with one Tab stop on the focused day', () => {
    render(<DateField {...base} value="2026-10-05" open />);
    const g = screen.getByRole('grid', { name: 'October 2026' });
    const stops = [...g.querySelectorAll<HTMLElement>('[data-day]')].filter((c) => c.tabIndex === 0);
    expect(stops).toEqual([day('Monday, October 5, 2026')]);
    expect(document.activeElement).toBe(day('Monday, October 5, 2026'));
    expect(day('Monday, October 5, 2026').getAttribute('aria-selected')).toBe('true');
    expect(day('Friday, October 23, 2026').getAttribute('aria-current')).toBe('date');
    expect(within(g).getAllByRole('columnheader')[0].getAttribute('abbr')).toBe('Sunday');
  });

  it('arrows move a day or a week, Page Up and Page Down a month (Shift a year), Home and End the week; the new month is announced', () => {
    render(<DateField {...base} value="2026-10-05" open />);
    const key = (k: string, shift = false) => fireEvent.keyDown(document.activeElement!, { key: k, shiftKey: shift });
    key('ArrowRight'); expect(document.activeElement).toBe(day('Tuesday, October 6, 2026'));
    key('ArrowDown'); expect(document.activeElement).toBe(day('Tuesday, October 13, 2026'));
    key('ArrowUp'); key('ArrowLeft'); expect(document.activeElement).toBe(day('Monday, October 5, 2026'));
    key('Home'); expect(document.activeElement).toBe(day('Sunday, October 4, 2026'));
    key('End'); expect(document.activeElement).toBe(day('Saturday, October 10, 2026'));
    act(() => { vi.advanceTimersByTime(1200); });
    key('PageDown');
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeTruthy();
    expect(document.activeElement).toBe(day('Tuesday, November 10, 2026'));
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('November 2026');
    key('PageUp', true);
    expect(document.activeElement).toBe(day('Monday, November 10, 2025'));
  });

  it('Enter or Space picks a date, which closes it and gives focus back to the field', () => {
    const changed = vi.fn();
    render(<DateField {...base} value="2026-10-05" onChange={changed} />);
    field().focus();
    fireEvent.click(field(), { detail: 0 });
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(changed).toHaveBeenCalledWith('2026-10-06');
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(field());
    expect(screen.getByRole('button', { name: 'Dates Oct 6, 2026' })).toBe(field());
  });

  it('Space picks a date as Enter does', () => {
    const changed = vi.fn();
    render(<DateField {...base} value="2026-10-05" onChange={changed} />);
    field().focus();
    fireEvent.click(field(), { detail: 0 });
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    fireEvent.keyDown(document.activeElement!, { key: ' ' });
    expect(changed).toHaveBeenCalledWith('2026-10-04');
    expect(document.activeElement).toBe(field());
  });

  it('a range by keys: Enter on the start, the arrows draw the band, Enter on the end; focus goes back to the field', () => {
    const changed = vi.fn();
    render(<DateField {...base} range month="2026-10" value={{ start: '2026-10-05', end: '2026-10-06' }} onChange={changed} />);
    field().focus();
    fireEvent.click(field(), { detail: 0 });
    expect(document.activeElement).toBe(day('Monday, October 5, 2026'));
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(day('Monday, October 12, 2026'));
    expect(day('Thursday, October 8, 2026').className).toBe('sk-datefield__day is-band');
    expect(changed).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(changed).toHaveBeenCalledWith({ start: '2026-10-05', end: '2026-10-12' });
    expect(document.activeElement).toBe(field());
  });

  it('a range takes two presses, the band following between them; a press before the start begins again', () => {
    const changed = vi.fn();
    render(<DateField {...base} range open month="2026-10" onChange={changed} />);
    fireEvent.click(day('Monday, October 12, 2026'));
    fireEvent.mouseEnter(day('Thursday, October 15, 2026'));
    expect(day('Tuesday, October 13, 2026').className).toBe('sk-datefield__day is-band');
    expect(day('Monday, October 12, 2026').getAttribute('aria-selected')).toBe('true');
    expect(day('Tuesday, October 13, 2026').getAttribute('aria-selected')).toBe('false');
    fireEvent.click(day('Saturday, October 10, 2026'));
    fireEvent.click(day('Friday, October 16, 2026'));
    expect(changed).toHaveBeenCalledWith({ start: '2026-10-10', end: '2026-10-16' });
  });

  it('in a range, days in it are selected; days out of reach are disabled and take no press', () => {
    const changed = vi.fn();
    render(<DateField {...base} range open month="2026-09" max="2026-10-23" value={{ start: '2026-10-01', end: '2026-10-03' }} onChange={changed} />);
    expect(['Thursday, October 1, 2026', 'Friday, October 2, 2026', 'Saturday, October 3, 2026'].map((n) => day(n).getAttribute('aria-selected'))).toEqual(['true', 'true', 'true']);
    const out = day('Saturday, October 24, 2026');
    expect(out.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(out);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getAllByRole('grid')).toHaveLength(2);
  });

  it('the presets are a listbox with one Tab stop; a preset applies in one press', () => {
    const changed = vi.fn();
    render(<DateField {...base} range open month="2026-09" presets={presets} value={{ start: '2026-10-01', end: '2026-10-23' }} onChange={changed} />);
    const list = screen.getByRole('listbox', { name: 'Presets' });
    const opts = within(list).getAllByRole('option');
    expect(opts.map((o) => o.tabIndex)).toEqual([0, -1]);
    expect(within(list).getByRole('option', { name: 'This month', selected: true })).toBeTruthy();
    opts[0].focus();
    fireEvent.keyDown(opts[0], { key: 'ArrowDown' });
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(changed).toHaveBeenCalledWith({ start: '2026-09-01', end: '2026-09-30' });
  });

  it('a preset chosen closes it and gives focus back to the field', () => {
    const changed = vi.fn();
    render(<DateField {...base} range month="2026-09" presets={presets} value={{ start: '2026-10-01', end: '2026-10-23' }} onChange={changed} />);
    field().focus();
    fireEvent.click(field(), { detail: 0 });
    const last = screen.getByRole('option', { name: 'Last month' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Enter' });
    expect(changed).toHaveBeenCalledWith({ start: '2026-09-01', end: '2026-09-30' });
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(field());
  });

  it('Escape closes without a change', () => {
    const changed = vi.fn();
    render(<DateField {...base} value="2026-10-05" onChange={changed} />);
    field().focus();
    fireEvent.click(field(), { detail: 0 });
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(changed).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(field());
  });

  it('opened by a pointer, the focused day draws no ring until a key is pressed; from the keyboard it does', () => {
    render(<DateField {...base} value="2026-10-05" />);
    fireEvent.click(field(), { detail: 1 });
    const body = document.querySelector('.sk-datefield__body')!;
    expect(body.className).toBe('sk-datefield__body is-quiet');
    fireEvent.keyDown(document.activeElement!, { key: 'Shift' });
    expect(body.className).toBe('sk-datefield__body');
  });

  it('a date shows the other months’ days muted; disabled leaves the tab order', () => {
    render(<><DateField {...base} value="2026-10-05" open /><DateField label="Ends" disabled placeholder="No end" /></>);
    expect(day('Wednesday, September 30, 2026').className).toBe('sk-datefield__day is-other');
    const ends = screen.getByRole('button', { name: 'Ends No end' }) as HTMLButtonElement;
    expect(ends.disabled).toBe(true);
    expect(ends.className).toContain('is-empty');
  });
});
