# EntityRow

EntityRow is the one row kind on Story: a picture, the name, its state, and the work that told it.

## When to use

Use it for every row on Story: a character, a bond, a place, an event or a question, with its state and the work that told it.

- Not for a row outside Story, such as a take or a setting: use `ListRow`.
- Not for an open question with its planted, raised and answered steps: use `QuestionRow`.
- Not for something found in writing, waiting for the person: use `ProposalCard`.
- Not for the people in a character's life beside their name: use `CastAvatar`.

## How it works

- **The name gets the width.** It wraps to a second line before it is ever cut, and nothing at the row's end may take its room.
- `chip` is a short label at the end ("Ep 2", "Manga"): it yields first, cut with its whole words in a tip on hover and focus, never wider than 40% of the row. A chip longer than 14 characters is shown as the source instead.
- `source` is where it was told in full ("Lantern Tide · series bible · Prologue"): quiet secondary text under the name. Pass a long source here, never as the chip.
- `visual` picks the picture: a portrait (`avatar`), two overlapping portraits for a bond (`pair`), a place's art (`place`), an event's shape (`event`), a question's three-step track (`question`).
- State is `before`/`after` (drawn as `StateChange`) or any badges in `slot="state"`.
- `faded` for something that no longer counts at this moment.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `visual` | `Visual` |  | The picture it starts with: a portrait, a bond, a place's art, an event's shape, a question's track. |
| `name` | `string` | required | The character, place or event's name. |
| `before` | `string` |  | Its state before this moment, drawn as a StateChange with `after`. |
| `after` | `string` |  | Its state at this moment. |
| `afterVariant` | `'new' \| 'alert'` |  | `alert` for a change for the worse; `new` for one just added. |
| `afterIcon` | `IconName` |  | An icon before the new state. |
| `beforeIcon` | `IconName` |  | An icon before the old state. |
| `chip` | `string` |  | A short label at the end ("Ep 2", "Manga"); it yields before the title does. Longer than 14 characters, it shows as the source. |
| `source` | `string` |  | Where it was told, in full ("Lantern Tide · series bible · Prologue"): quiet text under the name. |
| `faded` | `boolean` |  | Something that no longer counts at this moment. |
| `state` | `ReactNode` |  | The state in place of before/after (as slot="state"). |
| `end` | `ReactNode` |  | What sits at the end (as slot="end"). |
| `children` | `ReactNode` |  | A line under the name; a custom picture as slot="visual", the state as slot="state", the end as slot="end". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { EntityRow } from '@anicanon/sakuga/anicanonkit';

export function EntityRowExample() {
  return (
    <EntityRow visual={{ kind: 'avatar', initial: 'S' }} name="Smith" after="Missing" afterVariant="alert" chip="Ep 3" />
  );
}
```

## Accessibility

Not focusable; the name, "not at this moment" when `faded`, its source, its state and the chip read as text in order, then whatever sits at the end. Pictures and initials are hidden, and a faded row dims its picture while its words stay readable.

Used on: Web
Version: 1.2
