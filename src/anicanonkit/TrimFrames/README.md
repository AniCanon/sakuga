# TrimFrames

TrimFrames shows a cut’s in and out frames with their timecodes and a frame-at-a-time nudge under each.

## When to use

Use it for the selected cut's in and out frames with their timecodes and a frame-at-a-time nudge under each, ringing the one being trimmed.

- Not for trimming an item on the tracks by its ends: use `Timeline`.
- Not for a picture in a frame: use `Thumb`.
- Not for a number stepped a unit at a time: use `NumberField`.
- Not for the frame grid of what gets generated for a cut: use `Timesheet`.

## How it works

- `active` (`in` or `out`) rings the frame being trimmed. Each frame takes `image`, `imageStyle`, `timecode` and an optional `href`. Frame size with `frameWidth` and `frameHeight` (60 × 107 for 9:16). Frames narrower than their rows (a 9:16 cut at 60 × 107) centre the picture, with its name, timecode and nudges centred under it.
- `onNudge(which, frames)` runs a nudge on a frame with no `href` (`which` is `in` or `out`, `frames` −1 or 1).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `in` | `TrimFrame` | required | The cut's first frame. |
| `in.image` | `string` | required | The frame's picture. |
| `in.imageStyle` | `string` |  | CSS for the picture in its frame. |
| `in.timecode` | `string` | required | Where the frame is. |
| `in.href` | `string` |  | Makes the frame a link ("In frame, 0:12"); its nudges then stay buttons. |
| `out` | `TrimFrame` | required | The cut's last frame. |
| `out.image` | `string` | required | The frame's picture. |
| `out.imageStyle` | `string` |  | CSS for the picture in its frame. |
| `out.timecode` | `string` | required | Where the frame is. |
| `out.href` | `string` |  | Makes the frame a link ("In frame, 0:12"); its nudges then stay buttons. |
| `active` | `'in' \| 'out'` |  | The end being trimmed, ringed. |
| `frameWidth` | `number` |  | Each frame's width in px. |
| `frameHeight` | `number` |  | Each frame's height in px. |
| `label` | `string` |  | Names the pair for screen readers. |
| `onNudge` | `(which: 'in' \| 'out', frames: -1 \| 1) => void` |  | A nudge pressed on a frame with no href. |

## Example

```tsx
import { TrimFrames } from '@anicanon/sakuga/anicanonkit';

export function TrimCut({ still, onNudge }: { still: string; onNudge: (end: 'in' | 'out', frames: number) => void }) {
  return (
    <TrimFrames
      in={{ image: still, timecode: '0+00' }}
      out={{ image: still, imageStyle: 'object-position:62% 34%', timecode: '6+12' }}
      active="out"
      onNudge={onNudge}
    />
  );
}
```

## Accessibility

A group named by `label` (default "Trim"): each frame reads "In" or "Out" and its timecode, a frame with `href` is a link named like "In frame, 0:12" (with "selected" on the `active` one), and Tab reaches its nudge buttons ("In a frame earlier", "In a frame later", and the same for Out). Without `href` the nudges run `onNudge`.

Used on: Web
Version: 1.0
