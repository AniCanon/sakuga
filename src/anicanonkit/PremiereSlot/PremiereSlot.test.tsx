import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PremiereSlot } from './PremiereSlot';

afterEach(cleanup);

describe('PremiereSlot', () => {
  it('when, title and subtitle read as text; the frame shows the time', () => {
    const { container } = render(<PremiereSlot when="Premieres Friday · 21:00" title="Episode 2" subtitle="Title revealed at premiere" />);
    const slot = container.firstElementChild as HTMLElement;
    expect(slot.className).toBe('sk-prem');
    expect(slot.querySelector('.sk-prem__frame .sk-prem__when')!.textContent).toBe('Premieres Friday · 21:00');
    expect(slot.querySelectorAll('.sk-prem__when')).toHaveLength(1);
    expect(slot.querySelector('.sk-prem__title')!.textContent).toBe('Episode 2');
    expect(slot.querySelector('.sk-prem__sub')!.textContent).toBe('Title revealed at premiere');
  });

  it('Remind me is an outline pill button named from the title, and runs onRemind', () => {
    const onRemind = vi.fn();
    render(<PremiereSlot when="Fri · 21:00" title="Episode 4" onRemind={onRemind} />);
    const b = screen.getByRole('button', { name: 'Remind me when Episode 4 premieres' });
    expect(b.textContent).toBe('Remind me');
    expect(b.className).toContain('sk-btn--outline');
    expect(b.className).toContain('sk-btn--pill');
    fireEvent.click(b);
    expect(onRemind).toHaveBeenCalledTimes(1);
  });

  it('remindLabel names the button; null hides it, undefined keeps it', () => {
    const { rerender } = render(<PremiereSlot when="Fri" title="Issue 3" remindLabel="Remind me about Issue 3" />);
    expect(screen.getByRole('button', { name: 'Remind me about Issue 3' })).toBeTruthy();
    rerender(<PremiereSlot when="Fri" title="Issue 3" onRemind={null} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('compact drops the frame, puts the time above the title and the bell on Remind me', () => {
    const { container } = render(<PremiereSlot compact when="Fri · 21:00" title="EBA · Episode 2" />);
    expect(container.querySelector('.sk-prem__frame')).toBeNull();
    expect(container.querySelector('.sk-prem__body .sk-prem__when')!.textContent).toBe('Fri · 21:00');
    expect(screen.getByRole('button').querySelector('svg.sk-icon')).toBeTruthy();
  });

  it('with image the picture is hidden and the time moves above the title; compact narrows the frame', () => {
    const { container, rerender } = render(<PremiereSlot image="still.jpg" when="Fri" title="Episode 2" />);
    const img = container.querySelector('.sk-prem__frame--img img')!;
    expect(img.getAttribute('alt')).toBe('');
    expect(container.querySelector('.sk-prem__body .sk-prem__when')!.textContent).toBe('Fri');
    expect(screen.getByRole('button').querySelector('svg.sk-icon')).toBeNull();
    rerender(<PremiereSlot image="still.jpg" when="Fri" title="Episode 2" compact />);
    expect((container.querySelector('.sk-prem__frame--img') as HTMLElement).style.width).toBe('104px');
  });
});
