import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge } from './Badge';

afterEach(cleanup);

const css = readFileSync('src/ui/Badge/Badge.css', 'utf8');

describe('Badge', () => {
  it('reads its text in place and is not focusable', () => {
    render(<p>Episode 1 <Badge>11:36</Badge></p>);
    const b = screen.getByText('11:36');
    expect(b.className).toBe('sk-badge');
    expect(b.tabIndex).toBe(-1);
    expect(b.closest('p')!.textContent).toBe('Episode 1 11:36');
  });

  it('hides its dot and its icon', () => {
    render(<Badge variant="neutral" dot icon="warning">Rendering</Badge>);
    const b = screen.getByText('Rendering');
    expect(b.className).toBe('sk-badge sk-badge--neutral sk-badge--icon');
    expect(b.querySelector('.sk-badge__dot')!.getAttribute('aria-hidden')).toBe('true');
    expect(b.querySelector('svg.sk-icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('changes only its colour with variant', () => {
    render(<><Badge variant="new">New</Badge><Badge variant="alert">Burning</Badge><Badge variant="attention">To review</Badge><Badge variant="outline">Ep 1</Badge></>);
    expect(screen.getByText('New').className).toBe('sk-badge sk-badge--new');
    expect(screen.getByText('Burning').className).toBe('sk-badge sk-badge--alert');
    expect(screen.getByText('To review').className).toBe('sk-badge sk-badge--attention');
    expect(screen.getByText('Ep 1').className).toBe('sk-badge sk-badge--outline');
  });

  it('draws a warning as the outline badge in amber, never a fill, and over a picture on badge-bg', () => {
    render(<Badge variant="warning" icon="warning">“Cell four” happens after it</Badge>);
    const b = screen.getByText('“Cell four” happens after it');
    expect(b.className).toBe('sk-badge sk-badge--warning sk-badge--icon');
    expect(b.querySelector('svg.sk-icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(css).toContain('.sk-badge--warning{background:transparent;color:var(--badge-warning);box-shadow:inset 0 0 0 var(--badge-outline-inset-ring-width) var(--badge-warning)}');
    expect(css).toContain('.sk-thumb .sk-badge:is(.sk-badge--neutral,.sk-badge--outline,.sk-badge--attention,.sk-badge--warning)');
  });

  it('keeps an edge and its dot in forced colours', () => {
    expect(css).toContain('@media (forced-colors:active){.sk-badge{border:var(--badge-forced-edge-width) solid CanvasText}}');
    expect(css).toContain('@media (forced-colors:active){.sk-badge__dot{forced-color-adjust:none;background:CanvasText}}');
  });
});
