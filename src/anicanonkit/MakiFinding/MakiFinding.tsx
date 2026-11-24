import type { MouseEventHandler, ReactNode } from 'react';
import { Button, Icon } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useUid } from '../../internal/uid';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import type { EventType } from '../EventGlyph/EventGlyph';
import { EntityRow, type EntityRowProps } from '../EntityRow/EntityRow';
import '../../base.css';
import './MakiFinding.css';

/** Slot: slot="title" (the title with Mentions). Children show in an open one (the "Why it stays" field). */
export interface MakiFindingProps {
  /** What doesn't hold up, in plain words: what it is read by, and shown when slot="title" is not given. */
  title: string;
  /** Why, under the title. */
  note?: string;
  /** A small mark at the start of the title line: a conflict (the story contradicts itself) or a warning. Its word is read, not shown. */
  severity?: 'conflict' | 'warning';
  /** The severity's word, when not "Conflict" or "Warning". */
  severityLabel?: string;
  /** Its events, shown while open: the title first, where it was told under it. */
  events?: (EntityRowProps & { type?: EventType })[];
  /** Open: its events and its actions show. */
  open?: boolean;
  /** The current one: open. */
  selected?: boolean;
  /** The line's press: Show me, which shows the finding on the map and opens it. */
  onSelect?: MouseEventHandler;
  /** Draws the line as pressable without a handler, on a board. */
  pressable?: boolean;
  /** Ask Maki, while open. A page passes what it does, never the button. */
  onAsk?: MouseEventHandler;
  /** Keep on purpose, while open. A page passes what it does, never the button. */
  onKeep?: MouseEventHandler;
  /** Draws Ask Maki without a handler, on a board. */
  ask?: boolean;
  /** Draws Keep on purpose without a handler, on a board. */
  keep?: boolean;
  /** Ask Maki's words, when not "Ask Maki". */
  askLabel?: string;
  /** Keep on purpose's words, when not "Keep on purpose". */
  keepLabel?: string;
  /** Kept on purpose: who kept it, when and why. */
  kept?: { by?: string; date?: string; reason?: string };
  /** Reopen, on a kept one. */
  onReopen?: MouseEventHandler;
  /** Draws Reopen without a handler, on a board. */
  reopen?: boolean;
  /** The title with Mentions as slot="title", and anything shown while open (the "Why it stays" field). */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* One thing Review found, as a line of Maki's reply: a small mark, the title at the full width, why. Pressing it shows it on the map
   and opens it: its events on the same edge (the title first, where it was told quiet under it), then Ask Maki and Keep on purpose,
   one pair in one style. Kept: the bookmark, the title quiet, who kept it and why, and Reopen. */
/**
 * MakiFinding is one thing Maki's Review found, as a line of her reply: a small mark, what doesn't hold up and why, and every event
 * it is in. Its press (`onSelect`) shows it on the map and opens it (Show me); open, its events list under it, then its two
 * actions, Ask Maki and Keep on purpose, one pair in one style. `kept` is one kept on purpose, with Reopen.
 *
 * Not for something Maki proposes inside a reply (`MakiCard`); something found in writing, beside the words it came from
 * (`ProposalCard`); a check pinned to work on a sheet (`Slip`).
 *
 * Accessibility: An item of its group's list, named by its title. A line that opens is one button, read as its severity, "Show
 * {title} on the map" and its note, expanded or collapsed; the mark is hidden. Open, its events are a list named "In 3 events",
 * then Ask Maki and Keep on purpose take focus. A kept one reads "Kept on purpose by {name} · {date}" and its reason, then Reopen.
 *
 * @version 2.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MakiFinding(props: MakiFindingProps) {
  const tx = useWords(ownWords);
  const sl = slots(props.children), id = useUid('sk-mk-find');
  const kept = props.kept, open = !!(props.open || props.selected);
  const conflict = props.severity === 'conflict';
  const sev = kept ? '' : props.severityLabel || tx(conflict ? 'findingConflict' : 'findingWarning');
  const mark = (
    <span key="m" className={cx('sk-mk-find__mark', kept ? 'is-kept' : conflict ? 'is-conflict' : 'is-warning')} aria-hidden="true">
      <Icon name={kept ? 'bookmark' : conflict ? 'warning' : 'info'} size="var(--mk-find-mark-size)" />
    </span>
  );
  const words = [mark, <span key="w" className="sk-mk-find__words"><b id={id + '-t'} className="sk-mk-find__title">{sl.get('title') || props.title}</b>{props.note && <span className="sk-mk-find__note">{props.note}</span>}</span>];
  const press = !kept && (props.onSelect || props.pressable);
  const head = press
    ? <button type="button" className="sk-mk-find__head" onClick={props.onSelect} aria-expanded={open ? 'true' : 'false'}
        aria-label={sev + ': ' + tx('showFinding', { title: props.title }) + (props.note ? '. ' + props.note : '')}>{words}</button>
    : <div className="sk-mk-find__head">{!kept && <span className="sk-sr">{sev + ': '}</span>}{words}</div>;
  /* Its actions are its own, one pair in one style: a page passes what they do, never the buttons, so they can't drift apart */
  const acts = open && !kept && (props.onAsk || props.onKeep || props.ask || props.keep) ? [
    (props.onAsk || props.ask) && <Button key="a" variant="ghost" size="sm" icon="comment" onClick={props.onAsk}>{props.askLabel || tx('askMaki')}</Button>,
    (props.onKeep || props.keep) && <Button key="k" variant="ghost" size="sm" icon="bookmark" onClick={props.onKeep}>{props.keepLabel || tx('keepOnPurposeAction')}</Button>,
  ] : null;
  return (
    <div className={cx('sk-mk-find', open && 'is-open', kept && 'is-kept', props.className)} role="listitem" aria-labelledby={id + '-t'}>
      {head}
      {open && props.events && props.events.length ? (
        <div className="sk-mk-find__events" role="list" aria-label={tx('findingEvents', { count: props.events.length })}>
          {props.events.map((e, i) => <div key={i} role="listitem"><EntityRow visual={{ kind: 'event', type: e.type || 'event' }} {...e} /></div>)}
        </div>
      ) : null}
      {kept && <p className="sk-mk-find__kept">{kept.by ? tx('keptBy', { name: kept.by, date: kept.date || '' }) : tx('keptOnPurpose')}</p>}
      {kept && kept.reason && <q className="sk-mk-find__reason">{kept.reason}</q>}
      {open && sl.body ? <div className="sk-mk-find__more">{sl.body}</div> : null}
      {kept && (props.onReopen || props.reopen) && <div className="sk-mk-find__actions"><Button variant="ghost" size="sm" icon="back" onClick={props.onReopen}>{tx('reopen')}</Button></div>}
      {acts && <div className="sk-mk-find__actions">{acts}</div>}
    </div>
  );
}
