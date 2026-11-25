import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent, type ReactElement } from 'react';
import { cx } from '../../internal/cx';
import { useDrag, type DragState } from '../../internal/drag';
import { draggedItem, takeDragged, type InsertData } from '../../internal/insert';
import { announce } from '../../internal/live';
import { pressProps } from '../../internal/press';
import { useRoving } from '../../internal/roving';
import { sliderProps } from '../../internal/slider';
import { spoken, tc } from '../../internal/time';
import { useUid } from '../../internal/uid';
import { Icon, type IconName } from '../Icon/Icon';
import { Waveform } from '../Waveform/Waveform';
import '../../base.css';
import './Timeline.css';
import { TimelineRuler } from './TimelineRuler';
import { useTimelineView } from './useTimelineView';
import { useWords, type WordKey } from '../../internal/words';
import { words as ownWords } from './words';

export type TimelineTrackKind = 'video' | 'board' | 'overlay' | 'audio' | 'dialogue' | 'music' | 'caption' | 'effect';

export interface TimelineItem {
  start: number;
  length: number;
  label?: string;
  image?: string;
  /** Sound tracks: real loudness, 0–1. */
  peaks?: number[];
  /** A sound that loops to fill: the length made, in seconds. The item repeats it across its span, a dashed seam at each start,
      and screen readers hear "loops to fill, 8 seconds made". */
  loop?: number;
  state?: 'selected' | 'gap' | 'board' | 'rejected';
  /** Seconds trimmed off while trimming, drawn as dashed ghosts before and after the item. A selected item shows a grip at each end. */
  trimmed?: { start?: number; end?: number };
}

export interface TimelineTrack {
  label: string;
  kind: TimelineTrackKind;
  items: TimelineItem[];
  /** false: nothing is dropped on this lane (a drop over it lands nowhere), drawn as any other. */
  drop?: boolean;
}

