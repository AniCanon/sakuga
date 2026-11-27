import { useRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useScrollEnds } from '../../internal/scrollEnds';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../../ui/TextLink/TextLink.css';
import '../ManuscriptSection/ManuscriptSection.css';
import './Manuscript.css';

/** Slots: slot="toolbar", slot="footer" (a StatusBar). */
export interface ManuscriptProps {
  /** Names the script for screen readers. */
  label?: string;
  /** The ManuscriptSections, in order; a toolbar as slot="toolbar" and a StatusBar as slot="footer". */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Writing: the script's page, with its tools on top and what it reports under it */
/**
 * Manuscript is the script's page: its tools on top (the block type, where the cursor is), the sections, and what it reports
 * under them (saved, length, Maki's check).
 *
 * Not for one numbered section (`ManuscriptSection`); a scene read as cuts (`CutSheet`); Studio's prompt (`PromptComposer`); a
 * long text in a form (`TextField`).
 *
 * Accessibility: A region named by `label` (default "Script"); its toolbar, sections and footer read and take focus in order.
 * While the body scrolls it is itself a Tab stop, a group named "Scenes", so the arrows and Page Up and Page Down scroll it;
 * when everything fits it is no stop at all.
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Manuscript({ label, children, className }: ManuscriptProps) {
  const tx = useWords(ownWords);
  const sl = slots(children);
  const body = useRef<HTMLDivElement>(null), ends = useScrollEnds(body);
  return (
    <section className={cx('sk-manuscript', className)} aria-label={label || tx('script')}>
      {sl.get('toolbar') && <div className="sk-manuscript__tools">{sl.get('toolbar')}</div>}
      {/* While the body scrolls it is a Tab stop, a group named "Scenes", so the arrows and Page Up and Down scroll it; when everything
          fits it is no stop at all */}
      <div ref={body} className="sk-manuscript__body" tabIndex={ends ? 0 : undefined} role={ends ? 'group' : undefined} aria-label={ends ? tx('manuscriptScenes') : undefined}>{sl.body}</div>{sl.get('footer')}
    </section>
  );
}
