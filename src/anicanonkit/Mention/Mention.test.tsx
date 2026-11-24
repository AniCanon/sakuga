import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Mention } from './Mention';

afterEach(cleanup);

describe('Mention', () => {
  it('reads as text, its mark first: @ a character, # a place, $ a reference; not focusable', () => {
    const { container } = render(<p><Mention>Aiko</Mention> <Mention kind="place">Harbour</Mention> <Mention kind="reference">rain-look</Mention></p>);
    const [a, b, c] = [...container.querySelectorAll('.sk-mention')];
    expect(a.textContent).toBe('@Aiko');
    expect(a.className).toBe('sk-mention sk-mention--character');
    expect(b.textContent).toBe('#Harbour');
    expect(c.textContent).toBe('$rain-look');
    expect(container.querySelectorAll('[tabindex], button, a')).toHaveLength(0);
  });

  it('active says "card open" after it', () => {
    const { container } = render(<Mention active>Aiko</Mention>);
    expect(container.firstElementChild!.className).toBe('sk-mention sk-mention--character is-active');
    expect(container.textContent).toBe('@Aiko, card open');
  });

  it('missing, it is marked and read as missing on every kind', () => {
    const { container } = render(<Mention kind="reference" missing>platform-edge</Mention>);
    expect(container.firstElementChild!.className).toBe('sk-mention sk-mention--reference is-missing');
    expect(container.textContent).toBe('$platform-edge, missing');
  });
});

describe('Mention 1.3', () => {
  it('& an object, an event as its quoted title and where it was told, a picture or an age figure before the name', () => {
    const { container } = render(<p><Mention kind="object">The logbook</Mention> <Mention kind="event" type="clue" told="Ep 3">A ticket</Mention> <Mention image="k.jpg">Kiko</Mention> <Mention figure="age-adult">Genzo</Mention></p>);
    const [obj, ev, kiko, genzo] = [...container.querySelectorAll('.sk-mention')];
    expect(obj.textContent).toBe('&The logbook');
    expect(obj.className).toContain('sk-mention--object');
    expect(ev.textContent).toBe('“A ticket” · Ep 3');
    expect(ev.querySelector('svg.sk-glyph')).toBeTruthy();
    expect(kiko.className).toContain('has-img');
    expect(kiko.querySelector('img')!.getAttribute('alt')).toBe('');
    expect(genzo.querySelector('.sk-mention__figure .sk-icon')).toBeTruthy();
  });
});
