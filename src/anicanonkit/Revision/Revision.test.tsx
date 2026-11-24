import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Revision } from './Revision';

afterEach(cleanup);

describe('Revision', () => {
  it('reads "Removed:" and the old words, then "Added:" and the new ones, the labels said but not shown', () => {
    const { container } = render(<Revision before="comes down the stairs" after="steps out of the smoke" className="x" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-revision x');
    expect(root.textContent).toBe('Removed: comes down the stairs Added: steps out of the smoke');
    expect(root.querySelector('del')!.textContent).toBe('comes down the stairs');
    expect(root.querySelector('ins')!.textContent).toBe('steps out of the smoke');
    expect([...root.querySelectorAll('.sk-sr')].map((s) => s.textContent)).toEqual(['Removed: ', 'Added: ']);
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('without before it is only an insertion', () => {
    const { container } = render(<Revision after="She does not look back." />);
    const root = container.firstElementChild!;
    expect(root.textContent).toBe('Added: She does not look back.');
    expect(root.querySelector('del')).toBeNull();
  });
});
