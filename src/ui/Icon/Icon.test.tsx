import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Icon } from './Icon';
import { setIconSprite } from './sprite';

afterEach(() => { cleanup(); setIconSprite(''); });

describe('Icon', () => {
  it('points into the sprite the app installed', () => {
    setIconSprite('/assets/icons.svg');
    const { container } = render(<Icon name="play" />);
    expect(container.querySelector('use')?.getAttribute('href')).toBe('/assets/icons.svg#play');
  });

  it('points into the page when no sprite is installed', () => {
    const { container } = render(<Icon name="play" />);
    expect(container.querySelector('use')?.getAttribute('href')).toBe('#play');
  });

  it('is named by its title, else hidden', () => {
    const { container, rerender } = render(<Icon name="search" />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    rerender(<Icon name="search" title="Search" />);
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('Search');
  });

  it('sets a size token as style and a number as attributes', () => {
    const { container, rerender } = render(<Icon name="play" size="var(--button-icon-size)" />);
    expect(container.querySelector('svg')?.style.width).toBe('var(--button-icon-size)');
    rerender(<Icon name="play" size={16} />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('16');
  });

  it('a standing figure sized by percentage keeps its own shape, as the bundle\'s inline svg does; a fixed size sets none', () => {
    const { container, rerender } = render(<Icon name="age-adult" size="100%" />);
    expect((container.querySelector('svg') as SVGElement).style.aspectRatio).toBe('59 / 174');
    rerender(<Icon name="age-adult" size={24} />);
    expect((container.querySelector('svg') as SVGElement).style.aspectRatio).toBe('');
    rerender(<Icon name="play" size="100%" />);
    expect((container.querySelector('svg') as SVGElement).style.aspectRatio).toBe('');
  });
});
