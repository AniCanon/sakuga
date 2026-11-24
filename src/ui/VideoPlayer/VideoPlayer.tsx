import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type SyntheticEvent } from 'react';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { IconButton } from '../IconButton/IconButton';
import { useLoader } from '../../internal/loader';
import { Scrubber } from '../Scrubber/Scrubber';
import '../../base.css';
import '../IconButton/IconButton.css';
import '../Scrubber/Scrubber.css';
import './VideoPlayer.css';

export interface VideoPlayerProps {
  /** The video; with it the player plays its own. */
  src?: string;
  /** The frame shown before it plays, and the picture without `src`. */
  poster?: string;
  /** Names it in every control: "Play {name}". */
  name?: string;
  /** Describes the picture. */
  alt?: string;
  /** Takes its column's height, as large as its shape allows, centred. */
  fill?: boolean;
  /** Its shape as a number; 16:9 by default. */
  ratio?: number;
  /** Plays it again from the start. */
  loop?: boolean;
  /** Starts it silent. */
  muted?: boolean;
  /** Without `src`: whether it plays. */
  playing?: boolean;
  /** Without `src`: the playhead, in seconds. */
  time?: number;
  /** Without `src`: its length, in seconds. */
  duration?: number;
  /** Without `src`: how much has loaded, in seconds. */
  buffered?: number;
  /** Without `src`: waiting for frames. */
  loading?: boolean;
  /** Without `src`: it has played to the end. */
  ended?: boolean;
  /** Called with the state play or pause asks for. */
  onToggle?: (playing: boolean) => void;
  /** Called with the new playhead, in seconds. */
  onSeek?: (seconds: number) => void;
  /** Called with the new mute. */
  onMute?: (muted: boolean) => void;
  /** Extra class on the player. */
  className?: string;
  /** Inline style on the player. */
  style?: CSSProperties;
}

const VIDEO_IDLE_MS = 2500;

interface VideoState { playing: boolean; time: number; dur: number; buf: number; loading: boolean; ended: boolean; muted: boolean; full: boolean; shown: boolean }

