# Thumb

Thumb is a picture in a frame: cover-cropped, 6 px corners, `selected` adds the accent ring, `muted` greys a rejected take.

## When to use

Use it for a picture in a frame: a take (`selected`, or `muted` when rejected), a library item, a panel to pick, a frame not made yet.

- Not for an episode, short or manga issue a viewer opens: use `MediaCard`.
- Not for a person's portrait with their name and role: use `CastAvatar`.
- Not for a manga page at its trim: use `MangaPage`.
- Not for one look on white with its occasion: use `LookPlate`.
- Not for the place or backdrop being made, on the left of its flow: use `PlaceCard`.
- Not for a whole page or list with nothing in it yet: use `EmptyState`.
- Not for a character on the cast page: use `CastCard`.

## How it works

- Give it `width` and `height`, or leave them out for a full-width 16:9 frame (`ratio` changes it). A character's portrait is `ratio="9 / 16"`, standing on white seamless; a creature's is `16 / 9`. Never a portrait in another ratio: the frame would crop its head or feet.
- `imageStyle` moves the crop (`object-position:30% 40%`).
- `figure` lays a cut-out over the picture (a character on a place). Prefer a real render.
- `lightMap` gives the picture light on art, as on `MediaCard`: its own highlights glow where the pointer is. It is on wherever there is a map and never on `muted`; `light={false}` turns it off. `ListRow` and `PlaceCard` pass `lightMap` to their picture. A player's poster is a `Thumb` with its map before play, and `light={false}` the moment the video plays.
- `onClick` makes it a toggle button (`aria-pressed` follows `selected`) that sinks on press; the accent ring grows in on `motion-fast`.
- `title` and `meta` caption it under the picture (a library item, a panel to pick). The caption wraps at the frame's width and never widens it, so a long meta ("Not with storyboard frames") never pushes the frames beside it away.
- `href` makes it a picture card that opens what it shows (a place on the Places page, a place in Motion). The title is the link and its hit area covers the whole card, so the picture opens it too; under the pointer the picture leans in and the title underlines, a press settles the frame, and keyboard focus rings the card. An action of its own (`action`, or a child with `slot="action"`: Shoot it, Try again) sits at the caption's end as its own control, never inside the link. Other children still lay over the picture (a Badge). `href` and `onClick` don't go together: a card goes somewhere, a toggle chooses.
- With `title` and no `href`, an `action` (or a child with `slot="action"`) sits over the frame's top corner, as DropZone's Remove sits on its picture, on a small `media` disc that reads on any picture, with a press area a little past the disc: a frame's Remove in Studio's Frames row (an `IconButton`, `variant="media"`, `close`, named "Remove {title}"). It comes after the frame, never inside it, so a press on the picture still does what `onClick` says and the action is its own control.
- `placeholder` is a frame that is not made yet: a flat, quiet well naming what will fill it ("Board drawn when you approve the cut"), with no outline; its fill shows on any surface, in either theme. Never fake a picture.
- `drawing` with `placeholder` is a frame whose picture is being made (a banner drawing): the app's loader at the frame's centre with the placeholder's words under it, on the canvas colour. Never a badge over an empty frame; `Loader` unless the app sets one, AniCanon's mark in AniCanon. When the picture comes, pass `image` and it develops in.
- `placeholderIcon` sets a silhouette above those words, on the canvas colour, so the frame never reads as empty: the character's age figure (`age-adult`, `age-teen`; `anthro-age-*` and `creature-age-*` in those worlds) where a portrait or a look will be. The age figures are drawn alike for everyone; never a `body-*` build, which is drawn as a woman or a man. It is a stand-in, not a picture, so the words still say what fills it; `placeholder=""` drops them on a frame too small to hold them.
- A new `image` never cuts: the old picture stays until the new one has loaded, then the new one develops in over it (`motion-develop`), as a look is worn or a portrait drawn (README · Motion · Between states).
- `radius="none"` sits it flush inside other art (a split view, a loupe of frames); `radius="lg"` for a cover.
- Mount it; never draw `.sk-thumb` by hand.
- `fit="contain"` shows the whole picture (a sheet); `paper` sets it on the white a sheet is drawn on, in either theme. `radius` is `none`, `md`, `lg`, `xl` or `full` (a round crop of a face). Every picture develops in once as it arrives (`motion-develop`), so `develop` adds nothing; it stays so older pages that pass it still work.

