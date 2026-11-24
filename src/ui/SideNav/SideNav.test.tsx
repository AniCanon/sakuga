import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SideNav, type SideNavProps } from './SideNav';

afterEach(cleanup);

const groups: SideNavProps['groups'] = [{ items: [{ label: 'Home', icon: 'home', href: '/home' }] }, { title: 'Make', items: [{ label: 'Studio', icon: 'image', current: true }, { label: 'Cut', icon: 'film' }] }];

describe('SideNav', () => {
  it('is a complementary region named by label (default "Sections")', () => {
    const { rerender } = render(<SideNav groups={groups} account={{ name: 'Aiko Mori' }} />);
    expect(screen.getByRole('complementary', { name: 'Sections' }).className).toBe('sk-sidenav');
    rerender(<SideNav groups={groups} account={{ name: 'Aiko Mori' }} label="Studio" />);
    expect(screen.getByRole('complementary', { name: 'Studio' })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Studio navigation' })).toBeTruthy();
  });

  it('Tab moves through the brand link, the switcher, the items and the account button', () => {
    const { container, rerender } = render(<SideNav brand={{ name: 'AniCanon', product: 'Studio', logo: '/m.svg', href: '/' }} switcher={{ label: 'Ember Bay' }} groups={groups} account={{ name: 'Aiko Mori', handle: '@aiko' }} />);
    expect([...container.querySelectorAll('a,button')].map((el) => el.getAttribute('aria-label') || el.textContent)).toEqual(['AniCanonStudio', 'Series: Ember Bay. Switch', 'Home', 'Studio', 'Cut', 'Your account, Aiko Mori']);
    const brand = screen.getByRole('link', { name: 'AniCanon Studio' });
    expect(brand.getAttribute('href')).toBe('/');
    expect(brand.querySelector('img')!.getAttribute('alt')).toBe('');
    /* A brand with no address is only the mark: no link to #, and no Tab stop */
    rerender(<SideNav brand={{ name: 'AniCanon', product: 'Studio' }} groups={groups} account={{ name: 'Aiko Mori' }} />);
    expect(screen.queryByRole('link', { name: 'AniCanon Studio' })).toBeNull();
    expect(container.querySelector('.sk-sidenav__brand')!.tagName).toBe('SPAN');
    expect(container.querySelector('a[href="#"]')).toBeNull();
  });

  it('the switcher is expanded or collapsed from switcher.open, controls switcher.controls, and runs switcher.onClick; prefix changes its name', () => {
    const sw = vi.fn();
    const { rerender } = render(<SideNav switcher={{ label: 'Ember Bay', onClick: sw }} groups={groups} account={{ name: 'Aiko Mori' }} />);
    const b = screen.getByRole('button', { name: 'Series: Ember Bay. Switch' });
    expect(b.getAttribute('aria-haspopup')).toBe('listbox');
    expect(b.getAttribute('aria-expanded')).toBeNull();
    fireEvent.click(b);
    expect(sw).toHaveBeenCalledTimes(1);
    expect(b.getAttribute('aria-controls')).toBeNull();
    rerender(<SideNav switcher={{ label: 'Ember Bay', open: true, prefix: 'Workspace', controls: 'series-list' }} groups={groups} account={{ name: 'Aiko Mori' }} />);
    expect(screen.getByRole('button', { name: 'Workspace: Ember Bay. Switch', expanded: true }).getAttribute('aria-controls')).toBe('series-list');
    rerender(<SideNav switcher={{ label: 'Ember Bay', open: false }} groups={groups} account={{ name: 'Aiko Mori' }} />);
    expect(screen.getByRole('button', { name: 'Series: Ember Bay. Switch', expanded: false })).toBeTruthy();
  });

  it('each group with a title is named by it; an item with href is a link, one without a button that runs its onClick, never a link to #; the current one is "current page"', () => {
    const go = vi.fn();
    const { container } = render(<SideNav groups={[groups[0], { title: 'Make', items: [{ label: 'Studio', icon: 'image', current: true, onClick: go }, { label: 'Cut', icon: 'film' }] }]} account={{ name: 'Aiko Mori' }} />);
    const make = screen.getByRole('group', { name: 'Make' });
    expect(make.querySelectorAll('button.sk-sidenav__item')).toHaveLength(2);
    expect(screen.getAllByRole('group')).toHaveLength(1);
    const studio = screen.getByRole('button', { name: 'Studio', current: 'page' });
    expect(studio.getAttribute('type')).toBe('button');
    fireEvent.click(studio);
    expect(go).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/home');
    expect(container.querySelector('[href="#"]')).toBeNull();
  });

  it('the account button runs account.onClick; icons and pictures are hidden', () => {
    const me = vi.fn();
    const { container, rerender } = render(<SideNav groups={groups} account={{ name: 'Aiko Mori', handle: '@aiko', onClick: me }} />);
    const acct = screen.getByRole('button', { name: 'Your account, Aiko Mori' });
    expect(acct.textContent).toBe('AMAiko Mori@aiko');
    fireEvent.click(acct);
    expect(me).toHaveBeenCalledTimes(1);
    container.querySelectorAll('svg').forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
    rerender(<SideNav groups={groups} account={{ name: 'Aiko Mori', image: '/aiko.jpg' }} />);
    expect(screen.getByRole('button', { name: 'Your account, Aiko Mori' }).querySelector('img')!.getAttribute('alt')).toBe('');
  });

  it('children sit above the account', () => {
    const { container } = render(<SideNav groups={groups} account={{ name: 'Aiko Mori' }}><p>Help</p></SideNav>);
    expect(container.querySelector('.sk-sidenav__account')!.previousElementSibling!.textContent).toBe('Help');
  });

  it('a switcher without image keeps the picture’s place with Thumb’s placeholder and the label’s initial', () => {
    const { container, rerender } = render(<SideNav switcher={{ label: 'Ember Bay' }} groups={groups} account={{ name: 'Aiko Mori' }} />);
    const sw = container.querySelector('.sk-sidenav__switch')!;
    const ph = sw.querySelector('.sk-thumb.is-placeholder') as HTMLElement;
    expect(ph.textContent).toBe('E');
    expect(ph.style.width).toBe('var(--sidebar-switch-img-size)');
    expect(sw.querySelector('img')).toBeNull();
    expect(sw.querySelector('.sk-sidenav__label')!.textContent).toBe('Ember Bay');
    expect(screen.getByRole('button', { name: 'Series: Ember Bay. Switch' })).toBe(sw);
    rerender(<SideNav switcher={{ label: 'Ember Bay', image: '/eba.jpg' }} groups={groups} account={{ name: 'Aiko Mori' }} />);
    expect(sw.querySelector('.sk-thumb')).toBeNull();
    expect(sw.querySelector('img')!.getAttribute('src')).toBe('/eba.jpg');
  });

  it('compact keeps every name: the switcher and account as before, each item by its name under its icon, the group titles as the groups\u2019 names', () => {
    const { container } = render(<SideNav compact brand={{ name: 'AniCanon', product: 'Studio' }} switcher={{ label: 'Ember Bay' }} groups={groups} account={{ name: 'Aiko Mori', handle: '@aiko' }} />);
    expect(screen.getByRole('complementary', { name: 'Sections' }).className).toBe('sk-sidenav sk-sidenav--compact');
    expect(screen.getByRole('button', { name: 'Series: Ember Bay. Switch' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Your account, Aiko Mori' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Studio' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('group', { name: 'Make' })).toBeTruthy();
    expect(container.querySelector('.sk-sidenav__name')!.textContent).toBe('AniCanon');
  });

  it('under a hovering pointer only the icon tilts and grows, by motion-tilt and scale-lift, and stays still under reduced motion', () => {
    const css = readFileSync('src/ui/SideNav/SideNav.css', 'utf8');
    expect(css).toContain('--sidebar-item-icon-hover-scale:var(--scale-lift);--sidebar-item-icon-hover-rotate:var(--motion-tilt)');
    expect(css).toContain('@media (hover:hover){.sk-sidenav__item:hover>.sk-icon{transform:rotate(var(--sidebar-item-icon-hover-rotate)) scale(var(--sidebar-item-icon-hover-scale))}}');
    expect(css).toContain('@media (prefers-reduced-motion:reduce){.sk-sidenav__item:hover>.sk-icon{transform:none}}');
    const roles = readFileSync('src/tokens/roles.css', 'utf8');
    expect(roles).toContain('--scale-lift:1.15;');
    expect(roles).toContain('--motion-tilt:-8deg;');
  });

  it('folds to its icons from a fold button that says what it does next, every name kept for a screen reader', () => {
    const onToggle = vi.fn();
    const { rerender, container } = render(<SideNav groups={groups} account={{ name: 'Aiko Mori' }} onToggle={onToggle} />);
    const fold = screen.getByRole('button', { name: 'Show icons only' });
    expect(fold.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(fold);
    expect(onToggle).toHaveBeenCalled();
    rerender(<SideNav groups={groups} account={{ name: 'Aiko Mori' }} collapsed onToggle={onToggle} />);
    expect(container.querySelector('.sk-sidenav')!.className).toContain('sk-sidenav--collapsed');
    expect(screen.getByRole('button', { name: 'Show the full menu' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('data-label')).toBe('Home');
  });

  it('has no fold button unless the page can keep the choice', () => {
    render(<SideNav groups={groups} account={{ name: 'Aiko Mori' }} />);
    expect(screen.queryByRole('button', { name: 'Show icons only' })).toBeNull();
  });

  it('the fold button sits at the end of the brand row, so it costs no row of the list', () => {
    const toggle = vi.fn();
    const { container } = render(<SideNav brand={{ name: 'AniCanon' }} groups={[{ items: [{ label: 'Home', href: '/' }] }]} account={{ name: 'Raul Menezes' }} onToggle={toggle} />);
    const head = container.querySelector('.sk-sidenav__head')!;
    const fold = screen.getByRole('button', { name: 'Show icons only' });
    expect(head.contains(fold)).toBe(true);
    expect(head.querySelector('.sk-sidenav__brand')).toBeTruthy();
    expect(fold.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('.sk-sidenav__nav')!.contains(fold)).toBe(false);
    fold.click();
    expect(toggle).toHaveBeenCalled();
  });

});
