import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import '../../base.css';
import './CutSheet.css';

/** Productions: a scene read as an ekonte sheet. */
export interface CutSheetProps {
  /** The sheet's columns, in order: their heading, width and alignment. */
  columns: { label: string; width?: string; align?: 'end' }[];
  /** Names the sheet's table for screen readers. */
  label?: string;
  /** On its page; slot="footer" sits under the sheet. */
  surface?: boolean;
  /** The rows, CutRows. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Productions kit. A production is read as the anime industry reads it: an ekonte sheet of numbered cuts
   (cut · picture · action · dialogue · seconds). Proposals are revisions in place; notes are correction slips. */
/**
 * CutSheet is a scene read the way anime reads it: an ekonte sheet. Rows are numbered cuts; columns are set per view (Plan: C ·
 * Picture · Action · Dialogue · Sec · Notes; Make: C · Board · Latest take · Video · Sec; lists: art · title · where it is ·
 * story). Rules between rows and none after the last, no boxes. Rows are `CutRow`s. `surface` sets the sheet on its page, the paper it is printed on;
 * what follows the sheet (the next scene, a quote) goes in `slot="footer"` under it.
 *
 * Not for the cut's tracks in time (`Timeline`); what gets generated for one cut, on a frame grid (`Timesheet`); one row of the
 * sheet (`CutRow`); a plain list of things with a title and a quiet line (`List`); the script as it is written (`Manuscript`).
 *
 * Accessibility: Not focusable; a table named by `label`, its first row the column headers, then a row per CutRow, and with
 * `surface` the footer slot follows the table.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CutSheet({ columns, label, surface, children, className }: CutSheetProps) {
  const cols = columns || [], sl = slots(children);
  const sheet = (
    <div className={cx('sk-cutsheet', !surface && className)} role="table" aria-label={label} style={{ gridTemplateColumns: cols.map((c) => c.width || 'minmax(0,1fr)').join(' ') }}>
      <div className="sk-cutsheet__head" role="row">
        {cols.map((c, i) => <span key={i} role="columnheader" className={cx('sk-cutsheet__h', c.align === 'end' && 'is-end')}>{c.label}</span>)}
      </div>
      {sl.body}
    </div>
  );
  return surface ? <div className={cx('sk-cutsheet-page', className)}>{sheet}{sl.get('footer')}</div> : sheet;
}
