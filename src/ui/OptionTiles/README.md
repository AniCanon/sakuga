# OptionTiles

OptionTiles is the Studio's picker: a grid of tiles, each an AniCanon icon over a short name, for shot type, angle, depth, movement, mood, lighting, weather, effects and frame format.

## When to use

Use it for a choice that is clearer seen than read: Studio's direction pickers (shot, angle, lighting) as tiles, and with `size="lg"` the first choice of a flow, a pack or a plan as cards.

- Not for a short list of plain words: use `Select`.
- Not for two to four views of the same thing: use `SegmentedControl`.
- Not for one setting on or off: use `Switch`.
- Not for one thing among many, with pictures and search: use `Picker`.

## How it works

- Every option keeps its own drawn icon (`shot-closeup`, `lighting-neon`, `movement-dolly-in`…). Auto uses `auto`.
- One choice by default; `multiple` for effects. Tapping the chosen tile again clears it back to Auto.
- With one choice, the selection ring slides to the new tile on `motion-base`; a tile sinks on press.
- With sound on and one choice, a new tile plays the choose sound (README · Sound).
- Put a `help` on every field: a bold first line saying what it controls, then examples. It shows through FieldHelp.
- Pass `note` with the chosen option's one-line description, so the creator learns what it does.
- 4 columns for long lists, 3 for short ones.

### Large: choice cards

- `size="lg"` turns each option into a card with `icon`, `label`, `description`, `footnote` and an optional `badge`. An option that sets a price passes `cost` ("~10 a second"), shown under the description. `amount` and `cost` are neutral: a string, or `{ value, mark, label }` with a mark before the value and words read after it. The core knows no unit: AniCanon's fragments are AniCanonKit's `SpendTiles`, which takes the same options with `amount` and `cost` as strings and draws the fragment mark. Use it for the first choice of a flow (how to make something), three to four cards, with the chosen option's form directly below on the same screen.

