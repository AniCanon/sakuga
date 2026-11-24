# List

List holds the rows of one list of things and names it: `ListRow`s, one thing per row.

## When to use

Use it around `ListRow`s, for one list of things that a screen reader should hear as a list.

- Not for each kind of setting with its value: use `PropertyList`, which draws its own rows.
- Not for measured facts, a name and its value: use `FactList`.
- Not for cuts on an ekonte sheet: use `CutSheet`.

## How it works

- `label` names the list for a screen reader.
- `surface` sets the rows in a surface, as a phone groups them (a settings list).
- `columns` (2 to 4) flows the rows across even columns, left to right, where one row would run far wider than its words: two drafts side by side on a wide page. A column never gets narrower than `list-columns-min-width` (438): where the list is too narrow, it drops a column, down to one (two need a list 900 wide). A single column is as wide as the list, even under 438, so it never runs past a phone's edge. The rows in the last line keep no hairline at rest, as a last row doesn't. Not with `surface`; on a phone a list is one column.
- **Reorder.** `onReorder(from, to)` gives every row a grip at its start (the same dotted handle as a Timeline track's). Drag the grip and the row lifts where it was, as a Timeline track does (the raised surface, an accent ring, nudged up and over; its words keep full contrast), while a line shows the slot it lands in; let go and it moves there. Rows land in slots, nothing else snaps. On the grip, Up and Down (or Alt with them) move it a place, focus stays on its grip, and each move is said ("Voices moved to 1 of 3"). The app keeps the order; `moving` (`{ from, to }`) draws a row mid-move, for a board. A row finds its place among the grips itself, so rows wrapped in another component still reorder. Not with `columns`.
- Rows go inside as children; a list never mixes a row with a block of another kind.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | Names the list for screen readers. |
| `onReorder` | `(from: number, to: number) => void` |  | Rows that reorder: each gets a grip to drag, and Up and Down (or Alt with them) on the grip move it a place; a line shows the slot it lands in, and each move is said ("Voices moved to 1 of 3"). Called with the row's index and its new index. |
| `moving` | `object` |  | A row drawn mid-move, for a board: its index and the index it lands at. |
| `moving.from` | `number` | required |  |
| `moving.to` | `number` | required |  |
| `surface` | `boolean` |  | The rows sit in a surface (a phone's grouped list). |
| `columns` | `2 \| 3 \| 4` |  | The rows flow across 2 to 4 even columns, left to right (two drafts side by side); a column is never narrower than 438, so a narrower list drops columns, down to one. Not with surface. |
| `children` | `ReactNode` | required | Its ListRows. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { List, ListRow, Switch } from '@anicanon/sakuga/ui';

export function SoundSettings() {
  return (
    <List label="Sound">
      <ListRow icon="video" title="Takes’ own sound" sub="Voices and sound from each take"><Switch on label="Takes’ own sound" /></ListRow>
      <ListRow icon="volume" title="Cue 2 · wind" sub="Music"><Switch on={false} label="Cue 2" /></ListRow>
    </List>
  );
}
```

## Accessibility

A list (role list) named by `label`; its rows are its items, read in order across each line when it has `columns`, and Tab reaches only the rows that are links or hold a control. With `onReorder` each grip is a button named "Move Voices, 2 of 3", described by how to move it, with Up and Down (or Alt with them) moving the row; the move is said aloud.

Used on: Web, iOS, Android
Version: 1.5
