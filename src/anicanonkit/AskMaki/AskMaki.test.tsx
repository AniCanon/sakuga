import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AskMaki } from './AskMaki';

afterEach(cleanup);

describe('AskMaki', () => {
  it('a button named "Ask Maki" that runs onClick; Maki’s face is hidden', () => {
    const onClick = vi.fn();
    render(<AskMaki avatar="maki.png" onClick={onClick} />);
    const b = screen.getByRole('button', { name: 'Ask Maki' });
    expect(b.className).toBe('sk-btn sk-btn--secondary sk-btn--sm sk-ask-maki');
    expect(b.querySelector('img')!.getAttribute('alt')).toBe('');
    expect(b.hasAttribute('aria-expanded')).toBe(false);
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('with count it is heard "label, n to look at"; open says expanded or collapsed', () => {
    const { rerender } = render(<AskMaki avatar="m.png" label="Maki" size="md" shape="pill" count="3" open />);
    const b = screen.getByRole('button', { name: 'Maki, 3 to look at' });
    expect(b.getAttribute('aria-expanded')).toBe('true');
    expect(b.className).toBe('sk-btn sk-btn--secondary sk-btn--md sk-btn--pill sk-ask-maki is-open');
    expect(b.querySelector('em')!.textContent).toBe('3');
    rerender(<AskMaki avatar="m.png" label="Maki" size="md" shape="pill" open={false} />);
    expect(screen.getByRole('button', { name: 'Maki' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('href makes it a link', () => {
    render(<AskMaki avatar="m.png" href="/maki" variant="ghost" label="Ask Maki how it could be answered" />);
    const a = screen.getByRole('link', { name: 'Ask Maki how it could be answered' });
    expect(a.getAttribute('href')).toBe('/maki');
    expect(a.className).toContain('sk-btn--ghost');
  });
});
