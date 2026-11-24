import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MakiStep } from '../MakiStep/MakiStep';
import { MakiTurn } from './MakiTurn';

afterEach(cleanup);

describe('MakiTurn', () => {
  it('reads as "Maki:" and the reply, the steps first; no who-line, no box, not focusable itself', () => {
    const { container } = render(<MakiTurn steps={<MakiStep done label="Read the story" detail="26 events" />}><p>Three things don’t hold up.</p></MakiTurn>);
    const t = container.firstElementChild!;
    expect(t.className).toBe('sk-mk-reply');
    expect(t.textContent).toBe('Maki: Read the story26 eventsThree things don’t hold up.');
    expect(t.querySelector('.sk-sr')!.textContent).toBe('Maki: ');
    expect(t.querySelector('img')).toBeNull();
    expect(t.querySelectorAll('[tabindex], button, a')).toHaveLength(0);
  });

  it('actions are the quiet row under the reply, as a prop or slot="actions"', () => {
    const { container } = render(<MakiTurn><p>Done.</p><span slot="actions"><button>More</button></span></MakiTurn>);
    expect(container.querySelector('.sk-mk-reply__actions button')!.textContent).toBe('More');
    expect(container.querySelector('.sk-mk-reply__say')!.textContent).toBe('Done.');
  });
});

describe('MakiTurn writing', () => {
  it('writing: Maki’s loader says "Maki is writing…" once, the words beside it hidden; a string replaces them', () => {
    const { container, rerender } = render(<MakiTurn writing />);
    const w = container.querySelector('.sk-mk-writing')!;
    expect(w.querySelector(':scope > span[aria-hidden="true"]')!.textContent).toBe('Maki is writing…');
    rerender(<MakiTurn writing="Reading the story…" />);
    expect(container.querySelector('.sk-mk-writing > span[aria-hidden="true"]')!.textContent).toBe('Reading the story…');
  });
});
