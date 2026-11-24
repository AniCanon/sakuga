import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CoverageTable, type CoverageTableProps } from './CoverageTable';

afterEach(cleanup);

const props: CoverageTableProps = {
  label: 'Wardrobe coverage',
  summary: '2 gaps · from Episode 2',
  legend: [{ state: 'own', label: 'Has a look' }, { state: 'gap', label: 'A scene needs it' }, { state: 'idle', label: 'Not needed yet' }],
  occasions: ['Everyday', 'Uniform', 'Combat'],
  rows: [
    { name: 'Kiko', image: 'kiko.jpg', cells: [{ state: 'own', label: '2 looks' }, { state: 'idle' }, { state: 'gap', label: '3 scenes · nothing' }] },
    { name: 'The Professor', cells: [{ state: 'own', label: '1 look' }, { state: 'gap' }, { state: 'idle' }] },
  ],
};

describe('CoverageTable', () => {
  it('is a table named by label, a column header per occasion and a row header per character; nothing focusable', () => {
    const { container } = render(<CoverageTable {...props} />);
    const t = screen.getByRole('table', { name: 'Wardrobe coverage' });
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Character', 'Everyday', 'Uniform', 'Combat']);
    expect(screen.getAllByRole('rowheader').map((c) => c.textContent)).toEqual(['Kiko', 'The Professor']);
    expect(t.querySelector('th[scope="row"] img')!.getAttribute('alt')).toBe('');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('each cell reads its label and its state in the legend’s words; one without a label reads the state alone', () => {
    render(<CoverageTable {...props} />);
    const cells = screen.getAllByRole('cell');
    expect(cells.map((c) => c.textContent)).toEqual(['2 looks, Has a look', '—Not needed yet', '3 scenes · nothing, A scene needs it', '1 look, Has a look', '—A scene needs it', '—Not needed yet']);
    expect(cells[0].className).toBe('sk-cover__cell is-own');
    expect(cells[1].querySelector('[aria-hidden="true"]')!.textContent).toBe('—');
  });

  it('without a legend the cells use their own words; rowLabel heads the first column', () => {
    const { container } = render(<CoverageTable occasions={['Everyday', 'Formal']} rowLabel="Cast" rows={[{ name: 'Kiko', cells: [{ state: 'own', label: '1 look' }, { state: 'gap' }] }]} />);
    expect(container.querySelector('.sk-cover__legend')).toBeNull();
    expect(screen.getAllByRole('columnheader')[0].textContent).toBe('Cast');
    expect(screen.getAllByRole('cell').map((c) => c.textContent)).toEqual(['1 look, has one', '—a scene needs one and nothing fits']);
  });

  it('the legend reads as text with its swatches hidden, the summary after', () => {
    const { container } = render(<CoverageTable {...props} />);
    const legend = container.querySelector('.sk-cover__legend')!;
    expect(legend.textContent).toBe('Has a lookA scene needs itNot needed yet2 gaps · from Episode 2');
    expect([...legend.querySelectorAll('i')].every((i) => i.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
