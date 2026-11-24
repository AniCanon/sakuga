import { useRef, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Glide, useGlide } from '../../internal/glide';
import { useRoving } from '../../internal/roving';
import { GoLink } from '../../internal/link';
import { useUid } from '../../internal/uid';
import { Badge } from '../Badge/Badge';
import type { ButtonTrailing } from '../Button/Button';
import { FieldHelp } from '../FieldHelp/FieldHelp';
import { Icon, type IconName } from '../Icon/Icon';
import '../../base.css';
import './OptionTiles.css';

export interface TileOption {
  /** What choosing it returns through `onChange`. */
  value: string;
  /** Its name, under its icon or on its card. */
  label: string;
  /** Large tiles: where it goes. With `href` or `onClick` on the options the tiles are ways in (links to pages), not a choice: no chosen state, and `value` on the tiles is not needed. */
  href?: string;
  /** With ways in: runs on a press, for a tile with no `href`. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** The AniCanon icon over its name. */
  icon?: IconName;
  /** Large tiles: a line on what it is or does. */
  description?: string;
  /** Large tiles: the thing's own art on a stage above its name (a Fragments pack or plan). */
  image?: string;
  /** Where the picture's subject sits, as CSS object-position ("30% 0%"), so the crop keeps it; the centre when left out. The same as Thumb's imagePosition. */
  imagePosition?: string;
  /** Large tiles: what it gives, set as the headline, e.g. "24,990"; as a ButtonTrailing it takes a mark before it and words read after it. Fragments: AniCanonKit's SpendTiles. */
  amount?: string | ButtonTrailing;
  /** Large tiles: what choosing it charges, under the description, e.g. "~10 a second"; the same shape as amount. */
  cost?: string | ButtonTrailing;
  /** Shown dimmed and cannot be chosen (a plan not open yet). */
  disabled?: boolean;
  /** Large tiles: a short label in the card's corner ("Most chosen"). */
  badge?: string;
  /** Large tiles: a quiet line at the card's foot. */
  footnote?: string;
}

/** The Studio's icon tile picker: one or many options, each with an AniCanon icon. */
export interface OptionTilesProps {
  /** The choice's label, over the tiles; it names the group. */
  label?: string;
  /** The label's id, which names the tiles. */
  id?: string;
  /** The tiles, in order. */
  options: TileOption[];
  /** Not needed when the tiles are ways in (options with href). */
  value?: string | string[];
  /** Several can be chosen; `value` is then a list. */
  multiple?: boolean;
  /** lg: choice cards with description, footnote and badge. */
  size?: 'lg';
  /** Tiles to a row. */
  columns?: number;
  /** Large tiles with `image`: "fill" lays each option's picture across the top of its tile, edge to edge, cropped to 3:2 (a scene, such as who lives in a series); left out, the image is art on a stage (a Fragments pack). */
  art?: 'stage' | 'fill';
  /** Each tile's icon size in px. */
  iconSize?: number;
  /** The chosen option's one-line description, under the tiles, so the creator learns what it does. */
  note?: string;
  /** An ⓘ beside the label that explains the choice (a FieldHelp). */
  help?: { title: string; text: ReactNode };
  /** Shows the help's tip open (a board). */
  helpOpen?: boolean;
  /** Names the group when there is no label. */
  ariaLabel?: string;
  /** Called with the value chosen (or unchosen, with `multiple`). */
  onChange?: (value: string) => void;
  /** Extra class on the root element. */
  className?: string;
}

function price(v: string | ButtonTrailing, className: string) {
  const t = typeof v === 'string' ? { value: v } as ButtonTrailing : v;
  return <span className={className}>{t.mark}{t.value}{t.label && <span className="sk-sr">{' ' + t.label}</span>}</span>;
}

