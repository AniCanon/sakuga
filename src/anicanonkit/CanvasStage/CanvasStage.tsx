import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cssObj } from '../../internal/css';
import { cx } from '../../internal/cx';
import { ratioOf } from '../../internal/ratio';
import { useDrag, type DragState } from '../../internal/drag';
import { announce } from '../../internal/live';
import { useUid } from '../../internal/uid';
import { useWords, type Words } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../Stages/Stages.css';
import '../Monitor/Monitor.css';
import { usePick, type PickProps } from '../Monitor/pick';
import './CanvasStage.css';

type Box = { x: number; y: number; w: number; h: number };

/** The canvas with one item selected: `box` in percent of the frame, may run past its edges. */
export interface CanvasStageProps extends PickProps {
  /** The selected item's picture. */
  image?: string;
  /** CSS for the picture inside its box, e.g. from `Sakuga.cropStyle`. */
  imageStyle?: string;
  /** Names the item's picture; decorative without it. */
  alt?: string;
  /** The item's place and size, in percent of the frame; past the frame's edges it shows dimmed. */
  box?: Box;
  /** The frame's shape (default `16 / 9`): 16 / 9, '9 / 16' or '16:9'. */
  ratio?: number | string;
  /** The stage's height in px. */
  height?: number;
  /** Takes the column's height instead of `height`: the frame of `ratio` as large as fits and centred, exactly as a Monitor with the same
      `ratio` draws it. */
  fill?: boolean;
  /** Names the item for screen readers, and the box when it can be moved. */
  label?: string;
  /** As on Monitor: title-safe or an effect's area, in percent of the frame; accent for the selected one. */
  guides?: { x: number; y: number; w: number; h: number; accent?: boolean }[];
  /** As on Monitor: the area an edit works on, with its label. */
  region?: { x: number; y: number; w: number; h: number; label?: string };
  /** Drawn over the picture in the frame's box: position in percent of the frame. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
  /** Makes the box one Tab stop: arrows move it a percent, Shift and an arrow resize it. Called with the new box. */
  onBox?: (box: Box) => void;
}

interface BoxDrag extends DragState { edge: string; box: Box; rect: DOMRect; last?: Box }

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
function boxText(b: Box, tx: Words) { return tx('boxAt', { x: b.x, y: b.y, w: b.w, h: b.h }); }

/* The canvas with one item selected: the frame, the item at its size and place (past the frame it shows dimmed), and a box with eight handles to drag.
   With onBox the box is one Tab stop: arrows move it a percent, Shift and an arrow resize it from its right or bottom edge. The handles are for the pointer. */
