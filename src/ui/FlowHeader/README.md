# FlowHeader

FlowHeader is the full-screen flow's top bar: close (nothing is kept), what is being made and for what, the steps when there are several, then what sits at the end.

## When to use

Use it for the top bar of a full-screen flow: close, what is being made and for what ("New issue · Bad Memories"), the steps when there are several, and the balance.

- Not for Back and the step's action: use `FlowFooter`.
- Not for the desktop header of the app: use `TopNav`.
- Not for the top of a production view: use `ViewHeader`.
- Not for the editor's top bar: use `EditorHeader`.

## How it works

- `title` and `context`: "New issue · Bad Memories". `closeLabel` says what closing does ("Close. Nothing is created").
- `steps` and `current` draw a `Stepper` in the middle, only when the flow has more than one step.
- `slot="end"`: the balance (`AniCanonKit.FragmentBalance`) in AniCanon.
- One way out per screen: this close button. Back lives in `FlowFooter`, and only when a step precedes.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` | required | What is being made ("New issue"). |
| `context` | `string` |  | What it is for ("Bad Memories"). |
| `closeLabel` | `string` |  | What closing does, e.g. "Close. Nothing is created". Default "Close". |
| `closeHref` | `string` |  | Makes Close a link to where closing goes. |
| `onClose` | `MouseEventHandler` |  | Close's press, when it has no `closeHref`. |
| `steps` | `string[]` |  | The flow's steps, drawn as a Stepper when there are more than one. |
| `current` | `number` |  | The step open now, by index. |
| `stepsLabel` | `string` |  | Names the steps for screen readers. |
| `children` | `ReactNode` |  | slot="end" (or the children): what sits at the end, the balance in AniCanon. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { FlowHeader } from '@anicanon/sakuga/ui';

export function FlowHeaderExample() {
  return (
    <FlowHeader title="New character" context="EBA" closeLabel="Close. Nothing is created" steps={['Basics', 'How to make', 'Approve']} current={1} />
  );
}
```

## Accessibility

A header element: Tab reaches the close button (named by `closeLabel`, default "Close"; a link with `closeHref`) and then whatever sits at the end. The title and context are a level-1 heading, and the steps are a list named by `stepsLabel` (default "Steps") with the current one marked "current step".

Used on: Web, iOS, Android
Version: 1.0
