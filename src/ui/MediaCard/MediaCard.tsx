import { useRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { lightAt, lightLayer, lightRest } from '../../internal/light';
import { tokenPx } from '../../internal/size';
import { Badge } from '../Badge/Badge';
import { Progress } from '../Progress/Progress';
import { textOf } from '../../internal/text';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { MoreWrap, type CardMenu } from '../MoreWrap/MoreWrap';
import '../../base.css';
import '../MoreWrap/MoreWrap.css';
import './MediaCard.css';

export interface MediaCardProps {
  /** Sets the frame ratio: episode 16:9, short 9:16, manga 1:1.414. */
  kind: 'episode' | 'short' | 'manga';
  /** The artwork. Leave it out while there is no picture: the frame draws the AniCanon mark. */
  image?: string;
  /** Names the artwork; decorative without it. */
  alt?: string;
  /** Where the art's subject sits, as CSS object-position, so the crop keeps it. */
  imagePosition?: string;
  /** The art's baked light map: it glows with its own highlights under the pointer, at its centre under keyboard focus (light on art). */
  lightMap?: string;
  /** On wherever there is a lightMap; false turns it off on a surface that must stay still. */
  light?: boolean;
  /** The card's title, under the art. */
  title?: ReactNode;
  /** A quiet line under the title. */
  meta?: ReactNode;
  /** m:ss, shown as a Badge. */
  duration?: string;
  /** A short's view count ("1.2M views"), as a Badge. */
  count?: string;
  /** A Badge over the art (manga pass New). */
  badge?: ReactNode;
  /** The series logo laid over the artwork (Continue watching). */
  logo?: string;
  /** Names the series logo. */
  logoAlt?: string;
  /** 0–1 watched. */
  progress?: number;
  /** The meta line says this one waits for you (takes to review, a plan to approve, ready to publish): it reads in the text colour with the accent dot. */
  attention?: boolean;
  /** Where it opens; without it the card reads as text. */
  href?: string;
  /** The link's name, when its content in order does not say it. */
  label?: string;
  /** The card's width, in px or CSS; a small number px gives a smaller frame. */
  width?: number | string;
  /** Its ⋯ (Rename, Delete): on the picture's top corner, beside the card's link and never inside it, opening a Menu; a short's time moves to the picture's foot. */
  menu?: CardMenu;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * MediaCard shows one episode, short or manga issue: its artwork at its real shape, then a title and a metadata line.
 *
 * Not for a picture in a frame, such as a take or a library item (`Thumb`); an episode or an issue announced but not out yet
 * (`PremiereSlot`); a page of an issue in the editor (`MangaPage`); a cast member on the cast page (`CastCard`).
 *
 * Accessibility: With `href` it is a link that Tab reaches and Enter follows, named by `label` if given, else by its content
 * in order (any artwork and logo alt text, badge, duration, count, title, meta) ending with "waiting for you" when `attention`
 * is set and "watched 40%" from `progress`; without `href` the same reads as text. The artwork's alt is `alt` and the logo's
 * `logoAlt` (both empty by default), and the spine, scrim, light and progress bar are hidden. With `menu`, its ⋯ is a button
 * after the link, named "More for" and the title, with a menu popup: Tab reaches it after the card.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MediaCard(props: MediaCardProps) {
  const tx = useWords(ownWords);
  const kind = props.kind || 'episode', crop = props.imagePosition ? { objectPosition: props.imagePosition } : undefined;
  const frameRef = useRef<HTMLDivElement>(null), lit = props.light !== false && !!props.lightMap && !!props.image;
  const Tag = props.href ? 'a' : 'div';
  const small = typeof props.width === 'number' && kind !== 'manga'
    && (props.width <= tokenPx('--media-card-frame-xs-max', 64) ? 'sk-card__frame--xs' : props.width <= tokenPx('--media-card-frame-sm-max', 160) ? 'sk-card__frame--sm' : null);
  const card = (
    <Tag className={cx('sk-card', 'sk-card--' + kind, !props.menu && props.className)} href={props.href} aria-label={props.label} style={props.width && !props.menu ? { width: props.width } : undefined}
      onFocus={lit ? () => lightRest(frameRef.current) : undefined}>
      <div ref={frameRef} className={cx('sk-card__frame', small, lit && 'has-light')} onPointerEnter={lit ? lightAt : undefined} onPointerMove={lit ? lightAt : undefined}>
        <span className="sk-clip">
          {props.image ? <img className="sk-card__img" src={props.image} alt={props.alt || ''} style={crop} />
            : <span className="sk-card__none" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M52 17a33 33 0 1 0 0.01 0Z M58 31a22 22 0 1 1 -0.01 0Z" fillRule="evenodd" /><circle cx={67} cy={62} r={5} /></svg></span>}
          {lit && lightLayer(props.lightMap!, crop)}
          {kind === 'manga' && <span className="sk-card__spine" aria-hidden="true" />}
          {props.logo && <span className="sk-card__scrim" aria-hidden="true" />}
          {props.logo && <img className="sk-card__logo" src={props.logo} alt={props.logoAlt || ''} />}
          {props.badge && <span className="sk-card__tl">{props.badge}</span>}
          {props.duration && <span className={kind === 'short' && !props.menu ? 'sk-card__tl' : 'sk-card__br'}><Badge>{props.duration}</Badge></span>}
          {props.count && <span className="sk-card__bl"><Badge>{props.count}</Badge></span>}
          {props.progress !== undefined && <span className="sk-card__progress" aria-hidden="true"><Progress value={Math.round(props.progress * 100)} tone="media" label={tx('watched')} /></span>}
        </span>
      </div>
      {props.title && <span className="sk-card__title">{props.title}</span>}
      {props.meta && <span className={cx('sk-card__meta', props.attention && 'is-attention')}>{props.meta}</span>}
      {props.attention && <span className="sk-sr">{', ' + tx('waitingForYou')}</span>}
      {props.progress !== undefined && <span className="sk-sr">{', ' + tx('watchedPercent', { percent: Math.round(props.progress * 100) })}</span>}
    </Tag>
  );
  if (!props.menu) return card;
  // The ⋯ sits beside the link, on the wrap, which takes the card's class and width
  return (
    <MoreWrap menu={props.menu} name={typeof props.title === 'string' ? props.title : textOf(props.title)} className={cx('sk-card-wrap', props.className)} variant="media" align="end"
      style={props.width ? { width: props.width } : undefined}>
      {card}
    </MoreWrap>
  );
}
