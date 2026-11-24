import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Slip.css';

/** Slots: slot="action". */
export interface SlipProps {
  /** The slip's heading ("Director's note", "Suggestion"). */
  label?: string;
  /** The note has been acted on: the slip turns to an outline and reads "Done". */
  done?: boolean;
  /** The note, and slot="action". */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Slip is the correction slip, the only tinted surface on a sheet: the Director's revision note, a check, a review note pinned
 * to a take, a story check. `done` turns it into an outline. Slot: `action` (Ask Maki).
 *
 * Not for one line of context inside a page (`Notice`); a proposed change in the words themselves (`Revision`); something Maki
 * proposes inside the chat (`MakiCard`); a confirmation that something finished (`Toast`).
 *
 * Accessibility: Not focusable itself; "Done" when `done`, then the label, body and action read in order, and the action takes
 * focus.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Slip({ label, done, children, className }: SlipProps) {
  const tx = useWords(ownWords);
  const sl = slots(children);
  return <div className={cx('sk-slip', done && 'is-done', className)}>{done && <span className="sk-sr">{tx('doneSentence') + ' '}</span>}{label && <small>{label}</small>}{sl.body}{sl.get('action')}</div>;
}
