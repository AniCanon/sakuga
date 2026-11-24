import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MangaPage, type MangaFrame } from './MangaPage';

afterEach(cleanup);

const frames: MangaFrame[] = [
  { x: 4, y: 4, w: 92, h: 30, number: '6.1' },
  { x: 4, y: 36, w: 44, h: 28, number: '6.2', state: 'drawing' },
  { x: 52, y: 36, w: 44, h: 28, number: '6.3', state: 'waiting' },
  { x: 4, y: 66, w: 92, h: 30, number: '6.4', state: 'waiting', label: 'Queued' },
];

describe('MangaPage', () => {
  it('is one image named by label, at its trim, and not focusable', () => {
    const { container } = render(<MangaPage image="p.jpg" label="Page 3" alt="ignored" className="x" />);
    const page = screen.getByRole('img', { name: 'Page 3' });
    expect(page.className).toBe('sk-mpage x');
    expect([page.style.width, page.style.height]).toEqual(['120px', Math.round(120 * 2048 / 1448) + 'px']);
    expect(page.querySelector('img')!.getAttribute('alt')).toBe('');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('is named by alt, then title, else "Page", followed by selected and how many frames are drawing or waiting', () => {
    const { rerender } = render(<MangaPage alt="The roof" selected />);
    expect(screen.getByRole('img', { name: 'The roof, selected' }).className).toBe('sk-mpage is-selected');
    rerender(<MangaPage frames={frames} />);
    expect(screen.getByRole('img', { name: 'Page, 1 frame drawing, 2 frames waiting' })).toBeTruthy();
    rerender(<MangaPage blank />);
    expect(screen.getByRole('img', { name: 'Page' }).className).toBe('sk-mpage is-blank');
  });

  it('a frame drawing or waiting says so inside it when the page is 96 wide or more; numbers print each frame\'s number', () => {
    const { container, rerender } = render(<MangaPage frames={frames} numbers width={120} />);
    const fs = [...container.querySelectorAll('.sk-mpage__frame')] as HTMLElement[];
    expect(fs.map((f) => f.className)).toEqual(['sk-mpage__frame', 'sk-mpage__frame is-drawing', 'sk-mpage__frame is-waiting', 'sk-mpage__frame is-waiting']);
    expect(fs.map((f) => f.textContent)).toEqual(['6.1', '6.2Drawing…', '6.3Waiting', '6.4Queued']);
    expect([fs[1].style.left, fs[1].style.top, fs[1].style.width, fs[1].style.height]).toEqual(['4%', '36%', '44%', '28%']);
    rerender(<MangaPage frames={frames} width={30} />);
    expect(container.querySelectorAll('.sk-mpage__frame small, .sk-mpage__frame b')).toHaveLength(0);
  });

  it('the mask and the selection are drawn, and the page\'s one name says them (maskLabel, selectionLabel)', () => {
    const { container, rerender } = render(<MangaPage mask={{ x: 1, y: 2, w: 3, h: 4 }} selection={{ x: 4, y: 36, w: 44, h: 28 }} ratio={1} width={100} />);
    const page = screen.getByRole('img', { name: 'Page, the area to redraw marked, an item selected' });
    expect(page.style.height).toBe('100px');
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByRole('group')).toBeNull();
    expect(container.querySelector('.sk-mpage__mask')!.hasAttribute('aria-label')).toBe(false);
    expect(container.querySelectorAll('.sk-mpage__sel .sk-mpage__h')).toHaveLength(8);
    rerender(<MangaPage label="Page 4" selected mask={{ x: 1, y: 2, w: 3, h: 4 }} maskLabel="the sky to redraw" selection={{ x: 4, y: 36, w: 44, h: 28 }} selectionLabel="panel 4.2 selected" ratio={1} width={100} />);
    expect(screen.getByRole('img', { name: 'Page 4, selected, the sky to redraw, panel 4.2 selected' })).toBeTruthy();
  });

  it('with title or meta it sits in a figure captioned by them, where the action slot takes focus', () => {
    const { container } = render(
      <MangaPage image="p.jpg" title="3 · Bruce" meta="Lettered" align="end" className="x" width={96}>
        <span slot="action"><button type="button">Page menu</button></span>
      </MangaPage>,
    );
    const fig = container.firstElementChild as HTMLElement;
    expect(fig.tagName).toBe('FIGURE');
    expect(fig.className).toBe('sk-mpage-fig is-end x');
    expect(screen.getByRole('img', { name: '3 · Bruce' }).className).toBe('sk-mpage');
    const cap = fig.querySelector('figcaption') as HTMLElement;
    expect(cap.style.width).toBe('96px');
    expect(cap.textContent).toBe('3 · BruceLetteredPage menu');
    expect(screen.getByRole('figure')).toBe(fig);
    expect(screen.getByRole('button', { name: 'Page menu' }).closest('figcaption')).toBe(cap);
  });
});
