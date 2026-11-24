# StatusBar

StatusBar is the slim bar at the foot of a working surface such as the writing room: where the work sits, whether it is saved, how long it is.

## When to use

Use it for the slim bar at the foot of a working surface such as the writing room: where the work sits, whether it is saved, how long it is.

- Not for actions on the work: use `ViewHeader`.
- Not for the transport and timecode under the editor's picture: use `MonitorBar`.
- Not for the foot of a step in a full-screen flow: use `FlowFooter`.
- Not for confirming that something finished: use `Toast`.

## How it works

- Children are the items, in order; rules separate them. One child with `slot="end"` sits at the far end (a cost note).
- Keep it to facts and one control at most. Actions belong in the top bar.
- A child with `slot="status"` (or `status`) is the saved state: the one item read aloud when it changes. Other items are never announced.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `ReactNode[]` |  | Or children, in order. |
| `end` | `ReactNode` |  | Or slot="end". |
| `status` | `ReactNode` |  | Or slot="status". |
| `children` | `ReactNode` |  | The view's status: short facts and what is saved. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Button, StatusBar } from '@anicanon/sakuga/ui';

export function StatusBarExample() {
  return (
    <StatusBar>
      <Button variant="ghost" size="sm" icon="bookmark" iconEnd="chevron-down">Starts after Fire at Sé</Button>
      <span>106 words · 3 sections</span>
      <span slot="status">Saved</span>
      <span slot="end">Refunded if finding events fails</span>
    </StatusBar>
  );
}
```

## Accessibility

Not focusable itself; its items read as text in order and anything focusable in them takes focus. Only the `slot="status"` child (or `status`) is read when it changes, through a status region that is always there.

Used on: Web
Version: 1.0
