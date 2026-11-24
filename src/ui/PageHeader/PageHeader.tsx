import { createElement, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import '../../base.css';
import './PageHeader.css';

export interface PageHeaderProps {
  /** The page's name, its heading. */
  title: string;
  /** What the page holds; it may run to two lines. */
  lead?: string;
  /** The title's heading level; h1 by default. */
  as?: 'h1' | 'h2';
  /** The title's id, for what it labels (aria-labelledby). */
  id?: string;
  /** slot="views" (a SegmentedControl) and slot="action" (its one primary Button) sit on the title's line. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* The top of an app page: its title (the page's one level-1 heading), the lead under it, and at the end the view switch and the one
   primary action, held level with the title's line however far the lead runs. Below 768 px the switch takes its own row under the lead */
/**
 * PageHeader opens an app page: its `title`, the `lead` under it that says what the page holds, and at the end the page's view
 * switch (`slot="views"`) and its one primary action (`slot="action"`).
 *
 * Not for opening a shelf or a section inside a page (`SectionHeader`); the top of a production view, with its eyebrow and Maki
 * (`ViewHeader`); the top bar of a full-screen flow (`FlowHeader`); the head of a side panel or an inspector (`PanelHeader`).
 *
 * Accessibility: A header landmark whose title is a level-1 heading (`as` changes the level), read before the lead as text; Tab
 * reaches the view switch, then the action. Below 768 px the action sits on the title's line while the switch follows the lead,
 * so the order read and tabbed is title, lead, switch, action.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PageHeader({ title, lead, as, id, children, className }: PageHeaderProps) {
  const sl = slots(children), views = sl.get('views'), action = sl.get('action');
  return (
    <header className={cx('sk-pagehead', views && 'has-views', action && 'has-action', className)}>
      {createElement(as || 'h1', { className: 'sk-pagehead__title', id }, title)}
      {lead && <p className="sk-pagehead__lead">{lead}</p>}
      {(views || action) && (
        <div className="sk-pagehead__end">
          {views && <div className="sk-pagehead__views">{views}</div>}
          {action && <div className="sk-pagehead__action">{action}</div>}
        </div>
      )}
    </header>
  );
}
