# Menu

A menu behind a control, most often a ⋯ `IconButton`: rows of an icon and a label, left-aligned, each a link (`href`) or an action (`onClick`).

## When to use

Use it for the actions behind a ⋯: go somewhere (Face sheet and variants), or do something (Delete Smith). A `CastCard` opens one from its own ⋯ (`menu`); a full-screen flow puts its ⋯ at the end of its `FlowHeader`.

- Not for choosing a value: use `Select`, or `Picker` with search.
- Not for a phone: use `Sheet`, whose rows the platform draws.
- Not for one action: show the `Button`.

## How it works

- It is a `Popover` with the role of a menu, so it drops from its control, plays open and close with sound on, and leaves as a Popover does.
- A row answers the pointer with `bg-fill-subtle`, sinks on press like Select's options, and takes the focus ring from the keyboard.
- Vermilion is for the row that deletes or takes access away, and that row comes last, after a rule. Its confirmation is the `Dialog` it opens, never the menu itself.
- The control that opens it says so: `aria-haspopup="menu"` and `aria-expanded`.
- A choice among several (how two scenes are told) gives each of its rows `checked`: the one that holds now draws a check at its end, in the accent, and the rest draw nothing. Rows without `checked` stay actions, so a choice and an action can share a menu (Not at the same time, after a rule).
- Never a Popover of ghost Buttons: a Button centres its label, and its keys are a Tab stop each.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | Names the menu: "More for Smith". |
| `items` | `object[]` | required | A row each. `tone: 'danger'` for a row that can't be taken back; `separated` puts a rule before it. |
| `items[].label` | `string` | required |  |
| `items[].icon` | `IconName` |  |  |
| `items[].href` | `string` |  |  |
| `items[].onClick` | `MouseEventHandler` |  |  |
| `items[].tone` | `'danger'` |  | Can't be taken back (Delete): the danger tone. |
| `items[].checked` | `boolean` |  | One choice among several: true draws a check at its end and it reads as checked; false reads as not checked. Left out, the item is an action. |
| `items[].separated` | `boolean` |  | A rule before it, to set it apart. |
| `items[].disabled` | `boolean` |  |  |
| `open` | `boolean` |  | As on Popover: whether it shows. |
| `onClose` | `() => void` |  | Runs on Escape, a press outside and after a row is chosen; focus goes back to the control. |
| `anchored` | `boolean` |  | As on Popover: sits under what opened it. |
| `align` | `'start' \| 'end'` |  | As on Popover: lines up with the start or end edge of what opened it, at its own width. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { IconButton, Menu } from '@anicanon/sakuga/ui';

export function CharacterMore({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <IconButton icon="more" label="More for Smith" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} />
      <Menu
        open={open}
        anchored
        align="end"
        label="More for Smith"
        onClose={() => setOpen(false)}
        items={[
          { label: 'Face sheet and variants', icon: 'frame-portrait', href: '/characters/smith/face' },
          { label: 'Delete Smith', icon: 'trash', tone: 'danger', separated: true, onClick: onDelete },
        ]}
      />
    </div>
  );
}
```

## Accessibility

A menu named by `label`, its rows menu items (a link or a button) and one Tab stop: Up and Down move and wrap, Home and End go to the first and last, Enter or Space chooses, Escape closes it and focus goes back to the control that opened it. A row with `checked` is a menu item radio, read as checked or not checked. A disabled row is skipped and said as unavailable; the rule is a separator. In forced colours the focused row keeps its ring and the check is drawn, both in Highlight.

Used on: Web
Version: 1.1
