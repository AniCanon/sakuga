import { OptionTiles, type OptionTilesProps, type TileOption } from '@anicanon/sakuga/ui';
import { fragmentPrice } from '../fragmentPrice';
import { useWords } from '../../internal/words';

/** OptionTiles whose large cards carry fragments: an option's amount (what a pack or plan gives, the card's headline) and cost (what it charges), each with the fragment mark. */
export interface SpendTilesProps extends Omit<OptionTilesProps, 'options'> {
  /** As OptionTiles' options, with `amount` and `cost` in fragments. */
  options: (Omit<TileOption, 'amount' | 'cost'> & {
    /** The fragments it gives, e.g. "24,990": the card's headline. */
    amount?: string;
    /** What choosing it charges, e.g. "~10 a second". */
    cost?: string;
  })[];
}

/**
 * `OptionTiles` whose large cards carry fragments: an option's `amount` (what a pack or plan gives, the card's headline) and
 * `cost` (what choosing it charges, under its description), each with the fragment mark. It takes every `OptionTiles` prop,
 * with `amount` and `cost` as strings. The core `OptionTiles` knows nothing of fragments; its `amount` and `cost` are neutral,
 * and this is the part that fills them.
 *
 * Not for a choice that costs nothing (`OptionTiles`); the action that spends them (`SpendButton`).
 *
 * Accessibility: OptionTiles' own: with one choice the cards are a radio group, one Tab stop that the arrows move through. A
 * screen reader hears each card's name, the amount or cost as "24,990 fragments", the description and the footnote; the mark
 * and art are hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SpendTiles({ options, ...rest }: SpendTilesProps) {
  const tx = useWords();
  return (
    <OptionTiles
      {...rest}
      options={(options || []).map((o) => (o.amount || o.cost
        ? { ...o, amount: fragmentPrice(o.amount, 'var(--option-tile-amount-icon-size)', tx), cost: fragmentPrice(o.cost, 'var(--option-tile-cost-icon-size)', tx) }
        : o))}
    />
  );
}
