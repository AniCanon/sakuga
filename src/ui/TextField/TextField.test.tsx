import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextField } from './TextField';

afterEach(cleanup);

describe('TextField', () => {
  it('is a text input Tab reaches, named by its label and holding its value', () => {
    render(<TextField label="Name" defaultValue="Plaid overshirt" />);
    const f = screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement;
    expect(f.tagName).toBe('INPUT');
    expect(f.type).toBe('text');
    expect(f.tabIndex).toBe(0);
    expect(f.value).toBe('Plaid overshirt');
    expect(f.className).toBe('sk-tf__control');
  });

  it('takes typing', () => {
    render(<TextField label="Name" defaultValue="Plaid" />);
    const f = screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement;
    fireEvent.change(f, { target: { value: 'Plaid overshirt' } });
    expect(f.value).toBe('Plaid overshirt');
  });

  it('calls onChange with the text as it is typed, in a text area too', () => {
    const typed = vi.fn();
    render(<><TextField label="Name" defaultValue="Plaid" onChange={typed} /><TextField label="Note" multiline onChange={typed} /></>);
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Plaid shirt' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), { target: { value: 'Warm' } });
    expect(typed.mock.calls).toEqual([['Plaid shirt'], ['Warm']]);
    expect((screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement).value).toBe('Plaid shirt');
  });

  it('reads optional as part of its name, and the hint as its description', () => {
    render(<TextField label="Nickname" optional hint="What friends call them." />);
    expect(screen.getByRole('textbox', { name: 'Nickname · optional', description: 'What friends call them.' })).toBeTruthy();
  });

  it('keeps a help button inside the label out of its name', () => {
    render(<TextField label="Shot" help={{ title: 'How close the camera is.', text: 'Examples: wide, close-up.' }} />);
    expect(screen.getByRole('textbox', { name: 'Shot' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'About Shot' })).toBeTruthy();
  });

  it('is named by its placeholder without a label, the icon hidden', () => {
    const { container } = render(<TextField placeholder="Search characters" icon="search" />);
    const f = screen.getByRole('textbox', { name: 'Search characters' });
    expect(f.parentElement!.className).toBe('sk-tf__wrap');
    expect(container.querySelector('svg.sk-icon')!.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('label')).toBeNull();
  });

  it('is a text area with multiline, its rows and minimum height', () => {
    render(<TextField label="Describe it" multiline rows={5} minHeight={120} defaultValue="An open plaid overshirt." />);
    const a = screen.getByRole('textbox', { name: 'Describe it' }) as HTMLTextAreaElement;
    expect(a.tagName).toBe('TEXTAREA');
    expect(a.rows).toBe(5);
    expect(a.style.minHeight).toBe('120px');
    expect(a.className).toBe('sk-tf__control sk-tf__control--area');
  });

  it('reads required, and read-only', () => {
    render(<><TextField label="Title" required /><TextField label="Id" readOnly value="ep-12" /></>);
    expect(screen.getByRole('textbox', { name: 'Title' }).getAttribute('aria-required')).toBe('true');
    expect((screen.getByRole('textbox', { name: 'Id' }) as HTMLInputElement).readOnly).toBe(true);
  });

  it('rings a changed value with highlight, and holds its width with maxWidth', () => {
    const { container } = render(<TextField label="Name" highlight maxWidth={320} />);
    expect(screen.getByRole('textbox').className).toBe('sk-tf__control is-highlight');
    expect((container.firstElementChild as HTMLElement).style.maxWidth).toBe('320px');
  });

  it('takes its id from the props, and the label points at it', () => {
    const { container } = render(<TextField label="Name" id="name" />);
    expect(screen.getByRole('textbox').id).toBe('name');
    expect(container.querySelector('label')!.htmlFor).toBe('name');
  });
});

it.each([false, true])('supports external controlled updates and resets (multiline=%s)', multiline => {
  const typed = vi.fn();
  const { rerender } = render(<TextField label="Name" multiline={multiline} value="Initial" onChange={typed} />);
  const field = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.change(field, { target: { value: 'Edited' } });
  expect(typed).toHaveBeenCalledWith('Edited');
  expect(field.value).toBe('Initial');
  rerender(<TextField label="Name" multiline={multiline} value="Edited" onChange={typed} />);
  expect(field.value).toBe('Edited');
  rerender(<TextField label="Name" multiline={multiline} value="" onChange={typed} />);
  expect(field.value).toBe('');
});
it.each([false, true])('keeps uncontrolled edits across parent updates (multiline=%s)', multiline => {
  const { rerender } = render(<TextField label="Name" multiline={multiline} defaultValue="Initial" />);
  const field = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.change(field, { target: { value: 'Edited' } });
  rerender(<TextField label="New label" multiline={multiline} defaultValue="Replacement" />);
  expect(field.value).toBe('Edited');
});
