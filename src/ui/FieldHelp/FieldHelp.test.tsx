import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldHelp } from './FieldHelp';

afterEach(cleanup);

const css = readFileSync('src/ui/FieldHelp/FieldHelp.css', 'utf8');

const help = () => render(<FieldHelp label="Depth of field" title="Controls how much of the frame is in focus.">Examples: shallow, deep.</FieldHelp>);

describe('FieldHelp', () => {
  it('is a button Tab reaches, named About plus its label and described by its tip', () => {
    help();
    const b = screen.getByRole('button', { name: 'About Depth of field' });
    expect(b.tabIndex).toBe(0);
    expect(b.getAttribute('type')).toBe('button');
    expect(b.querySelector('svg.sk-icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { description: /^Controls how much of the frame is in focus. ?Examples: shallow, deep.$/ })).toBe(b);
    expect(screen.getByRole('tooltip').id).toBe(b.getAttribute('aria-describedby'));
  });

  it('says About this field without a label', () => {
    render(<FieldHelp label="">Words</FieldHelp>);
    expect(screen.getByRole('button', { name: 'About this field' })).toBeTruthy();
  });

  it('shows its tip open when asked', () => {
    const { container } = render(<FieldHelp label="Shot" open>Words</FieldHelp>);
    expect(container.firstElementChild!.className).toBe('sk-help sk-help--open');
  });

  it('hides the tip on Escape, keeping that Escape, then lets the next one through', () => {
    const outer = vi.fn();
    const { container } = render(<div onKeyDown={outer}><FieldHelp label="Shot">Words</FieldHelp></div>);
    const b = screen.getByRole('button');
    fireEvent.keyDown(b, { key: 'Escape' });
    expect(container.querySelector('.sk-help')!.className).toBe('sk-help is-dismissed');
    expect(outer).not.toHaveBeenCalled();
    fireEvent.keyDown(b, { key: 'Escape' });
    expect(outer).toHaveBeenCalledOnce();
  });

  it('shows the tip again once focus or the pointer leaves', () => {
    const { container } = help();
    const box = container.querySelector('.sk-help')!, b = screen.getByRole('button');
    fireEvent.keyDown(b, { key: 'Escape' });
    fireEvent.blur(b);
    expect(box.className).toBe('sk-help');
    fireEvent.keyDown(b, { key: 'Escape' });
    fireEvent.mouseLeave(box);
    expect(box.className).toBe('sk-help');
  });
  it('closes a tip the pointer opened on Escape, wherever focus is, until the pointer leaves', () => {
    const { container } = help();
    const box = container.querySelector('.sk-help')!;
    fireEvent.mouseEnter(box);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(box.className).toBe('sk-help is-dismissed');
    fireEvent.mouseLeave(box);
    expect(box.className).toBe('sk-help');
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(box.className).toBe('sk-help');
  });

  it('can be hovered without closing, is a 24px target, and does not scale under reduced motion', () => {
    expect(css).toContain('@media (hover:hover){.sk-help:hover .sk-help__tip{pointer-events:auto}}');
    expect(css).toContain('.sk-help__tip::after{content:"";position:absolute;left:0;right:0;top:100%;height:var(--field-help-tip-bottom)}');
    expect(css).toContain('.sk-help button::after{content:"";position:absolute;inset:calc((var(--field-help-button-size) - var(--field-help-target-size)) / 2)}');
    expect(css).toContain('--field-help-target-size:calc(var(--field-help-button-size) + 2 * var(--gap-2xs))');
    expect(css).toContain('@media (prefers-reduced-motion:reduce){.sk-help button:active{transform:none}}');
  });

  describe('with examples', () => {
    const ex = [
      { name: 'In the background', text: 'There and drawn right, but not the point.', placeholder: 'Small, in a wide shot' },
      { name: 'Matters here', text: 'Clearly in the shot.' },
      { name: 'Close detail', text: 'The camera goes close.', image: '/close.png', alt: 'Goggles, close' },
    ];
    const level = (more: Partial<Parameters<typeof FieldHelp>[0]> = {}) => render(
      <FieldHelp label="How much it matters" title="How much a thing matters in this shot" examples={ex} {...more}>The drawing follows the level you choose.</FieldHelp>,
    );

    it('is a button that opens a dialog named by its title on a press, with a picture for each case', () => {
      level();
      const b = screen.getByRole('button', { name: 'About How much it matters' });
      expect(b.getAttribute('aria-haspopup')).toBe('dialog');
      expect(b.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByRole('dialog')).toBeNull();
      fireEvent.click(b);
      expect(b.getAttribute('aria-expanded')).toBe('true');
      const d = screen.getByRole('dialog', { name: 'How much a thing matters in this shot' });
      expect(b.getAttribute('aria-controls')).toBe(d.id);
      expect(screen.getByRole('heading', { name: 'How much a thing matters in this shot' })).toBeTruthy();
      expect(screen.getByText('The drawing follows the level you choose.')).toBeTruthy();
      expect(screen.getByText('Small, in a wide shot')).toBeTruthy();
      expect(screen.getAllByText('Matters here')).toHaveLength(2);
      expect(screen.getByRole('img', { name: 'Goggles, close' })).toBeTruthy();
    });

    it('opens above the ⓘ when there is no room under it, and stays on screen', () => {
      const rect = (top: number, height: number) => ({ top, bottom: top + height, left: 100, right: 120, width: 20, height, x: 100, y: top, toJSON() {} });
      const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        return this.tagName === 'BUTTON' && this.closest('.sk-help') ? rect(window.innerHeight - 40, 20) : rect(0, window.innerHeight);
      });
      const h = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
      try {
        level();
        fireEvent.click(screen.getByRole('button', { name: 'About How much it matters' }));
        const top = parseFloat((screen.getByRole('dialog').closest('.sk-help-ex') as HTMLElement).style.top);
        expect(top).toBe(window.innerHeight - 40 - 8 - 300);
      } finally {
        spy.mockRestore();
        h.mockRestore();
      }
    });

    it('closes on Got it, calling onClose', () => {
      const onClose = vi.fn();
      level({ onClose });
      fireEvent.click(screen.getByRole('button', { name: 'About How much it matters' }));
      fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes on Escape', () => {
      level();
      fireEvent.click(screen.getByRole('button', { name: 'About How much it matters' }));
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('opens by itself with open, and is a modal Dialog with dialog and doneLabel', () => {
      level({ open: true, dialog: true, doneLabel: 'Understood' });
      const d = screen.getByRole('dialog', { name: 'How much a thing matters in this shot' });
      expect(d.getAttribute('aria-modal')).toBe('true');
      expect(screen.getByRole('button', { name: 'Understood' })).toBeTruthy();
    });
  });
});
