import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from '../IconButton/IconButton';
import { TopNav } from './TopNav';

afterEach(cleanup);

const links = ['Home', 'Series', 'Shorts', 'Manga', 'Creators'].map((label) => ({ label, href: '/' + label.toLowerCase(), current: label === 'Series' }));

describe('TopNav', () => {
  it('sets a section link\'s own line height, so a real link draws as a button does inside a page with its own', () => {
    const css = readFileSync('src/ui/TopNav/TopNav.css', 'utf8');
    expect(css).toContain('.sk-nav__links>a,.sk-nav__links>button{line-height:var(--topnav-links-a-line-height)}');
    expect(css).toContain('--topnav-links-a-line-height:normal');
  });

  it('is a header whose brand link reads the name, the logo hidden', () => {
    const { container } = render(<TopNav brand={{ logo: '/mark.svg', name: 'AniCanon', href: '/' }} links={links} />);
    expect(container.firstElementChild!.tagName).toBe('HEADER');
    const brand = screen.getByRole('link', { name: 'AniCanon' });
    expect(brand.getAttribute('href')).toBe('/');
    expect(brand.querySelector('img')!.getAttribute('alt')).toBe('');
  });

  it('then a navigation named by label (default "Main") whose links mark the current page', () => {
    const { rerender } = render(<TopNav links={links} />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const as = [...nav.querySelectorAll('a')];
    expect(as.map((a) => a.textContent)).toEqual(['Home', 'Series', 'Shorts', 'Manga', 'Creators']);
    expect(screen.getByRole('link', { name: 'Series', current: 'page' }).getAttribute('href')).toBe('/series');
    expect(as.filter((a) => a.hasAttribute('aria-current'))).toHaveLength(1);
    rerender(<TopNav links={links} label="Sections" />);
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeTruthy();
  });

  it('with an account: Search (running onSearch), Create, then the account button (running account.onClick), in Tab order', () => {
    const search = vi.fn(), me = vi.fn();
    const { container } = render(<TopNav links={links} onSearch={search} create={{ href: '/new' }} account={{ name: 'Aiko Mori', onClick: me }} />);
    const actions = container.querySelector('.sk-nav__actions')!;
    expect([...actions.querySelectorAll('a,button')].map((el) => el.getAttribute('aria-label') || el.textContent)).toEqual(['Search', 'Create', 'Your account, Aiko Mori']);
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    fireEvent.click(screen.getByRole('button', { name: 'Your account, Aiko Mori' }));
    expect([search.mock.calls.length, me.mock.calls.length]).toEqual([1, 1]);
    expect(screen.getByRole('link', { name: 'Create' }).getAttribute('href')).toBe('/new');
    expect(screen.getByRole('button', { name: 'Your account, Aiko Mori' }).textContent).toBe('AM');
  });

  it('shows Search only with an account or Create; search false drops it', () => {
    const { rerender } = render(<TopNav links={links} />);
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    rerender(<TopNav links={links} account={{ name: 'Aiko Mori', image: '/aiko.jpg' }} search={false} />);
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Your account, Aiko Mori' }).querySelector('img')!.getAttribute('alt')).toBe('');
  });

  it('actions, a prop or slot="actions", sit before Search', () => {
    const { container, rerender } = render(<TopNav links={links} account={{ name: 'Aiko Mori' }} actions={<IconButton variant="plain" icon="bell" label="Notifications" attention />} />);
    const names = () => [...container.querySelectorAll('.sk-nav__actions button')].map((b) => b.getAttribute('aria-label'));
    expect(names()).toEqual(['Notifications', 'Search', 'Your account, Aiko Mori']);
    rerender(<TopNav links={links} account={{ name: 'Aiko Mori' }}><span slot="actions"><IconButton variant="plain" icon="bell" label="Notifications" /></span></TopNav>);
    expect(names()).toEqual(['Notifications', 'Search', 'Your account, Aiko Mori']);
  });

  it('runs a link’s onClick; an item without href is a button that runs it, never a link to #, and can be the current one', () => {
    const go = vi.fn(), home = vi.fn();
    const { container } = render(<TopNav links={[{ label: 'Home', href: '/', onClick: home }, { label: 'Series', onClick: go, current: true }]} />);
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(home).toHaveBeenCalledTimes(1);
    const series = screen.getByRole('button', { name: 'Series', current: 'page' });
    expect(series.getAttribute('type')).toBe('button');
    fireEvent.click(series);
    expect(go).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[href="#"]')).toBeNull();
  });

  it('a brand without href is only the mark, not a link; Create without href is a button that runs create.onClick', () => {
    const make = vi.fn();
    const { container } = render(<TopNav brand={{ name: 'AniCanon' }} links={links} create={{ onClick: make }} />);
    expect(screen.queryByRole('link', { name: 'AniCanon' })).toBeNull();
    expect(container.querySelector('.sk-nav__brand')!.tagName).toBe('SPAN');
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(make).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[href="#"]')).toBeNull();
  });

  it('with search as an object, Search opens the field where the links were, with Close search after it; closing gives focus back to Search', () => {
    function Bar({ start = false }: { start?: boolean }) {
      const [open, setOpen] = useState(start);
      return <TopNav links={links} account={{ name: 'Raul Menezes' }} search={{ open, onOpen: () => setOpen(true), onClose: () => setOpen(false), label: 'Search AniCanon', placeholder: 'Series, creators, characters' }} />;
    }
    const { container } = render(<Bar />);
    const find = screen.getByRole('button', { name: 'Search' });
    expect(screen.queryByRole('search')).toBeNull();
    find.focus();
    fireEvent.click(find);
    expect(container.firstElementChild!.className).toBe('sk-nav is-searching');
    const field = screen.getByRole('searchbox', { name: 'Search AniCanon' });
    expect(document.activeElement).toBe(field);
    expect(screen.queryByRole('navigation', { name: 'Main' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Close search' }));
    expect(screen.queryByRole('search')).toBeNull();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Search' }));
  });

  it('Escape on the empty field closes the search and gives focus back to Search', () => {
    function Bar() {
      const [open, setOpen] = useState(true);
      return <TopNav links={links} create={{ label: 'Create' }} search={{ open, onOpen: () => setOpen(true), onClose: () => setOpen(false) }} />;
    }
    render(<Bar />);
    const field = screen.getByRole('searchbox', { name: 'Search' });
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(screen.queryByRole('search')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Search' }));
  });
});