**Adds itself.** `onInsert` puts Insert on the card's frame, bottom right, shown on hover, on keyboard focus and while the card is selected (always on a touch screen); a double-click or Enter inserts at the playhead, a press or Space still selects. `dragData` (`kind`, `length` in seconds) makes it drag onto a `Timeline` with `onDrop`. Nothing to scroll to: the card is the way in, so a panel never ends in one Insert button for the whole grid.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` |  | Caption under the picture. |
| `onInsert` | `() => void` |  | Adds it to the cut: Insert on the card (on hover, focus and when selected), a double-click or Enter inserts at the playhead. |
| `dragData` | `InsertData` |  | Makes the card drag onto a Timeline with onDrop: `kind` is the track kind it lands on, `length` in seconds draws where it lands. Handed back to onDrop. |
| `dragData.kind` | `string` |  |  |
| `dragData.length` | `number` |  |  |
| `dragData.label` | `string` |  |  |
| `meta` | `string` |  | A quiet line under the title. |
| `placeholder` | `string` |  | A frame not made yet, naming what will fill it. |
| `drawing` | `boolean` |  | With placeholder: its picture is being made; the app's loader at the frame's centre, the words under it. |
| `placeholderIcon` | `IconName` |  | With placeholder: a silhouette above the words, on the canvas colour: the character's age figure (age-adult, anthro-age-*, creature-age-*), never a body-* build. |
| `radius` | `'none' \| 'md' \| 'lg' \| 'xl' \| 'full'` |  | The frame's corner: none, md, lg, xl or full; the small corner (radius-xs) without it. |
| `fit` | `'cover' \| 'contain'` |  | contain: the whole picture, e.g. a sheet. |
| `paper` | `boolean` |  | The white a character sheet is drawn on. |
| `develop` | `boolean` |  | Kept so older pages still work: every picture already develops in once as it arrives. |
| `image` | `string` |  | The picture. |
| `imageStyle` | `string` |  | CSS, e.g. "object-position:30% 40%". |
| `lightMap` | `string` |  | The picture's baked light map: it glows with its own highlights under the pointer (light on art). Never on muted. |
| `light` | `boolean` |  | On wherever there is a lightMap; false turns it off (a poster the moment its video plays). |
| `figure` | `string` |  | A cut-out laid over the picture (a character on a place). |
| `figureStyle` | `string` |  | CSS placing the cut-out. |
| `width` | `number \| string` |  | The frame's width, in px or CSS. |
| `height` | `number \| string` |  | The frame's height, in px or CSS. |
| `ratio` | `string` |  | The frame's aspect ratio, as CSS ("16 / 9"), when it takes its width from its column. |
| `selected` | `boolean` |  | Rings the frame: the one chosen; with `onClick` it reads pressed. |
| `muted` | `boolean` |  | Greys a rejected take. |
| `alt` | `string` |  | Names the picture; decorative without it. |
| `onClick` | `MouseEventHandler` |  | Makes it a toggle button; aria-pressed follows selected. |
| `label` | `string` |  | The button's name when the picture's alt does not say it; with href, the link's name when the title does not say it. |
| `href` | `string` |  | A picture card that opens what it shows: the title is the link and its hit area covers the card. Never with onClick. |
| `action` | `ReactNode` |  | An action of its own (or slot="action"): outside the link with href; with only a title, over the frame's top corner on a media disc (a frame's Remove). |
| `children` | `ReactNode` |  | Drawn over the picture: a Badge, a play mark. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Thumb } from '@anicanon/sakuga/ui';

export function ThumbExample() {
  return (
    <Thumb placeholder="Board drawn when you approve the cut" width={220} height={124} />
  );
}
```

## Accessibility

With `onInsert`, Enter or a double-click inserts (the item is described "Enter or a double-click inserts it at the playhead; drag it onto the timeline to place it") and Insert is its own button named "Insert" and the name. A picture whose alt is `alt` (empty, so hidden, by default), with "selected" and "rejected" (`muted`) said after it, and with `title` or `meta` a figure captioned by them. With `onClick` it is a toggle button that Tab reaches and Enter or Space presses, "pressed" when `selected`: name it with `label` (or `alt`), since without one it has no name. With `href` its title is a link named by the title (or `label`), the meta read after it, and its action a separate control after the link. Without `href` an action is a separate control after the frame, before its caption. In forced colours a selected frame keeps its ring, in Highlight, and a placeholder keeps a hairline edge.

Used on: Web, iOS, Android
Version: 1.7
