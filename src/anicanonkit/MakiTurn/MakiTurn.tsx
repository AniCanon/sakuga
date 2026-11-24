import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { AniCanonLoader } from '../AniCanonLoader/AniCanonLoader';
import '../../base.css';
import './MakiTurn.css';

/** Slots: slot="steps" (MakiSteps), slot="actions" (the quiet row under the newest reply). */
export interface MakiTurnProps {
  /** What Maki did first, as MakiSteps ("Read the story · 26 events"), or slot="steps". */
  steps?: ReactNode;
  /** Before the first word: Maki's loader and "Maki is writing…" (a string replaces those words). */
  writing?: boolean | string;
  /** The newest reply's quiet row: icon buttons of one size, or slot="actions". */
  actions?: ReactNode;
  /** What Maki says: paragraphs, lists and quotes with Mentions, MakiCards and Review's MakiFindingGroups. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* One reply from Maki: her words on the panel's edge, no who-line and no box (the head already says who). Steps first, then the
   words; `writing` while the reply is still coming; `actions` is the quiet row under the newest reply. */
/**
 * MakiTurn is one reply from Maki: her words on the panel's edge, in `text-body-lg`, with no who-line and no box (the head already
 * says who). Steps come first, then the words; MakiCards and Review's MakiFindingGroups sit inside it on the same edge.
 *
 * Not for what the person said (`ChatMessage`); something Maki proposes inside the reply (`MakiCard`); one thing Review found
 * (`MakiFinding`).
 *
 * Accessibility: Read as "Maki:" and the reply; the steps read first. While `writing`, the loader says its words once; the words
 * beside it are hidden from screen readers.
 *
 * @version 2.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MakiTurn(props: MakiTurnProps) {
  const tx = useWords(ownWords);
  const sl = slots(props.children);
  const writing = props.writing === true ? tx('makiWriting') : props.writing;
  const actions = props.actions || sl.get('actions'), steps = props.steps || sl.get('steps');
  return (
    <div className={cx('sk-mk-reply', props.className)}>
      <span className="sk-sr">Maki: </span>
      {steps && <div className="sk-mk-reply__steps">{steps}</div>}
      {sl.body ? <div className="sk-mk-reply__say">{sl.body}</div> : null}
      {writing && <span className="sk-mk-writing"><AniCanonLoader size="var(--mk-writing-size)" label={writing} /><span aria-hidden="true">{writing}</span></span>}
      {actions && <div className="sk-mk-reply__actions">{actions}</div>}
    </div>
  );
}
