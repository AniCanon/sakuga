import { useRef, useState, type CSSProperties, type FocusEvent, type MouseEventHandler, type ReactNode } from 'react';
import { cssObj } from '../../internal/css';
import { cx } from '../../internal/cx';
import { lightAt, lightLayer, lightRest } from '../../internal/light';
import { slots } from '../../internal/slots';
import { insertProps, type InsertData } from '../../internal/insert';
import { useLoader } from '../../internal/loader';
import { useUid } from '../../internal/uid';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { Icon, type IconName } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import '../../base.css';
import './Thumb.css';

export interface ThumbProps {
  /** Caption under the picture. */
  title?: string;
  /** Adds it to the cut: Insert on the card (on hover, focus and when selected), a double-click or Enter inserts at the playhead. */
  onInsert?: () => void;
  /** Makes the card drag onto a Timeline with onDrop: `kind` is the track kind it lands on, `length` in seconds draws where it lands.
      Handed back to onDrop. */
  dragData?: InsertData;
  /** A quiet line under the title. */
  meta?: string;
  /** A frame not made yet, naming what will fill it. */
  placeholder?: string;
  /** With placeholder: its picture is being made; the app's loader at the frame's centre, the words under it. */
  drawing?: boolean;
  /** With placeholder: a silhouette above the words, on the canvas colour: the character's age figure (age-adult, anthro-age-*, creature-age-*), never a body-* build. */
  placeholderIcon?: IconName;
  /** The frame's corner: none, md, lg, xl or full; the small corner (radius-xs) without it. */
  radius?: 'none' | 'md' | 'lg' | 'xl' | 'full';
  /** contain: the whole picture, e.g. a sheet. */
  fit?: 'cover' | 'contain';
  /** The white a character sheet is drawn on. */
  paper?: boolean;
  /** Kept so older pages still work: every picture already develops in once as it arrives. */
  develop?: boolean;
  /** The picture. */
  image?: string;
  /** CSS, e.g. "object-position:30% 40%". */
  imageStyle?: string;
  /** The picture's baked light map: it glows with its own highlights under the pointer (light on art). Never on muted. */
  lightMap?: string;
  /** On wherever there is a lightMap; false turns it off (a poster the moment its video plays). */
  light?: boolean;
  /** A cut-out laid over the picture (a character on a place). */
  figure?: string;
  /** CSS placing the cut-out. */
  figureStyle?: string;
  /** The frame's width, in px or CSS. */
  width?: number | string;
  /** The frame's height, in px or CSS. */
  height?: number | string;
  /** The frame's aspect ratio, as CSS ("16 / 9"), when it takes its width from its column. */
  ratio?: string;
  /** Rings the frame: the one chosen; with `onClick` it reads pressed. */
  selected?: boolean;
  /** Greys a rejected take. */
  muted?: boolean;
  /** Names the picture; decorative without it. */
  alt?: string;
  /** Makes it a toggle button; aria-pressed follows selected. */
  onClick?: MouseEventHandler;
  /** The button's name when the picture's alt does not say it; with href, the link's name when the title does not say it. */
  label?: string;
  /** A picture card that opens what it shows: the title is the link and its hit area covers the card. Never with onClick. */
  href?: string;
  /** An action of its own (or slot="action"): outside the link with href; with only a title, over the frame's top corner on a media disc (a frame's Remove). */
  action?: ReactNode;
  /** Drawn over the picture: a Badge, a play mark. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

function ThumbFrame(props: ThumbProps) {
  const tx = useWords(ownWords);
  const AppLoader = useLoader();
  const size: CSSProperties = props.width ? { width: props.width, height: props.height } : { width: '100%', aspectRatio: props.ratio || '16 / 9' };
  const button = props.onClick ? { type: 'button' as const, onClick: props.onClick, 'aria-pressed': props.selected ? 'true' as const : 'false' as const, 'aria-label': props.label && props.label + (props.muted ? ', ' + tx('rejected') : '') } : null;
  const words = [!button && props.selected && tx('selected'), props.muted && !(button && props.label) && tx('rejected')].filter(Boolean).join(', ');
  const empty = !props.image && props.placeholder !== undefined, crop = cssObj(props.imageStyle);
  /* A new picture develops in over the one it replaces; the old one stays under it until the new one has loaded and arrived */
  const was = useRef<{ now?: string; prev: string | null }>({ now: props.image, prev: null });
  const [loaded, setLoaded] = useState<string | null>(null), redraw = useState(0)[1];
  if (props.image !== was.current.now) was.current = { now: props.image, prev: was.current.now || null };
  const prev = props.image ? was.current.prev : null, waiting = !!prev && loaded !== props.image;
  const arrived = prev ? () => { was.current = { now: props.image, prev: null }; redraw((n) => n + 1); } : undefined;
  const lit = props.light !== false && !!props.lightMap && !!props.image && !props.muted;
  const light = lit ? { onPointerEnter: lightAt, onPointerMove: lightAt, onFocus: button ? (e: FocusEvent<HTMLElement>) => lightRest(e.currentTarget) : undefined } : null;
  const Tag = button ? 'button' : 'span';
  return (
    <Tag
      className={cx('sk-thumb', props.selected && 'is-selected', props.muted && 'is-muted', empty && 'is-placeholder', empty && props.drawing && 'is-drawing', props.radius && 'is-radius-' + props.radius,
        props.fit === 'contain' && 'is-contain', props.paper && 'is-paper', lit && 'has-light', props.className)}
      style={size}
      {...light}
      {...button}
    >
      <span className="sk-clip">
        {empty && props.placeholderIcon && <span className="sk-thumb__silhouette" aria-hidden="true"><Icon name={props.placeholderIcon} size="100%" /></span>}
        {empty && props.drawing && <AppLoader key="drawing" size="var(--thumb-drawing-loader-size)" label={props.placeholder || tx('loading')} />}
        {empty && props.placeholder && <span className="sk-thumb__placeholder" aria-hidden={props.drawing ? 'true' : undefined}>{props.placeholder}</span>}
        {prev && <img key={'was:' + prev} src={prev} alt="" className="sk-thumb__was" style={crop} />}
        {props.image && (
          <img key={props.image} src={props.image} alt={props.alt || ''} className={cx(waiting && 'is-waiting')} style={crop}
            onLoad={prev ? () => setLoaded(props.image!) : undefined} onAnimationEnd={prev && !waiting ? arrived : undefined} />
        )}
        {lit && lightLayer(props.lightMap!, crop)}
        {props.figure && <img className="sk-thumb__figure" src={props.figure} alt="" style={cssObj(props.figureStyle)} />}
        {props.children}
      </span>
      {words && <span className="sk-sr">{words}</span>}
    </Tag>
  );
}

