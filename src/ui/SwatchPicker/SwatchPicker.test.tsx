import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SwatchPicker } from './SwatchPicker';

afterEach(cleanup);

const skin = [{ label: 'Porcelain', color: '#f6e3d8' }, { label: 'Fair', color: '#efd2bd' }, { label: 'Medium', color: '#c99470' }, { label: 'Deep', color: '#4a2c1c' }];
const coats = [{ label: 'Black', color: '#1F1D22' }, { label: 'Tabby', color: '#B08A5E', pattern: 'stripes' as const, marks: ['#5C4128'] }, { label: 'Calico', color: '#F7F6F2', pattern: 'patches' as const, marks: ['#D2783A', '#1F1D22'] }, { label: 'Spotted', color: '#E2C38E', pattern: 'spots' as const, marks: ['#3B2B1E'] }];

function Live({ onChange }: { onChange?: (v: string) => void }) {
  const [v, set] = useState('Medium');
  return <SwatchPicker label="Skin tone" value={v} options={skin} onChange={(x) => { set(x); onChange?.(x); }} />;
}

describe('SwatchPicker', () => {
  it('is a radio group named by its label, each swatch a radio named by its option, checked when chosen', () => {
    render(<Live />);
    expect(screen.getByRole('radiogroup', { name: 'Skin tone' }).className).toBe('sk-swatches');
    expect(screen.getByRole('radio', { name: 'Medium', checked: true })).toBeTruthy();
    expect(screen.getAllByRole('radio', { checked: false })).toHaveLength(3);
  });

  it('is one Tab stop, on the chosen swatch', () => {
    render(<Live />);
    expect(screen.getAllByRole('radio').map((r) => r.tabIndex)).toEqual([-1, -1, 0, -1]);
  });

  it('arrows move to a swatch and choose it; Home and End go to either end', () => {
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    const medium = screen.getByRole('radio', { name: 'Medium' });
    medium.focus();
    fireEvent.keyDown(medium, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Deep', checked: true }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Porcelain', checked: true }));
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(changed.mock.calls.map((c) => c[0])).toEqual(['Deep', 'Porcelain', 'Deep', 'Medium']);
  });

  it('a press chooses a swatch', () => {
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Fair' }));
    expect(changed).toHaveBeenCalledWith('Fair');
  });

  it('hides the visible names and the pattern drawings', () => {
    const { container } = render(<SwatchPicker label="Coat" value="Black" labels columns={4} options={coats} />);
    const g = screen.getByRole('radiogroup', { name: 'Coat' });
    expect(g.className).toBe('sk-swatches is-named');
    expect(g.style.gridTemplateColumns).toBe('repeat(4, minmax(var(--swatch-size), max-content))');
    container.querySelectorAll('.sk-swatches__item > span').forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(3);
    svgs.forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
    expect(screen.getByRole('radio', { name: 'Calico' }).querySelectorAll('path')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Spotted' }).querySelectorAll('circle')).toHaveLength(5);
  });
});
