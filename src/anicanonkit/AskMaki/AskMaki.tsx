import type { MouseEventHandler } from 'react';
import { Button } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './AskMaki.css';

/** Maki's one button. sm: handed a conflict or a selection. md with shape 'pill' and label 'Maki': Maki in a view's header, with `count` and `open`. */
export interface AskMakiProps {
  /** Maki's face. */
  avatar: string;
  /** What Maki is asked ("Ask Maki how it could be answered"), or "Maki" in a view's header. */
  label?: string;
  /** Button's variant: secondary by default, ghost in a row, outline beside a primary. */
  variant?: 'secondary' | 'ghost' | 'outline';
  /** sm when handed something (a conflict, a selection); md in a view's header. */
  size?: 'sm' | 'md';
  /** pill in a view's header. */
  shape?: 'pill';
  /** How many things Maki wants looked at. */
  count?: string;
  /** Maki's panel is open beside the view. */
  open?: boolean;
  /** Makes it a link to Maki's page instead of a button. */
  href?: string;
  /** Opens Maki's panel, or hands Maki what it sits beside. */
  onClick?: MouseEventHandler;
}

/* Maki's one button: handed a conflict or a selection (sm), or opening Maki from a view's header (md, a pill, with how many things
   Maki wants looked at). open says Maki's panel is open beside the view. */
/**
 * AskMaki is Maki's one button: Maki's face and a label. It carries Maki's face, never a sparkle.
 *
 * Not for an action that is not about Maki (`Button`); a quiet Ask Maki inside a line or a row of text (`TextLink`); Maki's
 * column with the conversation (`MakiPanel`).
 *
 * Accessibility: A button (a link with `href`) that Tab reaches; Enter runs `onClick`, and Space does too on a button. A screen
 * reader hears "Ask Maki" (or `label`), "Ask Maki, 3 to look at" with `count`, and expanded or collapsed when `open` is set;
 * Maki's face is hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function AskMaki({ avatar, label: given, variant, size, shape, count, open, href, onClick }: AskMakiProps) {
  const tx = useWords(ownWords), label = given || tx('askMaki');
  return (
    <Button variant={variant || 'secondary'} size={size || 'sm'} shape={shape} href={href} onClick={onClick}
      className={cx('sk-ask-maki', open && 'is-open')} aria-expanded={open === undefined ? undefined : !!open}
      aria-label={count ? tx('toLookAt', { label, count }) : undefined}>
      <img src={avatar} alt="" />{label}{count ? <em>{count}</em> : null}
    </Button>
  );
}
