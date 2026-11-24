# Field

Field puts the form's label over a control that does not carry its own (a segmented control, chips, a group of options), with an optional hint under it.

## When to use

Use it for the label and hint over a control that has none of its own: a segmented control, chips, a group of options, swatches.

- Not for typed words, which carry their own label: use `TextField`.
- Not for a list choice, which carries its own label: use `Select`.
- Not for explaining a field on hover or focus: use `FieldHelp`.
- Not for a label over a strip or a group inside a panel: use `SectionHeader`.

## How it works

- It uses the same label and hint as `TextField` and `Select`, so a form reads as one column whatever the control.
- `optional` adds "· optional" to the label.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | The label over the control; names the group. |
| `hint` | `string` |  | A quiet line under the control; describes the group. |
| `optional` | `boolean` |  | Adds "· optional" to the label. |
| `id` | `string` |  | The label's id; the group is named by it. One is made without it. |
| `children` | `ReactNode` | required | The control: a segmented control, chips, a group of options. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Chip, Field } from '@anicanon/sakuga/ui';

export function FieldExample() {
  return (
    <Field label="Traits" optional>
      <Chip.Group label="Traits"><Chip selected>Calm</Chip><Chip>Witty</Chip><Chip>Stern</Chip></Chip.Group>
    </Field>
  );
}
```

## Accessibility

A group named by its `label` and described by its `hint`, so the control inside is announced within it, with "optional" read as part of the name.

Used on: Web, iOS, Android
Version: 1.0
