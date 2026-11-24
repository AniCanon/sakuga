import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useUid } from '../../internal/uid';
import { MentionField, type PromptMentions } from './MentionField';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../../ui/Popover/Popover.css';
import '../../ui/Picker/Picker.css';
import '../Revision/Revision.css';
import './PromptComposer.css';

export type { PromptCastMember, PromptMentions, PromptObject, PromptPlace, PromptPlaceView, PromptReference } from './MentionField';

/** Studio's prompt. Slots: slot="refs" (MentionChips), slot="hint", slot="tools", slot="footer". The words are its children; `placeholder` shows while there are none. */
export interface PromptComposerProps {
  /** Names the composer for screen readers. */
  label?: string;
  /** Names the words' field for screen readers. */
  promptLabel?: string;
  /** Shown while there are no words. */
  placeholder?: string;
  /** Makes the words a field the creator writes in, called with the saved prompt: text with @[name:kind:id] mentions and $aliases. Without it the words only show. */
  onChange?: (value: string) => void;
  /** With onChange: the saved prompt the field holds. */
  value?: string;
  /** With onChange: who @, # and $ can tag. A character with outfits asks which one it wears. */
  mentions?: PromptMentions;
  /** 'web': the phone browser's dock, solid across the width on the tab bar. ('media', the phone app's glass dock, stays native: docs/PORTING.md · Not ported.) */
  variant?: 'web';
  /** The lines of room the words have before they grow (one by default). */
  rows?: number;
  /** Takes the column's free height, the words growing in it (three lines at least); with onChange a press on its empty parts puts the caret at the end of the words. */
  fill?: boolean;
  /** The phrases a plan added, as they read in the words: each marked as Revision's insertion until the first edit. */
  revisions?: string[];
  /**
   * The words, when they only show; the chips as slot="refs", a line as slot="hint", the tools as slot="tools" and the actions
   * as slot="footer".
   */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Studio's prompt: who and where it binds on
   top (@ cast, # places, $ references), the words, then its tools. With onChange the words are a field where a mention is one solid
   piece; without it they only show. */
/**
 * PromptComposer is Studio's prompt: who and where it binds on top, the words, then its tools.
 *
 * Not for writing to Maki (`MakiComposer`); a plain text field (`TextField`); the script itself (`Manuscript`); choosing
 * direction as tiles (`OptionTiles`).
 *
 * Accessibility: A region named by `label` (default "Prompt"): Tab reaches the refs, then the words, then the tools. A missing
 * mention reads as its name then "missing" ("$platform-edge, missing"), and a grouped $ list is one listbox whose groups are named
 * by their headings, the arrows moving through every group in order. With
 * `onChange` the words are a multi-line textbox named by `promptLabel` (default "Prompt"), with `placeholder` as its
 * placeholder: focus stays in the words while the list is open (the field controls it, `aria-autocomplete="list"`), the arrows
 * move its active option (announced as the field's active descendant), Enter or Tab chooses it and Escape closes it; Right opens a
 * place's views, the list then named by the place, and Left or Backspace after the # goes back, as does the head's Back button
 * ("Back to Places"), which a press leaves focus in the words. While the
 * words have focus the composer’s frame shows the focus ring, in every form, and the words draw none of their own; without
 * `onChange` the words are text and take no focus.
 *
 * @version 1.7
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PromptComposer({ label, promptLabel, placeholder, onChange, value, mentions, variant, rows, fill, revisions, children, className }: PromptComposerProps) {
  const tx = useWords(ownWords);
  const sl = slots(children), frame = useRef<HTMLElement>(null), hint = useUid('sk-composer') + '-hint', empty = !sl.body;
  useRevisions(frame, revisions);
  /* With onChange, a press on an empty part of the composer writes at the end of the words; the refs, tools and foot keep their own presses */
  const toWords = onChange ? (e: MouseEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as Element).closest('.sk-composer__prompt, button, a, input, textarea, select, [role="button"], [role="option"], [tabindex]')) return;
    const w = frame.current?.querySelector<HTMLElement>('.sk-composer__prompt[contenteditable]');
    if (!w) return;
    e.preventDefault();
    w.focus();
    const sel = window.getSelection(), r = document.createRange();
    r.selectNodeContents(w);
    r.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(r);
  } : undefined;
  const prompt = onChange
    ? <MentionField value={value || ''} onChange={onChange} mentions={mentions || {}} label={promptLabel || tx('prompt')} placeholder={placeholder} describedBy={sl.get('hint') ? hint : undefined} frame={frame} />
    : <div className={cx('sk-composer__prompt', empty && 'is-empty')}>{empty ? placeholder : sl.body}</div>;
  return (
    <section ref={frame} onMouseDown={toWords} className={cx('sk-composer', variant === 'web' && 'sk-composer--web', fill && 'is-fill', className)}
      style={rows ? ({ '--composer-rows': rows } as CSSProperties) : undefined} aria-label={label || tx('prompt')}>
      {sl.get('refs') && <div className="sk-composer__refs">{sl.get('refs')}</div>}
      {prompt}
      {sl.get('hint') && <p className="sk-composer__hint" id={hint}>{sl.get('hint')}</p>}
      {sl.get('tools') && <div className="sk-composer__tools">{sl.get('tools')}</div>}{sl.get('footer') && <div className="sk-composer__foot">{sl.get('footer')}</div>}
    </section>
  );
}

/* revisions: each phrase found in the words, after the one before, is a range in the sk-revision highlight; the first edit clears
   them. A browser without the Highlight API shows the words unmarked. */
function useRevisions(frame: { current: HTMLElement | null }, revisions: string[] | undefined) {
  const [edited, setEdited] = useState(false);
  const key = (revisions || []).join('\u0000');
  useEffect(() => { setEdited(false); }, [key]);
  useEffect(() => {
    const words = frame.current?.querySelector<HTMLElement>('.sk-composer__prompt');
    const css = (globalThis as { CSS?: { highlights?: Map<string, Highlight> } }).CSS;
    if (!words || !revisions?.length || edited || typeof Highlight === 'undefined' || !css?.highlights) return;
    const hl = css.highlights.get('sk-revision') || new Highlight();
    css.highlights.set('sk-revision', hl);
    const nodes: { node: Text; at: number }[] = [];
    let text = '';
    const walk = document.createTreeWalker(words, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) { nodes.push({ node: n as Text, at: text.length }); text += n.nodeValue || ''; }
    const where = (i: number) => { for (let k = nodes.length - 1; k >= 0; k--) if (nodes[k].at <= i) return { node: nodes[k].node, offset: i - nodes[k].at }; return null; };
    const mine: Range[] = [];
    let from = 0;
    revisions.forEach((phrase) => {
      if (!phrase) return;
      let i = text.indexOf(phrase, from);
      if (i < 0) i = text.indexOf(phrase);
      if (i < 0) return;
      const a = where(i), b = where(i + phrase.length - 1);
      if (!a || !b) return;
      const r = document.createRange();
      r.setStart(a.node, a.offset);
      r.setEnd(b.node, b.offset + 1);
      hl.add(r);
      mine.push(r);
      from = i + phrase.length;
    });
    const stop = () => setEdited(true);
    words.addEventListener('input', stop);
    return () => { mine.forEach((r) => hl.delete(r)); words.removeEventListener('input', stop); };
  });
}
