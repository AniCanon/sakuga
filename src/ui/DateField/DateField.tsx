import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useDrag } from '../../internal/drag';
import { announce } from '../../internal/live';
import { useRoving } from '../../internal/roving';
import { useUid } from '../../internal/uid';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { pickerOption, type PickerRows } from '../Picker/option';
import { Popover } from '../Popover/Popover';
import { fieldAria, fieldShell } from '../TextField/field';
import { addDays, addMonths, dayOf, monthOf, todayIso, validDay, weekStartOf } from './dates';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../TextField/TextField.css';
import '../IconButton/IconButton.css';
import '../Select/Select.css';
import '../Popover/Popover.css';
import '../Picker/Picker.css';
import './DateField.css';

export type DateRange = {
  /** The first day, 'YYYY-MM-DD'. */
  start: string;
  /** The last day, 'YYYY-MM-DD'. */
  end: string;
};

/** A date, or a range of dates, picked from a calendar in a Popover. Dates are 'YYYY-MM-DD'. A range shows two months and its presets;
    names and numbers come from Intl in `locale`. `today`, `month` and `open` let a board show a fixed state. */
export interface DateFieldProps {
  /** The field's label, over it; it also names the calendar. */
  label?: string;
  /** A quiet line under the field. */
  hint?: string;
  /** The field can't be opened. */
  disabled?: boolean;
  /** Shown while no date is picked. */
  placeholder?: string;
  /** Picks a range: two months beside the `presets`. Without it, one month and one date. */
  range?: boolean;
  /** The date ('YYYY-MM-DD'), or `{ start, end }` for a range. */
  value?: string | DateRange;
  /** Called with the new date, or the range once both ends are set. */
  onChange?: (value: string | DateRange) => void;
  /** A range's named periods ("This month"), each applied in one press. */
  presets?: { label: string; start: string; end: string }[];
  /** Default "Presets". */
  presetsLabel?: string;
  /** The first day that can be picked, 'YYYY-MM-DD'. */
  min?: string;
  /** The last day that can be picked, 'YYYY-MM-DD'. */
  max?: string;
  /** Shows the calendar open (a board). */
  open?: boolean;
  /** The first month shown, 'YYYY-MM' or any day in it ('YYYY-MM-DD'); anything else falls back to the default. */
  month?: string;
  /** 'YYYY-MM-DD'. Default the real today. */
  today?: string;
  /** Default the viewer's. */
  locale?: string;
  /** 0 is Sunday. Default from the locale. */
  weekStartsOn?: number;
  /** The open calendar lines up with the field's start or end edge. Default 'start'. */
  align?: 'start' | 'end';
  /** Default "Previous month" and "Next month". */
  previousLabel?: string;
  /** Names the next-month button (default "Next month"). */
  nextLabel?: string;
  /** As on TextField. */
  optional?: boolean;
  /** An ⓘ beside the label that explains the field (a FieldHelp). */
  help?: { title?: string; text: ReactNode };
  /** The field's widest, in px. */
  maxWidth?: number;
  /** The field's id; one is made without it. */
  id?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* A date, or a range of dates. The trigger is Select's; the calendar opens in a Popover, a month for a date and two for a range,
   with the presets as Picker's rows. Dates are 'YYYY-MM-DD' and counted in UTC, so a day is the same day everywhere; every name
   and number on screen comes from Intl in the viewer's locale. A range takes two presses: the first sets the start, the second
   the end, and between them the band follows the pointer or the focused day. */
/**
 * DateField picks a date, or a range of dates read by period: this month, the quarter, the dates on an invoice. A record people
 * read by period, a campaign's start and end.
 *
 * Not for a choice from a few named periods only (`Select`); a time of day or a duration (`NumberField`).
 *
 * Accessibility: The field is a button named by `label` and the dates, that opens a dialog named by `label`. Each month is a
 * grid named by its month and year, with one Tab stop: arrows move a day or a week, Page Up and Page Down a month (with Shift a
 * year), Home and End to the start and end of the week, and Enter or Space picks. Days in the range are selected, days out of
 * reach disabled, and today is the current date; the new month is announced when it changes. The presets are a listbox with one
 * Tab stop. Escape, a press outside or Tab out of it closes, and after Escape focus goes back to the field. Sliding across days
 * is for the pointer; two presses, or the keys, do the same.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function DateField(props: DateFieldProps) {
  const tx = useWords(ownWords);
  const range = !!props.range, [narrow, setNarrow] = useState(false), months = range && !narrow ? 2 : 1;
  const locale = props.locale || tx.locale;
  const first = props.weekStartsOn !== undefined ? props.weekStartsOn : weekStartOf(locale);
  const today = props.today && props.today.length === 10 && validDay(props.today) ? props.today : todayIso();
  const id = useUid('sk-date', props.id), named = fieldAria(props, id);
  const [value, setValue] = useState(props.value);
  useEffect(() => { setValue(props.value); }, [JSON.stringify(props.value)]);
  const start = range ? (value as DateRange | undefined)?.start : (value as string | undefined);
  const end = range ? (value as DateRange | undefined)?.end : (value as string | undefined);
  const [open, setOpen] = useState(!!props.open);
  const lead = () => { const anchor = (range ? end : start) || today; return range ? addMonths(monthOf(anchor), -1) : monthOf(anchor); };
  const fixed = validDay(props.month) ? monthOf(props.month!) : null;
  const [month, setMonth] = useState<string>(fixed || lead);
  const [focus, setFocus] = useState<string>(start || today);
  const [draft, setDraft] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const body = useRef<HTMLDivElement>(null), presets = useRef<HTMLDivElement>(null), want = useRef(!!props.open), seen = useRef(month);
  /* Opened by `open` or a pointer, the focused day shows no ring until a key is pressed */
  const [quiet, setQuiet] = useState(true);
  const rove = useRoving(presets, { selector: '[role="option"]' });
  const swept = useRef<{ from: string; to?: string }>({ from: '' });
  const off = (iso: string) => !!((props.min && iso < props.min) || (props.max && iso > props.max));
  /* A range in one gesture: press on the start, slide to the end, let go. Two presses still work. */
  const sweep = useDrag({
    can: (e) => { const d = range && (e.target as Element).closest('[data-day]'); return !!d && !off(d.getAttribute('data-day')!); },
    start: (s) => { const from = (s.target as Element).closest('[data-day]')!.getAttribute('data-day')!; swept.current = { from }; setDraft(from); setHover(from); },
    move: (e) => {
      const d = document.elementFromPoint(e.clientX, e.clientY), cell = d && d.closest && d.closest('[data-day]'), sw = swept.current;
      if (!cell) return;
      const iso = cell.getAttribute('data-day')!;
      if (off(iso)) return;
      sw.to = iso;
      setHover(iso >= sw.from ? iso : sw.from);
      if (iso < sw.from) setDraft(iso); else setDraft(sw.from);
      setFocus(iso);
    },
    end: () => { const sw = swept.current; if (sw.to && sw.to !== sw.from) commit(sw.to > sw.from ? { start: sw.from, end: sw.to } : { start: sw.to, end: sw.from }); },
  });
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...o });
  const short = fmt({ month: 'short', day: 'numeric', year: 'numeric' }), long = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const titleFmt = fmt({ month: 'long', year: 'numeric' }), num = fmt({ day: 'numeric' }), wdShort = fmt({ weekday: 'short' }), wdLong = fmt({ weekday: 'long' });
  const written = (a?: string, b?: string) => {
    if (!a) return '';
    if (!range || !b || a === b) return short.format(dayOf(a)!);
    const ranged = short as Intl.DateTimeFormat & { formatRange?: (x: Date, y: Date) => string };
    return ranged.formatRange ? ranged.formatRange(dayOf(a)!, dayOf(b)!) : short.format(dayOf(a)!) + ' – ' + short.format(dayOf(b)!);
  };
  const preset = range && start && end ? (props.presets || []).find((p) => p.start === start && p.end === end) : null;
  const shown: string[] = [];
  for (let mi = 0; mi < months; mi++) shown.push(addMonths(month, mi));
  const heading = () => shown.map((m) => titleFmt.format(dayOf(m)!)).join(', ');
  useEffect(() => { if (open && seen.current !== month) announce(heading()); seen.current = month; }, [month, open]);
  /* After the Popover's own effect, so it keeps the field as where focus goes back to */
  useEffect(() => {
    if (!want.current || !open || !body.current) return;
    const el = body.current.querySelector<HTMLElement>('[data-day="' + focus + '"]:not(.is-other)') || body.current.querySelector<HTMLElement>('[data-day="' + focus + '"]');
    if (el) { el.focus({ preventScroll: true, focusVisible: !quiet } as FocusOptions); want.current = false; }
  });
  /* Two months beside the presets, unless they wrap: then one month, with the presets above it */
  useLayoutEffect(() => {
    if (!open || !range || narrow || !body.current) return;
    const ms = body.current.querySelectorAll<HTMLElement>('.sk-datefield__month'), list = body.current.querySelector<HTMLElement>('.sk-datefield__presets');
    const wrapped = (ms.length > 1 && ms[1].offsetTop > ms[0].offsetTop) || (list && ms[0] && ms[0].offsetTop > list.offsetTop);
    if (wrapped) { setNarrow(true); setMonth(monthOf(focus)); want.current = true; }
  });
  useEffect(() => {
    if (!range) return undefined;
    const widen = () => setNarrow(false);
    window.addEventListener('resize', widen);
    return () => window.removeEventListener('resize', widen);
  }, [range]);
  function show(v: boolean, byKey: boolean) {
    setOpen(v);
    if (!v) return;
    setQuiet(!byKey);
    const f = start || (props.max && today > props.max ? props.max : today);
    setDraft(null); setHover(null); setFocus(f); setMonth(fixed || lead()); want.current = true;
  }
  function close() { setOpen(false); setDraft(null); setHover(null); }
  function commit(v: string | DateRange) { setValue(v); close(); if (props.onChange) props.onChange(v); }
  function pickDay(iso: string) {
    if (off(iso)) return;
    if (!range) return commit(iso);
    if (!draft || iso < draft) { setDraft(iso); setHover(iso); setFocus(iso); return; }
    commit({ start: draft, end: iso });
  }
  function go(iso: string) {
    setFocus(iso);
    if (draft) setHover(iso);
    const last = shown[shown.length - 1];
    if (iso < month) setMonth(monthOf(iso));
    else if (iso >= addMonths(last, 1)) setMonth(addMonths(monthOf(iso), 1 - months));
    want.current = true;
  }
  function dayKeys(e: KeyboardEvent, iso: string) {
    const k = e.key, back = (dayOf(iso)!.getUTCDay() - first + 7) % 7;
    let to: string | null = null;
    if (k === 'ArrowLeft') to = addDays(iso, -1);
    else if (k === 'ArrowRight') to = addDays(iso, 1);
    else if (k === 'ArrowUp') to = addDays(iso, -7);
    else if (k === 'ArrowDown') to = addDays(iso, 7);
    else if (k === 'PageUp') to = addMonths(iso, e.shiftKey ? -12 : -1);
    else if (k === 'PageDown') to = addMonths(iso, e.shiftKey ? 12 : 1);
    else if (k === 'Home') to = addDays(iso, -back);
    else if (k === 'End') to = addDays(iso, 6 - back);
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); pickDay(iso); return; }
    if (to) { e.preventDefault(); go(to); }
  }
  const lo = range ? draft || start : start, hi = range ? (draft ? (hover && hover >= draft ? hover : draft) : end) : start;
  const within = (iso: string) => !!(lo && hi && iso >= lo && iso <= hi);
  const weekdays: { short: string; long: string }[] = [];
  for (let wi = 0; wi < 7; wi++) { const wd = dayOf(addDays('2023-01-01', (first + wi) % 7))!; weekdays.push({ short: wdShort.format(wd), long: wdLong.format(wd) }); }
  function grid(m: string, i: number) {
    const tid = id + '-m' + i, next = addMonths(m, 1), lead = (dayOf(m)!.getUTCDay() - first + 7) % 7, from = addDays(m, -lead);
    const tab = focus >= m && focus < next ? focus : start && start >= m && start < next ? start : m;
    const nav = (d: number, icon: 'chevron-left' | 'chevron-right', label: string) => <IconButton variant="plain" icon={icon} label={label} onClick={() => setMonth(addMonths(month, d))} />;
    const rows = [];
    for (let w = 0; w < 6; w++) {
      const cells = [];
      for (let c = 0; c < 7; c++) {
        const iso = addDays(from, w * 7 + c);
        if (range && (iso < m || iso >= next)) { cells.push(<td key={iso} className="sk-datefield__day is-blank" />); continue; }
        const other = iso < m || iso >= next, out = off(iso), inside = !other && within(iso), edge = inside && (iso === lo || (iso === hi && !draft));
        cells.push(
          <td key={iso} data-day={iso} tabIndex={iso === tab ? 0 : -1} aria-label={long.format(dayOf(iso)!)}
            aria-selected={inside && (!draft || iso === lo) ? 'true' : 'false'} aria-disabled={out ? 'true' : undefined} aria-current={iso === today ? 'date' : undefined}
            className={cx('sk-datefield__day', other && 'is-other', out && 'is-off', inside && !edge && 'is-band', edge && 'is-end')}
            onClick={() => pickDay(iso)} onMouseEnter={draft ? () => setHover(iso) : undefined}
            onFocus={() => { if (iso !== focus) setFocus(iso); if (draft) setHover(iso); }} onKeyDown={(e) => dayKeys(e, iso)}>
            <span aria-hidden="true">{num.format(dayOf(iso)!)}</span>
          </td>,
        );
      }
      rows.push(<tr key={w}>{cells}</tr>);
    }
    return (
      <div key={m} className="sk-datefield__month">
        <div className="sk-datefield__head">
          {i === 0 ? nav(-1, 'chevron-left', props.previousLabel || tx('previousMonth')) : <span aria-hidden="true" />}
          <span id={tid} className="sk-datefield__title">{titleFmt.format(dayOf(m)!)}</span>
          {i === months - 1 ? nav(1, 'chevron-right', props.nextLabel || tx('nextMonth')) : <span aria-hidden="true" />}
        </div>
        <table className="sk-datefield__grid" role="grid" aria-labelledby={tid}>
          <thead><tr>{weekdays.map((d) => <th key={d.long} scope="col" abbr={d.long}>{d.short}</th>)}</tr></thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
  type Row = { label: string; start: string; end: string; selected: boolean };
  const choose: PickerRows<Row> = { id: id + '-p', active: -1, search: false, choose: (o) => commit({ start: o.start, end: o.end }) };
  const list = range && props.presets && props.presets.length ? (
    <div ref={presets} className="sk-picker__list sk-datefield__presets" role="listbox" aria-label={props.presetsLabel || tx('presets')}
      onKeyDown={(e) => {
        const t = e.target as Element;
        if ((e.key === 'Enter' || e.key === ' ') && t.getAttribute('role') === 'option') { e.preventDefault(); const p = props.presets![+t.getAttribute('data-n')!]; commit({ start: p.start, end: p.end }); return; }
        rove(e);
      }}>
      {props.presets.map((p, n) => pickerOption({ label: p.label, start: p.start, end: p.end, selected: p === preset }, n, choose, tx))}
    </div>
  ) : null;
  const text = written(start, end);
  const trigger = (
    <button type="button" id={id} className={cx('sk-tf__control', 'sk-select', 'sk-datefield__trigger', !text && 'is-empty')} disabled={props.disabled}
      aria-haspopup="dialog" aria-expanded={open ? 'true' : 'false'} aria-labelledby={props.label ? named['aria-labelledby'] + ' ' + id + '-value' : undefined}
      aria-label={props.label ? undefined : text} aria-describedby={named['aria-describedby']} onClick={(e) => show(!open, e.detail === 0)}>
      <span className="sk-select__value">
        <Icon name="calendar" size="var(--datefield-icon-size)" />
        <span className="sk-select__text" id={id + '-value'}>{preset && <span className="sk-datefield__preset">{preset.label + ' '}</span>}{text || props.placeholder || ''}</span>
      </span>
      <Icon name="chevron-down" size="var(--datefield-chevron-size)" className="sk-select__chevron" />
    </button>
  );
  const pop = (
    <Popover open={open} onClose={close} label={props.label} align={props.align || 'start'} className="sk-datefield__pop">
      <div ref={body} className={cx('sk-datefield__body', quiet && 'is-quiet', narrow && 'is-narrow')} onKeyDown={() => { if (quiet) setQuiet(false); }} onMouseLeave={() => { if (draft) setHover(draft); }}>
        {list}
        <div className={cx('sk-datefield__months', range && 'is-sweepable')} {...sweep.handlers}>{shown.map(grid)}</div>
      </div>
    </Popover>
  );
  return fieldShell(props, <div className="sk-select-wrap sk-datefield">{trigger}{pop}</div>, id);
}
