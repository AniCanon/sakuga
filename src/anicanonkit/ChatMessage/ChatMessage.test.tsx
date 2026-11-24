import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ChatMessage } from './ChatMessage';

afterEach(cleanup);

describe('ChatMessage', () => {
  it('reads as plain text after who sent it, "You" by default, said but not shown; not focusable', () => {
    const { container } = render(<ChatMessage>Fix the last train</ChatMessage>);
    const m = container.firstElementChild!;
    expect(m.className).toBe('sk-mk-mine');
    expect(m.textContent).toBe('You: Fix the last train');
    expect(m.querySelector('.sk-sr')!.textContent).toBe('You: ');
    expect(m.querySelectorAll('[tabindex], button, a')).toHaveLength(0);
  });

  it('name says who sent it', () => {
    const { container } = render(<ChatMessage name="Raul" className="x">Hi</ChatMessage>);
    expect(container.firstElementChild!.className).toBe('sk-mk-mine x');
    expect(container.textContent).toBe('Raul: Hi');
  });
});
