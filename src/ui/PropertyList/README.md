# PropertyList

PropertyList shows each kind of setting on one row with what it is set to; a row opens the full choice.

## When to use

Use it for each kind of setting on a row with what it is set to, where a row opens the full choice: Studio's direction for a panel (shot type, angle, lighting, lens).

- Not for one section that folds open on its own: use `PanelRow`.
- Not for measured facts that are never edited: use `FactList`.
- Not for every option of one kind, laid out to choose from: use `OptionTiles`.

## How it works

- Use it when there are more options than fit a panel: the panel says what is set, the dialog (or picker) holds every option. Studio's direction for a panel is the example: shot type, angle, lighting, lens.
- `label` names the group; slot="action" sits beside it ("All options").
- Each item takes `label`, `value` and an optional `icon`; give `href` or `onClick` to open its choice.
- An item's `expanded` says whether the choice it opens is open.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | Names the list for screen readers. |
| `items` | `object[]` | required | The settings: each its name, value and what opens it. |
| `items[].label` | `string` | required |  |
| `items[].value` | `ReactNode` | required |  |
| `items[].icon` | `IconName` |  |  |
| `items[].href` | `string` |  |  |
| `items[].onClick` | `MouseEventHandler` |  |  |
| `items[].expanded` | `boolean` |  | Whether the choice this row opens is open. |
| `children` | `ReactNode` |  | slot="action" sits beside the label ("All options"). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Button, PropertyList } from '@anicanon/sakuga/ui';

export function Direction() {
  return (
    <PropertyList
      label="Direction"
      items={[
        { icon: 'camera', label: 'Shot type', value: 'Over the shoulder' },
        { icon: 'angle-eye-level', label: 'Camera angle', value: 'Eye level' },
        { icon: 'bolt', label: 'Lighting', value: 'The phone’s glow' },
      ]}
    >
      <span slot="action"><Button variant="ghost" size="sm">All options</Button></span>
    </PropertyList>
  );
}
```

## Accessibility

A group named by `label`: Tab moves through each row, a button (a link with `href`) announced by its name and value, expanded or collapsed when the item's `expanded` is set, and Enter runs its `onClick` (Space too on a button). Icons and chevrons are hidden.

Used on: Web
Version: 1.0
