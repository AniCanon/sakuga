# Shorthand

Shorthand is camera and timing notation as an ekonte writes it: shot size, angle, move and when it starts and stops (C.U · low · T.U 0+00 → 5+00).

## When to use

Use it for camera and timing notation as an ekonte writes it: shot size, angle, move and when it starts and stops (C.U · low · T.U 0+00 → 5+00).

- Not for choosing a shot, an angle or a move: use `OptionTiles`.
- Not for the direction set on a panel, a row per kind: use `PropertyList`.
- Not for Studio's folded section with its current value: use `PanelRow`.
- Not for a cut's number and approval: use `CutCell`.

## How it works

- Small caps, tabular figures. `tone="accent"` for a state that waits for you (To review), `tone="secondary"` for a settled one; the default is the notation colour.
- `spoken` is what a screen reader says in place of the notation ("close-up, low angle, track up from 0 to 5 seconds"); without it the notation is read as written.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `tone` | `'accent' \| 'secondary'` |  | `accent` for a state that waits for you (To review), `secondary` for a settled one; the notation colour by default. |
| `spoken` | `string` |  | What a screen reader says in place of the notation ("close-up, low angle"); without it the notation is read as written. |
| `children` | `ReactNode` | required | The notation ("CU · LA · TRK↑ 0–5s"). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Shorthand } from '@anicanon/sakuga/anicanonkit';

export function ShorthandExample() {
  return (
    <Shorthand spoken="close-up, low angle, track up from 0 to 5 seconds">C.U · low · T.U 0+00 → 5+00</Shorthand>
  );
}
```

## Accessibility

Not focusable; with `spoken` a screen reader says those words in place of the notation, which is hidden from it, and without `spoken` the notation is read as written ("C.U", "T.U").

Used on: Web
Version: 1.0
