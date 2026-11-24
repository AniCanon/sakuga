import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

afterEach(cleanup);

function Live({ start = false }: { start?: boolean }) {
  const [on, set] = useState(start);
  return <Checkbox label="rain-on-glass.wav" showLabel checked={on} onChange={set} />;
}

describe('Checkbox', () => {
  it('is a checkbox named by its label that Tab reaches, announced not checked, checked or mixed', () => {
    render(<><Checkbox label="A" /><Checkbox label="B" checked /><Checkbox label="C" mixed checked /></>);
    const a = screen.getByRole('checkbox', { name: 'A', checked: false });
    expect(a.tabIndex).toBe(0);
    expect(a.getAttribute('type')).toBe('button');
    expect(screen.getByRole('checkbox', { name: 'B', checked: true }).className).toBe('sk-check is-on');
    const c = screen.getByRole('checkbox', { name: 'C' });
    expect(c.getAttribute('aria-checked')).toBe('mixed');
    expect(c.className).toBe('sk-check is-mixed');
  });

  it('flips through onChange on a press (Enter and Space arrive as its click), and mixed chooses all', () => {
    const changed = vi.fn();
    render(<><Checkbox label="One" onChange={changed} /><Checkbox label="All" mixed onChange={changed} /><Checkbox label="Two" checked onChange={changed} /></>);
    fireEvent.click(screen.getByRole('checkbox', { name: 'One' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'All' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Two' }));
    expect(changed.mock.calls).toEqual([[true], [true], [false]]);
  });

  it('hides the mark and says the state: a check when on, a dash when mixed', () => {
    const { container } = render(<><Checkbox label="On" checked /><Checkbox label="Mixed" mixed /><Checkbox label="Off" /></>);
    const marks = container.querySelectorAll('.sk-check__mark');
    expect(marks).toHaveLength(2);
    marks.forEach((m) => expect(m.getAttribute('aria-hidden')).toBe('true'));
  });

  it('settles the mark in only when it changes while you watch', () => {
    const { container } = render(<Live start />);
    expect(container.querySelector('.sk-check__mark')!.className).toBe('sk-check__mark');
    fireEvent.click(screen.getByRole('checkbox'));
    expect(container.querySelector('.sk-check__mark')).toBeNull();
    fireEvent.click(screen.getByRole('checkbox'));
    expect(container.querySelector('.sk-check__mark')!.className).toBe('sk-check__mark is-fresh');
  });

  it('with showLabel the row is its label: a click on the words flips it, the hint is its description', () => {
    render(<><Live /><Checkbox label="Keep the originals" hint="Locked while the files are queued" showLabel checked /></>);
    fireEvent.click(screen.getByText('rain-on-glass.wav'));
    expect(screen.getByRole('checkbox', { name: 'rain-on-glass.wav', checked: true })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Keep the originals', description: 'Locked while the files are queued' })).toBeTruthy();
  });

  it('disabled leaves the tab order and takes no press', () => {
    const changed = vi.fn();
    const { container } = render(<Checkbox label="Keep" showLabel checked disabled onChange={changed} className="x" />);
    const b = screen.getByRole('checkbox', { name: 'Keep' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    fireEvent.click(b);
    expect(changed).not.toHaveBeenCalled();
    expect(container.firstElementChild!.className).toBe('sk-checkrow is-off x');
    expect(b.className).toBe('sk-check is-on');
  });
});
