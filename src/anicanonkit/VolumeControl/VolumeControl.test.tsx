import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VolumeControl } from './VolumeControl';

afterEach(cleanup);

describe('VolumeControl', () => {
  it('Tab reaches the mute toggle, named for what it mutes, then the volume slider spoken as its percent', () => {
    const onMute = vi.fn();
    const { container } = render(<VolumeControl value={80} what="the video’s own sound" onMute={onMute} onChange={() => {}} className="x" />);
    expect(container.firstElementChild!.className).toBe('sk-volume x');
    const mute = screen.getByRole('button', { name: 'Mute the video’s own sound' });
    expect(mute.getAttribute('aria-pressed')).toBe('false');
    expect(mute.className).toContain('sk-ib--plain');
    const slider = screen.getByRole('slider', { name: 'Volume of the video’s own sound' });
    expect(slider.getAttribute('aria-valuetext')).toBe('80%');
    expect(slider.tabIndex).toBe(0);
    expect(container.querySelector('b')!.textContent).toBe('80%');
    fireEvent.click(mute);
    expect(onMute).toHaveBeenCalledTimes(1);
  });

  it('muted, the toggle is pressed and the slider and readout say Muted', () => {
    const { container } = render(<VolumeControl value={80} muted onMute={() => {}} />);
    expect(container.firstElementChild!.className).toBe('sk-volume is-muted');
    const mute = screen.getByRole('button', { name: 'Mute the sound' });
    expect(mute.getAttribute('aria-pressed')).toBe('true');
    expect(mute.className).toContain('sk-ib--plain');
    expect(screen.getByRole('slider', { name: 'Volume of the sound' }).getAttribute('aria-valuetext')).toBe('Muted');
    expect(container.querySelector('b')!.textContent).toBe('Muted');
  });

  it('with onChange, arrows move it by 1, Shift by 10, Page keys by 10, Home and End to the ends', () => {
    const onChange = vi.fn();
    render(<VolumeControl value={50} onChange={onChange} />);
    const s = screen.getByRole('slider');
    for (const [key, shiftKey] of [['ArrowRight', false], ['ArrowLeft', false], ['ArrowUp', true], ['PageDown', false], ['Home', false], ['End', false]] as const) fireEvent.keyDown(s, { key, shiftKey });
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([51, 49, 60, 40, 0, 100]);
  });

  it('without onChange the slider reads as read-only', () => {
    render(<VolumeControl value={30} />);
    const s = screen.getByRole('slider');
    expect(s.getAttribute('aria-readonly')).toBe('true');
  });

  it('with href the mute is a link', () => {
    render(<VolumeControl value={30} href="#mute" />);
    expect(screen.getByRole('link', { name: 'Mute the sound' }).getAttribute('href')).toBe('#mute');
  });
});
