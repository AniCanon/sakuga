# Slip

Slip is the correction slip, the only tinted surface on a sheet: the Director's revision note, a check, a review note pinned to a take, a story check.

## When to use

Use it for the correction slip, the only tinted surface on a sheet: the Director's revision note, a check, a review note pinned to a take, a story check.

- Not for one line of context inside a page: use `Notice`.
- Not for a proposed change in the words themselves: use `Revision`.
- Not for something Maki proposes inside the chat: use `MakiCard`.
- Not for a confirmation that something finished: use `Toast`.

## How it works

- `done` turns it into an outline. Slot: `action` (Ask Maki).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | The slip's heading ("Director's note", "Suggestion"). |
| `done` | `boolean` |  | The note has been acted on: the slip turns to an outline and reads "Done". |
| `children` | `ReactNode` |  | The note, and slot="action". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Slip } from '@anicanon/sakuga/anicanonkit';
import { TextLink } from '@anicanon/sakuga/ui';

export function EmptyFrameCheck({ onAsk }: { onAsk: () => void }) {
  return (
    <Slip label="Check">
      Nobody on screen for 6 seconds.
      <span slot="action"><TextLink onClick={onAsk}>Ask Maki</TextLink></span>
    </Slip>
  );
}
```

## Accessibility

Not focusable itself; "Done" when `done`, then the label, body and action read in order, and the action takes focus.

Used on: Web
Version: 1.0
