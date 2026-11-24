import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DropZone } from './DropZone';

const live = () => document.querySelector('[aria-live="polite"]');

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('DropZone', () => {
  it('filled with a picture it is a group named by its title showing that picture, its Remove a button of its own', () => {
    const onRemove = vi.fn();
    const { container, rerender } = render(<DropZone state="filled" title="front.jpg" image="front.jpg" alt="The front" onRemove={onRemove} />);
    const group = screen.getByRole('group', { name: 'front.jpg' });
    expect(group.className).toBe('sk-drop sk-drop--picture');
    expect(screen.queryByRole('button', { name: /front\.jpg added/ })).toBeNull();
    expect(container.querySelector('img')!.getAttribute('alt')).toBe('The front');
    fireEvent.click(screen.getByRole('button', { name: 'Remove front.jpg' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    rerender(<DropZone state="filled" image="front.jpg" onRemove={onRemove} removeLabel="Take it out" />);
    expect(screen.getByRole('button', { name: 'Take it out' })).toBeTruthy();
    rerender(<DropZone state="filled" image="front.jpg" onRemove={onRemove} />);
    expect(screen.getByRole('button', { name: 'Remove the picture' })).toBeTruthy();
    rerender(<DropZone state="filled" title="front.jpg" />);
    expect(screen.getByRole('button', { name: 'front.jpg added' })).toBeTruthy();
  });

  it('is a button Tab reaches, named by its title and hint, the icon hidden', () => {
    const { container } = render(<DropZone title="Drop a clip, or choose a file" hint="Audio or video · up to 30 seconds" />);
    const b = screen.getByRole('button', { name: 'Drop a clip, or choose a file Audio or video · up to 30 seconds' });
    expect(b.tabIndex).toBe(0);
    expect(b.className).toBe('sk-drop sk-drop--empty');
    expect(container.querySelector('.sk-drop__icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it('says added once filled', () => {
    render(<DropZone state="filled" title="front.jpg" />);
    expect(screen.getByRole('button', { name: 'front.jpg added' }).className).toBe('sk-drop sk-drop--filled');
  });

  it('while busy carries aria-busy and says its title and hint once through the live region; its loader stays quiet', () => {
    const { rerender } = render(<DropZone title="Drop a clip" />);
    act(() => { vi.advanceTimersByTime(1200); });
    expect(live()?.textContent ?? '').toBe('');
    rerender(<DropZone state="busy" title="Extracting the audio" hint="hero-shout.mp4" />);
    act(() => { vi.advanceTimersByTime(1200); });
    const b = screen.getByRole('button', { name: 'Extracting the audio hero-shout.mp4' });
    expect(b.getAttribute('aria-busy')).toBe('true');
    expect(b.querySelector('.sk-load')).toBeTruthy();
    expect(live()!.textContent).toBe('Extracting the audio hero-shout.mp4');
  });

  it('with onFiles a press opens the file chooser after onClick, which can prevent it', () => {
    const files = vi.fn(), chooser = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => undefined);
    const { rerender } = render(<DropZone title="Add a picture" onFiles={files} accept="image/*" multiple />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.hidden).toBe(true);
    expect(input.tabIndex).toBe(-1);
    expect(input.accept).toBe('image/*');
    expect(input.multiple).toBe(true);
    fireEvent.click(screen.getByRole('button'));
    expect(chooser).toHaveBeenCalledTimes(1);
    rerender(<DropZone title="Add a picture" onFiles={files} onClick={(e) => e.preventDefault()} />);
    fireEvent.click(screen.getByRole('button'));
    expect(chooser).toHaveBeenCalledTimes(1);
    chooser.mockRestore();
  });

  it('a drop, or the chooser, hands the files over', () => {
    const files = vi.fn();
    render(<DropZone title="Add a clip" onFiles={files} />);
    const f = new File(['x'], 'take.mp4', { type: 'video/mp4' });
    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [f] } });
    expect(files).toHaveBeenCalledWith([f]);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [f] } });
    expect(files).toHaveBeenCalledTimes(2);
  });
});
