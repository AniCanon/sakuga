import { cx } from '../../internal/cx';
import { useWords, type WordKey } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './CoverageTable.css';

type CoverState = 'own' | 'gap' | 'idle';

/** Characters: wardrobe coverage, a row per character and a column per occasion. */
export interface CoverageTableProps {
  /** The column headings: the occasions a look can be for. */
  occasions: string[];
  /** One row per character, with a cell per occasion: `own`, `gap` or `idle`, and its words ("2 looks"). */
  rows: { name: string; image?: string; cells: { state: CoverState; label?: string }[] }[];
  /** Names the cell states, over the table. */
  legend?: { state: CoverState; label: string }[];
  /** Counts the gaps and says which script they come from. */
  summary?: string;
  /** The rows' column heading ("Character"). */
  rowLabel?: string;
  /** Names the table for screen readers. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* Characters: wardrobe coverage. A row per character and a column per occasion the scripts ask for; a cell says what they have, a gap that a scene needs one and nothing fits. */
const COVER_SAID: Record<CoverState, WordKey> = { own: 'coverHas', gap: 'coverGap', idle: 'coverIdle' };

/**
 * Wardrobe coverage: a row per character and a column per occasion the scripts ask for.
 *
 * Not for one look and its occasion (`LookPlate`); what one character is ready with (`Readiness`); each cast member's state and
 * next step (`CastGrid`).
 *
 * Accessibility: Not focusable; a table named by `label` with a column header per occasion and a row header per character, each
 * cell read as its label and its state in the legend's words ("2 looks, Has a look"; a cell without a label reads the state
 * alone), and the legend reads as text with its swatches hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CoverageTable({ occasions, rows, legend, summary, rowLabel, label, className }: CoverageTableProps) {
  const tx = useWords(ownWords);
  const said = {} as Record<CoverState, string>;
  (Object.keys(COVER_SAID) as CoverState[]).forEach((k) => { said[k] = tx(COVER_SAID[k]); });
  (legend || []).forEach((l) => { said[l.state] = l.label; });
  return (
    <div className={cx('sk-cover', className)}>
      {legend && (
        <div className="sk-cover__legend">
          {legend.map((l) => <span key={l.state}><i className={'sk-cover__key is-' + l.state} aria-hidden="true" />{l.label}</span>)}
          {summary && <span className="sk-cover__summary">{summary}</span>}
        </div>
      )}
      <table className="sk-cover__table" aria-label={label}>
        <thead><tr><th className="sk-cover__who" scope="col">{rowLabel || tx('character')}</th>{(occasions || []).map((o) => <th key={o} scope="col">{o}</th>)}</tr></thead>
        <tbody>
          {(rows || []).map((r) => (
            <tr key={r.name}>
              <th scope="row" className="sk-cover__who"><span>{r.image && <img src={r.image} alt="" />}{r.name}</span></th>
              {(r.cells || []).map((c, i) => {
                const st = c.state || 'idle';
                return (
                  <td key={i} className={'sk-cover__cell is-' + st}>
                    {c.label ? <>{c.label}<span className="sk-sr">{', ' + said[st]}</span></> : <><span aria-hidden="true">—</span><span className="sk-sr">{said[st]}</span></>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
