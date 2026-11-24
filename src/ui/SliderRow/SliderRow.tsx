import { useRef } from 'react';
import { cx } from '../../internal/cx';
import { usePointerSeek } from '../../internal/pointerSeek';
import { sliderProps } from '../../internal/slider';
import '../../base.css';
import './SliderRow.css';

export interface SliderRowProps {
  /** What it sets; names the slider. */
  label: string;
  /** 0–100 along the track. */
  value: number;
  /** As people read it: "+0.2", "−3 dB". */
  readout: string;
  /** Can't be moved. */
  disabled?: boolean;
  /** Makes the track draggable and arrow-key operable; called with 0–100. */
  onChange?: (value: number) => void;
  /** Extra class on the root element. */
  className?: string;
}

/* The track alone, for a control that draws its own label and readout (VolumeControl) */
export function SliderTrack({ value, label, readout, onChange, disabled }: Omit<SliderRowProps, 'className'>) {
  const v = Math.max(0, Math.min(100, value || 0)), live = !!onChange && !disabled, ref = useRef<HTMLSpanElement>(null);
  const drag = usePointerSeek(ref, (f) => onChange!(Math.round(f * 100)));
  return (
    <span
      ref={ref} className={cx('sk-slidertrack', live && 'is-live', drag.dragging && 'is-dragging')}
      {...sliderProps({ label, value: v, max: 100, step: 1, shiftStep: 10, page: 10, text: readout, onChange, disabled })}
      {...(live ? drag.handlers : null)}
    >
      <span className="sk-slidertrack__thumb" style={{ left: v + '%' }} />
    </span>
  );
}

/**
 * SliderRow is a labelled value on a track: the name, the track (0–100) and the readout as the creator reads it (`+0.2`, `−3
 * dB`, `100%`). `disabled` dims the track.
 *
 * Not for a value where one unit matters, such as 1px or 2° (`NumberField`); a sound's level with its mute (`VolumeControl`);
 * one setting on or off (`Switch`); the playhead of an episode or a short (`Scrubber`).
 *
 * Accessibility: A slider named by `label` that Tab reaches, its value spoken as the `readout` (the name and readout beside it
 * are hidden, so neither is read twice); with `onChange`, arrows move it by 1 (10 with Shift), Page Up and Page Down by 10, and
 * Home and End to 0 and 100. Without `onChange` it reads as read-only, and `disabled` takes it out of the tab order and marks
 * it disabled.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SliderRow({ label, value, readout, disabled, onChange, className }: SliderRowProps) {
  return (
    <div className={cx('sk-sliderrow', disabled && 'is-off', className)}>
      <span className="sk-sliderrow__label" aria-hidden="true">{label}</span>
      <SliderTrack value={value} label={label} readout={readout} onChange={onChange} disabled={disabled} />
      <b className="sk-sliderrow__value" aria-hidden="true">{readout}</b>
    </div>
  );
}
