import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import '../../base.css';
import './ChatMessage.css';

export interface ChatMessageProps {
  /** Who sent it, said before the message. Default "You". */
  name?: string;
  /** The message's words. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * ChatMessage is the person's own message in a chat with Maki: a neutral bubble at the right, in the same size as Maki's words, never
 * the accent.
 *
 * Not for what Maki says (`MakiTurn`); where the person writes the next message (`MakiComposer`).
 *
 * Accessibility: Not focusable; the message reads as plain text after who sent it, "You" (or `name`), which is said but not
 * shown.
 *
 * @version 2.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
/* What the person said: a neutral bubble at the right, in the same size as Maki's words. Never the accent. */
export function ChatMessage({ name, children, className }: ChatMessageProps) {
  const tx = useWords();
  return <div className={cx('sk-mk-mine', className)}><span className="sk-sr">{(name || tx('you')) + ': '}</span>{children}</div>;
}
