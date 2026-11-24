import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './ScreenplayLine.css';

export interface ScreenplayLineProps {
  /** The block: a slugline, action, a character cue, a parenthetical, dialogue or a transition. */
  type?: 'slug' | 'action' | 'cue' | 'paren' | 'dialogue' | 'transition';
  /** A cue's extension (V.O., O.S.). */
  extension?: string;
  /** Underlines a line Maki found a story conflict in. */
  flagged?: boolean;
  /** The block's words. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * ScreenplayLine is one block of a screenplay inside a `ManuscriptSection`: `slug`, `action`, `cue` (with `extension` such as
 * O.S.), `paren`, `dialogue`, `transition`.
 *
 * Not for a planned line with its delivery and translation (`DialogueLine`); a subtitle over video (`Caption`).
 *
 * Accessibility: Not focusable; the block reads as plain text, a cue followed by its extension in brackets ("(O.S.)"), and a
 * `flagged` block ends with "story conflict".
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ScreenplayLine({ type: given, extension, flagged, children, className }: ScreenplayLineProps) {
  const tx = useWords(ownWords);
  const type = given || 'action';
  return (
    <div className={cx('sk-spl', 'sk-spl--' + type, flagged && 'is-flagged', className)}>
      {type === 'cue' && extension ? [<span key="n">{children}</span>, <small key="e">{' (' + extension + ')'}</small>] : children}
      {flagged && <span key="f" className="sk-sr">{', ' + tx('storyConflict')}</span>}
    </div>
  );
}
