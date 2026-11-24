import type { ReactNode } from 'react';
import { Badge, IconButton } from '@anicanon/sakuga/ui';
import { slots } from '../../internal/slots';
import { EntityVisual, type Visual } from '../EntityRow/visual';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../EntityRow/EntityRow.css';
import './ProposalCard.css';

/** Slots: slot="visual", slot="action". */
export interface ProposalCardProps {
  /** What was found, in a line. */
  title: string;
  /** Why, or what it changes, under the title. */
  note?: string;
  /**
   * `stated` (said in the text; accepted by default), `inferred` (between the lines; dashed, never accepted for you) or
   * `conflict` (breaks the story; carries its action).
   */
  kind?: 'stated' | 'inferred' | 'conflict';
  /** Drives the Accept toggle. */
  accepted?: boolean;
  /** What it is about, drawn at its start: a face, a place, an event's glyph. */
  visual?: Visual;
  /** The Accept toggle: called with the new state. */
  onAccept?: (accepted: boolean) => void;
  /** The action (as slot="action"). */
  action?: ReactNode;
  /** More of what was found, under the note; the action as slot="action". */
  children?: ReactNode;
}

/**
 * ProposalCard is one event, change or link found in writing, waiting for the person.
 *
 * Not for something Maki proposes inside the chat (`MakiCard`); a change shown in place in the words (`Revision`); a check
 * pinned to a cut on a sheet (`Slip`).
 *
 * Accessibility: Read as text: the title, "conflict" on a conflict, the note and "Inferred" on an inferred find, with the
 * picture hidden; the `action` slot takes focus. With `accepted` set, Tab reaches the "Accept" toggle button, "pressed" when
 * accepted, which runs `onAccept`.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ProposalCard({ title, note, kind = 'stated', accepted, visual, onAccept, action, children }: ProposalCardProps) {
  const tx = useWords(ownWords);
  const sl = slots(children);
  const toggle = accepted === undefined ? null : (
    <IconButton variant={accepted ? 'solid' : 'plain'} icon={accepted ? 'check' : 'plus'} label={tx('accept')} pressed={accepted}
      onClick={onAccept ? () => onAccept(!accepted) : undefined} />
  );
  return (
    <div className={'sk-proposal sk-proposal--' + kind}>
      <div className="sk-proposal__head">{sl.get('visual') || (visual && <EntityVisual visual={visual} />)}<b>{title}</b>{kind === 'conflict' && <span className="sk-sr">{', ' + tx('conflict')}</span>}{toggle}</div>
      {note && <span className="sk-proposal__note">{note}</span>}
      {kind === 'inferred' && <span className="sk-proposal__tag"><Badge icon="eye">{tx('inferred')}</Badge></span>}{action || sl.get('action')}
    </div>
  );
}
