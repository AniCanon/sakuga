# Cropper

A crop of a picture: a circle, a square or a box of the shot's own shape, moved over the whole picture.

## When to use

Use it to choose the part of a picture that is kept: an avatar from a face sheet or a variant, a logo's square.

- Not for showing a picture already cut: use `Thumb` with `cropStyle`.
- Not for choosing among whole pictures: use `Thumb` toggles.
- Not for a file being added: use `DropZone`.

## How it works

- The picture never moves, so every part of it stays in sight while you choose, which matters when it holds several faces. Outside the circle the picture dims, and only the picture.
- Press a region (a face of a sheet) and the circle lands on its centre, at its size now; press where there is no region and it moves there. Then drag to fine-tune. Press inside the circle to drag it from where you hold it.
- The whole circle and its handle stay inside the stage at every position and size, on a phone's single face too.
- The handle on its lower-right edge, the wheel or a trackpad pinch, two fingers, the slider, or its − and + size it. It is always sized about its centre.
- A face sheet's avatar has a fixed size (`min` = `max`): a face fills its sixth of the sheet, so any closer cuts the face and any wider takes in the head beside it. The regions come from the sheet's 3×2 grid, each centred on its cell and 0.6 of the way down it, with a `size` of 0.36 of the sheet's height, so the circle stays inside its own face at every place it lands.
- `Sakuga.cropStyle(value, aspect)` is the `imageStyle` that shows the same square in a `Thumb`, `CastAvatar`, `MentionChip` or a `CharacterCard` avatar, at any size. Previews use it, so they show exactly what will be cut.
- `shape="rect"` frames a shot on a storyboard sheet: the box keeps `ratio` at every size, may reach the picture's edges (a shot can be the whole panel) and sits on a margin of plate so its ring and handle show there too. It grows from its lower-right corner with the opposite corner held. Its `value` is `{ x, y, width, height }`, its top-left corner and size as fractions of the picture. A press on a region takes the region's crop whole, so a sheet's panels as `regions` fit the box to the panel pressed (Choose by hand), and `view` set to one panel keeps it inside that panel (Adjust).
- `Sakuga.cropStyle(value, aspect)` previews a box too, in a `Thumb` of the box's ratio.
- Nothing snaps: the circle or box stays where it is let go.
- The picture can't be dragged out of the page, and the stage takes the touch, so the page doesn't scroll under a finger.

### Differs from the design

- The port draws what the design means where the design has a defect, until a version carries the fix.
- The design says Cropper's words in English: its role name, its name without a label, the zoom buttons and slider, both hints and what a move says are written in the component, outside the table of words. The port says them through the table: `crop`, `cropRole`, `zoom`, `zoomOut` (beside StoryMap's `zoomIn`), `cropHint`, `cropHintFixed`, `cropZoom` and `cropRegionZoom`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `image` | `string` | required | The picture, shown whole. |
| `alt` | `string` |  | Names the picture. |
| `aspect` | `number` | `16 / 9` | The picture's width over its height. |
| `value` | `V` |  | The centre as fractions of the picture's width and height, and the side of the square it cuts as a fraction of its height: what the server cuts. With `shape="rect"`, a `RectCrop`: the box's top-left corner and its size. |
| `onChange` | `(value: V) => void` |  | Without it the crop is shown, not moved. Gets the value in the same form. |
| `min` | `number` | `0.1` | The closest and the widest size. Equal, the size is fixed: there is no handle, zoom row, wheel, pinch or + and −. |
| `max` | `number` | `1` | The closest and the widest `size`. Set them from what is being cropped (one face, not the sheet), so zoom can't close in past a face. Equal, the size is fixed: there is no handle, zoom row, wheel, pinch or + and −, only moving. |
| `regions` | `CropRegion<V>[]` | `[]` | Places to jump to: a press inside a region's `area`, 1 to 9, or Home for the first. Each jump lands on the region's centre at the size the circle has now (a box takes the region's crop whole), and is said by its label. |
| `regions[].label` | `string` | required | The region's name, said when the crop lands on it ("Face 3 of 6"). |
| `regions[].crop` | `V` | required | Where the crop lands when the region is chosen: a `CropValue`, or with `shape="rect"` a `RectCrop`. |
| `regions[].area` | `CropView` |  | The part of the picture a press chooses it from. |
| `regions[].area.x` | `number` | required | The area's left edge, as a fraction of the picture's width. |
| `regions[].area.y` | `number` | required | The area's top edge, as a fraction of the picture's height. |
| `regions[].area.w` | `number` | required | Its width, as a fraction of the picture's width. |
| `regions[].area.h` | `number` | required | Its height, as a fraction of the picture's height. |
| `view` | `CropView` |  | A region shown alone (a phone shows one face of a sheet); the circle stays inside it. |
| `view.x` | `number` | required | The area's left edge, as a fraction of the picture's width. |
| `view.y` | `number` | required | The area's top edge, as a fraction of the picture's height. |
| `view.w` | `number` | required | Its width, as a fraction of the picture's width. |
| `view.h` | `number` | required | Its height, as a fraction of the picture's height. |
| `shape` | `'circle' \| 'square' \| 'rect'` |  | Circle by default: an avatar shows round. rect: a box of the shot's own shape, grown from its corner with the opposite corner held. |
| `ratio` | `number` |  | With `shape="rect"`: the box's width over its height, 16 / 9 by default. |
| `label` | `string` |  | The crop's name. |
| `hint` | `string` |  | The line under the crop. |
| `zoomLabel` | `string` |  | The zoom slider's name. |
| `describe` | `(value: V, region: CropRegion<V> \| null) => string` |  | What is said when a move ends; by default the region and the zoom. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { Cropper, type CropValue } from '@anicanon/sakuga/ui';

export function AvatarCrop({ sheet }: { sheet: string }) {
  const [crop, setCrop] = useState<CropValue>({ x: 0.5, y: 0.4, size: 0.36 });
  return <Cropper image={sheet} aspect={16 / 9} value={crop} onChange={setCrop} label="Kiko's avatar" />;
}
```

## Accessibility

An application named by `label`, described by `hint`, and one Tab stop. The arrows move the circle a tenth of its width, and with Shift a whole width. + and − zoom (not at a fixed size), 1 to 9 jump to a region's centre, and Home goes to the first. When a move, a zoom or a jump ends, the page's live region says where it is ("Face 3 of 6, zoom 1.3 times", or "Face 3 of 6" at a fixed size); a drag is never spoken while it runs. The slider, when there is one, is a named slider, and − and + are buttons. In forced colours the circle and its handle keep a Highlight ring.

Used on: Web, iOS, Android
Version: 1.2
