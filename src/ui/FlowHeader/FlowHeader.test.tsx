import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FlowHeader } from './FlowHeader';

afterEach(cleanup);

describe('FlowHeader', () => {
  it('is a header: Tab reaches the close button, named by closeLabel, then what sits at the end', () => {
    const close = vi.fn();
    const { container } = render(<FlowHeader title="New issue" closeLabel="Close. Nothing is created" onClose={close}><span slot="end"><button type="button">9,427 fragments</button></span></FlowHeader>);
    const header = container.firstElementChild!;
    expect(header.tagName).toBe('HEADER');
    expect(header.className).toBe('sk-flowhead');
    expect([...header.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') || b.textContent)).toEqual(['Close. Nothing is created', '9,427 fragments']);
    fireEvent.click(screen.getByRole('button', { name: 'Close. Nothing is created' }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(header.querySelector('.sk-flowhead__end')!.textContent).toBe('9,427 fragments');
  });

  it('closes with "Close" by default, a link with closeHref', () => {
    const { rerender } = render(<FlowHeader title="New issue" />);
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    rerender(<FlowHeader title="New issue" closeHref="/manga" />);
    expect(screen.getByRole('link', { name: 'Close' }).getAttribute('href')).toBe('/manga');
  });

  it('the title and context are a level-1 heading', () => {
    render(<FlowHeader title="New issue" context="Bad Memories" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('New issue · Bad Memories');
  });

  it('steps are a list named by stepsLabel (default "Steps"), the current one marked "current step"', () => {
    const { rerender } = render(<FlowHeader title="New character" steps={['Basics', 'How to make', 'Approve']} current={1} />);
    const list = screen.getByRole('list', { name: 'Steps' });
    expect(list.className).toBe('sk-stepper sk-flowhead__steps');
    expect(screen.getAllByRole('listitem').find((li) => li.getAttribute('aria-current') === 'step')!.textContent).toBe('2How to make');
    rerender(<FlowHeader title="New character" steps={['Basics', 'Approve']} current={0} stepsLabel="Making a character" />);
    expect(screen.getByRole('list', { name: 'Making a character' })).toBeTruthy();
    rerender(<FlowHeader title="New character" />);
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('children without a slot sit at the end too', () => {
    const { container } = render(<FlowHeader title="New issue" className="x"><span>9,427</span></FlowHeader>);
    expect(container.querySelector('.sk-flowhead__end')!.textContent).toBe('9,427');
    expect(container.firstElementChild!.className).toBe('sk-flowhead x');
  });
});
