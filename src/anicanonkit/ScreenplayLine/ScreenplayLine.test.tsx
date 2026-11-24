import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ScreenplayLine } from './ScreenplayLine';

afterEach(cleanup);

describe('ScreenplayLine', () => {
  it('is action by default, read as plain text, and nothing is focusable', () => {
    const { container } = render(<ScreenplayLine className="x">A white room with no windows.</ScreenplayLine>);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-spl sk-spl--action x');
    expect(root.textContent).toBe('A white room with no windows.');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('a cue is followed by its extension in brackets', () => {
    const { container } = render(<ScreenplayLine type="cue" extension="O.S.">Kiko</ScreenplayLine>);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-spl sk-spl--cue');
    expect(root.textContent).toBe('Kiko (O.S.)');
    expect(root.querySelector('small')!.textContent).toBe(' (O.S.)');
  });

  it('an extension only shows on a cue', () => {
    const { container } = render(<ScreenplayLine type="dialogue" extension="O.S.">You kept it.</ScreenplayLine>);
    expect(container.firstElementChild!.textContent).toBe('You kept it.');
  });

  it('a flagged block ends with "story conflict", said but not shown', () => {
    const { container } = render(<ScreenplayLine type="slug" flagged>INT. WHITE ROOM - NIGHT</ScreenplayLine>);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-spl sk-spl--slug is-flagged');
    expect(root.textContent).toBe('INT. WHITE ROOM - NIGHT, story conflict');
    expect(root.querySelector('.sk-sr')!.textContent).toBe(', story conflict');
  });
});
