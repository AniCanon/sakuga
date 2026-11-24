# FragmentBalance

The Fragments balance in its places: a pill in top bars, a block in the sidebar, a held line while a generation is running, `inline`: the mark and an amount inside a sentence ("~520 is held when you start"), and `card`: the balance as a wallet card.

## When to use

Use it for the Fragments balance in its places: a pill in a top bar, a block in the sidebar, a hold while a generation runs, an amount inside a sentence ("~520 is held when you start"), and the wallet card that leads the Fragments page on desktop and phone.

- Not for the bare mark or a medallion with no amount: use `FragmentSoul`.
- Not for the price on the action that spends it: use `SpendButton`.
- Not for the price on a choice card: use `SpendTiles`.

## How it works

- Built only from core components and tokens; it lives in AniCanonKit, not the core.

**held** keeps its amount ("60 held") on one line; a long caption wraps beside it.

**card** is the vault at wallet size, in a bank card's proportions (1.586:1, the ISO ID-1 card, with its small corner), for the Fragments screen on phone and desktop. It is also the balance at stake on the app-consent page. The balance is its headline, `title` (the plan) sits in the corner, `held` and `text` run along the foot, and `image` rests in the far corner behind nothing but the card. It keeps its dark vault in both themes, like a card in a wallet. Use it once per screen, at the top. Say the promise on it: "available · Fragments never expire" goes in `caption`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `'pill' \| 'block' \| 'held' \| 'inline' \| 'card'` |  | Where it sits: `pill` in a top bar, `block` in the sidebar, `held` while a generation runs, `inline` inside a sentence, `card` as the wallet card. |
| `amount` | `string` | required | The balance, or the amount held, as text ("1,240"). |
| `caption` | `string` |  | A line beside or under the amount; on the card, the promise ("available · Fragments never expire"). |
| `title` | `string` |  | card: the plan's name, in its corner. |
| `text` | `string` |  | held: what it is held for; card: a line along the foot. |
| `held` | `string` |  | card: what jobs in progress hold, read along the foot with the mark ("520" is read "520 held"). |
| `image` | `string` |  | card: the plan's own art, resting in the far corner. |
| `href` | `string` |  | block: where it leads; without it, a button that runs onClick. |
| `onClick` | `MouseEventHandler` |  | block: runs when pressed and it has no `href`. |

## Example

```tsx
import { FragmentBalance } from '@anicanon/sakuga/anicanonkit';

export function FragmentBalanceExample() {
  return (
    <FragmentBalance amount="9,427" />
  );
}
```

## Accessibility

The `variant` decides: block is a link named "Fragments balance: 1,240" (a button running `onClick` without `href`), card a group of that name, and pill, card and inline read their amount as "1,240 fragments"; held is said once through the page's live region when it appears ("120 held"), then reads as its text. The mark is hidden in every variant.

Used on: Web, iOS, Android
Version: 1.1
