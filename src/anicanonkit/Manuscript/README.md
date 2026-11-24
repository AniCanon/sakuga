# Manuscript

Manuscript is the script's page: its tools on top (the block type, where the cursor is), the sections, and what it reports under them (saved, length, Maki's check).

## When to use

Use it for the script's page, for episodes and manga issues alike: its tools on top, the numbered sections, and what it reports under them (saved, length, Maki's check).

- Not for one numbered section: use `ManuscriptSection`.
- Not for a scene read as cuts: use `CutSheet`.
- Not for Studio's prompt: use `PromptComposer`.
- Not for a long text in a form: use `TextField`.

## How it works

- The page is flat on the canvas: no card, no fill. Sections are divided by hairlines and their headings; the toolbar and the `StatusBar` are bands ruled off from the body.
- The body holds `ManuscriptSection`s; the one being written is `current`, its number in the accent while the others' numbers are muted. The body scrolls on its own, between the toolbar and the footer.
- Two sections at the same moment (`ManuscriptSection` `with`) are joined: no hairline between them, the number rule unbroken from one into the other. Scenes stay one list in told order.
- `slot="toolbar"` and `slot="footer"` (a `StatusBar`). `label` names the script for screen readers.
- Episodes and manga issues write in the same page.
- The page fills the column it sits in, the `StatusBar` at its foot, however little is written. A new script is this page with scene 1's heading under the caret, never an empty state with a button to start.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | Names the script for screen readers. |
| `children` | `ReactNode` | required | The ManuscriptSections, in order; a toolbar as slot="toolbar" and a StatusBar as slot="footer". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Manuscript, ManuscriptSection } from '@anicanon/sakuga/anicanonkit';
import { StatusBar, Text } from '@anicanon/sakuga/ui';

export function ManuscriptExample() {
  return (
    <Manuscript label="The Winter script">
      <span slot="toolbar"><Text variant="caption">Writing section 4 · @ cast · # places</Text></span>
      <ManuscriptSection number={3} title="Bruce at home">Bruce sits on the sofa, the TV on, the snow outside.</ManuscriptSection>
      <ManuscriptSection number={4} title="Ten missed calls" current>His phone lights up again. Jen. He lets it ring.</ManuscriptSection>
      <span slot="footer"><StatusBar><span>Saved</span><span>9 sections</span></StatusBar></span>
    </Manuscript>
  );
}
```

## Accessibility

A region named by `label` (default "Script"); its toolbar, sections and footer read and take focus in order. While the body scrolls it is itself a Tab stop, a group named "Scenes", so the arrows and Page Up and Page Down scroll it (axe: a scrolling region must be reachable by keyboard); it shows the focus ring inside its edge. When everything fits it is no stop at all.

Used on: Web
Version: 1.3
