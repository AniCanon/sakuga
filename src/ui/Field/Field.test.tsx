import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { Field } from './Field';

afterEach(cleanup);

describe('Field', () => {
  it('is a group named by its label and described by its hint, with the control inside it', () => {
    render(
      <Field label="Story Map" hint="Free: the script isn’t checked against the story.">
        <SegmentedControl label="Story Map mode" value="Free" options={[{ label: 'Story Map' }, { label: 'Free' }]} />
      </Field>,
    );
    const g = screen.getByRole('group', { name: 'Story Map', description: 'Free: the script isn’t checked against the story.' });
    expect(g.className).toBe('sk-tf');
    expect(within(g).getByRole('group', { name: 'Story Map mode' })).toBeTruthy();
    expect(within(g).getByRole('button', { name: 'Free', pressed: true })).toBeTruthy();
  });

  it('reads optional as part of its name', () => {
    render(<Field label="Traits" optional><span /></Field>);
    expect(screen.getByRole('group', { name: 'Traits · optional' })).toBeTruthy();
  });

  it('has no description without a hint, and takes its id from the props', () => {
    render(<Field label="Traits" id="traits"><span /></Field>);
    const g = screen.getByRole('group', { name: 'Traits' });
    expect(g.getAttribute('aria-describedby')).toBeNull();
    expect(g.getAttribute('aria-labelledby')).toBe('traits');
  });
});
