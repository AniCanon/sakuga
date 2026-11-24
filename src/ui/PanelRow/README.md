# PanelRow

PanelRow is Studio’s folded section: an icon, the section’s name and its current value, with the chevron that opens it, at the row's end with or without a value.

## When to use

Use it for a folded Studio section: its icon, its name and what it is set to (Close-up · push in · low), with the chevron that opens it.

- Not for several kinds of setting listed together, each opening its full choice: use `PropertyList`.
- Not for a Studio card with its controls showing: use `Panel`.
- Not for one thing on a row of a list: use `ListRow`.
- Not for one setting on or off: use `Switch`.

## How it works

- `open` turns the chevron on `motion-fast`; `onClick` toggles it; `href` makes it a link to where the section is edited.
- The value says what is set (Close-up · push in · low), not a description.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `icon` | `IconName` | required | The section's AniCanon icon. |
| `title` | `string` | required | The section's name. |
| `value` | `string` |  | What the section is set to, e.g. "Close-up · push in · low". |
| `open` | `boolean` |  | Set only when the row opens its choice in place: then it is said to be open or closed (never on a link). |
| `href` | `string` |  | Makes the row a link to where the section opens. |
| `onClick` | `MouseEventHandler<HTMLElement>` |  | Opens the section, as the fold's closed state. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { PanelRow } from '@anicanon/sakuga/ui';

export function PanelRowExample() {
  return (
    <PanelRow icon="lighting-golden" title="Light" value="Golden hour · rim from the left · warm haze" />
  );
}
```

## Accessibility

A button (a link with `href`) that Tab reaches; Enter runs `onClick`, and Space does too on a button. A screen reader hears its title and value, then, when `open` is given on a button, expanded or collapsed from it; the icon and chevron are hidden.

Used on: Web
Version: 1.0
