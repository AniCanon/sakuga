# SliderRow

SliderRow is a labelled value on a track: the name, the track (0–100) and the readout as the creator reads it (`+0.2`, `−3 dB`, `100%`).

## When to use

Use it for a value set by feel on a track, with its readout in the unit people use: colour, volume, opacity and loudness in the editor.

- Not for a value where one unit matters, such as 1px or 2°: use `NumberField`.
- Not for a sound's level with its mute: use `VolumeControl`.
- Not for one setting on or off: use `Switch`.
- Not for the playhead of an episode or a short: use `Scrubber`.

## How it works

- `disabled` dims the track.
- Used in the editor for colour, volume, opacity and loudness.
- The readout is in the unit people use, never the raw 0–100.
- `onChange` makes the track draggable and arrow-key operable (Shift moves 10). The thumb grows under the pointer and follows it with no easing.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | What it sets; names the slider. |
| `value` | `number` | required | 0–100 along the track. |
| `readout` | `string` | required | As people read it: "+0.2", "−3 dB". |
| `disabled` | `boolean` |  | Can't be moved. |
| `onChange` | `(value: number) => void` |  | Makes the track draggable and arrow-key operable; called with 0–100. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { SliderRow } from '@anicanon/sakuga/ui';

export function SliderRowExample() {
  return (
    <SliderRow label="Opacity" value={80} readout="80%" />
  );
}
```

## Accessibility

A slider named by `label` that Tab reaches, its value spoken as the `readout` (the name and readout beside it are hidden, so neither is read twice); with `onChange`, arrows move it by 1 (10 with Shift), Page Up and Page Down by 10, and Home and End to 0 and 100. Without `onChange` it reads as read-only, and `disabled` takes it out of the tab order and marks it disabled.

Used on: Web
Version: 1.0
