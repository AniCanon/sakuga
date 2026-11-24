import { Badge, Icon, type IconName } from '@anicanon/sakuga/ui';
import { useFresh } from '../../internal/fresh';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './StateChange.css';

export interface StateChangeProps {
  /** The state it was; left out for one with no prior value. */
  before?: string;
  /** The state it is now. */
  after: string;
  /** `alert` for a change for the worse (burning, dead); `new` for one just added. */
  afterVariant?: 'new' | 'alert';
  /** The new state's own glyph (Held a lock, Ransacked the chaos mark); never the warning triangle, and none for a state without one. */
  afterIcon?: IconName;
  /** The old state's own glyph, by the same rule. */
  beforeIcon?: IconName;
}

/**
 * StateChange is a change written as before → after: two badges, the before faded.
 *
 * Not for a single state laid over artwork (`Badge`); a proposed change to words (`Revision`); the change as a whole row with
 * its picture (`EntityRow`).
 *
 * Accessibility: Not focusable; read as "Changed from", the before badge, "to" and the after badge, with the arrow itself
 * hidden, and with no `before` it reads the after badge alone.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StateChange({ before, after, afterVariant, afterIcon, beforeIcon }: StateChangeProps) {
  const tx = useWords(ownWords);
  const fresh = useFresh();
  const shown = <span key={after} className={cx('sk-state__after', fresh('0', after) && 'is-fresh')}><Badge variant={afterVariant} icon={afterIcon}>{after}</Badge></span>;
  if (!before) return <span className="sk-state">{shown}</span>;
  return (
    <span className="sk-state">
      <span className="sk-sr">{tx('changedFrom') + ' '}</span>
      <span className="sk-state__before"><Badge icon={beforeIcon}>{before}</Badge></span>
      <span className="sk-state__arrow"><Icon name="forward" size="var(--state-arrow-icon-size)" /><span className="sk-sr">{' ' + tx('changedTo') + ' '}</span></span>
      {shown}
    </span>
  );
}
