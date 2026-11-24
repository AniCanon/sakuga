import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/* jsdom joins inline parts without a browser's spaces, so names here allow either; e2e/names.spec.ts pins them exactly */
import { SectionHeader } from './SectionHeader';

afterEach(cleanup);

describe('SectionHeader', () => {
  it('is an h2 heading with its subtitle as text and a See all link named by ariaLabel', () => {
    render(<SectionHeader title="Shorts" subtitle="Videos under a minute" action={{ label: 'See all', ariaLabel: 'See all EBA shorts', href: '/shorts' }} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Shorts' }).className).toBe('sk-sec__title');
    expect(screen.getByText('Videos under a minute').tagName).toBe('P');
    const link = screen.getByRole('link', { name: 'See all EBA shorts' });
    expect(link.getAttribute('href')).toBe('/shorts');
    expect(link.tabIndex).toBe(0);
  });

  it('names the link by its label without ariaLabel', () => {
    render(<SectionHeader title="Cast" action={{ label: 'See all', href: '/cast' }} />);
    expect(screen.getByRole('link', { name: 'See all' }).getAttribute('href')).toBe('/cast');
  });

  it('draws an action with only onClick as a button, never a link to #', () => {
    const onClick = vi.fn();
    render(<SectionHeader title="Cast" action={{ label: 'See all', ariaLabel: 'See all of the cast', onClick }} />);
    expect(screen.queryByRole('link')).toBeNull();
    const b = screen.getByRole('button', { name: 'See all of the cast' });
    expect(b.className).toBe('sk-sec__action');
    expect(b.getAttribute('type')).toBe('button');
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('reads its count inside the heading, the icon hidden, at the level as sets', () => {
    render(<SectionHeader as="h3" size="md" icon="characters" count={4} title="The Guild" />);
    const h = screen.getByRole('heading', { level: 3, name: /^The Guild ?4$/ });
    expect(h.className).toBe('sk-sec__title has-meta');
    expect(h.querySelector('svg.sk-icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(h.closest('.sk-sec')!.className).toBe('sk-sec sk-sec--md');
  });

  it('is plain text, not a heading, at size xs, with children at the end', () => {
    render(<SectionHeader size="xs" title="The issue, spread by spread"><span>Key</span></SectionHeader>);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('The issue, spread by spread').tagName).toBe('SPAN');
    expect(screen.getByText('Key')).toBeTruthy();
  });

  it('at xs, the count follows the label and the subtitle is a caption under it, the children on its line', () => {
    const { container } = render(<SectionHeader size="xs" title="Lineages" count={2} subtitle="Where characters come from."><button type="button">Key</button></SectionHeader>);
    const row = container.querySelector('.sk-sec--xs')!;
    expect(row.classList.contains('has-sub')).toBe(true);
    expect(row.querySelector('.sk-sec__xs .sk-sec__title')!.textContent).toBe('Lineages2');
    expect(row.querySelector('.sk-sec__xs .sk-sec__sub')!.textContent).toBe('Where characters come from.');
    expect(row.lastElementChild!.textContent).toBe('Key');
  });
});
