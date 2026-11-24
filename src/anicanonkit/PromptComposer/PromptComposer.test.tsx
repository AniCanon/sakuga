import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../../ui/Button/Button';
import { IconButton } from '../../ui/IconButton/IconButton';
import { Mention } from '../Mention/Mention';
import { MentionChip } from '../MentionChip/MentionChip';
import { SpendButton } from '../SpendButton/SpendButton';
import { PromptComposer } from './PromptComposer';

afterEach(cleanup);

/* jsdom lays nothing out, so a text range has no box; Lexical measures one to keep a focused caret in view */
if (!Range.prototype.getBoundingClientRect) Range.prototype.getBoundingClientRect = () => new DOMRect();
if (!Range.prototype.getClientRects) Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;

describe('PromptComposer', () => {
  it('a region named by label (default "Prompt"): Tab reaches the refs, then the tools; the shown words take no focus', () => {
    const { container, rerender } = render(
      <PromptComposer label="Make a take">
        <Mention>Lisa</Mention> waits for the last train.
        <span slot="refs"><MentionChip name="Lisa" href="#lisa" /></span>
        <span slot="hint">Add a place</span>
        <span slot="tools"><IconButton variant="plain" icon="image" label="Opening frame" /><Button variant="ghost" size="sm" icon="clock">10 s</Button></span>
        <span slot="footer"><SpendButton variant="primary" fullWidth cost="~100">Generate</SpendButton></span>
      </PromptComposer>,
    );
    const r = screen.getByRole('region', { name: 'Make a take' });
    expect(r.tagName).toBe('SECTION');
    expect([...r.children].map((c) => c.className)).toEqual(['sk-composer__refs', 'sk-composer__prompt', 'sk-composer__hint', 'sk-composer__tools', 'sk-composer__foot']);
    expect(r.querySelector('.sk-composer__prompt')!.textContent).toBe('@Lisa waits for the last train.');
    expect(r.querySelector('.sk-composer__prompt')!.getAttribute('tabindex')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect([...container.querySelectorAll('a, button')].map((el) => el.getAttribute('aria-label') || el.textContent)).toEqual(['@Lisa', 'Opening frame', '10 s', 'Generate~100 fragments']);
    rerender(<PromptComposer placeholder="Describe the moment" />);
    expect(screen.getByRole('region', { name: 'Prompt' }).querySelector('.sk-composer__prompt')!.className).toBe('sk-composer__prompt is-empty');
    expect(container.querySelector('.sk-composer__prompt')!.textContent).toBe('Describe the moment');
    expect(container.querySelector('.sk-composer__refs, .sk-composer__tools')).toBeNull();
  });

  const mentions = {
    cast: [
      { id: 'lisa', name: 'Lisa', outfits: [{ id: 'school', label: 'school' }, { id: 'rain-coat', label: 'rain coat' }] },
      { id: 'smith', name: 'Smith', outfits: [{ id: 'tactical', label: 'Tactical Uniform' }] },
      { id: 'ken', name: 'Ken' },
    ],
    places: [{ id: 'b-platform', name: 'Red Line Platform Edge' }],
    references: [{ alias: 'rain-look', name: 'Style lock' }],
  };
  const field = () => screen.getByRole('textbox', { name: 'Take prompt' });
  /* A value given to a field being written in keeps the caret at its end, as a template dropped in does: that opens the list */
  const typed = async (rerender: (ui: JSX.Element) => void, onChange: () => void, value: string) => {
    act(() => field().focus());
    rerender(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={mentions} value={value} />);
    await act(async () => undefined);
  };
  const press = (key: string) => act(async () => { fireEvent.keyDown(field(), { key }); });

  it('with onChange the words are a multi-line field named by promptLabel, with the placeholder while empty', async () => {
    render(<PromptComposer onChange={() => undefined} placeholder="Describe the moment" promptLabel="Take prompt" />);
    const f = field();
    expect(f.getAttribute('aria-multiline')).toBe('true');
    expect(f.getAttribute('contenteditable')).toBe('true');
    expect(f.getAttribute('aria-placeholder')).toBe('Describe the moment');
    expect(f.hasAttribute('aria-controls')).toBe(false);
    expect(f.className).toBe('sk-composer__prompt is-empty');
  });

  it('a saved prompt shows its mentions as solid pieces, with a character’s outfit after its name and a $alias with no reference missing; loading it saves nothing', async () => {
    const onChange = vi.fn();
    render(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={mentions}
      value="@[Lisa:character:lisa:outfit:rain-coat] waits at @[Old Name:backdrop:b-platform], in $rain-look and $nothing." />);
    await act(async () => undefined);
    expect(field().textContent).toBe('@Lisa (rain coat) waits at #Red Line Platform Edge, in $rain-look and $nothing, missing.');
    expect([...field().querySelectorAll('.sk-mention')].map((m) => m.className)).toEqual(['sk-mention sk-mention--character', 'sk-mention sk-mention--place', 'sk-mention sk-mention--reference', 'sk-mention sk-mention--reference is-missing']);
    expect(field().querySelector('.sk-composer__mention')!.getAttribute('contenteditable')).toBe('false');
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  it('@ lists the cast matching what follows; a character with outfits then asks which one, and the choice is saved with it', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={mentions} value="" />);
    await typed(rerender, onChange, 'Meet @Li');
    const list = screen.getByRole('listbox', { name: 'Cast · matching “Li”' });
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Lisa2 outfits']);
    expect(field().getAttribute('aria-controls')).toBe(list.id);
    expect(field().getAttribute('aria-activedescendant')).toBe(list.querySelector('[role="option"]')!.id);
    await press('Enter');
    expect(screen.getByRole('listbox', { name: 'Outfit for Lisa' })).toBeTruthy();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['schooldefault', 'rain coat']);
    await press('ArrowDown');
    await press('Enter');
    expect(onChange).toHaveBeenLastCalledWith('Meet @[Lisa:character:lisa:outfit:rain-coat] ');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('a character with one outfit wears it; # tags a place and $ a reference; Escape closes the list', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={mentions} value="" />);
    await typed(rerender, onChange, '@Smi');
    await press('Enter');
    expect(onChange).toHaveBeenLastCalledWith('@[Smith:character:smith:outfit:tactical] ');
    await typed(rerender, onChange, 'at #red line');
    expect(screen.getByRole('listbox', { name: 'Places · matching “red line”' })).toBeTruthy();
    await press('Enter');
    expect(onChange).toHaveBeenLastCalledWith('at @[Red Line Platform Edge:backdrop:b-platform] ');
    await typed(rerender, onChange, 'in $rain');
    await press('Tab');
    expect(onChange).toHaveBeenLastCalledWith('in $rain-look ');
    await typed(rerender, onChange, '@K');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Kenno outfit yet']);
    await press('Escape');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('a loose @Name the roster knows is saved as its token, since the server reads only tokens; an unknown one stays text', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={mentions} value="" />);
    await typed(rerender, onChange, '@ken and @Jones wait for @Smi');
    await press('Enter');
    expect(onChange).toHaveBeenLastCalledWith('@[ken:character:ken] and @Jones wait for @[Smith:character:smith:outfit:tactical] ');
  });

  const leveled = {
    places: [
      { id: 'l-lighthouse', name: 'Kagari Lighthouse', image: '/lighthouse.jpg', views: [{ id: 'b-lens', name: 'Fresnel Lens Mechanism', image: '/lens.jpg' }, { id: 'b-watch', name: 'Keeper’s Watch Room' }] },
      { id: 'l-harbor', name: 'Low Harbor', views: [{ id: 'b-quay', name: 'The Quay at Dusk', image: '/quay.jpg' }] },
      { id: 'b-platform', name: 'Red Line Platform Edge' },
    ],
  };
  const typedIn = async (rerender: (ui: JSX.Element) => void, onChange: () => void, value: string) => {
    act(() => field().focus());
    rerender(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={leveled} value={value} />);
    await act(async () => undefined);
  };

  it('# lists places: two or more views open as a level, under Back and the place; one view is chosen at once; views save as their backdrop', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={leveled} value="" />);
    await typedIn(rerender, onChange, 'at #');
    const rows = screen.getAllByRole('option');
    expect(rows.map((o) => o.textContent)).toEqual(['Kagari Lighthouse2 views', 'Low Harbor1 view · The Quay at Dusk', 'Red Line Platform Edge']);
    expect(rows[0].classList.contains('is-opens')).toBe(true);
    expect(rows[1].querySelector('img')!.getAttribute('src')).toBe('/quay.jpg');
    await press('ArrowRight');
    expect(screen.getByRole('listbox', { name: 'Kagari Lighthouse' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back to Places' })).toBeTruthy();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Fresnel Lens Mechanism', 'Keeper’s Watch Room']);
    await press('ArrowLeft');
    expect(screen.getByRole('listbox', { name: 'Places' })).toBeTruthy();
    expect(field().getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[0].id);
    await press('Enter');
    await press('ArrowDown');
    await press('Enter');
    expect(onChange).toHaveBeenLastCalledWith('at @[Keeper’s Watch Room:backdrop:b-watch] ');
    await typedIn(rerender, onChange, 'by #');
    await press('ArrowDown');
    await press('Tab');
    expect(onChange).toHaveBeenLastCalledWith('by @[The Quay at Dusk:backdrop:b-quay] ');
  });

  it('in a level, Backspace right after the # goes back and typing more closes it; typed words find views in every place, named by their place', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={leveled} value="" />);
    await typedIn(rerender, onChange, '#');
    await press('Enter');
    await press('Backspace');
    expect(screen.getByRole('listbox', { name: 'Places' })).toBeTruthy();
    await typedIn(rerender, onChange, '#k');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Kagari Lighthouse2 views', 'Keeper’s Watch RoomKagari Lighthouse', 'The Quay at DuskLow Harbor']);
    await typedIn(rerender, onChange, '#quay');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['The Quay at DuskLow Harbor']);
    await typedIn(rerender, onChange, '#low');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Low Harbor1 view · The Quay at Dusk']);
  });

  it('a saved view shows its current name from its place', async () => {
    render(<PromptComposer onChange={() => undefined} promptLabel="Take prompt" mentions={leveled} value="at @[Old Lens:backdrop:b-lens]." />);
    await act(async () => undefined);
    expect(field().textContent).toBe('at #Fresnel Lens Mechanism.');
  });

  it('the hint describes the field; without one the field has no description', () => {
    const { rerender } = render(<PromptComposer onChange={() => undefined}><span slot="hint">Add a place with #</span></PromptComposer>);
    expect(screen.getByRole('textbox', { name: 'Prompt', description: 'Add a place with #' })).toBeTruthy();
    rerender(<PromptComposer onChange={() => undefined} />);
    expect(screen.getByRole('textbox').hasAttribute('aria-describedby')).toBe(false);
  });

  it('a reference leaving the take turns its mentions missing in place, and coming back turns them back, saving nothing', async () => {
    const onChange = vi.fn();
    const frames = [{ alias: 'platform-edge', group: 'Frames' }];
    const { rerender } = render(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={{ references: frames }} value="End on $platform-edge." />);
    await act(async () => undefined);
    const ref = () => field().querySelector('.sk-mention--reference')!;
    expect(ref().className).toBe('sk-mention sk-mention--reference');
    rerender(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={{ references: [] }} value="End on $platform-edge." />);
    await act(async () => undefined);
    expect(ref().className).toBe('sk-mention sk-mention--reference is-missing');
    expect(ref().textContent).toBe('$platform-edge, missing');
    rerender(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={{ references: frames }} value="End on $platform-edge." />);
    await act(async () => undefined);
    expect(ref().className).toBe('sk-mention sk-mention--reference');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('$ lists references in groups, each under its heading in the order its first reference comes; a query is said in each', async () => {
    const onChange = vi.fn();
    const grouped = { references: [{ alias: 'last-train', group: 'Frames', hint: 'Opening frame' }, { alias: 'rain-look', hint: 'Source still' }, { alias: 'platform-edge', group: 'Frames', hint: 'Frame 2' }] };
    const { rerender } = render(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={grouped} value="" />);
    act(() => field().focus());
    rerender(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={grouped} value="end on $" />);
    await act(async () => undefined);
    const groups = screen.getAllByRole('group');
    expect(groups.map((g) => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')!)!.textContent)).toEqual(['Frames', 'References']);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['$last-trainOpening frame', '$platform-edgeFrame 2', '$rain-lookSource still']);
    rerender(<PromptComposer onChange={onChange} promptLabel="Take prompt" mentions={grouped} value="end on $rain-l" />);
    await act(async () => undefined);
    expect(screen.queryAllByRole('group')).toHaveLength(0);
    await press('Enter');
    expect(onChange).toHaveBeenLastCalledWith('end on $rain-look ');
  });

  it('passes className after its own class', () => {
    const { container } = render(<PromptComposer className="x">Words</PromptComposer>);
    expect(container.firstElementChild!.className).toBe('sk-composer x');
  });

  it('rows gives the words that many lines of room; fill takes the free height, and a press on its empty part writes at the end', () => {
    const { container, rerender } = render(<PromptComposer onChange={() => undefined} promptLabel="Take prompt" value="Kiko at the edge" rows={4} />);
    const frame = container.querySelector<HTMLElement>('.sk-composer')!;
    expect(frame.style.getPropertyValue('--composer-rows')).toBe('4');
    expect(frame.classList.contains('is-fill')).toBe(false);
    rerender(<PromptComposer onChange={() => undefined} promptLabel="Take prompt" value="Kiko at the edge" fill />);
    expect(frame.classList.contains('is-fill')).toBe(true);
    fireEvent.mouseDown(frame, { button: 0 });
    expect(document.activeElement).toBe(field());
  });

  it('revisions mark the phrases a plan added where the browser can highlight, and the first edit clears them', () => {
    const added: Range[] = [];
    const removed: Range[] = [];
    class FakeHighlight { add(r: Range) { added.push(r); } delete(r: Range) { removed.push(r); return true; } }
    const highlights = new Map<string, unknown>();
    vi.stubGlobal('Highlight', FakeHighlight);
    vi.stubGlobal('CSS', { highlights });
    const { container } = render(<PromptComposer value="Medium shot, slow push in. Kiko waits." revisions={['slow push in', 'not there']}>Medium shot, slow push in. Kiko waits.</PromptComposer>);
    expect(highlights.has('sk-revision')).toBe(true);
    expect(added.map((r) => r.toString())).toEqual(['slow push in']);
    fireEvent.input(container.querySelector('.sk-composer__prompt')!);
    expect(removed.map((r) => r.toString())).toEqual(['slow push in']);
    vi.unstubAllGlobals();
  });
});
