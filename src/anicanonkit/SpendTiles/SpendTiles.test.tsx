import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SpendTiles } from './SpendTiles';

afterEach(cleanup);

const packs = [
  { value: 'spark', label: 'Spark', amount: '9,990', description: '$9.99 · never expires' },
  { value: 'bloom', label: 'Bloom', amount: '24,990', description: '$24.99 · never expires', badge: 'Best value' },
  { value: 'cascade', label: 'Cascade', amount: '99,990', description: '$99.99 · never expires' },
];

function Live({ onChange }: { onChange?: (v: string) => void }) {
  const [v, set] = useState('bloom');
  return <SpendTiles size="lg" columns={3} label="Fragments packs" value={v} options={packs} onChange={(x) => { set(x); onChange?.(x); }} />;
}

describe('SpendTiles', () => {
  it('is OptionTiles’ radio group, each card heard with its amount as fragments, the mark hidden', () => {
    const { container } = render(<Live />);
    expect(screen.getByRole('radiogroup', { name: 'Fragments packs' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /^Best value\s*Bloom\s*24,990 fragments\s*\$24\.99 · never expires$/, checked: true })).toBeTruthy();
    const amount = container.querySelector('.sk-tile__amount')!;
    expect(amount.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(amount.querySelector<SVGElement>('svg')!.style.width).toBe('var(--option-tile-amount-icon-size)');
  });

  it('one Tab stop that the arrows move through, choosing', () => {
    const changed = vi.fn();
    render(<Live onChange={changed} />);
    const bloom = screen.getByRole('radio', { name: /Bloom/ });
    expect(screen.getAllByRole('radio').map((r) => r.tabIndex)).toEqual([-1, 0, -1]);
    bloom.focus();
    fireEvent.keyDown(bloom, { key: 'ArrowRight' });
    expect(changed).toHaveBeenCalledWith('cascade');
  });

  it('hears a cost with words after its number as "~10 fragments a second"', () => {
    const { container } = render(<SpendTiles size="lg" label="How to make it" value="words" options={[{ value: 'words', label: 'From words', icon: 'document', cost: '~10 a second' }, { value: 'free', label: 'From a sketch' }]} />);
    expect(screen.getByRole('radio', { name: /^From words\s*~10 fragments a second$/ })).toBeTruthy();
    expect(container.querySelector<SVGElement>('.sk-tile__cost svg')!.style.width).toBe('var(--option-tile-cost-icon-size)');
    expect(screen.getByRole('radio', { name: 'From a sketch' }).querySelector('.sk-tile__cost')).toBeNull();
  });
});
