import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { Notice } from './Notice';

afterEach(() => { cleanup(); vi.useRealTimers(); });

const spoken = () => document.querySelector('body > .sk-sr[aria-live="polite"]')?.textContent;

describe('Notice', () => {
  it('reads its title and text in place, the icon hidden, and is not a status as info', () => {
    const { container } = render(<Notice title="Build changed." text="New looks use it." />);
    const n = container.firstElementChild as HTMLElement;
    expect(n.className).toBe('sk-notice sk-notice--info');
    expect(n.hasAttribute('role')).toBe(false);
    expect(n.tabIndex).toBe(-1);
    expect(n.textContent).toBe('Build changed. New looks use it.');
    expect(n.querySelector('.sk-notice__icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('says its title and text once through the live region with tone attention, and is no status itself', () => {
    vi.useFakeTimers();
    const { container } = render(<Notice tone="attention" title="Two scenes need a Festival look." text="Nothing fits yet." />);
    expect(container.firstElementChild!.hasAttribute('role')).toBe(false);
    vi.advanceTimersByTime(60);
    expect(spoken()).toBe('Two scenes need a Festival look. Nothing fits yet.');
  });

  it('says nothing as info', () => {
    vi.useFakeTimers();
    render(<Notice title="Quiet." text="Info stays in place." />);
    vi.advanceTimersByTime(60);
    expect(spoken()).not.toBe('Quiet. Info stays in place.');
  });

  it('lets its action take focus', () => {
    render(<Notice tone="attention" title="Two scenes need a Festival look."><Button size="sm">Add a look</Button></Notice>);
    const b = screen.getByRole('button', { name: 'Add a look' });
    b.focus();
    expect(document.activeElement).toBe(b);
    expect(b.parentElement!.className).toBe('sk-notice__action');
  });

  it('draws media in place of the icon, not hidden, so a loader keeps its name', () => {
    const { container } = render(<Notice media={<i className="m" />} text="Rendering" />);
    expect(container.querySelector('.sk-notice__icon .m')).toBeTruthy();
    expect(container.querySelector('.sk-notice__icon')!.hasAttribute('aria-hidden')).toBe(false);
    expect(container.querySelector('svg.sk-icon')).toBeNull();
  });
});
