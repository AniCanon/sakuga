import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

const clip = { name: 'Red Line fight', alt: 'Two fighters trade blows on a platform', poster: '/still.jpg', duration: 8 };

describe('VideoPlayer', () => {
  it('is a group named "{name}, video" whose controls Tab reaches in order: play, seek, mute, full screen', () => {
    render(<VideoPlayer {...clip} time={3} />);
    const group = screen.getByRole('group', { name: 'Red Line fight, video' });
    const tabbable = Array.from(group.querySelectorAll<HTMLElement>('button,[role="slider"]')).filter((el) => el.tabIndex >= 0);
    expect(tabbable.map((el) => el.getAttribute('aria-label'))).toEqual(['Play Red Line fight', 'Seek in Red Line fight', 'Play Red Line fight', 'Mute Red Line fight', 'Full screen']);
  });

  it('paused, a large play sits in the middle; playing, it is gone and the button reads Pause', () => {
    const { rerender } = render(<VideoPlayer {...clip} time={3} />);
    expect(document.querySelector('.sk-video__big')).not.toBeNull();
    rerender(<VideoPlayer {...clip} time={3} playing />);
    expect(document.querySelector('.sk-video__big')).toBeNull();
    expect(screen.getByRole('button', { name: 'Pause Red Line fight' })).toBeTruthy();
  });

  it('ended, play says "Play {name} again"', () => {
    render(<VideoPlayer {...clip} time={8} ended />);
    expect(screen.getAllByRole('button', { name: 'Play Red Line fight again' })).toHaveLength(2);
  });

  it('waiting for frames, the loader is named "Loading {name}"', () => {
    render(<VideoPlayer {...clip} playing loading />);
    expect(screen.getByRole('status', { name: 'Loading Red Line fight' })).toBeTruthy();
  });

  it('seek steps a second per arrow', () => {
    const seek = vi.fn();
    render(<VideoPlayer {...clip} time={3} onSeek={seek} />);
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Seek in Red Line fight' }), { key: 'ArrowRight' });
    expect(seek).toHaveBeenCalledWith(4);
  });

  it('with focus inside, Space and K toggle, M mutes, Left and Right step a second', () => {
    const toggle = vi.fn(), mute = vi.fn(), seek = vi.fn();
    render(<VideoPlayer {...clip} time={3} onToggle={toggle} onMute={mute} onSeek={seek} />);
    const group = screen.getByRole('group');
    fireEvent.keyDown(group, { key: ' ' });
    fireEvent.keyDown(group, { key: 'k' });
    fireEvent.keyDown(group, { key: 'm' });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(toggle).toHaveBeenCalledTimes(2);
    expect(mute).toHaveBeenCalledWith(true);
    expect(seek.mock.calls.map((c) => c[0])).toEqual([4, 2]);
  });

  it('mute is a toggle that reads pressed once muted', () => {
    render(<VideoPlayer {...clip} />);
    const m = screen.getByRole('button', { name: 'Mute Red Line fight' });
    expect(m.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(m);
    expect(m.getAttribute('aria-pressed')).toBe('true');
  });

  it('playing, the controls go after the pointer rests 2.5 s and come back on a move', () => {
    vi.useFakeTimers();
    render(<VideoPlayer {...clip} playing />);
    const group = screen.getByRole('group');
    fireEvent.pointerMove(group);
    expect(group.classList.contains('is-shown')).toBe(true);
    act(() => { vi.advanceTimersByTime(2500); });
    expect(group.classList.contains('is-shown')).toBe(false);
    fireEvent.pointerMove(group);
    expect(group.classList.contains('is-shown')).toBe(true);
  });

  it('paused, the controls stay', () => {
    vi.useFakeTimers();
    render(<VideoPlayer {...clip} />);
    const group = screen.getByRole('group');
    fireEvent.pointerMove(group);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(group.classList.contains('is-shown')).toBe(true);
  });

  it('with src it plays its own video; fill wraps it in a room that takes the column', () => {
    render(<VideoPlayer {...clip} src="/clip.mp4" fill ratio={1} />);
    const video = document.querySelector('video')!;
    expect(video.getAttribute('src')).toBe('/clip.mp4');
    expect(video.getAttribute('poster')).toBe('/still.jpg');
    expect(document.querySelector('.sk-video-room > .sk-video')).not.toBeNull();
    expect((document.querySelector('.sk-video') as HTMLElement).style.getPropertyValue('--video-ratio')).toBe('1');
  });

  it('the large play hands its focus to play or pause as it goes', () => {
    const { rerender } = render(<VideoPlayer {...clip} time={3} />);
    const big = document.querySelector<HTMLButtonElement>('.sk-video__big')!;
    big.focus();
    fireEvent.click(big);
    rerender(<VideoPlayer {...clip} time={3} playing />);
    expect(document.activeElement).toBe(document.querySelector('.sk-video__row > .sk-ib'));
  });

  it('a seek back from the end says Play again no more', () => {
    render(<VideoPlayer {...clip} src="/clip.mp4" />);
    const video = document.querySelector('video')!;
    Object.defineProperty(video, 'duration', { value: 8 });
    fireEvent.loadedMetadata(video);
    fireEvent.ended(video);
    expect(screen.getAllByRole('button', { name: 'Play Red Line fight again' })).toHaveLength(2);
    fireEvent.keyDown(screen.getByRole('group'), { key: 'ArrowLeft' });
    expect(screen.getAllByRole('button', { name: 'Play Red Line fight' })).toHaveLength(2);
  });

  it('only keyboard focus keeps the controls shown; only the controls take presses, and none while hidden', () => {
    const css = readFileSync('src/ui/VideoPlayer/VideoPlayer.css', 'utf8');
    expect(css).toContain('.sk-video__controls,.sk-video__row{pointer-events:none}');
    expect(css).toContain('.sk-video:not(.is-shown):not(:has(:focus-visible)) .sk-video__controls *{pointer-events:none}');
  });

  it('with no src and no poster it is its dark frame, never a broken picture', () => {
    render(<VideoPlayer name="Red Line fight" duration={8} />);
    expect(document.querySelector('.sk-video img')).toBeNull();
    expect(document.querySelector('.sk-video video')).toBeNull();
  });
});
