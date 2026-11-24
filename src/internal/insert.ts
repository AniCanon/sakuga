import type { DragEvent, KeyboardEvent, MouseEvent } from 'react';

/** What a card or row carries onto a Timeline with onDrop: the track kind it lands on and its length in seconds. */
export interface InsertData {
  kind?: string;
  length?: number;
  label?: string;
  [key: string]: unknown;
}

/* What is being dragged from a card onto the timeline: drag events cannot read their data until the drop, so the timeline reads its
   kind and length here to draw where it lands */
let dragged: InsertData | null = null;

export function draggedItem(): InsertData | null {
  return dragged;
}

export function takeDragged(): InsertData | null {
  const d = dragged;
  dragged = null;
  return d;
}

/* Shared by Thumb and ListRow when they add themselves: a double-click or Enter inserts at the playhead; the item drags onto a
   Timeline with onDrop */
export function insertProps(o: { onInsert?: () => void; dragData?: InsertData }, name: string, help: string) {
  const go = () => { if (o.onInsert) o.onInsert(); };
  const onButton = (e: { target: EventTarget }) => !!(e.target as Element).closest('.sk-ins__btn,.sk-listrow__action');
  return {
    'aria-describedby': o.onInsert ? help : undefined,
    onDoubleClick: o.onInsert ? (e: MouseEvent) => { if (!onButton(e)) go(); } : undefined,
    onKeyDown: o.onInsert ? (e: KeyboardEvent) => { if (e.key === 'Enter' && !onButton(e)) { e.preventDefault(); go(); } } : undefined,
    draggable: o.dragData ? true : undefined,
    onDragStart: o.dragData ? (e: DragEvent) => {
      dragged = Object.assign({ label: name }, o.dragData);
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/x-sakuga-insert', JSON.stringify(dragged));
      e.dataTransfer.setData('text/plain', name);
    } : undefined,
    onDragEnd: o.dragData ? () => { dragged = null; } : undefined,
  };
}
