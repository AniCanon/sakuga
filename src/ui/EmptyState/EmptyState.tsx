import { useEffect, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { announce, statusWords } from '../../internal/live';
import { slots } from '../../internal/slots';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './EmptyState.css';

/** A state in place of content: what is happening or what went wrong, then what can be done (children). Slot: slot="media" (a loader). */
export interface EmptyStateProps {
  /** What is happening or what went wrong, plainly ("Warming up the booth"). */
  title?: string;
  /** What is kept and what happens next. */
  text?: string;
  /** An icon over the title; `warning` when something failed. */
  icon?: IconName;
  /** `attention` when something failed: said once as it appears. */
  tone?: 'attention';
  /** What can be done, after the text; a loader as slot="media". */
  children?: ReactNode;
  /** The title's heading level: h2 by default, h1 when the state is the whole page (a 404, a page that failed). */
  as?: 'h1' | 'h2' | 'h3';
  /** Extra class on the root element. */
  className?: string;
}

/* A state shown in place of the content: what is happening or what went wrong, in a sentence, then what can be done about it */
/**
 * EmptyState stands in place of content while there is none: what is happening or what went wrong, in a sentence, then what can
 * be done.
 *
 * Not for one line of context beside content that is there (`Notice`); a job whose share done is known (`Progress`); a frame
 * waiting for its picture (`Thumb`).
 *
 * Accessibility: Not focusable itself; the title is a heading (h2, or the level `as` gives) and the text a paragraph, the icon is hidden, and any actions in it take
 * focus in order. With `tone` "attention" it says its title and text once, through the page’s one live region, when it appears.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function EmptyState({ title, text, icon, tone, as: Heading = 'h2', children, className }: EmptyStateProps) {
  /* A failed state says itself once, through the page's one live region, as Notice does */
  useEffect(() => { if (tone === 'attention') announce(statusWords(title, text)); }, [tone, title, text]);
  const sl = slots(children);
  const media = sl.get('media') || (icon && <span className="sk-empty__icon"><Icon name={icon} size="var(--empty-icon-glyph-size)" /></span>);
  return (
    <div className={cx('sk-empty', tone && 'is-' + tone, className)}>
      {media}
      {/* Its title is a heading, h2 by default; a full-page state (a 404, a page that failed) passes as="h1" so the page has its heading */}
      {title && <Heading className="sk-empty__title">{title}</Heading>}
      {text && <p className="sk-empty__text">{text}</p>}
      {sl.body}
    </div>
  );
}
