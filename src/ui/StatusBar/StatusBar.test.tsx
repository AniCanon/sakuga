import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from '../Button/Button';
import { StatusBar } from './StatusBar';

afterEach(cleanup);

describe('StatusBar', () => {
  it('is not focusable; its items read in order with rules between, the slot="end" child at the far end', () => {
    const { container } = render(<StatusBar><span>Saved</span><span>106 words · 3 sections</span><span slot="end">Refunded if finding events fails</span></StatusBar>);
    const bar = container.firstElementChild!;
    expect(bar.className).toBe('sk-statusbar');
    expect(bar.getAttribute('tabindex')).toBeNull();
    expect([...bar.children].map((c) => c.className)).toEqual(['sk-statusbar__item', 'sk-statusbar__sep', 'sk-statusbar__item', 'sk-sr', 'sk-statusbar__end']);
    expect(bar.textContent).toBe('Saved106 words · 3 sectionsRefunded if finding events fails');
  });

  it('anything focusable in an item takes focus', () => {
    render(<StatusBar><Button variant="ghost" size="sm">Starts after Fire at Sé</Button><span>Saved</span></StatusBar>);
    expect(screen.getByRole('button', { name: 'Starts after Fire at Sé' }).tabIndex).toBe(0);
  });

  it('the status region is always there, empty until slot="status" (or status) fills it', () => {
    const { rerender } = render(<StatusBar><span>106 words</span></StatusBar>);
    const region = screen.getByRole('status');
    expect(region.className).toBe('sk-sr');
    expect(region.textContent).toBe('');
    rerender(<StatusBar><span>106 words</span><span slot="status">Saved</span></StatusBar>);
    expect(screen.getByRole('status')).toBe(region);
    expect(region.className).toBe('sk-statusbar__item');
    expect(region.textContent).toBe('Saved');
    expect(region.previousElementSibling!.className).toBe('sk-statusbar__sep');
  });

  it('takes items, status and end as props', () => {
    const { container } = render(<StatusBar items={['Scene 4', '2:41']} status="Saving…" end="Free" className="x" />);
    expect(container.firstElementChild!.className).toBe('sk-statusbar x');
    expect(screen.getByRole('status').textContent).toBe('Saving…');
    expect(container.querySelector('.sk-statusbar__end')!.textContent).toBe('Free');
    expect(container.querySelectorAll('.sk-statusbar__sep')).toHaveLength(2);
  });
});
