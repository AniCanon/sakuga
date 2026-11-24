import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MakiSuggestions } from './MakiSuggestions';

afterEach(cleanup);

describe('MakiSuggestions', () => {
  it('a list named "What to ask"; each row is a button that sends its words', () => {
    const onPick = vi.fn();
    render(<MakiSuggestions label="What to ask" items={['Which issue matters most?', 'Why doesn’t the story hold up?']} onPick={onPick} />);
    const list = screen.getByRole('list', { name: 'What to ask' });
    const rows = list.querySelectorAll('button');
    expect(rows).toHaveLength(2);
    fireEvent.click(rows[1]);
    expect(onPick).toHaveBeenCalledWith('Why doesn’t the story hold up?');
  });
});
