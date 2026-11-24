# Monitor

Monitor is the editor's picture: the frame being edited, with its corner labels, the guides and the region an edit works on.

## When to use

Use it in `EditorShell`'s centre column for the picture being edited.

- Not while an item is selected on the canvas: use `CanvasStage`.
- Not for a take shown in a list or a strip: use `Thumb`.
- Not for a clip that plays where it is shown: use `VideoPlayer`.

## How it works

- `image` is the picture (`imageStyle` to place it, `alt` to name it); `fit="contain"` shows all of it.
- `labels` sit in one corner and `labelsEnd` in the other; `guides` draw title-safe or an effect's area (`accent` for the selected one); `region` the area an edit works on, with its label.
- `centered` puts a frame in the middle; `fill` takes the column's height (a manga page); otherwise `height` sets it.
- `fit="picture"` makes the Monitor its picture's own shape, as large as its column allows and centred in it, so the labels sit on the picture at any width and ratio. It takes the column as `fill` does (pass neither `fill` nor `height`), and fills it until the picture has loaded.
- `ratio` (16 / 9, `'9 / 16'`) makes the Monitor the program's frame whatever the picture: a 16:9 still in a 9:16 short is a 9:16 frame, and an empty cut still has its frame. It is as large as its column allows and centred, taking the column as `fill` does; guides, region and children sit in that frame. A `fill` CanvasStage with the same `ratio` draws its frame in exactly the same place, so selecting and deselecting never moves the picture.
- The corner labels wrap inside the frame, never past its edge.
- Nothing floats over the picture except the labels and what you are editing on it.
- `picks` with `onPick` lets the picture be clicked, as editors do on their program monitor: the page passes the items under the playhead, topmost first, each with its `box` in percent of the frame. A click takes the topmost one under the pointer; a click again where the selected one is takes the one beneath it, and round to the top; a click where none is — the ground around the frame, or a part of the frame nothing covers — calls `onPick(null)`. Hovering outlines what a click would take, with its name, so the one beneath shows before it is taken. A double-click on an `editable` pick calls `onEdit` (a title's words), even when its first click swapped the Monitor for a CanvasStage.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `guides` | `object[]` |  | Title-safe or an effect's area, in percent; accent for the selected one. |
| `guides[].x` | `number` | required |  |
| `guides[].y` | `number` | required |  |
| `guides[].w` | `number` | required |  |
| `guides[].h` | `number` | required |  |
| `guides[].accent` | `boolean` |  |  |
| `region` | `object` |  | The area an edit works on, with its label. |
| `region.x` | `number` | required |  |
| `region.y` | `number` | required |  |
| `region.w` | `number` | required |  |
| `region.h` | `number` | required |  |
| `region.label` | `string` |  |  |
| `labelsEnd` | `string[]` |  | Labels in the other corner. |
| `fill` | `boolean` |  | Takes the column's height instead of `height`. |
| `image` | `string` |  | The picture being edited. |
| `imageStyle` | `string` |  | CSS, e.g. "object-position:50% 40%". |
| `alt` | `string` |  | Names the picture; decorative without it. |
| `labels` | `string[]` |  | Corner labels: the cut and the timecode. |
| `height` | `number` |  | The frame's height in px (default 392), unless `fill` or `fit="picture"`. |
| `centered` | `boolean` |  | A 9:16 frame in the middle. |
| `ratio` | `number \| string` |  | The program's frame shape (16 / 9, '9 / 16', '16:9'): the Monitor is that shape whatever the picture, as large as its column allows and centred, taking the column as `fill` does; guides, region and children sit in that frame. The same shape as a `fill` CanvasStage, so switching between them never moves the frame. |
| `fit` | `'cover' \| 'contain' \| 'picture'` |  | contain: the whole picture, not filling the frame. picture: the Monitor is its picture's own shape, as large as its column allows and centred, taking the column as `fill` does. |
| `children` | `ReactNode` |  | Drawn over the picture: what is being edited on it. |
| `className` | `string` |  | Extra class on the root element. |
| `picks` | `Pick[]` |  | The items under the playhead a click on the picture selects, topmost first, each with its box in percent of the frame. |
| `picks[].id` | `string` | required |  |
| `picks[].label` | `string` | required |  |
| `picks[].box` | `Box` | required |  |
| `picks[].box.x` | `number` | required |  |
| `picks[].box.y` | `number` | required |  |
| `picks[].box.w` | `number` | required |  |
| `picks[].box.h` | `number` | required |  |
| `picks[].editable` | `boolean` |  | A double-click edits it (a title's words) through onEdit. |
| `selected` | `string \| null` |  | The selected pick's id. |
| `onPick` | `(id: string \| null) => void` |  | Called with the pick a click takes, or null for none. |
| `onEdit` | `(id: string) => void` |  | Called on a double-click on an editable pick. |

## Example

```tsx
import { Monitor } from '@anicanon/sakuga/anicanonkit';

export function MonitorExample() {
  return (
    <Monitor ratio="9 / 16" labels={['0:00 + 00f']} />
  );
}
```

## Accessibility

The picture is an image named by `alt` (decorative without it); the labels are read as text; the guides are hidden, and the region is read by its label. With `picks` the picture is for the pointer: the outline and its name are hidden from assistive technology, and the timeline is where a keyboard selects the same items.

Used on: Web
Version: 1.3
