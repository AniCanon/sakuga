import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

afterEach(cleanup);

const css = readFileSync('src/ui/IconButton/IconButton.css', 'utf8');

describe('IconButton', () => {
  it('is a native button named by its label, with the icon hidden', () => {
    const onClick = vi.fn();
    render(<IconButton icon="share" label="Share EBA" onClick={onClick} />);
    const b = screen.getByRole('button', { name: 'Share EBA' });
    expect(b.getAttribute('type')).toBe('button');
    expect(b.className).toBe('sk-ib sk-ib--solid');
    expect(b.tabIndex).toBe(0);
    expect(b.querySelector('svg.sk-icon')!.getAttribute('aria-hidden')).toBe('true');
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is a link with href', () => {
    render(<IconButton icon="back" label="Back" href="/watch" />);
    const a = screen.getByRole('link', { name: 'Back' });
    expect(a.getAttribute('href')).toBe('/watch');
    expect(a.hasAttribute('type')).toBe(false);
  });

  it('is a toggle with pressed, announced pressed or not pressed', () => {
    const { rerender } = render(<IconButton icon="heart" label="Like" pressed={false} />);
    const b = screen.getByRole('button', { name: 'Like' });
    expect(b.getAttribute('aria-pressed')).toBe('false');
    expect(b.querySelector('.is-flip')).toBeNull();
    rerender(<IconButton icon="heart" label="Like" pressed />);
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(b.querySelector('svg.sk-icon.is-flip')).toBeTruthy();
  });

  it('is no toggle without pressed', () => {
    render(<IconButton icon="search" label="Search" />);
    expect(screen.getByRole('button').hasAttribute('aria-pressed')).toBe(false);
  });

  it('draws the attention dot, the count said in the label, and its sizes and variants', () => {
    render(<IconButton icon="bell" label="Notifications, 3 new" variant="plain" size="lg" attention />);
    expect(screen.getByRole('button', { name: 'Notifications, 3 new' }).className).toBe('sk-ib sk-ib--plain sk-ib--lg is-attention');
  });

  it('takes custom children in place of the icon, and native attributes', () => {
    render(<IconButton label="Captions" disabled data-x="1"><span>CC</span></IconButton>);
    const b = screen.getByRole('button', { name: 'Captions' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.dataset.x).toBe('1');
    expect(b.querySelector('svg')).toBeNull();
  });
  it('is a disabled button with href and disabled', () => {
    render(<IconButton icon="back" label="Back" href="/watch" disabled />);
    expect(screen.queryByRole('link')).toBeNull();
    const b = screen.getByRole('button', { name: 'Back' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.hasAttribute('href')).toBe(false);
    expect(b.getAttribute('type')).toBe('button');
  });

  it('is never a toggle as a link: a pressed link is the current one, with the pressed look', () => {
    const { rerender } = render(<IconButton icon="captions" label="Captions" href="/cc" pressed={false} />);
    const a = screen.getByRole('link', { name: 'Captions' });
    expect(a.hasAttribute('aria-pressed')).toBe(false);
    expect(a.hasAttribute('aria-current')).toBe(false);
    expect(a.className).toBe('sk-ib sk-ib--solid');
    rerender(<IconButton icon="captions" label="Captions" href="/cc" pressed />);
    expect(a.hasAttribute('aria-pressed')).toBe(false);
    expect(a.getAttribute('aria-current')).toBe('true');
    expect(a.className).toBe('sk-ib sk-ib--solid is-pressed');
  });

  it('keeps an edge in forced colours, pressed in Highlight', () => {
    expect(css).toContain('@media (forced-colors:active){.sk-ib{border:var(--icon-button-forced-edge-width) solid ButtonText}}');
    expect(css).toContain('@media (forced-colors:active){.sk-ib[aria-pressed="true"],.sk-ib.is-pressed{forced-color-adjust:none;background:Highlight;color:HighlightText;border-color:Highlight}}');
  });
});
