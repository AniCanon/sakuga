# FloatingToolbar

FloatingToolbar sits over a selection and offers what can be done with it.

## When to use

Use it for what can be done with a selection: two or three ghost buttons just above it (Make it an event, Ask Maki), or with `count` the bar of what is selected in a list or a grid (3 selected: Move to…, Download, Delete).

- Not for a menu opened from a control: use `Popover`.
- Not for the actions of a view: use `ViewHeader`.
- Not for the edit buttons under the editor's picture: use `MonitorBar`.

## How it works

- Two or three ghost buttons at most ("Make it an event", Ask Maki). Position it with `style` just above the selection.
- It disappears when the selection does.
- **A selection's bar.** With `count` ("3 selected") it opens with Clear, an × named "Clear selection" (`clearLabel`) that runs `onClear`, then the count, a hairline, and the actions: three ghost buttons at most, each with its icon and word (Move to…, Download, Delete). Each end of the bar is a button, so no word sits on its edge. Library pins it at the foot of the page, centred on the content, over the takes it acts on.
- A deletion from it asks first, in a `Dialog` whose button carries the danger tone; on the bar Delete stays a ghost button.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | Default "Selection". |
| `count` | `string` |  | Makes it a selection's bar: the words for what is selected ("3 selected"), shown after Clear and read with the label. |
| `onClear` | `() => void` |  | With count: Clear, an × before the count. |
| `clearLabel` | `string` |  | Clear's name; "Clear selection" by default. |
| `style` | `CSSProperties` |  | Position it just above the selection. |
| `children` | `ReactNode` | required | Its ghost buttons, three at most. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Button, FloatingToolbar } from '@anicanon/sakuga/ui';

export function FloatingToolbarExample() {
  return (
    <FloatingToolbar>
      <Button variant="ghost" size="sm" icon="plus">Make it an event</Button>
      <Button variant="ghost" size="sm">Ask Maki</Button>
    </FloatingToolbar>
  );
}
```

## Accessibility

A toolbar named by `label` (default "Selection") and its `count` ("Selected takes, 3 selected") that is one Tab stop: arrows move between its buttons, Home and End go to either end, and Tab comes back to the one last focused.

Used on: Web
Version: 1.1
