import { Fragment, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../internal/cx';
import { usePresence } from '../../internal/presence';
import { useUid } from '../../internal/uid';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { pickerOption, type PickerOption, type PickerRows } from '../Picker/option';
import { soundChose } from '../sound/sound';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../TextField/TextField.css';
import '../IconButton/IconButton.css';
import '../Popover/Popover.css';
import '../Picker/Picker.css';
import './SearchField.css';

export interface SearchFieldProps {
  /** Names the search and its field; 'Search' when left out. Not drawn: the icon and placeholder say what the box is. */
  label?: string;
  /** The starting words; the field follows when it changes. */
  value?: string;
  /** `value` starts the words; when the page changes it, the field follows. */
  placeholder?: string;
  /** The words as they are typed; the page filters `results` with them. */
  onChange?: (text: string) => void;
  /** Enter with no result active: search for the words (a results page). */
  onSubmit?: (text: string) => void;
  /** Picker's groups; leave out for a search that only submits. */
  results?: { title?: string; options: PickerOption[] }[];
  /** A result chosen by Enter or a click; the results close. */
  onSelect?: (option: PickerOption) => void;
  /** The results are being fetched: the panel says `busyText` ('Searching'). */
  busy?: boolean;
  /** Said while busy; 'Searching' when left out. */
  busyText?: string;
  /** Said when results has no options; 'Nothing matches' when left out. */
  emptyText?: string;
  /** The clear button was pressed; Escape was pressed with nothing left to close or clear. */
  onClear?: () => void;
  /** Escape with nothing left to close or clear. */
  onClose?: () => void;
  /** Starts the results open or closed (boards); otherwise typing opens them, and Escape, a choice or a press outside closes them. */
  open?: boolean;
  /** Takes focus when it appears. */
  autoFocus?: boolean;
  /** The field's widest, in px. */
  maxWidth?: number;
  /** The input's id; one is made without it. */
  id?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* A search is the field in a search landmark. Enter hands the words to onSubmit, or the active result to onSelect; Escape closes
   the results first, then clears the words, then (with nothing left) calls onClose. With results the field is a combobox whose
   active descendant Up and Down move, and one status line under it says how many there are, that it is searching, or emptyText. */
/**
 * A search: TextField's box with the search icon, a clear button once there are words, and, when the page passes `results`,
 * Picker's options under it.
 *
 * Not for filtering a list already on screen by a few known values (`SegmentedControl` or `Chip`s); writing to Maki
 * (`MakiComposer`).
 *
 * Accessibility: A search landmark named by `label`, holding a search field of the same name that Tab reaches. Enter submits
 * the words, or chooses the active result; Escape closes the results, then clears the words, then calls `onClose`. With
 * `results` the field is a combobox: Up and Down move its active descendant through the options (Up or Down opens closed
 * results), each option reads as Picker's do, and one status line says how many results there are, that it is searching, or
 * `emptyText`. The clear button is "Clear search" and gives focus back to the field. The icon is hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SearchField(props: SearchFieldProps) {
  const tx = useWords(ownWords);
  const id = useUid('sk-search', props.id), listId = id + '-list', input = useRef<HTMLInputElement>(null), wrap = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(props.value || '');
  const [opened, setOpened] = useState(props.open !== undefined ? !!props.open : true), [at, setAt] = useState(-1);
  useEffect(() => { setText(props.value || ''); }, [props.value]);
  useEffect(() => { if (props.open !== undefined) setOpened(!!props.open); }, [props.open]);
  useEffect(() => { if (props.autoFocus && input.current) input.current.focus(); }, []);
  const groups = props.results, flat: PickerOption[] = [];
  (groups || []).forEach((g) => (g.options || []).forEach((o) => flat.push(o)));
  const has = groups !== undefined, open = has && opened && (text !== '' || !!props.busy || flat.length > 0);
  const active = open && at < flat.length ? at : -1;
  useEffect(() => { setAt(-1); }, [text]);
  useEffect(() => {
    if (!open) return undefined;
    function away(e: PointerEvent) { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpened(false); }
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);
  useLayoutEffect(() => {
    const el = active >= 0 && document.getElementById(id + '-o' + active);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active]);
  function type(v: string) { setText(v); setOpened(true); if (props.onChange) props.onChange(v); }
  function clear() { type(''); if (props.onClear) props.onClear(); if (input.current) input.current.focus(); }
  const pick: PickerRows<PickerOption> = { id, active, search: true, choose: (o) => {
    if (o.dim) return;
    if (!o.selected) soundChose();
    setOpened(false);
    if (props.onSelect) props.onSelect(o);
  } };
  function keys(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && has && flat.length) {
      e.preventDefault();
      if (!open) { setOpened(true); return; }
      const d = e.key === 'ArrowDown' ? 1 : -1;
      setAt(active < 0 ? (d > 0 ? 0 : flat.length - 1) : Math.min(flat.length - 1, Math.max(0, active + d)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0) pick.choose(flat[active]); else if (props.onSubmit) props.onSubmit(text);
    } else if (e.key === 'Escape') {
      if (open) { e.preventDefault(); setOpened(false); } else if (text) { e.preventDefault(); clear(); } else if (props.onClose) { e.preventDefault(); props.onClose(); }
    }
  }
  let n = 0;
  const opt = (o: PickerOption) => pickerOption(o, n++, pick, tx);
  const said = props.busy ? (props.busyText || tx('searching')) : !flat.length ? (props.emptyText || tx('nothingMatches')) : tx('results', { count: flat.length });
  const shown = usePresence(open, '--popover-leaving-drop-out-animation');
  const combo = has ? { role: 'combobox', 'aria-expanded': open ? 'true' as const : 'false' as const, 'aria-controls': listId, 'aria-autocomplete': 'list' as const, 'aria-activedescendant': active >= 0 ? id + '-o' + active : undefined } : {};
  return (
    <div ref={wrap} role="search" aria-label={props.label || tx('search')} className={cx('sk-search', open && 'is-open', props.className)} style={props.maxWidth ? { maxWidth: props.maxWidth } : undefined}>
      <span className="sk-tf__wrap">
        <Icon name="search" size="var(--field-icon-size)" />
        <input ref={input} id={id} type="search" className="sk-tf__control sk-search__control" value={text} placeholder={props.placeholder} aria-label={props.label || tx('search')} enterKeyHint="search" autoComplete="off" spellCheck={false}
          onChange={(ev) => type(ev.target.value)} onKeyDown={keys} {...combo} />
        {text !== '' && <IconButton className="sk-search__clear" variant="plain" icon="close" iconSize="var(--search-clear-icon-size)" label={tx('clearSearch')} onClick={clear} />}
      </span>
      {shown.mounted && (
        <div className={cx('sk-popover', 'is-anchored', 'sk-search__results', shown.leaving && 'is-leaving')}>
          <div id={listId} className="sk-picker__list" role="listbox" aria-label={tx('searchResults', { label: props.label || tx('search') })} aria-busy={props.busy ? 'true' : undefined}>
            {(groups || []).map((g, gi) => {
              if (!g.title) return <Fragment key={gi}>{(g.options || []).map(opt)}</Fragment>;
              const gid = id + '-g' + gi;
              return <div key={gi} role="group" aria-labelledby={gid}><span id={gid} className="sk-picker__group">{g.title}</span>{(g.options || []).map(opt)}</div>;
            })}
          </div>
          {(props.busy || !flat.length) && <span className="sk-search__said" aria-hidden="true">{said}</span>}
        </div>
      )}
      {has && <span className="sk-sr" role="status">{open ? said : ''}</span>}
    </div>
  );
}
