import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useRoving } from '../../internal/roving';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './LayerStrip.css';

export interface LayerStripTrack {
  /** The layer: panels, lettering or sound effects. */
  kind: 'panels' | 'lettering' | 'sfx';
  /** The track's name. */
  label: string;
  /** Its icon. */
  icon?: IconName;
  /** Its items in reading order: each a number (3.2) and, for words, its first words; a panel's picture once drawn. */
  items: {
    number: string;
    label?: string;
    image?: string;
    selected?: boolean;
    /** Drawn into the art rather than set as text. */
    muted?: boolean;
  }[];
}

/** Manga editor: a page's layers by kind, in reading order. Choosing one selects it on the page; the inspector edits that kind. Children sit on top (the issue strip). */
export interface LayerStripProps {
  /** One track per kind of layer. */
  tracks: LayerStripTrack[];
  /** Shown on a track with nothing on it (default "None yet"). */
  emptyLabel?: string;
  /** Drawn under the tracks: the issue's IssueStrip at size 18. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
  /** Makes each track a listbox, one Tab stop that Left and Right move through; Enter, Space or a click choose a layer. */
  onSelect?: (track: number, item: number) => void;
}

/* Manga: a page's layers by kind, in reading order (panels, lettering, sound effects). Choosing one selects it on the page and the inspector edits that kind. */
const LAYER_ICONS: Record<string, IconName> = { panels: 'image', lettering: 'comment', sfx: 'bolt' };

/* One kind's layers. With onSelect they are a listbox, one Tab stop that Left and Right move through; Enter, Space or a click
   choose a layer. A muted layer is one drawn into the art rather than set as text. */
function LayerTrack({ track: t, index: ti, onSelect: pick, emptyLabel }: { track: LayerStripTrack; index: number; onSelect?: LayerStripProps['onSelect']; emptyLabel?: string }) {
  const tx = useWords(ownWords);
  const items = t.items || [], box = useRef<HTMLDivElement>(null);
  const rove = useRoving(box, { selector: pick ? '[role="option"]' : '.sk-layers__none', axis: 'x' });
  function keys(e: KeyboardEvent) {
    const el = e.target as HTMLElement;
    if ((e.key === 'Enter' || e.key === ' ') && el.getAttribute('role') === 'option') { e.preventDefault(); pick!(ti, +el.getAttribute('data-n')!); return; }
    rove(e);
  }
  return (
    <div className="sk-layers__track">
      <b className="sk-layers__head"><Icon name={t.icon || LAYER_ICONS[t.kind] || 'image'} size="var(--layers-head-icon-size)" />{t.label}<small>{items.length}</small></b>
      {items.length ? (
        <div ref={box} className="sk-layers__items" role={pick ? 'listbox' : 'list'} aria-orientation={pick ? 'horizontal' : undefined} aria-label={t.label} onKeyDown={pick ? keys : undefined}>
          {items.map((it, j) => (
            <span
              key={j} data-n={j} role={pick ? 'option' : 'listitem'} aria-selected={pick ? (it.selected ? 'true' : 'false') : undefined} aria-current={!pick && it.selected ? 'true' : undefined}
              onClick={pick ? () => pick(ti, j) : undefined} className={cx('sk-layers__item', it.selected && 'is-selected', it.muted && 'is-muted')}
            >
              {t.kind === 'panels' && (it.image ? <img src={it.image} alt="" /> : <span className="sk-layers__empty" aria-hidden="true" />)}
              {it.number}{it.label && <i>{it.label}</i>}{it.muted && <span className="sk-sr">{', ' + tx('drawnIntoArt')}</span>}
            </span>
          ))}
        </div>
      ) : <div className="sk-layers__items"><span className="sk-layers__none">{emptyLabel || tx('noneYet')}</span></div>}
    </div>
  );
}

/**
 * LayerStrip lists a page's layers by kind, in reading order, under the editor's canvas: panels, lettering, sound effects.
 *
 * Not for a cut's tracks in time (`Timeline`); the issue's spreads on their own (`IssueStrip`); who or what a panel holds
 * (`MentionChip`).
 *
 * Accessibility: Each track reads its name and count, then its layers: with `onSelect`, a listbox named by the track and one
 * Tab stop, where Left and Right move between layers, Enter, Space or a click choose one, and the chosen one reads "selected";
 * without it, a list whose selected item reads "current". Each layer reads its number and label, with "drawn into the art" when
 * `muted`, pictures are hidden, and an empty track reads "None yet".
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function LayerStrip({ tracks, emptyLabel, children, className, onSelect }: LayerStripProps) {
  return (
    <div className={cx('sk-layers', className)}>
      {children && <div className="sk-layers__top">{children}</div>}
      {(tracks || []).map((t, i) => <LayerTrack key={i} track={t} index={i} onSelect={onSelect} emptyLabel={emptyLabel} />)}
    </div>
  );
}
