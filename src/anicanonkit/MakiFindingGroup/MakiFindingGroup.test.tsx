import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MakiFinding } from '../MakiFinding/MakiFinding';
import { MakiFindingGroup } from './MakiFindingGroup';

afterEach(cleanup);

describe('MakiFindingGroup', () => {
  it('its findings are a list named by its label; the label carries the count, the note is quiet under it', () => {
    const { container } = render(<MakiFindingGroup label="Conflicts" count={1} note="Each reopens by itself."><MakiFinding title="Genzo appears after dying" severity="conflict" /></MakiFindingGroup>);
    expect(container.querySelector('.sk-mk-group__label')!.textContent).toBe('Conflicts · 1');
    expect(container.querySelector('.sk-mk-group__note')!.textContent).toBe('Each reopens by itself.');
    const list = screen.getByRole('list', { name: 'Conflicts' });
    expect(list.querySelectorAll('[role="listitem"]')).toHaveLength(1);
  });
});
