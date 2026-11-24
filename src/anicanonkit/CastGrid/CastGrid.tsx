import { cx } from '../../internal/cx';
import { CastCard, type CastCardProps } from '../CastCard/CastCard';
import '../../base.css';
import './CastGrid.css';

export interface CastGridProps {
  /** The cast, one CastCard each, in order. */
  items: CastCardProps[];
  /** Cards to a row (default 6). */
  columns?: number;
  /** Names the grid for screen readers, e.g. the faction. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* A list of cards; each list item is a wrapper that takes no box (sk-contents), so a card that links keeps its link role */
/**
 * A faction's cast as `CastCard`s, six across on desktop. Pass `items`; each card links to the character's page. Head each grid
 * with a `SectionHeader` carrying the faction's `icon` and `count`.
 *
 * Not for one cast member on their own (`CastCard`); the faction's heading with its icon and count (`SectionHeader`); the
 * characters on a series page (`CastAvatar`); episodes, shorts or issues in a grid (`MediaCard`).
 *
 * Accessibility: A list named by `label` with a card per item: a card with `href` is a link that Tab moves to and Enter
 * follows, named by the character's name, and a card without one is not a link.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CastGrid({ items, columns, label, className }: CastGridProps) {
  return (
    <div className={cx('sk-castgrid', className)} role="list" aria-label={label} style={columns ? { gridTemplateColumns: 'repeat(' + columns + ', minmax(0, 1fr))' } : undefined}>
      {(items || []).map((c, i) => <div key={i} role="listitem" className="sk-contents"><CastCard {...c} /></div>)}
    </div>
  );
}
