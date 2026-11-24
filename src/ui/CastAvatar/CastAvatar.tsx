import type { MouseEventHandler, ReactNode, SyntheticEvent } from 'react';
import { cx } from '../../internal/cx';
import { pressProps } from '../../internal/press';
import { Icon } from '../Icon/Icon';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { CutFace } from '../CutFace/CutFace';
import '../../base.css';
import './CastAvatar.css';

/** A cast member. Without an image it shows `initial`; with `selected` (true or false) it is a choice; `layout="row"` puts the name beside a small portrait. */
export interface CastAvatarProps {
  /** From Sakuga.cropStyle: a face not cut yet, shown through the square it will be cut to, beside a Cropper. */
  imageStyle?: string;
  /** The round portrait from their identity sheet; without it, `initial`. */
  image?: string;
  /** Shown in the circle until a portrait is approved. */
  initial?: string;
  /** Their name, the label; the portrait is decorative. */
  name?: string;
  /** A one-line role a viewer understands ("Leads the E.R.A."). */
  role?: string;
  /** `lg` (104), `md` (72), `sm` (44), `xs` (36) or a number of px. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
  /** `row` puts a small portrait beside the name and role. */
  layout?: 'row';
  /** Makes it a choice: a ring and a check say it is chosen; it reads as pressed. */
  selected?: boolean;
  /** No longer in the story at this moment: the face dims. */
  muted?: boolean;
  /** Makes it a button. */
  onClick?: MouseEventHandler;
  /** The name when none is shown. */
  label?: string;
  /** Makes it a link to their page. */
  href?: string;
  /** The column's width, in px or CSS, so names wrap or cut inside it. */
  width?: number | string;
  /** Extra class on the root element. */
  className?: string;
}

/* A cast member: the portrait in a circle (an initial until there is one), the name and role under it, or beside it in a row.
   Given selected, it is a choice, and a ring and a check say it is chosen. A size is lg, md, sm, xs or pixels. muted: no longer in
   the story at this moment (dead, gone). */
/* figure stands in for the initial where a Kit card draws its own (CastCard's silhouette); it is not part of the public props */
/**
 * CastAvatar shows a person: a character (a round portrait from their identity sheet), or a creator (an initial until they add
 * a picture), with their name and a one-line role.
 *
 * Not for a cast member on the cast page, with what they have and what is happening to them (`CastCard`); who or what a panel
 * holds, with its @ or # mark and a note (`MentionChip`); a character as one card with stats and traits (`CharacterCard`); a
 * character named inside prose (`Mention`); several people at a glance, overlapping (`CastStack`).
 *
 * Accessibility: With `selected` set it is a toggle button, "pressed" when selected; with `href` a link; with only `onClick` a
 * button; otherwise plain text, and Tab reaches each of the three controls, Enter or Space pressing the buttons. Its name and
 * role are read, `muted` adds "not in the story at this point", and the portrait, initial and check are hidden; without `name`
 * it is named by `label`.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CastAvatar(props: CastAvatarProps & { figure?: ReactNode }) {
  const tx = useWords(ownWords);
  const size = props.size || 'lg', px = typeof size === 'number' ? size : null, pick = props.selected !== undefined, row = props.layout === 'row';
  const face = (
    <span className="sk-cast__face" style={px ? { width: px, height: px, fontSize: Math.round(px * .3) } : undefined}>
      {props.image ? <CutFace src={props.image} imageStyle={props.imageStyle} /> : <span className="sk-cast__initial" aria-hidden="true">{props.figure || props.initial || String(props.name || '').charAt(0)}</span>}
      {props.selected && <span className="sk-cast__check" aria-hidden="true"><Icon name="check" size="var(--cast-avatar-check-icon-size)" /></span>}
    </span>
  );
  const name = props.name && <span className="sk-cast__name">{props.name}</span>, role = props.role && <span className="sk-cast__role">{props.role}</span>;
  const press = !pick && !props.href && props.onClick ? pressProps(props.onClick as (e: SyntheticEvent) => void) : null;
  const Tag = pick ? 'button' : props.href ? 'a' : 'div';
  return (
    <Tag
      className={cx('sk-cast', !px && 'sk-cast--' + size, row && 'sk-cast--row', props.selected && 'is-selected', props.muted && 'is-muted', props.className)}
      href={props.href}
      type={pick ? 'button' : undefined}
      aria-pressed={pick ? (props.selected ? 'true' : 'false') : undefined}
      aria-label={props.name ? undefined : props.label}
      onClick={props.onClick}
      style={{ width: props.width }}
      {...press}
    >
      {face}
      {row ? (name || role) && <span className="sk-cast__text">{name}{role}</span> : <>{name}{role}</>}
      {props.muted && <span className="sk-sr">{', ' + tx('notInStory')}</span>}
    </Tag>
  );
}
