import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './PropertyList.css';

export interface PropertyListProps {
  /** Names the list for screen readers. */
  label?: string;
  /** The settings: each its name, value and what opens it. */
  items: {
    label: string;
    value: ReactNode;
    icon?: IconName;
    href?: string;
    onClick?: MouseEventHandler;
    /** Whether the choice this row opens is open. */
    expanded?: boolean;
  }[];
  /** slot="action" sits beside the label ("All options"). */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Each kind of setting on one row with what it is set to; a row opens the full choice. A label and an action can sit on top. */
/**
 * PropertyList shows each kind of setting on one row with what it is set to; a row opens the full choice.
 *
 * Not for one section that folds open on its own (`PanelRow`); measured facts that are never edited (`FactList`); every option
 * of one kind, laid out to choose from (`OptionTiles`).
 *
 * Accessibility: A group named by `label`: Tab moves through each row, a button (a link with `href`) announced by its name and
 * value, expanded or collapsed when the item's `expanded` is set, and Enter runs its `onClick` (Space too on a button). Icons
 * and chevrons are hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PropertyList({ label, items, children, className }: PropertyListProps) {
  const sl = slots(children);
  return (
    <div className={cx('sk-props', className)}>
      {(label || sl.get('action')) && <div className="sk-props__head"><span>{label}</span>{sl.get('action')}</div>}
      <div className="sk-props__rows" role="group" aria-label={label}>
        {(items || []).map((it, i) => {
          const Tag = it.href ? 'a' : 'button';
          return (
            <Tag key={i} type={it.href ? undefined : 'button'} href={it.href} className="sk-props__row" onClick={it.onClick} aria-expanded={it.expanded === undefined ? undefined : it.expanded ? 'true' : 'false'}>
              {it.icon ? <Icon name={it.icon} size="var(--props-icon-size)" /> : <span />}
              <span className="sk-props__name">{it.label}</span>
              <span className="sk-props__value">{it.value}</span>
              <Icon name="chevron-down" size="var(--props-chevron-icon-size)" className="sk-props__chev" />
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
