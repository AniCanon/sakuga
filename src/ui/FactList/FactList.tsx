import { Fragment, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../../base.css';
import './FactList.css';

export interface FactListProps {
  /** The facts: a quiet name, its value, and in a grid an optional note. */
  items: { label: string; value: ReactNode; note?: string }[];
  /** `columns` (default): name and value in two columns. `grid`: each fact a small block, its name over its value. */
  layout?: 'columns' | 'grid';
  /** Blocks to a row, in a grid. */
  columns?: number;
  /** Extra class on the root element. */
  className?: string;
}

/* Facts as label and value: in two columns, or as a grid of small blocks where each value can carry a quiet note (since when, from where) */
/**
 * FactList pairs a quiet name with its value, two columns, values to the right. For measured facts (a colour match across a
 * join, the length of a trimmed cut), never for things the creator edits. `layout="grid"` sets each fact as a small block, its
 * name over its value, with an optional `note` under it ("since Fire at Sé"): who a character is at a point in the story. The
 * blocks in a row share one height, their content at the top, so a fact without a note sits level with the ones that have one.
 *
 * Not for settings the creator edits, each opening its choice (`PropertyList`); a character's picked facts, each with its
 * picker's icon (`CharacterStats`); a Studio section showing what it is set to (`PanelRow`).
 *
 * Accessibility: Not focusable; a description list, so each name is read as a term and its value, with any `note`, as its
 * description.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function FactList({ items, layout, columns, className }: FactListProps) {
  const grid = layout === 'grid';
  return (
    <dl className={cx('sk-facts', grid && 'sk-facts--grid', className)} style={grid && columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}>
      {(items || []).map((f, i) => {
        const pair = [<dt key="k">{f.label}</dt>, <dd key="v">{f.value}{f.note && <small>{f.note}</small>}</dd>];
        return grid ? <div key={i} className="sk-facts__item">{pair}</div> : <Fragment key={i}>{pair}</Fragment>;
      })}
    </dl>
  );
}
