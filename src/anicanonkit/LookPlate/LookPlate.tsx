import type { MouseEventHandler } from 'react';
import { Icon, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { GoLink } from '../../internal/link';
import { useUid } from '../../internal/uid';
import { AniCanonLoader } from '../AniCanonLoader/AniCanonLoader';
import { useWords, type WordKey } from '../../internal/words';
import { words as ownWords } from './words';
import { MoreWrap, type CardMenu } from '../../ui/MoreWrap/MoreWrap';
import '../../base.css';
import '../../ui/MoreWrap/MoreWrap.css';
import './LookPlate.css';

export interface LookPlateProps {
  /** The look's name. */
  label: string;
  /** What it is for ("Everyday", "Formal"). */
  occasion?: string;
  /** The look's picture, once drawn. */
  image?: string;
  /** The look's own ⋯ in its corner, shown under the pointer or focus, opening a Menu: Wear (when it isn't worn), Open the sheets, Rename, Change occasion, Retake the portrait, and last, after a rule, Delete. Deleting the worn look asks what is worn instead. */
  menu?: CardMenu;
  /** A creature's look: a 16:9 frame (a character's is 9:16). */
  creature?: boolean;
  /** No picture yet: what will fill it, under the silhouette. */
  placeholder?: string;
  /** The silhouette on an empty plate, on the canvas colour: the character's own age figure, age-adult by default; never a body-* build. */
  placeholderIcon?: IconName;
  /**
   * Where it stands: `ready`, `wearing` (the active look), `showing`, `review`, `new`, `drawing`, or `add` for the plate that
   * adds one.
   */
  state?: 'ready' | 'wearing' | 'showing' | 'review' | 'new' | 'drawing' | 'add';
  /** Where it leads; without it, a button that runs onClick. */
  href?: string;
  /** Runs when pressed and it has no `href`. */
  onClick?: MouseEventHandler;
  /** Extra class on the root element. */
  className?: string;
}

const TAGS: Record<string, [WordKey, string]> = { wearing: ['lookWearing', 'accent'], showing: ['lookShowing', 'accent'], review: ['lookReview', 'soft'], new: ['lookNew', 'accent'] };

/**
 * One look as a 9:16 plate on white, standing head to toe as the portrait is drawn, with its occasion (`creature`: 16:9, as a
 * creature is drawn). States: ready, wearing, showing, review, new, drawing, add. Built only from core components and tokens;
 * it lives in AniCanonKit, not the core.
 *
 * Not for which occasions each character has a look for (`CoverageTable`); a plain picture in a frame (`Thumb`); the character
 * as a whole (`CharacterCard`); choosing who wears a look (`CastAvatar`).
 *
 * Accessibility: A link with `href`, else a button that runs `onClick` (never a link to #), that Tab reaches and Enter follows,
 * named by `label` and described by its tag (Review, New), its `occasion` and "Drawing" while it draws; Wearing and Showing
 * plates are also announced as "current". With `menu`, its ⋯ is its own Tab stop after the plate, a button named "More for
 * {label}" that says it opens a menu; it shows while the plate is under the pointer or holds focus, and always on a phone.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function LookPlate({ menu, ...props }: LookPlateProps) {
  return menu ? <MoreWrap menu={menu} name={props.label} className="sk-plate-wrap" variant="solid"><Plate {...props} /></MoreWrap> : <Plate {...props} />;
}

function Plate({ label, occasion, image, creature, placeholder, placeholderIcon, state, href, onClick, className }: Omit<LookPlateProps, 'menu'>) {
  const tx = useWords(ownWords);
  const st = state || 'ready';
  const tag = TAGS[st];
  const inner = st === 'add' ? <span className="sk-plate__add"><Icon name="plus" size="var(--look-plate-add-icon-size)" /></span>
    : st === 'drawing' ? <span className="sk-plate__drawing"><AniCanonLoader size="var(--look-plate-drawing-loader-size)" label={tx('drawingItem', { name: label })} /></span>
    : !image ? (
      <span className="sk-plate__empty">
        <span className="sk-plate__silhouette" aria-hidden="true"><Icon name={placeholderIcon || 'age-adult'} size="100%" /></span>
        {placeholder && <small>{placeholder}</small>}
      </span>
    )
    : <img src={image} alt="" className={st === 'review' ? 'is-sheet' : undefined} />;
  /* Named by its label; the tag, the occasion and drawing are its description */
  const id = useUid('sk-plate'), about = [tag && id + '-tag', occasion && id + '-occ', st === 'drawing' && id + '-draw'].filter(Boolean).join(' ');
  return (
    <GoLink href={href} onClick={onClick} className={cx('sk-plate', 'sk-plate--' + st, creature && 'sk-plate--creature', className)} aria-current={st === 'wearing' || st === 'showing' ? 'true' : undefined} aria-label={label}
      aria-describedby={about || undefined}>
      <span className="sk-plate__frame"><span className="sk-clip">{inner}</span>{tag && <span className={'sk-plate__tag sk-plate__tag--' + tag[1]} id={id + '-tag'}>{tx(tag[0])}</span>}</span>
      <b>{label}</b>{occasion && <small id={id + '-occ'}>{occasion}</small>}{st === 'drawing' && <span className="sk-sr" id={id + '-draw'}>{tx('drawing')}</span>}
    </GoLink>
  );
}