export interface TimelineProps {
  /** The length shown in seconds (the window, with onView); every item's `start` and `length` are seconds from its start. */
  duration: number;
  /** The whole cut's length in seconds, with onView: the Timeline shows `offset` + `duration` of it and can zoom and pan. */
  total?: number;
  /** Called with the window asked for (seconds): the zoom control, Ctrl/⌘+wheel and pinch around the pointer, a sideways wheel or
      Shift+wheel to pan; the closest a frame about 24 px wide, the furthest the whole cut. The app passes the new window back as
      offset and duration. */
  onView?: (start: number, length: number) => void;
  /** With onView: the window turns the page when the playhead passes its end (while playing). */
  follow?: boolean;
  /** The current time in seconds, drawn across every track. */
  playhead?: number;
  /** Labels the ruler in program time, in seconds, when the timeline shows a zoomed window of a longer cut. */
  offset?: number;
  /** The ruler's step in seconds; it steps itself (1, 5 or 30) without it. */
  step?: number;
  /** The frame rate shown at the ruler's head ("24 fps"). */
  rate?: string;
  /** Names the timeline for screen readers. */
  label?: string;
  /** Makes the items one Tab stop of buttons: arrows move between them, Enter or Space calls it with the track and item indexes. */
  onSelect?: (track: number, item: number) => void;
  /** A selected item's grip moved by keyboard or dragged: the new time of that edge, in seconds. An edge stops at the item beside it
      on the track and goes where it is dragged, a whole frame at a time; it never snaps. Without it the grips only draw. */
  onTrim?: (track: number, item: number, edge: 'in' | 'out', seconds: number) => void;
  /** A trim has ended: the grip is let go, or the key that moved it is released (or focus leaves). Called once, with the edge's final
      time: save here, not in onTrim. */
  onTrimEnd?: (track: number, item: number, edge: 'in' | 'out', seconds: number) => void;
  /** What one arrow press trims, in seconds. Default 1/24 (a frame); Shift, Page Up and Page Down trim a second. */
  trimStep?: number;
  /** With reorderable, a track's handle moves it: Up and Down a place at once, Enter or Space to lift it and drop it further, or a drag. */
  onMoveTrack?: (from: number, to: number) => void;
  /** An item dragged along its track, or moved with Alt and an arrow (a frame; Shift, a second; Home and End as far as it goes): its
      new start, whole frames of `trimStep`, never snapped and never over the item beside it. */
  onMoveItem?: (track: number, item: number, seconds: number) => void;
  /** A move has ended: the item is let go, or Alt and the arrow are released (or focus leaves). Called once, with its final start: save
      here, not in onMoveItem. */
  onMoveItemEnd?: (track: number, item: number, seconds: number) => void;
  /** Named times on the ruler, in seconds on the same scale as `playhead`. `selected` draws it selected and says so. */
  markers?: { at: number; label: string; selected?: boolean }[];
  /** Makes each marker's flag a button: a press, Enter or Space calls it with the marker's index in `markers` (to open it, rename it).
      A marker in a shared flag is chosen from the flag's list. */
  onSelectMarker?: (marker: number) => void;
  /** A marker's flag dragged along the ruler, or moved with Alt and an arrow (a frame; Shift, a second; Home and End to the ends): its
      new time on every frame it passes, whole frames of `trimStep`, never snapped. A marker in a shared flag is moved from the app, once
      selected. */
  onMoveMarker?: (marker: number, seconds: number) => void;
  /** A marker's move has ended (let go, or the key released): called once with its final time. */
  onMoveMarkerEnd?: (marker: number, seconds: number) => void;
  /** Track heads carry a drag handle. */
  reorderable?: boolean;
  /** Draws a track being moved, its index and where it lands (a board); a drag or the keys draw their own. */
  moving?: { track: number; to: number };
  /** The tracks, top to bottom, each with its items. */
  tracks: TimelineTrack[];
  /** Cards with `dragData` drop onto a lane of their `kind` (any lane when it has none): the lane outlines where it lands, exactly where
      it is dropped (nothing snaps), and this is called with the card's dragData, the time and the track index (null when it landed on
      newLane, with `{ newLane: true }`). */
  onDrop?: (item: InsertData, at: number, track: number | null, landed?: { newLane: true }) => void;
  /** A lane the app offers for drops: while a card that fits it (its `kind`, or any card without one) is dragged over the Timeline it
      shows, dashed, under the last track, and takes the drop when no lane that takes it is free at that time (a cut with no clips yet,
      every lane busy). The app creates the track from onDrop. */
  newLane?: { label: string; kind?: TimelineTrackKind };
  /** A press on the ruler, a drag along it, or the playhead's head as a slider (an arrow a frame, Shift a second): the new time in
      seconds, on the same scale as `playhead`, whole frames of `trimStep`. */
  onSeek?: (seconds: number) => void;
  /** The slider's name. Default "Seek". */
  seekLabel?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* Core: Timeline, the cut's tracks under the preview. Times in seconds; the page passes the content. */
const TRACK_ICON: Record<TimelineTrackKind, IconName> = { video: 'video', overlay: 'image', audio: 'volume', dialogue: 'mic', music: 'volume', caption: 'captions', effect: 'effect-sparks', board: 'document' };
const TL_STATE: Record<string, WordKey> = { selected: 'selected', gap: 'noPictureYet', board: 'storyboard', rejected: 'rejected' };
/* Items are one Tab stop when onSelect is given: Left and Right move within a track (data-ti), Up and Down to the item nearest (data-start)
   on the track above or below, Home and End to the track's ends. A selected item's grips sit beside it in the lane, not inside it, so the
   item can be a button without holding other controls. */
function laneMove(list: HTMLElement[], i: number, key: string): number | null {
  const el = list[i], ti = +el.dataset.ti!, start = +el.dataset.start!;
  const same = list.filter((x) => +x.dataset.ti! === ti), k = same.indexOf(el);
  if (key === 'ArrowLeft') return list.indexOf(same[Math.max(0, k - 1)]);
  if (key === 'ArrowRight') return list.indexOf(same[Math.min(same.length - 1, k + 1)]);
  if (key === 'Home') return list.indexOf(same[0]);
  if (key === 'End') return list.indexOf(same[same.length - 1]);
  if (key !== 'ArrowUp' && key !== 'ArrowDown') return null;
  const tracks = list.map((x) => +x.dataset.ti!).filter((t, n, a) => a.indexOf(t) === n);
  const to = tracks[tracks.indexOf(ti) + (key === 'ArrowUp' ? -1 : 1)];
  if (to === undefined) return i;
  let best = -1;
  list.forEach((x, n) => { if (+x.dataset.ti! === to && (best < 0 || Math.abs(+x.dataset.start! - start) < Math.abs(+list[best].dataset.start! - start))) best = n; });
  return best;
}

/* Where a dragged card would land: its lane, time and length; the lane named when it moved to a free one; refused when none is free */
interface Landing {
  ti: number;
  at: number;
  len: number;
  track?: string;
  refused?: boolean;
  /* It lands on the app's new lane (newLane) */
  newLane?: boolean;
}

/* What a drag carries: a grip's track, item, edge, range and lane; an item's body slid along its track; or a handle's track and
   where it lands */
interface TimelineDrag extends DragState {
  ti: number;
  trim?: boolean;
  slide?: boolean;
  grab: number;
  ii: number;
  edge: 'in' | 'out';
  min: number;
  max: number;
  lane: DOMRect;
  last?: number;
  to: number;
}

/** The ruler's steps in seconds, least first: 1, 2, 5, 10, 15, 30 s, 1, 2, 5, 10 min. */
const RULER_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];

