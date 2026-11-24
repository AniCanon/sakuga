import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TagList, type TagListProps } from './TagList';

afterEach(() => { cleanup(); vi.useRealTimers(); });
const live = () => document.querySelector('[aria-live="polite"]');

function Vibes(props: Partial<TagListProps>) {
  const [items, set] = useState<TagListProps['items']>(['fire', 'red and black', 'street hero']);
  return <TagList label="Visual vibe" items={items} onRemove={(_, i) => set(items.filter((__, k) => k !== i))} onAdd={(w) => set([...items, w])} {...props} />;
}

describe('TagList', () => {
  it('is a group named by its label; Tab reaches each tag’s button, named "Remove" and the tag', () => {
    render(<Vibes />);
    expect(screen.getByRole('group', { name: 'Visual vibe' }).className).toBe('sk-tags');
    const xs = screen.getAllByRole('button');
    expect(xs.map((b) => b.getAttribute('aria-label'))).toEqual(['Remove fire', 'Remove red and black', 'Remove street hero']);
    xs.forEach((b) => { expect(b.getAttribute('type')).toBe('button'); expect(b.tabIndex).toBe(0); });
    expect(screen.getByRole('group').querySelectorAll('svg')[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('an off tag reads struck through and its button puts it back; removeLabel and restoreLabel change the verb', () => {
    const remove = vi.fn(), restore = vi.fn();
    render(<TagList removeLabel="Leave out" restoreLabel="Put back" onRemove={remove} onRestore={restore} items={[{ label: 'Grey plaid overshirt' }, { label: 'Canvas tote bag', off: true }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Leave out Grey plaid overshirt' }));
    expect(remove).toHaveBeenCalledWith('Grey plaid overshirt', 0);
    const back = screen.getByRole('button', { name: 'Put back Canvas tote bag' });
    expect(back.parentElement!.className).toBe('sk-tag is-off');
    fireEvent.click(back);
    expect(restore).toHaveBeenCalledWith('Canvas tote bag', 1);
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('says each removal and each tag put back through the live region', () => {
    vi.useFakeTimers();
    render(<TagList onRemove={() => {}} onRestore={() => {}} items={[{ label: 'Grey plaid overshirt' }, { label: 'Canvas tote bag', off: true }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Grey plaid overshirt' }));
    act(() => { vi.advanceTimersByTime(200); });
    expect(live()!.textContent).toBe('Grey plaid overshirt removed');
    vi.advanceTimersByTime(1200);
    fireEvent.click(screen.getByRole('button', { name: 'Add back Canvas tote bag' }));
    act(() => { vi.advanceTimersByTime(200); });
    expect(live()!.textContent).toBe('Canvas tote bag added back');
  });

  it('keys each tag by its words: a removed tag\'s button leaves the page once its exit has played, it is not relabelled in place', () => {
    render(<Vibes />);
    vi.useFakeTimers();
    const fire = screen.getByRole('button', { name: 'Remove fire' });
    fireEvent.click(fire);
    /* It leaves first, inert and hidden, with its own words; then it is gone */
    expect(fire.closest('.sk-tag.is-leaving')!.textContent).toBe('fire');
    act(() => { vi.advanceTimersByTime(400); });
    expect(fire.isConnected).toBe(false);
  });

  it('defaults the restore verb to "Add back"', () => {
    render(<TagList items={[{ label: 'Gentle', off: true }]} />);
    expect(screen.getByRole('button', { name: 'Add back Gentle' })).toBeTruthy();
  });

  it('when a removed tag took focus with it, focus goes to the tag now in its place, else the last, else the box', () => {
    render(<Vibes placeholder="Add a vibe…" />);
    const first = screen.getByRole('button', { name: 'Remove fire' });
    first.focus();
    fireEvent.click(first);
    /* A removed button takes focus with it: the page has it again */
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove red and black' }));
    const last = screen.getByRole('button', { name: 'Remove street hero' });
    last.focus();
    fireEvent.click(last);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove red and black' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove red and black' }));
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Add a vibe…' }));
  });

  it('with placeholder a text input, named by inputLabel or the placeholder, hands its words to onAdd on Enter and empties', () => {
    const add = vi.fn();
    const { rerender } = render(<TagList label="Vibe" items={[]} placeholder="Add a vibe…" onAdd={add} />);
    expect(screen.getByRole('group').className).toBe('sk-tags sk-tags--input');
    const box = screen.getByRole('textbox', { name: 'Add a vibe…' }) as HTMLInputElement;
    box.value = '  quiet  ';
    fireEvent.keyDown(box, { key: 'a' });
    expect(add).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(add).toHaveBeenCalledWith('quiet');
    expect(box.value).toBe('');
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(add).toHaveBeenCalledTimes(1);
    rerender(<TagList label="Vibe" items={[]} placeholder="Add a vibe…" inputLabel="New vibe" onAdd={add} />);
    expect(screen.getByRole('textbox', { name: 'New vibe' })).toBeTruthy();
  });

  it('a removed tag leaves before it unmounts, inert and hidden, and focus goes to the tag now in its place', () => {
    vi.useFakeTimers();
    const { container } = render(<Vibes />);
    const x = screen.getByRole('button', { name: 'Remove fire' });
    x.focus();
    fireEvent.click(x);
    x.blur();
    const leaving = container.querySelector('.sk-tag.is-leaving')!;
    expect(leaving.textContent).toBe('fire');
    expect(leaving.getAttribute('aria-hidden')).toBe('true');
    expect(leaving.hasAttribute('inert')).toBe(true);
    act(() => { vi.advanceTimersByTime(400); });
    expect(container.querySelector('.sk-tag.is-leaving')).toBeNull();
    expect([...container.querySelectorAll('.sk-tag')].map((t) => t.firstChild!.textContent)).toEqual(['red and black', 'street hero']);
  });
});
