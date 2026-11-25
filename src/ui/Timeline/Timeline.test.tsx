import { act, cleanup, createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Thumb } from '../Thumb/Thumb';
import { Timeline, type TimelineProps, type TimelineTrack } from './Timeline';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
/* jsdom lays nothing out, so every element would measure 0 wide and every item read as a sliver: a laid-out width by default;
   a test that needs a lane's own box stubs that element */
beforeEach(() => { vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 1000, height: 40, right: 1000, bottom: 40, x: 0, y: 0, toJSON() {} } as DOMRect); });

const live = () => document.querySelector('[aria-live="polite"]');
/* What the live region says once it has spoken: announce() writes after a beat */
function said() { act(() => { vi.advanceTimersByTime(200); }); return live()!.textContent; }

/* A pointer event jsdom can dispatch: its MouseEvent carries the position, the id is added */
function pointer(type: string, target: EventTarget, x: number, y: number) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: 1 });
  act(() => { target.dispatchEvent(e); });
}
const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} }) as DOMRect;

const tracks: TimelineTrack[] = [
  { label: 'Video', kind: 'video', items: [{ start: 0, length: 6, label: 'Take 2', state: 'selected' }, { start: 6, length: 4, state: 'gap' }] },
  { label: 'Audio', kind: 'audio', items: [{ start: 0, length: 10, label: 'Rain on glass' }] },
  { label: 'Captions JA', kind: 'caption', items: [{ start: 2, length: 1.5, label: '急いで！' }, { start: 7, length: 2, label: 'まだだ' }] },
];

function base(p: Partial<TimelineProps> = {}) {
  return <Timeline duration={12} playhead={4} rate="24 fps" markers={[{ at: 6, label: 'Scene 2' }]} tracks={tracks} {...p} />;
}

