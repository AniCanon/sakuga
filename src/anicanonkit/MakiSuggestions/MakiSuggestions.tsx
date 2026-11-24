import { Icon } from '@anicanon/sakuga/ui';
import '../../base.css';
import './MakiSuggestions.css';

export interface MakiSuggestionsProps {
  /** What to ask, phrased as the person would type it. Three or four. */
  items: string[];
  /** A row pressed, with its words. */
  onPick?: (suggestion: string) => void;
  /** The list's name for screen readers ("What to ask"). */
  label?: string;
}

/* What to ask first, as rows that send on a press, phrased as the person would type them. */
/**
 * MakiSuggestions is what to ask Maki first, as rows that send on a press, phrased as the person would type them: rows in the
 * reply's size, parted by hairlines, each with the comment glyph and a chevron. Three or four, never a wall.
 *
 * Not for an answer Maki asks for (`MakiCard` `choices`); a filter or a toggle (`Chip`).
 *
 * Accessibility: A list named "What to ask"; each row is a button that sends its words.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MakiSuggestions({ items, onPick, label }: MakiSuggestionsProps) {
  return (
    <div className="sk-mk-suggest" role="list" aria-label={label}>
      {(items || []).map((s, i) => (
        <div key={i} role="listitem">
          <button type="button" className="sk-mk-suggest__row" onClick={onPick ? () => onPick(s) : undefined}>
            <Icon name="comment" size="var(--mk-suggest-icon-size)" /><span>{s}</span><Icon name="chevron-right" size="var(--mk-suggest-icon-size)" />
          </button>
        </div>
      ))}
    </div>
  );
}
