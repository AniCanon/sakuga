import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { List } from '../List/List';
import { Switch } from '../Switch/Switch';
import { ListRow } from './ListRow';

afterEach(cleanup);

describe('ListRow', () => {
  it('is a list item read as its title, quiet line, meta and what sits at the end', () => {
    render(<List label="Tracks"><ListRow meta="2:23" icon="volume" title="Cue 2 · wind" sub="Music"><Switch on label="Cue 2" /></ListRow></List>);
    const row = screen.getByRole('listitem');
    expect(row.tagName).toBe('DIV');
    expect(row.className).toBe('sk-listrow');
    expect(row.textContent).toBe('2:23Cue 2 · windMusic');
    expect(row.querySelector('.sk-listrow__end')!.contains(screen.getByRole('switch', { name: 'Cue 2' }))).toBe(true);
  });

  it('hides its icon, picture and chevron', () => {
    const { container } = render(<><ListRow icon="video" title="Takes" chevron /><ListRow image="/a.jpg" title="2A" /></>);
    container.querySelectorAll('svg').forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
    expect(container.querySelectorAll('svg')).toHaveLength(2);
    expect(container.querySelector('img')!.getAttribute('alt')).toBe('');
  });

  it('selected is marked current; attention says "waiting for you"', () => {
    render(<List label="Takes"><ListRow title="2A" sub="Take 3" selected /><ListRow title="2B" sub="Needs a look" attention /></List>);
    const [a, b] = screen.getAllByRole('listitem');
    expect(a.getAttribute('aria-current')).toBe('true');
    expect(a.className).toBe('sk-listrow is-selected');
    expect(b.getAttribute('aria-current')).toBeNull();
    expect(b.querySelector('small')!.className).toBe('is-attention');
    expect(b.textContent).toBe('2BNeeds a look, waiting for you');
  });

  it('with href is a link Tab reaches, inside a list item that takes no box', () => {
    render(<List label="Takes"><ListRow title="2A · take 1" sub="Opens in Cut" href="#2a" /></List>);
    const link = screen.getByRole('link', { name: '2A · take 1 Opens in Cut' });
    expect(link.getAttribute('href')).toBe('#2a');
    expect(link.tabIndex).toBe(0);
    expect(link.parentElement!.getAttribute('role')).toBe('listitem');
    expect(link.parentElement!.className).toBe('sk-contents');
  });

  it('with only onClick is a link-role row: Enter follows it, Space does not', () => {
    const go = vi.fn();
    render(<List label="Takes"><ListRow title="2A" onClick={go} /></List>);
    const row = screen.getByRole('link', { name: '2A' });
    expect(row.tagName).toBe('DIV');
    expect(row.tabIndex).toBe(0);
    fireEvent.keyDown(row, { key: 'Enter' });
    fireEvent.keyDown(row, { key: ' ' });
    expect(go).toHaveBeenCalledTimes(1);
    fireEvent.click(row);
    expect(go).toHaveBeenCalledTimes(2);
  });

  it('checked puts a box named "Select" and the title first; on a linked row it sits beside the link', () => {
    const check = vi.fn();
    render(<List label="Takes"><ListRow title="2A" checked onCheck={check} /><ListRow title="2B" href="#2b" checked={false} onCheck={check} /></List>);
    const a = screen.getByRole('checkbox', { name: 'Select 2A' });
    expect(a.getAttribute('aria-checked')).toBe('true');
    const row = screen.getAllByRole('listitem')[0];
    expect(row.className).toBe('sk-listrow is-checked');
    expect(row.firstElementChild!.contains(a)).toBe(true);
    const b = screen.getByRole('checkbox', { name: 'Select 2B' });
    const link = screen.getByRole('link', { name: '2B' });
    expect(link.contains(b)).toBe(false);
    expect(link.parentElement!.className).toBe('sk-listrow-pick');
    expect(link.parentElement!.firstElementChild!.contains(b)).toBe(true);
    fireEvent.click(b);
    expect(check).toHaveBeenCalledWith(true);
  });

  it('a title that is markup names the box from its words; label names it instead', () => {
    render(<List label="Takes"><ListRow title={<><b>2C</b> rain</>} checked /><ListRow title={<b>2D</b>} label="the night take" checked /></List>);
    expect(screen.getByRole('checkbox', { name: 'Select 2C rain' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Select the night take' })).toBeTruthy();
  });

  it('slots: lead replaces the icon, main replaces the title and quiet line; loose gives it room', () => {
    const { container } = render(<ListRow title="Wind" loose><span slot="lead">▶</span><span slot="main">wave</span></ListRow>);
    expect(container.querySelector('.sk-listrow__lead')!.textContent).toBe('▶');
    expect(container.querySelector('.sk-listrow__main')!.textContent).toBe('wave');
    expect(container.querySelector('.sk-listrow__text')).toBeNull();
    expect(container.querySelector('.sk-listrow__end')).toBeNull();
    expect(container.firstElementChild!.className).toBe('sk-listrow is-loose');
  });

  it('lightMap lights the picture; a linked row rests the light at the centre on focus', () => {
    const { container } = render(<ListRow title="2A" href="#2a" image="/a.jpg" lightMap="/a-light.jpg" />);
    const frame = container.querySelector<HTMLElement>('.sk-thumb')!;
    expect(frame.classList.contains('has-light')).toBe(true);
    frame.style.setProperty('--light-x', '10%');
    fireEvent.focus(screen.getByRole('link'));
    expect(frame.style.getPropertyValue('--light-x')).toBe('');
  });

  it('a row with only onClick rests the light at the centre on focus too', () => {
    const { container } = render(<ListRow title="2A" onClick={() => {}} image="/a.jpg" lightMap="/a-light.jpg" />);
    const frame = container.querySelector<HTMLElement>('.sk-thumb')!;
    frame.style.setProperty('--light-x', '10%');
    fireEvent.focus(screen.getByRole('link'));
    expect(frame.style.getPropertyValue('--light-x')).toBe('');
  });

  it('an action on a linked row sits beside the link as its own Tab stop, never inside it', () => {
    const publish = vi.fn();
    render(<List label="In progress"><ListRow title="The popcorn incident" href="#p" linkLabel="Continue The popcorn incident, ready to publish"><Button slot="action" size="sm" onClick={publish}>Publish</Button></ListRow><ListRow title="Episode 2" href="#e" action={<Button size="sm">Open</Button>} /></List>);
    const link = screen.getByRole('link', { name: 'Continue The popcorn incident, ready to publish' });
    const button = screen.getByRole('button', { name: 'Publish' });
    expect(link.contains(button)).toBe(false);
    expect(button.parentElement!.className).toBe('sk-listrow__action');
    expect(button.parentElement!.previousElementSibling).toBe(link);
    expect(link.parentElement!.className).toBe('sk-listrow-pick');
    expect(link.querySelector('.sk-listrow__end')).toBeNull();
    fireEvent.click(button);
    expect(publish).toHaveBeenCalledTimes(1);
    const open = screen.getByRole('button', { name: 'Open' });
    expect(screen.getByRole('link', { name: 'Episode 2' }).contains(open)).toBe(false);
  });

  it('an action on a plain row sits at the end; linkLabel names only a link', () => {
    render(<List label="Drafts"><ListRow title="Cue 2" linkLabel="Ignored" action={<Button size="sm">Caption</Button>} /></List>);
    const row = screen.getByRole('listitem');
    expect(row.getAttribute('aria-label')).toBeNull();
    expect(row.querySelector('.sk-listrow__end')!.contains(screen.getByRole('button', { name: 'Caption' }))).toBe(true);
  });
});

describe('ListRow with onInsert', () => {
  it('adds itself from the row: its Add button at the end, Enter or a double-click on the row', () => {
    const insert = vi.fn();
    render(<List label="Titles"><ListRow title="Lower third" sub="3+00" onInsert={insert} dragData={{ kind: 'overlay', length: 3 }} /></List>);
    fireEvent.click(screen.getByRole('button', { name: 'Add Lower third' }));
    const row = screen.getAllByRole('listitem')[0];
    fireEvent.keyDown(row, { key: 'Enter' });
    fireEvent.doubleClick(row);
    expect(insert).toHaveBeenCalledTimes(3);
    expect(row.getAttribute('draggable')).toBe('true');
  });

  it('a row that adds itself keeps its action after Insert, its own stop, and a double-click or Enter on it never inserts the row', () => {
    const insert = vi.fn(), more = vi.fn();
    const { container } = render(<List label="Takes"><ListRow title="2C · take 3" onInsert={insert} dragData={{ kind: 'video', length: 3 }} action={<Button variant="ghost" size="sm" onClick={more}>More</Button>} /></List>);
    const buttons = screen.getAllByRole('button').map((b) => b.textContent || b.getAttribute('aria-label'));
    expect(buttons).toEqual(['Add 2C · take 3', 'More']);
    const action = container.querySelector<HTMLElement>('.sk-listrow__action')!;
    expect(action.getAttribute('draggable')).toBe('false');
    fireEvent.doubleClick(screen.getByText('More'));
    fireEvent.keyDown(screen.getByText('More'), { key: 'Enter' });
    expect(insert).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('More'));
    expect(more).toHaveBeenCalledTimes(1);
    fireEvent.doubleClick(screen.getByText('2C · take 3'));
    expect(insert).toHaveBeenCalledTimes(1);
  });
});
