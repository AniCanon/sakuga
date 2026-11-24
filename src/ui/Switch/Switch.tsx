import { useRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useDrag } from '../../internal/drag';
import { useUid } from '../../internal/uid';
import '../../base.css';
import './Switch.css';

export interface SwitchProps {
  /** Whether the setting is on. */
  on?: boolean;
  /** The setting's name, read by screen readers. */
  label: string;
  /** Sets the label beside it; the whole row toggles. */
  showLabel?: boolean;
  /** With showLabel: a quiet line under the label. */
  hint?: string;
  /** Can't be changed, and leaves the tab order. */
  disabled?: boolean;
  /** Called with the new state; the setting takes effect at once. */
  onChange?: (on: boolean) => void;
  /** With showLabel: sits at the row's end, before the switch. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Switch turns one thing on or off, with its name as the `label` (the visible text sits beside it). `on` is the state;
 * `disabled` greys it.
 *
 * Not for a choice between named options (`SegmentedControl`); a value on a range (`SliderRow`); choosing things to act on
 * together, or agreeing to terms (`Checkbox`).
 *
 * Accessibility: A switch named by `label` that Tab reaches; Enter or Space flips it through `onChange`, it is announced "on"
 * or "off", and `disabled` takes it out of the tab order. With `showLabel` the whole row is its label, so a click on the text
 * flips it too, and the `hint` is its description. Sliding the knob is for the pointer; Enter or Space does the same. In forced
 * colours the track draws an edge and the knob a solid in the system colours (Highlight when on), and the switch keeps its
 * size.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Switch({ on, label, showLabel, hint: words, disabled, onChange, children, className }: SwitchProps) {
  const hint = useUid('sk-switch') + '-hint';
  const knob = useRef({ inset: 0, travel: 0, from: 0, at: 0 });
  /* The knob follows the pointer along its track; let go past the middle and the switch is on */
  const drag = useDrag({
    can: () => !!onChange && !disabled,
    start: (s) => {
      const k = getComputedStyle(s.el, '::after'), inset = parseFloat(k.left) || 0, travel = s.el.clientWidth - parseFloat(k.width) - 2 * inset;
      knob.current = { inset, travel, from: on ? travel : 0, at: on ? travel : 0 };
    },
    move: (e, s) => {
      const n = knob.current;
      n.at = Math.min(n.travel, Math.max(0, n.from + e.clientX - s.x));
      s.el.style.setProperty('--switch-drag-x', n.at + 'px');
    },
    end: (_, s) => {
      s.el.style.removeProperty('--switch-drag-x');
      const next = knob.current.at > knob.current.travel / 2;
      if (next !== !!on) onChange!(next);
    },
  });
  const sw = (
    <button
      type="button" role="switch" aria-checked={on ? 'true' : 'false'} aria-label={label} aria-describedby={showLabel && words ? hint : undefined} disabled={disabled}
      className={cx('sk-switch', on && 'is-on', drag.dragging && 'is-dragging', !showLabel && className)} onClick={onChange ? () => onChange(!on) : undefined}
      {...drag.handlers}
    />
  );
  return showLabel ? (
    <label className={cx('sk-switchrow', words && 'has-hint', className)}>
      <span className="sk-switchrow__text">{label}{words && <small id={hint}>{words}</small>}</span>
      {children && <span className="sk-switchrow__end">{children}</span>}
      {sw}
    </label>
  ) : sw;
}
