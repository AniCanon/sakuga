import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../../base.css';
import './DialogueLine.css';

export interface DialogueLineProps {
  /** Who says it. */
  speaker: string;
  /** Or the line as children, when it carries markup. */
  line?: string;
  /** The speaker's face. */
  image?: string;
  /** How it's said ("whispered"), after the speaker. */
  delivery?: string;
  /** Where in the cut it lands ("0:42"). */
  at?: string;
  /** The line in the viewer's language, under it. */
  translation?: string;
  /** The line with markup (a Revision inside the words). */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * DialogueLine is a planned line: speaker, delivery, where it falls in the beat, the line in the spoken language and its
 * translation. The line may carry markup as children instead of `line`: a `Revision` inside the words.
 *
 * Not for dialogue as written in the screenplay (`ScreenplayLine`); a subtitle over video (`Caption`); hearing the line
 * (`AudioPlayer`).
 *
 * Accessibility: Not focusable; read as text in order: the speaker, the delivery and where it falls, the line as a quotation,
 * then the translation. The speaker's picture is hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function DialogueLine({ speaker, line, image, delivery, at, translation, children, className }: DialogueLineProps) {
  return (
    <div className={cx('sk-dline', className)}>
      {image && <img src={image} alt="" />}
      <div>
        <b>{speaker}{delivery && <small>{' · ' + delivery}</small>}{at && <small>{' · ' + at}</small>}</b>
        <q>{line !== undefined ? line : children}</q>
        {translation && <span>{translation}</span>}
      </div>
    </div>
  );
}
