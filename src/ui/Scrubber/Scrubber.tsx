import { useRef } from 'react';
import { cx } from '../../internal/cx';
import { usePointerSeek } from '../../internal/pointerSeek';
import { sliderProps } from '../../internal/slider';
import { fmt, spoken } from '../../internal/time';
import { useWords } from '../../internal/words';
import '../../base.css';
import './Scrubber.css';

export interface ScrubberProps {
  /** The playhead, in seconds. */
  value: number;
  /** The length, in seconds. */
  max: number;
  /** Chapter marks, in seconds. */
  markers?: number[];
  /** How much has loaded, in seconds. */
  buffered?: number;
  /** What an arrow press moves, in seconds (default 10); Page Up and Page Down move six steps. */
  step?: number;
  /** Names the slider. */
  label?: string;
  /** `false` hides the current time and the total. */
  showTimes?: boolean;
  /** Called with the new playhead, in seconds. */
  onChange?: (seconds: number) => void;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Scrubber shows and sets the playhead: played, buffered and remaining time, with the current time and total length.
 *
 * Not for how far something being made has come (`Progress`); seeking inside a voice line or a sound (`AudioPlayer`); the
 * playhead across the cut's tracks (`Timeline`); moving through the story in story order (`StoryScrubber`).
 *
 * Accessibility: A slider named by `label` (default "Seek") that Tab reaches: arrows move it by `step` seconds (default 10),
 * Page Up and Page Down by six steps, Home and End to either end, and its value is spoken as "1 minute 5 seconds of 3 minutes 0
 * seconds". The times beside it read as text and the markers are hidden; without `onChange` it reads as read-only.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Scrubber(props: ScrubberProps) {
  const tx = useWords();
  const max = props.max || 1, value = Math.min(max, Math.max(0, props.value || 0));
  const pct = (v: number) => (Math.min(max, Math.max(0, v)) / max * 100) + '%';
  const ref = useRef<HTMLDivElement>(null);
  const step = props.step || 10;
  const drag = usePointerSeek(ref, (f) => { if (props.onChange) props.onChange(f * max); });
  const bar = (
    <div ref={ref} className={cx('sk-scrub', drag.dragging && 'is-dragging')}
      {...sliderProps({ label: props.label || tx('seek'), value, max, step, page: step * 6, text: tx('timeOf', { value: spoken(value, tx), total: spoken(max, tx) }), onChange: props.onChange })} {...drag.handlers}>
      <div className="sk-scrub__track">
        {props.buffered !== undefined && <div className="sk-scrub__buf" style={{ width: pct(props.buffered) }} />}
        <div className="sk-scrub__fill" style={{ width: pct(value) }} />
        {(props.markers || []).map((m) => <span key={m} className="sk-scrub__mark" aria-hidden="true" style={{ left: pct(m) }} />)}
        <span className="sk-scrub__thumb" style={{ left: pct(value) }} />
      </div>
    </div>
  );
  if (props.showTimes === false) return <div className={cx('sk-scrub-wrap', props.className)}>{bar}</div>;
  return <div className={cx('sk-scrub-wrap', props.className)}><span>{fmt(value)}</span>{bar}<span>{fmt(max)}</span></div>;
}
