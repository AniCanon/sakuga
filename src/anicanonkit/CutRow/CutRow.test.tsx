import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CutCell } from '../CutCell/CutCell';
import { CutRow } from './CutRow';

afterEach(cleanup);

describe('CutRow', () => {
  it('is a table row whose plain elements take the cell role, and a component or text is wrapped in a cell', () => {
    const { container } = render(
      <div role="table">
        <CutRow>
          <CutCell number="2A" />
          <div>The platform.</div>
          {'8+00'}
          {null}
          <span role="rowheader">x</span>
        </CutRow>
      </div>,
    );
    const row = screen.getByRole('row');
    expect(row.className).toBe('sk-cutsheet__row');
    const cells = screen.getAllByRole('cell');
    expect(cells.map((c) => c.textContent)).toEqual(['2A', 'The platform.', '8+00']);
    expect(cells[0].firstElementChild!.className).toBe('sk-cutcell');
    expect(cells[1].tagName).toBe('DIV');
    expect(screen.getByRole('rowheader').textContent).toBe('x');
    expect(container.querySelector('.sk-sr')).toBeNull();
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('a selected or changed row starts its first cell with the words, said but not shown', () => {
    const { rerender } = render(<div role="table"><CutRow selected changed className="x"><div>2A</div><div>Action</div></CutRow></div>);
    expect(screen.getByRole('row').className).toBe('sk-cutsheet__row is-selected is-changed x');
    const [first, second] = screen.getAllByRole('cell');
    expect(first.textContent).toBe('Selected, changed. 2A');
    expect(first.firstElementChild!.className).toBe('sk-sr');
    expect(second.textContent).toBe('Action');
    rerender(<div role="table"><CutRow changed>{false}<CutCell number="2B" /></CutRow></div>);
    expect(screen.getAllByRole('cell')[0].textContent).toBe('changed. 2B');
  });

  it('span puts the children in one cell under the row, after a lead cell', () => {
    render(<div role="table"><CutRow span selected><div>timesheet</div></CutRow></div>);
    const [lead, cell] = screen.getAllByRole('cell');
    expect(screen.getByRole('row').className).toBe('sk-cutsheet__row is-selected is-span');
    expect(lead.textContent).toBe('Selected. ');
    expect(cell.className).toBe('sk-cutsheet__span');
    expect(cell.textContent).toBe('timesheet');
  });
});
