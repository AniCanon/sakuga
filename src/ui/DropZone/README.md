# DropZone

Where a file goes: drop or choose.

## When to use

Use it for where a file goes, dropped or chosen, then read and held: a clip to bring in.

- Not for a page or a list with nothing in it yet: use `EmptyState`.
- Not for a frame waiting for a picture that will be made: use `Thumb`.
- Not for choosing one thing already in the story, such as a place: use `Picker`.

## How it works

- Shows empty, busy (reading the file) and filled states. Busy draws the app's loader over the file's name (`Loader` unless the app sets one; AniCanon's mark in AniCanon).
- Motion: state changes fade with `motion-fast`; entrances use `motion-base` and `ease-enter`.
- `onFiles(files)` makes it work: a press opens the file chooser (`accept`, `multiple`) and a drop hands over the files. `onClick` runs first; call `preventDefault` to take the press yourself.
- A photo picked for a face, a look or a full body shows itself the moment it is picked (the picture's own object URL), so the creator sees what was chosen; each picked photo is its own tile, kept to the size of the empty ones beside it.

### Differs from the design

- The port draws what the design means where the design has a defect, until a version carries the fix.
- The design says Remove in English (`'Remove ' + (title || 'the picture')`), outside the table of words, so a pt-BR app hears it in English. The port says it through the table: `thePicture` ("the picture") beside `removeItem`.
- A card's ⋯ (MoreWrap) is named the same way in the design (`'More for ' + name`); the port says it through the table too: `moreFor` ("More for {name}").

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `image` | `string` |  | Filled with a picture: the tile shows it (a Thumb) at its own size. Never an icon and a file name for a photo. |
| `alt` | `string` |  | Filled with a picture: names it. |
| `imageStyle` | `string` |  | Filled with a picture: CSS placing it in the tile. |
| `onRemove` | `() => void` |  | Its Remove in the corner. |
| `removeLabel` | `string` |  | Its Remove in the corner, named "Remove {title}". |
| `state` | `'empty' \| 'busy' \| 'filled'` |  | `empty`, `busy` while the file is read, or `filled`. |
| `title` | `string` |  | What goes here ("Drop a clip, or choose a file"); once filled, the file's name. |
| `hint` | `string` |  | A quiet line under the title: what it takes. |
| `icon` | `IconName` |  | Default upload. |
| `height` | `number` |  | Its height in px. |
| `onClick` | `MouseEventHandler<HTMLButtonElement>` |  | Runs first when it is pressed; call preventDefault to keep the file chooser closed. |
| `onFiles` | `(files: File[]) => void` |  | With it, a press opens the file chooser and a drop hands the files over. |
| `accept` | `string` |  | The file chooser's accepted types, as on an input. |
| `multiple` | `boolean` |  | Takes several files at once. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { DropZone } from '@anicanon/sakuga/ui';

export function DropZoneExample() {
  return (
    <DropZone title="Drop a clip, or choose a file" hint="Audio or video · up to 30 seconds" onFiles={() => undefined} />
  );
}
```

## Accessibility

A button that Tab reaches, named by its `title` and `hint` (and "added" once filled), with the icon hidden; filled with an `image` it is a group named by `title`, its picture's alt is `alt`, and its Remove is a button of its own; while busy it carries aria-busy, says its title and hint once through the page's live region as it starts, and its loader stays quiet. With `onFiles`, Enter, Space or a click open the file chooser (after `onClick`, which can prevent it) and a drop hands the files over.

Used on: Web, iOS, Android
Version: 1.2
