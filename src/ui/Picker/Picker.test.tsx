import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Picker, type PickerProps } from './Picker';

/* jsdom lays nothing out: every control counts as shown, as it would on a page */
beforeEach(() => { vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const groups: PickerProps['groups'] = [
  { title: 'Matches', options: [{ label: 'Kiko', hint: 'E.R.A. · at Sé station', initial: 'K' }, { label: 'Ken', hint: 'Heros', initial: 'K', dim: true }] },
  { title: 'Already at Sé station', options: [{ label: 'Smith', hint: 'At Sé station', initial: 'S', selected: true }] },
];

function open(props: Partial<PickerProps> = {}) {
  const opener = document.createElement('button');
  document.body.append(opener);
  opener.focus();
  return render(<Picker groups={groups} onClose={() => undefined} {...props} />);
}

describe('Picker', () => {
  it('passes align to its Popover, lined up with that edge, and marks its surface as a picker', () => {
    render(<Picker label="Use in Studio" align="start" groups={groups} />);
    const surface = screen.getByRole('dialog', { name: 'Use in Studio' });
    expect(surface.classList.contains('sk-picker')).toBe(true);
    expect(surface.classList.contains('is-start')).toBe(true);
  });

  it('puts id on its surface, so the control that opens it names it in aria-controls', () => {
    render(<><button type="button" aria-controls="series-picker">Series</button><Picker id="series-picker" label="Your series" groups={groups} /></>);
    expect(screen.getByRole('dialog', { name: 'Your series' }).id).toBe('series-picker');
  });

  it('is a dialog whose options are a listbox named by label, Options when left out, in their groups', () => {
    render(<><Picker label="Add someone" groups={groups} /><Picker groups={[{ options: [{ label: 'Lisbon' }] }]} /></>);
    expect(screen.getByRole('dialog', { name: 'Add someone' })).toBeTruthy();
    const list = screen.getByRole('listbox', { name: 'Add someone' });
    expect(within(list).getByRole('group', { name: 'Matches' })).toBeTruthy();
    expect(screen.getByRole('listbox', { name: 'Options' })).toBeTruthy();
  });

  it('each option reads its label, hint, out of reach and disabled when dim, and selected', () => {
    render(<Picker groups={groups} />);
    const kiko = screen.getByRole('option', { name: 'Kiko E.R.A. · at Sé station', selected: false });
    expect(kiko.hasAttribute('aria-disabled')).toBe(false);
    const ken = screen.getByRole('option', { name: 'Ken Heros , out of reach' });
    expect(ken.className).toBe('sk-picker__opt is-dim');
    expect(ken.getAttribute('aria-disabled')).toBe('true');
    const smith = screen.getByRole('option', { name: 'Smith At Sé station', selected: true });
    expect(smith.querySelector('.sk-icon')).toBeTruthy();
    expect(smith.querySelector('.sk-picker__initial')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('with search, the field is a combobox named Search; focus stays in it while Up and Down move the active option, Enter chooses, never a dim one', () => {
    const chosen = vi.fn(), typed = vi.fn();
    open({ search: { value: 'K', onChange: typed }, onSelect: chosen });
    const field = screen.getByRole('combobox', { name: 'Search' }) as HTMLInputElement;
    expect(field.value).toBe('K');
    expect(field.getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(field.getAttribute('aria-autocomplete')).toBe('list');
    fireEvent.change(field, { target: { value: 'Ki' } });
    expect(typed).toHaveBeenCalledWith('Ki');
    field.focus();
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    const ken = screen.getByRole('option', { name: /^Ken/ });
    expect(field.getAttribute('aria-activedescendant')).toBe(ken.id);
    expect(ken.className).toContain('is-active');
    expect(document.activeElement).toBe(field);
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(chosen).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'ArrowUp' }); fireEvent.keyDown(field, { key: 'ArrowUp' });
    expect(field.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: /^Kiko/ }).id);
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(chosen).toHaveBeenCalledWith(groups[0].options[0]);
  });

  it('without search.onChange the field filters nothing, so it says no list completion', () => {
    open({ search: { defaultValue: 'K' } });
    expect(screen.getByRole('combobox', { name: 'Search' }).getAttribute('aria-autocomplete')).toBe('none');
  });

  it('names the search field by search.label', () => {
    render(<Picker search={{ label: 'Find a place', placeholder: 'Places' }} groups={groups} />);
    expect(screen.getByRole('combobox', { name: 'Find a place' })).toBeTruthy();
  });

  it('without search, the options are one Tab stop that Up and Down move through, passing over a dim one, Enter or Space choosing', () => {
    const chosen = vi.fn();
    open({ onSelect: chosen });
    const opts = screen.getAllByRole('option');
    expect(opts.map((o) => o.tabIndex)).toEqual([-1, -1, 0]);
    opts[2].focus();
    fireEvent.keyDown(opts[2], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(opts[0]);
    fireEvent.keyDown(opts[1], { key: 'Enter' });
    fireEvent.keyDown(opts[0], { key: 'Enter' });
    fireEvent.keyDown(opts[0], { key: 'End' });
    fireEvent.keyDown(opts[2], { key: ' ' });
    expect(chosen.mock.calls.map((c) => c[0].label)).toEqual(['Kiko', 'Smith']);
  });

  it('a click chooses, not on a dim option, and with onClose Escape closes it', () => {
    const chosen = vi.fn(), closed = vi.fn();
    open({ onSelect: chosen, onClose: closed });
    fireEvent.click(screen.getByRole('option', { name: /^Ken/ }));
    expect(chosen).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('option', { name: /^Kiko/ }));
    expect(chosen).toHaveBeenCalledWith(groups[0].options[0]);
    fireEvent.keyDown(screen.getAllByRole('option')[2], { key: 'Escape' });
    expect(closed).toHaveBeenCalled();
  });

  it('with onClose it takes focus, on the search field when there is one', () => {
    open({ search: {} });
    expect(document.activeElement).toBe(screen.getByRole('combobox'));
  });

  it('without search it takes focus on the options\' one Tab stop, and closing gives focus back to what opened it', () => {
    function Opener() {
      const [on, set] = useState(false);
      return <><button type="button" onClick={() => set(true)}>Add someone</button>{on && <Picker groups={groups} onClose={() => set(false)} />}</>;
    }
    render(<Opener />);
    const opener = screen.getByRole('button', { name: 'Add someone' });
    opener.focus();
    fireEvent.click(opener);
    const stop = screen.getAllByRole('option').find((o) => o.tabIndex === 0)!;
    expect(document.activeElement).toBe(stop);
    fireEvent.keyDown(stop, { key: 'Escape' });
    expect(document.activeElement).toBe(opener);
  });

  it('draws a picture per option: a place, a round portrait, a picture the product passes as media, or an icon', () => {
    const { container } = render(<Picker groups={[{ options: [{ label: 'Sé', image: 'se.jpg' }, { label: 'Kiko', image: 'kiko.jpg', shape: 'round' }, { label: 'Twist', media: <svg className="mine" /> }, { label: 'Rain', icon: 'weather-rain' }] }]} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs[0].className).toBe('');
    expect(imgs[1].className).toBe('is-round');
    const slots = container.querySelectorAll('.sk-picker__slot');
    expect(slots[0].firstElementChild!.getAttribute('class')).toBe('mine');
    expect(slots[1].querySelector('.sk-icon')).toBeTruthy();
  });
});

it('passes controlled search updates and uncontrolled defaults through TextField', () => {
  const change = vi.fn();
  const { rerender, unmount } = render(<Picker open groups={groups} search={{value:'K', onChange:change}} />);
  const field = screen.getByRole('combobox') as HTMLInputElement;
  rerender(<Picker open groups={groups} search={{value:'Smith', onChange:change}} />);
  expect(field.value).toBe('Smith');
  unmount();
  render(<Picker open groups={groups} search={{defaultValue:'K'}} />);
  const own = screen.getByRole('combobox') as HTMLInputElement;
  fireEvent.change(own, {target:{value:'Ki'}});
  expect(own.value).toBe('Ki');
});

it('an option with placeholder keeps the picture’s place with Thumb’s placeholder at the image size; an image wins over it', () => {
  render(<Picker open groups={[{ options: [{ label: 'Kitten’s World', placeholder: 'K' }, { label: 'EBA', image: '/eba.jpg', placeholder: 'E' }] }]} />);
  const [kw, eba] = screen.getAllByRole('option');
  const ph = kw.querySelector('.sk-thumb.is-placeholder') as HTMLElement;
  expect(ph.textContent).toBe('K');
  expect(ph.style.width).toBe('var(--picker-opt-img-width)');
  expect(ph.style.height).toBe('var(--picker-opt-img-height)');
  expect(eba.querySelector('.sk-thumb')).toBeNull();
  expect(eba.querySelector('img')!.getAttribute('src')).toBe('/eba.jpg');
});

describe('Picker levels', () => {
  const places: PickerProps['groups'] = [{ title: 'Places', options: [{ label: 'Kagari Lighthouse', hint: '6 views', opens: true }, { label: 'Low Harbor', hint: '1 view · The quay at dusk' }] }];
  const views: PickerProps['groups'] = [{ options: [{ label: 'Fresnel Lens Mechanism' }, { label: 'Keeper’s Watch Room' }] }];

  it('an option with opens ends in a chevron; Right on it, as Enter, hands it to onSelect', () => {
    const select = vi.fn();
    open({ groups: places, onSelect: select });
    const [lighthouse, harbor] = screen.getAllByRole('option');
    expect(lighthouse.classList.contains('is-opens')).toBe(true);
    expect(lighthouse.querySelector('.sk-picker__opens')).toBeTruthy();
    expect(harbor.querySelector('.sk-picker__opens')).toBeNull();
    fireEvent.keyDown(lighthouse, { key: 'ArrowRight' });
    expect(select).toHaveBeenLastCalledWith(places[0].options[0]);
    fireEvent.keyDown(harbor, { key: 'ArrowRight' });
    expect(select).toHaveBeenCalledTimes(1);
  });

  it('with search, Right on an active option that opens chooses it once the caret is at the end', () => {
    const select = vi.fn();
    open({ groups: places, onSelect: select, search: { value: '' } });
    const field = screen.getByRole('combobox');
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'ArrowRight' });
    expect(select).toHaveBeenLastCalledWith(places[0].options[0]);
  });

  it('a level shows Back to the level it came from and its title; Back, Left and Backspace in an empty search call onBack', () => {
    const back = vi.fn();
    const { unmount } = open({ groups: views, back: { to: 'Places', title: 'Kagari Lighthouse', onBack: back } });
    expect(screen.getByText('Kagari Lighthouse').className).toBe('sk-picker__title');
    fireEvent.click(screen.getByRole('button', { name: 'Back to Places' }));
    fireEvent.keyDown(screen.getAllByRole('option')[0], { key: 'ArrowLeft' });
    expect(back).toHaveBeenCalledTimes(2);
    unmount();
    open({ groups: views, search: { value: '' }, back: { to: 'Places', title: 'Kagari Lighthouse', onBack: back } });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Backspace' });
    expect(back).toHaveBeenCalledTimes(3);
  });

  it('opens a level on its first option and, going back, on the option that opened it', () => {
    function Levels() {
      const [place, setPlace] = useState<string | null>(null);
      return <Picker onClose={() => undefined} groups={place ? views : places} back={place ? { to: 'Places', title: place, onBack: () => setPlace(null) } : undefined} onSelect={(o) => o.opens && setPlace(o.label)} />;
    }
    render(<Levels />);
    const lighthouse = screen.getAllByRole('option')[0];
    lighthouse.focus();
    fireEvent.keyDown(lighthouse, { key: 'ArrowRight' });
    expect(document.activeElement!.textContent).toBe('Fresnel Lens Mechanism');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(document.activeElement!.textContent).toContain('Kagari Lighthouse');
  });
});
