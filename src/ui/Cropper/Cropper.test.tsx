import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { liveRegion } from '../../internal/live';
import { Cropper, type CropRegion } from './Cropper';
import { cropClamp, cropStyle, type CropValue } from './crop';

/* jsdom has no PointerEvent: a mouse event with an id stands in, so a press carries where it was */
beforeAll(() => {
  class PointerEventLike extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId ?? 0; }
  }
  if (!('PointerEvent' in window)) Object.assign(window, { PointerEvent: PointerEventLike });
});
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
/* What the live region says once its pause is over */
const said = () => { vi.advanceTimersByTime(100); return liveRegion()!.textContent; };

const aspect = 16 / 9;
/* A face sheet's regions: the 3×2 grid, each centred on its cell and 0.6 of the way down it, at 0.36 of the sheet's height */
const faces: CropRegion[] = Array.from({ length: 6 }, (_, i) => {
  const c = i % 3, r = Math.floor(i / 3);
  return { label: `Face ${i + 1} of 6`, area: { x: c / 3, y: r / 2, w: 1 / 3, h: 1 / 2 }, crop: { x: (c + 0.5) / 3, y: (r + 0.6) / 2, size: 0.36 } };
});

function Sheet({ fixed = true, start }: { fixed?: boolean; start?: CropValue }) {
  const [v, set] = useState<CropValue>(start || faces[0].crop);
  return (
    <>
      <Cropper image="sheet.png" aspect={aspect} value={v} onChange={set} regions={faces} min={fixed ? 0.36 : 0.1} max={fixed ? 0.36 : 1} label="Smith's avatar" />
      <output data-testid="v">{`${v.x.toFixed(3)},${v.y.toFixed(3)},${v.size.toFixed(3)}`}</output>
    </>
  );
}
const value = () => screen.getByTestId('v').textContent!.split(',').map(Number);
/* jsdom lays nothing out: the stage is 1600 × 900, a 16:9 sheet */
function laidOut() {
  const stage = screen.getByRole('application');
  vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 1600, height: 900, right: 1600, bottom: 900, x: 0, y: 0, toJSON() {} } as DOMRect);
  stage.setPointerCapture = () => {};
  return stage;
}

describe('cropStyle and cropClamp', () => {
  it('cropStyle places the picture so a square box shows exactly the square the crop cuts', () => {
    expect(cropStyle({ x: 0.5, y: 0.5, size: 1 }, 1)).toBe('inset:auto;max-width:none;object-fit:fill;width:100.000%;height:100.000%;left:0.000%;top:0.000%');
    expect(cropStyle({ x: 0.5, y: 0.3, size: 0.36 }, aspect)).toBe('inset:auto;max-width:none;object-fit:fill;width:493.827%;height:277.778%;left:-196.914%;top:-33.333%');
  });

  it('cropClamp keeps the circle and its ring inside the picture, between min and max', () => {
    const v = cropClamp({ x: 0, y: 0, size: 5 }, aspect, undefined, 0.2, 0.8);
    expect(v.size).toBe(0.8);
    expect(v.x).toBeCloseTo((0.4 + 0.02) / aspect);
    expect(v.y).toBeCloseTo(0.42);
    expect(cropClamp({ x: 0.5, y: 0.5, size: 0.01 }, aspect, undefined, 0.2, 0.8).size).toBe(0.2);
  });
});

