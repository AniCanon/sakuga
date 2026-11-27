import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ManuscriptSection } from './ManuscriptSection';

afterEach(cleanup);

describe('ManuscriptSection', () => {
  it('reads "#" and its number, the title as a level-3 heading, the prose and its word count; not focusable', () => {
    const { container } = render(<ManuscriptSection number={1} title="The roof" words={240}>After the fire, Toddy wires a second watch.</ManuscriptSection>);
    const s = container.firstElementChild!;
    expect(s.className).toBe('sk-msec');
    expect(s.getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('heading', { level: 3, name: 'The roof' }).className).toBe('');
    expect(s.textContent).toBe('#1The roofAfter the fire, Toddy wires a second watch.240 words');
    expect(s.querySelectorAll('[tabindex], button, a')).toHaveLength(0);
  });

  it('current is marked current; slug sets the title as a slugline', () => {
    const { container } = render(<ManuscriptSection number={4} title="INT. FLAT — NIGHT" slug current>His phone lights up.</ManuscriptSection>);
    expect(container.firstElementChild!.className).toBe('sk-msec is-current');
    expect(container.firstElementChild!.getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('heading', { level: 3 }).className).toBe('is-slug');
    expect(container.querySelector('.sk-msec__words')).toBeNull();
  });

  it('the margin follows the words in reading order; the overlay sits in the body', () => {
    const { container } = render(
      <ManuscriptSection number={2}>Words<span slot="margin"><i className="m" /></span><span slot="overlay"><i className="o" /></span></ManuscriptSection>,
    );
    expect(container.querySelector('.sk-msec')!.lastElementChild!.className).toBe('sk-msec__margin');
    expect(container.querySelector('.sk-msec__margin .m')).toBeTruthy();
    expect(container.querySelector('.sk-msec__body > .o')).toBeTruthy();
    expect(container.querySelector('h3')).toBeNull();
  });

  it('with says the scene happens at the same time as another, and how the two are told, under its heading', () => {
    const { container } = render(<ManuscriptSection number={5} title="Sé station" with={{ number: 4, title: "Toddy's bedroom", told: 'Cut between them' }}>Kiko steps out of the smoke.</ManuscriptSection>);
    expect(container.firstElementChild!.className).toBe('sk-msec is-with');
    expect(container.querySelector('.sk-msec__with')!.textContent).toBe("At the same time as #4 · Toddy's bedroom · Cut between them");
    expect(container.querySelector('.sk-msec__with svg')).toBeTruthy();
  });

  it('with onTold the told words are a button that opens the told menu, and a choice says how', () => {
    const onTold = vi.fn();
    render(<ManuscriptSection number={5} title="Sé station" with={{ number: 4, title: "Toddy's bedroom", told: 'Cut between them' }} onTold={onTold}>Kiko steps out of the smoke.</ManuscriptSection>);
    const button = screen.getByRole('button', { name: 'How the two are told: Cut between them' });
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const menu = screen.getByRole('menu', { name: 'How the two are told: Cut between them' });
    expect([...menu.querySelectorAll('[role="menuitem"]')].map(item => item.textContent)).toEqual(['Cut between them', 'One after the other', 'Not at the same time']);
    fireEvent.click(screen.getByRole('menuitem', { name: 'One after the other' }));
    expect(onTold).toHaveBeenCalledWith('after');
  });

  it('Not at the same time is set apart, and says apart', () => {
    const onTold = vi.fn();
    render(<ManuscriptSection number={5} title="Sé station" with={{ number: 4, title: "Toddy's bedroom", told: 'One after the other' }} onTold={onTold} toldOpen>Kiko.</ManuscriptSection>);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Not at the same time' }));
    expect(onTold).toHaveBeenCalledWith('apart');
  });

  it('without onTold the told words stay words, and without told there is no button', () => {
    const { rerender } = render(<ManuscriptSection number={5} title="Sé station" with={{ number: 4, title: "Toddy's bedroom", told: 'Cut between them' }}>Kiko.</ManuscriptSection>);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<ManuscriptSection number={5} title="Sé station" with={{ number: 4, title: "Toddy's bedroom" }} onTold={() => {}}>Kiko.</ManuscriptSection>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('.sk-msec__with')!.textContent).toBe("At the same time as #4 · Toddy's bedroom");
  });
});
