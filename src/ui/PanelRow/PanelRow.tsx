import type { MouseEventHandler } from 'react';
import { cx } from '../../internal/cx';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './PanelRow.css';

export interface PanelRowProps {
  /** The section's AniCanon icon. */
  icon: IconName;
  /** The section's name. */
  title: string;
  /** What the section is set to, e.g. "Close-up · push in · low". */
  value?: string;
  /** Set only when the row opens its choice in place: then it is said to be open or closed (never on a link). */
  open?: boolean;
  /** Makes the row a link to where the section opens. */
  href?: string;
  /** Opens the section, as the fold's closed state. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * PanelRow is Studio’s folded section: an icon, the section’s name and its current value, with the chevron that opens it, at
 * the row's end with or without a value. `open` turns the chevron on `motion-fast`; `onClick` toggles it; `href` makes it a
 * link to where the section is edited.
 *
 * Not for several kinds of setting listed together, each opening its full choice (`PropertyList`); a Studio card with its
 * controls showing (`Panel`); one thing on a row of a list (`ListRow`); one setting on or off (`Switch`).
 *
 * Accessibility: A button (a link with `href`) that Tab reaches; Enter runs `onClick`, and Space does too on a button. A screen
 * reader hears its title and value, then, when `open` is given on a button, expanded or collapsed from it; the icon and chevron
 * are hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PanelRow({ icon, title, value, open, href, onClick, className }: PanelRowProps) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag type={href ? undefined : 'button'} href={href} className={cx('sk-panelrow', className)} aria-expanded={href || open === undefined ? undefined : open ? 'true' : 'false'} onClick={onClick}>
      <span className="sk-panelrow__icon"><Icon name={icon} size="var(--panel-row-icon-size)" /></span>
      <span className="sk-panelrow__title">{title}</span>
      {value && <span className="sk-panelrow__value">{value}</span>}
      <Icon name="chevron-down" size="var(--panel-row-chevron-icon-size)" className="sk-panelrow__chev" />
    </Tag>
  );
}
