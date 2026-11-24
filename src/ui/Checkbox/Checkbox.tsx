import { cx } from '../../internal/cx';
import { useFresh } from '../../internal/fresh';
import { useUid } from '../../internal/uid';
import { Icon } from '../Icon/Icon';
import '../../base.css';
import './Checkbox.css';

export interface CheckboxProps {
  /** Whether it is chosen. */
  checked?: boolean;
  /** Over a set when only some of it is chosen: a dash, read "mixed". A press chooses all. */
  mixed?: boolean;
  /** What it chooses, read by screen readers. */
  label: string;
  /** Sets the label beside the box; a press on the words flips it too. */
  showLabel?: boolean;
  /** With showLabel: a quiet line under the label, read as its description. */
  hint?: string;
  /** Can't be changed, and leaves the tab order. */
  disabled?: boolean;
  /** Called with the new value; from mixed, true. */
  onChange?: (checked: boolean) => void;
  /** Extra class on the root element. */
  className?: string;
}

/* One thing chosen or not, among others that may be chosen too. `mixed` is a box that chooses a set when only some of it is
   chosen; pressing it chooses them all. The mark settles in when it changes while you watch. */
/**
 * Checkbox is one thing chosen or not, among others that may be chosen too: the files to queue, the rows to delete, the terms
 * you agree to. Its box has an edge when off and fills with the accent and a check when on.
 *
 * Not for a setting that takes effect the moment it changes (`Switch`); choosing among options drawn as tiles (`OptionTiles`
 * with `multiple`); choosing one thing among many, with pictures and search (`Picker`).
 *
 * Accessibility: A checkbox named by `label` that Tab reaches; Enter or Space flips it through `onChange`, and it is announced
 * "checked", "not checked" or "mixed". `disabled` takes it out of the tab order. With `showLabel` the row is its label, so a
 * click on the words flips it too, and the `hint` is its description. The mark is hidden; the state is said. In forced colours
 * the edge and the mark draw in the system colours.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Checkbox({ checked, mixed, label, showLabel, hint: words, disabled, onChange, className }: CheckboxProps) {
  const hint = useUid('sk-check') + '-hint', fresh = useFresh();
  const state = mixed ? 'mixed' : checked ? 'on' : 'off', settle = fresh('mark', state);
  const box = (
    <button
      type="button" role="checkbox" aria-checked={mixed ? 'mixed' : checked ? 'true' : 'false'} aria-label={label}
      aria-describedby={showLabel && words ? hint : undefined} disabled={disabled}
      className={cx('sk-check', state === 'on' && 'is-on', state === 'mixed' && 'is-mixed', !showLabel && className)}
      onClick={onChange ? () => onChange(mixed ? true : !checked) : undefined}
    >
      {state !== 'off' && (
        <span key={state} className={cx('sk-check__mark', settle && 'is-fresh')} aria-hidden="true">
          <Icon name={state === 'mixed' ? 'minus' : 'check'} size="var(--check-mark-size)" />
        </span>
      )}
    </button>
  );
  return showLabel ? (
    <label className={cx('sk-checkrow', disabled && 'is-off', className)}>
      {box}
      <span className="sk-checkrow__text">{label}{words && <small id={hint}>{words}</small>}</span>
    </label>
  ) : box;
}
