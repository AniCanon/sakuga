import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PageHeader } from './PageHeader';

afterEach(cleanup);

describe('PageHeader', () => {
  it('is a header landmark whose title is the level-1 heading, with the lead under it as text', () => {
    render(<PageHeader title="Places" lead="3 places in Lantern Tide." />);
    const header = screen.getByRole('banner');
    expect(header.className).toBe('sk-pagehead');
    expect(screen.getByRole('heading', { level: 1, name: 'Places' }).className).toBe('sk-pagehead__title');
    expect(screen.getByText('3 places in Lantern Tide.').tagName).toBe('P');
  });

  it('holds the view switch and the action at its end, in that order, and says which it has', () => {
    render(
      <PageHeader title="Places" lead="3 places.">
        <span slot="action"><button type="button">New place</button></span>
        <span slot="views"><button type="button">Places</button></span>
      </PageHeader>,
    );
    const header = screen.getByRole('banner');
    expect(header.className).toBe('sk-pagehead has-views has-action');
    const end = header.querySelector('.sk-pagehead__end')!;
    expect([...end.children].map((c) => c.className)).toEqual(['sk-pagehead__views', 'sk-pagehead__action']);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Places', 'New place']);
  });

  it('takes another heading level and an id', () => {
    render(<PageHeader as="h2" id="pg" title="Library" />);
    const h = screen.getByRole('heading', { level: 2, name: 'Library' });
    expect(h.id).toBe('pg');
    expect(document.querySelector('.sk-pagehead__end')).toBeNull();
    expect(document.querySelector('.sk-pagehead__lead')).toBeNull();
  });
});