describe('Timeline', () => {
  it('an item too narrow for its name keeps its span and shows its track\'s icon as a chip, its name in its title', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const narrow = this.classList.contains('sk-tl__item') && this.getAttribute('title') === 'Impact';
      return { left: 0, top: 0, width: narrow ? 3 : 1000, height: 40, right: narrow ? 3 : 1000, bottom: 40, x: 0, y: 0, toJSON() {} } as DOMRect;
    });
    const { container } = render(<Timeline duration={60} tracks={[{ label: 'Effects', kind: 'effect', items: [{ start: 1, length: 0.125, label: 'Impact' }, { start: 10, length: 20, label: 'Speed ramp' }] }]} />);
    const [impact, ramp] = Array.from(container.querySelectorAll<HTMLElement>('.sk-tl__item'));
    expect(impact.className).toContain('is-sliver');
    expect(impact.getAttribute('title')).toBe('Impact');
    expect(impact.dataset.kind).toBe('effect');
    expect(impact.querySelector('.sk-tl__chip')!.getAttribute('aria-hidden')).toBe('true');
    expect(ramp.className).not.toContain('is-sliver');
  });

  it('is a group named "Timeline" whose times, track names, markers and playhead read as text, waveforms and icons hidden', () => {
    const { container } = render(base());
    const g = screen.getByRole('group', { name: 'Timeline' });
    expect(g.className).toBe('sk-tl has-markers');
    expect([...container.querySelectorAll('.sk-tl__tick')].map((t) => t.textContent)).toEqual(['0:00', '0:01', '0:02', '0:03', '0:04', '0:05', '0:06', '0:07', '0:08', '0:09', '0:10', '0:11', '0:12']);
    expect(container.querySelector('.sk-tl__head--ruler')!.textContent).toBe('24 fps');
    expect([...container.querySelectorAll('.sk-tl__name')].map((n) => [n.textContent, n.getAttribute('title')])).toEqual([['Video', 'Video'], ['Audio', 'Audio'], ['Captions JA', 'Captions JA']]);
    expect(container.querySelector('.sk-tl__flag')!.textContent).toBe('Scene 2');
    expect(screen.getByText('Playhead at 0:04').className).toBe('sk-sr');
    expect(container.querySelector('.sk-tl__wave')!.getAttribute('aria-hidden')).toBe('true');
    for (const icon of container.querySelectorAll('.sk-tl__head svg')) expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector<HTMLElement>('.sk-tl__playhead')!.style.left).toBe('33.33333333333333%');
  });

  it('label names it; the ruler steps itself (1, 5 or 30 s) unless step is set; offset labels it in program time', () => {
    const { container, rerender } = render(<Timeline label="Cut 3" duration={60} tracks={[]} />);
    expect(screen.getByRole('group', { name: 'Cut 3' }).className).toBe('sk-tl');
    const ticks = () => [...container.querySelectorAll('.sk-tl__tick')].map((t) => t.textContent);
    expect(ticks()).toEqual(['0:00', '0:05', '0:10', '0:15', '0:20', '0:25', '0:30', '0:35', '0:40', '0:45', '0:50', '0:55', '1:00']);
    rerender(<Timeline duration={150} tracks={[]} />);
    expect(ticks()).toEqual(['0:00', '0:30', '1:00', '1:30', '2:00', '2:30']);
    rerender(<Timeline duration={4} step={2} offset={90} playhead={1} tracks={[]} />);
    expect(ticks()).toEqual(['1:30', '1:32', '1:34']);
    expect(screen.getByText('Playhead at 1:31')).toBeTruthy();
  });

  it('without onSelect an item reads its label and its state; a gap with no label says "No picture yet" once', () => {
    const { container } = render(base({ tracks: [{ label: 'Video', kind: 'board', items: [{ start: 0, length: 4, label: 'Take 1', state: 'rejected' }, { start: 4, length: 4, state: 'gap' }, { start: 8, length: 2, state: 'board' }] }] }));
    const items = [...container.querySelectorAll('.sk-tl__item')];
    expect(items.map((i) => i.className)).toEqual(['sk-tl__item sk-tl__item--board is-rejected', 'sk-tl__item sk-tl__item--board is-gap', 'sk-tl__item sk-tl__item--board is-board']);
    expect(items.map((i) => i.textContent)).toEqual(['Take 1, rejected', 'No picture yet', 'Storyboard']);
    expect(items[0].getAttribute('title')).toBe('Take 1');
    expect(items[0].getAttribute('role')).toBeNull();
  });

  it('with onSelect the items are one Tab stop of buttons named by label, track, times and state', () => {
    render(base({ onSelect: () => {} }));
    const take = screen.getByRole('button', { name: 'Take 2, Video, 0:00 to 0:06, selected' });
    const gap = screen.getByRole('button', { name: 'Video, 0:06 to 0:10, no picture yet' });
    const rain = screen.getByRole('button', { name: 'Rain on glass, Audio, 0:00 to 0:10' });
    expect(take.tabIndex).toBe(0);
    expect([gap.tabIndex, rain.tabIndex]).toEqual([-1, -1]);
    expect(gap.textContent).toBe('No picture yet');
  });

  it('Left and Right move within a track, Home and End to its ends, Up and Down to the nearest item on the next one', () => {
    render(base({ onSelect: () => {} }));
    const take = screen.getByRole('button', { name: /^Take 2,/ }), gap = screen.getByRole('button', { name: /no picture yet$/ });
    const rain = screen.getByRole('button', { name: /^Rain on glass,/ }), hurry = screen.getByRole('button', { name: /^急いで！,/ }), notYet = screen.getByRole('button', { name: /^まだだ,/ });
    take.focus();
    fireEvent.keyDown(take, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(gap);
    expect([take.tabIndex, gap.tabIndex]).toEqual([-1, 0]);
    fireEvent.keyDown(gap, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(gap);
    fireEvent.keyDown(gap, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(rain);
    fireEvent.keyDown(rain, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(hurry);
    fireEvent.keyDown(hurry, { key: 'End' });
    expect(document.activeElement).toBe(notYet);
    fireEvent.keyDown(notYet, { key: 'Home' });
    expect(document.activeElement).toBe(hurry);
    fireEvent.keyDown(hurry, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(hurry);
    fireEvent.keyDown(hurry, { key: 'ArrowUp' });
    fireEvent.keyDown(rain, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(take);
    fireEvent.keyDown(take, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(take);
  });

  it('Enter, Space or a click selects, with the track and item indexes', () => {
    const select = vi.fn();
    render(base({ onSelect: select }));
    const gap = screen.getByRole('button', { name: /no picture yet$/ });
    fireEvent.keyDown(gap, { key: 'Enter' });
    fireEvent.keyDown(gap, { key: ' ' });
    fireEvent.click(screen.getByRole('button', { name: /^まだだ,/ }));
    expect(select.mock.calls).toEqual([[0, 1], [0, 1], [2, 1]]);
  });

  it('without onTrim a selected item\'s grips only draw: hidden, and no Tab stop', () => {
    const { container } = render(base({ tracks: [{ label: 'Video', kind: 'video', items: [{ start: 1.5, length: 4, label: 'Take 2', state: 'selected' }] }] }));
    const lane = container.querySelector('.sk-tl__lane')!;
    expect([...lane.children].map((c) => c.className)).toEqual(['sk-tl__item sk-tl__item--video is-selected', 'sk-tl__grip sk-tl__grip--in', 'sk-tl__grip sk-tl__grip--out']);
    const grips = [...lane.querySelectorAll<HTMLElement>('.sk-tl__grip')];
    expect(grips.map((g) => [g.getAttribute('aria-hidden'), g.getAttribute('role'), g.getAttribute('tabindex')])).toEqual([['true', null, null], ['true', null, null]]);
    expect(screen.queryByRole('slider')).toBeNull();
    expect(grips[0].style.left).toBe('12.5%');
  });

  it('with onTrim a selected item\'s grips are sliders beside it in the lane, said in seconds and frames', () => {
    render(base({ onTrim: () => {}, tracks: [{ label: 'Video', kind: 'video', items: [{ start: 1.5, length: 4, label: 'Take 2', state: 'selected' }] }] }));
    const start = screen.getByRole('slider', { name: 'Trim the start of Take 2' }), end = screen.getByRole('slider', { name: 'Trim the end of Take 2' });
    expect(start.tabIndex).toBe(0);
    expect(start.getAttribute('aria-valuetext')).toBe('1 second, 12 frames');
    expect(start.getAttribute('aria-valuenow')).toBe('1.5');
    expect(start.getAttribute('aria-valuemin')).toBe('0');
    expect(Number(start.getAttribute('aria-valuemax'))).toBeCloseTo(5.5 - 1 / 24);
    expect(end.getAttribute('aria-valuetext')).toBe('5 seconds, 12 frames');
    expect(Number(end.getAttribute('aria-valuemin'))).toBeCloseTo(1.5 + 1 / 24);
    expect(end.getAttribute('aria-valuemax')).toBe('12');
    expect(start.getAttribute('aria-readonly')).toBeNull();
  });

  it('an edge stops at the item beside it on the track', () => {
    render(base({ onTrim: () => {}, tracks: [{ label: 'Video', kind: 'video', items: [{ start: 0, length: 2 }, { start: 3, length: 4, label: 'Take 2', state: 'selected' }, { start: 8, length: 2 }] }] }));
    expect(screen.getByRole('slider', { name: 'Trim the start of Take 2' }).getAttribute('aria-valuemin')).toBe('2');
    expect(screen.getByRole('slider', { name: 'Trim the end of Take 2' }).getAttribute('aria-valuemax')).toBe('8');
  });

  it('an arrow trims a frame (trimStep), Shift, Page Up or Page Down a second, each through onTrim', () => {
    const trim = vi.fn();
    render(base({ onTrim: trim, tracks: [{ label: 'Video', kind: 'video', items: [{ start: 0, length: 6, label: 'Take 2', state: 'selected' }] }] }));
    const start = screen.getByRole('slider', { name: 'Trim the start of Take 2' }), end = screen.getByRole('slider', { name: 'Trim the end of Take 2' });
    fireEvent.keyDown(end, { key: 'ArrowLeft' });
    fireEvent.keyDown(end, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(end, { key: 'PageDown' });
    fireEvent.keyDown(start, { key: 'ArrowRight' });
    fireEvent.keyDown(start, { key: 'PageUp' });
    fireEvent.keyDown(start, { key: 'ArrowLeft' });
    fireEvent.keyDown(end, { key: 'End' });
    const calls = trim.mock.calls;
    expect(calls.map((c) => c.slice(0, 3))).toEqual([[0, 0, 'out'], [0, 0, 'out'], [0, 0, 'out'], [0, 0, 'in'], [0, 0, 'in'], [0, 0, 'in'], [0, 0, 'out']]);
    expect(calls.map((c) => c[3])).toEqual([expect.closeTo(6 - 1 / 24), 7, 5, expect.closeTo(1 / 24), 1, 0, 12]);
  });

  it('trimStep sets what an arrow trims, and the frames are counted at that rate', () => {
    const trim = vi.fn();
    render(<Timeline duration={10} trimStep={0.5} onTrim={trim} tracks={[{ label: 'Video', kind: 'video', items: [{ start: 2.5, length: 3, state: 'selected' }] }]} />);
    const start = screen.getByRole('slider', { name: 'Trim the start of this item' });
    expect(start.getAttribute('aria-valuetext')).toBe('2 seconds, 1 frame');
    fireEvent.keyDown(start, { key: 'ArrowRight' });
    expect(trim).toHaveBeenCalledWith(0, 0, 'in', 3);
  });

  it('draws the trimmed footage as dashed ghosts beyond the item', () => {
    const { container } = render(<Timeline duration={10} tracks={[{ label: 'Video', kind: 'video', items: [{ start: 2, length: 4, state: 'selected', trimmed: { start: 1, end: 2 } }] }]} />);
    const ghosts = [...container.querySelectorAll<HTMLElement>('.sk-tl__ghost')];
    expect(ghosts.map((g) => [g.getAttribute('aria-hidden'), g.style.left, g.style.width])).toEqual([['true', '10%', '10%'], ['true', '60%', '20%']]);
    expect(ghosts[0].nextElementSibling!.className).toBe('sk-tl__item sk-tl__item--video is-selected');
  });

  it('a video or board item with an image draws a picture strip; sound tracks draw the Waveform', () => {
    const { container } = render(<Timeline duration={10} tracks={[
      { label: 'Video', kind: 'video', items: [{ start: 0, length: 4, image: '/take.jpg' }] },
      { label: 'Voice', kind: 'dialogue', items: [{ start: 0, length: 4, peaks: [0.2, 0.8], label: 'Kiko' }] },
      { label: 'Score', kind: 'music', items: [{ start: 0, length: 4 }] },
    ]} />);
    expect(container.querySelector<HTMLElement>('.sk-tl__strip')!.style.backgroundImage).toBe('url("/take.jpg")');
    expect([...container.querySelectorAll('.sk-wave')].map((w) => w.className)).toEqual(['sk-wave sk-tl__wave', 'sk-wave sk-tl__wave']);
  });

  it('with reorderable and onMoveTrack, Up and Down move a track by its handle, and focus stays on its handle', () => {
    const moves = vi.fn();
    function Order() {
      const [list, set] = useState(tracks);
      return <Timeline duration={12} reorderable tracks={list} onMoveTrack={(from, to) => {
        moves(from, to);
        const next = list.slice(); next.splice(to, 0, next.splice(from, 1)[0]); set(next);
      }} />;
    }
    const { container } = render(<Order />);
    vi.useFakeTimers();
    const handle = screen.getByRole('button', { name: 'Move the Video track, 1 of 3' });
    expect(handle.tabIndex).toBe(0);
    expect(handle.getAttribute('aria-keyshortcuts')).toBe('ArrowUp ArrowDown');
    expect(document.getElementById(handle.getAttribute('aria-describedby')!)!.textContent).toBe('Up and Down move it a place. Enter or Space lifts it to move it further, and drops it; Escape puts it back.');
    handle.focus();
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(moves).not.toHaveBeenCalled();
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(moves).toHaveBeenCalledWith(0, 1);
    expect(said()).toBe('Video track moved to 2 of 3');
    expect([...container.querySelectorAll('.sk-tl__name')].map((n) => n.textContent)).toEqual(['Audio', 'Video', 'Captions JA']);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Move the Video track, 2 of 3' }));
    expect(within(container.querySelectorAll<HTMLElement>('.sk-tl__row')[1]).getByRole('button')).toBe(document.activeElement);
  });

  it('Enter or Space lifts a track, the arrows move where it lands (drawn below the landing track going down), Enter drops it there; each step is said', () => {
    vi.useFakeTimers();
    const moves = vi.fn();
    const { container } = render(<Timeline duration={12} reorderable tracks={tracks} onMoveTrack={moves} />);
    const body = container.querySelector('.sk-tl__body')!;
    const order = () => [...body.children].filter((c) => !c.classList.contains('sk-sr') && !c.classList.contains('sk-tl__playwrap')).map((c) => c.className);
    const handle = screen.getByRole('button', { name: 'Move the Video track, 1 of 3' });
    handle.focus();
    fireEvent.keyDown(handle, { key: 'Enter' });
    expect(said()).toBe('Video track lifted, 1 of 3');
    expect(order()).toEqual(['sk-tl__drop', 'sk-tl__row is-lifted', 'sk-tl__row', 'sk-tl__row']);
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(said()).toBe('To 2 of 3');
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(order()).toEqual(['sk-tl__row is-lifted', 'sk-tl__row', 'sk-tl__row', 'sk-tl__drop']);
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(moves).not.toHaveBeenCalled();
    fireEvent.keyDown(handle, { key: ' ' });
    expect(moves).toHaveBeenCalledWith(0, 2);
    expect(said()).toBe('Video track moved to 3 of 3');
    expect(container.querySelector('.sk-tl__drop')).toBeNull();
  });

  it('Escape puts a lifted track back, Enter on the same place drops it where it was, and leaving the handle lets it go', () => {
    vi.useFakeTimers();
    const moves = vi.fn();
    const { container } = render(<Timeline duration={12} reorderable tracks={tracks} onMoveTrack={moves} />);
    const handle = screen.getByRole('button', { name: 'Move the Audio track, 2 of 3' });
    handle.focus();
    fireEvent.keyDown(handle, { key: 'Enter' });
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    fireEvent.keyDown(handle, { key: 'Escape' });
    expect(said()).toBe('Audio track put back');
    expect(container.querySelector('.is-lifted')).toBeNull();
    fireEvent.keyDown(handle, { key: 'Enter' });
    fireEvent.keyDown(handle, { key: 'Enter' });
    expect(said()).toBe('Audio track dropped where it was');
    fireEvent.keyDown(handle, { key: 'Enter' });
    fireEvent.blur(handle);
    expect(container.querySelector('.is-lifted')).toBeNull();
    expect(moves).not.toHaveBeenCalled();
  });

  it('a handle dragged lifts its track, draws where it lands, and moves it on release, said aloud', () => {
    vi.useFakeTimers();
    const moves = vi.fn();
    const { container } = render(<Timeline duration={12} reorderable tracks={tracks} onMoveTrack={moves} />);
    container.querySelectorAll('.sk-tl__row').forEach((r, i) => vi.spyOn(r, 'getBoundingClientRect').mockReturnValue(rect(0, i * 40, 400, 40)));
    const handle = screen.getByRole('button', { name: 'Move the Video track, 1 of 3' });
    pointer('pointerdown', handle, 10, 20);
    pointer('pointermove', window, 10, 70);
    expect(container.querySelector('.sk-tl__row')!.className).toBe('sk-tl__row is-lifted');
    expect(container.querySelector('.sk-tl__body')!.className).toBe('sk-tl__body is-dragging');
    pointer('pointermove', window, 10, 110);
    expect([...container.querySelectorAll('.sk-tl__body > div')].map((c) => c.className)[3]).toBe('sk-tl__drop');
    pointer('pointerup', window, 10, 110);
    expect(moves).toHaveBeenCalledWith(0, 2);
    expect(said()).toBe('Video track moved to 3 of 3');
    expect(container.querySelector('.is-lifted')).toBeNull();
  });

  it('a grip dragged trims frame by frame through onTrim, landing exactly where it is dragged: it never snaps to an edge or the playhead', () => {
    const trim = vi.fn();
    const { container } = render(<Timeline duration={10} playhead={4} onTrim={trim} tracks={[
      { label: 'Video', kind: 'video', items: [{ start: 1, length: 2, label: 'Take 2', state: 'selected' }] },
      { label: 'Audio', kind: 'audio', items: [{ start: 5, length: 3 }] },
    ]} />);
    const end = screen.getByRole('slider', { name: 'Trim the end of Take 2' });
    vi.spyOn(end.parentElement!, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 40));
    pointer('pointerdown', end, 300, 10);
    pointer('pointermove', window, 351, 10);
    expect(trim.mock.lastCall!.slice(0, 3)).toEqual([0, 0, 'out']);
    expect(trim.mock.lastCall![3]).toBeCloseTo(84 / 24, 9);
    /* 4 px from the playhead and 3 from the audio's start: a whole frame where it was let go, not either of them */
    pointer('pointermove', window, 396, 10);
    expect(trim.mock.lastCall!.slice(0, 3)).toEqual([0, 0, 'out']);
    expect(trim.mock.lastCall![3]).toBeCloseTo(95 / 24, 9);
    pointer('pointermove', window, 503, 10);
    expect(trim.mock.lastCall!.slice(0, 3)).toEqual([0, 0, 'out']);
    expect(trim.mock.lastCall![3]).toBeCloseTo(121 / 24, 9);
    pointer('pointerup', window, 503, 10);
    expect(container.querySelector('.sk-tl__snap')).toBeNull();
  });

  it('with onSeek a press on the ruler seeks to that frame, and the playhead is a slider named Seek in place of the text', () => {
    const seek = vi.fn();
    const { container } = render(<Timeline duration={10} playhead={2} onSeek={seek} tracks={[{ label: 'Video', kind: 'video', items: [] }]} />);
    const scale = container.querySelector<HTMLElement>('.sk-tl__scale')!;
    vi.spyOn(scale, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 24));
    pointer('pointerdown', scale, 412, 10);
    expect(seek.mock.lastCall![0]).toBeCloseTo(99 / 24, 9);
    const slider = screen.getByRole('slider', { name: 'Seek' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(seek.mock.lastCall![0]).toBeCloseTo(2 + 1 / 24, 9);
    expect(screen.queryByText('Playhead at 0:02')).toBeNull();
  });

  it('with onDrop a card dragged over a lane of its kind outlines where it lands, exactly there, refuses another kind’s lane and hands back its data', () => {
    const drop = vi.fn();
    const { container } = render(<>
      <Thumb title="Popcorn night" onInsert={() => {}} dragData={{ kind: 'video', length: 2 }} />
      <Timeline duration={10} onDrop={drop} tracks={[{ label: 'Video 1', kind: 'video', items: [] }, { label: 'Music', kind: 'music', items: [] }]} />
    </>);
    const card = container.querySelector<HTMLElement>('.sk-ins')!;
    const data = { effectAllowed: '', dropEffect: '', setData: vi.fn() };
    fireEvent.dragStart(card, { dataTransfer: data });
    const [video, music] = Array.from(container.querySelectorAll<HTMLElement>('.sk-tl__lane'));
    vi.spyOn(video, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 40));
    vi.spyOn(music, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 40));
    /* jsdom's drag events carry no position, so it is set on the event */
    const at = (kind: 'dragOver' | 'drop', el: HTMLElement, x: number) => {
      const e = createEvent[kind](el, { dataTransfer: data });
      Object.defineProperty(e, 'clientX', { value: x });
      fireEvent(el, e);
    };
    at('dragOver', music, 300);
    expect(container.querySelector('.sk-tl__landing')).toBeNull();
    at('dragOver', video, 437);
    const landing = container.querySelector<HTMLElement>('.sk-tl__landing')!;
    expect(landing.style.left).toBe('43.7%');
    expect(landing.textContent).toBe('Lands at 0:04');
    at('drop', video, 437);
    expect(drop.mock.lastCall![0]).toEqual({ label: 'Popcorn night', kind: 'video', length: 2 });
    expect(drop.mock.lastCall![1]).toBeCloseTo(4.37, 9);
    expect(drop.mock.lastCall![2]).toBe(0);
    expect(container.querySelector('.sk-tl__landing')).toBeNull();
  });

  it('a drop never covers what is there: over an occupied stretch it lands on the nearest free lane of its kind, and with none it is refused', () => {
    vi.useFakeTimers();
    const drop = vi.fn();
    const tracks = [
      { label: 'Picture', kind: 'video' as const, drop: false, items: [] },
      { label: 'Video 2', kind: 'video' as const, items: [{ start: 3, length: 4, label: 'Smoke' }] },
      { label: 'Video 3', kind: 'video' as const, items: [] },
    ];
    const { container, rerender } = render(<>
      <Thumb title="Popcorn night" onInsert={() => {}} dragData={{ kind: 'video', length: 2 }} />
      <Timeline duration={10} onDrop={drop} tracks={tracks} />
    </>);
    const card = container.querySelector<HTMLElement>('.sk-ins')!;
    const data = { effectAllowed: '', dropEffect: '', setData: vi.fn() };
    const lanes = () => Array.from(container.querySelectorAll<HTMLElement>('.sk-tl__lane'));
    lanes().forEach((l) => vi.spyOn(l, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 40)));
    const at = (kind: 'dragOver' | 'drop', el: HTMLElement, x: number) => {
      const e = createEvent[kind](el, { dataTransfer: data });
      Object.defineProperty(e, 'clientX', { value: x });
      fireEvent(el, e);
    };
    fireEvent.dragStart(card, { dataTransfer: data });
    // drop: false takes nothing, and draws no outline
    at('dragOver', lanes()[0], 400);
    expect(container.querySelector('.sk-tl__landing')).toBeNull();
    // Over Smoke on Video 2 the outline moves to Video 3, at the same time
    at('dragOver', lanes()[1], 400);
    expect(lanes()[2].querySelector('.sk-tl__landing')!.textContent).toBe('Lands at 0:04 on Video 3');
    at('drop', lanes()[1], 400);
    expect(drop.mock.lastCall![2]).toBe(2);
    expect(said()).toBe('Popcorn night inserted at 0:04 on Video 3');

    // With every lane of its kind busy there, it is refused and nothing is dropped
    drop.mockClear();
    rerender(<>
      <Thumb title="Popcorn night" onInsert={() => {}} dragData={{ kind: 'video', length: 2 }} />
      <Timeline duration={10} onDrop={drop} tracks={[tracks[0], tracks[1], { ...tracks[2], items: [{ start: 3, length: 4, label: 'Rain' }] }]} />
    </>);
    lanes().forEach((l) => vi.spyOn(l, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 40)));
    fireEvent.dragStart(card, { dataTransfer: data });
    at('dragOver', lanes()[1], 400);
    const refused = container.querySelector<HTMLElement>('.sk-tl__landing.is-refused')!;
    expect(refused.textContent).toBe('No free track at 0:04');
    at('drop', lanes()[1], 400);
    expect(drop).not.toHaveBeenCalled();
    expect(said()).toBe('No free track at 0:04');
  });

  it('with onMoveItem Alt and an arrow move an item a frame (Shift, a second), never over the item beside it, and the move is said', () => {
    vi.useFakeTimers();
    const move = vi.fn();
    render(<Timeline duration={10} onSelect={() => {}} onMoveItem={move}
      tracks={[{ label: 'Video', kind: 'video', items: [{ start: 2, length: 1, label: 'Smoke' }, { start: 4, length: 2, label: 'Roof' }] }]} />);
    const smoke = screen.getByRole('button', { name: /Smoke/ });
    expect(smoke.getAttribute('aria-keyshortcuts')).toBe('Alt+ArrowLeft Alt+ArrowRight');
    expect(document.getElementById(smoke.getAttribute('aria-describedby')!)!.textContent).toBe('Alt and an arrow move it a frame, with Shift a second');
    fireEvent.keyDown(smoke, { key: 'ArrowRight', altKey: true });
    expect(move.mock.lastCall![2]).toBeCloseTo(2 + 1 / 24, 9);
    expect(said()).toBe('Smoke moved to 0:02');
    fireEvent.keyDown(smoke, { key: 'ArrowRight', altKey: true, shiftKey: true });
    expect(move.mock.lastCall![2]).toBeCloseTo(3, 9);
    // End goes as far as it can: up to Roof, never over it
    fireEvent.keyDown(smoke, { key: 'End', altKey: true });
    expect(move.mock.lastCall![2]).toBeCloseTo(3, 9);
    fireEvent.keyDown(smoke, { key: 'Home', altKey: true });
    expect(move).toHaveBeenLastCalledWith(0, 0, 0);
    // A plain arrow still only moves focus
    move.mockClear();
    fireEvent.keyDown(smoke, { key: 'ArrowRight' });
    expect(move).not.toHaveBeenCalled();
  });

  it('a change ends once: onTrimEnd when the trimming key is let go, onMoveItemEnd when the moving key is, each with the final time', () => {
    const trimEnd = vi.fn(), moveEnd = vi.fn(), trim = vi.fn();
    render(<Timeline duration={10} onSelect={() => {}} onTrim={trim} onTrimEnd={trimEnd} onMoveItem={() => {}} onMoveItemEnd={moveEnd}
      tracks={[{ label: 'Video', kind: 'video', items: [{ start: 2, length: 1, label: 'Smoke', state: 'selected' }, { start: 6, length: 2, label: 'Roof' }] }]} />);
    const end = screen.getByRole('slider', { name: 'Trim the end of Smoke' });
    fireEvent.keyDown(end, { key: 'ArrowRight' });
    fireEvent.keyDown(end, { key: 'ArrowRight' });
    expect(trimEnd).not.toHaveBeenCalled();
    fireEvent.keyUp(end, { key: 'ArrowRight' });
    expect(trimEnd).toHaveBeenCalledTimes(1);
    expect(trimEnd.mock.lastCall!.slice(0, 3)).toEqual([0, 0, 'out']);
    expect(trimEnd.mock.lastCall![3]).toBeCloseTo(trim.mock.lastCall![3], 9);
    // A key let go with nothing moved ends nothing
    fireEvent.keyUp(end, { key: 'ArrowRight' });
    expect(trimEnd).toHaveBeenCalledTimes(1);
    const smoke = screen.getByRole('button', { name: /Smoke/ });
    fireEvent.keyDown(smoke, { key: 'ArrowRight', altKey: true });
    fireEvent.blur(smoke);
    expect(moveEnd).toHaveBeenCalledTimes(1);
    expect(moveEnd.mock.lastCall![2]).toBeCloseTo(2 + 1 / 24, 9);
  });

  it('a grip let go after a drag calls onTrimEnd once with where it landed', () => {
    const trimEnd = vi.fn();
    render(<Timeline duration={10} onTrim={() => {}} onTrimEnd={trimEnd} tracks={[{ label: 'Video', kind: 'video', items: [{ start: 1, length: 2, label: 'Take 2', state: 'selected' }] }]} />);
    const end = screen.getByRole('slider', { name: 'Trim the end of Take 2' });
    vi.spyOn(end.parentElement!, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 40));
    pointer('pointerdown', end, 300, 10);
    pointer('pointermove', window, 351, 10);
    pointer('pointermove', window, 396, 10);
    expect(trimEnd).not.toHaveBeenCalled();
    pointer('pointerup', window, 396, 10);
    expect(trimEnd).toHaveBeenCalledTimes(1);
    expect(trimEnd.mock.lastCall![3]).toBeCloseTo(95 / 24, 9);
  });

  it('with onSelectMarker a flag is a button that selects its marker; selected, it is ringed and says so', () => {
    const select = vi.fn();
    const { container, rerender } = render(<Timeline duration={10} markers={[{ at: 2, label: 'Smoke' }, { at: 8, label: 'Rain' }]} onSelectMarker={select} tracks={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rain at 0:08' }));
    expect(select).toHaveBeenCalledWith(1);
    rerender(<Timeline duration={10} markers={[{ at: 2, label: 'Smoke' }, { at: 8, label: 'Rain', selected: true }]} onSelectMarker={select} tracks={[]} />);
    expect(screen.getByRole('button', { name: 'Rain at 0:08, selected' })).toBeTruthy();
    expect(container.querySelectorAll('.sk-tl__marker.is-selected')).toHaveLength(1);
  });

  it('with onMoveMarker Alt and an arrow move a marker a frame, Shift a second, said aloud, and onMoveMarkerEnd gets the final time once', () => {
    vi.useFakeTimers();
    const move = vi.fn(), end = vi.fn();
    render(<Timeline duration={10} markers={[{ at: 2, label: 'Smoke' }]} onMoveMarker={move} onMoveMarkerEnd={end} tracks={[]} />);
    const flag = screen.getByRole('button', { name: 'Smoke at 0:02' });
    expect(flag.getAttribute('aria-keyshortcuts')).toBe('Alt+ArrowLeft Alt+ArrowRight');
    expect(document.getElementById(flag.getAttribute('aria-describedby')!)!.textContent).toBe('Enter selects it; drag it, or Alt and an arrow move it a frame, with Shift a second');
    fireEvent.keyDown(flag, { key: 'ArrowRight', altKey: true, shiftKey: true });
    expect(move).toHaveBeenLastCalledWith(0, 3);
    expect(said()).toBe('Smoke moved to 0:03');
    expect(end).not.toHaveBeenCalled();
    fireEvent.keyUp(flag, { key: 'ArrowRight' });
    expect(end).toHaveBeenCalledWith(0, 3);
    // A plain arrow never moves it
    move.mockClear();
    fireEvent.keyDown(flag, { key: 'ArrowRight' });
    expect(move).not.toHaveBeenCalled();
  });

  it('a flag dragged along the ruler moves its marker a whole frame at a time, and a press alone selects without moving', () => {
    const move = vi.fn(), end = vi.fn(), select = vi.fn();
    const { container } = render(<Timeline duration={10} markers={[{ at: 2, label: 'Smoke' }]} onSelectMarker={select} onMoveMarker={move} onMoveMarkerEnd={end} tracks={[]} />);
    vi.spyOn(container.querySelector('.sk-tl__scale')!, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 40));
    const flag = screen.getByRole('button', { name: 'Smoke at 0:02' });
    pointer('pointerdown', flag, 200, 5);
    pointer('pointermove', flag, 302, 5);
    expect(move.mock.lastCall![0]).toBe(0);
    expect(move.mock.lastCall![1]).toBeCloseTo(Math.round(3.02 * 24) / 24, 9);
    pointer('pointerup', flag, 302, 5);
    expect(end).toHaveBeenCalledTimes(1);
    fireEvent.click(flag);
    expect(select).not.toHaveBeenCalled();
    // A press that doesn't travel selects
    pointer('pointerdown', flag, 200, 5);
    pointer('pointerup', flag, 201, 5);
    fireEvent.click(flag);
    expect(select).toHaveBeenCalledWith(0);
  });

  it('without onTrim a grip does not drag', () => {
    const { container } = render(<Timeline duration={10} tracks={[{ label: 'Video', kind: 'video', items: [{ start: 1, length: 2, state: 'selected' }] }]} />);
    const grip = container.querySelector('.sk-tl__grip--out')!;
    pointer('pointerdown', grip, 300, 10);
    pointer('pointermove', window, 400, 10);
    expect(container.querySelector('.is-dragging')).toBeNull();
  });

  it('a zero trim draws no ghost and no stray 0', () => {
    const { container } = render(<Timeline duration={10} tracks={[{ label: 'Video', kind: 'video', items: [{ start: 2, length: 4, state: 'selected', trimmed: { start: 0, end: 0 } }] }]} />);
    expect(container.querySelector('.sk-tl__ghost')).toBeNull();
    expect(container.querySelector('.sk-tl__lane')!.textContent).toBe(', selected');
  });

  it('a time just under a minute reads as the minute, never "0:60"', () => {
    render(<Timeline duration={120} playhead={59.6} tracks={[]} />);
    expect(screen.getByText('Playhead at 1:00')).toBeTruthy();
  });

  it('reorderable alone draws a hidden handle; moving only draws a board: the lifted track and where it lands', () => {
    const { container } = render(<Timeline duration={12} reorderable moving={{ track: 2, to: 0 }} tracks={tracks} />);
    const handles = container.querySelectorAll('.sk-tl__drag');
    expect(handles).toHaveLength(3);
    expect(handles[0].getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('button')).toBeNull();
    const body = container.querySelector('.sk-tl__body')!;
    expect([...body.children].map((c) => c.className)).toEqual(['sk-tl__drop', 'sk-tl__row', 'sk-tl__row', 'sk-tl__row is-lifted']);
    expect(body.firstElementChild!.getAttribute('aria-hidden')).toBe('true');
    const { container: down } = render(<Timeline duration={12} reorderable moving={{ track: 0, to: 1 }} tracks={tracks} />);
    expect([...down.querySelector('.sk-tl__body')!.children].map((c) => c.className)).toEqual(['sk-tl__row is-lifted', 'sk-tl__row', 'sk-tl__drop', 'sk-tl__row']);
  });

  it('a flag is cut short a gap before the next; the last one that would run past the end ends at its time', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) { return this.classList.contains('sk-tl__scale') ? 600 : 0; });
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(80);
    const { container } = render(<Timeline duration={12} markers={[{ at: 11, label: 'End credits' }, { at: 6, label: 'Scene 2' }]} tracks={[]} />);
    // Drawn in time order (1.9), whatever order they are given in
    const ms = [...container.querySelectorAll<HTMLElement>('.sk-tl__marker')];
    expect(ms.map((m) => m.className)).toEqual(['sk-tl__marker', 'sk-tl__marker is-end']);
    expect(ms.map((m) => (m.firstChild as HTMLElement).style.maxWidth)).toEqual(['246px', '']);
    expect((ms[1].firstChild as HTMLElement).getAttribute('title')).toBe('End credits');
  });
  it('newLane shows a dashed lane while a fitting card is dragged over, takes the drop when no lane is free, and hands back a null track', () => {
    vi.useFakeTimers();
    const drop = vi.fn();
    const tracks = [{ label: 'Picture', kind: 'video' as const, drop: false, items: [{ start: 0, length: 10, label: '2A' }] }];
    const { container } = render(<>
      <Thumb title="Popcorn night" onInsert={() => {}} dragData={{ kind: 'video', length: 2 }} />
      <Timeline duration={10} onDrop={drop} newLane={{ label: 'Clips', kind: 'video' }} tracks={tracks} />
    </>);
    const data = { effectAllowed: '', dropEffect: '', setData: vi.fn() };
    // At rest the lane is not there
    expect(container.querySelector('.sk-tl__row--new')).toBeNull();
    fireEvent.dragStart(container.querySelector<HTMLElement>('.sk-ins')!, { dataTransfer: data });
    fireEvent.dragEnter(container.querySelector<HTMLElement>('.sk-tl')!, { dataTransfer: data });
    const row = container.querySelector<HTMLElement>('.sk-tl__row--new')!;
    expect(row.querySelector('.sk-tl__name')!.textContent).toBe('Clips');
    const lanes = () => Array.from(container.querySelectorAll<HTMLElement>('.sk-tl__lane'));
    lanes().forEach((l) => vi.spyOn(l, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 1000, 40)));
    const at = (kind: 'dragOver' | 'drop', el: HTMLElement, x: number) => {
      const e = createEvent[kind](el, { dataTransfer: data });
      Object.defineProperty(e, 'clientX', { value: x });
      fireEvent(el, e);
    };
    // Over the Picture, which takes no drop, it lands on the new lane at the same time
    at('dragOver', lanes()[0], 400);
    expect(lanes()[1].querySelector('.sk-tl__landing')!.textContent).toBe('Lands at 0:04 on Clips');
    at('drop', lanes()[0], 400);
    expect(drop).toHaveBeenCalledWith(expect.objectContaining({ kind: 'video', length: 2 }), 4, null, { newLane: true });
    expect(said()).toBe('Popcorn night inserted at 0:04 on Clips');
    expect(container.querySelector('.sk-tl__row--new')).toBeNull();
  });

  it('newLane does not show for a card of another kind', () => {
    const { container } = render(<>
      <Thumb title="Rain" onInsert={() => {}} dragData={{ kind: 'audio', length: 2 }} />
      <Timeline duration={10} onDrop={() => {}} newLane={{ label: 'Clips', kind: 'video' }} tracks={[{ label: 'Picture', kind: 'video', items: [] }]} />
    </>);
    const data = { effectAllowed: '', dropEffect: '', setData: vi.fn() };
    fireEvent.dragStart(container.querySelector<HTMLElement>('.sk-ins')!, { dataTransfer: data });
    fireEvent.dragEnter(container.querySelector<HTMLElement>('.sk-tl')!, { dataTransfer: data });
    expect(container.querySelector('.sk-tl__row--new')).toBeNull();
  });

});

