import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { cx } from '../../internal/cx';
import { usePresence } from '../../internal/presence';
import { useUid } from '../../internal/uid';
import { Icon, type IconName } from '../Icon/Icon';
import { fieldAria, fieldShell, type FieldShellProps } from '../TextField/field';
import { useWords } from '../../internal/words';
import '../../base.css';
import '../TextField/TextField.css';
import './Select.css';

export interface SelectOption {
  /** The option's words. */
  label: string;
  /** Empty shows the placeholder. */
  value?: string;
  /** Leading glyph for the value. */
  icon?: IconName;
  /** A quiet word at the row's end in the open list. */
  hint?: string;
  /** Shown, but can't be picked now. */
  disabled?: boolean;
  /** Why, on a line under the label. */
  reason?: string;
}

export interface SelectProps extends FieldShellProps {
  /** The option's `value` (or `label`) to show. The page's value always wins: when it changes, the field shows the new one. Empty, or not among `options`, shows the placeholder, never the key. */
  value?: string;
  /** Shown while nothing is chosen. */
  placeholder?: string;
  /** Leading glyph for the value. */
  icon?: IconName;
  /** The list it opens. Without options it is display-only. */
  options?: SelectOption[];
  /** Rings the field while a picker beside it is choosing for it. */
  highlight?: boolean;
  /** Start open. Clicking the field toggles it; picking an option closes it. */
  open?: boolean;
  /** Called with the picked option's `value` (or `label`). With it the field shows only what `value` says, so the page decides; without it a pick shows until the page gives a new `value`. */
  onChange?: (value: string) => void;
  /** The field's id; one is made without it. */
  id?: string;
}

/* React draws the attribute; its types here don't know it yet */
const POPOVER = { popover: 'manual' } as Record<string, string>;

const key = (o: SelectOption) => (o.value !== undefined ? o.value : o.label);

/* A select-only combobox: focus stays on the field while the list is open, and the option the arrows reach is its active
   descendant, so the field's name, value and open state keep being read. The value is also part of its name, since not every
   screen reader reads a button-based combobox's text as its value. */
