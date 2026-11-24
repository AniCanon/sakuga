# Revision

Revision shows a proposed change in place: the old words struck, the new ones underlined.

## When to use

Use it for a proposed change shown in place, the old words struck and the new ones underlined, with Accept, Decline and Why beside it, or a new line where there was none.

- Not for a change of state, such as alive to dead: use `StateChange`.
- Not for the Director's note on a cut: use `Slip`.
- Not for something Maki proposes inside the chat: use `MakiCard`.
- Not for an event or link found in writing: use `ProposalCard`.

## How it works

- Accept, Decline and Why sit beside it, per cut. Without `before` it is only an insertion: a new line proposed where there was none.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `before` | `string` |  | Leave out for an insertion. |
| `after` | `string` | required | The words as they would read. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Revision } from '@anicanon/sakuga/anicanonkit';

export function RevisionExample() {
  return (
    <Revision before="Kiko comes down the stairs and" after="Kiko steps out of the smoke and" />
  );
}
```

## Accessibility

Not focusable; read as "Removed:" and the old words, then "Added:" and the new ones, the two labels said but not shown.

Used on: Web
Version: 1.0
