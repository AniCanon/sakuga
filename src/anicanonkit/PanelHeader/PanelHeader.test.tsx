import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from '../../ui/IconButton/IconButton';
import { PanelHeader } from './PanelHeader';

afterEach(cleanup);

describe('PanelHeader', () => {
  it('reads the eyebrow, the title as a level-2 heading and the subtitle, in order', () => {
    const { container } = render(<PanelHeader eyebrow="Event · Arc 2" title="Fire at Sé" subtitle="Ep 3 · p.14" />);
    expect(container.firstElementChild!.className).toBe('sk-phead');
    const h = screen.getByRole('heading', { level: 2, name: 'Fire at Sé' });
    expect(h.tagName).toBe('B');
    expect(container.querySelector('.sk-phead__text')!.textContent).toBe('Event · Arc 2Fire at SéEp 3 · p.14');
  });

  it('level sets the heading level', () => {
    render(<PanelHeader title="World" level={3} close={false} />);
    expect(screen.getByRole('heading', { level: 3, name: 'World' })).toBeTruthy();
  });

  it('Tab reaches the actions, then a close named by closeLabel (default "Close") that runs onClose', () => {
    const onClose = vi.fn();
    const { container, rerender } = render(
      <PanelHeader title="Fire at Sé" onClose={onClose}><span slot="actions"><IconButton variant="plain" icon="edit" label="Edit" /></span></PanelHeader>,
    );
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Edit', 'Close']);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<PanelHeader title="Fire at Sé" closeLabel="Close event" />);
    expect(screen.getByRole('button', { name: 'Close event' })).toBeTruthy();
    expect(container.querySelector('.sk-phead__media')).toBeNull();
  });

  it('close={false} has no close; slot="media" sits first', () => {
    const { container } = render(<PanelHeader title="World" close={false}><span slot="media"><img src="a.jpg" alt="" /></span></PanelHeader>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('.sk-phead')!.firstElementChild!.className).toBe('sk-phead__media');
  });
});
