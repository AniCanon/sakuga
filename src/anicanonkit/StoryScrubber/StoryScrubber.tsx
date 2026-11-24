import { Fragment, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Icon, IconButton, SegmentedControl, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { sliderProps } from '../../internal/slider';
import { EVENT_WORD, EventGlyph, type EventType } from '../EventGlyph/EventGlyph';
import { useWords, type WordKey } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './StoryScrubber.css';

export interface StoryScrubberProps {
  /**
   * One column per event, in story order: its type and title, what told it, whether it is `inside` the moment shown, a `mark`,
   * and `with`, the other events at that same moment: one column holds every mark, stacked; the tooltip and screen readers say
   * them ("The call, at the same time as Kiko's offer").
   */
  events: {
    type: EventType;
    title?: string;
    told?: ToldMark[];
    inside?: boolean;
    mark?: boolean;
    with?: { type: EventType; title?: string; told?: ToldMark[] }[];
  }[];
  /** The arc brackets over the events, each with how many it spans; `on` for the arc shown. */
  arcs: { name: string; count: number; on?: boolean }[];
  /** The handle after an event, named ("After Fire at Sé"); a second one compares two moments. */
  handles: { at: number; label: string }[];
  /** The span lit on the track, as event positions from and to. */
  fill: [number, number];
  /** Events with no place yet, as one column past a hairline; `state: 'none'` (or leaving it out) draws nothing. `count` names more than one. */
  unplaced?: { state?: 'event' | 'none'; on?: boolean; icon?: IconName; count?: number };
  /** The filter shown pressed (all, ep, manga, shorts); `false` hides the filter. */
  filter?: string | false;
  /** Arrow keys, Page and Home/End on the track: the new place, 0 to the number of events. */
  onChange?: (at: number) => void;
  /** A filter button pressed: all, ep, manga or shorts. */
  onFilter?: (filter: string) => void;
  /** What a screen reader says for the moment shown; the first handle's label when left out. */
  valueText?: string;
  /** A long track opens at this event instead of with the first handle in view, for a page that keeps where it was scrolled. */
  start?: number;
  /** Extra class on the root element. */
  className?: string;
}

/** What told an event: an icon (play, manga, shorts, image), or the icon with its label ("Episode 2", "Short"), which screen readers say
    and the mark's tooltip shows. */
export type ToldMark = IconName | {
  /** The production's kind: play, manga, shorts or image. */
  icon: IconName;
  /** The production by name, said by screen readers and shown as the mark's tooltip. */
  label: string;
};
const TOLD_KEY: [IconName, WordKey][] = [['play', 'toldEpisode'], ['manga', 'toldManga'], ['shorts', 'toldShort'], ['image', 'toldStudio']];

/**
 * StoryScrubber moves through the story in story order (when things happen in the world, not when they were released). A long
 * story scrolls, never squeezes: a column is at least 36 px, the track scrolls sideways with a chevron at each end, follows the
 * first handle as it moves, and a handle scrolled away keeps its label held at that edge. Scrolled, it shows whole columns only, so
 * no event is cut at either edge, and the chevrons page it by whole columns. With `onChange`, a press on an event moves the
 * moment there and dragging Now moves it event by event.
 *
 * Not for the playhead of an episode or a short (`Scrubber`); the whole cut at a glance (`ProgramBar`); the cut's tracks in
 * time (`Timeline`); the story's people, places and events as a map (`StoryMap`).
 *
 * Accessibility: A slider that Tab reaches, named "Show the world at a moment in the story" and read as `valueText` (else the
 * first handle's label, else "After event 3 of 12"); with `onChange` arrows move it an event, Page Up and Page Down a tenth of
 * the story and Home and End to either end, and without it it reads as read-only. Beside it, screen readers get the events in
 * story order (type, title, the events at the same time, by each mark's `label` when it has one, "in the moment shown") and the arcs as
 * lists, and, on a long story, buttons around it in the order drawn: "Earlier events" before it, then a held label ("Show
 * Now") and "Later events" after it, each only while there is something that way; below it a group named "Show events told by"
 * holds filter buttons that read "pressed" on the current one and run `onFilter`.
 *
 * @version 1.7
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryScrubber(props: StoryScrubberProps) {
  const tx = useWords(ownWords);
  const evs = props.events || [], N = evs.length || 1;
  const lo = (props.fill || [0, N])[0], hi = (props.fill || [0, N])[1];
  const at = props.handles && props.handles[0] ? props.handles[0].at : hi;
  /* A column keeps its width and the track scrolls sideways when the story is longer than the space; when it fits, the columns
     stretch to fill it, as before. The track follows the first handle as it moves; a handle scrolled out of view is named on a
     button at that end, which brings it back. */
  const scroller = useRef<HTMLDivElement>(null), first = useRef(true), placedFit = useRef(0);
  const [sc, setSc] = useState({ l: 0, w: 0, sw: 0, over: false, fit: 0 });
  /* Only a story longer than the space scrolls: until then the track is drawn exactly as it always was */
  function measure() {
    const el = scroller.current;
    if (!el) return;
    const parent = el.parentNode as HTMLElement | null;
    const col = parseFloat(getComputedStyle(el).getPropertyValue('--scrub-col-width')) || 36, room = parent ? parent.clientWidth : el.clientWidth, over = evs.length * col > room + 0.5;
    /* Scrolling, the track shows whole columns only: never a node cut at either edge */
    const fit = over ? Math.max(1, Math.floor(room / col)) * col : 0;
    setSc((p) => (p.l === el.scrollLeft && p.w === el.clientWidth && p.sw === el.scrollWidth && p.over === over && p.fit === fit ? p : { l: el.scrollLeft, w: el.clientWidth, sw: el.scrollWidth, over, fit }));
  }
  const xOf = (n: number) => { const el = scroller.current; return el ? n / N * el.scrollWidth : 0; };
  function show(n: number, smooth: boolean) {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const x = xOf(n), room = el.clientWidth / 6;
    if (x >= el.scrollLeft + room && x <= el.scrollLeft + el.clientWidth - room) return;
    const cw = el.scrollWidth / N, left = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, Math.round((x - el.clientWidth * 2 / 3) / cw) * cw));
    if (smooth && el.scrollTo) el.scrollTo({ left, behavior: 'smooth' }); else el.scrollLeft = left;
  }
  useLayoutEffect(measure, [N]);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!sc.over || !el) return;
    /* The track narrows to whole columns after it is first placed: a new width places it again, at once */
    if (placedFit.current !== sc.fit) { if (placedFit.current) first.current = true; placedFit.current = sc.fit; }
    if (first.current && props.start !== undefined) { const cw0 = el.scrollWidth / N; el.scrollLeft = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, Math.round((xOf(props.start) - el.clientWidth / 6) / cw0) * cw0)); }
    else show(at, !first.current);
    first.current = false;
    measure();
  }, [at, N, sc.over, sc.fit]);
  useEffect(() => {
    const el = scroller.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const over = sc.over, hasL = over && sc.l > 1, hasR = over && sc.l + sc.w < sc.sw - 1;
  /* A press on a node moves the moment through that event; the Now handle drags once the pointer has travelled the nudge, and the
     moment follows it column by column, with no easing under the pointer. A drag anywhere else still scrolls the track. */
  const drag = useRef<{ x: number; y: number; held: boolean; moved: boolean } | null>(null), live = !!props.onChange;
  function laneX(clientX: number) {
    const lane = scroller.current && scroller.current.querySelector('.sk-scrub2__lane');
    if (!lane) return null;
    const r = lane.getBoundingClientRect();
    return { x: clientX - r.left, col: r.width / N };
  }
  function pdown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!live || e.button > 0) return;
    const held = !!(e.target as HTMLElement).closest('.sk-scrub2__handle,.sk-scrub2__pill:not(.is-pinned)');
    drag.current = { x: e.clientX, y: e.clientY, held, moved: false };
    if (held) { e.preventDefault(); if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); }
  }
  function pmove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || !d.held) return;
    if (!d.moved && Math.abs(e.clientX - d.x) < 4) return;
    d.moved = true;
    const q = laneX(e.clientX);
    if (!q) return;
    const n = Math.max(0, Math.min(N, Math.round(q.x / q.col)));
    if (n !== at && props.onChange) props.onChange(n);
  }
  function pup(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    drag.current = null;
    if (!d || d.held || d.moved || Math.abs(e.clientX - d.x) >= 4 || Math.abs(e.clientY - d.y) >= 4) return;
    const q = laneX(e.clientX);
    if (!q) return;
    const i = Math.floor(q.x / q.col);
    if (i >= 0 && i < N && props.onChange) props.onChange(i + 1);
  }
  /* Two handles off the same end: the nearer one is held there; pressing it brings that one back, and the other then waits */
  const hiddenOn = (side: 'l' | 'r') => (props.handles || []).filter((hd) => { const x = hd.at / N * sc.sw; return side === 'l' ? x < sc.l - 1 : x > sc.l + sc.w + 1; })
    .sort((a, b) => (side === 'l' ? b.at - a.at : a.at - b.at))[0];
  /* Both ends keep their place while the track scrolls, so the track never changes width under the hand; an end with nothing beyond
     it is hidden, and out of the Tab order */
  const edge = (side: 'l' | 'r') => {
    const go = () => {
      const el = scroller.current;
      if (!el) return;
      const cw = el.scrollWidth / N, left = el.scrollLeft + (side === 'l' ? -1 : 1) * Math.max(1, Math.floor(el.clientWidth * 0.8 / cw)) * cw;
      if (el.scrollTo) el.scrollTo({ left, behavior: 'smooth' }); else el.scrollLeft = left;
    };
    return (
      <div className={cx('sk-scrub2__edge', 'is-' + (side === 'l' ? 'start' : 'end'), !(side === 'l' ? hasL : hasR) && 'is-idle')}>
        <IconButton variant="plain" icon={side === 'l' ? 'chevron-left' : 'chevron-right'} label={tx(side === 'l' ? 'earlierEvents' : 'laterEvents')} onClick={go} />
      </div>
    );
  };
  /* A handle scrolled out of view keeps its label in view, held at the edge it went off with an arrow towards it; pressing it brings
     the handle back */
  const pinned = over ? (['l', 'r'] as const).map((side) => {
    const hd = hiddenOn(side);
    return hd && (
      <button key={side} type="button" className={cx('sk-scrub2__pill', 'is-pinned', 'is-' + (side === 'l' ? 'start' : 'end'))} aria-label={tx('showMoment', { name: hd.label })} onClick={() => show(hd.at, true)}>
        {side === 'l' && <Icon name="chevron-left" size="var(--scrub-pinned-icon-size)" />}{hd.label}{side === 'r' && <Icon name="chevron-right" size="var(--scrub-pinned-icon-size)" />}
      </button>
    );
  }) : null;
  /* Events at one moment share one column: its node holds each one's mark (two, then +n), and what told any of them */
  const withTitles = (e: StoryScrubberProps['events'][number]) => (e.with || []).map((w) => w.title || tx(EVENT_WORD[w.type || 'event'] || 'eventEvent'));
  const toldOf = (e: StoryScrubberProps['events'][number]) => {
    const seen = new Set<string>();
    return [e, ...(e.with || [])].flatMap((x) => (x.told || []).filter((t) => {
      const k = typeof t === 'string' ? t : t.icon + '|' + t.label;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }));
  };
  const cols = evs.map((e, i) => {
    const all = [e, ...(e.with || [])], together = all.length > 1;
    return (
      <div key={i} className={cx('sk-scrub2__col', e.inside ? 'is-in' : 'is-out')} title={together ? tx('sameTimeTitle', { title: e.title || '', list: tx.list(withTitles(e)) }) : e.title}>
        <span className={cx('sk-scrub2__node', e.mark && 'is-mark', together && 'is-together')}>
          {all.slice(0, 2).map((x, j) => <EventGlyph key={j} type={x.type} size={10} tone={e.inside ? 'auto' : 'muted'} />)}
          {all.length > 2 && <span className="sk-scrub2__more">{tx('andMore', { count: all.length - 2 })}</span>}
        </span>
        <span className="sk-scrub2__told">{toldOf(e).map((t, j) => { const o = typeof t === 'string' ? { icon: t, label: undefined } : t;
          return <span key={j} className="sk-scrub2__mark" title={o.label}><Icon name={o.icon} size="var(--scrub-told-icon-size)" /></span>; })}</span>
      </div>
    );
  });
  const arcs = (props.arcs || []).map((a, i) => (
    <div key={i} className={cx('sk-scrub2__arc', a.on && 'is-on')} style={{ flex: a.count + ' 1 0', minWidth: 'calc(' + a.count + ' * var(--scrub-col-width))' }}><span className="sk-scrub2__bracket" /><span className="sk-scrub2__arcname">{a.name}</span></div>
  ));
  const handles = (props.handles || []).map((hd, i) => {
    const pos = hd.at / N * 100;
    return (
      <Fragment key={i}>
        <span className={cx('sk-scrub2__handle', hd.at >= N && 'is-end', hd.at <= 0 && 'is-start')} style={{ left: pos + '%' }} />
        <span className={cx('sk-scrub2__pill', hd.at >= N && 'is-end', hd.at <= 0 && 'is-start')} style={{ left: pos + '%' }}>{hd.label}</span>
      </Fragment>
    );
  });
  const un = props.unplaced || {};
  /* The columns, arcs and handles are drawn inside the slider, where a screen reader does not go: the events and arcs are listed
     beside it as text, in story order */
  const told = (marks?: ToldMark[]) => (marks || []).map((m) => {
    if (typeof m !== 'string') { if (m.label) return m.label; m = m.icon; }
    const ic = m, k = TOLD_KEY.filter((t) => t[0] === ic)[0];
    return k ? tx(k[1]) : ic;
  });
  const said = (
    <div className="sk-sr">
      <ul aria-label={tx('eventsInOrder')}>{evs.map((e, i) => {
        const type = e.type || 'event', by = told(e.told);
        const kind = EVENT_WORD[type as EventType] ? tx(EVENT_WORD[type as EventType]) : type;
        return <li key={i}>{[e.title ? tx('eventTitled', { type: kind, title: e.title }) : kind, by.length && tx('toldIn', { list: tx.list(by) }), (e.with || []).length > 0 && tx('atSameTimeAs', { list: tx.list(withTitles(e)) }), e.inside && tx('inTheMomentShown'), e.mark && tx('marked')].filter(Boolean).join(', ')}</li>;
      })}</ul>
      {(props.arcs || []).length > 0 && <ul aria-label={tx('arcs')}>{props.arcs.map((a, i) => <li key={i}>{tx('arcEvents', { name: a.name, count: a.count }) + (a.on ? ', ' + tx('inTheMomentShown') : '')}</li>)}</ul>}
    </div>
  );
  /* Events with no place yet stand after the track as one more column under their own name, past a hairline; with none, nothing */
  const unplaced = props.unplaced && un.state !== 'none' && (
    <div className={cx('sk-scrub2__unplaced', un.on ? 'is-in' : 'is-out')}>
      <div className="sk-scrub2__ucol"><span className="sk-scrub2__node is-unplaced"><EventGlyph type="event" size={10} tone={un.on ? 'auto' : 'muted'} /></span>
        <span className="sk-scrub2__told"><Icon name={un.icon || 'image'} size="var(--scrub-told-icon-size)" /></span></div>
      <span className="sk-scrub2__arcname">{(un.count ?? 0) > 1 ? tx('notPlacedCount', { count: un.count }) : tx('notPlacedTitle')}{un.on && <span className="sk-sr">{', ' + tx('inTheMomentShown')}</span>}</span>
    </div>
  );
  /* Page Up and Page Down move a tenth of the story; with a second handle the place is read against it */
  const track = sliderProps({ label: tx('storyMoment'), value: at, max: evs.length, step: 1, page: Math.max(1, Math.round(evs.length / 10)),
    text: (props.valueText || (props.handles && props.handles[0] ? props.handles[0].label : tx('afterEvent', { n: at, total: evs.length }))) + (props.handles && props.handles[1] ? ', ' + tx('comparedWith', { name: props.handles[1].label }) : ''),
    onChange: props.onChange });
  return (
    <div className={cx('sk-scrub2', props.className)}>
      <div className="sk-scrub2__row">
        {over && edge('l')}
        <div className="sk-scrub2__view">
          <div ref={scroller} className={cx('sk-scrub2__scroll', over && 'is-over', live && 'is-live')} onScroll={measure} style={sc.fit ? { width: sc.fit } : undefined}
            onPointerDown={pdown} onPointerMove={pmove} onPointerUp={pup} onPointerCancel={() => { drag.current = null; }} {...track}>
            <div className="sk-scrub2__track" style={{ minWidth: 'calc(' + evs.length + ' * var(--scrub-col-width))' }}>
              <div className="sk-scrub2__lane"><span className="sk-scrub2__line" /><span className="sk-scrub2__fill" style={{ left: lo / N * 100 + '%', width: (hi - lo) / N * 100 + '%' }} />
                <div className="sk-scrub2__cols">{cols}</div>{handles}</div>
              <div className="sk-scrub2__arcs">{arcs}</div>
            </div>
          </div>
          {pinned}
        </div>
        {over && edge('r')}
        {unplaced}
      </div>
      {said}
      {props.filter === false ? null : (
        <div className="sk-scrub2__foot">
          <SegmentedControl label={tx('showEventsBy')} value={props.filter || 'all'} onChange={props.onFilter} options={[{ label: tx('filterAll'), value: 'all' }, { label: tx('filterEpisodes'), value: 'ep' }, { label: tx('filterManga'), value: 'manga' }, { label: tx('filterShorts'), value: 'shorts' }]} />
          <span className="sk-scrub2__key">{TOLD_KEY.map((k) => <span key={k[0]}><Icon name={k[0]} size="var(--scrub-key-icon-size)" />{tx(k[1])}</span>)}</span>
        </div>
      )}
    </div>
  );
}
