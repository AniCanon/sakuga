import { Icon, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import '../../base.css';
import './CharacterStats.css';

export interface CharacterStat {
  /** The icon the picker shows for this fact, from the world's morphology. */
  icon?: IconName;
  /** The fact ("Tall", "Curvy"). */
  value: string;
  /** What the fact is ("Height", "Build"). */
  label: string;
  /** Rings a fact edited in this session. */
  changed?: boolean;
}

/** Characters: each fact as its picker's icon, the value and what it is. Tiles in a card or on a phone; pills across a page. */
export interface CharacterStatsProps {
  /** The facts, in order. */
  stats: CharacterStat[];
  /** `tiles` (default) in a CharacterCard and on a phone; `pills` across a character's page. */
  layout?: 'tiles' | 'pills';
  /** Tiles to a row (default 3). */
  columns?: number;
  /** Extra class on the root element. */
  className?: string;
}

/* Characters: who someone is at a glance, each fact as its picker's icon, the value and what it is. Tiles in a card or on a phone; pills across a page. */
/**
 * Who a character is at a glance: each fact as its picker's icon, the value and what it is.
 *
 * Not for who a character is at a point in the story, with since when (`FactList`); the whole character as one card
 * (`CharacterCard`); what a character is ready with (`Readiness`); words kept as tags, such as a visual vibe (`TagList`).
 *
 * Accessibility: Not focusable; each stat reads as text, its value then its name (its name then its value as pills), with
 * "changed" after a changed one, and the icons are hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CharacterStats({ stats, layout, columns, className }: CharacterStatsProps) {
  const tx = useWords();
  const pills = layout === 'pills';
  return (
    <div className={cx('sk-cstats', pills && 'sk-cstats--pills', className)} style={columns ? { gridTemplateColumns: 'repeat(' + columns + ', minmax(0, 1fr))' } : undefined}>
      {(stats || []).map((s) => (
        <span key={s.label} className={cx('sk-cstat', s.changed && 'is-changed')}>
          {s.icon && <span className="sk-cstat__icon"><Icon name={s.icon} size={pills ? 'var(--character-stat-pill-icon-size)' : 'var(--character-stat-icon-size)'} /></span>}
          {pills ? <><small>{s.label}</small>{s.value}</> : <><b>{s.value}</b>{s.label}</>}
          {s.changed && <span className="sk-sr">{', ' + tx('changed')}</span>}
        </span>
      ))}
    </div>
  );
}
