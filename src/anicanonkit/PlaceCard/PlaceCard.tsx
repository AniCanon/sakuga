import { FactList, Thumb } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { AniCanonLoader } from '../AniCanonLoader/AniCanonLoader';
import { useWords } from '../../internal/words';
import '../../base.css';
import './PlaceCard.css';

/** Places: the place or backdrop being made, on the left of its flow; with no image, an empty frame naming what fills it (`drawing` adds the loader). */
export interface PlaceCardProps {
  /** The place or backdrop. */
  name: string;
  /** The quiet line under the name ("A place in EBA"). */
  caption?: string;
  /** The picture at 16:9 once there is one: a place's anchor, or the backdrop. */
  image?: string;
  /** Names the picture; the place's name without it. */
  alt?: string;
  /** The picture's baked light map, passed to its Thumb: its own highlights glow under the pointer (light on art). */
  lightMap?: string;
  /** Passed to its Thumb: on wherever there is a `lightMap`; false turns it off. */
  light?: boolean;
  /** With no picture yet: what the frame will hold ("The anchor is drawn here", "Drawing", "Not drawn"). */
  placeholder?: string;
  /** With no picture yet: the loader beside the placeholder while it draws. */
  drawing?: boolean;
  /** A few facts, as a `FactList`: district, inside or out, views planned. */
  facts?: { label: string; value: string }[];
  /** What happens next, under everything ("Nothing is drawn until you approve the plan."). */
  note?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* Places: the place or backdrop being made, on the left of its flow. Its picture once drawn (before that an empty frame naming what fills it,
   with the loader while it draws), its name, a quiet line under it, its facts and a note. */
/**
 * The place or backdrop being made, on the left of its flow: its picture once drawn, or before that an empty frame naming what
 * fills it (with the loader while it draws), its name, a quiet line under it, its facts and a note. Built from the core's
 * `Thumb` and `FactList`; it lives in AniCanonKit, not the core.
 *
 * Not for a character in its flows (`CharacterCard`); a picture with its caption, in a grid or a strip (`Thumb`); a place named
 * in a prompt or a script (`MentionChip`); a job's stages in order (`Stages`).
 *
 * Accessibility: Not focusable; a region named by `name`, with the picture's alt from `alt` or the name, the name as a level-2
 * heading, then the caption, facts and note as text. While it draws, the empty frame reads its `placeholder`, and its loader
 * stays quiet inside the card.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PlaceCard({ name, caption, image, alt, lightMap, light, placeholder, drawing, facts, note, className }: PlaceCardProps) {
  const tx = useWords();
  const empty = !image;
  return (
    <section className={cx('sk-placecard', className)} aria-label={name}>
      <Thumb image={image} alt={alt || name} placeholder={empty ? '' : undefined} ratio="16 / 9" radius="lg" lightMap={lightMap} light={light}>
        {empty && <span className="sk-placecard__empty">{drawing && <AniCanonLoader size="var(--place-card-empty-loader-size)" label={placeholder || tx('drawing')} />}{placeholder}</span>}
      </Thumb>
      <div className="sk-placecard__head">
        <h2 className="sk-placecard__name">{name}</h2>
        {caption && <span className="sk-placecard__caption">{caption}</span>}
      </div>
      {facts && facts.length > 0 && <FactList items={facts} />}
      {note && <p className="sk-placecard__note">{note}</p>}
    </section>
  );
}
