import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PageWall, type PageWallProps } from './PageWall';

afterEach(cleanup);

const spreads: PageWallProps['spreads'] = [
  [{ image: 'c.jpg', label: 'Front cover', title: 'Cover', meta: 'Drawn', stage: 2 }],
  [{ image: '3.jpg', title: '3 · Bruce', meta: 'Lettered', stage: 3 }, { image: '4.jpg', alt: 'Page 4', title: '4', meta: 'Proofed', stage: 4 }],
  [{ blank: true, title: 'Back', meta: 'Not made', stage: 0 }],
  [{ image: '9.jpg', label: 'Page 9' }],
];

describe('PageWall', () => {
  it('is a list named The whole issue, a spread per item, and nothing is focusable', () => {
    const { container } = render(<PageWall spreads={spreads} className="x" />);
    const list = screen.getByRole('list', { name: 'The whole issue' });
    expect(list.className).toBe('sk-wall x');
    expect(list.style.gridTemplateColumns).toBe('repeat(3, max-content)');
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(container.querySelectorAll('figure, button, a, [tabindex]')).toHaveLength(0);
  });

  it('each page is an image named by its label, alt or title, then its title, meta and stage read as text', () => {
    const { container } = render(<PageWall spreads={spreads} label="Issue 1" size={64} />);
    expect(screen.getByRole('list', { name: 'Issue 1' })).toBeTruthy();
    expect(container.querySelectorAll('.sk-mpage')[1].getAttribute('aria-label')).toBe('3 · Bruce');
    expect(container.querySelectorAll('.sk-mpage')[2].getAttribute('aria-label')).toBe('Page 4');
    const caps = [...container.querySelectorAll('.sk-wall__cap')];
    expect(caps[1].textContent).toBe('3 · BruceLettered');
    const stage = within(caps[1] as HTMLElement).getByRole('img', { name: 'Lettered' });
    expect([...stage.children].map((i) => i.className)).toEqual(['is-on', 'is-on', 'is-on', '']);
    expect(within(caps[3] as HTMLElement).getByRole('img', { name: 'Laid out' })).toBeTruthy();
    expect(caps[4].querySelector('.sk-wall__stage')).toBeNull();
    expect((container.querySelector('.sk-wall__page') as HTMLElement).style.width).toBe('64px');
  });

  it('a Page turn separator sits between spreads in a row, never at a row\'s end', () => {
    const { container } = render(<PageWall spreads={spreads} columns={2} steps={['A', 'B', 'C', 'D']} />);
    const cells = [...container.querySelectorAll('.sk-wall__cell')];
    expect(cells.map((c) => !!c.querySelector('[role="separator"]'))).toEqual([true, false, true, false]);
    expect(screen.getAllByRole('separator', { name: 'Page turn' })).toHaveLength(2);
    expect(screen.getAllByRole('img', { name: 'B' })).toHaveLength(1);
  });
});
