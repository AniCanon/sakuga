import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextLink } from './TextLink';

afterEach(cleanup);

describe('TextLink', () => {
  it('is a button without href, and does not submit a form', () => {
    const onClick = vi.fn();
    render(<TextLink onClick={onClick}>Decline</TextLink>);
    const b = screen.getByRole('button', { name: 'Decline' });
    expect(b.getAttribute('type')).toBe('button');
    expect(b.className).toBe('sk-tlink');
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is a link with href, with no type', () => {
    render(<TextLink href="#maki">Ask Maki</TextLink>);
    const a = screen.getByRole('link', { name: 'Ask Maki' });
    expect(a.getAttribute('href')).toBe('#maki');
    expect(a.hasAttribute('type')).toBe(false);
  });

  it('is reached by Tab: a native control', () => {
    render(<><TextLink>Accept</TextLink><TextLink href="#">Why</TextLink></>);
    expect(screen.getByRole('button').tabIndex).toBe(0);
    expect(screen.getByRole('link').tabIndex).toBe(0);
  });

  it('is heard by its aria-label when given, with the icon hidden', () => {
    render(<TextLink icon="comment" aria-label="Ask Maki about scene 5">Ask Maki</TextLink>);
    const b = screen.getByRole('button', { name: 'Ask Maki about scene 5' });
    expect(b.querySelector('svg.sk-icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('changes only its look with variant', () => {
    render(<><TextLink variant="strong">Accept</TextLink><TextLink variant="destructive">Delete my account</TextLink><TextLink variant="quiet">Why</TextLink></>);
    expect(screen.getByRole('button', { name: 'Accept' }).className).toBe('sk-tlink is-strong');
    expect(screen.getByRole('button', { name: 'Delete my account' }).className).toBe('sk-tlink is-destructive');
    expect(screen.getByRole('button', { name: 'Why' }).className).toBe('sk-tlink');
  });
  it('passes aria-haspopup, aria-expanded and aria-controls, for a link that opens a dialog', () => {
    render(<TextLink aria-haspopup="dialog" aria-expanded={false} aria-controls="d1">Delete my account</TextLink>);
    const b = screen.getByRole('button', { name: 'Delete my account' });
    expect(b.getAttribute('aria-haspopup')).toBe('dialog');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(b.getAttribute('aria-controls')).toBe('d1');
  });
});
