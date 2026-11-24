import { CastAvatar, Icon, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useUid } from '../../internal/uid';
import { AniCanonLoader } from '../AniCanonLoader/AniCanonLoader';
import { MoreWrap, type CardMenu } from '../../ui/MoreWrap/MoreWrap';
import '../../base.css';
import './CastCard.css';

/** Characters: a cast member on the cast page; `state` is what is happening to them, `action` what waits on the creator. */
export interface CastCardProps {
  /** The character's name; names the card's link. */
  name: string;
  /** The approved portrait. Without one the card shows `placeholderIcon`, else `initial`. */
  image?: string;
  /** Shown in the portrait's place until there is a picture or a figure. */
  initial?: string;
  /** Its own ⋯ in its corner, beside the card's link, opening a Menu (Delete for an unfinished character). */
  menu?: CardMenu;
  /** No portrait yet: the character's age figure (age-adult, anthro-age-*, creature-age-*) on the canvas colour, in place of the initial. */
  placeholderIcon?: IconName;
  /** A few words a viewer understands ("Leads the E.R.A."), under the name. */
  role?: string;
  /** What they have ("2 looks"), at the foot when no action waits. */
  meta?: string;
  /** Where the card leads: the character, or their creation while unfinished. */
  href?: string;
  /** A live fact about them: `attention` when it waits on the creator, `busy` while something is drawn. One at most. */
  state?: { label: string; tone?: 'attention' | 'busy' };
  /**
   * The next step, across the card's foot: `attention` (review), `draft` (continue setup), `busy` with the loader and its
   * `time`. One at most.
   */
  action?: { label: string; tone?: 'attention' | 'draft' | 'busy'; time?: string };
}

/* Characters: a cast member on the cast page. The portrait (an initial until there is one), the role, the name, what they have, and what is happening to them now. */
/* As a link it is named by the name alone; the role, what they have, their state and the action are its description */
/**
 * A cast member on the cast page: the portrait (an initial until one is approved), the role, the name, what they have, and what
 * is happening to them now.
 *
 * Not for laying out a faction's cast (`CastGrid`); a character in a creation or editing flow (`CharacterCard`); a character's
 * face and name in a row or on a series page (`CastAvatar`); a cast member a panel or a prompt holds (`MentionChip`).
 *
 * Accessibility: With `href` it is a link that Tab reaches and Enter follows, named by `name` and described by its role, meta,
 * state and action; without `href` all of these read as text. With `menu`, its ⋯ is its own Tab stop after the card, a button
 * named "More for {name}" that says it opens a menu and whether it is open. The portrait and the state dot are hidden, and a
 * busy action's loader stays quiet inside the card.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CastCard({ name, image, initial, menu, placeholderIcon, role, meta, href, state: st, action: act }: CastCardProps) {
  const id = useUid('sk-castcard');
  const about = [role && id + '-r', meta && id + '-m', st && st.label && id + '-s', act && act.label && id + '-a'].filter(Boolean).join(' ');
  const Tag = href ? 'a' : 'div';
  const card = (
    <Tag href={href} className="sk-castcard" aria-label={href ? name : undefined} aria-describedby={href && about ? about : undefined}>
      {/* No portrait yet: a silhouette on the canvas colour, as an empty Thumb or LookPlate has, in place of the initial */}
      <CastAvatar image={image || undefined} initial={initial} size={96}
        figure={!image && placeholderIcon ? <span className="sk-cast__silhouette"><Icon name={placeholderIcon} size="100%" /></span> : undefined} />
      {/* Every face and name sit at the same height across a row; what varies sits under the name, and every card ends in a foot */}
      <b className="sk-castcard__name">{name}</b>
      {role && <span className="sk-castcard__role" id={id + '-r'}>{role}</span>}
      {meta && act && act.label && <span className="sk-castcard__meta" id={id + '-m'}>{meta}</span>}
      {st && st.label && <span className={cx('sk-castcard__state', st.tone && 'is-' + st.tone)} id={id + '-s'}><span className="sk-castcard__dot" aria-hidden="true" />{st.label}</span>}
      {act && act.label && (
        <span className={cx('sk-castcard__action', 'is-' + (act.tone || 'busy'))} id={id + '-a'}>
          {act.tone === 'busy' && <AniCanonLoader size="var(--cast-card-action-loader-size)" label={act.label} />}
          <span className="sk-castcard__label">{act.label}</span>{act.time && <span className="sk-castcard__time">{act.time}</span>}
        </span>
      )}
      {/* With nothing to do, the foot says quietly what they have, so the card still ends where its row does */}
      {!(act && act.label) && <span className="sk-castcard__action is-quiet" id={id + '-m'}>{meta || ''}</span>}
    </Tag>
  );
  return menu ? <MoreWrap menu={menu} name={name} className="sk-castcard-wrap">{card}</MoreWrap> : card;
}
