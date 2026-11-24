import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CanvasStage } from './CanvasStage';

const live = () => document.querySelector('[aria-live="polite"]');

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

const box = { x: 20, y: 15, w: 50, h: 60 };

/* A pointer event jsdom can dispatch: its MouseEvent carries the position, the id is added */
function pointer(type: string, target: EventTarget, x: number, y: number, id = 1) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(e, 'pointerId', { value: id });
  act(() => { target.dispatchEvent(e); });
}

describe('CanvasStage', () => {
  it('the selection is a group named Selected item, described by its position and size; without onBox it is not focusable', () => {
    const { container } = render(<CanvasStage image="a.jpg" alt="Bruce" box={box} height={200} ratio="9 / 16" className="x" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('sk-stage x');
    expect(root.style.height).toBe('200px');
    // The frame's shape as the design computes it: 9 / 16 as a number
    expect((root.querySelector('.sk-stage__frame') as HTMLElement).style.aspectRatio).toBe('0.5625');
    const sel = screen.getByRole('group', { name: 'Selected item' });
    expect(sel.className).toBe('sk-stage__sel');
    expect(sel.getAttribute('tabindex')).toBeNull();
    expect(sel.getAttribute('aria-roledescription')).toBeNull();
    expect(document.getElementById(sel.getAttribute('aria-describedby')!)!.textContent).toBe('left 20%, top 15%, 50% wide, 60% tall');
    expect([sel.style.left, sel.style.top, sel.style.width, sel.style.height]).toEqual(['20%', '15%', '50%', '60%']);
    expect(screen.getByRole('img', { name: 'Bruce' })).toBeTruthy();
    const handles = [...sel.querySelectorAll('.sk-stage__h')];
    expect(handles.map((h) => h.className.replace('sk-stage__h is-', ''))).toEqual(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']);
    expect(handles.every((h) => h.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(root.querySelector('.sk-stage__mask')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('with onBox it is one Tab stop, an application read as a movable item: arrows move it a percent, Shift and an arrow resize it, each change said aloud', () => {
    const onBox = vi.fn();
    render(<CanvasStage box={box} label="Bruce" onBox={onBox} />);
    const sel = screen.getByRole('application', { name: 'Bruce' });
    expect(sel.getAttribute('aria-roledescription')).toBe('movable item');
    expect(sel.tabIndex).toBe(0);
    expect(sel.className).toBe('sk-stage__sel is-movable');
    expect(document.getElementById(sel.getAttribute('aria-describedby')!)!.textContent).toBe('left 20%, top 15%, 50% wide, 60% tall. Arrow keys move it; Shift and an arrow key resize it.');
    fireEvent.keyDown(sel, { key: 'ArrowRight' });
    fireEvent.keyDown(sel, { key: 'ArrowUp' });
    fireEvent.keyDown(sel, { key: 'ArrowDown', shiftKey: true });
    fireEvent.keyDown(sel, { key: 'ArrowLeft', shiftKey: true });
    fireEvent.keyDown(sel, { key: 'Enter' });
    expect(onBox.mock.calls.map((c) => c[0])).toEqual([
      { x: 21, y: 15, w: 50, h: 60 }, { x: 20, y: 14, w: 50, h: 60 }, { x: 20, y: 15, w: 50, h: 61 }, { x: 20, y: 15, w: 49, h: 60 },
    ]);
    act(() => { vi.advanceTimersByTime(200); });
    expect(live()!.textContent).toBe('left 20%, top 15%, 49% wide, 60% tall');
  });

  it('never resizes below 1%', () => {
    const onBox = vi.fn();
    render(<CanvasStage box={{ x: 0, y: 0, w: 1, h: 1 }} onBox={onBox} />);
    fireEvent.keyDown(screen.getByRole('application'), { key: 'ArrowLeft', shiftKey: true });
    expect(onBox).toHaveBeenCalledWith({ x: 0, y: 0, w: 1, h: 1 });
  });

  it('dragging the box moves it; a handle resizes from its own edge; the new place is said when the drag ends', () => {
    const onBox = vi.fn();
    const { container } = render(<CanvasStage box={box} onBox={onBox} />);
    vi.spyOn(container.querySelector('.sk-stage__frame')!, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 100, left: 0, top: 0, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} } as DOMRect);
    const sel = screen.getByRole('application');
    pointer('pointerdown', sel, 100, 50);
    pointer('pointermove', window, 120, 60);
    expect(onBox).toHaveBeenLastCalledWith({ x: 30, y: 25, w: 50, h: 60 });
    pointer('pointerup', window, 120, 60);
    act(() => { vi.advanceTimersByTime(200); });
    expect(live()!.textContent).toBe('left 30%, top 25%, 50% wide, 60% tall');
    const nw = container.querySelector('.sk-stage__h.is-nw')!;
    pointer('pointerdown', nw, 40, 15, 2);
    pointer('pointermove', window, 20, 5, 2);
    expect(onBox).toHaveBeenLastCalledWith({ x: 10, y: 5, w: 60, h: 70 });
    pointer('pointerup', window, 20, 5, 2);
  });

  it('each of the eight handles resizes from its own edge or corner, the opposite one staying put, never below 1%', () => {
    const onBox = vi.fn();
    const { container } = render(<CanvasStage box={box} onBox={onBox} />);
    vi.spyOn(container.querySelector('.sk-stage__frame')!, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 100, left: 0, top: 0, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} } as DOMRect);
    /* Each handle dragged 20px right and 10px down: 10% across, 10% down */
    const drag = (k: string) => {
      const h = container.querySelector(`.sk-stage__h.is-${k}`)!;
      pointer('pointerdown', h, 100, 50, 7);
      pointer('pointermove', window, 120, 60, 7);
      pointer('pointerup', window, 120, 60, 7);
      return onBox.mock.calls[onBox.mock.calls.length - 1][0];
    };
    expect(drag('n')).toEqual({ x: 20, y: 25, w: 50, h: 50 });
    expect(drag('ne')).toEqual({ x: 20, y: 25, w: 60, h: 50 });
    expect(drag('e')).toEqual({ x: 20, y: 15, w: 60, h: 60 });
    expect(drag('se')).toEqual({ x: 20, y: 15, w: 60, h: 70 });
    expect(drag('s')).toEqual({ x: 20, y: 15, w: 50, h: 70 });
    expect(drag('sw')).toEqual({ x: 30, y: 15, w: 40, h: 70 });
    expect(drag('w')).toEqual({ x: 30, y: 15, w: 40, h: 60 });
    /* Past the opposite edge it stops at 1% */
    const w = container.querySelector('.sk-stage__h.is-w')!;
    pointer('pointerdown', w, 0, 0, 8);
    pointer('pointermove', window, 400, 0, 8);
    pointer('pointerup', window, 400, 0, 8);
    expect(onBox.mock.calls[onBox.mock.calls.length - 1][0]).toEqual({ x: 69, y: 15, w: 1, h: 60 });
  });

  it('without onBox the pointer does nothing', () => {
    const { container } = render(<CanvasStage box={box} />);
    pointer('pointerdown', screen.getByRole('group'), 0, 0);
    pointer('pointermove', window, 50, 50);
    expect(container.querySelector('.is-dragging')).toBeNull();
  });
});

describe('CanvasStage guides and region', () => {
  it('draws them inside the frame, in percent of the frame, with the page’s children after them', () => {
    const { container } = render(<CanvasStage box={box} ratio="9 / 16" guides={[{ x: 5, y: 5, w: 90, h: 90 }]} region={{ x: 15, y: 60, w: 70, h: 25, label: 'Patch' }}><span className="mine" /></CanvasStage>);
    const frame = container.querySelector('.sk-stage__frame')!;
    const guide = frame.querySelector<HTMLElement>('.sk-monitor__guide')!;
    expect([guide.style.left, guide.style.width, guide.getAttribute('aria-hidden')]).toEqual(['5%', '90%', 'true']);
    expect(frame.querySelector('.sk-monitor__region')!.textContent).toBe('Patch');
    expect(frame.lastElementChild!.classList.contains('mine')).toBe(true);
  });

  it('fill takes the column with the frame of its ratio, and a box past the frame scales the frame to hold it', () => {
    const { container, rerender } = render(<CanvasStage fill ratio="9 / 16" box={{ x: 10, y: 10, w: 80, h: 80 }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('sk-stage is-fill');
    expect(root.style.height).toBe('');
    expect(root.style.getPropertyValue('--stage-ratio')).toBe('0.5625');
    expect(root.style.getPropertyValue('--stage-fit')).toBe('1');
    rerender(<CanvasStage fill ratio="16:9" box={{ x: -10, y: 0, w: 120, h: 100 }} />);
    expect(root.className).toBe('sk-stage is-fill is-past');
    expect(Number(root.style.getPropertyValue('--stage-fit'))).toBeCloseTo(100 / 120, 6);
  });


  it('picks: Escape on the selected box clears it, a click on the box takes the one beneath, and a click on its dimmed part past the frame does nothing', () => {
    const picks = [
      { id: 'title', label: 'Three days later', box: { x: 10, y: 40, w: 50, h: 20 } },
      { id: 'clip', label: '2C · take 3', box: { x: -10, y: -10, w: 120, h: 120 } },
    ];
    const onPick = vi.fn();
    const { container } = render(<CanvasStage image="take.jpg" box={{ x: -10, y: -10, w: 120, h: 120 }} label="2C" onBox={() => {}} picks={picks} selected="clip" onPick={onPick} />);
    const frame = container.querySelector<HTMLElement>('.sk-stage__frame')!;
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 100, width: 1000, height: 500, right: 1100, bottom: 600, x: 100, y: 100, toJSON() {} } as DOMRect);
    const sel = container.querySelector<HTMLElement>('.sk-stage__sel')!;
    fireEvent.keyDown(sel, { key: 'Escape' });
    expect(onPick).toHaveBeenLastCalledWith(null);
    onPick.mockClear();
    fireEvent.click(sel, { clientX: 400, clientY: 350, detail: 1 });
    expect(onPick).toHaveBeenLastCalledWith('title');
    onPick.mockClear();
    fireEvent.click(sel, { clientX: 50, clientY: 350, detail: 1 });
    expect(onPick).not.toHaveBeenCalled();
  });

});
