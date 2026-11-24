# TextField

A labelled text input or text area.

## When to use

Use it for words a person types, on one line or in a text area: a name, a description, a search.

- Not for one choice from a list: use `Select`.
- Not for a number stepped a unit at a time: use `NumberField`.
- Not for words kept as separate tags: use `TagList`.
- Not for Studio's prompt, with who and where it binds: use `PromptComposer`.
- Not for writing to Maki: use `MakiComposer`.

## How it works

- The label sits above, the hint below. Use `highlight` for a value that changed while editing.
- Motion: state changes fade with `motion-fast`; entrances use `motion-base` and `ease-enter`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `icon` | `IconName` |  | Leading icon for single-line fields, e.g. search. |
| `value` | `string` |  | Controlled text. Update it through onChange, or use readOnly. |
| `defaultValue` | `string` |  | Initial text for an uncontrolled field. |
| `placeholder` | `string` |  | Without a label it names the field (search fields). |
| `multiline` | `boolean` |  | A text area, sized by `rows` and `minHeight`. |
| `rows` | `number` |  | With `multiline`: how many rows it shows (default 3). |
| `minHeight` | `number` |  | With `multiline`: its least height, in px. |
| `highlight` | `boolean` |  | Accent edge for a changed value. |
| `type` | `string` |  | The input's type, "text" by default. |
| `required` | `boolean` |  | Read as required. |
| `readOnly` | `boolean` |  | Shows the value without letting it change. |
| `id` | `string` |  | The field's id, so a label elsewhere can point at it; one is made without it. |
| `onChange` | `(text: string) => void` |  | Called with the text as it is typed. |
| `label` | `string` |  | The field's name, above it. Without one the placeholder names the field (search fields). |
| `hint` | `string` |  | One line under the control. |
| `optional` | `boolean` |  | Adds " · optional" after the label. |
| `help` | `object` |  | A FieldHelp tooltip beside the label. |
| `help.title` | `string` |  |  |
| `help.text` | `ReactNode` | required |  |
| `maxWidth` | `number` |  | The widest it grows, in pixels. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { TextField } from '@anicanon/sakuga/ui';

export function TextFieldExample() {
  return (
    <TextField label="Name" defaultValue="Plaid overshirt" />
  );
}
```

## Accessibility

A text input (a text area with `multiline`) that Tab reaches and that takes typing, named by the words of `label` (with "optional"), or by `placeholder` without one, and described by `hint`; `required` adds "required", and `readOnly` makes it read-only. `onChange` gets the text as it is typed. The icon is hidden.

Used on: Web, iOS, Android
Version: 1.0
