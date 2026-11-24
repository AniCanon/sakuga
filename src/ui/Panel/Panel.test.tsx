import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { Panel } from './Panel';

afterEach(cleanup);

describe('Panel', () => {
  it('is a region named by its title, the title a level-3 heading and the subtitle text', () => {
    render(<Panel icon="camera" title="Camera and framing" subtitle="Core shot decisions, with a technique library behind them"><p>Tiles</p></Panel>);
    const region = screen.getByRole('region', { name: 'Camera and framing' });
    expect(region.tagName).toBe('SECTION');
    expect(region.className).toBe('sk-panel');
    expect(screen.getByRole('heading', { level: 3, name: 'Camera and framing' }).className).toBe('sk-panel__title');
    expect(region.querySelector('.sk-panel__sub')!.textContent).toBe('Core shot decisions, with a technique library behind them');
    expect(region.lastElementChild!.textContent).toBe('Tiles');
  });

  it('hides the icon', () => {
    const { container } = render(<Panel icon="camera" title="Camera" />);
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('selected ends the heading in "selected"', () => {
    render(<Panel title="Take 2" selected />);
    /* jsdom puts a space before the sk-sr span's words; a browser reads "Take 2, selected" */
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Take 2, selected');
    expect(screen.getByRole('region', { name: 'Take 2' }).className).toBe('sk-panel is-selected');
  });

  it('the action, a prop or slot="action", takes focus before the controls', () => {
    const { container, rerender } = render(<Panel title="Camera" action={<Button variant="ghost" size="sm">Techniques</Button>}><button type="button">Wide</button></Panel>);
    const order = () => [...container.querySelectorAll('button')].map((b) => b.textContent);
    expect(container.querySelector('.sk-panel__action')!.textContent).toBe('Techniques');
    expect(order()).toEqual(['Techniques', 'Wide']);
    rerender(<Panel title="Camera"><span slot="action"><button type="button">Remove</button></span><button type="button">Wide</button></Panel>);
    expect(order()).toEqual(['Remove', 'Wide']);
  });

  it('onToggle makes the head the open fold\'s button: named by the title, expanded, controlling its body; the chevron is hidden and no action is drawn', () => {
    const toggle = vi.fn();
    const { container } = render(<Panel icon="camera" title="Advanced cinematography" subtitle="Auto" onToggle={toggle} controls="adv" action={<button type="button">Ignored</button>}><div id="adv">Tiles</div></Panel>);
    const head = container.querySelector('.sk-panel__head')!;
    expect(head.className).toBe('sk-panel__head is-toggle');
    const button = screen.getByRole('button', { name: 'Advanced cinematography' });
    expect(button.closest('h3')!.className).toBe('sk-panel__title');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('adv');
    expect(container.querySelector('.sk-panel__action')).toBeNull();
    expect(head.querySelector('.sk-panel__chev')!.getAttribute('aria-hidden')).toBe('true');
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('with neither title nor icon there is no head', () => {
    const { container } = render(<Panel className="x">Body</Panel>);
    expect(container.querySelector('.sk-panel__head')).toBeNull();
    expect(container.firstElementChild!.className).toBe('sk-panel x');
  });
});

describe('Panel pane', () => {
  it('is part of a side pane: the same region, drawn without its box', () => {
    const { container } = render(<Panel pane title="Media">x</Panel>);
    expect(screen.getByRole('region', { name: 'Media' })).toBe(container.firstElementChild);
    expect(container.firstElementChild!.classList.contains('is-pane')).toBe(true);
  });
});
