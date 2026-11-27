import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DialogueLine } from './DialogueLine';

afterEach(cleanup);

describe('DialogueLine', () => {
  it('reads the speaker, the delivery and where it falls, the line as a quotation, then the translation', () => {
    const { container } = render(<DialogueLine speaker="Kiko" delivery="quiet, certain" at="at 1.2 s" line="来なさい、ケン。" translation="Come here, Ken." className="x" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-dline x');
    expect(root.querySelector('b')!.textContent).toBe('Kiko · quiet, certain · at 1.2 s');
    expect(root.querySelector('q')!.textContent).toBe('来なさい、ケン。');
    expect(root.textContent).toBe('Kiko · quiet, certain · at 1.2 s来なさい、ケン。Come here, Ken.');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it("the speaker's picture is hidden", () => {
    render(<DialogueLine speaker="Kiko" line="Come here." image="kiko.jpg" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(document.querySelector('img')!.getAttribute('alt')).toBe('');
  });

  it('takes the line as children when it carries markup, and line wins over them', () => {
    const { container, rerender } = render(<DialogueLine speaker="Kiko"><del>Go</del> Come here.</DialogueLine>);
    expect(container.querySelector('q del')!.textContent).toBe('Go');
    rerender(<DialogueLine speaker="Kiko" line="Stay.">ignored</DialogueLine>);
    expect(container.querySelector('q')!.textContent).toBe('Stay.');
    expect(container.querySelector('small')).toBeNull();
  });

  it('marks a line in kana or kanji Japanese, so it is set in 「」; another line, or one named by lang, follows lang', () => {
    const { container, rerender } = render(<DialogueLine speaker="Kiko" line="来なさい、ケン。" translation="Come here, Ken." />);
    expect(container.querySelector('q')!.getAttribute('lang')).toBe('ja');
    rerender(<DialogueLine speaker="Kiko" line="Come here, Ken." />);
    expect(container.querySelector('q')!.hasAttribute('lang')).toBe(false);
    rerender(<DialogueLine speaker="Kiko" lang="en" line="来なさい" />);
    expect(container.querySelector('q')!.getAttribute('lang')).toBe('en');
    rerender(<DialogueLine speaker="Kiko" lang="ja">Kite</DialogueLine>);
    expect(container.querySelector('q')!.getAttribute('lang')).toBe('ja');
  });
});
