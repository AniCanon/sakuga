import { useState, type MouseEvent, type PointerEvent, type RefObject } from 'react';
import { cx } from '../../internal/cx';

type Box = { x: number; y: number; w: number; h: number };

/** An item under the playhead a click on the picture selects, with its box in percent of the frame. */
export interface Pick {
  id: string;
  label: string;
  box: Box;
  /** A double-click edits it (a title's words) through onEdit. */
  editable?: boolean;
}

/** What Monitor and CanvasStage take to make their picture clickable. */
export interface PickProps {
  /** The items under the playhead a click on the picture selects, topmost first, each with its box in percent of the frame. */
  picks?: Pick[];
  /** The selected pick's id. */
  selected?: string | null;
  /** Called with the pick a click takes, or null for none. */
  onPick?: (id: string | null) => void;
  /** Called on a double-click on an editable pick. */
  onEdit?: (id: string) => void;
}

/* What was selected before a click, kept past the Monitor and CanvasStage swapping on that click, for a double-click's second click */
const PICKED: { was: string | null | undefined; at: number } = { was: undefined, at: 0 };

/* Picking on the picture, as editors do on their program monitor: a click takes the topmost pick under the pointer, or the one beneath
   when the selected one is there (round to the top again), a click where none is clears the selection, and the second click of a
   double-click edits an editable one (its first click may have swapped the Monitor for a CanvasStage). The pointer only: the timeline
   selects by keyboard. Hover outlines what a click would take. `skip` lets a CanvasStage keep its box's drag. */
export function usePick(props: PickProps, frame: RefObject<HTMLElement | null>, skip?: (e: MouseEvent<HTMLElement>) => boolean) {
  const [hover, setHover] = useState<string | null>(null);
  const { picks, onPick, onEdit } = props, sel = props.selected;
  if (!picks || !onPick) return { handlers: null, mark: null };
  const under = (e: { clientX: number; clientY: number }): Pick[] => {
    const r = frame.current!.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
    /* Only in the frame: the ground around it is empty, even where a punched-in picture runs past it */
    if (x < 0 || x > 100 || y < 0 || y > 100) return [];
    return picks.filter(({ box: b }) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  };
  const take = (s: Pick[]): Pick | null => {
    const k = s.map((p) => p.id).indexOf(sel as string);
    return k < 0 ? s[0] || null : s.length > 1 ? s[(k + 1) % s.length] : null;
  };
  const shown = hover ? picks.find((p) => p.id === hover) : undefined;
  const handlers = {
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.buttons) return;
      const n = take(under(e)), id = n ? n.id : null;
      if (id !== hover) setHover(id);
    },
    onPointerLeave: () => { if (hover) setHover(null); },
    onClick: (e: MouseEvent<HTMLElement>) => {
      if (skip && skip(e)) return;
      const s = under(e);
      /* The double-click's first click may have taken the one beneath: the edit goes to the one selected before it, when it is here */
      if (e.detail === 2) {
        const was = PICKED.at > Date.now() - 800 ? PICKED.was : undefined;
        const back = was !== undefined ? s.find((p) => p.id === was) : undefined, cur = back || s.find((p) => p.id === sel) || s[0];
        PICKED.at = 0;
        if (back && back.id !== sel) onPick(back.id);
        if (cur && cur.editable && onEdit) onEdit(cur.id);
        return;
      }
      if (e.detail > 2) return;
      if (!s.length) { setHover(null); if (sel !== undefined && sel !== null) onPick(null); return; }
      const n = take(s);
      setHover(null); PICKED.was = sel; PICKED.at = Date.now();
      if (n && n.id !== sel) onPick(n.id);
    },
  };
  /* Outlined where it shows: a punched-in picture's box runs past the frame, its outline is the frame's edge. Its name above it, clear
     of the frame's corner labels; inside its foot when it reaches the frame's top */
  let mark = null;
  if (shown && shown.id !== sel) {
    const o = shown.box, x0 = Math.max(0, o.x), y0 = Math.max(0, o.y), x1 = Math.min(100, o.x + o.w), y1 = Math.min(100, o.y + o.h);
    mark = (
      <span className={cx('sk-pick', y0 < 12 && 'is-low')} aria-hidden="true" style={{ left: x0 + '%', top: y0 + '%', width: (x1 - x0) + '%', height: (y1 - y0) + '%' }}>
        <b>{shown.label}</b>
      </span>
    );
  }
  return { handlers, mark };
}
