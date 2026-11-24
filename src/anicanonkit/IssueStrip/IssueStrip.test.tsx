import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { IssueStrip, type IssueStripProps } from './IssueStrip';

afterEach(cleanup);

const spreads: IssueStripProps['spreads'] = [
  [{ image: 'c.jpg', label: 'Front cover' }],
  [{ image: '3.jpg', label: 'Page 3', title: '3 · Bruce' }, { image: '4.jpg', label: 'Page 4', selected: true }],
  [{ frames: [{ x: 0, y: 0, w: 50, h: 50, state: 'drawing' }], label: 'Page 5' }, { blank: true }],
];

describe('IssueStrip', () => {
  it('its label and key read as text, then a list named Spreads, each spread an item of page images, and nothing is focusable', () => {
    const { container } = render(<IssueStrip spreads={spreads} className="x" />);
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-istrip x');
    expect(root.querySelector('.sk-sec')!.textContent).toBe('The issue, spread by spreadPage turn');
    const list = screen.getByRole('list', { name: 'Spreads' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(within(items[1]).getAllByRole('img').map((i) => i.getAttribute('aria-label'))).toEqual(['Page 3', 'Page 4, selected']);
    expect(within(items[2]).getAllByRole('img').map((i) => i.getAttribute('aria-label'))).toEqual(['Page 5, 1 frame drawing', 'Page']);
    expect(container.querySelectorAll('figure, button, a, [tabindex]')).toHaveLength(0);
  });

  it('a rule marks every page turn, hidden', () => {
    const { container } = render(<IssueStrip spreads={spreads} />);
    const turns = [...container.querySelectorAll('.sk-istrip__turn')];
    expect(turns).toHaveLength(2);
    expect(turns.every((t) => t.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('pages take the strip\'s size, 30 by default', () => {
    const { rerender } = render(<IssueStrip spreads={spreads} />);
    expect(screen.getByRole('img', { name: 'Front cover' }).style.width).toBe('30px');
    rerender(<IssueStrip spreads={spreads} size={56} />);
    expect(screen.getByRole('img', { name: 'Front cover' }).style.width).toBe('56px');
  });

  it('selectSpread rings the spread holding the selected page, which starts with "Selected spread"', () => {
    render(<IssueStrip spreads={spreads} selectSpread />);
    const items = screen.getAllByRole('listitem');
    expect(items[1].className).toBe('sk-istrip__spread is-selected');
    expect(items[1].firstElementChild!.textContent).toBe('Selected spread: ');
    expect(within(items[1]).getAllByRole('img')[1].getAttribute('aria-label')).toBe('Page 4');
    expect(items[0].className).toBe('sk-istrip__spread');
  });

  it('label names the header, turnLabel its key, and false hides it', () => {
    const { container, rerender } = render(<IssueStrip spreads={spreads} label="The issue" turnLabel="Turn" />);
    expect(container.querySelector('.sk-sec')!.textContent).toBe('The issueTurn');
    rerender(<IssueStrip spreads={spreads} label={false} />);
    expect(container.querySelector('.sk-sec')).toBeNull();
  });
});
