import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TabBar, type TabItem } from './TabBar';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const items: TabItem[] = [
  { label: 'Home', icon: 'home', href: '/', current: true },
  { label: 'Shorts', icon: 'shorts', href: '/shorts' },
  { label: 'Manga', icon: 'manga', href: '/manga' },
  { label: 'You', icon: 'you', href: '/you' },
];

describe('TabBar', () => {
  it('is a navigation named by label whose destinations are links, the current one marked, then Create as the fifth link', () => {
    render(<TabBar variant="web" label="Main" items={items} createHref="/s/eba" />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const links = Array.from(nav.querySelectorAll('a')).map((a) => [a.textContent, a.getAttribute('href'), a.getAttribute('aria-current')]);
    expect(links).toEqual([['Home', '/', 'page'], ['Shorts', '/shorts', null], ['Manga', '/manga', null], ['You', '/you', null], ['Create', '/s/eba', null]]);
  });

  it('marks Create current in the Studio shell, and an item with no address is a button', () => {
    render(<TabBar variant="web" items={[{ label: 'Home', icon: 'home', onClick: () => {} }]} createHref="/s/eba" createCurrent />);
    expect(screen.getByRole('button', { name: 'Home' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Create' }).getAttribute('aria-current')).toBe('page');
  });

  it('drops Create with onCreate null, and leaves the box tree when hidden', () => {
    const { container, rerender } = render(<TabBar variant="web" items={items} onCreate={null} createHref="/s/eba" />);
    expect(screen.queryByRole('link', { name: 'Create' })).toBeNull();
    rerender(<TabBar variant="web" items={items} hidden />);
    expect((container.firstChild as HTMLElement).hidden).toBe(true);
  });

  it('hides itself while a phone keyboard is up', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q === '(pointer: coarse)', addEventListener() {}, removeEventListener() {} }));
    const { container } = render(<><input aria-label="Search" /><TabBar variant="web" items={items} /></>);
    const bar = container.querySelector('.sk-tabbar') as HTMLElement;
    expect(bar.hidden).toBe(false);
    act(() => { screen.getByRole('textbox', { name: 'Search' }).focus(); });
    expect(bar.hidden).toBe(true);
    act(() => { (document.activeElement as HTMLElement).blur(); });
    expect(bar.hidden).toBe(false);
  });

  it('draws nothing for the apps\' glass capsule, which stays native', () => {
    const { container } = render(<TabBar {...({ items } as unknown as { items: TabItem[]; variant: 'web' })} />);
    expect(container.firstChild).toBeNull();
  });
});
