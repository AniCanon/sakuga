import type { ReactNode } from 'react';
import { type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { StateChange } from '../StateChange/StateChange';
import { EntityVisual, type Visual } from './visual';
import { useWords } from '../../internal/words';
import '../../base.css';
import './EntityRow.css';

export type { Visual };

/** Slots: slot="visual" (a custom picture), slot="state", slot="end". */
export interface EntityRowProps {
  /** The picture it starts with: a portrait, a bond, a place's art, an event's shape, a question's track. */
  visual?: Visual;
  /** The character, place or event's name. */
  name: string;
  /** Its state before this moment, drawn as a StateChange with `after`. */
  before?: string;
  /** Its state at this moment. */
  after?: string;
  /** `alert` for a change for the worse; `new` for one just added. */
  afterVariant?: 'new' | 'alert';
  /** An icon before the new state. */
  afterIcon?: IconName;
  /** An icon before the old state. */
  beforeIcon?: IconName;
  /** A short label at the end ("Ep 2", "Manga"); it yields before the title does. Longer than 14 characters, it shows as the source. */
  chip?: string;
  /** Where it was told, in full ("Lantern Tide · series bible · Prologue"): quiet text under the name. */
  source?: string;
  /** Something that no longer counts at this moment. */
  faded?: boolean;
  /** The state in place of before/after (as slot="state"). */
  state?: ReactNode;
  /** What sits at the end (as slot="end"). */
  end?: ReactNode;
  /** A line under the name; a custom picture as slot="visual", the state as slot="state", the end as slot="end". */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* A chip is a short label; past this many characters it is where the row was told, and shows as its source */
const ENTITY_CHIP_MAX = 14;

/**
 * EntityRow is the one row kind on Story: a picture, the name, its state, and the work that told it. The name gets the width: it
 * wraps to a second line before it is ever cut, and nothing at the row's end may take its room. `chip` is a short label at the end
 * that yields first; `source` is where it was told in full, quiet under the name.
 *
 * Not for a row outside Story, such as a take or a setting (`ListRow`); an open question with its planted, raised and answered
 * steps (`QuestionRow`); something found in writing, waiting for the person (`ProposalCard`); the people in a character's life
 * beside their name (`CastAvatar`).
 *
 * Accessibility: Not focusable; the name, "not at this moment" when `faded`, its source, its state and the chip read as text in order, then
 * whatever sits at the end. Pictures and initials are hidden, and a faded row dims its picture while its words stay readable.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function EntityRow({ visual, name, before, after, afterVariant, afterIcon, beforeIcon, chip: given, source: told, faded, state, end, children, className }: EntityRowProps) {
  const tx = useWords();
  const sl = slots(children);
  /* A chip longer than a short label is where it was told in full: it goes under the name as its source, never beside it */
  let chip = given, source = told;
  if (chip && String(chip).length > ENTITY_CHIP_MAX) { source = source || chip; chip = undefined; }
  const shown = state || sl.get('state') || ((after || before) && <StateChange before={before} after={after!} afterVariant={afterVariant} afterIcon={afterIcon} beforeIcon={beforeIcon} />);
  return (
    <div className={cx('sk-erow', faded && 'is-faded', className)}>
      {sl.get('visual') || <EntityVisual visual={visual} />}
      <span className="sk-erow__text"><b>{name}</b>{faded && <span className="sk-sr">{', ' + tx('notAtThisMoment')}</span>}
        {source && <small className="sk-erow__source">{source}</small>}{shown}</span>
      {/* A chip is a short label (Ep 2, Manga); it yields before the title ever does, its whole words on hover */}
      {chip && <span className="sk-erow__chip" title={chip}>{chip}</span>}{end || sl.get('end')}
    </div>
  );
}
