import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { FlowFooter } from './FlowFooter';

afterEach(cleanup);

describe('FlowFooter', () => {
  it('is a footer: Tab reaches Back, then the actions; the note reads between them and the back icon is hidden', () => {
    const back = vi.fn();
    const { container } = render(<FlowFooter note="Free. Nothing is generated until you start it" back={{ onClick: back }}><Button>Create issue</Button></FlowFooter>);
    const footer = container.firstElementChild!;
    expect(footer.tagName).toBe('FOOTER');
    expect(footer.className).toBe('sk-flowfoot');
    expect([...footer.children].map((c) => c.textContent)).toEqual(['Back', 'Free. Nothing is generated until you start it', 'Create issue']);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Back', 'Create issue']);
    expect(footer.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('back is a link with back.href, and takes its own label', () => {
    render(<FlowFooter back={{ label: 'Back to basics', href: '/new/basics' }} />);
    expect(screen.getByRole('link', { name: 'Back to basics' }).getAttribute('href')).toBe('/new/basics');
  });

  it('without back, slot="start" holds what leaves the step', () => {
    const { container } = render(<FlowFooter note="You can come back to it." className="x"><span slot="start"><Button variant="ghost">Skip for now</Button></span><Button>Continue</Button></FlowFooter>);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Skip for now', 'Continue']);
    expect(container.firstElementChild!.className).toBe('sk-flowfoot x');
  });
});
