import { useRef, type CSSProperties } from 'react';
import { cx } from '../../internal/cx';
import { useLoadingVoice } from '../../internal/live';
import { prefersReducedMotion } from '../../internal/motion';
import { sized } from '../../internal/size';
import { useWords } from '../../internal/words';
import '../../base.css';
import './Loader.css';

/** Sakuga's loader: a ball bouncing on twos, stretched as it falls, squashed on contact, the drawing before as an onion skin. It reads down to 16 px. With reduced motion the ball rests at the top. */
export interface LoaderProps {
  /** Pixels, or a size token such as 'var(--button-icon-size)'. It reads down to 16; a frame that waits for a picture takes 48 or more. */
  size?: number | string;
  /** Announced to screen readers. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
  /** Inline style on the root element. */
  style?: CSSProperties;
}

/* Sakuga's loader: a ball bouncing on twos, the first exercise every animator draws. Nine drawings, each held two frames at
   24 fps (the top held twice): spaced tight at the top and wide at the ground, stretched as it falls and squashed on contact,
   the drawing before showing through as an onion skin. With reduced motion the ball rests at the top. */
const BOUNCE = { cy: [22, 22, 28, 42, 62, 79, 62, 42, 28], rx: [11, 11, 11, 11, 9, 15, 9, 11, 11], ry: [11, 11, 11, 11, 14, 7, 14, 11, 11] };
type Axis = keyof typeof BOUNCE;
const AXES: Axis[] = ['cy', 'rx', 'ry'];

function Drawing({ className, before, still }: { className: string; before: boolean; still: boolean }) {
  const at = (k: Axis) => { const a = BOUNCE[k]; return before ? [a[a.length - 1]].concat(a.slice(0, -1)) : a; };
  return (
    <ellipse className={className} cx={50} cy={at('cy')[0]} rx={at('rx')[0]} ry={at('ry')[0]}>
      {still ? null : AXES.map((k) => <animate key={k} attributeName={k} values={at(k).join(';')} dur="0.75s" repeatCount="indefinite" calcMode="discrete" />)}
    </ellipse>
  );
}

/**
 * Sakuga's loader is a ball bouncing on twos, the first exercise every animator draws. Nine drawings, each held for two frames
 * at 24 fps, with the top held twice. The spacing is tight at the top and wide near the ground, the ball stretches as it falls
 * and squashes on contact, and the drawing before shows through as an onion skin. Use it anywhere something is being made or
 * loading: a busy drop zone, a stage, a frame waiting for its picture, a button.
 *
 * Not for work whose share done is known (`Progress`); AniCanon's own surfaces, where the mark loads (`AniCanonKit.Loader`).
 *
 * Accessibility: Not focusable. When it appears it says its `label` (default "Loading") once through the page's live region,
 * unless it sits in a button, a link or a card, and in place it reads as a status of that name; the drawing is hidden.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Loader({ size = 24, label, className, style }: LoaderProps) {
  const tx = useWords();
  const ref = useRef<HTMLSpanElement>(null);
  useLoadingVoice(ref, label || tx('loading'));
  const still = prefersReducedMotion();
  return (
    <span ref={ref} role="status" aria-label={label || tx('loading')} className={cx('sk-load', className)} style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 100 100" aria-hidden="true" {...sized(size)}>
        <line className="sk-load__ground" x1={30} y1={88} x2={70} y2={88} />
        {!still && <Drawing className="sk-load__onion" before still={still} />}
        <Drawing className="sk-load__ball" before={false} still={still} />
      </svg>
    </span>
  );
}