it('does not reread unchanged track items or measure markers on playhead-only updates', () => {
  const start = vi.fn(() => 0);
  const items = [{ get start() { return start(); }, length: 3, state: 'selected' as const }];
  const list = [{ label: 'Video', kind: 'video' as const, items }];
  const markers = [{ at: 2, label: 'Scene' }];
  const trim = vi.fn();
  const widths = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(40);
  const { rerender, container } = render(<Timeline tracks={list} duration={10} markers={markers} onTrim={trim} playhead={1} />);
  start.mockClear(); widths.mockClear();
  rerender(<Timeline tracks={list} duration={10} markers={markers} onTrim={trim} playhead={2} />);
  expect(start).not.toHaveBeenCalled();
  expect(widths).not.toHaveBeenCalled();
  expect(container.querySelector<HTMLElement>('.sk-tl__playhead')!.style.left).toBe('20%');
  rerender(<Timeline tracks={[{...list[0], items: [{start:1,length:4,state:'selected'}]}]} duration={10} markers={markers} onTrim={trim} playhead={2} />);
  expect(screen.getByRole('slider', {name:'Trim the start of this item'}).getAttribute('aria-valuenow')).toBe('1');

});

describe('Timeline zoom', () => {
  const cut: TimelineTrack[] = [{ label: 'Video', kind: 'video', items: [{ start: -2, length: 6, label: 'Early' }, { start: 4, length: 3, label: 'Middle' }, { start: 8, length: 5, label: 'Late' }] }];

  it('shows no zoom control without onView, and the three in the ruler head with it', () => {
    const { rerender, container } = render(<Timeline duration={10} tracks={cut} />);
    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
    expect(container.querySelector('.sk-tl')!.classList.contains('is-zoomable')).toBe(false);
    rerender(<Timeline duration={10} offset={20} total={60} onView={() => {}} tracks={cut} />);
    const head = container.querySelector('.sk-tl__head--ruler')!;
    expect(within(head as HTMLElement).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Zoom out', 'Fit the whole cut', 'Zoom in']);
    expect(container.querySelector('.sk-tl')!.classList.contains('is-zoomable')).toBe(true);
  });

  it('zooms around the playhead, fits the whole cut, and never past the cut or closer than a frame about 24 px wide', () => {
    const onView = vi.fn();
    const { rerender } = render(<Timeline duration={10} offset={20} total={60} playhead={5} onView={onView} tracks={cut} />);
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(onView).toHaveBeenLastCalledWith(17.5, 15);
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    const [s, l] = onView.mock.calls.at(-1)!;
    expect(l).toBeCloseTo(10 / 1.5);
    expect(s + 5 / 10 * l).toBeCloseTo(25);
    fireEvent.click(screen.getByRole('button', { name: 'Fit the whole cut' }));
    expect(onView).toHaveBeenLastCalledWith(0, 60);
    rerender(<Timeline duration={50} offset={30} total={60} onView={onView} tracks={cut} />);
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(onView).toHaveBeenLastCalledWith(0, 60);
    onView.mockClear();
    rerender(<Timeline duration={60} total={60} onView={onView} tracks={cut} />);
    expect(screen.getByRole('button', { name: 'Zoom out' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Fit the whole cut' }).hasAttribute('disabled')).toBe(true);
  });

  it('zooms with Ctrl and the wheel around the pointer and pans with Shift and the wheel', () => {
    const onView = vi.fn();
    const { container } = render(<Timeline duration={10} offset={20} total={60} onView={onView} tracks={cut} />);
    const root = container.querySelector('.sk-tl')!;
    act(() => { root.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: 100, clientX: 250 })); });
    const [s, l] = onView.mock.calls.at(-1)!;
    expect(l).toBeCloseTo(10 * Math.exp(1));
    expect(s + 0.25 * l).toBeCloseTo(22.5);
    act(() => { root.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, shiftKey: true, deltaY: 100 })); });
    expect(onView).toHaveBeenLastCalledWith(21, 10);
  });

  it('turns the page while following when the playhead passes the window', () => {
    const onView = vi.fn();
    render(<Timeline duration={10} offset={20} total={60} playhead={10.5} follow onView={onView} tracks={cut} />);
    expect(onView).toHaveBeenLastCalledWith(29.5, 10);
  });

  it('cuts items square at the window edges and puts the ruler times on whole steps of program time', () => {
    const { container } = render(<Timeline duration={10} offset={2.5} step={5} total={60} onView={() => {}} tracks={cut} />);
    const items = [...container.querySelectorAll<HTMLElement>('.sk-tl__item')];
    expect(items[0].classList.contains('is-cut-start')).toBe(true);
    expect(items[0].style.left).toBe('0%');
    expect(items[0].style.width).toBe('40%');
    expect(items[1].className).not.toMatch(/is-cut/);
    expect(items[2].classList.contains('is-cut-end')).toBe(true);
    expect(items[2].style.width).toBe('20%');
    expect([...container.querySelectorAll('.sk-tl__tick')].map((t) => t.textContent)).toEqual(['0:05', '0:10']);
  });

  it('steps the ruler so its times stay about 72 px apart on the lanes as laid out: the least of 1, 2, 5, 10, 15, 30 s, 1, 2, 5, 10 min', () => {
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600);
    const { container } = render(<Timeline duration={60} tracks={[]} />);
    const ticks = () => [...container.querySelectorAll('.sk-tl__tick')].map((t) => t.textContent);
    // 600 px for a minute: 10 s is 100 px, 5 s only 50
    expect(ticks()).toEqual(['0:00', '0:10', '0:20', '0:30', '0:40', '0:50', '1:00']);
    width.mockRestore();
  });

  it('draws nothing for an item wholly outside the window, and cuts one that crosses it', () => {
    const tracks: TimelineTrack[] = [{ label: 'Video', kind: 'video', items: [{ start: -6, length: 4, label: 'Before' }, { start: -1, length: 3, label: 'Across' }, { start: 12, length: 2, label: 'After' }] }];
    const { container } = render(<Timeline duration={10} tracks={tracks} />);
    expect([...container.querySelectorAll('.sk-tl__item')].map((e) => e.getAttribute('title'))).toEqual(['Across']);
  });

  it('markers closer than a readable flag share one: the first named and the rest counted, a button said in full, each keeping its line', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) { return this.classList.contains('sk-tl__scale') ? 600 : 0; });
    // 600 px over 60 s is 10 px a second: 2:41 and 2:43 are 20 px apart, closer than a flag; 3:30 stands alone
    const { container } = render(<Timeline duration={60} offset={150} markers={[{ at: 11, label: 'Window goes' }, { at: 13, label: 'Smith' }, { at: 50, label: 'Rain' }]} tracks={[]} />);
    const flag = screen.getByRole('button', { name: /markers/ });
    expect(flag.textContent).toBe('Window goes +1');
    expect(flag.getAttribute('aria-label')).toBe('2 markers: Window goes at 2:41 and Smith at 2:43');
    expect([...container.querySelectorAll('.sk-tl__citem')].map((c) => c.textContent)).toEqual(['2:41Window goes', '2:43Smith']);
    expect(container.querySelectorAll('.sk-tl__marker.is-line')).toHaveLength(1);
    expect(screen.getByTitle('Rain').className).toBe('sk-tl__flag');
  });

  it('a sound that loops to fill draws once per repeat with a seam at each start, and says so in its name', () => {
    const tracks = [{ label: 'Sound', kind: 'audio' as const, items: [{ start: 0, length: 10, label: 'Rain on glass', loop: 4 }] }];
    const { container } = render(<Timeline duration={10} tracks={tracks} onSelect={() => {}} />);
    const reps = [...container.querySelectorAll<HTMLElement>('.sk-tl__rep')];
    expect(reps.map((r) => r.classList.contains('is-seam'))).toEqual([false, true, true]);
    expect(reps.map((r) => r.style.width)).toEqual(['40%', '40%', '20%']);
    expect(screen.getByRole('button', { name: /Rain on glass/ }).getAttribute('aria-label')).toContain('loops to fill, 4 seconds made');
  });
});
