import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import '../../base.css';
import './PanelSection.css';

/** Slot: slot="footer". */
export interface PanelSectionProps {
  /** The group's heading. */
  label: string;
  /** How many rows it holds, beside the heading. */
  count?: string | number;
  /** The line after the rows (as slot="footer"). */
  footer?: ReactNode;
  /** The rows, EntityRows; a short line after them as slot="footer". */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * PanelSection is a labelled group of rows with its count on the right ("Changes 3").
 *
 * Not for the head of the panel itself (`PanelHeader`); a group outside Story, such as a faction in a list (`SectionHeader`);
 * Studio's folded section with its current value (`PanelRow`); rows outside Story that open pages (`List`).
 *
 * Accessibility: Not focusable itself; the label and its count are a level-3 heading ("Changes 3"), then the rows and the
 * footer read in order.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PanelSection({ label, count, footer, children, className }: PanelSectionProps) {
  const sl = slots(children);
  return (
    <section className={cx('sk-psec', className)}>
      <p className="sk-psec__label" role="heading" aria-level={3}>{label}{count !== undefined && count !== '' && <span>{count}</span>}</p>
      <div className="sk-psec__body">{sl.body}</div>{footer || sl.get('footer')}
    </section>
  );
}
