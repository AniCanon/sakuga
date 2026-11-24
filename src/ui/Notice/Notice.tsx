import { useEffect, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { announce, statusWords } from '../../internal/live';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './Notice.css';

export interface NoticeProps {
  /** `info` (default) or `attention`. */
  tone?: 'info' | 'attention';
  /** Defaults by tone: info, or warning for attention. */
  icon?: IconName;
  /** Drawn in place of the icon, e.g. a Loader. */
  media?: ReactNode;
  /** The bold lead-in. */
  title?: string;
  /** The line of context. */
  text?: string;
  /** The action, usually a small Button. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * A single line of context inside a page: something to know (info) or something that needs action (attention), with an optional
 * action on the right. Not for errors that block, use the page state for those.
 *
 * Not for confirming that something finished (`Toast`); a failure where the content should be (`EmptyState`); a correction
 * pinned to work on a sheet (`Slip`).
 *
 * Accessibility: Not focusable itself; the title and text read in place, the icon is hidden, and any action in it takes focus.
 * With `tone` "attention" it says its title and text once, through the page’s one live region, when it appears: a status role
 * on words there from the start is rarely read. A loader passed as `media` keeps its name.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Notice({ tone = 'info', icon, media, title, text, children, className }: NoticeProps) {
  /* An attention notice says itself once, through the page's one live region: a status role on words there from the start is rarely read */
  useEffect(() => { if (tone === 'attention') announce(statusWords(title, text)); }, [tone, title, text]);
  return (
    <div className={cx('sk-notice', 'sk-notice--' + tone, className)}>
      {media
        ? <span className="sk-notice__icon">{media}</span>
        : <span className="sk-notice__icon" aria-hidden="true"><Icon name={icon || (tone === 'attention' ? 'warning' : 'info')} size="var(--notice-icon-size)" /></span>}
      <span className="sk-notice__body">
        {title && <b>{title}</b>}
        {title && text ? ' ' : null}
        {text && <span className="sk-notice__text">{text}</span>}
      </span>
      {children && <span className="sk-notice__action">{children}</span>}
    </div>
  );
}
