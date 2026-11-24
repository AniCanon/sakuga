import { Fragment } from 'react';
import { SectionHeader } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { MangaPage, type MangaPageProps } from '../MangaPage/MangaPage';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './IssueStrip.css';

/** Manga: the issue as the reader turns it. Covers stand alone, content pages pair into spreads, a rule marks every page turn. */
export interface IssueStripProps {
  /** The issue's spreads, each a list of MangaPage props; mark the open page `selected`. */
  spreads: MangaPageProps[][];
  /** Page width; 30 in the editor, 56 in Layout. */
  size?: number;
  /** A selected page selects its whole spread (Spread mode). */
  selectSpread?: boolean;
  /** The header; false hides it. */
  label?: string | false;
  /** The key in the header for the page-turn rule between spreads (default "Page turn"). */
  turnLabel?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* Manga: the issue as the reader turns it. Covers stand alone, content pages pair into spreads, and a rule marks every page turn. */
/**
 * IssueStrip shows the issue as the reader turns it: the cover alone, then the content pages paired into spreads, with a rule
 * at every page turn.
 *
 * Not for Proof, every page with how far it has come (`PageWall`); one page on its own (`MangaPage`); a page's panels,
 * lettering and sound effects (`LayerStrip`); an issue on a shelf (`MediaCard`).
 *
 * Accessibility: Not focusable; its label (default "The issue, spread by spread") and key read as text, then a list named
 * "Spreads", each spread a list item holding its pages as images (named by `label` or `alt`, else "Page", with "selected"), the
 * one `selectSpread` rings starting with "Selected spread", and the page-turn rules hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function IssueStrip({ spreads: given, size, selectSpread, label, turnLabel, className }: IssueStripProps) {
  const tx = useWords(ownWords);
  const w = size || 30, spreads = given || [];
  return (
    <div className={cx('sk-istrip', className)}>
      {label !== false && <SectionHeader size="xs" title={label || tx('issueBySpread')}><span className="sk-istrip__key">{turnLabel || tx('pageTurn')}</span></SectionHeader>}
      <div className="sk-istrip__row" role="list" aria-label={tx('spreads')}>
        {spreads.map((sp, i) => {
          const whole = selectSpread && sp.some((p) => p.selected);
          return (
            <Fragment key={i}>
              {i > 0 && <span className="sk-istrip__turn" aria-hidden="true" />}
              <span className={cx('sk-istrip__spread', whole && 'is-selected')} role="listitem">
                {whole && <span className="sk-sr">{tx('selectedSpread') + ' '}</span>}
                {sp.map((p, j) => <MangaPage key={j} {...p} width={w} title={undefined} meta={undefined} selected={!selectSpread && p.selected} />)}
              </span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
