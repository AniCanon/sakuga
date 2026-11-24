# EmptyState

EmptyState stands in place of content while there is none: what is happening or what went wrong, in a sentence, then what can be done.

## When to use

Use it for the place where content would be while there is none: nothing yet, something being made, or something that failed.

- Not for one line of context beside content that is there: use `Notice`.
- Not for a job whose share done is known: use `Progress`.
- Not for a frame waiting for its picture: use `Thumb`.

## How it works

- `title` says it plainly ("Ponytail didn’t finish", "Warming up the booth"); `text` says what is kept and what happens next.
- The title is a heading, h2 by default. When the state is the whole page (a 404, a page that failed), pass `as="h1"` so the page has its heading.
- `tone="attention"` with `icon="warning"` when something failed; pass a loader in `slot="media"` while something is being made.
- Children follow the text: what it cost (a held or returned amount), a quiet "Show details".
- It never apologises and never blames the creator. Nothing is charged for a failure, and the text says so.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` |  | What is happening or what went wrong, plainly ("Warming up the booth"). |
| `text` | `string` |  | What is kept and what happens next. |
| `icon` | `IconName` |  | An icon over the title; `warning` when something failed. |
| `tone` | `'attention'` |  | `attention` when something failed: said once as it appears. |
| `children` | `ReactNode` |  | What can be done, after the text; a loader as slot="media". |
| `as` | `'h1' \| 'h2' \| 'h3'` | `'h2'` | The title's heading level: h2 by default, h1 when the state is the whole page (a 404, a page that failed). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { EmptyState } from '@anicanon/sakuga/ui';

export function EmptyStateExample() {
  return (
    <EmptyState icon="collection" title="No shorts yet" text="Shorts you make from an episode land here." />
  );
}
```

## Accessibility

Not focusable itself; the title is a heading (h2, or the level `as` gives) and the text a paragraph, the icon is hidden, and any actions in it take focus in order. With `tone` "attention" it says its title and text once, through the page’s one live region, when it appears.

Used on: Web, iOS, Android
Version: 1.1
