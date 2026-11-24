# EditorHeader

EditorHeader is the editor's top bar: what is being edited, its timecode, whether it rebuilds exactly, and the editor's actions.

## When to use

Use it in `EditorShell`'s `header` slot.

- Not for a production view outside the editor: use `ViewHeader`.
- Not for a full-screen flow that makes one thing step by step: use `FlowHeader`.

## How it works

- `title` is the production's name; `timecode` where the playhead is in the whole cut.
- `status` is a short line with a check ("Rebuilds exactly"), `statusHint` its longer note on hover.
- Actions go in as children, at the right.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` | required | The production's name. |
| `timecode` | `string` |  | Where the playhead is in the whole cut. |
| `status` | `string` |  | e.g. "Rebuilds exactly" |
| `statusHint` | `string` |  | The status's longer note, on hover and focus. |
| `children` | `ReactNode` |  | The actions. |

## Example

```tsx
import { EditorHeader } from '@anicanon/sakuga/anicanonkit';
import { Button } from '@anicanon/sakuga/ui';

export function EditorHeaderExample() {
  return (
    <EditorHeader title="The First Watch" timecode="Cut · 2:41 + 04f of 6:40" status="Rebuilds exactly" statusHint="Every cut, effect and line is kept, so the cut rebuilds exactly">
      <Button variant="primary" size="sm">Screen the cut</Button>
    </EditorHeader>
  );
}
```

## Accessibility

The title is a level-1 heading; the timecode and status are read as text, the status's check is hidden, and the actions are their own buttons in order.

Used on: Web
Version: 1.0
