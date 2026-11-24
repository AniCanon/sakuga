# Notice

A single line of context inside a page: something to know (info) or something that needs action (attention), with an optional action on the right.

## When to use

Use it for one line of context inside a page: something to know, or something that needs action, with an optional action.

- Not for confirming that something finished: use `Toast`.
- Not for a failure where the content should be: use `EmptyState`.
- Not for a correction pinned to work on a sheet: use `Slip`.

## How it works

- Not for errors that block, use the page state for those.
- Motion: state changes fade with `motion-fast`; entrances use `motion-base` and `ease-enter`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `tone` | `'info' \| 'attention'` | `'info'` | `info` (default) or `attention`. |
| `icon` | `IconName` |  | Defaults by tone: info, or warning for attention. |
| `media` | `ReactNode` |  | Drawn in place of the icon, e.g. a Loader. |
| `title` | `string` |  | The bold lead-in. |
| `text` | `string` |  | The line of context. |
| `children` | `ReactNode` |  | The action, usually a small Button. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Notice } from '@anicanon/sakuga/ui';

export function NoticeExample() {
  return (
    <Notice title="Build changed." text="New looks use it." />
  );
}
```

## Accessibility

Not focusable itself; the title and text read in place, the icon is hidden, and any action in it takes focus. With `tone` "attention" it says its title and text once, through the page’s one live region, when it appears: a status role on words there from the start is rarely read. A loader passed as `media` keeps its name.

Used on: Web, iOS, Android
Version: 1.0
