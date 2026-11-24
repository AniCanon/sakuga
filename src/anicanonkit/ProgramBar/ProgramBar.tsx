import { useRef } from 'react';
import { cx } from '../../internal/cx';
import { usePointerSeek } from '../../internal/pointerSeek';
import { sliderProps } from '../../internal/slider';
import { tc } from '../../internal/time';
import { useWords, type WordKey } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './ProgramBar.css';

export interface ProgramBarProps {
  /** The cut's length so far, in seconds. */
  duration: number;
  /** Its planned length, in seconds, which the bar spans; `duration` without it. */
  planned?: number;
  /** The total read as text at the bar's end ("12:40 of 14:00"). */
  total?: string;
  /** Where the playhead is, in seconds. */
  playhead?: number;
  /** A press or drag on the bar, or the playhead as a slider (an arrow a second, Shift ten): the new time in seconds, never past
      `duration`. */
  onSeek?: (seconds: number) => void;
  /** Default 1/24. */
  seekStep?: number;
  /** The slider's name. Default "Seek". */
  seekLabel?: string;
  /** The part the Timeline shows, in seconds. */
  window?: { start: number; length: number };
  /** The cut's sections in planned proportion: `cut`, `partial` (with gaps) or `missing`. */
  sections?: { label: string; start: number; length: number; state?: 'cut' | 'partial' | 'missing' }[];
  /** Numbered notes from screening, at their time; `done` once handled. */
  marks?: { at: number; label: string; done?: boolean }[];
  /** Names the group; "The whole cut" without it. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

const PBAR_STATE: Record<string, WordKey> = { partial: 'partlyCut', missing: 'missing' };

/**
 * ProgramBar is the whole cut at a glance: sections in planned proportion (`cut`, `partial` with gaps, `missing`), the window
 * the Timeline shows, the playhead, and numbered note `marks` from screening. A mark sits on its own rail above the bar, its
 * number centred in its badge, with a hairline down to its exact point, as Timeline's markers do, so it never covers a
 * section's label.
 *
 * Not for the cut's tracks to edit (`Timeline`); the playhead of an episode or a short being watched (`Scrubber`); how far
 * something being made has come (`Progress`); moving through the story in story order (`StoryScrubber`).
 *
 * Accessibility: Not focusable without `onSeek`; a group named by `label` (default "The whole cut") whose section labels (with
 * "partly cut" or "missing"), mark labels (with "done"), the window ("Timeline shows 0:30 to 1:00"), the playhead ("Playhead
 * at 0:42") and the total read as text. With `onSeek` the playhead is a slider named "Seek" (`seekLabel`) whose value reads
 * "Playhead at 0:42".
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ProgramBar({ duration, planned, total, playhead, onSeek, seekStep, seekLabel, window: win, sections, marks, label, className }: ProgramBarProps) {
  const tx = useWords(ownWords);
  const D = duration || 1, P = planned || D;
  const pct = (t: number) => (t / P * 100) + '%';
  /* onSeek: a press on the bar moves the playhead there and a drag scrubs; only what is cut can be reached, a frame at a time */
  const track = useRef<HTMLDivElement>(null), seekable = !!onSeek, fr = seekStep || 1 / 24;
  const toFrame = (v: number) => Math.min(D, Math.max(0, Math.round(v / fr) * fr));
  const scrub = usePointerSeek(track, (f) => { if (onSeek) onSeek(toFrame(f * P)); });
  const ph = playhead || 0;
  /* It only repeats the ruler unless it holds scenes, planned time not cut yet, notes, or the window of a zoomed timeline */
  const carries = (sections || []).length > 0 || (marks || []).length > 0 || (planned || 0) > (duration || 0) + 1e-6
    || (!!win && win.length < P - 1e-6);
  if (!carries) return null;
  return (
    <div className={cx('sk-pbar', className)} role="group" aria-label={label || tx('wholeCut')}>
      <div ref={track} className={cx('sk-pbar__track', seekable && 'is-seekable', scrub.dragging && 'is-scrubbing')} {...(seekable ? scrub.handlers : null)}>
        {(sections || []).map((s, i) => (
          <span key={i} className={cx('sk-pbar__sec', 'is-' + (s.state || 'cut'))} style={{ left: pct(s.start), width: pct(s.length) }} title={s.label}>
            <b>{s.label}</b>{s.state && PBAR_STATE[s.state] && <span className="sk-sr">{', ' + tx(PBAR_STATE[s.state])}</span>}
          </span>
        ))}
        {win && (
          <span className="sk-pbar__window" style={{ left: pct(win.start), width: pct(win.length) }}>
            <span className="sk-sr">{tx('timelineShows', { start: tc(win.start), end: tc(win.start + win.length) })}</span>
          </span>
        )}
        {(marks || []).map((m, i) => <span key={'m' + i} className={cx('sk-pbar__mark', m.done && 'is-done')} style={{ left: pct(m.at) }} title={m.label}>{m.label}{m.done && <span className="sk-sr">{', ' + tx('doneState')}</span>}</span>)}
        {seekable
          ? <span className="sk-pbar__playhead" style={{ left: pct(ph) }}
              {...sliderProps({ label: seekLabel || tx('seek'), value: ph, max: D, step: 1, shiftStep: 10, page: 10, text: tx('playheadAt', { time: tc(ph) }), onChange: (v) => { onSeek!(toFrame(v)); } })} />
          : playhead !== undefined && <span className="sk-pbar__playhead" style={{ left: pct(playhead) }}><span className="sk-sr">{tx('playheadAt', { time: tc(playhead) })}</span></span>}
      </div>
      <span className="sk-pbar__total">{total}</span>
    </div>
  );
}
