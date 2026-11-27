import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge } from '../Badge/Badge';
import { MediaCard } from './MediaCard';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('MediaCard', () => {
  it('with href is a link Tab reaches, named by its content in order, ending with the watched part', () => {
    render(<MediaCard kind="episode" image="/ep.jpg" alt="Kiko on the roof" logo="/logo.png" logoAlt="EBA" progress={0.4} duration="24:10" title="The Legacy of Blood" meta="EBA · Season 1 · Episode 1" href="/watch/1" />);
    const link = screen.getByRole('link', { name: 'Kiko on the roof EBA 24:10 The Legacy of Blood EBA · Season 1 · Episode 1 , watched 40%' });
    expect(link.getAttribute('href')).toBe('/watch/1');
    expect(link.className).toBe('sk-card sk-card--episode');
    expect(link.tabIndex).toBe(0);
  });

  it('label names it instead; attention says "waiting for you" and marks the meta line', () => {
    const { container } = render(<MediaCard kind="short" image="/s.jpg" title="The popcorn incident" meta="Cut · 3 takes" attention href="#" label="The popcorn incident, 3 takes to review" />);
    expect(screen.getByRole('link', { name: 'The popcorn incident, 3 takes to review' })).toBeTruthy();
    expect(container.querySelector('.sk-card__meta')!.className).toBe('sk-card__meta is-attention');
    expect(container.querySelector('.sk-sr')!.textContent).toBe(', waiting for you');
  });

  it('without href the same reads as text', () => {
    const { container } = render(<MediaCard kind="manga" image="/m.jpg" title="The Winter" meta="Bad Memories · 15 pages" />);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe('DIV');
    expect(screen.queryByRole('link')).toBeNull();
    expect(root.textContent).toBe('The WinterBad Memories · 15 pages');
  });

  it('the artwork and logo alts are empty by default; the spine, scrim and progress bar are hidden', () => {
    const { container } = render(<MediaCard kind="manga" image="/m.jpg" logo="/l.png" progress={0.28} />);
    expect([...container.querySelectorAll('img')].map((i) => i.getAttribute('alt'))).toEqual(['', '']);
    for (const c of ['.sk-card__spine', '.sk-card__scrim', '.sk-card__progress']) expect(container.querySelector(c)!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('28');
    expect(container.querySelector('.sk-card__progress .sk-progress')!.className).toBe('sk-progress is-media');
  });

  it('kind sets the frame; a short puts its duration top right, an episode bottom right; count bottom left, badge top right', () => {
    const { container } = render(<>
      <MediaCard kind="short" image="/s.jpg" duration="0:24" count="1.2M views" />
      <MediaCard kind="episode" image="/e.jpg" duration="24:10" badge={<Badge variant="new">New</Badge>} />
    </>);
    const [short, ep] = container.querySelectorAll('.sk-card');
    expect(short.className).toBe('sk-card sk-card--short');
    expect(short.querySelector('.sk-card__tl')!.textContent).toBe('0:24');
    expect(short.querySelector('.sk-card__bl .sk-badge')!.textContent).toBe('1.2M views');
    expect(ep.querySelector('.sk-card__br')!.textContent).toBe('24:10');
    expect(ep.querySelector('.sk-card__tl .sk-badge--new')!.textContent).toBe('New');
  });

  it('a small numeric width takes the small corner, never on manga', () => {
    const { container } = render(<>
      <MediaCard kind="episode" image="/e.jpg" width={280} />
      <MediaCard kind="short" image="/s.jpg" width={140} />
      <MediaCard kind="episode" image="/e.jpg" width={64} />
      <MediaCard kind="manga" image="/m.jpg" width={60} />
      <MediaCard kind="episode" image="/e.jpg" width="50%" />
    </>);
    expect([...container.querySelectorAll('.sk-card__frame')].map((f) => f.className)).toEqual([
      'sk-card__frame', 'sk-card__frame sk-card__frame--sm', 'sk-card__frame sk-card__frame--xs', 'sk-card__frame', 'sk-card__frame',
    ]);
    expect((container.querySelectorAll('.sk-card')[4] as HTMLElement).style.width).toBe('50%');
  });

  it('lights the art with a light map, at the centre under focus; light={false} turns it off', () => {
    const { container } = render(<>
      <MediaCard kind="episode" image="/e.jpg" lightMap="/e.webp" imagePosition="62% center" href="#" title="One" />
      <MediaCard kind="episode" image="/e.jpg" lightMap="/e.webp" light={false} href="#" title="Two" />
    </>);
    const [lit, off] = container.querySelectorAll<HTMLElement>('.sk-card__frame');
    expect(lit.className).toBe('sk-card__frame has-light');
    const layer = lit.querySelector<HTMLImageElement>('img.sk-light')!;
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(layer.style.objectPosition).toBe('62% center');
    expect(off.querySelector('.sk-light')).toBeNull();
    vi.spyOn(lit, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 160, height: 90, right: 160, bottom: 90, x: 0, y: 0, toJSON() {} } as DOMRect);
    lit.style.setProperty('--light-x', '10%');
    fireEvent.focus(screen.getByRole('link', { name: 'One' }));
    expect(lit.style.getPropertyValue('--frame-ratio')).toBe('1.778');
    expect(lit.style.getPropertyValue('--light-x')).toBe('');
  });
});

describe('MediaCard with no cover', () => {
  it('is a flat well that says "No cover yet", read with the card, never a broken picture or the loader\'s mark', () => {
    const { container } = render(<MediaCard kind="episode" image="" title="The Burning" meta="Episode 3" href="/p/3" />);
    expect(container.querySelector('img.sk-card__img')).toBeNull();
    const well = container.querySelector('.sk-card__none')!;
    expect(well.getAttribute('aria-hidden')).toBeNull();
    expect(well.textContent).toBe('No cover yet');
    expect(well.querySelector('svg')).toBeNull();
    expect(screen.getByRole('link').textContent).toContain('No cover yet');
  });

  it('says the app\'s placeholder in the well when given', () => {
    const { container } = render(<MediaCard kind="short" title="Ash" placeholder="Cover coming with the cut" />);
    expect(container.querySelector('.sk-card__none')!.textContent).toBe('Cover coming with the cut');
  });

  it('with menu its ⋯ is a button after the link, on the wrap that takes the card\'s class and width, opening its menu; a short\'s time moves to the foot', () => {
    const rename = vi.fn();
    const { container } = render(<MediaCard kind="short" image="/s.jpg" title="Red Line" duration="0:42" href="/p/red-line" width={180} className="x"
      menu={{ items: [{ label: 'Rename', icon: 'edit', onClick: rename }] }} />);
    const wrap = container.firstElementChild as HTMLElement;
    expect(wrap.className).toBe('sk-more-wrap sk-card-wrap x');
    expect(wrap.style.width).toBe('180px');
    const link = screen.getByRole('link');
    expect(link.className).toBe('sk-card sk-card--short');
    expect(link.style.width).toBe('');
    expect(container.querySelector('.sk-card__br')!.textContent).toBe('0:42');
    const more = screen.getByRole('button', { name: 'More for Red Line' });
    expect(link.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(link.contains(more)).toBe(false);
    fireEvent.click(more);
    expect(more.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(rename).toHaveBeenCalled();
  });

});
