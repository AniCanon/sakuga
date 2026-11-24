import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Progress } from './Progress';

afterEach(cleanup);

const css = readFileSync('src/ui/Progress/Progress.css', 'utf8');

describe('Progress', () => {
  it('is a progress bar named by its label, announced with its percent', () => {
    render(<Progress value={40} label="Rendering your take" />);
    const p = screen.getByRole('progressbar', { name: 'Rendering your take' });
    expect(p.getAttribute('aria-valuemin')).toBe('0');
    expect(p.getAttribute('aria-valuemax')).toBe('100');
    expect(p.getAttribute('aria-valuenow')).toBe('40');
    expect(p.tabIndex).toBe(-1);
    expect((p.firstChild as HTMLElement).style.width).toBe('40%');
  });

  it('has no name without a label', () => {
    render(<Progress value={10} />);
    expect(screen.getByRole('progressbar').hasAttribute('aria-label')).toBe(false);
  });

  it('keeps its value between 0 and 100', () => {
    render(<><Progress value={140} label="Over" /><Progress value={-5} label="Under" /></>);
    expect(screen.getByRole('progressbar', { name: 'Over' }).getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByRole('progressbar', { name: 'Under' }).getAttribute('aria-valuenow')).toBe('0');
  });

  it('takes the media tone over art', () => {
    render(<Progress value={65} tone="media" label="Animating your clip" />);
    expect(screen.getByRole('progressbar').className).toBe('sk-progress is-media');
  });
  it('keeps its track edge in forced colours, the fill in Highlight', () => {
    expect(css).toContain('@media (forced-colors:active){.sk-progress{border:var(--progress-forced-edge-width) solid CanvasText}}');
    expect(css).toContain('@media (forced-colors:active){.sk-progress__fill{forced-color-adjust:none;background:Highlight}}');
  });
});
