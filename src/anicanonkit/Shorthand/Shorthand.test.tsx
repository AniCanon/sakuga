import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Shorthand } from './Shorthand';

afterEach(cleanup);

describe('Shorthand', () => {
  it('without spoken the notation is read as written, and nothing is focusable', () => {
    const { container } = render(<Shorthand>C.U · low · T.U 0+00 → 5+00</Shorthand>);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe('SPAN');
    expect(root.className).toBe('sk-shorthand');
    expect(root.textContent).toBe('C.U · low · T.U 0+00 → 5+00');
    expect(root.querySelector('[aria-hidden]')).toBeNull();
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('with spoken a screen reader hears those words, and the notation is hidden from it', () => {
    const { container } = render(<Shorthand spoken="close-up, low angle, track up from 0 to 5 seconds" tone="accent" className="x">C.U · low · T.U</Shorthand>);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-shorthand is-accent x');
    const [shown, said] = [...root.children];
    expect(shown.getAttribute('aria-hidden')).toBe('true');
    expect(shown.textContent).toBe('C.U · low · T.U');
    expect(said.className).toBe('sk-sr');
    expect(said.textContent).toBe('close-up, low angle, track up from 0 to 5 seconds');
  });

  it('a settled one takes the secondary tone', () => {
    const { container } = render(<Shorthand tone="secondary">Approved</Shorthand>);
    expect(container.firstElementChild!.className).toBe('sk-shorthand is-secondary');
  });
});
