import { useRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useRoving } from '../../internal/roving';
import '../../base.css';
import './SwatchPicker.css';

export interface SwatchOption {
  /** The colour's name ("Ash brown"). */
  label: string;
  /** What choosing it returns; the label without it. */
  value?: string;
  /** Its base colour, as CSS. */
  color: string;
  /** A coat's pattern over the base: stripes, patches or spots. */
  pattern?: 'stripes' | 'patches' | 'spots';
  /** The pattern's colours, as CSS. */
  marks?: string[];
}

/** Round swatches, the chosen one ringed; a pattern draws its marks over the base colour. */
export interface SwatchPickerProps {
  /** Names the choice; it labels the group. */
  label?: string;
  /** The value chosen. */
  value?: string;
  /** Each swatch's name under it. */
  labels?: boolean;
  /** Swatches to a row. */
  columns?: number;
  /** The swatches, in order. */
  options: SwatchOption[];
  /** Called with the value chosen. */
  onChange?: (value: string) => void;
  /** Extra class on the root element. */
  className?: string;
}

/* A colour chosen by eye: round swatches with the chosen one ringed. A patterned option draws its marks over its base colour. */
const SWATCH_MARKS: Record<NonNullable<SwatchOption['pattern']>, (m: string[]) => ReactNode> = {
  stripes: (m) => <path d="M-4 10 L44 4 M-4 20 L44 14 M-4 30 L44 24 M-4 40 L44 34" stroke={m[0]} strokeWidth={3.5} />,
  patches: (m) => [<path key="a" d="M0 0 H22 L16 16 L0 20 Z" fill={m[0]} />, <path key="b" d="M40 22 V40 H18 L26 26 Z" fill={m[1] || m[0]} />],
  spots: (m) => [[10, 11, 3.5], [26, 8, 3], [19, 22, 3.5], [31, 25, 3], [11, 31, 3]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r={c[2]} fill={m[0]} />),
};

/* A radio group: one Tab stop, the arrows moving to a swatch and choosing it */
/**
 * SwatchPicker chooses a colour by eye: round swatches, the chosen one ringed. Skin tone, a creature's coat.
 *
 * Not for a choice that reads best as an icon over a name (`OptionTiles`); a short list of plain words (`Select`); any colour,
 * typed or picked from the whole range (a brand colour) (`ColorPicker`); adjusting colour in the editor (`SliderRow`).
 *
 * Accessibility: A radio group named by `label` and one Tab stop: arrows move to a swatch and choose it, each a radio named by
 * its option's label and "checked" when chosen. The visible names and pattern drawings are hidden.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SwatchPicker({ label, value, labels, columns, options, onChange, className }: SwatchPickerProps) {
  const named = !!labels, box = useRef<HTMLDivElement>(null), keys = useRoving(box, { selector: '.sk-swatch', select: true });
  return (
    <div ref={box} onKeyDown={keys} className={cx('sk-swatches', named && 'is-named', className)} role="radiogroup" aria-label={label}
      style={columns ? { gridTemplateColumns: 'repeat(' + columns + ', minmax(var(--swatch-size), max-content))' } : undefined}>
      {(options || []).map((o) => {
        const v = o.value !== undefined ? o.value : o.label, on = v === value;
        const marks = o.pattern && SWATCH_MARKS[o.pattern];
        const sw = (
          <button key={v} type="button" role="radio" aria-checked={on ? 'true' : 'false'} aria-label={o.label} className="sk-swatch" style={{ background: o.color }}
            onClick={onChange ? () => onChange(v) : undefined}>
            {marks && <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true">{marks(([] as string[]).concat(o.marks || []))}</svg>}
          </button>
        );
        return named ? <span key={v} className="sk-swatches__item">{sw}<span aria-hidden="true">{o.label}</span></span> : sw;
      })}
    </div>
  );
}
