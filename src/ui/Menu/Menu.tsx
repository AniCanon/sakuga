import { Fragment, useRef, type MouseEvent, type MouseEventHandler } from 'react';
import { cx } from '../../internal/cx';
import { GoLink } from '../../internal/link';
import { useRoving } from '../../internal/roving';
import { Icon, type IconName } from '../Icon/Icon';
import { Popover } from '../Popover/Popover';
import '../../base.css';
import './Menu.css';

/** A menu behind a control (a ⋯): rows of an icon and a label, each a link (href) or an action (onClick), left-aligned. One Tab stop; arrows, Home and End move; Escape closes it back to its control. */
export interface MenuProps {
  /** Names the menu: "More for Smith". */
  label: string;
  /** A row each. `tone: 'danger'` for a row that can't be taken back; `separated` puts a rule before it. */
  items: {
    label: string;
    icon?: IconName;
    href?: string;
    onClick?: MouseEventHandler;
    /** Can't be taken back (Delete): the danger tone. */
    tone?: 'danger';
    /** A rule before it, to set it apart. */
    separated?: boolean;
    disabled?: boolean;
  }[];
  /** As on Popover: whether it shows. */
  open?: boolean;
  /** Runs on Escape, a press outside and after a row is chosen; focus goes back to the control. */
  onClose?: () => void;
  /** As on Popover: sits under what opened it. */
  anchored?: boolean;
  /** As on Popover: lines up with the start or end edge of what opened it, at its own width. */
  align?: 'start' | 'end';
  /** Extra class on the root element. */
  className?: string;
}

/* A menu behind a control (a ⋯): rows of an icon and a label, each a link or an action, left-aligned. One Tab stop: the arrows,
   Home and End move through it, Escape closes it and focus returns to the control that opened it. A row that can't be taken back
   (Delete) takes the danger tone and sits after a rule. */
/**
 * A menu behind a control, most often a ⋯ `IconButton`: rows of an icon and a label, left-aligned, each a link (`href`) or an
 * action (`onClick`). It is a `Popover` with the role of a menu, so it drops from its control, plays open and close with sound
 * on, and leaves as a Popover does.
 *
 * Accessibility: A menu named by `label`, its rows menu items (a link or a button) and one Tab stop: Up and Down move and wrap,
 * Home and End go to the first and last, Enter or Space chooses, Escape closes it and focus goes back to the control that
 * opened it. A disabled row is skipped and said as unavailable; the rule is a separator. In forced colours the focused row
 * keeps its ring, in Highlight.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Menu({ label, items, open, onClose, anchored, align, className }: MenuProps) {
  const box = useRef<HTMLDivElement>(null);
  const keys = useRoving(box, { selector: '[role="menuitem"]', axis: 'y', active: '[data-first]' });
  return (
    <Popover open={open} onClose={onClose} role="menu" label={label} align={align} anchored={anchored} className={cx('sk-menu', className)} onKeyDown={keys}>
      <div ref={box} className="sk-menu__items" role="none">
        {items.map((it, i) => {
          const run = (e: MouseEvent<HTMLElement>) => {
            if (it.disabled) { e.preventDefault(); return; }
            if (it.onClick) it.onClick(e);
            if (onClose) onClose();
          };
          return (
            <Fragment key={i}>
              {it.separated && i > 0 && <div role="separator" className="sk-menu__rule" />}
              <GoLink href={it.href} onClick={run} role="menuitem" className={cx('sk-menu__item', it.tone === 'danger' && 'is-danger')}
                aria-disabled={it.disabled ? 'true' : undefined} tabIndex={it.disabled ? -1 : undefined} data-first={i === 0 ? '' : undefined}>
                {it.icon && <Icon name={it.icon} size="var(--menu-item-icon-size)" />}
                <span className="sk-menu__label">{it.label}</span>
              </GoLink>
            </Fragment>
          );
        })}
      </div>
    </Popover>
  );
}
