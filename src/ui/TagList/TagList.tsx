import { cloneElement, useLayoutEffect, useRef, type HTMLAttributes, type KeyboardEvent, type ReactElement } from 'react';
import { useComings } from '../../internal/comings';
import { cx } from '../../internal/cx';
import { announce } from '../../internal/live';
import { Icon } from '../Icon/Icon';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './TagList.css';

export interface TagListProps {
  /** The tags in order; one `off` reads struck through and can be put back. */
  items: (string | { label: string; off?: boolean })[];
  /** With it the tags sit in a field you type more into, shown while it is empty. */
  placeholder?: string;
  /** Names the list for screen readers. */
  label?: string;
  /** Names the field you type into; the placeholder without it. */
  inputLabel?: string;
  /** The remove button's verb ("Leave out Silver chain"). */
  removeLabel?: string;
  /** The put-back button's verb, on a tag that is `off`. */
  restoreLabel?: string;
  /** Extra class on the root element. */
  className?: string;
  /** Called with a tag's words and index when it is removed. */
  onRemove?: (label: string, index: number) => void;
  /** Called with a tag's words and index when it is put back. */
  onRestore?: (label: string, index: number) => void;
  /** Enter in the box hands its words over and empties it. */
  onAdd?: (words: string) => void;
}

/* Words kept as tags. Each comes out with its own button and, once out, can be put back. With a placeholder the tags sit in a box you type more into. */
/* onRemove and onRestore get the tag's label and index; Enter in the box hands its words to onAdd and empties it. When a removed tag
   took focus with it, focus goes to the tag now in its place, else the last one, else the box. */
/**
 * TagList keeps words as tags: a character's visual vibe, the garments read from a photo.
 *
 * Not for picking words from a set, such as traits (`Chip`); a label over artwork (`Badge`); who or what a panel holds, with
 * its picture (`MentionChip`); a free sentence someone types (`TextField`).
 *
 * Accessibility: A group named by `label`: Tab reaches each tag's button ("Remove Gentle", or "Add back Gentle" once it is out;
 * `removeLabel` and `restoreLabel` change the verb), which runs `onRemove` or `onRestore`, and focus moves to the tag that
 * takes its place; the change is said ("Gentle removed", "Gentle added back"). With `placeholder`, a text input named by
 * `inputLabel` or the placeholder shows a focus ring and hands its words to `onAdd` on Enter.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function TagList({ items, placeholder, label, inputLabel, removeLabel, restoreLabel, className, onRemove, onRestore, onAdd }: TagListProps) {
  const tx = useWords(ownWords);
  const box = useRef<HTMLDivElement>(null), gone = useRef(-1);
  useLayoutEffect(() => {
    const i = gone.current;
    gone.current = -1;
    /* A removed tag now stays while it leaves, so the button that held focus is still there, inert: focus that is still on it has
       not moved anywhere, and goes on as it would have from the body (Version 215 bailed here) */
    const held = document.activeElement;
    if (i < 0 || !box.current || (held && held !== document.body && !held.closest('.sk-tag.is-leaving'))) return;
    const xs = box.current.querySelectorAll<HTMLElement>('.sk-tag:not(.is-leaving) .sk-tag__x'), to = xs[Math.min(i, xs.length - 1)] || box.current.querySelector<HTMLElement>('.sk-tags__input');
    if (to) to.focus();
  });
  const tags = (items || []).map((t, i) => {
    const name = typeof t === 'string' ? t : t.label, off = typeof t !== 'string' && !!t.off, act = off ? onRestore : onRemove;
    return (
      <span key={name} className={cx('sk-tag', off && 'is-off')}>
        {name}
        <button type="button" className="sk-tag__x" aria-label={off ? (restoreLabel ? restoreLabel + ' ' + name : tx('restoreItem', { name })) : (removeLabel ? removeLabel + ' ' + name : tx('removeItem', { name }))} onClick={act ? () => { gone.current = i; act(name, i); announce(tx(off ? 'itemRestored' : 'itemRemoved', { name })); } : undefined}>
          <Icon name={off ? 'plus' : 'close'} size="var(--tag-icon-size)" />
        </button>
      </span>
    );
  });
  function add(e: KeyboardEvent<HTMLInputElement>) {
    const field = e.currentTarget, words = field.value.trim();
    if (e.key !== 'Enter' || !words || !onAdd) return;
    e.preventDefault();
    onAdd(words);
    field.value = '';
  }
  const input = placeholder !== undefined && <input className="sk-tags__input" placeholder={placeholder} aria-label={inputLabel || placeholder} onKeyDown={add} />;
  /* A removed tag leaves before it unmounts: inert and hidden while it fades, so focus and a screen reader pass it by */
  const shown = useComings(tags as ReactElement<HTMLAttributes<HTMLSpanElement>>[], '--tag-leave-animation').map((m) => {
    if (!m.state) return m.item;
    return cloneElement(m.item, (m.state === 'leaving' ? { className: cx(m.item.props.className, 'is-leaving'), 'aria-hidden': 'true', inert: '' } : { className: cx(m.item.props.className, 'is-arriving') }) as HTMLAttributes<HTMLSpanElement>);
  });
  return <div ref={box} className={cx('sk-tags', input && 'sk-tags--input', className)} role="group" aria-label={label}>{shown}{input}</div>;
}
