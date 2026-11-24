import type { MouseEventHandler, ReactNode } from 'react';
import { Button, IconButton, SidePanel } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { MakiComposer, type MakiFile } from '../MakiComposer/MakiComposer';
import { MakiSuggestions } from '../MakiSuggestions/MakiSuggestions';
import type { PromptMentions } from '../PromptComposer/MentionField';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../MakiComposer/MakiComposer.css';
import '../MakiSuggestions/MakiSuggestions.css';
import './MakiPanel.css';

/** Slot: slot="context" (the selection, passed to the composer). */
export interface MakiPanelProps {
  /** Maki's face, at the panel's head. */
  avatar: string;
  /** How many things wait to be looked at, counted by cause: the one number everywhere. Its press jumps to Maki's Review reply. */
  waiting?: number;
  /** The old name of `waiting`. */
  review?: number;
  /** "{count} to look at"'s press: jump to Maki's Review reply. */
  onWaiting?: MouseEventHandler;
  /** The conversation: MakiTurns and ChatMessages, oldest first; Review is one of Maki's replies. */
  children?: ReactNode;
  /** Close Maki. */
  onClose?: MouseEventHandler;
  /** A reply is still coming in: the conversation waits to be read. */
  busy?: boolean;
  /** Opens scrolled here rather than at the newest line. */
  start?: number;
  /** Nothing said yet: Maki, this line, and what to ask first. */
  greeting?: string;
  /** Nothing said yet: what to ask first, as rows that send on a press. */
  suggestions?: string[];
  /** Called with the suggestion pressed. */
  onSuggestion?: (suggestion: string) => void;
  /** `false` drops the composer, for someone who can only read. */
  composer?: boolean;
  /** As on MakiComposer: false draws no +. */
  attach?: boolean;
  /** As on MakiComposer: the files added with +. */
  files?: MakiFile[];
  /** As on MakiComposer. */
  onRemoveFile?: (file: MakiFile) => void;
  /** As on MakiComposer. */
  removable?: boolean;
  /** As on MakiComposer: @'s press; without it, an @ at the caret opens the picker. */
  onMention?: MouseEventHandler;
  /** As on MakiComposer: who @, # and & can tag. */
  mentions?: PromptMentions;
  /** As on MakiComposer: what is selected, as MentionChips under "Asking about" (or slot="context"). */
  context?: ReactNode;
  /** As on MakiComposer: what a reply costs, in fragments. */
  cost?: number | string;
  /** As on MakiComposer: Maki is writing, Send becomes Stop. */
  writing?: boolean;
  /** As on MakiComposer: Stop's press. */
  onStop?: MouseEventHandler;
  /** As on MakiComposer: the composer's empty-field words. */
  placeholder?: string;
  /** As on MakiComposer: the quiet line under the composer. */
  hint?: string;
  /** As on MakiComposer. */
  value?: string;
  /** As on MakiComposer: called with the words as they change. */
  onChange?: (text: string) => void;
  /** As on MakiComposer: called with the words when they are sent. */
  onSend?: (text: string) => void;
  /** As on MakiComposer: adds a picture or a file to the message. */
  onAttach?: MouseEventHandler;
  /** As on MakiComposer: Send stays available with an empty field. */
  ready?: boolean;
  /** Extra class on the root element. */
  className?: string;
}

/* Maki in a side area: a SidePanel with Maki's face and name, what is waiting (a press jumps to it), close; the conversation, Review
   as one of Maki's replies; the composer at the foot. With nothing said yet: Maki, one line, and what to ask first. */
/**
 * MakiPanel is Maki in a side area: a SidePanel with Maki's face and name, what is waiting, and close; the conversation; the composer
 * at the foot. Review is one of Maki's replies, not a tab. `waiting` is how many things wait to be looked at, and its press jumps to
 * the Review reply. With nothing said yet: Maki's face, `greeting` in one line, and `suggestions` as rows that send on a press.
 *
 * Not for the button that opens it (`AskMaki`); a side area about a character, place or event (`SidePanel` with a `PanelHeader`);
 * one thing Maki says (`MakiTurn`).
 *
 * Accessibility: A section named "Maki". Tab moves through "{count} to look at", "Close Maki", the conversation's controls and the
 * composer; Maki's face is hidden. The conversation is a log named "Conversation with Maki", so each reply is read as it arrives,
 * held back while `busy` or `writing`.
 *
 * @version 2.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MakiPanel(props: MakiPanelProps) {
  const tx = useWords(ownWords);
  const sl = slots(props.children);
  const waiting = props.waiting !== undefined ? props.waiting : props.review;
  const head = [
    <img key="i" className="sk-mk-head__face" src={props.avatar} alt="" />,
    <b key="b" className="sk-mk-head__name">Maki</b>,
    <span key="s" className="sk-mk-head__space" />,
    waiting ? <Button key="w" variant="ghost" size="sm" icon="warning" className="sk-mk-head__waiting" onClick={props.onWaiting}>{tx('makiWaiting', { count: waiting })}</Button> : null,
    <IconButton key="x" variant="plain" icon="close" label={tx('closeMaki')} className="sk-mk-tool" onClick={props.onClose} />,
  ];
  const hello = !sl.body && (
    <div className="sk-mk-hello">
      <img src={props.avatar} alt="" />
      <p>{props.greeting}</p>
      {props.suggestions && <MakiSuggestions items={props.suggestions} onPick={props.onSuggestion} label={tx('suggestions')} />}
    </div>
  );
  const composer = props.composer === false ? null : (
    <MakiComposer value={props.value} onChange={props.onChange} onSend={props.onSend} onStop={props.onStop} writing={props.writing} attach={props.attach} onAttach={props.onAttach} onMention={props.onMention} files={props.files} onRemoveFile={props.onRemoveFile} removable={props.removable}
      mentions={props.mentions} context={props.context || sl.get('context')} cost={props.cost} placeholder={props.placeholder} hint={props.hint} ready={props.ready} />
  );
  return (
    <SidePanel className={cx('sk-mk-panel', props.className)} label="Maki" follow start={props.start} role="log" bodyLabel={tx('conversationWithMaki')}
      busy={props.busy || props.writing} head={head} foot={composer}>
      {hello || sl.body}
    </SidePanel>
  );
}
