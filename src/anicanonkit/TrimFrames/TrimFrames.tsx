import { IconButton, Thumb } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './TrimFrames.css';

export interface TrimFrame {
  /** The frame's picture. */
  image: string;
  /** CSS for the picture in its frame. */
  imageStyle?: string;
  /** Where the frame is. */
  timecode: string;
  /** Makes the frame a link ("In frame, 0:12"); its nudges then stay buttons. */
  href?: string;
}

export interface TrimFramesProps {
  /** The cut's first frame. */
  in: TrimFrame;
  /** The cut's last frame. */
  out: TrimFrame;
  /** The end being trimmed, ringed. */
  active?: 'in' | 'out';
  /** Each frame's width in px. */
  frameWidth?: number;
  /** Each frame's height in px. */
  frameHeight?: number;
  /** Names the pair for screen readers. */
  label?: string;
  /** A nudge pressed on a frame with no href. */
  onNudge?: (which: 'in' | 'out', frames: -1 | 1) => void;
}

/**
 * TrimFrames shows a cut’s in and out frames with their timecodes and a frame-at-a-time nudge under each. `active` (`in` or
 * `out`) rings the frame being trimmed. Each frame takes `image`, `imageStyle`, `timecode` and an optional `href`. Frame size
 * with `frameWidth` and `frameHeight` (60 × 107 for 9:16). Frames narrower than their rows (a 9:16 cut at 60 × 107) centre the
 * picture, with its name, timecode and nudges centred under it.
 *
 * Not for trimming an item on the tracks by its ends (`Timeline`); a picture in a frame (`Thumb`); a number stepped a unit at a
 * time (`NumberField`); the frame grid of what gets generated for a cut (`Timesheet`).
 *
 * Accessibility: A group named by `label` (default "Trim"): each frame reads "In" or "Out" and its timecode, a frame with
 * `href` is a link named like "In frame, 0:12" (with "selected" on the `active` one), and Tab reaches its nudge buttons ("In a
 * frame earlier", "In a frame later", and the same for Out). Without `href` the nudges run `onNudge`.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function TrimFrames({ in: inFrame, out, active, frameWidth, frameHeight, label, onNudge }: TrimFramesProps) {
  const tx = useWords(ownWords);
  const fw = frameWidth || 128, fh = frameHeight || 72;
  function frame(f: Partial<TrimFrame>, which: 'in' | 'out') {
    const isIn = which === 'in', name = tx(isIn ? 'trimIn' : 'trimOut');
    const on = active === which, nudge = (d: -1 | 1) => (!f.href && onNudge ? () => onNudge(which, d) : undefined);
    const Pic = f.href ? 'a' : 'span';
    return (
      <div className="sk-trimframes__f">
        <Pic href={f.href} className="sk-trimframes__pic" aria-label={f.href ? [tx(isIn ? 'inFrame' : 'outFrame'), f.timecode, on && tx('selected')].filter(Boolean).join(', ') : undefined}>
          <Thumb image={f.image} imageStyle={f.imageStyle} width={fw} height={fh} selected={on} />
        </Pic>
        <div className="sk-trimframes__lab"><b>{name}</b><span>{f.timecode}</span></div>
        <div className="sk-trimframes__nudge">
          <IconButton variant="plain" icon="skip-back" iconSize={16} label={tx(isIn ? 'inEarlier' : 'outEarlier')} href={f.href} onClick={nudge(-1)} />
          <IconButton variant="plain" icon="skip-forward" iconSize={16} label={tx(isIn ? 'inLater' : 'outLater')} href={f.href} onClick={nudge(1)} />
        </div>
      </div>
    );
  }
  /* Under 96px a frame is narrow (9:16): its picture, name, timecode and nudges are centred under one another */
  return <div className={cx('sk-trimframes', fw < 96 && 'is-narrow')} role="group" aria-label={label || tx('trim')}>{frame(inFrame || {}, 'in')}{frame(out || {}, 'out')}</div>;
}
