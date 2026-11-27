import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Timesheet, type TimesheetProps } from './Timesheet';

afterEach(cleanup);

const spans: TimesheetProps['spans'] = [{ start: 0, end: 120, label: 'Video 3', detail: 'opens on the board' }, { start: 120, end: 216, label: 'Video 4' }];

describe('Timesheet', () => {
  it('is a group named Videos to make by default, its label and note read as text, and nothing is focusable', () => {
    const { container } = render(<Timesheet seconds={9} spans={spans} note="Keys are the frames a video starts and ends on" className="x" />);
    const g = screen.getByRole('group', { name: 'Videos to make' });
    expect(g.className).toBe('sk-tsheet x');
    expect(g.querySelector('.sk-tsheet__top')!.textContent).toBe('Videos to makeKeys are the frames a video starts and ends on');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('a key frame says its frame, and each video line says its frames', () => {
    render(<Timesheet seconds={9} spans={spans} keys={[{ at: 10, label: '1' }, { at: 120, label: '2' }]} label="Cut 2B" />);
    const g = screen.getByRole('group', { name: 'Cut 2B' });
    expect([...g.querySelectorAll('.sk-tsheet__key')].map((k) => k.textContent)).toEqual(['1, at frame 10', '2, at frame 120']);
    const lines = g.querySelector('.sk-tsheet__labels')!;
    expect([...lines.children].map((l) => l.textContent)).toEqual(['Video 3 · opens on the board, frames 0 to 120', 'Video 4, frames 120 to 216']);
    expect((lines as HTMLElement).style.gridTemplateColumns).toBe('120fr 96fr');
  });

  it('lays out a frame grid at 24 a second, a tick on each whole second inside the strip, the brackets in proportion', () => {
    const { container } = render(<Timesheet seconds={3} spans={[{ start: 0, end: 36, label: 'V' }]} keys={[{ at: 18, label: 'k' }]} />);
    const ticks = [...container.querySelectorAll('.sk-tsheet__grid > i')] as HTMLElement[];
    // The strip's two ends are its first and last frames, so only the seconds between them are ticked
    expect(ticks.map((t) => [t.className, t.style.left])).toEqual([['is-second', `${24 / 72 * 100}%`], ['is-second', `${48 / 72 * 100}%`]]);
    const span = container.querySelector('.sk-tsheet__span') as HTMLElement;
    expect([span.style.left, span.style.width]).toEqual(['0%', '50%']);
    expect((container.querySelector('.sk-tsheet__key') as HTMLElement).style.left).toBe('25%');
  });

  it('a key on the first or last frame sits inside the strip, its line on the frame, and one past the end is held at it', () => {
    const { container } = render(<Timesheet seconds={2} spans={[{ start: 0, end: 48, label: 'V' }]} keys={[{ at: 0, label: '1' }, { at: 24, label: '2' }, { at: 48, label: '3' }, { at: 60, label: '4' }]} />);
    const keys = [...container.querySelectorAll('.sk-tsheet__key')] as HTMLElement[];
    expect(keys.map((k) => [k.className, k.style.left])).toEqual([
      ['sk-tsheet__key is-start', '0%'], ['sk-tsheet__key', '50%'], ['sk-tsheet__key is-end', '100%'], ['sk-tsheet__key is-end', '100%']]);
    // Said at the frame it names
    expect(keys[3].textContent).toBe('4, at frame 60');
  });
});
