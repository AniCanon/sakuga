import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Stepper } from './Stepper';

afterEach(cleanup);

const steps = ['How', 'Approve', 'Portrait'];

describe('Stepper', () => {
  it('is an ordered list named by its label (default "Steps"), not focusable', () => {
    const { container, rerender } = render(<Stepper steps={steps} current={1} />);
    const list = screen.getByRole('list', { name: 'Steps' });
    expect(list.tagName).toBe('OL');
    expect(container.querySelectorAll('[tabindex],button,a')).toHaveLength(0);
    rerender(<Stepper steps={steps} current={1} label="Making a character" />);
    expect(screen.getByRole('list', { name: 'Making a character' })).toBeTruthy();
  });

  it('reads each step as its number and name, a done one as "Done:" and its name, the current one marked "current step"', () => {
    render(<Stepper steps={steps} current={1} />);
    const items = screen.getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['Done: How', '2Approve', '3Portrait']);
    expect(items[0].className).toBe('sk-stepper__step sk-stepper__step--done');
    expect(items[1].getAttribute('aria-current')).toBe('step');
    expect(items[2].getAttribute('aria-current')).toBeNull();
    expect(items[0].querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws a hidden line between steps, done up to the current one', () => {
    const { container } = render(<Stepper steps={steps} current={1} />);
    const seps = container.querySelectorAll('li.sk-stepper__sep');
    expect([...seps].map((s) => [s.className, s.getAttribute('aria-hidden')])).toEqual([['sk-stepper__sep is-done', 'true'], ['sk-stepper__sep', 'true']]);
  });

  it('variant bar is a progress bar named like "Step 2 of 3: Approve"', () => {
    const { container } = render(<Stepper variant="bar" tone="media" steps={steps} current={1} />);
    const bar = screen.getByRole('progressbar', { name: 'Step 2 of 3: Approve' });
    expect([bar.getAttribute('aria-valuemin'), bar.getAttribute('aria-valuenow'), bar.getAttribute('aria-valuemax')]).toEqual(['1', '2', '3']);
    expect(bar.className).toBe('sk-stepbar is-media');
    expect(container.querySelector('.sk-stepbar__label')!.textContent).toBe('Step 2 of 3 · Approve');
    expect([...container.querySelectorAll('.sk-stepbar__track i')].map((i) => i.className)).toEqual(['is-done', 'is-done', '']);
  });
});
