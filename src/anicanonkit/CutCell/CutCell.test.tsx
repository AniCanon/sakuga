import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CutCell } from './CutCell';

afterEach(cleanup);

describe('CutCell', () => {
  it('reads the cut number and its note as text, and nothing in it is focusable', () => {
    const { container } = render(<CutCell number="2C" note="V3" className="x" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-cutcell x');
    expect(root.textContent).toBe('2CV3');
    expect(root.querySelector('b')!.textContent).toBe('2C');
    expect(root.querySelector('small')!.textContent).toBe('V3');
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('the approval is an image named Approved or Waiting for you, with its check', () => {
    const { rerender } = render(<CutCell number="2A" state="approved" />);
    const ok = screen.getByRole('img', { name: 'Approved' });
    expect(ok.className).toBe('sk-cutcell__state is-approved');
    expect(ok.getAttribute('title')).toBe('Approved');
    expect(ok.querySelector('svg.sk-icon')).toBeTruthy();
    rerender(<CutCell number="2B" state="waiting" />);
    expect(screen.getByRole('img', { name: 'Waiting for you' }).className).toBe('sk-cutcell__state is-waiting');
  });

  it('stateLabel names the approval instead', () => {
    render(<CutCell number="2B" state="waiting" stateLabel="Waiting for Raul" />);
    const st = screen.getByRole('img', { name: 'Waiting for Raul' });
    expect(st.getAttribute('title')).toBe('Waiting for Raul');
  });
});
