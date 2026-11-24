import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CastCard } from './CastCard';

const live = () => document.querySelector('[aria-live="polite"]');
const described = (el: HTMLElement) => (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean).map((id) => document.getElementById(id)!.textContent);

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('CastCard', () => {
  it('with href it is a link named by the name alone, described by its role, meta, state and action', () => {
    render(<CastCard href="/cast/kiko" name="Kiko" image="kiko.jpg" role="Leads the E.R.A." meta="2 looks" state={{ label: '1 look waiting on you', tone: 'attention' }} action={{ label: 'Face sheet ready, review', tone: 'attention' }} />);
    const a = screen.getByRole('link', { name: 'Kiko' });
    expect(a.className).toBe('sk-castcard');
    expect(a.getAttribute('href')).toBe('/cast/kiko');
    expect(described(a)).toEqual(['Leads the E.R.A.', '2 looks', '1 look waiting on you', 'Face sheet ready, review']);
  });

  it('without href it is not a link and everything reads as text', () => {
    const { container } = render(<CastCard name="Kiko" role="Leads the E.R.A." meta="2 looks" />);
    expect(screen.queryByRole('link')).toBeNull();
    const card = container.firstElementChild as HTMLElement;
    expect(card.tagName).toBe('DIV');
    expect(card.getAttribute('aria-label')).toBeNull();
    expect(card.getAttribute('aria-describedby')).toBeNull();
    expect(card.textContent).toBe('KikoLeads the E.R.A.2 looks');
  });

  it('the name comes before the role; with nothing to do, what they have sits quietly in the foot, which every card ends in', () => {
    const { container, rerender } = render(<CastCard name="Kiko" role="Leads the E.R.A." meta="2 looks" />);
    const parts = () => Array.from(container.firstElementChild!.children).map((c) => c.className);
    expect(parts()).toEqual(['sk-cast', 'sk-castcard__name', 'sk-castcard__role', 'sk-castcard__action is-quiet']);
    expect(container.querySelector('.is-quiet')!.textContent).toBe('2 looks');
    rerender(<CastCard name="Kiko" />);
    expect(container.querySelector('.is-quiet')!.textContent).toBe('');
    rerender(<CastCard name="Kiko" meta="2 looks" action={{ label: 'Continue setup', tone: 'draft' }} />);
    expect(parts()).toEqual(['sk-cast', 'sk-castcard__name', 'sk-castcard__meta', 'sk-castcard__action is-draft']);
  });

  it('a menu is its own ⋯ beside the card’s link, never inside it, named "More for {name}", opening a Menu', () => {
    vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
    const onDelete = vi.fn();
    render(<CastCard href="/cast/sophia" name="Sophia" menu={{ items: [{ label: 'Continue setup', href: '/cast/sophia/face' }, { label: 'Delete Sophia', icon: 'trash', tone: 'danger', separated: true, onClick: onDelete }] }} />);
    const link = screen.getByRole('link', { name: 'Sophia' }), more = screen.getByRole('button', { name: 'More for Sophia' });
    expect(link.contains(more)).toBe(false);
    expect(link.parentElement!.className).toBe('sk-more-wrap sk-castcard-wrap');
    expect(more.getAttribute('aria-haspopup')).toBe('menu');
    expect(more.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(more);
    expect(more.getAttribute('aria-expanded')).toBe('true');
    expect(link.parentElement!.className).toBe('sk-more-wrap is-open sk-castcard-wrap');
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete Sophia' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(more.getAttribute('aria-expanded')).toBe('false');
  });

  it('the portrait and the state dot are hidden', () => {
    const { container } = render(<CastCard href="#" name="Kiko" image="kiko.jpg" state={{ label: 'Drawing', tone: 'busy' }} />);
    expect(container.querySelector('.sk-cast img')!.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('.sk-castcard__dot')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.sk-castcard__state')!.className).toBe('sk-castcard__state is-busy');
  });

  it('a busy action draws the loader, which stays quiet inside the card; its time follows', () => {
    const { container } = render(<CastCard href="#" name="Tattoo" initial="T" action={{ label: 'Designing the look', tone: 'busy', time: '0:31' }} />);
    const act_ = container.querySelector('.sk-castcard__action')!;
    expect(act_.className).toBe('sk-castcard__action is-busy');
    expect(act_.querySelector('.sk-loader')!.getAttribute('aria-label')).toBe('Designing the look');
    expect(act_.querySelector('.sk-castcard__time')!.textContent).toBe('0:31');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(live()?.textContent ?? '').not.toBe('Designing the look');
  });

  it('an action without a tone is busy; draft and attention draw no loader', () => {
    const { container } = render(<><CastCard name="A" action={{ label: 'Working' }} /><CastCard name="B" action={{ label: 'Continue setup', tone: 'draft' }} /></>);
    const [a, b] = [...container.querySelectorAll('.sk-castcard__action')];
    expect(a.className).toBe('sk-castcard__action is-busy');
    expect(a.querySelector('.sk-loader')).toBeNull();
    expect(b.className).toBe('sk-castcard__action is-draft');
  });

  it('with no portrait and a placeholderIcon draws the age figure in the circle, not the initial', () => {
    const { container, rerender } = render(<CastCard name="Genzo" initial="G" placeholderIcon="age-adult" />);
    expect(container.querySelector('.sk-cast__initial .sk-cast__silhouette svg')).toBeTruthy();
    expect(container.querySelector('.sk-cast__initial')!.textContent).toBe('');
    rerender(<CastCard name="Genzo" initial="G" image="g.jpg" placeholderIcon="age-adult" />);
    expect(container.querySelector('.sk-cast__silhouette')).toBeNull();
    rerender(<CastCard name="Genzo" initial="G" />);
    expect(container.querySelector('.sk-cast__initial')!.textContent).toBe('G');
  });
});
