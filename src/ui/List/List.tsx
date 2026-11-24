import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { announce } from '../../internal/live';
import { useUid } from '../../internal/uid';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { ListReorderContext, type ListDrag, type ListReorder } from './reorder';
import '../../base.css';
/* List.css restyles the rows it holds, so ListRow's CSS comes first, as in the design, whatever order an app imports them in */
import '../ListRow/ListRow.css';
import './List.css';

export interface ListProps {
  /** Names the list for screen readers. */
  label?: string;
  /** Rows that reorder: each gets a grip to drag, and Up and Down (or Alt with them) on the grip move it a place; a line shows the slot it lands in, and each move is said ("Voices moved to 1 of 3"). Called with the row's index and its new index. */
  onReorder?: (from: number, to: number) => void;
  /** A row drawn mid-move, for a board: its index and the index it lands at. */
  moving?: { from: number; to: number };
  /** The rows sit in a surface (a phone's grouped list). */
  surface?: boolean;
  /** The rows flow across 2 to 4 even columns, left to right (two drafts side by side); a column is never narrower than 438, so a narrower list drops columns, down to one. Not with surface. */
  columns?: 2 | 3 | 4;
  /** Its ListRows. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * List holds the rows of one list of things and names it: `ListRow`s, one thing per row. With `onReorder` the rows reorder:
 * each gets a grip at its start; dragged, the row lifts while a line shows the slot it lands in; on the grip, Up and Down move
 * it a place. Rows land in slots, nothing else snaps. The app keeps the order.
 *
 * Not for measured facts, a name and its value (`FactList`); cuts on an ekonte sheet (`CutSheet`).
 *
 * Accessibility: A list (role list) named by `label`; its rows are its items, read in order across each line when it has
 * `columns`, and Tab reaches only the rows that are links or hold a control. With `onReorder` each grip is a button named
 * "Move Voices, 2 of 3", described by how to move it, with Up and Down (or Alt with them) moving the row; the move is said aloud.
 *
 * @version 1.5
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function List({ label, onReorder, moving, surface, columns, children, className }: ListProps) {
  const tx = useWords(ownWords);
  const cols = columns && columns > 1 ? Math.min(4, Math.round(columns)) : 0;
  const box = useRef<HTMLDivElement>(null), refocus = useRef(-1), how = useUid('sk-list') + '-how';
  const [drag, setDrag] = useState<ListDrag | null>(null);
  const reorder = !!(onReorder || moving);
  const grips = () => (box.current ? Array.from(box.current.querySelectorAll<HTMLElement>('.sk-listrow__grip')) : []);
  /* A row moved by its keys keeps focus on its grip at its new place */
  useEffect(() => {
    if (refocus.current < 0) return;
    const g = grips()[refocus.current];
    refocus.current = -1;
    if (g) g.focus();
  });
  const ctx: ListReorder | null = reorder ? {
    how, live: !!onReorder, grips, drag, setDrag,
    mv: drag || (moving ? { from: moving.from, slot: moving.to > moving.from ? moving.to + 1 : moving.to } : null),
    move: (from, to, name) => {
      const n = grips().length;
      if (!onReorder || to < 0 || to >= n || to === from) return;
      refocus.current = to;
      onReorder(from, to);
      announce(tx('rowMoved', { name, n: to + 1, total: n }));
    },
    slotAt: (y) => {
      const g = grips();
      for (let i = 0; i < g.length; i++) {
        const r = g[i].closest('.sk-listrow')!.getBoundingClientRect();
        if (y < r.top + r.height / 2) return i;
      }
      return g.length;
    },
  } : null;
  const list = (
    <div ref={box} className={cx('sk-list', surface && 'sk-list--surface', cols && 'sk-list--columns sk-list--cols-' + cols, reorder && 'is-reorderable', drag && 'is-dragging', className)}
      style={cols ? { '--list-columns': cols } as CSSProperties : undefined} role="list" aria-label={label}>
      {children}
      {reorder && <span id={how} className="sk-sr">{tx('rowMoveHelp')}</span>}
    </div>
  );
  return ctx ? <ListReorderContext.Provider value={ctx}>{list}</ListReorderContext.Provider> : list;
}
