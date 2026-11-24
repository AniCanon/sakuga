import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { Select } from './Select';

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

const factions = [{ label: 'Heros', icon: 'faction-hero' as const, hint: '8' }, { label: 'E.R.A.', icon: 'faction-villain' as const, hint: '8' }, { label: 'Unaligned', icon: 'faction-independent' as const, hint: '7' }];
const field = () => screen.getByRole('combobox');
const key = (k: string) => fireEvent.keyDown(field(), { key: k });
/* Enter and Space on a button arrive as its click with detail 0 */
const press = () => fireEvent.click(field(), { detail: 0 });
const settle = () => act(() => { vi.advanceTimersByTime(400); });

describe('Select', () => {
  it('is a select-only combobox Tab reaches, named by its label and its value, described by its hint', () => {
    render(<Select label="Faction" value="Heros" options={factions} hint="Who he stands with." />);
    const f = screen.getByRole('combobox', { name: 'Faction Heros', description: 'Who he stands with.' });
    expect(f.tagName).toBe('BUTTON');
    expect(f.tabIndex).toBe(0);
    expect(f.getAttribute('aria-haspopup')).toBe('listbox');
    expect(f.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('with no options it is disabled to a screen reader and opens nothing', () => {
    render(<Select label="Faction" placeholder="None yet" options={[]} />);
    const f = screen.getByRole('combobox', { name: 'Faction None yet' });
    expect(f.getAttribute('aria-disabled')).toBe('true');
    press(); key('ArrowDown');
    expect(f.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('listbox')).toBeNull();
    cleanup();
    render(<Select label="Faction" options={factions} />);
    expect(field().hasAttribute('aria-disabled')).toBe(false);
  });

  it('scrolls the active option into view as it moves', () => {
    const seen: string[] = [];
    const was = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (this: Element, o?: boolean | ScrollIntoViewOptions) { seen.push(this.textContent + ' ' + JSON.stringify(o)); };
    try {
      render(<Select label="Faction" value="Heros" options={factions} />);
      press();
      key('End');
      expect(seen).toEqual(['Heros8 {"block":"nearest"}', 'Unaligned7 {"block":"nearest"}']);
    } finally { Element.prototype.scrollIntoView = was; }
  });

  it('reads optional within its name, and its placeholder without a label', () => {
    render(<><Select label="Faction" optional options={factions} /><Select placeholder="Pick a faction" options={factions} /></>);
    expect(screen.getByRole('combobox', { name: 'Faction · optional Choose' })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Pick a faction' }).textContent).toBe('Pick a faction');
  });

  it('opens on Down, Up, Enter or Space, focus staying on the field, the chosen option active', () => {
    render(<Select label="Faction" value="E.R.A." options={factions} />);
    field().focus();
    key('ArrowDown');
    expect(field().getAttribute('aria-expanded')).toBe('true');
    const list = screen.getByRole('listbox', { name: 'Faction' });
    expect(field().getAttribute('aria-controls')).toBe(list.id);
    expect(field().getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'E.R.A. 8', selected: true }).id);
    expect(document.activeElement).toBe(field());
    key('Escape'); settle();
    key('ArrowUp');
    expect(field().getAttribute('aria-expanded')).toBe('true');
    key('Escape'); settle();
    press();
    expect(field().getAttribute('aria-expanded')).toBe('true');
  });

  it('moves the active option with the arrows, Home, End and a first letter, and Enter picks it', () => {
    const changed = vi.fn();
    // With onChange the page decides: it takes the pick and gives it back as the value
    function Page() {
      const [value, setValue] = useState('Heros');
      return <Select label="Faction" value={value} options={factions} onChange={(v) => { changed(v); setValue(v); }} />;
    }
    render(<Page />);
    press();
    const active = () => document.getElementById(field().getAttribute('aria-activedescendant')!)!.textContent;
    key('ArrowDown'); expect(active()).toBe('E.R.A.8');
    key('ArrowDown'); key('ArrowDown'); expect(active()).toBe('Unaligned7');
    key('Home'); expect(active()).toBe('Heros8');
    key('End'); expect(active()).toBe('Unaligned7');
    key('e'); expect(active()).toBe('E.R.A.8');
    press();
    expect(changed).toHaveBeenCalledWith('E.R.A.');
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('combobox', { name: 'Faction E.R.A.' })).toBeTruthy();
  });

  it('a first letter opens the list on the next match', () => {
    render(<Select label="Faction" value="Heros" options={factions} />);
    key('u');
    expect(field().getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(field().getAttribute('aria-activedescendant')!)!.textContent).toBe('Unaligned7');
  });

  it('closes on Escape, keeping that Escape, and on Tab; the menu plays its exit, then goes', () => {
    const outer = vi.fn();
    render(<div onKeyDown={outer}><Select label="Faction" value="Heros" options={factions} open /></div>);
    expect(screen.getByRole('listbox')).toBeTruthy();
    key('Escape');
    expect(outer).not.toHaveBeenCalled();
    expect(field().getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('listbox', { hidden: true }).className).toBe('sk-select__menu is-leaving');
    settle();
    expect(screen.queryByRole('listbox')).toBeNull();
    press();
    key('Tab');
    expect(field().getAttribute('aria-expanded')).toBe('false');
  });

  it('a click picks an option, a press outside closes it, and a pointer click on the field toggles it', () => {
    const changed = vi.fn();
    render(<><Select label="Faction" value="Heros" options={factions} onChange={changed} /><p>outside</p></>);
    fireEvent.click(field(), { detail: 1 });
    fireEvent.click(screen.getByRole('option', { name: 'Unaligned 7' }));
    expect(changed).toHaveBeenCalledWith('Unaligned');
    settle();
    fireEvent.click(field(), { detail: 1 });
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(field().getAttribute('aria-expanded')).toBe('false');
    settle();
    fireEvent.click(field(), { detail: 1 });
    fireEvent.click(field(), { detail: 1 });
    expect(field().getAttribute('aria-expanded')).toBe('false');
  });

  it('shows the chosen option with a check and its icon on the field; empty shows the placeholder', () => {
    const { container } = render(<><Select label="Faction" value="Heros" options={factions} open /><Select label="Place" placeholder="Pick a place" /></>);
    const on = screen.getByRole('option', { selected: true });
    expect(on.className).toBe('sk-select__option is-selected is-active');
    expect(on.querySelector('.sk-select__check')).toBeTruthy();
    expect(container.querySelectorAll('.sk-select__value .sk-icon')).toHaveLength(1);
    const empty = screen.getByRole('combobox', { name: 'Place Pick a place' });
    expect(empty.className).toBe('sk-tf__control sk-select is-empty');
    fireEvent.click(empty, { detail: 0 });
    expect(empty.getAttribute('aria-expanded')).toBe('false');
  });

  it('rings the field with highlight', () => {
    render(<Select label="When it happens" value="Ep 3" highlight />);
    expect(field().className).toBe('sk-tf__control sk-select is-highlight');
  });

  /* jsdom has no popover: the list's top layer is stood in for, as a browser shows it */
  function withPopover(field: Partial<DOMRect>, listHeight: number, run: () => void) {
    const proto = HTMLElement.prototype as HTMLElement & { showPopover?: () => void };
    const had = proto.showPopover, matches = Element.prototype.matches, rect = Element.prototype.getBoundingClientRect;
    const tall = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    const shown = new Set<Element>();
    proto.showPopover = function () { shown.add(this); };
    Element.prototype.matches = function (sel: string) { return sel === ':popover-open' ? shown.has(this) : matches.call(this, sel); };
    Element.prototype.getBoundingClientRect = function () { return this.classList.contains('sk-select') ? ({ ...field, toJSON: () => ({}) } as DOMRect) : rect.call(this); };
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get() { return this.getAttribute('role') === 'listbox' ? listHeight : 0; } });
    try { run(); } finally {
      proto.showPopover = had;
      Element.prototype.matches = matches;
      Element.prototype.getBoundingClientRect = rect;
      if (tall) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', tall);
    }
  }

  it('shows its list in the top layer, at the field and its width, so nothing that clips can cut it off', () => {
    const picked = vi.fn();
    render(<div style={{ overflow: 'hidden' }}><Select label="Folder" options={factions} onChange={picked} /></div>);
    withPopover({ left: 40, top: 100, bottom: 148, width: 300 }, 120, () => {
      press();
      const list = screen.getByRole('listbox');
      expect(list.getAttribute('popover')).toBe('manual');
      expect(list.matches(':popover-open')).toBe(true);
      expect(list.parentElement?.className).toBe('sk-select-wrap');
      expect([list.style.left, list.style.width, list.style.top]).toEqual(['40px', '300px', '148px']);
      expect(list.classList.contains('is-up')).toBe(false);
      fireEvent.click(screen.getByRole('option', { name: /^E\.R\.A\./ }));
      expect(picked).toHaveBeenCalledWith('E.R.A.');
    });
  });

  it('opens over the field when there is more room above it than below', () => {
    render(<Select label="Folder" options={factions} />);
    const h = window.innerHeight;
    withPopover({ left: 0, top: h - 60, bottom: h - 10, width: 300 }, 150, () => {
      press();
      const list = screen.getByRole('listbox');
      expect(list.classList.contains('is-up')).toBe(true);
      expect(list.style.bottom).toBe('60px');
      expect(list.style.top).toBe('');
    });
  });

  it('without popover in the browser, keeps its list under the field', () => {
    render(<Select label="Folder" options={factions} />);
    press();
    const list = screen.getByRole('listbox');
    expect(list.parentElement?.className).toBe('sk-select-wrap');
    expect(list.style.left).toBe('');
  });

  it('a disabled option stays in the list with its reason under its label; the arrows reach it, and Enter or a press picks nothing', () => {
    const change = vi.fn();
    render(<Select label="What it is for" options={[{ label: 'Source still', value: 'a' }, { label: 'Storyboard frame', value: 'b', disabled: true, reason: 'Pro sends 12 storyboard frames, and this clip has 12.' }]} onChange={change} open />);
    const option = screen.getAllByRole('option')[1]; expect(option.textContent).toBe('Storyboard frame, Pro sends 12 storyboard frames, and this clip has 12.');
    expect(option.getAttribute('aria-disabled')).toBe('true');
    expect(option.className).toContain('is-disabled');
    expect(option.querySelector('.sk-select__lines > .sk-select__reason')!.textContent).toBe('Pro sends 12 storyboard frames, and this clip has 12.');
    fireEvent.click(option);
    key('ArrowDown');
    expect(field().getAttribute('aria-activedescendant')).toBe(option.id);
    key('Enter');
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('follows the value the page gives, and shows the placeholder, never the key, for a value it has no option for', () => {
    const worn = [{ label: 'Suit', value: 'SUIT' }, { label: 'Uniform', value: 'UNIFORM' }];
    const thing = [{ label: 'Accessory', value: 'ACCESSORY' }, { label: 'Weapon', value: 'WEAPON' }];
    const { rerender } = render(<Select label="Kind" value="SUIT" options={worn} placeholder="Choose a kind" onChange={() => {}} />);
    expect(screen.getByRole('combobox').textContent).toContain('Suit');
    rerender(<Select label="Kind" value="ACCESSORY" options={thing} placeholder="Choose a kind" onChange={() => {}} />);
    expect(screen.getByRole('combobox').textContent).toContain('Accessory');
    rerender(<Select label="Kind" value="SUIT" options={thing} placeholder="Choose a kind" onChange={() => {}} />);
    expect(screen.getByRole('combobox').textContent).not.toContain('SUIT');
    expect(screen.getByRole('combobox').textContent).toContain('Choose a kind');
  });
});
