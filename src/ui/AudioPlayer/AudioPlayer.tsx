import { useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { fmt } from '../../internal/time';
import { Icon } from '../Icon/Icon';
import { Waveform } from '../Waveform/Waveform';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './AudioPlayer.css';

export interface AudioPlayerProps {
  /** The sound's name; with a title the play button grows to 48 and the waveform sits under the titles. */
  title?: string;
  /** A line under the title ("Cast as Shounen Hero"). */
  subtitle?: string;
  /** Names the sound for screen readers when no title shows: "Play" and "Position in" are said with it. */
  label?: string;
  /** Its length in seconds. */
  duration: number;
  /** Where it is, in seconds: the played part of the waveform is the accent. */
  value?: number;
  /** Whether it is playing; the play button reads Pause while it is. */
  playing?: boolean;
  /** Called with the new state when play or pause is pressed. */
  onToggle?: (playing: boolean) => void;
  /** Makes the waveform a slider: called with the new time in seconds. */
  onSeek?: (seconds: number) => void;
  /** Real loudness, resampled to the bars that fit; without it a calm, even shape is drawn from `seed`. */
  peaks?: number[];
  /** How many bars the waveform draws; as many as fit without it. */
  bars?: number;
  /** Shapes the calm, even waveform drawn when there are no `peaks`. */
  seed?: number;
  /** `sm` for cards and rows. */
  size?: 'sm' | 'md';
  /** `media` on dark art: the play button is white with a dark glyph, as Button media is, so the one action reads over the picture. */
  variant?: 'default' | 'media';
  /** Extra class on the root element. */
  className?: string;
  /** Inline style on the root element. */
  style?: CSSProperties;
  /** Trailing actions beside the title (Recast, a menu). */
  children?: ReactNode;
}

/**
 * A voice line or sound clip: a round play button, a `Waveform` you can click, drag or arrow through to seek, and the time. Use
 * it wherever a character's voice or an audio take is heard. Listening only: voice settings live in casting, never next to the
 * player.
 *
 * Not for a sound drawn as bars alone, such as a track in the cut (`Waveform`); choosing a voice to cast (`VoiceTiles`); a
 * sound's level and mute (`VolumeControl`); the playhead of an episode or a short (`Scrubber`).
 *
 * Accessibility: Tab reaches the play button, announced "Play" or "Pause" (from `playing` once it is given) followed by
 * `label`, else `title` (or "audio"), then the title's actions (`children`), then, with `onSeek`, the waveform: a slider named
 * "Position in" plus that name, where arrows move a second, Home and End jump to either end, and the value is spoken as "12
 * seconds of 40 seconds". The time ("0:12 / 0:40") reads as text; without `onSeek` the waveform is hidden and can't be moved.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function AudioPlayer(props: AudioPlayerProps) {
  const tx = useWords(ownWords);
  const duration = props.duration || 1;
  const [own, setOwn] = useState(!!props.playing);
  /* playing, once given, is the page's: a press asks for the other state through onToggle and waits for it */
  const playing = props.playing !== undefined ? !!props.playing : own;
  const value = Math.min(duration, Math.max(0, props.value || 0));
  function toggle() { if (props.onToggle) props.onToggle(!playing); if (props.playing === undefined) setOwn(!playing); }
  const who = props.label || props.title || tx('audio');
  const play = (
    <button type="button" className="sk-audio__play" onClick={toggle} aria-label={tx(playing ? 'pause' : 'play', { name: who })}>
      <Icon key={playing ? 'pause' : 'play'} name={playing ? 'pause' : 'play'} size={props.size === 'sm' ? 'var(--audio-play-icon-size-sm)' : 'var(--audio-play-icon-size)'} />
    </button>
  );
  const wave = <Waveform peaks={props.peaks} bars={props.bars} seed={props.seed} size={props.size} variant={props.variant} duration={duration} value={value} onSeek={props.onSeek} label={tx('positionIn', { name: who })} />;
  const time = <span className="sk-audio__time">{fmt(value) + ' / ' + fmt(duration)}</span>;
  const head = props.title && (
    <div className="sk-audio__head">
      <span className="sk-audio__titles"><span className="sk-audio__title">{props.title}</span>{props.subtitle && <span className="sk-audio__sub">{props.subtitle}</span>}</span>
      {props.children && <span className="sk-audio__actions">{props.children}</span>}
    </div>
  );
  return (
    <div className={cx('sk-audio', 'sk-audio--' + (props.size || 'md'), props.variant === 'media' && 'sk-audio--media', props.title && 'sk-audio--titled', props.className)} style={props.style}>
      {play}
      <div className="sk-audio__main">{head}<div className="sk-audio__row">{wave}{time}</div></div>
    </div>
  );
}