/**
 * VideoPlayer is a clip played where it is shown: its picture, with play, the track, sound and full screen over it.
 *
 * Not for the frame being edited, with its guides (`Monitor`); a clip in a grid or a strip (`MediaCard` or `Thumb`); only the
 * playhead under a picture (`Scrubber`); hearing a voice line or a take's sound (`AudioPlayer`).
 *
 * Accessibility: A group named "{name}, video". Tab reaches play or pause (a button named "Play {name}", "Pause {name}" or "Play
 * {name} again"), the seek slider ("Seek in {name}", a second per arrow), mute (a toggle, "Mute {name}") and full screen (a toggle,
 * "Full screen"). With focus anywhere in the player, Space or K plays and pauses, M mutes, F goes full screen and Left and Right
 * step a second; keyboard focus inside keeps the controls shown (a pointer's focus lets them fade), and the large play and the
 * picture's press do what play does; the large play goes as it plays, and hands its focus to play or pause. The loader is named
 * "Loading {name}". Gap: the time is read through the slider only, with no live update while it plays.
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function VideoPlayer(props: VideoPlayerProps) {
  const AppLoader = useLoader();
  const tx = useWords(ownWords);
  const root = useRef<HTMLDivElement>(null), vid = useRef<HTMLVideoElement>(null), idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [s, setS] = useState<VideoState>({ playing: false, time: props.time || 0, dur: props.duration || 0, buf: 0, loading: false, ended: false, muted: !!props.muted, full: false, shown: true });
  const set = (o: Partial<VideoState>) => setS((p) => ({ ...p, ...o }));
  const src = !!props.src, name = props.name || props.alt || '';
  const playing = props.playing !== undefined ? !!props.playing : s.playing;
  const loading = props.loading !== undefined ? !!props.loading : s.loading;
  const ended = props.ended !== undefined ? !!props.ended : s.ended;
  const time = props.time !== undefined && !src ? props.time : s.time, dur = s.dur || props.duration || 0;
  /* The controls stay while the pointer moves or keyboard focus is inside, and go after it rests */
  function wake() {
    clearTimeout(idle.current);
    if (!s.shown) set({ shown: true });
    idle.current = setTimeout(() => { const r = root.current; if (r && !r.querySelector(':focus-visible')) set({ shown: false }); }, VIDEO_IDLE_MS);
  }
  useEffect(() => () => clearTimeout(idle.current), []);
  useEffect(() => {
    const onFull = () => set({ full: document.fullscreenElement === root.current });
    document.addEventListener('fullscreenchange', onFull);
    return () => document.removeEventListener('fullscreenchange', onFull);
  }, []);
  function toggle() {
    const v = vid.current;
    if (v) { if (v.paused || v.ended) v.play()?.catch(() => {}); else v.pause(); }
    if (props.onToggle) props.onToggle(!playing);
    wake();
  }
  /* A seek away from the end is no longer ended: play says Play, not Play again */
  function seek(t: number) {
    t = Math.max(0, Math.min(dur, t));
    const v = vid.current;
    if (v) v.currentTime = t; else set({ time: t });
    if (t < dur) set({ ended: false });
    if (props.onSeek) props.onSeek(t);
  }
  /* The large play goes as it plays, so focus moves to the controls' play or pause rather than falling out of the player */
  function start(e: MouseEvent<HTMLElement>) {
    const had = document.activeElement === e.currentTarget;
    toggle();
    const b = root.current?.querySelector<HTMLElement>('.sk-video__row > .sk-ib');
    if (had && b) b.focus({ preventScroll: true });
  }
  const muted = props.muted !== undefined && !src ? !!props.muted : s.muted;
  function mute() { const m = !muted; if (vid.current) vid.current.muted = m; set({ muted: m }); if (props.onMute) props.onMute(m); }
  function full() {
    const r = root.current;
    if (!r) return;
    const p = document.fullscreenElement === r ? document.exitFullscreen() : r.requestFullscreen?.();
    p?.catch(() => {});
  }
  function keys(e: KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.closest('input,textarea,[role="slider"]') && e.key !== 'k' && e.key !== 'm' && e.key !== 'f') return;
    const k = e.key.toLowerCase();
    if ((k === ' ' && !target.closest('button')) || k === 'k') { e.preventDefault(); toggle(); }
    else if (k === 'm') { e.preventDefault(); mute(); }
    else if (k === 'f') { e.preventDefault(); full(); }
    else if ((k === 'arrowleft' || k === 'arrowright') && !target.closest('[role="slider"]')) { e.preventDefault(); seek(time + (k === 'arrowright' ? 1 : -1)); }
    wake();
  }
  const shown = !playing || loading || s.shown;
  const media = (e: SyntheticEvent<HTMLVideoElement>) => e.currentTarget;
  const picture = src
    ? <video ref={vid} className="sk-video__media" src={props.src} poster={props.poster} playsInline preload="metadata" muted={muted} loop={!!props.loop} aria-label={props.alt}
        onPlay={() => { set({ playing: true, ended: false }); wake(); }} onPause={() => set({ playing: false })}
        onTimeUpdate={(e) => set({ time: media(e).currentTime })} onLoadedMetadata={(e) => set({ dur: media(e).duration || 0 })}
        onWaiting={() => set({ loading: true })} onPlaying={() => set({ loading: false })} onCanPlay={() => set({ loading: false })}
        onEnded={() => set({ playing: false, ended: true })}
        onProgress={(e) => { const b = media(e).buffered; if (b && b.length) set({ buf: b.end(b.length - 1) }); }} />
    : props.poster ? <img className="sk-video__media" src={props.poster} alt={props.alt || ''} /> : null;
  const playLabel = ended ? tx('playAgain', { name }) : tx(playing ? 'pause' : 'play', { name });
  const style = { ...(props.ratio ? { '--video-ratio': props.ratio } : {}), ...props.style } as CSSProperties;
  const player = (
    <div ref={root} className={cx('sk-video', playing && 'is-playing', shown && 'is-shown', s.full && 'is-full', props.className)} role="group" aria-label={tx('videoNamed', { name })}
      style={style} tabIndex={-1} onKeyDown={keys} onPointerMove={wake} onFocus={wake}>
      {picture}
      <button type="button" className="sk-video__surface" tabIndex={-1} aria-hidden="true" onClick={toggle} />
      {loading
        ? <div className="sk-video__wait"><AppLoader size="var(--video-loader-size)" label={tx('loadingItem', { name })} /></div>
        : !playing && <div className="sk-video__mid"><IconButton className="sk-video__big" variant="media" icon="play" iconSize="var(--video-big-icon-size)" label={playLabel} onClick={start} /></div>}
      <div className="sk-video__controls">
        <Scrubber value={time} max={dur || 1} buffered={s.buf || props.buffered} step={1} label={tx('seekIn', { name })} onChange={seek} />
        <div className="sk-video__row">
          <IconButton variant="media" icon={playing ? 'pause' : 'play'} label={playLabel} onClick={toggle} />
          <span className="sk-video__gap" />
          <IconButton variant="media" icon={muted ? 'volume-off' : 'volume'} pressed={muted} label={tx('mute', { name })} onClick={mute} />
          <IconButton variant="media" icon="fullscreen" pressed={s.full} label={tx('fullScreen')} onClick={full} />
        </div>
      </div>
    </div>
  );
  return props.fill ? <div className="sk-video-room">{player}</div> : player;
}
