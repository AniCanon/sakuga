# Checkbox

Checkbox is one thing chosen or not, among others that may be chosen too: the files to queue, the rows to delete, the terms you agree to.

## When to use

Use it for choosing any number of things at once, or for one agreement: rows for a bulk action, files to queue, "I agree to the terms".

- Not for a setting that takes effect the moment it changes: use `Switch`.
- Not for choosing among options drawn as tiles: use `OptionTiles` with `multiple`.
- Not for choosing one thing among many, with pictures and search: use `Picker`.

## How it works

- Its box has an edge when off and fills with the accent and a check when on.
- `checked` and `onChange`: a press calls `onChange` with the new value. `label` always names it; `showLabel` sets the words beside the box, with an optional `hint` under them, and a press on the words flips it too.
- `mixed` is for a box that chooses a set when only some of the set is chosen (select all, over a list where 3 of 12 are chosen). It fills with a dash. Pressing it chooses them all; pressing again chooses none.
- The box is 20 px (a 16 px mark with 2 px around it) with a 2 px edge in the control border, corner `radius-xs`. On, it fills with the accent and the mark is `on-accent`. The hit area reaches `size-target` (44) around it.
- Turning it on or off eases the fill on `motion-fast`; the mark settles in on `motion-settle` when it changes while you watch. A press sinks the box to `scale-press-sm` on `motion-instant`. Under reduced motion the mark just appears.
- With sound on, checking or unchecking plays the on or off sound; mixed to on counts as on (README · Sound).
- In a list, use ListRow's `checked` and `onCheck`: the row carries the box, named "Select" and the row's title.
- What the choices do waits for an action: a bar with the count ("3 selected") and the action ("Queue 3 files").

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `checked` | `boolean` |  | Whether it is chosen. |
| `mixed` | `boolean` |  | Over a set when only some of it is chosen: a dash, read "mixed". A press chooses all. |
| `label` | `string` | required | What it chooses, read by screen readers. |
| `showLabel` | `boolean` |  | Sets the label beside the box; a press on the words flips it too. |
| `hint` | `string` |  | With showLabel: a quiet line under the label, read as its description. |
| `disabled` | `boolean` |  | Can't be changed, and leaves the tab order. |
| `onChange` | `(checked: boolean) => void` |  | Called with the new value; from mixed, true. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { Checkbox } from '@anicanon/sakuga/ui';

export function QueueFile() {
  const [queued, setQueued] = useState(true);
  return <Checkbox label="Episode 2 · 4:10" checked={queued} onChange={setQueued} />;
}
```

## Accessibility

A checkbox named by `label` that Tab reaches; Enter or Space flips it through `onChange`, and it is announced "checked", "not checked" or "mixed". `disabled` takes it out of the tab order. With `showLabel` the row is its label, so a click on the words flips it too, and the `hint` is its description. The mark is hidden; the state is said. In forced colours the edge and the mark draw in the system colours.

Used on: Web, iOS, Android
Version: 1.0
