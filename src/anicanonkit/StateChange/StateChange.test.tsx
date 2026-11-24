import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StateChange } from './StateChange';

afterEach(cleanup);

describe('StateChange', () => {
  it('reads "Changed from", the before badge, "to" and the after badge; the arrow is hidden; nothing is focusable', () => {
    const { container } = render(<StateChange before="Friends" after="Rivals" afterVariant="alert" afterIcon="bolt" beforeIcon="heart" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-state');
    expect(root.textContent).toBe('Changed from Friends to Rivals');
    expect(root.querySelector('.sk-state__before .sk-badge')!.textContent).toBe('Friends');
    expect(root.querySelector('.sk-state__after .sk-badge')!.className).toContain('sk-badge--alert');
    expect(root.querySelector('.sk-state__arrow svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('with no before it reads the after badge alone', () => {
    const { container } = render(<StateChange after="Burning" />);
    expect(container.firstElementChild!.textContent).toBe('Burning');
    expect(container.querySelector('.sk-sr')).toBeNull();
    expect(container.querySelector('.sk-state__before')).toBeNull();
  });

  it('the after badge settles in fresh when it changes, not when it first appears', () => {
    const { container, rerender } = render(<StateChange before="Calm" after="Wary" />);
    expect(container.querySelector('.sk-state__after')!.className).toBe('sk-state__after');
    rerender(<StateChange before="Calm" after="Burning" />);
    expect(container.querySelector('.sk-state__after')!.className).toBe('sk-state__after is-fresh');
  });
});
