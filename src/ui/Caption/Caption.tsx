import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../../base.css';
import './Caption.css';

/** One subtitle line over video: lg (24px) in the desktop player, md (16px) on phones and in shorts. */
export interface CaptionProps {
  /** `lg` (24 px) in the desktop player, `md` (16 px) on a phone and in shorts. */
  size?: 'lg' | 'md';
  /** The subtitle's words, at most two lines. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Caption is one subtitle line drawn over video.
 *
 * Not for the quiet line that explains a heading or a field (`Text`); the caption tracks of a cut in the editor (`Timeline`); a
 * planned line with its speaker and translation (`DialogueLine`).
 *
 * Accessibility: Not focusable; read as a paragraph of text where it sits. It isn't a live region, so a new line is not
 * announced as it changes.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Caption({ size, children, className }: CaptionProps) {
  return <p className={cx('sk-caption', 'sk-caption--' + (size || 'lg'), className)}>{children}</p>;
}
