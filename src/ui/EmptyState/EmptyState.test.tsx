import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { Loader } from '../Loader/Loader';
import { EmptyState } from './EmptyState';

afterEach(() => { cleanup(); vi.useRealTimers(); });

const spoken = () => document.querySelector('body > .sk-sr[aria-live="polite"]')?.textContent;

describe('EmptyState', () => {
  it('reads its title as an h2 heading and its text as a paragraph, and is not focusable or a status by default', () => {
    const { container } = render(<EmptyState title="Warming up the booth" text="Usually under a minute." />);
    const e = container.firstElementChild as HTMLElement;
    expect(e.className).toBe('sk-empty');
    expect(e.hasAttribute('role')).toBe(false);
    expect(e.tabIndex).toBe(-1);
    expect(screen.getByRole('heading', { level: 2, name: 'Warming up the booth' })).toBeTruthy();
    expect(screen.getByText('Usually under a minute.').tagName).toBe('P');
  });

  it('gives a whole-page state its h1 with as', () => {
    render(<EmptyState as="h1" title="This page isn’t here" />);
    expect(screen.getByRole('heading', { level: 1, name: 'This page isn’t here' })).toBeTruthy();
  });

  it('says its title and text once through the live region with tone attention, its icon hidden', () => {
    vi.useFakeTimers();
    const { container } = render(<EmptyState tone="attention" icon="warning" title="Ponytail didn’t finish" text="Your name and wording are kept." />);
    const s = container.firstElementChild as HTMLElement;
    expect(s.className).toBe('sk-empty is-attention');
    expect(s.hasAttribute('role')).toBe(false);
    expect(s.querySelector('.sk-empty__icon svg')!.getAttribute('aria-hidden')).toBe('true');
    vi.advanceTimersByTime(60);
    expect(spoken()).toBe('Ponytail didn’t finish Your name and wording are kept.');
  });

  it('takes slot="media" in place of the icon, and its actions take focus in order', () => {
    render(
      <EmptyState icon="warning" title="Drawing">
        <span slot="media"><Loader size={32} label="Drawing the portrait" /></span>
        <Button size="sm">Show details</Button>
        <Button size="sm" variant="ghost">Try again</Button>
      </EmptyState>,
    );
    expect(screen.getByRole('status', { name: 'Drawing the portrait' })).toBeTruthy();
    expect(document.querySelector('.sk-empty__icon')).toBeNull();
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Show details', 'Try again']);
  });
});
