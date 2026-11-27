import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../CutSheet/CutSheet.css';

export interface CutRowProps {
  /** Bands the row: the cut open beside the sheet. */
  selected?: boolean;
  /** A bar in the margin: the row changed since you last read it. */
  changed?: boolean;
  /** One cell runs under the row's columns (a Timesheet under its cut). */
  span?: boolean;
  /** The cells, in column order. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Each child the page passes is one of the sheet's cells: an element keeps its markup and takes the cell role, anything else is wrapped in one.
   A table has no selection to report, so selected and changed are said in words at the start of the first cell. */
/**
 * CutRow is one cut (or video, or production) in a CutSheet. Its children are the cells, in column order. `selected` bands the
 * row (the cut open beside the sheet); `changed` puts a bar in the margin when it changed since you last read it; `span` makes
 * one cell run under the row's columns (a Timesheet under its cut).
 *
 * Not for a row outside a sheet (`ListRow`); the cut number and its approval (`CutCell`); a row on Story (`EntityRow`).
 *
 * Accessibility: Not focusable; a table row whose children each become a cell (a plain element takes the cell role unless it
 * has its own; a component such as CutCell, or text, is wrapped in one), read in column order. A `selected` or `changed` row
 * starts its first cell with "Selected" or "changed", said but not shown.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CutRow({ selected, changed, span, children, className }: CutRowProps) {
  const tx = useWords(ownWords);
  const words = [selected && tx('cutSelected'), changed && tx('changed')].filter(Boolean).join(', ');
  const say = words && <span key="say" className="sk-sr">{words + '. '}</span>;
  let first = true;
  const kids = span ? [<div key="lead" role="cell">{say}</div>, <div key="span" role="cell" className="sk-cutsheet__span">{children}</div>]
    : Children.map(children, (c) => {
      if (c === null || c === undefined || c === false || c === true) return null;
      const lead = first && say;
      first = false;
      if (isValidElement(c) && typeof c.type === 'string') {
        const el = c as ReactElement<{ role?: string; children?: ReactNode }>;
        return lead ? cloneElement(el, { role: el.props.role || 'cell' }, lead, el.props.children) : cloneElement(el, { role: el.props.role || 'cell' });
      }
      return <div role="cell">{lead}{c}</div>;
    });
  return <div role="row" className={cx('sk-cutsheet__row', selected && 'is-selected', changed && 'is-changed', span && 'is-span', className)}>{kids}</div>;
}