/**
 * Timeline is the cut's tracks under the preview, shared by every production (episode or short, Quick or Directed). Markers
 * closer than a readable flag at this zoom share one flag, the first named and the rest counted, each keeping its hairline at
 * its own time. A sound's `loop` repeats the length made across its span, with a dashed seam at each start ("Loop to fill").
 *
 * Not for the whole cut at a glance, in planned proportion (`ProgramBar`); what gets generated for a cut on a frame grid
 * (`Timesheet`); a manga page's layers (`LayerStrip`); the playhead of an episode a viewer watches (`Scrubber`).
 *
 * Accessibility: With `onDrop` a drop is said aloud ("Popcorn night inserted at 2:41", "… on Clips" to the new lane); dragging is for the pointer, Insert
 * and Enter on the card do the same by keyboard. A group named by `label` (default "Timeline") whose ruler times, track names,
 * markers and playhead ("Playhead at 0:04") read as text, a looped sound adds "loops to fill, 6 seconds made" to its name, and
 * markers sharing one flag are a button said in full ("2 markers: Window goes at 2:41 and Smith at 2:49"), with waveforms and
 * icons hidden. With `onSelect` the items are one
 * Tab stop of buttons named by label, track, times and state (Left and Right move within a track, Home and End to its ends, Up
 * and Down to the nearest item on the next one, Enter or Space selects), a selected item's grips are sliders ("Trim the start
 * of" the item) that move a frame per arrow (`trimStep`) and a second with Shift through `onTrim`, and with `reorderable` and
 * `onMoveTrack` Up and Down move a track by its handle, named with its place ("Move the Picture track, 1 of 3"), and Enter or
 * Space lift it to move it further and drop it (Escape puts it back), each keyboard move said aloud, and a dragged track when
 * it drops. With `onView` the zoom controls are buttons named "Zoom out", "Fit the whole cut" and "Zoom in" (Fit and Zoom out
 * unavailable when the whole cut shows). With `onSeek` the playhead is a slider named "Seek" (`seekLabel`), its value said in seconds and frames, in place
 * of the "Playhead at" text.
 *
 * @version 1.10
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Timeline(props: TimelineProps) {
  const tx = useWords(ownWords);
  /* The ruler's step: the least of the usual steps whose times keep about 72 px apart (the last, right-aligned at the end, still
     clear of the one before) on the lanes as they are now laid out; before the lanes are measured, a step from the length */
  const [laneW, setLaneW] = useState(0);
  const D = props.duration || 10, off = props.offset || 0;
  const step = props.step || (laneW > 0 ? (RULER_STEPS.find(s => s * laneW / D >= 72) ?? 600) : (D > 120 ? 30 : D > 30 ? 5 : 1));
  const trim = props.trimStep || 1 / 24, fps = Math.round(1 / trim), body = useRef<HTMLDivElement>(null), moved = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const view = useTimelineView(root, { total: props.total, onView: props.onView, follow: props.follow, offset: off, duration: D, playhead: props.playhead, trim });
  const [lift, setLift] = useState<{ track: number; to: number; keys?: boolean } | null>(null);
  const [land, setLand] = useState<Landing | null>(null), dropping = !!props.onDrop;
  const count = (props.tracks || []).length, how = useUid('sk-tl') + '-move';
  const mv = lift || props.moving;
  /* A change made by keys is pending until the key is let go or focus leaves: then its End callback runs once */
  const nudge = useRef<{ kind: 'trim'; ti: number; ii: number; edge: 'in' | 'out'; v: number } | { kind: 'move'; ti: number; ii: number; v: number } | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const settle = () => {
    const n = nudge.current, p = propsRef.current;
    nudge.current = null;
    if (!n) return;
    if (n.kind === 'trim') p.onTrimEnd?.(n.ti, n.ii, n.edge, n.v);
    else p.onMoveItemEnd?.(n.ti, n.ii, n.v);
  };
  /* The lane the app offers for a drop (newLane): it shows only while a card that fits it is dragged over the Timeline */
  const fresh = dropping && props.newLane ? props.newLane : null, [shown, setShown] = useState(false);
  const fits = (o: { kind?: string }) => { const d = draggedItem(); return !!d && !(d.kind && o.kind && d.kind !== o.kind); };
  useEffect(() => {
    if (!fresh) return;
    const hide = () => { setShown(false); setLand(null); };
    document.addEventListener('dragend', hide); document.addEventListener('drop', hide);
    return () => { document.removeEventListener('dragend', hide); document.removeEventListener('drop', hide); };
  }, [!!fresh]);
  /* A card dragged over a lane of its kind: it lands exactly where it is dropped, never snapped (item boundaries never snap).
     A drop never covers what is there: over an occupied stretch it goes to the nearest free lane of that kind, at the same time */
  function landAt(e: DragEvent<HTMLElement>, ti: number): Landing | null {
    const d = draggedItem(), all = props.tracks || [], N = all.length, nl = fresh && fits(fresh) ? fresh : null;
    const tr: { kind?: string; drop?: boolean } | null = ti === N ? nl : all[ti];
    if (!d || !tr) return null;
    const ok = ti < N && tr.drop !== false && !(d.kind && d.kind !== tr.kind);
    if (!ok && !nl) return null;
    const r = e.currentTarget.getBoundingClientRect(), t = Math.min(D, Math.max(0, (e.clientX - r.left) / r.width * D)), len = d.length || 0;
    /* The app's new lane takes the drop when no lane that takes it is free at that time */
    const anew: Landing | null = nl && { ti: N, at: t, len, track: nl.label, newLane: true };
    if (ti === N) return anew;
    const want = ok ? tr.kind : d.kind;
    const free = (k: number) => {
      const o = all[k];
      return !!o && o.drop !== false && (want === undefined || o.kind === want) && !(o.items || []).some((it) => it.start < t + Math.max(len, trim) - 1e-6 && it.start + it.length > t + 1e-6);
    };
    if (free(ti)) return { ti, at: t, len };
    for (let k = 1; k < all.length; k++) {
      if (free(ti - k)) return { ti: ti - k, at: t, len, track: all[ti - k].label };
      if (free(ti + k)) return { ti: ti + k, at: t, len, track: all[ti + k].label };
    }
    return anew || { ti, at: t, len, refused: true };
  }
  function mark(ti: number) {
    return land && land.ti === ti && (
      <span className={cx('sk-tl__landing', land.refused && 'is-refused')} aria-hidden="true" style={{ left: (land.at / D * 100) + '%', width: (Math.min(land.len, D - land.at) / D * 100) + '%' }}>
        <b>{land.refused ? tx('noFreeTrack', { time: tc(off + land.at) }) : land.track ? tx('landsAtOn', { time: tc(off + land.at), track: land.track }) : tx('landsAt', { time: tc(off + land.at) })}</b>
      </span>
    );
  }
  function laneDrop(ti: number) {
    return {
      onDragOver: (e: DragEvent<HTMLElement>) => {
        const l = landAt(e, ti);
        if (!l) return;
        e.preventDefault(); e.dataTransfer.dropEffect = l.refused ? 'none' : 'copy';
        if (!land || land.ti !== l.ti || land.at !== l.at || land.refused !== l.refused) setLand(l);
      },
      onDragLeave: (e: DragEvent<HTMLElement>) => {
        const to = e.relatedTarget as Element | null;
        if (!e.currentTarget.contains(to) && !(to && to.closest && to.closest('.sk-tl__lane'))) setLand(null);
      },
      onDrop: (e: DragEvent<HTMLElement>) => {
        const l = landAt(e, ti);
        setLand(null);
        if (!l) return;
        e.preventDefault();
        if (l.refused) { announce(tx('noFreeTrack', { time: tc(off + l.at) })); return; }
        const d = takeDragged()!;
        setShown(false);
        props.onDrop!(d, l.at, l.newLane ? null : l.ti, l.newLane ? { newLane: true } : undefined);
        announce(l.track ? tx('insertedAtOn', { name: d.label || '', time: tc(off + l.at), track: l.track }) : tx('insertedAt', { name: d.label || '', time: tc(off + l.at) }));
      },
    };
  }
  /* The place a dragged track lands: how many of the other tracks sit above the pointer */
  function landing(y: number, from: number) {
    let to = 0;
    body.current!.querySelectorAll(':scope > .sk-tl__row').forEach((r, i) => { const b = r.getBoundingClientRect(); if (i !== from && b.top + b.height / 2 < y) to++; });
    return to;
  }
  const pull = useDrag({
    can: (e) => !!(e.target as Element).closest(['.sk-tl__drag[role="button"]', props.onTrim && '.sk-tl__grip[role="slider"]', props.onMoveItem && '.sk-tl__item[data-ii]'].filter(Boolean).join(', ')),
    start: (d) => {
      const s = d as TimelineDrag, t = s.target as Element, g = t.closest<HTMLElement>('.sk-tl__grip');
      const bodyOf = t.closest<HTMLElement>('.sk-tl__item[data-ii]');
      if (bodyOf && !g) {
        s.slide = true; s.ti = +bodyOf.dataset.ti!; s.ii = +bodyOf.dataset.ii!; s.lane = bodyOf.parentElement!.getBoundingClientRect();
        s.min = +bodyOf.dataset.min!; s.max = +bodyOf.dataset.max!; s.grab = (s.x - s.lane.left) / s.lane.width * D - +bodyOf.dataset.start!;
        return;
      }
      s.ti = +(g || t.closest<HTMLElement>('.sk-tl__drag')!).dataset.ti!;
      if (g) {
        s.trim = true; s.ii = +g.dataset.ii!; s.edge = g.dataset.edge as 'in' | 'out'; s.min = +g.getAttribute('aria-valuemin')!; s.max = +g.getAttribute('aria-valuemax')!;
        s.lane = g.parentElement!.getBoundingClientRect();
      } else { s.to = s.ti; setLift({ track: s.ti, to: s.ti }); }
    },
    move: (e, d) => {
      const s = d as TimelineDrag;
      /* An item goes where it is dragged along its track, a whole frame at a time, never snapped and never over the item beside it */
      if (s.slide) {
        const at = Math.min(s.max, Math.max(s.min, Math.round(((e.clientX - s.lane.left) / s.lane.width * D - s.grab) / trim) * trim));
        if (at !== s.last) { s.last = at; props.onMoveItem!(s.ti, s.ii, at); }
        return;
      }
      if (!s.trim) { const to = landing(e.clientY, s.ti); if (to !== s.to) { s.to = to; setLift({ track: s.ti, to }); } return; }
      /* An edge goes where it is dragged, a whole frame at a time; it never snaps to another item or the playhead */
      const t = Math.min(s.max, Math.max(s.min, Math.round((e.clientX - s.lane.left) / s.lane.width * D / trim) * trim));
      if (t !== s.last) { s.last = t; props.onTrim!(s.ti, s.ii, s.edge, t); }
    },
    end: (_, d) => {
      const s = d as TimelineDrag;
      if (s.slide) {
        const it = ((props.tracks || [])[s.ti].items || [])[s.ii];
        if (s.last !== undefined && it) announce(tx('itemMovedTo', { name: it.label || tx('thisItem'), time: tc(off + s.last) }));
        if (s.last !== undefined) props.onMoveItemEnd?.(s.ti, s.ii, s.last);
        return;
      }
      if (s.trim) {
        if (s.last !== undefined) props.onTrimEnd?.(s.ti, s.ii, s.edge, s.last);
        return;
      }
      setLift(null);
      const tr = (props.tracks || [])[s.ti];
      if (s.to !== s.ti && props.onMoveTrack) { props.onMoveTrack(s.ti, s.to); announce(tx('trackMoved', { track: tr.label, n: s.to + 1, total: count })); }
    },
  });
  /* A track moved by keyboard keeps focus on its handle in the new place */
  useLayoutEffect(() => {
    if (moved.current === null || !body.current) return;
    const handle = body.current.querySelectorAll('.sk-tl__row')[moved.current];
    moved.current = null;
    const drag = handle && handle.querySelector<HTMLElement>('.sk-tl__drag[role="button"]');
    if (drag) drag.focus();
  });
  /* The lanes' width, for the ruler's step: measured once laid out and whenever it changes */
  useLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>('.sk-tl__scale');
    if (!el) return;
    const size = () => { const w = el.clientWidth; setLaneW(o => (Math.abs(o - w) < 1 ? o : w)); };
    size();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null;
    if (ro) ro.observe(el);
    return () => { if (ro) ro.disconnect(); };
  }, []);
  /* An item narrower than its chip shows the chip in place of its name: the span stays exactly where it is */
  useLayoutEffect(() => {
    const box = body.current;
    if (!box) return;
    const mark = () => {
      const room = parseFloat(getComputedStyle(box).getPropertyValue('--timeline-sliver-max')) || 24;
      box.querySelectorAll<HTMLElement>('.sk-tl__item').forEach((el) => el.classList.toggle('is-sliver', el.getBoundingClientRect().width < room));
    };
    mark();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mark) : null;
    if (ro) ro.observe(box);
    return () => { if (ro) ro.disconnect(); };
  });
  const keys = useRoving(body, { selector: '.sk-tl__item[role="button"]', active: '.is-selected', move: laneMove });
  function framesText(v: number) {
    let sec = Math.floor(v + 1e-6), f = Math.round((v - sec) * fps);
    if (f >= fps) { sec += 1; f = 0; }
    return spoken(sec, tx) + (f ? ', ' + tx('frames', { count: f }) : '');
  }
  const tracks = props.tracks || [];
  const rows = useMemo(() => {
    const rows: ReactElement[] = tracks.map((tr, ti) => {
      const items = (tr.items || []).map((it, ii) => {
        /* Wholly outside the window an item is not drawn (an edge sliver would read as something there) */
        if (it.start + it.length <= 1e-6 || it.start >= D - 1e-6) return null;
        /* Past the window an item is drawn to its edge, cut there */
        const vis0 = Math.max(0, it.start), vis1 = Math.min(D, it.start + it.length);
        const st = { left: (vis0 / D * 100) + '%', width: (Math.max(0, vis1 - vis0) / D * 100) + '%' }, end = it.start + it.length;
        let inner: ReactElement | null = null;
        if (tr.kind === 'video' || tr.kind === 'board') inner = it.image ? <span className="sk-tl__strip" style={{ backgroundImage: 'url(' + it.image + ')' }} /> : null;
        if (tr.kind === 'audio' || tr.kind === 'dialogue' || tr.kind === 'music') inner = <Waveform className="sk-tl__wave" peaks={it.peaks} seed={ii + ti + 3} />;
        /* A sound that loops to fill draws once per repeat, the same sound each time, with a dashed seam where it starts again */
        const looped = !!it.loop && it.loop > 0 && it.loop < it.length - 1e-6 && (tr.kind === 'audio' || tr.kind === 'music');
        if (looped) {
          const loop = it.loop!, span = Math.max(1e-6, vis1 - vis0), reps: ReactElement[] = [];
          for (let k = 0, s0 = it.start; s0 < it.start + it.length - 1e-6; k++, s0 += loop) {
            const a0 = Math.max(vis0, s0), a1 = Math.min(vis1, s0 + loop, it.start + it.length);
            if (a1 <= a0) continue;
            reps.push(
              <span key={k} className={cx('sk-tl__rep', k > 0 && 'is-seam')} style={{ left: ((a0 - vis0) / span * 100) + '%', width: ((a1 - a0) / span * 100) + '%' }}>
                <span className="sk-tl__repwave" style={{ left: ((s0 - a0) / (a1 - a0) * 100) + '%', width: (loop / (a1 - a0) * 100) + '%' }}><Waveform className="sk-tl__wave" peaks={it.peaks} seed={ii + ti + 3} /></span>
              </span>,
            );
          }
          inner = <span className="sk-tl__reps" aria-hidden="true">{reps}</span>;
        }
        const sel = it.state === 'selected', cut = it.trimmed || {}, word = it.state && TL_STATE[it.state] ? tx(TL_STATE[it.state]) : undefined;
        /* A gap or a board with no label of its own says what it is, and the hidden word is not said twice */
        const shown = it.label || ((it.state === 'gap' || it.state === 'board') && word ? word.charAt(0).toLocaleUpperCase(tx.locale) + word.slice(1) : '');
        const name = it.label || tx('thisItem'), onTrim = props.onTrim;
        /* An edge trims up to the item beside it on the track, never over it; without onTrim the grips only draw */
        let before = 0, after = D;
        (tr.items || []).forEach((o, oi) => {
          if (oi === ii) return;
          if (o.start + o.length <= it.start + 1e-6) before = Math.max(before, o.start + o.length);
          if (o.start >= end - 1e-6) after = Math.min(after, o.start);
        });
        const grip = (edge: 'in' | 'out') => {
          const isIn = edge === 'in';
          return (
            <span key={'g' + edge + ii} className={'sk-tl__grip sk-tl__grip--' + edge} style={{ left: ((isIn ? it.start : end) / D * 100) + '%' }} data-ti={ti} data-ii={ii} data-edge={edge}
              {...(onTrim ? sliderProps({ label: tx(isIn ? 'trimStart' : 'trimEnd', { name }), value: isIn ? it.start : end, min: isIn ? before : it.start + trim, max: isIn ? end - trim : after,
                step: trim, shiftStep: 1, page: 1, text: framesText(off + (isIn ? it.start : end)), onChange: (v) => { onTrim(ti, ii, edge, v); nudge.current = { kind: 'trim', ti, ii, edge, v }; } }) : { 'aria-hidden': true })}
              {...(onTrim ? { onKeyUp: settle, onBlur: settle } : null)} />
          );
        };
        const pick = props.onSelect ? () => { props.onSelect!(ti, ii); } : null, slide = props.onMoveItem;
        /* Alt and an arrow move the item a frame (Shift, a second), Home and End as far as it goes; the move is said */
        const slideKey = slide ? (e: KeyboardEvent) => {
          if (!e.altKey) return;
          const by = e.shiftKey ? 1 : trim;
          let to = e.key === 'ArrowLeft' ? it.start - by : e.key === 'ArrowRight' ? it.start + by : e.key === 'Home' ? before : e.key === 'End' ? after - it.length : null;
          if (to === null) return;
          e.preventDefault(); e.stopPropagation();
          to = Math.min(after - it.length, Math.max(before, Math.round(to / trim) * trim));
          if (Math.abs(to - it.start) < 1e-6) return;
          slide(ti, ii, to); nudge.current = { kind: 'move', ti, ii, v: to }; announce(tx('itemMovedTo', { name, time: tc(off + to) }));
        } : null;
        const press = pick ? pressProps(pick) : null;
        const item = (
          <div key={ii} data-kind={tr.kind} className={cx('sk-tl__item', 'sk-tl__item--' + tr.kind, it.start < -1e-6 && 'is-cut-start', end > D + 1e-6 && 'is-cut-end', it.state && 'is-' + it.state, slide && 'is-movable')} style={st} title={it.label}
            data-ti={ti} data-start={it.start} {...press}
            {...(slideKey ? { 'data-ii': ii, 'data-min': before, 'data-max': after - it.length, 'aria-keyshortcuts': 'Alt+ArrowLeft Alt+ArrowRight', 'aria-describedby': how + '-item',
              onKeyDown: (e: KeyboardEvent<HTMLElement>) => { slideKey(e); if (!e.defaultPrevented && press?.onKeyDown) press.onKeyDown(e); }, onKeyUp: settle, onBlur: settle } : null)}
            {...(pick ? { 'aria-label': [it.label, tr.label, tx('timeRange', { start: tc(off + it.start), end: tc(off + end) }), looped && tx('loopsToFill', { made: spoken(it.loop!, tx) }), word].filter(Boolean).join(', ') } : null)}>
            {inner}
            <span className="sk-tl__chip" aria-hidden="true"><Icon name={TRACK_ICON[tr.kind] || 'video'} size="var(--timeline-chip-icon-size)" /></span>
            {shown && <span className="sk-tl__label">{shown}</span>}
            {!pick && word && shown.toLowerCase() !== word && <span className="sk-sr">{', ' + word}</span>}
          </div>
        );
        return (
          <Fragment key={ii}>
            {cut.start !== undefined && cut.start > 0 && <span key={ii + 'b'} className="sk-tl__ghost" aria-hidden="true" style={{ left: ((it.start - cut.start) / D * 100) + '%', width: (cut.start / D * 100) + '%' }} />}
            {item}
            {sel && grip('in')}
            {sel && grip('out')}
            {cut.end !== undefined && cut.end > 0 && <span key={ii + 'a'} className="sk-tl__ghost" aria-hidden="true" style={{ left: (end / D * 100) + '%', width: (cut.end / D * 100) + '%' }} />}
          </Fragment>
        );
      });
      const lifted = mv && mv.track === ti, n = count;
      const move = props.onMoveTrack;
      /* Up and Down move the track a place at once; Enter or Space lifts it, the arrows move where it lands, and Enter or Space drops it there
         (Escape puts it back) */
      const drag = props.reorderable && (move
        ? <span className="sk-tl__drag" role="button" tabIndex={0} data-ti={ti} aria-label={tx('moveTrack', { track: tr.label, n: ti + 1, total: n })} aria-describedby={how} aria-keyshortcuts="ArrowUp ArrowDown"
            onBlur={() => { if (lift && lift.keys) setLift(null); }}
            onKeyDown={(e: KeyboardEvent) => {
              const up = lift && lift.keys && lift.track === ti ? lift : null;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!up) { setLift({ track: ti, to: ti, keys: true }); announce(tx('trackLifted', { track: tr.label, n: ti + 1, total: n })); return; }
                setLift(null);
                if (up.to !== ti) { moved.current = up.to; move(ti, up.to); announce(tx('trackMoved', { track: tr.label, n: up.to + 1, total: n })); }
                else announce(tx('trackDropped', { track: tr.label }));
                return;
              }
              if (e.key === 'Escape' && up) { e.preventDefault(); e.stopPropagation(); setLift(null); announce(tx('trackPutBack', { track: tr.label })); return; }
              const to = e.key === 'ArrowUp' ? (up ? up.to : ti) - 1 : e.key === 'ArrowDown' ? (up ? up.to : ti) + 1 : null;
              if (to === null) return;
              e.preventDefault();
              if (to < 0 || to >= n) return;
              if (up) { setLift({ track: ti, to, keys: true }); announce(tx('trackTo', { n: to + 1, total: n })); return; }
              moved.current = to; move(ti, to); announce(tx('trackMoved', { track: tr.label, n: to + 1, total: n }));
            }} />
        : <span className="sk-tl__drag" aria-hidden="true" />);
      return (
        <div key={ti} className={cx('sk-tl__row', lifted && 'is-lifted')}>
          <div className="sk-tl__head">
            {drag}
            <Icon name={TRACK_ICON[tr.kind] || 'video'} size="var(--timeline-head-icon-size)" />
            <span className="sk-tl__name" title={tr.label}>{tr.label}</span>
          </div>
          <div className={cx('sk-tl__lane', land && land.ti === ti && 'is-landing')} {...(dropping ? laneDrop(ti) : null)}>
            {items}
            {mark(ti)}
          </div>
        </div>
      );
    });
    /* The line where a moved track lands: above the track it takes the place of going up, below it going down */
    if (fresh && shown) rows.push(
      <div key="new" className="sk-tl__row sk-tl__row--new" aria-hidden="true">
        <div className="sk-tl__head">
          {props.reorderable && <span className="sk-tl__drag" style={{ visibility: 'hidden' }} />}
          <Icon name="plus" size="var(--timeline-head-icon-size)" />
          <span className="sk-tl__name" title={fresh.label}>{fresh.label}</span>
        </div>
        <div className={cx('sk-tl__lane', land && land.ti === count && 'is-landing')} {...laneDrop(count)}>{mark(count)}</div>
      </div>,
    );
    if (mv) rows.splice(mv.to > mv.track ? mv.to + 1 : mv.to, 0, <div key="drop" className="sk-tl__drop" aria-hidden="true" />);
    return rows;
  }, [tracks, D, off, trim, fps, props.onTrim, props.onSelect, props.onMoveTrack, props.onMoveItem, props.reorderable, props.onDrop, mv, lift, count, how, land, dropping, fresh, shown]);
  const seekable = !!props.onSeek;
  const zoomCtl = useMemo(() => ({ whole: view.whole, by: view.zoomBy, fit: view.fit }), [view.whole, view.zoomBy, view.fit]);
  return (
    <div ref={root} className={cx('sk-tl', (props.markers?.length || 0) > 0 && 'has-markers', view.zoomable && 'is-zoomable', props.className)} role="group" aria-label={props.label || tx('timeline')}
      onDragEnter={fresh ? () => { if (!shown && fits(fresh)) setShown(true); } : undefined}
      onDragLeave={fresh ? (e: DragEvent<HTMLElement>) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { setShown(false); setLand(null); } } : undefined}>
      <TimelineRuler duration={D} step={step} offset={off} rate={props.rate} markers={props.markers} laneW={laneW}
        flags={props.onSelectMarker || props.onMoveMarker ? { onSelect: props.onSelectMarker, onMove: props.onMoveMarker, onMoveEnd: props.onMoveMarkerEnd, trim, help: how + '-marker' } : undefined}
        zoom={view.zoomable ? zoomCtl : undefined}
        seek={seekable ? { playhead: props.playhead || 0, label: props.seekLabel || tx('seek'), trim, text: framesText, onSeek: props.onSeek! } : undefined} />
      <div ref={body} className={cx('sk-tl__body', pull.dragging && 'is-dragging')} onKeyDown={keys} {...pull.handlers}>
        {rows}
        {props.playhead !== undefined && (
          <div className="sk-tl__playwrap">
            <span className={cx('sk-tl__playhead', props.playhead >= D && 'is-end')} style={{ left: (props.playhead / D * 100) + '%' }} />
            {!seekable && <span className="sk-sr">{tx('playheadAt', { time: tc(off + props.playhead) })}</span>}
          </div>
        )}
        {props.reorderable && props.onMoveTrack && <span id={how} className="sk-sr">{tx('trackMoveHelp')}</span>}
        {props.onMoveItem && <span id={how + '-item'} className="sk-sr">{tx('moveItemHelp')}</span>}
        {props.onMoveMarker && <span id={how + '-marker'} className="sk-sr">{tx('moveMarkerHelp')}</span>}
      </div>
    </div>
  );
}