**Ways in:** large tiles whose options carry `href` (or `onClick`) are links to pages, not a choice: the same card with its icon, name and one line, no ring and no chosen state, read as a group of links named by `label`. Use it for the ways to start making something (Studio home's "Create in EBA": Episode, Short, Manga, Still, Character), up to five across.

- An option with `disabled` (a plan that is not open yet, with a "Coming soon" `badge`) dims and cannot be chosen.

**Fragments packs and plans** use `SpendTiles` and pass `image` (the pack's or plan's own art: Spark, Bloom and Cascade grow from one flame to an orbit; Creator and Studio have their own) and `amount` (the fragments it gives, "24,990"), which is the card's headline with the mark. `cost` stays what an option charges, never what it gives. The art stands on its own stage above the name, and the chosen card's art comes forward a little. With `columns={1}` (a phone's sheet) the art sits beside the words. Put the price in `description` ("$24.99 · never expires") and on the action ("Buy Bloom · $24.99").

**A scene picture** fills the top of the tile instead: pass `art="fill"` with each option's `image`, and the picture runs edge to edge above the name, cropped to 3:2, its top corners following the tile's. The chosen ring is drawn over the picture, so the choice still reads. Use it when the picture shows what the choice means, such as who lives in a series (people, animal people, creatures), and only with pictures the creator has approved, never stand-ins. With `columns={1}` the picture stays on top, cropped to 2:1. When a picture's subject sits off centre, give that option `imagePosition` (CSS object-position, as on `Thumb`, such as `"30% 0%"`) so both crops keep it.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | The choice's label, over the tiles; it names the group. |
| `id` | `string` |  | The label's id, which names the tiles. |
| `options` | `TileOption[]` | required | The tiles, in order. |
| `options[].value` | `string` | required | What choosing it returns through `onChange`. |
| `options[].label` | `string` | required | Its name, under its icon or on its card. |
| `options[].href` | `string` |  | Large tiles: where it goes. With `href` or `onClick` on the options the tiles are ways in (links to pages), not a choice: no chosen state, and `value` on the tiles is not needed. |
| `options[].onClick` | `MouseEventHandler<HTMLElement>` |  | With ways in: runs on a press, for a tile with no `href`. |
| `options[].icon` | `IconName` |  | The AniCanon icon over its name. |
| `options[].description` | `string` |  | Large tiles: a line on what it is or does. |
| `options[].image` | `string` |  | Large tiles: the thing's own art on a stage above its name (a Fragments pack or plan). |
| `options[].imagePosition` | `string` |  | Where the picture's subject sits, as CSS object-position ("30% 0%"), so the crop keeps it; the centre when left out. The same as Thumb's imagePosition. |
| `options[].amount` | `string \| ButtonTrailing` |  | Large tiles: what it gives, set as the headline, e.g. "24,990"; as a ButtonTrailing it takes a mark before it and words read after it. Fragments: AniCanonKit's SpendTiles. |
| `options[].cost` | `string \| ButtonTrailing` |  | Large tiles: what choosing it charges, under the description, e.g. "~10 a second"; the same shape as amount. |
| `options[].disabled` | `boolean` |  | Shown dimmed and cannot be chosen (a plan not open yet). |
| `options[].badge` | `string` |  | Large tiles: a short label in the card's corner ("Most chosen"). |
| `options[].footnote` | `string` |  | Large tiles: a quiet line at the card's foot. |
| `value` | `string \| string[]` |  | Not needed when the tiles are ways in (options with href). |
| `multiple` | `boolean` |  | Several can be chosen; `value` is then a list. |
| `size` | `'lg'` |  | lg: choice cards with description, footnote and badge. |
| `columns` | `number` |  | Tiles to a row. |
| `art` | `'stage' \| 'fill'` |  | Large tiles with `image`: "fill" lays each option's picture across the top of its tile, edge to edge, cropped to 3:2 (a scene, such as who lives in a series); left out, the image is art on a stage (a Fragments pack). |
| `iconSize` | `number` |  | Each tile's icon size in px. |
| `note` | `string` |  | The chosen option's one-line description, under the tiles, so the creator learns what it does. |
| `help` | `object` |  | An ⓘ beside the label that explains the choice (a FieldHelp). |
| `help.title` | `string` | required |  |
| `help.text` | `ReactNode` | required |  |
| `helpOpen` | `boolean` |  | Shows the help's tip open (a board). |
| `ariaLabel` | `string` |  | Names the group when there is no label. |
| `onChange` | `(value: string) => void` |  | Called with the value chosen (or unchosen, with `multiple`). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { OptionTiles } from '@anicanon/sakuga/ui';

export function ShotType() {
  const [shot, setShot] = useState('Auto');
  return (
    <OptionTiles
      label="Shot type"
      value={shot}
      onChange={setShot}
      options={[
        { value: 'Auto', label: 'Auto', icon: 'auto' },
        { value: 'Close-up', label: 'Close-up', icon: 'shot-closeup' },
        { value: 'Medium', label: 'Medium', icon: 'shot-medium' },
        { value: 'Wide', label: 'Wide', icon: 'shot-wide' },
      ]}
    />
  );
}
```

## Accessibility

Ways in (options with `href`) are a group named by `label`, each tile a link (a button with `onClick` alone) read as its name and description. With one choice the tiles are a radio group: one Tab stop, on the chosen tile (the first when none is), so a Dialog opens on the chosen tile; the arrows move to a tile and choose it, Home and End go to the first and last, and an option's `disabled` is skipped. With `multiple` each tile is a toggle button: Tab focuses each one, and Enter or Space picks it. A screen reader hears the group, named by the words of `label` (or `ariaLabel`), then each tile with its name, as a radio ("checked" when chosen) or with `multiple` a toggle button ("pressed"), large tiles adding the badge, the amount or cost with its label ("24,990 fragments"), the description and the footnote, with icons and art hidden.

Used on: Web, iOS, Android
Version: 1.3
