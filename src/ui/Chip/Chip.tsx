import { Children, cloneElement, isValidElement, useLayoutEffect, useRef, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { useComings } from '../../internal/comings';
import { cx } from '../../internal/cx';
import { FOCUSABLE } from '../../internal/focus';
import { textOf } from '../../internal/text';
import { Icon, type IconName } from '../Icon/Icon';
import { useWords } from '../../internal/words';
import '../../base.css';
import './Chip.css';

type Native = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

export interface ChipProps extends Native {
  /** The chip shown chosen; it reads as pressed. */
  selected?: boolean;
  /** A leading glyph, in the accent. */
  icon?: IconName;
  /** soft: one of a multi-select set, such as traits; chosen ones take a soft fill with an accent edge. */
  variant?: 'soft';
  /** A choice already made that a press takes away: drawn chosen, named "Remove …" (removeLabel), never a pressed toggle. */
  removable?: boolean;
  /** Default "Remove". */
  removeLabel?: string;
  /** Its words. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/** Chip.Group names a row of chips. */
export interface ChipGroupProps {
  /** Names the group of chips. */
  label: string;
  /** One row that scrolls sideways (phones). */
  scroll?: boolean;
  /** The chips; exactly one is selected. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Chips given keys arrive and leave: one added after the group first drew rises in, and one removed keeps its place while it fades
   out, inert and hidden, so it can neither be pressed again nor heard. Chips without keys simply draw. */
function ChipGroup({ label, scroll, children, className }: ChipGroupProps) {
  const kids = Children.toArray(children).filter(isValidElement) as ReactElement<ChipProps>[];
  const keyed = kids.length > 0 && kids.every((c) => /^\.\$/.test(String(c.key)));
  const comings = useComings(keyed ? kids : [], '--chip-leave-animation');
  const shown = keyed ? comings.map((m) => {
    if (!m.state) return m.item;
    /* inert is not one of React 18's attributes; as a string it is written to the element as it is */
    return cloneElement(m.item, (m.state === 'leaving' ? { className: cx(m.item.props.className, 'is-leaving'), tabIndex: -1, 'aria-hidden': 'true', inert: '', onClick: undefined }
      : { className: cx(m.item.props.className, 'is-arriving') }) as Partial<ChipProps>);
  }) : children;
  /* Focus never falls to the page: a chip that leaves with focus on it hands focus to the chip now in its place, else the last one */
  const box = useRef<HTMLDivElement>(null), held = useRef<Element | null>(null);
  useLayoutEffect(() => {
    const c = held.current, now = document.activeElement;
    if (!c || !box.current || !c.classList.contains('is-leaving') || (now && now !== document.body && !c.contains(now))) return;
    const all = Array.from(box.current.children), live = (x: Element) => !x.classList.contains('is-leaving');
    const to = all.slice(all.indexOf(c)).filter(live)[0] || all.filter(live).pop();
    held.current = null;
    if (to) ((to.matches(FOCUSABLE) ? to : to.querySelector(FOCUSABLE) || to) as HTMLElement).focus();
  });
  return (
    <div ref={box} className={cx('sk-chips', scroll && 'sk-chips--scroll', className)} role="group" aria-label={label}
      onFocus={(e) => { let c: Element | null = e.target; while (c && c.parentElement !== box.current) c = c.parentElement; held.current = c; }}>{shown}</div>
  );
}

function ChipButton({ selected, icon, variant, removable, removeLabel, children, className, ...rest }: ChipProps) {
  const tx = useWords();
  const rm = !!removable;
  return (
    <button type="button" className={cx('sk-chip', variant === 'soft' && 'sk-chip--soft', rm && 'is-removable', className)} aria-pressed={rm ? undefined : selected ? 'true' : 'false'}
      aria-label={rm ? (removeLabel ? removeLabel + ' ' + textOf(children) : tx('removeItem', { name: textOf(children) })) : undefined} {...rest}>
      {icon && (
        <span className="sk-chip__icon" aria-hidden="true">
          <Icon name={icon} size={variant === 'soft' ? 'var(--chip-soft-icon-size)' : 'var(--chip-icon-size)'} />
        </span>
      )}
      {children}
    </button>
  );
}

/* Mounted as Chip.Group, as the design system has it (there is no ChipGroup) */
/**
 * Chip filters a feed by kind: All, Episodes, Shorts, Manga, Following.
 *
 * Not for running an action (`Button`); two to four views of the same thing (`SegmentedControl`); words the person keeps and
 * removes (`TagList`); a label on artwork or a state on a surface (`Badge`).
 *
 * Accessibility: Tab focuses each chip; Enter or Space runs `onClick`. A screen reader hears the group named by Chip.Group's
 * `label`, then each chip as a button, "pressed" when `selected` (a `removable` one is a plain button, "Remove Smith"); the
 * icon is hidden. When a keyed chip leaves the group with focus on it, focus goes to the chip now in its place, else the last
 * one. In forced colours each chip keeps an edge, and a selected one takes Highlight. A soft chip is a 44px target, though it
 * draws at 32px.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export const Chip = /* @__PURE__ */ Object.assign(ChipButton, { Group: ChipGroup });
