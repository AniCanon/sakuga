import { Button, buttonIconSize, type ButtonProps } from '@anicanon/sakuga/ui';
import { fragmentPrice } from '../fragmentPrice';
import { useWords } from '../../internal/words';

export interface SpendButtonProps extends Omit<ButtonProps, 'trailing'> {
  /** What the action is expected to cost in fragments, e.g. "~100" or "~10 a second": shown after the label with the fragment mark. */
  cost?: string;
}

/**
 * An action that spends fragments: Sakuga's `Button` with AniCanon's price after the label: the fragment mark and the amount, in
 * regular weight and the muted ink, part of the one action with no rule between them. It takes every `Button` prop except `trailing`, plus `cost`. The core `Button` knows nothing of fragments; its
 * `trailing` slot is neutral, and this is the part that fills it.
 *
 * Not for an action that costs nothing (`Button`); a fragment amount inside a sentence (`FragmentBalance variant="inline"`); a
 * price on a choice card (`SpendTiles`).
 *
 * Accessibility: Button's own: a native button (a link with `href`), so Tab reaches it, Enter activates it, and Space does too
 * on a button. A screen reader hears its label, then the price as "~100 fragments"; the mark and icons are hidden. With `href`
 * and `disabled` it is a disabled button, out of the tab order, so a price can't be spent through a disabled link. While `busy`
 * it stays focusable and a second press can't spend twice; a screen reader hears `busyLabel` once.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SpendButton({ cost, ...rest }: SpendButtonProps) {
  const tx = useWords();
  return <Button {...rest} trailing={fragmentPrice(cost, buttonIconSize(rest.size), tx)} />;
}
