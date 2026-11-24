import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseScreenplay, serializeScreenplay } from './screenplay';
import { ScreenplayEditor } from './ScreenplayEditor';

afterEach(cleanup);

const SCENE = '## INT. TODDY’S BEDROOM — NIGHT\n\nHis phone lights up.\n\n@[Kiko:c1]:\n(quietly)\nPick up.\n\nCUT TO:';
const cast = [{ id: 'c1', name: 'Kiko' }, { id: 'c2', name: 'Toddy' }];
const lines = () => screen.getAllByRole('textbox');
/* jsdom has no layout, so the caret is put by hand where a person's would be */
function caretAt(el: HTMLElement, at: number) {
  const r = document.createRange();
  r.setStart(el.firstChild || el, at);
  r.collapse(true);
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  sel.addRange(r);
}

describe('ScreenplayEditor', () => {
  it('reads a scene’s Markdown as blocks of their kinds and writes it back as it was', () => {
    const blocks = parseScreenplay(SCENE);
    expect(blocks.map((b) => [b.type, b.text])).toEqual([
      ['slug', 'INT. TODDY’S BEDROOM — NIGHT'], ['action', 'His phone lights up.'], ['cue', '@Kiko'], ['paren', 'quietly'], ['dialogue', 'Pick up.'], ['transition', 'CUT TO:'],
    ]);
    expect(serializeScreenplay(blocks, cast)).toBe(SCENE);
    expect(parseScreenplay('').map((b) => b.type)).toEqual(['slug']);
    // A heading typed as action, and a cue in capitals, read as their kinds
    expect(parseScreenplay('EXT. ROOF — DAWN\n\nTODDY\nHold on.').map((b) => b.type)).toEqual(['slug', 'cue', 'dialogue']);
  });

  it('is a group named Script, described by its keys; each block a textbox named by its kind, one Tab stop', () => {
    render(<ScreenplayEditor value={SCENE} />);
    const group = screen.getByRole('group', { name: 'Script' });
    expect(document.getElementById(group.getAttribute('aria-describedby')!)!.textContent).toContain('Escape, then Tab, leaves the script');
    expect(lines().map((l) => l.getAttribute('aria-label'))).toEqual(['Scene heading', 'Action', 'Character', 'Parenthetical', 'Dialogue', 'Transition']);
    expect(lines().map((l) => l.tabIndex)).toEqual([0, -1, -1, -1, -1, -1]);
    expect(lines()[1].getAttribute('aria-multiline')).toBe('true');
    expect(lines()[0].getAttribute('aria-multiline')).toBe('false');
  });

  it('Enter starts the next block of its natural kind, an action that begins INT. becomes a heading, and the Markdown follows', () => {
    const onChange = vi.fn();
    render(<ScreenplayEditor value={'## INT. FLAT — NIGHT'} onChange={onChange} />);
    const head = lines()[0];
    act(() => { head.focus(); caretAt(head, head.textContent!.length); });
    fireEvent.keyDown(head, { key: 'Enter' });
    expect(lines().map((l) => l.getAttribute('aria-label'))).toEqual(['Scene heading', 'Action']);
    expect(document.activeElement).toBe(lines()[1]);
    lines()[1].textContent = 'EXT. ROOF — DAWN';
    act(() => { caretAt(lines()[1], 16); });
    fireEvent.keyDown(lines()[1], { key: 'Enter' });
    expect(lines().map((l) => l.getAttribute('aria-label'))).toEqual(['Scene heading', 'Scene heading', 'Action']);
    expect(onChange).toHaveBeenLastCalledWith('## INT. FLAT — NIGHT\n\nEXT. ROOF — DAWN');
  });

  it('Tab changes a block’s kind and says it; Escape, then Tab, leaves the script', () => {
    const onKind = vi.fn();
    render(<ScreenplayEditor value={'## INT. FLAT\n\nKiko waits.'} onKind={onKind} />);
    const action = lines()[1];
    act(() => { action.focus(); });
    expect(fireEvent.keyDown(action, { key: 'Tab' })).toBe(false);
    expect(lines()[1].getAttribute('aria-label')).toBe('Character');
    expect(onKind).toHaveBeenLastCalledWith('cue');
    expect(document.querySelector('[aria-live="polite"]')!.textContent).toBe('Character');
    fireEvent.keyDown(lines()[1], { key: 'Escape' });
    expect(fireEvent.keyDown(lines()[1], { key: 'Tab' })).toBe(true);
  });

  it('Backspace at a block’s start joins it to the one before', () => {
    const onChange = vi.fn();
    render(<ScreenplayEditor value={'## INT. FLAT\n\nKiko\n\nwaits.'} onChange={onChange} />);
    expect(lines()).toHaveLength(3);
    act(() => { lines()[2].focus(); caretAt(lines()[2], 0); });
    fireEvent.keyDown(lines()[2], { key: 'Backspace' });
    expect(lines()).toHaveLength(2);
    expect(lines()[1].textContent).toBe('Kikowaits.');
  });

  it('@ at the start of a word lists the cast under the line, and the one chosen is saved as its token', () => {
    const onChange = vi.fn();
    render(<ScreenplayEditor value={'## INT. FLAT\n\nThen '} onChange={onChange} mentions={{ cast }} />);
    const action = lines()[1];
    act(() => { action.focus(); });
    action.textContent = 'Then @Ki';
    act(() => { caretAt(action, 8); });
    fireEvent.input(action);
    const list = screen.getByRole('listbox');
    expect(action.getAttribute('aria-controls')).toBe(list.id);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['@Kiko']);
    fireEvent.keyDown(action, { key: 'Enter' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith('## INT. FLAT\n\nThen @[Kiko:c1] ');
  });
});
