import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu } from './Menu';

const css = readFileSync('src/ui/Menu/Menu.css', 'utf8');

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function More({ onDelete }: { onDelete?: () => void }) {
  const [open, set] = useState(true);
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => set(!open)}>More for Smith</button>
      <Menu open={open} label="More for Smith" align="end" onClose={() => set(false)} items={[
        { label: 'Face sheet and variants', icon: 'frame-portrait', href: '/smith/face' },
        { label: 'Archive', icon: 'trash', disabled: true },
        { label: 'Delete Smith', icon: 'trash', tone: 'danger', separated: true, onClick: onDelete },
      ]} />
    </div>
  );
}

describe('Menu', () => {
  /* jsdom lays nothing out: every control counts as shown, as it would on a page */
  beforeEach(() => { vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList); });

  it('is a menu named by its label; each row a link or a button, left-aligned, the danger row after a rule', () => {
    render(<More />);
    const menu = screen.getByRole('menu', { name: 'More for Smith' });
    expect(menu.className).toBe('sk-popover is-anchored is-end sk-menu');
    const rows = screen.getAllByRole('menuitem');
    expect(rows.map((r) => [r.tagName, r.textContent, r.className])).toEqual([
      ['A', 'Face sheet and variants', 'sk-menu__item'],
      ['BUTTON', 'Archive', 'sk-menu__item'],
      ['BUTTON', 'Delete Smith', 'sk-menu__item is-danger'],
    ]);
    expect(rows[0].getAttribute('href')).toBe('/smith/face');
    expect(rows[1].getAttribute('aria-disabled')).toBe('true');
    expect(rows[2].previousElementSibling!.getAttribute('role')).toBe('separator');
    expect(css).toContain('justify-content:flex-start');
  });

  it('one Tab stop: arrows wrap past the disabled row, Home and End go to either end', () => {
    render(<More />);
    const [face, , del] = screen.getAllByRole('menuitem');
    expect(screen.getAllByRole('menuitem').map((r) => r.tabIndex)).toEqual([0, -1, -1]);
    face.focus();
    fireEvent.keyDown(face, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(del);
    fireEvent.keyDown(del, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(face);
    fireEvent.keyDown(face, { key: 'End' });
    expect(document.activeElement).toBe(del);
    fireEvent.keyDown(del, { key: 'Home' });
    expect(document.activeElement).toBe(face);
  });

  it('choosing a row runs it and closes the menu; a disabled row does nothing', () => {
    const onDelete = vi.fn();
    render(<More onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(screen.getByRole('menu')).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete Smith' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'More for Smith' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('Escape closes it', () => {
    render(<More />);
    fireEvent.keyDown(screen.getAllByRole('menuitem')[0], { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'More for Smith' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps a focused row ringed in forced colours, in Highlight', () => {
    expect(css).toContain('@media (forced-colors:active){.sk-menu__item:focus-visible{outline-color:Highlight}}');
  });
});
