# MakiTurn

MakiTurn is one reply from Maki: her words on the panel's edge, in `text-body-lg`, with no who-line and no box (the head already says who).

## When to use

Use it for one reply from Maki in the chat, whatever it holds.

- Not for what the person said: use `ChatMessage`.
- Not for something Maki proposes inside the reply: use `MakiCard`.
- Not for one thing Review found: use `MakiFinding`.

## How it works

- `steps` (or `slot="steps"`) come first: what Maki did, as `MakiStep`s ("Read the story · 26 events"), quiet, so the reply says what it rests on.
- The words are paragraphs, lists and quotes in the reply's own size; a quote is set off by a rule at its edge, never a box. Names are `Mention`s with their pictures; a row of `MentionChip`s follows when the reply is about who or what. `MakiCard`s and Review's `MakiFindingGroup`s sit inside it on the same edge.
- `writing` is only for before the first word: Maki's loader and "Maki is writing…". After that the words come in where they will stay.
- `actions` (or `slot="actions"`) is the quiet row under the newest reply: icon buttons of one size (show on the map, more).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `steps` | `ReactNode` |  | What Maki did first, as MakiSteps ("Read the story · 26 events"), or slot="steps". |
| `writing` | `boolean \| string` |  | Before the first word: Maki's loader and "Maki is writing…" (a string replaces those words). |
| `actions` | `ReactNode` |  | The newest reply's quiet row: icon buttons of one size, or slot="actions". |
| `children` | `ReactNode` |  | What Maki says: paragraphs, lists and quotes with Mentions, MakiCards and Review's MakiFindingGroups. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { MakiTurn } from '@anicanon/sakuga/anicanonkit';

export function MakiTurnExample() {
  return (
    <MakiTurn><p>Sé station has been burning since Fire at Sé.</p></MakiTurn>
  );
}
```

## Accessibility

Read as "Maki:" and the reply; the steps read first. While `writing`, the loader says its words once; the words beside it are hidden from screen readers.

Used on: Web, iOS, Android
Version: 2.0
