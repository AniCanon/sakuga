# SpendButton

An action that spends fragments: Sakuga's `Button` with AniCanon's price after the label, behind the hairline, with the fragment mark.

## When to use

Use it for an action that spends fragments: Generate, Draw it again, Make the clip, Plan scene 5.

- Not for an action that costs nothing: use `Button`.
- Not for a fragment amount inside a sentence: use `FragmentBalance variant="inline"`.
- Not for a price on a choice card: use `SpendTiles`.

## How it works

- It takes every `Button` prop except `trailing`, plus `cost`. The core `Button` knows nothing of fragments; its `trailing` slot is neutral, and this is the part that fills it.
- Keep the label a plain verb ("Generate", "Start", "Retake"); never write the price into the label.
- The mark is drawn at the button's icon size, so it grows with `size="lg"`.
- `busy` and `busyLabel` work as on `Button` (Draw the anchor → Drawing the anchor…). The price stays as it was while it works: it is what this press costs, and taking it away would read as the price changing.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `cost` | `string` |  | What the action is expected to cost in fragments, e.g. "~100" or "~10 a second": shown after the label with the fragment mark. |
| `children` | `ReactNode` |  | The label: what happens, in sentence case. |
| `className` | `string` |  | Extra class on the root element. |
| `busy` | `boolean` |  | Waiting on the server: the fill and the tab stop stay, a second press does nothing, and after --button-busy-delay the loader takes the icon's place. |
| `icon` | `IconName` |  | An icon before the label. |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'media' \| 'media-secondary' \| 'destructive'` |  | media and media-secondary sit over video or artwork and never change with the theme. destructive: the one action that confirms a deletion or takes access away, in the dialog that asks for it. |
| `size` | `'sm' \| 'md' \| 'lg'` |  | `lg` for hero actions, `md` by default, `sm` for desktop-only secondary actions. |
| `shape` | `'rounded' \| 'pill'` |  | pill on phones; rounded (radius-md) on desktop. |
| `iconEnd` | `IconName` |  | An icon after the label. |
| `fullWidth` | `boolean` |  | Takes its column's width. |
| `busyLabel` | `string` |  | What is happening while busy, the label's verb in -ing with its object: "Plan the shoot" → "Planning the shoot…". Shown and announced once. |
| `doneLabel` | `string` |  | Announced when busy ends, when the screen itself says nothing new: "Shoot planned". |
| `as` | `ElementType` |  | Renders as another element, such as a router's link. |

Any other attribute of its root element (`aria-*`, `data-*`, `id`, event handlers) is passed on to it.

## Example

```tsx
import { SpendButton } from '@anicanon/sakuga/anicanonkit';

export function SpendButtonExample() {
  return (
    <SpendButton size="lg" cost="~240">Generate episode</SpendButton>
  );
}
```

## Accessibility

Button's own: a native button (a link with `href`), so Tab reaches it, Enter activates it, and Space does too on a button. A screen reader hears its label, then the price as "~100 fragments"; the mark and icons are hidden. With `href` and `disabled` it is a disabled button, out of the tab order, so a price can't be spent through a disabled link. While `busy` it stays focusable and a second press can't spend twice; a screen reader hears `busyLabel` once.

Used on: Web, iOS, Android
Version: 1.1
