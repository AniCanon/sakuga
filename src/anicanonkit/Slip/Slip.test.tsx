import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Slip } from './Slip';

afterEach(cleanup);

describe('Slip', () => {
  it('reads its label, body and action in order; only the action takes focus', () => {
    const { container } = render(<Slip label="Check" className="x">Nobody on screen for 6 seconds.<span slot="action"><a href="#maki">Ask Maki</a></span></Slip>);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-slip x');
    expect(root.textContent).toBe('CheckNobody on screen for 6 seconds.Ask Maki');
    expect(root.querySelector('small')!.textContent).toBe('Check');
    expect(root.lastElementChild).toBe(screen.getByRole('link', { name: 'Ask Maki' }));
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(1);
  });

  it('done turns it into an outline and is said first', () => {
    const { container } = render(<Slip label="Why this cut" done>Push in on the line.</Slip>);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-slip is-done');
    expect(root.firstElementChild!.className).toBe('sk-sr');
    expect(root.textContent).toBe('Done. Why this cutPush in on the line.');
  });

  it('without a label it is the body alone', () => {
    const { container } = render(<Slip>A note.</Slip>);
    expect(container.querySelector('small')).toBeNull();
    expect(container.firstElementChild!.textContent).toBe('A note.');
  });
});
