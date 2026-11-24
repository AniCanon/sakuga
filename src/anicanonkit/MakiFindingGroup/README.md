# MakiFindingGroup

MakiFindingGroup is one group of what Review found, inside Maki's reply: its label and count ("Conflicts · 2"), an optional quiet note, then its `MakiFinding`s.

## When to use

Use it to group Review's findings inside Maki's reply.

- Not for a section of a side area: use `PanelSection`.
- Not for a section of a page: use `SectionHeader`.

## How it works

- Groups follow in order: Conflicts, Warnings, Kept on purpose. The label is quiet, in the reply's caption size, never a heading with a rule.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | What the group holds ("Conflicts"). |
| `count` | `number \| string` |  | How many, after a middle dot ("Conflicts · 2"). |
| `note` | `string` |  | A quiet line under the label ("Each reopens by itself…"). |
| `children` | `ReactNode` | required | Its MakiFindings. |

## Example

```tsx
import { MakiFinding, MakiFindingGroup } from '@anicanon/sakuga/anicanonkit';

export function MakiFindingGroupExample() {
  return (
    <MakiFindingGroup label="Warnings" count={2}>
      <MakiFinding severity="warning" title="“Genzo hides the logbook” connects to nothing" note="Nothing leads to it and it leads nowhere." pressable />
      <MakiFinding severity="warning" title="What did the subject see?" note="Opened in “Red Line awakening”, then nothing for 7 events." pressable />
    </MakiFindingGroup>
  );
}
```

## Accessibility

Its findings are a list named by its label.

Used on: Web
Version: 1.0
