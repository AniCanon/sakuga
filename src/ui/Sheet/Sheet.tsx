import { useRef, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useFocusScope } from '../../internal/focus';
import { Glide, useGlide } from '../../internal/glide';
import { usePresence } from '../../internal/presence';
import { useWords } from '../../internal/words';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import '../../base.css';
import './Sheet.css';

export interface SheetProps {
  /** Whether it shows; it slides up on open and back down on close. */
  open: boolean;
  /** What the choices are ("Audio and subtitles"); names the sheet. */
  title: string;
  /** Runs on Done, a tap on the scrim and Escape. */
  onClose?: () => void;
  /** Over video or manga pages: stays dark in either theme. */
  media?: boolean;
  /** null drops Done, when an option or a button below is the action. */
  doneLabel?: string | null;
  /** Its Sheet.Groups, which scroll between the handle and Done. */
  children: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

export interface SheetGroupProps {
  /** The group's short heading. */
  title: string;
  /** Its Sheet.Options. */
  children: ReactNode;
}

/** Holds a lead (CastAvatar, Thumb) and one or two lines; grows past 48 px when it needs to. */
export interface SheetOptionProps {
  /** The chosen option: checked, and read as pressed. */
  selected?: boolean;
  /** Chooses it. */
  onSelect?: MouseEventHandler;
  /** Its words; a lead (a CastAvatar, a Thumb) and two lines of Text may go first. */
  children: ReactNode;
}

const CHOSEN = '.sk-sheet-row[aria-pressed="true"]';

/* The bottom panel on phones. It sits on the screen, not the page, so it rises from the screen's foot however far the page is
   scrolled; the scrim or Done closes it. Focus starts on the chosen option, else the first control. */
/**
 * Sheet is the bottom panel on phones for choices that belong to the current screen: audio and subtitles, reading direction.
 *
 * Not for the same choices on desktop (`Popover`); a task on desktop (`Dialog`); the app's main destinations (`TabBar`).
 *
 * Accessibility: A modal dialog named by `title`: focus moves to the chosen option, a selected Sheet.Option or else a selected
 * Chip (else the first control), Tab and Shift+Tab stay inside it, Escape, Done or a tap on the scrim run `onClose`, and focus
 * goes back to what opened it. Sheet.Group is a group named by its `title`, and each Sheet.Option is a toggle button, "pressed"
 * when selected, with its check hidden.
 *
 * @version 1.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Sheet({ open, title, onClose, media, doneLabel, children, className }: SheetProps) {
  const tx = useWords();
  const p = usePresence(!!open, '--sheet-leaving-out-animation');
  const box = useRef<HTMLDivElement>(null);
  const keys = useFocusScope(box, { open: !!open, onClose, trap: true, first: (b) => b.querySelector<HTMLElement>(CHOSEN) || b.querySelector<HTMLElement>('[aria-pressed="true"],[aria-checked="true"]') });
  if (!p.mounted) return null;
  return (
    <>
      <div className={cx('sk-sheet-scrim', p.leaving && 'is-leaving')} aria-hidden="true" onClick={onClose} />
      <div ref={box} role="dialog" aria-modal="true" aria-label={title} onKeyDown={keys} className={cx('sk-sheet', media && 'sk-sheet--media', p.leaving && 'is-leaving', className)}>
        <div className="sk-sheet__handle" aria-hidden="true" />
        <div className="sk-sheet__body">{children}</div>
        {doneLabel !== null && (
          <div className="sk-sheet__done">
            <Button variant={media ? 'media' : 'primary'} shape="pill" size="lg" fullWidth onClick={onClose}>
              {doneLabel || tx('done')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

/* The selected option's fill slides within its group */
function SheetGroup({ title, children }: SheetGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGlide(ref, CHOSEN, false, [children]);
  return (
    <div ref={ref} role="group" className="sk-sheet-group" aria-label={title}>
      <Glide />
      <p className="sk-sheet__title">{title}</p>
      {children}
    </div>
  );
}

function SheetOption({ selected, onSelect, children }: SheetOptionProps) {
  return (
    <button type="button" className="sk-sheet-row" aria-pressed={selected ? 'true' : 'false'} onClick={onSelect}>
      {children}
      {selected && (
        <span className="sk-sheet-row__check">
          <Icon name="check" size="var(--sheet-row-check-icon-size)" />
        </span>
      )}
    </button>
  );
}

Sheet.Group = SheetGroup;
Sheet.Option = SheetOption;
