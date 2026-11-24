# FactList

FactList pairs a quiet name with its value, two columns, values to the right.

## When to use

Use it for measured facts as a quiet name and its value (a colour match across a join, the length of a trimmed cut), and with `layout="grid"` who a character is at a point in the story.

- Not for settings the creator edits, each opening its choice: use `PropertyList`.
- Not for a character's picked facts, each with its picker's icon: use `CharacterStats`.
- Not for a Studio section showing what it is set to: use `PanelRow`.

## How it works

- For measured facts (a colour match across a join, the length of a trimmed cut), never for things the creator edits. `layout="grid"` sets each fact as a small block, its name over its value, with an optional `note` under it ("since Fire at Sé"): who a character is at a point in the story. The blocks in a row share one height, their content at the top, so a fact without a note sits level with the ones that have one.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `object[]` | required | The facts: a quiet name, its value, and in a grid an optional note. |
| `items[].label` | `string` | required |  |
| `items[].value` | `ReactNode` | required |  |
| `items[].note` | `string` |  |  |
| `layout` | `'columns' \| 'grid'` |  | `columns` (default): name and value in two columns. `grid`: each fact a small block, its name over its value. |
| `columns` | `number` |  | Blocks to a row, in a grid. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { FactList } from '@anicanon/sakuga/ui';

export function WhoSheIs() {
  return (
    <FactList
      layout="grid"
      columns={2}
      items={[
        { label: 'Age', value: '17', note: 'since Fire at Sé' },
        { label: 'Home', value: 'Lisbon', note: 'from Ep 1' },
        { label: 'Wants', value: 'Her brother back' },
        { label: 'Fears', value: 'The river', note: 'since Ep 3' },
      ]}
    />
  );
}
```

## Accessibility

Not focusable; a description list, so each name is read as a term and its value, with any `note`, as its description.

Used on: Web, iOS, Android
Version: 1.1
