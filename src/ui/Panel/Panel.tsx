import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { Icon, type IconName } from '../Icon/Icon';
import { useWords } from '../../internal/words';
import '../../base.css';
import './Panel.css';

export interface PanelProps {
  /** The AniCanon icon at the head, drawn at `panel-icon` size. Hidden from screen readers. */
  icon?: IconName;
  /** Names the panel and its region; a level-3 heading. */
  title?: string;
  /** One line that explains the panel: "Core shot decisions, with a technique library behind them". */
  subtitle?: string;
  /**
   * An action at the head's end (Techniques, a close button). In a narrow column a wide one moves under the words; an icon one
   * stays on their line. Or pass it as `slot="action"`.
   */
  action?: ReactNode;
  /** The open fold of an accordion (PanelRow is the closed one): the head is its button, with the chevron turned up, and it takes the place of `action`. */
  onToggle?: () => void;
  /** With onToggle: the id of what it folds. */
  controls?: string;
  /** One choice among several (a take picked). */
  selected?: boolean;
  /** Part of a side pane: no box, a hairline from the pane above. Never a card in a pane. */
  pane?: boolean;
  /** Or slot="action". */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Panel is a Studio card: an AniCanon icon, a title, one line that explains it, an optional action, then its controls.
 *
 * Not for a folded section showing its current value (`PanelRow`); the top of a side panel in Story (`PanelHeader`); a heading
 * over a shelf (`SectionHeader`); a task that needs the page's whole attention (`Dialog`).
 *
 * Accessibility: A region named by `title`, with the title as a level-3 heading that ends in "selected" when `selected`, and
 * the subtitle as text; the icon is hidden, and the action and controls take focus in order. With `onToggle` the heading holds
 * a button named by the title, expanded, controlling `controls`, whose hit area and focus ring cover the head; Enter or Space
 * closes the fold, and the chevron is hidden.
 *
 * @version 1.5
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Panel({ pane, icon, title, subtitle, action, onToggle, controls, selected, children, className }: PanelProps) {
  const tx = useWords();
  const sl = slots(children), act = action || sl.get('action');
  return (
    <section className={cx('sk-panel', selected && 'is-selected', pane && 'is-pane', className)} aria-label={title}>
      {(title || icon) && (
        <div className={cx('sk-panel__head', onToggle && 'is-toggle')}>
          {icon && <span className="sk-panel__icon"><Icon name={icon} size="var(--panel-icon-size)" /></span>}
          <div>
            <h3 className="sk-panel__title">
              {onToggle ? <button type="button" className="sk-panel__toggle" aria-expanded="true" aria-controls={controls} onClick={onToggle}>{title}</button> : title}
              {selected && <span className="sk-sr">{', ' + tx('selected')}</span>}</h3>
            {subtitle && <p className="sk-panel__sub">{subtitle}</p>}
          </div>
          {onToggle ? <Icon name="chevron-down" size="var(--panel-chevron-icon-size)" className="sk-panel__chev" /> : act && <div className="sk-panel__action">{act}</div>}
        </div>
      )}
      {sl.body}
    </section>
  );
}
