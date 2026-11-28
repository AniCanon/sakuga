import { useEffect, useRef, useState } from 'react';
import { cx } from '../../internal/cx';
import { GoLink } from '../../internal/link';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../ListRow/ListRow.css';
import './Contents.css';

/** A document's sections in order: one press each, the open one in label weight (aria-current). */
export interface ContentsProps {
  /** Names the list for a screen reader ("Sections of World rules"). */
  label: string;
  /** A section each, in order: a link with `href`, else a button that calls `onSelect`. */
  items: { label: string; href?: string }[];
  /** The open section's index. */
  current?: number;
  /** Called with the section's index. */
  onSelect?: (index: number) => void;
  /** Shows this many, then "{count} more" opens the rest; the open section is never hidden. */
  limit?: number;
  /** Lines the sections up with the title of the ListRow above them. */
  inset?: boolean;
  /** Extra class on the root element. */
  className?: string;
}

/* A document's sections in order (an open canon document): one press each, left-aligned and wrapping. The open one reads in label
   weight and is aria-current: weight and colour are the whole state, never a fill, a marker or an underline. With `limit`, the
   first sections show and "{count} more" opens the rest, focus going to the first one it opened. */
/**
 * Contents lists a document's sections in order, one press each: the open one reads in label weight, with no fill, marker or
 * underline. With `limit` the first sections show and "{count} more" opens the rest.
 *
 * Not for a page's main sections (`SideNav`, `TopNav`); rows with a picture, a second line or an action (`ListRow`); a link inside a
 * sentence (`TextLink`); the views inside a production (`ProductionNav`).
 *
 * Accessibility: A navigation named by `label` ("Sections of World rules") holding an ordered list, so a screen reader says how
 * many sections there are. Each section is a link or a button Tab reaches, and the open one is marked current. "6 more" is a
 * button; pressing it puts focus on the first section it opened. In forced colours the open section is drawn in Highlight and focus
 * keeps its ring.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Contents({ label, items, current, onSelect, limit, inset, className }: ContentsProps) {
  const tx = useWords(ownWords);
  const [more, setMore] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const opened = useRef(-1);
  const cut = limit && !more && items.length > limit + 1 && !(current !== undefined && current >= limit) ? limit : items.length;
  useEffect(() => {
    if (opened.current < 0 || !list.current) return;
    const first = list.current.children[opened.current]?.firstElementChild as HTMLElement | null;
    first?.focus();
    opened.current = -1;
  }, [more]);
  return (
    <nav aria-label={label} className={cx('sk-toc', inset && 'sk-toc--inset', className)}>
      <ol ref={list} className="sk-toc__list">
        {items.slice(0, cut).map((it, i) => {
          const on = i === current;
          return (
            <li key={i}>
              <GoLink href={it.href} onClick={() => onSelect?.(i)} className={cx('sk-toc__item', on && 'is-current')} aria-current={on ? 'true' : undefined}>
                {it.label}
              </GoLink>
            </li>
          );
        })}
      </ol>
      {cut < items.length && (
        <button type="button" className="sk-toc__more" onClick={() => { opened.current = cut; setMore(true); }}>
          {tx('moreCount', { count: items.length - cut })}
        </button>
      )}
    </nav>
  );
}
