# NumberField

NumberField is a number you type or step a unit at a time: its name, a step down, the value with its unit, a step up.

## When to use

Use it for a number where one unit matters, typed or stepped a unit at a time: a 1px border, 2° of rotation, a font size.

- Not for a feel such as strength or mix, where the readout is the point: use `SliderRow`.
- Not for nudging a cut's in or out a frame at a time: use `TrimFrames`.
- Not for words: use `TextField`.

## How it works

- Use it, not a slider, when one unit matters: a 1px border, 2° of rotation, a font size. A slider is for a feel (strength, mix), where the readout is the point.
- `unit` follows the value ("px", "°", "pt"). Steps call `onStep` with −1 or +1; without `onStep` the buttons only draw, and `readOnly` turns them off.
- What is typed goes to `onChange` as a number (the unit dropped, kept inside `min` and `max`) on Enter or leaving the field, and an arrow pressed after typing hands it over first. Without `onChange`, the field goes back to `value`.
- A number `value` is shown the locale's way ("1.5", "1,5" in pt-BR; README · Words), never grouped. A typed comma reads as the decimal point; where the locale writes decimals with a comma, a typed point is a thousands separator and falls away.
- In a narrow inspector stack one per row; two may share a row only when both fit at their longest value.
- The value box is as wide as the value and its unit ("24.99 USD"), 72 px at least, and follows what is typed. A label longer than its room wraps onto a second line instead of running under the steps.
- The value is a spinbutton: Up and Down step it through `onStep`, as the buttons do. `min` and `max` give the range a screen reader is told.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | The field's label; names it. |
| `value` | `string \| number` | required | The number shown, with its unit if it carries one ("0.5 s"). |
| `unit` | `string` |  | Shown after the value: a symbol on the number ("px", "°", "%"), a word after a space ("days", "fps"). |
| `onStep` | `(delta: -1 \| 1) => void` |  | Called with −1 or +1. Without it the buttons only draw. |
| `onChange` | `(value: number) => void` |  | Called with the typed number (unit dropped, inside min and max) on Enter or leaving the field; without it what is typed goes back to value. |
| `readOnly` | `boolean` |  | The value can't change: the buttons are off too. |
| `id` | `string` |  | The input's id; one is made without it. |
| `className` | `string` |  | Extra class on the root element. |
| `min` | `number` |  | The range a screen reader is told. |
| `max` | `number` |  | The largest it can be. |

## Example

```tsx
import { NumberField } from '@anicanon/sakuga/ui';

export function NumberFieldExample() {
  return (
    <NumberField label="Price" value="24.99" unit="USD" />
  );
}
```

## Accessibility

A spinbutton named by `label` that takes typing, handed over on Enter or leaving it: Up and Down step it through `onStep` and its value is read with its unit, and `min` and `max` give its range. Tab also reaches the "Less" and "More" buttons on either side ("More duration"), whose steps are said aloud.

Used on: Web
Version: 1.1
