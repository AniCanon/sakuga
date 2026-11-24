# ProgramBar

ProgramBar is the whole cut at a glance: sections in planned proportion (`cut`, `partial` with gaps, `missing`), the window the Timeline shows, the playhead, and numbered note `marks` from screening.

## When to use

Use it for the whole cut at a glance: its sections in planned proportion, the window the Timeline shows, the playhead and numbered notes from screening.

- Not for the cut's tracks to edit: use `Timeline`.
- Not for the playhead of an episode or a short being watched: use `Scrubber`.
- Not for how far something being made has come: use `Progress`.
- Not for moving through the story in story order: use `StoryScrubber`.

## How it works

- A mark sits on its own rail above the bar, its number centred in its badge, with a hairline down to its exact point, as Timeline's markers do, so it never covers a section's label.
- `onSeek(seconds)` makes the bar where the whole cut is moved through: a press puts the playhead there and a drag scrubs, a frame at a time (`seekStep`), never past `duration` (planned time with nothing cut cannot be played), and the playhead becomes a slider (an arrow a second, Shift ten, Home and End the ends).
- It earns its row only when it carries something the Timeline's ruler under it does not: `sections`, note `marks`, `planned` time not cut yet (`planned` past `duration`), or the `window` of a Timeline zoomed to part of the program. Without any of them it draws nothing, and the ruler is the one bar: a short with one take, a cut with nothing written, never two bars that scrub the same span.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `duration` | `number` | required | The cut's length so far, in seconds. |
| `planned` | `number` |  | Its planned length, in seconds, which the bar spans; `duration` without it. |
| `total` | `string` |  | The total read as text at the bar's end ("12:40 of 14:00"). |
| `playhead` | `number` |  | Where the playhead is, in seconds. |
| `onSeek` | `(seconds: number) => void` |  | A press or drag on the bar, or the playhead as a slider (an arrow a second, Shift ten): the new time in seconds, never past `duration`. |
| `seekStep` | `number` |  | Default 1/24. |
| `seekLabel` | `string` |  | The slider's name. Default "Seek". |
| `window` | `object` |  | The part the Timeline shows, in seconds. |
| `window.start` | `number` | required |  |
| `window.length` | `number` | required |  |
| `sections` | `object[]` |  | The cut's sections in planned proportion: `cut`, `partial` (with gaps) or `missing`. |
| `sections[].label` | `string` | required |  |
| `sections[].start` | `number` | required |  |
| `sections[].length` | `number` | required |  |
| `sections[].state` | `'cut' \| 'partial' \| 'missing'` |  |  |
| `marks` | `object[]` |  | Numbered notes from screening, at their time; `done` once handled. |
| `marks[].at` | `number` | required |  |
| `marks[].label` | `string` | required |  |
| `marks[].done` | `boolean` |  |  |
| `label` | `string` |  | Names the group; "The whole cut" without it. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { ProgramBar } from '@anicanon/sakuga/anicanonkit';

export function WholeCut({ onSeek }: { onSeek: (seconds: number) => void }) {
  return (
    <ProgramBar
      duration={400}
      planned={660}
      total="6:40 of 11:00"
      playhead={161}
      onSeek={onSeek}
      window={{ start: 140, length: 40 }}
      sections={[
        { label: '#1', start: 0, length: 110 },
        { label: '#2 The roof', start: 110, length: 160, state: 'partial' },
        { label: '#3 Red Line', start: 270, length: 390, state: 'missing' },
      ]}
      marks={[{ at: 96, label: '1', done: true }, { at: 302, label: '2' }]}
    />
  );
}
```

## Accessibility

Not focusable without `onSeek`; a group named by `label` (default "The whole cut") whose section labels (with "partly cut" or "missing"), mark labels (with "done"), the window ("Timeline shows 0:30 to 1:00"), the playhead ("Playhead at 0:42") and the total read as text. With `onSeek` the playhead is a slider named "Seek" (`seekLabel`) whose value reads "Playhead at 0:42".

Used on: Web
Version: 1.2
