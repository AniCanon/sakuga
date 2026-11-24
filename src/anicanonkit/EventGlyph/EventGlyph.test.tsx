import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EventGlyph } from './EventGlyph';

afterEach(cleanup);

describe('EventGlyph', () => {
  it('is decorative: an svg on the 24 grid hidden from screen readers, 12 by 12 by default', () => {
    const { container } = render(<EventGlyph type="event" />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('12');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('class')).toBe('sk-glyph sk-glyph--primary');
  });

  it('draws each type as its own mark', () => {
    const paths = (t: 'event' | 'twist' | 'revelation' | 'clue' | 'goal') => Array.from(render(<EventGlyph type={t} size={16} />).container.querySelectorAll('path')).map((p) => p.getAttribute('d'));
    expect(paths('twist')).toEqual(['M3 19h6c4.5 0 7-3.5 7-9.5V4', 'M11.5 8.5L16 4l4.5 4.5', 'M17 19h4']);
    expect(paths('revelation')).toHaveLength(3);
    expect(paths('clue')).toEqual(['M4 9h5.5a3 3 0 115 0H20v2.5a3 3 0 100 5V20H4z']);
    expect(paths('goal')).toEqual(['M6 21V3h13l-3.5 4.5L19 12H6']);
  });

  it('event draws its small cut at 12 px and under: the node filled', () => {
    const node = (size: number) => render(<EventGlyph type="event" size={size} />).container.querySelector('circle')!;
    expect(node(12).getAttribute('fill')).toBe('currentColor');
    cleanup();
    expect(node(16).getAttribute('fill')).toBeNull();
    expect(node(16).getAttribute('r')).toBe('3');
  });

  it('tone auto: a plain event in the text colour, the other four in the accent; a tone given wins', () => {
    const cls = (el: Element | null) => el!.getAttribute('class');
    expect(cls(render(<EventGlyph type="twist" />).container.querySelector('svg'))).toBe('sk-glyph sk-glyph--accent');
    cleanup();
    expect(cls(render(<EventGlyph type="twist" tone="muted" className="x" />).container.querySelector('svg'))).toBe('sk-glyph sk-glyph--muted x');
    cleanup();
    expect(cls(render(<EventGlyph type="event" tone="accent" />).container.querySelector('svg'))).toBe('sk-glyph sk-glyph--accent');
  });
});
