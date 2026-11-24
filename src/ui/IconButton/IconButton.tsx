import { useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './IconButton.css';

type Native = Omit<ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'>;

export interface IconButtonProps extends Native {
  /** Leave out when passing custom children (the CC box). */
  icon?: IconName;
  /** Required accessible name, e.g. "Share EBA". */
  label: string;
  /** solid on desktop, media over video or pages, plain inside a bar, primary for the one action as an icon alone. */
  variant?: 'solid' | 'media' | 'plain' | 'primary';
  /** `md` (44 px, default) or `lg` (52 px) for the desktop action rail. */
  size?: 'md' | 'lg';
  /** Pixels, or a size token: SearchField's clear passes var(--search-clear-icon-size), where index.d.ts still says number. */
  iconSize?: number | string;
  /** Makes it a toggle (aria-pressed). A link is never a toggle: a pressed link is the current one (aria-current). */
  pressed?: boolean;
  /** Something waits behind it, e.g. unread notifications on the bell: the state dot on the glyph's corner. Say how many in the label. */
  attention?: boolean;
  /** Renders a link instead of a button, for an icon that goes somewhere (Back, Open in Cut). With disabled it stays a button. */
  href?: string;
  /** Drawn in place of the icon (the CC box). */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * IconButton is a circular control holding one icon, with a required accessible `label`.
 *
 * Not for an action whose meaning needs a word (`Button`); a glyph that only decorates (`Icon`); asking Maki (`AskMaki`).
 *
 * Accessibility: A button (a link with `href`): Tab reaches it, Enter activates it, and Space does too on a button; the icon is
 * hidden. Name it with `label`; without one it has no name, and with `pressed` set it is a toggle announced "pressed" or "not
 * pressed". A link is never a toggle: a pressed link is said to be the current one (`aria-current`) and keeps the pressed look.
 * With `href` and `disabled` it is a disabled button. In forced colours it keeps an edge, and pressed takes Highlight.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function IconButton({ icon, label, variant, size, className, iconSize, pressed, attention, children, ...rest }: IconButtonProps) {
  /* The glyph settles in once each time it is turned on: a new key mounts a new icon with is-flip */
  const [flip, setFlip] = useState({ on: !!pressed, n: 0 });
  if (!!pressed !== flip.on) setFlip({ on: !!pressed, n: flip.n + (pressed ? 1 : 0) });
  /* A disabled link is drawn as a disabled button; a link is never pressed, so a pressed link says it is the current one */
  const link = !!rest.href && !rest.disabled;
  if (!link) delete rest.href;
  if (!link && rest.type === undefined) rest.type = 'button';
  if (pressed !== undefined && !link) rest['aria-pressed'] = pressed ? 'true' : 'false';
  if (link && pressed) rest['aria-current'] = 'true';
  const Tag = link ? 'a' : 'button';
  return (
    <Tag
      className={cx('sk-ib', 'sk-ib--' + (variant || 'solid'), size === 'lg' && 'sk-ib--lg', attention && 'is-attention', link && pressed && 'is-pressed', className)}
      aria-label={label}
      {...rest}
    >
      {children || <Icon key={flip.n} className={flip.n ? 'is-flip' : undefined} name={icon!} size={iconSize || 'var(--icon-button-icon-size)'} />}
    </Tag>
  );
}
