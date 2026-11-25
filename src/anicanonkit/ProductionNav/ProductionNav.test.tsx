import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProductionNav, type ProductionNavProps } from './ProductionNav';

afterEach(cleanup);

const views: ProductionNavProps['views'] = [
  { icon: 'document', label: 'Script', note: '5 scenes', href: '/script' },
  { icon: 'video', label: 'Make', note: '3 to review', state: 'attention' },
  { icon: 'film', label: 'Cut', note: '6:40' },
];
const sections: ProductionNavProps['sections'] = { selected: 2, items: [{ number: 1, title: 'Toddy’s bedroom', note: 'In the cut', image: 'a.jpg' }, { number: 2, title: 'Smith’s apartment', note: '2 to review', state: 'attention' }] };

describe('ProductionNav', () => {
  it('is a complementary region named Production; Tab moves through Back, the views, the scenes and the balance: links with href, buttons without, never a link to #', () => {
    const { container } = render(<ProductionNav back={{ label: 'Episodes', href: '/episodes' }} production={{ title: 'The First Watch', meta: 'Episode 2 · 16:9', image: 'c.jpg' }} views={views} current="Make" sections={sections} balance="9,427" balanceHref="/fragments" className="x" />);
    const nav = screen.getByRole('complementary', { name: 'Production' });
    expect(nav.className).toBe('sk-prodnav x');
    const stops = [...nav.querySelectorAll('a,button')];
    expect(stops.map((l) => l.tagName + ' ' + (l.getAttribute('href') || ''))).toEqual(['A /episodes', 'A /script', 'BUTTON ', 'BUTTON ', 'BUTTON ', 'BUTTON ', 'A /fragments']);
    expect(stops[0].textContent).toBe('Episodes');
    expect(stops[stops.length - 1].className).toBe('sk-frag sk-frag--block');
    expect(stops.filter((b) => b.tagName === 'BUTTON').every((b) => b.getAttribute('type') === 'button')).toBe(true);
    expect(container.querySelector('[href="#"]')).toBeNull();
    expect(container.querySelectorAll('img[alt=""]')).toHaveLength(2);
  });

  it('a view, a scene, Back and the balance without href run their own onClick', () => {
    const make = vi.fn(), scene = vi.fn(), back = vi.fn(), bal = vi.fn();
    render(<ProductionNav back={{ label: 'Episodes', onClick: back }} views={[{ ...views[1], onClick: make }]} sections={{ items: [{ ...sections!.items[1], onClick: scene }] }} balance="9,427" onBalance={bal} />);
    fireEvent.click(screen.getByRole('button', { name: 'Episodes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Make 3 to review' }));
    fireEvent.click(screen.getByRole('button', { name: '#2 Smith’s apartment 2 to review' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fragments balance: 9,427' }));
    expect([back, make, scene, bal].map((f) => f.mock.calls.length)).toEqual([1, 1, 1, 1]);
  });

  it('the title is a level-2 heading and the scenes\' title a level-3 one', () => {
    render(<ProductionNav production={{ title: 'The First Watch' }} views={views} sections={sections} />);
    expect(screen.getByRole('heading', { level: 2, name: 'The First Watch' }).getAttribute('title')).toBe('The First Watch');
    expect(screen.getByRole('heading', { level: 3, name: 'Scenes' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back' }).className).toBe('sk-prodnav__back');
  });

  it('the views are a navigation named Views, the current one the current page, with its note; the selected scene is current', () => {
    render(<ProductionNav views={views} current="Make" sections={sections} />);
    const v = screen.getByRole('navigation', { name: 'Views' });
    const make = within(v).getByRole('button', { name: 'Make 3 to review' });
    expect(make.getAttribute('aria-current')).toBe('page');
    expect(make.querySelector('small')!.className).toBe('is-attention');
    expect(within(v).getByRole('link', { name: 'Script 5 scenes' }).getAttribute('aria-current')).toBeNull();
    const scene = screen.getByRole('button', { name: '#2 Smith’s apartment 2 to review' });
    expect(scene.getAttribute('aria-current')).toBe('true');
    expect(scene.querySelector('.sk-prodnav__noimg')).toBeTruthy();
  });

  it('each fact reads its value and percent', () => {
    const { container } = render(<ProductionNav views={views} facts={[{ label: 'Cut', value: '6:40 of 11:00', percent: 60.4 }, { label: 'Story', value: 'After Kiko’s offer' }]} />);
    const dds = [...container.querySelectorAll('dd')];
    expect(dds.map((d) => d.textContent)).toEqual(['6:40 of 11:00, 60%', 'After Kiko’s offer']);
    expect((dds[0].querySelector('em') as HTMLElement).style.width).toBe('60.4%');
  });

  it('collapsed, the rail\'s views are named by their titles, the tools by their labels in a navigation named Tools, the balance is "Fragments balance", and pictures and the dot are hidden', () => {
    const bal = vi.fn();
    const { container } = render(
      <ProductionNav collapsed views={views} current="Cut" back={{ label: 'Episodes' }}
        tools={[{ icon: 'collection', label: 'Media' }, { icon: 'effect-sparks', label: 'Effects', short: 'FX' }]} currentTool="Effects" balance="9,427" onBalance={bal} />,
    );
    const nav = screen.getByRole('complementary', { name: 'Production' });
    expect(nav.className).toBe('sk-prodnav is-collapsed');
    expect(nav.querySelector('.sk-prodnav__railhead')!.getAttribute('title')).toBe('Back to Episodes');
    const rail = screen.getByRole('navigation', { name: 'Views' });
    expect(within(rail).getByRole('link', { name: 'Script · 5 scenes' }).getAttribute('href')).toBe('/script');
    expect(within(rail).getAllByRole('button').map((l) => l.getAttribute('title'))).toEqual(['Make · 3 to review', 'Cut · 6:40']);
    expect(within(rail).getByRole('button', { name: 'Cut · 6:40' }).getAttribute('aria-current')).toBe('page');
    expect(rail.querySelector('i')!.getAttribute('aria-hidden')).toBe('true');
    const toolsNav = screen.getByRole('navigation', { name: 'Tools' });
    const fx = within(toolsNav).getByRole('button', { name: 'Effects' });
    expect(fx.getAttribute('aria-current')).toBe('true');
    expect(fx.textContent).toBe('FX');
    expect(within(toolsNav).getByRole('button', { name: 'Media' })).toBeTruthy();
    expect(container.querySelector('.sk-prodnav__sep')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.sk-frag--block')).toBeNull();
    const mark = screen.getByRole('button', { name: 'Fragments balance: 9,427' });
    expect(mark.className).toBe('sk-prodnav__mark');
    expect(mark.getAttribute('title')).toBe('9,427 fragments');
    expect(mark.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    fireEvent.click(mark);
    expect(bal).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[href="#"]')).toBeNull();
  });

  it('collapsed without tools draws no separator', () => {
    const { container } = render(<ProductionNav collapsed views={views} production={{ title: 'T', image: 'c.jpg' }} />);
    expect(container.querySelector('.sk-prodnav__sep')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Tools' })).toBeNull();
    expect(container.querySelector('.sk-prodnav__railhead img')!.getAttribute('alt')).toBe('');
  });

  it('a view not open yet is drawn waiting: a disabled link named with its note, out of the tab order, in both rails', () => {
    const views = [
      { icon: 'document' as const, label: 'Script', note: 'Not started', href: '/script' },
      { icon: 'director' as const, label: 'Plan', note: 'After the script', disabled: true },
    ];
    const { container, rerender } = render(<ProductionNav views={views} current="Script" />);
    const plan = screen.getByRole('link', { name: 'Plan · After the script' });
    expect(plan.getAttribute('aria-disabled')).toBe('true');
    expect(plan.tagName).toBe('SPAN');
    expect(plan.getAttribute('tabindex')).toBeNull();
    expect(plan.classList.contains('is-waiting')).toBe(true);
    rerender(<ProductionNav views={views} current="Script" collapsed />);
    const icon = screen.getByRole('link', { name: 'Plan · After the script' });
    expect(icon.className).toBe('sk-prodnav__ricon is-waiting');
    expect(container.querySelectorAll('a').length).toBeGreaterThan(0);
  });


  it('production.menu puts its ⋯ after the production\'s heading on every view, media on a cover and plain without; the collapsed rail leaves it out', () => {
    const menu = { items: [{ label: 'Rename', icon: 'edit' as const }] };
    const { container, rerender } = render(<ProductionNav views={views} production={{ title: 'The First Watch', image: 'c.jpg', menu }} />);
    const heading = screen.getByRole('heading', { name: 'The First Watch' });
    const more = screen.getByRole('button', { name: 'More for The First Watch' });
    expect(heading.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(more.className).toContain('sk-ib--media');
    expect(container.querySelector('.sk-prodnav__headwrap')!.className).toBe('sk-more-wrap sk-prodnav__headwrap');
    rerender(<ProductionNav views={views} production={{ title: 'The First Watch', menu }} />);
    expect(container.querySelector('.sk-prodnav__headwrap')!.className).toBe('sk-more-wrap sk-prodnav__headwrap is-plain');
    expect(screen.getByRole('button', { name: 'More for The First Watch' }).className).toContain('sk-ib--plain');
    rerender(<ProductionNav views={views} production={{ title: 'The First Watch', menu }} collapsed />);
    expect(screen.queryByRole('button', { name: 'More for The First Watch' })).toBeNull();
  });


  it('collapsed, its tools are a scrolling nav that marks each end with more past it', () => {
    const tools: ProductionNavProps['tools'] = ['Media', 'Titles', 'Effects', 'Adjust', 'Audio', 'Captions'].map((label) => ({ icon: 'collection' as const, label }));
    const heights = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(400);
    const client = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200);
    const { container } = render(<ProductionNav collapsed views={views} current="Cut" tools={tools} />);
    const nav = container.querySelector<HTMLElement>('.sk-prodnav__tools')!;
    expect(nav.getAttribute('aria-label')).toBe('Tools');
    expect(nav.className).toBe('sk-prodnav__rail sk-prodnav__tools is-more-below');
    nav.scrollTop = 100;
    fireEvent.scroll(nav);
    expect(nav.className).toBe('sk-prodnav__rail sk-prodnav__tools is-more-above is-more-below');
    heights.mockRestore();
    client.mockRestore();
  });

  it('a fact can be a fragment amount that opens what it sums up', () => {
    const onClick = vi.fn();
    render(<ProductionNav views={[]} facts={[{ label: 'Spent', value: '3,420', fragments: true, onClick, linkLabel: 'What it went on' }, { label: 'Runtime', value: '1:06' }]} />);
    const link = screen.getByRole('button', { name: 'What it went on' });
    expect(link.querySelector('.sk-frag')).toBeTruthy();
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('1:06').closest('button')).toBeNull();
  });
});
