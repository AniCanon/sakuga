# ColorPicker

ColorPicker chooses any colour: a field for saturation and brightness, a hue track and the hex.

## When to use

Use it when the colour can be any colour: a brand colour, a design's own colour.

- Not for a colour chosen from a fixed set (skin, coat): use `SwatchPicker`.
- Not for adjusting colour in the editor: use `SliderRow`.

## How it works

- A brand kit's colours, a design's own colour.
- `value` and `onChange` speak hex (`#1f6feb`). The picker keeps the hue while the colour passes through grey, black or white.
- `presets` are the colours the design or kit already has, as swatches under the field (`presetsLabel`, default "Colours in use").
- `fromPicture` are the colours read from an uploaded picture, such as a logo, as a second row (`pictureLabel`, default "From the picture").
- Typing a full hex (3 or 6 digits, with or without `#`) moves the field and track to it.
- For a compact form, open it in a `Popover` from a swatch or a field.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | Names the picker; the hex field is named by it too. |
| `value` | `string` |  | Hex, "#1f6feb". |
| `onChange` | `(hex: string) => void` |  | Called with hex as it changes. |
| `presets` | `object[]` |  | The colours the design or kit already has, as swatches under the field. |
| `presets[].label` | `string` | required |  |
| `presets[].color` | `string` | required |  |
| `presetsLabel` | `string` |  | Default "Colours in use". |
| `fromPicture` | `object[]` |  | The colours read from an uploaded picture, such as a logo, as a second row. |
| `fromPicture[].label` | `string` | required |  |
| `fromPicture[].color` | `string` | required |  |
| `pictureLabel` | `string` |  | Default "From the picture". |
| `id` | `string` |  | The hex field's id; one is made without it. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { ColorPicker } from '@anicanon/sakuga/ui';

export function BrandColour() {
  const [colour, setColour] = useState('#c2335f');
  return (
    <ColorPicker
      label="Brand colour"
      value={colour}
      onChange={setColour}
      presets={[{ label: 'Ink', color: '#0b0a10' }, { label: 'Paper', color: '#f6f1e7' }, { label: 'Sky', color: '#3b82c4' }]}
    />
  );
}
```

## Accessibility

A group named by `label`. The field is a slider named "Saturation and brightness" that speaks both; arrows move it 1% (10% with Shift), left and right for saturation, up and down for brightness. The hue track is a slider named "Hue" in degrees: arrows by 1 (10 with Shift), Page Up and Page Down by 30, Home and End. The hex field is a text field named by `label` and "hex". Presets and picture colours are radio groups (see SwatchPicker), the chosen one checked when it matches.

Used on: Web
Version: 1.0
