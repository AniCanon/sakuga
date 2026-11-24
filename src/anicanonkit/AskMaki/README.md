# AskMaki

AskMaki is Maki's one button: Maki's face and a label.

## When to use

Use it for the one button that asks Maki: handed a conflict, a selection or a question at `size="sm"`, or in a view's header as the Maki pill with its count, which opens Maki's panel.

- Not for an action that is not about Maki: use `Button`.
- Not for a quiet Ask Maki inside a line or a row of text: use `TextLink`.
- Not for Maki's column with the conversation: use `MakiPanel`.

## How it works

- It carries Maki's face, never a sparkle.
- Handed something (a conflict, a selection, a question): `size="sm"`, the label says what Maki is asked ("Ask Maki how it could be answered").
- In a view's header: `label="Maki"`, `size="md"`, `shape="pill"`, with `count` (how many things Maki wants looked at, left out when there is nothing). It opens Maki's panel; `open` says the panel is open, and the pill sits on the accent tint.
- `href` makes it a link to Maki's page instead of a button.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `avatar` | `string` | required | Maki's face. |
| `label` | `string` |  | What Maki is asked ("Ask Maki how it could be answered"), or "Maki" in a view's header. |
| `variant` | `'secondary' \| 'ghost' \| 'outline'` |  | Button's variant: secondary by default, ghost in a row, outline beside a primary. |
| `size` | `'sm' \| 'md'` |  | sm when handed something (a conflict, a selection); md in a view's header. |
| `shape` | `'pill'` |  | pill in a view's header. |
| `count` | `string` |  | How many things Maki wants looked at. |
| `open` | `boolean` |  | Maki's panel is open beside the view. |
| `href` | `string` |  | Makes it a link to Maki's page instead of a button. |
| `onClick` | `MouseEventHandler` |  | Opens Maki's panel, or hands Maki what it sits beside. |

## Example

```tsx
import { AskMaki } from '@anicanon/sakuga/anicanonkit';

export function AskMakiButton({ makiFace, onOpen }: { makiFace: string; onOpen: () => void }) {
  return <AskMaki avatar={makiFace} onClick={onOpen} />;
}
```

## Accessibility

A button (a link with `href`) that Tab reaches; Enter runs `onClick`, and Space does too on a button. A screen reader hears "Ask Maki" (or `label`), "Ask Maki, 3 to look at" with `count`, and expanded or collapsed when `open` is set; Maki's face is hidden.

Used on: Web, iOS, Android
Version: 1.0
