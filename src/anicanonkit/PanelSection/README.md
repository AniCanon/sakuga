# PanelSection

PanelSection is a labelled group of rows with its count on the right ("Changes 3").

## When to use

Use it for a labelled group of rows inside a Story panel, with its count on the right ("Changes 3").

- Not for the head of the panel itself: use `PanelHeader`.
- Not for a group outside Story, such as a faction in a list: use `SectionHeader`.
- Not for Studio's folded section with its current value: use `PanelRow`.
- Not for rows outside Story that open pages: use `List`.

## How it works

- Rows are `EntityRow`s. A short line after the rows goes in `slot="footer"`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | The group's heading. |
| `count` | `string \| number` |  | How many rows it holds, beside the heading. |
| `footer` | `ReactNode` |  | The line after the rows (as slot="footer"). |
| `children` | `ReactNode` | required | The rows, EntityRows; a short line after them as slot="footer". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { EntityRow, PanelSection } from '@anicanon/sakuga/anicanonkit';

export function PanelSectionExample() {
  return (
    <PanelSection label="Changes" count={3}>
      <EntityRow visual={{ kind: 'event', type: 'clue' }} name="A ticket stub" chip="Ep 2" />
      <span slot="footer">Two more after this moment</span>
    </PanelSection>
  );
}
```

## Accessibility

Not focusable itself; the label and its count are a level-3 heading ("Changes 3"), then the rows and the footer read in order.

Used on: Web
Version: 1.0
