import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MakiComposer } from './MakiComposer';

afterEach(cleanup);

describe('MakiComposer', () => {
  it('Tab reaches the field (named "Message to Maki"), Attach, then Send; Send waits for words', () => {
    const onSend = vi.fn();
    render(<MakiComposer onSend={onSend} />);
    const field = screen.getByRole('textbox', { name: 'Message to Maki' });
    const send = screen.getByRole('button', { name: 'Send' });
    expect(screen.getByRole('button', { name: 'Attach' })).toBeTruthy();
    expect(send.hasAttribute('disabled')).toBe(true);
    fireEvent.change(field, { target: { value: 'Why?' } });
    expect(send.hasAttribute('disabled')).toBe(false);
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('Why?');
  });

  it('while Maki writes Send becomes Stop; the cost sits beside it; the hint is a quiet line under the container', () => {
    const onStop = vi.fn();
    const { container } = render(<MakiComposer writing onStop={onStop} cost={12} hint="Reviewing is free." />);
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onStop).toHaveBeenCalled();
    expect(container.querySelector('.sk-mk-composer__cost')!.textContent).toBe('12 a reply');
    expect(container.querySelector('.sk-mk-composer__hint')!.textContent).toBe('Reviewing is free.');
  });

  it('context is a group "Asking about" inside the container', () => {
    const { container } = render(<MakiComposer context={<span>Kiko</span>} />);
    const g = screen.getByRole('group', { name: 'Asking about' });
    expect(g.closest('.sk-mk-composer__box')).toBe(container.querySelector('.sk-mk-composer__box'));
  });

  it('files are their own group "Attached" after the context: each its name, "Adding…" while it uploads, then Picture or Video, and Remove', () => {
    const onRemoveFile = vi.fn();
    const files = [{ id: 'a', name: 'lighthouse.png', image: 'l.png' }, { id: 'b', name: 'storm.mp4', kind: 'video' as const }, { id: 'c', name: 'map.jpg', adding: true }];
    render(<MakiComposer context={<span>Kiko</span>} files={files} onRemoveFile={onRemoveFile} />);
    const groups = screen.getAllByRole('group').map((g) => g.getAttribute('aria-label'));
    expect(groups.indexOf('Attached')).toBeGreaterThan(groups.indexOf('Asking about'));
    const attached = screen.getByRole('group', { name: 'Attached' });
    expect(attached.textContent).toContain('lighthouse.png');
    expect(attached.textContent).toContain('Picture');
    expect(attached.textContent).toContain('Video');
    expect(attached.textContent).toContain('Adding…');
    expect(attached.querySelector('[aria-busy="true"]')!.textContent).toContain('map.jpg');
    fireEvent.click(screen.getByRole('button', { name: 'Remove storm.mp4' }));
    expect(onRemoveFile).toHaveBeenCalledWith(files[1]);
  });

  it('no files, no "Attached"; @ calls the page\'s onMention when it has one', () => {
    const onMention = vi.fn();
    render(<MakiComposer mentions={{ cast: [] }} onMention={onMention} />);
    expect(screen.queryByRole('group', { name: 'Attached' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mention someone or something' }));
    expect(onMention).toHaveBeenCalled();
  });

  it('@ lists the cast by what helps pick them, never their outfits: a role, or nothing; one with no portrait shows their age figure', async () => {
    if (!Range.prototype.getBoundingClientRect) Range.prototype.getBoundingClientRect = () => new DOMRect();
    if (!Range.prototype.getClientRects) Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;
    const onChange = vi.fn();
    const mentions = { cast: [
      { id: 'mio', name: 'Mio Arata', image: 'm.png', hint: 'Harbor Watch · lead', outfits: [{ id: 'a', label: 'rain coat' }, { id: 'b', label: 'uniform' }] },
      { id: 'kaito', name: 'Kaito Arata', figure: 'age-child' as const },
    ] };
    const { rerender } = render(<MakiComposer mentions={mentions} value="" onChange={onChange} />);
    const field = () => screen.getByRole('textbox', { name: 'Message to Maki' });
    act(() => field().focus());
    rerender(<MakiComposer mentions={mentions} value="@" onChange={onChange} />);
    await act(async () => undefined);
    const rows = screen.getAllByRole('option');
    expect(rows.map((o) => o.textContent)).toEqual(['Mio ArataHarbor Watch · lead', 'Kaito Arata']);
    expect(rows[1].querySelector('.sk-picker__face')).toBeTruthy();
    // Choosing someone never asks which outfit they wear
    await act(async () => { fireEvent.keyDown(field(), { key: 'Enter' }); });
    expect(screen.queryByRole('listbox', { name: 'Outfit for Mio Arata' })).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith('@[Mio Arata:character:mio] ');
  });
});
