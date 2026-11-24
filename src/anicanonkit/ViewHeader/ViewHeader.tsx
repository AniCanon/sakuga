import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import '../../base.css';
import '../../ui/IconButton/IconButton.css';
import '../EditorShell/EditorShell.css';
import './ViewHeader.css';

export interface ViewHeaderProps {
  /** The view's name, as its heading. */
  title: string;
  /** A small line over the title: the production it is part of. */
  eyebrow?: string;
  /** A quiet line beside the title: where it stands. */
  meta?: string;
  /** The view's actions. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * ViewHeader opens a production view: the view as a quiet `eyebrow`, the `title` (one line, cut with an ellipsis), the `meta`
 * under it, and the view’s actions on the right as children (Maki, then at most one primary).
 *
 * Not for the top of an app page beside the SideNav (`PageHeader`); opening a shelf (`SectionHeader`); the head of a side panel
 * or an inspector (`PanelHeader`); the editor's top bar with its timecode (`EditorHeader`); the top bar of a full-screen flow
 * (`FlowHeader`).
 *
 * Accessibility: The title is a level-1 heading, with the eyebrow before it and the meta after it read as text; the actions on
 * the right take focus in order.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ViewHeader({ title, eyebrow, meta, children, className }: ViewHeaderProps) {
  const sl = slots(children);
  return (
    <div className={cx('sk-viewhead', className)}>
      <div className="sk-viewhead__text">
        {eyebrow && <span className="sk-viewhead__eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {meta && <span className="sk-viewhead__meta">{meta}</span>}
      </div>
      <span className="sk-editor__fill" />
      {sl.body}
    </div>
  );
}
