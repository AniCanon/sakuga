import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WordsContext, wordsOf } from '../../internal/words';
import { Pagination } from './Pagination';

afterEach(() => { cleanup(); document.documentElement.removeAttribute('lang'); });

function Pages({ pages = 12, start = 5 }: { pages?: number; start?: number }) {
  const [page, set] = useState(start);
  return <Pagination page={page} pages={pages} total={281} pageSize={24} noun="pictures" label="Pages of pictures" onChange={set} />;
}

describe('Pagination', () => {
  it('is a navigation named by its label (default "Pages"); the count reads as text', () => {
    const { rerender } = render(<Pages />);
    const nav = screen.getByRole('navigation', { name: 'Pages of pictures' });
    expect(nav.querySelector('.sk-pages__count')!.textContent).toBe('97–120 of 281 pictures');
    rerender(<Pagination page={2} pages={3} />);
    expect(screen.getByRole('navigation', { name: 'Pages' }).querySelector('.sk-pages__count')!.textContent).toBe('Page 2 of 3');
  });

  it('Tab moves through Previous, each page and Next; far pages fold into a hidden ellipsis', () => {
    const { container } = render(<Pages />);
    const nav = container.querySelector('.sk-pages__nav')!;
    expect([...nav.children].filter((c) => !c.classList.contains('sk-glide')).map((c) => c.getAttribute('aria-label') ?? c.textContent))
      .toEqual(['Previous page', 'Page 1', '…', 'Page 4', 'Page 5', 'Page 6', '…', 'Page 12', 'Next page']);
    container.querySelectorAll('.sk-pages__gap').forEach((g) => expect(g.getAttribute('aria-hidden')).toBe('true'));
    screen.getAllByRole('button').forEach((b) => expect(b.tabIndex).toBe(0));
  });

  it('marks the current page "current page" and goes to another with onChange', () => {
    render(<Pages />);
    expect(screen.getByRole('button', { name: 'Page 5', current: 'page' }).className).toBe('sk-pages__n is-current');
    fireEvent.click(screen.getByRole('button', { name: 'Page 6' }));
    expect(screen.getByRole('button', { name: 'Page 6', current: 'page' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByRole('button', { name: 'Page 7', current: 'page' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(screen.getByRole('button', { name: 'Page 6', current: 'page' })).toBeTruthy();
  });

  it('when an arrow turns off under focus, focus goes to the current page, never to the page; elsewhere it stays put', () => {
    render(<><Pages pages={3} start={2} /><button type="button">Elsewhere</button></>);
    const prev = screen.getByRole('button', { name: 'Previous page' });
    prev.focus();
    fireEvent.click(prev);
    expect(prev.hasAttribute('disabled')).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Page 1', current: 'page' }));
    const next = screen.getByRole('button', { name: 'Next page' });
    next.focus();
    fireEvent.click(next);
    expect(document.activeElement).toBe(next);
    const away = screen.getByRole('button', { name: 'Elsewhere' });
    away.focus();
    fireEvent.click(next);
    expect(document.activeElement).toBe(away);
  });

  it('Previous and Next are disabled at the ends', () => {
    const { rerender } = render(<Pagination page={1} pages={2} onChange={() => undefined} />);
    expect((screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(false);
    rerender(<Pagination page={2} pages={2} onChange={() => undefined} />);
    expect((screen.getByRole('button', { name: 'Next page' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('with hrefs each page is a link, the current one a button', () => {
    const hrefs = ['/p/1', '/p/2', '/p/3'];
    render(<Pagination page={2} pages={3} hrefs={hrefs} />);
    expect(screen.getByRole('link', { name: 'Page 1' }).getAttribute('href')).toBe('/p/1');
    expect(screen.getByRole('link', { name: 'Page 3' }).getAttribute('href')).toBe('/p/3');
    expect(screen.getByRole('link', { name: 'Previous page' }).getAttribute('href')).toBe('/p/1');
    expect(screen.getByRole('link', { name: 'Next page' }).getAttribute('href')).toBe('/p/3');
    expect(screen.getByRole('button', { name: 'Page 2', current: 'page' })).toBeTruthy();
  });

  it('numbers carry the locale’s separator, shown and spoken', () => {
    const go = vi.fn();
    render(<WordsContext.Provider value={wordsOf('pt-BR')}><Pagination page={1000} pages={2481} total={59544} pageSize={24} noun="pessoas" onChange={go} /></WordsContext.Provider>);
    expect(screen.getByRole('navigation').querySelector('.sk-pages__count')!.textContent).toBe('23.977–24.000 of 59.544 pessoas');
    expect(screen.getByRole('button', { name: 'Page 2.481' }).textContent).toBe('2.481');
  });

  it('a list of one page shows none', () => {
    const { container } = render(<Pagination page={1} pages={1} />);
    expect(container.firstElementChild).toBeNull();
  });
});
