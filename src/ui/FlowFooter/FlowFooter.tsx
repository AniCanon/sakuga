import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { Button } from '../Button/Button';
import { useWords } from '../../internal/words';
import '../../base.css';
import './FlowFooter.css';

export interface FlowFooterProps {
  /** What happens next or what it costs. */
  note?: string;
  /** Back to the step before, as a link (`href`) or a button (`onClick`); its label is "Back" without one. */
  back?: { label?: string; href?: string; onClick?: MouseEventHandler };
  /** The action; slot="start" holds what leaves the step when it is not Back. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* The full-screen flow's footer, inline under the step: Back (or what else leaves the step) on the left, the note and the action on the right */
/**
 * FlowFooter closes a step of the full-screen flow, inline under its content: Back on the left when a step precedes, then the
 * note and the action on the right.
 *
 * Not for the way out of the flow (`FlowHeader`); facts at the foot of a working surface (`StatusBar`).
 *
 * Accessibility: A footer element: Tab reaches Back (a link with `back.href`, otherwise a button running `back.onClick`) and
 * then the actions; the note reads as text between them and the back icon is hidden.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function FlowFooter({ note, back, children, className }: FlowFooterProps) {
  const tx = useWords();
  const sl = slots(children);
  return (
    <footer className={cx('sk-flowfoot', className)}>
      {back ? <Button variant="ghost" icon="back" href={back.href} onClick={back.onClick}>{back.label || tx('back')}</Button> : sl.get('start')}
      <span className="sk-flowfoot__note">{note}</span>
      {sl.body}
    </footer>
  );
}
