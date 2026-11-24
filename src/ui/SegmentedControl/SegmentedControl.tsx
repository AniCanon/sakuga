import { useRef } from 'react';
import { cx } from '../../internal/cx';
import { useDrag } from '../../internal/drag';
import { Glide, placeGlide, useGlide } from '../../internal/glide';
import '../../base.css';
import './SegmentedControl.css';

export interface SegmentedControlProps {
  /** The two to four views; each value is its label without one. */
  options: { label: string; value?: string }[];
  /** The one chosen. */
  value: string;
  /** Called with the value chosen. */
  onChange?: (value: string) => void;
  /** Names the control. */
  label: string;
  /** fill, on the page. (glass stays native on phones: docs/PORTING.md · Not ported) */
  /** media: over a picture or video, the same surface as IconButton media (the design's pages may still pass its old name, glass, which draws the same). */
  variant?: 'fill' | 'media';
  /** Takes its column's width. */
  fullWidth?: boolean;
  /** Extra class on the root element. */
  className?: string;
}

const PRESSED = 'button[aria-pressed="true"]';

/**
 * SegmentedControl switches between two to four views of the same thing: series sections, Following / For you, reading
 * direction.
 *
 * Not for five options or more (`Select`); one setting that is on or off (`Switch`); narrowing a feed by kind (`Chip`); going
 * to another part of the product (`TabBar`).
 *
 * Accessibility: Tab focuses each option; Enter or Space picks it. A screen reader hears the group's `label`, then each option
 * as a button, "pressed" when selected. Dragging the pill is for the pointer; Enter or Space on an option does the same.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SegmentedControl({ options, value, onChange, label, variant, fullWidth, className }: SegmentedControlProps) {
  const ref = useRef<HTMLDivElement>(null), opts = options || [];
  const slide = useRef<{ g: HTMLElement | null; at: number }>({ g: null, at: 0 });
  useGlide(ref, PRESSED, false, [value, options, fullWidth, className]);
  const key = (o: { label: string; value?: string }) => (o.value !== undefined ? o.value : o.label);
  const buttons = () => ref.current!.querySelectorAll<HTMLButtonElement>(':scope > button');
  /* Slide from the selected pill: it moves to the segment under the pointer (gliding there on motion-base, so its label always
     reads inside it), and letting go chooses that segment */
  const drag = useDrag({
    can: (e) => !!onChange && !!(e.target as Element).closest(PRESSED),
    start: (s) => {
      slide.current = { g: ref.current!.querySelector<HTMLElement>(':scope > .sk-glide'), at: Array.prototype.indexOf.call(buttons(), (s.target as Element).closest('button')) };
    },
    move: (e) => {
      const bs = buttons(), x = e.clientX - ref.current!.getBoundingClientRect().left, sl = slide.current;
      let best = 0;
      for (let i = 0; i < bs.length; i++) if (Math.abs(bs[i].offsetLeft + bs[i].offsetWidth / 2 - x) < Math.abs(bs[best].offsetLeft + bs[best].offsetWidth / 2 - x)) best = i;
      if (best === sl.at) return;
      sl.at = best;
      const b = bs[best];
      sl.g!.style.width = b.offsetWidth + 'px';
      sl.g!.style.transform = `translate(${b.offsetLeft}px,${b.offsetTop}px)`;
      bs.forEach((o, j) => o.classList.toggle('is-under', j === best));
    },
    end: () => {
      buttons().forEach((o) => o.classList.remove('is-under'));
      const v = key(opts[slide.current.at]);
      if (v !== value) onChange!(v); else placeGlide(ref.current, PRESSED, false, false);
    },
  });
  return (
    <div ref={ref} role="group" aria-label={label} className={cx('sk-seg', (variant === 'media' || (variant as string) === 'glass') && 'sk-seg--glass', fullWidth && 'sk-seg--full', drag.dragging && 'is-dragging', className)} {...drag.handlers}>
      <Glide />
      {opts.map((o) => {
        const v = key(o);
        return <button key={v} type="button" aria-pressed={v === value ? 'true' : 'false'} onClick={() => onChange && onChange(v)}>{o.label}</button>;
      })}
    </div>
  );
}
