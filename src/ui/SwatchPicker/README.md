# SwatchPicker

SwatchPicker chooses a colour by eye: round swatches, the chosen one ringed.

## When to use

Use it for a colour chosen by eye from round swatches: a skin tone, a creature's coat (Tabby, Calico).

- Not for a choice that reads best as an icon over a name: use `OptionTiles`.
- Not for a short list of plain words: use `Select`.
- Not for any colour, typed or picked from the whole range (a brand colour): use `ColorPicker`.
- Not for adjusting colour in the editor: use `SliderRow`.

## How it works

- Skin tone, a creature's coat.
- Options are `{label, color}`; each swatch is named by its label for screen readers.
- With sound on, a new swatch plays the choose sound (README · Sound).
- `labels` writes the names under the swatches (coats, where the names matter: Tabby, Calico).
- Named swatches line up from the start of the row, whatever their count: each column is as wide as its longest name, never narrower than a swatch, and a long name wraps only when the row runs out of room. `columns` sets how many sit in a row before it wraps (7 when it isn't set).
- A patterned option passes `pattern` (`stripes`, `patches`, `spots`) and the `marks` colours drawn over its base.
- Put it in a `Field` with its label; a free description can follow it in the same field.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | Names the choice; it labels the group. |
| `value` | `string` |  | The value chosen. |
| `labels` | `boolean` |  | Each swatch's name under it. |
| `columns` | `number` |  | Swatches to a row. |
| `options` | `SwatchOption[]` | required | The swatches, in order. |
| `options[].label` | `string` | required | The colour's name ("Ash brown"). |
| `options[].value` | `string` |  | What choosing it returns; the label without it. |
| `options[].color` | `string` | required | Its base colour, as CSS. |
| `options[].pattern` | `'stripes' \| 'patches' \| 'spots'` |  | A coat's pattern over the base: stripes, patches or spots. |
| `options[].marks` | `string[]` |  | The pattern's colours, as CSS. |
| `onChange` | `(value: string) => void` |  | Called with the value chosen. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { SwatchPicker } from '@anicanon/sakuga/ui';

export function SkinTone() {
  const [skin, setSkin] = useState('Light');
  return (
    <SwatchPicker
      label="Skin"
      value={skin}
      onChange={setSkin}
      options={[
        { label: 'Porcelain', color: '#f6e3d8' },
        { label: 'Fair', color: '#efd2bd' },
        { label: 'Light', color: '#e3b996' },
        { label: 'Medium', color: '#c99470' },
      ]}
    />
  );
}
```

## Accessibility

A radio group named by `label` and one Tab stop: arrows move to a swatch and choose it, each a radio named by its option's label and "checked" when chosen. The visible names and pattern drawings are hidden.

Used on: Web, iOS, Android
Version: 1.1
