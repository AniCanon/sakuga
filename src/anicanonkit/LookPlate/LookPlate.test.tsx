import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LookPlate } from './LookPlate';

const css = readFileSync('src/anicanonkit/LookPlate/LookPlate.css', 'utf8');

afterEach(cleanup);

const described = (el: HTMLElement) => (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean).map((id) => document.getElementById(id)!.textContent);

describe('LookPlate', () => {
  it('a menu is the look’s own ⋯, a solid button after the plate, shown under the pointer or focus and always where there is no hover', () => {
    vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    render(<LookPlate label="Plaid" occasion="Everyday" image="plaid.jpg" href="/looks/plaid" menu={{ items: [{ label: 'Wear by default' }, { label: 'Delete Plaid', tone: 'danger', separated: true }] }} />);
    const plate = screen.getByRole('link', { name: 'Plaid' }), more = screen.getByRole('button', { name: 'More for Plaid' });
    expect(plate.contains(more)).toBe(false);
    expect(plate.parentElement!.className).toBe('sk-more-wrap sk-plate-wrap');
    expect(more.className).toContain('sk-ib--solid');
    fireEvent.click(more);
    expect(screen.getAllByRole('menuitem').map((r) => r.textContent)).toEqual(['Wear by default', 'Delete Plaid']);
    expect(css).toContain('@media (hover:hover){.sk-plate-wrap>.sk-more-wrap__button{opacity:0;');
    vi.restoreAllMocks();
  });

  it('without href is a button that runs onClick, never a link to #, named by its label and described by its occasion', () => {
    const pick = vi.fn();
    const { container } = render(<LookPlate label="Plaid" occasion="Everyday" image="plaid.jpg" onClick={pick} />);
    const a = screen.getByRole('button', { name: 'Plaid' });
    expect(a.getAttribute('type')).toBe('button');
    expect(container.querySelector('[href]')).toBeNull();
    fireEvent.click(a);
    expect(pick).toHaveBeenCalledTimes(1);
    expect(a.className).toBe('sk-plate sk-plate--ready');
    expect(described(a)).toEqual(['Everyday']);
    expect(a.getAttribute('aria-current')).toBeNull();
    expect(a.querySelector('img')!.getAttribute('alt')).toBe('');
  });

  it('with href is a link; takes className', () => {
    render(<LookPlate label="Plaid" href="/looks/plaid" className="mine" />);
    const a = screen.getByRole('link', { name: 'Plaid' });
    expect(a.getAttribute('href')).toBe('/looks/plaid');
    expect(a.className).toBe('sk-plate sk-plate--ready mine');
    expect(a.getAttribute('aria-describedby')).toBeNull();
  });

  it('Wearing and Showing plates are current, and described by their tag', () => {
    render(<><LookPlate label="casual" occasion="Everyday" state="wearing" /><LookPlate label="Coat" state="showing" /></>);
    const w = screen.getByRole('button', { name: 'casual' }), s = screen.getByRole('button', { name: 'Coat' });
    expect(w.getAttribute('aria-current')).toBe('true');
    expect(s.getAttribute('aria-current')).toBe('true');
    expect(described(w)).toEqual(['Wearing', 'Everyday']);
    expect(described(s)).toEqual(['Showing']);
    expect(w.querySelector('.sk-plate__tag')!.className).toBe('sk-plate__tag sk-plate__tag--accent');
  });

  it('Review and New are described by their tag; review shows the sheet', () => {
    render(<><LookPlate label="Uniform" occasion="Uniform" state="review" image="sheet.png" /><LookPlate label="Gala" state="new" /></>);
    const r = screen.getByRole('button', { name: 'Uniform' });
    expect(described(r)).toEqual(['Review', 'Uniform']);
    expect(r.querySelector('.sk-plate__tag')!.className).toBe('sk-plate__tag sk-plate__tag--soft');
    expect(r.querySelector('img')!.className).toBe('is-sheet');
    expect(r.getAttribute('aria-current')).toBeNull();
    expect(described(screen.getByRole('button', { name: 'Gala' }))).toEqual(['New']);
  });

  it('while it draws it is described as Drawing, and its loader keeps quiet inside the button', () => {
    render(<LookPlate label="Plaid" occasion="Everyday" state="drawing" />);
    const a = screen.getByRole('button', { name: 'Plaid' });
    expect(described(a)).toEqual(['Everyday', 'Drawing']);
    expect(a.querySelector('.sk-loader')!.getAttribute('aria-label')).toBe('Drawing Plaid');
    expect(a.querySelector('img')).toBeNull();
  });

  it('add draws the plus, with no picture or tag', () => {
    render(<LookPlate label="New look" occasion="Any occasion" state="add" />);
    const a = screen.getByRole('button', { name: 'New look' });
    expect(a.className).toBe('sk-plate sk-plate--add');
    expect(a.querySelector('.sk-plate__add svg')).toBeTruthy();
    expect(a.querySelector('.sk-plate__tag')).toBeNull();
  });

  it('with no picture stands the age figure on the canvas colour, with what fills it; a creature plate is 16:9', () => {
    const { container } = render(<LookPlate label="Festival" placeholder="Drawn when you approve the sheet" creature />);
    const a = container.querySelector('.sk-plate')!;
    expect(a.className).toBe('sk-plate sk-plate--ready sk-plate--creature');
    expect(a.querySelector('img')).toBeNull();
    expect(a.querySelector('.sk-plate__silhouette')!.getAttribute('aria-hidden')).toBe('true');
    expect(a.querySelector('.sk-plate__silhouette use, .sk-plate__silhouette svg')).toBeTruthy();
    expect(a.querySelector('.sk-plate__empty small')!.textContent).toBe('Drawn when you approve the sheet');
    expect(css).toContain('.sk-plate--creature .sk-plate__frame{aspect-ratio:var(--ratio-creature)}');
    expect(css).toContain('--look-plate-frame-aspect-ratio:var(--ratio-portrait)');
  });
});
