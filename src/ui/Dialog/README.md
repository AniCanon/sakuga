# Dialog

Dialog is a window over the page on the web: pickers (references, opening frame, video plan), confirmations (story conflicts) and last checks (clip options).

## When to use

Use it for a task or a check that needs the page's whole attention on desktop: choosing references, a story conflict, the last check before something is spent or deleted.

- Not for the same task in the iOS or Android app: use `Sheet`.
- Not for a menu or a hover card anchored to what opened it: use `Popover`.
- Not for choosing from a searchable list under a field: use `Picker`.
- Not for a confirmation that needs no answer: use `Toast`.

## How it works

- Title says the task; description says what happens and what it costs, if anything.
- The main action sits right in the footer, labelled with what it does ("Add 2 references", "Generate clip").
- It settles in on `motion-slow` with `ease-enter` and leaves on `motion-base` with `ease-exit`.
- Its scrim fades in over `motion-slow` and out over `motion-base`, both linear, so the fade reads as one.
- With sound on, it plays the open sound as it arrives and the close sound as it leaves (README · Sound).
- It sits on the screen, not on the page: its scrim covers the window wherever the page is scrolled to.
- In a phone browser (below 768 px) it rises from the screen's foot at full width, top corners rounded, its foot clear of the home indicator. It slides in on `motion-slow` and out on `motion-base`. `width` applies from 768 px up.
- The iOS and Android apps use Sheet instead.
- The footer's buttons are `footer`, or children in `slot="footer"`.
- The body stacks what it holds in one column, `dialog-body-gap` (16) apart: a drop area, the files, a notice, a field. Pass them as they are; don't wrap them to space them. A group that sits closer, such as a list of options, goes in one block of its own.
- A body taller than the dialog scrolls between the head and the footer, which stay put; once it has scrolled a hairline parts the head from it, as the footer's does. Never shrink what the body holds to make it fit.
- The footer wraps at every width: actions wider than the dialog take a second line, kept to the end, so the primary stays last on the last line and a lead action first on the first.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `open` | `boolean` | required | Whether it shows. |
| `title` | `string` | required | The task, as its heading; names the dialog. |
| `description` | `string` |  | What happens and what it costs, if anything; describes the dialog. |
| `footer` | `ReactNode` |  | Or children in slot="footer". |
| `width` | `number \| string` |  | Its width from 768 px up, in px or CSS; below that it takes the screen's width. |
| `onClose` | `() => void` |  | Runs on Escape, Close and a click on the scrim. |
| `children` | `ReactNode` |  | The body, stacked in one column; the footer's buttons as slot="footer". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { Button, Dialog } from '@anicanon/sakuga/ui';

export function DeleteScene({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Delete scene</Button>
      <Dialog
        open={open}
        onClose={close}
        title="Delete scene 4?"
        description="Its takes and lines go with it. This cannot be undone."
        width={440}
        footer={[
          <Button key="keep" variant="ghost" onClick={close}>Keep it</Button>,
          <Button key="delete" variant="destructive" onClick={() => { onDelete(); close(); }}>Delete scene</Button>,
        ]}
      />
    </>
  );
}
```

## Accessibility

A modal dialog named by `title` and described by `description`: focus moves to the field a form leads with, else to the dialog itself, which draws no ring and is announced by its title and description; the first Tab reaches its first control, Tab and Shift+Tab stay inside it, a press on its words keeps focus inside, and Escape, "Close" or a click on the scrim run `onClose`. When it closes, focus goes back to what opened it.

Used on: Web (desktop and phone)
Version: 1.7
