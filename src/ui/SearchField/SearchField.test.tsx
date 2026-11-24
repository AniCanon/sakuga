import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchField, type SearchFieldProps } from './SearchField';

afterEach(cleanup);

const ALL: NonNullable<SearchFieldProps['results']> = [
  { title: 'Characters', options: [{ label: 'Kiko', hint: 'E.R.A.', initial: 'K' }, { label: 'Ken', hint: 'Heros', initial: 'K' }] },
  { title: 'Places', options: [{ label: 'Kioto Station', icon: 'place' }] },
];
const filter = (t: string) => ALL.map((g) => ({ title: g.title, options: g.options.filter((o) => t && o.label.toLowerCase().startsWith(t.toLowerCase())) })).filter((g) => g.options.length);

function Live(props: Partial<SearchFieldProps>) {
  const [t, setT] = useState(props.value ?? '');
  return <SearchField label="Search the series" {...props} value={t} results={filter(t)} onChange={setT} />;
}

describe('SearchField', () => {
  it('is a search landmark named by label, holding a search field of the same name; Search when left out; the icon is hidden', () => {
    render(<><SearchField label="Search the library" /><SearchField /></>);
    const mark = screen.getByRole('search', { name: 'Search the library' });
    const field = screen.getByRole('searchbox', { name: 'Search the library' });
    expect(mark.contains(field)).toBe(true);
    expect(mark.querySelector('.sk-icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeTruthy();
  });

  it('shows Clear search once there are words; it empties the field, calls onClear and gives focus back to the field', () => {
    const cleared = vi.fn(), typed = vi.fn();
    render(<SearchField label="Search the library" onClear={cleared} onChange={typed} />);
    const field = screen.getByRole('searchbox') as HTMLInputElement;
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    fireEvent.change(field, { target: { value: 'rooftop chase' } });
    expect(typed).toHaveBeenLastCalledWith('rooftop chase');
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(field.value).toBe('');
    expect(cleared).toHaveBeenCalledTimes(1);
    expect(typed).toHaveBeenLastCalledWith('');
    expect(document.activeElement).toBe(field);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('follows value when the page changes it', () => {
    const { rerender } = render(<SearchField value="Ki" />);
    rerender(<SearchField value="Sé" />);
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('Sé');
  });

  it('without results, Enter hands the words to onSubmit', () => {
    const sent = vi.fn();
    render(<SearchField value="rooftop" onSubmit={sent} />);
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });
    expect(sent).toHaveBeenCalledWith('rooftop');
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('with results, the field is a combobox whose active descendant Up and Down move; Enter chooses the active result and closes', () => {
    const chosen = vi.fn(), sent = vi.fn();
    render(<Live value="K" onSelect={chosen} onSubmit={sent} />);
    const field = screen.getByRole('combobox', { name: 'Search the series' });
    const list = screen.getByRole('listbox', { name: 'Search the series results' });
    expect(field.getAttribute('aria-controls')).toBe(list.id);
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(field.getAttribute('aria-autocomplete')).toBe('list');
    expect(screen.getByRole('group', { name: 'Characters' })).toBeTruthy();
    expect(field.hasAttribute('aria-activedescendant')).toBe(false);
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(field.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Kiko E.R.A.' }).id);
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(field.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Kioto Station' }).id);
    fireEvent.keyDown(field, { key: 'ArrowUp' });
    expect(field.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Ken Heros' }).id);
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(chosen).toHaveBeenCalledWith(expect.objectContaining({ label: 'Ken' }));
    expect(sent).not.toHaveBeenCalled();
    expect(field.getAttribute('aria-expanded')).toBe('false');
    expect(field.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('Up first goes to the last result, and Up or Down opens closed results', () => {
    render(<Live value="K" open={false} />);
    const field = screen.getByRole('combobox');
    expect(field.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.keyDown(field, { key: 'ArrowUp' });
    expect(field.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(field, { key: 'ArrowUp' });
    expect(field.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Kioto Station' }).id);
  });

  it('a click chooses a result', () => {
    const chosen = vi.fn();
    render(<Live value="Kio" onSelect={chosen} />);
    fireEvent.click(screen.getByRole('option', { name: 'Kioto Station' }));
    expect(chosen).toHaveBeenCalledWith(expect.objectContaining({ label: 'Kioto Station' }));
  });

  it('Escape closes the results, then clears the words, then calls onClose', () => {
    const closed = vi.fn();
    render(<Live value="K" onClose={closed} />);
    const field = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field.getAttribute('aria-expanded')).toBe('false');
    expect(field.value).toBe('K');
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field.value).toBe('');
    expect(closed).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('one status line says how many results there are, that it is searching, or emptyText', () => {
    const { rerender } = render(<SearchField value="K" results={filter('K')} />);
    expect(screen.getByRole('status').textContent).toBe('3 results');
    rerender(<SearchField value="Kio" results={filter('Kio')} />);
    expect(screen.getByRole('status').textContent).toBe('1 result');
    rerender(<SearchField value="Sé" results={[]} busy />);
    expect(screen.getByRole('status').textContent).toBe('Searching');
    expect(screen.getByRole('listbox').getAttribute('aria-busy')).toBe('true');
    rerender(<SearchField value="Sé" results={[]} busy busyText="Looking in the series" />);
    expect(screen.getByRole('status').textContent).toBe('Looking in the series');
    rerender(<SearchField value="Zubat" results={[]} />);
    expect(screen.getByRole('status').textContent).toBe('Nothing matches');
    rerender(<SearchField value="Zubat" results={[]} emptyText="Nothing in this series matches" />);
    expect(screen.getByRole('status').textContent).toBe('Nothing in this series matches');
    expect(document.querySelectorAll('[role="status"]').length).toBe(1);
    expect(document.querySelector('.sk-search__said')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('says nothing while its results are closed, and a press outside closes them', () => {
    render(<><Live value="K" /><button type="button">Elsewhere</button></>);
    expect(screen.getByRole('status').textContent).toBe('3 results');
    act(() => { fireEvent.pointerDown(screen.getByRole('button', { name: 'Elsewhere' })); });
    expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('with autoFocus, takes focus as it appears', () => {
    render(<SearchField autoFocus label="Search AniCanon" />);
    expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Search AniCanon' }));
  });
});
