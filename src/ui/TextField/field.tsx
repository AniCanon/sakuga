import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { FieldHelp } from '../FieldHelp/FieldHelp';
import { useWords } from '../../internal/words';
import '../../base.css';
import './TextField.css';

/** What every labelled field (TextField, Select, DateField) draws around its control. */
export interface FieldShellProps {
  /** The field's name, above it. Without one the placeholder names the field (search fields). */
  label?: string;
  /** One line under the control. */
  hint?: string;
  /** Adds " · optional" after the label. */
  optional?: boolean;
  /** A FieldHelp tooltip beside the label. */
  help?: { title?: string; text: ReactNode };
  /** The widest it grows, in pixels. */
  maxWidth?: number;
  /** Extra class on the root element. */
  className?: string;
}

export function fieldShell(props: FieldShellProps, control: ReactNode, id: string) {
  const tx = useWords();
  return (
    <div className={cx('sk-tf', props.className)} style={props.maxWidth ? { maxWidth: props.maxWidth } : undefined}>
      {props.label && (
        <label className="sk-tf__label" htmlFor={id}>
          <span id={id + '-name'}>{props.label}</span>
          {props.optional && <span className="sk-tf__opt" id={id + '-opt'}>{' · ' + tx('optional')}</span>}
          {props.help && <FieldHelp label={props.label} title={props.help.title}>{props.help.text}</FieldHelp>}
        </label>
      )}
      {control}
      {props.hint && <span className="sk-tf__hint" id={id + '-hint'}>{props.hint}</span>}
    </div>
  );
}

/* The control is named by the label's words (and "optional") alone, so a help button inside the label stays out of its name */
export function fieldAria(props: FieldShellProps, id: string) {
  return {
    'aria-labelledby': props.label ? id + '-name' + (props.optional ? ' ' + id + '-opt' : '') : undefined,
    'aria-describedby': props.hint ? id + '-hint' : undefined,
  };
}
