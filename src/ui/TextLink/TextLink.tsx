import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './TextLink.css';

/** A quiet action in a line of text: a link with href, a button without. */
export interface TextLinkProps {
  /** destructive: the quiet way into a deletion ("Delete my account"). */
  variant?: 'quiet' | 'strong' | 'destructive';
  /** Where it goes; without it, a button. */
  href?: string;
  /** An icon before its words. */
  icon?: IconName;
  /** Its press. */
  onClick?: MouseEventHandler;
  /** Names it for screen readers when its visible words do not. */
  'aria-label'?: string;
  /** For a link that opens a dialog or menu. */
  'aria-haspopup'?: boolean | 'dialog' | 'menu' | 'listbox';
  /** As a disclosure: whether what it opens is open. */
  'aria-expanded'?: boolean;
  /** As a disclosure: the id of what it opens. */
  'aria-controls'?: string;
  /** Its words. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* A quiet action in a line of text: a link with href, a button without */
/**
 * TextLink is a quiet action inside a line or a row of text: Accept, Decline, Why; Ask Maki; Use it.
 *
 * Not for the action a view exists for (`Button`); an action shown as a glyph alone (`IconButton`); a row that opens a page
 * (`ListRow`).
 *
 * Accessibility: A link with `href`, otherwise a button: Tab reaches it, Enter activates it (Space too as a button), and a
 * screen reader hears its text or `aria-label`, with the icon hidden. `variant` changes only its look. For a link that opens a
 * dialog, `aria-haspopup`, `aria-expanded` and `aria-controls` pass through. Its underline at rest tells it apart from the text
 * around it without colour (WCAG 1.4.1).
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function TextLink({ variant, href, icon, onClick, 'aria-label': ariaLabel, 'aria-haspopup': hasPopup, 'aria-expanded': expanded, 'aria-controls': controls, children, className }: TextLinkProps) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      type={Tag === 'button' ? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-haspopup={hasPopup}
      aria-expanded={expanded}
      aria-controls={controls}
      className={cx('sk-tlink', variant === 'strong' && 'is-strong', variant === 'destructive' && 'is-destructive', className)}
    >
      {icon && <Icon name={icon} size="var(--tlink-icon-size)" />}
      {children}
    </Tag>
  );
}