/* A picture in a frame; with title or meta it becomes a figure with its caption under it */
/**
 * Thumb is a picture in a frame: cover-cropped, 6 px corners, `selected` adds the accent ring, `muted` greys a rejected take.
 * Give it `width` and `height`, or leave them out for a full-width 16:9 frame (`ratio` changes it). A character's portrait is
 * `ratio="9 / 16"`, standing on white seamless; a creature's is `16 / 9`. Never a portrait in another ratio: the frame would
 * crop its head or feet.
 *
 * Not for an episode, short or manga issue a viewer opens (`MediaCard`); a person's portrait with their name and role
 * (`CastAvatar`); a manga page at its trim (`MangaPage`); one look on white with its occasion (`LookPlate`); the place or
 * backdrop being made, on the left of its flow (`PlaceCard`); a whole page or list with nothing in it yet (`EmptyState`); a
 * character on the cast page (`CastCard`).
 *
 * Accessibility: With `onInsert`, Enter or a double-click inserts (the item is described "Enter or a double-click inserts it
 * at the playhead; drag it onto the timeline to place it") and Insert is its own button named "Insert" and the name. A picture
 * whose alt is `alt` (empty, so hidden, by default), with "selected" and "rejected" (`muted`) said after it, and with `title`
 * or `meta` a figure captioned by them. With `onClick` it is a toggle button that Tab reaches and Enter or Space presses,
 * "pressed" when `selected`: name it with `label` (or `alt`), since without one it has no name. With `href` its title is a
 * link named by the title (or `label`), the meta read after it, and its action a separate control after the link. Without
 * `href` an action is a separate control after the frame, before its caption. In forced colours a selected frame keeps its
 * ring, in Highlight.
 *
 * @version 1.6
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Thumb(props: ThumbProps) {
  if (props.onInsert || props.dragData) return <InsertThumb {...props} />;
  if (props.href) {
    const sl = slots(props.children), act = sl.get('action') || props.action || null;
    return (
      <div className={cx('sk-thumblink', props.className)}>
        <ThumbFrame {...props} title={undefined} meta={undefined} href={undefined} action={undefined} onClick={undefined} className={undefined} children={sl.main.length ? sl.main : undefined} />
        <div className="sk-thumblink__cap">
          <span className="sk-thumblink__words">
            <a className="sk-thumblink__a" href={props.href} aria-label={props.label}><b>{props.title || props.alt || props.label}</b></a>
            {props.meta && <span>{props.meta}</span>}
          </span>
          {act && <span className="sk-thumblink__action">{act}</span>}
        </div>
      </div>
    );
  }
  const bare = !props.title && !props.meta;
  const fs = slots(props.children), fact = bare ? null : fs.get('action') || props.action || null;
  const t = <ThumbFrame {...props} title={undefined} meta={undefined} action={undefined} children={fact ? (fs.main.length ? fs.main : undefined) : props.children} className={bare ? props.className : undefined} />;
  if (bare) return t;
  /* The action comes after the frame, never inside its button, so a press on the picture still does what onClick says */
  return (
    <figure className={cx('sk-thumbfig', props.className)}>
      {fact ? <div className="sk-thumbfig__frame">{t}<span className="sk-thumbfig__action">{fact}</span></div> : t}
      <figcaption>{props.title && <b>{props.title}</b>}{props.meta && <span>{props.meta}</span>}</figcaption>
    </figure>
  );
}

/* A card that adds itself: Insert on the card (shown on hover, focus and when selected), a double-click or Enter inserts at the
   playhead, Space or a press still selects, and it drags onto the timeline. Nothing to scroll to: the card is the way in. */
function InsertThumb(props: ThumbProps) {
  const tx = useWords(ownWords), name = props.title || props.label || '', help = useUid('sk-ins') + '-help';
  const go = () => { if (props.onInsert) props.onInsert(); };
  const frame = <ThumbFrame {...props} title={undefined} meta={undefined} onInsert={undefined} dragData={undefined} className={undefined}
    onClick={props.onClick || (() => {})} label={props.label || name} />;
  return (
    <figure className={cx('sk-thumbfig', 'has-insert', props.className)}>
      <div className="sk-thumbfig__frame sk-ins" {...insertProps(props, name, help)}>
        {frame}
        {props.onInsert && <span className="sk-ins__btn"><IconButton variant="media" icon="plus" onClick={go} label={tx('insertName', { name })} /></span>}
        {props.onInsert && <span id={help} className="sk-sr">{tx('insertHelp')}</span>}
      </div>
      {(props.title || props.meta) && <figcaption>{props.title && <b>{props.title}</b>}{props.meta && <span>{props.meta}</span>}</figcaption>}
    </figure>
  );
}
