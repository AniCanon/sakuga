import { Icon } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './CutCell.css';

export interface CutCellProps {
  /** The cut's number ("C12"). */
  number: string;
  /** Its approval: `approved` or `waiting`. */
  state?: 'approved' | 'waiting';
  /** The state's words, read by screen readers. */
  stateLabel?: string;
  /** A short line under the number. */
  note?: string;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * CutCell is the cut number, with its approval: `approved` (filled check) or `waiting` (an empty ring). `note` adds a short
 * line under it, such as the video it is (V3).
 *
 * Not for camera and timing notation (`Shorthand`); a state on a surface (`Badge`); a whole row of the sheet (`CutRow`).
 *
 * Accessibility: Not focusable; the cut number and `note` read as text, and the approval is an image named by `stateLabel`
 * ("Approved" or "Waiting for you").
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CutCell({ number, state, stateLabel, note, className }: CutCellProps) {
  const tx = useWords(ownWords);
  const said = stateLabel || tx(state === 'approved' ? 'approved' : 'waitingForYouTitle');
  return (
    <div className={cx('sk-cutcell', className)}>
      <b>{number}</b>
      {state && <span className={'sk-cutcell__state is-' + state} role="img" aria-label={said} title={said}><Icon name="check" size="var(--cut-check-icon-size)" /></span>}
      {note && <small>{note}</small>}
    </div>
  );
}
