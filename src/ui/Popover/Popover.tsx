import { useRef, type CSSProperties, type KeyboardEvent, type KeyboardEventHandler, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useFocusScope } from '../../internal/focus';
import { usePresence } from '../../internal/presence';
import '../../base.css';
import './Popover.css';

export interface PopoverProps {
  /** The surface's id, for a control's aria-controls (SideNav's switcher). */
  id?: string;
  /** false plays its exit, then it unmounts. Default true. */
  open?: boolean;
  /** Keys pressed inside it, before its own Escape. */
  onKeyDown?: KeyboardEventHandler;
  /** With it, the popover takes focus while open; Escape or a press outside runs it, and focus goes back. */
  onClose?: () => void;
  /**
   * Pinned under what opened it (default): wrap that in a relative container and put the Popover inside. `false` places it by
   * `style`.
   */
  anchored?: boolean;
  /** Anchored with its own width, lined up with the anchor's start or end edge (default: the anchor's width). */
  align?: 'start' | 'end';
  /** Names the surface for screen readers. */
  label?: string;
  /** The surface's role (default dialog), e.g. menu. */
  role?: string;
  /** Inline style on the root element. */
  style?: CSSProperties;
  /** Its content: a menu, a small form, a hover card. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* With onClose it takes focus while open: Escape or a press outside closes it and focus goes back. Without, it never moves focus,
   so a hover card stays where the pointer put it. */
/**
 * Popover is a raised surface that floats over the page: a menu, a hover card, a small form.
 *
 * Not for a list of options with search (`Picker`); a task that needs the page's whole attention (`Dialog`); the same choices
 * on a phone (`Sheet`).
 *
 * Accessibility: A dialog named by `label` (`role` changes the role). With `onClose` it takes focus while open (its first
 * control, else itself), and a press on its words keeps focus inside; Escape, a press outside or Tab out of it runs `onClose`,
 * and after Escape focus goes back to what opened it; without `onClose` it never moves focus.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Popover({ id, open, onKeyDown, onClose, anchored, align, label, role, style, children, className }: PopoverProps) {
  const p = usePresence(open !== false, '--popover-leaving-drop-out-animation'), box = useRef<HTMLDivElement>(null);
  const keys = useFocusScope(box, { open: open !== false && !!onClose, onClose, outside: true });
  if (!p.mounted) return null;
  const onKey = onKeyDown || onClose ? (e: KeyboardEvent) => { if (onKeyDown) onKeyDown(e); if (onClose) keys(e); } : undefined;
  return (
    <div ref={box} id={id} className={cx('sk-popover', anchored !== false && 'is-anchored', align && 'is-' + align, p.leaving && 'is-leaving', className)} role={role || 'dialog'} aria-label={label} style={style} onKeyDown={onKey}>
      {children}
    </div>
  );
}
