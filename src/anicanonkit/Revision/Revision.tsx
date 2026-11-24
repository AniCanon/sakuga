import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Revision.css';

export interface RevisionProps {
  /** Leave out for an insertion. */
  before?: string;
  /** The words as they would read. */
  after: string;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Revision shows a proposed change in place: the old words struck, the new ones underlined. Accept, Decline and Why sit beside
 * it, per cut. Without `before` it is only an insertion: a new line proposed where there was none.
 *
 * Not for a change of state, such as alive to dead (`StateChange`); the Director's note on a cut (`Slip`); something Maki
 * proposes inside the chat (`MakiCard`); an event or link found in writing (`ProposalCard`).
 *
 * Accessibility: Not focusable; read as "Removed:" and the old words, then "Added:" and the new ones, the two labels said but
 * not shown.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Revision({ before, after, className }: RevisionProps) {
  const tx = useWords(ownWords);
  return (
    <span className={cx('sk-revision', className)}>
      {before && <span className="sk-sr">{tx('removedPrefix') + ' '}</span>}{before && <del>{before}</del>}{before && ' '}
      <span className="sk-sr">{tx('addedPrefix') + ' '}</span><ins>{after}</ins>
    </span>
  );
}
