import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EditorHeader } from './EditorHeader';

afterEach(cleanup);

describe('EditorHeader', () => {
  it('the title is a level-1 heading; the timecode and status read as text; the check is hidden', () => {
    const { container } = render(<EditorHeader title="The First Watch" timecode="Cut · 2:41 + 04f of 6:40" status="Rebuilds exactly" statusHint="Every cut is kept" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-editor__head');
    expect(screen.getByRole('heading', { level: 1, name: 'The First Watch' }).tagName).toBe('B');
    expect(root.querySelector('.sk-editor__tc')!.textContent).toBe('Cut · 2:41 + 04f of 6:40');
    const status = root.querySelector('.sk-editor__status')!;
    expect(status.textContent).toBe('Rebuilds exactly');
    expect(status.getAttribute('title')).toBe('Every cut is kept');
    expect(status.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('the actions are their own buttons, in order, after the fill', () => {
    const { container } = render(<EditorHeader title="T"><button type="button">Share</button><button type="button">Screen the cut</button></EditorHeader>);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Share', 'Screen the cut']);
    expect(container.querySelector('.sk-editor__fill')!.nextElementSibling!.textContent).toBe('Share');
    expect(container.querySelector('.sk-editor__tc')).toBeNull();
    expect(container.querySelector('.sk-editor__status')).toBeNull();
  });
});
