import { useEffect, useRef, type KeyboardEvent } from 'react';
import { cx } from '../../internal/cx';
import { announce } from '../../internal/live';
import { useUid } from '../../internal/uid';
import { IconButton } from '../IconButton/IconButton';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './NumberField.css';

/** A number you type or step a unit at a time, never drag: a 1px border is one press. */
export interface NumberFieldProps {
  /** The field's label; names it. */
  label: string;
  /** The number shown, with its unit if it carries one ("0.5 s"). */
  value: string | number;
  /** Shown after the value: a symbol on the number ("px", "°", "%"), a word after a space ("days", "fps"). */
  unit?: string;
  /** Called with −1 or +1. Without it the buttons only draw. */
  onStep?: (delta: -1 | 1) => void;
  /** Called with the typed number (unit dropped, inside min and max) on Enter or leaving the field; without it what is typed goes back to value. */
  onChange?: (value: number) => void;
  /** The value can't change: the buttons are off too. */
  readOnly?: boolean;
  /** The input's id; one is made without it. */
  id?: string;
  /** Extra class on the root element. */
  className?: string;
  /** The range a screen reader is told. */
  min?: number;
  /** The largest it can be. */
  max?: number;
}

/* A number you type or step, never drag: its name, then a step down, the value with its unit, and a step up. The input is a spinbutton
   that Up and Down step as the buttons do; a step made with a button is said aloud, since focus stays on the button. */
/* Whether the locale writes its decimals with a comma (pt-BR "1,5") */
function decimalComma(locale: string) { try { return new Intl.NumberFormat(locale).format(1.5).indexOf(',') >= 0; } catch { return false; } }

/**
 * NumberField is a number you type or step a unit at a time: its name, a step down, the value with its unit, a step up.
 *
 * Not for a feel such as strength or mix, where the readout is the point (`SliderRow`); nudging a cut's in or out a frame at a
 * time (`TrimFrames`); words (`TextField`).
 *
 * Accessibility: A spinbutton named by `label` that takes typing, handed over on Enter or leaving it: Up and Down step it
 * through `onStep` and its value is read with its unit, and `min` and `max` give its range. Tab also reaches the "Less" and
 * "More" buttons on either side ("More duration"), whose steps are said aloud.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function NumberField({ label, value, unit: given, onStep, onChange, readOnly, id: idGiven, className, min, max }: NumberFieldProps) {
  const tx = useWords(ownWords);
  const id = useUid('sk-num', idGiven), name = String(label || '').toLocaleLowerCase(tx.locale);
  const input = useRef<HTMLInputElement>(null), size = useRef<HTMLSpanElement>(null), byButton = useRef(false);
  const unit = given || '', shown = typeof value === 'number' ? new Intl.NumberFormat(tx.locale, { useGrouping: false, maximumFractionDigits: 20 }).format(value) : String(value);
  const text = shown + (/^[A-Za-z]{3,}/.test(unit) ? ' ' : '') + unit, num = parseFloat(String(value));
  useEffect(() => {
    if (input.current && input.current.value !== text) input.current.value = text;
    if (size.current) size.current.textContent = text;
    if (byButton.current) { byButton.current = false; announce(label + ' ' + text); }
  }, [text]);
  const live = !!onStep && !readOnly;
  const step = (d: -1 | 1) => (live ? () => { byButton.current = true; onStep!(d); } : undefined);
  const still = onStep ? { disabled: !!readOnly } : { tabIndex: -1, 'aria-hidden': true as const };
  /* The typed words as a number: the unit and spaces fall away; a comma reads as a decimal point, and where the locale writes its
     decimals with a comma (pt-BR), a point groups thousands and falls away too; inside min and max */
  function commit(el: HTMLInputElement) {
    if (el.value === text) return false;
    const typed = decimalComma(tx.locale) ? el.value.replace(/\./g, '') : el.value;
    let n = parseFloat(typed.replace(',', '.').replace(/[^0-9.+-]/g, ''));
    if (!onChange || readOnly || !isFinite(n)) { el.value = text; if (size.current) size.current.textContent = text; return false; }
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onChange(n);
    return true;
  }
  function keys(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { commit(e.currentTarget); return; }
    const d = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0;
    if (!d) return;
    /* Typed and not yet handed over: the arrow hands it over first, so a step never starts from the old value */
    if (commit(e.currentTarget)) { e.preventDefault(); return; }
    if (!live) return;
    e.preventDefault();
    onStep!(d);
  }
  return (
    <div className={cx('sk-num', className)}>
      <label className="sk-num__label" htmlFor={id}>{label}</label>
      <div className="sk-num__row">
        <IconButton variant="plain" icon="chevron-down" label={tx('less', { name })} onClick={step(-1)} {...still} />
        <span className="sk-num__box">
          <span ref={size} className="sk-num__size" aria-hidden="true">{text}</span>
          <input
            ref={input} id={id} className="sk-num__input" inputMode="decimal" defaultValue={text} readOnly={readOnly} role="spinbutton"
            aria-valuenow={isFinite(num) ? num : undefined} aria-valuetext={text} aria-valuemin={min} aria-valuemax={max} onKeyDown={keys}
            onBlur={(e) => { commit(e.currentTarget); }}
            onInput={(e) => { if (size.current) size.current.textContent = e.currentTarget.value; }}
          />
        </span>
        <IconButton variant="plain" icon="chevron-up" label={tx('more', { name })} onClick={step(1)} {...still} />
      </div>
    </div>
  );
}
