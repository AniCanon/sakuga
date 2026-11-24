import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CutSheet } from './CutSheet';

afterEach(cleanup);

const columns = [{ label: 'C', width: '62px' }, { label: 'Action' }, { label: 'Sec', width: '70px', align: 'end' as const }];

describe('CutSheet', () => {
  it('is a table named by label, its first row the column headers, its columns sized as given', () => {
    const { container } = render(<CutSheet columns={columns} label="Scene 2" className="x"><div role="row" /></CutSheet>);
    const table = screen.getByRole('table', { name: 'Scene 2' });
    expect(table.className).toBe('sk-cutsheet x');
    expect(table.style.gridTemplateColumns).toBe('62px minmax(0,1fr) 70px');
    const [head, row] = screen.getAllByRole('row');
    expect(head.className).toBe('sk-cutsheet__head');
    expect(row).toBeTruthy();
    const hs = screen.getAllByRole('columnheader');
    expect(hs.map((h) => h.textContent)).toEqual(['C', 'Action', 'Sec']);
    expect(hs[2].className).toBe('sk-cutsheet__h is-end');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('with surface it sits on its page, the footer slot after the table', () => {
    const { container } = render(
      <CutSheet columns={columns} label="Scene 2" surface className="x">
        <div role="row" />
        <p slot="footer">Next: scene 3</p>
      </CutSheet>,
    );
    const page = container.firstElementChild!;
    expect(page.className).toBe('sk-cutsheet-page x');
    expect(screen.getByRole('table').className).toBe('sk-cutsheet');
    expect(page.lastChild!.textContent).toBe('Next: scene 3');
    expect(page.children[0]).toBe(screen.getByRole('table'));
  });
});
