import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioPlayer } from './AudioPlayer';

afterEach(cleanup);

describe('AudioPlayer', () => {
  it('Tab reaches the play button, "Play" with the title, and the waveform slider "Position in" the title', () => {
    const seek = vi.fn();
    render(<AudioPlayer title="His voice" subtitle="Cast as Shounen Hero" duration={40} value={12} onSeek={seek}><button type="button">Recast</button></AudioPlayer>);
    const play = screen.getByRole('button', { name: 'Play His voice' });
    expect(play.className).toBe('sk-audio__play');
    const s = screen.getByRole('slider', { name: 'Position in His voice' });
    expect(s.tabIndex).toBe(0);
    expect(s.getAttribute('aria-valuetext')).toBe('12 seconds of 40 seconds');
    fireEvent.keyDown(s, { key: 'ArrowRight' });
    fireEvent.keyDown(s, { key: 'End' });
    fireEvent.keyDown(s, { key: 'Home' });
    expect(seek.mock.calls.map((c) => c[0])).toEqual([13, 40, 0]);
    expect(screen.getByText('0:12 / 0:40').className).toBe('sk-audio__time');
    expect(screen.getByRole('button', { name: 'Recast' }).parentElement!.className).toBe('sk-audio__actions');
  });

  it('label names the sound when no title shows; without either it is "audio"; without onSeek the waveform is hidden', () => {
    const { container } = render(<><AudioPlayer label="Rain on glass" duration={4} size="sm" /><AudioPlayer duration={4} /></>);
    expect(screen.getByRole('button', { name: 'Play Rain on glass' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Play audio' })).toBeTruthy();
    expect(screen.queryByRole('slider')).toBeNull();
    expect([...container.querySelectorAll('.sk-wave')].map((w) => w.getAttribute('aria-hidden'))).toEqual(['true', 'true']);
    expect([...container.querySelectorAll('.sk-audio')].map((a) => a.className)).toEqual(['sk-audio sk-audio--sm', 'sk-audio sk-audio--md']);
  });

  it('plays and pauses on its own, the icon swapping in', () => {
    const { container } = render(<AudioPlayer title="His voice" duration={4} />);
    const play = screen.getByRole('button', { name: 'Play His voice' });
    const icon = container.querySelector('.sk-audio__play svg')!;
    fireEvent.click(play);
    expect(play.getAttribute('aria-label')).toBe('Pause His voice');
    expect(container.querySelector('.sk-audio__play svg')).not.toBe(icon);
    expect(container.querySelector('.sk-audio__play use')!.getAttribute('href')).toContain('pause');
    fireEvent.click(play);
    expect(play.getAttribute('aria-label')).toBe('Play His voice');
  });

  it('with playing and onToggle the page holds the state', () => {
    function Held() {
      const [on, set] = useState(true);
      return <AudioPlayer title="His voice" duration={4} playing={on} onToggle={set} />;
    }
    render(<Held />);
    const b = screen.getByRole('button', { name: 'Pause His voice' });
    fireEvent.click(b);
    expect(b.getAttribute('aria-label')).toBe('Play His voice');
    const toggle = vi.fn();
    cleanup();
    render(<AudioPlayer title="His voice" duration={4} playing={false} onToggle={toggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play His voice' }));
    expect(toggle).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Play His voice' })).toBeTruthy();
  });

  it('playing, once given, is the page\'s even without onToggle: a press does not change it', () => {
    const { container } = render(<AudioPlayer title="His voice" duration={4} playing />);
    const b = screen.getByRole('button', { name: 'Pause His voice' });
    fireEvent.click(b);
    expect(b.getAttribute('aria-label')).toBe('Pause His voice');
    expect(container.querySelector('.sk-audio__play use')!.getAttribute('href')).toContain('pause');
  });

  it('a title grows the play button and seats the waveform under the titles; media takes the art tone', () => {
    const { container } = render(<AudioPlayer title="His voice" subtitle="warm" variant="media" duration={4} value={2} />);
    expect(container.firstElementChild!.className).toBe('sk-audio sk-audio--md sk-audio--media sk-audio--titled');
    expect(container.querySelector('.sk-audio__head')!.textContent).toBe('His voicewarm');
    expect(container.querySelector('.sk-audio__row .sk-wave')!.className).toBe('sk-wave sk-wave--media');
    expect(container.querySelector<HTMLElement>('.sk-wave__bars--played')!.style.clipPath).toBe('inset(0 50% 0 0)');
  });
});
