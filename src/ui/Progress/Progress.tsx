import { cx } from '../../internal/cx';
import '../../base.css';
import './Progress.css';

/** How far something being made has come, 0 to 100; `tone: 'media'` over art. */
export interface ProgressProps {
  /** How far it has come, 0 to 100. */
  value: number;
  /** Names what is being made, for screen readers ("Rendering your take"). */
  label?: string;
  /** `media` over art or video, so the track stays light. */
  tone?: 'media';
  /** Extra class on the root element. */
  className?: string;
}

/* How far along something is, as a bar: the value in percent, named for screen readers. Over art it takes the media tone. */
/**
 * Progress is how far something being made has come, as a line that fills in the accent.
 *
 * Not for work whose length is unknown (`Loader`); the playhead of an episode or a short (`Scrubber`); where a person is in a
 * flow they step through (`Stepper`).
 *
 * Accessibility: Not focusable; a progress bar announced with its percent. Name it with `label`; without one it has no name. In
 * forced colours the track keeps an edge and the fill takes Highlight.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Progress({ value, label, tone, className }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div className={cx('sk-progress', tone === 'media' && 'is-media', className)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
      <span className="sk-progress__fill" style={{ width: v + '%' }} />
    </div>
  );
}
