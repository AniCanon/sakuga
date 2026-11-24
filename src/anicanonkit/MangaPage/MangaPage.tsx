import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './MangaPage.css';

type Area = { x: number; y: number; w: number; h: number };

/** Manga: a frame of a page's layout, in percent of the page. Laid out unless drawing or waiting. */
export interface MangaFrame extends Area {
  /** "4.2"; shown with `numbers`. */
  number?: string;
  /** A frame only laid out says nothing; `drawing` and `waiting` say so inside it. */
  state?: 'laid-out' | 'drawing' | 'waiting';
  /** Replaces "Drawing…" or "Waiting". */
  label?: string;
}

/** Manga: one page at its trim ratio (1448 × 2048), its art once drawn or its layout's frames before. With title or meta it becomes a figure with a caption under it. */
export interface MangaPageProps {
  /** The area an edit redraws, in percent. Slot: slot="action" beside the caption. */
  mask?: Area;
  /** Names the masked area for screen readers and its caption. */
  maskLabel?: string;
  /** The page's width in px; its height follows `ratio`. */
  width?: number;
  /** Height over width; defaults to the B5 trim. */
  ratio?: number;
  /** The drawn page. Without it the page shows its `frames` as laid out. */
  image?: string;
  /** The page's frames, in percent of the page, for a page only laid out. */
  frames?: MangaFrame[];
  /** Prints each frame's number (4.2) inside it. */
  numbers?: boolean;
  /** Rings the page: the one open beside the wall or strip. */
  selected?: boolean;
  /** A page not made yet, e.g. the back cover. */
  blank?: boolean;
  /** One item selected on the page, with handles, in percent. */
  selection?: Area;
  /** Names the selected item for screen readers. */
  selectionLabel?: string;
  /** Names the page for screen readers ("Page 4"). */
  label?: string;
  /** Describes the drawn page; decorative without it. */
  alt?: string;
  /** The caption under the page ("Page 4"). */
  title?: string;
  /** A quiet line under the title: its stage in words. */
  meta?: string;
  /** The caption's alignment: the right page of a spread reads from its outer edge. */
  align?: 'end';
  /** Drawn over the page: lettering, an editor's overlay. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Manga: a page as the creator sees it. The picture once drawn; the frames of its layout before, a frame being drawn saying so.
   A selected region keeps its handles while the rest of the page dims; a caption reads under the page. */
const SEL_HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const pct = (b: Area) => ({ left: b.x + '%', top: b.y + '%', width: b.w + '%', height: b.h + '%' });

/**
 * MangaPage draws one page of an issue at its trim (1448 × 2048): its art once drawn, or its layout's frames before.
 *
 * Not for the issue's pages as the reader turns them (`IssueStrip`); every page with its stage at once (`PageWall`); an issue
 * on a shelf (`MediaCard`).
 *
 * Accessibility: Not focusable; read as one image named by `label`, `alt` or `title` (else "Page"), followed by "selected", how
 * many frames are drawing or waiting, the area to redraw (`maskLabel`) and the item selected (`selectionLabel`), and with
 * `title` or `meta` it sits in a figure captioned by them, where the `action` slot takes focus.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MangaPage(props: MangaPageProps) {
  const tx = useWords(ownWords);
  const { mask, maskLabel, image, numbers, selected, blank, selection: s, selectionLabel, label, alt, title, meta, align, children, className } = props;
  const w = props.width || 120, ratio = props.ratio || 2048 / 1448, frames = props.frames || [], sl = slots(children);
  /* One picture to a screen reader, so its name carries what it shows: how many frames are drawing or waiting, whether it is selected,
     and the area an edit redraws or the item under handles */
  const counts: Record<string, number> = {};
  frames.forEach((f) => { if (f.state && f.state !== 'laid-out') counts[f.state] = (counts[f.state] || 0) + 1; });
  const said = [label || alt || title || tx('pageTitle'), selected && tx('selected')].concat(Object.keys(counts).map((k) => k === 'drawing' ? tx('framesDrawing', { count: counts[k] }) : k === 'waiting' ? tx('framesWaiting', { count: counts[k] }) : tx('frames', { count: counts[k] }) + ' ' + k.replace('-', ' ')),
    mask && (maskLabel || tx('redrawMarked')), s && (selectionLabel || tx('itemSelected')));
  const page = (
    <span className={cx('sk-mpage', selected && 'is-selected', blank && 'is-blank', !title && !meta && className)} style={{ width: w, height: Math.round(w * ratio) }} role="img" aria-label={said.filter(Boolean).join(', ')}>
      {image && <img className="sk-mpage__img" src={image} alt="" />}
      {frames.map((f, i) => (
        <span key={i} className={cx('sk-mpage__frame', f.state && 'is-' + f.state)} style={pct(f)}>
          {numbers && f.number && <b>{f.number}</b>}
          {f.state && f.state !== 'laid-out' && w >= 96 && <small>{f.label || (f.state === 'drawing' ? tx('drawingNow') : f.state === 'waiting' ? tx('waiting') : '')}</small>}
        </span>
      ))}
      {mask && <span className="sk-mpage__mask" style={pct(mask)} />}
      {s && (
        <span className="sk-mpage__sel" style={pct(s)}>
          {SEL_HANDLES.map((k) => <span key={k} className={'sk-mpage__h is-' + k} />)}
        </span>
      )}
      {sl.body}
    </span>
  );
  if (!title && !meta) return page;
  return (
    <figure className={cx('sk-mpage-fig', align === 'end' && 'is-end', className)}>
      {page}
      <figcaption className="sk-mpage__cap" style={{ width: w }}>
        <span className="sk-mpage__captext">{title && <b>{title}</b>}{meta && <span>{meta}</span>}</span>
        {sl.get('action')}
      </figcaption>
    </figure>
  );
}
