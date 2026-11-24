# MakiCard

MakiCard is something Maki proposes or asks inside her reply: a story edit, a canon line, a section to add, a choice.

## When to use

Use it for something Maki proposes or asks inside her reply, with what was checked and its one pair of actions.

- Not for Maki's words around it: use `MakiTurn`.
- Not for one thing Review found: use `MakiFinding`.
- Not for something found in writing, beside the words it came from: use `ProposalCard`.
- Not for a correction pinned to work on a sheet: use `Slip`.

## How it works

- It sits on the reply's edge with no box, no fill and no rule.
- The title is a step up from Maki's words (`text-subtitle-sm`); `eyebrow` says what kind in a quiet line above it ("Layout · page 3"), never in capitals; `note` adds a quiet line under it.
- A proposal shows before → after: a story edit as `EntityRow`s with `StateChange`, a canon line as a `Revision`. `check` states what was verified. One pair of actions (`slot="actions"`): the one that writes is primary, the other plain. Maki proposes; only the person's Accept writes.
- `choices` is Maki asking which: rows to press, each a face or a picture, the name, where it is from, its labels. One press answers; `chosen` marks it with a check and the others fade. Never a box around the chosen one.
- `muted` for one already decided: its pictures and icons fade, its words stay readable (the title in the quieter ink), so a decided card is still AA in both themes.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` |  | What Maki proposes or asks, a step up from her words. |
| `eyebrow` | `string` |  | What kind, a quiet line above the title ("Layout · page 3"). |
| `badge` | `object` |  | An issue's severity, beside the title. |
| `badge.label` | `string` | required |  |
| `badge.variant` | `'new' \| 'alert'` |  |  |
| `badge.icon` | `IconName` |  |  |
| `note` | `string` |  | A quiet line under the title. |
| `check` | `string` |  | What was verified ("The story stays consistent with this edit"). |
| `muted` | `boolean` |  | One already decided: its pictures and icons fade. |
| `choices` | `MakiChoice[]` |  | Maki asking which: rich rows, one press answers. Never a typed answer, never plain buttons. |
| `choices[].name` | `string` | required | Its name. |
| `choices[].value` | `string \| number` |  | What onChoose answers with; its index when left out. |
| `choices[].visual` | `Visual` |  | Its face or picture. |
| `choices[].source` | `string` |  | Where it is from, quiet under the name. |
| `choices[].faded` | `boolean` |  | Faded, as a row outside the moment. |
| `choices[].labels` | `object[]` |  | Its labels as badges (role, faction, status). |
| `choices[].labels[].label` | `string` | required |  |
| `choices[].labels[].variant` | `BadgeProps['variant']` |  |  |
| `choices[].labels[].icon` | `IconName` |  |  |
| `chosen` | `number \| string` |  | The answer: an index or a choice's value; it takes a check and the others fade. |
| `onChoose` | `(value: number \| string) => void` |  | A choice pressed, with its value (or its index). |
| `actions` | `ReactNode` |  | The actions (or slot="actions"): one pair, the one that writes primary. |
| `children` | `ReactNode` |  | What changes, before → after (EntityRows with StateChange, a Revision); the actions as slot="actions". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { MakiCard } from '@anicanon/sakuga/anicanonkit';
import { Button } from '@anicanon/sakuga/ui';

export function MakiCardExample() {
  return (
    <MakiCard eyebrow="Maki · Issue" badge={{ label: 'Breaks the story', variant: 'alert', icon: 'warning' }} title="Lisa is in two places">
      <p>She is at Sé in section 3 and at home in section 4.</p>
      <span slot="actions"><Button variant="secondary" size="sm">Explain</Button></span>
    </MakiCard>
  );
}
```

## Accessibility

A group named by its title; "Already answered" when `muted`. Choices are a radio group, one press answers. The check's icon is hidden, and the actions take focus in order.

Used on: Web, iOS, Android
Version: 2.1
