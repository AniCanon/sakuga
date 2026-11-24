import { useRef, type CSSProperties } from 'react';
import { cx } from '../../internal/cx';
import { useLoadingVoice } from '../../internal/live';
import { sized } from '../../internal/size';
import { useWords } from '../../internal/words';
import '../../base.css';
import '../../ui/Loader/Loader.css';
import './AniCanonLoader.css';

/** AniCanon's loader, the mark: its ring traces in the accent; the crescent and moon dot never move. */
export interface AniCanonLoaderProps {
  /** Pixels, or a size token such as 'var(--button-icon-size)'. It reads down to 14. */
  size?: number | string;
  /** Announced to screen readers. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
  /** Inline style on the root element. */
  style?: CSSProperties;
}

/* AniCanon's loader (Kit): the mark itself. The ring traces in the accent; the crescent and the moon dot never move. */
/**
 * AniCanon's loader, the mark itself: its ring traces in the accent while something loads. AniCanonKit exports it as `Loader`.
 *
 * Not for plain loading in a drop zone, a frame or a button (`Loader` in the core); work whose share done is known (`Progress`);
 * a job's stages in order (`Stages`).
 *
 * Accessibility: Not focusable. When it appears it says its `label` (default "Loading") once through the page's live region,
 * unless it sits in a button, a link or a card, and in place it reads as a status of that name; the mark is hidden.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function AniCanonLoader({ size = 24, label, className, style }: AniCanonLoaderProps) {
  const tx = useWords();
  const ref = useRef<HTMLSpanElement>(null);
  useLoadingVoice(ref, label || tx('loading'));
  return (
    <span ref={ref} role="status" aria-label={label || tx('loading')} className={cx('sk-loader', className)} style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 100 100" aria-hidden="true" {...sized(size)}>
        <circle className="sk-loader__track" cx={50} cy={49} r={44} />
        <circle className="sk-loader__arc" cx={50} cy={49} r={44} />
        <path className="sk-loader__moon" d="M52 17a33 33 0 1 0 0.01 0Z M58 31a22 22 0 1 1 -0.01 0Z" fillRule="evenodd" />
        <circle className="sk-loader__moon" cx={67} cy={62} r={5} />
      </svg>
    </span>
  );
}
