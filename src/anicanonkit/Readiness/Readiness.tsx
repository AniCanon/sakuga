import { Icon } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useFresh } from '../../internal/fresh';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Readiness.css';

export interface ReadinessProps {
  /** What must be ready, each `done` or `attention`, with a short `detail`. */
  items: { label: string; detail?: string; state?: 'done' | 'attention' }[];
  /** Names the list for screen readers. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* Characters: what a character is ready with. Each part ticked, or marked when it waits on the creator, with a quiet line under it. */
/**
 * What a character is ready with, at a glance on their page: looks, voice, face, props. Each part is ticked, or marked when it
 * waits on the creator, with a quiet line under it ("1 waiting on you", "Optional").
 *
 * Not for a job's stages in order, with their times (`Stages`); where a person is in a flow they step through (`Stepper`); who
 * a character is (`CharacterStats`); wardrobe across the whole cast (`CoverageTable`).
 *
 * Accessibility: Not focusable; a list named by `label` (default "Ready"), each item read as its label, then "ready" or
 * "waiting for you", then its detail.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Readiness({ items, label, className }: ReadinessProps) {
  const tx = useWords(ownWords);
  const fresh = useFresh();
  return (
    <ul className={cx('sk-ready', className)} aria-label={label || tx('ready')}>
      {(items || []).map((it, i) => {
        const wait = it.state === 'attention';
        return (
          <li key={i} className={cx('sk-ready__item', wait && 'is-attention')}>
            <span key={wait ? 'wait' : 'ready'} className={cx('sk-ready__mark', fresh(String(i), wait) && 'is-fresh')} aria-hidden="true"><Icon name={wait ? 'warning' : 'check'} size="var(--readiness-mark-icon-size)" /></span>
            <span>{it.label}<span className="sk-sr">{', ' + tx(wait ? 'waitingForYou' : 'readyState')}</span>{it.detail && <small>{it.detail}</small>}</span>
          </li>
        );
      })}
    </ul>
  );
}