/**
 * CanvasStage is the editor's canvas while an item on it is selected: the frame, the item at its size and place, and a box with
 * eight handles to move and resize it.
 *
 * Not for the picture while nothing is selected (`Monitor`); a page's frames and selection in manga (`MangaPage`).
 *
 * Accessibility: The selection is a group named by `label` (default "Selected item") and described by its position and size.
 * With `onBox` it is an application (a "movable item"), so a screen reader in browse mode hands it the arrows, and one Tab
 * stop: arrows move it a percent and Shift with an arrow resizes it from its right or bottom edge, each change said aloud. The
 * handles are for the pointer, dragged to resize, and are hidden; dragging the box moves it as the arrows do. With `onPick`,
 * Escape on the selected box clears the selection; a click on the box that was not a drag takes the pick beneath it, and a click
 * on its dimmed part past the frame does nothing.
 *
 * @version 1.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CanvasStage(props: CanvasStageProps) {
  const { image, imageStyle, alt, box, ratio, height, fill, label, guides, region, children, className, onBox } = props;
  const tx = useWords(ownWords);
  const b = box || { x: 0, y: 0, w: 100, h: 100 }, about = useUid('sk-stage') + '-about', frame = useRef<HTMLDivElement>(null), dragged = useRef(false);
  /* A drag of the box is not a click; nor is a click on its dimmed part past the frame */
  const pick = usePick(props, frame, (e) => {
    if (dragged.current) return true;
    if (!(e.target as Element).closest('.sk-stage__sel')) return false;
    const r = frame.current!.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  });
  /* The box moves with the pointer; a handle resizes from its own edge or corner. Never smaller than 1% either way. */
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const pull = useDrag({
    can: () => !!onBox,
    start: (d) => {
      const s = d as BoxDrag, hd = (s.target as Element).closest('.sk-stage__h');
      s.edge = hd ? hd.className.replace(/.*is-(\w+).*/, '$1') : ''; s.box = b; s.rect = frame.current!.getBoundingClientRect();
    },
    move: (e, d) => {
      const s = d as BoxDrag;
      dragged.current = true;
      const dx = (e.clientX - s.x) / s.rect.width * 100, dy = (e.clientY - s.y) / s.rect.height * 100, o = s.box, n = { x: o.x, y: o.y, w: o.w, h: o.h };
      if (!s.edge) { n.x = o.x + dx; n.y = o.y + dy; }
      if (s.edge.indexOf('e') >= 0) n.w = Math.max(1, o.w + dx);
      if (s.edge.indexOf('s') >= 0) n.h = Math.max(1, o.h + dy);
      if (s.edge.indexOf('w') >= 0) { n.w = Math.max(1, o.w - dx); n.x = o.x + o.w - n.w; }
      if (s.edge.indexOf('n') >= 0) { n.h = Math.max(1, o.h - dy); n.y = o.y + o.h - n.h; }
      s.last = { x: r1(n.x), y: r1(n.y), w: r1(n.w), h: r1(n.h) };
      onBox!(s.last);
    },
    end: (_, d) => { const s = d as BoxDrag; if (s.last) announce(boxText(s.last, tx)); },
  });
  const pos = { left: b.x + '%', top: b.y + '%', width: b.w + '%', height: b.h + '%' };
  function keys(e: KeyboardEvent) {
    if (e.key === 'Escape' && props.onPick) { e.preventDefault(); props.onPick(null); return; }
    const d = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, number[]>)[e.key];
    if (!d) return;
    e.preventDefault();
    const r = (n: number) => Math.round(n * 10) / 10;
    const next = e.shiftKey ? { x: b.x, y: b.y, w: Math.max(1, r(b.w + d[0])), h: Math.max(1, r(b.h + d[1])) } : { x: r(b.x + d[0]), y: r(b.y + d[1]), w: b.w, h: b.h };
    onBox!(next);
    announce(boxText(next, tx));
  }
  const shape = ratioOf(ratio || '16 / 9');
  /* A fill stage whose item reaches past the frame (a punch-in) scales the frame just enough for the whole box and its handles, offset to
     centre it; inside the frame it is exactly the monitor's frame */
  const oL = Math.max(0, -b.x), oR = Math.max(0, b.x + b.w - 100), oT = Math.max(0, -b.y), oB = Math.max(0, b.y + b.h - 100), past = oL + oR + oT + oB > 0;
  const fit = 100 / Math.max(100 + oL + oR, 100 + oT + oB);
  const style: CSSProperties & Record<`--${string}`, string | number> = fill
    ? { '--stage-ratio': shape, '--stage-fit': fit, '--stage-shift-x': (oL - oR) / 2 + '%', '--stage-shift-y': (oT - oB) / 2 + '%' }
    : { '--stage-ratio': shape, height: height || 392 };
  return (
    <div className={cx('sk-stage', fill && 'is-fill', fill && past && 'is-past', className)} style={style}
      {...pick.handlers} {...(pick.handlers ? { onPointerDownCapture: () => { dragged.current = false; } } : null)}>
      <div ref={frame} className="sk-stage__frame" style={{ aspectRatio: shape }}>
        <div className="sk-stage__item" style={pos}>{image && <img src={image} alt={alt || ''} style={cssObj(imageStyle)} />}</div>
        <div className="sk-stage__mask" aria-hidden="true" />
        {pick.mark}
        <div
          className={cx('sk-stage__sel', onBox && 'is-movable', pull.dragging && 'is-dragging')} style={pos} role={onBox ? 'application' : 'group'} aria-roledescription={onBox ? tx('movableItem') : undefined} aria-label={label || tx('selectedItem')} aria-describedby={about}
          {...(onBox ? { tabIndex: 0, onKeyDown: keys, ...pull.handlers } : null)}
        >
          {HANDLES.map((k) => <span key={k} className={'sk-stage__h is-' + k} aria-hidden="true" />)}
        </div>
        <span id={about} className="sk-sr">{boxText(b, tx) + (onBox ? '. ' + tx('boxKeys') : '')}</span>
        {/* Over the picture, in the frame's box: guides and the region as on Monitor, then the page's own children */}
        {(guides || []).map((g, i) => <span key={'g' + i} className={cx('sk-monitor__guide', g.accent && 'is-accent')} style={{ left: g.x + '%', top: g.y + '%', width: g.w + '%', height: g.h + '%' }} aria-hidden="true" />)}
        {region && <span className="sk-monitor__region" style={{ left: region.x + '%', top: region.y + '%', width: region.w + '%', height: region.h + '%' }}>{region.label && <b>{region.label}</b>}</span>}
        {children}
      </div>
    </div>
  );
}
