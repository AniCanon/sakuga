import { useRef, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react';
import { cssObj } from '../../internal/css';
import { cx } from '../../internal/cx';
import { ratioOf } from '../../internal/ratio';
import { slots } from '../../internal/slots';
import '../../base.css';
import './Monitor.css';
import { usePick, type PickProps } from './pick';

export interface MonitorProps extends PickProps {
  /** Title-safe or an effect's area, in percent; accent for the selected one. */
  guides?: { x: number; y: number; w: number; h: number; accent?: boolean }[];
  /** The area an edit works on, with its label. */
  region?: { x: number; y: number; w: number; h: number; label?: string };
  /** Labels in the other corner. */
  labelsEnd?: string[];
  /** Takes the column's height instead of `height`. */
  fill?: boolean;
  /** The picture being edited. */
  image?: string;
  /** CSS, e.g. "object-position:50% 40%". */
  imageStyle?: string;
  /** Names the picture; decorative without it. */
  alt?: string;
  /** Corner labels: the cut and the timecode. */
  labels?: string[];
  /** The frame's height in px (default 392), unless `fill` or `fit="picture"`. */
  height?: number;
  /** A 9:16 frame in the middle. */
  centered?: boolean;
  /** The program's frame shape (16 / 9, '9 / 16', '16:9'): the Monitor is that shape whatever the picture, as large as its column allows
      and centred, taking the column as `fill` does; guides, region and children sit in that frame. The same shape as a `fill`
      CanvasStage, so switching between them never moves the frame. */
  ratio?: number | string;
  /** contain: the whole picture, not filling the frame. picture: the Monitor is its picture's own shape, as large as its column allows and centred, taking the column as `fill` does. */
  fit?: 'cover' | 'contain' | 'picture';
  /** Drawn over the picture: what is being edited on it. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Monitor is the editor's picture: the frame being edited, with its corner labels, the guides and the region an edit works on.
 *
 * Not for a take shown in a list or a strip (`Thumb`); a clip that plays where it is shown (`VideoPlayer`).
 *
 * Accessibility: The picture is an image named by `alt` (decorative without it); the labels are read as text; the guides are
 * hidden, and the region is read by its label. With `picks` the picture is for the pointer: the outline and its name are hidden
 * from assistive technology, and the timeline is where a keyboard selects the same items.
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Monitor(props: MonitorProps) {
  const { guides, region, labelsEnd, fill, image, imageStyle, alt, labels, height, centered, fit, ratio: frameRatio, children, className } = props;
  const fixed = frameRatio ? ratioOf(frameRatio) : null;
  const sl = slots(children), shaped = !!fixed || fit === 'picture';
  const [known, setKnown] = useState<{ image?: string; value: number } | null>(null);
  // A ratio measured for an earlier picture is not this one's: until the new one loads, the Monitor fills the column
  const ratio = fixed || (shaped && known && known.image === image ? known.value : null);
  const measure = (e: SyntheticEvent<HTMLImageElement>) => {
    const i = e.currentTarget;
    if (!fixed && i.naturalHeight > 0) setKnown({ image, value: i.naturalWidth / i.naturalHeight });
  };
  const frame = useRef<HTMLDivElement>(null), pick = usePick(props, frame);
  const style = shaped ? (ratio ? ({ '--monitor-ratio': ratio } as CSSProperties) : undefined) : fill ? undefined : { height: height || 392 };
  const box = (
    <div ref={frame} className={cx('sk-monitor', centered && 'is-centered', fill && !shaped && 'is-fill', shaped && 'is-picture', ratio && 'is-sized', fit === 'contain' && 'is-contain', className)} style={style}
      {...(shaped ? null : pick.handlers)}>
      {image && <img className="sk-monitor__pic" src={image} alt={alt || ''} style={cssObj(imageStyle)} onLoad={shaped ? measure : undefined} />}
      {sl.body}
      {pick.mark}
      {(guides || []).map((g, i) => <span key={'g' + i} className={cx('sk-monitor__guide', g.accent && 'is-accent')} style={{ left: g.x + '%', top: g.y + '%', width: g.w + '%', height: g.h + '%' }} aria-hidden="true" />)}
      {region && (
        <span className="sk-monitor__region" style={{ left: region.x + '%', top: region.y + '%', width: region.w + '%', height: region.h + '%' }}>
          {region.label && <b>{region.label}</b>}
        </span>
      )}
      {(labels || []).length > 0 && <div className="sk-monitor__hud">{labels!.map((l, i) => <span key={i}>{l}</span>)}</div>}
      {(labelsEnd || []).length > 0 && <div className="sk-monitor__hud is-end">{labelsEnd!.map((l, i) => <span key={i}>{l}</span>)}</div>}
    </div>
  );
  /* A shaped frame sits in its room: a click on the ground around it, where no pick is, clears the selection */
  return shaped ? <div className="sk-monitor-room" style={fixed && !fill && height ? { flex: 'none', height } : undefined} {...pick.handlers}>{box}</div> : box;
}
