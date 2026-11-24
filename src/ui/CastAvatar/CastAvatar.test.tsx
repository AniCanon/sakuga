import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CastAvatar } from './CastAvatar';

afterEach(cleanup);

describe('CastAvatar', () => {
  it('is plain text without href, onClick or selected: its name and role are read, the portrait hidden', () => {
    const { container } = render(<CastAvatar image="kiko.jpg" name="Kiko" role="Leads the E.R.A." />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root.className).toBe('sk-cast sk-cast--lg');
    expect(root.getAttribute('role')).toBeNull();
    expect(root.textContent).toBe('KikoLeads the E.R.A.');
    expect(container.querySelector('img')!.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('is a link with href, named by its name and role, that Tab reaches', () => {
    render(<CastAvatar image="kiko.jpg" name="Kiko" role="Leads the E.R.A." href="/kiko" size="md" />);
    const link = screen.getByRole('link', { name: 'Kiko Leads the E.R.A.' });
    expect(link.getAttribute('href')).toBe('/kiko');
    expect(link.className).toBe('sk-cast sk-cast--md');
    expect(link.tabIndex).toBe(0);
  });

  it('with only onClick it is a button that Enter and Space press', () => {
    const click = vi.fn();
    render(<CastAvatar initial="K" name="Kiko" onClick={click} />);
    const b = screen.getByRole('button', { name: 'Kiko' });
    expect(b.tagName).toBe('DIV');
    expect(b.tabIndex).toBe(0);
    fireEvent.keyDown(b, { key: 'Enter' });
    fireEvent.keyDown(b, { key: ' ' });
    fireEvent.click(b);
    expect(click).toHaveBeenCalledTimes(3);
  });

  it('with selected it is a toggle button, pressed when selected, with a hidden check', () => {
    const { rerender, container } = render(<CastAvatar image="kiko.jpg" name="Kiko" selected={false} size="sm" />);
    const b = screen.getByRole('button', { name: 'Kiko' });
    expect(b.tagName).toBe('BUTTON');
    expect(b.getAttribute('type')).toBe('button');
    expect(b.getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelector('.sk-cast__check')).toBeNull();
    rerender(<CastAvatar image="kiko.jpg" name="Kiko" selected size="sm" />);
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(b.className).toBe('sk-cast sk-cast--sm is-selected');
    expect(container.querySelector('.sk-cast__check')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('muted adds "not in the story at this point"', () => {
    render(<CastAvatar name="Ken" role="Gone" href="#" muted />);
    expect(screen.getByRole('link', { name: 'Ken Gone , not in the story at this point' }).className).toBe('sk-cast sk-cast--lg is-muted');
  });

  it('without an image shows the initial (or the name\'s first letter), hidden; without name it is named by label', () => {
    const { container } = render(<><CastAvatar name="Lisa" /><CastAvatar initial="R" label="Ren" onClick={() => {}} /></>);
    const initials = container.querySelectorAll('.sk-cast__initial');
    expect([...initials].map((i) => i.textContent)).toEqual(['L', 'R']);
    expect(initials[0].getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('button', { name: 'Ren' })).toBeTruthy();
  });

  it('a size in pixels sizes the face itself; a row puts the name and role beside it', () => {
    const { container } = render(<CastAvatar image="kiko.jpg" name="Kiko" role="Wind" size={40} layout="row" width={200} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('sk-cast sk-cast--row');
    expect(root.style.width).toBe('200px');
    const face = container.querySelector<HTMLElement>('.sk-cast__face')!;
    expect([face.style.width, face.style.height, face.style.fontSize]).toEqual(['40px', '40px', '12px']);
    expect(container.querySelector('.sk-cast__text')!.textContent).toBe('KikoWind');
  });

  it('imageStyle (from cropStyle) shows the face through the square it will be cut to', () => {
    render(<CastAvatar image="sheet.png" name="Hana" imageStyle="width:493.827%;left:-196.914%" />);
    const img = document.querySelector<HTMLImageElement>('.sk-cast__face .sk-cut img')!;
    expect(img.getAttribute('src')).toBe('sheet.png');
    expect(img.style.width).toBe('493.827%');
    expect(img.getAttribute('draggable')).toBe('false');
  });
});
