import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProgramBar, type ProgramBarProps } from './ProgramBar';

afterEach(cleanup);

const sections: ProgramBarProps['sections'] = [
  { label: '#1', start: 0, length: 110 },
  { label: '#2 The roof', start: 110, length: 160, state: 'partial' },
  { label: '#5 Red Line', start: 480, length: 180, state: 'missing' },
];

describe('ProgramBar', () => {
  it('is a group named The whole cut by default, its total read as text, and nothing is focusable', () => {
    const { container } = render(<ProgramBar duration={400} planned={660} total="6:40 of 11:00" className="x" />);
    const g = screen.getByRole('group', { name: 'The whole cut' });
    expect(g.className).toBe('sk-pbar x');
    expect(g.querySelector('.sk-pbar__total')!.textContent).toBe('6:40 of 11:00');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('reads each section with partly cut or missing, placed in planned proportion', () => {
    render(<ProgramBar duration={400} planned={660} sections={sections} label="Episode 3" />);
    const secs = [...screen.getByRole('group', { name: 'Episode 3' }).querySelectorAll('.sk-pbar__sec')] as HTMLElement[];
    expect(secs.map((s) => s.textContent)).toEqual(['#1', '#2 The roof, partly cut', '#5 Red Line, missing']);
    expect(secs.map((s) => s.className)).toEqual(['sk-pbar__sec is-cut', 'sk-pbar__sec is-partial', 'sk-pbar__sec is-missing']);
    expect(secs[1].getAttribute('title')).toBe('#2 The roof');
    expect(secs[2].style.left).toBe((480 / 660 * 100) + '%');
  });

  it('reads the window, the playhead and the marks with done', () => {
    const { container } = render(<ProgramBar duration={400} planned={660} window={{ start: 140, length: 40 }} playhead={161} marks={[{ at: 96, label: '1', done: true }, { at: 402, label: '2' }]} />);
    expect(container.querySelector('.sk-pbar__window')!.textContent).toBe('Timeline shows 2:20 to 3:00');
    expect(container.querySelector('.sk-pbar__playhead')!.textContent).toBe('Playhead at 2:41');
    const marks = [...container.querySelectorAll('.sk-pbar__mark')];
    expect(marks.map((m) => m.textContent)).toEqual(['1, done', '2']);
    expect(marks[0].className).toBe('sk-pbar__mark is-done');
  });

  it('with no plan the duration is the whole bar', () => {
    const { container } = render(<ProgramBar duration={200} playhead={50} sections={[{ label: '#1', start: 0, length: 200 }]} />);
    expect((container.querySelector('.sk-pbar__playhead') as HTMLElement).style.left).toBe('25%');
  });

  it('draws nothing when it carries nothing the ruler does not: no sections, notes, time not cut yet or zoomed window', () => {
    expect(render(<ProgramBar duration={200} playhead={50} />).container.firstChild).toBeNull();
    expect(render(<ProgramBar duration={200} planned={200} window={{ start: 0, length: 200 }} />).container.firstChild).toBeNull();
    expect(render(<ProgramBar duration={200} planned={300} />).container.firstChild).not.toBeNull();
    expect(render(<ProgramBar duration={200} window={{ start: 0, length: 50 }} />).container.firstChild).not.toBeNull();
    expect(render(<ProgramBar duration={200} marks={[{ at: 10, label: '1' }]} />).container.firstChild).not.toBeNull();
  });
});

describe('ProgramBar with onSeek', () => {
  it('a press on the bar seeks a frame at a time, never past what is cut, and the playhead is a slider named Seek', () => {
    const seek = vi.fn();
    const { container } = render(<ProgramBar duration={400} planned={660} playhead={100} onSeek={seek} />);
    const track = container.querySelector<HTMLElement>('.sk-pbar__track')!;
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 660, height: 8, right: 660, bottom: 8, x: 0, y: 0, toJSON: () => ({}) });
    /* jsdom's fireEvent.pointerDown carries no position: a MouseEvent of that type does */
    fireEvent(track, Object.assign(new MouseEvent('pointerdown', { bubbles: true, clientX: 600, button: 0 }), { pointerId: 1 }));
    expect(seek).toHaveBeenLastCalledWith(400);
    const slider = screen.getByRole('slider', { name: 'Seek' });
    expect(slider.getAttribute('aria-valuetext')).toBe('Playhead at 1:40');
    fireEvent.keyDown(slider, { key: 'ArrowRight', shiftKey: true });
    expect(seek).toHaveBeenLastCalledWith(110);
  });
});
