import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useUid } from '../../internal/uid';
import { useWords } from '../../internal/words';
import '../../base.css';
import '../TextField/TextField.css';

/** The form's label over a control that has none of its own, with an optional hint. */
export interface FieldProps {
  /** The label over the control; names the group. */
  label: string;
  /** A quiet line under the control; describes the group. */
  hint?: string;
  /** Adds "· optional" to the label. */
  optional?: boolean;
  /** The label's id; the group is named by it. One is made without it. */
  id?: string;
  /** The control: a segmented control, chips, a group of options. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* A label over any control that does not carry its own (a segmented control, a group of chips), with an optional hint under it */
/**
 * Field puts the form's label over a control that does not carry its own (a segmented control, chips, a group of options), with
 * an optional hint under it.
 *
 * Not for typed words, which carry their own label (`TextField`); a list choice, which carries its own label (`Select`);
 * explaining a field on hover or focus (`FieldHelp`); a label over a strip or a group inside a panel (`SectionHeader`).
 *
 * Accessibility: A group named by its `label` and described by its `hint`, so the control inside is announced within it, with
 * "optional" read as part of the name.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Field({ label, hint, optional, id: given, children, className }: FieldProps) {
  const tx = useWords();
  const id = useUid('sk-fld', given);
  return (
    <div className={cx('sk-tf', className)} role="group" aria-labelledby={id} aria-describedby={hint ? id + '-hint' : undefined}>
      <span className="sk-tf__label" id={id}>{label}{optional && <span className="sk-tf__opt">{' · ' + tx('optional')}</span>}</span>
      {children}
      {hint && <span className="sk-tf__hint" id={id + '-hint'}>{hint}</span>}
    </div>
  );
}
