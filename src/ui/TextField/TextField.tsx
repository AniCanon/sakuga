import type { ChangeEvent } from 'react';
import { useUid } from '../../internal/uid';
import { cx } from '../../internal/cx';
import { Icon, type IconName } from '../Icon/Icon';
import { fieldAria, fieldShell, type FieldShellProps } from './field';
import '../../base.css';
import './TextField.css';

export interface TextFieldProps extends FieldShellProps {
  /** Leading icon for single-line fields, e.g. search. */
  icon?: IconName;
  /** Controlled text. Update it through onChange, or use readOnly. */
  value?: string;
  /** Initial text for an uncontrolled field. */
  defaultValue?: string;
  /** Without a label it names the field (search fields). */
  placeholder?: string;
  /** A text area, sized by `rows` and `minHeight`. */
  multiline?: boolean;
  /** With `multiline`: how many rows it shows (default 3). */
  rows?: number;
  /** With `multiline`: its least height, in px. */
  minHeight?: number;
  /** Accent edge for a changed value. */
  highlight?: boolean;
  /** The input's type, "text" by default. */
  type?: string;
  /** Read as required. */
  required?: boolean;
  /** Shows the value without letting it change. */
  readOnly?: boolean;
  /** The field's id, so a label elsewhere can point at it; one is made without it. */
  id?: string;
  /** Called with the text as it is typed. */
  onChange?: (text: string) => void;
}

/**
 * A labelled text input or text area. The label sits above, the hint below. Use `highlight` for a value that changed while
 * editing.
 *
 * Not for one choice from a list (`Select`); a number stepped a unit at a time (`NumberField`); words kept as separate tags
 * (`TagList`); Studio's prompt, with who and where it binds (`PromptComposer`); writing to Maki (`MakiComposer`).
 *
 * Accessibility: A text input (a text area with `multiline`) that Tab reaches and that takes typing, named by the words of
 * `label` (with "optional"), or by `placeholder` without one, and described by `hint`; `required` adds "required", and
 * `readOnly` makes it read-only. `onChange` gets the text as it is typed. The icon is hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function TextField(props: TextFieldProps) {
  const id = useUid('sk-tf', props.id);
  const common = {
    id,
    className: cx('sk-tf__control', props.multiline && 'sk-tf__control--area', props.highlight && 'is-highlight'),
    value: props.value,
    defaultValue: props.value === undefined ? props.defaultValue : undefined,
    placeholder: props.placeholder,
    readOnly: props.readOnly,
    'aria-required': props.required ? ('true' as const) : undefined,
    onChange: props.onChange ? (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => props.onChange!(e.target.value) : undefined,
    ...fieldAria(props, id),
  };
  let control = props.multiline
    ? <textarea rows={props.rows || 3} style={props.minHeight ? { minHeight: props.minHeight } : undefined} {...common} />
    : <input type={props.type || 'text'} aria-label={props.label ? undefined : props.placeholder} {...common} />;
  if (props.icon && !props.multiline) control = <span className="sk-tf__wrap"><Icon name={props.icon} size="var(--field-icon-size)" />{control}</span>;
  return fieldShell(props, control, id);
}
