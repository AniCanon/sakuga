# CutRow

CutRow is one cut (or video, or production) in a CutSheet.

## When to use

Use it for one cut, video or production as a row in a `CutSheet`, its cells in column order, banded while it is open beside the sheet.

- Not for a row outside a sheet: use `ListRow`.
- Not for the cut number and its approval: use `CutCell`.
- Not for a row on Story: use `EntityRow`.

## How it works

- Its children are the cells, in column order. `selected` bands the row (the cut open beside the sheet); `changed` puts a bar in the margin when it changed since you last read it; `span` makes one cell run under the row's columns (a Timesheet under its cut).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `selected` | `boolean` |  | Bands the row: the cut open beside the sheet. |
| `changed` | `boolean` |  | A bar in the margin: the row changed since you last read it. |
| `span` | `boolean` |  | One cell runs under the row's columns (a Timesheet under its cut). |
| `children` | `ReactNode` |  | The cells, in column order. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { CutRow } from '@anicanon/sakuga/anicanonkit';

export function CutRowExample() {
  return (
    <CutRow selected span>Two videos: she steps out, then the smoke clears.</CutRow>
  );
}
```

## Accessibility

Not focusable; a table row whose children each become a cell (a plain element takes the cell role unless it has its own; a component such as CutCell, or text, is wrapped in one), read in column order. A `selected` or `changed` row starts its first cell with "Selected" or "changed", said but not shown.

Used on: Web
Version: 1.0
