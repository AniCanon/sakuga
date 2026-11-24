# CutCell

CutCell is the cut number, with its approval: `approved` (filled check) or `waiting` (an empty ring).

## When to use

Use it for a cut's number with its approval, approved or waiting, and a short note under it such as the video it is (V3).

- Not for camera and timing notation: use `Shorthand`.
- Not for a state on a surface: use `Badge`.
- Not for a whole row of the sheet: use `CutRow`.

## How it works

- `note` adds a short line under it, such as the video it is (V3).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `number` | `string` | required | The cut's number ("C12"). |
| `state` | `'approved' \| 'waiting'` |  | Its approval: `approved` or `waiting`. |
| `stateLabel` | `string` |  | The state's words, read by screen readers. |
| `note` | `string` |  | A short line under the number. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { CutCell } from '@anicanon/sakuga/anicanonkit';

export function CutCellExample() {
  return (
    <CutCell number="2A" state="approved" />
  );
}
```

## Accessibility

Not focusable; the cut number and `note` read as text, and the approval is an image named by `stateLabel` ("Approved" or "Waiting for you").

Used on: Web
Version: 1.0
