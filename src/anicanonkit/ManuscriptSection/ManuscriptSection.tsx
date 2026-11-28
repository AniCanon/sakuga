import { useEffect, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { Icon, Menu } from '@anicanon/sakuga/ui';
import '../../base.css';
// The told button takes TextLink's focus ring (its radius and offset)
import '../../ui/TextLink/TextLink.css';
import './ManuscriptSection.css';

/** Slots: slot="margin" (proposals beside the section), slot="overlay" (a hover card or toolbar). */
export interface ManuscriptSectionProps {
  /** The section's number in the script. */
  number: number;
  /** Its heading. */
  title?: string;
  /** Sets the title as a screenplay slugline (INT. SÉ STATION · NIGHT). */
  slug?: boolean;
  /** How many words it holds, shown beside the heading. */
  words?: number;
  /** The section being written. */
  current?: boolean;
  /**
   * The scene this one happens at the same time as ("At the same time as #4 · Toddy's bedroom"), with how the two are told
   * ("Cut between them"); the number rule runs on from that scene into this one.
   */
  with?: {
    number: number;
    title: string;
    told?: string;
    /** How the two are told now: the told menu checks it. */
    how?: 'between' | 'after';
  };
  /**
   * With `with.told`: the told words open a menu (Cut between them · One after the other · Not at the same time) and this is
   * called with the choice. 'apart' unlinks the two; the app offers Undo.
   */
  onTold?: (how: 'between' | 'after' | 'apart') => void;
  /** Draws the told menu open (a board). */
  toldOpen?: boolean;
  /** What sits beside the section (as slot="margin"). */
  margin?: ReactNode;
  /** A hover card or toolbar (as slot="overlay"). */
  overlay?: ReactNode;
  /** The section's words: ScreenplayLines or paragraphs. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * ManuscriptSection is one numbered section of a scene note or an imported script: #number, title (or a slugline with `slug`),
 * the prose, the word count.
 *
 * Not for one block of a screenplay inside it (`ScreenplayLine`); the whole page with its tools and status (`Manuscript`);
 * something found in the words (`ProposalCard`); a shelf's heading (`SectionHeader`).
 *
 * Accessibility: Not focusable; read as "#" and its number, the title as a level-3 heading, the prose and its word count ("240
 * words"), the section being written (`current`) is marked "current", and `with` reads as its line ("At the same time as #4 ·
 * Toddy's bedroom"). With `onTold` the told words are a button Tab reaches, named "How the two are told: Cut between them", with a
 * menu popup; Up and Down move through it, Enter chooses, Escape closes it and focus goes back to the words. The margin's proposals
 * follow in reading order.
 *
 * @version 1.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ManuscriptSection({ number, title, slug, words, current, with: w, onTold, toldOpen, margin, overlay, children, className }: ManuscriptSectionProps) {
  const tx = useWords(ownWords);
  const [told, setTold] = useState(!!toldOpen);
  useEffect(() => { if (toldOpen) setTold(true); }, [toldOpen]);
  const pick = (how: 'between' | 'after' | 'apart') => () => onTold?.(how);
  const toldWords = w?.told && (onTold
    ? <span className="sk-msec__told">
      <button type="button" className="sk-msec__toldbtn" aria-haspopup="menu" aria-expanded={told ? 'true' : 'false'} aria-label={tx('toldHow', { told: w.told })} onClick={() => setTold(!told)}>
        {w.told}<Icon name="chevron-down" size="var(--manuscript-with-icon-size)" />
      </button>
      {told && <Menu label={tx('toldHow', { told: w.told })} align="start" onClose={() => setTold(false)} items={[
        { label: tx('toldBetween'), onClick: pick('between'), checked: w.how ? w.how === 'between' : undefined },
        { label: tx('toldAfter'), onClick: pick('after'), checked: w.how ? w.how === 'after' : undefined },
        { label: tx('notSameTime'), onClick: pick('apart'), separated: true }]} />}
    </span>
    : w.told);
  const sl = slots(children);
  const side = margin || sl.get('margin');
  return (
    <div className={cx('sk-msec', current && 'is-current', w && 'is-with', className)} aria-current={current ? 'true' : undefined}>
      <div className="sk-msec__text"><span className="sk-msec__no">{'#' + number}</span>
        <div className="sk-msec__body">{title && <h3 className={slug ? 'is-slug' : undefined}>{title}</h3>}
          {w && <div className="sk-msec__with"><Icon name="link" size="var(--manuscript-with-icon-size)" /><span>{tx('sameTimeAs', { number: w.number, title: w.title })}{toldWords && ' · '}{toldWords}</span></div>}
          <div className="sk-msec__prose">{sl.body}</div>
          {words !== undefined && <span className="sk-msec__words">{tx('wordCount', { count: words })}</span>}{overlay || sl.get('overlay')}</div>
      </div>
      {side && <div className="sk-msec__margin">{side}</div>}
    </div>
  );
}
