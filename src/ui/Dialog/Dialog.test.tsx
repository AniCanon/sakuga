import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { Dialog } from './Dialog';

beforeEach(() => {
  vi.useFakeTimers();
  /* jsdom lays nothing out: every control counts as shown, as it would on a page */
  vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
  vi.spyOn(document, 'hasFocus').mockReturnValue(true);
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

function Plan({ body, footer = true }: { body?: ReactNode; footer?: boolean }) {
  const [open, set] = useState(false), close = () => set(false);
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => set(true)}>Choose a video plan</button>
      <Dialog open={open} onClose={close} title="Choose a video plan" description="Plans differ in motion polish." footer={footer ? [<Button key="a" variant="ghost" onClick={close}>Cancel</Button>, <Button key="b" onClick={close}>Use Regular</Button>] : undefined}>
        {body}
      </Dialog>
    </div>
  );
}

function openIt() {
  const opener = screen.getByRole('button', { name: 'Choose a video plan' });
  opener.focus();
  fireEvent.click(opener);
  return opener;
}

describe('Dialog', () => {
  it('is a modal dialog named by its title and described by its description', () => {
    render(<Plan />);
    expect(screen.queryByRole('dialog')).toBeNull();
    openIt();
    const d = screen.getByRole('dialog', { name: 'Choose a video plan', description: 'Plans differ in motion polish.' });
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('heading', { level: 2, name: 'Choose a video plan' })).toBeTruthy();
  });

  it('opens on the dialog itself, with no ring, when its body leads with no field', () => {
    render(<Plan body={<><button type="button" aria-pressed="false">Everyday</button><button type="button" aria-pressed="true">Festival</button></>} />);
    openIt();
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
  });

  it('focus moves to the field a form leads with; a control before the field opens it on the dialog', () => {
    render(<Plan body={<label>Name <input defaultValue="Fire" /></label>} />);
    openIt();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Name' }));
    cleanup();
    render(<Plan body={<><button type="button">Help</button><label>Name <input defaultValue="Fire" /></label></>} />);
    openIt();
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
  });

  it('the surface itself takes focus by script, never by Tab, so a press on its words keeps focus inside and Escape still closes it', () => {
    render(<Plan body={<p>Plans differ.</p>} />);
    openIt();
    const d = screen.getByRole('dialog');
    expect(d.getAttribute('tabindex')).toBe('-1');
    d.focus();
    fireEvent.keyDown(d, { key: 'Escape' });
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('with only words in its body it opens on the dialog too, footer or not', () => {
    render(<Plan body={<p>Plan cards go here.</p>} />);
    openIt();
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
    cleanup();
    render(<Plan body={<p>Plan cards go here.</p>} footer={false} />);
    openIt();
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
  });

  it('Tab and Shift+Tab stay inside it', () => {
    render(<Plan body={<button type="button">Regular</button>} />);
    openIt();
    const close = screen.getByRole('button', { name: 'Close' }), last = screen.getByRole('button', { name: 'Use Regular' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('Escape runs onClose, its exit plays on the scrim, and focus goes back to what opened it', () => {
    render(<Plan body={<button type="button">Regular</button>} />);
    const opener = openIt();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Regular' }), { key: 'Escape' });
    const scrim = screen.getByRole('dialog').parentElement!;
    expect(scrim.className).toBe('sk-dialog-scrim is-leaving');
    expect(document.activeElement).toBe(opener);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('"Close" and a click on the scrim run onClose; a click inside does not', () => {
    const close = vi.fn();
    render(<Dialog open title="Plan" onClose={close}><p>Body</p></Dialog>);
    fireEvent.click(screen.getByText('Body'));
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(close).toHaveBeenCalledTimes(2);
  });

  it('the footer is footer or children in slot="footer"; width sets --dialog-width, so it applies from 768 px up', () => {
    const { container } = render(<Dialog open title="Plan" width={520}><p>Body</p><span slot="footer"><button type="button">Done</button></span></Dialog>);
    expect(container.querySelector('.sk-dialog__foot')!.textContent).toBe('Done');
    expect(container.querySelector('.sk-dialog__body')!.textContent).toBe('Body');
    expect((screen.getByRole('dialog') as HTMLElement).style.getPropertyValue('--dialog-width')).toBe('520px');
    expect(screen.getByRole('dialog').getAttribute('aria-describedby')).toBeNull();
  });
});

describe('Dialog in a phone browser', () => {
  it('rises from the screen\'s foot at full width below 768 px, its foot clear of the home indicator', () => {
    const css = readFileSync('src/ui/Dialog/Dialog.css', 'utf8');
    expect(css).toContain('@media (max-width:767px){.sk-dialog-scrim{align-items:flex-end}}');
    expect(css).toContain('@media (max-width:767px){.sk-dialog{width:100%;max-height:var(--dialog-phone-max-height);border-radius:var(--dialog-radius) var(--dialog-radius) 0 0;padding-bottom:env(safe-area-inset-bottom,0px)}}');
  });
  it('a body that has scrolled marks the dialog is-scrolled, so a hairline parts the head from it; back at the top it goes', () => {
    render(<Plan body={<p>Plan cards</p>} />);
    openIt();
    const body = document.querySelector('.sk-dialog__body') as HTMLElement, dialog = body.parentElement!;
    body.scrollTop = 40;
    fireEvent.scroll(body);
    expect(dialog.classList.contains('is-scrolled')).toBe(true);
    body.scrollTop = 0;
    fireEvent.scroll(body);
    expect(dialog.classList.contains('is-scrolled')).toBe(false);
  });
});
