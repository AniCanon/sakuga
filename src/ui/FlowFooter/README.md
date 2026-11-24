# FlowFooter

FlowFooter closes a step of the full-screen flow, inline under its content, or, where the step's body scrolls (New template, Edit template), placed by the flow under that body, outside the scroll, so it stays in view with the header above; the flow's layout does that, and FlowFooter itself is never sticky: Back on the left when a step precedes, then the note and the action on the right.

## When to use

Use it for the foot of a step in a full-screen flow: Back when a step precedes, a note on what happens next or what it costs, then the one primary action.

- Not for the way out of the flow: use `FlowHeader`.
- Not for facts at the foot of a working surface: use `StatusBar`.

## How it works

- `note` says what happens next or what it costs ("Free. Nothing is generated until you start it").
- The action is its child: one primary `Button`, or AniCanonKit's `SpendButton` with its `cost` when it spends.
- `back` takes `label`, `href` or `onClick`.
- `slot="start"` holds what leaves the step when it is not Back (Cancel creation, Skip for now, Show details).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `note` | `string` |  | What happens next or what it costs. |
| `back` | `object` |  | Back to the step before, as a link (`href`) or a button (`onClick`); its label is "Back" without one. |
| `back.label` | `string` |  |  |
| `back.href` | `string` |  |  |
| `back.onClick` | `MouseEventHandler` |  |  |
| `children` | `ReactNode` |  | The action; slot="start" holds what leaves the step when it is not Back. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Button, FlowFooter } from '@anicanon/sakuga/ui';

export function FlowFooterExample() {
  return (
    <FlowFooter note="Free. The front and back covers are made with it." back={{ label: 'Back' }}><Button>Create issue</Button></FlowFooter>
  );
}
```

## Accessibility

A footer element: Tab reaches Back (a link with `back.href`, otherwise a button running `back.onClick`) and then the actions; the note reads as text between them and the back icon is hidden.

Used on: Web, iOS, Android
Version: 1.2
