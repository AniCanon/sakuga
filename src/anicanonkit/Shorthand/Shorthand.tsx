import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../../base.css';
import './Shorthand.css';

/** spoken: what a screen reader says in place of the notation. */
export interface ShorthandProps {
  /** `accent` for a state that waits for you (To review), `secondary` for a settled one; the notation colour by default. */
  tone?: 'accent' | 'secondary';
  /** What a screen reader says in place of the notation ("close-up, low angle"); without it the notation is read as written. */
  spoken?: string;
  /** The notation ("CU · LA · TRK↑ 0–5s"). */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* spoken: the words a screen reader says in place of the notation ("close-up, low angle, track up from 0 to 5 seconds") */
/**
 * Shorthand is camera and timing notation as an ekonte writes it: shot size, angle, move and when it starts and stops (C.U ·
 * low · T.U 0+00 → 5+00). Small caps, tabular figures. `tone="accent"` for a state that waits for you (To review),
 * `tone="secondary"` for a settled one; the default is the notation colour.
 *
 * Not for choosing a shot, an angle or a move (`OptionTiles`); the direction set on a panel, a row per kind (`PropertyList`);
 * Studio's folded section with its current value (`PanelRow`); a cut's number and approval (`CutCell`).
 *
 * Accessibility: Not focusable; with `spoken` a screen reader says those words in place of the notation, which is hidden from
 * it, and without `spoken` the notation is read as written ("C.U", "T.U").
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Shorthand({ tone, spoken, children, className }: ShorthandProps) {
  return (
    <span className={cx('sk-shorthand', tone && 'is-' + tone, className)}>
      {spoken ? [<span key="v" aria-hidden="true">{children}</span>, <span key="s" className="sk-sr">{spoken}</span>] : children}
    </span>
  );
}
