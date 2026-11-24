import type { Key } from 'react';
import { Badge, Icon } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { EntityVisual } from '../EntityRow/visual';
import { useWords, type Words } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../EntityRow/EntityRow.css';
import './QuestionRow.css';

export interface QuestionStep {
  /** The event at this step. */
  label: string;
  /** Its picture. */
  image?: string;
  /** Where it was told ("Ep 3"). */
  told?: string;
}

export interface QuestionRowProps {
  /** The question the story raises, in words. */
  question: string;
  /** `waiting` for its answer; `quiet` when nothing has touched it for a long time; `answered` fades the row. */
  state?: 'waiting' | 'quiet' | 'answered';
  /** A short line on where it stands. */
  note?: string;
  /** Bands the row: the question open in the panel. */
  selected?: boolean;
  /** Where the question was planted. */
  planted: QuestionStep;
  /** Where it was raised again, in order. */
  raised?: QuestionStep[];
  /** Where it is answered; empty, it invites the event that pays it off. */
  answered?: QuestionStep;
}

function ev(e: QuestionStep | undefined, i: Key, tx: Words) {
  return e ? (
    <div key={i} className="sk-qrow__event" title={e.told ? tx('toldInTitle', { list: e.told }) : undefined}>
      <EntityVisual visual={{ kind: 'place', image: e.image, width: 30, height: 24 }} /><b>{e.label}</b>
      {e.told && <span className="sk-sr">{', ' + tx('toldIn', { list: e.told })}</span>}
    </div>
  ) : null;
}

const arrow = (k: Key) => <span key={k} className="sk-qrow__arrow"><Icon name="forward" size="var(--question-arrow-icon-size)" /></span>;

/**
 * QuestionRow is one open question the audience is waiting on: planted → raised → answered, each step a real event with its
 * place.
 *
 * Not for a character, place or event on Story (`EntityRow`); a conflict found in writing (`ProposalCard`); where a person is
 * in a flow they step through (`Stepper`).
 *
 * Accessibility: Not focusable; read in order as the question in quotes (then "selected" when `selected`), its badge (Waiting,
 * Quiet or Answered) and note, then "Planted", "Raised" and "Answered" with each step's event and where it was told ("Smoke,
 * told in Episode 1"), "Not raised yet" or "Answer it"; pictures and arrows are hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function QuestionRow({ question, state, note, selected, planted, raised, answered }: QuestionRowProps) {
  const tx = useWords(ownWords);
  const st = state || 'waiting';
  const badge = { waiting: <Badge>{tx('questionWaiting')}</Badge>, quiet: <Badge icon="warning">{tx('questionQuiet')}</Badge>, answered: <Badge icon="check">{tx('answered')}</Badge> }[st];
  const up = raised && raised.length ? raised.map((e, i) => ev(e, i, tx)) : <div className="sk-qrow__empty">{tx('notRaisedYet')}</div>;
  const paid = answered ? ev(answered, 'a', tx) : <div className="sk-qrow__empty"><Icon name="plus" size="var(--question-empty-icon-size)" />{tx('answerIt')}</div>;
  return (
    <div className={cx('sk-qrow', selected && 'is-selected', st === 'answered' && 'is-done')}>
      <div className="sk-qrow__q"><b>{'“' + question + '”'}</b>{selected && <span className="sk-sr">{', ' + tx('selected')}</span>}<span>{badge}{note}</span></div>
      <div className="sk-qrow__steps">
        <div className="sk-qrow__step"><small>{tx('planted')}</small>{ev(planted, 'p', tx)}</div>{arrow(1)}
        <div className="sk-qrow__step"><small>{tx('raised')}</small>{up}</div>{arrow(2)}
        <div className="sk-qrow__step"><small>{tx('answered')}</small>{paid}</div>
      </div>
    </div>
  );
}
