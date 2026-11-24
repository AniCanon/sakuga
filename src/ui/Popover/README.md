# Popover

Popover is a raised surface that floats over the page: a menu, a hover card, a small form.

## When to use

Use it for a raised surface anchored to what opened it: a menu, a hover card on a mention, a small form.

- Not for a list of options with search: use `Picker`.
- Not for a task that needs the page's whole attention: use `Dialog`.
- Not for the same choices on a phone: use `Sheet`.

## How it works

- `anchored` (default) pins it under its field: wrap the field in a relative container and put the Popover inside. Pass `anchored={false}` and a `style` with a position to place it yourself, as for a hover card on a mention.
- Content is yours. For a list of choices use `Picker`, which is a Popover with search and options.
- One Popover open at a time. Escape, a click outside and Tab out of it close it.
- With sound on, it plays the open sound as it arrives and the close sound as it leaves (README · Sound).
- It drops from its field on `motion-fast` with `ease-enter`. `open={false}` plays its exit (`motion-instant`, `ease-exit`) and then removes it.
- `onClose`: with it the popover takes focus while open, Escape or a press outside runs it, and focus goes back to what opened it. Without it the popover never moves focus (a hover card).
- `onKeyDown` gets the keys pressed inside it, before its own Escape.
- `id` goes on the surface, so the control that opens it can name it in `aria-controls`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `id` | `string` |  | The surface's id, for a control's aria-controls (SideNav's switcher). |
| `open` | `boolean` |  | false plays its exit, then it unmounts. Default true. |
| `onKeyDown` | `KeyboardEventHandler` |  | Keys pressed inside it, before its own Escape. |
| `onClose` | `() => void` |  | With it, the popover takes focus while open; Escape or a press outside runs it, and focus goes back. |
| `anchored` | `boolean` |  | Pinned under what opened it (default): wrap that in a relative container and put the Popover inside. `false` places it by `style`. |
| `align` | `'start' \| 'end'` |  | Anchored with its own width, lined up with the anchor's start or end edge (default: the anchor's width). |
| `label` | `string` |  | Names the surface for screen readers. |
| `role` | `string` |  | The surface's role (default dialog), e.g. menu. |
| `style` | `CSSProperties` |  | Inline style on the root element. |
| `children` | `ReactNode` |  | Its content: a menu, a small form, a hover card. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Popover } from '@anicanon/sakuga/ui';

export function PopoverExample() {
  return (
    <Popover label="More" align="end" style={{ padding: 14 }}><span>Lined up with the end edge.</span></Popover>
  );
}
```

## Accessibility

A dialog named by `label` (`role` changes the role). With `onClose` it takes focus while open (its first control, else itself), and a press on its words keeps focus inside; Escape, a press outside or Tab out of it runs `onClose`, and after Escape focus goes back to what opened it; without `onClose` it never moves focus.

Used on: Web
Version: 1.0
