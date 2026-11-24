# MakiFinding

MakiFinding is one thing Maki's Review found, as a line of her reply: a small mark, what doesn't hold up and why, and every event it is in.

## When to use

Use it for one thing Maki's Review found, inside a `MakiFindingGroup` in her reply.

- Not for something Maki proposes inside a reply: use `MakiCard`.
- Not for something found in writing, beside the words it came from: use `ProposalCard`.
- Not for a check pinned to work on a sheet: use `Slip`.

## How it works

- One cause is one finding, however many events it touches. The mark is small, at the start of the line: a conflict (the story contradicts itself) the warning glyph in the accent, a warning the info glyph, muted. Its word is read, never shown; the group's label already says it. Never vermilion: nothing here deletes anything.
- The title takes the full width and wraps; `slot="title"` lets it carry `Mention`s. Lines are parted by hairlines, compact, with no inset and no fill.
- Its press (`onSelect`) shows it on the map and opens it (Show me). Open, its events list under it on the same edge, the title first and where it was told quiet under it, then its two actions as one pair in one style: Ask Maki and Keep on purpose. A page passes what they do (`onAsk`, `onKeep`), never the buttons, so they can't drift apart. Children show in the open one (the "Why it stays" field).
- `kept` is one kept on purpose: the bookmark, the title quiet, "Kept on purpose by {name} · {date}" (just "Kept on purpose" with no `by`), the reason, and Reopen.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` | required | What doesn't hold up, in plain words: what it is read by, and shown when slot="title" is not given. |
| `note` | `string` |  | Why, under the title. |
| `severity` | `'conflict' \| 'warning'` |  | A small mark at the start of the title line: a conflict (the story contradicts itself) or a warning. Its word is read, not shown. |
| `severityLabel` | `string` |  | The severity's word, when not "Conflict" or "Warning". |
| `events` | `(EntityRowProps & { type?: EventType })[]` |  | Its events, shown while open: the title first, where it was told under it. |
| `open` | `boolean` |  | Open: its events and its actions show. |
| `selected` | `boolean` |  | The current one: open. |
| `onSelect` | `MouseEventHandler` |  | The line's press: Show me, which shows the finding on the map and opens it. |
| `pressable` | `boolean` |  | Draws the line as pressable without a handler, on a board. |
| `onAsk` | `MouseEventHandler` |  | Ask Maki, while open. A page passes what it does, never the button. |
| `onKeep` | `MouseEventHandler` |  | Keep on purpose, while open. A page passes what it does, never the button. |
| `ask` | `boolean` |  | Draws Ask Maki without a handler, on a board. |
| `keep` | `boolean` |  | Draws Keep on purpose without a handler, on a board. |
| `askLabel` | `string` |  | Ask Maki's words, when not "Ask Maki". |
| `keepLabel` | `string` |  | Keep on purpose's words, when not "Keep on purpose". |
| `kept` | `object` |  | Kept on purpose: who kept it, when and why. |
| `kept.by` | `string` |  |  |
| `kept.date` | `string` |  |  |
| `kept.reason` | `string` |  |  |
| `onReopen` | `MouseEventHandler` |  | Reopen, on a kept one. |
| `reopen` | `boolean` |  | Draws Reopen without a handler, on a board. |
| `children` | `ReactNode` |  | The title with Mentions as slot="title", and anything shown while open (the "Why it stays" field). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { MakiFinding } from '@anicanon/sakuga/anicanonkit';

export function MakiFindingExample() {
  return (
    <MakiFinding severity="warning" title="“Mio Arata at the Main Pavilion” connects to nothing" note="Nothing leads to it and it leads nowhere." pressable />
  );
}
```

## Accessibility

An item of its group's list, named by its title. A line that opens is one button, read as its severity, "Show {title} on the map" and its note, expanded or collapsed; the mark is hidden. Open, its events are a list named "In 3 events", then Ask Maki and Keep on purpose take focus. A kept one reads "Kept on purpose by {name} · {date}", or "Kept on purpose" with no one named, and its reason, then Reopen.

Used on: Web
Version: 2.1
