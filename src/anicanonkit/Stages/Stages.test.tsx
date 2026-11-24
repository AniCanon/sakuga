import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Stages, type StagesProps } from './Stages';

const live = () => document.querySelector('[aria-live="polite"]');

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

const items: StagesProps['items'] = [
  { title: 'Face locked in', text: 'Studied the reference', state: 'done', time: '0:52' },
  { title: 'Designing the first look', text: 'The gray pinstripe dress', state: 'running', time: '0:31' },
  { title: 'Composing the identity sheet', state: 'todo' },
  { title: 'Voice', text: 'The provider refused the line', state: 'failed', time: '0:04' },
];

describe('Stages', () => {
  it('is an ordered list named Stages by default, or by label, and nothing in it is focusable', () => {
    const { container, rerender } = render(<Stages items={items} />);
    const list = screen.getByRole('list', { name: 'Stages' });
    expect(list.tagName).toBe('OL');
    expect(list.className).toBe('sk-stages');
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
    rerender(<Stages items={items} label="Making Kiko" size="sm" />);
    expect(screen.getByRole('list', { name: 'Making Kiko' }).className).toBe('sk-stages sk-stages--sm');
  });

  it('reads each stage as its title, with done or failed, then its text and time', () => {
    render(<Stages items={items} />);
    const [done, running, todo, failed] = screen.getAllByRole('listitem');
    expect(done.className).toBe('sk-stages__item is-done');
    expect(done.querySelector('.sk-stages__text')!.textContent).toBe('Face locked in, doneStudied the reference');
    expect(done.querySelector('.sk-stages__time')!.textContent).toBe('0:52');
    expect(failed.querySelector('b')!.textContent).toBe('Voice, failed');
    expect(running.querySelector('b')!.textContent).toBe('Designing the first look');
    expect(todo.querySelector('b')!.textContent).toBe('Composing the identity sheet');
    expect(todo.querySelector('.sk-stages__time')!.textContent).toBe('—');
    expect(todo.querySelector('.sk-stages__mark')!.textContent).toBe('3');
    expect(done.querySelector('.sk-stages__mark svg.sk-icon')).toBeTruthy();
  });

  it('marks the running one as the current step, and its loader says the title once when it appears', () => {
    render(<Stages items={[{ title: 'Face locked in', state: 'done' }, { title: 'Composing the sheet', state: 'running' }]} />);
    const [done, running] = screen.getAllByRole('listitem');
    expect(running.getAttribute('aria-current')).toBe('step');
    expect(done.getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('status', { name: 'Composing the sheet' })).toBeTruthy();
    act(() => { vi.advanceTimersByTime(100); });
    expect(live()!.textContent).toBe('Composing the sheet');
  });

  it('a running stage with no time shows none', () => {
    render(<Stages items={[{ title: 'Drawing', state: 'running' }]} />);
    expect(screen.getByRole('listitem').querySelector('.sk-stages__time')!.textContent).toBe('');
  });

  it('a mark settles in only when its stage changes, not on arrival', () => {
    const { rerender } = render(<Stages items={[{ title: 'A', state: 'running' }, { title: 'B' }]} />);
    const marks = () => [...document.querySelectorAll('.sk-stages__mark')];
    expect(marks().map((m) => m.classList.contains('is-fresh'))).toEqual([false, false]);
    rerender(<Stages items={[{ title: 'A', state: 'done' }, { title: 'B', state: 'running' }]} />);
    expect(marks().map((m) => m.classList.contains('is-fresh'))).toEqual([true, true]);
  });
});
