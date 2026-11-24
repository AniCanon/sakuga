import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EntityRow } from './EntityRow';

afterEach(cleanup);

describe('EntityRow', () => {
  it('reads the name, its state and the chip in order, then the end; nothing focusable', () => {
    const { container } = render(<EntityRow visual={{ kind: 'avatar', initial: 'K' }} name="Kiko" before="Calm" after="Wary" chip="Ep 3" end={<button type="button">Open</button>} />);
    const row = container.firstElementChild!;
    expect(row.className).toBe('sk-erow');
    expect(row.textContent).toBe('KKikoChanged from Calm to WaryEp 3Open');
    expect(row.querySelector('.sk-erow__chip')!.textContent).toBe('Ep 3');
    expect(row.querySelectorAll('[tabindex]')).toHaveLength(0);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('faded: says "not at this moment" after the name and dims its picture', () => {
    const { container } = render(<EntityRow visual={{ kind: 'place' }} name="Sé station" faded />);
    expect(container.firstElementChild!.className).toBe('sk-erow is-faded');
    expect(container.querySelector('.sk-erow__text')!.textContent).toBe('Sé station, not at this moment');
  });

  it('pictures and initials are hidden', () => {
    const { container } = render(<>
      <EntityRow visual={{ kind: 'avatar', image: 'k.jpg', size: 40 }} name="A" />
      <EntityRow visual={{ kind: 'avatar' }} name="B" />
      <EntityRow visual={{ kind: 'pair', images: ['a.jpg', 'b.jpg'] }} name="C" />
      <EntityRow visual={{ kind: 'place', image: 'p.jpg' }} name="D" />
      <EntityRow visual={{ kind: 'event', type: 'twist' }} name="E" />
      <EntityRow visual={{ kind: 'question', stage: 2 }} name="F" />
      <EntityRow visual={{ kind: 'icon', icon: 'image' }} name="G" />
      <EntityRow visual={{ kind: 'maki', image: 'maki.png' }} name="H" />
    </>);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    const [a, b, c, d, e, f, g, h] = [...container.querySelectorAll('.sk-ev')];
    expect(a.className).toBe('sk-ev sk-ev--avatar');
    expect((a as HTMLElement).style.width).toBe('40px');
    expect(b.textContent).toBe('?');
    expect(b.getAttribute('aria-hidden')).toBe('true');
    expect(c.querySelectorAll('img')).toHaveLength(2);
    expect((d as HTMLElement).style.height).toBe('28px');
    expect(e.querySelector('svg.sk-glyph')!.getAttribute('width')).toBe('16');
    expect([...f.children].map((x) => x.tagName + (x.className ? '.' + x.className : ''))).toEqual(['I.is-on', 'B.is-on', 'I.is-on', 'B', 'I']);
    expect(f.getAttribute('aria-hidden')).toBe('true');
    expect(g.className).toBe('sk-ev sk-ev--slot sk-ev--icon');
    expect(h.className).toBe('sk-ev sk-ev--slot sk-ev--maki');
  });

  it('slots: a custom picture, the state and the end', () => {
    const { container } = render(
      <EntityRow name="Kiko" after="ignored">
        <span slot="visual"><img className="mine" src="x.jpg" alt="" /></span>
        <span slot="state"><b className="s">Lost</b></span>
        <span slot="end"><i className="e" /></span>
      </EntityRow>,
    );
    expect(container.querySelector('.sk-ev')).toBeNull();
    expect(container.querySelector('.mine')).toBeTruthy();
    expect(container.querySelector('.sk-state')).toBeNull();
    expect(container.querySelector('.sk-erow__text .s')!.textContent).toBe('Lost');
    expect(container.querySelector('.sk-erow > .e')).toBeTruthy();
  });
});

describe('EntityRow 1.1', () => {
  it('source is quiet text under the name, read after it; a chip longer than 14 characters shows as the source instead', () => {
    const { container, rerender } = render(<EntityRow name="Fire at Sé" source="Lantern Tide · series bible · Prologue" chip="Ep 2" />);
    expect(container.querySelector('.sk-erow__source')!.textContent).toBe('Lantern Tide · series bible · Prologue');
    expect(container.querySelector('.sk-erow__chip')!.getAttribute('title')).toBe('Ep 2');
    rerender(<EntityRow name="Fire at Sé" chip="Episode 2 — Salt and Ash" />);
    expect(container.querySelector('.sk-erow__chip')).toBeNull();
    expect(container.querySelector('.sk-erow__source')!.textContent).toBe('Episode 2 — Salt and Ash');
  });
});
