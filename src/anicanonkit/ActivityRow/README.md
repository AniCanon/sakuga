# ActivityRow

ActivityRow is the sidebar's line for work that is running: the AniCanon loader, how many jobs are running, the latest one's line, and a chevron that opens `ActivityPanel`.

## When to use

Use it in the sidebar for work that is running, opening `ActivityPanel`.

- Not for one job's stages in order: use `Stages`.
- Not for how far one job has come where it is being made: use `Progress`.

## How it works

- `count` is how many are running; `line` says what the latest one is doing ("Tattoo · designing the look").
- `waiting` is how many wait on you (a review, a retry), said after the running ones ("4 running · 2 waiting"). With nothing running and something waiting, a state dot stands where the loader turns ("2 waiting").
- It counts the whole series: characters, Studio takes and places alike.
- `expanded` turns the chevron while the panel is open; `onClick` opens and closes it.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `count` | `number` | required | How many jobs are running. |
| `waiting` | `number` |  | How many wait on you (a review, a retry), said after the running ones. |
| `line` | `string` |  | What the latest job is doing ("Tattoo · designing the look"). |
| `expanded` | `boolean` |  | Whether the activity panel it opens is open; turns the chevron. |
| `onClick` | `MouseEventHandler` |  | Opens and closes the activity panel. |

## Example

```tsx
import { ActivityRow } from '@anicanon/sakuga/anicanonkit';

export function ActivityRowExample() {
  return (
    <ActivityRow count={2} line="Tattoo · designing the look" />
  );
}
```

## Accessibility

A button announced as "Activity: N running" (with `waiting`, "Activity: N running, M waiting"), described by its `line`, and expanded or collapsed from `expanded`; Enter or Space runs `onClick`. The loader and the chevron are hidden.

Used on: Web
Version: 1.1
