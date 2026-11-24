import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

afterEach(cleanup);

const sections = [{ label: 'Episodes' }, { label: 'Shorts' }, { label: 'Cast' }, { label: 'World' }];

function Demo({ onChange }: { onChange?: (v: string) => void }) {
  const [v, set] = useState('Episodes');
  return <SegmentedControl label="Series sections" value={v} options={sections} onChange={(x) => { set(x); onChange?.(x); }} />;
}

/* A pointer event jsdom can dispatch: its MouseEvent carries the position, the id is added */
function pointer(type: string, target: EventTarget, x: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 10, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  act(() => { target.dispatchEvent(e); });
}

describe('SegmentedControl', () => {
  it('is a group named by its label, each option a button, pressed when selected', () => {
    render(<SegmentedControl label="Feed" value="For you" options={[{ label: 'Following' }, { label: 'For you' }]} />);
    const g = screen.getByRole('group', { name: 'Feed' });
    expect(g.className).toBe('sk-seg');
    expect(screen.getByRole('button', { name: 'For you', pressed: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Following', pressed: false }).getAttribute('type')).toBe('button');
    expect(g.querySelector(':scope > .sk-glide')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('Tab reaches each option, and a press (Enter or Space arrive as a click) picks it', () => {
    const changed = vi.fn();
    render(<Demo onChange={changed} />);
    const shorts = screen.getByRole('button', { name: 'Shorts' });
    expect(shorts.tabIndex).toBe(0);
    fireEvent.click(shorts);
    expect(changed).toHaveBeenCalledWith('Shorts');
    expect(screen.getByRole('button', { name: 'Shorts', pressed: true })).toBeTruthy();
  });

  it('chooses by value when options carry one', () => {
    const changed = vi.fn();
    render(<SegmentedControl label="Story Map mode" value="free" onChange={changed} options={[{ label: 'Story Map', value: 'map' }, { label: 'Free', value: 'free' }]} />);
    expect(screen.getByRole('button', { name: 'Free', pressed: true })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Story Map' }));
    expect(changed).toHaveBeenCalledWith('map');
  });

  it('fills its width with fullWidth', () => {
    render(<SegmentedControl label="Feed" value="a" fullWidth options={[{ label: 'a' }, { label: 'b' }]} />);
    expect(screen.getByRole('group').className).toBe('sk-seg sk-seg--full');
  });

  describe('sliding the pill', () => {
    beforeEach(() => {
      /* Four 100px segments in a row */
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
      vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
        return this.parentElement ? Array.prototype.indexOf.call(this.parentElement.querySelectorAll(':scope > button'), this) * 100 : 0;
      });
    });
    afterEach(() => vi.restoreAllMocks());

    it('moves to the segment under the pointer and chooses it on release, swallowing the click', () => {
      const changed = vi.fn();
      render(<Demo onChange={changed} />);
      const g = screen.getByRole('group'), episodes = screen.getByRole('button', { name: 'Episodes' });
      pointer('pointerdown', episodes, 50);
      pointer('pointermove', window, 260);
      expect(g.className).toContain('is-dragging');
      expect(screen.getByRole('button', { name: 'Cast' }).className).toBe('is-under');
      pointer('pointerup', window, 260);
      fireEvent.click(episodes);
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed).toHaveBeenCalledWith('Cast');
      expect(g.className).not.toContain('is-dragging');
      expect(screen.getByRole('button', { name: 'Cast', pressed: true }).className).toBe('');
    });

    it('only slides from the selected pill, and not without onChange', () => {
      render(<><Demo /><SegmentedControl label="Still" value="a" options={[{ label: 'a' }, { label: 'b' }]} /></>);
      pointer('pointerdown', screen.getByRole('button', { name: 'Shorts' }), 150);
      pointer('pointermove', window, 350);
      expect(screen.getByRole('group', { name: 'Series sections' }).className).not.toContain('is-dragging');
      pointer('pointerup', window, 350);
      pointer('pointerdown', screen.getByRole('button', { name: 'a' }), 50);
      pointer('pointermove', window, 150);
      expect(screen.getByRole('group', { name: 'Still' }).className).not.toContain('is-dragging');
      pointer('pointerup', window, 150);
    });
  });

  it('media floats over a picture or video, on the same surface as IconButton media', () => {
    const { container } = render(<SegmentedControl label="Feed" variant="media" value="For you" options={[{ label: 'Following' }, { label: 'For you' }]} />);
    expect((container.firstChild as HTMLElement).className).toBe('sk-seg sk-seg--glass');
  });
});
