import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { slots } from './slots';

function Host({ children }: { children: React.ReactNode }) {
  const s = slots(children);
  return <div><p data-slot="action">{s.get('action')}</p><main>{s.body}</main></div>;
}
function Act({ children }: { children: React.ReactNode; slot?: string }) { return <button type="button">{children}</button>; }

describe('slots', () => {
  it('gives a wrapper\'s children and keeps a component whole, without the slot attribute', () => {
    const { container } = render(<Host><span slot="action">words</span><Act slot="action">All options</Act>body</Host>);
    const action = container.querySelector('[data-slot="action"]')!;
    expect(action.innerHTML).toBe('words<button type="button">All options</button>');
    expect(container.querySelector('[slot]')).toBeNull();
    expect(container.querySelector('main')!.textContent).toBe('body');
  });
});
