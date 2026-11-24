# VolumeControl

VolumeControl is a sound’s mute button, its level and the readout (Muted when muted).

## When to use

Use it for a sound's mute button, its level and the readout (Muted when muted), such as the video's own sound on the selected cut.

- Not for any other labelled value on a track: use `SliderRow`.
- Not for one setting on or off: use `Switch`.
- Not for hearing a voice line or a take: use `AudioPlayer`.

## How it works

- `what` names the sound for the buttons’ labels (the video’s own sound). `onMute` and `onChange` (0–100) make it operable; the track drags like SliderRow's.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | `number` | required | The level, 0 to 100. |
| `muted` | `boolean` |  | Mute is on: its button reads pressed and the level shows Muted. |
| `what` | `string` |  | Names the sound in the buttons' labels. |
| `href` | `string` |  | Makes Mute a link. |
| `onMute` | `MouseEventHandler` |  | Mute's press. |
| `onChange` | `(value: number) => void` |  | Called with 0–100. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { VolumeControl } from '@anicanon/sakuga/anicanonkit';

export function VolumeControlExample() {
  return (
    <VolumeControl value={40} what="the music" />
  );
}
```

## Accessibility

Tab reaches the mute button, a toggle named "Mute" plus `what` (default "the sound") and "pressed" when muted, then a slider named "Volume of the sound" and spoken as its percent or "Muted"; with `onChange`, arrows move it by 1 (10 with Shift), Page Up and Page Down by 10, and Home and End to 0 and 100. Without `onChange` the slider reads as read-only.

Used on: Web
Version: 1.0
