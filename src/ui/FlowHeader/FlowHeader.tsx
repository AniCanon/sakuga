import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { IconButton } from '../IconButton/IconButton';
import { Stepper } from '../Stepper/Stepper';
import { useWords } from '../../internal/words';
import '../../base.css';
import './FlowHeader.css';

export interface FlowHeaderProps {
  /** What is being made ("New issue"). */
  title: string;
  /** What it is for ("Bad Memories"). */
  context?: string;
  /** What closing does, e.g. "Close. Nothing is created". Default "Close". */
  closeLabel?: string;
  /** Makes Close a link to where closing goes. */
  closeHref?: string;
  /** Close's press, when it has no `closeHref`. */
  onClose?: MouseEventHandler;
  /** The flow's steps, drawn as a Stepper when there are more than one. */
  steps?: string[];
  /** The step open now, by index. */
  current?: number;
  /** Names the steps for screen readers. */
  stepsLabel?: string;
  /** slot="end" (or the children): what sits at the end, the balance in AniCanon. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* The full-screen flow's top bar: close (nothing is kept), what is being made and for what, the steps when there are several, then what sits at the end */
/**
 * FlowHeader is the full-screen flow's top bar: close (nothing is kept), what is being made and for what, the steps when there
 * are several, then what sits at the end.
 *
 * Not for Back and the step's action (`FlowFooter`); the desktop header of the app (`TopNav`); the top of a production view
 * (`ViewHeader`); the editor's top bar (`EditorHeader`).
 *
 * Accessibility: A header element: Tab reaches the close button (named by `closeLabel`, default "Close"; a link with
 * `closeHref`) and then whatever sits at the end. The title and context are a level-1 heading, and the steps are a list named
 * by `stepsLabel` (default "Steps") with the current one marked "current step".
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function FlowHeader({ title, context, closeLabel, closeHref, onClose, steps, current, stepsLabel, children, className }: FlowHeaderProps) {
  const tx = useWords();
  const sl = slots(children);
  return (
    <header className={cx('sk-flowhead', className)}>
      <IconButton variant="plain" icon="close" label={closeLabel || tx('close')} href={closeHref} onClick={onClose} />
      <p className="sk-flowhead__title" role="heading" aria-level={1}>{title}{context && <span>{' · ' + context}</span>}</p>
      {steps && <Stepper steps={steps} current={current ?? 0} label={stepsLabel} className="sk-flowhead__steps" />}
      <span className="sk-flowhead__end">{sl.get('end') || sl.body}</span>
    </header>
  );
}
