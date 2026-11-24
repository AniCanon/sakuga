import { useRef, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { focusables, useFocusScope } from '../../internal/focus';
import { usePresence } from '../../internal/presence';
import { slots } from '../../internal/slots';
import { useUid } from '../../internal/uid';
import { IconButton } from '../IconButton/IconButton';
import { useWords } from '../../internal/words';
import '../../base.css';
import './Dialog.css';

export interface DialogProps {
  /** Whether it shows. */
  open: boolean;
  /** The task, as its heading; names the dialog. */
  title: string;
  /** What happens and what it costs, if anything; describes the dialog. */
  description?: string;
  /** Or children in slot="footer". */
  footer?: ReactNode;
  /** Its width from 768 px up, in px or CSS; below that it takes the screen's width. */
  width?: number | string;
  /** Runs on Escape, Close and a click on the scrim. */
  onClose?: () => void;
  /** The body, stacked in one column; the footer's buttons as slot="footer". */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Dialog is a window over the page on the web: pickers (references, opening frame, video plan), confirmations (story conflicts)
 * and last checks (clip options).
 *
 * Not for the same task in the iOS or Android app (`Sheet`); a menu or a hover card anchored to what opened it (`Popover`);
 * choosing from a searchable list under a field (`Picker`); a confirmation that needs no answer (`Toast`).
 *
 * Accessibility: A modal dialog named by `title` and described by `description`: focus moves to the field a form leads with,
 * else the chosen option in its body (a pressed or checked control), else its first control (else its footer, else "Close"),
 * Tab and Shift+Tab stay inside it, a press on its words keeps focus inside, and Escape, "Close" or a click on the scrim run
 * `onClose`. When it closes, focus goes back to what opened it.
 *
 * @version 1.7
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Dialog({ open, title, description, footer, width, onClose, children, className }: DialogProps) {
  const tx = useWords();
  const p = usePresence(!!open, '--dialog-scrim-leaving-out-animation'), sl = slots(children), foot = footer || sl.get('footer');
  const box = useRef<HTMLDivElement>(null), desc = useUid('sk-dialog') + '-desc';
  /* Focus starts in the field a form leads with, so typing starts there; anything else opens on the dialog itself, which draws
     no ring, and the first Tab reaches its first control */
  const keys = useFocusScope(box, { open: !!open, onClose, trap: true,
    first: (b) => {
      const lead = focusables(b.querySelector<HTMLElement>('.sk-dialog__body'))[0];
      return lead && lead.matches('textarea,select,input:not([type="checkbox"]):not([type="radio"]):not([type="range"])') ? lead : b;
    } });
  if (!p.mounted) return null;
  return (
    <div className={cx('sk-dialog-scrim', p.leaving && 'is-leaving')} onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div ref={box} role="dialog" aria-modal="true" aria-label={title} aria-describedby={description ? desc : undefined} onKeyDown={keys} className={cx('sk-dialog', className)} style={width ? ({ '--dialog-width': typeof width === 'number' ? width + 'px' : width } as CSSProperties) : undefined}>
        <div className="sk-dialog__head">
          <div style={{ flex: 1 }}>
            <h2 className="sk-dialog__title">{title}</h2>
            {description && <p className="sk-dialog__desc" id={desc}>{description}</p>}
          </div>
          <IconButton variant="plain" icon="close" label={tx('close')} onClick={onClose} />
        </div>
        <div className="sk-dialog__body" onScroll={e => e.currentTarget.parentElement!.classList.toggle('is-scrolled', e.currentTarget.scrollTop > 0)}>{sl.body}</div>
        {foot && <div className="sk-dialog__foot">{foot}</div>}
      </div>
    </div>
  );
}
