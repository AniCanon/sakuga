import { useContext, useLayoutEffect, useRef, useState, type FocusEvent, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { insertProps, type InsertData } from '../../internal/insert';
import { lightRest } from '../../internal/light';
import { pressProps } from '../../internal/press';
import { slots } from '../../internal/slots';
import { textOf } from '../../internal/text';
import { Checkbox } from '../Checkbox/Checkbox';
import { Icon, type IconName } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { ListReorderContext } from '../List/reorder';
import { Thumb } from '../Thumb/Thumb';
import { useUid } from '../../internal/uid';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './ListRow.css';

export interface ListRowProps {
  /** The row's title. */
  title: ReactNode;
  /** Adds it to the cut, as on Thumb: Insert at the row's end (on hover, focus and when selected), a double-click or Enter inserts at the
      playhead. */
  onInsert?: () => void;
  /** As on Thumb: the row drags onto a Timeline with onDrop. */
  dragData?: InsertData;
  /** Internal: the row InsertRow draws inside itself. */
  insertInner?: boolean;
  /** The quiet line under it. */
  sub?: ReactNode;
  /** An icon before the words. */
  icon?: IconName;
  /** A picture before the words, as a Thumb. */
  image?: string;
  /** CSS for the picture in its frame. */
  imageStyle?: string;
  /** The picture's width in px (default 64). */
  imageWidth?: number;
  /** The picture's height in px (default 36). */
  imageHeight?: number;
  /** The image's baked light map, passed to its Thumb (light on art); a linked row under keyboard focus lights it at the centre. */
  lightMap?: string;
  /** Passed to its Thumb: on wherever there is a `lightMap`; false turns it off. */
  light?: boolean;
  /** Greys the row's picture. */
  muted?: boolean;
  /** A leading column, e.g. a timecode. */
  meta?: string;
  /** Marks the current row (the one open). */
  selected?: boolean;
  /** The quiet line waits for you: text colour with the accent dot. Slots: slot="lead" (in place of icon or image), slot="main" (in place of title and sub). */
  attention?: boolean;
  /** More room, for settings lists. */
  loose?: boolean;
  /** Bulk selection: a Checkbox named "Select" and the title, beside the link on a linked row. Not `selected`, which marks the current row. */
  checked?: boolean;
  /** Called with the box's new value. */
  onCheck?: (checked: boolean) => void;
  /** Names the row's box ("Select …") when the title is markup; a text title names it by default. */
  label?: string;
  /** Names the row link when its words don't say where it goes ("Continue Episode 2"); it replaces what the link reads. */
  linkLabel?: string;
  /** An action of its own beside the link (Publish), its own Tab stop; also slot="action". A row that adds itself keeps it after
      Insert (a take's More, with Use and Reject), and a double-click or Enter on it never inserts the row. */
  action?: ReactNode;
  /** A trailing chevron: the row opens something. */
  chevron?: boolean;
  /** Makes the row a link to where it opens. */
  href?: string;
  /** With href, for client-side navigation. */
  onClick?: MouseEventHandler;
  /** What sits at the end: a switch, a button. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * ListRow is one row of a `List`: a title and a quiet line under it, with an optional `icon` or `image` before it, a `meta`
 * column (a timecode) and whatever sits at the end (a switch, a button, a check). `selected` marks the current row the way
 * every list and nav does: its title in ink weight with the small `state-dot` beside it, no fill and no edge; `href` makes it a
 * link; `loose` gives it more room (settings lists).
 *
 * Not for a quiet action inside a line of text (`TextLink`); a row on Story with a picture, a state and the work that told it
 * (`EntityRow`); each kind of setting with its value, opening the full choice (`PropertyList`); measured facts, a name and its
 * value (`FactList`); a cut on an ekonte sheet (`CutRow`).
 *
 * In a `List` with `onReorder` the row gets a grip at its start (see `List`).
 *
 * Accessibility: With `onInsert`, Enter or a double-click inserts (the item is described "Enter or a double-click inserts it
 * at the playhead; drag it onto the timeline to place it") and Insert is its own button named "Insert" and the name, followed
 * by the row's `action` when it has one. Inside
 * List (a list named by its `label`) each row is a list item read as its title, quiet line, `meta` and what sits at the end,
 * marked "current" when `selected` and "waiting for you" with `attention`; with `checked` or `onCheck` its box comes first, a
 * checkbox named "Select" and the title (`label` names it when the title is markup); pictures, icons and the chevron are
 * hidden. With `href` the row is a link, with only `onClick` a link-role row, and either way Tab reaches it and Enter follows
 * it. An action beside the link is the next Tab stop, with its own ring; `linkLabel`, when set, is the link's name.
 *
 * @version 1.6
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ListRow(props: ListRowProps) {
  if ((props.onInsert || props.dragData) && !props.insertInner) return <InsertRow {...props} />;
  const tx = useWords(ownWords);
  const sl = slots(props.children);
  const grip = useGrip(props);
  const lead = sl.get('lead') ? <span key="l" className="sk-listrow__lead">{sl.get('lead')}</span>
    : props.image ? <Thumb key="l" image={props.image} imageStyle={props.imageStyle} width={props.imageWidth || 64} height={props.imageHeight || 36} muted={props.muted} lightMap={props.lightMap} light={props.light} />
    : props.icon ? <span key="l" className="sk-listrow__icon"><Icon name={props.icon} size="var(--list-row-icon-size)" /></span> : null;
  /* A pressable row under keyboard focus lights its picture at the centre, as a focused MediaCard does */
  const rest = (props.href || props.onClick) && props.lightMap ? (e: FocusEvent<HTMLElement>) => { lightRest(e.currentTarget.querySelector<HTMLElement>('.sk-thumb.has-light')); } : undefined;
  /* A row that goes somewhere keeps its link role: the list item is a wrapper that takes no box (sk-contents) */
  const press = !props.href && props.onClick ? pressProps(props.onClick as (e: unknown) => void, 'link') : null, wrap = props.href || press;
  /* Bulk selection: a box named for the row. On a linked row it sits beside the link, never inside it */
  const pick = props.onCheck || props.checked !== undefined ? <Checkbox key="c" label={tx('selectItem', { name: props.label || (typeof props.title === 'string' || typeof props.title === 'number' ? props.title : textOf(props.title)) })} checked={!!props.checked} onChange={props.onCheck} /> : null;
  /* An action of its own (Publish on a ready draft): on a linked row it sits beside the link as its own Tab stop, never inside it */
  const act = sl.get('action') || props.action || null;
  const side = wrap && act ? <span key="a" className="sk-listrow__action">{act}</span> : null;
  const Tag = props.href ? 'a' : 'div';
  const row = (
    <Tag className={cx('sk-listrow', grip.lifted && 'is-lifted', props.selected && 'is-selected', props.checked && 'is-checked', props.loose && 'is-loose', props.className)} role={wrap ? undefined : 'listitem'} href={props.href} onClick={props.onClick} onFocus={rest} aria-label={wrap ? props.linkLabel : undefined} aria-current={props.selected ? 'true' : undefined} {...press}>
      {grip.el}
      {grip.drop}
      {!wrap && pick}
      {props.meta && <small className="sk-listrow__meta">{props.meta}</small>}
      {lead}
      {sl.get('main') ? <span className="sk-listrow__main">{sl.get('main')}</span> : (
        <span className="sk-listrow__text">
          <b>{props.title}</b>
          {props.sub && <small className={props.attention ? 'is-attention' : undefined}>{props.sub}</small>}
          {props.attention && <span className="sk-sr">{', ' + tx('waitingForYou')}</span>}
        </span>
      )}
      {(sl.body || (!wrap && act)) && <span className="sk-listrow__end">{sl.body}{!wrap && act}</span>}
      {props.chevron && <Icon name="chevron-down" size="var(--list-row-chevron-icon-size)" className="sk-listrow__chev" />}
    </Tag>
  );
  return wrap && !props.insertInner ? <div role="listitem" className={pick || side ? 'sk-listrow-pick' : 'sk-contents'}>{pick}{row}{side}</div> : row;
}

/* A row that adds itself, as InsertThumb: Insert at its end, a double-click or Enter inserts at the playhead, and it drags onto the timeline */
function InsertRow(props: ListRowProps) {
  const tx = useWords(ownWords), help = useUid('sk-ins') + '-help';
  const name = props.label || (typeof props.title === 'string' ? props.title : textOf(props.title));
  const act = slots(props.children).get('action') || props.action || null;
  return (
    <div role="listitem" className={cx('sk-ins', 'sk-ins--row', act && 'has-action', props.className)} {...insertProps(props, name, help)}>
      <ListRow {...props} insertInner onInsert={undefined} dragData={undefined} action={undefined} onClick={props.onClick || (() => {})} label={name} />
      {props.onInsert && <span className="sk-ins__btn"><IconButton variant="plain" icon="plus" onClick={props.onInsert} label={tx('insertName', { name })} /></span>}
      {/* Its own Tab stop after Insert; dragging from it never drags the row */}
      {act && <span className="sk-listrow__action" draggable={false} onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}>{act}</span>}
      {props.onInsert && <span id={help} className="sk-sr">{tx('insertHelp')}</span>}
    </div>
  );
}

