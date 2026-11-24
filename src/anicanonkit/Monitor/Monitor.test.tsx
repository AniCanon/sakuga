import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Monitor } from './Monitor';

afterEach(cleanup);

describe('Monitor', () => {
  it('the picture is an image named by alt, placed by imageStyle, and the labels read as text in their corners', () => {
    const { container } = render(<Monitor image="take.jpg" alt="Kiko on the platform" imageStyle="object-position:50% 40%" labels={['2C · take 3', '2:41 + 04f']} labelsEnd={['16:9']} height={180} className="x" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('sk-monitor x');
    expect(root.style.height).toBe('180px');
    const img = screen.getByRole('img', { name: 'Kiko on the platform' });
    expect(img.className).toBe('sk-monitor__pic');
    expect(img.style.objectPosition).toBe('50% 40%');
    const huds = [...root.querySelectorAll('.sk-monitor__hud')];
    expect(huds.map((h) => [h.className, h.textContent])).toEqual([['sk-monitor__hud', '2C · take 32:41 + 04f'], ['sk-monitor__hud is-end', '16:9']]);
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('without alt the picture is decorative, and the height defaults to 392', () => {
    const { container } = render(<Monitor image="take.jpg" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('img')!.getAttribute('alt')).toBe('');
    expect((container.firstElementChild as HTMLElement).style.height).toBe('392px');
    expect(container.querySelector('.sk-monitor__hud')).toBeNull();
  });

  it('the guides are hidden, and the region is read by its label', () => {
    const { container } = render(<Monitor guides={[{ x: 5, y: 5, w: 90, h: 90 }, { x: 20, y: 30, w: 40, h: 20, accent: true }]} region={{ x: 10, y: 20, w: 30, h: 40, label: 'Redraw' }} />);
    const guides = [...container.querySelectorAll('.sk-monitor__guide')] as HTMLElement[];
    expect(guides.map((g) => g.getAttribute('aria-hidden'))).toEqual(['true', 'true']);
    expect(guides[1].className).toBe('sk-monitor__guide is-accent');
    expect([guides[1].style.left, guides[1].style.top, guides[1].style.width, guides[1].style.height]).toEqual(['20%', '30%', '40%', '20%']);
    const region = container.querySelector('.sk-monitor__region') as HTMLElement;
    expect(region.textContent).toBe('Redraw');
    expect(region.style.width).toBe('30%');
  });

  it('centered, fill and contain set its frame; fill takes no height of its own; children sit over the picture', () => {
    const { container } = render(<Monitor centered fill fit="contain"><span className="kid">overlay</span></Monitor>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('sk-monitor is-centered is-fill is-contain');
    expect(root.getAttribute('style')).toBeNull();
    expect(root.querySelector('.kid')!.textContent).toBe('overlay');
  });
  it('fit="picture" sits in its room, fills the column until its picture loads, then takes the picture\'s ratio; a new picture is measured again', () => {
    const { container, rerender } = render(<Monitor image="a.jpg" fit="picture" height={180} labels={['Take 1']} />);
    const room = container.firstElementChild as HTMLElement;
    expect(room.className).toBe('sk-monitor-room');
    const root = room.firstElementChild as HTMLElement;
    expect(root.className).toBe('sk-monitor is-picture');
    expect(root.getAttribute('style')).toBeNull();
    const img = root.querySelector('img')!;
    Object.defineProperty(img, 'naturalWidth', { value: 900, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 1600, configurable: true });
    fireEvent.load(img);
    expect(root.className).toBe('sk-monitor is-picture is-sized');
    expect(root.style.getPropertyValue('--monitor-ratio')).toBe('0.5625');
    rerender(<Monitor image="b.jpg" fit="picture" labels={['Take 2']} />);
    const again = container.querySelector('.sk-monitor') as HTMLElement;
    expect(again.className).toBe('sk-monitor is-picture');
  });

  it('ratio makes it the program\'s frame whatever the picture, with no picture at all too', () => {
    const { container } = render(<Monitor ratio="9 / 16" labels={['0:00']} />);
    const monitor = container.querySelector('.sk-monitor') as HTMLElement;
    expect(monitor.classList.contains('is-picture')).toBe(true);
    expect(monitor.classList.contains('is-sized')).toBe(true);
    expect(monitor.style.getPropertyValue('--monitor-ratio')).toBe('0.5625');
    expect(container.firstElementChild!.className).toBe('sk-monitor-room');
  });


  it('picks: a click takes the topmost under the pointer, again the one beneath, where none is clears; hover outlines; a double-click edits', () => {
    const picks = [
      { id: 'title', label: 'Three days later', box: { x: 10, y: 40, w: 50, h: 20 }, editable: true },
      { id: 'clip', label: '2C · take 3', box: { x: 0, y: 0, w: 100, h: 100 } },
    ];
    const onPick = vi.fn(), onEdit = vi.fn();
    const { container, rerender } = render(<Monitor image="take.jpg" height={200} picks={picks} selected={null} onPick={onPick} onEdit={onEdit} />);
    const frame = container.firstElementChild as HTMLElement;
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 1000, height: 500, right: 1000, bottom: 500, x: 0, y: 0, toJSON() {} } as DOMRect);
    const at = (x: number, y: number) => ({ clientX: x, clientY: y });
    // jsdom has no PointerEvent to carry the position, so the move goes as a mouse event of that name
    fireEvent(frame, new MouseEvent('pointermove', { bubbles: true, ...at(300, 250) }));
    expect(container.querySelector('.sk-pick')!.textContent).toBe('Three days later');
    fireEvent.click(frame, { ...at(300, 250), detail: 1 });
    expect(onPick).toHaveBeenLastCalledWith('title');
    rerender(<Monitor image="take.jpg" height={200} picks={picks} selected="title" onPick={onPick} onEdit={onEdit} />);
    fireEvent.click(frame, { ...at(300, 250), detail: 1 });
    expect(onPick).toHaveBeenLastCalledWith('clip');
    rerender(<Monitor image="take.jpg" height={200} picks={[picks[0]]} selected="title" onPick={onPick} onEdit={onEdit} />);
    fireEvent.click(frame, { ...at(900, 50), detail: 1 });
    expect(onPick).toHaveBeenLastCalledWith(null);
    fireEvent.click(frame, { ...at(300, 250), detail: 2 });
    expect(onEdit).toHaveBeenCalledWith('title');
  });

});
