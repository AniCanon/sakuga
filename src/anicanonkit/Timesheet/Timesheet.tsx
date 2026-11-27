import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Timesheet.css';

export interface TimesheetProps {
  /** The cut's length, which the frame grid spans. */
  seconds: number;
  /** Frames a second (default 24). */
  fps?: number;
  /** Names the sheet for screen readers. */
  label?: string;
  /** A line under the grid. */
  note?: string;
  /** Each video's bracket, in frames, with its line (where it opens, how it continues). */
  spans: { start: number; end: number; label: string; detail?: string }[];
  /** The key frames the videos start and end on, numbered, at their frame. */
  keys?: { at: number; label: string }[];
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Timesheet is what gets generated for a cut, on a frame grid (24 a second, a tick on each whole second, the strip's two ends its first and last frames): each video's bracket,
 * the key frames it starts and ends on, and one line per video (where it opens, how it continues). A key sits on a rail above
 * the frames, its number centred in its badge, with a hairline down to its exact frame, which may fall between the ticks. A key on the first or last frame sits inside the strip, its hairline on
 * the frame, never hanging past the strip's end.
 *
 * Not for the cut's tracks under the preview (`Timeline`); the whole cut at a glance (`ProgramBar`); camera and timing notation
 * in a line (`Shorthand`); a cut's in and out frames while trimming (`TrimFrames`).
 *
 * Accessibility: Not focusable; a group named by `label` (default "Videos to make") whose label, note, key frame labels (with
 * "at frame 24") and each video's line (with "frames 0 to 48") read as text.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Timesheet({ seconds, fps: given, label, note, spans: list, keys, className }: TimesheetProps) {
  const tx = useWords(ownWords);
  const fps = given || 24, total = Math.round((seconds || 1) * fps), pct = (f: number) => (f / total * 100) + '%';
  const ticks = [];
  // Whole seconds only, inside the strip: its two ends are the scene's first and last frames
  for (let f = fps; f < total; f += fps) ticks.push(<i key={f} className="is-second" style={{ left: pct(f) }} />);
  const spans = list || [];
  return (
    <div className={cx('sk-tsheet', className)} role="group" aria-label={label || tx('videosToMake')}>
      <div className="sk-tsheet__top"><span>{label || tx('videosToMake')}</span>{note && <span>{note}</span>}</div>
      <div className="sk-tsheet__grid">
        {ticks}
        {spans.map((s, i) => <span key={'s' + i} className="sk-tsheet__span" style={{ left: pct(s.start), width: pct(s.end - s.start) }} />)}
        {(keys || []).map((k, i) => <span key={'k' + i} className={cx('sk-tsheet__key', k.at <= 0 && 'is-start', k.at >= total && 'is-end')} style={{ left: pct(Math.min(Math.max(k.at, 0), total)) }}>{k.label}<span className="sk-sr">{', ' + tx('atFrame', { n: k.at })}</span></span>)}
      </div>
      <div className="sk-tsheet__labels" style={{ gridTemplateColumns: spans.map((s) => (s.end - s.start) + 'fr').join(' ') }}>
        {spans.map((s, i) => <span key={i}><b>{s.label}</b>{s.detail && ' · ' + s.detail}<span className="sk-sr">{', ' + tx('framesFromTo', { start: s.start, end: s.end })}</span></span>)}
      </div>
    </div>
  );
}