/* In a reorderable List: a grip that drags the row or moves it with Up and Down, and the line where a dragged row lands */
function useGrip(props: ListRowProps) {
  const tx = useWords(ownWords);
  const ro = useContext(ListReorderContext), gref = useRef<HTMLSpanElement>(null);
  const [place, setPlace] = useState({ i: -1, n: 0 });
  useLayoutEffect(() => {
    if (!ro || !gref.current) return;
    const host = gref.current.closest('.sk-list'), all = host ? Array.from(host.querySelectorAll('.sk-listrow__grip')) : [], i = all.indexOf(gref.current);
    if (i !== place.i || all.length !== place.n) setPlace({ i, n: all.length });
  });
  if (!ro) return { el: null, drop: null, lifted: false };
  const { i, n } = place, mv = ro.mv;
  const name = props.label || (typeof props.title === 'string' || typeof props.title === 'number' ? String(props.title) : textOf(props.title));
  const el = (
    <span key="grip" ref={gref} className="sk-listrow__grip" role="button" tabIndex={ro.live ? 0 : -1} aria-label={tx('moveRow', { name, n: i + 1, total: n })} aria-describedby={ro.how}
      aria-keyshortcuts="ArrowUp ArrowDown Alt+ArrowUp Alt+ArrowDown" onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => { if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return; e.preventDefault(); e.stopPropagation(); ro.move(i, i + (e.key === 'ArrowUp' ? -1 : 1), name); }}
      onPointerDown={(e) => { if (!ro.live || e.button > 0) return; e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId); ro.setDrag({ from: i, slot: i, name }); }}
      onPointerMove={(e) => { const d = ro.drag; if (!d || d.from !== i) return; const slot = ro.slotAt(e.clientY); if (slot !== d.slot) ro.setDrag({ from: i, slot, name }); }}
      onPointerUp={() => { const d = ro.drag; if (!d) return; ro.setDrag(null); ro.move(d.from, d.slot > d.from ? d.slot - 1 : d.slot, d.name); }}
      onPointerCancel={() => ro.setDrag(null)} />
  );
  /* A slot that would leave the row where it is draws no line */
  const landing = !!mv && i >= 0 && mv.slot !== mv.from && mv.slot !== mv.from + 1;
  const at = landing && mv!.slot === i ? 'before' : landing && mv!.slot === n && i === n - 1 ? 'after' : null;
  return { el, drop: at && <span key="drop" className={'sk-listrow__drop is-' + at} aria-hidden="true" />, lifted: !!mv && i >= 0 && mv.from === i };
}
