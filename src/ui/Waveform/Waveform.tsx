import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { cx } from '../../internal/cx';
import { usePointerSeek } from '../../internal/pointerSeek';
import { sliderProps } from '../../internal/slider';
import { spoken } from '../../internal/time';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Waveform.css';

/** A sound as 2px bars with 2px gaps across its width: AudioPlayer, Timeline's sound tracks and sound options draw with it. A slider only with onSeek. */
export interface WaveformProps {
  /** Real loudness, 0–1, resampled to the bars that fit. */
  peaks?: number[];
  /** A fixed bar count instead of fitting the width. */
  bars?: number;
  /** Shapes the calm placeholder drawn without peaks. */
  seed?: number;
  /** Seconds; the played part takes the accent. */
  value?: number;
  /** The sound's length in seconds; with `value` the played part is the accent. */
  duration?: number;
  /** `md` (28 px) or `sm` (20 px). */
  size?: 'sm' | 'md';
  /** `media` on dark art. */
  variant?: 'default' | 'media';
  /** The sound option in use. */
  selected?: boolean;
  /** The sound option chosen. */
  active?: boolean;
  /** Makes it the slider; called with seconds. */
  onSeek?: (seconds: number) => void;
  /** The slider's name, e.g. "Position in His voice". */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
  /** Inline style on the root element. */
  style?: CSSProperties;
}

function audioPeaks(n: number, seed?: number): number[] {
  const out: number[] = [];
  let x = seed || 7;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    const env = Math.sin(Math.PI * (i + 0.5) / n);
    out.push(Math.max(0.12, Math.min(1, 0.25 + env * 0.55 + (r - 0.5) * 0.5)));
  }
  return out;
}

/* Waveform: a sound as 2px bars with 2px gaps across its width. `peaks` (0–1) are resampled to the bars that fit;
   without them a calm shape comes from `seed`. The played part is one clipped layer, so playback sweeps linearly.
   It is a slider only when given onSeek. */
function fitPeaks(peaks: number[], n: number): number[] {
  if (peaks.length === n) return peaks;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.floor(i * peaks.length / n), b = Math.max(a + 1, Math.floor((i + 1) * peaks.length / n));
    let m = 0;
    for (let k = a; k < b && k < peaks.length; k++) m = Math.max(m, peaks[k]);
    out.push(m);
  }
  return out;
}

/**
 * Waveform draws a sound as bars: a voice line, a take, a track in the cut, a generated sound option. It is the one drawing
 * every sound in Sakuga uses: `AudioPlayer` is a play button, a Waveform and the time, and `Timeline` draws its audio, dialogue
 * and music tracks with it.
 *
 * Not for a sound with its play button and time (`AudioPlayer`); the cut's tracks laid out in time (`Timeline`); the playhead
 * of an episode or a short (`Scrubber`).
 *
 * Accessibility: Without `onSeek` it is decorative and hidden from screen readers. With `onSeek` it is a slider named by
 * `label` (default "Position") that Tab reaches: arrows move it by a second, Home and End to either end, and its value is
 * spoken as "12 seconds of 40 seconds".
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Waveform(props: WaveformProps) {
  const tx = useWords(ownWords);
  const duration = props.duration || 1, value = Math.min(duration, Math.max(0, props.value || 0));
  const ref = useRef<HTMLDivElement>(null), [fit, setFit] = useState(0), seekable = !!props.onSeek;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || props.bars) return undefined;
    const measure = () => { const n = Math.floor((el.clientWidth + 2) / 4); if (n > 0) setFit(n); };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, [props.bars]);
  const n = props.bars || fit || (props.size === 'sm' ? 56 : 88);
  const peaks = useMemo(() => props.peaks ? fitPeaks(props.peaks, n) : audioPeaks(n, props.seed), [props.peaks, n, props.seed]);
  const drag = usePointerSeek(ref, (f) => { props.onSeek!(f * duration); });
  const bars = useMemo(() => peaks.map((p, i) => <span key={i} style={{ height: Math.round(p * 100) + '%' }} />), [peaks]);
  const aria = seekable
    ? sliderProps({ label: props.label || tx('position'), value, max: duration, step: 1, text: tx('timeOf', { value: spoken(value, tx), total: spoken(duration, tx) }), onChange: props.onSeek })
    : { 'aria-hidden': 'true' as const };
  return (
    <div ref={ref} style={props.style}
      className={cx('sk-wave', props.size === 'sm' && 'sk-wave--sm', props.variant === 'media' && 'sk-wave--media', (props.selected || props.active) && 'is-selected', seekable && 'is-seekable', drag.dragging && 'is-dragging', props.className)}
      {...aria} {...(seekable ? drag.handlers : null)}>
      <span className="sk-wave__bars">{bars}</span>
      {props.value !== undefined && <span className="sk-wave__bars sk-wave__bars--played" style={{ clipPath: 'inset(0 ' + (100 - value / duration * 100) + '% 0 0)' }}>{bars}</span>}
    </div>
  );
}
