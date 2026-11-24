import type { ReactNode } from 'react';
import { Badge, Icon, type BadgeProps, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { EntityRow, type Visual } from '../EntityRow/EntityRow';
import '../../base.css';
import './MakiCard.css';

/** One row Maki offers as an answer: a face or picture, the name, where it is from, its labels as badges. */
export interface MakiChoice {
  /** Its name. */
  name: string;
  /** What onChoose answers with; its index when left out. */
  value?: string | number;
  /** Its face or picture. */
  visual?: Visual;
  /** Where it is from, quiet under the name. */
  source?: string;
  /** Faded, as a row outside the moment. */
  faded?: boolean;
  /** Its labels as badges (role, faction, status). */
  labels?: { label: string; variant?: BadgeProps['variant']; icon?: IconName }[];
}

/** Slot: slot="actions" (one pair: the one that writes is primary). */
export interface MakiCardProps {
  /** What Maki proposes or asks, a step up from her words. */
  title?: string;
  /** What kind, a quiet line above the title ("Layout · page 3"). */
  eyebrow?: string;
  /** An issue's severity, beside the title. */
  badge?: { label: string; variant?: 'new' | 'alert'; icon?: IconName };
  /** A quiet line under the title. */
  note?: string;
  /** What was verified ("The story stays consistent with this edit"). */
  check?: string;
  /** One already decided: its pictures and icons fade. */
  muted?: boolean;
  /** Maki asking which: rich rows, one press answers. Never a typed answer, never plain buttons. */
  choices?: MakiChoice[];
  /** The answer: an index or a choice's value; it takes a check and the others fade. */
  chosen?: number | string;
  /** A choice pressed, with its value (or its index). */
  onChoose?: (value: number | string) => void;
  /** The actions (or slot="actions"): one pair, the one that writes primary. */
  actions?: ReactNode;
  /** What changes, before → after (EntityRows with StateChange, a Revision); the actions as slot="actions". */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Something Maki proposes or asks inside her reply, on the reply's edge: a title a step up from her words, what changes, and one
   pair of actions, the one that writes in white. `choices` are rows to press, one press answers. */
/**
 * MakiCard is something Maki proposes or asks inside her reply: a story edit, a canon line, a section to add, a choice. It sits on
 * the reply's edge with no box, no fill and no rule. `choices` are rows to press, one press answers.
 *
 * Not for Maki's words around it (`MakiTurn`); one thing Review found (`MakiFinding`); something found in writing, beside the words
 * it came from (`ProposalCard`); a correction pinned to work on a sheet (`Slip`).
 *
 * Accessibility: A group named by its title; "Already answered" when `muted`. Choices are a radio group, one press answers. The
 * check's icon is hidden, and the actions take focus in order.
 *
 * @version 2.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MakiCard({ title, eyebrow, badge, note, check, muted, choices, chosen, onChoose, actions, children, className }: MakiCardProps) {
  const sl = slots(children);
  const acts = actions || sl.get('actions');
  return (
    <div className={cx('sk-mk-block', muted && 'is-muted', className)} role="group" aria-label={title}>
      {eyebrow && <small className="sk-mk-block__eyebrow">{eyebrow}</small>}
      {(title || badge) && <b className="sk-mk-block__title">{badge && <Badge variant={badge.variant} icon={badge.icon}>{badge.label}</Badge>}{title}</b>}
      {note && <p className="sk-mk-block__note">{note}</p>}
      {sl.body ? <div className="sk-mk-block__body">{sl.body}</div> : null}
      {choices && (
        <div className="sk-mk-block__choices" role="radiogroup" aria-label={title}>
          {choices.map((c, i) => {
            const on = chosen !== undefined && (chosen === i || chosen === c.value);
            return (
              <button key={i} type="button" role="radio" aria-checked={on ? 'true' : 'false'} disabled={chosen !== undefined && !on ? true : undefined}
                className={cx('sk-mk-choice', on && 'is-chosen')} onClick={onChoose ? () => onChoose(c.value !== undefined ? c.value : i) : undefined}>
                <EntityRow visual={c.visual} name={c.name} source={c.source} faded={c.faded}
                  state={c.labels ? <span className="sk-mk-choice__labels">{c.labels.map((l, j) => <Badge key={j} variant={l.variant || 'outline'} icon={l.icon}>{l.label}</Badge>)}</span> : undefined}
                  end={on ? <Icon name="check" size="var(--mk-choice-check-size)" /> : null} />
              </button>
            );
          })}
        </div>
      )}
      {check && <span className="sk-mk-block__check"><Icon name="check" size="var(--mk-block-check-size)" />{check}</span>}
      {acts && <div className="sk-mk-block__actions">{acts}</div>}
    </div>
  );
}
