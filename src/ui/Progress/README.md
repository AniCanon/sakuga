# Progress

Progress is how far something being made has come, as a line that fills in the accent.

## When to use

Use it for how far something being made has come, when the share done is known.

- Not for work whose length is unknown: use `Loader`.
- Not for the playhead of an episode or a short: use `Scrubber`.
- Not for where a person is in a flow they step through: use `Stepper`.

## How it works

- `value` is 0 to 100; `label` names what is being made, for screen readers ("Rendering your take").
- It sits under the words that say what is happening, never in place of them: a title, then the line, then what is held and when it lands.
- `tone="media"` over art or video, so the track stays light on a dark picture.
- A job with stages shows them with `Stepper` above the line; a job whose length is unknown uses `Loader`, not a line that never moves.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | `number` | required | How far it has come, 0 to 100. |
| `label` | `string` |  | Names what is being made, for screen readers ("Rendering your take"). |
| `tone` | `'media'` |  | `media` over art or video, so the track stays light. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Progress } from '@anicanon/sakuga/ui';

export function ProgressExample() {
  return (
    <Progress value={40} label="Rendering your take" />
  );
}
```

## Accessibility

Not focusable; a progress bar announced with its percent. Name it with `label`; without one it has no name. In forced colours the track keeps an edge and the fill takes Highlight.

Used on: Web, iOS, Android
Version: 1.0
