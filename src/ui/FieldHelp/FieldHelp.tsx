import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../internal/cx';
import { useUid } from '../../internal/uid';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { Icon } from '../Icon/Icon';
import { Popover } from '../Popover/Popover';
import { Thumb } from '../Thumb/Thumb';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../Popover/Popover.css';
import './FieldHelp.css';

/** One case in FieldHelp's examples: its picture (or, until there is one, a placeholder naming it), its name and a line. */
export interface FieldHelpExample {
  /** The case's name ("Close detail"). */
  name: string;
  /** One line on what it does. */
  text?: string;
  /** Its picture. */
  image?: string;
  /** The picture's alternative text. */
  alt?: string;
  /** Until there is a picture, the words naming the one it wants. */
  placeholder?: string;
}

/** The ⓘ helper beside a field name, with its tooltip, or with examples a press that opens each case with its picture. */
export interface FieldHelpProps {
  /** The field it explains; the button reads "About" and this. */
  label: string;
  /** The tip's bold first line: what the field controls. */
  title?: string;
  /** Shows the tip open (a board). */
  open?: boolean;
  /** The tip's examples, after the title; with `examples`, the lead under the title. */
  children: ReactNode;
  /** Opens on a press instead of the hover tip: the title, the children as its lead, a picture for each example, and doneLabel. */
  examples?: FieldHelpExample[];
  /** With examples: a Dialog instead of the panel under the ⓘ, for a phone browser. */
  dialog?: boolean;
  /** With examples: the panel lines up with the ⓘ's start or end edge (end by default). */
  align?: 'start' | 'end';
  /** With examples: the button that closes it; "Got it" by default. */
  doneLabel?: string;
  /** With examples: called when it closes. */
  onClose?: () => void;
}

/**
 * FieldHelp is the ⓘ beside a field name. It explains the field in one bold line plus examples, on hover or keyboard focus.
 * With `examples`, a press opens what the field does, with a picture for each case.
 *
 * Not for context everyone should see, kept on the page (`Notice`); a hover card on a mention or a small form (`Popover`); an
 * action shown as a glyph alone (`IconButton`).
 *
 * Accessibility: A button that Tab reaches, announced "About" plus `label` (or "About this field") and described by its tip.
 * Focus or hover shows the tip, and the tip can be hovered without closing. Escape hides it, whether focus or the pointer
 * opened it, until focus or the pointer leaves. The button is a 24px target, though it draws at 20px. With `examples` it is a
 * button with `aria-haspopup="dialog"` and `aria-expanded`; a press opens a dialog named by `title` that takes focus, and
 * Escape, a press outside or the done button closes it and returns focus to the ⓘ; with `dialog` it is a modal Dialog that
 * keeps focus inside.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function FieldHelp(props: FieldHelpProps) {
  if (props.examples && props.examples.length) return <FieldHelpExamples {...props} examples={props.examples} />;
  return <FieldHelpTip {...props} />;
}

function FieldHelpTip({ label, title, open, children }: FieldHelpProps) {
  const tx = useWords(ownWords);
  const tip = useUid('sk-help');
  const [off, setOff] = useState(false), [hover, setHover] = useState(false);
  /* Escape hides the tip until focus or the pointer leaves; a tip already hidden lets Escape through to what holds it */
  function key(e: KeyboardEvent) { if (e.key === 'Escape' && !off) { e.preventDefault(); e.stopPropagation(); setOff(true); } }
  /* A tip the pointer opened closes on Escape too, wherever focus is (WCAG 1.4.13) */
  useEffect(() => {
    if (!hover || off) return undefined;
    const esc = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setOff(true); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [hover, off]);
  return (
    <span className={cx('sk-help', open && 'sk-help--open', off && 'is-dismissed')} onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); if (off) setOff(false); }}>
      <button type="button" aria-label={label ? tx('aboutField', { label }) : tx('aboutThisField')} aria-describedby={tip} onKeyDown={key} onBlur={off ? () => setOff(false) : undefined}>
        <Icon name="info" size="var(--field-help-icon-size)" />
      </button>
      <span role="tooltip" id={tip} className="sk-help__tip">{title && <strong>{title}</strong>}{children}</span>
    </span>
  );
}

/* FieldHelp with examples: a press opens what the field does, a picture for each case and a done button. The panel, or the
   Dialog, goes in the page's root (.sk-root), so nothing it sits inside clips it; the panel is placed from the button there,
   scaled back when the root is zoomed. */
