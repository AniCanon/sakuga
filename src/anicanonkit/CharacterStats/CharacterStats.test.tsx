import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CharacterStats, type CharacterStat } from './CharacterStats';

afterEach(cleanup);

const stats: CharacterStat[] = [
  { icon: 'gender-male', value: 'Male', label: 'Gender' },
  { icon: 'body-fit', value: 'Fit', label: 'Build', changed: true },
  { value: 'Leader', label: 'Role' },
];

describe('CharacterStats', () => {
  it('tiles: each stat reads its value then its name, "changed" after a changed one; icons hidden; nothing focusable', () => {
    const { container } = render(<CharacterStats stats={stats} />);
    const box = container.firstElementChild as HTMLElement;
    expect(box.className).toBe('sk-cstats');
    expect(box.getAttribute('style')).toBeNull();
    const s = [...box.querySelectorAll('.sk-cstat')];
    expect(s.map((e) => e.textContent)).toEqual(['MaleGender', 'FitBuild, changed', 'LeaderRole']);
    expect(s[1].className).toBe('sk-cstat is-changed');
    expect(s[0].querySelector('b')!.textContent).toBe('Male');
    expect(s[0].querySelector('.sk-cstat__icon svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(s[2].querySelector('.sk-cstat__icon')).toBeNull();
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
  });

  it('pills: each stat reads its name then its value', () => {
    const { container } = render(<CharacterStats stats={stats} layout="pills" />);
    expect((container.firstElementChild as HTMLElement).className).toBe('sk-cstats sk-cstats--pills');
    const s = [...container.querySelectorAll('.sk-cstat')];
    expect(s.map((e) => e.textContent)).toEqual(['GenderMale', 'BuildFit, changed', 'RoleLeader']);
    expect(s[0].querySelector('small')!.textContent).toBe('Gender');
  });

  it('columns sets the grid', () => {
    const { container } = render(<CharacterStats stats={stats} columns={2} className="mine" />);
    const box = container.firstElementChild as HTMLElement;
    expect(box.style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))');
    expect(box.className).toBe('sk-cstats mine');
  });
});