/**
 * A labelled single-choice control that opens a list. Shows the chosen value with an optional leading icon.
 *
 * Not for one thing among many, with search and groups (`Picker`); two to four named values seen at once (`SegmentedControl`);
 * a choice that is clearer seen than read (`OptionTiles`); a colour chosen by eye (`SwatchPicker`).
 *
 * Accessibility: A select-only combobox named by the words of `label` together with its value ("Faction Heros"), else by
 * `placeholder`, and described by `hint`; Tab reaches it, and focus stays on it while its list is open. Down, Up, Enter or
 * Space open the list, the arrows, Home, End and a first letter move the active option (read as the active descendant,
 * "selected" on the chosen one), Enter or Space picks it, and Escape or Tab closes the list. The arrows still reach a
 * `disabled` option, read as unavailable with its reason after its label, and it can't be picked. The active option is kept in
 * view, and with no `options` the field is unavailable. When the page changes `value` the name follows it, and a `value` not
 * among the options is named by the placeholder, never by its key, with no option read as selected.
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Select(props: SelectProps) {
  const tx = useWords();
  const id = useUid('sk-sel', props.id), listId = id + '-list';
  const opts = props.options || [];
  const [open, setOpen] = useState(!!props.open);
  /* The page's value wins: with onChange the field shows exactly what it is given; without, a pick shows until the page
     gives a new value */
  const [local, setValue] = useState(props.value);
  const [given, setGiven] = useState(props.value);
  let shownLocal = local;
  if (given !== props.value) { setGiven(props.value); setValue(props.value); shownLocal = props.value; }
  const value = props.onChange && props.value !== undefined ? props.value : shownLocal;
  const at = opts.findIndex((o) => key(o) === value), cur = opts[at];
  const [activeAt, setActive] = useState(Math.max(0, at));
  const active = Math.min(activeAt, opts.length - 1);
  /* A value that isn't among the options shows the placeholder, never its key */
  const shown = cur ? cur.label : (opts.length ? '' : value);
  const icon = cur ? cur.icon || props.icon : (opts.length ? undefined : props.icon);
  const expanded = open && opts.length > 0;
  const wrap = useRef<HTMLDivElement>(null), list = useRef<HTMLUListElement>(null), menuShown = usePresence(expanded, '--select-menu-leaving-drop-out-animation'), named = fieldAria(props, id);
  useEffect(() => {
    if (!expanded) return undefined;
    function away(e: PointerEvent) { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [expanded]);
  /* The list sits in the top layer, so no dialog or panel that clips can cut it off: placed at the field, its width, under it or
     over it when there is more room above, and placed again as the page scrolls, the window resizes or a dialog settles in.
     A browser without popover keeps the list under the field. */
  useLayoutEffect(() => {
    const m = list.current, field = wrap.current?.querySelector<HTMLElement>('.sk-select');
    if (!m || !field || !m.showPopover) return undefined;
    if (!m.matches(':popover-open')) m.showPopover();
    function place() {
      if (!m || !field) return;
      const r = field.getBoundingClientRect(), cs = getComputedStyle(m);
      const gap = parseFloat(cs.getPropertyValue('--select-menu-top')) || 0, edge = parseFloat(cs.getPropertyValue('--select-menu-edge')) || 0;
      m.style.maxHeight = '';
      const want = m.offsetHeight, below = window.innerHeight - r.bottom - gap - edge, above = r.top - gap - edge, up = want > below && above > below;
      m.classList.toggle('is-up', up);
      m.style.left = r.left + 'px';
      m.style.width = r.width + 'px';
      m.style.top = up ? '' : r.bottom + gap + 'px';
      m.style.bottom = up ? window.innerHeight - r.top + gap + 'px' : '';
      if (want > (up ? above : below)) m.style.maxHeight = Math.max(0, up ? above : below) + 'px';
    }
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    document.addEventListener('animationend', place, true);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('animationend', place, true);
    };
  }, [menuShown.mounted, opts.length]);
  /* The active option stays in view as the arrows walk a list longer than the menu */
  useLayoutEffect(() => {
    const el = expanded ? document.getElementById(listId + '-' + active) : null;
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [expanded, active]);
  function show(i: number) { setActive(i); setOpen(true); }
  function pick(i: number) { if (opts[i].disabled) return; const k = key(opts[i]); setValue(k); setOpen(false); if (props.onChange) props.onChange(k); }
  /* Enter and Space arrive as the button's own click (detail 0): it opens the list, or picks the active option when open */
  function click(e: MouseEvent) {
    if (!opts.length) return;
    if (!expanded) show(Math.max(0, at));
    else if (e.detail === 0) pick(active);
    else setOpen(false);
  }
  function keys(e: KeyboardEvent) {
    const n = opts.length;
    if (!n) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!expanded) show(Math.max(0, at));
      else setActive(Math.min(n - 1, Math.max(0, active + (e.key === 'ArrowDown' ? 1 : -1))));
    } else if ((e.key === 'Home' || e.key === 'End') && expanded) {
      e.preventDefault();
      setActive(e.key === 'Home' ? 0 : n - 1);
    } else if (e.key === 'Escape' && expanded) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === 'Tab' && expanded) {
      setOpen(false);
    } else if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const from = expanded ? active : Math.max(0, at), ch = e.key.toLowerCase();
      for (let k = 1; k <= n; k++) {
        const j = (from + k) % n;
        if (String(opts[j].label).toLowerCase().charAt(0) === ch) { show(j); break; }
      }
    }
  }
  const control = (
    <button
      type="button" id={id} className={cx('sk-tf__control', 'sk-select', !shown && 'is-empty', props.highlight && 'is-highlight')} role="combobox" aria-haspopup="listbox" aria-expanded={expanded ? 'true' : 'false'} aria-disabled={opts.length ? undefined : 'true'}
      aria-controls={expanded ? listId : undefined} aria-activedescendant={expanded ? listId + '-' + active : undefined} aria-label={props.label ? undefined : props.placeholder}
      aria-labelledby={props.label ? named['aria-labelledby'] + ' ' + id + '-value' : undefined} aria-describedby={named['aria-describedby']} onClick={click} onKeyDown={keys}
    >
      <span className="sk-select__value">
        {icon && <Icon name={icon} size="var(--select-value-icon-size)" />}
        <span className="sk-select__text" id={id + '-value'}>{shown || props.placeholder || tx('choose')}</span>
      </span>
      <Icon name="chevron-down" size="var(--select-chevron-icon-size)" className="sk-select__chevron" />
    </button>
  );
  const menu = menuShown.mounted && opts.length > 0 && (
    <ul ref={list} {...POPOVER} id={listId} role="listbox" className={cx('sk-select__menu', menuShown.leaving && 'is-leaving')} aria-labelledby={props.label ? id + '-name' : undefined} aria-label={props.label ? undefined : props.placeholder}
      onMouseDown={(e) => e.preventDefault()}>
      {opts.map((o, i) => {
        const on = key(o) === value;
        return (
          <li key={key(o)} id={listId + '-' + i} role="option" aria-selected={on ? 'true' : 'false'} aria-disabled={o.disabled ? 'true' : undefined} className={cx('sk-select__option', on && 'is-selected', o.disabled && 'is-disabled', o.reason && 'has-reason', expanded && i === active && 'is-active')} onClick={() => pick(i)}>
            {o.icon && <Icon name={o.icon} size="var(--select-option-icon-size)" />}
            {o.reason
              ? <span className="sk-select__lines"><span className="sk-select__text">{o.label}<span className="sk-sr">, </span></span><span className="sk-select__reason">{o.reason}</span></span>
              : <span className="sk-select__text">{o.label}</span>}
            {o.hint && <small>{o.hint}</small>}
            {on && <Icon name="check" size="var(--select-check-icon-size)" className="sk-select__check" />}
          </li>
        );
      })}
    </ul>
  );
  return fieldShell(props, <div ref={wrap} className="sk-select-wrap">{control}{menu}</div>, id);
}