function FieldHelpExamples({ label, title: heading, open, children, examples, dialog, align, doneLabel, onClose }: FieldHelpProps & { examples: FieldHelpExample[] }) {
  const tx = useWords(ownWords);
  const btn = useRef<HTMLButtonElement>(null), box = useRef<HTMLDivElement>(null), id = useUid('sk-help-ex');
  const [pressed, setPressed] = useState(false), [host, setHost] = useState<HTMLElement | null>(null), [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const shown = !!open || pressed, title = heading || label, done = doneLabel || tx('gotIt');
  const close = () => { setPressed(false); onClose?.(); };
  const items = (
    <div className={cx('sk-help-ex__items', dialog && 'is-rows')}>
      {examples.map((e, n) => (
        <div key={n} className="sk-help-ex__item">
          <div className="sk-help-ex__pic"><Thumb image={e.image} alt={e.alt} placeholder={e.image ? undefined : (e.placeholder || e.name)} ratio="16 / 9" radius="md" /></div>
          <div className="sk-help-ex__words"><b className="sk-help-ex__name">{e.name}</b>{e.text && <p className="sk-help-ex__text">{e.text}</p>}</div>
        </div>
      ))}
    </div>
  );
  const lead = children ? <p className="sk-help-ex__lead">{children}</p> : null;
  useLayoutEffect(() => { if (shown && btn.current) setHost((btn.current.closest('.sk-root') as HTMLElement | null) || document.body); }, [shown]);
  useLayoutEffect(() => {
    const b = btn.current, p = box.current, root = host;
    if (!shown || dialog || !b || !p || !root) return;
    const place = () => {
      const R = root.getBoundingClientRect(), r = b.getBoundingClientRect();
      const sc = root.offsetWidth ? R.width / root.offsetWidth : 1, W = root.offsetWidth || window.innerWidth, w = p.offsetWidth, h = p.offsetHeight * sc, m = 8;
      let left = align === 'start' ? (r.left - R.left) / sc : (r.right - R.left) / sc - w;
      /* Under the ⓘ where it fits on screen; above it when there is more room there; else held inside the screen */
      const below = window.innerHeight - r.bottom - m, above = r.top - m;
      let y = below >= h || below >= above ? r.bottom + m : r.top - m - h;
      y = Math.max(m, Math.min(y, window.innerHeight - h - m));
      let top = (y - R.top) / sc;
      if (root === document.body) { left += window.scrollX; top += window.scrollY; }
      setPos({ left: Math.max(m, Math.min(left, W - w - m)), top });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [shown, host, dialog, align]);
  let panel: ReactNode = null;
  if (shown && dialog && host) {
    panel = createPortal(
      <Dialog open title={title} onClose={close} width="var(--field-help-dialog-width)"
        footer={<div className="sk-help-ex__done"><Button variant="primary" shape="pill" size="lg" fullWidth onClick={close}>{done}</Button></div>}>
        <div className="sk-help-ex__body">{lead}{items}</div>
      </Dialog>, host);
  } else if (shown && host) {
    const style: CSSProperties = pos ? { position: 'absolute', left: pos.left, top: pos.top } : { position: 'absolute', left: 0, top: 0, visibility: 'hidden' };
    panel = createPortal(
      <Popover id={id} label={title} anchored={false} onClose={close} className="sk-help-ex" style={style}>
        <div ref={box} className="sk-help-ex__panel" style={{ '--field-help-ex-count': examples.length } as CSSProperties}>
          <h2 className="sk-help-ex__title">{title}</h2>{lead}{items}
          <div className="sk-help-ex__foot"><Button variant="secondary" size="sm" onClick={close}>{done}</Button></div>
        </div>
      </Popover>, host);
  }
  return (
    <span className={cx('sk-help', 'sk-help--examples', shown && 'is-open')}>
      <button ref={btn} type="button" aria-label={label ? tx('aboutField', { label }) : tx('aboutThisField')} aria-haspopup="dialog" aria-expanded={shown ? 'true' : 'false'} aria-controls={shown && !dialog ? id : undefined} onClick={() => setPressed(!pressed)}>
        <Icon name="info" size="var(--field-help-icon-size)" />
      </button>
      {panel}
    </span>
  );
}
