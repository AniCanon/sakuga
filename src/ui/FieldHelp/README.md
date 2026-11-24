# FieldHelp

FieldHelp is the ⓘ beside a field name.

## When to use

Use it for the ⓘ beside a field's name that says what the field controls, in one bold line and examples: shot type, depth of field. With `examples`, for showing each case of a choice with its picture: how much a thing matters in a shot.

- Not for context everyone should see, kept on the page: use `Notice`.
- Not for a hover card on a mention or a small form: use `Popover`.
- Not for an action shown as a glyph alone: use `IconButton`.

## How it works

- It explains the field in one bold line plus examples, on hover or keyboard focus. With `examples`, a press opens what the field does, with a picture for each case.
- Use it on every Studio control a newcomer might not know (shot type, depth of field, Story Map).
- Write the first line as what the field controls, then "Examples:".
- It is a real button, so keyboard users reach it.
- `examples` is for a choice whose cases are easier seen than read: a level, a kind, what a version keeps. Each has a picture (or a `placeholder` naming the picture it wants), a `name` and one `text` line. `title` heads it and the children are its lead.
- With examples it opens under the ⓘ, lined up with the ⓘ's end edge (`align="start"` for its start). It is placed in the page's root, so a Dialog's body never clips it. On a phone browser pass `dialog`: it opens as a Dialog, the examples in rows, the done button across the foot.
- It may open by itself the first time someone meets the field (`open`), and only from the ⓘ after that. `doneLabel` defaults to "Got it".

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | The field it explains; the button reads "About" and this. |
| `title` | `string` |  | The tip's bold first line: what the field controls. |
| `open` | `boolean` |  | Shows the tip open (a board). |
| `children` | `ReactNode` | required | The tip's examples, after the title; with `examples`, the lead under the title. |
| `examples` | `FieldHelpExample[]` |  | Opens on a press instead of the hover tip: the title, the children as its lead, a picture for each example, and doneLabel. |
| `examples[].name` | `string` | required | The case's name ("Close detail"). |
| `examples[].text` | `string` |  | One line on what it does. |
| `examples[].image` | `string` |  | Its picture. |
| `examples[].alt` | `string` |  | The picture's alternative text. |
| `examples[].placeholder` | `string` |  | Until there is a picture, the words naming the one it wants. |
| `dialog` | `boolean` |  | With examples: a Dialog instead of the panel under the ⓘ, for a phone browser. |
| `align` | `'start' \| 'end'` |  | With examples: the panel lines up with the ⓘ's start or end edge (end by default). |
| `doneLabel` | `string` |  | With examples: the button that closes it; "Got it" by default. |
| `onClose` | `() => void` |  | With examples: called when it closes. |

## Example

```tsx
import { FieldHelp } from '@anicanon/sakuga/ui';

export function FieldHelpExample() {
  return (
    <FieldHelp label="Depth of field" title="Controls how much of the frame appears in focus.">Examples: shallow isolates the character, deep keeps foreground and background sharp.</FieldHelp>
  );
}
```

## Accessibility

A button that Tab reaches, announced "About" plus `label` (or "About this field") and described by its tip. Focus or hover shows the tip, and the tip can be hovered without closing. Escape hides it, whether focus or the pointer opened it, until focus or the pointer leaves. The button is a 24px target, though it draws at 20px. With `examples` it is a button with `aria-haspopup="dialog"` and `aria-expanded`; a press opens a dialog named by `title` that takes focus, and Escape, a press outside or the done button closes it and returns focus to the ⓘ; with `dialog` it is a modal Dialog that keeps focus inside.

Used on: Web, iOS, Android
Version: 1.1