/**
 * OptionTiles is the Studio's picker: a grid of tiles, each an AniCanon icon over a short name, for shot type, angle, depth,
 * movement, mood, lighting, weather, effects and frame format.
 *
 * Not for a short list of plain words (`Select`); two to four views of the same thing (`SegmentedControl`); one setting on or
 * off (`Switch`); one thing among many, with pictures and search (`Picker`).
 *
 * Accessibility: Ways in (options with `href`) are a group named by `label`, each tile a link (a button with `onClick` alone)
 * read as its name and description. With one choice the tiles are a radio group: one Tab stop, on the chosen tile (the first
 * when none is), so a Dialog opens on the chosen tile; the arrows move to a tile and choose it, Home and End go to the first
 * and last, and an option's `disabled` is skipped. With `multiple` each tile is a toggle button: Tab focuses each one, and
 * Enter or Space picks it. A screen reader hears the group, named by the words of `label` (or `ariaLabel`), then each tile with
 * its name, as a radio ("checked" when chosen) or with `multiple` a toggle button ("pressed"), large tiles adding the badge,
 * the amount or cost with its label ("24,990 fragments"), the description and the footnote, with icons and art hidden.
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function OptionTiles(props: OptionTilesProps) {
  const multi = !!props.multiple;
  const values = multi ? ((props.value as string[]) || []) : [props.value as string];
  const isOn = (v: string) => values.indexOf(v) >= 0;
  const note = props.note !== undefined ? props.note : null;
  const lg = props.size === 'lg';
  const grid = useRef<HTMLDivElement>(null), nameId = useUid('sk-tiles') + '-name';
  /* One choice is a radio group: one Tab stop on the chosen tile, the arrows moving to a tile and choosing it */
  const rove = useRoving(grid, { selector: '.sk-tile[role=radio]', select: true });
  const state = (o: TileOption) => (multi ? { 'aria-pressed': isOn(o.value) ? 'true' as const : 'false' as const } : { role: 'radio', 'aria-checked': isOn(o.value) ? 'true' as const : 'false' as const });
  useGlide(grid, '.sk-tile[aria-checked="true"]', false, [props.value, props.options, multi, lg, props.columns, props.iconSize]);
  /* Large tiles that go somewhere are links to pages, not a choice: a group with no chosen state */
  const ways = lg && (props.options || []).some((o) => o.href || o.onClick);
  /* The group is named by the label's words alone, so the help button beside them stays out of its name */
  return (
    <div className={cx('sk-field', props.className)}>
      {props.label && (
        <div className="sk-field__label" id={props.id}>
          <span id={nameId}>{props.label}</span>
          {props.help && <FieldHelp label={props.label} title={props.help.title} open={props.helpOpen}>{props.help.text}</FieldHelp>}
        </div>
      )}
      <div ref={grid} className={cx('sk-tiles', lg && 'sk-tiles--lg', lg && props.columns === 1 && 'sk-tiles--rows', lg && props.art === 'fill' && 'sk-tiles--fill')} role={multi || ways ? 'group' : 'radiogroup'} onKeyDown={multi || ways ? undefined : rove}
        aria-labelledby={props.label ? nameId : undefined} aria-label={props.label ? undefined : props.ariaLabel} style={{ gridTemplateColumns: 'repeat(' + (props.columns || (lg ? 3 : 4)) + ', minmax(0, 1fr))' }}>
        {multi ? null : <Glide />}
        {(props.options || []).map((o) => {
          const click = () => { if (props.onChange) props.onChange(o.value); };
          if (lg) {
            const card = (
              <>
                {o.image && <span className="sk-tile__art" aria-hidden="true"><img src={o.image} alt="" style={o.imagePosition ? { objectPosition: o.imagePosition } : undefined} /></span>}
                {(o.icon || o.badge || !o.image) && <span className="sk-tile__top">{o.icon && <Icon name={o.icon} size="var(--option-tile-top-icon-size)" />}{o.badge && <Badge>{o.badge}</Badge>}</span>}
                <span className="sk-tile__title">{o.label}</span>
                {o.amount && price(o.amount, 'sk-tile__amount')}
                {o.description && <span className="sk-tile__text">{o.description}</span>}
                {o.cost && price(o.cost, 'sk-tile__cost')}
                {o.footnote && <span className="sk-tile__foot">{o.footnote}</span>}
              </>
            );
            if (ways) return <GoLink key={o.value || o.label} href={o.href} onClick={o.onClick} className={cx('sk-tile sk-tile--lg', o.image && 'has-image')}>{card}</GoLink>;
            return <button key={o.value} type="button" className={cx('sk-tile sk-tile--lg', o.image && 'has-image')} disabled={o.disabled} onClick={click} {...state(o)}>{card}</button>;
          }
          return (
            <button key={o.value} type="button" className="sk-tile" disabled={o.disabled} onClick={click} {...state(o)}>
              {o.icon && <Icon name={o.icon} size={props.iconSize || 'var(--option-tile-icon-size)'} />}{o.label}
            </button>
          );
        })}
      </div>
      {note && <p className="sk-field__note">{note}</p>}
    </div>
  );
}
