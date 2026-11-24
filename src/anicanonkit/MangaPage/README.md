# MangaPage

MangaPage draws one page of an issue at its trim (1448 × 2048): its art once drawn, or its layout's frames before.

## When to use

Use it for one page of an issue at its trim: its art once drawn, its layout's frames before, or blank when it is not made yet, with a selection only on the editor's canvas.

- Not for the issue's pages as the reader turns them: use `IssueStrip`.
- Not for every page with its stage at once: use `PageWall`.
- Not for an issue on a shelf: use `MediaCard`.

## How it works

- Pass `image` for a drawn page, `frames` (in percent of the page) for one only laid out. A frame `drawing` or `waiting` says so inside it; `numbers` prints each frame's number (4.2).
- `selected` rings the page; `selection` puts one item (a panel, a balloon) under handles, in percent. Only the editor's canvas shows a selection.
- `title` and `meta` caption it under the page; on a spread the right page's caption takes `align="end"`.
- `blank` is a page not made yet, such as the back cover. Never fake art for a page that is not drawn.
- `mask` (percent) marks the area an edit redraws, on a page or a single panel's picture (`ratio` to its shape); `maskLabel` names it.
- In `slot="action"` a caption takes its menu button (Rename, Move, Delete).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `mask` | `Area` |  | The area an edit redraws, in percent. Slot: slot="action" beside the caption. |
| `mask.x` | `number` | required |  |
| `mask.y` | `number` | required |  |
| `mask.w` | `number` | required |  |
| `mask.h` | `number` | required |  |
| `maskLabel` | `string` |  | Names the masked area for screen readers and its caption. |
| `width` | `number` |  | The page's width in px; its height follows `ratio`. |
| `ratio` | `number` |  | Height over width; defaults to the B5 trim. |
| `image` | `string` |  | The drawn page. Without it the page shows its `frames` as laid out. |
| `frames` | `MangaFrame[]` |  | The page's frames, in percent of the page, for a page only laid out. |
| `frames[].number` | `string` |  | "4.2"; shown with `numbers`. |
| `frames[].state` | `'laid-out' \| 'drawing' \| 'waiting'` |  | A frame only laid out says nothing; `drawing` and `waiting` say so inside it. |
| `frames[].label` | `string` |  | Replaces "Drawing…" or "Waiting". |
| `frames[].x` | `number` | required |  |
| `frames[].y` | `number` | required |  |
| `frames[].w` | `number` | required |  |
| `frames[].h` | `number` | required |  |
| `numbers` | `boolean` |  | Prints each frame's number (4.2) inside it. |
| `selected` | `boolean` |  | Rings the page: the one open beside the wall or strip. |
| `blank` | `boolean` |  | A page not made yet, e.g. the back cover. |
| `selection` | `Area` |  | One item selected on the page, with handles, in percent. |
| `selection.x` | `number` | required |  |
| `selection.y` | `number` | required |  |
| `selection.w` | `number` | required |  |
| `selection.h` | `number` | required |  |
| `selectionLabel` | `string` |  | Names the selected item for screen readers. |
| `label` | `string` |  | Names the page for screen readers ("Page 4"). |
| `alt` | `string` |  | Describes the drawn page; decorative without it. |
| `title` | `string` |  | The caption under the page ("Page 4"). |
| `meta` | `string` |  | A quiet line under the title: its stage in words. |
| `align` | `'end'` |  | The caption's alignment: the right page of a spread reads from its outer edge. |
| `children` | `ReactNode` |  | Drawn over the page: lettering, an editor's overlay. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { MangaPage } from '@anicanon/sakuga/anicanonkit';

export function MangaPageExample() {
  return (
    <MangaPage blank label="Back cover, not made" title="Back" meta="Not made" />
  );
}
```

## Accessibility

Not focusable; read as one image named by `label`, `alt` or `title` (else "Page"), followed by "selected", how many frames are drawing or waiting, the area to redraw (`maskLabel`) and the item selected (`selectionLabel`), and with `title` or `meta` it sits in a figure captioned by them, where the `action` slot takes focus.

Used on: Web
Version: 1.0
