# TextLink

TextLink is a quiet action inside a line or a row of text: Accept, Decline, Why; Ask Maki; Use it.

## When to use

Use it for a quiet action beside what it acts on, inside a line or a row of text (Accept, Decline, Why), and the way into a deletion.

- Not for the action a view exists for: use `Button`.
- Not for an action shown as a glyph alone: use `IconButton`.
- Not for a row that opens a page: use `ListRow`.

## How it works

- `href` makes it a link, otherwise a button. `variant="strong"` for the one that matters most in its row.
- `variant="destructive"` is the quiet way into a deletion ("Delete my account", "Delete The Winter"), in `text-danger`. It opens the dialog whose `Button variant="destructive"` does the deleting.
- It carries a quiet underline at rest, in its own colour at `opacity-muted`, so a link in a sentence never depends on colour alone. Under the pointer and with focus the underline takes the link's full colour, and focus adds the ring; it never becomes a filled button.
- Use a `Button` when the action is the point of the view; a TextLink when it sits beside what it acts on.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `'quiet' \| 'strong' \| 'destructive'` |  | destructive: the quiet way into a deletion ("Delete my account"). |
| `href` | `string` |  | Where it goes; without it, a button. |
| `icon` | `IconName` |  | An icon before its words. |
| `onClick` | `MouseEventHandler` |  | Its press. |
| `aria-label` | `string` |  | Names it for screen readers when its visible words do not. |
| `aria-haspopup` | `boolean \| 'dialog' \| 'menu' \| 'listbox'` |  | For a link that opens a dialog or menu. |
| `aria-expanded` | `boolean` |  | As a disclosure: whether what it opens is open. |
| `aria-controls` | `string` |  | As a disclosure: the id of what it opens. |
| `children` | `ReactNode` | required | Its words. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { TextLink } from '@anicanon/sakuga/ui';

export function TextLinkExample() {
  return (
    <TextLink variant="strong">Accept</TextLink>
  );
}
```

## Accessibility

A link with `href`, otherwise a button: Tab reaches it, Enter activates it (Space too as a button), and a screen reader hears its text or `aria-label`, with the icon hidden. `variant` changes only its look. For a link that opens a dialog, `aria-haspopup`, `aria-expanded` and `aria-controls` pass through. Its underline at rest tells it apart from the text around it without colour (WCAG 1.4.1).

Used on: Web, iOS, Android
Version: 1.0
