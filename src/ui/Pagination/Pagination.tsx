import { useLayoutEffect, useRef, type FocusEvent } from 'react';
import { cx } from '../../internal/cx';
import { useDrag } from '../../internal/drag';
import { Glide, placeGlide, useGlide } from '../../internal/glide';
import { IconButton } from '../IconButton/IconButton';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Pagination.css';

export interface PaginationProps {
  /** The page shown, from 1. */
  page: number;
  /** How many pages there are. */
  pages: number;
  /** With total, the count reads "1–24 of 31 shorts"; without, "Page 1 of 2". */
  total?: number;
  /** Items to a page (default 24), for the count. */
  pageSize?: number;
  /** What is counted ("shorts"): the count reads "1–24 of 31 shorts". */
  noun?: string;
  /** Default "Pages". */
  label?: string;
  /** One address per page, in order. */
  hrefs?: string[];
  /** Without hrefs: called with the page to show. */
  onChange?: (page: number) => void;
  /** Extra class on the root element. */
  className?: string;
}

const CURRENT = '.sk-pages__n.is-current';

/* A long list read a page at a time: what this page holds, then the way to the others. A list of one page shows none. */
/**
 * Pagination reads a long list a page at a time: what this page holds, then previous, the page numbers and next. A list of one
 * page shows none.
 *
 * Not for where a person is in a flow they step through (`Stepper`); a shelf that leads to everything on it (`SectionHeader`);
 * the pages of a manga issue in the editor (`IssueStrip`).
 *
 * Accessibility: A navigation region named by `label` (default "Pages"): the count reads as text, then Tab moves through
 * "Previous page", each "Page 3" (the current one marked "current page") and "Next page", which are disabled at the ends: an
 * arrow that turns off under focus hands focus to the current page. The ellipsis is hidden. Sliding is for the pointer; each
 * page is still its own link or button.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Pagination(props: PaginationProps) {
  const tx = useWords(ownWords);
  const page = props.page || 1, pages = props.pages || 1, size = props.pageSize || 24, hrefs = props.hrefs || [];
  const navRef = useRef<HTMLSpanElement>(null), slide = useRef<{ g: HTMLElement | null; n: HTMLElement | null }>({ g: null, n: null });
  useGlide(navRef, CURRENT, false, [page, pages, props.className]);
  /* An arrow that turns off under focus (Previous on page 1) would drop focus to the page: it goes to the current page instead */
  const within = useRef(false);
  useLayoutEffect(() => {
    const nav = navRef.current, at = document.activeElement as HTMLButtonElement | null;
    if (!nav || !within.current || (at && at !== document.body && !at.disabled && nav.contains(at))) return;
    nav.querySelector<HTMLElement>(CURRENT)?.focus({ preventScroll: true });
  }, [page]);
  /* Slide across the numbers: the pill follows to the number under the pointer, and letting go goes to that page */
  const scrub = useDrag({
    can: (e) => !!(e.target as Element).closest('.sk-pages__n'),
    start: () => { slide.current = { g: navRef.current!.querySelector<HTMLElement>(':scope > .sk-glide'), n: null }; },
    move: (e) => {
      const s = slide.current, r = navRef.current!.getBoundingClientRect(), el = document.elementFromPoint(Math.min(r.right - 1, Math.max(r.left + 1, e.clientX)), r.top + r.height / 2);
      const n = el && el.closest<HTMLElement>('.sk-pages__n');
      if (!n || n === s.n) return;
      s.n = n;
      s.g!.style.width = n.offsetWidth + 'px';
      s.g!.style.transform = `translate(${n.offsetLeft}px,${n.offsetTop}px)`;
    },
    end: () => {
      const s = slide.current, n = s.n && +s.n.getAttribute('data-page')!;
      if (n && n !== page) { if (props.onChange) props.onChange(n); else if (hrefs[n - 1]) window.location.assign(hrefs[n - 1]); }
      else placeGlide(navRef.current, CURRENT, false, false);
    },
  });
  if (pages < 2) return null;
  const go = (n: number) => (props.onChange ? () => { props.onChange!(n); } : undefined);
  const nums: number[] = [];
  for (let n = 1; n <= pages; n++) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) nums.push(n);
    else if (nums[nums.length - 1] !== 0) nums.push(0);
  }
  /* Numbers in the locale's own way: 2,481 in English, 2.481 in Portuguese */
  const num = tx.num;
  const count = props.total !== undefined
    ? tx(props.noun ? 'rangeOfNoun' : 'rangeOf', { from: (page - 1) * size + 1, to: Math.min(page * size, props.total), total: props.total, noun: props.noun })
    : tx('pageOf', { n: page, total: pages });
  return (
    <nav className={cx('sk-pages', props.className)} aria-label={props.label || tx('pages')}>
      <span className="sk-pages__count">{count}</span>
      <span ref={navRef} className={cx('sk-pages__nav', scrub.dragging && 'is-dragging')}
        onFocus={() => { within.current = true; }} onBlur={(e: FocusEvent) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) within.current = false; }} {...scrub.handlers}>
        <Glide />
        <IconButton icon="back" label={tx('previousPage')} variant="plain" disabled={page <= 1} href={page > 1 ? hrefs[page - 2] : undefined} onClick={page > 1 ? go(page - 1) : undefined} />
        {nums.map((n, i) => {
          if (!n) return <span key={'g' + i} className="sk-pages__gap" aria-hidden="true">…</span>;
          const href = n === page ? undefined : hrefs[n - 1], Tag = href ? 'a' : 'button';
          return <Tag key={n} type={href ? undefined : 'button'} href={href} className={cx('sk-pages__n', n === page && 'is-current')} data-page={n} aria-current={n === page ? 'page' : undefined} aria-label={tx('pageNumber', { n })} onClick={n === page ? undefined : go(n)}>{num(n)}</Tag>;
        })}
        <IconButton icon="forward" label={tx('nextPage')} variant="plain" disabled={page >= pages} href={page < pages ? hrefs[page] : undefined} onClick={page < pages ? go(page + 1) : undefined} />
      </span>
    </nav>
  );
}
