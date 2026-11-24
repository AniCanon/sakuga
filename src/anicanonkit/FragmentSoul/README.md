# FragmentSoul

FragmentSoul is the Fragments currency mark: a hitodama spirit-flame in flat cel layers with a deep violet ink line.

## When to use

Use it for the mark every fragment amount carries: bare beside a balance figure, or seated in a medallion on its tinted disc.

- Not for the balance with its amount, in a top bar, the sidebar or a sentence: use `FragmentBalance`.
- Not for the price on the action that spends it: use `SpendButton`.
- Not for the price on a choice card: use `SpendTiles`.

## How it works

- Its colours are fixed artwork (spirit violet, magenta, pink, a hot core). Never recolour, outline or put it on a gradient.
- Bare, it sits beside a balance figure. In a medallion, seat it on a disc tinted with `fragments-rim`.
- The balance card is the soul-vault: `fragments-vault-bg`, a `fragments-rim` edge, a flat dot-screentone watermark, a faint large flame bleeding off one corner, and the pink `fragments-eyebrow`. No gradient washes.
- `dim` shows a held or dormant balance.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `size` | `number \| string` | `24` | Pixels, or a size token such as 'var(--button-icon-size)'. |
| `dim` | `boolean` |  | Shows a held or dormant balance. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { FragmentSoul } from '@anicanon/sakuga/anicanonkit';

export function FragmentSoulExample() {
  return (
    <FragmentSoul size={48} />
  );
}
```

## Accessibility

Decorative: the mark is hidden from screen readers.

Used on: Web, iOS, Android
Version: 1.0
