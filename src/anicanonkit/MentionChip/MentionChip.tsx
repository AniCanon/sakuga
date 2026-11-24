import type { MouseEventHandler, ReactNode } from 'react';
import { Badge, Icon, type BadgeProps, type IconName } from '@anicanon/sakuga/ui';
import { CutFace } from '../../ui/CutFace/CutFace';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { EventGlyph, type EventType } from '../EventGlyph/EventGlyph';
import { MENTION_MARK } from '../Mention/Mention';
import '../../base.css';
import '../Mention/Mention.css';
import './MentionChip.css';

export interface MentionChipProps {
  /** From Sakuga.cropStyle: the face shown through the square it will be cut to, beside a Cropper. */
  imageStyle?: string;
  /** Who or what it binds, written with its mark. */
  name: string;
  /** The mark: `character` @, `place` #, `reference` $ (a picture the creator added), `object` & (`prop` is its old name and draws the same); `event` its glyph and quoted title; `faction` its faction glyph. */
  kind?: 'character' | 'place' | 'reference' | 'object' | 'prop' | 'event' | 'faction';
  /** kind `event`: its type's glyph. */
  type?: EventType;
  /** kind `faction` with no picture: its faction glyph (`faction-neutral` by default). */
  icon?: IconName;
  /** A live state as a Badge after it ("Dead", "Left", "Burning"; `variant: "alert"` for a turn for the worse). */
  status?: { label: string; variant?: BadgeProps['variant']; icon?: IconName };
  /** Deleted since: its name in the danger text with a wavy rule, its picture faded. */
  missing?: boolean;
  /** A character with no portrait: its age figure on the canvas colour (`age-adult`, `age-child`, …). */
  figure?: IconName;
  /** Held as Maki's context: a remove button beside the chip, never inside it. */
  onRemove?: MouseEventHandler<HTMLButtonElement>;
  /** Shows the remove button without a handler, on a board. */
  removable?: boolean;
  /** `media` over art, as in the phone's dock. */
  tone?: 'media';
  /** Its sheet's picture; an object with no sheet yet shows the thing glyph, never a stand-in. */
  image?: string;
  /** What this panel needs of it: a character's outfit and emotion ("Winter coat · tired"), its labels ("E.R.A. · lead"), a reference's purpose. */
  note?: string;
  /** Makes it a link to its page. */
  href?: string;
  /** Makes it a button that opens what edits it in place (Studio's cast panel); href stays for a link to somewhere else. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** With onClick: whether what it opens is open. */
  expanded?: boolean;
  /** With onClick: the id of what it opens. */
  controls?: string;
  /** Its name when the words alone do not say what it does, e.g. "Kiko, casual, determined. Edit cast". */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * MentionChip shows who or what a panel holds: a cast member (@), a place (#), an object (&), a reference ($), an event or a
 * faction, with its picture, a quiet note and a live status.
 *
 * Not for a character's face, name and role in a row (`CastAvatar`); a mention inside prose (`Mention`); narrowing a feed by
 * kind (`Chip`); words kept as removable tags (`TagList`).
 *
 * Accessibility: Read as text, its mark first ("@Aiko", "#Harbour") then the note; with `href` it is a link that Tab reaches
 * and Enter follows, named the same way; with `onClick` it is a button, named by `label` when given, that says whether what it
 * opens is expanded. The picture is hidden. Held as context, its remove button beside it is named "Remove {name}".
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MentionChip({ name, kind: given = 'character', type, icon, status, missing, figure, onRemove, removable, tone, image, imageStyle, note, href, onClick, expanded, controls, label, className }: MentionChipProps) {
  const tx = useWords();
  const kind = given === 'prop' ? 'object' : given;
  let vis: ReactNode = null;
  if (kind === 'event') vis = <span className="sk-mchip__slot"><EventGlyph type={type || 'event'} size={12} /></span>;
  else if (kind === 'faction' && !image) vis = <span className="sk-mchip__slot"><Icon name={icon || 'faction-neutral'} size="var(--mchip-slot-icon-size)" /></span>;
  else if (kind === 'object' && !image) vis = <span className="sk-mchip__slot"><Icon name="thing" size="var(--mchip-slot-icon-size)" /></span>;
  else if (image) vis = <CutFace src={image} imageStyle={imageStyle} className="sk-mchip__face" />;
  else if (kind === 'character' && figure) vis = <span className="sk-mchip__slot is-figure"><Icon name={figure} size="var(--mchip-img-size)" /></span>;
  const cls = cx('sk-mchip', 'is-' + kind, tone === 'media' && 'is-media', missing && 'is-missing', className);
  const body = (
    <>
      {vis}
      <span><b>{kind === 'event' ? '“' + name + '”' : (MENTION_MARK[kind] || '') + name}</b>{missing && <span className="sk-sr">{', ' + tx('missing')}</span>}{note && <small>{' · ' + note}</small>}</span>
      {status && <Badge variant={status.variant || 'neutral'} icon={status.icon}>{status.label}</Badge>}
    </>
  );
  const chip = onClick ? <button type="button" onClick={onClick} aria-label={label} aria-expanded={expanded === undefined ? undefined : expanded} aria-controls={controls} className={cls}>{body}</button>
    : href ? <a href={href} aria-label={label} aria-controls={controls} className={cls}>{body}</a>
    : <span aria-label={label} aria-controls={controls} className={cls}>{body}</span>;
  if (!(onRemove || removable)) return chip;
  /* Held as Maki's context: the chip and its own remove, side by side, never one inside the other */
  return (
    <span className={cx('sk-mchip-held', missing && 'is-missing')}>
      {chip}
      <button type="button" className="sk-mchip-held__x" onClick={onRemove} aria-label={tx('removeItem', { name })}><Icon name="close" size="var(--mchip-remove-icon-size)" /></button>
    </span>
  );
}
