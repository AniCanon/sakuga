# ViewHeader

ViewHeader opens a production view: which view it is, its title and its meta, with the view's actions on the right.

## When to use

Use it for the top of a production view: the view as an eyebrow, the title on one line, the meta under it, and the view's actions on the right (Maki, then at most one primary).

- Not for the top of an app page beside the SideNav: use `PageHeader`.
- Not for opening a shelf: use `SectionHeader`.
- Not for the head of a side panel or an inspector: use `PanelHeader`.
- Not for the editor's top bar with its timecode: use `EditorHeader`.
- Not for the top bar of a full-screen flow: use `FlowHeader`.

## How it works

- The view's name sits on top as a quiet `eyebrow`.
- The `title` keeps to one line, cut with an ellipsis.
- The `meta` sits under the title.
- The view's actions sit on the right as children: Maki, then at most one primary.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` | required | The view's name, as its heading. |
| `eyebrow` | `string` |  | A small line over the title: the production it is part of. |
| `meta` | `string` |  | A quiet line beside the title: where it stands. |
| `children` | `ReactNode` |  | The view's actions. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { ViewHeader } from '@anicanon/sakuga/anicanonkit';
import { Button } from '@anicanon/sakuga/ui';

export function ViewHeaderExample() {
  return (
    <ViewHeader eyebrow="Plan" title="#5 · Red Line · Sé station" meta="4 of 6 cuts approved · 0:52 of 0:55">
      <Button variant="secondary" size="sm">Ask Maki</Button>
      <Button variant="primary" size="sm">Approve 2 cuts</Button>
    </ViewHeader>
  );
}
```

## Accessibility

The title is a level-1 heading, with the eyebrow before it and the meta after it read as text; the actions on the right take focus in order.

Used on: Web
Version: 1.1
