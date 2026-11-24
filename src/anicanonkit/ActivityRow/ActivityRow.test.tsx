import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityRow } from './ActivityRow';

afterEach(cleanup);

describe('ActivityRow', () => {
  it('is a button announced as "Activity: N running", described by its line, collapsed by default', () => {
    render(<ActivityRow count={2} line="Tattoo · designing the look" />);
    const b = screen.getByRole('button', { name: 'Activity: 2 running' });
    expect(b.className).toBe('sk-activity-row');
    expect(b.getAttribute('type')).toBe('button');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    const line = document.getElementById(b.getAttribute('aria-describedby')!)!;
    expect(line.tagName).toBe('SMALL');
    expect(line.textContent).toBe('Tattoo · designing the look');
    expect(b.querySelector('b')!.textContent).toBe('2 running');
  });

  it('says expanded from expanded, and has no description without a line', () => {
    render(<ActivityRow count={1} expanded />);
    const b = screen.getByRole('button', { name: 'Activity: 1 running' });
    expect(b.getAttribute('aria-expanded')).toBe('true');
    expect(b.getAttribute('aria-describedby')).toBeNull();
    expect(b.querySelector('small')).toBeNull();
  });

  it('runs onClick, which Enter and Space reach as a native button', () => {
    const onClick = vi.fn();
    render(<ActivityRow count={3} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Activity: 3 running' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button').tagName).toBe('BUTTON');
  });

  it('draws AniCanon’s loader and the chevron, both kept from the button’s name, the chevron hidden', () => {
    const { container } = render(<ActivityRow count={2} />);
    const loader = container.querySelector('.sk-loader')!;
    expect(loader.getAttribute('aria-label')).toBe('2 running');
    expect(loader.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    const chev = container.querySelector('svg.sk-activity-row__chev')!;
    expect(chev.getAttribute('aria-hidden')).toBe('true');
  });

  it('says what waits after what runs; with nothing running, a state dot stands where the loader turns', () => {
    const { container, rerender } = render(<ActivityRow count={4} waiting={2} />);
    expect(screen.getByRole('button', { name: 'Activity: 4 running, 2 waiting' }).querySelector('b')!.textContent).toBe('4 running · 2 waiting');
    expect(container.querySelector('.sk-loader')).toBeTruthy();
    rerender(<ActivityRow count={0} waiting={2} />);
    expect(screen.getByRole('button', { name: 'Activity: 2 waiting' }).querySelector('b')!.textContent).toBe('2 waiting');
    expect(container.querySelector('.sk-loader')).toBeNull();
    expect(container.querySelector('.sk-activity-row__waits')!.getAttribute('aria-hidden')).toBe('true');
  });
});
