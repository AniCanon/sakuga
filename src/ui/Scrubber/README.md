# Scrubber

Scrubber shows and sets the playhead: played, buffered and remaining time, with the current time and total length.

## When to use

Use it for showing and setting the playhead of an episode or a short, over video or the player bar: played, buffered and remaining time, with chapter marks.

- Not for how far something being made has come: use `Progress`.
- Not for seeking inside a voice line or a sound: use `AudioPlayer`.
- Not for the playhead across the cut's tracks: use `Timeline`.
- Not for moving through the story in story order: use `StoryScrubber`.

## How it works

- It is a `slider` with spoken values ("3 minutes 12 seconds of 11 minutes 36 seconds"). Arrow keys move 10 seconds, Page keys a minute, Home and End jump to the ends.
- Always over video or the player bar, so it uses the media tokens and stays the same in both themes.
- `showTimes={false}` when the times are shown elsewhere (phone shorts).
- `markers` draws chapter marks (in seconds) cut into the track.
- The thumb grows and the track thickens under the pointer. Dragging follows the pointer with no easing; playback moves the fill linearly.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | `number` | required | The playhead, in seconds. |
| `max` | `number` | required | The length, in seconds. |
| `markers` | `number[]` |  | Chapter marks, in seconds. |
| `buffered` | `number` |  | How much has loaded, in seconds. |
| `step` | `number` |  | What an arrow press moves, in seconds (default 10); Page Up and Page Down move six steps. |
| `label` | `string` |  | Names the slider. |
| `showTimes` | `boolean` |  | `false` hides the current time and the total. |
| `onChange` | `(seconds: number) => void` |  | Called with the new playhead, in seconds. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Scrubber } from '@anicanon/sakuga/ui';

export function ScrubberExample() {
  return (
    <Scrubber value={192} max={696} buffered={320} label="Played" />
  );
}
```

## Accessibility

A slider named by `label` (default "Seek") that Tab reaches: arrows move it by `step` seconds (default 10), Page Up and Page Down by six steps, Home and End to either end, and its value is spoken as "1 minute 5 seconds of 3 minutes 0 seconds". The times beside it read as text and the markers are hidden; without `onChange` it reads as read-only.

Used on: Web, iOS, Android
Version: 1.0
