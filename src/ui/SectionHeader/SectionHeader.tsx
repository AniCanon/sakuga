import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './SectionHeader.css';

export interface SectionHeaderProps {
  /** The shelf's or group's name, as a heading. */
  title: ReactNode;
  /** The line that explains the shelf: "Shorts · videos under a minute". */
  subtitle?: ReactNode;
  /** The See all link at the end, with its name for screen readers. */
  action?: { label: string; href?: string; ariaLabel?: string; onClick?: MouseEventHandler };
  /** lg = desktop (title-2), md = phone (title-3), sm = a section inside a page (17 px), xs = a label over a strip or a group inside a panel (12px; a count after it and a subtitle under it, no action or icon). */
  size?: 'lg' | 'md' | 'sm' | 'xs';
  /** The heading's level: h2 (default) or h3. */
  as?: 'h2' | 'h3';
  /** The title's id, for what it labels (aria-labelledby). */
  id?: string;
  /** Heads a group in a list (a faction), with count: how many are in it. */
  icon?: IconName;
  /** How many it holds, read inside the heading. */
  count?: ReactNode;
  /** What sits at the end of the row when there is no action, e.g. a key or a button. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * SectionHeader opens a shelf: a heading, the line that explains what is on it, and an optional See all link.
 *
 * Not for a labelled group of rows in a Story panel, with its count (`PanelSection`); the top of a side panel in Story
 * (`PanelHeader`); the top of an app page, with its title-1 and view switch (`PageHeader`); the top of a production view
 * (`ViewHeader`); the label over a single control in a form (`Field`).
 *
 * Accessibility: The title is a heading (`as`, default h2) with its count read inside it, then the subtitle as text, and Tab
 * reaches the See all link, named by `action.ariaLabel` or `action.label` (an action with only `onClick` is a button, never a
 * link to #); the icon is hidden. At size xs the title is plain text, not a heading, with its count and subtitle read after it.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SectionHeader({ title, subtitle, action: a, size, as, id, icon, count, children, className }: SectionHeaderProps) {
  if (size === 'xs') {
    const xc = count !== undefined;
    return (
      <div className={cx('sk-sec', 'sk-sec--xs', subtitle && 'has-sub', className)}>
        <div className="sk-sec__xs">
          <span className={cx('sk-sec__title', xc && 'has-meta')} id={id}>{title}{xc && <span className="sk-sec__count">{count}</span>}</span>
          {subtitle && <p className="sk-sec__sub">{subtitle}</p>}
        </div>
        {children}
      </div>
    );
  }
  const Level = as || 'h2';
  const meta = icon || count !== undefined;
  return (
    <div className={cx('sk-sec', 'sk-sec--' + (size || 'lg'), className)}>
      <div>
        <Level className={cx('sk-sec__title', meta && 'has-meta')} id={id}>
          {icon && <span className="sk-sec__icon"><Icon name={icon} size="var(--section-header-icon-size)" /></span>}
          {title}
          {count !== undefined && <span className="sk-sec__count">{count}</span>}
        </Level>
        {subtitle && <p className="sk-sec__sub">{subtitle}</p>}
      </div>
      {/* An action that goes nowhere is a button, never a link to # */}
      {a
        ? a.href
          ? <a className="sk-sec__action" href={a.href} aria-label={a.ariaLabel} onClick={a.onClick}>{a.label}</a>
          : <button type="button" className="sk-sec__action" aria-label={a.ariaLabel} onClick={a.onClick}>{a.label}</button>
        : children}
    </div>
  );
}
