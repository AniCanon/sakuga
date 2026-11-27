# Timesheet

Timesheet is what gets generated for a cut, on a frame grid (24 a second, a tick on each whole second, the strip's two ends its first and last frames): each video's bracket, the key frames it starts and ends on, and one line per video (where it opens, how it continues).

## When to use

Use it for what gets generated for a cut, on a frame grid: each video's bracket, the key frames it starts and ends on, and one line per video.

- Not for the cut's tracks under the preview: use `Timeline`.
- Not for the whole cut at a glance: use `ProgramBar`.
- Not for camera and timing notation in a line: use `Shorthand`.
- Not for a cut's in and out frames while trimming: use `TrimFrames`.

## How it works

- A key sits on a rail above the frames, its number centred in its badge, with a hairline down to its exact frame, which may fall between the ticks.
- A key on the first or last frame sits inside the strip, its hairline on the frame, never hanging past the strip's end.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `seconds` | `number` | required | The cut's length, which the frame grid spans. |
| `fps` | `number` |  | Frames a second (default 24). |
| `label` | `string` |  | Names the sheet for screen readers. |
| `note` | `string` |  | A line under the grid. |
| `spans` | `object[]` | required | Each video's bracket, in frames, with its line (where it opens, how it continues). |
| `spans[].start` | `number` | required |  |
| `spans[].end` | `number` | required |  |
| `spans[].label` | `string` | required |  |
| `spans[].detail` | `string` |  |  |
| `keys` | `object[]` |  | The key frames the videos start and end on, numbered, at their frame. |
| `keys[].at` | `number` | required |  |
| `keys[].label` | `string` | required |  |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Timesheet } from '@anicanon/sakuga/anicanonkit';

export function TimesheetExample() {
  return (
    <Timesheet seconds={5} spans={[{ start: 0, end: 120, label: 'Video 1', detail: 'opens on the board' }]} keys={[{ at: 10, label: '1' }, { at: 110, label: '2' }]} />
  );
}
```

## Accessibility

Not focusable; a group named by `label` (default "Videos to make") whose label, note, key frame labels (with "at frame 24") and each video's line (with "frames 0 to 48") read as text.

Used on: Web
Version: 1.1
