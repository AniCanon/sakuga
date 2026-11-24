import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useDrag } from '../../internal/drag';
import { announce } from '../../internal/live';
import { motionMs } from '../../internal/motion';
import { usePresence } from '../../internal/presence';
import { Icon, type IconName } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Toast.css';

export interface ToastProps {
  /** What happened, in a line. */
  title: string;
  /** A line under it. */
  text?: string;
  /** A leading glyph. */
  icon?: IconName;
  /** A leading avatar, in place of the icon. */
  image?: string;
  /** Drawn in place of the icon. */
  media?: ReactNode;
  /** Set it to control the toast: false plays its exit, then it unmounts. Without it, Dismiss plays the exit and then calls onDismiss. */
  open?: boolean;
  /** Without `open`, called after the exit has played. */
  onDismiss?: () => void;
  /** An action button. */
  children?: ReactNode;
  /** Inline style on the root element. */
  style?: CSSProperties;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * A short confirmation that something finished, rising into a corner. One line of title and one of detail, optional action,
 * always dismissable. Never for errors that need a decision.
 *
 * Not for an error that needs a decision (`Dialog`); context that stays on the page (`Notice`); work that is still running
 * (`Progress`).
 *
 * Accessibility: Its title and text are said through the page's live region when it appears, and read in place with the icon
 * and picture hidden; Tab reaches any actions in it and the "Dismiss" button, which runs `onDismiss`; dismissed with focus
 * inside it, focus goes to the next toast, else back to where it came from. Sliding it away is for the pointer; the Dismiss
 * button does the same.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Toast({ title, text, icon, image, media, open, onDismiss, children, style, className }: ToastProps) {
  const tx = useWords(ownWords);
  const [own, setOwn] = useState(true), controlled = open !== undefined;
  const p = usePresence(controlled ? !!open : own, '--toast-leaving-out-animation');
  const dx = useRef(0), el = useRef<HTMLDivElement>(null), from = useRef<HTMLElement | null>(null);
  /* A swiped toast leaves the way it was thrown: the class survives the re-render its dismissal causes, until it shows again */
  const swiped = useRef(false);
  function dismiss() {
    /* Dismissed with focus inside, focus goes on to the next toast, else back where it came from, never to the page */
    const box = el.current;
    if (box && box.contains(document.activeElement)) {
      const all = Array.from(document.querySelectorAll<HTMLElement>('.sk-toast:not(.is-leaving)')).filter((t) => t !== box);
      const next = all.filter((t) => box.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)[0] || all[all.length - 1];
      const to = next?.querySelector('button') || (from.current && document.contains(from.current) ? from.current : null);
      to?.focus({ preventScroll: true });
    }
    if (controlled || !own) { if (onDismiss) onDismiss(); return; }
    setOwn(false);
    if (onDismiss) setTimeout(onDismiss, motionMs('--toast-leaving-out-animation'));
  }
  /* Said through the page's one live region when it appears: a status region that arrives with its text is often not read */
  const showing = controlled ? !!open : own;
  /* Slide it sideways: it follows the pointer and fades; let go past --toast-swipe-dismiss of its width and it leaves that way,
     short of that it returns */
  const swipe = useDrag({
    can: (e) => !(e.target as Element).closest('button,a'),
    move: (e, s) => {
      const d = e.clientX - s.x;
      dx.current = d;
      s.el.style.transition = 'none';
      s.el.style.transform = `translateX(${d}px)`;
      s.el.style.opacity = String(Math.max(0, 1 - Math.abs(d) / s.el.offsetWidth));
    },
    end: (_, s) => {
      const d = dx.current;
      dx.current = 0;
      const far = Math.abs(d) > s.el.offsetWidth * (parseFloat(getComputedStyle(s.el).getPropertyValue('--toast-swipe-dismiss')) || 0.35);
      s.el.style.transition = '';
      if (far) { swiped.current = true; s.el.classList.add('is-swiped'); s.el.style.transform = `translateX(${(d > 0 ? 1 : -1) * s.el.offsetWidth}px)`; s.el.style.opacity = '0'; dismiss(); }
      else { s.el.style.transform = ''; s.el.style.opacity = ''; }
    },
  });
  useEffect(() => { if (showing) { swiped.current = false; announce([title, text].filter(Boolean).join('. ')); } }, [showing]);
  if (!p.mounted) return null;
  return (
    <div ref={el} className={cx('sk-toast', p.leaving && 'is-leaving', swiped.current && !showing && 'is-swiped', className)} style={style}
      onFocus={(e: FocusEvent<HTMLDivElement>) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) from.current = e.relatedTarget as HTMLElement; }} {...swipe.handlers}>
      {image ? <img className="sk-toast__img" src={image} alt="" /> : <span className="sk-toast__icon" aria-hidden="true">{media || <Icon name={icon || 'check'} size="var(--toast-icon-size)" />}</span>}
      <span className="sk-toast__body"><b>{title}</b>{text && <span>{text}</span>}</span>
      {children}
      <IconButton variant="plain" icon="close" label={tx('dismiss')} onClick={dismiss} />
    </div>
  );
}
