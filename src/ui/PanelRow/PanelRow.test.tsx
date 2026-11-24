import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PanelRow } from './PanelRow';

afterEach(cleanup);

describe('PanelRow', () => {
  it('is a button Tab reaches, heard as its title and value; expanded or collapsed only when open is set', () => {
    render(<><PanelRow icon="camera" title="Camera" value="Close-up · push in · low" /><PanelRow icon="film" title="Into 2D" value="Cut" open /><PanelRow icon="sliders" title="Grade" open={false} /></>);
    const cam = screen.getByRole('button', { name: 'Camera Close-up · push in · low' });
    expect(cam.getAttribute('type')).toBe('button');
    expect(cam.tabIndex).toBe(0);
    expect(cam.hasAttribute('aria-expanded')).toBe(false);
    expect(screen.getByRole('button', { name: 'Into 2D Cut', expanded: true }).className).toBe('sk-panelrow');
    expect(screen.getByRole('button', { name: 'Grade', expanded: false })).toBeTruthy();
  });

  it('hides the icon and the chevron', () => {
    const { container } = render(<PanelRow icon="camera" title="Camera" />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);
    svgs.forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
    expect(container.querySelector('.sk-panelrow__value')).toBeNull();
  });

  it('runs onClick on a press (Enter and Space arrive as its click)', () => {
    const click = vi.fn();
    render(<PanelRow icon="camera" title="Camera" onClick={click} />);
    fireEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('is a link with href', () => {
    render(<PanelRow icon="camera" title="Camera" href="#camera" className="x" />);
    const a = screen.getByRole('link', { name: 'Camera' });
    expect(a.getAttribute('href')).toBe('#camera');
    expect(a.getAttribute('type')).toBeNull();
    expect(a.className).toBe('sk-panelrow x');
    cleanup();
    render(<PanelRow icon="camera" title="Camera" href="#camera" open />);
    expect(screen.getByRole('link', { name: 'Camera' }).hasAttribute('aria-expanded')).toBe(false);
  });
});
