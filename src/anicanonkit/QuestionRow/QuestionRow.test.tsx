import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { QuestionRow } from './QuestionRow';

afterEach(cleanup);

describe('QuestionRow', () => {
  it('reads the question in quotes, "selected", its badge and note, then the three steps with their events; not focusable', () => {
    const { container } = render(<QuestionRow question="Where is Arthur?" note="Raised in Cell four" selected planted={{ label: 'Smoke', told: 'Episode 1' }} raised={[{ label: 'Cell four' }]} />);
    const row = container.firstElementChild!;
    expect(row.className).toBe('sk-qrow is-selected');
    expect(row.textContent).toBe('“Where is Arthur?”, selectedWaitingRaised in Cell fourPlantedSmoke, told in Episode 1RaisedCell fourAnsweredAnswer it');
    expect(row.querySelector('.sk-qrow__event')!.getAttribute('title')).toBe('Told in Episode 1');
    expect(row.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('pictures and arrows are hidden', () => {
    const { container } = render(<QuestionRow question="Q" planted={{ label: 'A', image: 'a.jpg' }} />);
    expect(container.querySelector('img.sk-ev--place')!.getAttribute('alt')).toBe('');
    expect((container.querySelector('img.sk-ev--place') as HTMLElement).style.width).toBe('30px');
    container.querySelectorAll('.sk-qrow__arrow svg, .sk-qrow__empty svg').forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
    expect(container.querySelectorAll('.sk-qrow__arrow')).toHaveLength(2);
  });

  it('states: waiting, quiet and answered (faded), with "Not raised yet" for no raised step', () => {
    const { container, rerender } = render(<QuestionRow question="Q" state="quiet" planted={{ label: 'A' }} />);
    expect(container.querySelector('.sk-badge')!.textContent).toBe('Quiet');
    expect(container.querySelector('.sk-qrow__step:nth-child(3) .sk-qrow__empty')!.textContent).toBe('Not raised yet');
    rerender(<QuestionRow question="Q" state="answered" planted={{ label: 'A' }} raised={[{ label: 'B' }, { label: 'C' }]} answered={{ label: 'D', told: 'Manga 2' }} />);
    expect(container.firstElementChild!.className).toBe('sk-qrow is-done');
    expect(container.querySelector('.sk-badge')!.textContent).toBe('Answered');
    expect(container.querySelectorAll('.sk-qrow__event')).toHaveLength(4);
    expect(container.querySelector('.sk-qrow__empty')).toBeNull();
  });
});
