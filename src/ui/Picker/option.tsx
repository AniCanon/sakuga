import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Icon, type IconName } from '../Icon/Icon';
import { Thumb } from '../Thumb/Thumb';
import { type Words } from '../../internal/words';
import '../../base.css';
import '../Popover/Popover.css';
import './Picker.css';

/** One row of a Picker: its label, an optional hint, and one picture. */
export interface PickerOption {
  /** The option's name. */
  label: string;
  /** A quiet line under the name. */
  hint?: string;
  /** Its picture: a place's art, or a portrait with `shape: 'round'`. */
  image?: string;
  /** `round` for a portrait. */
  shape?: 'round';
  /** Shown in the picture's place when there is none. */
  initial?: string;
  /** A picture's place kept when there is none yet (a series with no cover): Thumb's placeholder at the image's size, with these words, e.g. the initial. */
  placeholder?: string;
  /** A picture the product draws in the option's slot (AniCanon passes an AniCanonKit EventGlyph). */
  media?: ReactNode;
  /** A person with no portrait: their figure (age-adult, …) in the round slot a portrait takes. */
  figure?: IconName;
  /** An icon in the picture's place. */
  icon?: IconName;
  /** The current choice, checked. */
  selected?: boolean;
  /** Exists but is out of reach: dimmed, said so, and it can't be chosen. */
  dim?: boolean;
  /** Holds a level of its own (a place's views): a chevron, and Right opens it as Enter does. */
  opens?: boolean;
}

/** What a list of picker rows shares: its id, the active row (with search), and what a choice does. */
export interface PickerRows<O> {
  id: string;
  active: number;
  search: boolean;
  choose: (o: O) => void;
}

export function pickerOption<O extends PickerOption>(o: O, n: number, pick: PickerRows<O>, tx: Words) {
  const vis = o.image ? <img className={o.shape === 'round' ? 'is-round' : ''} src={o.image} alt="" />
    : o.placeholder !== undefined ? <Thumb placeholder={o.placeholder} width="var(--picker-opt-img-width)" height="var(--picker-opt-img-height)" />
    : o.initial ? <span className="sk-picker__initial" aria-hidden="true">{o.initial}</span>
    : o.media ? <span className="sk-picker__slot">{o.media}</span>
    : o.figure ? <span className="sk-picker__face" aria-hidden="true"><Icon name={o.figure} size="var(--picker-face-icon-size)" /></span>
    : o.icon ? <span className="sk-picker__slot"><Icon name={o.icon} size="var(--picker-slot-icon-size)" /></span> : null;
  return (
    <div key={n} id={pick.id + '-o' + n} data-n={n} role="option" aria-selected={o.selected ? 'true' : 'false'} aria-disabled={o.dim ? 'true' : undefined} className={cx('sk-picker__opt', o.selected && 'is-selected', o.dim && 'is-dim', o.opens && 'is-opens', n === pick.active && 'is-active')}
      onClick={() => pick.choose(o)} onMouseDown={pick.search ? (e) => e.preventDefault() : undefined}>
      {vis}
      <span className="sk-picker__label">{o.label}{o.hint && <small>{o.hint}</small>}{o.dim && <span className="sk-sr">{', ' + tx('outOfReach')}</span>}</span>
      {o.selected && <Icon name="check" size="var(--picker-check-icon-size)" />}
      {o.opens && !o.selected && <Icon name="chevron-right" size="var(--picker-opens-icon-size)" className="sk-picker__opens" />}
    </div>
  );
}
