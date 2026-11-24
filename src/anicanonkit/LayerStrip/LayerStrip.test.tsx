import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LayerStrip, type LayerStripProps } from './LayerStrip';

afterEach(cleanup);

const tracks: LayerStripProps['tracks'] = [
  { kind: 'panels', label: 'Panels', items: [{ number: '3.1', image: 'p.jpg', selected: true }, { number: '3.2' }, { number: '3.3' }] },
  { kind: 'lettering', label: 'Lettering', items: [{ number: '3.1', label: 'Caption · I’m Bruce' }, { number: '3.2', label: 'Sign', muted: true }] },
  { kind: 'sfx', label: 'Sound effects', items: [] },
];

describe('LayerStrip', () => {
  it('without onSelect each track reads its name and count, then a list whose selected item reads current', () => {
    const { container } = render(<LayerStrip tracks={tracks} className="x" />);
    expect(container.firstElementChild!.className).toBe('sk-layers x');
    const heads = [...container.querySelectorAll('.sk-layers__head')];
    expect(heads.map((h) => h.textContent)).toEqual(['Panels3', 'Lettering2', 'Sound effects0']);
    const panels = screen.getByRole('list', { name: 'Panels' });
    const items = within(panels).getAllByRole('listitem');
    expect(items[0].getAttribute('aria-current')).toBe('true');
    expect(items[0].className).toBe('sk-layers__item is-selected');
    expect(items[1].getAttribute('aria-current')).toBeNull();
    expect(items[0].querySelector('img')!.getAttribute('alt')).toBe('');
    expect(items[1].querySelector('.sk-layers__empty')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0);
  });

  it('each layer reads its number and label, "drawn into the art" when muted; an empty track reads None yet or emptyLabel', () => {
    const { container, rerender } = render(<LayerStrip tracks={tracks} />);
    const letters = within(screen.getByRole('list', { name: 'Lettering' })).getAllByRole('listitem');
    expect(letters.map((l) => l.textContent)).toEqual(['3.1Caption · I’m Bruce', '3.2Sign, drawn into the art']);
    expect(letters[1].className).toBe('sk-layers__item is-muted');
    expect(letters[0].querySelector('img, .sk-layers__empty')).toBeNull();
    expect(container.querySelector('.sk-layers__none')!.textContent).toBe('None yet');
    rerender(<LayerStrip tracks={tracks} emptyLabel="No sound effects" />);
    expect(container.querySelector('.sk-layers__none')!.textContent).toBe('No sound effects');
  });

  it('children sit on top', () => {
    const { container } = render(<LayerStrip tracks={tracks}><span className="kid">strip</span></LayerStrip>);
    expect(container.querySelector('.sk-layers__top')!.firstElementChild!.className).toBe('kid');
    cleanup();
    const bare = render(<LayerStrip tracks={tracks} />);
    expect(bare.container.querySelector('.sk-layers__top')).toBeNull();
  });

  it('with onSelect each track is a listbox, one Tab stop that Left and Right move through, and Enter, Space or a click choose', () => {
    const onSelect = vi.fn();
    render(<LayerStrip tracks={tracks} onSelect={onSelect} />);
    const box = screen.getByRole('listbox', { name: 'Panels' });
    expect(box.getAttribute('aria-orientation')).toBe('horizontal');
    const opts = within(box).getAllByRole('option');
    expect(opts.map((o) => o.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(opts.map((o) => o.tabIndex)).toEqual([0, -1, -1]);
    act(() => opts[0].focus());
    fireEvent.keyDown(opts[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(opts[1]);
    fireEvent.keyDown(opts[1], { key: 'Enter' });
    fireEvent.keyDown(opts[1], { key: ' ' });
    fireEvent.click(opts[2]);
    const second = within(screen.getByRole('listbox', { name: 'Lettering' })).getAllByRole('option');
    fireEvent.click(second[1]);
    expect(onSelect.mock.calls).toEqual([[0, 1], [0, 1], [0, 2], [1, 1]]);
    expect(within(screen.getByRole('listbox', { name: 'Lettering' })).getAllByRole('option').map((o) => o.tabIndex)).toEqual([0, -1]);
  });
});
