# StateChange

StateChange is a change written as before → after: two badges, the before faded.

## When to use

Use it for a change written as before and after, two badges with the before faded: a place that starts burning, a bond that turns to rivals.

- Not for a single state laid over artwork: use `Badge`.
- Not for a proposed change to words: use `Revision`.
- Not for the change as a whole row with its picture: use `EntityRow`.

## How it works

- `afterVariant="alert"` for a change for the worse (burning, dead, rivals). Leave `before` out for a state with no prior value.
- `afterIcon` and `beforeIcon` are the state's own glyph (Held a lock, Ransacked the chaos mark, Friends a heart), never the warning triangle: a state is something that happened in the story, not a fault in the work. A state with no glyph of its own goes without one.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `before` | `string` |  | The state it was; left out for one with no prior value. |
| `after` | `string` | required | The state it is now. |
| `afterVariant` | `'new' \| 'alert'` |  | `alert` for a change for the worse (burning, dead); `new` for one just added. |
| `afterIcon` | `IconName` |  | The new state's own glyph (Held a lock, Ransacked the chaos mark); never the warning triangle, and none for a state without one. |
| `beforeIcon` | `IconName` |  | The old state's own glyph, by the same rule. |

## Example

```tsx
import { StateChange } from '@anicanon/sakuga/anicanonkit';

export function StateChangeExample() {
  return (
    <StateChange before="Calm" after="Wary" afterVariant="new" />
  );
}
```

## Accessibility

Not focusable; read as "Changed from", the before badge, "to" and the after badge, with the arrow itself hidden, and with no `before` it reads the after badge alone.

Used on: Web
Version: 1.1
