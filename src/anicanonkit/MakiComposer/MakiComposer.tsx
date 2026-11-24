import { useRef, useState, type MouseEvent as ReactMouseEvent, type MouseEventHandler, type ReactNode } from 'react';
import { IconButton, Thumb } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { FragmentSoul } from '../FragmentSoul/FragmentSoul';
import { MentionField, type PromptMentions } from '../PromptComposer/MentionField';
import '../../base.css';
import '../Revision/Revision.css';
import '../PromptComposer/PromptComposer.css';
import './MakiComposer.css';

/** Slot: slot="context" (the selection's MentionChips). */
/** A file the creator added with +. */
export interface MakiFile {
  /** Its key among the files. */
  id?: string;
  /** Its name. */
  name: string;
  /** Its preview (a video's poster). */
  image?: string;
  /** A picture (default) or a video. */
  kind?: 'picture' | 'video';
  /** Still uploading. */
  adding?: boolean;
}

export interface MakiComposerProps {
  /** Shown in the empty field; short, so it never cuts ("Ask Maki…"). */
  placeholder?: string;
  /** The field's name for screen readers. Default "Message to Maki". */
  label?: string;
  /** `false` hides Attach (a picture or a file). */
  attach?: boolean;
  /** The words in the field. */
  value?: string;
  /** Called with the words as they change. */
  onChange?: (text: string) => void;
  /** Enter, or Send: the message. Shift+Enter makes a new line. Send waits for words. */
  onSend?: (text: string) => void;
  /** Attach's press. */
  onAttach?: MouseEventHandler;
  /** The @ button's press; without it, an @ at the caret opens the picker, as typing it does. */
  onMention?: MouseEventHandler;
  /** The files the creator added with +, under "Attached" after the context: each its preview, "Adding…" while `adding`, then "Picture" or "Video". */
  files?: MakiFile[];
  /** With it (or `removable`, as on a board), each file has Remove. */
  onRemoveFile?: (file: MakiFile) => void;
  /** Draws each file's Remove without a handler, on a board. */
  removable?: boolean;
  /** Who @, # and & can tag, as on PromptComposer: the field becomes the prompt's own, a chosen one one solid tag, saved as @[name:kind:id]. */
  mentions?: PromptMentions;
  /** What is selected, as removable MentionChips under "Asking about", inside the container (or slot="context"). */
  context?: ReactNode;
  /** What a reply costs, in fragments: "12 a reply" with the fragment mark. */
  cost?: number | string;
  /** Maki is writing: Send becomes Stop. */
  writing?: boolean;
  /** Stop's press. */
  onStop?: MouseEventHandler;
  /** Send stays available with an empty field, for a page that sends something of its own. */
  ready?: boolean;
  /** A quiet line under the container, only when something is at stake. */
  hint?: string;
  /** The selection as slot="context". */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* The one strong object: a container that holds what Maki is asked about (as chips, removable), the field that grows from one line
   to six, and one toolbar: add and @ at the left, what a reply costs, send at the right, which becomes Stop while Maki writes. */
/**
 * MakiComposer is where the person writes to Maki: one container that holds what is asked about, the field and one set of
 * controls. Add and @ at the left and send at the right; send waits for words and becomes Stop while Maki writes. `cost` sits
 * beside send with the fragment mark. With `mentions` the field tags as PromptComposer's does: @ cast, # places, & objects, $ references.
 *
 * Not for writing the prompt that makes a take (`PromptComposer`); a plain text field in a form (`TextField`); a message already
 * sent (`ChatMessage`).
 *
 * Accessibility: Tab reaches each context chip's remove ("Remove Kiko"), each file's Remove ("Remove lighthouse.png"; a file still
 * adding is busy), the field (named by `label`, default "Message to Maki"), "Attach", "Mention someone or something", then "Send" or
 * "Stop". Enter sends, Shift+Enter starts a new line; Send is unavailable until there are words.
 *
 * @version 2.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MakiComposer(props: MakiComposerProps) {
  const tx = useWords(ownWords);
  const sl = slots(props.children);
  const field = useRef<HTMLTextAreaElement>(null), box = useRef<HTMLDivElement>(null), typed = useRef(props.value || ''), typeIn = useRef<((text: string) => void) | null>(null);
  const [has, setHas] = useState(!!props.value);
  function text() { return props.value !== undefined ? props.value : props.mentions ? typed.current : (field.current ? field.current.value : ''); }
  function send() { if (!text().trim()) return; if (props.onSend) props.onSend(text()); }
  const empty = props.value !== undefined ? !String(props.value).trim() : !has;
  /* With mentions the field is the prompt's: @ cast, # places, & objects, $ references open their list where the caret is, and a
     chosen one is one solid piece. Enter still sends once the list is closed. */
  const input = props.mentions ? (
    <div className="sk-mk-composer__prompt" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.defaultPrevented && !box.current?.querySelector('.sk-composer__menu')) { e.preventDefault(); send(); } }}>
      <MentionField value={props.value !== undefined ? props.value : typed.current} mentions={props.mentions} frame={box} insertRef={typeIn} outfits={false} label={props.label || tx('messageToMaki')} placeholder={props.placeholder || tx('askMakiPlaceholder')}
        onChange={(v) => { typed.current = v; setHas(!!String(v).trim()); if (props.onChange) props.onChange(v); }} />
    </div>
  ) : (
    <textarea ref={field} className="sk-mk-composer__input" rows={1} placeholder={props.placeholder || tx('askMakiPlaceholder')} aria-label={props.label || tx('messageToMaki')}
      value={props.value} onChange={(e) => { setHas(!!e.target.value.trim()); if (props.onChange) props.onChange(e.target.value); }} readOnly={props.value !== undefined && !props.onChange}
      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
  );
  const context = props.context || sl.get('context');
  /* @ with no handler of the page's: an @ at the caret, as typing it does, which opens the picker */
  function mention(e: ReactMouseEvent) {
    if (props.onMention) { props.onMention(e); return; }
    if (typeIn.current) typeIn.current('@');
  }
  /* The files the creator added, each a Thumb: its preview, "Adding…" while it uploads then "Picture" or "Video", and Remove */
  const files = (props.files || []).map((f, i) => (
    <div key={f.id || i} className={cx('sk-mk-file', f.adding && 'is-adding')} aria-busy={f.adding ? 'true' : undefined}>
      <Thumb image={f.adding ? undefined : f.image} width="var(--mk-file-size)" height="var(--mk-file-size)" title={f.name}
        meta={f.adding ? tx('fileAdding') : tx(f.kind === 'video' ? 'fileVideo' : 'filePicture')} drawing={f.adding} placeholder={f.adding || !f.image ? ' ' : undefined} alt=""
        action={props.onRemoveFile || props.removable ? <IconButton variant="media" icon="close" label={tx('removeItem', { name: f.name })} onClick={() => { if (props.onRemoveFile) props.onRemoveFile(f); }} /> : undefined} />
    </div>
  ));
  const go = props.writing
    ? <IconButton variant="primary" label={tx('stop')} className="sk-mk-tool sk-mk-composer__send" onClick={props.onStop}><svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true"><rect x={1} y={1} width={10} height={10} rx={2} fill="currentColor" /></svg></IconButton>
    : <IconButton variant="primary" icon="forward" label={tx('send')} className="sk-mk-tool sk-mk-composer__send" disabled={empty && !props.ready ? true : undefined} onClick={send} />;
  return (
    <div className={cx('sk-mk-composer', props.className)}>
      <div ref={box} className="sk-mk-composer__box" onMouseDown={(e) => { if (e.target === box.current) { e.preventDefault(); const f = box.current.querySelector<HTMLElement>('textarea,[contenteditable]'); if (f) f.focus(); } }}>
        {/* What is selected on the map or the scrubber goes to Maki with the message, each removable */}
        {context ? <div className="sk-mk-composer__context" role="group" aria-label={tx('makiContext')}><span className="sk-mk-composer__context-label" aria-hidden="true">{tx('makiContext')}</span>{context}</div> : null}
        {files.length ? <div className="sk-mk-composer__context sk-mk-composer__files" role="group" aria-label={tx('makiAttached')}><span className="sk-mk-composer__context-label" aria-hidden="true">{tx('makiAttached')}</span>{files}</div> : null}
        {input}
        <div className="sk-mk-composer__bar">
          {props.attach === false ? null : <IconButton variant="solid" icon="plus" label={tx('attach')} className="sk-mk-tool" onClick={props.onAttach} />}
          {props.mentions && <IconButton variant="solid" label={tx('mentionSomeone')} className="sk-mk-tool sk-mk-tool--at" onMouseDown={(e) => { e.preventDefault(); }} onClick={mention}><span aria-hidden="true">@</span></IconButton>}
          <span className="sk-mk-composer__space" />
          {props.cost !== undefined && <span className="sk-mk-composer__cost"><FragmentSoul size={14} /><span>{tx('replyCost', { amount: props.cost })}</span></span>}
          {go}
        </div>
      </div>
      {props.hint && <p className="sk-mk-composer__hint">{props.hint}</p>}
    </div>
  );
}
