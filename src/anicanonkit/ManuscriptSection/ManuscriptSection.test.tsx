import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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
});
