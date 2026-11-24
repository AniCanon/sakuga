import { useRef, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useRoving } from '../../internal/roving';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { IconButton } from '../IconButton/IconButton';
import '../../base.css';
import './FloatingToolbar.css';

export interface FloatingToolbarProps {
  /** Default "Selection". */
  label?: string;
  /** Makes it a selection's bar: the words for what is selected ("3 selected"), shown after Clear and read with the label. */
  count?: string;
  /** With count: Clear, an × before the count. */
  onClear?: () => void;
  /** Clear's name; "Clear selection" by default. */
  clearLabel?: string;
  /** Position it just above the selection. */
  style?: CSSProperties;
  /** Its ghost buttons, three at most. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * FloatingToolbar sits over a selection and offers what can be done with it.
 *
 * Not for a menu opened from a control (`Popover`); the actions of a view (`ViewHeader`); the edit buttons under the editor's
 * picture (`MonitorBar`).
 *
 * Accessibility: A toolbar named by `label` (default "Selection") and its `count` ("Selected takes, 3 selected") that is one
 * Tab stop: arrows move between its buttons, Home and End go to either end, and Tab comes back to the one last focused.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function FloatingToolbar({ label, count, onClear, clearLabel, style, children, className }: FloatingToolbarProps) {
  const tx = useWords(ownWords);
  const box = useRef<HTMLDivElement>(null), keys = useRoving(box, { selector: 'button,a[href],[role="button"],[role="switch"],[role="checkbox"]', axis: 'x' });
  const name = label || tx('selection'), counted = count !== undefined;
  return (
    <div ref={box} className={cx('sk-ftoolbar', counted && 'has-count', className)} role="toolbar" aria-label={counted ? `${name}, ${count}` : name} style={style} onKeyDown={keys}>
      {counted && onClear && <IconButton variant="plain" icon="close" label={clearLabel || tx('clearSelection')} onClick={onClear} />}
      {counted && <span className="sk-ftoolbar__count" aria-hidden="true">{count}</span>}
      {counted && <span className="sk-ftoolbar__rule" aria-hidden="true" />}
      {children}
    </div>
  );
}
