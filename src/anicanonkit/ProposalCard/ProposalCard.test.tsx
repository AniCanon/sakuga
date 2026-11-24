import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../../ui/Button/Button';
import { ProposalCard } from './ProposalCard';

afterEach(cleanup);

describe('ProposalCard', () => {
  it('stated: reads the title and the note, the picture hidden', () => {
    const { container } = render(<ProposalCard title="Toddy wires a second watch" note="New event · stated" visual={{ kind: 'event', type: 'clue' }} />);
    const card = container.firstElementChild!;
    expect(card.className).toBe('sk-proposal sk-proposal--stated');
    expect(card.textContent).toBe('Toddy wires a second watchNew event · stated');
    expect(card.querySelector('.sk-glyph')!.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('inferred says "Inferred"; conflict says "conflict" and its action slot takes focus', () => {
    const { container, rerender } = render(<ProposalCard kind="inferred" title="Lisa · + Flaw" note="From the wind" />);
    expect(container.querySelector('.sk-proposal__tag')!.textContent).toBe('Inferred');
    rerender(<ProposalCard kind="conflict" title="Lisa is in two places"><span slot="action"><Button size="sm">Ask Maki</Button></span></ProposalCard>);
    expect(container.firstElementChild!.className).toBe('sk-proposal sk-proposal--conflict');
    expect(container.querySelector('.sk-proposal__head')!.textContent).toBe('Lisa is in two places, conflict');
    expect(screen.getByRole('button', { name: 'Ask Maki' })).toBeTruthy();
  });

  it('with accepted set, an Accept toggle, pressed when accepted, runs onAccept with the new state', () => {
    const onAccept = vi.fn();
    const { rerender } = render(<ProposalCard title="T" accepted onAccept={onAccept} />);
    const t = screen.getByRole('button', { name: 'Accept' });
    expect(t.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(t);
    expect(onAccept).toHaveBeenLastCalledWith(false);
    rerender(<ProposalCard title="T" accepted={false} onAccept={onAccept} />);
    expect(screen.getByRole('button', { name: 'Accept' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(onAccept).toHaveBeenLastCalledWith(true);
  });
});
