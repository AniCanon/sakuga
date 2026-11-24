import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MakiCard } from './MakiCard';

afterEach(cleanup);

describe('MakiCard', () => {
  it('a group named by its title: the eyebrow, title, note, body and check in order, the check’s icon hidden; the actions take focus', () => {
    const { container } = render(
      <MakiCard eyebrow="Maki · Story edit" title="Move it earlier" note="Before the fire" check="The story stays consistent">
        <p>Body</p><span slot="actions"><button>Reject</button><button>Accept</button></span>
      </MakiCard>,
    );
    const g = screen.getByRole('group', { name: 'Move it earlier' });
    expect(g.className).toBe('sk-mk-block');
    expect(g.textContent).toBe('Maki · Story editMove it earlierBefore the fireBodyThe story stays consistentRejectAccept');
    expect(container.querySelector('.sk-mk-block__check .sk-icon')!.getAttribute('aria-hidden')).toBe('true');
    expect([...container.querySelectorAll('.sk-mk-block__actions button')].map((b) => b.textContent)).toEqual(['Reject', 'Accept']);
  });

  it('muted marks one already decided', () => {
    const { container } = render(<MakiCard title="Done" muted />);
    expect(container.firstElementChild!.className).toBe('sk-mk-block is-muted');
  });
});

describe('MakiCard choices', () => {
  it('a radio group named by its title; one press answers with the value; the chosen one is checked and the others disabled', () => {
    const onChoose = vi.fn();
    const choices = [{ name: 'Kiko', value: 'k', source: 'Ep 1' }, { name: 'Ken', value: 'n' }];
    const { rerender } = render(<MakiCard title="Who saw it?" choices={choices} onChoose={onChoose} />);
    const radios = screen.getAllByRole('radio');
    expect(screen.getByRole('radiogroup', { name: 'Who saw it?' })).toBeTruthy();
    fireEvent.click(radios[0]);
    expect(onChoose).toHaveBeenCalledWith('k');
    expect(radios[0].querySelector('.sk-erow__source')!.textContent).toBe('Ep 1');
    rerender(<MakiCard title="Who saw it?" choices={choices} chosen="k" onChoose={onChoose} />);
    const [a, b] = screen.getAllByRole('radio');
    expect(a.getAttribute('aria-checked')).toBe('true');
    expect(b.hasAttribute('disabled')).toBe(true);
  });
});
