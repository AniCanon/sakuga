import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CastGrid } from './CastGrid';

afterEach(cleanup);

describe('CastGrid', () => {
  it('is a list named by label with a card per item; a card with href is a link named by the name, one without is not', () => {
    render(<CastGrid label="Cast" items={[{ name: 'Kiko', href: '/cast/kiko', role: 'Leads the E.R.A.' }, { name: 'Felix', initial: 'F' }]} />);
    const list = screen.getByRole('list', { name: 'Cast' });
    expect(list.className).toBe('sk-castgrid');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0].className).toBe('sk-contents');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Kiko' }).parentElement).toBe(items[0]);
    expect(items[1].textContent).toBe('FFelix');
  });

  it('columns sets the grid', () => {
    render(<CastGrid label="Cast" columns={3} className="mine" items={[]} />);
    const list = screen.getByRole('list', { name: 'Cast' });
    expect(list.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
    expect(list.className).toBe('sk-castgrid mine');
  });
});
