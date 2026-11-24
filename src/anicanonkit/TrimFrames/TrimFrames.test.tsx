import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TrimFrames } from './TrimFrames';

afterEach(cleanup);

describe('TrimFrames', () => {
  it('is a group named Trim by default; each frame reads In or Out and its timecode, and the active one is rung', () => {
    const { container } = render(<TrimFrames in={{ image: 'a.jpg', timecode: '0+00' }} out={{ image: 'b.jpg', timecode: '6+12' }} active="out" />);
    const g = screen.getByRole('group', { name: 'Trim' });
    expect(g.className).toBe('sk-trimframes');
    expect([...g.querySelectorAll('.sk-trimframes__lab')].map((l) => l.textContent)).toEqual(['In0+00', 'Out6+12']);
    const thumbs = [...container.querySelectorAll('.sk-thumb')];
    expect(thumbs.map((t) => t.classList.contains('is-selected'))).toEqual([false, true]);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('Tab reaches each frame\'s nudges, which run onNudge without href', () => {
    const onNudge = vi.fn();
    render(<TrimFrames label="Trim 2C" in={{ image: 'a.jpg', timecode: '0+00' }} out={{ image: 'b.jpg', timecode: '6+12' }} onNudge={onNudge} />);
    expect(screen.getByRole('group', { name: 'Trim 2C' })).toBeTruthy();
    const names = screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual(['In a frame earlier', 'In a frame later', 'Out a frame earlier', 'Out a frame later']);
    fireEvent.click(screen.getByRole('button', { name: 'In a frame later' }));
    fireEvent.click(screen.getByRole('button', { name: 'Out a frame earlier' }));
    expect(onNudge.mock.calls).toEqual([['in', 1], ['out', -1]]);
  });

  it('a frame with href is a link named like "In frame, 0:12", selected when active, and its nudges are links too', () => {
    const onNudge = vi.fn();
    render(<TrimFrames in={{ image: 'a.jpg', timecode: '0:12', href: '#in' }} out={{ image: 'b.jpg', timecode: '0:18' }} active="in" onNudge={onNudge} />);
    const pic = screen.getByRole('link', { name: 'In frame, 0:12, selected' });
    expect(pic.className).toBe('sk-trimframes__pic');
    expect(screen.getByRole('link', { name: 'In a frame earlier' }).getAttribute('href')).toBe('#in');
    fireEvent.click(screen.getByRole('link', { name: 'In a frame later' }));
    expect(onNudge).not.toHaveBeenCalled();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('frames take the given size', () => {
    const { container } = render(<TrimFrames in={{ image: 'a.jpg', timecode: '0' }} out={{ image: 'b.jpg', timecode: '1' }} frameWidth={60} frameHeight={107} />);
    const t = container.querySelector('.sk-thumb') as HTMLElement;
    expect([t.style.width, t.style.height]).toEqual(['60px', '107px']);
  });

  it('below 96px a frame is narrow: the pair is drawn is-narrow, its picture and rows centred', () => {
    const { container, rerender } = render(<TrimFrames in={{ image: 'a.jpg', timecode: '0' }} out={{ image: 'b.jpg', timecode: '1' }} frameWidth={60} frameHeight={107} />);
    expect(container.querySelector('.sk-trimframes')!.className).toBe('sk-trimframes is-narrow');
    rerender(<TrimFrames in={{ image: 'a.jpg', timecode: '0' }} out={{ image: 'b.jpg', timecode: '1' }} frameWidth={96} frameHeight={54} />);
    expect(container.querySelector('.sk-trimframes')!.className).toBe('sk-trimframes');
  });
});
