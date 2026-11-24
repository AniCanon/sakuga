# QuestionRow

QuestionRow is one open question the audience is waiting on: planted → raised → answered, each step a real event with its place.

## When to use

Use it for one open question the audience is waiting on, from planted to raised to answered, each step a real event with its place.

- Not for a character, place or event on Story: use `EntityRow`.
- Not for a conflict found in writing: use `ProposalCard`.
- Not for where a person is in a flow they step through: use `Stepper`.

## How it works

- An empty Answered step invites the event that pays it off. `quiet` flags a question nothing has touched for a long time; `answered` fades the row's pictures and arrows, and its words drop only to the faintest text that reads, so they stay legible.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `question` | `string` | required | The question the story raises, in words. |
| `state` | `'waiting' \| 'quiet' \| 'answered'` |  | `waiting` for its answer; `quiet` when nothing has touched it for a long time; `answered` fades the row. |
| `note` | `string` |  | A short line on where it stands. |
| `selected` | `boolean` |  | Bands the row: the question open in the panel. |
| `planted` | `QuestionStep` | required | Where the question was planted. |
| `planted.label` | `string` | required | The event at this step. |
| `planted.image` | `string` |  | Its picture. |
| `planted.told` | `string` |  | Where it was told ("Ep 3"). |
| `raised` | `QuestionStep[]` |  | Where it was raised again, in order. |
| `raised[].label` | `string` | required | The event at this step. |
| `raised[].image` | `string` |  | Its picture. |
| `raised[].told` | `string` |  | Where it was told ("Ep 3"). |
| `answered` | `QuestionStep` |  | Where it is answered; empty, it invites the event that pays it off. |
| `answered.label` | `string` | required | The event at this step. |
| `answered.image` | `string` |  | Its picture. |
| `answered.told` | `string` |  | Where it was told ("Ep 3"). |

## Example

```tsx
import { QuestionRow } from '@anicanon/sakuga/anicanonkit';

export function QuestionRowExample() {
  return (
    <QuestionRow question="Where is Arthur?" note="Raised in Cell four" selected planted={{ label: 'Arthur taken' }} raised={[{ label: 'Cell four' }]} />
  );
}
```

## Accessibility

Not focusable; read in order as the question in quotes (then "selected" when `selected`), its badge (Waiting, Quiet or Answered) and note, then "Planted", "Raised" and "Answered" with each step's event and where it was told ("Smoke, told in Episode 1"), "Not raised yet" or "Answer it"; pictures and arrows are hidden.

Used on: Web
Version: 1.0
