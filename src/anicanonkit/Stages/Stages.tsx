import { Icon } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useFresh } from '../../internal/fresh';
import { AniCanonLoader } from '../AniCanonLoader/AniCanonLoader';
import { useWords, type WordKey } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Stages.css';

export interface StagesProps {
  /** The stages in order: what each makes (never the model), its state and its time; a `failed` one says why in its text. */
  items: { title: string; text?: string; state?: 'done' | 'running' | 'todo' | 'failed'; time?: string }[];
  /** `sm` on a phone. */
  size?: 'md' | 'sm';
  /** Names the list for screen readers. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

const STAGE_SAID: Record<string, WordKey> = { done: 'doneState', failed: 'failed' };

/* A job's stages in order: done ones ticked with the time they took, the running one with the loader, the rest numbered. A failed one says why. */
/**
 * A job's stages in order, while it runs and after: done ones ticked with the time they took, the running one with AniCanon's
 * loader, the rest numbered.
 *
 * Not for where a person is in a flow they step through (`Stepper`); what a character is ready with (`Readiness`); how far one
 * job has come as a share (`Progress`); every running and finished job (`ActivityPanel`).
 *
 * Accessibility: Not focusable; an ordered list named by `label` (default "Stages"), each stage read as its title, with "done"
 * or "failed" where it applies, then its text and time. The running one is marked "current step", and its loader says the title
 * once when it appears.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Stages({ items, size, label, className }: StagesProps) {
  const tx = useWords(ownWords);
  const fresh = useFresh();
  return (
    <ol className={cx('sk-stages', size === 'sm' && 'sk-stages--sm', className)} aria-label={label || tx('stages')}>
      {(items || []).map((s, i) => {
        const st = s.state || 'todo';
        const mark = st === 'done' ? <Icon name="check" size="var(--stages-item-mark-icon-size)" />
          : st === 'running' ? <AniCanonLoader size="var(--stages-item-mark-icon-size)" label={s.title} />
          : st === 'failed' ? <Icon name="warning" size="var(--stages-item-mark-icon-size)" />
          : String(i + 1);
        return (
          <li key={i} className={'sk-stages__item is-' + st} aria-current={st === 'running' ? 'step' : undefined}>
            <span key={st} className={cx('sk-stages__mark', fresh(String(i), st) && 'is-fresh')}>{mark}</span>
            <span className="sk-stages__text"><b>{s.title}{STAGE_SAID[st] && <span className="sk-sr">{', ' + tx(STAGE_SAID[st])}</span>}</b>{s.text && <span>{s.text}</span>}</span>
            <span className="sk-stages__time">{s.time || (st === 'todo' ? '—' : '')}</span>
          </li>
        );
      })}
    </ol>
  );
}
