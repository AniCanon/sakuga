import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { IconButton } from '../IconButton/IconButton';
import '../../base.css';
import './SidePanel.css';

/** Slots: slot="head", slot="foot". */
export interface SidePanelProps {
  /** Names the section. */
  label?: string;
  /** What sits on top and stays put: a PanelHeader, or Maki's face and name (or slot="head"). */
  head?: ReactNode;
  /** What sits at the foot and stays put: a composer (or slot="foot"). */
  foot?: ReactNode;
  /** A conversation: keeps to its newest line unless scrolled back, and then offers a jump to it. */
  follow?: boolean;
  /** Opens scrolled here (or 'end'). */
  start?: number | 'end';
  /** The body's role and name: 'log' for a conversation, 'region' for a body the keyboard scrolls. */
  role?: string;
  /** The body's name for screen readers. */
  bodyLabel?: string;
  /** Something is still coming in: the body waits to be read. */
  busy?: boolean;
  /** The body: what scrolls between the head and the foot. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * SidePanel is the one container for a side area beside a view: an event, a character, a place, Maki. Every side area shares its
 * insets, so two of them never sit on different edges. The head and the foot stay put; only the body scrolls, a hairline under
 * the head once something is scrolled under it and over the foot while there is more below.
 *
 * Not for a dialog over the view (`Dialog`); a panel that slides up on a phone (`Sheet`); a boxed group of settings inside a page
 * (`Panel`).
 *
 * Accessibility: A section named by `label`. The body is a region Tab reaches when its `role` is `region`, or a log when it is a
 * conversation (a Tab stop too, so it scrolls from the keyboard), held back while `busy`; "Jump to the latest" is a button.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SidePanel(props: SidePanelProps) {
  const tx = useWords(ownWords);
  const sl = slots(props.children);
  const root = useRef<HTMLElement>(null), body = useRef<HTMLDivElement>(null), stuck = useRef(true), farRef = useRef(false);
  const [far, setFar] = useState(false);
  /* Edges are classes set on the panel itself, never state, so measuring never renders again; only the jump is state */
  function measure() {
    const el = body.current, r = root.current;
    if (!el || !r) return;
    const gap = el.scrollHeight - el.clientHeight - el.scrollTop;
    stuck.current = gap < 2;
    r.classList.toggle('is-under-head', el.scrollTop > 0);
    r.classList.toggle('is-more', gap > 1);
    const f = !!props.follow && gap > el.clientHeight / 3;
    if (f !== farRef.current) { farRef.current = f; setFar(f); }
  }
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    if (props.start !== undefined) el.scrollTop = props.start === 'end' ? el.scrollHeight : props.start;
    else if (props.follow) el.scrollTop = el.scrollHeight;
    measure();
  }, [props.start]);
  useLayoutEffect(() => { const el = body.current; if (el && props.follow && stuck.current) el.scrollTop = el.scrollHeight; measure(); });
  useEffect(() => {
    const el = body.current;
    if (!el || !window.ResizeObserver) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, []);
  function jump() { const el = body.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }
  const head = props.head || sl.get('head'), foot = props.foot || sl.get('foot');
  return (
    <section ref={root} className={cx('sk-side', props.className)} aria-label={props.label}>
      {head && <div className="sk-side__head">{head}</div>}
      {/* A log is a Tab stop too, so a long conversation scrolls from the keyboard */}
      <div className="sk-side__main">
        <div ref={body} onScroll={measure} className="sk-side__body" role={props.role} tabIndex={props.role === 'region' || props.role === 'log' ? 0 : undefined}
          aria-label={props.bodyLabel} aria-busy={props.busy ? 'true' : undefined}>{sl.body}</div>
      </div>
      {/* Scrolled back, the way to the newest line takes its own row above the foot, never over the words */}
      {(foot || far) && (
        <div className="sk-side__foot">
          {far && <div className="sk-side__jump"><IconButton variant="solid" icon="chevron-down" label={tx('jumpToLatest')} className="sk-mk-tool" onClick={jump} /></div>}
          {foot}
        </div>
      )}
    </section>
  );
}
