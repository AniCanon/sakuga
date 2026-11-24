import { Fragment, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import '../../base.css';
import './StatusBar.css';

export interface StatusBarProps {
  /** Or children, in order. */
  items?: ReactNode[];
  /** Or slot="end". */
  end?: ReactNode;
  /** Or slot="status". */
  status?: ReactNode;
  /** The view's status: short facts and what is saved. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Only the slot="status" child (the saved state) is read when it changes: its region is always there, so a change is heard, and a
   word count changing with every keystroke stays quiet */
/**
 * StatusBar is the slim bar at the foot of a working surface such as the writing room: where the work sits, whether it is
 * saved, how long it is.
 *
 * Not for actions on the work (`ViewHeader`); the transport and timecode under the editor's picture (`MonitorBar`); the foot of
 * a step in a full-screen flow (`FlowFooter`); confirming that something finished (`Toast`).
 *
 * Accessibility: Not focusable itself; its items read as text in order and anything focusable in them takes focus. Only the
 * `slot="status"` child (or `status`) is read when it changes, through a status region that is always there.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StatusBar({ items: given, end, status: said, children, className }: StatusBarProps) {
  const sl = slots(children);
  const items = given || sl.main, status = said || sl.get('status');
  return (
    <div className={cx('sk-statusbar', className)}>
      {items.map((it, i) => <Fragment key={i}>{i > 0 && <span className="sk-statusbar__sep" />}<span className="sk-statusbar__item">{it}</span></Fragment>)}
      {status && items.length > 0 && <span className="sk-statusbar__sep" />}
      <span role="status" className={status ? 'sk-statusbar__item' : 'sk-sr'}>{status}</span>
      <span className="sk-statusbar__end">{end || sl.get('end')}</span>
    </div>
  );
}
