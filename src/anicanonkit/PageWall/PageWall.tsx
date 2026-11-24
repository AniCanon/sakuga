import { cx } from '../../internal/cx';
import { MangaPage, type MangaPageProps } from '../MangaPage/MangaPage';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../IssueStrip/IssueStrip.css';
import './PageWall.css';

/** Manga Proof: every page at once, in spreads, each with its caption and its stage. */
export interface PageWallProps {
  /** The issue's spreads, each one or two pages, as for IssueStrip; each page adds `title`, `meta` and `stage`. */
  spreads: (MangaPageProps & {
    /** 0–4: how many of `steps` it has passed. */
    stage?: number;
  })[][];
  /** Each page's width in px. */
  size?: number;
  /** Spreads to a row (3 on desktop). */
  columns?: number;
  /** Default: Laid out, Drawn, Lettered, Proofed. */
  steps?: string[];
  /** Names the wall for screen readers. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* Manga: every page of the issue at once, in spreads, each saying where it is (laid out, drawn, lettered, proofed), with the page turns between */
/**
 * PageWall is Proof: every page of the issue at once, in spreads, each with its caption and how far it has come.
 *
 * Not for placing a page in its issue while editing (`IssueStrip`); editing a page (`EditorShell`); one page on its own
 * (`MangaPage`).
 *
 * Accessibility: Not focusable; a list named by `label` (default "The whole issue") with a spread per item: each page is an
 * image named by its `label`, `alt` or `title`, then its title, meta and stage (an image named by its step) read as text, with
 * a "Page turn" separator between spreads.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PageWall({ spreads: given, size, columns, steps: names, label, className }: PageWallProps) {
  const tx = useWords(ownWords);
  const w = size || 104, cols = columns || 3, steps = names || [tx('wallLaidOut'), tx('wallDrawn'), tx('wallLettered'), tx('wallProofed')], spreads = given || [];
  return (
    <div className={cx('sk-wall', className)} style={{ gridTemplateColumns: 'repeat(' + cols + ', max-content)' }} role="list" aria-label={label || tx('wholeIssue')}>
      {spreads.map((sp, i) => {
        const rowEnd = (i + 1) % cols === 0 || i === spreads.length - 1;
        return (
          <div key={i} className="sk-wall__cell" role="listitem">
            <div className="sk-wall__spread">
              {sp.map((p, j) => (
                <div key={j} className="sk-wall__page" style={{ width: w }}>
                  <MangaPage {...p} width={w} title={undefined} meta={undefined} label={p.label || p.alt || p.title} />
                  <div className="sk-wall__cap">
                    {p.title && <b>{p.title}</b>}
                    {p.meta && <span>{p.meta}</span>}
                    {p.stage !== undefined && (
                      <span className="sk-wall__stage" role="img" aria-label={steps[Math.max(0, p.stage - 1)]}>
                        {steps.map((_, k) => <i key={k} className={k < p.stage! ? 'is-on' : undefined} />)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!rowEnd && <span className="sk-istrip__turn" role="separator" aria-label={tx('pageTurn')} />}
          </div>
        );
      })}
    </div>
  );
}