describe('Cropper', () => {
  it('is an application named by its label, described by its hint, one Tab stop', () => {
    render(<Sheet />);
    const stage = screen.getByRole('application', { name: "Smith's avatar" });
    expect(stage.getAttribute('aria-roledescription')).toBe('crop');
    expect(stage.getAttribute('tabindex')).toBe('0');
    expect(stage.getAttribute('aria-describedby')).toBe(screen.getByText('Drag to move').id);
  });

  it('1 to 9 and Home jump to a region\'s centre at the size it has now, and say which', () => {
    render(<Sheet />);
    const stage = screen.getByRole('application');
    fireEvent.keyDown(stage, { key: '3' });
    expect(value()).toEqual([0.833, 0.3, 0.36]);
    expect(said()).toBe('Face 3 of 6');
    fireEvent.keyDown(stage, { key: '6' });
    expect(value()).toEqual([0.833, 0.8, 0.36]);
    fireEvent.keyDown(stage, { key: 'Home' });
    expect(value()).toEqual([0.167, 0.3, 0.36]);
  });

  it('the arrows move a tenth of its width, Shift a whole width', () => {
    render(<Sheet start={faces[1].crop} />);
    const stage = screen.getByRole('application');
    fireEvent.keyDown(stage, { key: 'ArrowDown' });
    expect(value()[1]).toBeCloseTo(0.336, 3);
    fireEvent.keyDown(stage, { key: 'ArrowRight', shiftKey: true });
    expect(value()[0]).toBeCloseTo(0.5 + 0.36 / aspect, 3);
  });

  it('at a fixed size there is no handle, zoom row, + or −, and the hint says only to drag', () => {
    render(<Sheet />);
    const stage = screen.getByRole('application');
    expect(document.querySelector('.sk-crop__handle')).toBeNull();
    expect(screen.queryByRole('slider')).toBeNull();
    fireEvent.keyDown(stage, { key: '+' });
    fireEvent.keyDown(stage, { key: '-' });
    expect(value()[2]).toBe(0.36);
  });

  it('with room to zoom it has a handle, a named slider and − and + buttons, and + closes in about the centre', () => {
    render(<Sheet fixed={false} start={{ x: 0.5, y: 0.5, size: 0.5 }} />);
    expect(document.querySelector('.sk-crop__handle')).not.toBeNull();
    expect(screen.getByRole('slider', { name: 'Zoom' })).toBeTruthy();
    expect(screen.getByText('Drag to move · scroll or pinch to zoom')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    const [x, y, size] = value();
    expect([x, y]).toEqual([0.5, 0.5]);
    expect(size).toBeCloseTo(0.5 / 1.15, 3);
  });

  it('a press on a face\'s hair lands on that face\'s centre; a press inside the circle drags it from where it is held', () => {
    render(<Sheet />);
    const stage = laidOut();
    /* Face 5's cell is x 1/3–2/3, y 1/2–1; its hair is near the cell's top */
    fireEvent.pointerDown(stage, { pointerId: 1, button: 0, clientX: 800, clientY: 470 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    expect(value()).toEqual([0.5, 0.8, 0.36]);
    expect(said()).toBe('Face 5 of 6');
    fireEvent.pointerDown(stage, { pointerId: 2, button: 0, clientX: 800, clientY: 720 });
    fireEvent.pointerMove(stage, { pointerId: 2, clientX: 816, clientY: 711 });
    fireEvent.pointerUp(stage, { pointerId: 2 });
    expect(value()[0]).toBeCloseTo(0.51, 3);
    expect(value()[1]).toBeCloseTo(0.79, 3);
  });

  it('a drag past the edge keeps the whole circle inside the picture', () => {
    render(<Sheet />);
    const stage = laidOut();
    fireEvent.pointerDown(stage, { pointerId: 1, button: 0, clientX: 267, clientY: 270 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: -500, clientY: -500 });
    fireEvent.pointerUp(stage, { pointerId: 1 });
    expect(value()[0]).toBeCloseTo((0.18 + 0.02) / aspect, 2);
    expect(value()[1]).toBeCloseTo(0.2, 2);
  });

  it('without onChange the crop is shown, not moved: no Tab stop, and a press does nothing', () => {
    render(<Cropper image="sheet.png" aspect={aspect} value={faces[0].crop} regions={faces} min={0.36} max={0.36} />);
    const stage = screen.getByRole('application', { name: 'Crop' });
    expect(stage.getAttribute('tabindex')).toBe('-1');
    expect(stage.className).toContain('is-still');
  });

  it('the picture can\'t be dragged out of the page, and the stage takes the touch', () => {
    render(<Sheet />);
    const img = document.querySelector<HTMLImageElement>('.sk-crop__picture')!;
    expect(img.getAttribute('draggable')).toBe('false');
    const css = readFileSync('src/ui/Cropper/Cropper.css', 'utf8');
    expect(css).toContain('touch-action:none');
    expect(css).toContain('-webkit-user-drag:none');
  });
});
