# ChatMessage

ChatMessage is the person's own message in a chat with Maki: a neutral bubble at the right, in the same size as Maki's words.

## When to use

Use it for the person's own message in a chat with Maki.

- Not for what Maki says: use `MakiTurn`.
- Not for where the person writes the next message: use `MakiComposer`.

## How it works

- Never the accent: the bubble is `bg-fill-subtle`, `radius-lg`, at most 85% of the width.
- `name` is who sent it, said before the message for screen readers ("You" by default).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `name` | `string` |  | Who sent it, said before the message. Default "You". |
| `children` | `ReactNode` | required | The message's words. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { ChatMessage } from '@anicanon/sakuga/anicanonkit';

export function ChatMessageExample() {
  return (
    <ChatMessage>Fix the last train</ChatMessage>
  );
}
```

## Accessibility

Not focusable; the message reads as plain text after who sent it, "You" (or `name`), which is said but not shown.

Used on: Web, iOS, Android
Version: 2.0
