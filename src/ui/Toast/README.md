# Toast

A short confirmation that something finished, rising into a corner.

## When to use

Use it for a short confirmation that something finished, with an optional action.

- Not for an error that needs a decision: use `Dialog`.
- Not for context that stays on the page: use `Notice`.
- Not for work that is still running: use `Progress`.

## How it works

- One line of title and one of detail, optional action, always dismissable. Never for errors that need a decision.
- Motion: it rises in on `motion-base` with `ease-enter` and leaves on `motion-fast` with `ease-exit`.
- Slide it sideways to dismiss it: it follows the pointer and fades; past `toast-swipe-dismiss` (35%) of its width it leaves and `onDismiss` runs, short of that it returns.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` | required | What happened, in a line. |
| `text` | `string` |  | A line under it. |
| `icon` | `IconName` |  | A leading glyph. |
| `image` | `string` |  | A leading avatar, in place of the icon. |
| `media` | `ReactNode` |  | Drawn in place of the icon. |
| `open` | `boolean` |  | Set it to control the toast: false plays its exit, then it unmounts. Without it, Dismiss plays the exit and then calls onDismiss. |
| `onDismiss` | `() => void` |  | Without `open`, called after the exit has played. |
| `children` | `ReactNode` |  | An action button. |
| `style` | `CSSProperties` |  | Inline style on the root element. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Button, Toast } from '@anicanon/sakuga/ui';

export function ToastExample() {
  return (
    <Toast title="Scene 4 deleted" text="Its takes went with it."><Button variant="ghost" size="sm">Undo</Button></Toast>
  );
}
```

## Accessibility

Its title and text are said through the page's live region when it appears, and read in place with the icon and picture hidden; Tab reaches any actions in it and the "Dismiss" button, which runs `onDismiss`; dismissed with focus inside it, focus goes to the next toast, else back to where it came from. Sliding it away is for the pointer; the Dismiss button does the same.

Used on: Web, iOS, Android
Version: 1.0
