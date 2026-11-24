import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Sheet } from './Sheet';

beforeEach(() => {
  /* jsdom lays nothing out and has no window focus: every control counts as shown, and the page as the one the person is in */
  vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
  vi.spyOn(document, 'hasFocus').mockReturnValue(true);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const css = readFileSync('src/ui/Sheet/Sheet.css', 'utf8');

function Audio({ onClose = () => {} }: { onClose?: () => void }) {
  const [audio, setAudio] = useState('English');
  return (
    <Sheet open title="Audio and subtitles" onClose={onClose}>
      <Sheet.Group title="Audio">
        {['Japanese', 'English'].map((x) => <Sheet.Option key={x} selected={audio === x} onSelect={() => setAudio(x)}>{x}</Sheet.Option>)}
      </Sheet.Group>
    </Sheet>
  );
}

describe('Sheet', () => {
  it('is a modal dialog named by its title, and draws nothing while closed', () => {
    const { rerender } = render(<Sheet open={false} title="Audio">x</Sheet>);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<Sheet open title="Audio">x</Sheet>);
    const d = screen.getByRole('dialog', { name: 'Audio' });
    expect(d.getAttribute('aria-modal')).toBe('true');
  });

  it('starts focus on the chosen option, and each option is a toggle with its check hidden', () => {
    render(<Audio />);
    const chosen = screen.getByRole('button', { name: 'English', pressed: true });
    expect(document.activeElement).toBe(chosen);
    expect(screen.getByRole('button', { name: 'Japanese', pressed: false })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Audio' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Japanese' }));
    expect(screen.getByRole('button', { name: 'Japanese', pressed: true })).toBeTruthy();
  });

  it('with no chosen option, starts focus on a selected chip', () => {
    render(
      <Sheet open title="Outfit for Kiko">
        <button type="button" aria-pressed="false">casual</button>
        <button type="button" aria-pressed="true">transformed</button>
      </Sheet>,
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'transformed' }));
  });

  it('closes on Done, on the scrim, and on Escape', () => {
    const onClose = vi.fn();
    render(<Audio onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    fireEvent.click(document.querySelector('.sk-sheet-scrim')!);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('drops Done with doneLabel null, and names it with doneLabel', () => {
    const { rerender } = render(<Sheet open title="Sé station" doneLabel={null}>x</Sheet>);
    expect(screen.queryByRole('button', { name: 'Done' })).toBeNull();
    rerender(<Sheet open title="Sé station" doneLabel="Close">x</Sheet>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('sits on the screen, not the page', () => {
    expect(css).toMatch(/\.sk-sheet\{[^}]*position:fixed/);
  });
  it('its groups sit in a body that scrolls between the handle and Done', () => {
    render(<Audio />);
    const sheet = screen.getByRole('dialog', { name: 'Audio and subtitles' });
    expect([...sheet.children].map((c) => c.className)).toEqual(['sk-sheet__handle', 'sk-sheet__body', 'sk-sheet__done']);
    expect(sheet.querySelector('.sk-sheet__body > [role="group"]')).not.toBeNull();
    expect(css).toContain('.sk-sheet__body{flex:1 1 auto;min-height:0;overflow-y:auto');
  });
});
