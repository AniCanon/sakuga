# CanvasStage

CanvasStage is the editor's canvas while an item on it is selected: the frame, the item at its size and place, and a box with eight handles to move and resize it.

## When to use

Use it in place of `Monitor` while an item is selected on the canvas.

- Not for the picture while nothing is selected: use `Monitor`.
- Not for a page's frames and selection in manga: use `MangaPage`.

## How it works

- The selection, its outline and its handles always paint over everything else on the stage, so a title or picture a page lays on the frame as `children` sits under the box, never hiding it.
- `box` is the item's place and size in percent of the frame; past the frame's edges it shows dimmed.
- `image` and `imageStyle` draw the item; `ratio` is the frame's (default `16 / 9`, a number or `'9 / 16'`); `height` the stage's.
- `fill` takes the column's height instead: the frame of `ratio` is as large as fits and centred, on the monitor's ground and with its corners, exactly where a Monitor with the same `ratio` draws it, so the editor swaps one for the other as an item is selected without the frame moving. An item that reaches past the frame (a punch-in) is shown whole: the frame scales down just enough for the whole box and its handles, offset so the box sits centred; an item inside the frame leaves the frame exactly the monitor's.
- The stage is flat, as the monitor is: no surface, edge, radius or padding of its own. The frame has the monitor's ground and corners, the handles and guides show the selection, and the part of an item outside the frame fades into the editor's ground (`stage-outside`), so the empty space around the frame looks as it did before anything was selected.
- `onBox(box)` makes the box movable: it is called with each new box.
- `guides` (title-safe, an effect's area) and `region` (the area an edit works on, with its label) are Monitor's own, so the canvas shows them the same way whether an item is selected or not.
- Everything over the picture (guides, the region, children) is placed in the frame's box, in percent of the frame, whatever the frame's shape: a 9:16 short in a wide stage keeps its guides on the picture.
- With `onBox`, the box can be dragged to move it, and each handle resizes it from its own edge or corner (never below 1%); `onBox` gets each new box as it moves, and the new position is said when the drag ends.
- `picks` with `onPick` lets the picture be clicked, as editors do on their program monitor: the page passes the items under the playhead, topmost first, each with its `box` in percent of the frame. A click takes the topmost one under the pointer; a click again where the selected one is takes the one beneath it, and round to the top; a click where none is — the ground around the frame, or a part of the frame nothing covers — calls `onPick(null)`. Hovering outlines what a click would take, with its name, so the one beneath shows before it is taken. A double-click on an `editable` pick calls `onEdit` (a title's words), even when its first click swapped the Monitor for a CanvasStage. On a CanvasStage the selected box keeps its drag: only a click that does not move it picks.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `image` | `string` |  | The selected item's picture. |
| `imageStyle` | `string` |  | CSS for the picture inside its box, e.g. from `Sakuga.cropStyle`. |
| `alt` | `string` |  | Names the item's picture; decorative without it. |
| `box` | `Box` |  | The item's place and size, in percent of the frame; past the frame's edges it shows dimmed. |
| `box.x` | `number` | required |  |
| `box.y` | `number` | required |  |
| `box.w` | `number` | required |  |
| `box.h` | `number` | required |  |
| `ratio` | `number \| string` |  | The frame's shape (default `16 / 9`): 16 / 9, '9 / 16' or '16:9'. |
| `height` | `number` |  | The stage's height in px. |
| `fill` | `boolean` |  | Takes the column's height instead of `height`: the frame of `ratio` as large as fits and centred, exactly as a Monitor with the same `ratio` draws it. |
| `label` | `string` |  | Names the item for screen readers, and the box when it can be moved. |
| `guides` | `object[]` |  | As on Monitor: title-safe or an effect's area, in percent of the frame; accent for the selected one. |
| `guides[].x` | `number` | required |  |
| `guides[].y` | `number` | required |  |
| `guides[].w` | `number` | required |  |
| `guides[].h` | `number` | required |  |
| `guides[].accent` | `boolean` |  |  |
| `region` | `object` |  | As on Monitor: the area an edit works on, with its label. |
| `region.x` | `number` | required |  |
| `region.y` | `number` | required |  |
| `region.w` | `number` | required |  |
| `region.h` | `number` | required |  |
| `region.label` | `string` |  |  |
| `children` | `ReactNode` |  | Drawn over the picture in the frame's box: position in percent of the frame. |
| `className` | `string` |  | Extra class on the root element. |
| `onBox` | `(box: Box) => void` |  | Makes the box one Tab stop: arrows move it a percent, Shift and an arrow resize it. Called with the new box. |
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
import { useState } from 'react';
import { CanvasStage } from '@anicanon/sakuga/anicanonkit';

export function PlaceLayer({ art }: { art: string }) {
  const [box, setBox] = useState({ x: 20, y: 15, w: 50, h: 60 });
  return <CanvasStage image={art} box={box} onBox={setBox} height={320} label="Bruce" />;
}
```

## Accessibility

The selection is a group named by `label` (default "Selected item") and described by its position and size. With `onBox` it is an application (a "movable item"), so a screen reader in browse mode hands it the arrows, and one Tab stop: arrows move it a percent and Shift with an arrow resizes it from its right or bottom edge, each change said aloud. The handles are for the pointer, dragged to resize, and are hidden; dragging the box moves it as the arrows do. With `onPick`, Escape on the selected box clears the selection; a click on the box that was not a drag takes the pick beneath it, and a click on its dimmed part past the frame does nothing.

Used on: Web
Version: 1.4
