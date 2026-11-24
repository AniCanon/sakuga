# MakiStep

MakiStep is one line of what Maki is doing or did, at the top of her reply: "Read the story · 26 events".

## When to use

Use it for what Maki did before she answered, at the top of a `MakiTurn`.

- Not for Maki's answer itself: use `MakiTurn`.
- Not for a job running elsewhere: use `ActivityRow`.

## How it works

- While it runs, Maki's loader; done, a check. `detail` follows quietly after a middle dot. It flows as one line of text and wraps as one.
- With children it opens on a press to show them (which events she read).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | What Maki is doing or did ("Read the story"). |
| `detail` | `string` |  | Quiet, after a middle dot ("26 events"). |
| `done` | `boolean` |  | Done: a check; else Maki's loader. |
| `open` | `boolean` |  | Opens showing its children. |
| `children` | `ReactNode` |  | What the step shows when opened (which events she read). |

## Example

```tsx
import { MakiStep } from '@anicanon/sakuga/anicanonkit';

export function MakiStepExample() {
  return (
    <MakiStep label="Reading the story" detail="26 events" />
  );
}
```

## Accessibility

Read as text; a step that opens is a button, expanded or collapsed. A running step's loader says its label once.

Used on: Web, iOS, Android
Version: 1.0
