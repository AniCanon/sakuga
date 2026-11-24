import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './Badge.css';

/** On artwork: default, new, alert. On a surface: neutral (a state), attention (it waits for you), outline (where it comes from), warning (worth a second look). */
export interface BadgeProps {
  /**
   * Over art: the default, `new` (one per card at most) or `alert` (a state changed for the worse). On a surface: `neutral`,
   * `attention` (waits for you), `outline` (where something comes from) or `warning`: amber ring and words, for something
   * worth a second look, with words that say why. A warning is about the work, never a state in the story.
   */
  variant?: 'default' | 'new' | 'alert' | 'neutral' | 'attention' | 'outline' | 'warning';
  /** A dot before a state that is live. */
  dot?: boolean;
  /** A 14 px glyph before the label, for a state with a glyph of its own; never the warning triangle on a state. */
  icon?: IconName;
  /** The label: a duration in m:ss, a short count, a state. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Badge is a small label laid over artwork: a duration, a view count, or New.
 *
 * Not for narrowing a feed by kind (`Chip`); words the person keeps and removes (`TagList`); a state that changed, before and
 * after (`StateChange`); the unread mark on the bell (`IconButton`).
 *
 * Accessibility: Not focusable; its text is read in place. The dot and the icon are hidden, and `variant` changes only its
 * colour. In forced colours every badge keeps an edge, and its dot stays visible.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Badge({ variant, dot, icon, children, className }: BadgeProps) {
  return (
    <span className={cx('sk-badge', variant && 'sk-badge--' + variant, icon && 'sk-badge--icon', className)}>
      {dot && <span className="sk-badge__dot" aria-hidden="true" />}
      {icon && <Icon name={icon} size="var(--badge-icon-size)" />}
      {children}
    </span>
  );
}
