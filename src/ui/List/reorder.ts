import { createContext } from 'react';

/** A row being moved: its index, the slot it would land in (0 to the row count), and its name. */
export interface ListDrag { from: number; slot: number; name: string }

/** What a reorderable List hands its rows through context: a row finds its own place among the grips, so a row wrapped in
 *  anything (a board's host, an app's own component) still reorders. */
export interface ListReorder {
  /** The id of the words that say how to move a row. */
  how: string;
  /** False on a board's still frame (only `moving`): the grips draw but don't move. */
  live: boolean;
  grips: () => HTMLElement[];
  drag: ListDrag | null;
  setDrag: (d: ListDrag | null) => void;
  /** The move drawn: a live drag, or `moving` on a board. */
  mv: { from: number; slot: number } | null;
  move: (from: number, to: number, name: string) => void;
  /** The slot under the pointer: before the first row whose middle is below it, or after the last. */
  slotAt: (y: number) => number;
}

export const ListReorderContext = createContext<ListReorder | null>(null);
