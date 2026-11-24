import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from '../IconButton/IconButton';
import { Thumb } from './Thumb';

afterEach(cleanup);

const css = readFileSync('src/ui/Thumb/Thumb.css', 'utf8');

describe('Thumb', () => {
  it('is a picture whose alt is hidden by default, 16:9 at full width', () => {
    const { container } = render(<Thumb image="/a.jpg" />);
    const f = container.firstElementChild as HTMLElement;
    expect(f.tagName).toBe('SPAN');
    expect(f.className).toBe('sk-thumb');
    expect(f.style.width).toBe('100%');
    expect(f.style.aspectRatio).toBe('16 / 9');
    expect(f.querySelector('img')!.getAttribute('alt')).toBe('');
  });

  it('says selected and rejected after its picture', () => {
    render(<><Thumb image="/a.jpg" alt="Take 1" selected /><Thumb image="/b.jpg" alt="Take 2" muted width={128} height={72} /></>);
    expect(screen.getByRole('img', { name: 'Take 1' }).closest('.sk-thumb')!.textContent).toBe('selected');
    const muted = screen.getByRole('img', { name: 'Take 2' }).closest('.sk-thumb') as HTMLElement;
    expect(muted.className).toBe('sk-thumb is-muted');
    expect(muted.textContent).toBe('rejected');
    expect(muted.style.width).toBe('128px');
  });

  it('is a figure captioned by title and meta', () => {
    render(<Thumb image="/a.jpg" alt="Sé station" title="Sé station" meta="Backdrop · night" className="x" />);
    const fig = screen.getByRole('figure');
    expect(fig.className).toBe('sk-thumbfig x');
    expect(fig.querySelector('figcaption')!.textContent).toBe('Sé stationBackdrop · night');
  });

  it('is a toggle button with onClick, pressed when selected, named by label', () => {
    const onClick = vi.fn();
    render(<><Thumb image="/a.jpg" label="Take 1" selected onClick={onClick} /><Thumb image="/b.jpg" label="Take 3" muted onClick={onClick} /></>);
    const b = screen.getByRole('button', { name: 'Take 1', pressed: true });
    expect(b.getAttribute('type')).toBe('button');
    expect(b.tabIndex).toBe(0);
    expect(b.querySelector('.sk-sr')).toBeNull();
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Take 3, rejected', pressed: false })).toBeTruthy();
  });

  it('names what will fill a frame not made yet', () => {
    const { container } = render(<Thumb placeholder="Board drawn when you approve the cut" />);
    expect(container.firstElementChild!.className).toBe('sk-thumb is-placeholder');
    expect(screen.getByText('Board drawn when you approve the cut').className).toBe('sk-thumb__placeholder');
  });

  it('lights its picture with a light map, never when muted or turned off', () => {
    const { container } = render(<><Thumb image="/a.jpg" lightMap="/a.webp" imageStyle="object-position:30% 40%" /><Thumb image="/a.jpg" lightMap="/a.webp" muted /><Thumb image="/a.jpg" lightMap="/a.webp" light={false} /></>);
    const [lit, muted, off] = container.querySelectorAll<HTMLElement>('.sk-thumb');
    expect(lit.className).toBe('sk-thumb has-light');
    const layer = lit.querySelector<HTMLImageElement>('img.sk-light')!;
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(layer.style.objectPosition).toBe('30% 40%');
    expect(muted.querySelector('.sk-light')).toBeNull();
    expect(off.querySelector('.sk-light')).toBeNull();
  });
  it('passes className to a bare frame', () => {
    const { container } = render(<Thumb image="/a.jpg" className="x" />);
    expect(container.firstElementChild!.className).toBe('sk-thumb x');
  });

  it('develops every picture in as Version 215 does; develop adds nothing (its README)', () => {
    const { container, rerender } = render(<Thumb image="/a.jpg" />);
    expect(container.querySelector('img')!.className).toBe('');
    rerender(<Thumb image="/a.jpg" develop />);
    expect(container.querySelector('img')!.className).toBe('');
    expect(css).toMatch(/\.sk-thumb>\.sk-clip>img\{[^}]*animation:var\(--thumb-img-develop-animation\) backwards\}/);
  });

  it('a new picture never cuts: the old one stays until the new one has loaded, then goes once it has developed in', () => {
    const { container, rerender } = render(<Thumb image="/a.jpg" alt="Smith" />);
    rerender(<Thumb image="/b.jpg" alt="Smith" />);
    let imgs = container.querySelectorAll('img');
    expect([...imgs].map((i) => [i.getAttribute('src'), i.className, i.alt])).toEqual([['/a.jpg', 'sk-thumb__was', ''], ['/b.jpg', 'is-waiting', 'Smith']]);
    fireEvent.load(imgs[1]);
    imgs = container.querySelectorAll('img');
    expect(imgs[1].className).toBe('');
    fireEvent.animationEnd(imgs[1]);
    expect([...container.querySelectorAll('img')].map((i) => i.getAttribute('src'))).toEqual(['/b.jpg']);
    expect(css).toContain('.sk-thumb>.sk-clip>img.is-waiting{opacity:0;animation:none}');
  });

  it('an empty frame can stand a silhouette above its words, hidden, on the canvas colour', () => {
    const { container } = render(<Thumb placeholder="No portrait yet" placeholderIcon="age-adult" ratio="9 / 16" />);
    const sil = container.querySelector('.sk-thumb__silhouette')!;
    expect(sil.getAttribute('aria-hidden')).toBe('true');
    expect(sil.nextElementSibling!.textContent).toBe('No portrait yet');
    expect(container.querySelector('.sk-thumb')!.className).toContain('is-placeholder');
    expect(css).toContain('.sk-thumb.is-placeholder:has(.sk-thumb__silhouette){flex-direction:column;gap:var(--thumb-silhouette-gap);background:var(--thumb-silhouette-bg)}');
    expect(render(<Thumb image="/a.jpg" placeholder="x" placeholderIcon="age-adult" />).container.querySelector('.sk-thumb__silhouette')).toBeNull();
  });

  it('keeps a selected ring in forced colours, in Highlight', () => {
    expect(css).toContain('@media (forced-colors:active){.sk-thumb.is-selected{outline:var(--thumb-selected-ring-width) solid Highlight}}');
  });

  it('with href it is a picture card: the title is the link, and its action is its own control outside it', () => {
    render(
      <Thumb image="se.jpg" title="Sé station" meta="5 views" href="/s/eba/places/se">
        <span slot="action"><button type="button">Shoot it</button></span>
      </Thumb>,
    );
    const link = screen.getByRole('link', { name: 'Sé station' });
    expect(link.getAttribute('href')).toBe('/s/eba/places/se');
    expect(link.closest('.sk-thumblink')).not.toBeNull();
    expect(link.contains(screen.getByRole('button', { name: 'Shoot it' }))).toBe(false);
    expect(screen.getByText('5 views')).toBeTruthy();
    expect(css).toContain('.sk-thumblink__a::after{content:"";position:absolute;inset:0');
  });

  it('captioned without href, its action sits over the frame after the frame, its own control, and a press on the picture still chooses', () => {
    const choose = vi.fn(), remove = vi.fn();
    const { container } = render(
      <Thumb image="/a.jpg" title="Frame 2" label="Frame 2" onClick={choose}>
        <IconButton slot="action" variant="media" icon="close" label="Remove Frame 2" onClick={remove} />
      </Thumb>,
    );
    const frame = container.querySelector('.sk-thumbfig__frame')!;
    expect(frame.children[0].matches('button.sk-thumb')).toBe(true);
    expect(frame.children[1].className).toBe('sk-thumbfig__action');
    expect(frame.querySelector('.sk-thumb')!.querySelector('[aria-label="Remove Frame 2"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Frame 2' }));
    expect(remove).toHaveBeenCalledTimes(1);
    expect(choose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Frame 2' }));
    expect(choose).toHaveBeenCalledTimes(1);
  });

  it('a bare frame or a captioned one with no action keeps its children over the picture', () => {
    const { container } = render(<Thumb image="/a.jpg" title="Frame 1"><i className="badge" /></Thumb>);
    expect(container.querySelector('.sk-thumbfig__frame')).toBeNull();
    expect(container.querySelector('.sk-clip > .badge')).not.toBeNull();
  });

  it('drawing, the app\'s loader sits at the frame\'s centre named by the placeholder, and the words under it stay quiet', () => {
    const { container } = render(<Thumb placeholder="Drawing the banner" drawing />);
    expect(container.querySelector('.sk-thumb')!.classList.contains('is-drawing')).toBe(true);
    expect(screen.getByRole('status', { name: 'Drawing the banner' })).toBeTruthy();
    expect(container.querySelector('.sk-thumb__placeholder')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('drawing ends when the picture comes: no loader, no drawing state', () => {
    const { container } = render(<Thumb placeholder="Drawing the banner" drawing image="/a.jpg" />);
    expect(container.querySelector('.is-drawing')).toBeNull();
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});

describe('Thumb with onInsert', () => {
  it('adds itself: its own Add button, Enter or a double-click on the card, while Space and a press still select', () => {
    const insert = vi.fn(), pick = vi.fn();
    const { container } = render(<Thumb title="Popcorn night" image="/p.jpg" onInsert={insert} onClick={pick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Popcorn night' }));
    expect(insert).toHaveBeenCalledTimes(1);
    const frame = screen.getByRole('button', { name: 'Popcorn night' });
    fireEvent.keyDown(frame, { key: 'Enter' });
    fireEvent.doubleClick(frame);
    expect(insert).toHaveBeenCalledTimes(3);
    fireEvent.click(frame);
    expect(pick).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.sk-ins')!.getAttribute('aria-describedby')).toBe(container.querySelector('.sk-ins .sk-sr')!.id);
    expect(container.querySelector('.sk-ins .sk-sr')!.textContent).toBe('Enter or a double-click adds it at the playhead; drag it onto the timeline to place it');
  });

  it('with dragData it drags, and without onInsert has no Add button', () => {
    const { container } = render(<Thumb title="Popcorn night" dragData={{ kind: 'video', length: 2 }} />);
    expect(container.querySelector('.sk-ins')!.getAttribute('draggable')).toBe('true');
    expect(screen.queryByRole('button', { name: 'Add Popcorn night' })).toBeNull();
  });
});
