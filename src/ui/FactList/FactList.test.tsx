import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FactList } from './FactList';

afterEach(cleanup);

const items = [{ label: 'Brightness', value: '2C is 12% brighter' }, { label: 'Contrast', value: '−4%' }];

describe('FactList', () => {
  it('is a description list: each name a term, its value the description', () => {
    const { container } = render(<FactList items={items} />);
    const dl = container.firstElementChild!;
    expect(dl.tagName).toBe('DL');
    expect(dl.className).toBe('sk-facts');
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Brightness', 'Contrast']);
    expect(screen.getAllByRole('definition').map((d) => d.textContent)).toEqual(['2C is 12% brighter', '−4%']);
    expect([...dl.children].map((c) => c.tagName)).toEqual(['DT', 'DD', 'DT', 'DD']);
  });

  it('is not focusable', () => {
    const { container } = render(<FactList items={items} />);
    expect(container.querySelectorAll('[tabindex],a,button,input')).toHaveLength(0);
  });

  it('grid sets each fact as a block, its note read with the value; columns sets the grid', () => {
    const { container } = render(<FactList layout="grid" columns={3} className="x" items={[{ label: 'Age', value: '17', note: 'since Fire at Sé' }, { label: 'Home', value: 'Lisbon' }]} />);
    const dl = container.firstElementChild as HTMLElement;
    expect(dl.className).toBe('sk-facts sk-facts--grid x');
    expect(dl.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
    expect([...dl.children].map((c) => c.className)).toEqual(['sk-facts__item', 'sk-facts__item']);
    expect(screen.getAllByRole('definition')[0].textContent).toBe('17since Fire at Sé');
    expect(screen.getAllByRole('definition')[0].querySelector('small')!.textContent).toBe('since Fire at Sé');
  });

  it('columns does nothing outside the grid', () => {
    const { container } = render(<FactList columns={3} items={items} />);
    expect((container.firstElementChild as HTMLElement).getAttribute('style')).toBeNull();
  });
});
