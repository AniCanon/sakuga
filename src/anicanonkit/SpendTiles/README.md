# SpendTiles

`OptionTiles` whose large cards carry fragments: an option's `amount` (what a pack or plan gives, the card's headline) and `cost` (what choosing it charges, under its description), each with the fragment mark.

## When to use

Use it for a choice whose cards carry fragments: the Fragments packs and plans, and the first choice of a flow when each way costs something different.

- Not for a choice that costs nothing: use `OptionTiles`.
- Not for the action that spends them: use `SpendButton`.

## How it works

- It takes every `OptionTiles` prop, with `amount` and `cost` as strings. The core `OptionTiles` knows nothing of fragments; its `amount` and `cost` are neutral, and this is the part that fills them.
- `cost` is what an option charges, never what it gives; a pack's or plan's fragments are its `amount`.
- Put the money price in `description` ("$24.99 · never expires") and on the action ("Buy Bloom · $24.99"), never in `amount`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `options` | `(Omit<TileOption, 'amount' \| 'cost'> & { amount?: string; cost?: string; })[]` | required | As OptionTiles' options, with `amount` and `cost` in fragments. |
| `className` | `string` |  | Extra class on the root element. |
| `note` | `string` |  | The chosen option's one-line description, under the tiles, so the creator learns what it does. |
| `value` | `string \| string[]` |  | Not needed when the tiles are ways in (options with href). |
| `id` | `string` |  | The label's id, which names the tiles. |
| `onChange` | `(value: string) => void` |  | Called with the value chosen (or unchosen, with `multiple`). |
| `label` | `string` |  | The choice's label, over the tiles; it names the group. |
| `columns` | `number` |  | Tiles to a row. |
| `size` | `'lg'` |  | lg: choice cards with description, footnote and badge. |
| `multiple` | `boolean` |  | Several can be chosen; `value` is then a list. |
| `art` | `'stage' \| 'fill'` |  | Large tiles with `image`: "fill" lays each option's picture across the top of its tile, edge to edge, cropped to 3:2 (a scene, such as who lives in a series); left out, the image is art on a stage (a Fragments pack). |
| `iconSize` | `number` |  | Each tile's icon size in px. |
| `help` | `object` |  | An ⓘ beside the label that explains the choice (a FieldHelp). |
| `help.title` | `string` | required |  |
| `help.text` | `ReactNode` | required |  |
| `helpOpen` | `boolean` |  | Shows the help's tip open (a board). |
| `ariaLabel` | `string` |  | Names the group when there is no label. |

## Example

```tsx
import { useState } from 'react';
import { SpendTiles } from '@anicanon/sakuga/anicanonkit';

export function FragmentPacks() {
  const [pack, setPack] = useState('bloom');
  return (
    <SpendTiles
      label="Fragment packs"
      size="lg"
      value={pack}
      onChange={setPack}
      options={[
        { value: 'spark', label: 'Spark', amount: '9,990', description: '$9.99 · never expires' },
        { value: 'bloom', label: 'Bloom', amount: '24,990', description: '$24.99 · never expires', badge: 'Best value' },
        { value: 'cascade', label: 'Cascade', amount: '99,990', description: '$99.99 · never expires' },
      ]}
    />
  );
}
```

## Accessibility

OptionTiles' own: with one choice the cards are a radio group, one Tab stop that the arrows move through. A screen reader hears each card's name, the amount or cost as "24,990 fragments", the description and the footnote; the mark and art are hidden.

Used on: Web, iOS, Android
Version: 1.0
