import { Fragment, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useRoving } from '../../internal/roving';
import { useUid } from '../../internal/uid';
import { soundChose } from '../sound/sound';
import { IconButton } from '../IconButton/IconButton';
import { Popover } from '../Popover/Popover';
import { TextField } from '../TextField/TextField';
import { pickerOption, type PickerOption, type PickerRows } from './option';
import { useWords } from '../../internal/words';
import '../../base.css';
import '../IconButton/IconButton.css';
import '../TextField/TextField.css';
import '../Popover/Popover.css';
import './Picker.css';

export type { PickerOption } from './option';

export interface PickerProps {
  /** The surface's id, for a control's aria-controls (SideNav's switcher). */
  id?: string;
  /** As on Popover: whether it shows. */
  open?: boolean;
  /** As on Popover: runs on Escape or a press outside. */
  onClose?: () => void;
  /** An option chosen: Enter on the active option (with search) or on the focused one (Space too without search), or a click. */
  onSelect?: (option: PickerOption) => void;
  /** Names the list of options for a screen reader; 'Options' when left out. */
  label?: string;
  /** A search field over the groups; with `onChange` it filters the list as you type. */
  search?: {
    placeholder?: string;
    /** Controlled search text. */
    value?: string;
    /** Initial text for an uncontrolled search. */
    defaultValue?: string;
    /** The search field's name for a screen reader; it shows no label. 'Search' when left out. */
    label?: string;
    /** Called with the text as it is typed; with it the field says it filters the list (aria-autocomplete "list"). */
    onChange?: (text: string) => void;
  };
  /** The options, in groups with an optional heading. */
  groups: { title?: string; options: PickerOption[] }[];
  /** As on Popover: pinned under what opened it (default). */
  anchored?: boolean;
  /** As on Popover: lines it up with that edge of what opened it, as wide as its options up to a reading measure. Use it when options carry a hint. */
  align?: 'start' | 'end';
  /** The level shown, opened from an option with `opens`: Back to `to`, and its `title`. Left, and Backspace in an empty search, call `onBack`. */
  back?: { to: string; title?: string; onBack: () => void };
  /** Inline style on the root element. */
  style?: CSSProperties;
  /** Controls that refine the choice, after the groups. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* The search field and any refining controls sit beside the listbox, never in it: a listbox holds only options and their groups.
   With search, focus stays in the field, which is a combobox whose active descendant the arrows move; without it, the options are
   one Tab stop the arrows move through. Enter (and Space without search) or a click hands the option to onSelect, and Right does
   too for an option that opens a level; in a level, Left or Backspace in an empty search goes back. */
/**
 * Picker is the anchored chooser under a field: optional search, then options in groups.
 *
 * Not for a short list of plain values (`Select`); options that each need an explanation or a price (`OptionTiles`); the same
 * choice on a phone (`Sheet`).
 *
 * Accessibility: A dialog named by `label` that, with `onClose`, takes focus, closes on Escape, a press outside or Tab out of
 * it, and gives focus back (after a press or Tab elsewhere, focus stays there). With search, the field (named "Search", or
 * `search.label`) is a combobox, promising a filtered list only with `search.onChange`, whose active descendant Up and Down
 * move through the options and Enter chooses; without search, the options are one Tab stop that Up and Down move through, Enter
 * or Space choosing; each option reads its label, hint, "out of reach" (unavailable) when `dim` and "selected", and `onSelect`
 * gets the choice; an option with `opens` opens with Right too, and in a level Back is a button named "Back to" its `to`, which
 * Left and Backspace in an empty search also press.
 *
 * @version 1.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Picker(props: PickerProps) {
  const tx = useWords();
  const pid = useUid('sk-pick'), box = useRef<HTMLDivElement>(null), [at, setAt] = useState(-1), search = !!props.search;
  const flat: PickerOption[] = [];
  (props.groups || []).forEach((g) => (g.options || []).forEach((o) => flat.push(o)));
  const active = at < flat.length ? at : -1;
  const pick: PickerRows<PickerOption> = { id: pid, active: search ? active : -1, search, choose: (o) => {
    /* A dim option can't be chosen; a new choice sounds here, since the Picker hands it over and closes with no state of its own changing */
    if (o.dim) return;
    if (!o.selected) soundChose();
    if (props.onSelect) props.onSelect(o);
  } };
  const rove = useRoving(box, { selector: search ? '.sk-picker__none' : '[role="option"]', axis: 'y' });
  /* A level that opens in place takes the focus the last level's option had, so the keys carry on in it: its first option, or
     coming back, the option that opened the level left */
  const level = props.back ? props.back.title || props.back.to : '', seen = useRef(level);
  useEffect(() => {
    if (seen.current === level) return;
    const left = seen.current;
    seen.current = level;
    const back = flat.findIndex((o) => o.opens && o.label === left);
    setAt(search ? Math.max(back, 0) : -1);
    const b = box.current, f = document.activeElement;
    if (search || !b || (f && f !== document.body && !b.parentElement!.contains(f))) return;
    const o = b.querySelectorAll<HTMLElement>('[role="option"]')[Math.max(back, 0)];
    if (o) o.focus();
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const field = search && box.current && box.current.parentElement!.querySelector('.sk-picker__search input');
    if (!field) return;
    field.setAttribute('role', 'combobox');
    field.setAttribute('aria-controls', pid + '-list');
    field.setAttribute('aria-expanded', 'true');
    field.setAttribute('aria-autocomplete', props.search!.onChange ? 'list' : 'none');
    if (active >= 0) field.setAttribute('aria-activedescendant', pid + '-o' + active); else field.removeAttribute('aria-activedescendant');
  });
  function fieldKeys(e: KeyboardEvent) {
    if (!search || !(e.target as Element).closest('.sk-picker__search') || !flat.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const d = e.key === 'ArrowDown' ? 1 : -1;
      setAt(active < 0 ? (d > 0 ? 0 : flat.length - 1) : Math.min(flat.length - 1, Math.max(0, active + d)));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick.choose(flat[active]);
    } else if (e.key === 'ArrowRight' && active >= 0 && flat[active].opens && (e.target as HTMLInputElement).selectionStart === (e.target as HTMLInputElement).value.length) {
      e.preventDefault();
      pick.choose(flat[active]);
    } else if (props.back && (e.key === 'ArrowLeft' || e.key === 'Backspace') && !(e.target as HTMLInputElement).value) {
      e.preventDefault();
      props.back.onBack();
    }
  }
  function listKeys(e: KeyboardEvent) {
    const t = e.target as Element;
    const on = t.getAttribute('role') === 'option' ? flat[+t.getAttribute('data-n')!] : null;
    if (!search && on && (e.key === 'Enter' || e.key === ' ' || (e.key === 'ArrowRight' && on.opens))) { e.preventDefault(); pick.choose(on); return; }
    if (!search && props.back && (e.key === 'ArrowLeft' || e.key === 'Backspace')) { e.preventDefault(); props.back.onBack(); return; }
    rove(e);
  }
  let n = 0;
  const opt = (o: PickerOption) => pickerOption(o, n++, pick, tx);
  return (
    <Popover id={props.id} label={props.label} className={cx('sk-picker', props.className)} style={props.style} anchored={props.anchored} align={props.align} open={props.open} onClose={props.onClose} onKeyDown={fieldKeys}>
      {props.back && props.back.title && <div className="sk-picker__head"><IconButton icon="chevron-left" variant="plain" label={tx('backTo', { name: props.back.to })} onClick={props.back.onBack} /><span className="sk-picker__title">{props.back.title}</span></div>}
      {props.search && <TextField className="sk-picker__search" label={props.search.label || tx('search')} icon="search" placeholder={props.search.placeholder} value={props.search.value} defaultValue={props.search.defaultValue} onChange={props.search.onChange} />}
      <div ref={box} id={pid + '-list'} className="sk-picker__list" role="listbox" aria-label={props.label || tx('options')} onKeyDown={listKeys}>
        {(props.groups || []).map((g, gi) => {
          if (!g.title) return <Fragment key={gi}>{(g.options || []).map(opt)}</Fragment>;
          const gid = pid + '-' + gi;
          return <div key={gi} role="group" aria-labelledby={gid}><span id={gid} className="sk-picker__group">{g.title}</span>{(g.options || []).map(opt)}</div>;
        })}
      </div>
      {props.children}
    </Popover>
  );
}
