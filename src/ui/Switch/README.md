# Switch

Switch turns one thing on or off, with its name as the `label` (the visible text sits beside it).

## When to use

Use it for one setting that takes effect the moment it changes: Loop this track, Name who speaks.

- Not for a choice between named options: use `SegmentedControl`.
- Not for a value on a range: use `SliderRow`.
- Not for choosing things to act on together, or agreeing to terms: use `Checkbox`.

## How it works

- `on` is the state; `disabled` greys it.
- Use it for a setting that takes effect at once (Lower the music under voices, Name who speaks, Loop this track).
- A choice between named options is a `SegmentedControl`, not a switch.
- The thumb crosses the track on `motion-fast` and stretches while held.
- With sound on, turning it on or off plays the on or off sound, by press, key or slide (README · Sound).
- `showLabel` sets the label beside it, the whole row toggling: the settings row of a panel (Loops without a seam).
- `hint` is a quiet line under the label saying what the setting does; a child sits at the row's end, before the switch (the audio's language).
- With `onChange`, the knob can be slid along its track; let go past the middle and the switch is on. A press still flips it.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `on` | `boolean` |  | Whether the setting is on. |
| `label` | `string` | required | The setting's name, read by screen readers. |
| `showLabel` | `boolean` |  | Sets the label beside it; the whole row toggles. |
| `hint` | `string` |  | With showLabel: a quiet line under the label. |
| `disabled` | `boolean` |  | Can't be changed, and leaves the tab order. |
| `onChange` | `(on: boolean) => void` |  | Called with the new state; the setting takes effect at once. |
| `children` | `ReactNode` |  | With showLabel: sits at the row's end, before the switch. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { Switch } from '@anicanon/sakuga/ui';

export function TakesSound() {
  const [on, setOn] = useState(true);
  return <Switch label="Takes’ own sound" on={on} onChange={setOn} />;
}
```

## Accessibility

A switch named by `label` that Tab reaches; Enter or Space flips it through `onChange`, it is announced "on" or "off", and `disabled` takes it out of the tab order. With `showLabel` the whole row is its label, so a click on the text flips it too, and the `hint` is its description. Sliding the knob is for the pointer; Enter or Space does the same. In forced colours the track draws an edge and the knob a solid in the system colours (Highlight when on), and the switch keeps its size.

Used on: Web, iOS, Android
Version: 1.0
