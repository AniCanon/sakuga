import type { MouseEventHandler } from 'react';
import { IconButton } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { SliderTrack } from '../../ui/SliderRow/SliderRow';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './VolumeControl.css';

export interface VolumeControlProps {
  /** The level, 0 to 100. */
  value: number;
  /** Mute is on: its button reads pressed and the level shows Muted. */
  muted?: boolean;
  /** Names the sound in the buttons' labels. */
  what?: string;
  /** Makes Mute a link. */
  href?: string;
  /** Mute's press. */
  onMute?: MouseEventHandler;
  /** Called with 0–100. */
  onChange?: (value: number) => void;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * VolumeControl is a sound’s mute button, its level and the readout (Muted when muted). `what` names the sound for the buttons’
 * labels (the video’s own sound). `onMute` and `onChange` (0–100) make it operable; the track drags like SliderRow's.
 *
 * Not for any other labelled value on a track (`SliderRow`); one setting on or off (`Switch`); hearing a voice line or a take
 * (`AudioPlayer`).
 *
 * Accessibility: Tab reaches the mute button, a toggle named "Mute" plus `what` (default "the sound") and "pressed" when muted,
 * then a slider named "Volume of the sound" and spoken as its percent or "Muted"; with `onChange`, arrows move it by 1 (10 with
 * Shift), Page Up and Page Down by 10, and Home and End to 0 and 100. Without `onChange` the slider reads as read-only.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function VolumeControl({ value, muted, what: given, href, onMute, onChange, className }: VolumeControlProps) {
  const tx = useWords(ownWords);
  const what = given || tx('theSound');
  return (
    <div className={cx('sk-volume', muted && 'is-muted', className)}>
      <IconButton variant="plain" icon={muted ? 'volume-off' : 'volume'} pressed={!!muted} label={tx('mute', { name: what })} href={href} onClick={onMute} />
      <SliderTrack value={value} label={tx('volumeOf', { name: what })} readout={muted ? tx('muted') : tx.num(value) + '%'} onChange={onChange} />
      <b>{muted ? tx('muted') : tx.num(value) + '%'}</b>
    </div>
  );
}
