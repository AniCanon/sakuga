# ProposalCard

ProposalCard is one event, change or link found in writing, waiting for the person.

## When to use

Use it for one event, change or link found in writing, waiting for the person beside the words it came from: stated, inferred, or a conflict with its Ask Maki.

- Not for something Maki proposes inside the chat: use `MakiCard`.
- Not for a change shown in place in the words: use `Revision`.
- Not for a check pinned to a cut on a sheet: use `Slip`.

## How it works

- `stated`: said in the text; accepted by default. `inferred`: a reading between the lines; dashed and never accepted for you. `conflict`: breaks the story; carries its action (Ask Maki).
- `accepted` drives the toggle.
- `onAccept(accepted)` makes the toggle work; it is called with the new state.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` | required | What was found, in a line. |
| `note` | `string` |  | Why, or what it changes, under the title. |
| `kind` | `'stated' \| 'inferred' \| 'conflict'` | `'stated'` | `stated` (said in the text; accepted by default), `inferred` (between the lines; dashed, never accepted for you) or `conflict` (breaks the story; carries its action). |
| `accepted` | `boolean` |  | Drives the Accept toggle. |
| `visual` | `Visual` |  | What it is about, drawn at its start: a face, a place, an event's glyph. |
| `onAccept` | `(accepted: boolean) => void` |  | The Accept toggle: called with the new state. |
| `action` | `ReactNode` |  | The action (as slot="action"). |
| `children` | `ReactNode` |  | More of what was found, under the note; the action as slot="action". |

## Example

```tsx
import { ProposalCard } from '@anicanon/sakuga/anicanonkit';

export function ProposalCardExample() {
  return (
    <ProposalCard title="Toddy wires a second watch" note="New event · stated" accepted visual={{ kind: 'event', type: 'clue' }} />
  );
}
```

## Accessibility

Read as text: the title, "conflict" on a conflict, the note and "Inferred" on an inferred find, with the picture hidden; the `action` slot takes focus. With `accepted` set, Tab reaches the "Accept" toggle button, "pressed" when accepted, which runs `onAccept`.

Used on: Web
Version: 1.0
