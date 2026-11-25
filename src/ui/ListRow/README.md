# ListRow

ListRow is one row of a `List`: a title and a quiet line under it, with an optional `icon` or `image` before it, a `meta` column (a timecode) and whatever sits at the end (a switch, a button, a check).

## When to use

Use it for one thing on one row of a `List`: a title and a quiet line, with what sits at the end (a switch, a button, a check); `loose` in settings lists.

- Not for a quiet action inside a line of text: use `TextLink`.
- Not for a row on Story with a picture, a state and the work that told it: use `EntityRow`.
- Not for each kind of setting with its value, opening the full choice: use `PropertyList`.
- Not for measured facts, a name and its value: use `FactList`.
- Not for a cut on an ekonte sheet: use `CutRow`.

## How it works

- `selected` marks the current row the way every list and nav does: its title in ink weight with the small `state-dot` beside it, no fill and no edge; `href` makes it a link; `loose` gives it more room (settings lists).
- A row you can press (`href`, or only `onClick`) shows the pointer and sinks on press. Under the pointer the whole row fills with `bg-fill-subtle`: the fill reaches `list-row-hover-bleed` (12) past the words on each side, so they stay on the page column, with `list-row-hover-radius` (8) corners. While it shows, the row drops its hairline, and so does the row above it where the rows stand in one column. In a `surface` list the fill meets the surface's edges. Its icon and chevron come to ink and its picture leans in. The fill is the only hover look; focus keeps the shared ring. `onClick` is for client-side navigation.
- With sound on, a press on a linked row plays the press sound (README · Sound).
- One row, one thing. A row never holds two actions of the same weight.
- `List` wraps rows and names the list (`label`).
- `attention` reads the quiet line in the text colour after the same `state-dot`: a take that waits for you, as `MediaCard` marks a production.
- `lightMap` gives the `image` light on art, as on `Thumb`: its own highlights glow under the pointer, and at the centre when a pressable row has keyboard focus. Never on `muted`.
- `slot="lead"` replaces the icon or image (a play button); `slot="main"` replaces the title and quiet line (a sound's waveform and its length).
- `checked` and `onCheck` give the row a `Checkbox` for bulk selection, named "Select" and the row's title; a checked row's title takes the ink weight. On a linked row the box sits beside the link, so the box chooses and the row still opens. It is not `selected`: that marks the current row.
- `slot="action"` (or `action`) gives a linked row an action of its own, as Publish on a ready draft: it sits beside the link, never inside it, so the row opens and the action acts. It keeps its size while the words wrap, and under the pointer only the row's own part shows the fill. One action at most, and never a second way to open the row.
- `linkLabel` names the row link when its words alone don't say where it goes ("Continue Episode 2"). It replaces what the link reads, so it carries the state that matters too. `label` still names the box.
- `chevron` adds a trailing chevron when the row opens a page. `List` with `surface` sets the rows in a surface, as a phone groups them.

**Adds itself**, as Thumb does: `onInsert` puts Insert at the row's end (on hover, focus and when selected), inside the row: the hairline and the hover fill run under the row and its Insert as one, as on every other row, a double-click or Enter inserts at the playhead, and `dragData` drags it onto a `Timeline` with `onDrop`. A row that adds itself keeps its `action` (a take's More, with Use and Reject): it sits after Insert, its own Tab stop, and a double-click or Enter on it never inserts the row.

**Reorders**, in a `List` with `onReorder`: the row gets a grip at its start (see `List`).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `ReactNode` | required | The row's title. |
| `onInsert` | `() => void` |  | Adds it to the cut, as on Thumb: Insert at the row's end (on hover, focus and when selected), a double-click or Enter inserts at the playhead. |
| `dragData` | `InsertData` |  | As on Thumb: the row drags onto a Timeline with onDrop. |
| `dragData.kind` | `string` |  |  |
| `dragData.length` | `number` |  |  |
| `dragData.label` | `string` |  |  |
| `insertInner` | `boolean` |  | Internal: the row InsertRow draws inside itself. |
| `sub` | `ReactNode` |  | The quiet line under it. |
| `icon` | `IconName` |  | An icon before the words. |
| `image` | `string` |  | A picture before the words, as a Thumb. |
| `imageStyle` | `string` |  | CSS for the picture in its frame. |
| `imageWidth` | `number` |  | The picture's width in px (default 64). |
| `imageHeight` | `number` |  | The picture's height in px (default 36). |
| `lightMap` | `string` |  | The image's baked light map, passed to its Thumb (light on art); a linked row under keyboard focus lights it at the centre. |
| `light` | `boolean` |  | Passed to its Thumb: on wherever there is a `lightMap`; false turns it off. |
| `muted` | `boolean` |  | Greys the row's picture. |
| `meta` | `string` |  | A leading column, e.g. a timecode. |
| `selected` | `boolean` |  | Marks the current row (the one open). |
| `attention` | `boolean` |  | The quiet line waits for you: text colour with the accent dot. Slots: slot="lead" (in place of icon or image), slot="main" (in place of title and sub). |
| `loose` | `boolean` |  | More room, for settings lists. |
| `checked` | `boolean` |  | Bulk selection: a Checkbox named "Select" and the title, beside the link on a linked row. Not `selected`, which marks the current row. |
| `onCheck` | `(checked: boolean) => void` |  | Called with the box's new value. |
| `label` | `string` |  | Names the row's box ("Select …") when the title is markup; a text title names it by default. |
| `linkLabel` | `string` |  | Names the row link when its words don't say where it goes ("Continue Episode 2"); it replaces what the link reads. |
| `action` | `ReactNode` |  | An action of its own beside the link (Publish), its own Tab stop; also slot="action". A row that adds itself keeps it after Insert (a take's More, with Use and Reject), and a double-click or Enter on it never inserts the row. |
| `chevron` | `boolean` |  | A trailing chevron: the row opens something. |
| `href` | `string` |  | Makes the row a link to where it opens. |
| `onClick` | `MouseEventHandler` |  | With href, for client-side navigation. |
| `children` | `ReactNode` |  | What sits at the end: a switch, a button. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { ListRow, Switch } from '@anicanon/sakuga/ui';

export function ListRowExample() {
  return (
    <ListRow icon="video" title="Takes’ own sound" sub="Voices and sound from each take"><Switch on label="Takes’ own sound" /></ListRow>
  );
}
```

## Accessibility

With `onInsert`, Enter or a double-click inserts (the item is described "Enter or a double-click inserts it at the playhead; drag it onto the timeline to place it") and Insert is its own button named "Insert" and the name, followed by the row's `action` when it has one. Inside List (a list named by its `label`) each row is a list item read as its title, quiet line, `meta` and what sits at the end, marked "current" when `selected` and "waiting for you" with `attention`; with `checked` or `onCheck` its box comes first, a checkbox named "Select" and the title (`label` names it when the title is markup); pictures, icons and the chevron are hidden. With `href` the row is a link, with only `onClick` a link-role row, and either way Tab reaches it and Enter follows it. An action beside the link is the next Tab stop, with its own ring; `linkLabel`, when set, is the link's name.

Used on: Web, iOS, Android
Version: 1.6
